import { databases } from "@/lib/appwrite";
import { ID, Permission, Query, Role } from "react-native-appwrite";
import { getExercisesByUserId } from "./exercises";

const DB_ID = "6910e46a00308ce05924";
const TEMPLATES_COLLECTION_ID = "templates";
const TEMPLATE_SETS_COLLECTION_ID = "template_sets";

// Create a new workout template
export async function createTemplate({ userId, name, exercises, splitId, exerciseOrder }) {
  // 1. Create the template document
  const templateData = {
    userId,
    name,
    splitId,
    createdAt: new Date().toISOString(),
  };

  const template = await databases.createDocument(
    DB_ID,
    TEMPLATES_COLLECTION_ID,
    ID.unique(),
    templateData,
    [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ]
  );

  // 2. Create set documents for each exercise
  // exercises is expected to be an object: { exerciseId: [ { reps, weight, ... }, ... ] }
  const promises = [];
  let globalOrder = 1;
  
  const keys = exerciseOrder || Object.keys(exercises);

  keys.forEach((exerciseId) => {
    const sets = exercises[exerciseId];
    if (!sets) return; // Safety check
    
    sets.forEach((set) => {
      const setData = {
        userId,
        templateId: template.$id,
        exerciseId,
        order: globalOrder++,
        reps: set.reps ? Number(set.reps) : null,
        weight: set.weight ? Number(set.weight) : null,
      };

      promises.push(
        databases.createDocument(
          DB_ID,
          TEMPLATE_SETS_COLLECTION_ID,
          ID.unique(),
          setData,
          [
            Permission.read(Role.user(userId)),
            Permission.update(Role.user(userId)),
            Permission.delete(Role.user(userId)),
          ]
        )
      );
    });
  });

  await Promise.all(promises);
  return template;
}

// List templates for a user
export async function listTemplates(userId, splitId = null) {
  const queries = [
    Query.equal("userId", userId),
    Query.orderAsc("order"),
    Query.orderDesc("createdAt"),
  ];

  if (splitId) {
    queries.push(Query.equal("splitId", splitId));
  }

  const templates = await databases.listDocuments(
    DB_ID,
    TEMPLATES_COLLECTION_ID,
    queries
  );
  return templates.documents;
}

// List templates for a user with stats
export async function listTemplatesWithStats(userId, splitId = null) {
  const [templates, sets, exercises] = await Promise.all([
    listTemplates(userId, splitId),
    listAllTemplateSets(userId),
    getExercisesByUserId(userId)
  ]);

  // Create a map of exerciseId -> targetMuscle
  const exerciseMap = {};
  exercises.forEach(ex => {
    exerciseMap[ex.$id] = ex.targetMuscle;
  });

  // Create a map of templateId -> stats
  const templateStats = {};

  // Initialize stats for each template
  templates.forEach(template => {
    templateStats[template.$id] = {};
  });

  // Iterate through sets to group by template
  sets.forEach(set => {
    const templateId = set.templateId;
    if (!templateStats[templateId]) return; // Should be initialized, but safety check

    const muscle = exerciseMap[set.exerciseId];
    if (muscle) {
      const normalizedMuscle = muscle.toLowerCase();
      if (!templateStats[templateId][normalizedMuscle]) {
        templateStats[templateId][normalizedMuscle] = 0;
      }
      templateStats[templateId][normalizedMuscle]++;
    }
  });

  // Attach stats to templates
  return templates.map(template => ({
    ...template,
    stats: templateStats[template.$id] || {}
  }));
}

// Get a template with its sets
export async function getTemplateWithSets(templateId) {
  const template = await databases.getDocument(
    DB_ID,
    TEMPLATES_COLLECTION_ID,
    templateId
  );

  const setsRes = await databases.listDocuments(
    DB_ID,
    TEMPLATE_SETS_COLLECTION_ID,
    [
      Query.equal("templateId", templateId),
      Query.orderAsc("order"), // Assuming we add an order field or just rely on creation
    ]
  );

  return {
    template,
    sets: setsRes.documents,
  };
}

// Delete a template and its sets
export async function deleteTemplate(templateId) {
  // 1. Delete all sets associated with this template
  // Note: Appwrite doesn't support delete by query directly in client SDK usually, 
  // so we list then delete.
  const setsRes = await databases.listDocuments(
    DB_ID,
    TEMPLATE_SETS_COLLECTION_ID,
    [
      Query.equal("templateId", templateId),
    ]
  );

  const deletePromises = setsRes.documents.map(set => 
    databases.deleteDocument(DB_ID, TEMPLATE_SETS_COLLECTION_ID, set.$id)
  );
  await Promise.all(deletePromises);

  // 2. Delete the template document
  return await databases.deleteDocument(
    DB_ID,
    TEMPLATES_COLLECTION_ID,
    templateId
  );
}

// List all template sets for a user (helper for stats)
export async function listAllTemplateSets(userId) {
  let allDocuments = [];
  let lastId = null;
  const limit = 5000;

  while (true) {
    const queries = [
      Query.equal("userId", userId),
      Query.limit(limit),
    ];

    if (lastId) {
      queries.push(Query.cursorAfter(lastId));
    }

    const response = await databases.listDocuments(
      DB_ID,
      TEMPLATE_SETS_COLLECTION_ID,
      queries
    );

    allDocuments.push(...response.documents);

    if (response.documents.length < limit) {
      break;
    }

    lastId = response.documents[response.documents.length - 1].$id;
  }

  return allDocuments;
}

export async function updateTemplate({ templateId, userId, name, exercises, exerciseOrder }) {
  // 1. Update the template document
  await databases.updateDocument(
    DB_ID,
    TEMPLATES_COLLECTION_ID,
    templateId,
    { name }
  );

  // 2. Delete existing sets
  const setsRes = await databases.listDocuments(
    DB_ID,
    TEMPLATE_SETS_COLLECTION_ID,
    [
      Query.equal("templateId", templateId),
    ]
  );

  const deletePromises = setsRes.documents.map(set => 
    databases.deleteDocument(DB_ID, TEMPLATE_SETS_COLLECTION_ID, set.$id)
  );
  await Promise.all(deletePromises);

  // 3. Create new sets
  const createPromises = [];
  let globalOrder = 1;

  const keys = exerciseOrder || Object.keys(exercises);

  keys.forEach((exerciseId) => {
    const sets = exercises[exerciseId];
    if (!sets) return;

    sets.forEach((set) => {
      const setData = {
        userId,
        templateId,
        exerciseId,
        order: globalOrder++,
        reps: set.reps ? Number(set.reps) : null,
        weight: set.weight ? Number(set.weight) : null,
      };

      createPromises.push(
        databases.createDocument(
          DB_ID,
          TEMPLATE_SETS_COLLECTION_ID,
          ID.unique(),
          setData,
          [
            Permission.read(Role.user(userId)),
            Permission.update(Role.user(userId)),
            Permission.delete(Role.user(userId)),
          ]
        )
      );
    });
  });

  await Promise.all(createPromises);
}

export async function updateTemplateOrder(templates) {
  const promises = templates.map((template, index) => 
    databases.updateDocument(
      DB_ID,
      TEMPLATES_COLLECTION_ID,
      template.$id,
      { order: index + 1 }
    )
  );
  await Promise.all(promises);
}

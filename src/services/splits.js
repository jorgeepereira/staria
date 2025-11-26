import { databases } from "@/lib/appwrite";
import { ID, Permission, Query, Role } from "react-native-appwrite";
import { getExercisesByUserId } from "./exercises";
import { listAllTemplateSets, listTemplates } from "./templates";

const DB_ID = "6910e46a00308ce05924";
const SPLITS_COLLECTION_ID = "splits";

export async function createSplit(userId, name) {
  const data = {
    userId,
    name,
    star: false,
    createdAt: new Date().toISOString(),
  };

  return await databases.createDocument(
    DB_ID,
    SPLITS_COLLECTION_ID,
    ID.unique(),
    data,
    [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ]
  );
}

export async function listSplits(userId) {
  const response = await databases.listDocuments(
    DB_ID,
    SPLITS_COLLECTION_ID,
    [
      Query.equal("userId", userId),
      Query.orderDesc("star"),
      Query.orderDesc("createdAt"),
    ]
  );
  return response.documents;
}

export async function listSplitsWithStats(userId) {
  const [splits, templates, sets, exercises] = await Promise.all([
    listSplits(userId),
    listTemplates(userId),
    listAllTemplateSets(userId),
    getExercisesByUserId(userId),
  ]);

  // Create a map of exerciseId -> targetMuscle
  const exerciseMap = {};
  exercises.forEach((ex) => {
    exerciseMap[ex.$id] = ex.targetMuscle;
  });

  // Create a map of splitId -> stats
  const splitStats = {};
  const splitTemplateCounts = {};

  // Initialize stats for each split
  splits.forEach((split) => {
    splitStats[split.$id] = {};
    splitTemplateCounts[split.$id] = 0;
  });

  // Iterate through templates to group by split
  templates.forEach((template) => {
    const splitId = template.splitId;
    
    if (splitTemplateCounts[splitId] !== undefined) {
      splitTemplateCounts[splitId]++;
    }

    if (!splitStats[splitId]) return; // Should be initialized, but safety check

    // Find sets for this template
    const templateSets = sets.filter((s) => s.templateId === template.$id);

    templateSets.forEach((set) => {
      const muscle = exerciseMap[set.exerciseId];
      if (muscle) {
        // Normalize muscle name to lowercase for consistent counting
        const normalizedMuscle = muscle.toLowerCase();
        if (!splitStats[splitId][normalizedMuscle]) {
          splitStats[splitId][normalizedMuscle] = 0;
        }
        splitStats[splitId][normalizedMuscle]++;
      }
    });
  });

  // Attach stats to splits
  return splits.map((split) => ({
    ...split,
    stats: splitStats[split.$id] || {},
    templateCount: splitTemplateCounts[split.$id] || 0,
  }));
}

export async function updateSplit(splitId, data) {
  return await databases.updateDocument(
    DB_ID,
    SPLITS_COLLECTION_ID,
    splitId,
    data
  );
}

export async function deleteSplit(splitId) {
  return await databases.deleteDocument(
    DB_ID,
    SPLITS_COLLECTION_ID,
    splitId
  );
}

export async function getSplit(splitId) {
  return await databases.getDocument(
    DB_ID,
    SPLITS_COLLECTION_ID,
    splitId
  );
}

import { databases } from "@/lib/appwrite";
import { ID, Permission, Query, Role } from "react-native-appwrite";

const DB_ID = "6910e46a00308ce05924";
const EXERCISES_COLLECTION_ID = "exercises";


// Create a new exercise for a specific user
export async function createExercise({ 
  userId,
  name,
  targetMuscle = '',
  type = '',
  defaultUnits = '',
  notes = '',
}) {

  // Create the exercise data payload to pass to the database
  const exerciseData = {
    userId,
    name,
    targetMuscle,
    type,
    defaultUnits,
    notes,
  };

  // Create the exercise document in the database passing in the exerciseData
  const exercise = await databases.createDocument(
    DB_ID,
    EXERCISES_COLLECTION_ID,
    ID.unique(),
    exerciseData,
    [
      Permission.read(Role.user(userId)),
      Permission.write(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ]
  );

  // Return the created exercise to show it in the UI
  return exercise;
}

// Update an existing exercise
export async function updateExercise(exerciseId, patch) {

  // patch is the object containing the fields to update
  const updatedExercise = await databases.updateDocument(
    DB_ID,
    EXERCISES_COLLECTION_ID,
    exerciseId,
    patch
  );

  return updatedExercise;
}

// Delete an existing exercise
export async function deleteExercise(exerciseId) {
  await databases.deleteDocument(
    DB_ID, 
    EXERCISES_COLLECTION_ID, 
    exerciseId);
}

// Fetch a specific exercise by its ID
export async function getExerciseById(exerciseId) {
  const exercise = await databases.getDocument(
    DB_ID,
    EXERCISES_COLLECTION_ID,
    exerciseId
  );

  return exercise;
}

// Fetch all exercises for a specific user
// Returns a list of all exercises belonging to the user
export async function getExercisesByUserId( userId ) {

  if (!userId || typeof userId !== 'string') {
    return [];
  }

  // Ask Appwrite for the documents that match our queries
  const res = await databases.listDocuments(
    DB_ID,
    EXERCISES_COLLECTION_ID,
    [
      Query.equal("userId", userId),
      Query.orderAsc("name"),
      Query.limit(100)
    ]
  );

  // Return just the array of documents
  return res.documents;
}
import { databases } from "@/lib/appwrite";
import { ID, Permission, Query, Role } from "react-native-appwrite";

const DB_ID = "6910e46a00308ce05924";
const WORKOUTS_COLLECTION_ID = "workouts";
const SETS_COLLECTION_ID = "sets";

// Start a new workout session
export async function startWorkout({ userId }) {
  // Create a the workoutData payload to pass to the database
  const workoutData = {
    userId,
    startedAt: new Date().toISOString(),
    endedAt: null
  }

  // create the workout document in the database taking in the workoutData
  const workout = await databases.createDocument(
    DB_ID,
    WORKOUTS_COLLECTION_ID,
    ID.unique(),
    workoutData,
    [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ]
  );

  // return the created workout sto store id in state
  return workout;
}

// Add a new set
// Creates a single "set" document linked to a specific workout and exercise. 
// This is the bridge between workouts and exercises: each set has workoutId + exerciseId.
export async function addSet({
  userId,
  workoutId,
  exerciseId,
  order,
  reps,
  weight = null,
  rpe = null,
  notes = '',
}) {
  // create the setData payload to pass to the database
  const setData = {
    userId,
    workoutId,
    exerciseId,
    order,
    reps,
    weight,
    rpe,
    notes,
  };

  // create the set document in the database taking in the setData
  const set = await databases.createDocument(
    DB_ID,
    SETS_COLLECTION_ID,
    ID.unique(),
    setData,
    [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ]
  );

  // return the created set to store id in state
  return set;
}

// Update an existing set
// Just update the changed fields
export async function updateSet(setId, patch) {
  // patch is nothing more than an object containing the fields to update
  const updatedSet = await databases.updateDocument(
    DB_ID,
    SETS_COLLECTION_ID,
    setId,
    patch
  );

  return updatedSet;
}

// Delete a set
export async function deleteSet( setId ) {
  return await databases.deleteDocument(
    DB_ID,
    SETS_COLLECTION_ID,
    setId
  );
}

// Finish a workout session
// Marks the workout as finished by setting the endedAt timestamp and an optional note
export async function finishWorkout({ workoutId, note = '' }) {
  // create a patch with the endedAt timestamp and note
  const patch = {
    endedAt: new Date().toISOString(),
    note
  }

  // update the workout document in the database with the endedAt timestamp and note
  const updatedWorkout = await databases.updateDocument(
    DB_ID,
    WORKOUTS_COLLECTION_ID,
    workoutId,
    patch
  );

  return updatedWorkout;
}

// List workouts for a specific user
export async function listWorkouts({ userId, limit = 20 }) {

  // we query the 'workouts' collection for documents matching the userId
  const workouts = await databases.listDocuments(
    DB_ID,
    WORKOUTS_COLLECTION_ID,
    [
      Query.equal("userId", userId),
      Query.orderDesc("startedAt"),
      Query.limit(limit),
    ]
  );

  return workouts.documents;
}

// Fetch a specific workout document by ID and all of its associated sets
export async function getWorkoutWithSets({ workoutId, userId }) {

  // Fetch the workout document
  const workout = await databases.getDocument(
    DB_ID,
    WORKOUTS_COLLECTION_ID,
    workoutId
  );

  // Fetch all sets associated with this workout
  const sets = await databases.listDocuments(
    DB_ID,
    SETS_COLLECTION_ID,
    [
      Query.equal("userId", userId),
      Query.equal("workoutId", workoutId),
      Query.orderAsc("order"),
    ]
  );

  const setsDoc = sets.documents;
  
  return {
    workout,
    setsDoc
  };
}
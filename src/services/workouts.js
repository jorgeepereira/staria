import { databases } from "@/lib/appwrite";
import { ID, Permission, Query, Role } from "react-native-appwrite";
import { getExercisesByUserId } from './exercises';

const DB_ID = "6910e46a00308ce05924";
const WORKOUTS_COLLECTION_ID = "workouts";
const SETS_COLLECTION_ID = "sets";

// Update any fields on a workout
export async function updateWorkout(workoutId, patch) {
  return databases.updateDocument(DB_ID, WORKOUTS_COLLECTION_ID, workoutId, patch);
}

// Convenience helper for just the name
export async function updateWorkoutName(workoutId, workoutName) {
  return updateWorkout(workoutId, { workoutName });
}

// Convenience helper for just the duration (in seconds)
export async function updateWorkoutDuration(workoutId, duration) {
  // duration expected as integer seconds
  return updateWorkout(workoutId, { duration: Number(duration) || 0 });
}

// Convenience helper for just the note
export async function updateWorkoutNote(workoutId, note) {
  return updateWorkout(workoutId, { note: String(note || '') });
}

// Start a new workout session
export async function startWorkout({ userId }) {
  // Create a the workoutData payload to pass to the database
  const workoutData = {
    userId,
    workoutName: '',
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
export async function createSet({
  userId,
  workoutId,
  exerciseId,
  order,
  reps = null,
  weight = null,
  rpe = null,
  completed = false,
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
    completed,
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
export async function finishWorkout({ workoutId, workoutName, note = '', duration }) {
  // create a patch with the endedAt timestamp and note
  const patch = {
    endedAt: new Date().toISOString(),
    note,
    workoutName
  }

  if (duration != null) {
    patch.duration = Number(duration) || 0;
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

// Delete a workout and all its sets
export async function deleteWorkout(workoutId) {
  // 1. Delete all sets associated with this workout
  const setsRes = await databases.listDocuments(
    DB_ID,
    SETS_COLLECTION_ID,
    [
      Query.equal("workoutId", workoutId),
    ]
  );

  const deletePromises = setsRes.documents.map(set => 
    databases.deleteDocument(DB_ID, SETS_COLLECTION_ID, set.$id)
  );
  await Promise.all(deletePromises);

  // 2. Delete the workout document
  return await databases.deleteDocument(
    DB_ID,
    WORKOUTS_COLLECTION_ID,
    workoutId
  );
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
  const setsRes = await databases.listDocuments(
    DB_ID,
    SETS_COLLECTION_ID,
    [
      Query.equal("userId", userId),
      Query.equal("workoutId", workoutId),
      Query.orderAsc("order"),
    ]
  );

  const sets = setsRes.documents;
  
  return {
    workout,
    sets
  };
}

// fetch sets by workout id
export async function getSetsByWorkoutId(workoutId) {
  const setsRes = await databases.listDocuments(
    DB_ID,
    SETS_COLLECTION_ID,
    [
      Query.equal("workoutId", workoutId),
      Query.orderAsc("order"),
    ]
  );

  const sets = setsRes.documents;

  return sets;
}

// Fetch completed workouts with their sets for the log screen
export async function getCompletedWorkouts(userId) {
  // 1. List workouts that have ended
  const workoutsRes = await databases.listDocuments(
    DB_ID,
    WORKOUTS_COLLECTION_ID,
    [
      Query.equal("userId", userId),
      Query.isNotNull("endedAt"), // Only completed workouts
      Query.orderDesc("endedAt"),
      Query.limit(20),
    ]
  );
  
  const workouts = workoutsRes.documents;

  // 2. For each workout, fetch sets to build the summary
  const workoutsWithSets = await Promise.all(workouts.map(async (workout) => {
    const sets = await getSetsByWorkoutId(workout.$id);
    return { ...workout, sets };
  }));

  return workoutsWithSets.filter(workout => workout.sets.length > 0);
}

export async function getUserStatistics(userId) {
  // 1. Get total completed workouts count
  const totalWorkoutsRes = await databases.listDocuments(
    DB_ID,
    WORKOUTS_COLLECTION_ID,
    [
      Query.equal("userId", userId),
      Query.isNotNull("endedAt"),
      Query.limit(1),
    ]
  );
  const totalWorkouts = totalWorkoutsRes.total;

  // 2. Get total sets count
  const totalSetsRes = await databases.listDocuments(
    DB_ID,
    SETS_COLLECTION_ID,
    [
      Query.equal("userId", userId),
      Query.limit(1),
    ]
  );
  const totalSets = totalSetsRes.total;

  // 3. Get completed workouts this week & calculate average duration (from last 100)
  // Calculate start of the week (Monday)
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  // Fetch recent workouts and filter in memory to ensure accurate local time comparison
  const recentWorkoutsRes = await databases.listDocuments(
    DB_ID,
    WORKOUTS_COLLECTION_ID,
    [
      Query.equal("userId", userId),
      Query.isNotNull("endedAt"),
      Query.orderDesc("endedAt"),
      Query.limit(100),
    ]
  );

  const recentWorkouts = recentWorkoutsRes.documents;

  const workoutsThisWeek = recentWorkouts.filter(workout => {
    const workoutDate = new Date(workout.endedAt);
    return workoutDate >= startOfWeek;
  }).length;

  // Calculate averages
  const averageSets = totalWorkouts > 0 ? Math.round(totalSets / totalWorkouts) : 0;
  
  const totalDuration = recentWorkouts.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const averageDuration = recentWorkouts.length > 0 ? Math.round(totalDuration / recentWorkouts.length) : 0;

  // 4. Calculate sets per target muscle
  // Fetch all exercises to map exerciseId -> targetMuscle
  const exercises = await getExercisesByUserId(userId);
  const exerciseMap = {};
  exercises.forEach(ex => {
    exerciseMap[ex.$id] = ex.targetMuscle;
  });

  // Fetch a large batch of sets (limit 1000 for now)
  const allSetsRes = await databases.listDocuments(
    DB_ID,
    SETS_COLLECTION_ID,
    [
      Query.equal("userId", userId),
      Query.limit(1000),
    ]
  );
  
  // Initialize with standard muscles
  const STANDARD_MUSCLES = [
    "Chest", "Back", "Quads", "Hamstrings", "Glutes", "Calves", 
    "Biceps", "Triceps", "Forearms", "Abs", 
    "Front Delts", "Side Delts", "Rear Delts"
  ];

  const muscleCounts = {};
  STANDARD_MUSCLES.forEach(m => {
    const key = m.toLowerCase().replace(/[\s-]/g, '');
    muscleCounts[key] = { name: m, count: 0 };
  });

  allSetsRes.documents.forEach(set => {
    const muscle = exerciseMap[set.exerciseId];
    if (muscle) {
      const key = muscle.toLowerCase().replace(/[\s-]/g, '');
      if (muscleCounts[key]) {
        muscleCounts[key].count += 1;
      } else {
        // Handle unknown muscles (e.g. custom ones not in standard list)
        muscleCounts[key] = { name: muscle, count: 1 };
      }
    }
  });

  // Convert to array and sort by count desc
  const muscleStats = Object.values(muscleCounts).sort((a, b) => b.count - a.count);

  // Add 'All' category with total sets count
  muscleStats.unshift({ name: 'Total', count: totalSets });

  return {
    totalWorkouts,
    workoutsThisWeek,
    averageSets,
    averageDuration,
    muscleStats
  };
}
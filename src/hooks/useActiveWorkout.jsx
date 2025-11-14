import { useCallback, useEffect, useState } from "react";

// import service helpers
import { createSet, deleteSet as deleteSetService, finishWorkout as finishWorkoutService, getWorkoutWithSets, updateSet as updateSetService } from "@/services/workouts";

/**
 * useActiveWorkout
 *
 * This hook manages all the state and logic for ONE workout session.
 * It:
 *  - loads the workout + its sets from Appwrite
 *  - keeps sets in local React state
 *  - exposes helper functions (addSet, updateSet, deleteSet, finishWorkout)
 *
 * The UI (ActiveWorkoutScreen) should use THIS hook as its single source of truth
 * for that workout, instead of calling the services directly.
 */

export function useActiveWorkout(userId, workoutId) {

  const [workout, setWorkout] = useState(null); // the workout document
  const [sets, setSets] = useState([]); // the sets that belong to this workout

  const [loading, setLoading] = useState(true); // loading state
  const [error, setError] = useState(null); // error state

  // === 1) Load initial data (workout + sets) and refresh on demand ===

  /**
   * loadWorkout
   *
   * This is the internal function that actually talks to Appwrite
   * to get the workout + sets. We wrap it in useCallback so that
   * the identity of the function is stable unless workoutId/userId change.
   */

  const loadWorkout = useCallback(async () => {
    if (!userId || !workoutId) return;

    try {
      setLoading(true);
      setError(null);

      // Use the service helper to fetch:
      //  - the workout document
      //  - all its sets (ordered)
      const { workout, sets } = await getWorkoutWithSets({ userId, workoutId });

      setWorkout(workout);
      // If Appwrite returns undefined/null for sets for some reason,
      // we fall back to an empty array to avoid "cannot read length of undefined" errors.
      setSets(Array.isArray(sets) ? sets : []);

    } catch (error) {
      console.error('Failed to load active workout', error);
      setError('Could not load workout');
      setWorkout(null);
      setSets([]);
    } finally {
      setLoading(false);
    }
  }, [userId, workoutId]);

  // On mount and whenever workoutId/userId change, load or reload the workout.
  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  // Expose a public refresh function so the UI can manually reload if needed.
  const refresh = useCallback(() => {
    return loadWorkout();
  }, [loadWorkout]);

  // === 2) Add a new set (generic) ===

  /**
   * addSet
   *
   * Adds a new set to this workout for a given exercise.
   * - It calls the low-level createSet service (Appwrite).
   * - Then it updates local React state so the UI updates immediately.
   *
   * The `seed` parameter lets us prefill values like reps/weight/RPE.
   */
  const addSet = useCallback(
    async (exerciseId, seed = {}) => {
      if (!userId || !workoutId || !exerciseId) return null;

      // Determine the "order" for this new set.
      // For now, we just use the current length + 1.
      // Later, we could compute max existing order for this exercise or workout
      // if we need more complex behavior.
      const nextOrder = (sets?.length ?? 0) + 1;

      const created = await createSet({
        userId,
        workoutId,
        exerciseId,
        order: nextOrder,
        reps: seed.reps ?? 0,
        weight: seed.weight ?? 0,
        rpe: seed.rpe ?? null,
        notes: seed.notes ?? '',
      });

      // Update local state with the new set so the UI reflects the change instantly.
      setSets((prev) => [...prev, created]);

      return created;
    },[sets, userId, workoutId]
  );

  // === 3) Add exercise + FIRST set ===

  /**
   * addExerciseFirstSet
   *
   * From the UI's perspective, this is "Add Exercise to the workout".
   * Under the hood, we actually create the FIRST set for that exercise.
   *
   * This respects the rule: there is no "exercise in workout" without at least one set.
   */
  const addExerciseFirstSet = useCallback(
    async (exerciseId, seed = {}) => {
      // For now this is identical to addSet. We keep a separate function because
      // semantically it's a different user action: "Add Exercise" vs "Add another Set".
      // Later we could add special logic here (e.g. default reps/weight from last usage).
      return addSet(exerciseId, seed);
    },
    [addSet]
  );

  // === 4) Update / delete sets ===

  /**
   * updateSet
   *
   * Applies a patch (partial update) to an existing set.
   * - We call the service to update the document in Appwrite.
   * - Then we update the set in local state so the UI stays in sync.
   */
  const updateSet = useCallback(async (setId, patch) => {
    const updated = await updateSetService(setId, patch);

    setSets((prev) =>
      prev.map((s) => (s.$id === setId ? { ...s, ...updated } : s))
    );

    return updated;
  }, []);

  /**
   * deleteSet
   *
   * Deletes a set from Appwrite and removes it from local state.
   */
  const deleteSet = useCallback(async (setId) => {
    await deleteSetService(setId);

    setSets((prev) => prev.filter((s) => s.$id !== setId));
  }, []);

  // === 5) Finish workout ===

  /**
   * finishWorkout
   *
   * Marks this workout as finished (sets endedAt and optional note).
   * - Calls the service to update the workout document.
   * - Updates local workout state to reflect that it's no longer active.
   */
  const finish = useCallback(
    async (note = '') => {
      if (!workoutId) return null;

      const updated = await finishWorkoutService({
        workoutId,
        note,
      });

      setWorkout(updated);
      return updated;
    },
    [workoutId]
  );

  // === 6) group sets by exercise ===
  //
  // This does NOT change the source of truth; it's just a computed view layer
  // that you can use in your UI to render:
  //
  // Exercise Name
  //   - Set 1
  //   - Set 2
  //
  const setsByExercise = useMemo(() => {
    const groups = {};
    for (const set of sets) {
      const exId = set.exerciseId;
      if (!groups[exId]) {
        groups[exId] = [];
      }
      groups[exId].push(set);
    }
    return groups;
  }, [sets]);

  return {
    loading,
    error,
    workout,
    sets,
    setsByExercise,
    refresh,
    addSet,
    addExerciseFirstSet,
    updateSet,
    deleteSet,
    finish,
  };
}
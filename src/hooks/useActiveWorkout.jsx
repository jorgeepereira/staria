import { useCallback, useEffect, useMemo, useState } from "react";

// import service helpers
import { createSet, deleteSet as deleteSetService, deleteWorkout as deleteWorkoutService, finishWorkout as finishWorkoutService, getWorkoutWithSets, updateSet as updateSetService, updateWorkoutDuration, updateWorkoutName, updateWorkoutNote } from "@/services/workouts";

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
  const [note, setNote] = useState(''); // workout note

  const [loading, setLoading] = useState(true); // loading state
  const [error, setError] = useState(null); // error state
  const [durationSec, setDurationSec] = useState(0); // live duration in seconds
  const [isPaused, setIsPaused] = useState(false); // pause state
  const [pausedAt, setPausedAt] = useState(null); // timestamp when paused
  const [totalPausedMs, setTotalPausedMs] = useState(0); // accumulated paused time

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
      setNote('');
    } finally {
      setLoading(false);
    }
  }, [userId, workoutId]);

  // On mount and whenever workoutId/userId change, load or reload the workout.
  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  // Drive a 1-second ticking timer from startedAt. Stops when workout ends or is paused.
  useEffect(() => {
    if (!workout?.startedAt || workout?.endedAt || isPaused) {
      return;
    }
    
    const startMs = new Date(workout.startedAt).getTime();
    
    const tick = () => {
      const now = Date.now();
      const elapsed = now - startMs - totalPausedMs;
      const sec = Math.max(0, Math.floor(elapsed / 1000));
      setDurationSec(sec);
    };
    
    tick(); // Initial tick
    const id = setInterval(tick, 1000);
    
    return () => {
      clearInterval(id);
    };
  }, [workout?.startedAt, workout?.endedAt, isPaused, totalPausedMs]);

  // Throttle-persist duration to backend every ~30 seconds while active
  useEffect(() => {
    if (!workoutId || !workout?.startedAt || workout?.endedAt) return;
    // simple throttle: save on multiples of 30 seconds
    if (durationSec > 0 && durationSec % 30 === 0) {
      updateWorkoutDuration(workoutId, durationSec).catch(() => {});
    }
  }, [durationSec, workoutId, workout?.startedAt, workout?.endedAt]);

  // Expose a public refresh function so the UI can manually reload if needed.
  const refresh = useCallback(() => {
    return loadWorkout();
  }, [loadWorkout]);

  // Pause the timer
  const pause = useCallback(() => {
    if (isPaused || !workout?.startedAt || workout?.endedAt) return;
    setIsPaused(true);
    setPausedAt(Date.now());
  }, [isPaused, workout?.startedAt, workout?.endedAt]);

  // Resume the timer
  const resume = useCallback(() => {
    if (!isPaused || !pausedAt) return;
    const pauseDuration = Date.now() - pausedAt;
    setTotalPausedMs(prev => prev + pauseDuration);
    setIsPaused(false);
    setPausedAt(null);
  }, [isPaused, pausedAt]);

  // Optimistic rename
  const renameWorkout = useCallback(async (name) => {
    if (!workoutId) throw new Error('Missing workoutId');
    const newName = String(name ?? '').trim().slice(0, 24);
    const prev = workout?.workoutName ?? '';

    // optimistic local state
    setWorkout((w) => (w ? { ...w, workoutName: newName } : w));

    try {
      await updateWorkoutName(workoutId, newName);
    } catch (e) {
      // rollback on error
      setWorkout((w) => (w ? { ...w, workoutName: prev } : w));
      throw e;
    }
  }, [workoutId, workout]);

  // Optimistic note update
  const updateNote = useCallback(async (note) => {
    if (!workoutId) throw new Error('Missing workoutId');
    const newNote = String(note ?? '').trim();
    const prev = workout?.note ?? '';

    // optimistic local state
    setWorkout((w) => (w ? { ...w, note: newNote } : w));

    try {
      await updateWorkoutNote(workoutId, newNote);
    } catch (e) {
      // rollback on error
      setWorkout((w) => (w ? { ...w, note: prev } : w));
      throw e;
    }
  }, [workoutId, workout]);

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
        reps: seed.reps,
        weight: seed.weight,
        rpe: seed.rpe,
        notes: seed.notes,
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
    async (workoutName, note) => {
      if (!workoutId) return null;

      const updated = await finishWorkoutService({
        workoutId,
        workoutName,
        note,
        duration: durationSec,
      });

      setWorkout(updated);
      return updated;
    },
    [workoutId, durationSec]
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

  // === 7) Cancel workout ===
  const cancelWorkout = useCallback(async () => {
    if (!workoutId) return;
    await deleteWorkoutService(workoutId);
    setWorkout(null);
    setSets([]);
  }, [workoutId]);

  // === 8) Reorder exercises ===
  const reorderExercises = useCallback(async (newExerciseOrderIds) => {
    if (!workoutId) return;

    // We need to update the order of ALL sets based on the new exercise order.
    // 1. Group current sets by exerciseId (we already have setsByExercise but let's do it from `sets` to be safe/atomic)
    const groups = {};
    sets.forEach(s => {
      if (!groups[s.exerciseId]) groups[s.exerciseId] = [];
      groups[s.exerciseId].push(s);
    });

    // Sort sets within each group by their existing order to maintain relative order
    Object.keys(groups).forEach(k => {
      groups[k].sort((a, b) => a.order - b.order);
    });

    const newSets = [];
    const updates = [];
    let currentOrder = 1;

    // 2. Iterate through the new exercise order
    for (const exId of newExerciseOrderIds) {
      const groupSets = groups[exId] || [];
      for (const set of groupSets) {
        if (set.order !== currentOrder) {
          updates.push({ setId: set.$id, order: currentOrder });
          newSets.push({ ...set, order: currentOrder });
        } else {
          newSets.push(set);
        }
        currentOrder++;
      }
    }

    // 3. Update local state immediately
    // We replace the sets with the newSets (which contains updated orders)
    // We need to make sure we didn't miss any sets (e.g. if newExerciseOrderIds was partial)
    // But assuming it's complete:
    setSets(newSets);

    // 4. Update backend
    try {
      await Promise.all(updates.map(u => updateSetService(u.setId, { order: u.order })));
    } catch (e) {
      console.error("Failed to reorder sets", e);
      // In a real app, we might want to revert local state or show an error
    }
  }, [sets, workoutId]);

  // === 9) Delete all sets for an exercise ===
  const deleteExerciseFromWorkout = useCallback(async (exerciseId) => {
    if (!workoutId) return;
    
    // Find all sets for this exercise
    const setsToDelete = sets.filter(s => s.exerciseId === exerciseId);
    
    // Optimistically update local state
    setSets(prev => prev.filter(s => s.exerciseId !== exerciseId));

    try {
      // Delete from backend
      await Promise.all(setsToDelete.map(s => deleteSetService(s.$id)));
    } catch (e) {
      console.error("Failed to delete exercise sets", e);
      // Revert on error? Or just let it be.
      // For now, maybe just log.
    }
  }, [sets, workoutId]);

  return {
    loading,
    error,
    workout,
    sets,
    note,
    setsByExercise,
    durationSec,
    isPaused,
    pause,
    resume,
    loadWorkout,
    renameWorkout,
    refresh,
    addSet,
    addExerciseFirstSet,
    updateSet,
    deleteSet,
    finish,
    cancelWorkout,
    reorderExercises,
    deleteExerciseFromWorkout,
  };
}
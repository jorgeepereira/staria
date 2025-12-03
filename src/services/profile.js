import { databases } from "@/lib/appwrite";
import { Permission, Role } from "react-native-appwrite";

const DB_ID = "6910e46a00308ce05924";
const PROFILES_COL_ID = "profiles";

const DOC_PERMS = (userId) => [
  Permission.read(Role.user(userId)),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
];

// gets a profile by userId from the db
export async function getProfileById(userId) {
  try {
    return await databases.getDocument(DB_ID, PROFILES_COL_ID, userId);
  } catch (error) {
    if (error.code === 404) return null;
    throw error;
  }
}

// creates a new profile doc in the db passing in all of the attributes in data
export async function createProfile(userId, data) {
  return await databases.createDocument(
    DB_ID, 
    PROFILES_COL_ID, 
    userId,
    {
      displayName: data.displayName ?? '',
      units: data.units ?? 'imperial',
      height: data.height ?? null,
      weight: data.weight ?? null,
    },
    DOC_PERMS(userId)
  );
}

// updates a profile doc in the db passing in all of the attributes in data
export async function updateProfile(userId, data) {
  return await databases.updateDocument(DB_ID, PROFILES_COL_ID, userId, data, DOC_PERMS(userId));
}

// checks if a profile exists for the user, creates or updates accordingly
export async function upsertProfile(userId, data) {
  const existing = await getProfileById(userId);
  if (!existing) {
    return await createProfile(userId, data);
  }
  return await updateProfile(userId, data);
}
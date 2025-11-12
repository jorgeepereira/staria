import Constants from 'expo-constants';
import { Account, Avatars, Client, Databases, Storage } from 'react-native-appwrite';

const { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_PLATFORM } =
  Constants.expoConfig?.extra ?? {};

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setPlatform?.(APPWRITE_PLATFORM)

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const avatars = new Avatars(client);

export { account, avatars, databases, storage };


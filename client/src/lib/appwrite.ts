import { Client, Account, Databases, Storage, Realtime } from 'appwrite';
import { appwriteConfig } from './appwrite-config';

console.log('[Appwrite.ts] Initializing with:');
console.log('[Appwrite.ts] Endpoint:', appwriteConfig.endpoint);
console.log('[Appwrite.ts] Project ID:', appwriteConfig.projectId);
console.log('[Appwrite.ts] Database ID:', appwriteConfig.databaseId);

// Initialize Appwrite Client
const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const realtime = new Realtime(client);

export { client };
export default client;

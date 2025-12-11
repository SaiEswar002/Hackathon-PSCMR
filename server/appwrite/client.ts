import { Client, Databases, Storage, Users } from 'node-appwrite';

// Server-side Appwrite configuration
const appwriteConfig = {
    endpoint: process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
    projectId: process.env.APPWRITE_PROJECT_ID || '693a5d38001eb9c27cca',
    apiKey: process.env.APPWRITE_API_KEY || '',
    databaseId: process.env.APPWRITE_DATABASE_ID || '693aa86e00236cd739f1',
};

// Initialize Appwrite Client for server-side operations
const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setKey(appwriteConfig.apiKey);

// Initialize services
export const databases = new Databases(client);
export const storage = new Storage(client);
export const users = new Users(client);

export { client, appwriteConfig };
export default client;

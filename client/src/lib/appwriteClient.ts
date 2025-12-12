import { Client, Account, Databases, Storage } from 'appwrite';

// Get environment variables
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
    throw new Error('Missing Appwrite configuration. Please check your .env file.');
}

console.log('[AppwriteClient] Initializing with:');
console.log('[AppwriteClient] Endpoint:', APPWRITE_ENDPOINT);
console.log('[AppwriteClient] Project ID:', APPWRITE_PROJECT_ID);
console.log('[AppwriteClient] Database ID:', APPWRITE_DATABASE_ID);

// Initialize Appwrite Client
export const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Export configuration
export const appwriteConfig = {
    endpoint: APPWRITE_ENDPOINT,
    projectId: APPWRITE_PROJECT_ID,
    databaseId: APPWRITE_DATABASE_ID,

    collections: {
        users: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID || 'users',
        posts: import.meta.env.VITE_APPWRITE_POSTS_COLLECTION_ID || 'posts',
        messages: import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID || 'messages',
        conversations: import.meta.env.VITE_APPWRITE_CONVERSATIONS_COLLECTION_ID || 'conversations',
        projects: import.meta.env.VITE_APPWRITE_PROJECTS_COLLECTION_ID || 'projects',
        events: import.meta.env.VITE_APPWRITE_EVENTS_COLLECTION_ID || 'events',
    },

    buckets: {
        postMedia: import.meta.env.VITE_APPWRITE_POST_MEDIA_BUCKET_ID || 'post_media',
        profilePics: import.meta.env.VITE_APPWRITE_PROFILE_PICS_BUCKET_ID || 'profile_pics',
        projectFiles: import.meta.env.VITE_APPWRITE_PROJECT_FILES_BUCKET_ID || 'project_files',
    },
};

export default client;

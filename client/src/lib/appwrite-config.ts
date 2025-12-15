// Appwrite configuration constants

// Validate required environment variables
const requiredEnvVars = {
    VITE_APPWRITE_ENDPOINT: import.meta.env.VITE_APPWRITE_ENDPOINT,
    VITE_APPWRITE_PROJECT_ID: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    VITE_APPWRITE_DATABASE_ID: import.meta.env.VITE_APPWRITE_DATABASE_ID,
};

const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

if (missingVars.length > 0) {
    console.error('[Appwrite Config] Missing required environment variables:', missingVars);
    console.error('[Appwrite Config] Please ensure these variables are set in your .env file (local) or Netlify dashboard (production)');
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

export const appwriteConfig = {
    endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,

    // Collection IDs
    collections: {
        users: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
        posts: import.meta.env.VITE_APPWRITE_POSTS_COLLECTION_ID,
        connections: import.meta.env.VITE_APPWRITE_CONNECTIONS_COLLECTION_ID,
        messages: import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID,
        conversations: import.meta.env.VITE_APPWRITE_CONVERSATIONS_COLLECTION_ID,
        projects: import.meta.env.VITE_APPWRITE_PROJECTS_COLLECTION_ID,
        tasks: import.meta.env.VITE_APPWRITE_TASKS_COLLECTION_ID,
        events: import.meta.env.VITE_APPWRITE_EVENTS_COLLECTION_ID,
        savedItems: import.meta.env.VITE_APPWRITE_SAVED_ITEMS_COLLECTION_ID,
        postLikes: import.meta.env.VITE_APPWRITE_POST_LIKES_COLLECTION_ID,
        comments: import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID || 'comments',
    },

    // Bucket IDs
    buckets: {
        avatars: import.meta.env.VITE_APPWRITE_AVATARS_BUCKET_ID,
        banners: import.meta.env.VITE_APPWRITE_BANNERS_BUCKET_ID,
        postImages: import.meta.env.VITE_APPWRITE_POST_IMAGES_BUCKET_ID,
        projectImages: import.meta.env.VITE_APPWRITE_PROJECT_IMAGES_BUCKET_ID,
        eventImages: import.meta.env.VITE_APPWRITE_EVENT_IMAGES_BUCKET_ID,
    },
};


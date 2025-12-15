import { Client, Databases, Permission, Role, ID } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = {
    endpoint: process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
    projectId: process.env.VITE_APPWRITE_PROJECT_ID,
    databaseId: process.env.VITE_APPWRITE_DATABASE_ID,
    apiKey: process.env.APPWRITE_API_KEY,
    collections: {
        users: process.env.VITE_APPWRITE_USERS_COLLECTION_ID,
        posts: process.env.VITE_APPWRITE_POSTS_COLLECTION_ID,
        postLikes: process.env.VITE_APPWRITE_POST_LIKES_COLLECTION_ID || 'post_likes',
        comments: process.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID || 'comments',
    }
};

if (!config.apiKey || config.apiKey === 'your_api_key_here') {
    console.error('❌ Error: APPWRITE_API_KEY is missing or invalid in .env file');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId!)
    .setKey(config.apiKey);

const databases = new Databases(client);

async function ensureCollection(collectionId: string, name: string) {
    try {
        await databases.getCollection(config.databaseId!, collectionId);
        console.log(`✅ Collection ${name} (${collectionId}) exists.`);
    } catch (error: any) {
        if (error.code === 404) {
            console.log(`Creating collection ${name} (${collectionId})...`);
            await databases.createCollection(config.databaseId!, collectionId, name, [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users()),
            ]);
            console.log(`✅ Created collection ${name}`);
        } else {
            console.error(`❌ Error checking collection ${name}:`, error.message);
            throw error;
        }
    }
}

async function ensureAttribute(collectionId: string, key: string, type: 'string' | 'integer' | 'boolean', size?: number, required: boolean = false, array: boolean = false) {
    try {
        await databases.getAttribute(config.databaseId!, collectionId, key);
        console.log(`   - Attribute ${key} exists.`);
    } catch (error: any) {
        console.log(`   - Creating attribute ${key}...`);
        try {
            if (type === 'string') {
                await databases.createStringAttribute(config.databaseId!, collectionId, key, size!, required, undefined, array);
            } else if (type === 'integer') {
                await databases.createIntegerAttribute(config.databaseId!, collectionId, key, required, undefined, undefined, undefined);
            } else if (type === 'boolean') {
                await databases.createBooleanAttribute(config.databaseId!, collectionId, key, required, undefined, array);
            }
            // Wait a bit for attribute to be created
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (createError: any) {
            // Ignore if it already exists (race condition)
            if (createError.code !== 409) {
                console.error(`❌ Error creating attribute ${key}:`, createError.message);
            }
        }
    }
}

async function updateCollectionPermissions(collectionName: string, collectionId: string, permissions: string[]) {
    try {
        console.log(`Updating permissions for ${collectionName} (${collectionId})...`);
        await databases.updateCollection(
            config.databaseId!,
            collectionId,
            collectionName,
            permissions,
            true // documentSecurity
        );
        console.log(`✅ Successfully updated permissions for ${collectionName}`);
    } catch (error: any) {
        console.error(`❌ Error updating ${collectionName}:`, error.message);
    }
}

async function fixPermissions() {
    console.log('🔧 Starting permissions fix and schema setup...');

    // 1. Posts Collection Permissions
    const postsId = config.collections.posts!;
    // Ensure Posts Attributes
    console.log(`Checking schema for Posts (${postsId})...`);
    await ensureAttribute(postsId, 'authorId', 'string', 36, true);
    await ensureAttribute(postsId, 'content', 'string', 5000, true);
    await ensureAttribute(postsId, 'postType', 'string', 50, true);
    await ensureAttribute(postsId, 'tags', 'string', 50, false, true); // Array
    await ensureAttribute(postsId, 'imageUrl', 'string', 1000, false);
    await ensureAttribute(postsId, 'likesCount', 'integer', undefined, false);
    await ensureAttribute(postsId, 'commentsCount', 'integer', undefined, false);
    await ensureAttribute(postsId, 'sharesCount', 'integer', undefined, false);

    await updateCollectionPermissions('posts', postsId, [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
    ]);

    // 2. Users Collection Permissions
    await updateCollectionPermissions('users', config.collections.users!, [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
    ]);

    // 3. Post Likes Collection
    const postLikesId = config.collections.postLikes || 'post_likes';
    await ensureCollection(postLikesId, 'Post Likes');
    await ensureAttribute(postLikesId, 'postId', 'string', 36, true);
    await ensureAttribute(postLikesId, 'userId', 'string', 36, true);

    await updateCollectionPermissions('post_likes', postLikesId, [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.delete(Role.users()),
    ]);

    // 4. Comments Collection
    const commentsId = config.collections.comments || 'comments';
    await ensureCollection(commentsId, 'Comments');
    await ensureAttribute(commentsId, 'postId', 'string', 36, true);
    await ensureAttribute(commentsId, 'authorId', 'string', 36, true);
    await ensureAttribute(commentsId, 'content', 'string', 5000, true);
    await ensureAttribute(commentsId, 'likesCount', 'integer', undefined, false);

    await updateCollectionPermissions('comments', commentsId, [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
    ]);

    console.log('\n✨ Permissions and schema update complete!');
    console.log('👉 Please wait a few seconds for attributes to be indexed before testing.');
}

fixPermissions().catch(console.error);

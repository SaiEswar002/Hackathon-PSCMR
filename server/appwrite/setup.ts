import { Client, Databases, Storage, ID } from 'node-appwrite';

/**
 * Appwrite Setup Script
 * 
 * This script helps you set up your Appwrite collections and buckets.
 * Run this after creating your Appwrite project and database.
 * 
 * Prerequisites:
 * 1. Create an Appwrite project at https://cloud.appwrite.io
 * 2. Create a database named "ssm_database"
 * 3. Generate an API key with all permissions
 * 4. Update the .env file with your credentials
 */

const config = {
    endpoint: process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
    projectId: process.env.APPWRITE_PROJECT_ID || '693a5d38001eb9c27cca',
    apiKey: process.env.APPWRITE_API_KEY || '',
    databaseId: process.env.APPWRITE_DATABASE_ID || '693aa86e00236cd739f1',
};

const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setKey(config.apiKey);

const databases = new Databases(client);
const storage = new Storage(client);

async function createCollections() {
    console.log('📦 Creating collections...\n');

    try {
        // Users Collection
        console.log('Creating users collection...');
        await databases.createCollection(
            config.databaseId,
            'users',
            'users',
            undefined,
            undefined,
            true // Document security enabled
        );
        console.log('✓ Users collection created\n');

        // Posts Collection
        console.log('Creating posts collection...');
        await databases.createCollection(
            config.databaseId,
            'posts',
            'posts',
            undefined,
            undefined,
            true
        );
        console.log('✓ Posts collection created\n');

        // Connections Collection
        console.log('Creating connections collection...');
        await databases.createCollection(
            config.databaseId,
            'connections',
            'connections',
            undefined,
            undefined,
            true
        );
        console.log('✓ Connections collection created\n');

        // Messages Collection
        console.log('Creating messages collection...');
        await databases.createCollection(
            config.databaseId,
            'messages',
            'messages',
            undefined,
            undefined,
            true
        );
        console.log('✓ Messages collection created\n');

        // Conversations Collection
        console.log('Creating conversations collection...');
        await databases.createCollection(
            config.databaseId,
            'conversations',
            'conversations',
            undefined,
            undefined,
            true
        );
        console.log('✓ Conversations collection created\n');

        // Projects Collection
        console.log('Creating projects collection...');
        await databases.createCollection(
            config.databaseId,
            'projects',
            'projects',
            undefined,
            undefined,
            true
        );
        console.log('✓ Projects collection created\n');

        // Tasks Collection
        console.log('Creating tasks collection...');
        await databases.createCollection(
            config.databaseId,
            'tasks',
            'tasks',
            undefined,
            undefined,
            true
        );
        console.log('✓ Tasks collection created\n');

        // Events Collection
        console.log('Creating events collection...');
        await databases.createCollection(
            config.databaseId,
            'events',
            'events',
            undefined,
            undefined,
            true
        );
        console.log('✓ Events collection created\n');

        // Saved Items Collection
        console.log('Creating saved_items collection...');
        await databases.createCollection(
            config.databaseId,
            'saved_items',
            'saved_items',
            undefined,
            undefined,
            true
        );
        console.log('✓ Saved items collection created\n');

        // Post Likes Collection
        console.log('Creating post_likes collection...');
        await databases.createCollection(
            config.databaseId,
            'post_likes',
            'post_likes',
            undefined,
            undefined,
            true
        );
        console.log('✓ Post likes collection created\n');

        console.log('✅ All collections created successfully!\n');
    } catch (error: any) {
        console.error('❌ Error creating collections:', error.message);
    }
}

async function createBuckets() {
    console.log('🗂️  Creating storage buckets...\n');

    const buckets = [
        { id: 'avatars', name: 'Avatars', maxSize: 5 * 1024 * 1024 }, // 5MB
        { id: 'banners', name: 'Banners', maxSize: 10 * 1024 * 1024 }, // 10MB
        { id: 'post_images', name: 'Post Images', maxSize: 10 * 1024 * 1024 }, // 10MB
        { id: 'project_images', name: 'Project Images', maxSize: 10 * 1024 * 1024 }, // 10MB
        { id: 'event_images', name: 'Event Images', maxSize: 10 * 1024 * 1024 }, // 10MB
    ];

    try {
        for (const bucket of buckets) {
            console.log(`Creating ${bucket.name} bucket...`);
            await storage.createBucket(
                bucket.id,
                bucket.name,
                undefined,
                undefined,
                true, // Enabled
                bucket.maxSize,
                ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov'],
                undefined,
                true, // Antivirus enabled
                true  // Compression enabled
            );
            console.log(`✓ ${bucket.name} bucket created\n`);
        }

        console.log('✅ All buckets created successfully!\n');
    } catch (error: any) {
        console.error('❌ Error creating buckets:', error.message);
    }
}

async function main() {
    console.log('🚀 Starting Appwrite setup for SSM Platform\n');
    console.log('Configuration:');
    console.log(`- Endpoint: ${config.endpoint}`);
    console.log(`- Project ID: ${config.projectId}`);
    console.log(`- Database ID: ${config.databaseId}\n`);

    if (!config.apiKey) {
        console.error('❌ Error: APPWRITE_API_KEY is not set in .env file');
        console.log('\nPlease:');
        console.log('1. Go to your Appwrite console');
        console.log('2. Navigate to your project settings');
        console.log('3. Create an API key with all permissions');
        console.log('4. Add it to your .env file as APPWRITE_API_KEY=your_key_here');
        process.exit(1);
    }

    console.log('⚠️  WARNING: This script will create collections and buckets.');
    console.log('Make sure you have created the database "ssm_database" in your Appwrite console first.\n');

    // Uncomment the following lines to run the setup
    await createCollections();
    await createBuckets();

    console.log('✅ Setup complete!');
    console.log('\nNext steps:');
    console.log('1. Configure collection attributes in Appwrite console (see appwrite_integration_plan.md)');
    console.log('2. Set up collection indexes for better performance');
    console.log('3. Configure permissions for each collection');
    console.log('4. Test the integration with your application');
}

// Uncomment to run
// main().catch(console.error);

export { createCollections, createBuckets };

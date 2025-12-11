import { ID } from 'appwrite';
import { storage } from '../appwrite';
import { appwriteConfig } from '../appwrite-config';

export type BucketType = 'avatars' | 'banners' | 'postImages' | 'projectImages' | 'eventImages';

class StorageService {
    private getBucketId(bucketType: BucketType): string {
        return appwriteConfig.buckets[bucketType];
    }

    /**
     * Upload a file to storage
     */
    async uploadFile(file: File, bucketType: BucketType): Promise<string> {
        try {
            const bucketId = this.getBucketId(bucketType);
            const response = await storage.createFile(
                bucketId,
                ID.unique(),
                file
            );

            // Return the file URL
            return this.getFileUrl(response.$id, bucketType);
        } catch (error) {
            console.error('Upload file error:', error);
            throw error;
        }
    }

    /**
     * Get file URL
     */
    getFileUrl(fileId: string, bucketType: BucketType): string {
        const bucketId = this.getBucketId(bucketType);
        return `${appwriteConfig.endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${appwriteConfig.projectId}`;
    }

    /**
     * Get file preview URL (for images with transformations)
     */
    getFilePreview(
        fileId: string,
        bucketType: BucketType,
        width?: number,
        height?: number,
        quality?: number
    ): string {
        const bucketId = this.getBucketId(bucketType);
        const params = new URLSearchParams({
            project: appwriteConfig.projectId,
            ...(width && { width: width.toString() }),
            ...(height && { height: height.toString() }),
            ...(quality && { quality: quality.toString() }),
        });

        return `${appwriteConfig.endpoint}/storage/buckets/${bucketId}/files/${fileId}/preview?${params.toString()}`;
    }

    /**
     * Delete a file from storage
     */
    async deleteFile(fileId: string, bucketType: BucketType): Promise<boolean> {
        try {
            const bucketId = this.getBucketId(bucketType);
            await storage.deleteFile(bucketId, fileId);
            return true;
        } catch (error) {
            console.error('Delete file error:', error);
            return false;
        }
    }

    /**
     * Upload avatar image
     */
    async uploadAvatar(file: File): Promise<string> {
        return this.uploadFile(file, 'avatars');
    }

    /**
     * Upload banner image
     */
    async uploadBanner(file: File): Promise<string> {
        return this.uploadFile(file, 'banners');
    }

    /**
     * Upload post image
     */
    async uploadPostImage(file: File): Promise<string> {
        return this.uploadFile(file, 'postImages');
    }

    /**
     * Upload project image
     */
    async uploadProjectImage(file: File): Promise<string> {
        return this.uploadFile(file, 'projectImages');
    }

    /**
     * Upload event image
     */
    async uploadEventImage(file: File): Promise<string> {
        return this.uploadFile(file, 'eventImages');
    }

    /**
     * Extract file ID from URL
     */
    extractFileIdFromUrl(url: string): string | null {
        try {
            const match = url.match(/files\/([^/]+)\//);
            return match ? match[1] : null;
        } catch (error) {
            console.error('Extract file ID error:', error);
            return null;
        }
    }
}

export const storageService = new StorageService();

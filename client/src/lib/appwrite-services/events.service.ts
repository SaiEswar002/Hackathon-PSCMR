import { ID, Query } from 'appwrite';
import { databases } from '../appwrite';
import { appwriteConfig } from '../appwrite-config';
import type { Event, InsertEvent } from '@shared/schema';

class EventsService {
    private collectionId = appwriteConfig.collections.events;
    private databaseId = appwriteConfig.databaseId;

    /**
     * Create a new event
     */
    async createEvent(data: InsertEvent): Promise<Event> {
        try {
            const response = await databases.createDocument(
                this.databaseId,
                this.collectionId,
                ID.unique(),
                {
                    ...data,
                    attendeeIds: [],
                }
            );
            return response as unknown as Event;
        } catch (error) {
            console.error('Create event error:', error);
            throw error;
        }
    }

    /**
     * Get event by ID
     */
    async getEvent(eventId: string): Promise<Event | null> {
        try {
            const response = await databases.getDocument(
                this.databaseId,
                this.collectionId,
                eventId
            );
            return response as unknown as Event;
        } catch (error) {
            console.error('Get event error:', error);
            return null;
        }
    }

    /**
     * Get all events (sorted by date)
     */
    async getAllEvents(): Promise<Event[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [Query.orderAsc('date'), Query.limit(100)]
            );
            return response.documents as unknown as Event[];
        } catch (error) {
            console.error('Get all events error:', error);
            return [];
        }
    }

    /**
     * Get upcoming events
     */
    async getUpcomingEvents(): Promise<Event[]> {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [
                    Query.greaterThanEqual('date', today),
                    Query.orderAsc('date'),
                ]
            );
            return response.documents as unknown as Event[];
        } catch (error) {
            console.error('Get upcoming events error:', error);
            return [];
        }
    }

    /**
     * Get events by organizer
     */
    async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [
                    Query.equal('organizerId', organizerId),
                    Query.orderAsc('date'),
                ]
            );
            return response.documents as unknown as Event[];
        } catch (error) {
            console.error('Get events by organizer error:', error);
            return [];
        }
    }

    /**
     * Get events by type
     */
    async getEventsByType(eventType: string): Promise<Event[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [
                    Query.equal('eventType', eventType),
                    Query.orderAsc('date'),
                ]
            );
            return response.documents as unknown as Event[];
        } catch (error) {
            console.error('Get events by type error:', error);
            return [];
        }
    }

    /**
     * Update event
     */
    async updateEvent(eventId: string, data: Partial<Event>): Promise<Event | null> {
        try {
            const response = await databases.updateDocument(
                this.databaseId,
                this.collectionId,
                eventId,
                data
            );
            return response as unknown as Event;
        } catch (error) {
            console.error('Update event error:', error);
            return null;
        }
    }

    /**
     * Delete event
     */
    async deleteEvent(eventId: string): Promise<boolean> {
        try {
            await databases.deleteDocument(
                this.databaseId,
                this.collectionId,
                eventId
            );
            return true;
        } catch (error) {
            console.error('Delete event error:', error);
            return false;
        }
    }

    /**
     * RSVP to event (toggle attendance)
     */
    async toggleRSVP(eventId: string, userId: string): Promise<Event | null> {
        try {
            const event = await this.getEvent(eventId);
            if (!event) return null;

            const attendeeIds = event.attendeeIds || [];
            const isAttending = attendeeIds.includes(userId);

            // Check max attendees limit
            if (!isAttending && event.maxAttendees && attendeeIds.length >= event.maxAttendees) {
                throw new Error('Event is full');
            }

            const updatedAttendeeIds = isAttending
                ? attendeeIds.filter(id => id !== userId)
                : [...attendeeIds, userId];

            return await this.updateEvent(eventId, {
                attendeeIds: updatedAttendeeIds,
            });
        } catch (error) {
            console.error('Toggle RSVP error:', error);
            throw error;
        }
    }

    /**
     * Check if user is attending event
     */
    async isUserAttending(eventId: string, userId: string): Promise<boolean> {
        try {
            const event = await this.getEvent(eventId);
            if (!event) return false;
            return (event.attendeeIds || []).includes(userId);
        } catch (error) {
            console.error('Check attendance error:', error);
            return false;
        }
    }

    /**
     * Get events user is attending
     */
    async getUserEvents(userId: string): Promise<Event[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [
                    Query.search('attendeeIds', userId),
                    Query.orderAsc('date'),
                ]
            );
            return response.documents as unknown as Event[];
        } catch (error) {
            console.error('Get user events error:', error);
            return [];
        }
    }
}

export const eventsService = new EventsService();

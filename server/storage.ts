import {
  type User, type InsertUser,
  type Post, type InsertPost,
  type Connection, type InsertConnection,
  type Message, type InsertMessage,
  type Conversation, type InsertConversation,
  type Project, type InsertProject,
  type Task, type InsertTask,
  type Event, type InsertEvent,
  type SavedItem, type InsertSavedItem,
  type PostWithAuthor, type MatchResult, type ConversationWithDetails
} from "@shared/schema";
import { Client, Databases, Query, ID } from 'node-appwrite';
import { randomUUID } from "crypto";

// Appwrite configuration
const config = {
  endpoint: process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
  projectId: process.env.APPWRITE_PROJECT_ID || '693a5d38001eb9c27cca',
  databaseId: process.env.APPWRITE_DATABASE_ID || '693aa86e00236cd739f1',
  apiKey: process.env.APPWRITE_API_KEY || '',
};

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Posts
  getPost(id: string): Promise<Post | undefined>;
  getAllPosts(): Promise<Post[]>;
  getPostsByAuthor(authorId: string): Promise<Post[]>;
  getPostsWithAuthors(moduleFilter?: string): Promise<PostWithAuthor[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, data: Partial<Post>): Promise<Post | undefined>;
  likePost(postId: string, userId: string): Promise<Post | undefined>;

  // Connections
  getConnection(id: string): Promise<Connection | undefined>;
  getConnectionsByUser(userId: string): Promise<Connection[]>;
  getConnectedUsers(userId: string): Promise<User[]>;
  createConnection(connection: InsertConnection): Promise<Connection>;
  updateConnection(id: string, data: Partial<Connection>): Promise<Connection | undefined>;

  // Messages
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Conversations
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByUser(userId: string): Promise<ConversationWithDetails[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;

  // Projects
  getProject(id: string): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  getProjectsByUser(userId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, data: Partial<Project>): Promise<Project | undefined>;

  // Tasks
  getTask(id: string): Promise<Task | undefined>;
  getTasksByProject(projectId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, data: Partial<Task>): Promise<Task | undefined>;

  // Events
  getEvent(id: string): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  rsvpEvent(eventId: string, userId: string): Promise<Event | undefined>;

  // Saved Items
  getSavedItemsByUser(userId: string): Promise<SavedItem[]>;
  createSavedItem(savedItem: InsertSavedItem): Promise<SavedItem>;
  deleteSavedItem(id: string): Promise<void>;

  // Matchmaking
  getMatches(userId: string): Promise<MatchResult[]>;
}

export class AppwriteStorage implements IStorage {
  private databaseId = config.databaseId;
  private collections = {
    users: 'users',
    posts: 'posts',
    connections: 'connections',
    messages: 'messages',
    conversations: 'conversations',
    projects: 'projects',
    tasks: 'tasks',
    events: 'events',
    saved_items: 'saved_items',
    post_likes: 'post_likes',
  };

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      const user = await databases.getDocument(this.databaseId, this.collections.users, id);
      return user as User;
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collections.users,
        [Query.equal('username', username)]
      );
      return response.documents[0] as User;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collections.users,
        [Query.equal('email', email)]
      );
      return response.documents[0] as User;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const user = await databases.createDocument(
        this.databaseId,
        this.collections.users,
        ID.unique(),
        { ...insertUser, profileViews: 0, connectionsCount: 0 }
      );
      return user as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    try {
      const user = await databases.updateDocument(
        this.databaseId,
        this.collections.users,
        id,
        data
      );
      return user as User;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await databases.listDocuments(this.databaseId, this.collections.users);
      return response.documents as User[];
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  }

  // Post methods
  async getPost(id: string): Promise<Post | undefined> {
    try {
      const post = await databases.getDocument(this.databaseId, this.collections.posts, id);
      return post as Post;
    } catch (error) {
      console.error('Error fetching post:', error);
      return undefined;
    }
  }

  async getAllPosts(): Promise<Post[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collections.posts,
        [Query.orderDesc('$createdAt')]
      );
      return response.documents as Post[];
    } catch (error) {
      console.error('Error fetching all posts:', error);
      return [];
    }
  }

  async getPostsByAuthor(authorId: string): Promise<Post[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collections.posts,
        [Query.equal('authorId', authorId), Query.orderDesc('$createdAt')]
      );
      return response.documents as Post[];
    } catch (error) {
      console.error('Error fetching posts by author:', error);
      return [];
    }
  }

  async getPostsWithAuthors(moduleFilter?: string): Promise<PostWithAuthor[]> {
    try {
      let query = [Query.orderDesc('$createdAt')];
      if (moduleFilter) {
        query.push(Query.search('tags', moduleFilter));
      }

      const response = await databases.listDocuments(
        this.databaseId,
        this.collections.posts,
        query
      );

      const posts = response.documents as Post[];

      return await Promise.all(posts.map(async post => {
        const author = await this.getUser(post.authorId);
        return { ...post, author: author! };
      }));
    } catch (error) {
      console.error('Error fetching posts with authors:', error);
      return [];
    }
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    try {
      const post = await databases.createDocument(
        this.databaseId,
        this.collections.posts,
        ID.unique(),
        insertPost
      );
      return post as Post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async updatePost(id: string, data: Partial<Post>): Promise<Post | undefined> {
    try {
      const post = await databases.updateDocument(
        this.databaseId,
        this.collections.posts,
        id,
        data
      );
      return post as Post;
    } catch (error) {
      console.error('Error updating post:', error);
      return undefined;
    }
  }

  async likePost(postId: string, userId: string): Promise<Post | undefined> {
    try {
      const post = await this.getPost(postId);
      if (!post) return undefined;

      // Check if user already liked the post
      const response = await databases.listDocuments(
        this.databaseId,
        this.collections.post_likes,
        [Query.equal('postId', postId), Query.equal('userId', userId)]
      );

      if (response.documents.length > 0) {
        // Unlike: remove like
        await databases.deleteDocument(
          this.databaseId,
          this.collections.post_likes,
          response.documents[0].$id
        );
        const updatedPost = await databases.updateDocument(
          this.databaseId,
          this.collections.posts,
          postId,
          { likesCount: (post.likesCount || 0) - 1 }
        );
        return updatedPost as Post;
      } else {
        // Like: add like
        await databases.createDocument(
          this.databaseId,
          this.collections.post_likes,
          ID.unique(),
          { postId, userId }
        );
        const updatedPost = await databases.updateDocument(
          this.databaseId,
          this.collections.posts,
          postId,
          { likesCount: (post.likesCount || 0) + 1 }
        );
        return updatedPost as Post;
      }
    } catch (error) {
      console.error('Error liking post:', error);
      return undefined;
    }
  }



  // Connection methods
  async getConnection(id: string): Promise<Connection | undefined> {
    try {
      const connection = await databases.getDocument(this.databaseId, this.collections.connections, id);
      return connection as Connection;
    } catch (error) {
      console.error('Error fetching connection:', error);
      return undefined;
    }
  }

  async getConnectionsByUser(userId: string): Promise<Connection[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collections.connections,
        [
          Query.or([
            Query.equal('userId', userId),
            Query.equal('connectedUserId', userId)
          ])
        ]
      );
      return response.documents as Connection[];
    } catch (error) {
      console.error('Error fetching connections by user:', error);
      return [];
    }
  }

  async getConnectedUsers(userId: string): Promise<User[]> {
    try {
      const connections = await this.getConnectionsByUser(userId);
      const acceptedConnections = connections.filter(c => c.status === "accepted");
      const connectedUserIds = acceptedConnections.map(c =>
        c.userId === userId ? c.connectedUserId : c.userId
      );
      const users = await Promise.all(connectedUserIds.map(id => this.getUser(id)));
      return users.filter((u): u is User => u !== undefined);
    } catch (error) {
      console.error('Error fetching connected users:', error);
      return [];
    }
  }

  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    try {
      const connection = await databases.createDocument(
        this.databaseId,
        this.collections.connections,
        ID.unique(),
        insertConnection
      );
      return connection as Connection;
    } catch (error) {
      console.error('Error creating connection:', error);
      throw error;
    }
  }

  async updateConnection(id: string, data: Partial<Connection>): Promise<Connection | undefined> {
    try {
      const connection = await databases.updateDocument(
        this.databaseId,
        this.collections.connections,
        id,
        data
      );
      return connection as Connection;
    } catch (error) {
      console.error('Error updating connection:', error);
      return undefined;
    }
  }

  // Message methods
  async getMessage(id: string): Promise<Message | undefined> {
    try {
      const message = await databases.getDocument(this.databaseId, this.collections.messages, id);
      return message as Message;
    } catch (error) {
      console.error('Error fetching message:', error);
      return undefined;
    }
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collections.messages,
        [Query.equal('conversationId', conversationId), Query.orderAsc('$createdAt')]
      );
      return response.documents as Message[];
    } catch (error) {
      console.error('Error fetching messages by conversation:', error);
      return [];
    }
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    try {
      const message = await databases.createDocument(
        this.databaseId,
        this.collections.messages,
        ID.unique(),
        insertMessage
      );

      // Update conversation's last message time
      await databases.updateDocument(
        this.databaseId,
        this.collections.conversations,
        insertMessage.conversationId,
        { lastMessageAt: insertMessage.createdAt }
      );

      return message as Message;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  // Conversation methods
  async getConversation(id: string): Promise<Conversation | undefined> {
    try {
      const conversation = await databases.getDocument(this.databaseId, this.collections.conversations, id);
      return conversation as Conversation;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return undefined;
    }
  }

  async getConversationsByUser(userId: string): Promise<ConversationWithDetails[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collections.conversations,
        [
          Query.search('participantIds', userId),
          Query.orderDesc('lastMessageAt')
        ]
      );

      const conversations = response.documents as Conversation[];

      return await Promise.all(conversations.map(async conv => {
        const participants = await Promise.all(
          conv.participantIds.map(id => this.getUser(id))
        ).then(users => users.filter((u): u is User => u !== undefined));

        const messages = await this.getMessagesByConversation(conv.id);
        const lastMessage = messages[messages.length - 1];
        const unreadCount = messages.filter(m => !m.isRead && m.receiverId === userId).length;

        return { ...conv, participants, lastMessage, unreadCount };
      }));
    } catch (error) {
      console.error('Error fetching conversations by user:', error);
      return [];
    }
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    try {
      const conversation = await databases.createDocument(
        this.databaseId,
        this.collections.conversations,
        ID.unique(),
        insertConversation
      );
      return conversation as Conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Project methods
  async getProject(id: string): Promise<Project | undefined> {
    try {
      const project = await databases.getDocument(this.databaseId, this.collections.projects, id);
      return project as Project;
    } catch (error) {
      console.error('Error fetching project:', error);
      return undefined;
    }
  }

  async getAllProjects(): Promise<Project[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collections.projects,
        [Query.orderDesc('$createdAt')]
      );
      return response.documents as Project[];
    } catch (error) {
      console.error('Error fetching all projects:', error);
      return [];
    }
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collections.projects,
        [
          Query.or([
            Query.equal('ownerId', userId),
            Query.search('memberIds', userId)
          ]),
          Query.orderDesc('$createdAt')
        ]
      );
      return response.documents as Project[];
    } catch (error) {
      console.error('Error fetching projects by user:', error);
      return [];
    }
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    try {
      const project = await databases.createDocument(
        this.databaseId,
        this.collections.projects,
        ID.unique(),
        insertProject
      );
      return project as Project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project | undefined> {
    try {
      const project = await databases.updateDocument(
        this.databaseId,
        this.collections.projects,
        id,
        data
      );
      return project as Project;
    } catch (error) {
      console.error('Error updating project:', error);
      return undefined;
    }
  }

  // Task methods
  async getTask(id: string): Promise<Task | undefined> {
    try {
      const task = await databases.getDocument(this.databaseId, this.collections.tasks, id);
      return task as Task;
    } catch (error) {
      console.error('Error fetching task:', error);
      return undefined;
    }
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collections.tasks,
        [Query.equal('projectId', projectId)]
      );
      return response.documents as Task[];
    } catch (error) {
      console.error('Error fetching tasks by project:', error);
      return [];
    }
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    try {
      const task = await databases.createDocument(
        this.databaseId,
        this.collections.tasks,
        ID.unique(),
        insertTask
      );
      return task as Task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task | undefined> {
    try {
      const task = await databases.updateDocument(
        this.databaseId,
        this.collections.tasks,
        id,
        data
      );
      return task as Task;
    } catch (error) {
      console.error('Error updating task:', error);
      return undefined;
    }
  }

  // Event methods
  async getEvent(id: string): Promise<Event | undefined> {
    try {
      const event = await databases.getDocument(this.databaseId, this.collections.events, id);
      return event as Event;
    } catch (error) {
      console.error('Error fetching event:', error);
      return undefined;
    }
  }

  async getAllEvents(): Promise<Event[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collections.events,
        [Query.orderAsc('date')]
      );
      return response.documents as Event[];
    } catch (error) {
      console.error('Error fetching all events:', error);
      return [];
    }
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    try {
      const event = await databases.createDocument(
        this.databaseId,
        this.collections.events,
        ID.unique(),
        insertEvent
      );
      return event as Event;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async rsvpEvent(eventId: string, userId: string): Promise<Event | undefined> {
    try {
      const event = await this.getEvent(eventId);
      if (!event) return undefined;

      const attendees = event.attendeeIds || [];
      const newAttendees = attendees.includes(userId)
        ? attendees.filter(id => id !== userId)
        : [...attendees, userId];

      const updatedEvent = await databases.updateDocument(
        this.databaseId,
        this.collections.events,
        eventId,
        { attendeeIds: newAttendees }
      );
      return updatedEvent as Event;
    } catch (error) {
      console.error('Error RSVPing to event:', error);
      return undefined;
    }
  }

  // Saved Items methods
  async getSavedItemsByUser(userId: string): Promise<SavedItem[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collections.saved_items,
        [Query.equal('userId', userId)]
      );
      return response.documents as SavedItem[];
    } catch (error) {
      console.error('Error fetching saved items by user:', error);
      return [];
    }
  }

  async createSavedItem(insertSavedItem: InsertSavedItem): Promise<SavedItem> {
    try {
      const savedItem = await databases.createDocument(
        this.databaseId,
        this.collections.saved_items,
        ID.unique(),
        insertSavedItem
      );
      return savedItem as SavedItem;
    } catch (error) {
      console.error('Error creating saved item:', error);
      throw error;
    }
  }

  async deleteSavedItem(id: string): Promise<void> {
    try {
      await databases.deleteDocument(this.databaseId, this.collections.saved_items, id);
    } catch (error) {
      console.error('Error deleting saved item:', error);
      throw error;
    }
  }

  // Matchmaking
  async getMatches(userId: string): Promise<MatchResult[]> {
    const currentUser = await this.getUser(userId);
    if (!currentUser) return [];

    const allUsers = await this.getAllUsers();
    const otherUsers = allUsers.filter(u => u.id !== userId);

    return otherUsers.map(user => {
      const skillsTheyCanTeach = (user.skillsToShare || []).filter(
        skill => (currentUser.skillsToLearn || []).some(
          learn => learn.toLowerCase() === skill.toLowerCase()
        )
      );

      const skillsYouCanTeach = (currentUser.skillsToShare || []).filter(
        skill => (user.skillsToLearn || []).some(
          learn => learn.toLowerCase() === skill.toLowerCase()
        )
      );

      const matchingSkills = [...new Set([...skillsTheyCanTeach, ...skillsYouCanTeach])];

      // Calculate compatibility score
      const maxPossibleMatches = Math.max(
        (currentUser.skillsToLearn?.length || 0) + (currentUser.skillsToShare?.length || 0),
        1
      );
      const compatibilityScore = Math.min(
        Math.round((matchingSkills.length / maxPossibleMatches) * 100 +
          (user.interests?.some(i => currentUser.interests?.includes(i)) ? 20 : 0)),
        99
      );

      return {
        user,
        compatibilityScore,
        matchingSkills,
        skillsTheyCanTeach,
        skillsYouCanTeach,
      };
    }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }
}

export const storage = new AppwriteStorage();

import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  academicYear: text("academic_year").notNull(),
  department: text("department").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  bannerUrl: text("banner_url"),
  skillsToShare: text("skills_to_share").array(),
  skillsToLearn: text("skills_to_learn").array(),
  interests: text("interests").array(),
  portfolioLinks: text("portfolio_links").array(),
  profileViews: integer("profile_views").default(0),
  connectionsCount: integer("connections_count").default(0),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Posts table
export const posts = pgTable("posts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  authorId: varchar("author_id", { length: 36 }).notNull(),
  content: text("content").notNull(),
  postType: text("post_type").notNull(), // skill_offer, project_invite, workshop, learning_request
  tags: text("tags").array(),
  imageUrl: text("image_url"),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  sharesCount: integer("shares_count").default(0),
  createdAt: text("created_at").notNull(),
});

export const insertPostSchema = createInsertSchema(posts).omit({ id: true });
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

// Connections table
export const connections = pgTable("connections", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  connectedUserId: varchar("connected_user_id", { length: 36 }).notNull(),
  status: text("status").notNull(), // pending, accepted
  createdAt: text("created_at").notNull(),
});

export const insertConnectionSchema = createInsertSchema(connections).omit({ id: true });
export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type Connection = typeof connections.$inferSelect;

// Messages table
export const messages = pgTable("messages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  senderId: varchar("sender_id", { length: 36 }).notNull(),
  receiverId: varchar("receiver_id", { length: 36 }).notNull(),
  conversationId: varchar("conversation_id", { length: 36 }).notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: text("created_at").notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Conversations table
export const conversations = pgTable("conversations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  participantIds: text("participant_ids").array().notNull(),
  isGroup: boolean("is_group").default(false),
  groupName: text("group_name"),
  groupCategory: text("group_category"),
  lastMessageAt: text("last_message_at"),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true });
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Projects table
export const projects = pgTable("projects", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  ownerId: varchar("owner_id", { length: 36 }).notNull(),
  memberIds: text("member_ids").array(),
  status: text("status").notNull(), // active, completed, on_hold
  skillsNeeded: text("skills_needed").array(),
  milestones: text("milestones").array(),
  imageUrl: text("image_url"),
  createdAt: text("created_at").notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id", { length: 36 }).primaryKey(),
  projectId: varchar("project_id", { length: 36 }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  assigneeId: varchar("assignee_id", { length: 36 }),
  isCompleted: boolean("is_completed").default(false),
  dueDate: text("due_date"),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Events table
export const events = pgTable("events", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  organizerId: varchar("organizer_id", { length: 36 }).notNull(),
  eventType: text("event_type").notNull(), // workshop, hackathon, meetup, webinar
  date: text("date").notNull(),
  time: text("time").notNull(),
  location: text("location"),
  imageUrl: text("image_url"),
  attendeeIds: text("attendee_ids").array(),
  maxAttendees: integer("max_attendees"),
});

export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Saved Items table
export const savedItems = pgTable("saved_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  itemType: text("item_type").notNull(), // post, project, event
  itemId: varchar("item_id", { length: 36 }).notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertSavedItemSchema = createInsertSchema(savedItems).omit({ id: true });
export type InsertSavedItem = z.infer<typeof insertSavedItemSchema>;
export type SavedItem = typeof savedItems.$inferSelect;

// Post with author info
export type PostWithAuthor = Post & {
  author: User;
  isLiked?: boolean;
};

// Match result type
export type MatchResult = {
  user: User;
  compatibilityScore: number;
  matchingSkills: string[];
  skillsTheyCanTeach: string[];
  skillsYouCanTeach: string[];
};

// Conversation with participants
export type ConversationWithDetails = Conversation & {
  participants: User[];
  lastMessage?: Message;
  unreadCount?: number;
};

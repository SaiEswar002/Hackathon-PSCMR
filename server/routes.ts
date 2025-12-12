import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { insertUserSchema, insertPostSchema, insertProjectSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Auth routes
  const signupSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(6),
    fullName: z.string().min(1),
    email: z.string().email(),
    academicYear: z.string().min(1),
    department: z.string().min(1),
    bio: z.string().nullish(),
    avatarUrl: z.string().nullish(),
    bannerUrl: z.string().nullish(),
    skillsToShare: z.array(z.string()).default([]),
    skillsToLearn: z.array(z.string()).default([]),
    interests: z.array(z.string()).default([]),
    portfolioLinks: z.array(z.string()).default([]),
  });

  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const parsed = signupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      }

      const existingUser = await storage.getUserByEmail(parsed.data.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

      const user = await storage.createUser({
        username: parsed.data.username || parsed.data.email,
        password: hashedPassword,
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        academicYear: parsed.data.academicYear,
        department: parsed.data.department,
        bio: parsed.data.bio || null,
        avatarUrl: parsed.data.avatarUrl || null,
        bannerUrl: parsed.data.bannerUrl || null,
        skillsToShare: parsed.data.skillsToShare,
        skillsToLearn: parsed.data.skillsToLearn,
        interests: parsed.data.interests,
        portfolioLinks: parsed.data.portfolioLinks,
      });

      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input" });
      }

      const { email, password } = parsed.data;
      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Support both plain text (demo users) and hashed passwords
      const passwordMatch = user.password.startsWith('$2')
        ? await bcrypt.compare(password, user.password)
        : user.password === password;

      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Helper to sanitize user data
  const sanitizeUser = (user: any) => {
    if (!user) return user;
    const { password, ...safe } = user;
    return safe;
  };

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(u => sanitizeUser(u)));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(sanitizeUser(user));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(sanitizeUser(user));
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Posts routes
  app.get("/api/posts", async (req, res) => {
    try {
      const moduleFilter = req.query.selectedModule as string | undefined;
      const posts = await storage.getPostsWithAuthors(moduleFilter);
      res.json(posts.map(p => ({ ...p, author: sanitizeUser(p.author) })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // Debug endpoint to see all posts with tags
  app.get("/api/debug/posts", async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      const postsWithTags = posts.map(p => ({
        id: p.id,
        content: p.content.substring(0, 50) + "...",
        tags: p.tags,
        authorId: p.authorId
      }));
      res.json({
        total: posts.length,
        posts: postsWithTags
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch debug posts" });
    }
  });

  app.get("/api/posts/user/:userId", async (req, res) => {
    try {
      const posts = await storage.getPostsByAuthor(req.params.userId);
      const user = await storage.getUser(req.params.userId);
      if (!user) {
        return res.json([]);
      }
      res.json(posts.map(post => ({ ...post, author: sanitizeUser(user) })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user posts" });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const userId = req.body.authorId || "user-1"; // Default for demo
      const post = await storage.createPost({
        ...req.body,
        authorId: userId,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
      });
      res.status(201).json(post);
    } catch (error) {
      console.error("Create post error:", error);
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  app.post("/api/posts/:id/like", async (req, res) => {
    try {
      const userId = req.body.userId || "user-1";
      const post = await storage.likePost(req.params.id, userId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to like post" });
    }
  });

  // Connections routes
  app.get("/api/connections", async (req, res) => {
    try {
      const userId = req.query.userId as string || "user-1";
      const connections = await storage.getConnectedUsers(userId);
      res.json(connections.map(u => sanitizeUser(u)));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch connections" });
    }
  });

  app.post("/api/connections", async (req, res) => {
    try {
      const userId = req.body.userId || "user-1";
      const connection = await storage.createConnection({
        userId,
        connectedUserId: req.body.connectedUserId,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      res.status(201).json(connection);
    } catch (error) {
      res.status(500).json({ error: "Failed to create connection" });
    }
  });

  // Matches routes
  app.get("/api/matches", async (req, res) => {
    try {
      const userId = req.query.userId as string || "user-1";
      const matches = await storage.getMatches(userId);
      res.json(matches.map(m => ({
        ...m,
        user: sanitizeUser(m.user)
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch matches" });
    }
  });

  // Conversations routes
  app.get("/api/conversations", async (req, res) => {
    try {
      const userId = req.query.userId as string || "user-1";
      const conversations = await storage.getConversationsByUser(userId);
      res.json(conversations.map(c => ({
        ...c,
        participants: c.participants.map(p => sanitizeUser(p))
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const conversation = await storage.createConversation({
        participantIds: req.body.participantIds,
        isGroup: req.body.isGroup || false,
        groupName: req.body.groupName || null,
        groupCategory: req.body.groupCategory || null,
        lastMessageAt: null,
      });
      res.status(201).json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Messages routes
  app.get("/api/messages/:conversationId", async (req, res) => {
    try {
      const messages = await storage.getMessagesByConversation(req.params.conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.body.conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const senderId = req.body.senderId || "user-1";
      const receiverId = conversation.participantIds.find(id => id !== senderId) || "";

      const message = await storage.createMessage({
        senderId,
        receiverId,
        conversationId: req.body.conversationId,
        content: req.body.content,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Projects routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.get("/api/projects/:id/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasksByProject(req.params.id);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const ownerId = req.body.ownerId || "user-1";
      const project = await storage.createProject({
        name: req.body.name,
        description: req.body.description,
        ownerId,
        memberIds: [],
        status: "active",
        skillsNeeded: req.body.skillsNeeded || [],
        milestones: req.body.milestones || [],
        imageUrl: req.body.imageUrl || null,
        createdAt: new Date().toISOString(),
      });
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.updateProject(req.params.id, req.body);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // Tasks routes
  app.post("/api/tasks", async (req, res) => {
    try {
      const task = await storage.createTask({
        projectId: req.body.projectId,
        title: req.body.title,
        description: req.body.description || null,
        assigneeId: req.body.assigneeId || null,
        isCompleted: false,
        dueDate: req.body.dueDate || null,
      });
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.updateTask(req.params.id, req.body);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  // Events routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.post("/api/events/:id/rsvp", async (req, res) => {
    try {
      const userId = req.body.userId || "user-1";
      const event = await storage.rsvpEvent(req.params.id, userId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to RSVP" });
    }
  });

  // Saved items routes
  app.get("/api/saved", async (req, res) => {
    try {
      const userId = req.query.userId as string || "user-1";
      const savedItems = await storage.getSavedItemsByUser(userId);
      res.json(savedItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch saved items" });
    }
  });

  app.post("/api/saved", async (req, res) => {
    try {
      const userId = req.body.userId || "user-1";
      const savedItem = await storage.createSavedItem({
        userId,
        itemType: req.body.itemType,
        itemId: req.body.itemId,
        createdAt: new Date().toISOString(),
      });
      res.status(201).json(savedItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to save item" });
    }
  });

  return httpServer;
}

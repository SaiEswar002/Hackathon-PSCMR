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
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private posts: Map<string, Post>;
  private connections: Map<string, Connection>;
  private messages: Map<string, Message>;
  private conversations: Map<string, Conversation>;
  private projects: Map<string, Project>;
  private tasks: Map<string, Task>;
  private events: Map<string, Event>;
  private savedItems: Map<string, SavedItem>;
  private postLikes: Map<string, Set<string>>;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.connections = new Map();
    this.messages = new Map();
    this.conversations = new Map();
    this.projects = new Map();
    this.tasks = new Map();
    this.events = new Map();
    this.savedItems = new Map();
    this.postLikes = new Map();

    this.seedData();
  }

  private seedData() {
    // Seed demo users
    const demoUsers: User[] = [
      {
        id: "user-1",
        username: "alex@university.edu",
        password: "password123",
        fullName: "Alex Chen",
        email: "alex@university.edu",
        academicYear: "Senior",
        department: "Computer Science",
        bio: "Passionate about AI and machine learning. Love building cool projects!",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        bannerUrl: null,
        skillsToShare: ["python", "machine learning", "tensorflow", "data science"],
        skillsToLearn: ["react", "typescript", "blockchain"],
        interests: ["AI", "startups", "hackathons"],
        portfolioLinks: ["https://github.com/alexchen", "https://linkedin.com/in/alexchen"],
        profileViews: 156,
        connectionsCount: 42,
      },
      {
        id: "user-2",
        username: "sarah@university.edu",
        password: "password123",
        fullName: "Sarah Miller",
        email: "sarah@university.edu",
        academicYear: "Junior",
        department: "Design",
        bio: "UI/UX designer with a passion for creating beautiful and intuitive interfaces.",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
        bannerUrl: null,
        skillsToShare: ["figma", "ui design", "ux research", "prototyping"],
        skillsToLearn: ["react", "css animations", "3d design"],
        interests: ["design systems", "accessibility", "motion design"],
        portfolioLinks: ["https://behance.net/sarahmiller"],
        profileViews: 203,
        connectionsCount: 67,
      },
      {
        id: "user-3",
        username: "james@university.edu",
        password: "password123",
        fullName: "James Wilson",
        email: "james@university.edu",
        academicYear: "Graduate",
        department: "Business",
        bio: "Entrepreneur and startup enthusiast. Building the future of fintech.",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        bannerUrl: null,
        skillsToShare: ["business strategy", "fundraising", "marketing", "pitch decks"],
        skillsToLearn: ["python", "data analytics", "product management"],
        interests: ["fintech", "venture capital", "startups"],
        portfolioLinks: ["https://linkedin.com/in/jameswilson"],
        profileViews: 89,
        connectionsCount: 124,
      },
      {
        id: "user-4",
        username: "maya@university.edu",
        password: "password123",
        fullName: "Maya Patel",
        email: "maya@university.edu",
        academicYear: "Sophomore",
        department: "Computer Science",
        bio: "Full-stack developer passionate about web technologies and open source.",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        bannerUrl: null,
        skillsToShare: ["react", "node.js", "typescript", "mongodb"],
        skillsToLearn: ["machine learning", "kubernetes", "rust"],
        interests: ["open source", "web3", "devops"],
        portfolioLinks: ["https://github.com/mayapatel"],
        profileViews: 78,
        connectionsCount: 35,
      },
    ];

    demoUsers.forEach(user => this.users.set(user.id, user));

    // Seed demo posts with comprehensive coverage of all modules
    const demoPosts: Post[] = [
      // Business Module Posts
      {
        id: "post-business-1",
        authorId: "user-3",
        authorName: "James Wilson",
        authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        content: "🚀 Looking for a business partner to launch a sustainable fashion startup! I have the design skills and market research ready. Need someone with finance/operations expertise. Let's build something impactful together!",
        postType: "project_invite",
        tags: ["business", "startup", "fashion", "sustainability"],
        imageUrl: null,
        likesCount: 34,
        commentsCount: 12,
        sharesCount: 5,
        createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
      },
      {
        id: "post-business-2",
        authorId: "user-1",
        authorName: "Alex Chen",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        content: "📊 Just completed a market analysis on the EdTech sector in India. The growth potential is massive! Happy to share insights with anyone interested in this space. DM me!",
        postType: "skill_offer",
        tags: ["business", "edtech", "market-research"],
        imageUrl: null,
        likesCount: 28,
        commentsCount: 8,
        sharesCount: 4,
        createdAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
      },
      {
        id: "post-business-3",
        authorId: "user-2",
        authorName: "Sarah Miller",
        authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
        content: "💼 Seeking mentorship in business strategy and financial modeling. I'm working on a SaaS product and need guidance on pricing strategies and revenue projections. Any experienced founders willing to help?",
        postType: "learning_request",
        tags: ["business", "saas", "strategy"],
        imageUrl: null,
        likesCount: 19,
        commentsCount: 6,
        sharesCount: 2,
        createdAt: new Date(Date.now() - 4 * 24 * 3600000).toISOString(),
      },

      // Startup Module Posts
      {
        id: "post-startup-1",
        authorId: "user-3",
        authorName: "James Wilson",
        authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        content: "🎯 Our college startup just got accepted into an accelerator program! Looking for 2 developers (React + Node.js) to join our team. Equity-based initially. Building a platform to connect freelancers with local businesses.",
        postType: "project_invite",
        tags: ["startup", "hiring", "react", "nodejs"],
        imageUrl: null,
        likesCount: 45,
        commentsCount: 18,
        sharesCount: 9,
        createdAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
      },
      {
        id: "post-startup-2",
        authorId: "user-1",
        authorName: "Alex Chen",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        content: "💡 Idea validation session this Friday at 4 PM! Bringing together aspiring entrepreneurs to pitch ideas and get feedback. Free pizza 🍕 Location: Innovation Lab. Comment if you're interested!",
        postType: "workshop",
        tags: ["startup", "entrepreneurship", "networking"],
        imageUrl: null,
        likesCount: 67,
        commentsCount: 23,
        sharesCount: 15,
        createdAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
      },
      {
        id: "post-startup-3",
        authorId: "user-4",
        authorName: "Maya Patel",
        authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        content: "📈 Bootstrapped our MVP to 100 users in 2 weeks! Here's what worked: 1) Direct outreach on LinkedIn 2) College WhatsApp groups 3) Solving a real pain point. Happy to share our playbook with fellow founders!",
        postType: "skill_offer",
        tags: ["startup", "growth", "mvp"],
        imageUrl: null,
        likesCount: 52,
        commentsCount: 15,
        sharesCount: 11,
        createdAt: new Date(Date.now() - 6 * 24 * 3600000).toISOString(),
      },

      // Coding Module Posts
      {
        id: "post-coding-1",
        authorId: "user-4",
        authorName: "Maya Patel",
        authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        content: "⚡ Built a real-time collaborative code editor using WebSockets and Monaco Editor! Check out the demo. Open source and looking for contributors. Tech stack: React, Node.js, Socket.io",
        postType: "project_invite",
        tags: ["coding", "webdev", "opensource", "react"],
        imageUrl: null,
        likesCount: 38,
        commentsCount: 14,
        sharesCount: 7,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: "post-coding-2",
        authorId: "user-1",
        authorName: "Alex Chen",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        content: "🐍 Hosting a Python workshop next week covering: Data structures, Algorithms, and LeetCode problem-solving strategies. Perfect for placement prep! Limited seats. Register in comments 👇",
        postType: "workshop",
        tags: ["coding", "python", "algorithms", "placements"],
        imageUrl: null,
        likesCount: 61,
        commentsCount: 27,
        sharesCount: 13,
        createdAt: new Date(Date.now() - 14400000).toISOString(),
      },
      {
        id: "post-coding-3",
        authorId: "user-2",
        authorName: "Sarah Miller",
        authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
        content: "🔥 Just solved a tricky system design problem: Designing Instagram's feed. Key learnings: Fanout on write vs read, caching strategies, and database sharding. Want to discuss more system design concepts!",
        postType: "skill_offer",
        tags: ["coding", "system-design", "backend"],
        imageUrl: null,
        likesCount: 42,
        commentsCount: 11,
        sharesCount: 6,
        createdAt: new Date(Date.now() - 21600000).toISOString(),
      },
      {
        id: "post-coding-4",
        authorId: "user-3",
        authorName: "James Wilson",
        authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        content: "💻 Looking for someone experienced in Docker and Kubernetes to help me containerize my application. Can offer frontend development skills in exchange!",
        postType: "learning_request",
        tags: ["coding", "devops", "docker", "kubernetes"],
        imageUrl: null,
        likesCount: 24,
        commentsCount: 9,
        sharesCount: 3,
        createdAt: new Date(Date.now() - 28800000).toISOString(),
      },

      // Design Module Posts
      {
        id: "post-design-1",
        authorId: "user-2",
        authorName: "Sarah Miller",
        authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
        content: "🎨 Redesigned our college fest website with a dark mode and glassmorphism effects! Figma file available for anyone who wants to learn. Also happy to review your designs!",
        postType: "skill_offer",
        tags: ["design", "ui-ux", "figma", "webdesign"],
        imageUrl: null,
        likesCount: 48,
        commentsCount: 16,
        sharesCount: 8,
        createdAt: new Date(Date.now() - 36000000).toISOString(),
      },
      {
        id: "post-design-2",
        authorId: "user-1",
        authorName: "Alex Chen",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        content: "✨ UI/UX Design Challenge: Design a mobile app for campus food delivery in 48 hours! Prizes for top 3 designs. Theme: Minimalist & Fast. Deadline: Sunday midnight. Drop your Behance links!",
        postType: "workshop",
        tags: ["design", "ui-ux", "challenge", "mobile"],
        imageUrl: null,
        likesCount: 55,
        commentsCount: 21,
        sharesCount: 12,
        createdAt: new Date(Date.now() - 43200000).toISOString(),
      },
      {
        id: "post-design-3",
        authorId: "user-3",
        authorName: "James Wilson",
        authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        content: "🖌️ Need a graphic designer for our startup's branding - logo, color palette, and social media templates. It's a paid opportunity! Experience with brand identity preferred. Portfolio required.",
        postType: "project_invite",
        tags: ["design", "branding", "graphics", "startup"],
        imageUrl: null,
        likesCount: 31,
        commentsCount: 13,
        sharesCount: 5,
        createdAt: new Date(Date.now() - 50400000).toISOString(),
      },

      // Marketing Module Posts
      {
        id: "post-marketing-1",
        authorId: "user-4",
        authorName: "Maya Patel",
        authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        content: "📱 Grew our Instagram page from 0 to 5K followers in 3 months using these strategies: Reels consistency, trending audio, and engagement pods. AMA about social media marketing!",
        postType: "skill_offer",
        tags: ["marketing", "social-media", "instagram", "growth"],
        imageUrl: null,
        likesCount: 64,
        commentsCount: 28,
        sharesCount: 16,
        createdAt: new Date(Date.now() - 57600000).toISOString(),
      },
      {
        id: "post-marketing-2",
        authorId: "user-3",
        authorName: "James Wilson",
        authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        content: "🎯 Looking for a marketing co-founder for my EdTech startup. Need someone who understands content marketing, SEO, and community building. Let's scale together!",
        postType: "project_invite",
        tags: ["marketing", "startup", "edtech", "content"],
        imageUrl: null,
        likesCount: 37,
        commentsCount: 15,
        sharesCount: 7,
        createdAt: new Date(Date.now() - 64800000).toISOString(),
      },
      {
        id: "post-marketing-3",
        authorId: "user-2",
        authorName: "Sarah Miller",
        authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
        content: "📊 Free workshop on Google Analytics 4 and conversion tracking this Saturday! Learn how to measure campaign performance and optimize your marketing funnel. Zoom link in bio.",
        postType: "workshop",
        tags: ["marketing", "analytics", "google-analytics"],
        imageUrl: null,
        likesCount: 43,
        commentsCount: 17,
        sharesCount: 9,
        createdAt: new Date(Date.now() - 72000000).toISOString(),
      },

      // AI/ML Module Posts
      {
        id: "post-aiml-1",
        authorId: "user-1",
        authorName: "Alex Chen",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        content: "🤖 Built a sentiment analysis model that achieved 94% accuracy on Twitter data! Used BERT and fine-tuned it on Indian English. Code on GitHub. Looking for collaborators to deploy it as an API!",
        postType: "project_invite",
        tags: ["aiml", "nlp", "machine-learning", "bert"],
        imageUrl: null,
        likesCount: 58,
        commentsCount: 22,
        sharesCount: 14,
        createdAt: new Date(Date.now() - 79200000).toISOString(),
      },
      {
        id: "post-aiml-2",
        authorId: "user-3",
        authorName: "James Wilson",
        authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        content: "🧠 Study group for Andrew Ng's Deep Learning Specialization starting next week! We'll meet twice a week to discuss concepts and work on projects together. Comment if interested!",
        postType: "learning_request",
        tags: ["aiml", "deep-learning", "study-group"],
        imageUrl: null,
        likesCount: 71,
        commentsCount: 31,
        sharesCount: 18,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "post-aiml-3",
        authorId: "user-4",
        authorName: "Maya Patel",
        authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        content: "⚡ Just deployed a computer vision model that detects potholes in real-time using YOLOv8! Accuracy: 89%. Planning to pitch this to the municipal corporation. Need help with the business proposal!",
        postType: "skill_offer",
        tags: ["aiml", "computer-vision", "yolo", "social-impact"],
        imageUrl: null,
        likesCount: 49,
        commentsCount: 19,
        sharesCount: 10,
        createdAt: new Date(Date.now() - 93600000).toISOString(),
      },
      {
        id: "post-aiml-4",
        authorId: "user-2",
        authorName: "Sarah Miller",
        authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
        content: "🔬 Hosting a Kaggle competition walkthrough session - I'll explain my approach to the Titanic dataset that got me in the top 10%. Covers feature engineering, ensemble methods, and hyperparameter tuning.",
        postType: "workshop",
        tags: ["aiml", "kaggle", "data-science", "machine-learning"],
        imageUrl: null,
        likesCount: 66,
        commentsCount: 25,
        sharesCount: 15,
        createdAt: new Date(Date.now() - 100800000).toISOString(),
      },
    ];

    demoPosts.forEach(post => this.posts.set(post.id, post));

    // Seed demo events
    const demoEvents: Event[] = [
      {
        id: "event-1",
        title: "AI/ML Hackathon 2024",
        description: "48-hour hackathon focused on building innovative AI/ML solutions. Form teams, build projects, and compete for prizes!",
        organizerId: "user-1",
        eventType: "hackathon",
        date: new Date(Date.now() + 7 * 24 * 3600000).toISOString().split("T")[0],
        time: "9:00 AM",
        location: "Engineering Building, Room 301",
        imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=400&fit=crop",
        attendeeIds: ["user-2", "user-4"],
        maxAttendees: 100,
      },
      {
        id: "event-2",
        title: "Design Systems Workshop",
        description: "Learn how to build and maintain scalable design systems. We'll cover component libraries, tokens, and documentation.",
        organizerId: "user-2",
        eventType: "workshop",
        date: new Date(Date.now() + 3 * 24 * 3600000).toISOString().split("T")[0],
        time: "2:00 PM",
        location: "Online (Zoom)",
        imageUrl: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&h=400&fit=crop",
        attendeeIds: ["user-1", "user-4"],
        maxAttendees: 50,
      },
      {
        id: "event-3",
        title: "Startup Founders Meetup",
        description: "Monthly meetup for aspiring and current founders. Network, share experiences, and learn from each other.",
        organizerId: "user-3",
        eventType: "meetup",
        date: new Date(Date.now() + 5 * 24 * 3600000).toISOString().split("T")[0],
        time: "6:00 PM",
        location: "Campus Coffee House",
        imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop",
        attendeeIds: ["user-1"],
        maxAttendees: 30,
      },
    ];

    demoEvents.forEach(event => this.events.set(event.id, event));

    // Seed demo projects
    const demoProjects: Project[] = [
      {
        id: "project-1",
        name: "AI Study Buddy",
        description: "An AI-powered study assistant that helps students learn more effectively using personalized recommendations.",
        ownerId: "user-1",
        memberIds: ["user-4"],
        status: "active",
        skillsNeeded: ["react", "python", "machine learning"],
        milestones: ["Research", "MVP", "Beta", "Launch"],
        imageUrl: null,
        createdAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
      },
      {
        id: "project-2",
        name: "Campus Connect App",
        description: "Mobile app to help students find study groups, events, and connect with peers based on their interests.",
        ownerId: "user-2",
        memberIds: ["user-1", "user-3"],
        status: "active",
        skillsNeeded: ["react native", "ui design", "node.js"],
        milestones: ["Design", "Development", "Testing", "Launch"],
        imageUrl: null,
        createdAt: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
      },
    ];

    demoProjects.forEach(project => this.projects.set(project.id, project));

    // Seed demo tasks
    const demoTasks: Task[] = [
      { id: "task-1", projectId: "project-1", title: "Set up project repository", description: null, assigneeId: "user-1", isCompleted: true, dueDate: null },
      { id: "task-2", projectId: "project-1", title: "Design system architecture", description: null, assigneeId: "user-1", isCompleted: true, dueDate: null },
      { id: "task-3", projectId: "project-1", title: "Build recommendation engine", description: null, assigneeId: "user-1", isCompleted: false, dueDate: null },
      { id: "task-4", projectId: "project-1", title: "Create frontend UI", description: null, assigneeId: "user-4", isCompleted: false, dueDate: null },
    ];

    demoTasks.forEach(task => this.tasks.set(task.id, task));

    // Seed demo connections
    const demoConnections: Connection[] = [
      { id: "conn-1", userId: "user-1", connectedUserId: "user-2", status: "accepted", createdAt: new Date().toISOString() },
      { id: "conn-2", userId: "user-1", connectedUserId: "user-4", status: "accepted", createdAt: new Date().toISOString() },
      { id: "conn-3", userId: "user-2", connectedUserId: "user-3", status: "accepted", createdAt: new Date().toISOString() },
    ];

    demoConnections.forEach(conn => this.connections.set(conn.id, conn));

    // Seed demo conversations
    const demoConversations: Conversation[] = [
      { id: "conv-1", participantIds: ["user-1", "user-2"], isGroup: false, groupName: null, groupCategory: null, lastMessageAt: new Date().toISOString() },
      { id: "conv-2", participantIds: ["user-1", "user-4"], isGroup: false, groupName: null, groupCategory: null, lastMessageAt: new Date(Date.now() - 3600000).toISOString() },
    ];

    demoConversations.forEach(conv => this.conversations.set(conv.id, conv));

    // Seed demo messages
    const demoMessages: Message[] = [
      { id: "msg-1", senderId: "user-2", receiverId: "user-1", conversationId: "conv-1", content: "Hey! I saw your post about the ML project. I'd love to help with the design!", isRead: true, createdAt: new Date(Date.now() - 7200000).toISOString() },
      { id: "msg-2", senderId: "user-1", receiverId: "user-2", conversationId: "conv-1", content: "That would be awesome! When are you free to discuss?", isRead: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: "msg-3", senderId: "user-2", receiverId: "user-1", conversationId: "conv-1", content: "How about tomorrow afternoon? We could meet at the library.", isRead: false, createdAt: new Date().toISOString() },
    ];

    demoMessages.forEach(msg => this.messages.set(msg.id, msg));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      profileViews: 0,
      connectionsCount: 0,
    } as any;
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Post methods
  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getAllPosts(): Promise<Post[]> {
    return Array.from(this.posts.values()).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getPostsByAuthor(authorId: string): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.authorId === authorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getPostsWithAuthors(moduleFilter?: string): Promise<PostWithAuthor[]> {
    let posts = await this.getAllPosts();

    // Filter by module if specified
    if (moduleFilter) {
      posts = posts.filter(post =>
        post.tags?.some(tag => tag.toLowerCase() === moduleFilter.toLowerCase())
      );
    }

    return Promise.all(posts.map(async post => {
      const author = await this.getUser(post.authorId);
      return { ...post, author: author! };
    }));
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const post: Post = { ...insertPost, id } as any;
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: string, data: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    const updated = { ...post, ...data };
    this.posts.set(id, updated);
    return updated;
  }

  async likePost(postId: string, userId: string): Promise<Post | undefined> {
    const post = this.posts.get(postId);
    if (!post) return undefined;

    if (!this.postLikes.has(postId)) {
      this.postLikes.set(postId, new Set());
    }
    const likes = this.postLikes.get(postId)!;

    if (likes.has(userId)) {
      likes.delete(userId);
      post.likesCount = (post.likesCount || 0) - 1;
    } else {
      likes.add(userId);
      post.likesCount = (post.likesCount || 0) + 1;
    }

    this.posts.set(postId, post);
    return post;
  }

  // Connection methods
  async getConnection(id: string): Promise<Connection | undefined> {
    return this.connections.get(id);
  }

  async getConnectionsByUser(userId: string): Promise<Connection[]> {
    return Array.from(this.connections.values()).filter(
      conn => conn.userId === userId || conn.connectedUserId === userId
    );
  }

  async getConnectedUsers(userId: string): Promise<User[]> {
    const connections = await this.getConnectionsByUser(userId);
    const acceptedConnections = connections.filter(c => c.status === "accepted");
    const connectedUserIds = acceptedConnections.map(c =>
      c.userId === userId ? c.connectedUserId : c.userId
    );
    return Promise.all(connectedUserIds.map(id => this.getUser(id))).then(users =>
      users.filter((u): u is User => u !== undefined)
    );
  }

  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    const id = randomUUID();
    const connection: Connection = { ...insertConnection, id } as any;
    this.connections.set(id, connection);
    return connection;
  }

  async updateConnection(id: string, data: Partial<Connection>): Promise<Connection | undefined> {
    const connection = this.connections.get(id);
    if (!connection) return undefined;
    const updated = { ...connection, ...data };
    this.connections.set(id, updated);
    return updated;
  }

  // Message methods
  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { ...insertMessage, id } as any;
    this.messages.set(id, message);

    // Update conversation's last message time
    const conversation = this.conversations.get(insertMessage.conversationId);
    if (conversation) {
      conversation.lastMessageAt = insertMessage.createdAt;
      this.conversations.set(conversation.id, conversation);
    }

    return message;
  }

  // Conversation methods
  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationsByUser(userId: string): Promise<ConversationWithDetails[]> {
    const conversations = Array.from(this.conversations.values())
      .filter(conv => conv.participantIds.includes(userId))
      .sort((a, b) => {
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bTime - aTime;
      });

    return Promise.all(conversations.map(async conv => {
      const participants = await Promise.all(
        conv.participantIds.map(id => this.getUser(id))
      ).then(users => users.filter((u): u is User => u !== undefined));

      const messages = await this.getMessagesByConversation(conv.id);
      const lastMessage = messages[messages.length - 1];
      const unreadCount = messages.filter(m => !m.isRead && m.receiverId === userId).length;

      return { ...conv, participants, lastMessage, unreadCount };
    }));
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = { ...insertConversation, id } as any;
    this.conversations.set(id, conversation);
    return conversation;
  }

  // Project methods
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      project => project.ownerId === userId || project.memberIds?.includes(userId)
    );
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = { ...insertProject, id } as any;
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    const updated = { ...project, ...data };
    this.projects.set(id, updated);
    return updated;
  }

  // Task methods
  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.projectId === projectId);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = { ...insertTask, id } as any;
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    const updated = { ...task, ...data };
    this.tasks.set(id, updated);
    return updated;
  }

  // Event methods
  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = { ...insertEvent, id } as any;
    this.events.set(id, event);
    return event;
  }

  async rsvpEvent(eventId: string, userId: string): Promise<Event | undefined> {
    const event = this.events.get(eventId);
    if (!event) return undefined;

    const attendees = event.attendeeIds || [];
    if (attendees.includes(userId)) {
      event.attendeeIds = attendees.filter(id => id !== userId);
    } else {
      event.attendeeIds = [...attendees, userId];
    }

    this.events.set(eventId, event);
    return event;
  }

  // Saved Items methods
  async getSavedItemsByUser(userId: string): Promise<SavedItem[]> {
    return Array.from(this.savedItems.values()).filter(item => item.userId === userId);
  }

  async createSavedItem(insertSavedItem: InsertSavedItem): Promise<SavedItem> {
    const id = randomUUID();
    const savedItem: SavedItem = { ...insertSavedItem, id } as any;
    this.savedItems.set(id, savedItem);
    return savedItem;
  }

  async deleteSavedItem(id: string): Promise<void> {
    this.savedItems.delete(id);
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

export const storage = new MemStorage();

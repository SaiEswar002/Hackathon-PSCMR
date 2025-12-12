import { storage } from "./storage";

/**
 * Seed script to populate the database with sample posts for different modules
 * Run with: tsx server/seed-posts.ts
 */

const samplePosts = [
    // Business Module Posts
    {
        content: "🚀 Looking for a business partner to launch a sustainable fashion startup! I have the design skills and market research ready. Need someone with finance/operations expertise. Let's build something impactful together!",
        postType: "project_invite",
        tags: ["business", "startup", "fashion", "sustainability"],
        authorId: "user-1",
    },
    {
        content: "📊 Just completed a market analysis on the EdTech sector in India. The growth potential is massive! Happy to share insights with anyone interested in this space. DM me!",
        postType: "skill_offer",
        tags: ["business", "edtech", "market-research"],
        authorId: "user-2",
    },
    {
        content: "💼 Seeking mentorship in business strategy and financial modeling. I'm working on a SaaS product and need guidance on pricing strategies and revenue projections. Any experienced founders willing to help?",
        postType: "learning_request",
        tags: ["business", "saas", "strategy"],
        authorId: "user-3",
    },

    // Startup Module Posts
    {
        content: "🎯 Our college startup just got accepted into an accelerator program! Looking for 2 developers (React + Node.js) to join our team. Equity-based initially. Building a platform to connect freelancers with local businesses.",
        postType: "project_invite",
        tags: ["startup", "hiring", "react", "nodejs"],
        authorId: "user-1",
    },
    {
        content: "💡 Idea validation session this Friday at 4 PM! Bringing together aspiring entrepreneurs to pitch ideas and get feedback. Free pizza 🍕 Location: Innovation Lab. Comment if you're interested!",
        postType: "workshop",
        tags: ["startup", "entrepreneurship", "networking"],
        authorId: "user-2",
    },
    {
        content: "📈 Bootstrapped our MVP to 100 users in 2 weeks! Here's what worked: 1) Direct outreach on LinkedIn 2) College WhatsApp groups 3) Solving a real pain point. Happy to share our playbook with fellow founders!",
        postType: "skill_offer",
        tags: ["startup", "growth", "mvp"],
        authorId: "user-4",
    },

    // Coding Module Posts
    {
        content: "⚡ Built a real-time collaborative code editor using WebSockets and Monaco Editor! Check out the demo: [link]. Open source and looking for contributors. Tech stack: React, Node.js, Socket.io",
        postType: "project_invite",
        tags: ["coding", "webdev", "opensource", "react"],
        authorId: "user-3",
    },
    {
        content: "🐍 Hosting a Python workshop next week covering: Data structures, Algorithms, and LeetCode problem-solving strategies. Perfect for placement prep! Limited seats. Register in comments 👇",
        postType: "workshop",
        tags: ["coding", "python", "algorithms", "placements"],
        authorId: "user-1",
    },
    {
        content: "🔥 Just solved a tricky system design problem: Designing Instagram's feed. Key learnings: Fanout on write vs read, caching strategies, and database sharding. Want to discuss more system design concepts!",
        postType: "skill_offer",
        tags: ["coding", "system-design", "backend"],
        authorId: "user-2",
    },
    {
        content: "💻 Looking for someone experienced in Docker and Kubernetes to help me containerize my application. Can offer frontend development skills in exchange!",
        postType: "learning_request",
        tags: ["coding", "devops", "docker", "kubernetes"],
        authorId: "user-4",
    },

    // Design Module Posts
    {
        content: "🎨 Redesigned our college fest website with a dark mode and glassmorphism effects! Figma file available for anyone who wants to learn. Also happy to review your designs!",
        postType: "skill_offer",
        tags: ["design", "ui-ux", "figma", "webdesign"],
        authorId: "user-2",
    },
    {
        content: "✨ UI/UX Design Challenge: Design a mobile app for campus food delivery in 48 hours! Prizes for top 3 designs. Theme: Minimalist & Fast. Deadline: Sunday midnight. Drop your Behance links!",
        postType: "workshop",
        tags: ["design", "ui-ux", "challenge", "mobile"],
        authorId: "user-1",
    },
    {
        content: "🖌️ Need a graphic designer for our startup's branding - logo, color palette, and social media templates. It's a paid opportunity! Experience with brand identity preferred. Portfolio required.",
        postType: "project_invite",
        tags: ["design", "branding", "graphics", "startup"],
        authorId: "user-3",
    },

    // Marketing Module Posts
    {
        content: "📱 Grew our Instagram page from 0 to 5K followers in 3 months using these strategies: Reels consistency, trending audio, and engagement pods. AMA about social media marketing!",
        postType: "skill_offer",
        tags: ["marketing", "social-media", "instagram", "growth"],
        authorId: "user-4",
    },
    {
        content: "🎯 Looking for a marketing co-founder for my EdTech startup. Need someone who understands content marketing, SEO, and community building. Let's scale together!",
        postType: "project_invite",
        tags: ["marketing", "startup", "edtech", "content"],
        authorId: "user-1",
    },
    {
        content: "📊 Free workshop on Google Analytics 4 and conversion tracking this Saturday! Learn how to measure campaign performance and optimize your marketing funnel. Zoom link in bio.",
        postType: "workshop",
        tags: ["marketing", "analytics", "google-analytics"],
        authorId: "user-2",
    },

    // AI/ML Module Posts
    {
        content: "🤖 Built a sentiment analysis model that achieved 94% accuracy on Twitter data! Used BERT and fine-tuned it on Indian English. Code on GitHub. Looking for collaborators to deploy it as an API!",
        postType: "project_invite",
        tags: ["aiml", "nlp", "machine-learning", "bert"],
        authorId: "user-3",
    },
    {
        content: "🧠 Study group for Andrew Ng's Deep Learning Specialization starting next week! We'll meet twice a week to discuss concepts and work on projects together. Comment if interested!",
        postType: "learning_request",
        tags: ["aiml", "deep-learning", "study-group"],
        authorId: "user-1",
    },
    {
        content: "⚡ Just deployed a computer vision model that detects potholes in real-time using YOLOv8! Accuracy: 89%. Planning to pitch this to the municipal corporation. Need help with the business proposal!",
        postType: "skill_offer",
        tags: ["aiml", "computer-vision", "yolo", "social-impact"],
        authorId: "user-4",
    },
    {
        content: "🔬 Hosting a Kaggle competition walkthrough session - I'll explain my approach to the Titanic dataset that got me in the top 10%. Covers feature engineering, ensemble methods, and hyperparameter tuning.",
        postType: "workshop",
        tags: ["aiml", "kaggle", "data-science", "machine-learning"],
        authorId: "user-2",
    },
];

async function seedPosts() {
    console.log("🌱 Starting to seed posts...");

    try {
        // Get all existing users to use as authors
        const users = await storage.getAllUsers();
        console.log(`Found ${users.length} users in database`);

        if (users.length === 0) {
            console.error("❌ No users found! Please create users first.");
            return;
        }

        // Create posts
        let createdCount = 0;
        for (const postData of samplePosts) {
            // Use a random user if the specified author doesn't exist
            const authorExists = users.find(u => u.id === postData.authorId);
            const authorId = authorExists ? postData.authorId : users[Math.floor(Math.random() * users.length)].id;

            const post = await storage.createPost({
                ...postData,
                authorId,
                createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random time in last 7 days
                likesCount: Math.floor(Math.random() * 50),
                commentsCount: Math.floor(Math.random() * 20),
                sharesCount: Math.floor(Math.random() * 10),
                imageUrl: null,
            });

            createdCount++;
            console.log(`✅ Created post ${createdCount}/${samplePosts.length}: "${post.content.substring(0, 50)}..."`);
        }

        console.log(`\n🎉 Successfully seeded ${createdCount} posts!`);
        console.log("\nPosts by module:");
        console.log("- Business: 3 posts");
        console.log("- Startup: 3 posts");
        console.log("- Coding: 4 posts");
        console.log("- Design: 3 posts");
        console.log("- Marketing: 3 posts");
        console.log("- AI/ML: 4 posts");

    } catch (error) {
        console.error("❌ Error seeding posts:", error);
        throw error;
    }
}

// Run the seed function
seedPosts()
    .then(() => {
        console.log("\n✨ Seeding complete!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n💥 Seeding failed:", error);
        process.exit(1);
    });

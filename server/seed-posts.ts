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
    {
        content: "💰 Looking for investors for my fintech startup! We've built a UPI-based payment solution for small businesses. Seeking ₹10L seed funding. Have traction with 50+ merchants. Pitch deck ready!",
        postType: "project_invite",
        tags: ["business", "fintech", "investment", "startup"],
        authorId: "user-4",
    },
    {
        content: "📈 Business Development opportunity: Help me expand my e-commerce platform to 5 new cities. Commission-based role with potential for equity. Need someone with sales experience and local network.",
        postType: "project_invite",
        tags: ["business", "ecommerce", "sales", "expansion"],
        authorId: "user-1",
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
    {
        content: "🚀 Pre-seed funding secured! $50K for our AI-powered study platform. Looking for a technical co-founder with ML experience. 20% equity + competitive salary. YC alumni preferred.",
        postType: "project_invite",
        tags: ["startup", "funding", "ai", "edtech"],
        authorId: "user-3",
    },
    {
        content: "💪 Building a habit-tracking app for students. MVP ready, need marketing and design help. Currently at 500 downloads. Let's turn this into a unicorn! DM for equity discussion.",
        postType: "project_invite",
        tags: ["startup", "productivity", "mobile-app", "growth"],
        authorId: "user-1",
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
    {
        content: "🚀 Full-stack developer needed for our fintech app! Tech: React, TypeScript, Node.js, PostgreSQL. 6-month internship with stipend. Remote work possible. Send portfolio!",
        postType: "project_invite",
        tags: ["coding", "fullstack", "react", "typescript"],
        authorId: "user-1",
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
    {
        content: "🎯 Motion graphics designer wanted! Creating explainer videos for our EdTech platform. Need someone proficient in After Effects and Premiere. 3-month project with ₹50K budget. Send reel!",
        postType: "project_invite",
        tags: ["design", "motion-graphics", "video", "after-effects"],
        authorId: "user-4",
    },
    {
        content: "📱 Mobile UI/UX workshop this weekend! Learn design systems, prototyping in Figma, and user research methods. Perfect for beginners. ₹500 entry. Includes design kit and mentorship session.",
        postType: "workshop",
        tags: ["design", "mobile", "figma", "prototyping"],
        authorId: "user-2",
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
    {
        content: "🚀 Digital marketing intern needed! 3-month program covering SEO, SEM, social media, and email marketing. ₹15K stipend + performance bonus. Apply with portfolio and LinkedIn profile.",
        postType: "project_invite",
        tags: ["marketing", "digital-marketing", "internship", "seo"],
        authorId: "user-3",
    },
    {
        content: "💡 Content creation masterclass! Learn copywriting, video scripting, and social media content strategy. Real case studies from brands like Swiggy and Zomato. ₹2000 for 2-day workshop.",
        postType: "workshop",
        tags: ["marketing", "content-creation", "copywriting", "social-media"],
        authorId: "user-4",
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
    {
        content: "🤖 ML Engineer wanted for our healthcare startup! Building AI models for medical diagnosis. Experience with TensorFlow/PyTorch required. Competitive salary + equity. Remote possible. Send resume!",
        postType: "project_invite",
        tags: ["aiml", "machine-learning", "tensorflow", "healthcare"],
        authorId: "user-3",
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
            const selectedAuthor = authorExists || users[Math.floor(Math.random() * users.length)];
            const authorId = selectedAuthor.id;

            const post = await storage.createPost({
                ...postData,
                authorId,
                authorName: selectedAuthor.fullName,
                authorAvatar: selectedAuthor.avatarUrl,
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
        console.log("- Business: 5 posts");
        console.log("- Startup: 5 posts");
        console.log("- Coding: 5 posts");
        console.log("- Design: 5 posts");
        console.log("- Marketing: 5 posts");
        console.log("- AI/ML: 5 posts");

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

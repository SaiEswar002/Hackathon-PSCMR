# 🎓 SSM - Student Skill Matchmaking Platform

A modern social networking platform designed for students to connect, collaborate, and learn from each other through skill-sharing and project collaboration.

![Platform](https://img.shields.io/badge/Platform-Web-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)

## ✨ Features

### 🤝 Smart Skill Matching
- AI-powered matching algorithm based on complementary skills
- Find mentors and mentees in your network
- Compatibility scoring system

### 📱 Social Feed
- LinkedIn-style professional networking
- Share skills, projects, and opportunities
- Like, comment, and engage with posts

### 💼 Project Collaboration
- Create and manage collaborative projects
- Task management and milestone tracking
- Team formation based on required skills

### 💬 Real-time Messaging
- Direct messaging with peers
- Group conversations
- Skill-based discussion groups

### 📅 Events & Workshops
- Discover hackathons and workshops
- RSVP and calendar integration
- Skill-building event recommendations

### 👤 Rich Profiles
- Showcase skills to share and learn
- Portfolio integration
- Academic and project history

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - Premium component library
- **TanStack Query** - Data fetching and caching
- **Framer Motion** - Smooth animations
- **Wouter** - Lightweight routing

### Backend
- **Express.js** - REST API server
- **TypeScript** - Type-safe backend
- **bcrypt** - Secure password hashing
- **WebSocket** - Real-time communication

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- [Appwrite Cloud](https://cloud.appwrite.io/) account (for backend)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/SaiEswar002/Hackathon-PSCMR.git
   cd Skill-Matcher
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your Appwrite credentials:
   ```env
   # Appwrite Configuration
   VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your_project_id
   VITE_APPWRITE_DATABASE_ID=your_database_id
   
   # Collection IDs
   VITE_APPWRITE_USERS_COLLECTION_ID=users
   VITE_APPWRITE_POSTS_COLLECTION_ID=posts
   # ... (see .env.example for complete list)
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   This starts both the frontend (Vite) and backend (Express) servers:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Production Deployment

For detailed deployment instructions to Vercel and Appwrite Cloud, see **[DEPLOYMENT.md](DEPLOYMENT.md)**.

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (frontend + backend) |
| `npm run build` | Build frontend for production |
| `npm start` | Run production server |
| `npm run check` | Type check with TypeScript |
| `npm run db:push` | Push database schema changes |

### Development Commands

```bash
# Start only frontend dev server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Type checking
npm run check
```

## 📁 Project Structure

```
Skill-Matcher/
├── client/                 # Frontend React application
│   └── src/
│       ├── pages/         # Route pages (Dashboard, Network, etc.)
│       ├── components/    # Reusable UI components
│       ├── hooks/         # Custom React hooks
│       └── lib/           # Utilities and helpers
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API endpoints
│   ├── storage.ts        # Data management
│   └── vite.ts           # Vite integration
├── shared/               # Shared types and schemas
└── design_guidelines.md  # Design system documentation
```

## 🎨 Design System

The platform follows a modern, professional design inspired by LinkedIn and Instagram:

- **Color Palette**: Primary blue (#2563eb) with gradient accents
- **Layout**: Three-column dashboard (sidebar, feed, sidebar)
- **Typography**: Inter/Outfit fonts via Google Fonts
- **Components**: Card-based UI with subtle shadows and smooth transitions
- **Responsive**: Mobile-first design approach

See [design_guidelines.md](design_guidelines.md) for complete design specifications.

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user profile

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `POST /api/posts/:id/like` - Like a post

### Connections
- `GET /api/connections` - Get user connections
- `POST /api/connections` - Send connection request

### Matches
- `GET /api/matches` - Get skill-based recommendations

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id/tasks` - Get project tasks

### Events
- `GET /api/events` - Get all events
- `POST /api/events/:id/rsvp` - RSVP to event

### Messages
- `GET /api/conversations` - Get user conversations
- `POST /api/messages` - Send message

## 🎯 Use Cases

1. **Find a Mentor** - Search for students who can teach skills you want to learn
2. **Form Teams** - Create projects and get matched with teammates
3. **Share Knowledge** - Post about your expertise and help others
4. **Join Events** - Discover and attend skill-building workshops
5. **Build Network** - Connect with peers in your academic community

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Developed for PSCMR Hackathon

## 🙏 Acknowledgments

- Design inspired by LinkedIn and Instagram
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Built with ❤️ for student collaboration**

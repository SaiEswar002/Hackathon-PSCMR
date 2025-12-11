# 🚀 Deployment Guide - SSM Platform

This guide provides step-by-step instructions for deploying the SSM (Student Skill Matchmaking) platform to production.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Appwrite Cloud Setup](#appwrite-cloud-setup)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)
- [Post-Deployment Configuration](#post-deployment-configuration)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ [Appwrite Cloud](https://cloud.appwrite.io/) account
- ✅ [Vercel](https://vercel.com/) account
- ✅ Git repository with your code
- ✅ Node.js 18+ installed locally

---

## 🔧 Appwrite Cloud Setup

### Step 1: Create a New Project

1. Log in to [Appwrite Cloud Console](https://cloud.appwrite.io/)
2. Click **"Create Project"**
3. Enter project name: `SSM-Platform` (or your preferred name)
4. Select your preferred region (e.g., `fra` for Frankfurt)
5. Copy your **Project ID** - you'll need this later

### Step 2: Configure Platform Settings

1. Navigate to **Settings** → **Platforms**
2. Click **"Add Platform"** → **"Web App"**
3. Configure the platform:
   - **Name**: `SSM Web App`
   - **Hostname**: Add both:
     - `localhost` (for local development)
     - Your Vercel domain (e.g., `your-app.vercel.app`)
     - Your custom domain (if applicable)

### Step 3: Create Database and Collections

1. Go to **Databases** → **Create Database**
2. Database ID: `693aa86e00236cd739f1` (or use auto-generated)
3. Create the following collections with their IDs:

| Collection Name | Collection ID | Permissions |
|----------------|---------------|-------------|
| Users | `users` | Read: Any, Write: Users |
| Posts | `posts` | Read: Any, Write: Users |
| Connections | `connections` | Read: Users, Write: Users |
| Messages | `messages` | Read: Users, Write: Users |
| Conversations | `conversations` | Read: Users, Write: Users |
| Projects | `projects` | Read: Any, Write: Users |
| Tasks | `tasks` | Read: Users, Write: Users |
| Events | `events` | Read: Any, Write: Users |
| Saved Items | `saved_items` | Read: Users, Write: Users |
| Post Likes | `post_likes` | Read: Any, Write: Users |

> [!IMPORTANT]
> For each collection, configure appropriate attributes based on your schema. Refer to your TypeScript types in the `shared` folder for field definitions.

### Step 4: Create Storage Buckets

1. Navigate to **Storage** → **Create Bucket**
2. Create the following buckets:

| Bucket Name | Bucket ID | Permissions | File Size Limit |
|-------------|-----------|-------------|-----------------|
| Avatars | `avatars` | Read: Any, Write: Users | 5MB |
| Banners | `banners` | Read: Any, Write: Users | 10MB |
| Post Images | `post_images` | Read: Any, Write: Users | 10MB |
| Project Images | `project_images` | Read: Any, Write: Users | 10MB |
| Event Images | `event_images` | Read: Any, Write: Users | 10MB |

**For each bucket:**
- Set **Maximum File Size**: As specified above
- **Allowed File Extensions**: `jpg`, `jpeg`, `png`, `gif`, `webp`
- **Compression**: Enable (recommended)
- **Encryption**: Enable (recommended)

### Step 5: Generate API Key (for Server-Side Operations)

1. Go to **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Configure:
   - **Name**: `SSM Server Key`
   - **Expiration**: Never (or set appropriate expiration)
   - **Scopes**: Select all necessary scopes:
     - `databases.read`, `databases.write`
     - `collections.read`, `collections.write`
     - `documents.read`, `documents.write`
     - `files.read`, `files.write`
     - `users.read`, `users.write`
4. Copy the generated API key - **you won't see it again!**

### Step 6: Configure CORS

1. Navigate to **Settings** → **CORS**
2. Add the following origins:
   - `http://localhost:5173` (local development)
   - `https://your-app.vercel.app` (your Vercel deployment)
   - Your custom domain (if applicable)

---

## 🌐 Vercel Deployment

### Step 1: Prepare Your Repository

1. Ensure your code is pushed to GitHub/GitLab/Bitbucket
2. Verify `.gitignore` excludes:
   ```
   node_modules
   .env
   .env.local
   dist
   ```

### Step 2: Import Project to Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your Git repository
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

### Step 3: Configure Environment Variables

In the Vercel project settings, add the following environment variables:

> [!CAUTION]
> Never commit `.env` files to your repository. Always use Vercel's environment variable settings.

Click **"Environment Variables"** and add each of the following:

#### Client-Side Variables (VITE_ prefix)

```bash
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_APPWRITE_DATABASE_ID=your_database_id_here

# Collection IDs
VITE_APPWRITE_USERS_COLLECTION_ID=users
VITE_APPWRITE_POSTS_COLLECTION_ID=posts
VITE_APPWRITE_CONNECTIONS_COLLECTION_ID=connections
VITE_APPWRITE_MESSAGES_COLLECTION_ID=messages
VITE_APPWRITE_CONVERSATIONS_COLLECTION_ID=conversations
VITE_APPWRITE_PROJECTS_COLLECTION_ID=projects
VITE_APPWRITE_TASKS_COLLECTION_ID=tasks
VITE_APPWRITE_EVENTS_COLLECTION_ID=events
VITE_APPWRITE_SAVED_ITEMS_COLLECTION_ID=saved_items
VITE_APPWRITE_POST_LIKES_COLLECTION_ID=post_likes

# Bucket IDs
VITE_APPWRITE_AVATARS_BUCKET_ID=avatars
VITE_APPWRITE_BANNERS_BUCKET_ID=banners
VITE_APPWRITE_POST_IMAGES_BUCKET_ID=post_images
VITE_APPWRITE_PROJECT_IMAGES_BUCKET_ID=project_images
VITE_APPWRITE_EVENT_IMAGES_BUCKET_ID=event_images
```

#### Server-Side Variables (if using Appwrite Functions)

```bash
# Server-side Appwrite Configuration
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id_here
APPWRITE_DATABASE_ID=your_database_id_here
APPWRITE_API_KEY=your_api_key_here

# Collection IDs (Server)
APPWRITE_USERS_COLLECTION_ID=users
APPWRITE_POSTS_COLLECTION_ID=posts
APPWRITE_CONNECTIONS_COLLECTION_ID=connections
APPWRITE_MESSAGES_COLLECTION_ID=messages
APPWRITE_CONVERSATIONS_COLLECTION_ID=conversations
APPWRITE_PROJECTS_COLLECTION_ID=projects
APPWRITE_TASKS_COLLECTION_ID=tasks
APPWRITE_EVENTS_COLLECTION_ID=events
APPWRITE_SAVED_ITEMS_COLLECTION_ID=saved_items
APPWRITE_POST_LIKES_COLLECTION_ID=post_likes

# Bucket IDs (Server)
APPWRITE_AVATARS_BUCKET_ID=avatars
APPWRITE_BANNERS_BUCKET_ID=banners
APPWRITE_POST_IMAGES_BUCKET_ID=post_images
APPWRITE_PROJECT_IMAGES_BUCKET_ID=project_images
APPWRITE_EVENT_IMAGES_BUCKET_ID=event_images
```

> [!TIP]
> Set environment variables for all environments (Production, Preview, Development) or configure them separately based on your needs.

### Step 4: Deploy

1. Click **"Deploy"**
2. Vercel will automatically:
   - Install dependencies
   - Run the build command
   - Deploy your application
3. Wait for deployment to complete (usually 2-5 minutes)
4. Visit your deployment URL: `https://your-app.vercel.app`

---

## 🔐 Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_APPWRITE_ENDPOINT` | Appwrite API endpoint | `https://fra.cloud.appwrite.io/v1` |
| `VITE_APPWRITE_PROJECT_ID` | Your Appwrite project ID | `693a5d38001eb9c27cca` |
| `VITE_APPWRITE_DATABASE_ID` | Your database ID | `693aa86e00236cd739f1` |
| `APPWRITE_API_KEY` | Server-side API key (if needed) | `secret_key_here` |

### Collection IDs

All collection IDs should match what you created in Appwrite Console:
- `users`, `posts`, `connections`, `messages`, `conversations`
- `projects`, `tasks`, `events`, `saved_items`, `post_likes`

### Bucket IDs

All bucket IDs should match your Appwrite storage buckets:
- `avatars`, `banners`, `post_images`, `project_images`, `event_images`

---

## ⚙️ Post-Deployment Configuration

### 1. Update Appwrite Platform Settings

After your first Vercel deployment:

1. Go to Appwrite Console → **Settings** → **Platforms**
2. Edit your Web App platform
3. Add your Vercel deployment URL to **Hostname**:
   - `your-app.vercel.app`
   - `www.your-app.vercel.app` (if using www)

### 2. Configure Custom Domain (Optional)

**In Vercel:**
1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

**In Appwrite:**
1. Add your custom domain to **Platforms** → **Hostnames**

### 3. Enable HTTPS

Vercel automatically provides SSL certificates. Ensure:
- All Appwrite platform URLs use `https://`
- CORS settings include `https://` URLs

### 4. Test Authentication Flow

1. Visit your deployed app
2. Try signing up with a test account
3. Verify email/password authentication works
4. Check that sessions persist correctly

### 5. Verify File Uploads

1. Test uploading an avatar
2. Test uploading post images
3. Ensure files are accessible via Appwrite CDN

---

## 🐛 Troubleshooting

### Build Fails on Vercel

**Issue**: Build command fails with TypeScript errors

**Solution**:
```bash
# Run locally first to catch errors
npm run check
npm run build
```

### CORS Errors

**Issue**: `Access-Control-Allow-Origin` errors in browser console

**Solution**:
1. Verify your deployment URL is added to Appwrite CORS settings
2. Check Appwrite Platform settings include your domain
3. Ensure URLs use `https://` (not `http://`)

### Environment Variables Not Working

**Issue**: App can't connect to Appwrite

**Solution**:
1. Verify all `VITE_` prefixed variables are set in Vercel
2. Redeploy after adding environment variables
3. Check variable names match exactly (case-sensitive)

### Images Not Loading

**Issue**: Uploaded images return 404 errors

**Solution**:
1. Verify bucket IDs match in both Appwrite and environment variables
2. Check bucket permissions allow public read access
3. Ensure file extensions are allowed in bucket settings

### Authentication Issues

**Issue**: Users can't log in or sessions expire immediately

**Solution**:
1. Verify Appwrite platform hostname matches your deployment URL
2. Check that cookies are enabled in browser
3. Ensure HTTPS is enabled (required for secure cookies)

---

## 📊 Monitoring and Analytics

### Vercel Analytics

Enable Vercel Analytics for performance monitoring:
1. Go to **Analytics** tab in Vercel dashboard
2. Enable **Web Analytics**
3. Monitor Core Web Vitals and user traffic

### Appwrite Monitoring

Monitor your Appwrite usage:
1. **Dashboard** → View API calls, storage usage
2. **Logs** → Debug API errors and issues
3. **Usage** → Track quota consumption

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to your repository:

- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

To disable auto-deployment:
1. Go to **Settings** → **Git**
2. Configure deployment branches

---

## 📝 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Appwrite Documentation](https://appwrite.io/docs)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)

---

## ✅ Deployment Checklist

Before going live, ensure:

- [ ] All environment variables are set in Vercel
- [ ] Appwrite collections and buckets are created
- [ ] Platform hostnames include your deployment URL
- [ ] CORS settings allow your domain
- [ ] API key is generated and secured
- [ ] Test authentication flow works
- [ ] File uploads are functional
- [ ] Custom domain is configured (if applicable)
- [ ] SSL certificate is active
- [ ] Analytics are enabled

---

**🎉 Congratulations! Your SSM Platform is now deployed!**

For local development instructions, see the main [README.md](README.md).

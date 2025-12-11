# SSM – Student Skill Matchmaking Design Guidelines

## Design Approach
**Reference-Based**: Modern social feed interface inspired by LinkedIn's professional networking + Instagram's engaging feed structure, optimized for student collaboration and skill matching.

## Color Palette

**Primary Colors:**
- Primary Blue: `#2563eb`
- Gradient (Headers/Highlights): `#7b2ff7` → `#4facfe`

**Neutrals:**
- Light Background: `#f5f6f8`
- Card White: `#ffffff`
- Border: `#e4e4e7`
- Text Primary: `#1f2937`
- Text Secondary: `#6b7280`
- Muted Icon Gray: `#d1d5db`

## Typography

**Font Families:** Inter or Outfit (via Google Fonts)

**Hierarchy:**
- Page Headings: 16–18px, semibold, text-primary
- Section Titles: 16px, semibold, text-primary
- Body Text: 14–15px, regular, text-primary
- Secondary Text: 13px, regular, text-secondary
- Labels/Captions: 13px, medium, text-secondary

## Layout System

**Spacing Primitives:** Use Tailwind units of 4, 5, 6 (as in `p-4`, `p-5`, `p-6`, `gap-4`, `gap-6`)

**Three-Column Dashboard Layout:**
- Left Sidebar: 20–22% width
- Center Feed: 48–55% width
- Right Sidebar: 22–25% width
- Column Gap: 24px (`gap-6`)

**Universal Card Specifications:**
- Background: White (`#ffffff`)
- Padding: 20px (`p-5`)
- Border Radius: 14px (`rounded-2xl`)
- Shadow: Subtle drop shadow
- Border: 1px solid `#e4e4e7`
- Card Spacing: 20px vertical (`space-y-5`)

**List Items:**
- Gap: 10px (`gap-2.5`)
- Individual items: Rounded, subtle border, hover state with light grey background

## Component Library

### Navigation Bar
- Fixed top, full width
- White background with bottom border
- Height: 64px
- Logo: Left-aligned, primary blue
- Search bar: Centered, rounded pill shape with search icon
- Nav links: Horizontal, hover with darker text
- Avatar: Right corner, circular (40px)

### Left Sidebar Components

**Modules Card:**
- Module tags in rounded pills with subtle borders
- Hover: Light grey background (`#f1f1f3`)
- Categories: Business, Startup, Coding, Design, Marketing, AI/ML

**Trending Topics Card:**
- Hashtag list with small text (13px)
- Muted text color
- Vertical spacing between hashtags

### Center Feed Components

**Post Creation Box:**
- Avatar (40px circular) + input field
- Placeholder: "Share a skill, project, or opportunity…"
- Rounded pill input with subtle border
- Optional attachment icons (right-aligned)

**Feed Post Cards:**
- Avatar (48px) + Name (bold) + Subtitle (field + location)
- Post description (14px, text-primary)
- Metrics row (likes, comments, shares) in muted gray
- Action buttons: Like, Comment, Share (horizontal, rounded hover backgrounds)
- Spacing: 16px between cards

### Right Sidebar Components

**Profile Card:**
- Gradient header using `#7b2ff7` → `#4facfe`
- Avatar overlapping header (64px, white border)
- Name + subtitle centered
- Primary blue button

**Analytics Cards:**
- Clean white cards, minimal design
- Large numeric values (24px, semibold)
- Small labels (13px, text-secondary)
- Grid layout for multiple metrics

**Saved Items & Top Stories:**
- Simple list format
- Bullet points with small icons
- Compact spacing (8px between items)

### Authentication Pages
- Centered card (max-width: 400px)
- Gradient accent at top
- Social login buttons with icons
- Tag input fields for skills/interests
- Primary blue CTA buttons

### Profile Pages
- Full-width gradient banner (200px height)
- Avatar (120px, centered, overlapping banner)
- Skills displayed in rounded tag pills
- Portfolio section with image grid
- Social links as icon buttons

### Matchmaking Results
- Grid layout (2-3 columns on desktop)
- Match cards with compatibility score badge
- Avatar + name + skills alignment
- Connect button (primary blue) + View Profile (outline)

### Project Collaboration
- Modal dialogs for project creation
- Task lists with checkboxes
- Member avatars in horizontal row (overlap slightly)
- Milestone progress bars
- File upload dropzone with dashed border

### Messaging UI
- Split layout: Conversations sidebar (30%) + Chat window (70%)
- Message bubbles: Sent (primary blue), Received (light gray)
- Input box with attachment + emoji icons
- Rounded message bubbles (12px radius)

### Events & Workshops
- Event cards with image thumbnails
- RSVP button (primary blue)
- Calendar icon + date badge
- Detail modal with full event information

## Interactions & Animations

**Hover States:**
- Cards: Scale to 1.02, enhance shadow
- Buttons: Slight color darkening
- List items: Light background overlay

**Transitions:**
- Duration: 200ms
- Easing: Ease-in-out
- Properties: Transform, shadow, background-color

**Focus States:**
- Blue ring (2px, `#2563eb`) on inputs and buttons

## Images

**Avatar Images:**
- Use professional student/academic Unsplash images
- Circular cropping
- Sizes: 40px (small), 48px (feed), 64px (profile card), 120px (profile page)

**Post Thumbnails:**
- Academic/professional themes
- Project workspaces, collaboration, technology
- Rounded corners (8px)

**Project/Event Images:**
- Landscape format (16:9)
- Student innovation, workshops, hackathons themes
- Rounded corners (12px)

No large hero images required—this is a dashboard-focused application prioritizing content density and feed engagement.
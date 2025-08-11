# Foundrly

**Foundrly** is a full-stack web application that enables users to create, share, and discover startup pitches in real time. Designed for both entrepreneurs and investors, Foundrly streamlines startup discovery by combining clean UI, dynamic content, and modern authentication—all built using **Next.js**, **Sanity**, and **NextAuth**.

## Table of Contents

  - [Overview](https://www.google.com/search?q=%23overview)
  - [Features](https://www.google.com/search?q=%23features)
  - [Tech Stack](https://www.google.com/search?q=%23tech-stack)
  - [Getting Started](https://www.google.com/search?q=%23getting-started)
  - [Usage](https://www.google.com/search?q=%23usage)
  - [Authentication](https://www.google.com/search?q=%23authentication)
  - [User Profile](https://www.google.com/search?q=%23user-profile)
  - [Startup Submission](https://www.google.com/search?q=%23startup-submission)
  - [Performance Monitoring](https://www.google.com/search?q=%23performance-monitoring)
  - [Deployment](https://www.google.com/search?q=%23deployment)
  - [Contributing](https://www.google.com/search?q=%23contributing)
  - [License](https://www.google.com/search?q=%23license)

## Overview

The startup ecosystem is growing fast—but discovery is still broken. Founders struggle for visibility, and investors waste time sorting through noise. **Foundrly** solves that by offering a centralized, searchable, real-time platform for discovering startup ideas.

This project is designed to scale, both in architecture and vision. It combines static generation with dynamic rendering, integrates with a headless CMS for flexibility, and supports real-time data updates for an interactive user experience.

## Features

### 🚀 **Core Platform Features**
- **Startup Pitch Creation**: Create detailed startup pitches with markdown support
- **Image Upload**: Upload startup images with drag-and-drop functionality
- **Advanced Search**: Search across title, username, and category
- **Real-Time Updates**: Using Sanity's live content API
- **Responsive Design**: Works seamlessly across all devices
- **Dynamic User Profiles**: User profiles with startup listings
- **Startup Submission Forms**: Forms with validation and image support

### 👥 **Social & Engagement Features**
- **GitHub Authentication**: Secure login via NextAuth
- **Comment System**: Reddit-style threaded comments with likes/dislikes
- **Like/Dislike System**: Vote on startups and comments
- **Follow/Unfollow**: Follow other users and see their activity
- **Messaging System**: Direct messaging between users
- **Suggested Users**: Discover new users to follow
- **Followers/Following**: View user connections and counts

### 🛡️ **Administrative & Moderation Features**
- **Reporting System**: Report startups, comments, and users
- **Ban Management**: Temporary and permanent user bans
- **Moderation Dashboard**: Admin panel for content moderation
- **Sentry Integration**: Performance and error tracking
- **Content Moderation**: Review and manage reported content
- **Strike System**: Progressive discipline for rule violations
- **Admin Actions**: Direct content management and user moderation

## Tech Stack

  - **Next.js** — SSR, API routes, image optimization
  - **React** — UI components and client-side rendering
  - **Sanity** — Headless CMS for managing and querying content
  - **NextAuth** — Authentication with GitHub provider
  - **Sentry** — Application performance and error monitoring
  - **Framework**: Next.js 15
  - **Language**: TypeScript
  - **Styling**: Tailwind CSS
  - **CMS**: Sanity
  - **Authentication**: NextAuth.js
  - **File Storage**: Vercel Blob (production) / Local storage (development)
  - **UI Components**: Radix UI
  - **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Sanity account (for CMS)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/foundrly.git
    cd foundrly
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables:

    ```bash
    cp .env.example .env.local
    ```

4. Configure your environment variables in `.env.local`:

    ```env
    NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
    NEXT_PUBLIC_SANITY_DATASET=production
    SANITY_API_TOKEN=your_api_token
    NEXTAUTH_SECRET=your_nextauth_secret
    NEXTAUTH_URL=http://localhost:3000
    BLOB_READ_WRITE_TOKEN=your_blob_token
    ```

### Development

Run the development server:

    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Image Upload Setup

#### Local Development
Image uploads work out of the box in local development. Files are stored in the `public/uploads/` directory.

#### Production (Vercel)
For production deployment on Vercel:

1. **Enable Vercel Blob Storage**:
   - Go to your Vercel project dashboard
   - Navigate to Storage → Blob
   - Create a new Blob store
   - Copy the `BLOB_READ_WRITE_TOKEN` to your environment variables

2. **Set Environment Variables**:
   - Add `BLOB_READ_WRITE_TOKEN` to your Vercel project environment variables
   - Redeploy your application

The application automatically detects the environment and uses:
- **Local storage** for development
- **Vercel Blob storage** for production

### Building for Production

```bash
npm run build
npm start
```

## Usage

  - Browse a live feed of startup pitches.
  - Log in using GitHub to manage your own startup submissions.
  - View any user's profile and see what startups they've shared.
  - Use the search bar to filter ideas based on relevance and category.

## Authentication

Authentication is handled via NextAuth with GitHub as the provider. When users log in, their profile is auto-created in Sanity if not already present. Sessions are maintained across pages and API routes using server-side sessions.

## User Profile

Each user has a dedicated profile page displaying:

  - Name
  - Username
  - Avatar
  - Bio
  - All submitted startups

Static site generation with dynamic data fetching is used to optimize performance and SEO.

## Startup Submission

Logged-in users can submit startup pitches through a dedicated form. Fields include:

  - Title
  - Description
  - Category
  - Image URL
  - Rich-text pitch body

Validation is enforced both on the client and server. All data is synced with Sanity CMS in real time.

## Performance Monitoring

Sentry is integrated to track:

  - Errors and exceptions
  - Latency and performance bottlenecks
  - API failures

This helps maintain app health in both development and production environments.

## Deployment

To deploy on Vercel:

1.  **Push the code to GitHub:**
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/yourusername/foundrly.git
    git push -u origin main
    ```
2.  Connect the GitHub repo to Vercel.
3.  Add all required environment variables in the Vercel dashboard.

## Project Structure

```
foundrly/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (root)/            # Main pages
│   └── studio/            # Sanity studio
├── components/            # React components
│   └── ui/               # UI components
├── lib/                  # Utility functions
├── hooks/                # Custom React hooks
├── sanity/               # Sanity configuration
└── public/               # Static assets
```

## Contributing

This is an active project, and contributions are welcome.

If you'd like to suggest improvements, fix bugs, or add new features:

  - Fork the repo
  - Create a new branch
  - Submit a pull request

For large-scale ideas, please open an issue first to discuss it.

## License

This project is licensed under the MIT License. See the `LICENSE` file for full details.

-----

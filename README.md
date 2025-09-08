# Foundrly

**Foundrly** is a full-stack web application that enables users to create, share, and discover startup pitches in real time. Designed for both entrepreneurs and investors, Foundrly streamlines startup discovery by combining clean UI, dynamic content, and modern authentication—all built using **Next.js**, **Sanity**, and **NextAuth**.

## 📚 **Documentation**

For comprehensive documentation, visit our **[Documentation Hub](./docs/README.md)** which includes:

- **[Getting Started Guide](./docs/getting-started.md)** - Set up your development environment
- **[Architecture Overview](./docs/architecture.md)** - Understand the system design
- **[API Reference](./docs/api/README.md)** - Complete API documentation
- **[Feature Guides](./docs/features/)** - Badge system, notifications, and more
- **[Deployment Guide](./docs/deployment.md)** - Deploy to production
- **[Troubleshooting](./docs/troubleshooting/common-issues.md)** - Common issues and solutions

## 🚀 **Quick Start**

```bash
# Set up environment variables
cp .env.example .env.local
## Overview


- **Startup Pitch Creation**: Create detailed startup pitches with markdown support
- **Startup Submission Forms**: Forms with validation and image support

- **Messaging System**: Direct messaging between users
- **Suggested Users**: Discover new users to follow
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

### 🤖 **AI Features**
- **Pitch Generator** (AI-powered): Instantly generate full startup pitches from your idea or description
- **Semantic search** (vector similarity, natural language)
- **Pitch analysis** (scoring, strengths/weaknesses, market insights)
- **Personalized recommendations** (user behavior, vector matching)
- **Enhanced content moderation** (AI-powered analysis)
- **Vector database integration** (Pinecone)

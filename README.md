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

  - 🔐 **GitHub Authentication** via NextAuth
  - 👤 **Dynamic User Profiles** with startup listings
  - ⚡ **Real-Time Updates** using Sanity’s live content API
  - 🔎 **Advanced Search** across title, username, and category
  - 📊 **Sentry Integration** for performance and error tracking
  - ✍️ **Startup Submission Forms** with validation and image support

## Tech Stack

  - **Next.js** — SSR, API routes, image optimization
  - **React** — UI components and client-side rendering
  - **Sanity** — Headless CMS for managing and querying content
  - **NextAuth** — Authentication with GitHub provider
  - **Sentry** — Application performance and error monitoring

## Getting Started

1.  **Clone the repo:**

    ```bash
    git clone https://github.com/yourusername/foundrly.git
    cd foundrly
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure environment:**

    Create `.env.local` and fill in the following:

    ```env
    NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
    NEXT_PUBLIC_SANITY_DATASET=your_dataset
    NEXT_PUBLIC_SANITY_API_VERSION=2023-10-01
    SANITY_WRITE_TOKEN=your_write_token
    NEXTAUTH_SECRET=your_nextauth_secret
    NEXTAUTH_URL=http://localhost:3000
    GITHUB_ID=your_github_oauth_id
    GITHUB_SECRET=your_github_oauth_secret
    ```

4.  **Run the app:**

    ```bash
    npm run dev
    ```

    Visit `http://localhost:3000` to use the platform locally.

## Usage

  - Browse a live feed of startup pitches.
  - Log in using GitHub to manage your own startup submissions.
  - View any user’s profile and see what startups they’ve shared.
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

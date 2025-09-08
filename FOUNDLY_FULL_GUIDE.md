# Foundrly Full Guide

This guide provides a complete overview of the Foundrly platform, including setup, features, architecture, API, and troubleshooting. It consolidates all major documentation and guides for easy reference.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Tech Stack](#tech-stack)
4. [Core Features](#core-features)
5. [Feature Guides](#feature-guides)
6. [Architecture](#architecture)
7. [API Reference](#api-reference)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [Other Setup Guides](#other-setup-guides)
11. [Contributing & License](#contributing--license)

---

## 1. Project Overview
Foundrly is a full-stack web application for creating, sharing, and discovering startup pitches. It features real-time notifications, gamified badges, advanced moderation, and AI-powered pitch generation.

## 2. Getting Started
- Clone the repo, install dependencies, and set up environment variables.
- See [Getting Started](docs/getting-started.md) for step-by-step instructions.

## 3. Tech Stack
- Next.js, React, TypeScript, Tailwind CSS, Radix UI, Lucide React
- Sanity CMS, NextAuth.js, Vercel Blob, Sentry

## 4. Core Features
- **Pitch Generator**: Instantly generate full startup pitches from your idea or description
- **Real-time Notifications**: Follows, likes, comments, badge earned, etc.
- **Badge System**: Earn badges for engagement, creation, and social actions
- **Moderation**: Reporting, bans, admin dashboard
- **Messaging**: Direct messages between users
- **Advanced Search**: Semantic and category-based
- **User Profiles**: Dynamic profiles with startup listings
- **AI Features**: Pitch analysis, recommendations, content moderation

## 5. Feature Guides
- [Badge System](docs/features/badge-system.md)
- [Notification System](docs/features/notifications.md)
- [Reporting & Moderation](REPORTING_SYSTEM.md)
- [Enhanced Badge System](ENHANCED_BADGE_SYSTEM.md)
- [AI Features](AI_SETUP_GUIDE.md)

## 6. Architecture
- See [Architecture Overview](docs/architecture.md) for system design, data flow, and tech stack details.

## 7. API Reference
- See [API Reference](docs/api/README.md) for endpoint documentation, authentication, and usage examples.

## 8. Deployment
- See [Deployment Guide](docs/deployment.md) and [VERCEL_DEPLOYMENT_AFTER_DOCKER.md] for production setup.
- Docker setup: [DOCKER_SETUP.md], [DOCKER_HOSTING_GUIDE.md], [DOCKER_HOSTING_QUICK_START.md]

## 9. Troubleshooting
- See [Troubleshooting Guide](docs/troubleshooting/common-issues.md) and [NOTIFICATION_TROUBLESHOOTING.md] for common problems and solutions.

## 10. Other Setup Guides
- Email: [EMAIL_SETUP.md]
- Push Notifications: [PUSH_NOTIFICATIONS_SETUP.md], [PUSH_NOTIFICATIONS_COMPLETE_SETUP.md]
- Stream Chat: [STREAM_CHAT_WEBHOOK_SETUP.md], [STREAM_CHAT_PUSH_NOTIFICATIONS_SETUP.md]
- Buy Me a Coffee: [BUY_ME_A_COFFEE_SETUP.md]

## 11. Contributing & License
- See [docs/README.md] for contributing guidelines.
- MIT License.

---

For the most up-to-date details, always refer to the individual guides and documentation files listed above.

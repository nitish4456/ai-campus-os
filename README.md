# UniNest – AI-Powered Campus OS 🎓

**One Platform. Everything Campus.**

UniNest is an AI-powered Campus Operating System designed to bring essential university services, campus events, student resources, and intelligent assistance together in a single digital ecosystem.

Built around the idea of a smarter, more connected campus, UniNest aims to eliminate the fragmentation of university life by providing students with a centralized platform to discover opportunities, access campus services, stay informed, and get assistance.

Originally developed as a hackathon project at **Lovely Professional University (LPU)**, UniNest demonstrates how modern full-stack technologies, modular software architecture, and AI integration can be used to improve the everyday student experience.

> **Project Status:** Hackathon Project | Not Currently Deployed

---

## 🚀 Overview

University students frequently rely on multiple platforms to discover events, access information, manage campus-related activities, and stay updated with important announcements.

UniNest addresses this problem through a unified digital campus environment that brings these experiences under one interface.

The platform combines event discovery, event aggregation, Lost & Found, authentication, and an AI-powered assistant into a centralized student dashboard.

Rather than navigating disconnected services, students can access relevant campus resources through one consistent and accessible interface.

## ✨ Core Features

### 🎪 1. Campus Event Discovery

A centralized event discovery experience that helps students find opportunities both within and outside their university.

- Discover university events, workshops, seminars, and hackathons.
- Explore external events and student-oriented opportunities.
- Access event information through a unified interface.
- Organize events from multiple sources into a consistent experience.

### 🔍 2. Multi-Source Event Aggregation

A modular event aggregation system designed to integrate multiple event providers.

- Supports campus-specific, external, and manually added events.
- Uses a normalized event structure to maintain data consistency.
- Separates individual data providers from the main event system.
- Allows additional event sources to be integrated without significantly modifying the existing architecture.

### 📦 3. Campus Lost & Found

A dedicated space for reporting and discovering lost belongings within the campus community.

- Report lost belongings.
- Browse reported lost and found items.
- Centralize item-related information.
- Make communication and item recovery more accessible to students.

### 🤖 4. Friday – AI Campus Assistant

An AI-powered virtual assistant designed to improve how students interact with the platform.

- Provides an intelligent conversational interface.
- Explores LLM integration within a campus-oriented application.
- Designed to assist students with platform navigation and campus-related information.

### 🔐 5. Authentication & User Management

Secure user authentication and account management powered by Clerk.

- Google authentication integration.
- Managed authentication workflows.
- User account access and session management.

### 🖥️ 6. Centralized Student Dashboard

A unified interface that brings the platform's different services together.

- Dashboard-oriented application design.
- Component-driven user interface.
- Responsive layouts.
- Centralized navigation across campus services.

---

## 🛠️ Technology Stack

UniNest is built using a modern full-stack JavaScript ecosystem.

| Category | Technologies |
|---|---|
| Frontend | Next.js 14+, React.js, TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui, Lucide React |
| Backend | Next.js API Routes |
| Database | MongoDB, Mongoose |
| Authentication | Clerk, Google Authentication |
| Cloud Storage | Cloudinary |
| AI Integration | Gemini / OpenAI API |
| Development Tools | Antigravity, VS Code |
| Version Control | Git, GitHub |

---

## 🏗️ Architecture & Design

UniNest follows a modular application architecture that separates individual platform functionalities into manageable components.

A key architectural element is its provider-based event aggregation system.

### Event Aggregation Architecture

Rather than tightly coupling the application to a single event source, UniNest uses independent providers that transform different event sources into a common data structure.

```text
                 UniNest Event System
                          |
             +------------+------------+
             |            |            |
             v            v            v
       Campus Provider  External    Manual
                        Provider   Provider
             |            |            |
             v            v            v
        LPU Events   External Events  Custom Events
             |            |            |
             +------------+------------+
                          |
                          v
                 Event Normalization
                          |
                          v
                  NormalizedEvent
                          |
                          v
                    Event Database
                          |
                          v
                     Student UI
```

**Core Components**

| Component | Responsibility |
|---|---|
| `campusProvider.ts` | Handles campus-specific event data. |
| `externalProvider.ts` | Provides an integration point for external event sources. |
| `manualProvider.ts` | Handles manually added events. |
| `NormalizedEvent` | Defines a consistent event representation across providers. |

This approach reduces dependency between event sources and the rest of the application, making the event system easier to maintain and extend.

---

## 📂 Project Structure

The application is organized around the Next.js App Router architecture.

```text
UniNest/
│
├── app/
│   ├── api/
│   ├── dashboard/
│   ├── events/
│   ├── lost-found/
│   └── layout.tsx
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── events/
│   └── shared/
│
├── lib/
│   ├── mongodb.ts
│   ├── cloudinary.ts
│   └── utils.ts
│
├── models/
│
├── providers/
│   ├── campusProvider.ts
│   ├── externalProvider.ts
│   └── manualProvider.ts
│
├── public/
│
├── .env.example
├── package.json
└── README.md
```

*Note: This is a simplified representation of the project's intended organization. Refer to the repository for the actual implementation and directory structure.*

---

## ⚙️ Getting Started

Follow the instructions below to set up UniNest locally.

### Prerequisites

Ensure that the following are installed:

- Node.js (LTS recommended)
- npm or another compatible package manager
- Git
- MongoDB database
- API credentials for the integrations you intend to use

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/UniNest.git
```

### 2. Navigate to the Project Directory

```bash
cd UniNest
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project's root directory.

Add the credentials required by your configured integrations:

```env
# MongoDB
MONGODB_URI=

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# AI Integration
GEMINI_API_KEY=
# OR
OPENAI_API_KEY=
```

**Important:** The variables above are illustrative. Use the exact environment variable names expected by the application's implementation. Not all integrations may be enabled in every version.

Never commit `.env.local` or expose private API credentials.

### 5. Run the Development Server

```bash
npm run dev
```

Open the following URL in your browser:

```text
http://localhost:3000
```

---

## 🧠 Technical Highlights

UniNest explores several concepts and engineering practices involved in developing modern full-stack applications:

- **Full-Stack Development:** Building an integrated application using Next.js, React, and TypeScript.
- **Backend Development:** Creating API routes and connecting frontend functionality with backend services.
- **Database Management:** Modeling and managing application data using MongoDB and Mongoose.
- **Authentication:** Integrating Clerk and Google authentication.
- **AI Integration:** Exploring the use of large language models within a student-focused application.
- **Modular Architecture:** Separating application responsibilities into independent components and providers.
- **Data Normalization:** Maintaining a consistent event representation across multiple data sources.
- **Cloud Integration:** Managing media and image assets through Cloudinary.
- **Component-Driven Development:** Building reusable UI components with shadcn/ui and Tailwind CSS.

---

## 🔮 Future Roadmap

UniNest provides a foundation for a broader digital campus ecosystem. Potential areas of further development include:

- **Context-Aware AI Assistant:** Expand Friday to provide more personalized and context-aware campus assistance.
- **Smart Event Recommendations:** Suggest events based on student interests, preferences, and participation history.
- **Real-Time Notifications:** Introduce notifications for announcements, event updates, and important campus information.
- **Student Community:** Add discussion spaces, student groups, and collaboration features.
- **Image-Based Lost & Found:** Explore image recognition and visual similarity matching to improve item discovery.
- **Academic Integration:** Integrate timetables, attendance, and other academic resources.
- **Mobile Application:** Extend the platform through a dedicated mobile experience.
- **Infrastructure & Scalability:** Improve deployment, monitoring, performance, and backend infrastructure.

---

## 🎯 Project Vision

The vision behind UniNest is to make university life more connected, accessible, and organized.

By bringing campus services, event discovery, intelligent assistance, and student-oriented tools into one platform, UniNest explores the potential of a unified digital infrastructure for modern universities.

The project serves as an exploration of how AI and full-stack engineering can move beyond standalone applications to create interconnected digital experiences.

---

## 👨‍💻 Project Information

| Attribute | Details |
|---|---|
| Project | UniNest – AI-Powered Campus OS |
| Category | AI / Full-Stack Web Development |
| Institution | Lovely Professional University |
| Development Context | Hackathon Project |
| Deployment Status | Not Currently Deployed |

---

## 📜 License

No open-source license has currently been specified for this repository. Unless a license is added, all rights remain with the respective project contributors.

---

<p align="center">
  <b>UniNest – Building a Smarter, More Connected Campus.</b>
  <br/>
  Made with ❤️ for the student community.
</p>

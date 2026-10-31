# UniNest – AI-Powered Campus OS 🎓

**One Platform. Everything Campus.**

UniNest is an AI-powered Campus Operating System designed to simplify and enhance the student experience by bringing essential campus services, event discovery, and intelligent assistance together in one centralized platform.

Built with the vision of creating a smarter, more connected campus, UniNest aims to reduce the friction students face when accessing campus information and services.

Originally developed as a hackathon project for Lovely Professional University (LPU), UniNest explores how modern web technologies and AI can improve everyday campus life.

> **Project Status:** Hackathon Project | Not Currently Deployed

---

## 🚀 Project Overview

University life involves managing multiple activities, discovering events, staying updated with campus announcements, and accessing different student services.

UniNest addresses this fragmentation by providing a centralized digital campus ecosystem where students can discover opportunities, access useful services, and interact with an AI-powered assistant.

Instead of navigating multiple platforms, students can access relevant campus resources through a single interface.

## ✨ Key Features

### 1. 🎪 Campus Event Discovery
- Discover upcoming university events, workshops, seminars, and hackathons.
- Explore external events and opportunities relevant to students.
- Centralized event discovery experience.
- Multiple event sources integrated through a unified event system.

### 2. 🔍 Intelligent Event Aggregation
- Designed to collect events from different sources.
- Supports campus events, external event providers, and manually added events.
- Uses a normalized event structure to maintain consistency across different data sources.
- Provider-based architecture for easier integration and scalability.

### 3. 📦 Lost & Found
- A centralized space for students to report lost belongings.
- Helps students discover reported lost and found items.
- Designed to make campus item recovery more accessible.

### 4. 🤖 AI Assistant – Friday
- An AI-powered virtual assistant designed for campus-related assistance.
- Intended to help students navigate platform features and access information.
- Explores the integration of large language models into a campus ecosystem.

### 5. 🔐 Authentication
- User authentication and account management.
- Google sign-in integration.
- Secure authentication workflows using Clerk.

### 6. 🖥️ Centralized Student Experience
- Modern dashboard-oriented interface.
- Centralized access to campus-related features.
- Responsive UI built with modern frontend technologies.

---

## 🛠️ Technology Stack

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
| Development | Antigravity, VS Code |
| Version Control | Git & GitHub |

---

## 🏗️ System Architecture

UniNest follows a modular architecture designed to keep different platform functionalities independent and easier to maintain.

### Event Provider Architecture

One of the important architectural components is the event aggregation system.

Instead of depending on a single event source, the system was designed around multiple providers.

```text
              UniNest Event System
                       |
          +------------+------------+
          |            |            |
          v            v            v
    Campus Provider  External     Manual
                     Provider    Provider
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

**Provider Components:**

- `campusProvider.ts` – Handles campus event data.
- `externalProvider.ts` – Designed to integrate external event sources.
- `manualProvider.ts` – Supports manually added events.
- `NormalizedEvent` – Provides a consistent event structure across providers.

This architecture makes it easier to introduce additional event sources without significantly changing the rest of the application.

---

## 📂 Project Structure

The application follows a modular Next.js App Router architecture.

A simplified representation of the intended organization:

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

*Note: This is a conceptual project structure. Refer to the actual repository for the implemented directory organization.*

---

## ⚙️ Getting Started

Follow these steps to run UniNest locally.

### Prerequisites

Make sure you have the following installed:

- Node.js (LTS recommended)
- npm or another compatible package manager
- Git
- MongoDB database
- Required API credentials for configured integrations

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

Create a `.env.local` file in the root directory.

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

# AI Integration (if configured)
GEMINI_API_KEY=
# OR
OPENAI_API_KEY=
```

**Important:** Use the environment variable names expected by the actual application. Not every integration may be enabled in every version of the project.

Never commit your `.env.local` file or expose private API credentials.

### 5. Start the Development Server

```bash
npm run dev
```

Open your browser and navigate to:

```text
http://localhost:3000
```

---

## 🧠 Key Development Concepts

UniNest explores several concepts involved in building modern full-stack applications:

- Full-stack development using Next.js.
- REST API development and backend integration.
- Database modelling and management using MongoDB.
- Authentication and authorization workflows.
- AI integration using large language models.
- Modular and provider-based software architecture.
- Event aggregation and data normalization.
- Cloud-based media management.
- Component-driven frontend development.

---

## 🔮 Future Scope

Although UniNest was initially developed as a hackathon project, the concept has room for further development.

Potential future improvements include:

- **AI Campus Assistant:** Expand Friday into a context-aware campus assistant.
- **Smart Event Recommendations:** Recommend events based on student interests.
- **Campus Notifications:** Real-time notifications for important announcements and events.
- **Student Community:** Introduce student discussions, groups, and collaboration spaces.
- **Advanced Lost & Found:** Improve item discovery with image-based matching.
- **Academic Integration:** Explore timetable, attendance, and academic information integration.
- **Mobile Experience:** Develop a dedicated mobile application.
- **Scalable Infrastructure:** Improve deployment, monitoring, and backend architecture.

---

## 🎯 Project Objective

The primary objective of UniNest was to explore the development of a unified digital ecosystem for university students.

By combining full-stack web development, AI-powered assistance, event aggregation, and centralized student services, the project demonstrates how technology can make campus experiences more accessible, organized, and connected.

---

## 👨‍💻 Development

**Project:** UniNest – AI-Powered Campus OS  
**Category:** AI / Full-Stack Web Development  
**Institution:** Lovely Professional University  
**Project Type:** Hackathon Project

---

## 📜 License

No open-source license has currently been specified for this repository. All rights are reserved by the respective project contributors unless a license is added.

---

<p align="center">
  <b>UniNest – Building a Smarter Campus Experience.</b>
  <br/>
  Made with ❤️ for the student community.
</p>

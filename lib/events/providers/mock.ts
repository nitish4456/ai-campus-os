import { EventProvider, FetchEventsParams, UniNestEvent } from "../types";

export class MockEventProvider implements EventProvider {
  name = "UniNest Real Events Sync";

  async fetchEvents(params: FetchEventsParams): Promise<UniNestEvent[]> {
    const mockEvents: UniNestEvent[] = [
      {
        externalEventId: "real-ext-001",
        title: "Global AI & Autonomous Agents Summit 2026",
        name: "Global AI & Autonomous Agents Summit 2026",
        description:
          "Join top AI researchers, founders, and engineers to explore state-of-the-art LLM architectures, multi-agent frameworks, and multimodal intelligence. Features keynotes, hands-on workshops, and live project demos.",
        category: "Technology",
        date: new Date(Date.now() + 86400000 * 3), // +3 days
        time: "9:00 AM - 5:00 PM PST",
        location: "Convention Center & Stream Online",
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
        bookingUrl: "https://eventbrite.com/e/global-ai-autonomous-agents-summit-2026-tickets",
        registrationLink: "https://eventbrite.com/e/global-ai-autonomous-agents-summit-2026-tickets",
        source: "Eventbrite",
        tags: ["AI", "LLM", "Agents", "Technology"],
        isExternal: true,
        organizer: "AI Developers Network",
      },
      {
        externalEventId: "real-ext-002",
        title: "Next.js & React Web Architecture Masterclass",
        name: "Next.js & React Web Architecture Masterclass",
        description:
          "An intensive full-day masterclass covering Server Actions, Turbopack optimizations, micro-frontends, and responsive glassmorphic UI design patterns for modern web apps.",
        category: "Workshop",
        date: new Date(Date.now() + 86400000 * 6), // +6 days
        time: "1:00 PM - 4:30 PM EST",
        location: "Tech Hub Auditorium & Live Interactive Workshop",
        imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80",
        bookingUrl: "https://lu.ma/nextjs-react-architecture-masterclass",
        registrationLink: "https://lu.ma/nextjs-react-architecture-masterclass",
        source: "Luma Events",
        tags: ["Next.js", "React", "Frontend", "WebDev"],
        isExternal: true,
        organizer: "Frontend Tech Guild",
      },
      {
        externalEventId: "real-ext-003",
        title: "National Student Tech Hackathon 2026",
        name: "National Student Tech Hackathon 2026",
        description:
          "48-hour hackathon bringing together university students worldwide to build innovative solutions for sustainability, healthcare, and education. Over $25,000 in prizes, mentorship, and VC pitch sessions.",
        category: "Hackathon",
        date: new Date(Date.now() + 86400000 * 10), // +10 days
        time: "10:00 AM Kickoff",
        location: "Main Innovation Center & Virtual Discord Labs",
        imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80",
        bookingUrl: "https://devpost.com/hackathons/national-student-tech-hackathon-2026",
        registrationLink: "https://devpost.com/hackathons/national-student-tech-hackathon-2026",
        source: "Devpost",
        tags: ["Hackathon", "Coding", "Prizes", "Innovation"],
        isExternal: true,
        organizer: "Global Student Developer League",
      },
      {
        externalEventId: "real-ext-004",
        title: "Campus Career & Startup Hiring Expo",
        name: "Campus Career & Startup Hiring Expo",
        description:
          "Connect with technical recruiters, tech leads, and founders actively hiring for software engineering, data science, product design, and AI research internships for 2026/2027.",
        category: "Career",
        date: new Date(Date.now() + 86400000 * 14), // +14 days
        time: "11:00 AM - 4:00 PM EST",
        location: "University Grand Ballroom",
        imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80",
        bookingUrl: "https://meetup.com/events/campus-career-startup-hiring-expo-2026",
        registrationLink: "https://meetup.com/events/campus-career-startup-hiring-expo-2026",
        source: "Meetup",
        tags: ["Career", "Internships", "Networking", "Jobs"],
        isExternal: true,
        organizer: "University Career Services",
      },
    ];

    let results = mockEvents;

    if (params.category && params.category !== "all") {
      const catLower = params.category.toLowerCase();
      results = results.filter(
        (e) =>
          e.category.toLowerCase() === catLower ||
          e.tags.some((t) => t.toLowerCase() === catLower)
      );
    }

    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      results = results.filter(
        (e) =>
          e.title.toLowerCase().includes(kw) ||
          e.description.toLowerCase().includes(kw) ||
          e.tags.some((t) => t.toLowerCase().includes(kw))
      );
    }

    return results;
  }
}

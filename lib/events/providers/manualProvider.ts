import { EventProvider, FetchEventsParams, NormalizedEvent } from "../types";

export class ManualIndianEventsProvider implements EventProvider {
  name = "Manual Indian Events Provider";

  async fetchEvents(params: FetchEventsParams): Promise<NormalizedEvent[]> {
    const indianEvents: NormalizedEvent[] = [
      {
        externalEventId: "ind-001",
        title: "India AI & Deep Learning Summit 2026",
        name: "India AI & Deep Learning Summit 2026",
        description:
          "India's largest flagship artificial intelligence conference bringing together AI researchers, founders, and engineers in Delhi. Features sessions on Generative AI, LLM fine-tuning, and agentic workflows.",
        category: "Technology",
        date: new Date(Date.now() + 86400000 * 4), // +4 days
        endDate: new Date(Date.now() + 86400000 * 5),
        location: "Pragati Maidan Convention Center, New Delhi",
        city: "Delhi",
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
        bookingUrl: "https://in.bookmyshow.com/events/india-ai-deep-learning-summit-2026/ET00390123",
        source: "BookMyShow",
        sourceUrl: "https://in.bookmyshow.com/explore/events-delhi-ncr",
        tags: ["AI", "DeepLearning", "Delhi", "BookMyShow", "Technology"],
        isExternal: true,
        organizer: "India AI Council & BookMyShow Events",
      },
      {
        externalEventId: "ind-002",
        title: "Bengaluru Hackers Fest & AI Hackathon 2026",
        name: "Bengaluru Hackers Fest & AI Hackathon 2026",
        description:
          "36-hour continuous hackathon hosted in Koramangala, Bengaluru. Build cutting-edge web3, AI agents, and cloud applications with 10 Lakh INR total prize pool.",
        category: "Hackathon",
        date: new Date(Date.now() + 86400000 * 8), // +8 days
        endDate: new Date(Date.now() + 86400000 * 9),
        location: "Koramangala Tech Park, Bengaluru",
        city: "Bengaluru",
        imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80",
        bookingUrl: "https://insider.in/bengaluru-hackers-fest-ai-hackathon-2026/event",
        source: "Paytm Insider",
        sourceUrl: "https://insider.in/all-events-in-bengaluru",
        tags: ["Hackathon", "Bengaluru", "PaytmInsider", "Coding"],
        isExternal: true,
        organizer: "Paytm Insider Tech Community",
      },
      {
        externalEventId: "ind-003",
        title: "Smart India Student Innovation Hackathon 2026",
        name: "Smart India Student Innovation Hackathon 2026",
        description:
          "National student hackathon powered by Devfolio. Solve real-world problem statements in healthcare, smart cities, and sustainable energy.",
        category: "Hackathon",
        date: new Date(Date.now() + 86400000 * 12), // +12 days
        location: "IIT Delhi & Virtual Devfolio Arena",
        city: "Delhi",
        imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80",
        bookingUrl: "https://smartindia2026.devfolio.co",
        source: "Devfolio",
        sourceUrl: "https://devfolio.co/hackathons",
        tags: ["Devfolio", "Hackathon", "Student", "Delhi"],
        isExternal: true,
        organizer: "Devfolio & Ministry of Education",
      },
      {
        externalEventId: "ind-004",
        title: "IIT Bombay Annual Techfest & Robotics Expo 2026",
        name: "IIT Bombay Annual Techfest & Robotics Expo 2026",
        description:
          "Asia's largest science and technology festival organized by IIT Bombay. Includes Robowars, Coding Competitions, Keynotes, and Tech Exhibitions.",
        category: "Workshop",
        date: new Date(Date.now() + 86400000 * 15), // +15 days
        location: "IIT Bombay Campus, Powai, Mumbai",
        city: "Mumbai",
        imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80",
        bookingUrl: "https://techfest.org/registration",
        source: "University Website",
        sourceUrl: "https://techfest.org",
        tags: ["IITBombay", "Robotics", "Mumbai", "Techfest"],
        isExternal: true,
        organizer: "IIT Bombay Techfest Team",
      },
      {
        externalEventId: "ind-005",
        title: "Chandigarh AI & Robotics Student Workshop 2026",
        name: "Chandigarh AI & Robotics Student Workshop 2026",
        description:
          "Hands-on workshop covering ROS2, Computer Vision with OpenCV, and Neural Networks for autonomous navigation.",
        category: "Workshop",
        date: new Date(Date.now() + 86400000 * 18), // +18 days
        location: "University Auditorium, Chandigarh",
        city: "Chandigarh",
        imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80",
        bookingUrl: "https://chandigarh-ai-workshop2026.org/register",
        source: "Official Website",
        sourceUrl: "https://chandigarh-ai-workshop2026.org",
        tags: ["AI", "Robotics", "Chandigarh", "Workshop"],
        isExternal: true,
        organizer: "Chandigarh Tech Guild",
      },
    ];

    let filtered = indianEvents;

    if (params.city && params.city !== "all") {
      const cityLower = params.city.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          (e.city && e.city.toLowerCase() === cityLower) ||
          e.location.toLowerCase().includes(cityLower)
      );
    }

    if (params.category && params.category !== "all") {
      const catLower = params.category.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.category.toLowerCase() === catLower ||
          e.tags.some((t) => t.toLowerCase() === catLower)
      );
    }

    if (params.source && params.source !== "all") {
      const sourceLower = params.source.toLowerCase();
      filtered = filtered.filter((e) => e.source.toLowerCase().includes(sourceLower));
    }

    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(kw) ||
          e.description.toLowerCase().includes(kw) ||
          (e.city && e.city.toLowerCase().includes(kw)) ||
          e.tags.some((t) => t.toLowerCase().includes(kw))
      );
    }

    return filtered;
  }
}

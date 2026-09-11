import connectToDatabase from "../lib/db";
import Event from "../models/Event";
import { isValidExternalUrl } from "../lib/utils";

async function seedEvents() {
  console.log("🌱 Starting UniNest Real Events & Campus Events Seeding...\n");

  try {
    await connectToDatabase();
    console.log("✅ Connected to MongoDB.");

    const seedData = [
      {
        title: "SEMICON India 2026",
        name: "SEMICON India 2026",
        description:
          "India's flagship semiconductor and electronics event bringing together students, researchers, startups, industry leaders and policymakers to explore innovation, chip design and the future of India's semiconductor ecosystem.",
        category: "Technology",
        date: new Date("2026-09-17"),
        endDate: new Date("2026-09-19"),
        location: "Yashobhoomi (IICC), Dwarka",
        city: "New Delhi",
        source: "SEMICON India",
        sourceUrl: "https://www.semiconindia.org/",
        bookingUrl: "https://portal.semiconindia.org/register",
        tags: ["Semiconductor", "Technology", "AI", "Electronics", "Innovation", "Students"],
        isExternal: true,
        imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
      },
      {
        title: "SEMICON India Hackathon 2026",
        name: "SEMICON India Hackathon 2026",
        description:
          "A national semiconductor hackathon where students build innovative solutions for real-world industry problems, gain mentorship and compete at India's flagship semiconductor event.",
        category: "Hackathon",
        date: new Date("2026-09-17"),
        endDate: new Date("2026-09-19"),
        location: "Yashobhoomi (IICC)",
        city: "New Delhi",
        source: "SEMICON India",
        sourceUrl: "https://www.semiconindia.org/special-features-2026/Hackathon",
        bookingUrl: "https://www.semiconindia.org/special-features-2026/Hackathon",
        tags: ["Hackathon", "Semiconductor", "Engineering", "Innovation", "Students", "Technology"],
        isExternal: true,
        imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80",
      },
      {
        title: "Bengaluru Tech Summit 2026",
        name: "Bengaluru Tech Summit 2026",
        description:
          "A major technology and innovation event bringing together startups, developers, researchers, investors and technology leaders to explore AI, emerging technologies and innovation.",
        category: "Technology",
        date: new Date("2026-11-17"),
        endDate: new Date("2026-11-19"),
        location: "Bangalore International Exhibition Centre (BIEC)",
        city: "Bengaluru",
        source: "Bengaluru Tech Summit",
        sourceUrl: "https://www.bengalurutechsummit.com/",
        bookingUrl: "https://bengalurutechsummit.com/bts-2026/public/tickets/bts-2026/register",
        tags: ["AI", "Technology", "Startups", "Innovation", "DeepTech", "Students"],
        isExternal: true,
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
      },
      {
        title: "CYBER KUSHTI 2026",
        name: "CYBER KUSHTI 2026",
        description:
          "A national Cybersecurity and Artificial Intelligence hackathon focused on cybersecurity challenges, AI, adversarial reasoning and digital innovation.",
        category: "Hackathon",
        date: new Date("2026-09-15"),
        endDate: new Date("2026-10-10"),
        location: "Online and Dr. Ambedkar International Centre",
        city: "New Delhi",
        source: "NIELIT / NCCDFI",
        sourceUrl: "https://nccdfi.nielitkohima.in/register-hackathon",
        bookingUrl: "", // Registration unverified -> leave empty, use sourceUrl
        tags: ["Cybersecurity", "AI", "Hackathon", "Students", "Digital Forensics", "Technology"],
        isExternal: true,
        imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
      },
      {
        title: "5G Hackathon 2026",
        name: "5G Hackathon 2026",
        description:
          "A national innovation challenge focused on developing practical 5G technology solutions with prototype development, mentorship and national-level recognition.",
        category: "Hackathon",
        date: new Date("2026-09-14"),
        endDate: new Date("2026-10-01"),
        location: "India",
        city: "Multiple Cities",
        source: "Department of Telecommunications",
        sourceUrl: "https://eservices.dot.gov.in/5ghackathon/",
        bookingUrl: "", // Use sourceUrl
        tags: ["5G", "Telecom", "Hackathon", "Innovation", "Engineering", "Technology"],
        isExternal: true,
        imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80",
      },
      {
        title: "World Congress on Nanomedicine 2026",
        name: "World Congress on Nanomedicine 2026",
        description:
          "An international conference exploring nanomedicine, advanced healthcare technologies and emerging research in medical science and engineering.",
        category: "Technology",
        date: new Date("2026-09-27"),
        endDate: new Date("2026-09-30"),
        location: "New Delhi",
        city: "New Delhi",
        source: "World Congress on Nanomedicine",
        sourceUrl: "https://wcn2026.in/index.html",
        bookingUrl: "https://wcn2026.in/index.html",
        tags: ["Nanotechnology", "Healthcare", "Research", "Technology", "Innovation", "Science"],
        isExternal: true,
        imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&auto=format&fit=crop&q=80",
      },
      {
        title: "Introduction to Generative AI Workshop",
        name: "Introduction to Generative AI Workshop",
        description:
          "A hands-on workshop introducing students to Generative AI, Gemini API, prompt engineering and AI application development.",
        category: "Workshop",
        date: new Date("2026-09-20"),
        location: "Computer Science Department",
        city: "Campus",
        source: "UniNest Campus",
        bookingUrl: "",
        sourceUrl: "",
        tags: ["AI", "Gemini", "Workshop", "Programming", "Students"],
        isExternal: false,
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      },
      {
        title: "Campus Hackathon 2026",
        name: "Campus Hackathon 2026",
        description:
          "A student innovation hackathon where teams build technology solutions for real-world campus and community problems.",
        category: "Hackathon",
        date: new Date("2026-10-05"),
        endDate: new Date("2026-10-06"),
        location: "University Auditorium",
        city: "Campus",
        source: "UniNest Campus",
        bookingUrl: "",
        sourceUrl: "",
        tags: ["Hackathon", "Students", "Technology", "Innovation", "Programming"],
        isExternal: false,
        imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80",
      },
      {
        title: "Python and Data Science Bootcamp",
        name: "Python and Data Science Bootcamp",
        description:
          "A beginner-friendly hands-on bootcamp covering Python programming, data analysis, visualization and introductory machine learning.",
        category: "Workshop",
        date: new Date("2026-10-12"),
        location: "Computer Science Lab",
        city: "Campus",
        source: "UniNest Campus",
        bookingUrl: "",
        sourceUrl: "",
        tags: ["Python", "Data Science", "AI", "Workshop", "Students"],
        isExternal: false,
        imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
      },
    ];

    let insertedCount = 0;
    let skippedCount = 0;

    for (const evt of seedData) {
      // Validate URLs before saving
      const validBooking = isValidExternalUrl(evt.bookingUrl) ? evt.bookingUrl : "";
      const validSource = isValidExternalUrl(evt.sourceUrl) ? evt.sourceUrl : "";

      const query = {
        source: evt.source,
        name: evt.title,
        date: evt.date,
      };

      const existing = await Event.findOne(query);

      if (existing) {
        console.log(`⏭️ Skipped duplicate: "${evt.title}" (${evt.source})`);
        skippedCount++;
      } else {
        await Event.create({
          ...evt,
          bookingUrl: validBooking,
          registrationLink: validBooking,
          sourceUrl: validSource,
        });
        console.log(`✅ Inserted event: "${evt.title}" (${evt.source} | City: ${evt.city})`);
        insertedCount++;
      }
    }

    console.log(`\n🎉 Event Seeding Complete: ${insertedCount} inserted, ${skippedCount} skipped.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error running event seed script:", error);
    process.exit(1);
  }
}

seedEvents();

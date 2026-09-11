import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Load .env.local variables manually if not already present
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envConfig = fs.readFileSync(envLocalPath, 'utf-8');
  for (const line of envConfig.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...values] = trimmed.split('=');
      const val = values.join('=').trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

import connectToDatabase from '../lib/db';
import User from '../models/User';
import Item from '../models/Item';
import Event from '../models/Event';
import Opportunity from '../models/Opportunity';
import Match from '../models/Match';
import Conversation from '../models/Conversation';

async function seed() {
  console.log('🌱 Starting UniNest Database Seeding...');

  try {
    await connectToDatabase();
    console.log('✅ Connected to MongoDB.');

    // Clear existing collections
    console.log('🧹 Cleaning existing database records...');
    await User.deleteMany({});
    await Item.deleteMany({});
    await Event.deleteMany({});
    await Opportunity.deleteMany({});
    await Match.deleteMany({});
    await Conversation.deleteMany({});

    // 1. Seed Users
    console.log('👤 Seeding Users...');
    const demoUser = await User.create({
      clerkId: 'user_demo123',
      name: 'Alex Rivera',
      email: 'alex.rivera@campus.edu',
      skills: ['React', 'Python'],
      interests: ['AI', 'Machine Learning', 'Web Development'],
      bio: 'Computer Science sophomore passionate about building AI-powered web applications and campus tools.',
      projects: ['AI Study Planner', 'Campus Event Finder'],
    });

    const userSarah = await User.create({
      clerkId: 'user_sarah456',
      name: 'Sarah Chen',
      email: 'sarah.chen@campus.edu',
      skills: ['Python', 'TensorFlow', 'Data Analysis'],
      interests: ['AI', 'Data Science', 'Robotics'],
      bio: 'Data Science major researching deep learning applications.',
      projects: ['Predictive Campus Bus Tracker'],
    });

    const userMarcus = await User.create({
      clerkId: 'user_marcus789',
      name: 'Marcus Johnson',
      email: 'marcus.j@campus.edu',
      skills: ['UI/UX Design', 'Figma', 'React'],
      interests: ['Product Design', 'Web Development', 'Mobile Apps'],
      bio: 'Design student building intuitive user interfaces for open-source campus initiatives.',
      projects: ['Campus Map UI Redesign'],
    });

    console.log(`✅ Seeded ${await User.countDocuments()} Users (Demo User: ${demoUser.name}).`);

    // 2. Seed Events (6-8 items including AI Workshop tagged with ["AI", "Python", "LLM"])
    console.log('📅 Seeding Events...');
    const now = new Date();
    const futureDate = (daysAhead: number) => new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const eventsData = [
      {
        createdBy: userSarah._id,
        name: 'AI & LLM Hands-On Workshop',
        description: 'Explore building custom autonomous agents using Gemini API, Python, and Next.js. Bring your laptop!',
        date: futureDate(3),
        time: '4:00 PM - 6:00 PM',
        location: 'Engineering Building Room 302',
        category: 'Technology',
        tags: ['AI', 'Python', 'LLM'],
        organizer: 'AI Student Society',
        registrationLink: '',
        bookingUrl: '',
        isExternal: false,
      },
      {
        createdBy: demoUser._id,
        name: 'Annual Campus Hackathon 2026',
        description: '48-hour coding marathon to build innovative solutions for campus life and sustainability. $5,000 in prizes!',
        date: futureDate(10),
        time: '9:00 AM Kickoff',
        location: 'Student Center Grand Ballroom',
        category: 'Hackathon',
        tags: ['Coding', 'Hackathon', 'Innovation'],
        organizer: 'Campus Tech Club',
        registrationLink: '',
        bookingUrl: '',
        isExternal: false,
      },
      {
        createdBy: userMarcus._id,
        name: 'Web Dev & UI/UX Design Sprint',
        description: 'Collaborative workshop on design systems, Figma component design, and modern React styling patterns.',
        date: futureDate(5),
        time: '2:00 PM - 4:30 PM',
        location: 'Design Studio Lab B',
        category: 'Design',
        tags: ['Web Development', 'Figma', 'React'],
        organizer: 'Campus Design Collective',
        registrationLink: '',
        bookingUrl: '',
        isExternal: false,
      },
      {
        createdBy: userSarah._id,
        name: 'Machine Learning Reading Group',
        description: 'Deep dive paper presentation on recent transformer architectures and multimodal reasoning engines.',
        date: futureDate(7),
        time: '5:00 PM - 6:30 PM',
        location: 'Library Seminar Room 4',
        category: 'Academics',
        tags: ['Machine Learning', 'AI', 'Research'],
        organizer: 'Data Science Lab',
        registrationLink: '',
        bookingUrl: '',
        isExternal: false,
      },
      {
        createdBy: demoUser._id,
        name: 'Campus Career & Tech Networking Fair',
        description: 'Meet recruiters from top tech companies, research labs, and local startups hiring interns for summer 2026.',
        date: futureDate(14),
        time: '10:00 AM - 3:00 PM',
        location: 'Campus Recreation Center',
        category: 'Career',
        tags: ['Networking', 'Internships', 'Career'],
        organizer: 'Career Services',
        registrationLink: '',
        bookingUrl: '',
        isExternal: false,
      },
      {
        createdBy: userMarcus._id,
        name: 'Data Science & Python Bootcamp',
        description: 'Beginner-friendly tutorial covering Pandas, NumPy, and basic data visualization techniques.',
        date: futureDate(12),
        time: '3:00 PM - 5:00 PM',
        location: 'Science Building Lab 101',
        category: 'Workshop',
        tags: ['Python', 'Data Science'],
        organizer: 'Tech Education Guild',
        registrationLink: '',
        bookingUrl: '',
        isExternal: false,
      },
      {
        createdBy: userSarah._id,
        name: 'Outdoor Campus Esports & Gaming Night',
        description: 'Casual tournament featuring Super Smash Bros, Rocket League, and FIFA with free food and merch giveaways.',
        date: futureDate(8),
        time: '6:00 PM - 9:00 PM',
        location: 'Campus Quad Lawn',
        category: 'Social',
        tags: ['Gaming', 'Social', 'Esports'],
        organizer: 'Student Union Association',
        registrationLink: '',
        bookingUrl: '',
        isExternal: false,
      },
    ];

    await Event.insertMany(eventsData);
    console.log(`✅ Seeded ${await Event.countDocuments()} Events.`);

    // 3. Seed Opportunities (6-8 items including AI Hackathon Team requiring ["React", "Python"])
    console.log('🚀 Seeding Opportunities...');
    const opportunitiesData = [
      {
        createdBy: userSarah._id,
        title: 'AI Hackathon Team Member Needed',
        description: 'Building an intelligent agentic study assistant for the upcoming Campus Hackathon. Looking for full-stack developers skilled in React and Python backend integration.',
        requiredSkills: ['React', 'Python'],
        tags: ['AI', 'Hackathon', 'Web'],
        category: 'Hackathon',
        teamSize: 4,
        interestedUsers: [demoUser._id],
      },
      {
        createdBy: demoUser._id,
        title: 'Full Stack Developer for Campus Marketplace',
        description: 'Developing a peer-to-peer student textbook & gear trade platform. Need experience in React, Node.js, and MongoDB.',
        requiredSkills: ['React', 'Node.js', 'MongoDB'],
        tags: ['Startup', 'Web', 'FullStack'],
        category: 'Project',
        teamSize: 3,
        interestedUsers: [userMarcus._id],
      },
      {
        createdBy: userSarah._id,
        title: 'ML Researcher for Computer Vision Project',
        description: 'Campus research lab looking for an undergraduate assistant to work on real-time object detection models using PyTorch.',
        requiredSkills: ['Python', 'PyTorch', 'OpenCV'],
        tags: ['AI', 'Machine Learning', 'Research'],
        category: 'Research',
        teamSize: 2,
        interestedUsers: [],
      },
      {
        createdBy: userMarcus._id,
        title: 'UI/UX Designer for Student Portal',
        description: 'Redesigning the student organization directory. Looking for a designer proficient in Figma wireframing and interactive prototypes.',
        requiredSkills: ['Figma', 'UI/UX', 'Prototyping'],
        tags: ['Design', 'Frontend'],
        category: 'Design',
        teamSize: 2,
        interestedUsers: [],
      },
      {
        createdBy: demoUser._id,
        title: 'Backend Python Engineer for Study Assistant',
        description: 'Looking for a teammate to build fast FastAPI microservices and vector retrieval APIs for a smart notes summarizer.',
        requiredSkills: ['Python', 'FastAPI', 'MongoDB'],
        tags: ['Backend', 'AI'],
        category: 'Project',
        teamSize: 3,
        interestedUsers: [userSarah._id],
      },
      {
        createdBy: userSarah._id,
        title: 'Data Analyst for Student Government Association',
        description: 'Analyze campus survey data and prepare visual dashboards for administration policy recommendations.',
        requiredSkills: ['Python', 'Pandas', 'SQL'],
        tags: ['Data Science', 'Analytics'],
        category: 'Research',
        teamSize: 2,
        interestedUsers: [],
      },
      {
        createdBy: userMarcus._id,
        title: 'Mobile App Developer (React Native)',
        description: 'Building a cross-platform mobile app for campus shuttle tracking. Need React Native or React experience.',
        requiredSkills: ['React', 'React Native', 'TypeScript'],
        tags: ['Mobile', 'App'],
        category: 'Project',
        teamSize: 3,
        interestedUsers: [demoUser._id],
      },
    ];

    await Opportunity.insertMany(opportunitiesData);
    console.log(`✅ Seeded ${await Opportunity.countDocuments()} Opportunities.`);

    // 4. Seed Lost/Found Items (8-10 items including deliberate matching pair)
    console.log('🔍 Seeding Lost & Found Items...');
    const pastDate = (daysAgo: number) => new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Matching pair item 1 (Lost)
    const lostHeadphones = await Item.create({
      userId: demoUser._id,
      type: 'lost',
      itemName: 'Black JBL Headphones',
      description: 'Over-ear black JBL Wireless Headphones left on study desk near north windows in Central Library 2nd floor.',
      category: 'Electronics',
      location: 'Central Library 2nd Floor',
      date: pastDate(2),
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      contactPreference: 'email',
      status: 'active',
    });

    // Matching pair item 2 (Found)
    const foundHeadphones = await Item.create({
      userId: userSarah._id,
      type: 'found',
      itemName: 'Black JBL Wireless Headphones',
      description: 'Found black JBL over-ear wireless headphones turned in at the Central Library 2nd floor reception desk.',
      category: 'Electronics',
      location: 'Central Library 2nd Floor',
      date: pastDate(1),
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      contactPreference: 'email',
      status: 'active',
    });

    const otherItems = [
      {
        userId: userMarcus._id,
        type: 'lost',
        itemName: 'Blue Hydro Flask Water Bottle',
        description: '32oz Cobalt Blue Hydro Flask with stickers (GitHub, React, NASA) left near cafeteria entrance.',
        category: 'Personal Belongings',
        location: 'Student Union Cafeteria',
        date: pastDate(3),
        imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
        contactPreference: 'email',
        status: 'active',
      },
      {
        userId: userSarah._id,
        type: 'found',
        itemName: 'Silver Macbook Pro Charger (USB-C)',
        description: 'Found 96W Apple USB-C power adapter plugged in wall near whiteboard in Room 201.',
        category: 'Electronics',
        location: 'Engineering Building Room 201',
        date: pastDate(1),
        imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500',
        contactPreference: 'email',
        status: 'active',
      },
      {
        userId: demoUser._id,
        type: 'lost',
        itemName: 'TI-84 Plus CE Graphing Calculator',
        description: 'Black TI-84 Plus CE calculator in black slide case with name initial "AR" written inside batter door.',
        category: 'Electronics',
        location: 'Math Department Lab',
        date: pastDate(4),
        imageUrl: '',
        contactPreference: 'email',
        status: 'active',
      },
      {
        userId: userMarcus._id,
        type: 'found',
        itemName: 'Set of Keys with Red Campus Lanyard',
        description: 'Found set of 3 keys including dorm key and bike lock key attached to red University lanyard at bus shelter.',
        category: 'Keys',
        location: 'North Campus Bus Stop',
        date: pastDate(2),
        imageUrl: '',
        contactPreference: 'email',
        status: 'active',
      },
      {
        userId: userSarah._id,
        type: 'lost',
        itemName: 'Denim Jacket with Enamel Pins',
        description: 'Vintage blue denim jacket with space & anime enamel pins left on wooden bench in quad.',
        category: 'Clothing',
        location: 'Campus Quad Benches',
        date: pastDate(5),
        imageUrl: '',
        contactPreference: 'email',
        status: 'active',
      },
      {
        userId: demoUser._id,
        type: 'found',
        itemName: 'Black Leather Wallet with Student ID',
        description: 'Found black tri-fold leather wallet turned in to gym staff desk. Contains student ID.',
        category: 'Valuables',
        location: 'Gym Locker Room',
        date: pastDate(1),
        imageUrl: '',
        contactPreference: 'email',
        status: 'active',
      },
      {
        userId: userMarcus._id,
        type: 'lost',
        itemName: 'AirPods Pro in Clear Case',
        description: 'AirPods Pro 2nd Gen inside clear silicone protective case dropped near main atrium entrance.',
        category: 'Electronics',
        location: 'Science Building Atrium',
        date: pastDate(3),
        imageUrl: '',
        contactPreference: 'email',
        status: 'active',
      },
    ];

    await Item.insertMany(otherItems);
    console.log(`✅ Seeded ${await Item.countDocuments()} Lost/Found Items (Deliberate match pair included).`);

    // 5. Seed Matches (Deliberate match pair record)
    console.log('🧩 Seeding Item Match Record...');
    await Match.create({
      sourceItemId: lostHeadphones._id,
      targetItemId: foundHeadphones._id,
      score: 88,
      reasons: [
        'Exact item name & brand match: Black JBL Headphones',
        'Same location: Central Library 2nd Floor',
        'Matching timeframe (lost 2 days ago, found 1 day ago)',
      ],
    });
    console.log(`✅ Seeded ${await Match.countDocuments()} Match record.`);

    // 6. Seed Conversations
    console.log('💬 Seeding Demo Conversation...');
    await Conversation.create({
      userId: demoUser._id,
      messages: [
        {
          role: 'user',
          content: 'Hi! Can you recommend any upcoming AI workshops or team opportunities on campus for someone who knows Python and React?',
          timestamp: pastDate(1),
        },
        {
          role: 'assistant',
          content: 'Hello Alex! Based on your profile (Python & React), here are top recommendations:\n1. 📅 **AI & LLM Hands-On Workshop** (Engineering Rm 302)\n2. 🚀 **AI Hackathon Team Member Needed** (Looking for React + Python skills)\n\nWould you like more details on either of these?',
          timestamp: pastDate(1),
        },
      ],
    });
    console.log(`✅ Seeded ${await Conversation.countDocuments()} Conversation record.`);

    console.log('\n🎉 Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  }
}

seed();

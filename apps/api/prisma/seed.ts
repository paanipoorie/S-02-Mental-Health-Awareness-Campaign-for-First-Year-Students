import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Clean existing records in dependency order
  console.log('Cleaning existing records...');
  await prisma.emailOTP.deleteMany({});
  await prisma.adminActionLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.mentorAssignment.deleteMany({});
  await prisma.workshopRegistration.deleteMany({});
  await prisma.meetingAttendee.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  await prisma.chatThread.deleteMany({});
  await prisma.postReply.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.emotionLog.deleteMany({});
  await prisma.resource.deleteMany({});
  await prisma.workshop.deleteMany({});
  await prisma.meeting.deleteMany({});
  await prisma.mentorProfile.deleteMany({});
  await prisma.anonymousIdentity.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Database cleaned successfully.');

  // 2. Generate common password hashes
  console.log('Generating password hashes...');
  const commonPasswordHash = await bcrypt.hash('Password123!', 12);
  const adminPasswordHash = await bcrypt.hash('hell0@dm1n', 12);

  // 3. Create Admin
  const admin = await prisma.user.create({
    data: {
      universityEmail: 'admin@cuchd.in',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log('Seeded Admin:', admin.universityEmail);

  // 4. Create standard test accounts required by Playwright tests
  console.log('Seeding standard test student and mentor...');
  const standardStudent = await prisma.user.create({
    data: {
      universityEmail: 'student1@cuchd.in',
      passwordHash: commonPasswordHash,
      role: Role.STUDENT,
      isActive: true,
      anonymousIdentity: {
        create: {
          displayName: 'Gentle Butterfly',
          avatarSeed: 9999,
        },
      },
    },
    include: {
      anonymousIdentity: true,
    },
  });
  console.log('Seeded Standard Student:', standardStudent.universityEmail);

  const standardMentor = await prisma.user.create({
    data: {
      universityEmail: 'mentor1@cuchd.in',
      passwordHash: commonPasswordHash,
      role: Role.MENTOR,
      isVerifiedMentor: true,
      isActive: true,
      mentorProfile: {
        create: {
          department: 'Psychology',
          bio: 'Specializing in anxiety, stress management and academic coaching.',
          specialties: ['anxiety', 'stress management', 'academics'],
          availabilityStatus: 'AVAILABLE',
        },
      },
    },
  });
  console.log('Seeded Standard Mentor:', standardMentor.universityEmail);

  // Assign standard student to standard mentor
  await prisma.mentorAssignment.create({
    data: {
      studentId: standardStudent.id,
      mentorId: standardMentor.id,
    },
  });

  // 5. Create 29 First-Year Students with CU admission-like email formats
  console.log('Seeding 29 student accounts (26bcs00001 - 26bcs00029)...');
  const studentEmails: string[] = [];
  for (let idx = 1; idx <= 29; idx++) {
    const padded = String(idx).padStart(5, '0');
    studentEmails.push(`26bcs${padded}@cuchd.in`);
  }

  const studentDisplayNames = [
    'Calm Sparrow', 'Brave Willow', 'Bright River', 'Gentle Meadow', 'Wise Star',
    'Kind Panda', 'Warm Koala', 'Silent Otter', 'Resilient Robin', 'Peaceful Deer',
    'Happy Fox', 'Patient Dolphin', 'Strong Badger', 'Noble Squirrel', 'Creative Owl',
    'Eager Rabbit', 'Joyful Bear', 'Sincere Turtle', 'Lively Butterfly', 'Friendly Swan',
    'Honest Ocean', 'Loyal Forest', 'Thoughtful Mountain', 'Cheerful Breeze', 'Quiet Cloud',
    'Bold Sunflower', 'Pleasant Pebble', 'Polite Feather', 'Generous Leaf', 'Helpful Acorn'
  ];

  const students: any[] = [standardStudent];
  const anonymousIdentities: any[] = [standardStudent.anonymousIdentity];
  for (let i = 0; i < studentEmails.length; i++) {
    const email = studentEmails[i];
    const displayName = studentDisplayNames[i];
    const studentUser = await prisma.user.create({
      data: {
        universityEmail: email,
        passwordHash: commonPasswordHash,
        role: Role.STUDENT,
        isActive: true,
        createdAt: new Date(Date.now() - 3600000 * 24), // 1 day ago
        anonymousIdentity: {
          create: {
            displayName,
            avatarSeed: 1000 + i,
            createdAt: new Date(Date.now() - 3600000 * 24), // 1 day ago
          },
        },
      },
      include: {
        anonymousIdentity: true,
      },
    });
    students.push(studentUser);
    anonymousIdentities.push(studentUser.anonymousIdentity);
  }
  console.log(`Seeded ${studentEmails.length} additional student accounts.`);

  // 6. Create 4 Senior Peer Mentors
  console.log('Seeding senior peer mentors (24bcs50001 - 24bcs50004)...');
  const mentorEmails = [
    '24bcs50001@cuchd.in',
    '24bcs50002@cuchd.in',
    '24bcs50003@cuchd.in',
    '24bcs50004@cuchd.in',
  ];

  const mentorDetails = [
    {
      department: 'Computer Science & Engineering',
      bio: 'Hi! I am a 3rd year CSE student. I love helping juniors manage their study load and tackle coding anxiety. Feel free to connect!',
      specialties: ['academics', 'exam anxiety', 'time management'],
      availabilityStatus: 'AVAILABLE',
    },
    {
      department: 'Psychology & Counseling',
      bio: 'Junior Psychology major. Passionate about mental wellness, adaptation to hostel life, and coping with homesickness.',
      specialties: ['hostel life', 'homesickness', 'friendships'],
      availabilityStatus: 'AVAILABLE',
    },
    {
      department: 'Information Technology',
      bio: '3rd year IT student here. Let us talk about balancing academics, coding, and maintaining a healthy social life.',
      specialties: ['relationships', 'general stress', 'mindfulness'],
      availabilityStatus: 'BUSY',
    },
    {
      department: 'Business Administration',
      bio: 'Final year BBA student. I can help with goal setting, schedules, and managing exam stress.',
      specialties: ['career guidance', 'time management', 'academics'],
      availabilityStatus: 'BUSY',
    },
  ];

  const mentors: any[] = [standardMentor];
  for (let i = 0; i < mentorEmails.length; i++) {
    const detail = mentorDetails[i];
    const mentorUser = await prisma.user.create({
      data: {
        universityEmail: mentorEmails[i],
        passwordHash: commonPasswordHash,
        role: Role.MENTOR,
        isVerifiedMentor: true,
        isActive: true,
        createdAt: new Date(Date.now() - 3600000 * 24), // 1 day ago
        mentorProfile: {
          create: {
            department: detail.department,
            bio: detail.bio,
            specialties: detail.specialties,
            availabilityStatus: detail.availabilityStatus as any,
          },
        },
      },
    });
    mentors.push(mentorUser);
  }
  console.log(`Seeded ${mentorEmails.length} additional mentor accounts.`);

  // 7. Mentor Assignments (Assign remaining students to mentors, 5 per mentor)
  console.log('Seeding mentor assignments...');
  // Note: students[0] (standardStudent) is already assigned to mentors[0] (standardMentor).
  // Let's assign the rest (students index 1 to 30) to mentors (index 0 to 6).
  for (let i = 1; i < students.length; i++) {
    const student = students[i];
    const mentor = mentors[i % mentors.length];
    await prisma.mentorAssignment.create({
      data: {
        studentId: student.id,
        mentorId: mentor.id,
      },
    });
  }
  console.log('Mentor assignments completed.');

  // 8. Seed Emotion Logs for Students (over the last 7 days)
  console.log('Seeding student emotion logs...');
  const now = new Date();
  // Create 7 logs for the first 15 students to populate history charts nicely
  for (let i = 0; i < 15; i++) {
    const anonIdentity = anonymousIdentities[i];
    for (let day = 0; day < 7; day++) {
      const logDate = new Date();
      logDate.setDate(now.getDate() - day);

      let emotion: string;
      let urgency: string | null = null;

      if (i % 3 === 0) {
        // High stress student
        emotion = ['STRESSED', 'ANXIOUS', 'BURNT_OUT', 'OVERWHELMED', 'LONELY'][day % 5];
        urgency = ['MEDIUM', 'HIGH'][day % 2];
      } else if (i % 3 === 1) {
        // Struggling / homesick student
        emotion = ['HOMESICK', 'LONELY', 'CONFUSED', 'SCARED', 'STRESSED'][day % 5];
        urgency = ['LOW', 'MEDIUM'][day % 2];
      } else {
        // Happy student
        emotion = ['HAPPY', 'EXCITED', 'HAPPY', 'HAPPY', 'EXCITED'][day % 5];
      }

      await prisma.emotionLog.create({
        data: {
          anonymousIdentityId: anonIdentity.id,
          emotion: emotion as any,
          urgencyLevel: urgency as any,
          context: 'STANDALONE',
          createdAt: logDate,
        },
      });
    }
  }
  console.log('Student emotion logs seeded.');

  // 9. Forum Posts and Replies
  console.log('Seeding forum posts and replies...');
  // Post 1: Hostel Adjustment (Student 1)
  const post1 = await prisma.post.create({
    data: {
      anonymousIdentityId: anonymousIdentities[1].id, // Calm Sparrow
      title: 'Struggling with hostel food and missing home-cooked meals',
      body: "It has been two weeks since I joined the hostel. The food in the mess is really hard to adjust to, and I keep missing my mom's cooking. Anyone else feeling homesick and struggling to settle in? How do you cope with this?",
      category: 'HOSTEL',
      emotion: 'HOMESICK',
      urgencyLevel: 'LOW',
    },
  });

  // Replies to Post 1
  await prisma.postReply.create({
    data: {
      postId: post1.id,
      anonymousIdentityId: anonymousIdentities[2].id, // Brave Willow (student reply)
      body: 'I totally feel you. First week was the worst. It gets slightly better once you find a few local eating joints with friends, but yeah, nothing beats home food.',
    },
  });
  await prisma.postReply.create({
    data: {
      postId: post1.id,
      anonymousIdentityId: mentors[2].id, // Mentor reply (uses user ID as anonymousIdentityId)
      body: 'It is very normal to feel homesick, especially around meal times. Try decorating your room with some pictures from home, or cooking a small meal with friends if you have access to a pantry. Hang in there!',
    },
  });

  // Post 2: Exam Panic (Student 4)
  const post2 = await prisma.post.create({
    data: {
      anonymousIdentityId: anonymousIdentities[4].id, // Gentle Meadow
      title: 'First mid-term exams are coming up and I am absolutely terrified',
      body: "I don't know how to prepare for college level exams. The syllabus seems huge compared to school. I am getting panic attacks thinking about failing. How do you guys study for these?",
      category: 'EXAMS',
      emotion: 'ANXIOUS',
      urgencyLevel: 'HIGH',
    },
  });

  // Replies to Post 2
  await prisma.postReply.create({
    data: {
      postId: post2.id,
      anonymousIdentityId: anonymousIdentities[5].id, // Wise Star (student reply)
      body: "Same here. I look at the slides and nothing goes in. Let's form a study group?",
    },
  });
  await prisma.postReply.create({
    data: {
      postId: post2.id,
      anonymousIdentityId: mentors[1].id, // Mentor 1 reply
      body: "Hey, deep breaths! College exams are more about understanding concepts rather than rote learning. Start by breaking down the syllabus into smaller topics. I'm hosting office hours tomorrow, feel free to join!",
    },
  });

  // Post 3: Time Management (Student 7)
  const post3 = await prisma.post.create({
    data: {
      anonymousIdentityId: anonymousIdentities[7].id, // Warm Koala
      title: 'How to manage time between lectures, labs, and coding practice?',
      body: 'Classes run from 9 to 5, and by the time I get back to my room, I am too exhausted to do anything. I want to learn web development but I can\'t find any time. Any schedules or tips?',
      category: 'TIME_MANAGEMENT',
      emotion: 'STRESSED',
      urgencyLevel: 'MEDIUM',
    },
  });

  // Reply to Post 3
  await prisma.postReply.create({
    data: {
      postId: post3.id,
      anonymousIdentityId: mentors[3].id, // Mentor 3 reply
      body: 'Try the 2-hour rule: set aside just 2 hours every evening, block all social media, and focus. Also, weekends are your best friend for longer project work. Consistency is key!',
    },
  });

  // Post 4: Loneliness (Student 10)
  const post4 = await prisma.post.create({
    data: {
      anonymousIdentityId: anonymousIdentities[10].id, // Peaceful Deer
      title: 'Feeling lonely. Having a hard time making friends in the new batch.',
      body: 'Everyone seems to have formed their groups already. I am quite introverted, so I find it hard to just walk up to people and start chatting. I end up eating lunch alone every day. It is getting really depressing.',
      category: 'FRIENDS',
      emotion: 'LONELY',
      urgencyLevel: 'MEDIUM',
    },
  });

  // Replies to Post 4
  await prisma.postReply.create({
    data: {
      postId: post4.id,
      anonymousIdentityId: anonymousIdentities[12].id, // Patient Dolphin
      body: "I'm in the same boat. If you want to grab lunch together sometime, let me know! We can be introverted together.",
    },
  });
  await prisma.postReply.create({
    data: {
      postId: post4.id,
      anonymousIdentityId: mentors[2].id, // Mentor 2 reply
      body: 'Making friends takes time, don\'t pressure yourself. A great way is to join some campus clubs or volunteer groups. It is much easier to talk to people when you are working on a common activity.',
    },
  });
  console.log('Forum posts and replies seeded.');

  // 10. Chat Threads and Messages
  console.log('Seeding chat threads and messages...');
  // Chat 1: Student 1 (Calm Sparrow) <-> Mentor 1 (Standard Mentor)
  const thread1 = await prisma.chatThread.create({
    data: {
      studentIdentityId: anonymousIdentities[1].id,
      mentorId: mentors[1].id,
      status: 'ACTIVE',
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        chatThreadId: thread1.id,
        senderType: 'ANONYMOUS',
        senderId: anonymousIdentities[1].id,
        body: 'Hello, I wanted to ask about how to approach my assigned mentor.',
      },
      {
        chatThreadId: thread1.id,
        senderType: 'MENTOR',
        senderId: mentors[1].id,
        body: "Hey there! I am your assigned mentor. You can share anything you're comfortable with. How has your first week been?",
      },
      {
        chatThreadId: thread1.id,
        senderType: 'ANONYMOUS',
        senderId: anonymousIdentities[1].id,
        body: "It's been a bit overwhelming. The campus is huge and I keep getting lost, and the classes are very fast paced.",
      },
      {
        chatThreadId: thread1.id,
        senderType: 'MENTOR',
        senderId: mentors[1].id,
        body: "That's completely understandable. The transition to university is a big step. Let's set up a quick call or meet at the library to go over your schedule?",
      },
    ],
  });

  // Chat 2: Student 4 (Gentle Meadow) <-> Mentor 2
  const thread2 = await prisma.chatThread.create({
    data: {
      studentIdentityId: anonymousIdentities[4].id,
      mentorId: mentors[2].id,
      status: 'ACTIVE',
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        chatThreadId: thread2.id,
        senderType: 'ANONYMOUS',
        senderId: anonymousIdentities[4].id,
        body: "Hi, I've been feeling extremely homesick and can't sleep at night.",
      },
      {
        chatThreadId: thread2.id,
        senderType: 'MENTOR',
        senderId: mentors[2].id,
        body: "I'm sorry to hear that. Sleep trouble is very common when adjusting to a new environment. Have you tried any relaxation exercises before bed?",
      },
      {
        chatThreadId: thread2.id,
        senderType: 'ANONYMOUS',
        senderId: anonymousIdentities[4].id,
        body: 'No, I usually just scroll on my phone until I pass out, but then I wake up tired.',
      },
      {
        chatThreadId: thread2.id,
        senderType: 'MENTOR',
        senderId: mentors[2].id,
        body: "Ah, the phone screen can actually keep your brain awake. Try putting it away 30 minutes before sleep and reading a book or listening to calm music instead. Let's check in again in a couple of days.",
      },
    ],
  });
  console.log('Chat threads and messages seeded.');

  // 11. Meetings and Attendees
  console.log('Seeding meetings and RSVPs...');
  // Meeting 1: Peer Discussion (hosted by Student 1, Calm Sparrow)
  const datePeerMeet = new Date();
  datePeerMeet.setDate(now.getDate() + 2); // 2 days in future
  datePeerMeet.setHours(17, 0, 0, 0);

  const meeting1 = await prisma.meeting.create({
    data: {
      title: 'Peer Discussion: Coping with Hostel Life',
      description: 'An informal meetup for hostellers to share their experiences, struggles, and tips on adjusting to hostel life and mess food.',
      hostType: 'STUDENT',
      hostIdentityId: anonymousIdentities[1].id,
      date: datePeerMeet,
      time: '17:00',
      durationMinutes: 60,
      meetingType: 'OFFLINE',
      location: 'Hostel Block A Common Room',
      category: 'PEER_DISCUSSION',
    },
  });

  // Attend meeting 1
  await prisma.meetingAttendee.createMany({
    data: [
      { meetingId: meeting1.id, anonymousIdentityId: anonymousIdentities[2].id },
      { meetingId: meeting1.id, anonymousIdentityId: anonymousIdentities[3].id },
      { meetingId: meeting1.id, anonymousIdentityId: anonymousIdentities[10].id },
    ],
  });

  // Meeting 2: Calculus Prep Group (hosted by Student 5, Wise Star)
  const dateCalcGroup = new Date();
  dateCalcGroup.setDate(now.getDate() + 3); // 3 days in future
  dateCalcGroup.setHours(14, 0, 0, 0);

  const meeting2 = await prisma.meeting.create({
    data: {
      title: 'Study Group: Calculus 1 Prep',
      description: "Let's practice limits, derivatives, and solve previous year mid-term questions together before the exams.",
      hostType: 'STUDENT',
      hostIdentityId: anonymousIdentities[5].id,
      date: dateCalcGroup,
      time: '14:00',
      durationMinutes: 90,
      meetingType: 'ONLINE',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      category: 'STUDY_GROUP',
    },
  });

  // Attend meeting 2
  await prisma.meetingAttendee.createMany({
    data: [
      { meetingId: meeting2.id, anonymousIdentityId: anonymousIdentities[4].id },
      { meetingId: meeting2.id, anonymousIdentityId: anonymousIdentities[7].id },
      { meetingId: meeting2.id, anonymousIdentityId: anonymousIdentities[8].id },
    ],
  });

  // Meeting 3: Mentor Office Hours (hosted by Mentor 1)
  const dateOfficeHours = new Date();
  dateOfficeHours.setDate(now.getDate() + 1); // Tomorrow
  dateOfficeHours.setHours(16, 0, 0, 0);

  const meeting3 = await prisma.meeting.create({
    data: {
      title: 'Mentor Office Hours: Managing Exam Stress',
      description: 'Drop-in session for anyone feeling overwhelmed by the upcoming mid-terms. We will discuss study planning and stress relief strategies.',
      hostType: 'MENTOR',
      hostUserId: mentors[0].id,
      date: dateOfficeHours,
      time: '16:00',
      durationMinutes: 45,
      meetingType: 'OFFLINE',
      location: 'Counseling Block Room 102',
      category: 'MENTOR_OFFICE_HOURS',
    },
  });

  // Attend meeting 3
  await prisma.meetingAttendee.createMany({
    data: [
      { meetingId: meeting3.id, anonymousIdentityId: anonymousIdentities[4].id },
      { meetingId: meeting3.id, anonymousIdentityId: anonymousIdentities[5].id },
    ],
  });
  console.log('Meetings and attendees seeded.');

  // 12. Workshops and Registrations
  console.log('Seeding workshops and registrations...');
  // Workshop 1: Mindfulness (hosted by Mentor 5)
  const dateMindfulness = new Date();
  dateMindfulness.setDate(now.getDate() + 5); // 5 days in future
  dateMindfulness.setHours(11, 0, 0, 0);

  const workshop1 = await prisma.workshop.create({
    data: {
      title: 'Mindfulness and Meditation for Beginners',
      description: 'Learn simple breathing techniques, guided meditation, and mindfulness practices that you can incorporate into your busy student schedule to reduce daily anxiety.',
      mentorId: mentors[3].id,
      date: dateMindfulness,
      time: '11:00',
      durationMinutes: 60,
      meetingType: 'ONLINE',
      meetingLink: 'https://meet.google.com/xyz-pdq-rst',
      category: 'MINDFULNESS',
      maxAttendees: 30,
    },
  });

  // Register for workshop 1
  await prisma.workshopRegistration.createMany({
    data: [
      { workshopId: workshop1.id, anonymousIdentityId: anonymousIdentities[1].id },
      { workshopId: workshop1.id, anonymousIdentityId: anonymousIdentities[2].id },
      { workshopId: workshop1.id, anonymousIdentityId: anonymousIdentities[10].id },
      { workshopId: workshop1.id, anonymousIdentityId: anonymousIdentities[12].id },
      { workshopId: workshop1.id, anonymousIdentityId: anonymousIdentities[15].id },
    ],
  });

  // Workshop 2: Time Management (hosted by Mentor 4)
  const dateWorkshopTime = new Date();
  dateWorkshopTime.setDate(now.getDate() + 7); // 7 days in future
  dateWorkshopTime.setHours(15, 0, 0, 0);

  const workshop2 = await prisma.workshop.create({
    data: {
      title: 'Time Management Masterclass',
      description: 'Struggling to balance lectures, assignments, and self-care? Learn how to prioritize tasks, build weekly schedules, and stop procrastinating.',
      mentorId: mentors[4].id,
      date: dateWorkshopTime,
      time: '15:00',
      durationMinutes: 90,
      meetingType: 'OFFLINE',
      location: 'Seminar Hall 2, Block B',
      category: 'TIME_MANAGEMENT',
      maxAttendees: 50,
    },
  });

  // Register for workshop 2
  await prisma.workshopRegistration.createMany({
    data: [
      { workshopId: workshop2.id, anonymousIdentityId: anonymousIdentities[7].id },
      { workshopId: workshop2.id, anonymousIdentityId: anonymousIdentities[8].id },
      { workshopId: workshop2.id, anonymousIdentityId: anonymousIdentities[4].id },
      { workshopId: workshop2.id, anonymousIdentityId: anonymousIdentities[3].id },
      { workshopId: workshop2.id, anonymousIdentityId: anonymousIdentities[1].id },
    ],
  });
  console.log('Workshops and registrations seeded.');

  // 13. Helpful Resources
  console.log('Seeding university wellness resources...');
  await prisma.resource.createMany({
    data: [
      {
        title: 'Campus Counseling Services',
        description: 'Professional and confidential counseling services available for all students.',
        category: 'COUNSELING_CENTER',
        content: 'The Chandigarh University Student Counseling Center offers individual counseling, group therapy, and crisis intervention. You can book an appointment by emailing counseling@cuchd.in or visiting Block D, Room 204. Working hours: Monday to Friday, 9:00 AM to 5:00 PM.',
        link: 'mailto:counseling@cuchd.in',
        isActive: true,
      },
      {
        title: '24/7 National Mental Health Helpline (KIRAN)',
        description: 'Free, confidential support line available anytime.',
        category: 'EXTERNAL_HELPLINES',
        content: 'If you need immediate support, call the national helpline KIRAN at 1800-599-0019 (toll-free). Available 24 hours a day, 7 days a week, in multiple languages for psychological support and mental health management.',
        link: 'tel:18005990019',
        isActive: true,
      },
      {
        title: 'Guide: Managing Academic Stress',
        description: 'A self-help booklet on handling study load and exams.',
        category: 'SELF_HELP_PDFS',
        content: 'This guide contains step-by-step instructions on creating study planners, dealing with perfectionism, and deep breathing exercises for exam day. Download the full PDF from the university portal.',
        link: 'https://example.com/managing_academic_stress.pdf',
        isActive: true,
      },
      {
        title: 'Healthy Sleep Habits for Students',
        description: 'Tips to improve your sleep quality during college.',
        category: 'SLEEP_HYGIENE',
        content: '1. Maintain a regular sleep schedule.\n2. Avoid caffeine after 4 PM.\n3. Make your room dark and quiet.\n4. Limit screen time before bed.\n5. Don\'t study in your bed.',
        link: null,
        isActive: true,
      },
    ],
  });
  console.log('Resources seeded.');

  console.log('Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error('Error during seed run:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

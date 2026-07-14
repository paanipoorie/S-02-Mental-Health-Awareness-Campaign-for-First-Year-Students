import {
  PrismaClient,
  Role,
  EmotionType,
  UrgencyLevel,
  EmotionContext,
  PostCategory,
  ChatStatus,
  MeetingType,
  MeetingHostType,
  MeetingCategory,
  WorkshopCategory,
  WorkshopRegistrationStatus,
  ResourceCategory,
  MentorAvailabilityStatus,
} from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting database...');

  // Delete in reverse order of dependencies to prevent foreign key errors
  await prisma.adminActionLog.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.workshopRegistration.deleteMany();
  await prisma.workshop.deleteMany();
  await prisma.meetingAttendee.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatThread.deleteMany();
  await prisma.postReply.deleteMany();
  await prisma.post.deleteMany();
  await prisma.emotionLog.deleteMany();
  await prisma.mentorProfile.deleteMany();
  await prisma.anonymousIdentity.deleteMany();
  await prisma.user.deleteMany();

  console.log('Database reset complete. Seeding data...');

  const passwordHash = await bcrypt.hash('Password123', 12);

  // 1. Seed Admin
  const admin = await prisma.user.create({
    data: {
      universityEmail: 'admin@university.edu',
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log('Seeded Admin:', admin.universityEmail);

  // 2. Seed Mentors
  const mentor1 = await prisma.user.create({
    data: {
      universityEmail: 'mentor1@university.edu',
      passwordHash,
      role: Role.MENTOR,
      isVerifiedMentor: true,
      isActive: true,
      mentorProfile: {
        create: {
          department: 'Psychology',
          bio: 'Specializing in anxiety, stress management and academic coaching.',
          specialties: ['anxiety', 'stress management', 'academics'],
          availabilityStatus: MentorAvailabilityStatus.AVAILABLE,
        },
      },
    },
    include: {
      mentorProfile: true,
    },
  });

  const mentor2 = await prisma.user.create({
    data: {
      universityEmail: 'mentor2@university.edu',
      passwordHash,
      role: Role.MENTOR,
      isVerifiedMentor: true,
      isActive: true,
      mentorProfile: {
        create: {
          department: 'Counseling',
          bio: 'Experienced student advisor focusing on hostel transitions and relationships.',
          specialties: ['relationships', 'homesickness', 'time management'],
          availabilityStatus: MentorAvailabilityStatus.AVAILABLE,
        },
      },
    },
    include: {
      mentorProfile: true,
    },
  });
  console.log('Seeded Mentors:', mentor1.universityEmail, mentor2.universityEmail);

  // 3. Seed Students
  const student1 = await prisma.user.create({
    data: {
      universityEmail: 'student1@university.edu',
      passwordHash,
      role: Role.STUDENT,
      isActive: true,
      anonymousIdentity: {
        create: {
          displayName: 'Anonymous Brave Sparrow',
          avatarSeed: 1001,
        },
      },
    },
    include: {
      anonymousIdentity: true,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      universityEmail: 'student2@university.edu',
      passwordHash,
      role: Role.STUDENT,
      isActive: true,
      anonymousIdentity: {
        create: {
          displayName: 'Anonymous Calm Dolphin',
          avatarSeed: 1002,
        },
      },
    },
    include: {
      anonymousIdentity: true,
    },
  });

  const student3 = await prisma.user.create({
    data: {
      universityEmail: 'student3@university.edu',
      passwordHash,
      role: Role.STUDENT,
      isActive: true,
      anonymousIdentity: {
        create: {
          displayName: 'Anonymous Gentle Otter',
          avatarSeed: 1003,
        },
      },
    },
    include: {
      anonymousIdentity: true,
    },
  });
  console.log('Seeded Students:', student1.universityEmail, student2.universityEmail, student3.universityEmail);

  const student1IdentityId = student1.anonymousIdentity!.id;
  const student2IdentityId = student2.anonymousIdentity!.id;
  const student3IdentityId = student3.anonymousIdentity!.id;

  // 4. Seed Emotion Logs
  await prisma.emotionLog.createMany({
    data: [
      {
        anonymousIdentityId: student1IdentityId,
        emotion: EmotionType.LONELY,
        urgencyLevel: UrgencyLevel.MEDIUM,
        context: EmotionContext.POST,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        anonymousIdentityId: student2IdentityId,
        emotion: EmotionType.ANXIOUS,
        urgencyLevel: UrgencyLevel.HIGH,
        context: EmotionContext.STANDALONE,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        anonymousIdentityId: student3IdentityId,
        emotion: EmotionType.HAPPY,
        urgencyLevel: UrgencyLevel.LOW,
        context: EmotionContext.STANDALONE,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    ],
  });
  console.log('Seeded Emotion Logs.');

  // 5. Seed Posts & Replies
  const post1 = await prisma.post.create({
    data: {
      anonymousIdentityId: student1IdentityId,
      title: 'Feeling lonely in the hostel',
      body: 'It is my first week here and I haven\'t made any friends. I really miss home and family.',
      category: PostCategory.HOMESICKNESS,
      emotion: EmotionType.LONELY,
      urgencyLevel: UrgencyLevel.MEDIUM,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      anonymousIdentityId: student2IdentityId,
      title: 'Overwhelmed by academic load',
      body: 'The midterms are approaching and I don\'t think I can pass the calculus courses. There is too much syllabus.',
      category: PostCategory.ACADEMICS,
      emotion: EmotionType.ANXIOUS,
      urgencyLevel: UrgencyLevel.HIGH,
    },
  });

  // Replies to Post 1
  await prisma.postReply.createMany({
    data: [
      {
        postId: post1.id,
        anonymousIdentityId: mentor2.id, // Mentor uses User.id
        body: 'Hey, it\'s completely normal to feel this way in your first week. Transitioning is tough. I suggest visiting the student lounge or joining the local board game club this Friday. Hang in there!',
      },
      {
        postId: post1.id,
        anonymousIdentityId: student2IdentityId, // Student uses AnonymousIdentity.id
        body: 'I feel the exact same way. We can catch up in the cafeteria if you want.',
      },
    ],
  });

  // Replies to Post 2
  await prisma.postReply.createMany({
    data: [
      {
        postId: post2.id,
        anonymousIdentityId: mentor1.id,
        body: 'Hi, please don\'t panic. There are peer tutoring sessions every Tuesday in the library. Let me know if you would like me to connect you with a math tutor.',
      },
    ],
  });
  console.log('Seeded Posts and Replies.');

  // 6. Seed Meetings
  const meeting1 = await prisma.meeting.create({
    data: {
      title: 'Mindfulness and Stress Management Session',
      description: 'A small group session to learn breathing exercises and mindfulness techniques to tackle midterm anxiety.',
      hostType: MeetingHostType.MENTOR,
      hostUserId: mentor1.id,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days in future
      time: '14:00',
      durationMinutes: 60,
      meetingType: MeetingType.ONLINE,
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      category: MeetingCategory.MENTOR_OFFICE_HOURS,
      attendees: {
        createMany: {
          data: [
            { anonymousIdentityId: student1IdentityId },
            { anonymousIdentityId: student2IdentityId },
          ],
        },
      },
    },
  });

  const meeting2 = await prisma.meeting.create({
    data: {
      title: 'First-Year Hostel Meetup',
      description: 'An informal meetup for students living in Hostel A to chat and share experiences.',
      hostType: MeetingHostType.STUDENT,
      hostIdentityId: student3IdentityId,
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day in future
      time: '18:30',
      durationMinutes: 90,
      meetingType: MeetingType.OFFLINE,
      location: 'Hostel A Common Room',
      category: MeetingCategory.SOCIAL,
      attendees: {
        createMany: {
          data: [
            { anonymousIdentityId: student1IdentityId },
            { anonymousIdentityId: student2IdentityId },
          ],
        },
      },
    },
  });
  console.log('Seeded Meetings and RSVPs.');

  // 7. Seed Workshops
  const workshop1 = await prisma.workshop.create({
    data: {
      title: 'Navigating Academic Stress & Building Resilience',
      description: 'A campus-wide workshop on handling workload transition from high school to university, time management tips, and peer networking.',
      mentorId: mentor2.id,
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days in future
      time: '10:00',
      durationMinutes: 120,
      meetingType: MeetingType.OFFLINE,
      location: 'Seminar Hall B, Student Center',
      category: WorkshopCategory.STRESS_MANAGEMENT,
      maxAttendees: 50,
      registrations: {
        createMany: {
          data: [
            { anonymousIdentityId: student1IdentityId, status: WorkshopRegistrationStatus.REGISTERED },
            { anonymousIdentityId: student2IdentityId, status: WorkshopRegistrationStatus.REGISTERED },
            { anonymousIdentityId: student3IdentityId, status: WorkshopRegistrationStatus.REGISTERED },
          ],
        },
      },
    },
  });
  console.log('Seeded Workshops and Registrations.');

  // 8. Seed Resources (At least one for each of the 9 categories)
  await prisma.resource.createMany({
    data: [
      {
        title: 'University Counseling Center Contacts',
        description: 'Professional individual counseling services for students.',
        category: ResourceCategory.COUNSELING_CENTER,
        content: 'Location: Student Center, 3rd Floor. Hours: Mon-Fri 9:00 AM - 5:00 PM. Email: counseling@university.edu',
        isActive: true,
      },
      {
        title: 'Campus Security & Crisis Hotline',
        description: '24/7 emergency helpline for safety and immediate support.',
        category: ResourceCategory.EMERGENCY_CONTACTS,
        content: 'Hotline: +1 (555) 0199 (Security), Emergency Clinic: +1 (555) 0188',
        isActive: true,
      },
      {
        title: 'Academic & Faculty Advising Program',
        description: 'Mentorship program for curriculum guidance and course adjustment.',
        category: ResourceCategory.FACULTY_ADVISORS,
        content: 'Contact your department head to be assigned a faculty advisor, or visit Admin block Room 102.',
        isActive: true,
      },
      {
        title: 'Student Welfare Office Services',
        description: 'Grants, accommodation, and general welfare assistance.',
        category: ResourceCategory.STUDENT_WELFARE,
        content: 'Visit student-welfare.university.edu or contact welfare@university.edu.',
        isActive: true,
      },
      {
        title: 'Campus Recreational & Peer Support Clubs',
        description: 'Directory of student-run clubs and interest groups.',
        category: ResourceCategory.CAMPUS_CLUBS,
        content: 'Join clubs like Board Games, Hiking, or Debate to meet new peers. Visit Student Council office.',
        isActive: true,
      },
      {
        title: 'Self-Help Resource: Coping with Anxiety',
        description: 'A short downloadable guide on cognitive behavior tips.',
        category: ResourceCategory.SELF_HELP_PDFS,
        content: 'PDF available at https://university.edu/resources/anxiety_guide.pdf',
        link: 'https://university.edu/resources/anxiety_guide.pdf',
        isActive: true,
      },
      {
        title: 'Daily Stress Management Exercises',
        description: 'Simple daily habits to keep your stress levels under control.',
        category: ResourceCategory.STRESS_MANAGEMENT,
        content: '1. 4-7-8 breathing technique.\n2. Progressive muscle relaxation.\n3. 15-minute screen-free walks.',
        isActive: true,
      },
      {
        title: 'Sleep Hygiene Guidelines',
        description: 'Steps to ensure high-quality rest during exams.',
        category: ResourceCategory.SLEEP_HYGIENE,
        content: 'Maintain a sleep schedule, limit caffeine after 2:00 PM, and turn off mobile screens 30 minutes before sleep.',
        isActive: true,
      },
      {
        title: 'National Crisis Helplines',
        description: 'Free, confidential 24/7 external support lines.',
        category: ResourceCategory.EXTERNAL_HELPLINES,
        content: 'National Suicide Prevention Lifeline: 988. Crisis Text Line: Text HOME to 741741.',
        isActive: true,
      },
    ],
  });
  console.log('Seeded Resource Hub.');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed run:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

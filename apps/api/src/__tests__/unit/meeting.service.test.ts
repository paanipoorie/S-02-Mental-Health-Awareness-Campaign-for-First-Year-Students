import { describe, it, expect } from 'vitest';
import { prisma } from '../../prisma/client.js';
import { meetingService, workshopService } from '../../services/meeting.service.js';
import { Role } from '@campus-peer-support/shared-types';

async function createStudentAndMentor(studentEmail: string, mentorEmail: string) {
  const student = await prisma.user.create({
    data: {
      universityEmail: studentEmail,
      passwordHash: 'pass',
      role: Role.STUDENT,
    },
  });
  const studentAnon = await prisma.anonymousIdentity.create({
    data: {
      userId: student.id,
      displayName: `Anon ${studentEmail.split('@')[0]}`,
      avatarSeed: 123,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      universityEmail: studentEmail.replace('@', '2@'),
      passwordHash: 'pass',
      role: Role.STUDENT,
    },
  });
  const student2Anon = await prisma.anonymousIdentity.create({
    data: {
      userId: student2.id,
      displayName: `Anon2 ${studentEmail.split('@')[0]}`,
      avatarSeed: 124,
    },
  });

  const mentor = await prisma.user.create({
    data: {
      universityEmail: mentorEmail,
      passwordHash: 'pass',
      role: Role.MENTOR,
      isVerifiedMentor: true,
    },
  });

  return { student, studentAnon, student2, student2Anon, mentor };
}

describe('Meeting and Workshop Service Unit Tests', () => {
  it('should verify meeting scheduling, RSVP toggles, and cancellation', async () => {
    const { student, student2 } = await createStudentAndMentor(
      'meetunit1@cuchd.in',
      'meetunit2@cuchd.in'
    );

    // Create meeting
    const meeting = await meetingService.createMeeting(student.id, Role.STUDENT, {
      title: 'Group Study Unit',
      description: 'Preparing for final calculus quiz.',
      date: new Date(Date.now() + 86400000),
      time: '15:00',
      durationMinutes: 60,
      meetingType: 'ONLINE',
      meetingLink: 'https://meet.google.com/xyz',
      location: null,
      category: 'STUDY_GROUP',
      hostType: 'STUDENT',
    });

    expect(meeting).toBeDefined();
    expect(meeting.title).toBe('Group Study Unit');

    // RSVP using student2 (has anonymous identity)
    const rsvpResult = await meetingService.rsvpMeeting(meeting.id, student2.id);
    expect(rsvpResult.rsvped).toBe(true);

    // Cancel Meeting
    const cancelResult = await meetingService.cancelMeeting(meeting.id, student.id, Role.STUDENT);
    expect(cancelResult.deleted).toBe(true);
  });

  it('should verify workshop scheduling, registration, and attendance tracking', async () => {
    const { student, studentAnon, mentor } = await createStudentAndMentor(
      'meetunit3@cuchd.in',
      'meetunit4@cuchd.in'
    );

    // Create workshop
    const workshop = await workshopService.createWorkshop(mentor.id, {
      title: 'Mindfulness Unit',
      description: 'Stress management practices.',
      date: new Date(Date.now() + 86400000),
      time: '10:00',
      durationMinutes: 90,
      meetingType: 'OFFLINE',
      location: 'Room 502',
      meetingLink: null,
      category: 'STRESS_MANAGEMENT',
      maxAttendees: 5,
      resources: null,
    });

    expect(workshop).toBeDefined();
    expect(workshop.title).toBe('Mindfulness Unit');

    // Register
    const reg = await workshopService.registerWorkshop(workshop.id, student.id);
    expect(reg).toBeDefined();
    expect(reg.status).toBe('REGISTERED');

    // Mark Attendance
    const attendance = await workshopService.markAttendance(
      workshop.id,
      studentAnon.id,
      'ATTENDED' as any
    );
    expect(attendance.status).toBe('ATTENDED');
    expect(attendance.attendedAt).not.toBeNull();

    // Cancel Workshop
    const cancelResult = await workshopService.cancelWorkshop(workshop.id, mentor.id);
    expect(cancelResult.deleted).toBe(true);
  });
});

import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const baseURL = 'http://localhost:3001/api';
  console.log('Global setup running. Connecting to backend at:', baseURL);

  const studentEmail = 'student1@cuchd.in';
  const mentorEmail = 'mentor1@cuchd.in';
  const password = 'Password123!';

  // Helper to register a user
  const registerUser = async (email: string, role: string) => {
    try {
      // 1. Send OTP
      const sendOtpRes = await fetch(`${baseURL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ universityEmail: email, password, role }),
      });
      if (sendOtpRes.status === 409) {
        console.log(`${email} already exists, skipping registration.`);
        return null;
      }
      const sendOtpData = (await sendOtpRes.json()) as any;
      if (!sendOtpData.success) {
        throw new Error(`Failed to send OTP for ${email}: ${JSON.stringify(sendOtpData)}`);
      }
      const devOtp = sendOtpData.data.devOtp;
      if (!devOtp) {
        throw new Error(`No devOtp returned for ${email}`);
      }

      // 2. Verify OTP
      const verifyRes = await fetch(`${baseURL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ universityEmail: email, otp: devOtp }),
      });
      const verifyData = (await verifyRes.json()) as any;
      if (!verifyData.success) {
        throw new Error(`Failed to verify OTP for ${email}: ${JSON.stringify(verifyData)}`);
      }
      console.log(`Successfully registered ${email} (${role})`);
      return verifyData.data.user.id;
    } catch (e) {
      console.error(`Error registering ${email}:`, e);
      throw e;
    }
  };

  // Register student and mentor
  const studentId = await registerUser(studentEmail, 'STUDENT');
  const mentorId = await registerUser(mentorEmail, 'MENTOR');

  // Let's get the mentor ID and student ID if they were already registered
  let actualMentorId = mentorId;
  let actualStudentId = studentId;

  // Login as Admin to get Admin Token
  const adminLoginRes = await fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ universityEmail: 'admin@cuchd.in', password: 'hell0@dm1n' }),
  });
  const adminLoginData = (await adminLoginRes.json()) as any;
  if (!adminLoginData.success) {
    throw new Error(`Admin login failed: ${JSON.stringify(adminLoginData)}`);
  }
  const adminToken = adminLoginData.data.accessToken;

  // If mentor was already registered, find their ID
  if (!actualMentorId) {
    const mentorsRes = await fetch(`${baseURL}/admin/mentors?search=${mentorEmail}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const mentorsData = (await mentorsRes.json()) as any;
    if (mentorsData.success && mentorsData.data.length > 0) {
      actualMentorId = mentorsData.data[0].id;
    }
  }

  if (!actualStudentId) {
    const studentsRes = await fetch(`${baseURL}/admin/users?role=STUDENT&search=${studentEmail}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const studentsData = (await studentsRes.json()) as any;
    if (studentsData.success && studentsData.data.length > 0) {
      actualStudentId = studentsData.data[0].id;
    }
  }

  // Verify Mentor via Admin
  if (actualMentorId) {
    const verifyMentorRes = await fetch(`${baseURL}/admin/mentors/${actualMentorId}/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ isVerified: true }),
    });
    const verifyMentorData = (await verifyMentorRes.json()) as any;
    console.log(
      `Mentor verification status for ${mentorEmail}:`,
      verifyMentorRes.status,
      verifyMentorData
    );
  }

  // Login as Mentor to update profile and set Availability
  const mentorLoginRes = await fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ universityEmail: mentorEmail, password }),
  });
  const mentorLoginData = (await mentorLoginRes.json()) as any;
  if (mentorLoginData.success) {
    const mentorToken = mentorLoginData.data.accessToken;

    // Update Mentor Profile
    const profileRes = await fetch(`${baseURL}/mentors/me/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mentorToken}`,
      },
      body: JSON.stringify({
        department: 'Psychology',
        bio: 'Specializing in anxiety, stress management and academic coaching.',
        specialties: ['anxiety', 'stress management', 'academics'],
      }),
    });
    console.log('Mentor Profile Update Status:', profileRes.status);

    // Set Availability to AVAILABLE
    const availRes = await fetch(`${baseURL}/mentors/me/availability`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mentorToken}`,
      },
      body: JSON.stringify({ availabilityStatus: 'AVAILABLE' }),
    });
    console.log('Mentor Availability Update Status:', availRes.status);
  }

  // Login as Student to create a post so that post-based tests work!
  const studentLoginRes = await fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ universityEmail: studentEmail, password }),
  });
  const studentLoginData = (await studentLoginRes.json()) as any;
  if (studentLoginData.success) {
    const studentToken = studentLoginData.data.accessToken;

    // Create a Post
    const postRes = await fetch(`${baseURL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        title: 'Feeling lonely in the hostel',
        body: "It is my first week here and I haven't made any friends. I really miss home and family.",
        category: 'HOMESICKNESS',
        emotion: 'LONELY',
        urgencyLevel: 'MEDIUM',
      }),
    });
    console.log('Test Post Creation Status:', postRes.status);
  }
}

export default globalSetup;

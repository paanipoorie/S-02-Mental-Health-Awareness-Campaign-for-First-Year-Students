import { Resend } from 'resend';
import { env, isDevelopment, isTest } from '../config/env.js';

const resend = new Resend(env.RESEND_API_KEY);

export interface EmailOTPData {
  email: string;
  otp: string;
  role: string;
}

/**
 * Sends an OTP email via Resend.
 *
 * When RESEND_API_KEY is empty (e.g. local development or automated tests) the
 * email is not actually delivered. Instead the OTP is logged to the server
 * console so it can be read by a developer or retrieved by a test helper.
 * Production always sends via Resend and never exposes OTPs.
 */
export async function sendOTPEmail(data: EmailOTPData): Promise<void> {
  const { email, otp, role } = data;

  const roleLabel = role === 'MENTOR' ? 'Peer Mentor' : 'Student';

  if (!env.RESEND_API_KEY) {
    if (isDevelopment || isTest) {
      console.log(`[OTP][DEV] OTP for ${email}: ${otp}`);
      return;
    }
    throw new Error('RESEND_API_KEY is not configured');
  }

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject: `Your Campus Peer Support OTP - ${roleLabel} Registration`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #ffffff; border-radius: 12px; padding: 40px; border: 1px solid #e5e7eb;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0;">Campus Peer Support</h1>
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0 0;">Mental Health Awareness Campaign</p>
            </div>

            <div style="background: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
              <p style="color: #374151; font-size: 16px; margin: 0 0 16px;">Your One-Time Password (OTP) for <strong>${roleLabel}</strong> registration:</p>
              <div style="text-align: center;">
                <span style="display: inline-block; background: #111827; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 16px 32px; border-radius: 8px; font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;">${otp}</span>
              </div>
              <p style="color: #6b7280; font-size: 13px; margin: 16px 0 0; text-align: center;">This code expires in 10 minutes.</p>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px;">
              If you didn't request this code, please ignore this email. Your account will not be created without verification.
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

            <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
              Campus Peer Support Platform<br>
              Chandigarh University
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
Campus Peer Support - OTP Verification

Your One-Time Password (OTP) for ${roleLabel} registration: ${otp}

This code expires in 10 minutes.

If you didn't request this code, please ignore this email. Your account will not be created without verification.

---
Campus Peer Support Platform
Chandigarh University
    `,
  });
}

export async function sendMentorApprovalEmail(email: string, approved: boolean): Promise<void> {
  const status = approved ? 'approved' : 'rejected';
  const statusLabel = approved ? 'Approved' : 'Rejected';

  if (!env.RESEND_API_KEY) {
    if (isDevelopment || isTest) {
      console.log(`[EMAIL][DEV] Mentor application ${status} email sent to ${email}`);
      return;
    }
    throw new Error('RESEND_API_KEY is not configured');
  }

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject: `Mentor Application ${statusLabel} - Campus Peer Support`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #ffffff; border-radius: 12px; padding: 40px; border: 1px solid #e5e7eb;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0;">Campus Peer Support</h1>
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0 0;">Mental Health Awareness Campaign</p>
            </div>

            <div style="background: ${approved ? '#f0fdf4' : '#fef2f2'}; border-radius: 8px; padding: 24px; margin-bottom: 24px; border: 1px solid ${approved ? '#bbf7d0' : '#fecaca'};">
              <h2 style="color: ${approved ? '#166534' : '#991b1b'}; font-size: 20px; font-weight: 700; margin: 0 0 16px; text-align: center;">Application ${statusLabel}</h2>
              <p style="color: ${approved ? '#166534' : '#991b1b'}; font-size: 16px; margin: 0; text-align: center;">
                ${approved
                  ? 'Congratulations! Your mentor application has been approved. You now have full access to all mentoring features.'
                  : 'Your mentor application has been reviewed and was not approved at this time. Please contact the administration for more information.'}
              </p>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px; text-align: center;">
              ${approved ? 'Log in to access your mentor dashboard and start supporting students.' : 'You can still access the platform as a student.'}
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

            <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
              Campus Peer Support Platform<br>
              Chandigarh University
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
Campus Peer Support - Mentor Application ${statusLabel}

${approved
  ? 'Congratulations! Your mentor application has been approved. You now have full access to all mentoring features.'
  : 'Your mentor application has been reviewed and was not approved at this time. Please contact the administration for more information.'}

${approved ? 'Log in to access your mentor dashboard and start supporting students.' : 'You can still access the platform as a student.'}

---
Campus Peer Support Platform
Chandigarh University
    `,
  });
}


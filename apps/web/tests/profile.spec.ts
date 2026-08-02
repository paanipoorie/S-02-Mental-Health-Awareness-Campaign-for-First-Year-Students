import { test, expect } from '@playwright/test';

const STUDENT_EMAIL = 'student1@university.edu';
const PASSWORD = 'Password123';

async function waitHydration(page) {
  await page.waitForTimeout(1500);
}

async function login(page, email, password, targetUrl) {
  await page.goto('/login');
  await page.waitForSelector('input[type="email"]');
  await waitHydration(page);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(targetUrl);
}

test.describe('Anonymous Profile & Peer Messaging E2E Tests', () => {
  test('Should navigate to profile, view details, and open peer chat via Message action', async ({ page }) => {
    // 1. Login as Student
    await login(page, STUDENT_EMAIL, PASSWORD, '**/dashboard');

    // 2. Navigate to posts feed
    await page.goto('/posts');
    await page.waitForSelector('.profile-link');

    // Get the name and selector of the first profile link
    const firstProfileLink = page.locator('.profile-link').first();
    const profileName = await firstProfileLink.textContent();
    console.log('Clicking profile of:', profileName);

    // 3. Click profile link
    await firstProfileLink.click();
    await page.waitForURL('**/profile/**');

    // 4. Verify Anonymous Profile details
    await expect(page.locator('h1').filter({ hasText: profileName || '' }).first()).toBeVisible();
    await expect(page.locator('text=Joined').first()).toBeVisible();
    await expect(page.locator('text=Posts').first()).toBeVisible();
    await expect(page.locator('text=Replies').first()).toBeVisible();
    await expect(page.locator('text=Discussions').first()).toBeVisible();

    // 5. If it is NOT the student's own profile, click Message button
    const messageBtn = page.locator('button:has-text("Message")').first();
    if (await messageBtn.isVisible()) {
      await messageBtn.click();
      await page.waitForURL('**/chat?threadId=**');
      
      // Verify chat window header has the user name
      await expect(page.locator('p.truncate.text-sm.font-bold')).toContainText(profileName || '');
      
      // Type and send a message to verify chat functions
      await page.fill('textarea[placeholder="Type a confidential message..."]', 'Hello, this is a peer message!');
      await page.click('button:has-text("Send")');
      
      // Verify message is sent and visible
      await expect(page.locator('text=Hello, this is a peer message!')).toBeVisible();
    }
  });
});

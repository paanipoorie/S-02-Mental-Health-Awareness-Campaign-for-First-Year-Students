import { test, expect } from '@playwright/test';

const MENTOR_EMAIL = 'mentor1@cuchd.in';
const PASSWORD = 'Password123!';

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

test.describe('Mentor Initiating Chat from Anonymous Profile E2E Tests', () => {
  test('Should allow mentor to visit student profile and start a chat thread', async ({ page }) => {
    // 1. Login as Mentor
    await login(page, MENTOR_EMAIL, PASSWORD, '**/mentor/dashboard');

    // 2. Navigate to posts feed
    await page.goto('/posts');
    await page.waitForSelector('.profile-link');

    // Get the name and selector of the first profile link
    const firstProfileLink = page.locator('.profile-link').first();
    const profileName = await firstProfileLink.textContent();
    console.log('Clicking student profile of:', profileName);

    // 3. Click profile link
    await firstProfileLink.click();
    await page.waitForURL('**/profile/**');

    // 4. Verify Anonymous Profile details
    await expect(page.locator('h1').filter({ hasText: profileName || '' }).first()).toBeVisible();
    await expect(page.locator('text=Joined').first()).toBeVisible();

    // 5. Click Message button
    const messageBtn = page.locator('button:has-text("Message")').first();
    await expect(messageBtn).toBeVisible();
    await messageBtn.click();

    // 6. Verify redirect to chat thread
    await page.waitForURL('**/chat?threadId=**');
    
    // Verify chat window header has the student name
    await expect(page.locator('p.truncate.text-sm.font-bold')).toContainText(profileName || '');
    
    // Type and send a message
    await page.fill('textarea[placeholder="Type your message..."]', 'Hello, I am your assigned mentor.');
    await page.click('button:has-text("Send")');
    
    // Verify message is visible
    await expect(page.locator('text=Hello, I am your assigned mentor.').first()).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

// Define seed credentials
const STUDENT_EMAIL = 'student1@university.edu';
const MENTOR_EMAIL = 'mentor1@university.edu';
const ADMIN_EMAIL = 'admin@university.edu';
const PASSWORD = 'Password123';

// Helper for hydration wait
async function waitHydration(page) {
  await page.waitForTimeout(1500); // 1.5s wait for Astro & React hydration
}

// Helper for login
async function login(page, email, password, targetUrl) {
  await page.goto('/login');
  await page.waitForSelector('input[type="email"]');
  await waitHydration(page);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(targetUrl);
}

test.describe('Peerly E2E Verification Suite', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));
  });

  test.describe('Public Flows & Routing', () => {
    test('Verify Landing Page & Navigation', async ({ page }) => {
      // 1. Landing Page
      await page.goto('/');
      await expect(page).toHaveTitle(/Peerly/);
      
      // Verify landing page content
      await expect(page.locator('text=Peerly').first()).toBeVisible();
      await expect(page.locator('text=Peer support, verified by your university.')).toBeVisible();

      // Check footer links
      const privacyLink = page.locator('footer a[href="/privacy"]').first();
      const termsLink = page.locator('footer a[href="/terms"]').first();
      const safetyLink = page.locator('footer a[href="/safety"]').first();

      await expect(privacyLink).toBeVisible();
      await expect(termsLink).toBeVisible();
      await expect(safetyLink).toBeVisible();
    });

    test('Verify Privacy Policy Page', async ({ page }) => {
      await page.goto('/privacy');
      await expect(page).toHaveTitle(/Privacy Guarantee | Peerly/);
      await expect(page.locator('h1')).toContainText('Privacy-First Architecture');
      await expect(page.locator('text=Database-Level Separation')).toBeVisible();
    });

    test('Verify Terms Page', async ({ page }) => {
      await page.goto('/terms');
      await expect(page).toHaveTitle(/Terms of Service | Peerly/);
      await expect(page.locator('h1')).toContainText('Terms of Service');
      await expect(page.locator('text=Safe Space Commitment')).toBeVisible();
    });

    test('Verify Safety Guide Page', async ({ page }) => {
      await page.goto('/safety');
      await expect(page).toHaveTitle(/Safety Guide | Peerly/);
      await expect(page.locator('h1')).toContainText('Safety & Support Guide');
      await expect(page.locator('text=Emergency Contacts')).toBeVisible();
      await expect(page.locator('text=+1 (555) 0199')).toBeVisible();
    });

    test('Verify custom 404 Page', async ({ page }) => {
      await page.goto('/non-existent-page-route-random-123');
      await expect(page).toHaveTitle(/Page Not Found | Peerly/);
      await expect(page.locator('h1').first()).toContainText('404');
      await expect(page.locator('h2').first()).toContainText('Page Not Found');
    });

    test('Verify Sign In & Register UI and invalid login error', async ({ page }) => {
      await page.goto('/login');
      await page.waitForSelector('input[type="email"]');
      await waitHydration(page);
      await expect(page).toHaveTitle(/Sign In | Peerly/);
      await expect(page.locator('h2').first()).toContainText('Sign In');
      
      // Enter incorrect credentials
      await page.fill('input[type="email"]', 'wrong@university.edu');
      await page.fill('input[type="password"]', 'WrongPassword123');
      await page.click('button[type="submit"]');
      
      // Check for error text
      await expect(page.locator('text=Invalid credentials').first()).toBeVisible();

      // Go to register page
      await page.goto('/register');
      await page.waitForSelector('input[type="email"]');
      await waitHydration(page);
      await expect(page.locator('h2').first()).toContainText('Create Account');
    });
  });

  test.describe('Student Flows', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, STUDENT_EMAIL, PASSWORD, '**/dashboard');
    });

    test('Verify Student Dashboard', async ({ page }) => {
      await expect(page.locator('text=No Mentor Assigned').or(page.locator('text=Contact Mentor')).first()).toBeVisible();
      await expect(page.locator('text=Announcements').first()).toBeVisible();
      await expect(page.locator('text=Quick Access Resources').first()).toBeVisible();
    });

    test('Verify Student Discussions (Forum) & Emotion Tagging', async ({ page }) => {
      await page.goto('/posts');
      await expect(page.locator('h1').filter({ hasText: 'Discussions Feed' }).first()).toBeVisible();

      // Click create new discussion button
      await page.click('a[href="/posts/new"]');
      await page.waitForSelector('input[id="title"]');
      await waitHydration(page);
      await expect(page.locator('h1').filter({ hasText: 'Create Anonymous Post' }).first()).toBeVisible();

      // Create new discussion topic
      const uniqueTitle = `Anxiety during midterms - ${Date.now()}`;
      await page.fill('input[id="title"]', uniqueTitle);
      await page.fill('textarea[id="body"]', 'I am feeling highly anxious about the upcoming calculus midterms. Any tips?');
      await page.selectOption('select[aria-label="Post category"]', 'ACADEMICS');
      await page.click('button[aria-label="Anxious"]');
      await page.click('button[aria-label="High"]');

      await page.click('button[type="submit"]');
      await page.waitForURL('**/posts/**'); // redirects to the new post's detail view

      // Verify details on the post page
      await expect(page.locator('h1').first()).toContainText(uniqueTitle);
      await expect(page.locator('text=ANXIOUS')).toBeVisible();
      await expect(page.locator('text=HIGH')).toBeVisible();

      // Add a reply
      await page.fill('textarea[placeholder="Share your supportive response anonymously..."]', 'Don\'t worry, you are not alone! We can study together.');
      await page.click('button[type="submit"]');

      // Verify reply appears
      await expect(page.locator('text=Don\'t worry, you are not alone! We can study together.').first()).toBeVisible();
    });

    test('Verify Peer Chat', async ({ page }) => {
      await page.goto('/chat');
      await expect(page.locator('text=Your Messages').or(page.locator('text=Select a conversation')).first()).toBeVisible();

      // Click on a thread if available
      const thread = page.locator('a[href*="threadId="]');
      if (await thread.count() > 0) {
        await thread.first().click();
        await page.waitForTimeout(1000);
        
        // Try to send a message
        await page.fill('input[placeholder="Type a message anonymously..."]', 'Hello Mentor! Are you available?');
        await page.click('button:has(svg)');
        await expect(page.locator('text=Hello Mentor! Are you available?').first()).toBeVisible();
      }
    });

    test('Verify Events & Workshops', async ({ page }) => {
      await page.goto('/meetings');
      await expect(page.locator('h1').filter({ hasText: 'Campus Events' }).first()).toBeVisible();

      // Click on first event details
      const viewDetailsLink = page.locator('a[href*="/meetings/"]').first();
      if (await viewDetailsLink.count() > 0) {
        await viewDetailsLink.click();
        await expect(page.locator('button:has-text("RSVP")').or(page.locator('button:has-text("Register")')).or(page.locator('button:has-text("Cancel RSVP")')).first()).toBeVisible();
        
        // Toggle RSVP/Registration if button present
        const rsvpButton = page.locator('button:has-text("RSVP")').first();
        if (await rsvpButton.count() > 0) {
          await rsvpButton.click();
          await page.waitForTimeout(1000);
          await expect(page.locator('button:has-text("Cancel RSVP")').first()).toBeVisible();
        }
      }
    });

    test('Verify Resources Hub', async ({ page }) => {
      await page.goto('/resources');
      // Verify redirect to dashboard and Quick Access Resources visibility
      await page.waitForURL('**/dashboard');
      await expect(page.locator('text=Quick Access Resources').first()).toBeVisible();
    });

    test('Verify Student Logout', async ({ page }) => {
      await page.click('#logout-btn');
      await page.waitForURL('**/login');
    });
  });

  test.describe('Mentor Flows', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, MENTOR_EMAIL, PASSWORD, '**/mentor/dashboard');
    });

    test('Verify Mentor Dashboard & Availability Toggle', async ({ page }) => {
      await expect(page.locator('h1').filter({ hasText: 'Mentor Portal' }).first()).toBeVisible();
      await expect(page.locator('text=Waiting Chats').first()).toBeVisible();
      await expect(page.locator('text=Assigned Students').first()).toBeVisible();
      await expect(page.locator('text=Student Emotions Overview').first()).toBeVisible();

      // Check current availability status
      const availabilitySelect = page.locator('select[aria-label="Toggle availability"]');
      await expect(availabilitySelect).toBeVisible();

      // Change status to BUSY
      await availabilitySelect.selectOption('BUSY');
      await page.waitForTimeout(1000);
      
      // Reload page and check if it persisted
      await page.reload();
      await expect(availabilitySelect).toHaveValue('BUSY');

      // Change back to AVAILABLE
      await availabilitySelect.selectOption('AVAILABLE');
      await page.waitForTimeout(1000);
      await expect(availabilitySelect).toHaveValue('AVAILABLE');
    });

    test('Verify Mentor Priority Feed & Discussions', async ({ page }) => {
      await page.goto('/mentor/priority-feed');
      await expect(page.locator('h2').filter({ hasText: 'Priority Feed' }).first()).toBeVisible();
      
      // Check if we can view posts from here
      const postLink = page.locator('a[href*="/posts/"]').first();
      if (await postLink.count() > 0) {
        await postLink.click();
        await expect(page.locator('textarea[placeholder*="response"]').first()).toBeVisible();
      }
    });

    test('Verify Mentor Peer Chat', async ({ page }) => {
      await page.goto('/chat');
      await expect(page.locator('text=Your Messages').or(page.locator('text=Select a conversation')).first()).toBeVisible();
    });

    test('Verify Mentor Logout', async ({ page }) => {
      await page.click('#logout-btn');
      await page.waitForURL('**/login');
    });
  });

  test.describe('Admin Flows', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, ADMIN_EMAIL, PASSWORD, '**/admin/dashboard');
    });

    test('Verify Admin Dashboard & Management views', async ({ page }) => {
      await expect(page.locator('h1').filter({ hasText: 'Dashboard' }).first()).toBeVisible();
      await expect(page.locator('text=System Statistics').first()).toBeVisible();

      // 1. Mentors management
      await page.goto('/admin/mentors');
      await expect(page.locator('h1').filter({ hasText: 'Mentor Management' }).first()).toBeVisible();
      await expect(page.locator('text=mentor1@university.edu').first()).toBeVisible();

      // 2. Students management
      await page.goto('/admin/students');
      await expect(page.locator('h1').filter({ hasText: 'Student Management' }).first()).toBeVisible();
      await expect(page.locator('text=student1@university.edu').first()).toBeVisible();

      // 3. Meetings management
      await page.goto('/admin/meetings');
      await expect(page.locator('h1').filter({ hasText: 'Meeting Management' }).first()).toBeVisible();

      // 4. Workshops management
      await page.goto('/admin/workshops');
      await expect(page.locator('h1').filter({ hasText: 'Workshop Management' }).first()).toBeVisible();

      // 5. Resources management
      await page.goto('/admin/resources');
      await expect(page.locator('h1').filter({ hasText: 'Resource Management' }).first()).toBeVisible();
    });

    test('Verify Admin Logout', async ({ page }) => {
      await page.click('#logout-btn');
      await page.waitForURL('**/login');
    });
  });
});

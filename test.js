import puppeteer from 'puppeteer';

const EMAIL = 'afshin.efati@gmail.com';
const PASSWORD = 'hasan@13312';
(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
      });

    const page = await browser.newPage();
    console.log('🔐 Navigating to login page...');
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' });
    console.log('🔍 Waiting for username and password fields...');
    await page.type('#username', EMAIL, { delay: 100 });
    await page.type('#password', PASSWORD, { delay: 100 });
    await page.click('button[type="submit"]');
    console.log('✅ Clicked login button. Waiting...');

    // بجای waitForNavigation فقط یه صبر معمولی بذار

    console.log('🟢 Login possibly completed. Browser will remain open.');

    // حالا مرورگر باز می‌مونه تا دستی کار کنی
})();
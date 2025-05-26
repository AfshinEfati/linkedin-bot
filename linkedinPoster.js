import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import dotenv from 'dotenv';
dotenv.config();
puppeteer.use(StealthPlugin());

const EMAIL = process.env.LINKEDIN_EMAIL;
const PASSWORD = process.env.LINKEDIN_PASSWORD;
console.log(process.env.LINKEDIN_PASSWORD);
console.log(process.env.LINKEDIN_EMAIL);
if (!EMAIL || !PASSWORD) {
    console.error('❌ EMAIL or PASSWORD is missing. Please check your .env file.');
    process.exit(1);
}
const userDataDir = process.env.PUPPETEER_USER_DATA_DIR;
const companyUrl = process.env.LINKEDIN_ADMIN_POST_URL /*|| process.env.LINKEDIN_COMPANY_URL*/;

// برای اجرای این اسکریپت، باید محتوای پست را به صورت آرگومان خط فرمان ارسال کنید
// مثال: node linkedinPoster.js "این یک پست تستی است"
const CONTENT = process.argv.slice(2).join(' ');
console.log('⏺ RAW CONTENT:', CONTENT);

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized'],
        userDataDir: userDataDir,
    });
    const page = await browser.newPage();
    // مرحله ۱: برو به صفحه اصلی
    await page.goto('https://www.linkedin.com/feed', { waitUntil: 'domcontentloaded' });
    const currentUrl = page.url();
    console.log('🧭 currentUrl =', currentUrl);

    let isLoggedIn = true;
    if (!currentUrl.includes('/feed')) {
        console.log('🔒 Not logged in. Proceeding to login...');
        isLoggedIn = false;
    } else {
        console.log('✅ Already logged in.');
    }

    if (!isLoggedIn) {
        if (!EMAIL || !PASSWORD) {
            console.error('❌ EMAIL or PASSWORD is missing. Please check your .env file.');
            console.log(EMAIL);
            console.log(PASSWORD);
            process.exit(1);
        }
        await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle2' });

        await page.waitForSelector('#username');
        await page.type('#username', EMAIL.trim(), { delay: 30 });

        await page.waitForSelector('#password');
        await page.type('#password', PASSWORD.trim(), { delay: 30 });

        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    }

    // 2. Go to company page
    console.log('🏢 Navigating to Parsitrip company page...');
    await page.goto(companyUrl, {waitUntil: 'networkidle2'});
    await wait(3000);
    await page.screenshot({path: '/tmp/after-company-page.png'});
    await wait(3000);
    await page.goto(companyUrl);
    console.log(companyUrl);
    await wait(3000);


    // 3. Open "Start a post"
    console.log('✍️ Opening post box...');
    await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('a, button'));
        const target = elements.find(el => el.textContent?.trim().includes('Start a post'));
        if (target) target.click();
    });

    // 4. Wait for textbox and type content
    await page.waitForSelector('[role="textbox"]', {timeout: 10000});
    await wait(1000);
    await page.type('[role="textbox"]', CONTENT, {delay: 10});

    // 5. Fire input event (بدون blur)
    await page.evaluate(() => {
        const box = document.querySelector('[role="textbox"]');
        if (box) {
            box.dispatchEvent(new Event('input', {bubbles: true}));
        }
    });

    // 6. حذف کامل بخش بستن پاپ‌آپ چون خطرناک بود

    // ⏳ 7. Wait for Post button
    console.log('⏳ Waiting 20s before searching for the Post button...');
    await wait(3000);

    // 8. Try clicking Post
    console.log('🚀 Attempting to click the Post button...');
    const result = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const postBtn = buttons.find(btn =>
            btn.innerText.trim().toLowerCase() === 'post' && !btn.disabled
        );
        if (postBtn) {
            postBtn.click();
            return true;
        }
        return false;
    });

    if (result) {
        console.log('✅ Post click executed. Waiting 5 minutes for manual inspection...');
        await wait(3000); // 5 minutes
    } else {
        console.log('❌ Post button not found or disabled.');
        await page.screenshot({path: 'post-failed.png'});
        await wait(3000);
    }

    await browser.close();
    console.log('__POST_COMPLETE__');
    process.exit(0);
})();

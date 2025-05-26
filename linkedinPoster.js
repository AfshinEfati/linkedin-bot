// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());
const EMAIL = 'afshin.efati@gmail.com';
const PASSWORD = 'hasan@13312';
const CONTENT = process.argv.slice(2).join(' ');
console.log('⏺ RAW CONTENT:', CONTENT);

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized'],
        userDataDir: '/home/afshin/.puppeteer-profile/parsitrip'
    });
    const page = await browser.newPage();
    // مرحله ۱: برو به صفحه اصلی
    console.log('🌐 Navigating to LinkedIn home...');
    await page.goto('https://www.linkedin.com', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // مرحله ۲: چک کن که لاگین هستیم یا نه
    let isLoggedIn = true;
    try {
        await page.waitForSelector('#username', { timeout: 5000 });
        isLoggedIn = false;
    } catch (err) {
        // یعنی لاگین هستیم چون فیلد یوزرنیم پیدا نشد
        console.log('✅ Already logged in.');
    }

    if (!isLoggedIn) {
        console.log('🔐 Logging in...');
        await page.type('#username', EMAIL, { delay: 30 });
        await page.type('#password', PASSWORD, { delay: 30 });
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });
        console.log('✅ Login done.');
    }

    // 2. Go to company page
    console.log('🏢 Navigating to Parsitrip company page...');
    await page.goto('https://www.linkedin.com/company/parsitrip', { waitUntil: 'networkidle2' });
    await wait(3000);
    await page.screenshot({ path: '/tmp/after-company-page.png' });


    // 3. Open "Start a post"
    console.log('✍️ Opening post box...');
    await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const target = links.find(a => a.innerText.includes('Start a post'));
        if (target) target.click();
    });

    // 4. Wait for textbox and type content
    await page.waitForSelector('[role="textbox"]', { timeout: 10000 });
    await wait(1000);
    await page.type('[role="textbox"]', CONTENT, { delay: 10 });

    // 5. Fire input event (بدون blur)
    await page.evaluate(() => {
        const box = document.querySelector('[role="textbox"]');
        if (box) {
            box.dispatchEvent(new Event('input', { bubbles: true }));
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
        await page.screenshot({ path: 'post-failed.png' });
        await wait(3000);
    }

    await browser.close();
    console.log('__POST_COMPLETE__');
    process.exit(0);
})();

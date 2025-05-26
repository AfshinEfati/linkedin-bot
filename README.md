# 🤖 LinkedIn Auto Poster Bot with n8n + Puppeteer

این پروژه به شما اجازه می‌دهد به‌صورت خودکار پست‌هایی را در صفحه‌ی شرکت خود در لینکدین منتشر کنید، با استفاده از Node.js، Puppeteer و n8n.

---

## ✅ نیازمندی‌ها

برای اجرای کامل سیستم، به موارد زیر نیاز دارید:

- Node.js (ورژن 20 یا بالاتر)
- npm
- Google Chrome یا Chromium
- Git
- n8n (Self-Hosted)

---

## 🧰 مراحل نصب

### 1. نصب Node.js و npm

```bash
sudo apt update
sudo apt install -y curl git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. نصب مرورگر

#### Chromium:
```bash
sudo apt install -y chromium-browser
```

#### یا Google Chrome:
```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install -y ./google-chrome-stable_current_amd64.deb
```

### 3. نصب n8n

```bash
npm install -g n8n
```

---

## 🚀 نصب پروژه بات لینکدین

### 1. کلون کردن پروژه

```bash
git clone https://github.com/YOUR_USERNAME/linkedin-bot.git
cd linkedin-bot
```

### 2. نصب وابستگی‌ها

```bash
npm install
npm install puppeteer-extra puppeteer-extra-plugin-stealth
```

---

## ⚙️ تنظیمات اولیه

در فایل `linkedinPoster.js`:

```js
const EMAIL = 'your-email@example.com';
const PASSWORD = 'your-password';
```

> اگر از session ذخیره‌شده استفاده می‌کنید، نیازی به این مرحله نیست.

---

## 🧪 تست دستی

```bash
node linkedinPoster.js "این یک پست تستی است."
```

> لاگین دستی انجام دهید. Session در مسیر `userDataDir` ذخیره می‌شود.

---

## 🔁 اجرای اتوماتیک با n8n

### نودها در n8n:

1. Schedule Trigger
2. HTTP Request یا هر منبع دیتا
3. Edit Fields (ساخت فیلد `linkedin_text`)
4. Write Binary File (ذخیره متن در `/tmp/post.txt`)
5. Execute Command:

```bash
node /home/YOUR_USER/projects/linkedin-bot/linkedinPoster.js /tmp/post.txt
```

---

## 🧩 نکات امنیتی

- Session در مسیر `~/.puppeteer-profile/parsitrip` ذخیره می‌شود
- برای اجرای بدون مشکل، لاگین دستی را فقط یک بار انجام دهید

---

## ✨ قابلیت‌های آینده

- چند اکانت
- ارسال گزارش به تلگرام
- Docker Compose برای اجرای کامل

---
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const OUTPUT_DIR = path.resolve(process.cwd(), 'slideshots');
const INDEX_PATH = path.resolve(process.cwd(), 'index.html');
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function run() {
  await ensureDir(OUTPUT_DIR);

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: {
      width: 450,
      height: 800,
      deviceScaleFactor: 2,
    },
  });

  const page = await browser.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error('PAGE ERROR:', msg.text());
  });

  page.setDefaultNavigationTimeout(60000);
  await page.goto(`file://${INDEX_PATH}`, { waitUntil: 'domcontentloaded' });

  // Trigger demo flow.
  await page.waitForSelector('#btn-demo');
  await page.click('#btn-demo');

  // Wait for demo data to populate slides.
  await page.waitForFunction(() => {
    return typeof Stats !== 'undefined' &&
      typeof DemoData !== 'undefined' &&
      typeof SlideGenerator !== 'undefined' &&
      document.querySelectorAll('.slide').length > 3;
  });

  // Stabilize animations and timers for consistent captures.
  await page.addStyleTag({
    content: `
      * { animation: none !important; transition: none !important; }
      .fade-in-up { opacity: 1 !important; transform: none !important; }
    `,
  });

  const slideCount = await page.evaluate(() => {
    return document.querySelectorAll('.slide').length;
  });

  const appHandle = await page.$('#app');
  if (!appHandle) throw new Error('Unable to find #app container.');

  for (let i = 0; i < slideCount; i += 1) {
    await page.evaluate((idx) => {
      App.goToSlide(idx);
      App.pause();
    }, i);
    await new Promise((resolve) => setTimeout(resolve, 150));
    const filename = path.join(OUTPUT_DIR, `slide-${String(i + 1).padStart(2, '0')}.png`);
    await appHandle.screenshot({ path: filename });
    console.log('Captured', filename);
  }

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

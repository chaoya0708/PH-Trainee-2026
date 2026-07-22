const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('file:///Users/sofiacykung/Documents/antigravity_demo/MA%20Program/index.html');
  const ls = await page.evaluate(() => localStorage.getItem('vimei2_observations'));
  console.log(ls);
  await browser.close();
})();

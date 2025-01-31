const puppeteer = require('puppeteer');
const sleep = require('../utils/sleep');

const retrySelector = async (page, selector, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await page.waitForSelector(selector, { timeout: 5000 });
        } catch (e) {
            console.error(e);
            await sleep(1000);
        }
    }
};

const extractImagesUrl = async (page) => {
    try {
        return await page.$$eval('div#Overview img', (e) =>
            e
                .map((item) => item.getAttribute('src')),
        );
    } catch (e) {
        console.error('Error extracting images url:', e.message);
        return [];
    }
};

const extractPrice = async (page, selector) => {
    try {
        // await retrySelector(page, selector);
        return await page.$eval(selector, (e) => e.innerText);
    } catch (e) {
        console.error('Error extracting Price url:', e.message);
        return [];
    }
};

const extractTitle = async (page, selector) => {
    try {
        // await retrySelector(page, selector);
        return await page.$eval(selector, (e) => e.innerText);
    } catch (e) {
        console.error('Error extracting Title:', e.message);
        return [];
    }
};

const extractDescription = async (page, selector) => {
    try {
        // await retrySelector(page, selector);
        return await page.$eval(selector, (e) => e.innerText);
    } catch (e) {
        console.error('Error extracting Title:', e.message);
        return [];
    }
};

const scraperSourceVrbo = async (_url) => {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--window-size=1600,1000', '--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
        // devtools: false,
    });
    let page;

    try {
        console.log('Vrbo Scrapping Start!');
        page = await browser.newPage();
        await page.setViewport({ width: 1600, height: 1000 });
        page.setDefaultNavigationTimeout(0);
        await page.goto(_url, { waitUntil: 'networkidle2' });

        const json = {
            source: 'Vrbo',
            name: await extractTitle(page, 'div[data-stid*="content-hotel-title"] h1'),
            image_urls: await extractImagesUrl(page),
            price: await extractPrice(page, 'div[data-stid*="total-price"] div div:nth-child(2) span'),
            description:await extractDescription(page,'div[data-stid="content-markup"]'),
            link: _url
        };

        return { result: json, error: null };
    } catch (e) {
        console.error('Scraper encountered an error:', e.message);
        return { result: null, error: e.message };
    } finally {
        if (page) await page.close();
        await browser.close();
    }
};

module.exports = scraperSourceVrbo;

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
        return await page.$$eval('div[data-component*="PropertyMosaic"] img',(e)=>e.map((item) =>`https:${item.getAttribute('src')}`));
    } catch (e) {
        console.error('Error extracting images url:', e.message);
        return [];
    }
};

const extractPrice = async (page, selectors) => {
    const results = [];
    try {
        for (const selector of selectors) {
            // await retrySelector(page, selector);
            const value = await page.$eval(selector, (e) => e.innerText);
            results.push(value.trim());
        }
    } catch (e) {
        console.error('Error extracting Price:', e.message);
        return null;
    }
    return `${results[0]} ${results[1]}`;
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

const scraperSourceAgoda = async (_url) => {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--window-size=1600,1000', '--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
        // devtools: false,
    });
    let page;

    try {
        console.log('Agoda Scrapping Start!');
        page = await browser.newPage();
        await page.setViewport({ width: 1600, height: 700 });
        page.setDefaultNavigationTimeout(0);
        await page.goto(_url, { waitUntil: 'networkidle2' });

        const json = {
            source:'Agoda.com',
            name: await extractTitle(page, 'div.HeaderCerebrum h1[data-selenium*="hotel-header-name"]'),
            image_urls: await extractImagesUrl(page),
            price: await extractPrice(page, [
                'div#hotelNavBar div.StickyNavPrice span.StickyNavPrice__priceDetail div span:nth-child(3)',
                'div#hotelNavBar div.StickyNavPrice span.StickyNavPrice__priceDetail div span:nth-child(5)'
            ]),
            link:_url
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

module.exports = scraperSourceAgoda;

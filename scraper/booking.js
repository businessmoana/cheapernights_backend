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

const extractImagesUrl = async (page, selector) => {
    console.log("extracting images url")
    try {
        await retrySelector(page, selector);
        const images = await page.$$eval(selector, (elements) => {
            return elements.map((item) => item.getAttribute('src'));
        });
        return images;
    } catch (e) {
        console.error('Error extracting images url:', e.message);
        return [];
    }
};

const extractJson = async (page) => {
    try {
        await retrySelector(page, 'script[type="application/ld+json"]');
        const jsonStr = await page.$eval('script[type="application/ld+json"]', (e) => e.innerText);
        // await page.setJavaScriptEnabled(true);
        const data = JSON.parse(jsonStr);
        return {
            source:'Booking.com',
            // address: data.address || 'N/A',
            // image_urls: [data.image],
            name: data.name || 'N/A',
        };
    } catch (e) {
        console.error('Error extracting json:', e.message);
        return {};
    }
};

const extractPrice = async (page, selector) => {
    try {
        await retrySelector(page, selector);
        const elementHTML = await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            return element ? element.outerHTML : null; // Return outer HTML
        }, selector);

        console.log("Selected Element HTML:", elementHTML);
        return await page.$eval(selector, (e) => e.innerText);
    } catch (e) {
        console.error(`Error extracting price:`, e.message);
        return '';
    }
};

const scraperSourceBooking = async (_url) => {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--window-size=1600,1000', '--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
        // devtools: true,
    });
    let page;

    try {
        console.log('Booking Scrapping Start!');
        page = await browser.newPage();
        await page.setViewport({ width: 1600, height: 1000 });
        page.setDefaultNavigationTimeout(0);
        await page.goto(_url, { waitUntil: 'networkidle2' });

        const json = {
            ...(await extractJson(page)),
            price: await extractPrice(
                page,
                'tr.hprt-table-cheapest-block td.hprt-table-cell-price div div.bui-price-display div.bui-price-display__value span:nth-child(1)',
            ),
            image_urls: await extractImagesUrl(page,'div#photo_wrapper div div:nth-child(1) img'),
            link:_url

        };

        return { result: json, error: null };
    } catch (e) {
        console.error('Scraper encountered an error:', e.message);
        return { result: null, error: error.message };
    } finally {
        if (page) await page.close();
        await browser.close();
    }
};

module.exports = scraperSourceBooking;

const puppeteer = require('puppeteer');
const sleep = require('../utils/sleep');

const retrySelector = async (page, selector, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await page.waitForSelector(selector, { timeout: 1000 });
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

const extractPrice = async (page, selector1, selector2) => {
    let total = '';
    try {
        // await retrySelector(page, selector1);
        const priceElement1 = await page.$(selector1);

        if (priceElement1) {
            total = await page.$eval(selector1, (e) => e.innerText);
        }

        // await retrySelector(page, selector2);
        const priceElement2 = await page.$(selector2);
        if (priceElement2) {
            total = await page.$eval(selector2, (e) => e.innerText);
        }
        return {total:total, perNight:''};
    } catch (e) {
        console.error('Error extracting Price url:', e.message);
        return {total:'', perNight:''};
    }
};

const extractTitle = async (page, selector) => {
    try {
        console.log("extracting title")
        return await page.$eval(selector, (e) => e.innerText);
    } catch (e) {
        console.error('Error extracting Title:', e.message);
        return '';
    }
};

const extractReviews = async (page) => {
    let rating = '',
        review = '';
    try {
        const element = await page.$('div[itemprop*="aggregateRating"]');
        if (element) {
            rating = await page.$eval(
                'div[itemprop*="aggregateRating"] meta[itemprop="ratingValue"]',
                (e) => e.getAttribute('content')
            );
            review = await page.$eval(
                'div[itemprop*="aggregateRating"] meta[itemprop="reviewCount"]',
                (e) => e.getAttribute('content')
            );
        }
        return { aggregate_score: rating.match(/(\d+(\.\d+)?)/)[0], total_reviews: review.match(/(\d+)/)[0], type: 10 };
    } catch (e) {
        console.error('Error extracting reviews:', e.message);
        return { aggregate_score: 0, total_reviews: 0, type: 10 };;
    }
};

const extractAddress = async (page) => {
    try {
        return await page.$eval('div[data-stid*="content-hotel-address"]', (e) =>
            e.innerText
        );
    } catch (e) {
        console.error('Error extracting address:', e.message);
        return '';
    }
};

const scraperSourceExpedia = async (_url) => {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--window-size=1600,1000', '--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
        // devtools: false,
    });

    try {
        console.log('Expedia Scrapping Start!');
        page = await browser.newPage();
        await page.setViewport({ width: 1600, height: 1000 });
        page.setDefaultNavigationTimeout(0);
        await page.goto(_url, { waitUntil: 'networkidle2' });

        const json = {
            source: 'Expedia',
            name: await extractTitle(page, 'div[data-stid*="content-hotel-title"] h1'),
            description: "",
            reviews: await extractReviews(page),
            address: await extractAddress(page),
            image_urls: await extractImagesUrl(page),
            price: await extractPrice(page, 'div[data-stid="section-room-list"] div div:nth-child(1) div[data-test-id="price-summary-message-line"]:nth-child(2) div div div', 'div[data-stid="price-summary-card"] table tr td:nth-child(2) h2'),
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

module.exports = scraperSourceExpedia;

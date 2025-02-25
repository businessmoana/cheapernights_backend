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
// 'div[data-stid*="total-price"] div div:nth-child(2) span'
const extractPrice = async (page) => {
    let total = '',
        perNight = '';
    try {
        await page.waitForSelector('div#Offers button:nth-child(2)', { visible: true });
        const buttonText = await page.$eval('div#Offers button:nth-child(2)', (el) => el.innerText);
        console.log("Button Text:", buttonText);
        await page.click('div#Offers button:nth-child(2)');
        await page.waitForSelector('div[data-stid*="price-summary-card"]', { timeout: 5000 });

        const element = await page.$('div[data-stid*="total-price"]');
        if (element) {
            total = await page.$eval('div[data-stid*="total-price"] div div:nth-child(2) span', (e) => e.innerText);
        }

        const element2 = await page.$('div[data-stid*="price-summary-card"]');
        console.log("element2=>", element2);
        if (element2) {
            perNight = await page.$eval('div[data-stid*="price-summary-card"] table tbody tr > td div div:nth-child(2)', (e) => e.innerText);
        }
        return { total: total, perNight: perNight.replace(" per night", "") };
    } catch (e) {
        console.error('Error extracting description:', e.message);
        return [];
    }
};

const extractTitle = async (page, selector) => {
    try {
        // await retrySelector(page, selector);
        return await page.$eval(selector, (e) => e.innerText);
    } catch (e) {
        console.error('Error extracting Title:', e.message);
        return '';
    }
};

const extractDescription = async (page, selector) => {
    try {
        // await retrySelector(page, selector);
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
        return {};
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

const scraperSourceVrbo = async (_url) => {
    const newUrl = new URL(_url);
    newUrl.searchParams.set('pwaDialogNested', "price-details");
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
        // Go to the target URL
        await page.goto(_url, { waitUntil: 'networkidle2' });

        const json = {
            source: 'Vrbo',
            name: await extractTitle(page, 'div[data-stid*="content-hotel-title"] h1'),
            reviews: await extractReviews(page),
            address: await extractAddress(page),
            image_urls: await extractImagesUrl(page),
            price: await extractPrice(page),
            description: await extractDescription(page, 'div[data-stid="content-markup"]'),
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

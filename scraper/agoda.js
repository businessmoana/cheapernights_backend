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
        return await page.$$eval('div[data-component*="PropertyMosaic"] img', (e) => e.map((item) => `https:${item.getAttribute('src')}`));
    } catch (e) {
        console.error('Error extracting images url:', e.message);
        return [];
    }
};

const extractPrice = async (page, selectors) => {
    let total = '';
    const results = [];
    try {
        for (const selector of selectors) {
            // await retrySelector(page, selector);
            const value = await page.$eval(selector, (e) => e.innerText);
            results.push(value.trim());
        }
        if (results.length == 2)
            total = `${results[0]} ${results[1]}`;
        return { total: total, perNight: '' };
    } catch (e) {
        console.error('Error extracting Price:', e.message);
        return {total:'', perNight:''};
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

const extractReviews = async (page) => {
    let rating = '',
        review = '';
    try {
        const element = await page.$('div[data-element-name*="review-score"]');
        if (element) {
            rating = await page.$eval(
                'div[data-element-name*="review-score"]',
                (e) => e.getAttribute('data-review-score-property-on-ssr')
            );
            review = await page.$eval(
                'div[data-element-name*="review-score"]',
                (e) => e.getAttribute('data-review-count-property-on-ssr')
            );
        }
        return { aggregate_score: rating.match(/(\d+(\.\d+)?)/)[0], total_reviews: review.match(/(\d+)/)[0], type: 10 };
    } catch (e) {
        console.error('Error extracting reviews:', e.message);
        return {aggregate_score:0, total_reviews:0, type:10};
    }
};

const extractAddress = async (page) => {
    let region = '';
    let country = '';
    try {
        const element1 = await page.$('meta[property*="og:region"]');
        if (element1) {
            region = await page.$eval(
                'meta[property*="og:region"]',
                (e) => e.getAttribute('content')
            );
        }

        const element2 = await page.$('meta[property*="og:country-name"]');
        if (element2) {
            region = await page.$eval(
                'meta[property*="og:country-name"]',
                (e) => e.getAttribute('content')
            );
        }
        return `${region} ${country}`;
    } catch (e) {
        console.error('Error extracting address:', e.message);
        return '';
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
            source: 'Agoda',
            name: await extractTitle(page, 'div.HeaderCerebrum h1[data-selenium*="hotel-header-name"]'),
            image_urls: await extractImagesUrl(page),
            description: '',
            reviews: await extractReviews(page),
            address: await extractAddress(page),
            price: await extractPrice(page, [
                'div#hotelNavBar div.StickyNavPrice span.StickyNavPrice__priceDetail div span:nth-child(3)',
                'div#hotelNavBar div.StickyNavPrice span.StickyNavPrice__priceDetail div span:nth-child(5)'
            ]),
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

module.exports = scraperSourceAgoda;

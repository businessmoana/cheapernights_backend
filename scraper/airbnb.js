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
        const imageUrls = await page.$$eval('div[data-section-id*="HERO_"] img', (e) =>
            e.map((item) => item.getAttribute('src')),
        );
        // console.log("imageUrls=>",imageUrls)
        return imageUrls
    } catch (e) {
        console.error('Error extracting images url:', e.message);
        return [];
    }
};

const extractPrice = async (page, selector) => {
    let total = '',
        perNight = '';
    try {
        const element = await page.$('main#site-content div[data-section-id*="BOOK_IT_SIDEBAR"]');
        if (element) {
            total = await page.$eval(
                'main#site-content div[data-section-id="BOOK_IT_SIDEBAR"] section span._j1kt73',
                (e) => e.innerText,
            );
            perNight = await page.$eval(
                'main#site-content div[data-section-id*="BOOK_IT_SIDEBAR"] span._hb913q',
                (e) => e.innerText,
            );
        }
        return {total:total, perNight:perNight};
    } catch (e) {
        console.error('Error extracting Price:', e.message);
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

const extractAddress = async (page, selector) => {
    try {
        return await page.$eval('div[data-section-id*="OVERVIEW"] section div:nth-child(1)', (e) =>
            e.innerText.slice(e.innerText.indexOf(' in ') + 3).trim(),
        );
    } catch (e) {
        console.error('Error extracting address:', e.message);
        return '';
    }
};

const extractReviews = async (page) => {
    let rating = '',
        review = '';
    try {
        const element = await page.$('div[data-section-id*="GUEST_FAVORITE"]');
        if (element) {
            rating = await page.$eval(
                'div[data-section-id*="GUEST_FAVORITE"] div[data-testid="pdp-reviews-highlight-banner-host-rating"]',
                (e) => e.innerText,
            );
            review = await page.$eval(
                'div[data-section-id*="GUEST_FAVORITE"] div[data-testid="pdp-reviews-highlight-banner-host-review"]',
                (e) => e.innerText,
            );
        } else {
            rating = await page.$eval(
                'div[data-section-id*="OVERVIEW"] section div:nth-child(3) span',
                (e) => e.innerText,
            );
            review = await page.$eval(
                'div[data-section-id*="OVERVIEW"] section div:nth-child(3) a',
                (e) => e.innerText,
            );
        }
        return { aggregate_score: rating.match(/(\d+(\.\d+)?)/)[0], total_reviews: review.match(/(\d+)/)[0], type:5 };
    } catch (e) {
        console.error('Error extracting reviews:', e.message);
        return {};
    }
};

const scraperBaseSourceAirbnb = async (_url) => {
    const newUrl = _url.replace(/\/www.airbnb.co.[a-z]{2}\//, '/www.airbnb.com/');
    const url = new URL(newUrl);

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--window-size=1600,1000', '--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
        // devtools: false,
    });
    let page;

    try {
        console.log('Airbnb Scrapping Start!');
        page = await browser.newPage();
        await page.setViewport({ width: 1600, height: 1000 });
        page.setDefaultNavigationTimeout(0);
        await page.goto(url, { waitUntil: 'networkidle2' });

        const json = {
            source: 'Airbnb',
            name: await extractTitle(page, 'h1.hpipapi'),
            reviews: await extractReviews(page),
            image_urls: await extractImagesUrl(page),
            price: await extractPrice(page),
            address: await extractAddress(page),
            description: await extractDescription(page, 'div[data-section-id="DESCRIPTION_DEFAULT"] span > span'),
            // description:"",
            link: url
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

module.exports = scraperBaseSourceAirbnb;

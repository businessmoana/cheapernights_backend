const puppeteer = require('puppeteer');
const sleep = require('../utils/sleep');
const { prefix } = require('../utils/prefixForAffiliate');

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

const extractImagesUrl = async (page, selector) => {
    console.log("extracting images url")
    try {
        await retrySelector(page, selector);
        const images = await page.$$eval(selector, (elements) => {
            return elements
                .map((item) => item.getAttribute('src')) // Get the 'src' attributes
                .filter(src => src !== null && src !== ''); // Filter out null and empty strings
        });
        // console.log("images=>", images);
        return images;
    } catch (e) {
        console.error('Error extracting images url:', e.message);
        return [];
    }
};

const extractDescription = async (page, selector) => {
    try {
        await retrySelector(page, selector);
        return await page.$eval(selector, (e) => e.innerText);
    } catch (e) {
        console.error('Error extracting Title:', e.message);
        return '';
    }
};

const extractJson = async (page) => {
    try {
        await retrySelector(page, 'script[type="application/ld+json"]');
        const jsonStr = await page.$eval('script[type="application/ld+json"]', (e) => e.innerText);
        // await page.setJavaScriptEnabled(true);
        const data = JSON.parse(jsonStr);
        return {
            source: 'Booking',
            address: `${data.address.addressRegion} ${data.address.addressCountry}` || 'N/A',
            name: data.name || '',
            reviews: {
                aggregate_score: data.aggregateRating.ratingValue || 0,
                total_reviews: data.aggregateRating.reviewCount || 0,
                type:10
            },
        };
    } catch (e) {
        console.error('Error extracting json:', e.message);
        return {};
    }
};

const extractPrice = async (page, selector) => {
    let total = "";
    try {
        await retrySelector(page, selector);
        const elementHTML = await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            return element ? element.outerHTML : null; // Return outer HTML
        }, selector);
        if(elementHTML){
            total =  await page.$eval(selector, (e) => e.innerText);
        }
        return {total:total, perNight:''};
    } catch (e) {
        console.error(`Error extracting price:`, e.message);
        return {total:'', perNight:''};
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

        const decodedUrl = decodeURIComponent(_url);

        const json = {
            ...(await extractJson(page)),
            price: await extractPrice(
                page,
                'table#hprt-table tr:nth-child(1) td.hprt-table-cell-price div div.bui-price-display div.bui-price-display__value span:nth-child(1)',
            ),
            image_urls: await extractImagesUrl(page, 'div#photo_wrapper img'),
            description:await extractDescription(page, 'div[data-testid="host-profile"] > div div:nth-child(2) div:nth-child(1)'),
            link: `${prefix['booking']}${decodedUrl}`,

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

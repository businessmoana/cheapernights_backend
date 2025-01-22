const puppeteer = require('puppeteer');

const extractAddress = async (page) => {
    try {
        return await page.$eval('div[data-section-id*="OVERVIEW"] section div:nth-child(1)', (e) =>
            e.innerText.slice(e.innerText.indexOf(' in ') + 3).trim(),
        );
    } catch (e) {
        console.error('Error extracting address:', e.message);
        return '';
    }
};

const extractImagesUrl = async (page) => {
    try {
        return await page.$$eval('div#Overview img', (e) =>
            e
                .map((item) => item.getAttribute('src').replace('rw=598', 'rw=1200'))
                .filter((item) => item.includes('rw=1200')),
        );
    } catch (e) {
        console.error('Error extracting images url:', e.message);
        return [];
    }
};

const scraperHotels= async (_url) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--window-size=1600,1000', '--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
        devtools: false,
    });
    let page;

    try {
        console.log('Hotels Scrapping Start!');
        page = await browser.newPage();
        await page.setViewport({ width: 1600, height: 700 });
        page.setDefaultNavigationTimeout(0);
        await page.goto(_url, { waitUntil: 'networkidle2' });

        const json = {
            name: await page.$eval('div[data-stid*="content-hotel-title"] h1', (e) => e.innerText),
            // address: await extractAddress(page),
            image_urls: await extractImagesUrl(page),
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

module.exports = scraperHotels;

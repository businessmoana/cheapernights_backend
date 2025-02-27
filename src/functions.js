const { getJson } = require("serpapi");
const scraperSourceAgoda = require("../scraper/agoda");
const scraperBaseSourceAirbnb = require("../scraper/airbnb");
const scraperSourceBooking = require("../scraper/booking");
const scraperSourceExpedia = require("../scraper/expedia");
const scraperSourceVrbo = require("../scraper/vrbo");
const axios = require('axios');
const currencies = require("../utils/currencies");
require('dotenv').config();

const getBaseData = async (searchText, ipAddress) => {
    let baseSource = '';
    let scrapedData;
    let filterOptions;
    let returnData;
    let customerInfo = await getCustomerInfoFromIpAddress(ipAddress);

    const searchUrl = new URL(searchText);
    if (searchText.includes('airbnb.')) {
        baseSource = 'airbnb';
        const url = new URL(searchText);
        let currencyCode = customerInfo.currency_code;
        let currencyType = currencies['airbnb'].currencies.includes(currencyCode) ? currencyCode : 'USD';
        url.searchParams.append('currency', currencyType)
        scrapedData = await scraperBaseSourceAirbnb(url.toString());
        filterOptions = {
            checkIn: searchUrl.searchParams.get('check_in'),
            checkOut: searchUrl.searchParams.get('check_out'),
            adults: searchUrl.searchParams.get('adults'),
            children: searchUrl.searchParams.get('children'),
        }
    } else if (searchText.includes('booking.')) {
        baseSource = 'booking';
        const url = new URL(searchText);
        let currencyCode = customerInfo.currency_code;
        let currencyType = currencies['booking'].currencies.includes(currencyCode) ? currencyCode : 'USD';
        url.searchParams.append('selected_currency', currencyType)
        scrapedData = await scraperSourceBooking(url.toString());
        filterOptions = {
            checkIn: searchUrl.searchParams.get('checkin'),
            checkOut: searchUrl.searchParams.get('checkout'),
            adults: searchUrl.searchParams.get('group_adults'),
            children: searchUrl.searchParams.get('group_children'),
        }
    } else if (searchText.includes('expedia.')) {
        baseSource = 'expedia';
        scrapedData = await scraperSourceExpedia(searchText);
        filterOptions = {
            checkIn: searchUrl.searchParams.get('chkin'),
            checkOut: searchUrl.searchParams.get('chkout'),
            adults: 1,
            children: 0,
        }
    } else if (searchText.includes('vrbo.')) {
        baseSource = 'vrbo';
        scrapedData = await scraperSourceVrbo(searchText);
        const [count, ...ages] = searchUrl.searchParams.get('children') ? searchUrl.searchParams.get('children').split('_') : "";
        filterOptions = {
            checkIn: searchUrl.searchParams.get('chkin') || searchUrl.searchParams.get('startDate'),
            checkOut: searchUrl.searchParams.get('chkout') || searchUrl.searchParams.get('endDate'),
            adults: searchUrl.searchParams.get('adults'),
            children: count,
        }
    } else if (searchText.includes('agoda.')) {
        baseSource = 'agoda';
        scrapedData = await scraperSourceAgoda(searchText);
        const checkInString = searchUrl.searchParams.get('checkIn');
        const los = searchUrl.searchParams.get('los');

        const checkInDate = new Date(checkInString);

        const checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkInDate.getDate() + Number(los));
        filterOptions = {
            checkIn: checkInDate.toISOString().split('T')[0],
            checkOut: checkOutDate.toISOString().split('T')[0],
            adults: searchUrl.searchParams.get('adults'),
            children: searchUrl.searchParams.get('children'),
        }
    }
    else {
        console.log("else")
    }
    if (baseSource != '') {
        returnData = {
            baseSource: baseSource,
            scrapedData: scrapedData,
            filterOptions: filterOptions,
            status: 'success'
        };
    } else {
        console.log("Here")
        returnData = {
            baseSource: baseSource,
            scrapedData: scrapedData,
            filterOptions: filterOptions,
            status: 'false'
        };
    }
    return returnData
}

const getScrapedData = async (link, filterOptions, ipAddress) => {
    let scrapedData;
    let customerInfo = await getCustomerInfoFromIpAddress(ipAddress);
    if (link.includes('airbnb.')) {
        const url = new URL(link);
        let currencyCode = customerInfo.currency_code;
        let currencyType = currencies['airbnb'].currencies.includes(currencyCode) ? currencyCode : 'USD';
        url.searchParams.append('currency', currencyType)
        if (filterOptions.checkIn)
            url.searchParams.append('check_in', filterOptions.checkIn)
        if (filterOptions.checkOut)
            url.searchParams.append('check_out', filterOptions.checkOut)
        if (filterOptions.adults)
            url.searchParams.append('adults', filterOptions.adults)
        if (filterOptions.children)
            url.searchParams.append('children', filterOptions.children)
        const updatedUrl = url.toString();
        scrapedData = await scraperSourceAirbnb(updatedUrl);
    } else if (link.includes('expedia.')) {
        const parsedUrl = new URL(link);
        const newUrl = new URL(parsedUrl);
        // let countryCode = currencies['expedia'][customerInfo.country_code]['currency'] ? customerInfo.country_code : 'US';
        // let currencyType = '';
        // let newBase = '';
        // if (countryCode == 'US') {
        //     newBase = `www.expedia.com`;
        //     currencyType = 'USD'
        // } else {
        //     newBase = `www.${currencies['expedia'][customerInfo.country_code]['url']}`;
        //     currencyType = `${currencies['expedia'][customerInfo.country_code]['currency']}`;
        // }
        // newUrl.host = newBase;
        // if (newUrl.pathname.startsWith('/en/')) {
        //     newUrl.pathname = newUrl.pathname.replace(/^\/en/, '');
        // }
        // if (currencies['expedia'][customerInfo.country_code]['addPath'] != "")
        //     newUrl.pathname = `/${currencies['expedia'][customerInfo.country_code]['addPath']}${newUrl.pathname}`;

        // newUrl.searchParams.append('currency', currencyType)
        if (filterOptions.checkIn)
            newUrl.searchParams.append('chkin', filterOptions.checkIn)
        if (filterOptions.checkOut)
            newUrl.searchParams.append('chkout', filterOptions.checkOut)
        if (filterOptions.adults)
            newUrl.searchParams.append('adults', filterOptions.adults)
        if (filterOptions.children) {
            let valueToAppend = Array.from({ length: filterOptions.children }, (_, i) => `1_0`).join('%2C');
            newUrl.searchParams.append('children', valueToAppend)
        }
        const updatedUrl = newUrl.toString();
        scrapedData = await scraperSourceExpedia(updatedUrl);
    } else if (link.includes('booking.')) {
        const url = new URL(link);
        let currencyCode = customerInfo.currency_code;
        let currencyType = currencies['booking'].currencies.includes(currencyCode) ? currencyCode : 'USD';
        url.searchParams.append('selected_currency', currencyType)
        if (filterOptions.checkIn)
            url.searchParams.append('checkin', filterOptions.checkIn)
        if (filterOptions.checkOut)
            url.searchParams.append('checkout', filterOptions.checkOut)
        if (filterOptions.adults)
            url.searchParams.append('group_adults', filterOptions.adults)
        if (filterOptions.children) {
            url.searchParams.append('group_children', filterOptions.children)
        }
        const updatedUrl = url.toString();
        scrapedData = await scraperSourceBooking(updatedUrl);
    } else if (link.includes('vrbo.')) {
        let propertyId = getPropertyIdOnVrbo(link);
        let countryCode = currencies['vrbo'][customerInfo.country_code] ? customerInfo.country_code : 'US';
        let _url = '';
        if (countryCode == 'US') {
            _url = `https://www.vrbo.com/${propertyId}ha`;
        } else {
            _url = `https://www.vrbo.com/${currencies['vrbo'][customerInfo.country_code]}/p${propertyId}`;
        }
        const url = new URL(link);
        if (filterOptions.checkIn)
            url.searchParams.append('chkin', filterOptions.checkIn)
        if (filterOptions.checkOut)
            url.searchParams.append('chkout', filterOptions.checkOut)
        if (filterOptions.adults)
            url.searchParams.append('adults', filterOptions.adults)
        if (filterOptions.children) {
            let valueToAppend = Array.from({ length: filterOptions.children }, (_, i) => `1_0`).join('%2C');
            url.searchParams.append('children', valueToAppend)
        }
        const updatedUrl = url.toString();
        scrapedData = await scraperSourceVrbo(updatedUrl);
    } else if (link.includes('agoda.')) {
        const url = new URL(link);
        if (filterOptions.checkIn) {
            const checkInDate = new Date(filterOptions.checkIn);
            const checkOutDate = new Date(filterOptions.checkOut);

            const differenceInMs = checkOutDate - checkInDate;

            const los = differenceInMs / (1000 * 60 * 60 * 24);

            url.searchParams.append('checkIn', filterOptions.checkIn)
            url.searchParams.append('los', los)
        }
        if (filterOptions.adults)
            url.searchParams.append('adults', filterOptions.adults)
        if (filterOptions.children) {
            url.searchParams.append('children', filterOptions.children)
        }
        const updatedUrl = url.toString();
        scrapedData = await scraperSourceAgoda(updatedUrl);
    }
    return scrapedData;
}

const getGoogleSearchData = async (searchText) => {
    let returnData;
    let googleSearchData;
    if (searchText && searchText != "") {
        await getJson({
            engine: "google",
            api_key: process.env.GOOGLE_LENS_API_KEY,
            q: searchText,
            num: 50,
            hl: "en"
        }, (json) => {
            googleSearchData = json['organic_results'];
            console.log("googleSearchData=>", googleSearchData)
        });
    }
    if (googleSearchData?.length) {
        returnData = { data: googleSearchData, status: true }
    } else {
        returnData = { data: null, status: false }
    }
    return returnData
}

const getGoogleLensMutipleImageSearchData = async (imageUrls) => {
    let returnData;
    let searchData = [];
    for (let index = 0; index < imageUrls.length; index++) {
        const imageUrl = imageUrls[index];
        await getJson({
            engine: "google_lens",
            url: imageUrl,
            api_key: process.env.GOOGLE_LENS_API_KEY,
        }, (json) => {
            const googleLensSearchResult = json['visual_matches'];
            if (googleLensSearchResult)
                searchData.push(googleLensSearchResult)
        });
    }

    const linkCount = {};
    searchData.forEach(group => {
        group.forEach(item => {
            const link = item.link;
            linkCount[link] = (linkCount[link] || 0) + 1;
        });
    });

    // Step 2: Filter to keep only one item for each duplicate link
    const uniqueData = [];
    const seenLinks = new Set();

    searchData.forEach(group => {
        group.forEach(item => {
            if (linkCount[item.link] > 1 && !seenLinks.has(item.link)) {
                uniqueData.push(item);
                seenLinks.add(item.link); // Mark this link as seen
            }
        });
    });
    if (uniqueData.length) {
        returnData = { data: uniqueData, status: true }
    } else {
        returnData = { data: null, status: false }
    }
    return returnData
}

const getGoogleLensSearchData = async (imageUrl) => {
    let returnData;
    console.log("imageUrl=>>", imageUrl)
    if (imageUrl && imageUrl != "") {
        await getJson({
            engine: "google_lens",
            url: imageUrl,
            api_key: process.env.GOOGLE_LENS_API_KEY,
        }, (json) => {
            const googleLensSearchResult = json['visual_matches'];

            if (googleLensSearchResult)
                returnData = { data: googleLensSearchResult, status: true }
            else returnData = { data: null, status: false }
        });
    } else {
        returnData = { data: null, status: false }
    }
    return returnData;
}

const getCustomerInfoFromIpAddress = async (ipAddress) => {
    const response = await axios.get(`https://ipwhois.app/json/${ipAddress}`);
    return response.data
}

const getPropertyIdOnVrbo = (url) => {
    const regex = /\/(p(\d+)|(\d+)ha|(\d+))(?:\/|$)/; // Matches all three patterns
    const match = url.match(regex);
    return match ? match[2] || match[3] || match[4] : null; // Returns the propertyId or null if not found
};

module.exports = {
    getBaseData,
    getScrapedData,
    getGoogleSearchData,
    getGoogleLensMutipleImageSearchData,
    getGoogleLensSearchData,
    getCustomerInfoFromIpAddress,
    getPropertyIdOnVrbo
};
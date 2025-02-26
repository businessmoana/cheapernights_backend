const express = require('express');
const cors = require('cors')
const { getJson } = require("serpapi");
const axios = require('axios');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

const scraperSourceExpedia = require('./scraper/expedia');
const scraperSourceVrbo = require('./scraper/vrbo');
const scraperSourceAirbnb = require('./scraper/airbnb');
const scraperSourceBooking = require('./scraper/booking');
const scraperSourceAgoda = require('./scraper/agoda');
// const scraperHotels = require('./scraper/hotels');

const currencies = require('./utils/currencies');

app.use(cors());
app.use(express.json());

const handleGoogleSearch = async (req, res) => {
    const { searchText, ipAddress } = req.body;
    let baseSource;
    let scrapedBaseData;
    let filterOptions;
    let googleSearchResult;
    let googleLensSearchResult;
    let returnData;

    const sourceSiteList = [
        "airbnb",
        "booking",
        "vrbo",
        "expedia",
        "agoda"
    ]
    // const BaseData = await getGoogleAboutThis(searchText);
    const BaseData = await getBaseData(searchText, ipAddress);
    if (BaseData.status == 'success') {
        baseSource = BaseData.baseSource;
        scrapedBaseData = BaseData.scrapedData;
        filterOptions = BaseData.filterOptions;
        let scrapedData = [];
        const name = scrapedBaseData?.result?.name || '';
        const description = scrapedBaseData?.result?.description || '';
        const text = `${name} ${description}`.trim();
        let restData = [];

        // googleSearchResult = await getGoogleSearchData(name);
        // googleSearchResultWithDescription = await getGoogleSearchData(text);
        // googleLensSearchResult = await getGoogleLensSearchData(scrapedBaseData.result.image_urls[0]);
        // if (googleSearchResult.status) {
        //     let filteredData = googleSearchResult.data.filter(item => {
        //         const matchesSource = sourceSiteList.some(source => item.source.toLowerCase().includes(source));
        //         const isBaseSourceExcluded = !item.source.toLowerCase().includes(baseSource.toLowerCase());

        //         return matchesSource && isBaseSourceExcluded;
        //     });

        //     let additionalDataWithDescription = [];
        //     if (googleSearchResultWithDescription.status) {
        //         additionalData = googleSearchResultWithDescription.data.filter(item => {
        //             const matchesSource = sourceSiteList.some(source => item.source.toLowerCase().includes(source));
        //             const isBaseSourceExcluded = !item.source.toLowerCase().includes(baseSource.toLowerCase());

        //             return matchesSource && isBaseSourceExcluded;
        //         });
        //     }
        //     let additionalDataWithGoogleLens = [];
        //     if (googleLensSearchResult.status) {
        //         additionalData = googleLensSearchResult.data.filter(item => {
        //             const matchesSource = sourceSiteList.some(source => item.source.toLowerCase().includes(source));
        //             const isBaseSourceExcluded = !item.source.toLowerCase().includes(baseSource.toLowerCase());

        //             return matchesSource && isBaseSourceExcluded;
        //         });
        //     }
        //     if (additionalDataWithDescription.length)
        //         filteredData = filteredData.concat(additionalDataWithDescription);
        //     if (additionalDataWithGoogleLens.length)
        //         filteredData = filteredData.concat(additionalDataWithGoogleLens);

        //     restData = googleSearchResult.data.filter(item =>
        //         !sourceSiteList.some(source => item.source.toLowerCase().includes(source))
        //     );

        //     const sortedFilteredData = filteredData.sort((a, b) => {
        //         const aIndex = sourceSiteList.findIndex(source => a.source.toLowerCase().includes(source));
        //         const bIndex = sourceSiteList.findIndex(source => b.source.toLowerCase().includes(source));
        //         return aIndex - bIndex;
        //     });

        //     const uniqueSourceData = [];
        //     const seenSources = new Set();
        //     sortedFilteredData.forEach(item => {
        //         const matchedSource = sourceSiteList.find(source => item.source.toLowerCase().includes(source));

        //         if (matchedSource && !seenSources.has(matchedSource)) {
        //             seenSources.add(matchedSource);
        //             uniqueSourceData.push(item);
        //         }
        //     });
        //     for (let index = 0; index < uniqueSourceData.length; index++) {
        //         const item = uniqueSourceData[index];
        //         const data = await getScrapedData(item.link, filterOptions, ipAddress);
        //         scrapedData.push(data)
        //     }
        // }
        scrapedData.push(scrapedBaseData);
        scrapedData = scrapedData.reduce((acc, item) => {
            if (item) {
                const source = item.result.source;
                if (!acc[source]) {
                    acc[source] = [];
                }
                acc[source].push(item.result);
            }
            return acc;
        }, {});
        returnData = {
            base_source: scrapedBaseData.result,
            google_search_result: scrapedData,
            filter_options: filterOptions,
            rest_data: restData,
            status: 'success'
        };
    } else {
        returnData = {
            base_source: {},
            google_search_result: {},
            filter_options: {},
            rest_data: {},
            status: 'false'
        };
    }
    res.json(returnData);
}

const handleGoogleLensSearch = async (req, res) => {
    const { searchText } = req.body;
    let baseSource;
    let scrapedBaseData;
    let filterOptions;
    let googleLensSearchResult;
    let returnData;

    const sourceSiteList = [
        "Airbnb",
        "Booking.com",
        "Vrbo",
        "Expedia.com",
        "Agoda.com"
    ]
    const BaseData = await getBaseData(searchText);
    if (BaseData.status == 'success') {
        baseSource = BaseData.baseSource;
        scrapedBaseData = BaseData.scrapedData;
        filterOptions = BaseData.filterOptions;
        googleLensSearchResult = await getGoogleLensMutipleImageSearchData(scrapedBaseData.result.image_urls);
        let scrapedData = [];
        let restData = [];
        if (googleLensSearchResult.status) {
            const filteredData = googleLensSearchResult.data.filter(item =>
                sourceSiteList.includes(item.source) && item.source !== baseSource
            );

            restData = googleLensSearchResult.data.filter(item =>
                !sourceSiteList.includes(item.source)
            );
            const sortedFilteredData = filteredData.sort((a, b) => {
                return sourceSiteList.indexOf(a.source) - sourceSiteList.indexOf(b.source);
            });

            const uniqueSourceData = [];
            const seenSources = new Set();

            for (const item of sortedFilteredData) {
                if (!seenSources.has(item.source)) {
                    seenSources.add(item.source);
                    uniqueSourceData.push(item);
                }
            }
            for (let index = 0; index < uniqueSourceData.length; index++) {
                const item = uniqueSourceData[index];
                const data = await getScrapedData(item.link, filterOptions);
                scrapedData.push(data)
            }
        }
        scrapedData.push(scrapedBaseData)
        scrapedData = scrapedData.reduce((acc, item) => {
            const source = item.result.source;
            if (!acc[source]) {
                acc[source] = [];
            }
            acc[source].push(item.result);
            return acc;
        }, {});
        returnData = {
            base_source: scrapedBaseData.result,
            google_lens_search_result: scrapedData,
            filter_options: filterOptions,
            rest_data: restData,
            status: 'success'
        };
    } else {
        returnData = {
            base_source: {},
            google_lens_search_result: {},
            filter_options: {},
            rest_data: {},
            status: 'false'
        };
    }
    res.json(returnData);
}

const getBaseData = async (searchText, ipAddress) => {
    let baseSource = '';
    let scrapedData;
    let filterOptions;
    let returnData;
    let customerInfo = await getCustomerInfoFromIpAddress(ipAddress);

    const searchUrl = new URL(searchText);
    if (searchText.includes('airbnb.')) {
        baseSource = 'airbnb';
        scrapedData = await scraperSourceAirbnb(searchText);
        filterOptions = {
            checkIn: searchUrl.searchParams.get('check_in'),
            checkOut: searchUrl.searchParams.get('check_out'),
            adults: searchUrl.searchParams.get('adults'),
            children: searchUrl.searchParams.get('children'),
        }
    } else if (searchText.includes('booking.')) {
        baseSource = 'booking';
        scrapedData = await scraperSourceBooking(searchText);
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


app.get('/', (req, res) => {
    res.send('Hello')
});

app.post('/googleLensSearch', handleGoogleLensSearch);

app.post('/googleSearch', handleGoogleSearch)

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})
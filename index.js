const express = require('express');
const cors = require('cors')
const { getJson } = require("serpapi");
const axios = require('axios');
require('dotenv').config();
const SerpApi = require('google-search-results-nodejs');
const app = express();
const PORT = process.env.PORT || 3000;

const scraperSourceExpedia = require('./scraper/expedia');
const scraperSourceVrbo = require('./scraper/vrbo');
// const scraperHotels = require('./scraper/hotels');
const scraperSourceAirbnb = require('./scraper/airbnb');
const scraperSourceBooking = require('./scraper/booking');
const scraperSourceAgoda = require('./scraper/agoda');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello')
});

app.post('/googleLensSearch', async (req, res) => {
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
        googleLensSearchResult = await getGoogleLensSearchData(scrapedBaseData.result.image_urls);
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
})
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})

const getBaseData = async (searchText) => {
    let baseSource = '';
    let scrapedData;
    let filterOptions;
    let returnData;
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
            checkIn: searchUrl.searchParams.get('chkin'),
            checkOut: searchUrl.searchParams.get('chkout'),
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
    console.log("getBaseData=>", returnData)
    return returnData
}

const getGoogleLensSearchData = async (imageUrls) => {
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

const getScrapedData = async (link, filterOptions) => {
    let scrapedData;
    if (link.includes('airbnb.')) {
        const url = new URL(link);
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
        scrapedData = await scraperSourceExpedia(updatedUrl);
    } else if (link.includes('booking.')) {
        const url = new URL(link);
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

app.post('/googleSearch', async (req, res) => {
    const { searchText } = req.body;
    let baseSource;
    let scrapedBaseData;
    let filterOptions;
    let googleSearchResult;
    let returnData;

    const sourceSiteList = [
        "airbnb",
        "booking",
        "vrbo",
        "expedia",
        "agoda"
    ]
    const BaseData = await getBaseData(searchText);
    if (BaseData.status == 'success') {
        baseSource = BaseData.baseSource;
        scrapedBaseData = BaseData.scrapedData;
        filterOptions = BaseData.filterOptions;
        const text = `${scrapedBaseData.result.name} ${scrapedBaseData.result.description} `
        googleSearchResult = await getGoogleSearchData(text);
        console.log("googleSearchResult=>", googleSearchResult)
        let scrapedData = [];
        let restData = [];
        if (googleSearchResult.status) {
            const filteredData = googleSearchResult.data.filter(item => {
                const matchesSource = sourceSiteList.some(source => item.source.toLowerCase().includes(source));
                const isBaseSourceExcluded = !item.source.toLowerCase().includes(baseSource.toLowerCase());

                return matchesSource && isBaseSourceExcluded;
            });

            restData = googleSearchResult.data.filter(item =>
                !sourceSiteList.some(source => item.source.toLowerCase().includes(source))
            );

            const sortedFilteredData = filteredData.sort((a, b) => {
                const aIndex = sourceSiteList.findIndex(source => a.source.toLowerCase().includes(source));
                const bIndex = sourceSiteList.findIndex(source => b.source.toLowerCase().includes(source));
                return aIndex - bIndex;
            });

            console.log("sortedFilteredData=>", sortedFilteredData)
            const uniqueSourceData = [];
            const seenSources = new Set();

            sortedFilteredData.forEach(item => {
                const matchedSource = sourceSiteList.find(source => item.source.toLowerCase().includes(source));

                if (matchedSource && !seenSources.has(matchedSource)) {
                    seenSources.add(matchedSource);
                    uniqueSourceData.push(item);
                }
            });
            for (let index = 0; index < uniqueSourceData.length; index++) {
                const item = uniqueSourceData[index];
                const data = await getScrapedData(item.link, filterOptions);
                scrapedData.push(data)
            }
        }
        scrapedData.push(scrapedBaseData);
        console.log("scrapedData=>",scrapedData)
        scrapedData = scrapedData.reduce((acc, item) => {
            if(item){ 
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
})

const getGoogleSearchData = async (searchText) => {
    let returnData;
    let googleSearchData;
    await getJson({
        engine: "google",
        api_key: process.env.GOOGLE_LENS_API_KEY,
        q: searchText,
        num:100
    }, (json) => {
        googleSearchData = json['organic_results'];
    });
    if (googleSearchData?.length) {
        returnData = { data: googleSearchData, status: true }
    } else {
        returnData = { data: null, status: false }
    }
    return returnData
}
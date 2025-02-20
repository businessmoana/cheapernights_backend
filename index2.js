const express = require('express');
const cors = require('cors')
const { getJson } = require("serpapi");
const axios = require('axios');
require('dotenv').config();

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

app.post('/search', async (req, res) => {
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
        googleLensSearchResult = await getGoogleLensSearchData(baseSource == 'Agoda.com' ? scrapedBaseData.result.image_urls : scrapedBaseData.result.image_urls[0]);
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
        baseSource = 'Airbnb';
        scrapedData = await scraperSourceAirbnb(searchText);
        filterOptions = {
            checkIn: searchUrl.searchParams.get('check_in'),
            checkOut: searchUrl.searchParams.get('check_out'),
            adults: searchUrl.searchParams.get('adults'),
            children: searchUrl.searchParams.get('children'),
        }
    } else if (searchText.includes('booking.')) {
        baseSource = 'Booking.com';
        scrapedData = await scraperSourceBooking(searchText);
        filterOptions = {
            checkIn: searchUrl.searchParams.get('checkin'),
            checkOut: searchUrl.searchParams.get('checkout'),
            adults: searchUrl.searchParams.get('group_adults'),
            children: searchUrl.searchParams.get('group_children'),
        }
    } else if (searchText.includes('expedia.')) {
        baseSource = 'Expedia.com';
        scrapedData = await scraperSourceExpedia(searchText);
        filterOptions = {
            checkIn: searchUrl.searchParams.get('chkin'),
            checkOut: searchUrl.searchParams.get('chkout'),
            adults: 1,
            children: 0,
        }
    } else if (searchText.includes('vrbo.')) {
        baseSource = 'Vrbo';
        scrapedData = await scraperSourceVrbo(searchText);
        const [count, ...ages] = searchUrl.searchParams.get('children').split('_');
        filterOptions = {
            checkIn: searchUrl.searchParams.get('chkin'),
            checkOut: searchUrl.searchParams.get('chkout'),
            adults: searchUrl.searchParams.get('adults'),
            children: count,
        }
    } else if (searchText.includes('agoda.')) {
        baseSource = 'Agoda.com';
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

const getGoogleLensSearchData = async (imageUrl) => {
    let returnData;
    await getJson({
        engine: "google_lens",
        url: imageUrl,
        api_key: process.env.GOOGLE_LENS_API_KEY,
        q:'rental'
    }, (json) => {
        console.log("json=>",json)
        const googleLensSearchResult = json['visual_matches'];
        if (googleLensSearchResult)
            returnData = { data: googleLensSearchResult, status: true }
        else
            returnData = { data: null, status: false }
    });
    return returnData
}

const getScrapedData = async (link, filterOptions) => {
    let scrapedData;
    if (link.includes('airbnb.')) {
        const url = new URL(link);
        url.searchParams.append('check_in', filterOptions.checkIn)
        url.searchParams.append('check_out', filterOptions.checkOut)
        if (filterOptions.adults)
            url.searchParams.append('adults', filterOptions.adults)
        if (filterOptions.children)
            url.searchParams.append('children', filterOptions.children)
        const updatedUrl = url.toString();
        scrapedData = await scraperSourceAirbnb(updatedUrl);
    } else if (link.includes('expedia.')) {
        const url = new URL(link);
        url.searchParams.append('chkin', filterOptions.checkIn)
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
        url.searchParams.append('checkin', filterOptions.checkIn)
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
        url.searchParams.append('chkin', filterOptions.checkIn)
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
        const checkInDate = new Date(filterOptions.checkIn);
        const checkOutDate = new Date(filterOptions.checkOut);

        const differenceInMs = checkOutDate - checkInDate;

        const los = differenceInMs / (1000 * 60 * 60 * 24);

        url.searchParams.append('checkIn', filterOptions.checkIn)
        url.searchParams.append('los', los)
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
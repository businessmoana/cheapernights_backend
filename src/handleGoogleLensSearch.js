const { getBaseData, getGoogleLensMutipleImageSearchData, getScrapedData } = require("./functions");

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

module.exports = handleGoogleLensSearch;
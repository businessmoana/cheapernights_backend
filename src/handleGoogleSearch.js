const { getBaseData, getGoogleSearchData, getGoogleLensSearchData, getScrapedData } = require("./functions");

const handleGoogleSearch = async (req, res) => {
    try {
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

            googleSearchResult = await getGoogleSearchData(name);
            googleSearchResultWithDescription = await getGoogleSearchData(text);
            googleLensSearchResult = await getGoogleLensSearchData(scrapedBaseData.result.image_urls[0]);
            if (googleSearchResult.status) {
                let filteredData = googleSearchResult.data.filter(item => {
                    const matchesSource = sourceSiteList.some(source => item.source.toLowerCase().includes(source));
                    const isBaseSourceExcluded = !item.source.toLowerCase().includes(baseSource.toLowerCase());

                    return matchesSource && isBaseSourceExcluded;
                });

                let additionalDataWithDescription = [];
                if (googleSearchResultWithDescription.status) {
                    additionalData = googleSearchResultWithDescription.data.filter(item => {
                        const matchesSource = sourceSiteList.some(source => item.source.toLowerCase().includes(source));
                        const isBaseSourceExcluded = !item.source.toLowerCase().includes(baseSource.toLowerCase());

                        return matchesSource && isBaseSourceExcluded;
                    });
                }
                let additionalDataWithGoogleLens = [];
                if (googleLensSearchResult.status) {
                    additionalData = googleLensSearchResult.data.filter(item => {
                        const matchesSource = sourceSiteList.some(source => item.source.toLowerCase().includes(source));
                        const isBaseSourceExcluded = !item.source.toLowerCase().includes(baseSource.toLowerCase());

                        return matchesSource && isBaseSourceExcluded;
                    });
                }
                if (additionalDataWithDescription.length)
                    filteredData = filteredData.concat(additionalDataWithDescription);
                if (additionalDataWithGoogleLens.length)
                    filteredData = filteredData.concat(additionalDataWithGoogleLens);

                restData = googleSearchResult.data.filter(item =>
                    !sourceSiteList.some(source => item.source.toLowerCase().includes(source))
                );

                const sortedFilteredData = filteredData.sort((a, b) => {
                    const aIndex = sourceSiteList.findIndex(source => a.source.toLowerCase().includes(source));
                    const bIndex = sourceSiteList.findIndex(source => b.source.toLowerCase().includes(source));
                    return aIndex - bIndex;
                });

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
                    const data = await getScrapedData(item.link, filterOptions, ipAddress);
                    scrapedData.push(data)
                }
            }
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
        console.log("End of scrapper");
        console.log("returnData=>", returnData);
        res.json(returnData);
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = handleGoogleSearch;
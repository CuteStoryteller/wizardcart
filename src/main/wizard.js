/**
 * Copyright (c) 2025 CuteStoryteller
 * All Rights Reserved. MIT License
 */

'use strict';

const fs = require('fs');
const path = require('path');
const ProductScraper = require('product-scraperjs');
const Optimizer = require('@cute-storyteller/image-optimizerjs');
const Cartmin = require('cartmin');
const { readJsonContent, buildConfigs, getUserPath } = require('./user-data.js');

let mainScraper;
let cartmin;
let partnerScrapers;
let brandsInfo;
let imagesFolderPath;

function init() {
    buildConfigs();

    const scraperPath = getUserPath('./build-configs/scraper.json');
    const cartminPath = getUserPath('./build-configs/cartmin.json');
    const partnerScrapersPath = getUserPath('./partners-scrapers');
    const brandsPath = getUserPath('./main-configs/brands.json');
    imagesFolderPath = getUserPath('./product-images');
    
    const scraperConfig = readJsonContent(scraperPath);
    mainScraper = new ProductScraper(scraperConfig);
    
    const cartminConfig = readJsonContent(cartminPath);
    cartmin = new Cartmin(cartminConfig);

    const partnerNames = fs.readdirSync(partnerScrapersPath)
        .filter(filename => filename.endsWith('json'));
    partnerScrapers = {};

    for (const filename of partnerNames) {
        const name = filename.split('.')[0];
        const config = readJsonContent(path.join(partnerScrapersPath, filename));
        partnerScrapers[name] = new ProductScraper(config);
    }

    brandsInfo = readJsonContent(brandsPath);
}

function start(...args) {
    return cartmin.start(...args);
}

function close() {
    return cartmin.close();
}

function abort() {
    mainScraper.abort();
    cartmin.close();
    for (const scraper of Object.values(partnerScrapers)) {
        scraper.abort();
    }
}

function reset() {
    mainScraper.reset();
    for (const scraper of Object.values(partnerScrapers)) {
        scraper.reset();
    }
}

/*
    - Extract necessary data from the main website;
    - Search for product data on a partner's website;
    - Download partner data;
    - Optimize images for OpenCart;
    - Fill a product page with downloaded and preprocessed data.
*/
async function processProduct(info) {
    let { id, url, name, brand, partnerUrl } = info;

    if (!id && !url) {
        throw new Error('Either product ID or product page URL must be present');
    }

    if (url && (!id || !name || !brand)) {
        const $ = await mainScraper.fetchCheerioAPI(url);
        if (!id) {
            id = mainScraper.extractProductId($);
        }
        if (!name || !brand) {
            ({ name, brand } = mainScraper.extractProductBasicInfo($));
        }
    }

    if (!name || !brand) {
        const $ = await mainScraper.search(id);
        ({ name, brand } = mainScraper.extractProductsBasicInfoFromList($)[0]);
    }

    const partnerBasicInfo = { name, brand, url: partnerUrl };
    const { partner, dirPath } = brandsInfo[brand];
    const { imageUrls, description } = await partnerScrapers[partner].searchProductCardData(partnerBasicInfo);
    
    const paths = await Optimizer.downloadProductImages(imageUrls, imagesFolderPath, id);
    const optPaths = await Optimizer.optimizeImages(paths, cartmin.maxImageMetadata);
    
    await cartmin.fillProductPage(id, description, optPaths, dirPath);
}

async function getBrandProducts(brand) {
    const callback = mainScraper.extractProductsBasicInfoFromList;
    const filterFunction = (x, y) => !x || !y;
    return await mainScraper.filterProductCardsFromCatalog(brand, callback, filterFunction);
}

module.exports = {
    init,
    start,
    close,
    abort,
    reset,
    processProduct,
    getBrandProducts
};
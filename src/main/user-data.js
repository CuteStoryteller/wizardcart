/**
 * Copyright (c) 2025 CuteStoryteller
 * All Rights Reserved. MIT License
 */

'use strict';

const { app } = require('electron');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const defaultDataPath = path.join(__dirname, '../assets/default-data');

function readJsonContent(filepath) {
    try {
        const content = fs.readFileSync(filepath);
        const parsed = JSON.parse(content);

        if (typeof parsed === 'object' && parsed !== null) {
            return parsed;
        }
    } catch (e) {}
}

function writeJsonContent(filepath, object) {
    const str = (typeof object === 'string') ? object : JSON.stringify(object);

    try {
        JSON.parse(str)
        fs.writeFileSync(filepath, str);
        return true;
    } catch (e) {
        return false;
    }
}

function changeJsonContent(filepath, callback) {
    const content = readJsonContent(filepath);
    if (!content) return;
    callback(content);
    writeJsonContent(filepath, content);
}

function initJsonContent(defaultFilepath, userFilepath, brandsFlag) {
    const defaultJson = readJsonContent(defaultFilepath);
    const userJson = readJsonContent(userFilepath);
    if (_.isEqual(defaultJson, userJson)) return;
    if (brandsFlag && userJson && Object.keys(userJson).length !== 0) return;
    writeJsonContent(userFilepath, _.merge(defaultJson, userJson));
}

function initJson(defaultFilepath, userFilepath, brandsFlag) {
    if (!fs.existsSync(userFilepath)) {
        fs.copyFileSync(defaultFilepath, userFilepath);
    } else {
        initJsonContent(defaultFilepath, userFilepath, brandsFlag);
    }
}

/*  create dir structure:
        userData
            build-configs
            main-configs
                admin.json
                brands.json
                scraper.json
            partners-scrapers
            product-images
            oc-settings.json
            partner-scraper.json
            tasks.json
*/
function initUserData() {
    const userDataPath = app.getPath('userData');
    const buildConfigsPath = path.join(userDataPath, './build-configs');
    const mainPath = path.join(userDataPath, './main-configs');
    const adminPath = path.join(mainPath, './admin.json');
    const brandsPath = path.join(mainPath, './brands.json');
    const scraperPath = path.join(mainPath, './scraper.json');
    const partnersPath = path.join(userDataPath, './partners-scrapers');
    const productImagesPath = path.join(userDataPath, './product-images');
    const ocSettingsPath = path.join(userDataPath, './oc-settings.json');
    const partnerScraperPath = path.join(userDataPath, './partner-scraper.json');
    const tasksPath = path.join(userDataPath, './tasks.json');

    const defaultAdminPath = path.join(defaultDataPath, './admin.json');
    const defaultBrandsPath = path.join(defaultDataPath, './brands.json');
    const defaultOCSettingsPath = path.join(defaultDataPath, './oc-settings.json');
    const defaultPartnerScraperPath = path.join(defaultDataPath, './partner-scraper.json');
    const defaultScraperPath = path.join(defaultDataPath, './scraper.json');
    const defaultTasksPath = path.join(defaultDataPath, './tasks.json');

    fs.mkdirSync(buildConfigsPath, { recursive: true });
    fs.mkdirSync(mainPath, { recursive: true });
    initJson(defaultAdminPath, adminPath);
    initJson(defaultBrandsPath, brandsPath, true);
    initJson(defaultScraperPath, scraperPath);
    fs.mkdirSync(partnersPath, { recursive: true });
    fs.mkdirSync(productImagesPath, { recursive: true });
    initJson(defaultOCSettingsPath, ocSettingsPath);
    initJson(defaultPartnerScraperPath, partnerScraperPath);
    initJson(defaultTasksPath, tasksPath);
    
    changeJsonContent(tasksPath, tasks => {
        tasks.isProcessing = false;
    });
}

function buildConfigs() {
    const userDataPath = app.getPath('userData');
    const scraperPath = path.join(userDataPath, './main-configs/scraper.json');
    const brandsPath = path.join(userDataPath, './main-configs/brands.json');
    const adminPath = path.join(userDataPath, './main-configs/admin.json');
    const ocSettingsPath = path.join(userDataPath, './oc-settings.json');
    const builtScraperPath = path.join(userDataPath, './build-configs/scraper.json');
    const builtCartminPath = path.join(userDataPath, './build-configs/cartmin.json');

    const scraper = readJsonContent(scraperPath);
    const brands = readJsonContent(brandsPath);
    scraper.brands = Object.keys(brands);
    writeJsonContent(builtScraperPath, scraper);

    const admin = readJsonContent(adminPath);
    const ocSettings = readJsonContent(ocSettingsPath);
    const cartmin = _.merge(admin, ocSettings);
    cartmin.baseUrl = scraper.baseUrl;
    writeJsonContent(builtCartminPath, cartmin);
}

function clearCache() {
    const userDataPath = app.getPath('userData');
    const productImagesPath = path.join(userDataPath, './product-images');
    const files = fs.readdirSync(productImagesPath);

    for (const filename of files) {
        try {
            fs.unlinkSync(path.join(productImagesPath, filename));
        } catch (e) {
            continue;
        }
    }
}

function getUserPath(relPath) {
    return path.join(app.getPath('userData'), relPath);
}

module.exports = {
    readJsonContent,
    writeJsonContent,
    changeJsonContent,
    initUserData,
    buildConfigs,
    clearCache,
    getUserPath
};
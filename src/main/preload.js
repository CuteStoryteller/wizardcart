/**
 * Copyright (c) 2025 CuteStoryteller
 * All Rights Reserved. MIT License
 */

'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    get: {
        adminConfig: () => ipcRenderer.invoke('getJson', './main-configs/admin.json'),
        brandsInfo: () => ipcRenderer.invoke('getJson', './main-configs/brands.json'), 
        brands: () => ipcRenderer.invoke('getBrands'),
        mainScraperConfig: () => ipcRenderer.invoke('getJson', './main-configs/scraper.json'),
        partners: () =>  ipcRenderer.invoke('getPartners'),
        partnerScraperConfig: partner => ipcRenderer.invoke('getJson', `./partners-scrapers/${partner}.json`),
        OCSettings: () => ipcRenderer.invoke('getJson', './oc-settings.json'),
        tasks: () => ipcRenderer.invoke('getJson', './tasks.json')
    },
    save: {
        adminConfig: obj => ipcRenderer.invoke('saveJson', './main-configs/admin.json', obj),
        brandsInfo: obj => ipcRenderer.invoke('saveJson', './main-configs/brands.json', obj),
        mainScraperConfig: obj => ipcRenderer.invoke('saveJson', './main-configs/scraper.json', obj),
        partnerScraperConfig: (obj, partner) => ipcRenderer.invoke('saveJson', `./partners-scrapers/${partner}.json`, obj),
        OCSettings: obj => ipcRenderer.invoke('saveJson', './oc-settings.json', obj)
    },
    task: {
        create: () => ipcRenderer.invoke('createTask'),
        delete: (ind, isQueued) => ipcRenderer.invoke('deleteTask', ind, isQueued),
        change: (ind, params) => ipcRenderer.invoke('changeTask', ind, params),
        redo: ind => ipcRenderer.invoke('redoTask', ind),
        update: callback => ipcRenderer.on('taskUpdate', callback)
    },
    processing: {
        start: () => ipcRenderer.invoke('startProcessing'),
        stop: () => ipcRenderer.send('stopProcessing')
    },
    partner: {
        add: partner => ipcRenderer.invoke('copyJson', './partner-scraper.json', `./partners-scrapers/${partner}.json`),
        delete: partner => ipcRenderer.invoke('deleteJson', `./partners-scrapers/${partner}.json`),
        rename: (oldName, newName) => ipcRenderer.invoke('renameJson', `./partners-scrapers/${oldName}.json`, `./partners-scrapers/${newName}.json`),
    },
    copyToClipboard: text => ipcRenderer.invoke('copyToClipboard', text)
});
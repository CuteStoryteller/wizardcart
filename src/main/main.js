/**
 * Copyright (c) 2025 CuteStoryteller
 * All Rights Reserved. MIT License
 */

'use strict';

const { app, BrowserWindow } = require('electron');
const { createWindow } = require('./windows.js');
const { initUserData, clearCache } = require('./user-data.js');
require('./handlers.js');

app.on('ready', () => {
    initUserData();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows.length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    clearCache();
    if (process.platform !== 'darwin') app.quit();
});
/**
 * Copyright (c) 2025 CuteStoryteller
 * All Rights Reserved. MIT License
 */

'use strict';

const { BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        minWidth: 1000,
        minHeight: 600,
        icon: path.join(__dirname, '../../public/logo.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, './preload.js')
        }
    });

    mainWindow.loadFile(path.join(__dirname, '../pages/home/index.html'));
};

function sendUpdateMsgToRenderer() {
    return mainWindow.webContents.send('taskUpdate');
}

module.exports = {
    createWindow,
    sendUpdateMsgToRenderer
};
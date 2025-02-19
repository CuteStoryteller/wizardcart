/**
 * Copyright (c) 2025 CuteStoryteller
 * All Rights Reserved. MIT License
 */

'use strict';

const { ipcMain, clipboard } = require('electron');
const fs = require('fs');
const { sendUpdateMsgToRenderer } = require('./windows.js');
const { readJsonContent, writeJsonContent, changeJsonContent, clearCache, getUserPath } = require('./user-data.js');
const Wizard = require('./wizard.js');
const { processTaskQueue } = require('./tasks.js');

let configsChanged = true;

function changeTasksJson(callback) {
    changeJsonContent(getUserPath('./tasks.json'), callback);
}

ipcMain.handle('getJson', (e, filepath) => {
    return readJsonContent(getUserPath(filepath));
});

ipcMain.handle('saveJson', (e, filepath, obj) => {
    configsChanged = writeJsonContent(getUserPath(filepath), obj);
    return configsChanged;
});

ipcMain.handle('copyJson', (e, oldFilepath, newFilepath) => {
    fs.copyFileSync(getUserPath(oldFilepath), getUserPath(newFilepath));
    configsChanged = true;
});

ipcMain.handle('deleteJson', (e, filepath) => {
    fs.unlinkSync(getUserPath(filepath));
    configsChanged = true;
});

ipcMain.handle('renameJson', (e, oldFilepath, newFilepath) => {
    fs.renameSync(getUserPath(oldFilepath), getUserPath(newFilepath));
    configsChanged = true;
});

ipcMain.handle('getBrands', () => {
    return Object.keys(readJsonContent(getUserPath('./main-configs/brands.json')));
});

ipcMain.handle('getPartners', () => {
    return fs.readdirSync(getUserPath('./partners-scrapers'))
        .map(filename => filename.split('.')[0]);
});

ipcMain.handle('createTask', () => {
    changeTasksJson(tasks => tasks.queued.push({}));
});

ipcMain.handle('deleteTask', (e, ind, isQueued) => {
    changeTasksJson(tasks => {
        const type = isQueued ? 'queued' : 'processed';
        tasks[type].splice(ind, 1);
    });
});

ipcMain.handle('changeTask', (e, ind, params) => {
    changeTasksJson(tasks => tasks.queued[ind] = params);
});

ipcMain.handle('redoTask', (e, ind) => {
    changeTasksJson(tasks => {
        const [task] = tasks.processed.splice(ind, 1);
        delete task.error;
        delete task.progress;
        delete task.processed;
        tasks.queued.push(task);
    });
});

ipcMain.handle('startProcessing', async () => {
    if (configsChanged) {
        try {
            Wizard.init();
        } catch (e) {
            return 'You must fill in all the required data!';
        }

        configsChanged = false;
    }

    changeTasksJson(tasks => {
        tasks.isProcessing = true;
        tasks.isStopped = false;
    });
    sendUpdateMsgToRenderer();

    let isStopped = false;
    let msg = '';

    const stopProcessing = () => {
        isStopped = true;
        changeTasksJson(tasks => tasks.isStopped = true);
        Wizard.abort();
        Wizard.reset();
    };
    
    ipcMain.once('stopProcessing', stopProcessing);

    try {
        await Wizard.start('admin', { headless: false });

        try {
            await processTaskQueue();
        } catch (e) {
            if (!isStopped) {
                msg = 'Processing has failed due to unexpected reason';
            }
        }
    } catch (e) {
        if (!isStopped) {
            msg = 'Cannot launch browser or login to OpenCart';
        }
    }

    ipcMain.off('stopProcessing', stopProcessing);
    await Wizard.close();
    clearCache();

    changeTasksJson(tasks => tasks.isProcessing = false);
    sendUpdateMsgToRenderer();

    return msg;
});

ipcMain.handle('copyToClipboard', (e, text) => {
    clipboard.writeText(text);
});
/**
 * Copyright (c) 2025 CuteStoryteller
 * All Rights Reserved. MIT License
 */

'use strict';

const { sendUpdateMsgToRenderer } = require('./windows.js');
const { readJsonContent, writeJsonContent, clearCache, getUserPath } = require('./user-data.js');
const Wizard = require('./wizard.js');

let updateTasks;

function isProcessingStopped() {
    return readJsonContent(getUserPath('./tasks.json')).isStopped;
}

async function tryProcessProduct(info, errorVal) {
    try {
        await Wizard.processProduct(info);
    } catch (e) {
        if (isProcessingStopped()) throw e;
        info.error = errorVal;
    } finally {
        clearCache();
    }
}

async function processTask(task) {
    if (task.fill === 'product') {
        await tryProcessProduct(task, 'product processing failure');
        updateTasks();
        return;
    }

    if (!task.progress) {
        try {
            task.processed = 0;
            task.progress = await Wizard.getBrandProducts(task.brand);
        } catch (e) {
            if (isProcessingStopped()) throw e;
            task.error = 'cannot get brand products';
            updateTasks();
            return;
        }
    }

    for (let i = task.processed; i < task.progress.length; i++) {
        await tryProcessProduct(task.progress[i], true);
        task.processed = i + 1;
        updateTasks();
    }
}

async function processTaskQueue() {
    const filepath = getUserPath('./tasks.json');
    const tasks = readJsonContent(filepath);
    updateTasks = () => {
        writeJsonContent(filepath, tasks);
        sendUpdateMsgToRenderer(); //async
    };

    while (tasks.queued.length) {
        await processTask(tasks.queued[tasks.queued.length - 1]);
        tasks.processed.push(tasks.queued[tasks.queued.length - 1]);
        tasks.queued.pop();
        updateTasks();
    }
}

module.exports = {
    processTaskQueue
};
/**
 * Copyright (c) 2025 CuteStoryteller
 * All Rights Reserved. MIT License
 */

'use strict';

import AsyncQueue from '../async-queue.js';
import {
    createTask,
    setTaskStyle,
    setProcessingTaskStyle,
    warnOnEmptyFields,
    removeWarnings,
    initTaskPositions,
    enableScrolling
} from './task.js';
import {
    createRedoAnimations,
    createBinAnimations,
    createPopupAnimation
} from './animations.js';

const actionBuffer = new AsyncQueue();
const updateBuffer = new AsyncQueue();

const critError = document.querySelector('#crit-error');
const critErrorMsg = document.querySelector('#crit-error-msg');
const queueArea = document.querySelector('.queue-area');
const processedArea = document.querySelector('.processed-area');
const queueBtnsSection = document.querySelector('.queue-btns');
const addBtn = document.querySelector('.add-btn');
const startBtn = document.querySelector('.start-btn');
const stopBtn = document.querySelector('.stop-btn');
const addPopup = document.querySelector('.add-popup');
const startPopup = document.querySelector('.start-popup');
const stopPopup = document.querySelector('.stop-popup');

const addOnChangeListener = (taskEl, taskParams, taskInd) => {
    taskEl.addEventListener('change', e => {
        actionBuffer.enqueue(async () => {
            delete taskParams.error;
            if (e.target.name === 'fill') taskParams = {};
            taskParams[e.target.name] = e.target.value;
            await window.electron.task.change(taskInd, taskParams);
            setTaskStyle(taskEl, taskParams, true);
            initTaskPositions(queueArea.querySelectorAll('.task'));
        });
    });
}

const renderTasks = (areaParams, brands, isQueued, isProcessing) => {
    const area = isQueued ? queueArea : processedArea;

    area.innerHTML = areaParams.map((_, i) =>
        createTask(i, isQueued, brands)
    ).join('');

    const taskEls = area.querySelectorAll('.task');
    
    for (let i = 0; i < taskEls.length; i++) {
        let taskParams = areaParams[taskEls.length - 1 - i];
        setTaskStyle(taskEls[i], taskParams, isQueued, isProcessing);

        if (isQueued) {
            addOnChangeListener(taskEls[i], taskParams, taskEls.length - 1 - i);
        }
    }

    if (isQueued && isProcessing) {
        setProcessingTaskStyle(taskEls[0], areaParams[taskEls.length - 1]);
    }

    initTaskPositions(taskEls);
    enableScrolling(area, taskEls);
};

const render = async () => {
    const { isProcessing, queued, processed } = await window.electron.get.tasks();
    const brands = await window.electron.get.brands();

    queueBtnsSection.classList.toggle('stop', isProcessing);

    renderTasks(queued, brands, true, isProcessing);
    renderTasks(processed, brands, false, isProcessing);
    createRedoAnimations();
    createBinAnimations();
};

render();

window.showCritError = (bool, msg) => {
    critError.classList.toggle('show', bool);
    if (msg !== undefined) critErrorMsg.textContent = msg;
}

window.redoTask = ind => {
    actionBuffer.enqueue(async () => {
        await window.electron.task.redo(- 1 - ind);
        await render();
    });
};

window.deleteTask = (ind, isQueued) => {
    actionBuffer.enqueue(async () => {
        await window.electron.task.delete(- 1 - ind, isQueued);
        await render();
    });
};

window.electron.task.update(() => {
    updateBuffer.enqueue(async () => {
        await render();
    });
});

addBtn.addEventListener('click', () => {
    actionBuffer.enqueue(async () => {
        await window.electron.task.create();
        await render();
    });
});

let startBtnClicked = false;
let stopBtnClicked = false;

startBtn.addEventListener('click', () => {
    if (startBtnClicked) return;
    showCritError(false);

    const hasEmpty = warnOnEmptyFields();
    if (hasEmpty) {
        showCritError(true, 'Please, fill all necessary fields');
        return;
    }
    removeWarnings();

    startBtnClicked = true;
    actionBuffer.enqueue(async () => {
        const critErrorMsg = await window.electron.processing.start();
        if (critErrorMsg) showCritError(true, critErrorMsg);
        startBtnClicked = false;
        stopBtnClicked = false;
    });
});

stopBtn.addEventListener('click', () => {
    if (stopBtnClicked) return;
    stopBtnClicked = true;
    window.electron.processing.stop();
});

createPopupAnimation(addBtn, addPopup);
createPopupAnimation(startBtn, startPopup);
createPopupAnimation(stopBtn, stopPopup);
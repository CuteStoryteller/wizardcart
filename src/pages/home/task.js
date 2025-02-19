/**
 * Copyright (c) 2025 CuteStoryteller
 * All Rights Reserved. MIT License
 */

'use strict';

import { createLoadingAnimation } from './animations.js';

function createTask(ind, isQueued, brands) {
    return `
    <div class="task">
        <button class="redo-btn" onclick="redoTask(${ind})"></button>
        <button class="delete-btn" onclick="deleteTask(${ind}, ${isQueued})"></button>
        <section class="action">
            <div class="section-title">Action</div>
            <div class="section-body">
                <label class="fill">
                    <span>Fill</span>
                    <select name="fill">
                        <option value=""></option>
                        <option value="product">product</option>
                        <option value="brand">brand</option>
                    </select>
                </label>
            </div>
        </section>
        <section class="info">
            <div class="section-title">Information</div>
            <div class="section-body">
                <label class="id">
                    <span>ID</span>
                    <input name="id" type="text">
                </label>
                <label class="url">
                    <span>URL</span>
                    <input name="url" type="text">
                </label>
                <label class="partnerUrl">
                    <span>Partner URL</span>
                    <input name="partnerUrl" type="text">
                </label>
                <label class="brand">
                    <span>Brand</span>
                    <select name="brand">
                        <option value=""></option>\n` +
                        brands.map(brand => `<option value="${brand}">${brand}</option>\n`).join('') +
                    `</select>
                </label>
            </div>
        </section>
        <section class="status">
            <div class="section-title">Status</div>
            <div class="loading"></div>
            <div class="copy">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <rect x="50" y="50" width="120" height="120" stroke="black" stroke-width="15" fill="none"/>
                    <path d="M 20 140 V 20 H 140" stroke="black" stroke-width="15" fill="none"/>
                </svg>
            </div>
            <div class="section-body">
                <label class="progress">
                    <span>Progress</span>
                    <div class="progress-bar">
                        <div class="progress-bar-inner"></div>
                    </div>
                </label>
                <div class="error"></div>
            </div>
        </section>
    </div>`;
}

function composeErrorMsg(taskParams) {
    if (taskParams.error) return taskParams.error;
    if (taskParams.progress?.find(obj => obj.error)) return 'Some of the brand products were not processed';
    return '';
}

function setTaskStyle(taskEl, taskParams, isQueued, isProcessing) {
    if (isProcessing) {
        taskEl.classList.add('full-user-block');
    } else if (!isQueued) {
        taskEl.classList.add('user-block');
    }

    const fillSelect = taskEl.querySelector('[name="fill"]');
    const idInput = taskEl.querySelector('[name="id"]');
    const urlInput = taskEl.querySelector('[name="url"]');
    const partnerUrlInput = taskEl.querySelector('[name="partnerUrl"]');
    const brandSelect = taskEl.querySelector('[name="brand"]');
    const statusSection = taskEl.querySelector('.status');
    const copy = taskEl.querySelector('.copy');
    const errorOutput = taskEl.querySelector('.error');
    const progress = taskEl.querySelector('.progress');
    const progressBarInner = taskEl.querySelector('.progress-bar-inner');

    fillSelect.value = taskParams.fill || '';
    idInput.value = taskParams.id || '';
    urlInput.value = taskParams.url || '';
    partnerUrlInput.value = taskParams.partnerUrl || '';
    brandSelect.value = taskParams.brand || '';
    errorOutput.textContent = composeErrorMsg(taskParams);

    if (taskParams.progress) {
        progressBarInner.style.width = `${100 * taskParams.processed / taskParams.progress.length}%`;
        
        copy.style.display = 'block';
        const text = taskParams.progress.map(obj => JSON.stringify(obj)).join('\n');
        copy.onclick = window.electron.copyToClipboard(text);
    }

    taskEl.classList.toggle('task-product', taskParams.fill === 'product');
    taskEl.classList.toggle('task-brand', taskParams.fill === 'brand');

    statusSection.style.display = isQueued ? 'none' : 'block';
    progress.style.display = 'none';
    errorOutput.style.display = errorOutput.textContent ? 'flex' : 'none';
}

function setProcessingTaskStyle(taskEl, taskParams) {
    const statusSection = taskEl.querySelector('.status');
    const progress = taskEl.querySelector('.progress');

    statusSection.style.display = 'block';

    createLoadingAnimation(taskEl);

    if (taskParams.fill === 'brand') {
        progress.style.display = 'flex';
    }
}

function removeWarnings() {
    const fields = document.querySelectorAll('.warning');
    for (let i = 0; i < fields.length; i++) {
        fields[i].classList.remove('warning');
    }
}

function warnOnEmptyFields() {
    removeWarnings();

    let hasEmpty = false;
    const warn = (field) => {
        hasEmpty = true;
        field.classList.add('warning');
    };
    const taskEls = document.querySelectorAll('.queue-area .task');

    for (let i = 0; i < taskEls.length; i++) {
        const fillSelect = taskEls[i].querySelector('[name="fill"]');

        switch (fillSelect.value) {
            case '':
                warn(fillSelect);
                break;
            case 'product':
                const idInput = taskEls[i].querySelector('[name="id"]');
                const urlInput = taskEls[i].querySelector('[name="url"]');
                if (!idInput.value && !urlInput.value) {
                    warn(idInput);
                    warn(urlInput);
                }
                break;
            case 'brand':
                const brandSelect = taskEls[i].querySelector('[name="brand"]');
                if (!brandSelect.value) {
                    warn(brandSelect);
                }
        }
    }

    return hasEmpty;
}

function initTaskPositions(taskEls) {
    let position = 70;
    for (let i = 0; i < taskEls.length; i++) {
        taskEls[i].style.top = `${position}px`;
        position += taskEls[i].offsetHeight + 30;
    }
}

function enableScrolling(area, taskEls) {
    if (!taskEls.length) return;

    area.addEventListener('wheel', e => {
        const minDelta = parseInt(taskEls[0].offsetTop) - 70;
        const maxDelta = parseInt(taskEls[taskEls.length - 1].offsetTop) +
            taskEls[taskEls.length - 1].offsetHeight -
            area.offsetHeight + 70;
        const delta = Math.max(Math.min(e.deltaY, maxDelta), minDelta);
    
        if (delta === 0) return;
    
        for (let i = 0; i < taskEls.length; i++) {
            taskEls[i].style.top = `${parseInt(taskEls[i].offsetTop) - delta}px`;
        }
    });
};

export {
    createTask,
    setTaskStyle,
    setProcessingTaskStyle,
    warnOnEmptyFields,
    removeWarnings,
    initTaskPositions,
    enableScrolling
};
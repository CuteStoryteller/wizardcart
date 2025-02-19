/**
 * Copyright (c) 2025 CuteStoryteller
 * All Rights Reserved. MIT License
 */

'use strict';

import {
    getConfig,
    saveConfig,
    extractConfigName,
    getNewConfigName,
    createFile,
    findConfig
} from './config.js';

const container = document.querySelector('.container');
const partnersSection = document.querySelector('#partners');
const saveBtn = document.querySelector('.save-btn');
const configNameEl = document.querySelector('.config-name');
const editor = document.querySelector('.editor');
const necessaryFiles = ['admin', 'brands', 'scraper'];
let activeFile;

const blockWhenProcessing = async () => {
    const { isProcessing } = await window.electron.get.tasks();
    container.classList.toggle('user-block', isProcessing);
};

window.electron.task.update(blockWhenProcessing);
blockWhenProcessing();

const render = async () => {
    if (activeFile) {
        activeFile.classList.remove('active');
        activeFile = null;
    }

    const partners = await window.electron.get.partners();

    partnersSection.innerHTML = `
    <button class="new-file-btn" onclick="addNewFile()">
        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 114.066 122.881" enable-background="new 0 0 114.066 122.881" xml:space="preserve">
            <g>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M65.959,67.42h38.739c5.154,0,9.368,4.219,9.368,9.367v36.725 c0,5.154-4.221,9.369-9.368,9.369H65.959c-5.154,0-9.369-4.215-9.369-9.369V76.787C56.59,71.639,60.805,67.42,65.959,67.42 L65.959,67.42L65.959,67.42z M20.464,67.578c-1.495,0-2.74-1.352-2.74-2.988c0-1.672,1.209-2.989,2.74-2.989H43.88 c1.495,0,2.741,1.353,2.741,2.989c0,1.672-1.21,2.988-2.741,2.988H20.464L20.464,67.578L20.464,67.578z M87.795,18.186h9.822 c1.923,0,3.703,0.783,4.947,2.063c1.28,1.281,2.064,3.025,2.064,4.947v33.183h-6.051V25.196c0-0.285-0.107-0.533-0.285-0.711 c-0.177-0.178-0.426-0.285-0.711-0.285H87.76v34.18h-6.014V7.011c0-0.285-0.107-0.534-0.285-0.711 c-0.178-0.178-0.428-0.285-0.712-0.285H6.976c-0.285,0-0.535,0.106-0.712,0.285C6.085,6.478,5.979,6.726,5.979,7.011v83.348 c0,0.285,0.107,0.533,0.285,0.711s0.427,0.285,0.711,0.285h38.871v6.014H22.812v11.174c0,0.285,0.107,0.535,0.285,0.713 c0.177,0.176,0.427,0.285,0.711,0.285l22.038-0.002v6.014H23.844c-1.922,0-3.701-0.783-4.946-2.064 c-1.282-1.279-2.064-3.023-2.064-4.947l0-11.172H7.011c-1.922,0-3.701-0.785-4.946-2.064C0.783,94.023,0,92.279,0,90.357V7.011 C0,5.089,0.783,3.31,2.064,2.064C3.345,0.783,5.089,0,7.011,0h73.774c1.921,0,3.701,0.783,4.947,2.063 c1.28,1.282,2.063,3.025,2.063,4.947V18.186L87.795,18.186L87.795,18.186L87.795,18.186z M20.428,28.647 c-1.495,0-2.74-1.353-2.74-2.99c0-1.672,1.21-2.989,2.74-2.989l46.833,0c1.495,0,2.739,1.353,2.739,2.989 c0,1.672-1.208,2.99-2.739,2.99L20.428,28.647L20.428,28.647L20.428,28.647z M20.428,48.114c-1.495,0-2.74-1.353-2.74-2.989 c0-1.672,1.21-2.989,2.74-2.989l46.833,0c1.495,0,2.739,1.352,2.739,2.989c0,1.672-1.208,2.989-2.739,2.989L20.428,48.114 L20.428,48.114L20.428,48.114z M73.868,98.787c-2.007,0-3.634-1.627-3.634-3.635c0-2.006,1.627-3.633,3.634-3.633h7.823v-7.83 c0-2.006,1.628-3.633,3.634-3.633s3.634,1.627,3.634,3.633v7.83h7.829c2.007,0,3.634,1.627,3.634,3.633 c0,2.008-1.627,3.635-3.634,3.635h-7.823v7.83c0,2.006-1.627,3.633-3.634,3.633c-2.006,0-3.634-1.627-3.634-3.633v-7.83H73.868 L73.868,98.787L73.868,98.787z"/>
            </g>
        </svg>
    </button>` + partners.map(name => createFile(name)).join('');
};

const setEditor = async (configName) => {
    configNameEl.textContent = configName + '.json';
    editor.textContent = await getConfig(configName);
}

const unsetEditor = () => {
    configNameEl.textContent = '';
    editor.textContent = '';
};

window.setEditor = setEditor;

const renameFile = (configName) => {
    const partnersContainer = document.querySelector('#partners');
    const files = partnersContainer.querySelectorAll('.file');
    let file = findConfig(files, configName);
    let isTemplate = false;

    window.setEditor = () => {};

    if (!file) {
        isTemplate = true;
        partnersContainer.insertAdjacentHTML('beforeend', createFile(configName));
        file = partnersContainer.querySelector('.file:last-of-type');
    }

    file.innerHTML = `<input type="text">`;
    const input = file.querySelector('input');
    input.value = configName + '.json';
    input.focus();
    const cursorPlace = input.value.length - 5
    input.setSelectionRange(cursorPlace, cursorPlace);

    const onEnter = async e => {
        if (e.key !== 'Enter') return;
        document.removeEventListener('keydown', onEnter);
        window.setEditor = setEditor;

        const newConfigName = input.value.split('.')[0];
        if (newConfigName && !findConfig(files, newConfigName)) {
            if (isTemplate) {
                await window.electron.partner.add(newConfigName);
            } else {
                await window.electron.partner.rename(configName, newConfigName);
            }
            await setEditor(newConfigName);
        }

        render();
    };

    document.addEventListener('keydown', onEnter);
    input.addEventListener('focusout', render);
};

window.addNewFile = () => {
    const configName = getNewConfigName();
    renameFile(configName);
}

window.userSavedConfig = async () => {
    const configName = extractConfigName(configNameEl);
    const configChanged = await saveConfig(editor.textContent, configName);
    saveBtn.classList.toggle('warning', !configChanged);
};

document.addEventListener('click', e => {
    e.stopPropagation();

    if (e.target !== saveBtn) {
        saveBtn.classList.remove('warning');
    }

    if (activeFile && e.target !== activeFile) {
        activeFile.classList.remove('active');
    }

    activeFile = null;

    if (e.target.classList.contains('file')) {
        activeFile = e.target;
        e.target.classList.add('active');
    }
});

document.addEventListener('keydown', async e => {
    switch (e.key) {
        case 'n':
            if (!e.ctrlKey) return;
            setTimeout(() => {
                addNewFile();
            });
            break;
        case 's':
            if (!e.ctrlKey) return;
            await userSavedConfig();
    }

    if (!activeFile) return;
    const configName = extractConfigName(activeFile);
    if (necessaryFiles.includes(configName)) return;

    switch (e.key) {
        case 'r':
            setTimeout(() => {
                renameFile(configName);
            });
            break;
        case 'Delete':
            await window.electron.partner.delete(configName);
            unsetEditor();
            await render();
    }
});

render();
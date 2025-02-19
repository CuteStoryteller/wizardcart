/**
 * Copyright (c) 2025 CuteStoryteller
 * All Rights Reserved. MIT License
 */

'use strict';

function stringifyForUser(obj) {
    const str = JSON.stringify(obj);
    
    let newStr = '';
    let indent = 0;
    let lineHasColon = false;
    
    const addIndent = () => {
        newStr += '\n' + '\t'.repeat(indent);
        lineHasColon = false;
    };

    const updateIndent = (char) => {
        if (['{', '['].includes(char)) indent++;
        if (['}', ']'].includes(char)) indent--;
    };

    for (let i = 0; i < str.length; i++) {
        updateIndent(str[i]);
        if (['}', ']'].includes(str[i])) addIndent();

        newStr += str[i];

        switch (str[i]) {
            case '}':
            case ']':
                if (i !== (str.length - 1) && ![',', '}', ']'].includes(str[i + 1])) {
                    addIndent();
                }
                break;
            case '{':
            case '[':
            case ',':
                addIndent();
                break;
            case ':':
                if (!lineHasColon) newStr += ' ';
                lineHasColon = true;
        }
    }

    return newStr;
}

function clearJsonString(val) {
    let newVal = '';
    let quotes = 0;
    
    for (const char of val) {
        if (char === '"') quotes = 1 - quotes;
        if (char.match(/\s/) && quotes === 0) continue;
        newVal += char;
    }

    return newVal;
}

function getElectronFuncName(configName) {
    switch (configName) {
        case 'admin':
            return 'adminConfig';
        case 'brands':
            return 'brandsInfo';
        case 'scraper':
            return 'mainScraperConfig';
        default:
            return 'partnerScraperConfig';
    }
}

async function getConfig(configName) {
    const funcName = getElectronFuncName(configName);
    const config = await window.electron.get[funcName](configName);
    return stringifyForUser(config);
}

async function saveConfig(val, configName) {
    const funcName = getElectronFuncName(configName);
    return await window.electron.save[funcName](clearJsonString(val), configName);
}

function extractConfigName(el) {
    return el.textContent.split('.')[0];
}

function getNewConfigName() {
    const partnersContainer = document.querySelector('#partners');
    const files = partnersContainer.querySelectorAll('.file');

    let configName = 'partner';
    
    for (let i = 0; i < files.length; i++) {
        if (extractConfigName(files[i]) === 'partner') {
            configName = null;
            break;
        }
    }

    if (!configName) {
        let ind = 1;

        for (let i = 0; i < files.length; i++) {
            const currConfigName = extractConfigName(files[i]);
            if (currConfigName.match(/^partner\(\d+\)$/)) {
                const currInd = +currConfigName.match(/\d+/)[0];
                if (ind <= currInd) ind = currInd + 1;
            }
        }

        configName = `partner(${ind})`;
    }

    return configName;
};

function findConfig(files, configName) {
    for (let i = 0; i < files.length; i++) {
        if (extractConfigName(files[i]) === configName) {
            return files[i];
        }
    }
}

function createFile(name) {
    return `
    <div class="file" onclick="setEditor('${name}')">${name}.json</div>`;
}

export {
    getConfig,
    saveConfig,
    extractConfigName,
    getNewConfigName,
    findConfig,
    createFile
}
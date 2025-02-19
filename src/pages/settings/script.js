/**
 * Copyright (c) 2025 CuteStoryteller
 * All Rights Reserved. MIT License
 */

'use strict';

const settings = document.querySelector('.settings');
const checkboxes = document.querySelectorAll('[type="checkbox"]');

const blockWhenProcessing = async () => {
    const { isProcessing } = await window.electron.get.tasks();
    settings.classList.toggle('user-block', isProcessing);
};

window.electron.task.update(blockWhenProcessing);
blockWhenProcessing();

(async () => {
    const { productPageOptions } = await window.electron.get.OCSettings();
    const options = Object.keys(productPageOptions);

    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = productPageOptions[options[i]];

        checkboxes[i].addEventListener('change', () => {
            productPageOptions[options[i]] = checkboxes[i].checked;
            window.electron.save.OCSettings({ productPageOptions });
        });
    }

    requestAnimationFrame(() => {
        document.querySelector('body').classList.add('loaded');
    });
})();
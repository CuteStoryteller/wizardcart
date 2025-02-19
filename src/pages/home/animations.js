/**
 * Copyright (c) 2025 CuteStoryteller
 * All Rights Reserved. MIT License
 */

'use strict';

function createRedoAnimations() {
    const redoBtns = document.querySelectorAll('.redo-btn');
        
    for (let i = 0; i < redoBtns.length; i++) {
        const anim = lottie.loadAnimation({
            container: redoBtns[i],
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: '../../assets/animations/redo.json'
        });

        lottie.setSpeed(2.5, anim);

        redoBtns[i].addEventListener('mouseenter', () => {
            anim.play();
        });
        redoBtns[i].addEventListener('mouseleave', () => {
            anim.stop();
        });
    }
}

function createBinAnimations() {
    const deleteBtns = document.querySelectorAll('.delete-btn');
        
    for (let i = 0; i < deleteBtns.length; i++) {
        const anim = lottie.loadAnimation({
            container: deleteBtns[i],
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: '../../assets/animations/icons8-bin.json'
        });

        deleteBtns[i].addEventListener('mouseenter', () => {
            anim.play();
        });
        deleteBtns[i].addEventListener('mouseleave', () => {
            anim.stop();
        });
    }
}

function createLoadingAnimation(taskEl) {
    lottie.loadAnimation({
        container: taskEl.querySelector('.loading'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '../../assets/animations/loading.json'
    });
}

function showPopup(btn, popup) {
    const rect = btn.getBoundingClientRect();
    popup.style.display = 'block';
    popup.style.left = `${(rect.left + rect.right) / 2}px`;
    popup.style.top = `${rect.top - popup.offsetHeight - 15}px`;
    requestAnimationFrame(() => {
        popup.classList.add('show');
    });
};

function hidePopup(popup) {
    const onTransitionEnd = () => {
        if (getComputedStyle(popup).opacity === '0') {
            popup.style.display = 'none';
            popup.removeEventListener('transitionend', onTransitionEnd);
        }
    };

    popup.classList.remove('show');
    popup.addEventListener('transitionend', e => {
        if (e.propertyName === 'opacity') onTransitionEnd();
    });
    onTransitionEnd();
};

function createPopupAnimation(btn, popup) {
    btn.addEventListener('mouseenter', () => {
        showPopup(btn, popup);
    });
    btn.addEventListener('mouseleave', () => {
        hidePopup(popup);
    });
};

export {
    createRedoAnimations,
    createBinAnimations,
    createLoadingAnimation,
    createPopupAnimation
};
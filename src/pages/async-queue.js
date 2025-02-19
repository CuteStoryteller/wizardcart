/**
 * Copyright (c) 2025 CuteStoryteller
 * All Rights Reserved. MIT License
 */

'use strict';

export default class AsyncQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
    }

    async enqueue(task) {
        return new Promise((resolve, reject) => {
            this.queue.push({ task, resolve, reject });
            this.process();
        });
    }

    async process() {
        if (this.isProcessing || this.queue.length === 0) return;
        this.isProcessing = true;

        const { task, resolve, reject } = this.queue.shift();

        try {
            resolve(await task());
        } catch (e) {
            reject();
        }

        this.isProcessing = false;
        this.process();
    }
}
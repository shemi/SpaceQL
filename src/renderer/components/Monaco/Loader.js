import path from 'path';
import fs from 'fs';

/**
 * Loads monaco, resolving with the monaco object
 * @property {string} baseUrl - Passed to Monaco's require.config
 *
 * @returns {Promise<Object>}
 */
function loadMonaco () {
    return new Promise((resolve, reject) => {
        console.log(path);

        const monacoDir = path.join(__dirname, '../../../../', 'node_modules/monaco-editor');

        console.log(__dirname, path.join(monacoDir, '/min/vs/loader.js'));

        const loader = require('monaco-editor/min/vs/loader.js');
        const baseUrl = `${monacoDir}/min`;

        // If this failed, we're done
        if (! loader) {
            return reject(`Found monaco-editor in ${monacoDir}, but failed to require!`);
        }

        // loader.require.config({
        //     baseUrl: baseUrl
        // });

        // Help Monaco understand how there's both Node and Browser stuff
        self.module = undefined;
        self.process.browser = true;

        loader.require(['vs/editor/editor.main'], () => {
            if (monaco) {
                resolve(monaco);
            } else {
                reject('Monaco loaded, but could not find global "monaco"');
            }
        })
    })
}

export default loadMonaco;
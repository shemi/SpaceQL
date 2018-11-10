'use strict';

import highlight from 'highlight.js/lib/highlight';
import sqlLang from 'highlight.js/lib/languages/sql';
import 'highlight.js/styles/github.css';

highlight.registerLanguage('sql', sqlLang);

const vueCode = {};

vueCode.install = (Vue) => {
    Vue.directive('code', {
        deep: true,

        bind: (el, binding) => {
            // on first bind, highlight all targets
            let targets = el.querySelectorAll('code');
            let target;
            let i;

            for (i = 0; i < targets.length; i += 1) {
                target = targets[i];

                if (typeof binding.value === 'string') {
                    // if a value is directly assigned to the directive, use this
                    // instead of the element content.
                    target.textContent = binding.value;
                }

                let s = highlight.highlightBlock(target);
                console.log(target);
            }
        },

        componentUpdated: (el, binding) => {
            // after an update, re-fill the content and then highlight
            let targets = el.querySelectorAll('code'),
                target,
                i;

            for (i = 0; i < targets.length; i += 1) {
                target = targets[i];

                if (typeof binding.value === 'string') {
                    target.textContent = binding.value;
                }

                highlight.highlightBlock(target);
            }
        }
    });
};

export default vueCode;
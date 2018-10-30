<template>
    <div class="spql-codemirror">
        <textarea ref="textarea" :placeholder="placeholder"></textarea>
    </div>
</template>

<script>
    import CodeMirror from 'codemirror/lib/codemirror';
    import 'codemirror/keymap/sublime';
    import 'codemirror/mode/sql/sql';
    import 'codemirror/mode/javascript/javascript';
    import 'codemirror/addon/dialog/dialog';
    import 'codemirror/addon/search/search';
    import 'codemirror/addon/search/match-highlighter';
    import 'codemirror/addon/search/jump-to-line';
    import 'codemirror/addon/lint/lint';
    import 'codemirror/addon/lint/json-lint';
    import 'codemirror/addon/hint/show-hint';
    import 'codemirror/addon/hint/sql-hint';
    import 'codemirror/addon/hint/javascript-hint';

    export default {
        name: 'codemirror',

        data() {
            return {
                content: '',
                codeMirror: null,
                cmInstance: null,
                autoCompleteInProgress: false
            }
        },

        props: {
            code: String,

            value: String,

            marker: Function,

            unseenLines: Array,

            placeholder: {
                type: String,
                default: ''
            },

            options: {
                type: Object,
                default: () => ({})
            },

            events: {
                type: Array,
                default: () => ([])
            },

            globalOptions: {
                type: Object,
                default: () => ({})
            },

            globalEvents: {
                type: Array,
                default: () => ([])
            }
        },

        watch: {
            options: {
                deep: true,
                handler(options) {
                    for (const key in options) {
                        this.cmInstance.setOption(key, options[key]);
                    }
                }
            },

            code(newVal) {
                this.handelCodeChange(newVal);
            },

            value(newVal) {
                this.handelCodeChange(newVal);
            },
        },


        methods: {
            initialize() {
                const cmOptions = Object.assign({
                    theme: 'neat',
                }, this.globalOptions, this.options);

                this.codeMirror = CodeMirror.fromTextArea(this.$refs.textarea, cmOptions);
                this.cmInstance = this.codeMirror;
                this.cmInstance.setValue(this.code || this.value || this.content);

                this.cmInstance.on('change', cm => {
                    this.content = cm.getValue();
                    this.$emit('input', this.content);
                });

                const tmpEvents = {};
                const allEvents = [
                    'scroll',
                    'changes',
                    'beforeChange',
                    'cursorActivity',
                    'keyHandled',
                    'inputRead',
                    'electricInput',
                    'beforeSelectionChange',
                    'viewportChange',
                    'swapDoc',
                    'gutterClick',
                    'gutterContextMenu',
                    'focus',
                    'blur',
                    'refresh',
                    'optionChange',
                    'scrollCursorIntoView',
                    'update'
                ];

                allEvents.concat(this.events)
                    .concat(this.globalEvents)
                    .filter(e => (!tmpEvents[e] && (tmpEvents[e] = true)))
                    .forEach(event => {
                        this.cmInstance.on(event, (...args) => {
                            this.$emit(event, ...args);

                            const lowerCaseEvent = event.replace(/([A-Z])/g, '-$1').toLowerCase();

                            if (lowerCaseEvent !== event) {
                                this.$emit(lowerCaseEvent, ...args);
                            }
                        });
                    });

                this.cmInstance.on('inputRead', this.autoCompleteOnInputRead.bind(this));
                this.cmInstance.focus();
                this.$emit('ready', this.codeMirror);
                this.unseenLineMarkers();
                this.refresh();
            },

            autoCompleteOnInputRead() {
                if(this.autoCompleteInProgress) {
                    return;
                }

                if (this.cmInstance.state.completionActive) {
                    return;
                }

                let cur = this.cmInstance.getCursor(),
                    token = this.cmInstance.getTokenAt(cur),
                    string = '';

                if (token.string.match(/^[.`\w@]\w*$/)) {
                    string = token.string;
                }

                if (string.length > 0) {
                    CodeMirror.commands.autocomplete(this.cmInstance);
                }
            },

            refresh() {
                this.$nextTick(() => {
                    this.cmInstance.refresh()
                });
            },

            destroy() {
                const element = this.cmInstance.doc.cm.getWrapperElement();

                element && element.remove && element.remove();
            },

            handelCodeChange(newVal) {
                const cm_value = this.cmInstance.getValue();

                if (newVal !== cm_value) {
                    const scrollInfo = this.cmInstance.getScrollInfo();

                    this.cmInstance.setValue(newVal);
                    this.content = newVal;
                    this.cmInstance.scrollTo(scrollInfo.left, scrollInfo.top);
                }

                this.unseenLineMarkers();
            },

            unseenLineMarkers() {
                if (! this.unseenLines || ! this.marker) {
                    return;
                }

                this.unseenLines.forEach(line => {
                    const info = this.cmInstance.lineInfo(line);

                    this.cmInstance.setGutterMarker(line, 'breakpoints', info.gutterMarkers ? null : this.marker());
                });
            },
        },

        mounted() {
            this.initialize()
        },

        beforeDestroy() {
            this.destroy()
        }
    }

</script>

<style lang="scss">
    @import "~codemirror/lib/codemirror.css";
    @import "~codemirror/addon/dialog/dialog.css";
    @import "~codemirror/addon/search/matchesonscrollbar.css";
    @import "~codemirror/addon/lint/lint.css";
    @import "~codemirror/addon/hint/show-hint.css";
    @import "~codemirror/theme/neat.css";

    .spql-codemirror {
        height: 100%;

        .CodeMirror {
            height: 100%;
        }
    }

</style>
<script>
    import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
    import uuid from 'uuid/v4';

    let monacoSchemasLoaded = false;

    export default {
        name: 'MonacoEditor',

        props: {
            value: String,
            theme: {
                type: String,
                default: 'vs-dark'
            },
            instId: {
                type: String,
                default: () => uuid()
            },
            fileName: String,
            language: String,
            options: Object,
            placeholder: {
                type: String,
                default: 'Loading...'
            }
        },

        data() {
            return {
                editorLoaded: false,
                model: null,
                monaco: monaco,
                editor: null
            }
        },

        watch: {
            options: {
                deep: true,
                handler(options) {
                    if (this.editor) {
                        this.editor.updateOptions(options)
                    }
                }
            },

            value(newValue) {
                if (this.editor) {
                    if (newValue !== this.editor.getValue()) {
                        this.editor.setValue(newValue)
                    }
                }
            },

            language(newVal) {
                if (this.editor) {
                    window.monaco.editor.setModelLanguage(this.editor.getModel(), newVal)
                }
            },

            theme(newVal) {
                if (this.editor) {
                    window.monaco.editor.setTheme(newVal)
                }
            }

        },

        mounted() {
            this.init();
        },

        beforeDestroy() {
            this.model && this.model.dispose();
            this.editor && this.editor.dispose();
        },

        methods: {
            init() {
                const options = {
                    automaticLayout: true,
                    value: this.value,
                    theme: this.theme,
                    language: this.language,
                    ...this.options
                };

                this.editorLoaded = true;

                this.editor = this.monaco.editor.create(this.$el, options);

                this.$emit('editorMount', this.editor);

                this.model = this.editor.getModel();

                this.editor.onContextMenu(event => this.$emit('contextMenu', event));
                this.editor.onDidBlurEditorWidget(() => this.$emit('blur'));
                this.editor.onDidBlurEditorText(() => this.$emit('blurText'));

                this.editor.onDidChangeConfiguration(event =>
                    this.$emit('configuration', event)
                );

                this.editor.onDidChangeCursorPosition(event =>
                    this.$emit('position', event)
                );

                this.editor.onDidChangeCursorSelection(event =>
                    this.$emit('selection', event)
                );

                this.editor.onDidChangeModel(event => this.$emit('model', event));

                this.editor.onDidChangeModelContent(event => {
                    const value = this.editor.getValue();

                    if (this.value !== value) {
                        this.$nextTick(() => {
                            this.$emit('input', value);
                        });
                    }
                });

                this.editor.onDidChangeModelDecorations(event => {
                    this.$emit('modelDecorations', event);
                });

                this.editor.onDidChangeModelLanguage(event =>
                    this.$emit('modelLanguage', event)
                );

                this.editor.onDidChangeModelOptions(event =>
                    this.$emit('modelOptions', event)
                );

                this.editor.onDidDispose(event => this.$emit('afterDispose', event));
                this.editor.onDidFocusEditorWidget(() => this.$emit('focus'));
                this.editor.onDidFocusEditorText(() => this.$emit('focusText'));
                this.editor.onDidLayoutChange(event => this.$emit('layout', event));
                this.editor.onDidScrollChange(event => this.$emit('scroll', event));
                this.editor.onKeyDown(event => this.$emit('keydown', event));
                this.editor.onKeyUp(event => this.$emit('keyup', event));
                this.editor.onMouseDown(event => this.$emit('mouseDown', event));
                this.editor.onMouseLeave(event => this.$emit('mouseLeave', event));
                this.editor.onMouseMove(event => this.$emit('mouseMove', event));
                this.editor.onMouseUp(event => this.$emit('mouseUp', event));

                this.editor.layout();
            },

            getMonaco() {
                return this.editor
            },

            focus() {
                this.editor.focus()
            }
        },

        render(h) {
            return h('div', null, [this.editorLoaded ? null : this.placeholder])
        }
    }
</script>

<style lang="scss" scoped>

    div {
        width: 100%;
        height: 100%;
    }

</style>
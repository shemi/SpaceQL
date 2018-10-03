<template>

    <div class="snr-query-container">
        <div ref="topWindow" class="query-editor">
            <monaco v-model="queryString" language="mysql" ref="editor"></monaco>
        </div>

        <div ref="bottomWindow" class="query-results-table">
            query results
        </div>
    </div>

</template>

<script>
    import Split from 'split.js';
    import Monaco from './Monaco/Monaco';

    export default {

        data() {
            return {
                queryString: '',

            }
        },

        mounted() {
            Split([this.$refs.topWindow, this.$refs.bottomWindow], {
                direction: 'vertical',
                sizes: [40, 60],
                minSize: [50, 50],
                onDrag: this.onDrag.bind(this),
                elementStyle(dimension, size, gutterSize) {
                    return {
                        'height': 'calc(' + size + '% - ' + gutterSize + 'px)'
                    }
                },
                gutterStyle(dimension, gutterSize) {
                    return {
                        'flex-basis':  gutterSize + 'px'
                    }
                }
            });
        },

        methods: {
            onDrag() {
                console.log(this.$refs.editor.getMonaco().layout());
            }
        },

        components: {
            Monaco
        }

    }

</script>

<style lang="scss">

    .snr-query-container {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        flex-shrink: 1;
        height: 100%;
        box-sizing: border-box;

        > div {
            box-sizing: border-box;
            flex-grow: 1;
            flex-shrink: 1;
        }

        .gutter {
            background-color: #3a3a3a;
            background-repeat: no-repeat;
            background-position: 50%;
        }

        .gutter.gutter-horizontal {
            background-image:  url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFAQMAAABo7865AAAABlBMVEVHcEzMzMzyAv2sAAAAAXRSTlMAQObYZgAAABBJREFUeF5jOAMEEAIEEFwAn3kMwcB6I2AAAAAASUVORK5CYII=');
            cursor: ew-resize;
        }

        .gutter.gutter-vertical {
            background-image:  url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
            cursor: ns-resize;
        }

    }

</style>

<template>

  <div class="el-scrollbar">
    <div ref="wrap" :class="['el-scrollbar__wrap', gutter ? '' : 'el-scrollbar__wrap--hidden-default']">

      <div class="el-scrollbar__view"
           ref="resize">

        <slot></slot>

      </div>
    </div>

    <bar :move="moveX" :size="sizeWidth"></bar>
    <bar vertical :move="moveY" :size="sizeHeight"></bar>
  </div>

</template>

<script>
    import {addResizeListener, removeResizeListener} from 'element-ui/src/utils/resize-event';
    import scrollbarWidth from 'element-ui/src/utils/scrollbar-width';
    import Bar from './bar';

    export default {
        name: 'ElScrollbar',

        components: { Bar },

        props: {},

        data() {
            return {
                sizeWidth: '0',
                sizeHeight: '0',
                moveX: 0,
                moveY: 0
            };
        },

        computed: {
            wrap() {
                return this.$refs.wrap;
            },

            gutter() {
                return scrollbarWidth();
            }
        },

        methods: {
            getElement(type = 'width') {
                const el = this.$parent.$refs[type + 'Element'];

                return el ? (el.$el || el) : undefined;
            },

            handleScroll() {
                const widthElement = this.getElement('width');
                const heightElement = this.getElement('height');

                if (! heightElement || ! widthElement) {
                    return;
                }

                this.moveY = ((heightElement.scrollTop * 100) / heightElement.clientHeight);
                this.moveX = ((widthElement.scrollLeft * 100) / widthElement.clientWidth);
            },

            update() {
                let heightPercentage,
                    widthPercentage;

                const widthElement = this.getElement('width');
                const heightElement = this.getElement('height');

                if (! heightElement || ! widthElement) {
                    return;
                }

                heightPercentage = (heightElement.clientHeight * 100 / heightElement.scrollHeight);
                widthPercentage = (widthElement.clientWidth * 100 / widthElement.scrollWidth);

                this.sizeHeight = (heightPercentage < 100) ? (heightPercentage + '%') : '';
                this.sizeWidth = (widthPercentage < 100) ? (widthPercentage + '%') : '';
            }
        },

        mounted() {
            this.$nextTick(this.update);

            addResizeListener(this.$refs.resize, this.update);
        },

        beforeDestroy() {
            if (this.native){
                return;
            }

            removeResizeListener(this.$refs.resize, this.update);
        }
    };
</script>

<style lang="scss" scoped>

  .el-scrollbar {
    height: 100%;
    width: 100%;
    padding-right: 10px;
    padding-bottom: 10px;
    box-sizing: border-box;
    background-color: white;

    .el-scrollbar__wrap {
      height: 100%;
      width: 100%;
      overflow: hidden;

      .el-scrollbar__view {
        height: 100%;
        width: 100%;
      }

    }

  }

</style>

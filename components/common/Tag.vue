<template>
  <view class="tag" :style="tagStyle">
    <slot></slot>
  </view>
</template>

<script>
export default {
  name: 'Tag',
  props: {
    // 背景颜色
    backgroundColor: {
      type: String,
      default: '#f5f5f5'
    },
    // 圆角大小
    borderRadius: {
      type: [String, Number],
      default: '4rpx'
    },
    // 内边距
    padding: {
      type: [String, Number],
      default: '8rpx 12rpx'
    },
    // 自定义样式
    customStyle: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    tagStyle() {
      const style = {
        backgroundColor: this.backgroundColor,
        borderRadius: typeof this.borderRadius === 'number' ? `${this.borderRadius}px` : this.borderRadius,
        padding: typeof this.padding === 'number' ? `${this.padding}px` : this.padding,
        ...this.customStyle
      }
      return style
    }
  }
}
</script>

<style scoped>
.tag {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
</style>

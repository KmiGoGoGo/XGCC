<template>
  <view class="status-tag" :style="tagStyle">
    <text class="status-tag-text" :style="textStyle">{{ text }}</text>
    <view class="status-tag-right" v-if="$slots.right">
      <slot name="right"></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'StatusTag',
  props: {
    // 标签文字
    text: {
      type: String,
      required: true
    },
    // 背景颜色
    backgroundColor: {
      type: String,
      default: '#007AFF'
    },
    // 文字颜色
    textColor: {
      type: String,
      default: '#FFFFFF'
    },
    // 字体大小
    fontSize: {
      type: String,
      default: '24rpx'
    },
    borderColor: {
      type: String,
      default: '#007AFF'
    },
    // 内边距
    padding: {
      type: String,
      default: '2rpx 2rpx'
    },
    // 圆角
    borderRadius: {
      type: String,
      default: '4rpx'
    },
    // 字体粗细
    fontWeight: {
      type: String,
      default: 'normal'
    },
    // 是否显示
    visible: {
      type: Boolean,
      default: true
    },
    // 自定义样式类
    customClass: {
      type: String,
      default: ''
    }
  },
  computed: {
    tagStyle() {
      return {
        backgroundColor: this.backgroundColor,
        border: '1rpx solid ' + this.borderColor ? this.borderColor : this.backgroundColor,
        padding: this.padding,
        borderRadius: this.borderRadius,
        display: this.visible ? 'inline-flex' : 'none'
      }
    },
    textStyle() {
      return {
        color: this.textColor,
        fontSize: this.fontSize,
        fontWeight: this.fontWeight
      }
    }
  }
}
</script>

<style lang="less" scoped>
.status-tag {
  align-items: center;
  justify-content: center;
  
  .status-tag-text {
    white-space: nowrap;
    flex-shrink: 0;
  }
  
  .status-tag-right {
    margin-left: 8rpx;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
}
</style>

<template>
  <view class="card" :class="cardClass" :style="cardStyle" @click="handleClick">
    <slot></slot>
  </view>
</template>

<script>
export default {
  name: 'Card',
  props: {
    // 自定义边距
    margin: {
      type: String,
      default: '15rpx 0 15rpx 0'
    },
    // 自定义内边距
    padding: {
      type: String,
      default: '36rpx'
    },
    // 自定义圆角
    borderRadius: {
      type: String,
      default: '16rpx'
    },
    // 自定义阴影
    boxShadow: {
      type: String,
      default: '0 4rpx 12rpx rgba(0, 0, 0, 0.06)'
    },
    // 自定义背景色
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    // 是否可点击
    clickable: {
      type: Boolean,
      default: false
    },
    // 自定义类名
    customClass: {
      type: String,
      default: ''
    }
  },
  computed: {
    cardClass() {
      return {
        'card-clickable': this.clickable,
        [this.customClass]: this.customClass
      }
    },
    cardStyle() {
      return {
        margin: this.margin,
        padding: this.padding,
        borderRadius: this.borderRadius,
        boxShadow: this.boxShadow,
        backgroundColor: this.backgroundColor
      }
    }
  },
  methods: {
    handleClick(event) {
      if (this.clickable) {
        this.$emit('click', event)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.card {
  position: relative;
  background: #ffffff;
  border-radius: 16rpx;
  margin: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
  overflow: hidden;
  // transition: all 0.3s ease;
}

.card-clickable {
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);
    // transform: translateY(-2rpx);
  }
  
  &:active {
    // transform: translateY(0);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  }
}
</style>

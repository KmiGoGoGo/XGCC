<template>
  <view class="zhifufen-title-row" :style="{ color: textColor }">
    <image src="/static/zhifufen_icon.png" mode="widthFix" class="zhifufen-icon"></image>
    <text class="zhifufen-title">{{ leftText }}</text>
    <view class="zhifufen-title-divider"></view>
    <text class="zhifufen-title">{{ rightText }}</text>
  </view>
</template>

<script>
export default {
  name: 'ZhifufenTitle',
  props: {
    leftText: {
      type: String,
      default: '微信支付分'
    },
    rightText: {
      type: String,
      default: '先充后付'
    },
    color: {
      type: String,
      default: 'black',
      validator: (val) => ['black', 'green'].includes(val)
    }
  },
  computed: {
    textColor() {
      return this.color === 'green' ? '#07C160' : '#000';
    }
  }
};
</script>

<style scoped>
.zhifufen-title-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.zhifufen-icon {
  width: 28rpx;
  height: 28rpx;
}

.zhifufen-title {
  font-size: 28rpx;
  font-weight: 400;
  color: inherit;
}

.zhifufen-title-divider {
  width: 2rpx;
  height: 26rpx;
  background-color: currentColor;
  opacity: 0.6;
}
</style>

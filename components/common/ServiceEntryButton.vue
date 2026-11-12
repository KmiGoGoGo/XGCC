<template>
  <button
      class="service-entry-btn"
      open-type="contact"
      :session-from="sessionFrom"
      hover-class="service-entry-btn-hover"
      :hover-stay-time="80"
  >
    <view class="service-shine"></view>
    <view class="service-inner">
      <uv-icon name="chat-fill" color="#FFFFFF" size="15"></uv-icon>
      <text class="service-text">联系客服</text>
    </view>
  </button>
</template>

<script>
/**
 * 通用「联系客服」入口按钮
 * 微信端走 open-type="contact" 唤起客服会话；支付宝端该属性无效，需另行处理。
 */
export default {
  name: 'ServiceEntryButton',
  props: {
    // 客服会话来源标识，便于后台区分入口
    sessionFrom: {
      type: String,
      default: 'home_page'
    }
  }
}
</script>

<style scoped>
.service-entry-btn {
  position: relative;
  width: auto;
  height: 58rpx;
  padding: 0 34rpx;
  margin: 0;
  border: none;
  border-radius: 29rpx;
  background: linear-gradient(135deg, #4E9BFF 0%, #1D6FE8 62%, #1A5FD0 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: service-breathe 2.6s ease-in-out infinite;
}

.service-entry-btn-hover {
  transform: scale(0.95);
  animation-play-state: paused;
}

.service-inner {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.service-text {
  font-size: 26rpx;
  color: #FFFFFF;
  font-weight: bold;
  letter-spacing: 1rpx;
}

/* 周期性扫光层：小程序 button 的 ::after 被边框占用，只能用真实元素 */
.service-shine {
  position: absolute;
  top: 0;
  left: -70%;
  width: 45%;
  height: 100%;
  z-index: 1;
  background: linear-gradient(100deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.6) 50%,
      rgba(255, 255, 255, 0) 100%);
  transform: skewX(-18deg);
  animation: service-shine 3.2s ease-in-out infinite;
}

@keyframes service-breathe {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(29, 111, 232, 0.5), 0 4rpx 14rpx rgba(29, 111, 232, 0.3);
  }
  50% {
    box-shadow: 0 0 0 12rpx rgba(29, 111, 232, 0), 0 4rpx 18rpx rgba(29, 111, 232, 0.42);
  }
}

@keyframes service-shine {
  0% {
    left: -70%;
  }
  45%, 100% {
    left: 135%;
  }
}
</style>

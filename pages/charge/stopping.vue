<template>
  <view class="page-container">
    <!-- #ifdef MP-WEIXIN -->
    <!-- 开屏 LOGO 全屏层 -->
    <view class="splash-screen" :class="{ 'splash-hidden': splashHidden }" v-if="showSplash">
      <view class="splash-content">
        <view class="splash-logo-container" :class="{ 'logo-shift-left': logoShiftLeft }">
          <canvas type="2d" id="splashCanvas" class="splash-canvas"></canvas>
        </view>
        <text class="splash-text" :class="{ 'text-visible': textVisible }">{{ getWxAppName() }}</text>
      </view>

      <!-- 固定居中显示的停止中文字 -->
      <view class="loading-text-container">
        <text class="loading-text">正在停止充电</text>
      </view>
    </view>
    <!-- #endif -->

    <uv-navbar :border="false" bgColor="transparent" @leftClick="handleBack" title="停止充电中" placeholder
               safeAreaInsetTop>
      <template v-slot:right>
        <view style="margin-right: 200rpx; margin-bottom: 5rpx;">
          <CustomerServiceButton
              session-from="stopping_page"
              custom-class="server-icon-wrapper"
          />
        </view>
      </template>
    </uv-navbar>

    <!-- 居中提示文字 -->
    <view class="message-container">
      <text class="main-message">充电桩预计将在60秒内停止</text>
      <text class="sub-message">请勿离开此页面</text>
      <text class="sub-message">为避免产生额外占位费，充电结束后请拔枪驶离车位</text>
    </view>

    <!-- 倒计时进度条 -->
    <view class="progress-container">
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: smoothProgress + '%' }"></view>
      </view>
      <text class="countdown-text">{{ countdown }}
        <text class="countdown-unit">s</text>
      </text>
    </view>
  </view>
</template>

<script>
import {getBillDetailById} from '@/api/bill.js'
import globalData from '../../globalData.js'
// #ifdef MP-WEIXIN
import lottie from 'lottie-miniprogram'
import logoAnimationData from '../../static/X2.json'
import {contactCustomerService as contactCustomerServiceFn} from '@/utils/utils';
import CustomerServiceButton from '@/components/common/CustomerServiceButton.vue';
// #endif

export default {
  components: {
    CustomerServiceButton
  },
  data() {
    return {
      splashLottieAnimation: null, // 存储开屏 lottie 动画实例
      showSplash: true, // 是否显示开屏层
      splashHidden: false, // 开屏层是否隐藏（透明）
      logoShiftLeft: false, // logo 是否向左移动
      textVisible: false, // 文字是否可见
      countdown: 60,
      timer: null,
      smoothTimer: null,
      pollingTimer: null, // 轮询定时器
      billId: null, // 账单ID
      busId: null, // 账单ID
      progress: 100, // 进度百分比，从100%开始递减
      smoothProgress: 100 // 用于平滑动画的进度值
    }
  },
  onLoad(options) {
    // 从路由参数中获取账单ID
    console.log('停止充电参数', options);
    if (options.billId && options.busId) {
      this.billId = options.billId;
      this.busId = options.busId;
      this.startPolling();
    } else {
      uni.showToast({
        title: '参数错误',
        icon: 'none'
      });
      uni.navigateBack();
    }
    this.startCountdown();
  },
  methods: {
    getWxAppName() {
      return globalData.wxAppName;
    },
    // 初始化开屏 LOGO lottie 动画（微信小程序）
    initSplashLottie() {
      // #ifdef MP-WEIXIN
      wx.createSelectorQuery()
          .select('#splashCanvas')
          .node((res) => {
            const canvas = res.node;
            const context = canvas.getContext('2d');

            // 设置 canvas 实际大小 - 开屏动画更大
            const dpr = wx.getSystemInfoSync().pixelRatio;
            const size = 200; // 开屏 logo 尺寸 (rpx)
            canvas.width = size * dpr;
            canvas.height = size * dpr;
            context.scale(dpr, dpr);

            // 使用导入的 lottie JSON 数据
            lottie.setup(canvas);
            this.splashLottieAnimation = lottie.loadAnimation({
              loop: false,
              autoplay: true,
              animationData: logoAnimationData,
              rendererSettings: {
                context: context
              }
            });

            // 监听动画完成事件
            this.splashLottieAnimation.addEventListener('complete', () => {
              console.log('开屏动画播放完成');
              this.onSplashAnimationComplete();
            });
          })
          .exec();
      // #endif
    },

    // 开屏动画完成后的处理
    onSplashAnimationComplete() {
      // 1. logo 向左移动
      this.logoShiftLeft = true;

      // 2. 延迟 300ms 后文字渐显
      setTimeout(() => {
        this.textVisible = true;
      }, 300);

      // 3. 延迟 1000ms 后整个开屏层渐隐
      setTimeout(() => {
        this.splashHidden = true;

        // 4. 完全隐藏后移除开屏层（节省性能）
        setTimeout(() => {
          this.showSplash = false;
          // 销毁动画实例
          if (this.splashLottieAnimation) {
            this.splashLottieAnimation.destroy();
            this.splashLottieAnimation = null;
          }
        }, 1000);
      }, 1300);
    },

    handleBack() {
      // 回到首页
      uni.switchTab({
        url: '/pages/index/index'
      });
    },
    startCountdown() {
      // 主计时器：每秒更新数字
      this.timer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          this.stopCountdown();
          this.handleCountdownComplete();
        }
      }, 1000);

      // 平滑动画计时器：每50ms更新圆环进度
      this.smoothTimer = setInterval(() => {
        if (this.countdown >= 0) {
          // 计算目标进度
          const targetProgress = (this.countdown / 60) * 100;
          // 使用缓动函数实现平滑过渡
          const diff = targetProgress - this.smoothProgress;
          if (Math.abs(diff) > 0.05) {
            // 使用指数衰减算法，让动画更自然
            this.smoothProgress += diff * 0.08;
          } else {
            this.smoothProgress = targetProgress;
          }
        }
      }, 50);
    },

    stopCountdown() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      if (this.smoothTimer) {
        clearInterval(this.smoothTimer);
        this.smoothTimer = null;
      }
    },

    handleCountdownComplete() {
      // 跳转到结算页面，传递账单ID
      uni.navigateTo({
        url: `/pages/bill/billDelay?id=${this.billId}`
      });
    },

    // 启动账单轮询
    startPolling() {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
      }

      // 立即执行一次
      this.fetchBillDetail();

      // 每2秒轮询一次
      this.pollingTimer = setInterval(() => {
        this.fetchBillDetail();
      }, 2000);

      console.log('开始轮询账单详情，间隔: 2秒');
    },

    // 停止账单轮询
    stopPolling() {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
        this.pollingTimer = null;
        console.log('停止轮询账单详情');
      }
    },

    // 获取账单详情
    async fetchBillDetail() {
      if (!this.billId) {
        console.log('账单ID不存在，跳过本次轮询');
        return;
      }

      try {
        const response = await getBillDetailById(this.billId);
        if (response && response.code === 0) {
          console.log('账单详情更新:', response.data);
          // 这里可以根据需要处理账单详情数据
          // 例如：检查账单状态，如果已完成则可以提前结束倒计时
          this.handleBillDetailResponse(response.data);
        } else {
          console.error('获取账单详情失败:', response);
        }
      } catch (error) {
        console.error('调用账单详情接口失败:', error);
      }
    },

    // 处理账单详情响应
    handleBillDetailResponse(billData) {
      // 检查账单状态
      if (billData.billStatus === 11) {
        console.log('账单状态为11，跳转到结算页面');
        this.stopCountdown();
        this.stopPolling();

        // 跳转到结算页面，传递账单ID
        uni.navigateTo({
          url: `/pages/bill/settlementPay?busId=${this.busId}&billId=${this.billId}`
        });
      } else if (billData.billStatus === 14) {
        console.log('账单状态为14，跳转到结算页面');
        this.stopCountdown();
        this.stopPolling();

        // 跳转到结算页面，传递账单ID
        uni.navigateTo({
          url: `/pages/bill/settlementInfo?busId=${this.busId}&billId=${this.billId}`
        });
      }
    }
  },

  onReady() {
    this.$nextTick(() => {
      // 初始化开屏 LOGO lottie 动画（微信小程序）
      // #ifdef MP-WEIXIN
      this.initSplashLottie();
      // #endif
    });
  },

  // 页面卸载时清理定时器
  onUnload() {
    this.stopCountdown();
    this.stopPolling();
    this.destroySplashLottie();
  },

  // 页面隐藏时暂停倒计时和轮询
  onHide() {
    this.stopCountdown();
    this.stopPolling();
  },

  // 销毁 lottie 动画实例
  destroySplashLottie() {
    // #ifdef MP-WEIXIN
    if (this.splashLottieAnimation) {
      this.splashLottieAnimation.destroy();
      this.splashLottieAnimation = null;
      console.log('已销毁开屏 lottie 动画实例');
    }
    // #endif
  },

  // 页面显示时重新开始倒计时和轮询
  onShow() {
    if (this.countdown > 0 && !this.timer) {
      this.startCountdown();
    }
    if (this.billId && !this.pollingTimer) {
      this.startPolling();
    }
  },
  // 联系客服
  contactCustomerService() {
    contactCustomerServiceFn();
  }
}
</script>

<style scoped>
/* 开屏 LOGO 全屏层样式 */
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #E3F4FC;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 1;
  transition: opacity 600ms ease-out;
}

.splash-screen.splash-hidden {
  opacity: 0;
  pointer-events: none;
}

.splash-content {
  position: relative;
  width: 100%;
  height: 100%;
}

.splash-logo-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 500ms ease-out;
}

.splash-logo-container.logo-shift-left {
  transform: translate(calc(-50% - 120rpx), -50%);
}

.splash-canvas {
  width: 200rpx;
  height: 200rpx;
}

.splash-text {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-25%, -50%);
  font-size: 48rpx;
  color: #6AAAFB;
  font-weight: bold;
  opacity: 0;
  transition: opacity 500ms ease-in;
  z-index: 9999;
}

.splash-text.text-visible {
  opacity: 1;
}

/* 固定居中显示的文字容器 */
.loading-text-container {
  position: fixed;
  top: 85%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 36rpx;
  color: #6AAAFB;
  font-weight: bold;
  transition: opacity 500ms ease-in;
  z-index: 9999;
}

/* 呼吸动画文字样式 */
.loading-text {
  color: #6AAAFB;
  animation: textBreathe 2s ease-in-out infinite;
}

/* 文字呼吸动画 */
@keyframes textBreathe {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.page-container {
  height: 100vh;
  width: 100vw;
  background: #E3F4FC;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 32rpx;
  box-sizing: border-box;
  position: relative;
}

/* 消息容器 */
.message-container {
  text-align: center;
  margin-bottom: 80rpx;
  margin-top: -100rpx;
  animation: fadeInUp 0.8s ease-out;
}

.main-message {
  display: block;
  font-size: 32rpx;
  color: #6AAAFB;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.sub-message {
  display: block;
  font-size: 26rpx;
  color: #6AAAFB;
  font-weight: 400;
  margin-bottom: 8rpx;
  opacity: 0.8;
}

/* 倒计时进度条容器 */
.progress-container {
  width: 100%;
  max-width: 600rpx;
  animation: fadeInScale 0.8s ease-out 0.2s both;
}

/* 进度条 */
.progress-bar {
  width: 100%;
  height: 16rpx;
  background: rgba(106, 170, 251, 0.2);
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 40rpx;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6AAAFB 0%, #4A90E2 100%);
  border-radius: 8rpx;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 20rpx rgba(106, 170, 251, 0.5);
}

/* 倒计时文字 */
.countdown-text {
  display: block;
  text-align: center;
  font-size: 80rpx;
  font-weight: bold;
  color: #6AAAFB;
  animation: countdownPulse 1s ease-in-out infinite;
}

.countdown-unit {
  font-size: 40rpx;
  color: #6AAAFB;
  margin-left: 8rpx;
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(60rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes countdownPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.server-icon-wrapper {
  width: 55rpx;
  height: 55rpx;
  border-radius: 50%;
  background-color: #FEFFFF;
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

<template>
  <view class="page-container">
    <!-- #ifdef MP-WEIXIN -->
    <!-- 开屏 LOGO 全屏层 -->
    <view class="splash-screen" :class="{ 'splash-hidden': splashHidden, 'no-animation': noAnimation }"
          v-if="showSplash">
      <view class="splash-content">
        <view class="splash-logo-container" :class="{ 'logo-shift-left': logoShiftLeft }">
          <canvas type="2d" id="splashCanvas" class="splash-canvas"></canvas>
        </view>
        <text class="splash-text" :class="{ 'text-visible': textVisible }">{{ getWxAppName() }}</text>
      </view>

      <!-- 固定居中显示的启动中文字 -->
      <view class="loading-text-container" :class="{ 'lottie-animation1': animation1, 'no-animation': noAnimation }">
        <text class="loading-text">充电桩启动中</text>
      </view>
    </view>
    <!-- #endif -->

    <uv-navbar :border="false" bgColor="transparent" autoBack :title="title" placeholder safeAreaInsetTop>
      <template v-slot:right>
        <view style="margin-right: 200rpx; margin-bottom: 5rpx;">
          <CustomerServiceButton
              session-from="charging_page"
              custom-class="server-icon-wrapper"
          />
        </view>
      </template>
    </uv-navbar>

    <!-- 头部容器：logo和价格标签 -->
    <view class="header-container">
      <view class="logo-container">
        <!-- #ifdef MP-WEIXIN -->
        <view class="logo-lottie-container">
          <canvas type="2d" id="logoCanvas" class="logo-canvas"></canvas>
        </view>
        <!-- #endif -->
        <text class="logo-text">{{ getWxAppName() }}</text>
      </view>
    </view>

    <!-- #ifdef MP-ALIPAY -->
    <view class="lottie-container" :class="{ 'lottie-animation1': animation1, 'no-animation': noAnimation }">
      <lottie
          :autoplay="startingLottie.autoplay"
          :id="startingLottie.id"
          :path="startingLottie.path"
          :repeat-count="startingLottie.repeatCount"
          class="startingLottie"
          :style="lottieStyle">
      </lottie>
    </view>
    <!-- #endif -->

    <!-- 充电站信息 -->
    <view class="station-info">

      <text class="station-name">{{ chargingGunInfo.stationName || '测试站' }}</text>
      <text class="station-gun">{{ chargingGunInfo.gunName || '测试枪' }}</text>
    </view>

    <!-- 电量百分比圆环 -->
    <view class="battery-circle">
      <!-- 气泡容器 -->
      <view class="bubbles-container">
        <view
            v-for="bubble in bubbles"
            :key="bubble.id"
            class="bubble"
            :style="{
                        left: bubble.startX + 'px',
                        top: bubble.startY + 'px',
                        width: bubble.size + 'px',
                        height: bubble.size + 'px',
                        animationDuration: bubble.duration + 's',
                        animationDelay: bubble.delay + 's',
                        '--end-x': bubble.translateX + 'px',
                        '--end-y': bubble.translateY + 'px'
                    }"
        ></view>
      </view>

      <view class="circle-container">
        <!-- 波浪圆环层 -->
        <view class="wave-ring wave-ring-1"></view>
        <view class="wave-ring wave-ring-2"></view>
        <view class="wave-ring wave-ring-3"></view>

        <!-- 中心内容 -->
        <view class="circle-content">
          <text class="battery-percent">{{ batteryData.percent || '--' }}
            <text class="battery-percent-unit">%</text>
          </text>
        </view>
      </view>
    </view>

    <!-- 车牌号和时间 -->
    <view class="car-info">
      <text class="car-number">{{ carNumber || '--' }}</text>
    </view>

    <view class="time-info">
      <text class="time-value"></text>

      <StatusTag
          :text="`当前电价: ${priceData.currentPrice || '--'}元/度`"
          backgroundColor="#4A90E2"
          textColor="#FFFFFF"
          :fontSize="'22rpx'"
          :padding="'8rpx 16rpx'"
          :borderRadius="'20rpx'"
          :fontWeight="'500'"
      />
    </view>

    <!-- 费用统计卡片 -->
    <view class="stats-card">
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-value">{{ chargingStats.duration || '--' }}</text>
          <text class="stat-label">充电时长(min)</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ parseFloat(chargingStats.powerAmount).toFixed(3) || '--' }}</text>
          <text class="stat-label">已充电量(度)</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ chargingStats.estimatedTime || '--' }}</text>
          <text class="stat-label">预估充满剩余时间</text>
        </view>
      </view>

      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-value">{{ parseFloat(electricalData.current).toFixed(2) || '--' }}</text>
          <text class="stat-label">电流(A)</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ parseFloat(electricalData.voltage).toFixed(2) || '--' }}</text>
          <text class="stat-label">电压(V)</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ parseFloat(electricalData.power).toFixed(2) || '--' }}</text>
          <text class="stat-label">功率(kW)</text>
        </view>
      </view>

      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-value">{{ parseFloat(feeData.preChargeAmount).toFixed(2) || '--' }}</text>
          <text class="stat-label">预充金额</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ parseFloat(feeData.estimatedFee).toFixed(2) || '--' }}</text>
          <text class="stat-label">预估费用(元)</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ parseFloat(feeData.remainingFee).toFixed(2) || '--' }}</text>
          <text class="stat-label">剩余费用(元)</text>
        </view>
      </view>
    </view>

    <uv-alert type="warning" description="预估费用仅供参考，请以实际结算金额为准" showIcon></uv-alert>

    <!-- 停止充电按钮 -->
    <view class="stop-button" @tap="handleStopCharging">
      <text class="stop-text">停止充电</text>
    </view>
  </view>
</template>

<script>
import {querChargeOnline} from '../../api/charge.js'
import {getPreChargeAmountByBusId} from '../../api/charge.js'
import {stopCharge} from '../../api/charge.js'
import StatusTag from '../../components/common/StatusTag.vue'
import globalData from '../../globalData.js'
import CustomerServiceButton from '@/components/common/CustomerServiceButton.vue';
// #ifdef MP-WEIXIN
import lottie from 'lottie-miniprogram'
import logoAnimationData from '../../static/X2.json'
import {contactCustomerService as contactCustomerServiceFn} from '@/utils/utils';
// #endif

export default {
  components: {
    StatusTag,
    CustomerServiceButton
  },
  data() {
    return {
      logoLottieAnimation: null, // 存储 logo lottie 动画实例
      splashLottieAnimation: null, // 存储开屏 lottie 动画实例
      showSplash: true, // 是否显示开屏层
      splashHidden: false, // 开屏层是否隐藏（透明）
      logoShiftLeft: false, // logo 是否向左移动
      textVisible: false, // 文字是否可见
      animationEnabled: true,
      animation1: false,
      animation2: false,
      gunStatus: null,
      noAnimation: false,
      title: '启动中',
      startingLottie: {
        id: 'startingLottie',
        desc: '启动中',
        autoplay: false,
        path: 'https://lottie.host/4937651f-eae1-4005-8ede-3cde4dd26ee3/Tm5KQBFFBi.json',
        optimize: 'true',
        repeatCount: 0,
      },
      screenInfo: {
        width: 0,
        height: 0
      },
      // 电池数据
      batteryData: {
        percent: null
      },
      // 充电时间
      chargingTime: '2023年08月20日 16:01:17',
      // 价格数据
      priceData: {
        currentPrice: ''
      },
      // 充电统计数据
      chargingStats: {
        duration: null,
        powerAmount: null,
        estimatedTime: null
      },
      // 电气数据
      electricalData: {
        current: null,
        voltage: null,
        power: null
      },
      carNumber: '--',
      // 费用数据
      feeData: {
        preChargeAmount: null,
        estimatedFee: null,
        remainingFee: null
      },
      chargingGunInfo: {
        pileNo: '',
        gunNo: '',
        busId: '',
        gunId: '',
        stationName: '',
        gunName: '',
        pileName: ''
      },
      // 定时器相关
      pollingTimer: null,
      pollingInterval: 5000, // 5秒
      // 气泡相关
      bubbles: [],
      bubbleTimer: null,
      bubbleIdCounter: 0,
      circleRadius: 160 // 圆环半径（rpx转px后约为160px）
    }
  },
  computed: {
    lottieStyle() {
      return {
        // width: `${this.screenInfo.width * 1}px`,  // 使用屏幕宽度的80%
        // height: `${this.screenInfo.height * 1}px`  // 使用屏幕高度的60%
        width: `100%`,
        height: `100%`
      }
    }
  },
  async onLoad(options) {
    console.log('充电中参数', options);
    // 校验参数
    this.animationEnabled = options.animationEnabled;
    if (this.animationEnabled === 'false') {
      this.noAnimation = true;
      this.showSplash = false;
      console.log('set noAnimation', this.noAnimation)
    }
    console.log('set animationEnabled', this.animationEnabled)
    if (!options.pileNo || !options.gunNo || !options.busId || !options.gunId || !options.billId) {
      uni.showToast({
        title: '参数异常',
        icon: 'none'
      });
      return;
    }
    this.chargingGunInfo = {
      pileNo: options.pileNo,
      gunNo: options.gunNo,
      busId: options.busId,
      gunId: options.gunId,
      billId: options.billId
    };

    try {
      console.log('请求预充金额', this.chargingGunInfo.busId);
      const preChargeAmountRes = await getPreChargeAmountByBusId(options.busId)
      if (preChargeAmountRes && preChargeAmountRes.code === 0) {
        this.feeData.preChargeAmount = (parseInt(preChargeAmountRes.data) / 100).toFixed(2);
      }

      // 启动定时器进行轮询
      this.startPolling();
    } catch (error) {
      console.error('初始化充电数据失败:', error);
    }

    this.getScreenInfo();
  },
  methods: {
    // 初始化开屏 LOGO lottie 动画（微信小程序）
    getWxAppName() {
      return globalData.wxAppName;
    },
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
    },

    // 初始化头部 logo lottie 动画（微信小程序）
    initLogoLottie() {
      // #ifdef MP-WEIXIN
      wx.createSelectorQuery()
          .select('#logoCanvas')
          .node((res) => {
            const canvas = res.node;
            const context = canvas.getContext('2d');

            // 设置 canvas 实际大小
            const dpr = wx.getSystemInfoSync().pixelRatio;
            const size = 80; // rpx
            canvas.width = size * (dpr / 2);
            canvas.height = size * (dpr / 2);
            context.scale(dpr / 2, dpr / 2);

            // 使用导入的 lottie JSON 数据
            lottie.setup(canvas);
            this.logoLottieAnimation = lottie.loadAnimation({
              loop: false,
              autoplay: true,
              animationData: logoAnimationData,
              rendererSettings: {
                context: context
              }
            });
          })
          .exec();
      // #endif
    },

    // 生成单个气泡
    generateBubble() {
      // uni-app中320rpx大约等于160px（在375px宽度设备上），所以容器中心是80px
      const centerX = 80;
      const centerY = 80;

      // 在圆环外围随机生成起始位置
      const angle = Math.random() * Math.PI * 2;
      const outerRadius = 80 + 120; // 在圆环外120px处生成
      const startX = centerX + Math.cos(angle) * outerRadius;
      const startY = centerY + Math.sin(angle) * outerRadius;

      // 终点在圆心位置
      const endRadius = 0;
      const endAngle = 0;
      const endX = centerX + Math.cos(endAngle) * endRadius;
      const endY = centerY + Math.sin(endAngle) * endRadius;

      // 计算移动的距离
      const translateX = endX - startX;
      const translateY = endY - startY;

      // 气泡大小随机（12-24px）
      const size = 12 + Math.random() * 12;

      // 动画时长随机（3-5秒），缓慢移动
      const duration = 3 + Math.random() * 2;

      // 延迟随机（0-0.5秒）
      const delay = Math.random() * 0.5;

      const bubble = {
        id: this.bubbleIdCounter++,
        startX,
        startY,
        translateX,
        translateY,
        size,
        duration,
        delay
      };

      this.bubbles.push(bubble);

      // 动画结束后删除气泡，防止内存泄漏
      setTimeout(() => {
        const index = this.bubbles.findIndex(b => b.id === bubble.id);
        if (index > -1) {
          this.bubbles.splice(index, 1);
        }
      }, (duration + delay + 0.5) * 1000);
    },

    // 启动气泡动画
    startBubbleAnimation() {
      if (this.bubbleTimer) {
        clearTimeout(this.bubbleTimer);
      }

      // 每隔200-400ms生成气泡，营造连续的气泡流效果
      const generateBubbles = () => {
        // 每次生成1个气泡
        this.generateBubble();

        const nextInterval = 200 + Math.random() * 200;
        this.bubbleTimer = setTimeout(generateBubbles, nextInterval);
      };

      generateBubbles();
    },

    // 停止气泡动画
    stopBubbleAnimation() {
      if (this.bubbleTimer) {
        clearTimeout(this.bubbleTimer);
        this.bubbleTimer = null;
      }
      this.bubbles = [];
    },
    // 销毁所有 lottie 动画实例
    destroyLottieAnimations() {
      // #ifdef MP-WEIXIN
      if (this.splashLottieAnimation) {
        this.splashLottieAnimation.destroy();
        this.splashLottieAnimation = null;
        console.log('已销毁开屏 lottie 动画实例');
      }
      if (this.logoLottieAnimation) {
        this.logoLottieAnimation.destroy();
        this.logoLottieAnimation = null;
        console.log('已销毁头部 logo lottie 动画实例');
      }
      // #endif
    },

    // 获取充电数据
    async fetchChargingData() {
      // 检查必要参数是否存在
      if (!this.chargingGunInfo.busId || !this.chargingGunInfo.pileNo || !this.chargingGunInfo.gunNo) {
        console.warn('充电桩参数不完整，跳过本次轮询');
        return;
      }

      try {
        const querChargeOnlineRes = await querChargeOnline({
          busId: this.chargingGunInfo.busId,
          pileNo: this.chargingGunInfo.pileNo,
          gunNo: this.chargingGunInfo.gunNo
        });

        if (querChargeOnlineRes && querChargeOnlineRes.code === 0) {
          if (!this.destroiedSplash) {
            this.title = '充电中';
            this.destroiedSplash = true;

            // 3. 延迟 1000ms 后整个开屏层渐隐
            if (this.showSplash) {
              setTimeout(() => {
                this.splashHidden = true;

                // 4. 完全隐藏后移除开屏层（节省性能）
                setTimeout(() => {
                  // 销毁动画实例
                  if (this.splashLottieAnimation) {
                    this.splashLottieAnimation.destroy();
                    this.splashLottieAnimation = null;
                    this.showSplash = false;
                  }
                }, 1000); // 等待透明度动画完成（600ms）
              }, 1000); // 文字显示后延迟 1s
              console.log('销毁开屏动画');
            }
          }
          // 这里可以根据接口返回的数据更新页面状态
          console.log('充电数据更新:', querChargeOnlineRes.data);

          // 根据实际接口返回的数据结构来更新相应的数据
          // 请根据实际的API响应结构来调整以下代码
          if (querChargeOnlineRes.data) {
            const data = querChargeOnlineRes.data;
            this.gunStatus = data.chargingStatus;

            // 更新电池百分比
            this.batteryData.percent = data.soc;

            // 更新充电统计数据
            this.chargingStats.duration = data.chargingTime;
            this.chargingStats.powerAmount = (parseInt(data.powerinfo) / 1000).toFixed(3);
            this.chargingStats.estimatedTime = data.remainingtime;

            // 更新电气数据
            this.electricalData.current = (parseInt(data.ivoltage) / 1000).toFixed(3);
            this.electricalData.voltage = (parseInt(data.voltage) / 1000).toFixed(3);
            this.electricalData.power = data.realTimePower;

            // 更新费用数据
            this.feeData.estimatedFee = (parseInt(data.cost) / 1000).toFixed(3);
            if (this.feeData.preChargeAmount) {
              this.feeData.remainingFee = (this.feeData.preChargeAmount - this.feeData.estimatedFee).toFixed(2);
            }

            if (data.plateno) {
              this.carNumber = data.plateno;
            }

            // 更新充电时间
            if (data.chargingTime) {
              this.chargingTime = data.chargingTime;
            }

            if (data.stationName) {
              this.chargingGunInfo.stationName = data.stationName;
            }

            if (data.gunName) {
              this.chargingGunInfo.gunName = data.gunName;
            }

            if (data.pileName) {
              this.chargingGunInfo.pileName = data.pileName;
            }

            if (data.electPrice) {
              this.priceData.currentPrice = (parseInt(data.electPrice) / 10000).toFixed(4);
            }
          }
        } else if (querChargeOnlineRes && querChargeOnlineRes.code === 40624) {
          uni.showModal({
            title: '温馨提示',
            content: '平台检测到充电桩已经停止充电，是否结束充电？',
            confirmText: '结束充电',
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
                this.handleStopCharging()
              }
            }
          });
        } else {
          console.error('获取充电数据失败:', querChargeOnlineRes);
        }
      } catch (error) {
        console.error('调用充电接口失败:', error);
        // 网络错误时可以考虑增加重试机制或者给用户提示
      }
    },

    // 启动轮询
    startPolling() {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
      }
      this.fetchChargingData();
      this.pollingTimer = setInterval(() => {
        this.fetchChargingData();
      }, this.pollingInterval);

      console.log('开始轮询充电数据，间隔:', this.pollingInterval, 'ms');
    },

    // 停止轮询
    stopPolling() {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
        this.pollingTimer = null;
        console.log('停止轮询充电数据');
      }
    },

    // 获取屏幕信息
    getScreenInfo() {
      const systemInfo = uni.getSystemInfoSync();
      this.screenInfo = {
        width: systemInfo.screenWidth,
        height: systemInfo.screenHeight
      };
    },
    onStartingAnimationEnd() {
      console.log('动画结束');
      this.animation1 = true;
    },

    // 处理停止充电按钮点击
    handleStopCharging() {
      uni.showModal({
        title: '确认停止充电',
        content: '确定要停止当前充电吗？',
        confirmText: '确定',
        cancelText: '取消',
        success: async (res) => {
          if (res.confirm) {
            // 这里可以调用停止充电的API
            if (!this.gunStatus) {
              uni.showToast({
                title: '充电状态同步中，请稍后再试',
                icon: 'none'
              });
              return;
            }
            // 然后跳转到结算页面或其他页面
            console.log('用户确认停止充电');
            const stopChargeRes = await stopCharge({
              busId: this.chargingGunInfo.busId
            });
            if (stopChargeRes && stopChargeRes.code === 0) {
              this.stopPolling();
              // 跳转到结算页面
              uni.navigateTo({
                url: `/pages/charge/stopping?busId=${this.chargingGunInfo.busId}&billId=${this.chargingGunInfo.billId}`
              });
            }
          }
        }
      });
    }
  },
  onReady() {
    this.$nextTick(() => {
      // 初始化开屏 LOGO lottie 动画（微信小程序）
      // #ifdef MP-WEIXIN
      if (this.showSplash) {
        this.initSplashLottie();
      }
      this.initLogoLottie();
      // #endif

      // this.startSuccess = true;
      // 五秒后启动成功
      // #ifdef MP-ALIPAY
      if (my) {
        var lottieContext = my.createLottieContext(this.startingLottie.id);
        console.log('animationEnabled', this.animationEnabled)
        if (this.animationEnabled == 'true' || this.animationEnabled == true) {
          console.log('播放动画');
          lottieContext.play()
          setTimeout(() => {
            this.animation1 = true;
          }, 5000);
        }
      }
      // #endif

      // 启动气泡动画
      this.startBubbleAnimation();
    });
  },

  // 页面隐藏时停止轮询
  onHide() {
    this.stopPolling();
    this.stopBubbleAnimation();
  },

  // 页面显示时重新开始轮询
  onShow() {
    if (this.chargingGunInfo.busId) {
      this.startPolling();
      this.startBubbleAnimation();
    }
  },

  // 页面卸载时清理定时器
  onUnload() {
    this.stopPolling();
    this.stopBubbleAnimation();
    this.destroyLottieAnimations();
  },

  // 页面销毁前清理定时器
  beforeDestroy() {
    this.stopPolling();
    this.stopBubbleAnimation();
    this.destroyLottieAnimations();
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
  z-index: 3;
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

/* 支付宝小程序的开屏动画样式 */
.lottie-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #288EEE;
  z-index: 998;
  opacity: 1;
}

.no-animation {
  opacity: 0;
  background-color: #fff;
  pointer-events: none;
}

.lottie-animation1 {
  opacity: 0;
  /* background-color: #E2F5FF; */
  pointer-events: none;
  transition: opacity 4s ease-in-out;
}

.lottie-animation2 {
  background-color: #fff;
  pointer-events: none;
  /* transition: background-color 1s ease; */
}


.page-container {
  min-height: 100vh;
  width: 100vw;
  /* display: flex;
  justify-content: center;
  align-items: center; */
  background-color: #E3F4FC;
  position: relative;
  padding: 0 32rpx;
  padding-bottom: calc(96rpx + 60rpx + env(safe-area-inset-bottom)); /* 按钮高度 + 外边距 + 底部安全区域 */
  box-sizing: border-box;
}

/* 头部容器：logo和价格标签 */
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  margin-bottom: -55rpx;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo-lottie-container {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-canvas {
  width: 80rpx;
  height: 80rpx;
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

/* 白色文字样式 */
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

.back-icon {
  font-size: 48rpx;
  color: #333;
  font-weight: bold;
}

.nav-title {
  font-size: 36rpx;
  color: #333;
  font-weight: 500;
}

.logo-text {
  font-size: 32rpx;
  color: #6AAAFB;
  font-weight: 1000;
}

.info-icon {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #333;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24rpx;
  color: #333;
}

/* 充电站信息 */
.station-info {
  text-align: center;
  padding-top: 0rpx;
  margin-bottom: 60rpx;
}

.station-name {
  display: block;
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.station-gun {
  display: block;
  font-size: 24rpx;
  color: #666;
}

/* 电量圆环 */
.battery-circle {
  display: flex;
  justify-content: center;
  margin-bottom: 60rpx;
  position: relative;
}

/* 气泡容器 */
.bubbles-container {
  position: absolute;
  width: 320rpx;
  height: 320rpx;
  pointer-events: none;
  z-index: 1;
}

/* 气泡样式 */
.bubble {
  position: absolute;
  border-radius: 50%;
  background: rgba(74, 144, 226, 0.7);
  animation: bubbleFloat forwards linear;
  will-change: transform, opacity;
  opacity: 0;
}

/* 气泡向中心移动的动画 */
@keyframes bubbleFloat {
  0% {
    transform: translate(0, 0);
    opacity: 0;
  }
  5% {
    opacity: 0;
  }
  15% {
    opacity: 0.8;
  }
  70% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.3;
  }
  100% {
    transform: translate(var(--end-x), var(--end-y));
    opacity: 0;
  }
}

.circle-container {
  width: 320rpx;
  height: 320rpx;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 2;
}

/* 波浪圆环基础样式 */
.wave-ring {
  position: absolute;
  border-radius: 50%;
  border: 3rpx solid rgba(74, 144, 226, 0.3);
  box-sizing: border-box;
}

/* 第一层波浪圆环 */
.wave-ring-1 {
  width: 100%;
  height: 100%;
  animation: waveScaleIn 3s ease-in-out infinite;
}

/* 第二层波浪圆环 */
.wave-ring-2 {
  width: 100%;
  height: 100%;
  border-color: rgba(74, 144, 226, 0.4);
  animation: waveScaleIn 3s ease-in-out infinite;
  animation-delay: 1s;
}

/* 第三层波浪圆环 */
.wave-ring-3 {
  width: 100%;
  height: 100%;
  border-color: rgba(74, 144, 226, 0.5);
  animation: waveScaleIn 3s ease-in-out infinite;
  animation-delay: 2s;
}

/* 中心内容容器 */
.circle-content {
  width: 70%;
  height: 70%;
  border-radius: 50%;
  background: #75adf5;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 3;
  animation: breathe 3s ease-in-out infinite;
}

/* 波浪圆环从外到内缩放动画 */
@keyframes waveScaleIn {
  0% {
    transform: scale(1.2);
    opacity: 0;
    border-width: 2rpx;
  }
  30% {
    opacity: 0.8;
  }
  100% {
    transform: scale(0.7);
    opacity: 0;
    border-width: 4rpx;
  }
}

/* 中心容器呼吸动画 */
@keyframes breathe {
  0%, 100% {
    transform: scale(0.9);
    opacity: 1;
  }
  50% {
    transform: scale(1.03);
    opacity: 0.87;
  }
}

.battery-percent {
  font-size: 88rpx !important;
  font-weight: bold;
  color: #e6f1ff;
  z-index: 4;
}

.battery-percent-unit {
  font-size: 48rpx !important;
  color: #e6f1ff;
}

/* 车牌号和时间 */
.car-info {
  text-align: center;
  margin-bottom: 20rpx;
}

.time-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.car-number {
  display: block;
  font-size: 40rpx;
  color: #333;
  font-weight: 700;
  margin-bottom: 16rpx;
}

.charge-time {
  display: block;
  font-size: 24rpx;
  color: #666;
}

/* 统计卡片 */
.stats-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.price-info {
  margin-bottom: 32rpx;
}

.price-label {
  font-size: 28rpx;
  color: #666;
}

.price-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #4A90E2;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 48rpx;
}

.stats-row:last-child {
  margin-bottom: 0;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.stat-label {
  display: block;
  font-size: 24rpx;
  color: #999;
}

/* 停止充电按钮 */
.stop-button {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #4A90E2;
  border-radius: 48rpx;
  height: 96rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  width: calc(100% - 64rpx);
  max-width: 600rpx;
  margin: 0 auto;
  margin-bottom: calc(30rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 16rpx rgba(74, 144, 226, 0.2);
  z-index: 2;
}

.stop-text {
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 500;
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

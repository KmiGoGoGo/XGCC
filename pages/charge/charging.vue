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

    <uv-navbar :border="false" bgColor="transparent" :autoBack="false" :title="title" :placeholder="true" :safeAreaInsetTop="true" @leftClick="handleNavBack">
      <template v-slot:right>
        <view style="margin-right: 200rpx; margin-bottom: 5rpx;">
          <CustomerServiceButton
              session-from="charging_page"
              custom-class="server-icon-wrapper"
          />
        </view>
      </template>
    </uv-navbar>

    <!-- 广告位：与首页同规格（300rpx 高），随页面滚动 -->
    <ad-banner
        margin-top="12rpx"
        margin-bottom="4rpx"
        session-from="charging_page"
    />

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

    <!-- 站点信息卡：桩名 + 车牌牌匾 + 枪号 + 电价 -->
    <view class="station-card">
      <view class="sc-row">
        <text class="sc-name">{{ chargingGunInfo.stationName || '测试站' }}</text>
        <view v-if="hasPlate" class="plate-badge">
          <text class="plate-char">{{ plateHead }}</text>
          <text class="plate-char">{{ plateLetter }}</text>
          <text class="plate-dot">·</text>
          <text class="plate-char">{{ plateRest }}</text>
        </view>
      </view>
      <view class="sc-row sc-row-bottom">
        <text class="sc-sub">{{ chargingGunInfo.gunName || '测试枪' }}</text>
        <view class="price-chip">
          <text class="price-chip-stage">{{ nowStageInfo ? nowStageInfo.stage : '--' }}段</text>
          <text class="price-chip-num">{{ nowStageInfo ? nowStageInfo.sweepPriceStr : '--' }}</text>
          <text class="price-chip-unit">元/度</text>
        </view>
      </view>
    </view>

    <!-- 电量：电池条随 SOC 增长 -->
    <view class="soc-block">
      <view class="soc-head">
        <text class="soc-num">{{ displayPercent }}</text>
        <text class="soc-unit">%</text>
        <view class="soc-divider"></view>
        <view class="soc-tag">
          <view class="dot-live"></view>
          <text class="soc-tag-text">正在充电</text>
        </view>
      </view>

      <!-- 电池：填充宽度随电量递增，右端为正极小凸起 -->
      <view class="battery-row">
        <view class="battery-body">
          <view class="battery-fill" :style="{ width: batteryFillWidth }">
            <view class="battery-bolt"></view>
          </view>
        </view>
        <view class="battery-cap"></view>
      </view>

      <view class="gauge-remain">
        <text class="remain-text">预计
          <text class="remain-strong">{{ chargingStats.estimatedTime || '--' }}</text>
          分钟充满
        </text>
      </view>
    </view>

    <!-- 核心数据：四项主指标 -->
    <view class="core-card">
      <view class="core-cell core-cell-rb">
        <text class="core-label">已充电量</text>
        <view class="core-value">
          <text class="core-n core-n-accent">{{ formatNum(chargingStats.powerAmount, 3) }}</text>
          <text class="core-u">度</text>
        </view>
      </view>
      <view class="core-cell core-cell-b">
        <text class="core-label">充电时长</text>
        <view class="core-value">
          <text class="core-n">{{ chargingStats.duration || '0' }}</text>
          <text class="core-u">分钟</text>
        </view>
      </view>
      <view class="core-cell core-cell-r">
        <text class="core-label">当前功率</text>
        <view class="core-value">
          <text class="core-n">{{ formatNum(electricalData.power, 2) }}</text>
          <text class="core-u">kW</text>
        </view>
      </view>
      <view class="core-cell">
        <text class="core-label">预估费用</text>
        <view class="core-value">
          <text class="core-n">{{ formatNum(feeData.estimatedFee, 2) }}</text>
          <text class="core-u">元</text>
        </view>
      </view>
      <!-- 费用说明：跟随卡片，避免被底部固定按钮遮挡 -->
      <view class="core-tip">预估费用仅供参考，请以实际结算金额为准</view>
    </view>

    <!-- 次要参数 -->
    <view class="minor-row">
      <text class="minor-item">电压 <text class="minor-strong">{{ formatNum(electricalData.voltage, 2) }}</text> V</text>
      <text class="minor-sep">·</text>
      <text class="minor-item">电流 <text class="minor-strong">{{ formatNum(electricalData.current, 2) }}</text> A</text>
    </view>


    <!-- 停止充电按钮：充电桩启动中（未拿到充电数据）时不显示 -->
    <view class="stop-button" v-if="showStopButton" @tap="handleStopCharging">
      <text class="stop-text">停止充电</text>
    </view>
  </view>
</template>

<script>
import {querChargeOnline} from '../../api/charge.js'
import {getPreChargeAmountByBusId} from '../../api/charge.js'
import {stopCharge} from '../../api/charge.js'
import globalData from '../../globalData.js'
import CustomerServiceButton from '@/components/common/CustomerServiceButton.vue';
import AdBanner from '@/components/common/AdBanner.vue';
import {getStationGunDetails} from '@/api/stationGun.js'
// #ifdef MP-WEIXIN
import lottie from 'lottie-miniprogram'
import logoAnimationData from '../../static/X2.json'
import {contactCustomerService as contactCustomerServiceFn, handleNavBack} from '@/utils/utils';
// #endif

export default {
  components: {
    CustomerServiceButton,
    AdBanner
  },
  data() {
    return {
      nowStageInfo: null,
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
      // 电量百分比（跟随动画递增，电池填充同步）
      displayPercent: 0,
      // 是否显示「停止充电」：充电桩启动中（未拿到充电数据）时不显示
      showStopButton: false,
      // 兜底定时器：长时间拿不到数据时仍允许停止
      stopButtonTimer: null,
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
      stageDetailsTimer: null // 价格详情定时器
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
    },
    // 车牌拆段：省份简称 / 字母 / 序号，中间显示「·」
    hasPlate() {
      return !!this.carNumber && this.carNumber !== '--';
    },
    plateHead() {
      return (this.carNumber || '').slice(0, 1);
    },
    plateLetter() {
      return (this.carNumber || '').slice(1, 2);
    },
    plateRest() {
      return (this.carNumber || '').slice(2);
    },
    // 电池填充宽度：跟随电量动画递增
    batteryFillWidth() {
      const percent = Math.min(Math.max(this.displayPercent, 0), 100);
      return percent + '%';
    }
  },
  watch: {
    // SOC 变化时播放电量增长动画（数字滚动 + 电池填充递增）
    'batteryData.percent': {
      handler(val) {
        const target = parseFloat(val);
        this._targetPercent = isNaN(target) ? 0 : Math.min(Math.max(target, 0), 100);
        this.animateGauge(this._targetPercent);
      },
      immediate: true
    }
  },
  onShareAppMessage() {
    return {
      title: this.getWxAppName(),
      path: '/pages/index/index'
    }
  },
  onShareTimeline() {
    return {
      title: this.getWxAppName(),
      path: '/pages/index/index'
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

      // 初始化价格详情：立即调用一次，然后每10分钟调用一次
      this.getGunCurrentStageDetails();
      this.stageDetailsTimer = setInterval(() => {
        this.getGunCurrentStageDetails();
      }, 10 * 60 * 1000); // 10分钟 = 600000毫秒
    } catch (error) {
      console.error('初始化充电数据失败:', error);
    }

    this.getScreenInfo();

    // 兜底：20 秒仍未拿到充电数据，也放出停止按钮，避免用户卡在启动中无法操作
    this.stopButtonTimer = setTimeout(() => {
      this.showStopButton = true;
    }, 20000);
  },
  methods: {
    handleNavBack,
    // 初始化开屏 LOGO lottie 动画（微信小程序）
    getWxAppName() {
      return globalData.wxAppName;
    },
    // 数值格式化：非法值统一显示 --
    formatNum(value, digits = 2) {
      const num = parseFloat(value);
      return isNaN(num) ? '--' : num.toFixed(digits);
    },
    // 电量增长动画：数字与电池填充同步递增
    animateGauge(target) {
      if (this._gaugeTimer) {
        clearInterval(this._gaugeTimer);
        this._gaugeTimer = null;
      }
      const duration = 1200;
      const step = 40;
      let elapsed = 0;
      this._gaugeTimer = setInterval(() => {
        elapsed += step;
        const progress = Math.min(elapsed / duration, 1);
        // 三次方缓出
        const eased = 1 - Math.pow(1 - progress, 3);
        const intValue = Math.round(target * eased);
        if (intValue !== this.displayPercent) {
          this.displayPercent = intValue;
        }
        if (progress >= 1) {
          clearInterval(this._gaugeTimer);
          this._gaugeTimer = null;
        }
      }, step);
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

    // 销毁所有 lottie 动画实例
    destroyLottieAnimations() {
      // #ifdef MP-WEIXIN
      if (this.splashLottieAnimation) {
        this.splashLottieAnimation.destroy();
        this.splashLottieAnimation = null;
        console.log('已销毁开屏 lottie 动画实例');
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
          // 拿到充电数据 = 充电已真正开始，此时才展示「停止充电」
          this.showStopButton = true;
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
            this.feeData.estimatedFee = (parseInt(data.cost) / 100).toFixed(3);
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
          this.stopPolling()
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

    async getGunCurrentStageDetails() {
      const res = await getStationGunDetails({gunId: this.chargingGunInfo.gunId})
      if (res.code == 0 && res.data) {
        // 找到当前时段的价格
        const nowStage = res.data.powerStageDetail.find(p => p.now)
        if (nowStage) {
          // 初始化 nowStageInfo 对象（如果为 null）
          if (!this.nowStageInfo) {
            this.nowStageInfo = {};
          }
          this.nowStageInfo.stage = nowStage.stage == 1 ? '尖' : nowStage.stage == 2 ? '峰' : nowStage.stage == 3 ? '平' : nowStage.stage == 4 ? '谷' : '--'
          this.nowStageInfo.price = nowStage.currentPriceStr
          this.nowStageInfo.sweepPriceStr = nowStage.sweepPriceStr
          this.nowStageInfo.discount = nowStage.discount
        }
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
    });
  },

  // 页面隐藏时停止轮询
  onHide() {
    this.stopPolling();
    // 清除环形进度动画
    if (this._gaugeTimer) {
      clearInterval(this._gaugeTimer);
      this._gaugeTimer = null;
    }
    // 清除价格详情定时器
    if (this.stageDetailsTimer) {
      clearInterval(this.stageDetailsTimer);
      this.stageDetailsTimer = null;
    }
  },

  // 页面显示时重新开始轮询
  onShow() {
    if (this.chargingGunInfo.busId) {
      this.startPolling();
      // 重新播放电量增长动画
      this.animateGauge(this._targetPercent || 0);
      // 重新启动价格详情定时器
      if (!this.stageDetailsTimer) {
        this.getGunCurrentStageDetails();
        this.stageDetailsTimer = setInterval(() => {
          this.getGunCurrentStageDetails();
        }, 10 * 60 * 1000); // 10分钟 = 600000毫秒
      }
    }
  },

  // 页面卸载时清理定时器
  onUnload() {
    this.stopPolling();
    if (this.stopButtonTimer) {
      clearTimeout(this.stopButtonTimer);
      this.stopButtonTimer = null;
    }
    if (this._gaugeTimer) {
      clearInterval(this._gaugeTimer);
      this._gaugeTimer = null;
    }
    this.destroyLottieAnimations();
    // 清除价格详情定时器
    if (this.stageDetailsTimer) {
      clearInterval(this.stageDetailsTimer);
      this.stageDetailsTimer = null;
    }
  },

  // 页面销毁前清理定时器
  beforeDestroy() {
    this.stopPolling();
    if (this.stopButtonTimer) {
      clearTimeout(this.stopButtonTimer);
      this.stopButtonTimer = null;
    }
    if (this._gaugeTimer) {
      clearInterval(this._gaugeTimer);
      this._gaugeTimer = null;
    }
    this.destroyLottieAnimations();
    // 清除价格详情定时器
    if (this.stageDetailsTimer) {
      clearInterval(this.stageDetailsTimer);
      this.stageDetailsTimer = null;
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


/* 页面容器：浅蓝到浅灰的柔和渐变，避免大面积纯色 */
.page-container {
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(180deg, #E9F3FD 0%, #F5FAFE 40%, #F7F9FC 100%);
  position: relative;
  padding: 0 24rpx;
  padding-bottom: calc(96rpx + 64rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

/* ===== 站点信息卡 ===== */
.station-card {
  margin-top: 0;
  padding: 22rpx 26rpx;
  border-radius: 32rpx;
  background-color: #FFFFFF;
  box-shadow: 0 8rpx 28rpx rgba(23, 78, 145, 0.07);
  animation: cardUp 520ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
}

.sc-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.sc-row-bottom {
  margin-top: 14rpx;
}

.sc-name {
  flex: 1;
  min-width: 0;
  margin-right: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #16233A;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sc-sub {
  font-size: 24rpx;
  color: #7B879A;
}

/* 新能源绿牌：粤B·88888 */
.plate-badge {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 44rpx;
  padding: 0 12rpx;
  box-sizing: border-box;
  border-radius: 8rpx;
  background: linear-gradient(180deg, #A7DE72, #35A46A);
  border: 2rpx solid rgba(255, 255, 255, 0.75);
  box-shadow: 0 3rpx 8rpx rgba(53, 164, 106, 0.28);
}

.plate-char {
  font-size: 22rpx;
  font-weight: bold;
  color: #FFFFFF;
  line-height: 1;
}

.plate-dot {
  margin: 0 2rpx;
  font-size: 22rpx;
  font-weight: bold;
  color: #FFFFFF;
  line-height: 1;
}

/* 当前电价胶囊 */
.price-chip {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: baseline;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background-color: #EAF3FE;
}

.price-chip-stage {
  font-size: 20rpx;
  color: #2E6BE6;
  margin-right: 8rpx;
}

.price-chip-num {
  font-size: 26rpx;
  font-weight: bold;
  color: #2E6BE6;
}

.price-chip-unit {
  margin-left: 4rpx;
  font-size: 20rpx;
  color: #2E6BE6;
}

/* ===== 电量：电池条 ===== */
.soc-block {
  margin-top: 22rpx;
  padding: 24rpx 26rpx 18rpx;
  border-radius: 32rpx;
  background-color: #FFFFFF;
  box-shadow: 0 8rpx 28rpx rgba(23, 78, 145, 0.07);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: cardUp 560ms cubic-bezier(0.22, 0.61, 0.36, 1) 60ms both;
}

.soc-head {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.soc-num {
  font-size: 80rpx;
  font-weight: bold;
  color: #1B6EF3;
  line-height: 1.05;
  letter-spacing: -2rpx;
}

.soc-unit {
  margin-left: 2rpx;
  font-size: 38rpx;
  font-weight: 600;
  color: #1B6EF3;
}

.soc-divider {
  width: 2rpx;
  height: 46rpx;
  margin: 0 24rpx;
  background-color: #DCE7F5;
}

.soc-tag {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  background-color: #E7F8EE;
}

.soc-tag-text {
  margin-left: 8rpx;
  font-size: 24rpx;
  font-weight: 500;
  color: #16A34A;
}

/* 电池：壳 + 能量填充 + 正极 */
.battery-row {
  width: 100%;
  margin-top: 32rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.battery-body {
  position: relative;
  flex: 1;
  height: 108rpx;
  padding: 9rpx;
  box-sizing: border-box;
  border-radius: 42rpx;
  background-color: #EDF4FC;
  border: 2rpx solid #DCE9F8;
  box-shadow: inset 0 2rpx 10rpx rgba(23, 78, 145, 0.07);
  overflow: hidden;
}

.battery-fill {
  position: relative;
  height: 100%;
  border-radius: 32rpx;
  background: linear-gradient(90deg, #2E6BE6 0%, #21B6D8 58%, #22C55E 100%);
  box-shadow: 0 4rpx 14rpx rgba(33, 140, 216, 0.3);
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 20rpx;
  box-sizing: border-box;
  overflow: hidden;
  /* 电量增长：宽度平滑过渡 */
  transition: width 140ms linear;
}

/* 能量流动光泽 */
.battery-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(100deg, rgba(255, 255, 255, 0) 30%, rgba(255, 255, 255, 0.42) 50%, rgba(255, 255, 255, 0) 70%);
  background-size: 200% 100%;
  animation: energyFlow 2.4s linear infinite;
}

/* 电池正极 */
.battery-cap {
  width: 14rpx;
  height: 54rpx;
  margin-left: 8rpx;
  border-radius: 0 10rpx 10rpx 0;
  background-color: #DCE9F8;
}

/* 闪电图标（CSS 绘制，避免小程序不支持内联 SVG） */
.battery-bolt {
  width: 26rpx;
  height: 46rpx;
  background-color: #FFFFFF;
  clip-path: polygon(58% 0%, 10% 58%, 44% 58%, 34% 100%, 92% 40%, 56% 40%);
}

/* 剩余时间提示 */
.gauge-remain {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 16rpx;
}

.remain-text {
  font-size: 24rpx;
  color: #7B879A;
}

.remain-strong {
  font-size: 26rpx;
  font-weight: bold;
  color: #16233A;
}

/* 绿点脉冲 */
.dot-live {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: #22C55E;
  animation: livePulse 1.8s ease-in-out infinite;
}

/* 能量流动动画 */
@keyframes energyFlow {
  /* 高光由左向右流动（background-position 由大到小 = 背景图右移） */
  0% {
    background-position: 220% 0;
  }
  100% {
    background-position: -120% 0;
  }
}

/* ===== 核心数据四宫格 ===== */
.core-card {
  margin-top: 22rpx;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  border-radius: 32rpx;
  background-color: #FFFFFF;
  box-shadow: 0 8rpx 28rpx rgba(23, 78, 145, 0.07);
  overflow: hidden;
  animation: cardUp 600ms cubic-bezier(0.22, 0.61, 0.36, 1) 120ms both;
}

.core-cell {
  width: 50%;
  box-sizing: border-box;
  padding: 20rpx 26rpx;
  display: flex;
  flex-direction: column;
}

/* 分隔线：右列保留竖线，首行保留横线 */
.core-cell-rb {
  border-right: 2rpx solid #F0F4F9;
  border-bottom: 2rpx solid #F0F4F9;
}

.core-cell-r {
  border-right: 2rpx solid #F0F4F9;
}

.core-cell-b {
  border-bottom: 2rpx solid #F0F4F9;
}

.core-label {
  font-size: 24rpx;
  color: #8B98AC;
}

.core-value {
  margin-top: 10rpx;
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.core-n {
  font-size: 44rpx;
  font-weight: 600;
  color: #16233A;
  line-height: 1.05;
}

.core-n-accent {
  color: #1B6EF3;
}

.core-u {
  margin-left: 6rpx;
  font-size: 22rpx;
  color: #8B98AC;
}

/* ===== 次要参数：电压 / 电流 ===== */
.minor-row {
  margin-top: 16rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 12rpx 0;
  border-radius: 24rpx;
  background-color: rgba(255, 255, 255, 0.72);
  animation: cardUp 620ms cubic-bezier(0.22, 0.61, 0.36, 1) 180ms both;
}

.minor-item {
  font-size: 24rpx;
  color: #7B879A;
}

.minor-strong {
  font-size: 26rpx;
  font-weight: 600;
  color: #33415C;
}

.minor-sep {
  margin: 0 22rpx;
  font-size: 22rpx;
  color: #C9D3E0;
}

/* 费用说明：卡片尾行 */
.core-tip {
  width: 100%;
  box-sizing: border-box;
  padding: 14rpx 26rpx 16rpx;
  border-top: 2rpx solid #F0F4F9;
  text-align: center;
  font-size: 21rpx;
  color: #A7B2C2;
}

/* ===== 停止充电：白底红字 ===== */
.stop-button {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: 0;
  margin-bottom: calc(28rpx + env(safe-area-inset-bottom));
  height: 96rpx;
  border-radius: 48rpx;
  background-color: #FFFFFF;
  border: 2rpx solid #F3BFBE;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(226, 75, 74, 0.14);
  z-index: 20;
}

.stop-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #E24B4A;
}

/* ===== 动效 ===== */
/* 卡片依次上浮 */
@keyframes cardUp {
  0% {
    opacity: 0;
    transform: translateY(24rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 充电中绿点脉冲 */
@keyframes livePulse {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5);
  }
  50% {
    opacity: 0.65;
    box-shadow: 0 0 0 10rpx rgba(34, 197, 94, 0);
  }
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

"use strict";
const common_vendor = require("../../common/vendor.js");
const api_charge = require("../../api/charge.js");
const _sfc_main = {
  data() {
    return {
      animationEnabled: true,
      animation1: false,
      animation2: false,
      gunStatus: null,
      noAnimation: false,
      startingLottie: {
        id: "startingLottie",
        desc: "启动中",
        autoplay: false,
        path: "https://lottie.host/4937651f-eae1-4005-8ede-3cde4dd26ee3/Tm5KQBFFBi.json",
        optimize: "true",
        repeatCount: 0
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
      chargingTime: "2023年08月20日 16:01:17",
      // 价格数据
      priceData: {
        currentPrice: ""
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
      // 费用数据
      feeData: {
        preChargeAmount: null,
        estimatedFee: null,
        remainingFee: null
      },
      chargingGunInfo: {
        pileNo: "",
        gunNo: "",
        busId: "",
        gunId: "",
        stationName: "",
        gunName: "",
        pileName: ""
      },
      // 定时器相关
      pollingTimer: null,
      pollingInterval: 5e3
      // 5秒
    };
  },
  computed: {
    lottieStyle() {
      return {
        // width: `${this.screenInfo.width * 1}px`,  // 使用屏幕宽度的80%
        // height: `${this.screenInfo.height * 1}px`  // 使用屏幕高度的60%
        width: `100%`,
        height: `100%`
      };
    }
  },
  async onLoad(options) {
    common_vendor.index.__f__("log", "at pages/charge/charging.vue:179", "充电中参数", options);
    this.animationEnabled = options.animationEnabled;
    if (this.animationEnabled == "false") {
      this.noAnimation = true;
    }
    common_vendor.index.__f__("log", "at pages/charge/charging.vue:185", "set animationEnabled", this.animationEnabled);
    if (!options.pileNo || !options.gunNo || !options.busId || !options.gunId || !options.billId) {
      common_vendor.index.showToast({
        title: "参数异常",
        icon: "none"
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
      common_vendor.index.__f__("log", "at pages/charge/charging.vue:202", "请求预充金额", this.chargingGunInfo.busId);
      const preChargeAmountRes = await api_charge.getPreChargeAmountByBusId(options.busId);
      if (preChargeAmountRes && preChargeAmountRes.code === 0) {
        this.feeData.preChargeAmount = (parseInt(preChargeAmountRes.data) / 100).toFixed(2);
      }
      this.startPolling();
    } catch (error) {
      common_vendor.index.__f__("error", "at pages/charge/charging.vue:211", "初始化充电数据失败:", error);
    }
    this.getScreenInfo();
  },
  methods: {
    // 获取充电数据
    async fetchChargingData() {
      if (!this.chargingGunInfo.busId || !this.chargingGunInfo.pileNo || !this.chargingGunInfo.gunNo) {
        common_vendor.index.__f__("warn", "at pages/charge/charging.vue:221", "充电桩参数不完整，跳过本次轮询");
        return;
      }
      try {
        const querChargeOnlineRes = await api_charge.querChargeOnline({
          busId: this.chargingGunInfo.busId,
          pileNo: this.chargingGunInfo.pileNo,
          gunNo: this.chargingGunInfo.gunNo
        });
        if (querChargeOnlineRes && querChargeOnlineRes.code === 0) {
          common_vendor.index.__f__("log", "at pages/charge/charging.vue:234", "充电数据更新:", querChargeOnlineRes.data);
          if (querChargeOnlineRes.data) {
            const data = querChargeOnlineRes.data;
            this.gunStatus = data.chargingStatus;
            this.batteryData.percent = data.soc;
            this.chargingStats.duration = data.chargingTime;
            this.chargingStats.powerAmount = (parseInt(data.powerinfo) / 1e3).toFixed(3);
            this.chargingStats.estimatedTime = data.remainingtime;
            this.electricalData.current = (parseInt(data.ivoltage) / 1e3).toFixed(3);
            this.electricalData.voltage = (parseInt(data.voltage) / 1e3).toFixed(3);
            this.electricalData.power = data.realTimePower;
            this.feeData.estimatedFee = (parseInt(data.cost) / 1e3).toFixed(3);
            if (this.feeData.preChargeAmount) {
              this.feeData.remainingFee = (this.feeData.preChargeAmount - this.feeData.estimatedFee).toFixed(2);
            }
            if (data.plateno) {
              this.carNumber = data.plateno;
            }
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
              this.priceData.currentPrice = (parseInt(data.electPrice) / 1e4).toFixed(4);
            }
          }
        } else if (querChargeOnlineRes && querChargeOnlineRes.code === 40624) {
          common_vendor.index.showModal({
            title: "温馨提示",
            content: "平台检测到充电桩已经停止充电，是否结束充电？",
            confirmText: "结束充电",
            cancelText: "取消",
            success: (res) => {
              if (res.confirm) {
                this.handleStopCharging();
              }
            }
          });
        } else {
          common_vendor.index.__f__("error", "at pages/charge/charging.vue:299", "获取充电数据失败:", querChargeOnlineRes);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/charge/charging.vue:302", "调用充电接口失败:", error);
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
      common_vendor.index.__f__("log", "at pages/charge/charging.vue:317", "开始轮询充电数据，间隔:", this.pollingInterval, "ms");
    },
    // 停止轮询
    stopPolling() {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
        this.pollingTimer = null;
        common_vendor.index.__f__("log", "at pages/charge/charging.vue:325", "停止轮询充电数据");
      }
    },
    // 获取屏幕信息
    getScreenInfo() {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      this.screenInfo = {
        width: systemInfo.screenWidth,
        height: systemInfo.screenHeight
      };
    },
    onStartingAnimationEnd() {
      common_vendor.index.__f__("log", "at pages/charge/charging.vue:338", "动画结束");
      this.animation1 = true;
    },
    // 处理停止充电按钮点击
    handleStopCharging() {
      common_vendor.index.showModal({
        title: "确认停止充电",
        content: "确定要停止当前充电吗？",
        confirmText: "确定",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            if (!this.gunStatus) {
              common_vendor.index.showToast({
                title: "充电状态同步中，请稍后再试",
                icon: "none"
              });
              return;
            }
            common_vendor.index.__f__("log", "at pages/charge/charging.vue:360", "用户确认停止充电");
            const stopChargeRes = await api_charge.stopCharge({
              busId: this.chargingGunInfo.busId
            });
            if (stopChargeRes && stopChargeRes.code === 0) {
              this.stopPolling();
              common_vendor.index.navigateTo({
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
      if (my) {
        var lottieContext = my.createLottieContext(this.startingLottie.id);
        common_vendor.index.__f__("log", "at pages/charge/charging.vue:382", "animationEnabled", this.animationEnabled);
        if (this.animationEnabled == "true" || this.animationEnabled == true) {
          common_vendor.index.__f__("log", "at pages/charge/charging.vue:384", "播放动画");
          lottieContext.play();
          setTimeout(() => {
            this.animation1 = true;
          }, 5e3);
        }
      }
    });
  },
  // 页面隐藏时停止轮询
  onHide() {
    this.stopPolling();
  },
  // 页面显示时重新开始轮询
  onShow() {
    if (this.chargingGunInfo.busId) {
      this.startPolling();
    }
  },
  // 页面卸载时清理定时器
  onUnload() {
    this.stopPolling();
  },
  // 页面销毁前清理定时器
  beforeDestroy() {
    this.stopPolling();
  }
};
if (!Array) {
  const _component_lottie = common_vendor.resolveComponent("lottie");
  const _easycom_uv_alert2 = common_vendor.resolveComponent("uv-alert");
  (_component_lottie + _easycom_uv_alert2)();
}
const _easycom_uv_alert = () => "../../uni_modules/uv-alert/components/uv-alert/uv-alert.js";
if (!Math) {
  _easycom_uv_alert();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.startingLottie.id,
    b: common_vendor.s($options.lottieStyle),
    c: common_vendor.p({
      autoplay: $data.startingLottie.autoplay,
      id: $data.startingLottie.id,
      path: $data.startingLottie.path,
      ["repeat-count"]: $data.startingLottie.repeatCount
    }),
    d: $data.animation1 ? 1 : "",
    e: $data.noAnimation ? 1 : "",
    f: $data.animation1 ? 1 : "",
    g: $data.noAnimation ? 1 : "",
    h: common_vendor.t($data.chargingGunInfo.stationName || "--"),
    i: common_vendor.t($data.chargingGunInfo.gunName || "--"),
    j: common_vendor.t($data.batteryData.percent || "--"),
    k: common_vendor.t(_ctx.carNumber || "--"),
    l: common_vendor.t($data.chargingTime || "--"),
    m: common_vendor.t($data.priceData.currentPrice || "--"),
    n: common_vendor.t($data.chargingStats.duration || "--"),
    o: common_vendor.t(parseFloat($data.chargingStats.powerAmount).toFixed(2) || "--"),
    p: common_vendor.t($data.chargingStats.estimatedTime || "--"),
    q: common_vendor.t(parseFloat($data.electricalData.current).toFixed(2) || "--"),
    r: common_vendor.t(parseFloat($data.electricalData.voltage).toFixed(2) || "--"),
    s: common_vendor.t(parseFloat($data.electricalData.power).toFixed(2) || "--"),
    t: common_vendor.t(parseFloat($data.feeData.preChargeAmount).toFixed(2) || "--"),
    v: common_vendor.t(parseFloat($data.feeData.estimatedFee).toFixed(2) || "--"),
    w: common_vendor.t(parseFloat($data.feeData.remainingFee).toFixed(2) || "--"),
    x: common_vendor.p({
      title: "温馨提示",
      type: "warning",
      description: "预估费用仅供参考，请以实际结算金额为准",
      showIcon: true
    }),
    y: common_vendor.o((...args) => $options.handleStopCharging && $options.handleStopCharging(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c5192987"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/charge/charging.js.map

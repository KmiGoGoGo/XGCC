"use strict";
const common_vendor = require("../../common/vendor.js");
const api_bill = require("../../api/bill.js");
const _sfc_main = {
  data() {
    return {
      countdown: 60,
      timer: null,
      smoothTimer: null,
      pollingTimer: null,
      // 轮询定时器
      billId: null,
      // 账单ID
      busId: null,
      // 账单ID
      progress: 100,
      // 进度百分比，从100%开始递减
      smoothProgress: 100
      // 用于平滑动画的进度值
    };
  },
  computed: {
    circleStyle() {
      return {
        "--progress": `${this.smoothProgress}%`
      };
    }
  },
  onLoad(options) {
    common_vendor.index.__f__("log", "at pages/charge/stopping.vue:50", "停止充电参数", options);
    if (options.billId && options.busId) {
      this.billId = options.billId;
      this.busId = options.busId;
      this.startPolling();
    } else {
      common_vendor.index.showToast({
        title: "参数错误",
        icon: "none"
      });
      common_vendor.index.navigateBack();
    }
    this.startCountdown();
  },
  methods: {
    startCountdown() {
      this.timer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          this.stopCountdown();
          this.handleCountdownComplete();
        }
      }, 1e3);
      this.smoothTimer = setInterval(() => {
        if (this.countdown >= 0) {
          const targetProgress = this.countdown / 60 * 100;
          const diff = targetProgress - this.smoothProgress;
          if (Math.abs(diff) > 0.05) {
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
      common_vendor.index.navigateTo({
        url: `/pages/bill/billDelay?id=${this.billId}`
      });
    },
    // 启动账单轮询
    startPolling() {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
      }
      this.fetchBillDetail();
      this.pollingTimer = setInterval(() => {
        this.fetchBillDetail();
      }, 2e3);
      common_vendor.index.__f__("log", "at pages/charge/stopping.vue:125", "开始轮询账单详情，间隔: 2秒");
    },
    // 停止账单轮询
    stopPolling() {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
        this.pollingTimer = null;
        common_vendor.index.__f__("log", "at pages/charge/stopping.vue:133", "停止轮询账单详情");
      }
    },
    // 获取账单详情
    async fetchBillDetail() {
      if (!this.billId) {
        common_vendor.index.__f__("log", "at pages/charge/stopping.vue:140", "账单ID不存在，跳过本次轮询");
        return;
      }
      try {
        const response = await api_bill.getBillDetailById(this.billId);
        if (response && response.code === 0) {
          common_vendor.index.__f__("log", "at pages/charge/stopping.vue:147", "账单详情更新:", response.data);
          this.handleBillDetailResponse(response.data);
        } else {
          common_vendor.index.__f__("error", "at pages/charge/stopping.vue:152", "获取账单详情失败:", response);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/charge/stopping.vue:155", "调用账单详情接口失败:", error);
      }
    },
    // 处理账单详情响应
    handleBillDetailResponse(billData) {
      if (billData.billStatus === 11) {
        common_vendor.index.__f__("log", "at pages/charge/stopping.vue:163", "账单状态为11，跳转到结算页面");
        this.stopCountdown();
        this.stopPolling();
        common_vendor.index.navigateTo({
          url: `/pages/bill/settlementPay?busId=${this.busId}&billId=${this.billId}`
        });
      } else if (billData.billStatus === 14) {
        common_vendor.index.__f__("log", "at pages/charge/stopping.vue:172", "账单状态为14，跳转到结算页面");
        this.stopCountdown();
        this.stopPolling();
        common_vendor.index.navigateTo({
          url: `/pages/bill/settlementInfo?busId=${this.busId}&billId=${this.billId}`
        });
      }
    }
  },
  // 页面卸载时清理定时器
  onUnload() {
    this.stopCountdown();
    this.stopPolling();
  },
  // 页面隐藏时暂停倒计时和轮询
  onHide() {
    this.stopCountdown();
    this.stopPolling();
  },
  // 页面显示时重新开始倒计时和轮询
  onShow() {
    if (this.countdown > 0 && !this.timer) {
      this.startCountdown();
    }
    if (this.billId && !this.pollingTimer) {
      this.startPolling();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.countdown),
    b: common_vendor.s($options.circleStyle)
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c82d6e48"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/charge/stopping.js.map

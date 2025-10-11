"use strict";
const common_vendor = require("../../common/vendor.js");
const api_bill = require("../../api/bill.js");
const api_pay = require("../../api/pay.js");
const _sfc_main = {
  data() {
    return {
      billId: null,
      billData: null,
      loading: true,
      // 支付宝支付相关状态
      alipayOrderInfo: {
        orderNo: "",
        // 订单号
        isProcessing: false,
        // 是否正在处理中
        pollTimer: null,
        // 轮询定时器
        pollCount: 0
        // 轮询次数
      }
    };
  },
  computed: {
    // 总占位时长
    totalDuration() {
      var _a;
      return ((_a = this.billData) == null ? void 0 : _a.duration) || "--";
    },
    // 超时占位时长  
    overTimeDuration() {
      var _a;
      return ((_a = this.billData) == null ? void 0 : _a.actualDuration) || "--";
    },
    // 免费时长
    freeDuration() {
      var _a;
      return ((_a = this.billData) == null ? void 0 : _a.freeDuration) || "--";
    },
    // 格式化费用
    formatFee() {
      var _a;
      if (!((_a = this.billData) == null ? void 0 : _a.busBalance))
        return "--";
      return (this.billData.busBalance / 100).toFixed(2);
    },
    // 计费详情
    billingDetail() {
      var _a, _b, _c;
      if (!((_c = (_b = (_a = this.billData) == null ? void 0 : _a.occupyCostModelDTO) == null ? void 0 : _b.occupyPhraseRules) == null ? void 0 : _c.length)) {
        return "00:00~23:59, 0.10元/分钟;\n(单次封顶1.00元)";
      }
      const rule = this.billData.occupyCostModelDTO.occupyPhraseRules[0];
      const price = (rule.price / 100).toFixed(2);
      const limitAmount = this.billData.occupyCostModelDTO.limitAmount ? (this.billData.occupyCostModelDTO.limitAmount / 100).toFixed(2) : "--";
      return `00:00~23:59, ${price}元/分钟;
(单次封顶${limitAmount}元)`;
    },
    // 支付状态文本
    statusText() {
      var _a;
      if (!((_a = this.billData) == null ? void 0 : _a.billStatus))
        return "待支付";
      switch (this.billData.billStatus) {
        case 11:
          return "待支付";
        case 14:
          return "已支付";
        default:
          return "待支付";
      }
    },
    // 状态徽章样式类
    statusBadgeClass() {
      var _a;
      if (!((_a = this.billData) == null ? void 0 : _a.billStatus))
        return "status-unpaid";
      switch (this.billData.billStatus) {
        case 11:
          return "status-unpaid";
        case 14:
          return "status-paid";
        default:
          return "status-unpaid";
      }
    },
    // 是否显示支付按钮
    showPaymentButton() {
      var _a;
      return ((_a = this.billData) == null ? void 0 : _a.billStatus) === 11;
    },
    // 付款时间
    paymentTime() {
      var _a, _b;
      if (((_a = this.billData) == null ? void 0 : _a.billStatus) === 14 && ((_b = this.billData) == null ? void 0 : _b.payTime)) {
        return this.billData.payTime;
      }
      return "-";
    },
    // 实付金额
    actualAmount() {
      var _a, _b;
      if (((_a = this.billData) == null ? void 0 : _a.billStatus) === 14 && ((_b = this.billData) == null ? void 0 : _b.actualBalance)) {
        return `¥ ${(this.billData.actualBalance / 100).toFixed(2)}`;
      }
      return "-";
    }
  },
  onLoad(options) {
    if (options.id) {
      this.billId = options.id;
      this.loadBillData();
    } else {
      common_vendor.index.showToast({
        title: "缺少订单ID参数",
        icon: "error"
      });
    }
  },
  onUnload() {
    this.clearPaymentPolling();
  },
  methods: {
    // 加载账单数据
    async loadBillData() {
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const response = await api_bill.getOccupyBillById(this.billId);
        if (response && response.code === 0) {
          this.billData = response.data;
          common_vendor.index.__f__("log", "at pages/bill/occupyBillPay.vue:246", "账单数据:", this.billData);
          common_vendor.index.__f__("log", "at pages/bill/occupyBillPay.vue:247", "账单状态:", this.billData.billStatus);
          common_vendor.index.__f__("log", "at pages/bill/occupyBillPay.vue:248", "是否显示支付按钮:", this.showPaymentButton);
        } else {
          common_vendor.index.showToast({
            title: "加载账单失败",
            icon: "error"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/bill/occupyBillPay.vue:256", "加载账单失败:", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "error"
        });
      } finally {
        common_vendor.index.hideLoading();
        this.loading = false;
      }
    },
    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr)
        return "--";
      return timeStr;
    },
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    },
    // 复制订单号
    copyOrderNo() {
      var _a;
      const orderNo = ((_a = this.billData) == null ? void 0 : _a.busId) || "--";
      common_vendor.index.setClipboardData({
        data: orderNo,
        success: () => {
          common_vendor.index.showToast({
            title: "订单号已复制",
            icon: "success"
          });
        }
      });
    },
    // 显示费用疑问
    showQuestion() {
      common_vendor.index.showModal({
        title: "费用疑问",
        content: "如果您对费用有疑问，请联系客服处理",
        confirmText: "拨打客服电话",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.makePhoneCall({
              phoneNumber: "--"
            });
          }
        }
      });
    },
    // 处理支付
    handlePayment() {
      common_vendor.index.showModal({
        title: "确认支付",
        content: `确认支付超时占位费用 ¥${this.formatFee} 吗？`,
        confirmText: "确认支付",
        success: (res) => {
          if (res.confirm) {
            this.handleAlipayPayment();
          }
        }
      });
    },
    // 处理支付宝支付
    async handleAlipayPayment() {
      try {
        if (this.alipayOrderInfo.isProcessing) {
          common_vendor.index.showToast({ title: "正在处理中，请稍候...", icon: "none" });
          return;
        }
        this.alipayOrderInfo.isProcessing = true;
        common_vendor.index.showLoading({ title: "正在生成支付参数..." });
        common_vendor.index.__f__("log", "at pages/bill/occupyBillPay.vue:338", "开始支付宝支付流程 - 统一下单");
        const unifiedOrderRes = await api_pay.alipayDisposableUnifiedOrders({
          totalFee: parseFloat(this.billData.busBalance),
          // 费用单位为分
          orderBalance: parseFloat(this.billData.busBalance),
          openId: common_vendor.index.getStorageSync("openId"),
          occupydBillId: this.billData.id
        });
        if (unifiedOrderRes.code !== 0) {
          throw new Error(unifiedOrderRes.msg || "生成支付参数失败");
        }
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("log", "at pages/bill/occupyBillPay.vue:351", "支付参数生成成功，准备调起支付宝支付", unifiedOrderRes.data);
        this.alipayOrderInfo.orderNo = unifiedOrderRes.data.outTradeNo;
        await this.invokeAlipayment(unifiedOrderRes.data.tradeNo);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/bill/occupyBillPay.vue:358", "支付宝支付流程失败:", error);
        setTimeout(() => {
          common_vendor.index.hideLoading();
        }, 1e3);
        common_vendor.index.showToast({ title: error.message || "支付失败", icon: "none" });
        if (this.alipayOrderInfo.orderNo) {
          this.cancelAlipayOrder("支付流程异常");
        }
      } finally {
        this.alipayOrderInfo.isProcessing = false;
        setTimeout(() => {
          common_vendor.index.hideLoading();
        }, 1e3);
      }
    },
    // 调起支付宝支付
    async invokeAlipayment(orderStr) {
      return new Promise((resolve, reject) => {
      });
    },
    // 开始轮询支付结果
    startPaymentResultPolling() {
      this.alipayOrderInfo.pollCount = 0;
      const pollInterval = 3e3;
      const maxPollCount = 20;
      this.alipayOrderInfo.pollTimer = setInterval(async () => {
        this.alipayOrderInfo.pollCount++;
        common_vendor.index.__f__("log", "at pages/bill/occupyBillPay.vue:425", `第${this.alipayOrderInfo.pollCount}次查询支付结果`);
        try {
          common_vendor.index.__f__("log", "at pages/bill/occupyBillPay.vue:428", "this.alipayOrderInfo.orderNo", this.alipayOrderInfo.orderNo);
          const queryRes = await api_pay.alipayDisposableOrderResultQuery({
            orderNo: this.alipayOrderInfo.orderNo
          });
          if (queryRes.code === 0) {
            this.clearPaymentPolling();
            common_vendor.index.__f__("log", "at pages/bill/occupyBillPay.vue:436", "支付成功，准备刷新页面");
            common_vendor.index.showToast({
              title: "支付成功",
              icon: "success"
            });
            await this.loadBillData();
          } else if (this.alipayOrderInfo.pollCount >= maxPollCount) {
            this.clearPaymentPolling();
            common_vendor.index.showToast({ title: "支付结果查询超时，订单已取消", icon: "none" });
            this.cancelAlipayOrder("支付结果查询超时");
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/bill/occupyBillPay.vue:453", "查询支付结果失败:", error);
          if (this.alipayOrderInfo.pollCount >= maxPollCount) {
            this.clearPaymentPolling();
            this.cancelAlipayOrder("查询支付结果异常");
          }
        }
      }, pollInterval);
    },
    // 取消支付宝订单
    async cancelAlipayOrder(reason = "用户取消") {
      if (!this.alipayOrderInfo.orderNo)
        return;
      try {
        common_vendor.index.__f__("log", "at pages/bill/occupyBillPay.vue:467", `正在取消订单: ${this.alipayOrderInfo.orderNo}, 原因: ${reason}`);
        const cancelRes = await api_pay.alipayDisposableCancelRecharge({
          orderNo: this.alipayOrderInfo.orderNo,
          cancelReason: reason
        });
        if (cancelRes.code === 0) {
          common_vendor.index.__f__("log", "at pages/bill/occupyBillPay.vue:474", "订单取消成功");
          common_vendor.index.showToast({ title: "订单已取消，款项将原路退回", icon: "none" });
        } else {
          common_vendor.index.__f__("error", "at pages/bill/occupyBillPay.vue:477", "订单取消失败:", cancelRes.msg);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/bill/occupyBillPay.vue:480", "取消订单请求失败:", error);
      } finally {
        this.alipayOrderInfo.orderNo = "";
      }
    },
    // 清理支付结果轮询
    clearPaymentPolling() {
      if (this.alipayOrderInfo.pollTimer) {
        clearInterval(this.alipayOrderInfo.pollTimer);
        this.alipayOrderInfo.pollTimer = null;
        common_vendor.index.__f__("log", "at pages/bill/occupyBillPay.vue:492", "支付结果轮询已清理");
      }
    }
  }
};
if (!Array) {
  const _easycom_uv_icon2 = common_vendor.resolveComponent("uv-icon");
  _easycom_uv_icon2();
}
const _easycom_uv_icon = () => "../../uni_modules/uv-icon/components/uv-icon/uv-icon.js";
if (!Math) {
  _easycom_uv_icon();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a, _b, _c, _d, _e;
  return common_vendor.e({
    a: common_vendor.t(((_a = $data.billData) == null ? void 0 : _a.pileName) || "--"),
    b: common_vendor.t(((_b = $data.billData) == null ? void 0 : _b.gunName) || "--"),
    c: common_vendor.t($options.totalDuration),
    d: common_vendor.t($options.overTimeDuration),
    e: common_vendor.t($options.formatFee),
    f: common_vendor.t(((_c = $data.billData) == null ? void 0 : _c.busId) || "--"),
    g: common_vendor.o((...args) => $options.copyOrderNo && $options.copyOrderNo(...args)),
    h: common_vendor.t($options.formatTime((_d = $data.billData) == null ? void 0 : _d.timeS)),
    i: common_vendor.t($options.formatTime((_e = $data.billData) == null ? void 0 : _e.timeE)),
    j: common_vendor.t($options.totalDuration),
    k: common_vendor.t($options.freeDuration),
    l: common_vendor.t($options.overTimeDuration),
    m: common_vendor.t($options.billingDetail),
    n: common_vendor.t($options.statusText),
    o: common_vendor.n($options.statusBadgeClass),
    p: common_vendor.t($options.formatFee),
    q: common_vendor.t($options.paymentTime),
    r: common_vendor.t($options.actualAmount),
    s: common_vendor.p({
      name: "help-circle",
      size: "16",
      color: "#999"
    }),
    t: common_vendor.o((...args) => $options.showQuestion && $options.showQuestion(...args)),
    v: $options.showPaymentButton
  }, $options.showPaymentButton ? {
    w: common_vendor.o((...args) => $options.handlePayment && $options.handlePayment(...args))
  } : {}, {
    x: !$options.showPaymentButton ? 1 : ""
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-0a6fd328"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/bill/occupyBillPay.js.map

"use strict";
const common_vendor = require("../../common/vendor.js");
const api_pay = require("../../api/pay.js");
const api_style = require("../../api/style.js");
const _sfc_main = {
  data() {
    return {
      rechargeAmount: "200",
      // 默认金额改为字符串200
      pollingTimer: null,
      // 轮询定时器
      isPaymentProcessing: false,
      // 防止重复支付
      currentTradeNo: null,
      // 当前订单号
      currentOutTradeNo: null,
      // 当前订单号
      paymentStatus: null,
      // 支付状态提示 { type: 'success|error|warning', message: '提示信息' }
      quickAmounts: [
        // 快捷金额选项
        { value: 50, special: false },
        { value: 100, special: false },
        { value: 200, special: true },
        { value: 300, special: true },
        { value: 600, special: true },
        { value: 1e3, special: true }
      ],
      inputCustomStyle: {
        // uv-input自定义样式
        padding: "32rpx 96rpx 32rpx 96rpx",
        fontSize: "36rpx",
        fontWeight: "500",
        backgroundColor: "transparent",
        height: "150rpx"
      },
      buttonCustomStyle: {
        // uv-button自定义样式
        width: "100%",
        height: "96rpx",
        borderRadius: "24rpx",
        fontSize: "36rpx",
        fontWeight: "bold"
      },
      // 优惠活动相关数据
      promoText: "",
      // 优惠活动简介文本
      promoDetailContent: "",
      // 优惠活动详细内容
      showDetailModal: false,
      // 是否显示详情弹窗
      showStationList: false,
      // 是否展开站点列表
      stationList: [
        // 适用站点列表
        "超易充石龙祥龙路充电站",
        "超易充石龙广源路公共充电站",
        "超易充石龙莞惠枢纽充电站",
        "超易充高埗政府广场充电站",
        "超易充高埗文化广场充电站",
        "超易充高埗江滨广场充电站",
        "超易充石龙西湖客运站充电站",
        "超易充望牛墩望洪酒店充电站",
        "超易充企石公交枢纽站",
        "超易充常平镇常黄路充电站",
        "超易充万江牌楼基充电站",
        "超易充东城温塘光烨充电站",
        "超易充常平东莞东火车站光烨充电站",
        "超易充高埗汽车北站光烨充电站",
        "超易充黄江实验小学光烨充电站",
        "超易充南城宏图路福地光烨超充站",
        "超易充南城宏图路福地光烨充电站",
        "超易充中堂坤鑫光烨充电站",
        "超易充企石滨江公园光烨充电站",
        "超易充企石森林公园光烨充电站",
        "超易充清溪大利光烨充电站",
        "超易充清溪大绿地光烨充电站",
        "超易充清溪金龙阳光城光烨充电站",
        "超易充塘厦华维大厦光烨充电站",
        "超易充东能横沥职教城充电站",
        "超易充道滘燿盈广场超充站",
        "超易充厚街环冈奥通充电站"
      ],
      // 充值奖励映射
      rewardMapping: {
        200: {
          title: "价值20元券包",
          description: "(10元券*1张+5元券*2张，券有效期30天，可在参与充值优惠活动的站点抵扣使用；充值送券后不可退款，请根据充电情况适量充值。)"
        },
        300: {
          title: "价值25元券包",
          description: "(10元券*1张+5元券*3张，券有效期45天，可在参与充值优惠活动的站点抵扣使用；充值送券后不可退款，请根据充电情况适量充值。)"
        },
        600: {
          title: "价值55元券包",
          description: "(10元券*3张+5元券*5张，券有效期60天，可在参与充值优惠活动的站点抵扣使用；充值送券后不可退款，请根据充电情况适量充值。)"
        },
        1e3: {
          title: "价值120元券包",
          description: "(10元券*6张+5元券*12张，券有效期90天，可在参与充值优惠活动的站点抵扣使用；充值送券后不可退款，请根据充电情况适量充值。)"
        }
      }
    };
  },
  computed: {
    // 确保充值金额为数字类型
    numericRechargeAmount() {
      return Number(this.rechargeAmount) || 0;
    },
    // 获取当前金额对应的奖励信息
    currentReward() {
      const amount = this.numericRechargeAmount;
      return this.rewardMapping[amount] || {
        title: "价值20元券包",
        description: "(10元券*1张+5元券*2张，券有效期30天，可在参与充值优惠活动的站点抵扣使用；充值送券后不可退款，请根据充电情况适量充值。)"
      };
    },
    // 是否有奖励（只有特定金额才有奖励）
    hasReward() {
      return this.rewardMapping.hasOwnProperty(this.numericRechargeAmount);
    }
  },
  onLoad() {
    this.loadPromoContent();
  },
  beforeDestroy() {
    this.clearPollingTimer();
  },
  methods: {
    /**
     * 发起充值支付
     */
    async recharge() {
      const amount = Number(this.rechargeAmount);
      if (amount <= 0) {
        common_vendor.index.showToast({
          title: "请输入有效的充值金额",
          icon: "none"
        });
        return;
      }
      if (amount > 1e4) {
        common_vendor.index.showToast({
          title: "单次充值金额不能超过10000元",
          icon: "none"
        });
        return;
      }
      if (this.isPaymentProcessing) {
        this.showPaymentStatus("warning", "支付正在处理中，请勿重复操作");
        return;
      }
      try {
        this.isPaymentProcessing = true;
        this.paymentStatus = null;
        common_vendor.index.showLoading({ title: "正在创建订单..." });
        common_vendor.index.__f__("log", "at pages/recharge/recharge.vue:283", "发起充值，金额：", amount);
        const orderRes = await api_pay.alipayUnifiedOrder({
          totalFee: (Number(amount) * 100).toFixed(0).toString(),
          openId: common_vendor.index.getStorageSync("openId"),
          subject: "账户充值",
          // 订单标题
          body: `充值金额：${amount}元`
          // 订单描述
        });
        common_vendor.index.__f__("log", "at pages/recharge/recharge.vue:293", "统一下单结果：", orderRes);
        common_vendor.index.hideLoading();
        if (orderRes.code === 0 && orderRes.data) {
          this.currentTradeNo = orderRes.data.tradeNo;
          this.currentOutTradeNo = orderRes.data.outTradeNo;
          await this.callAlipayPayment(orderRes.data);
        } else {
          throw new Error(orderRes.msg || "创建订单失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/recharge/recharge.vue:307", "充值失败：", error);
        common_vendor.index.hideLoading();
        if (error.resultCode === "6001") {
          this.showPaymentStatus("warning", "支付已取消，如需充值请重新操作");
        } else {
          this.showPaymentStatus("error", error.message || "充值失败，请重试");
        }
        this.isPaymentProcessing = false;
      }
    },
    /**
     * 调用支付宝支付接口
     * @param {Object} orderData 订单数据，包含orderStr或相关支付参数
     */
    callAlipayPayment(orderData) {
      return new Promise((resolve, reject) => {
        common_vendor.index.showToast({
          title: "当前平台暂不支持支付宝支付",
          icon: "none"
        });
        reject(new Error("当前平台不支持支付宝支付"));
      });
    },
    /**
     * 开始支付结果轮询
     */
    startPaymentPolling() {
      if (!this.currentTradeNo) {
        common_vendor.index.__f__("error", "at pages/recharge/recharge.vue:389", "订单号为空，无法开始轮询");
        return;
      }
      common_vendor.index.showLoading({ title: "支付处理中..." });
      this.clearPollingTimer();
      this.queryPaymentResult();
      let pollCount = 0;
      const maxPollCount = 20;
      this.pollingTimer = setInterval(() => {
        pollCount++;
        if (pollCount >= maxPollCount) {
          this.clearPollingTimer();
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "支付超时，请稍后查看账户余额",
            icon: "none"
          });
          return;
        }
        this.queryPaymentResult();
      }, 3e3);
    },
    /**
     * 查询支付结果
     */
    async queryPaymentResult() {
      try {
        const queryRes = await api_pay.alipayOrderResultQuery({
          orderNo: this.currentOutTradeNo
        });
        common_vendor.index.__f__("log", "at pages/recharge/recharge.vue:430", "支付结果查询：", queryRes);
        if (queryRes.code === 0 && queryRes.data) {
          this.clearPollingTimer();
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "充值成功！",
            icon: "success"
          });
          this.onPaymentSuccess(queryRes.data);
        } else {
          this.clearPollingTimer();
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "充值失败！",
            icon: "error"
          });
          this.onPaymentFailed(queryRes.data);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/recharge/recharge.vue:454", "查询支付结果失败：", error);
      }
    },
    /**
     * 支付成功处理
     * @param {Object} paymentData 支付成功数据
     */
    onPaymentSuccess(paymentData) {
      common_vendor.index.__f__("log", "at pages/recharge/recharge.vue:464", "支付成功，支付数据：", paymentData);
      this.showPaymentStatus("success", `充值成功！已到账 ${this.rechargeAmount} 元`);
      common_vendor.index.$emit("rechargeSuccess", {
        orderNo: this.currentOutTradeNo,
        amount: this.rechargeAmount,
        paymentData
      });
      setTimeout(() => {
        this.resetPaymentForm();
      }, 2e3);
    },
    /**
     * 支付失败处理
     * @param {Object} paymentData 支付失败数据
     */
    onPaymentFailed(paymentData) {
      common_vendor.index.__f__("log", "at pages/recharge/recharge.vue:491", "支付失败，支付数据：", paymentData);
      const failReason = paymentData.failReason || "支付失败";
      this.showPaymentStatus("error", `${failReason}，请重试或联系客服`);
      common_vendor.index.$emit("rechargeFailed", {
        orderNo: this.currentOutTradeNo,
        amount: this.rechargeAmount,
        paymentData
      });
      this.isPaymentProcessing = false;
    },
    /**
     * 支付取消处理
     * @param {Object} paymentData 支付取消数据
     */
    onPaymentCancelled(paymentData) {
      common_vendor.index.__f__("log", "at pages/recharge/recharge.vue:511", "支付取消，支付数据：", paymentData);
      this.showPaymentStatus("warning", "支付已取消，如需充值请重新操作");
      common_vendor.index.$emit("rechargeCancelled", {
        orderNo: this.currentOutTradeNo,
        amount: this.rechargeAmount,
        paymentData
      });
      this.isPaymentProcessing = false;
    },
    /**
     * 显示支付状态
     * @param {String} type 状态类型：success、error、warning
     * @param {String} message 状态消息
     */
    showPaymentStatus(type, message) {
      this.paymentStatus = { type, message };
      if (type !== "success") {
        setTimeout(() => {
          this.paymentStatus = null;
        }, 3e3);
      }
    },
    /**
     * 重置支付表单
     */
    resetPaymentForm() {
      this.currentOutTradeNo = null;
      this.isPaymentProcessing = false;
      this.paymentStatus = null;
      this.clearPollingTimer();
    },
    /**
     * 清除轮询定时器
     */
    clearPollingTimer() {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
        this.pollingTimer = null;
      }
    },
    /**
     * 选择快捷金额
     * @param {Number} amount 金额
     */
    selectAmount(amount) {
      if (!this.isPaymentProcessing) {
        this.rechargeAmount = String(amount);
      }
    },
    /**
     * 清空金额输入
     */
    clearAmount() {
      if (!this.isPaymentProcessing) {
        this.rechargeAmount = "";
      }
    },
    /**
     * 金额输入完成事件
     * @param {String|Number} value 输入的值
     */
    onAmountChange(value) {
      this.rechargeAmount = Number(value);
    },
    /**
     * 加载优惠活动内容
     */
    async loadPromoContent() {
      try {
        const response = await api_style.getStyleContent("REFILL_DISCOUNT");
        if (response.code === 0 && response.data) {
          const fullContent = response.data;
          this.promoDetailContent = fullContent;
          const firstSentence = fullContent.split("；")[0] + "；";
          this.promoText = firstSentence.length > 50 ? firstSentence.substring(0, 50) + "..." : firstSentence;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/recharge/recharge.vue:607", "加载优惠活动内容失败：", error);
        this.promoText = "充值赠券活动赠送优惠券为充电服务...";
      }
    },
    /**
     * 显示优惠详情弹窗
     */
    showPromoDetail() {
      this.showDetailModal = true;
    },
    /**
     * 隐藏优惠详情弹窗
     */
    hidePromoDetail() {
      this.showDetailModal = false;
    },
    /**
     * 切换站点列表展示状态
     */
    toggleStationList() {
      this.showStationList = !this.showStationList;
    }
  }
};
if (!Array) {
  const _easycom_uv_input2 = common_vendor.resolveComponent("uv-input");
  const _easycom_uv_button2 = common_vendor.resolveComponent("uv-button");
  (_easycom_uv_input2 + _easycom_uv_button2)();
}
const _easycom_uv_input = () => "../../uni_modules/uv-input/components/uv-input/uv-input.js";
const _easycom_uv_button = () => "../../uni_modules/uv-button/components/uv-button/uv-button.js";
if (!Math) {
  (_easycom_uv_input + _easycom_uv_button)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.promoText || "充值赠券活动赠送优惠券为充电服务..."),
    b: common_vendor.o((...args) => $options.showPromoDetail && $options.showPromoDetail(...args)),
    c: common_vendor.o($options.onAmountChange),
    d: common_vendor.o(($event) => $data.rechargeAmount = $event),
    e: common_vendor.p({
      placeholder: "请输入充值金额",
      type: "digit",
      disabled: $data.isPaymentProcessing,
      border: "none",
      fontSize: "36rpx",
      color: "#1A202C",
      customStyle: $data.inputCustomStyle,
      modelValue: $data.rechargeAmount
    }),
    f: common_vendor.f($data.quickAmounts, (amount, index, i0) => {
      return common_vendor.e({
        a: amount.special
      }, amount.special ? {} : {}, {
        b: common_vendor.t(amount.value),
        c: $options.numericRechargeAmount === amount.value
      }, $options.numericRechargeAmount === amount.value ? {} : {}, {
        d: index,
        e: common_vendor.n({
          "selected": $options.numericRechargeAmount === amount.value,
          "special": amount.special
        }),
        f: common_vendor.o(($event) => $options.selectAmount(amount.value), index)
      });
    }),
    g: $options.hasReward
  }, $options.hasReward ? common_vendor.e({
    h: common_vendor.t($options.currentReward.title),
    i: common_vendor.t($options.currentReward.description),
    j: common_vendor.t($data.showStationList ? "收起适用站点详情" : "展开适用站点详情"),
    k: common_vendor.t($data.showStationList ? "⌃" : "⌄"),
    l: common_vendor.o((...args) => $options.toggleStationList && $options.toggleStationList(...args)),
    m: $data.showStationList
  }, $data.showStationList ? {
    n: common_vendor.f($data.stationList, (station, index, i0) => {
      return {
        a: common_vendor.t(station),
        b: index
      };
    })
  } : {}) : {}, {
    o: $data.paymentStatus
  }, $data.paymentStatus ? {
    p: common_vendor.t($data.paymentStatus.message),
    q: common_vendor.n($data.paymentStatus.type)
  } : {}, {
    r: common_vendor.o($options.recharge),
    s: common_vendor.p({
      text: $data.isPaymentProcessing ? "支付处理中..." : "立即充值",
      type: "primary",
      size: "large",
      disabled: $data.isPaymentProcessing || $options.numericRechargeAmount <= 0,
      loading: $data.isPaymentProcessing,
      customStyle: $data.buttonCustomStyle
    }),
    t: $data.showDetailModal
  }, $data.showDetailModal ? {
    v: common_vendor.o((...args) => $options.hidePromoDetail && $options.hidePromoDetail(...args)),
    w: common_vendor.t($data.promoDetailContent),
    x: common_vendor.o(() => {
    }),
    y: common_vendor.o((...args) => $options.hidePromoDetail && $options.hidePromoDetail(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2984a38c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/recharge/recharge.js.map

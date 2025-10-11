"use strict";
const common_vendor = require("../../common/vendor.js");
const api_bill = require("../../api/bill.js");
const api_member = require("../../api/member.js");
const _sfc_main = {
  name: "SettlementPay",
  data() {
    return {
      busId: null,
      // 从路由参数获取的busId
      billId: null,
      // 从路由参数获取的billId
      stationOccupy: 0,
      // 站点占位状态，1表示有占位费
      countdown: 60,
      // 倒计时秒数
      timer: null,
      couponIdStr: null,
      // 优惠券ID字符串
      deductibleBalanceCoupon: 0,
      // 优惠券抵扣金额
      couponType: null,
      // 优惠券类型：FuWuFei(服务费券)、DianFei(电费券)、XianJin(现金券)
      memberInfo: {},
      // 会员信息
      buttonStyle: {
        width: "100%",
        height: "88rpx",
        borderRadius: "44rpx",
        fontSize: "32rpx",
        fontWeight: "bold"
      },
      orderData: {
        orderNo: "--",
        stationImage: "/static/images/default-station.png",
        // 默认图片
        stationName: "--",
        chargeDuration: "--",
        chargedAmount: "--",
        electricityFee: "--",
        serviceFee: "--",
        payAccountStr: "--",
        accountBalance: "--",
        busBalance: "--",
        memberDiscountBalance: "0.00",
        couponAmount: "0.00",
        leftSecond: "--",
        billStatus: null,
        // 账单状态
        billPayLog: [],
        // 账单支付日志
        orderDiscount: null,
        // 订单优惠信息
        discountBalance: 0,
        // 优惠活动金额
        deductibleBalance: 0,
        // 可抵扣奖励金金额
        wxppOrder: null,
        payMode: 0,
        disposableOrder: 0,
        preFrozenAmount: 0,
        allCouponAmount: 0,
        actualBalance1: 0
      }
    };
  },
  computed: {
    totalDiscount() {
      const member = parseFloat(this.orderData.memberDiscountBalance) || 0;
      const coupon = parseFloat(this.orderData.couponAmount) || 0;
      const discount = this.orderData.discountBalance / 100 || 0;
      const bonus = this.orderData.deductibleBalance / 100 || 0;
      return (member + coupon + discount + bonus).toFixed(2);
    },
    finalAmount() {
      const total = parseFloat(this.orderData.busBalance);
      const discount = parseFloat(this.totalDiscount);
      const result = total - discount;
      return result > 0 ? result.toFixed(2) : "0.00";
    },
    countdownText() {
      return `${this.countdown}秒`;
    },
    payButtonText() {
      if (this.orderData.billStatus === 13 && this.orderData.billPayLog && this.orderData.billPayLog.length > 0) {
        const payLog = this.orderData.billPayLog[0];
        const debt = (payLog.debt / 100).toFixed(2);
        const paidAmount = (payLog.paidAmount / 100).toFixed(2);
        return `请充值（待支付${debt}元，已支付${paidAmount}元）`;
      }
      return "立即支付";
    }
  },
  async onLoad(options) {
    if (options.busId && options.billId) {
      this.busId = options.busId;
      this.billId = options.billId;
      await this.fetchBillData();
    } else {
      common_vendor.index.showToast({
        title: "参数错误",
        icon: "none"
      });
    }
    this.startCountdown();
  },
  onUnload() {
    this.clearCountdown();
  },
  // 从优惠券页面返回时更新数据
  onShow() {
    const selectedCoupon = common_vendor.index.getStorageSync("selectedCoupon");
    common_vendor.index.__f__("log", "at pages/bill/settlementPay.vue:282", "selectedCoupon show", selectedCoupon);
    if (selectedCoupon) {
      try {
        const couponData = JSON.parse(selectedCoupon);
        this.couponType = couponData.couponType;
        this.deductibleBalanceCoupon = parseFloat(couponData.deductibleBalanceCoupon) || 0;
        this.couponIdStr = couponData.couponIdStr;
        common_vendor.index.__f__("log", "at pages/bill/settlementPay.vue:290", "从优惠券页面返回，更新优惠券信息:", couponData);
        this.fetchBillData();
        common_vendor.index.removeStorageSync("selectedCoupon");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/bill/settlementPay.vue:298", "解析优惠券数据失败:", error);
        common_vendor.index.removeStorageSync("selectedCoupon");
      }
    }
  },
  methods: {
    // 获取账单数据
    async fetchBillData() {
      if (!this.busId) {
        common_vendor.index.__f__("warn", "at pages/bill/settlementPay.vue:307", "busId不存在，无法获取账单数据");
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        const response = await api_bill.getDelayPayBill({
          busId: this.busId
        });
        if (response && response.code === 0 && response.data) {
          this.updateOrderData(response.data);
          common_vendor.index.__f__("log", "at pages/bill/settlementPay.vue:322", "账单数据获取成功:", response.data);
        } else {
          common_vendor.index.__f__("error", "at pages/bill/settlementPay.vue:324", "获取账单数据失败:", response);
          common_vendor.index.showToast({
            title: "获取数据失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/bill/settlementPay.vue:331", "调用getDelayPayBill接口失败:", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    // 更新订单数据
    async updateOrderData(data) {
      var _a;
      const chargeDuration = this.calculateChargeDuration(data.timeS, data.timeE);
      this.stationOccupy = data.stationOccupy || 0;
      const memberInfo = await api_member.getMemberInfo();
      let accountBalance = 0;
      if (memberInfo.code === 0) {
        this.memberInfo = memberInfo.data;
        accountBalance = this.memberInfo.accountBalance;
      }
      if (data.useCouponId) {
        this.couponIdStr = data.useCouponId;
      }
      const selectedCoupon = common_vendor.index.getStorageSync("selectedCoupon");
      if (selectedCoupon) {
        try {
          const couponData = JSON.parse(selectedCoupon);
          this.couponIdStr = couponData.couponIdStr;
          this.couponType = couponData.couponType;
          this.deductibleBalanceCoupon = parseFloat(couponData.deductibleBalanceCoupon) || 0;
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/bill/settlementPay.vue:370", "解析优惠券数据失败:", error);
        }
      }
      const couponAmount = this.calculateCouponAmount(data);
      const deductibleBalance = this.calculateDeductibleBalance(data, couponAmount);
      let allDiscountAmount = data.totalDiscountBalance && data.totalDiscountBalance > 0 ? data.totalDiscountBalance / 100 : 0;
      let paidinAmount = (data.busBalance - allDiscountAmount).toFixed(2);
      this.orderData = {
        ...this.orderData,
        orderNo: data.busShowNo || data.busId || this.orderData.orderNo,
        stationName: data.stationName || this.orderData.stationName,
        chargeDuration,
        chargedAmount: (data.sumPower / 1e3).toFixed(2),
        electricityFee: (data.powerBalance / 100).toFixed(2),
        serviceFee: (data.serviceBalance / 100).toFixed(2),
        payAccountStr: data.payAccountStr || this.orderData.payAccountStr,
        accountBalance: (accountBalance / 100).toFixed(2),
        busBalance: (data.busBalance / 100).toFixed(2),
        memberDiscountBalance: (data.memberDiscountBalance / 100).toFixed(2),
        couponAmount,
        leftSecond: data.leftSecond,
        billStatus: data.billStatus || null,
        billPayLog: data.billPayLog || [],
        orderDiscount: data.orderDiscount || null,
        discountBalance: data.discountBalance || 0,
        // 优惠活动金额
        deductibleBalance,
        // 处理后的奖励金金额
        allDiscountAmount: allDiscountAmount.toFixed(2),
        paidinAmount,
        memberDiscountType: data.memberDiscountType || 0,
        discountType: data.discountType || 0,
        wxppOrder: data.wxppOrder,
        payMode: data.payMode || 0,
        disposableOrder: data.disposableOrder || 0,
        preFrozenAmount: data.preFrozenAmount || 0,
        allCouponAmount: this.calculateAllCouponAmount(couponAmount, data, deductibleBalance)
      };
      this.orderData.actualBalance1 = (data.busBalance / 100 - this.orderData.allCouponAmount).toFixed(2);
      this.countdown = data.leftSecond;
      common_vendor.index.setStorageSync("bestCoupons", JSON.stringify(((_a = data.orderDiscount) == null ? void 0 : _a.bestCoupons) || []));
    },
    // 计算充电时长
    calculateChargeDuration(startTime, endTime) {
      if (!startTime || !endTime)
        return "0min";
      try {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const diffMs = end - start;
        const diffMinutes = Math.round(diffMs / (1e3 * 60));
        if (diffMinutes < 60) {
          return `${diffMinutes}min`;
        } else {
          const hours = Math.floor(diffMinutes / 60);
          const minutes = diffMinutes % 60;
          return minutes > 0 ? `${hours}h${minutes}min` : `${hours}h`;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/bill/settlementPay.vue:437", "计算充电时长失败:", error);
        return "0min";
      }
    },
    startCountdown() {
      this.timer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          this.clearCountdown();
          this.handleAutoPay();
        }
      }, 1e3);
    },
    clearCountdown() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    handleRecharge() {
      common_vendor.index.navigateTo({
        url: "/pages/recharge/recharge"
      });
    },
    handleCoupon() {
      common_vendor.index.navigateTo({
        url: `/pages/coupon/useCoupon?billId=${this.billId}&${this.couponIdStr ? "&couponIdStr=" + this.couponIdStr : ""}`
      });
    },
    async handlePay() {
      if (this.orderData.billStatus === 13) {
        common_vendor.index.navigateTo({
          url: "/pages/recharge/recharge"
        });
        return;
      }
      this.clearCountdown();
      try {
        common_vendor.index.showLoading({
          title: "支付中..."
        });
        const response = await api_bill.delayDeductionCharge({
          id: this.billId.toString(),
          couponIdStr: this.couponIdStr || null
        });
        if (response && response.code === 0) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "支付成功",
            icon: "success"
          });
          setTimeout(() => {
            this.handlePaymentComplete();
          }, 1500);
        } else {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: response.msg || "支付失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/bill/settlementPay.vue:509", "支付失败:", error);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "支付失败，请重试",
          icon: "none"
        });
      }
    },
    // 处理支付完成后的逻辑
    async handlePaymentComplete() {
      const response = await this.fetchBillData();
      if (response && response.code === 0) {
        await this.updateOrderData(response.data);
        if (this.orderData.billStatus === 13) {
          return;
        }
      }
      if (this.stationOccupy === 1) {
        common_vendor.index.showModal({
          title: "支付成功",
          content: "订单已支付，请尽快驶离车位避免产生占位费。",
          confirmText: "确认",
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
              this.navigateToSettlementInfo();
            }
          }
        });
      } else {
        this.navigateToSettlementInfo();
      }
    },
    // 跳转到结算信息页面
    navigateToSettlementInfo() {
      common_vendor.index.redirectTo({
        url: `/pages/bill/settlementInfo?billId=${this.billId}`
      });
    },
    handleAutoPay() {
      if (this.stationOccupy === 1) {
        this.handleAutoPayWithOccupyWarning();
      } else {
        this.handleAutoPayDirect();
      }
    },
    // 自动支付（有占位费提醒）
    async handleAutoPayWithOccupyWarning() {
      try {
        common_vendor.index.showLoading({
          title: "支付中..."
        });
        const response = await api_bill.delayDeductionCharge({
          id: this.billId.toString(),
          couponIdStr: this.couponIdStr || null
        });
        if (response && response.code === 0) {
          common_vendor.index.hideLoading();
          common_vendor.index.showModal({
            title: "支付成功",
            content: "订单已支付，请尽快驶离车位避免产生占位费。",
            confirmText: "确认",
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                this.navigateToSettlementInfo();
              }
            }
          });
        } else {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: response.msg || "支付失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/bill/settlementPay.vue:601", "自动支付失败:", error);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "支付失败，请重试",
          icon: "none"
        });
      }
    },
    // 自动支付（直接跳转）
    async handleAutoPayDirect() {
      try {
        common_vendor.index.showLoading({
          title: "支付中..."
        });
        const response = await api_bill.delayDeductionCharge({
          id: this.billId.toString(),
          couponIdStr: this.couponIdStr || null
        });
        if (response && response.code === 0) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "支付成功",
            icon: "success"
          });
          setTimeout(() => {
            this.navigateToSettlementInfo();
          }, 1500);
        } else {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: response.msg || "支付失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/bill/settlementPay.vue:642", "自动支付失败:", error);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "支付失败，请重试",
          icon: "none"
        });
      }
    },
    // 获取余额（格式化显示）
    GetBalance(amount) {
      common_vendor.index.__f__("log", "at pages/bill/settlementPay.vue:653", amount, "amount");
      if (!amount)
        return "0.00";
      return (amount / 100).toFixed(2);
    },
    // 计算优惠券金额 - 参考原代码逻辑
    calculateCouponAmount(data) {
      const powerCoupon = data.powerCoupon ? (data.powerCoupon / 100).toFixed(2) : "0.00";
      const serviceCoupon = data.serviceCoupon ? (data.serviceCoupon / 100).toFixed(2) : "0.00";
      const cashCoupon = data.cashCoupon ? (data.cashCoupon / 100).toFixed(2) : "0.00";
      const serviceBalance = (data.serviceBalance / 100).toFixed(2);
      const powerBalance = (data.powerBalance / 100).toFixed(2);
      const busBalance = (data.busBalance / 100).toFixed(2);
      const memberDiscountBalance = (data.memberDiscountBalance / 100).toFixed(2);
      const discountBalance = data.discountBalance ? (data.discountBalance / 100).toFixed(2) : "0.00";
      let couponAmount = 0;
      if (this.couponType) {
        let money = parseFloat(this.deductibleBalanceCoupon) || 0;
        if (this.couponType === "FuWuFei") {
          const maxServiceAmount = parseFloat(serviceBalance) - parseFloat(discountBalance) - parseFloat(memberDiscountBalance);
          couponAmount = Math.min(money, maxServiceAmount);
        } else if (this.couponType === "DianFei") {
          couponAmount = Math.min(money, parseFloat(powerBalance));
        } else if (this.couponType === "XianJin") {
          const maxCashAmount = parseFloat(busBalance) - parseFloat(discountBalance) - parseFloat(memberDiscountBalance);
          couponAmount = Math.min(money, maxCashAmount);
        }
      } else {
        couponAmount = parseFloat(powerCoupon) + parseFloat(serviceCoupon) + parseFloat(cashCoupon);
      }
      return couponAmount.toFixed(2);
    },
    // 计算奖励金 - 处理与优惠券的抵扣关系
    calculateDeductibleBalance(data, couponAmount) {
      let deductibleBalance = data.deductibleBalance ? (data.deductibleBalance / 100).toFixed(2) : "0.00";
      if (parseFloat(deductibleBalance) <= 0) {
        return deductibleBalance;
      }
      const serviceBalance = (data.serviceBalance / 100).toFixed(2);
      (data.powerBalance / 100).toFixed(2);
      (data.cashBalance / 100).toFixed(2);
      let couponAmountReduceService = parseFloat(couponAmount) - parseFloat(serviceBalance);
      if (!this.couponType) {
        if (data.serviceCoupon && parseFloat(data.serviceCoupon) > 0) {
          if (couponAmountReduceService >= 0) {
            deductibleBalance = "0.00";
          } else {
            const remainingAmount = Math.abs(couponAmountReduceService);
            deductibleBalance = parseFloat(deductibleBalance) >= remainingAmount ? remainingAmount.toFixed(2) : deductibleBalance;
          }
        } else if (data.powerCoupon && parseFloat(data.powerCoupon) > 0) {
          deductibleBalance = deductibleBalance;
        } else if (data.cashCoupon && parseFloat(data.cashCoupon) > 0) {
          if (couponAmountReduceService >= 0) {
            deductibleBalance = "0.00";
          } else {
            const remainingAmount = Math.abs(couponAmountReduceService);
            deductibleBalance = parseFloat(deductibleBalance) >= remainingAmount ? remainingAmount.toFixed(2) : deductibleBalance;
          }
        }
      } else {
        let couponAmountReduceService2 = parseFloat(couponAmount) - parseFloat(serviceBalance);
        if (this.couponType === "FuWuFei") {
          if (couponAmountReduceService2 >= 0) {
            deductibleBalance = "0.00";
          } else {
            const remainingAmount = Math.abs(couponAmountReduceService2);
            deductibleBalance = parseFloat(deductibleBalance) >= remainingAmount ? remainingAmount.toFixed(2) : deductibleBalance;
          }
        } else if (this.couponType === "DianFei") {
          deductibleBalance = deductibleBalance;
        } else if (this.couponType === "XianJin") {
          if (couponAmountReduceService2 >= 0) {
            deductibleBalance = "0.00";
          } else {
            const remainingAmount = Math.abs(couponAmountReduceService2);
            deductibleBalance = parseFloat(deductibleBalance) >= remainingAmount ? remainingAmount.toFixed(2) : deductibleBalance;
          }
        }
      }
      return deductibleBalance;
    },
    // 计算总优惠金额 - 确保不超过总费用
    calculateAllCouponAmount(couponAmount, data, deductibleBalance) {
      const busBalance = (data.busBalance / 100).toFixed(2);
      const memberDiscountBalance = (data.memberDiscountBalance / 100).toFixed(2);
      const discountBalance = data.discountBalance ? (data.discountBalance / 100).toFixed(2) : "0.00";
      let allCouponAmount = (parseFloat(couponAmount) + parseFloat(memberDiscountBalance) + parseFloat(discountBalance) + parseFloat(deductibleBalance)).toFixed(2);
      if (parseFloat(allCouponAmount) > parseFloat(busBalance)) {
        allCouponAmount = busBalance;
      }
      return allCouponAmount;
    }
  }
};
if (!Array) {
  const _easycom_uv_button2 = common_vendor.resolveComponent("uv-button");
  _easycom_uv_button2();
}
const _easycom_uv_button = () => "../../uni_modules/uv-button/components/uv-button/uv-button.js";
if (!Math) {
  _easycom_uv_button();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.orderData.orderNo),
    b: $data.orderData.stationImage,
    c: common_vendor.t($data.orderData.stationName),
    d: common_vendor.t($data.orderData.chargeDuration),
    e: common_vendor.t($data.orderData.chargedAmount),
    f: common_vendor.t($data.orderData.electricityFee),
    g: common_vendor.t($data.orderData.serviceFee),
    h: $data.orderData.wxppOrder
  }, $data.orderData.wxppOrder ? {} : $data.orderData.payMode == 6 ? {} : $data.orderData.payMode == 5 ? {} : {
    k: common_vendor.t($data.orderData.payAccountStr == "团队账户" ? "车队账户" : $data.orderData.disposableOrder ? "充完即退" : $data.orderData.payAccountStr + "账户")
  }, {
    i: $data.orderData.payMode == 6,
    j: $data.orderData.payMode == 5,
    l: $data.orderData.disposableOrder
  }, $data.orderData.disposableOrder ? {
    m: common_vendor.t($data.orderData.preFrozenAmount ? $data.orderData.preFrozenAmount : "-")
  } : $data.orderData.wxppOrder ? {
    o: common_vendor.t($data.orderData.preFrozenAmount ? $data.orderData.preFrozenAmount : "-")
  } : $data.orderData.payMode != 5 ? common_vendor.e({
    q: $data.orderData.payAccountStr == "个人"
  }, $data.orderData.payAccountStr == "个人" ? common_vendor.e({
    r: common_vendor.t($data.orderData.payMode == 6 ? $data.memberInfo.jlAccountBalance ? $data.memberInfo.jlAccountBalance : "-" : $data.memberInfo.accountBalance ? $options.GetBalance($data.memberInfo.accountBalance - $data.memberInfo.jlAccountBalance) : "-"),
    s: $data.orderData.payAccountStr == "个人" && $data.orderData.payMode != 6
  }, $data.orderData.payAccountStr == "个人" && $data.orderData.payMode != 6 ? {} : {}) : {}, {
    t: $data.orderData.payAccountStr == "个人" && $data.orderData.payMode != 6
  }, $data.orderData.payAccountStr == "个人" && $data.orderData.payMode != 6 ? {
    v: common_vendor.o($options.handleRecharge),
    w: common_vendor.p({
      text: "去充值",
      type: "primary",
      size: "mini",
      plain: true,
      ["custom-style"]: {
        fontSize: "24rpx",
        height: "48rpx",
        padding: "0 16rpx"
      }
    })
  } : {}, {
    x: $data.orderData.payAccountStr !== "个人"
  }, $data.orderData.payAccountStr !== "个人" ? common_vendor.e({
    y: $data.memberInfo.deductMode !== "TeamAccount"
  }, $data.memberInfo.deductMode !== "TeamAccount" ? {} : {}, {
    z: common_vendor.t($data.memberInfo.deductMode == "TeamAccount" ? "****" : $data.memberInfo.carAccountBalance ? ($data.memberInfo.carAccountBalance / 100).toFixed(2) : "-")
  }) : {}) : {}, {
    n: $data.orderData.wxppOrder,
    p: $data.orderData.payMode != 5,
    A: common_vendor.t($data.orderData.busBalance ? $data.orderData.busBalance : "-"),
    B: $data.orderData.memberDiscountBalance > 0
  }, $data.orderData.memberDiscountBalance > 0 ? {
    C: common_vendor.t($data.orderData.payAccountStr == "个人" ? "会员折扣(个人会员)" : "会员折扣(车队会员)"),
    D: common_vendor.t($data.orderData.memberDiscountBalance ? $data.orderData.memberDiscountBalance : "--")
  } : {}, {
    E: $data.orderData.discountBalance > 0
  }, $data.orderData.discountBalance > 0 ? {
    F: common_vendor.t($data.orderData.ruleType == "1" ? "会员折扣" : $data.orderData.ruleType == "2" ? "累计优惠" : "站点优惠"),
    G: common_vendor.t($data.orderData.discountBalance ? $data.orderData.discountBalance : "-")
  } : {}, {
    H: $data.orderData.deductibleBalance > 0
  }, $data.orderData.deductibleBalance > 0 ? {
    I: common_vendor.t($data.orderData.payMode == 6 ? "电卡" : "奖励金"),
    J: common_vendor.t($data.orderData.deductibleBalance ? $data.orderData.deductibleBalance : "-")
  } : {}, {
    K: $data.orderData.payAccountStr == "个人" && $data.orderData.payMode != 6
  }, $data.orderData.payAccountStr == "个人" && $data.orderData.payMode != 6 ? common_vendor.e({
    L: common_vendor.t($data.orderData.couponAmount),
    M: $data.orderData.billStatus != 14
  }, $data.orderData.billStatus != 14 ? {} : {}, {
    N: common_vendor.o((...args) => $options.handleCoupon && $options.handleCoupon(...args)),
    O: $data.orderData.id
  }) : {}, {
    P: common_vendor.t($data.orderData.allCouponAmount),
    Q: common_vendor.t($data.orderData.actualBalance1),
    R: $data.orderData.billStatus !== 13
  }, $data.orderData.billStatus !== 13 ? {
    S: common_vendor.t($options.countdownText),
    T: common_vendor.o($options.handlePay),
    U: common_vendor.p({
      text: $options.payButtonText,
      type: "primary",
      size: "large",
      ["custom-style"]: $data.buttonStyle
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-0ff3a4b3"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/bill/settlementPay.js.map

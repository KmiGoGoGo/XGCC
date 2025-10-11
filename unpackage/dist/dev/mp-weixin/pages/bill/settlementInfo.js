"use strict";
const common_vendor = require("../../common/vendor.js");
const api_bill = require("../../api/bill.js");
const _sfc_main = {
  name: "SettlementInfo",
  data() {
    return {
      billId: null,
      // 从路由参数获取的账单ID
      orderStatus: 3,
      // 订单状态：1=充电中 2=待支付 3=已完成 4=已关闭
      feeDetailExpanded: false,
      chargeDetailExpanded: false,
      buttonStyle: {
        width: "100%",
        height: "88rpx",
        borderRadius: "44rpx",
        fontSize: "32rpx",
        fontWeight: "bold"
      },
      // 订单状态映射
      orderStatusArr: [
        { state: "1", val: 1 },
        { state: "2", val: 1 },
        { state: "3", val: 3 },
        { state: "4", val: 1 },
        { state: "5", val: 5 },
        { state: "6", val: 5 },
        { state: "7", val: 5 },
        { state: "8", val: 5 },
        { state: "9", val: 5 },
        { state: "10", val: 2 },
        { state: "11", val: 2 },
        { state: "12", val: 2 },
        { state: "13", val: 2 },
        { state: "14", val: 3 },
        { state: "15", val: 2 },
        { state: "16", val: 4 },
        { state: "17", val: 3 },
        { state: "18", val: 4 }
      ],
      settlementData: {
        // 基础信息
        busShowNo: "--",
        stationName: "--",
        pileName: "--",
        gunName: "--",
        pileNumber: "--",
        // 金额信息
        actualAmount: "--",
        actualBalance: 0,
        busBalance: "--",
        powerBalance: "--",
        serviceBalance: "--",
        totalDiscountBalance: "--",
        deductibleBalance: "--",
        memberDiscountBalance: "--",
        discountBalance: "--",
        cashCouponBalance: "--",
        couponTypeStr: "--",
        // 支付信息
        payMode: 0,
        payAccountStr: "--",
        disposableOrder: false,
        wxppOrder: false,
        preFrozenAmount: "--",
        backAmountCalculate: "--",
        // 时间信息
        timeS: null,
        timeE: null,
        difference: "--",
        createTime: "--",
        // 充电信息
        chargeType: "--",
        pileCurrentMode: 0,
        endReasonStr: "--",
        plateNo: "--",
        sumPower: "--",
        endSoc: "--",
        // 其他信息
        stationOccupy: 0,
        occupyBill: null,
        refundObj: null,
        walletPayObj: [],
        wechatPayObj: null,
        ruleType: "--"
      }
    };
  },
  onLoad(options) {
    if (options.billId) {
      this.billId = options.billId;
      this.fetchBillDetail();
    }
  },
  methods: {
    // 获取账单详情
    async fetchBillDetail() {
      if (!this.billId) {
        common_vendor.index.__f__("warn", "at pages/bill/settlementInfo.vue:414", "账单ID不存在，无法获取详情");
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        const response = await api_bill.getBillDetailById(this.billId);
        if (response && response.code === 0 && response.data) {
          this.updateSettlementData(response.data);
          common_vendor.index.__f__("log", "at pages/bill/settlementInfo.vue:427", "账单详情获取成功:", response.data);
        } else {
          common_vendor.index.__f__("error", "at pages/bill/settlementInfo.vue:429", "获取账单详情失败:", response);
          common_vendor.index.showToast({
            title: "获取数据失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/bill/settlementInfo.vue:436", "调用getBillDetailById接口失败:", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    // 判断订单状态
    judgmentState(billStatus) {
      let type = 3;
      this.orderStatusArr.forEach((item) => {
        if (billStatus == item.state) {
          type = item.val;
        }
      });
      return type;
    },
    // 更新结算数据
    updateSettlementData(data) {
      const billStatus = data.billStatus;
      const type = this.judgmentState(billStatus);
      if (type == 1)
        ;
      else if (type == 2) {
        this.orderStatus = 2;
      } else if (type == 3) {
        this.orderStatus = 3;
      } else if (type == 4) {
        this.orderStatus = 1;
      }
      if (data.timeS) {
        data.timeS = data.timeS.split(" ");
        data.timeS[0] = data.timeS[0].split("-")[1] + "月" + data.timeS[0].split("-")[2] + "日";
      }
      if (data.timeE) {
        data.timeE = data.timeE.split(" ");
        data.timeE[0] = data.timeE[0].split("-")[1] + "月" + data.timeE[0].split("-")[2] + "日";
      }
      data.difference = this.getDateDiff(data.timeS ? data.timeS.join(" ") : null, data.timeE ? data.timeE.join(" ") : null);
      const regFenToYuan = (fen) => {
        return (fen / 100).toFixed(2);
      };
      common_vendor.index.__f__("log", "at pages/bill/settlementInfo.vue:493", "qqqqqqqqq", data);
      this.settlementData = {
        // 基础信息
        busShowNo: data.busShowNo || "--",
        stationName: data.stationName || "--",
        pileName: data.pileName || "--",
        gunName: data.gunName || "--",
        pileNumber: data.pileNumber || "--",
        // 金额信息
        actualAmount: regFenToYuan(data.actualBalance),
        actualBalance: data.actualBalance,
        busBalance: regFenToYuan(data.busBalance),
        powerBalance: regFenToYuan(data.powerBalance),
        serviceBalance: regFenToYuan(data.serviceBalance),
        totalDiscountBalance: regFenToYuan(data.totalDiscountBalance),
        deductibleBalance: regFenToYuan(data.deductibleBalance),
        memberDiscountBalance: regFenToYuan(data.memberDiscountBalance),
        discountBalance: regFenToYuan(data.discountBalance),
        cashCouponBalance: regFenToYuan(data.cashCouponBalance),
        couponTypeStr: data.couponTypeStr || "--",
        // 支付信息
        payMode: data.payMode || 0,
        payAccountStr: data.payAccountStr || "--",
        disposableOrder: data.disposableOrder || false,
        wxppOrder: data.wxppOrder || false,
        preFrozenAmount: data.preFrozenAmount || 0,
        backAmountCalculate: data.backAmount || 0,
        // 时间信息
        timeS: data.timeS,
        timeE: data.timeE,
        difference: this.getDateDiff(data.timeS ? data.timeS.join(" ") : null, data.timeE ? data.timeE.join(" ") : null),
        createTime: data.createTime || "--",
        // 充电信息
        chargeType: data.chargeType || "--",
        pileCurrentMode: data.pileCurrentMode || 0,
        endReasonStr: data.endReasonStr || "--",
        plateNo: data.plateNo || "--",
        sumPower: data.sumPower ? (data.sumPower / 1e3).toFixed(3) : "--",
        endSoc: data.endSoc || "0",
        // 其他信息
        stationOccupy: data.stationOccupy || 0,
        occupyBill: data.occupyBill || null,
        refundObj: data.refundObj || null,
        walletPayObj: data.walletPayObj || [],
        wechatPayObj: data.wechatPayObj || null,
        ruleType: data.ruleType || "--"
      };
    },
    // 计算退回金额
    calculateBackAmount(data) {
      const actualBalance = Number(data.actualBalance || 0);
      const preFrozenAmount = Number(data.preFrozenAmount || 0);
      const backAmount = (preFrozenAmount - actualBalance).toFixed(2);
      return backAmount < 0 ? "0.00" : backAmount;
    },
    // 计算时间差
    getDateDiff(timeS, timeE) {
      const year = (/* @__PURE__ */ new Date()).getFullYear();
      const start = /* @__PURE__ */ new Date(`${year}-${timeS.replace("月", "-").replace("日", "")}`);
      const end = /* @__PURE__ */ new Date(`${year}-${timeE.replace("月", "-").replace("日", "")}`);
      const diffMs = end - start;
      if (isNaN(diffMs) || diffMs < 0)
        return "00:00:00";
      let diffSec = Math.floor(diffMs / 1e3);
      const hours = String(Math.floor(diffSec / 3600)).padStart(2, "0");
      diffSec %= 3600;
      const minutes = String(Math.floor(diffSec / 60)).padStart(2, "0");
      const seconds = String(diffSec % 60).padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
    },
    // 格式化日期时间
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr)
        return { date: "--", time: "--" };
      try {
        const date = new Date(dateTimeStr);
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        return {
          date: `${month}月${day}日`,
          time: `${hours}:${minutes}:${seconds}`
        };
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/bill/settlementInfo.vue:596", "时间格式化失败:", error);
        return { date: "--", time: "--" };
      }
    },
    // 计算充电时长
    calculateDuration(startTime, endTime) {
      if (!startTime || !endTime)
        return "--";
      try {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const diffMs = end - start;
        const diffSeconds = Math.floor(diffMs / 1e3);
        const hours = Math.floor(diffSeconds / 3600);
        const minutes = Math.floor(diffSeconds % 3600 / 60);
        const seconds = diffSeconds % 60;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/bill/settlementInfo.vue:617", "计算充电时长失败:", error);
        return "--";
      }
    },
    toggleFeeDetail() {
      this.feeDetailExpanded = !this.feeDetailExpanded;
    },
    toggleChargeDetail() {
      this.chargeDetailExpanded = !this.chargeDetailExpanded;
    },
    copyOrderNo() {
      common_vendor.index.setClipboardData({
        data: this.settlementData.busShowNo,
        success: () => {
          common_vendor.index.showToast({
            title: "订单编号已复制",
            icon: "success"
          });
        }
      });
    },
    // 去支付
    goPay() {
      common_vendor.index.navigateTo({
        url: "../orderSettlement/orderSettlement?busId=" + this.billId
      });
    },
    // 立即支付（充完即退）
    unifiedOrders() {
      common_vendor.index.__f__("log", "at pages/bill/settlementInfo.vue:650", "立即支付");
    },
    // 查看占位订单详情
    toPlaceholderOrderDetail(id) {
      common_vendor.index.navigateTo({
        url: "/orderSub/pages/placeholderOrderDetail/placeholderOrderDetail?id=" + id
      });
    },
    handleRecharge() {
      common_vendor.index.navigateBack({
        delta: 999,
        // 返回到根页面
        fail: () => {
          common_vendor.index.reLaunch({
            url: "/pages/index/index"
          });
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_uv_icon2 = common_vendor.resolveComponent("uv-icon");
  const _easycom_uv_button2 = common_vendor.resolveComponent("uv-button");
  const _easycom_uv_tags2 = common_vendor.resolveComponent("uv-tags");
  (_easycom_uv_icon2 + _easycom_uv_button2 + _easycom_uv_tags2)();
}
const _easycom_uv_icon = () => "../../uni_modules/uv-icon/components/uv-icon/uv-icon.js";
const _easycom_uv_button = () => "../../uni_modules/uv-button/components/uv-button/uv-button.js";
const _easycom_uv_tags = () => "../../uni_modules/uv-tags/components/uv-tags/uv-tags.js";
if (!Math) {
  (_easycom_uv_icon + _easycom_uv_button + _easycom_uv_tags)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.orderStatus === 2
  }, $data.orderStatus === 2 ? {} : common_vendor.e({
    b: $data.settlementData.disposableOrder
  }, $data.settlementData.disposableOrder ? {} : {}), {
    c: $data.orderStatus === 2 && $data.settlementData.wxppOrder
  }, $data.orderStatus === 2 && $data.settlementData.wxppOrder ? {
    d: common_vendor.t($data.settlementData.unpaidAmount)
  } : {
    e: common_vendor.t($data.settlementData.actualAmount)
  }, {
    f: $data.settlementData.totalDiscountBalance > 0
  }, $data.settlementData.totalDiscountBalance > 0 ? {
    g: common_vendor.t($data.settlementData.totalDiscountBalance)
  } : {}, {
    h: $data.settlementData.deductibleBalance > 0
  }, $data.settlementData.deductibleBalance > 0 ? common_vendor.e({
    i: $data.settlementData.payMode != 6
  }, $data.settlementData.payMode != 6 ? {} : {}, {
    j: common_vendor.t($data.settlementData.deductibleBalance)
  }) : {}, {
    k: common_vendor.t($data.settlementData.busBalance),
    l: common_vendor.t($data.settlementData.powerBalance),
    m: common_vendor.t($data.settlementData.serviceBalance),
    n: $data.feeDetailExpanded
  }, $data.feeDetailExpanded ? common_vendor.e({
    o: $data.settlementData.memberDiscountBalance > 0 || $data.settlementData.discountBalance > 0 || $data.settlementData.cashCouponBalance > 0
  }, $data.settlementData.memberDiscountBalance > 0 || $data.settlementData.discountBalance > 0 || $data.settlementData.cashCouponBalance > 0 ? common_vendor.e({
    p: $data.settlementData.memberDiscountBalance > 0
  }, $data.settlementData.memberDiscountBalance > 0 ? {
    q: common_vendor.t($data.settlementData.payAccountStr == "个人" ? "会员折扣(个人会员)" : "会员折扣(车队会员)"),
    r: common_vendor.t($data.settlementData.memberDiscountBalance)
  } : {}, {
    s: $data.settlementData.ruleType != "1" && $data.settlementData.discountBalance > 0
  }, $data.settlementData.ruleType != "1" && $data.settlementData.discountBalance > 0 ? {
    t: common_vendor.t($data.settlementData.ruleType == "2" ? "累计优惠" : "站点优惠"),
    v: common_vendor.t($data.settlementData.discountBalance)
  } : {}, {
    w: $data.settlementData.cashCouponBalance > 0
  }, $data.settlementData.cashCouponBalance > 0 ? {
    x: common_vendor.t($data.settlementData.couponTypeStr),
    y: common_vendor.t($data.settlementData.cashCouponBalance)
  } : {}) : {}, {
    z: $data.settlementData.wxppOrder
  }, $data.settlementData.wxppOrder ? {} : {
    A: common_vendor.t($data.settlementData.payAccountStr == "个人" ? $data.settlementData.disposableOrder ? "预付金额（充完即退)" : "预付金额（个人钱包)" : $data.settlementData.payMode == 5 ? "消费金额（储值卡支付)" : "预付金额（车队钱包)")
  }, {
    B: common_vendor.t($data.settlementData.preFrozenAmount || "0"),
    C: common_vendor.t($data.settlementData.createTime),
    D: !$data.settlementData.wxppOrder
  }, !$data.settlementData.wxppOrder ? common_vendor.e({
    E: $data.settlementData.disposableOrder
  }, $data.settlementData.disposableOrder ? common_vendor.e({
    F: $data.settlementData.refundObj
  }, $data.settlementData.refundObj ? common_vendor.e({
    G: common_vendor.t($data.settlementData.refundObj ? ($data.settlementData.refundObj.money / 100).toFixed(2) : "0"),
    H: $data.settlementData.refundObj
  }, $data.settlementData.refundObj ? common_vendor.e({
    I: $data.settlementData.refundObj.refundStatus == 1
  }, $data.settlementData.refundObj.refundStatus == 1 ? {} : {}, {
    J: $data.settlementData.refundObj.refundStatus == 2
  }, $data.settlementData.refundObj.refundStatus == 2 ? {} : {}, {
    K: $data.settlementData.refundObj.refundStatus == 5
  }, $data.settlementData.refundObj.refundStatus == 5 ? {} : {}) : {}, {
    L: common_vendor.t($data.settlementData.refundObj.refundStatus ? $data.settlementData.refundObj.updateTime : $data.settlementData.refundObj.realTime)
  }) : {}) : $data.settlementData.payAccountStr == "个人" ? {
    N: common_vendor.t($data.settlementData.payAccountStr == "个人" ? "结算退回（个人钱包)" : "结算退回（车队钱包)"),
    O: common_vendor.t($data.settlementData.backAmountCalculate || "0"),
    P: common_vendor.t($data.settlementData.refundObj ? $data.settlementData.refundObj.realTime : "-")
  } : {}, {
    M: $data.settlementData.payAccountStr == "个人"
  }) : {}, {
    Q: $data.settlementData.disposableOrder && $data.settlementData.walletPayObj && $data.settlementData.walletPayObj.length > 0
  }, $data.settlementData.disposableOrder && $data.settlementData.walletPayObj && $data.settlementData.walletPayObj.length > 0 ? {
    R: common_vendor.f($data.settlementData.walletPayObj, (item, index, i0) => {
      return {
        a: common_vendor.t((item.money / 100).toFixed(2)),
        b: common_vendor.t(item.realTime),
        c: index
      };
    })
  } : {}, {
    S: $data.settlementData.disposableOrder && $data.settlementData.wechatPayObj
  }, $data.settlementData.disposableOrder && $data.settlementData.wechatPayObj ? {
    T: common_vendor.t($data.settlementData.wechatPayObj ? ($data.settlementData.wechatPayObj.money / 100).toFixed(2) : "0"),
    U: common_vendor.t($data.settlementData.wechatPayObj ? $data.settlementData.wechatPayObj.realTime : "-")
  } : {}) : {}, {
    V: common_vendor.t($data.feeDetailExpanded ? "收起费用明细" : "展开费用明细"),
    W: common_vendor.p({
      name: $data.feeDetailExpanded ? "arrow-up" : "arrow-down",
      color: "#007AFF",
      size: "18"
    }),
    X: common_vendor.o((...args) => $options.toggleFeeDetail && $options.toggleFeeDetail(...args)),
    Y: common_vendor.t($data.settlementData.busShowNo),
    Z: common_vendor.o($options.copyOrderNo),
    aa: common_vendor.p({
      text: "复制",
      type: "primary",
      size: "mini",
      plain: true
    }),
    ab: common_vendor.t($data.settlementData.stationName || "--"),
    ac: common_vendor.t($data.settlementData.pileName || "--"),
    ad: common_vendor.t($data.settlementData.gunName ? "-" + $data.settlementData.gunName : ""),
    ae: common_vendor.t($data.settlementData.pileNumber),
    af: $data.settlementData.stationOccupy == 1 && $data.settlementData.occupyBill
  }, $data.settlementData.stationOccupy == 1 && $data.settlementData.occupyBill ? common_vendor.e({
    ag: $data.settlementData.occupyBill.billStatus == 11
  }, $data.settlementData.occupyBill.billStatus == 11 ? {} : {}, {
    ah: $data.settlementData.occupyBill.billStatus == 14
  }, $data.settlementData.occupyBill.billStatus == 14 ? {} : {}, {
    ai: $data.settlementData.occupyBill.billStatus == 18
  }, $data.settlementData.occupyBill.billStatus == 18 ? {} : {}, {
    aj: common_vendor.t($data.settlementData.occupyBill.duration),
    ak: common_vendor.t($data.settlementData.occupyBill.actualDuration),
    al: common_vendor.t(($data.settlementData.occupyBill.busBalance / 100).toFixed(2)),
    am: common_vendor.o(($event) => $options.toPlaceholderOrderDetail($data.settlementData.occupyBill.id)),
    an: common_vendor.p({
      text: "查看详情",
      type: "primary",
      size: "mini"
    })
  }) : {}, {
    ao: common_vendor.p({
      text: $data.settlementData.chargeType == "man" ? "慢充" : $data.settlementData.chargeType == "kuai" ? "快充" : $data.settlementData.chargeType == "overTake" ? "超充" : "其他",
      ["bg-color"]: "#FFF7ED",
      color: "#EA580C",
      border: "none",
      size: "mini"
    }),
    ap: common_vendor.p({
      text: $data.settlementData.pileCurrentMode == 1 ? "直流" : $data.settlementData.pileCurrentMode == 2 ? "交流" : $data.settlementData.pileCurrentMode == 3 ? "交直流一体" : $data.settlementData.pileCurrentMode == 4 ? "无线设备" : "其他",
      ["bg-color"]: "#F0FDF4",
      color: "#15803D",
      border: "none",
      size: "mini"
    }),
    aq: common_vendor.t($data.settlementData.timeS ? $data.settlementData.timeS[0] : "--"),
    ar: common_vendor.t($data.settlementData.timeS ? $data.settlementData.timeS[1] : "--"),
    as: common_vendor.t($data.settlementData.difference || "--"),
    at: common_vendor.t($data.settlementData.timeE ? $data.settlementData.timeE[0] : "--"),
    av: common_vendor.t($data.settlementData.timeE ? $data.settlementData.timeE[1] : "--"),
    aw: common_vendor.p({
      name: "info-circle",
      color: "#6B7280",
      size: "16"
    }),
    ax: common_vendor.t($data.settlementData.endReasonStr || "暂无停止充电原因"),
    ay: $data.chargeDetailExpanded
  }, $data.chargeDetailExpanded ? {
    az: common_vendor.t($data.settlementData.plateNo || "--"),
    aA: common_vendor.t($data.settlementData.sumPower),
    aB: common_vendor.t($data.settlementData.endSoc || "0")
  } : {}, {
    aC: common_vendor.t($data.chargeDetailExpanded ? "收起充电信息" : "展开充电信息"),
    aD: common_vendor.p({
      name: $data.chargeDetailExpanded ? "arrow-up" : "arrow-down",
      color: "#007AFF",
      size: "18"
    }),
    aE: common_vendor.o((...args) => $options.toggleChargeDetail && $options.toggleChargeDetail(...args)),
    aF: $data.orderStatus === 2
  }, $data.orderStatus === 2 ? {
    aG: common_vendor.o($options.goPay),
    aH: common_vendor.p({
      text: "去支付",
      type: "primary",
      size: "large",
      ["custom-style"]: $data.buttonStyle
    })
  } : {}, {
    aI: $data.orderStatus === 2 && $data.settlementData.disposableOrder
  }, $data.orderStatus === 2 && $data.settlementData.disposableOrder ? {
    aJ: common_vendor.o($options.unifiedOrders),
    aK: common_vendor.p({
      text: "立即支付",
      type: "primary",
      size: "large",
      ["custom-style"]: $data.buttonStyle
    })
  } : {}, {
    aL: $data.orderStatus !== 2
  }, $data.orderStatus !== 2 ? {
    aM: common_vendor.o($options.handleRecharge),
    aN: common_vendor.p({
      text: "完成",
      type: "primary",
      size: "large",
      ["custom-style"]: $data.buttonStyle
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8761cf82"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/bill/settlementInfo.js.map

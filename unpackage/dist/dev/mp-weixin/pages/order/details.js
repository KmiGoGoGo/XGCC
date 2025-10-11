"use strict";
const common_vendor = require("../../common/vendor.js");
const api_bill = require("../../api/bill.js");
const _sfc_main = {
  data() {
    return {
      orderId: null,
      orderDetails: null
    };
  },
  computed: {
    statusInfo() {
      if (!this.orderDetails)
        return { text: "", class: "" };
      switch (this.orderDetails.billStatus) {
        case 11:
          return { text: "待支付", class: "status-unpaid" };
        case 14:
          return { text: "已支付", class: "status-paid" };
        default:
          return { text: "未知", class: "" };
      }
    }
  },
  onLoad(options) {
    if (options.id) {
      this.orderId = options.id;
      this.fetchOrderDetails();
    } else {
      common_vendor.index.showToast({ title: "订单ID无效", icon: "none" });
    }
  },
  methods: {
    async fetchOrderDetails() {
      common_vendor.index.showLoading({ title: "加载中..." });
      try {
        common_vendor.index.__f__("log", "at pages/order/details.vue:131", this.orderId);
        const res = await api_bill.getBillDetailById(this.orderId);
        common_vendor.index.__f__("log", "at pages/order/details.vue:133", res);
        if (res.code === 0) {
          this.orderDetails = res.data;
        } else {
          common_vendor.index.showToast({ title: res.msg || "加载失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/details.vue:140", "获取订单详情失败:", error);
        common_vendor.index.showToast({ title: "网络错误", icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    formatAmount(amount) {
      if (typeof amount !== "number")
        return "0.00";
      return (amount / 100).toFixed(2);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.orderDetails
  }, $data.orderDetails ? common_vendor.e({
    b: common_vendor.t($data.orderDetails.stationName),
    c: common_vendor.t($data.orderDetails.pileName),
    d: common_vendor.t($data.orderDetails.gunName),
    e: $data.orderDetails.billStatus === 11
  }, $data.orderDetails.billStatus === 11 ? {} : {}) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2b5cbeae"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/details.js.map

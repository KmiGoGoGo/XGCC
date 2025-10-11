"use strict";
const common_vendor = require("../../common/vendor.js");
const api_refund = require("../../api/refund.js");
const api_style = require("../../api/style.js");
const _sfc_main = {
  data() {
    return {
      refundAmountInfo: {},
      refundList: [],
      refundInstruction: "",
      customerInfo: {}
    };
  },
  async onLoad() {
    common_vendor.index.showLoading({ title: "加载中..." });
    try {
      const [amountRes, listRes, instructionRes] = await Promise.all([
        api_refund.getRefundAmount(),
        api_refund.getRefundList({ page: 1, pageSize: 10, refundType: 0 }),
        api_style.getStyleContent("REFUND")
        // getStyleConfig(365)
      ]);
      if (amountRes.code === 0)
        this.refundAmountInfo = amountRes.data;
      if (listRes.code === 0)
        this.refundList = listRes.data.rechargeLists;
      if (instructionRes.code === 0)
        this.refundInstruction = instructionRes.data;
    } catch (error) {
      common_vendor.index.__f__("error", "at pages/refund/apply.vue:83", "加载退款页面数据失败", error);
      common_vendor.index.showToast({ title: "数据加载失败", icon: "none" });
    } finally {
      common_vendor.index.hideLoading();
    }
  },
  methods: {
    goToApplyRefundPage() {
      common_vendor.index.navigateTo({
        url: "/pages/refund/applyRefund"
      });
    },
    formatCurrency(amount) {
      if (amount === null || amount === void 0)
        return "0.00";
      return (amount / 100).toFixed(2);
    },
    showRefundInstruction() {
      common_vendor.index.showModal({
        title: "退款说明",
        content: this.refundInstruction || "暂无说明",
        showCancel: false
      });
    },
    contactCustomerService() {
      common_vendor.index.showModal({
        title: "联系客服",
        content: `${this.customerInfo.telephone || ""}
${this.customerInfo.serviceTime || ""}`,
        showCancel: false
      });
    },
    goToRecordsPage() {
      common_vendor.index.navigateTo({
        url: "/pages/refund/records?page=1&pageSize=10"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($options.formatCurrency($data.refundAmountInfo.refundableAmount)),
    b: common_vendor.t($options.formatCurrency($data.refundAmountInfo.nonRefundableAmount)),
    c: common_vendor.o((...args) => $options.goToApplyRefundPage && $options.goToApplyRefundPage(...args)),
    d: common_vendor.o((...args) => $options.goToRecordsPage && $options.goToRecordsPage(...args)),
    e: common_vendor.f($data.refundList, (item, k0, i0) => {
      return {
        a: common_vendor.t($options.formatCurrency(item.balance)),
        b: common_vendor.t(item.time),
        c: common_vendor.t($options.formatCurrency(item.balance)),
        d: item.id
      };
    }),
    f: common_vendor.o((...args) => $options.showRefundInstruction && $options.showRefundInstruction(...args)),
    g: common_vendor.o((...args) => $options.contactCustomerService && $options.contactCustomerService(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7116fa66"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/refund/apply.js.map

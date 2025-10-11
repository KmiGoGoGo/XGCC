"use strict";
const common_vendor = require("../../common/vendor.js");
const api_member = require("../../api/member.js");
const _sfc_main = {
  data() {
    return {
      details: {},
      refundInstruction: "充值赠券活动，优惠券抵扣后不接受退款。（注：1、若仍需退款将计算并扣除优惠券抵扣部分退回；2、仅支持一年内充值订单退款；3、充值优惠活动最终解释权归创烨公司所有）"
    };
  },
  async onLoad(options) {
    if (!options.refundId) {
      common_vendor.index.showToast({ title: "缺少必要参数", icon: "none" });
      return;
    }
    common_vendor.index.showLoading({ title: "加载中..." });
    try {
      const detailsRes = await api_member.getRefundRecordById({ refundId: options.refundId });
      if (detailsRes.code === 0) {
        this.details = detailsRes.data;
      } else {
        common_vendor.index.showToast({ title: detailsRes.msg || "获取详情失败", icon: "none" });
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at pages/refund/details.vue:76", "获取退款详情失败", error);
      common_vendor.index.showToast({ title: "数据加载失败", icon: "none" });
    } finally {
      common_vendor.index.hideLoading();
    }
  },
  methods: {
    formatCurrency(amount) {
      if (amount === null || amount === void 0)
        return "0.00";
      return (amount / 100).toFixed(2);
    },
    formatStatus(status) {
      const statusMap = { "Approve": "退款成功", "Reject": "退款失败", "Pending": "审核中" };
      return statusMap[status] || "未知状态";
    },
    getStatusClass(status) {
      const classMap = { "Approve": "success", "Reject": "fail", "Pending": "pending" };
      return classMap[status] || "";
    },
    showRefundInstruction() {
      common_vendor.index.showModal({
        title: "退款说明",
        content: this.refundInstruction,
        showCancel: false
      });
    },
    contactCustomerService() {
      const phone = this.details.customerTelephone || "4000110328";
      common_vendor.index.makePhoneCall({
        phoneNumber: phone
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($options.formatCurrency($data.details.balance)),
    b: common_vendor.t($options.formatStatus($data.details.checkStatus)),
    c: common_vendor.n($options.getStatusClass($data.details.checkStatus)),
    d: common_vendor.t($data.details.serialNumber || "N/A"),
    e: common_vendor.t($data.details.auditOpinion || "N/A"),
    f: common_vendor.t($data.details.refundBus || "N/A"),
    g: common_vendor.t($data.details.remark || "暂无"),
    h: common_vendor.o((...args) => $options.showRefundInstruction && $options.showRefundInstruction(...args)),
    i: common_vendor.o((...args) => $options.contactCustomerService && $options.contactCustomerService(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-98bb26b5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/refund/details.js.map

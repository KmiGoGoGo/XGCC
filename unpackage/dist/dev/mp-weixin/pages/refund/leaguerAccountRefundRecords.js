"use strict";
const common_vendor = require("../../common/vendor.js");
const api_refund = require("../../api/refund.js");
const _sfc_main = {
  data() {
    return {
      records: []
    };
  },
  async onLoad(options) {
    common_vendor.index.showLoading({ title: "加载中..." });
    try {
      const res = await api_refund.getLeaguerAccountRefundRecordList({
        page: options.page || 1,
        pageSize: options.pageSize || 10
      });
      if (res.code === 0 && res.data) {
        this.records = res.data.records;
      } else {
        common_vendor.index.showToast({ title: res.msg || "获取记录失败", icon: "none" });
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at pages/refund/leaguerAccountRefundRecords.vue:51", "获取退款记录失败", error);
      common_vendor.index.showToast({ title: "网络错误", icon: "none" });
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
      const statusMap = {
        "Approve": "退款成功",
        "Reject": "退款失败",
        "AwatingApproval": "审核中"
      };
      return statusMap[status] || "未知状态";
    },
    formatRefundRoad(refundRoad) {
      const refundRoadMap = {
        "WeChatPay": "微信",
        "Alipay": "支付宝"
      };
      return refundRoadMap[refundRoad] || "未知";
    },
    getStatusClass(status) {
      const classMap = {
        "Approve": "success",
        "Reject": "fail",
        "AwatingApproval": "AwatingApproval"
      };
      return classMap[status] || "";
    },
    goToDetails(refundId) {
      common_vendor.index.navigateTo({
        url: `/pages/refund/details?refundId=${refundId}`
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.records, (item, k0, i0) => {
      return {
        a: common_vendor.t($options.formatRefundRoad(item.refundRoad)),
        b: common_vendor.t($options.formatRefundRoad(item.refundRoad)),
        c: common_vendor.t($options.formatCurrency(item.balance)),
        d: common_vendor.t(item.createTime),
        e: common_vendor.t($options.formatStatus(item.checkStatus)),
        f: common_vendor.n($options.getStatusClass(item.checkStatus)),
        g: item.id,
        h: common_vendor.o(($event) => $options.goToDetails(item.id), item.id)
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-cb56d0d7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/refund/leaguerAccountRefundRecords.js.map

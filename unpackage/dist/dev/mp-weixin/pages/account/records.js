"use strict";
const common_vendor = require("../../common/vendor.js");
const api_member = require("../../api/member.js");
const _sfc_main = {
  data() {
    return {
      stats: null,
      records: [],
      currentMonth: "2025年08月"
    };
  },
  computed: {
    formattedChargeTotal() {
      return this.stats ? this.formatCurrency(this.stats.chargeTotalStr) : "+0.00";
    },
    formattedAwardTotal() {
      return this.stats ? this.formatCurrency(this.stats.awardTotalStr) : "+0.00";
    },
    formattedConsumptionTotal() {
      return this.stats ? this.formatCurrency(this.stats.consumptionTotalStr) : "-0.00";
    },
    formattedRefundTotal() {
      return this.stats ? this.formatCurrency(this.stats.refundTotalStr) : "-0.00";
    }
  },
  async onLoad() {
    common_vendor.index.showLoading({ title: "加载中..." });
    try {
      const date = this.currentMonth.replace("年", "-").replace("月", "");
      const res = await api_member.getAccountFlowPage({
        accountType: "1",
        tab: 1,
        current: 1,
        size: 1e4,
        // Per user request
        date
      });
      if (res.code === 0 && res.data) {
        this.stats = res.data.accountFlowStatisticsMiniVO;
        this.records = res.data.accountFlowMiniVO.records;
      } else {
        common_vendor.index.showToast({ title: res.msg || "获取记录失败", icon: "none" });
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at pages/account/records.vue:101", "获取收支记录失败", error);
      common_vendor.index.showToast({ title: "网络错误", icon: "none" });
    } finally {
      common_vendor.index.hideLoading();
    }
  },
  methods: {
    formatCurrency(amount, keepSign = false) {
      if (amount === null || amount === void 0)
        return keepSign ? "+0.00" : "0.00";
      let num = parseFloat(amount);
      if (isNaN(num)) {
        num = parseFloat(String(amount).substring(1));
      }
      let value = (num / 100).toFixed(2);
      if (keepSign) {
        if (String(amount).startsWith("+"))
          return "+" + value;
        if (String(amount).startsWith("-"))
          return "-" + value;
      }
      return value;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.currentMonth),
    b: $data.stats
  }, $data.stats ? {
    c: common_vendor.t($options.formattedChargeTotal),
    d: common_vendor.t($options.formattedAwardTotal),
    e: common_vendor.t($options.formattedConsumptionTotal),
    f: common_vendor.t($options.formattedRefundTotal)
  } : {}, {
    g: common_vendor.f($data.records, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.eventNameStr),
        b: common_vendor.t($options.formatCurrency(item.amountChange, true)),
        c: item.amountChange.startsWith("+") ? 1 : "",
        d: item.amountChange.startsWith("-") ? 1 : "",
        e: common_vendor.t($options.formatCurrency(item.accountBalance)),
        f: common_vendor.t(item.createTime),
        g: item.id
      };
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1fe94d16"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/account/records.js.map

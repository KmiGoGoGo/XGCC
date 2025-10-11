"use strict";
const common_vendor = require("../../common/vendor.js");
const api_integral = require("../../api/integral.js");
const _sfc_main = {
  data() {
    return {
      integralInfo: null,
      gradeRule: null,
      integralDetails: []
    };
  },
  computed: {
    formattedIntegral() {
      return this.integralInfo ? this.integralInfo.consumeIntegral : "0";
    }
  },
  onLoad() {
    this.loadPageData();
  },
  methods: {
    /**
     * @description 并行加载页面所需的所有数据
     */
    async loadPageData() {
      common_vendor.index.showLoading({
        title: "加载中..."
      });
      try {
        const [integralRes, gradeRuleRes, detailsRes] = await Promise.all([
          api_integral.getIntegral(),
          api_integral.getMemberGradeRule(),
          api_integral.getIntegralDetail({ current: 1, size: 10 })
        ]);
        if (integralRes.code === 0) {
          this.integralInfo = integralRes.data;
        }
        if (gradeRuleRes.code === 0) {
          this.gradeRule = gradeRuleRes.data;
        }
        if (detailsRes.code === 0) {
          this.integralDetails = detailsRes.data.records;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/integral/index.vue:84", "加载积分数据失败:", error);
        common_vendor.index.showToast({
          title: "数据加载失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    /**
     * @description 将数值格式化为带两位小数的字符串
     * @param {number} value - 需要格式化的数值
     * @returns {string}
     */
    formatToDecimal(value) {
      if (typeof value !== "number") {
        return "0.00";
      }
      return (value / 1e3).toFixed(2);
    },
    /**
     * @description 跳转到积分明细页面
     */
    goToDetailsPage() {
      common_vendor.index.navigateTo({
        url: "/pages/integral/details"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($options.formattedIntegral),
    b: common_vendor.o((...args) => $options.goToDetailsPage && $options.goToDetailsPage(...args)),
    c: common_vendor.f($data.integralDetails, (item, k0, i0) => {
      return {
        a: common_vendor.t($options.formatToDecimal(item.sumIntegral)),
        b: common_vendor.t($options.formatToDecimal(item.integralChange)),
        c: common_vendor.t(item.createTime),
        d: item.id
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-13c05ee2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/integral/index.js.map

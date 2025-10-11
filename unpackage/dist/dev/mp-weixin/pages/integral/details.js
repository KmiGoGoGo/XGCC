"use strict";
const common_vendor = require("../../common/vendor.js");
const api_integral = require("../../api/integral.js");
const _sfc_main = {
  data() {
    return {
      tabs: [
        { name: "全部", type: null },
        { name: "增加", type: 1 },
        { name: "扣减", type: 2 }
      ],
      activeTab: null,
      // null-全部, 1-增加, 2-扣减
      detailsList: [],
      summary: {
        positive: 0,
        negative: 0
      },
      pagination: {
        current: 1,
        size: 20,
        total: 0
      }
    };
  },
  onLoad() {
    this.loadData();
  },
  methods: {
    /**
     * @description 切换筛选标签
     * @param {number|null} type - 标签类型
     */
    changeTab(type) {
      this.activeTab = type;
      this.resetAndLoad();
    },
    /**
     * @description 重置数据并重新加载
     */
    resetAndLoad() {
      this.detailsList = [];
      this.pagination.current = 1;
      this.loadData();
    },
    /**
     * @description 加载所有数据
     */
    async loadData() {
      common_vendor.index.showLoading({ title: "加载中..." });
      try {
        const params = {
          current: this.pagination.current,
          size: this.pagination.size,
          type: this.activeTab,
          startTime: null,
          // 可扩展
          endTime: null
          // 可扩展
        };
        const [detailsRes, sumRes] = await Promise.all([
          api_integral.getIntegralDetail(params),
          api_integral.getIntegralSum({ startTime: params.startTime, endTime: params.endTime })
        ]);
        if (detailsRes.code === 0) {
          this.detailsList = [...this.detailsList, ...detailsRes.data.records];
          this.pagination.total = detailsRes.data.total;
        }
        if (sumRes.code === 0) {
          this.summary = sumRes.data;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/integral/details.vue:117", "加载积分明细数据失败:", error);
        common_vendor.index.showToast({ title: "数据加载失败", icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    /**
     * @description 格式化数值，除以1000并保留两位小数
     * @param {number} value
     * @returns {string}
     */
    formatValue(value) {
      if (typeof value !== "number")
        return "0.00";
      return (value / 1e3).toFixed(2);
    }
  },
  // 页面触底加载更多
  onReachBottom() {
    if (this.detailsList.length < this.pagination.total) {
      this.pagination.current++;
      this.loadData();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.tabs, (tab, k0, i0) => {
      return {
        a: common_vendor.t(tab.name),
        b: $data.activeTab === tab.type ? 1 : "",
        c: tab.type,
        d: common_vendor.o(($event) => $options.changeTab(tab.type), tab.type)
      };
    }),
    b: common_vendor.t($options.formatValue($data.summary.positive)),
    c: common_vendor.t($options.formatValue($data.summary.negative)),
    d: common_vendor.f($data.detailsList, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.remark || "消费"),
        b: common_vendor.t(item.createTime),
        c: common_vendor.t(item.integralChange > 0 ? "+" : ""),
        d: common_vendor.t($options.formatValue(item.integralChange)),
        e: common_vendor.n(item.integralChange > 0 ? "increase" : "decrease"),
        f: item.id
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9aee1992"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/integral/details.js.map

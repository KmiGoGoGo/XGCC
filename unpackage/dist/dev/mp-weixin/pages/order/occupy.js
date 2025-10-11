"use strict";
const common_vendor = require("../../common/vendor.js");
const api_bill = require("../../api/bill.js");
const _sfc_main = {
  data() {
    return {
      orderList: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      }
    };
  },
  onLoad() {
    this.loadData();
  },
  methods: {
    /**
     * @description 加载占位订单数据
     */
    async loadData() {
      common_vendor.index.showLoading({ title: "加载中..." });
      try {
        const res = await api_bill.getMyOccupyBillPage({
          current: this.pagination.current,
          pageSize: this.pagination.pageSize
        });
        if (res.code === 0) {
          this.orderList = [...this.orderList, ...res.data.records];
          this.pagination.total = res.data.total;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/occupy.vue:63", "加载占位订单数据失败:", error);
        common_vendor.index.showToast({ title: "数据加载失败", icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    /**
     * @description 格式化金额 (分 -> 元)
     */
    formatAmount(amount) {
      if (typeof amount !== "number")
        return "0.00";
      return (amount / 100).toFixed(2);
    },
    /**
     * @description 根据账单状态获取状态文本
     * @param {number} status - 账单状态码
     */
    getStatusText(status) {
      switch (status) {
        case 11:
          return "待支付";
        case 14:
          return "已支付";
        default:
          return "未知";
      }
    },
    /**
     * @description 根据账单状态获取状态样式类
     * @param {number} status - 账单状态码
     */
    getStatusClass(status) {
      switch (status) {
        case 11:
          return "status-unpaid";
        case 14:
          return "status-paid";
        default:
          return "";
      }
    },
    /**
     * @description 跳转到订单详情页面
     * @param {number} id - 订单ID
     */
    goToDetails(id) {
      common_vendor.index.navigateTo({
        url: `/pages/bill/occupyBillPay?id=${id}`
      });
    }
  },
  onReachBottom() {
    if (this.orderList.length < this.pagination.total) {
      this.pagination.current++;
      this.loadData();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.orderList, (order, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(order.stationName),
        b: common_vendor.t($options.getStatusText(order.billStatus)),
        c: common_vendor.n($options.getStatusClass(order.billStatus)),
        d: common_vendor.t(order.pileName),
        e: common_vendor.t(order.gunName),
        f: common_vendor.t(order.actualDuration),
        g: common_vendor.t($options.formatAmount(order.busBalance)),
        h: order.billStatus === 11
      }, order.billStatus === 11 ? {
        i: common_vendor.o(($event) => $options.goToDetails(order.id), order.id)
      } : {}, {
        j: order.id,
        k: common_vendor.o(($event) => $options.goToDetails(order.id), order.id)
      });
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-18a8df7f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/occupy.js.map

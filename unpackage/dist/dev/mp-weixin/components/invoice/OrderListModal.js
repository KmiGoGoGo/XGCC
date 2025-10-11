"use strict";
const common_vendor = require("../../common/vendor.js");
const api_invoice = require("../../api/invoice.js");
const _sfc_main = {
  name: "OrderListModal",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    billIds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      orderList: []
    };
  },
  watch: {
    visible(newVal) {
      if (newVal && this.billIds.length > 0) {
        this.loadOrderList();
      }
    }
  },
  methods: {
    // 加载订单列表
    async loadOrderList() {
      if (this.billIds.length === 0)
        return;
      this.loading = true;
      try {
        const ids = this.billIds.map((item) => item.id);
        const response = await api_invoice.getInvoiceBillList({ "billIds": ids });
        common_vendor.index.__f__("log", "at components/invoice/OrderListModal.vue:79", "订单列表响应:", response);
        if (response.code === 0) {
          this.orderList = response.data || [];
        } else {
          common_vendor.index.showToast({
            title: response.msg || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at components/invoice/OrderListModal.vue:90", "加载订单列表失败:", error);
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
      } finally {
        this.loading = false;
      }
    },
    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr)
        return "";
      const date = new Date(timeStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
    },
    // 关闭弹窗
    closeModal() {
      this.$emit("close");
    }
  }
};
if (!Array) {
  const _easycom_uv_icon2 = common_vendor.resolveComponent("uv-icon");
  const _easycom_uv_loading_icon2 = common_vendor.resolveComponent("uv-loading-icon");
  (_easycom_uv_icon2 + _easycom_uv_loading_icon2)();
}
const _easycom_uv_icon = () => "../../uni_modules/uv-icon/components/uv-icon/uv-icon.js";
const _easycom_uv_loading_icon = () => "../../uni_modules/uv-loading-icon/components/uv-loading-icon/uv-loading-icon.js";
if (!Math) {
  (_easycom_uv_icon + _easycom_uv_loading_icon)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.visible
  }, $props.visible ? common_vendor.e({
    b: common_vendor.p({
      name: "close",
      color: "#999",
      size: "32rpx"
    }),
    c: common_vendor.o((...args) => $options.closeModal && $options.closeModal(...args)),
    d: $data.loading
  }, $data.loading ? {
    e: common_vendor.p({
      text: "加载中...",
      textSize: "28rpx"
    })
  } : $data.orderList.length === 0 ? {} : {
    g: common_vendor.f($data.orderList, (item, index, i0) => {
      return {
        a: common_vendor.t(item.busId),
        b: common_vendor.t($options.formatTime(item.createTime)),
        c: common_vendor.t((item.actualBalance / 100).toFixed(2)),
        d: index
      };
    })
  }, {
    f: $data.orderList.length === 0,
    h: common_vendor.o(() => {
    }),
    i: common_vendor.o((...args) => $options.closeModal && $options.closeModal(...args))
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-54611516"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/invoice/OrderListModal.js.map

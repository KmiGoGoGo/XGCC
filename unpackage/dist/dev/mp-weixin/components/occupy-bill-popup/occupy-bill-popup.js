"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "OccupyBillPopup",
  props: {
    billData: {
      type: Object,
      default: () => null
    }
  },
  computed: {
    // 格式化时间
    formattedTime() {
      var _a;
      if (!((_a = this.billData) == null ? void 0 : _a.timeS)) {
        return "2025.08.20 16:07:10";
      }
      const date = new Date(this.billData.timeS);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
    },
    // 格式化费用（分转元）
    formattedFee() {
      var _a;
      if (!((_a = this.billData) == null ? void 0 : _a.busBalance)) {
        return "0.40";
      }
      return (this.billData.busBalance / 100).toFixed(2);
    },
    // 计算超时占位时长
    occupyDuration() {
      var _a;
      if (!((_a = this.billData) == null ? void 0 : _a.actualDuration)) {
        return "4";
      }
      return this.billData.actualDuration.toString();
    },
    // 总订单数量
    totalCount() {
      var _a;
      return ((_a = this.billData) == null ? void 0 : _a.totalCount) || 2;
    }
  },
  methods: {
    // 显示弹窗
    show() {
      this.$refs.popup.open();
    },
    // 隐藏弹窗
    hide() {
      this.$refs.popup.close();
    },
    // 处理关闭事件
    handleClose() {
      this.hide();
      this.$emit("close");
    },
    // 处理稍后再说
    handleLater() {
      this.hide();
      this.$emit("later");
    },
    // 处理立即支付
    handlePay() {
      this.hide();
      this.$emit("pay", this.billData);
    }
  }
};
if (!Array) {
  const _easycom_uv_icon2 = common_vendor.resolveComponent("uv-icon");
  const _easycom_uv_popup2 = common_vendor.resolveComponent("uv-popup");
  (_easycom_uv_icon2 + _easycom_uv_popup2)();
}
const _easycom_uv_icon = () => "../../uni_modules/uv-icon/components/uv-icon/uv-icon.js";
const _easycom_uv_popup = () => "../../uni_modules/uv-popup/components/uv-popup/uv-popup.js";
if (!Math) {
  (_easycom_uv_icon + _easycom_uv_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a;
  return {
    a: common_vendor.p({
      name: "close",
      size: "20",
      color: "#999"
    }),
    b: common_vendor.o((...args) => $options.handleClose && $options.handleClose(...args)),
    c: common_vendor.t($options.totalCount),
    d: common_vendor.t(((_a = $props.billData) == null ? void 0 : _a.stationName) || "节能测试站"),
    e: common_vendor.t($options.formattedTime),
    f: common_vendor.t($options.occupyDuration),
    g: common_vendor.t($options.formattedFee),
    h: common_vendor.o((...args) => $options.handleLater && $options.handleLater(...args)),
    i: common_vendor.o((...args) => $options.handlePay && $options.handlePay(...args)),
    j: common_vendor.sr("popup", "d9014ad8-0"),
    k: common_vendor.o($options.handleClose),
    l: common_vendor.p({
      mode: "center",
      width: 600,
      height: 520,
      round: 20,
      maskCloseAble: false
    })
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d9014ad8"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/occupy-bill-popup/occupy-bill-popup.js.map

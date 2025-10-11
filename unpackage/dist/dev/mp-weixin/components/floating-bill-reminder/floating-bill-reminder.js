"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "FloatingBillReminder",
  props: {
    billCount: {
      type: Number,
      default: 0
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick() {
      this.$emit("click");
      common_vendor.index.navigateTo({
        url: "/pages/bill/billList"
        // 根据实际的账单列表页面路径调整
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.visible
  }, $props.visible ? {
    b: common_vendor.t($props.billCount),
    c: common_vendor.o((...args) => $options.handleClick && $options.handleClick(...args))
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-909ddfee"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/floating-bill-reminder/floating-bill-reminder.js.map

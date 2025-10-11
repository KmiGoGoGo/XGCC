"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  props: {
    priceInfo: {
      type: Object,
      default: () => ({})
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($props.priceInfo.currentStartTime),
    b: common_vendor.t($props.priceInfo.currentEndTime),
    c: $props.priceInfo.discount
  }, $props.priceInfo.discount ? {
    d: common_vendor.t($props.priceInfo.sweepPriceStr)
  } : {}, {
    e: common_vendor.t($props.priceInfo.currentPriceStr),
    f: $props.priceInfo.discount
  }, $props.priceInfo.discount ? {
    g: common_vendor.t($props.priceInfo.sweepPowerPriceStr)
  } : {}, {
    h: common_vendor.t($props.priceInfo.currentPowerPriceStr),
    i: $props.priceInfo.discount
  }, $props.priceInfo.discount ? {
    j: common_vendor.t($props.priceInfo.sweepServicePriceStr)
  } : {}, {
    k: common_vendor.t($props.priceInfo.currentServicePriceStr),
    l: $props.priceInfo.discount
  }, $props.priceInfo.discount ? {} : {}, {
    m: $props.priceInfo.now ? 1 : ""
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4380356d"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/station/StagePriceInfo.js.map

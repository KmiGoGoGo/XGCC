"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "PriceInfo",
  props: {
    // 充电类型
    chargeType: {
      type: String,
      required: true
    },
    // 时间范围
    timeRange: {
      type: String,
      required: true
    },
    // 当前价格
    currentPrice: {
      type: [String, Number],
      required: true
    },
    // 电费价格
    electricPrice: {
      type: [String, Number],
      required: true
    },
    // 服务费价格
    servicePrice: {
      type: [String, Number],
      required: true
    },
    gunCount: {
      type: [Number],
      required: true
    },
    freeGunCount: {
      type: [Number],
      required: true
    },
    // 折扣价格字符串
    discountPriceStr: {
      type: [String, Number],
      default: ""
    }
  },
  computed: {
    // 是否有折扣价格
    hasDiscountPrice() {
      return this.discountPriceStr && this.discountPriceStr !== "" && this.discountPriceStr !== "0.00";
    },
    // 根据空闲枪数量计算颜色
    freeGunColorClass() {
      const freeCount = this.freeGunCount || 0;
      const totalCount = this.gunCount || 1;
      if (freeCount === 0) {
        return "gun-count-red";
      }
      if (freeCount >= 5 || freeCount >= Math.ceil(totalCount / 2)) {
        return "gun-count-green";
      }
      return "gun-count-yellow";
    }
  }
};
if (!Array) {
  const _easycom_uv_tags2 = common_vendor.resolveComponent("uv-tags");
  _easycom_uv_tags2();
}
const _easycom_uv_tags = () => "../../uni_modules/uv-tags/components/uv-tags/uv-tags.js";
if (!Math) {
  _easycom_uv_tags();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      text: $props.chargeType,
      type: $props.chargeType === "快" ? "error" : $props.chargeType === "超" ? "primary" : "success"
    }),
    b: common_vendor.t($props.freeGunCount),
    c: common_vendor.n($options.freeGunColorClass),
    d: common_vendor.t($props.gunCount),
    e: common_vendor.t($props.timeRange),
    f: $options.hasDiscountPrice
  }, $options.hasDiscountPrice ? {
    g: common_vendor.t($props.discountPriceStr),
    h: common_vendor.t($props.currentPrice)
  } : {
    i: common_vendor.t($props.currentPrice)
  }, {
    j: common_vendor.t($props.electricPrice),
    k: common_vendor.t($props.servicePrice)
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-353c7449"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/station/PriceInfo.js.map

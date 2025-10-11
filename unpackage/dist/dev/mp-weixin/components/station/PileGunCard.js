"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  props: {
    gunData: {
      type: Object,
      required: true
    },
    stationName: {
      type: String,
      default: ""
    }
  },
  computed: {
    chargeTypeStr() {
      if (this.gunData.gunIsSuper || this.gunData.powerMode === 3) {
        return "超充";
      }
      switch (this.gunData.powerMode) {
        case 1:
          return "慢充";
        case 2:
          return "快充";
        default:
          return "未知类型";
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($props.stationName),
    b: common_vendor.t($props.gunData.pilename),
    c: common_vendor.t($props.gunData.currentMode),
    d: common_vendor.t($options.chargeTypeStr),
    e: common_vendor.t($props.gunData.ratedPower)
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f21bc79f"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/station/PileGunCard.js.map

"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  props: {
    pileInfo: {
      type: Object,
      required: true
    },
    mainGunState: {
      type: Number,
      required: true
    }
  },
  computed: {
    statusTitle() {
      switch (this.mainGunState) {
        case 2:
          return "充电中";
        case 4:
          return "离线";
        default:
          return "设备占用";
      }
    },
    statusDescription() {
      switch (this.mainGunState) {
        case 2:
          return "当前设备正在使用中，暂时无法使用，请更换其他电枪或电桩！";
        case 4:
          return "当前充电设备已经离线，暂时无法使用，请更换其他电枪或者电桩！";
        default:
          return "当前设备正被占用，暂时无法使用，请更换其他电枪或电桩！";
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($props.pileInfo.stationName),
    b: common_vendor.t($props.pileInfo.pileName),
    c: common_vendor.t($props.pileInfo.pileNo),
    d: common_vendor.t($options.statusTitle),
    e: common_vendor.t($options.statusDescription)
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-385f427b"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/charge/ChargeBusyView.js.map

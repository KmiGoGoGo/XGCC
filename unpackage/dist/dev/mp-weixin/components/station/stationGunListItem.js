"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  props: {
    gunInfo: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    /**
     * @description: 枪状态文字
     */
    gunStateStr() {
      switch (this.gunInfo.gunState) {
        case 1:
          return "空闲";
        case 3:
          return `${this.gunInfo.currentSOC}%`;
        case 2:
          return "充电准备";
        case 5:
          return "离线";
        case 6:
          return "枪锁定";
        default:
          return "未知";
      }
    },
    /**
     * @description: 枪状态样式
     */
    gunStateClass() {
      switch (this.gunInfo.gunState) {
        case 1:
          return "free";
        case 3:
          return "charging";
        case 2:
          return "ready";
        case 5:
          return "offline";
        case 6:
          return "locked";
        default:
          return "";
      }
    },
    /**
     * @description: 枪类型文字
     */
    gunTypeStr() {
      switch (this.gunInfo.gunType) {
        case 1:
          return "快充";
        case 2:
          return "慢充";
        case 3:
          return "超充";
        default:
          return "未知";
      }
    },
    /**
     * @description: 枪输出电流类型文字
     */
    gunCurrentTypeStr() {
      switch (this.gunInfo.gunType) {
        case 1:
        case 3:
          return "直流";
        case 2:
          return "交流";
        default:
          return "未知";
      }
    }
  },
  methods: {
    handleClick() {
      this.$emit("click");
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
  return {
    a: common_vendor.t($options.gunStateStr),
    b: common_vendor.n($options.gunStateClass),
    c: common_vendor.t($props.gunInfo.gunName),
    d: common_vendor.p({
      text: $options.gunTypeStr,
      size: "mini",
      plain: true,
      plainFill: true
    }),
    e: common_vendor.p({
      text: $options.gunCurrentTypeStr,
      size: "mini",
      plain: true,
      plainFill: true
    }),
    f: common_vendor.p({
      text: $props.gunInfo.maxPower + "kW",
      size: "mini",
      plain: true,
      plainFill: true
    }),
    g: common_vendor.t($props.gunInfo.currentPriceStr),
    h: common_vendor.t($props.gunInfo.currentPowerPriceStr),
    i: common_vendor.t($props.gunInfo.currentServicePriceStr),
    j: common_vendor.o((...args) => $options.handleClick && $options.handleClick(...args))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1deef733"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/station/stationGunListItem.js.map

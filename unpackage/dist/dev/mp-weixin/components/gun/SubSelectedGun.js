"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "SubSelectedGun",
  props: {
    // 枪信息对象
    gunInfo: {
      type: Object,
      default: null
    },
    // 站台名称
    stationName: {
      type: String,
      default: ""
    },
    // 自定义标题
    customTitle: {
      type: String,
      default: ""
    },
    // 是否显示删除按钮
    showDeleteBtn: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    // 枪标题
    gunTitle() {
      if (this.customTitle) {
        return this.customTitle;
      }
      return `${this.gunInfo.gunName}`;
    }
  },
  methods: {
    // 获取枪类型文本
    getGunTypeText(gunType) {
      switch (parseInt(gunType)) {
        case 3:
          return "超充";
        case 2:
          return "快充";
        case 1:
          return "慢充";
        default:
          return "未知";
      }
    },
    getGunStateText(gunState) {
      switch (parseInt(gunState)) {
        case 1:
          return "请插枪";
        case 2:
          return "等待启动充电";
        default:
          return "未知";
      }
    },
    // 处理删除按钮点击
    handleDelete() {
      this.$emit("delete");
    }
  }
};
if (!Array) {
  const _easycom_uv_tags2 = common_vendor.resolveComponent("uv-tags");
  const _easycom_uv_loading_icon2 = common_vendor.resolveComponent("uv-loading-icon");
  const _easycom_uv_divider2 = common_vendor.resolveComponent("uv-divider");
  (_easycom_uv_tags2 + _easycom_uv_loading_icon2 + _easycom_uv_divider2)();
}
const _easycom_uv_tags = () => "../../uni_modules/uv-tags/components/uv-tags/uv-tags.js";
const _easycom_uv_loading_icon = () => "../../uni_modules/uv-loading-icon/components/uv-loading-icon/uv-loading-icon.js";
const _easycom_uv_divider = () => "../../uni_modules/uv-divider/components/uv-divider/uv-divider.js";
if (!Math) {
  (_easycom_uv_tags + _easycom_uv_loading_icon + _easycom_uv_divider)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.gunInfo
  }, $props.gunInfo ? {
    b: common_vendor.t($options.gunTitle),
    c: common_vendor.t($props.stationName),
    d: common_vendor.p({
      type: "primary",
      size: "mini",
      shape: "circle",
      plain: true,
      plainFill: true,
      text: $options.getGunTypeText($props.gunInfo.powerMode)
    }),
    e: common_vendor.p({
      type: "primary",
      size: "mini",
      shape: "circle",
      plainFill: true,
      plain: true,
      text: $props.gunInfo.currentMode
    }),
    f: common_vendor.p({
      ["timing-function"]: "linear"
    }),
    g: common_vendor.t($props.gunInfo.maxPower),
    h: common_vendor.p({
      bgColor: $options.getGunStateText($props.gunInfo.gunState) === "请插枪" ? "#A0CFFF" : "#54C51D",
      shape: "circle",
      borderColor: $options.getGunStateText($props.gunInfo.gunState) === "请插枪" ? "#A0CFFF" : "#54C51D",
      text: $options.getGunStateText($props.gunInfo.gunState)
    })
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a32e0942"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/gun/SubSelectedGun.js.map

"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "CustomNavbar",
  props: {
    // 导航栏标题
    title: {
      type: String,
      default: ""
    },
    // 背景颜色
    bgColor: {
      type: String,
      default: "#1890FF"
    },
    // 左边返回图标的名称
    leftIcon: {
      type: String,
      default: "arrow-left"
    },
    // 左边的提示文字
    leftText: {
      type: String,
      default: ""
    },
    // 右边的提示文字
    rightText: {
      type: String,
      default: ""
    },
    // 右边返回图标的名称
    rightIcon: {
      type: String,
      default: ""
    },
    // 左侧返回图标的大小
    leftIconSize: {
      type: [String, Number],
      default: 20
    },
    // 左侧返回图标的颜色
    leftIconColor: {
      type: String,
      default: "#ffffff"
    },
    // 标题的样式
    titleStyle: {
      type: [String, Object],
      default: () => ({
        color: "#ffffff",
        fontSize: "18px",
        fontWeight: "bold"
      })
    },
    // 导航栏高度(不包括状态栏高度在内)
    height: {
      type: [String, Number],
      default: 44
    },
    // 点击左侧区域(返回图标)，是否自动返回上一页
    autoBack: {
      type: Boolean,
      default: true
    },
    // 导航栏是否固定在顶部
    fixed: {
      type: Boolean,
      default: true
    },
    // 是否开启顶部安全区适配
    safeAreaInsetTop: {
      type: Boolean,
      default: true
    },
    // 固定在顶部时，是否生成一个等高元素，以防止塌陷
    placeholder: {
      type: Boolean,
      default: true
    },
    // 导航栏底部是否显示下边框
    border: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    // 处理左侧点击事件
    handleLeftClick() {
      this.$emit("leftClick");
    },
    // 处理右侧点击事件
    handleRightClick() {
      this.$emit("rightClick");
    }
  }
};
if (!Array) {
  const _easycom_uv_navbar2 = common_vendor.resolveComponent("uv-navbar");
  _easycom_uv_navbar2();
}
const _easycom_uv_navbar = () => "../../uni_modules/uv-navbar/components/uv-navbar/uv-navbar.js";
if (!Math) {
  _easycom_uv_navbar();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: _ctx.$slots.left
  }, _ctx.$slots.left ? {} : {}, {
    b: _ctx.$slots.center
  }, _ctx.$slots.center ? {} : {}, {
    c: _ctx.$slots.right
  }, _ctx.$slots.right ? {} : {}, {
    d: common_vendor.o($options.handleLeftClick),
    e: common_vendor.o($options.handleRightClick),
    f: common_vendor.p({
      title: $props.title,
      bgColor: $props.bgColor,
      leftIcon: $props.leftIcon,
      leftText: $props.leftText,
      rightText: $props.rightText,
      rightIcon: $props.rightIcon,
      leftIconSize: $props.leftIconSize,
      leftIconColor: $props.leftIconColor,
      titleStyle: $props.titleStyle,
      height: $props.height,
      autoBack: $props.autoBack,
      fixed: $props.fixed,
      safeAreaInsetTop: $props.safeAreaInsetTop,
      placeholder: $props.placeholder,
      border: $props.border
    })
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-94e9cc56"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/custom-navbar/custom-navbar.js.map

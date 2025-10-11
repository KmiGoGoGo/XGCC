"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "Card",
  props: {
    // 自定义边距
    margin: {
      type: String,
      default: "15rpx 0 15rpx 0"
    },
    // 自定义内边距
    padding: {
      type: String,
      default: "36rpx"
    },
    // 自定义圆角
    borderRadius: {
      type: String,
      default: "16rpx"
    },
    // 自定义阴影
    boxShadow: {
      type: String,
      default: "0 4rpx 12rpx rgba(0, 0, 0, 0.06)"
    },
    // 自定义背景色
    backgroundColor: {
      type: String,
      default: "#ffffff"
    },
    // 是否可点击
    clickable: {
      type: Boolean,
      default: false
    },
    // 自定义类名
    customClass: {
      type: String,
      default: ""
    }
  },
  computed: {
    cardClass() {
      return {
        "card-clickable": this.clickable,
        [this.customClass]: this.customClass
      };
    },
    cardStyle() {
      return {
        margin: this.margin,
        padding: this.padding,
        borderRadius: this.borderRadius,
        boxShadow: this.boxShadow,
        backgroundColor: this.backgroundColor
      };
    }
  },
  methods: {
    handleClick(event) {
      if (this.clickable) {
        this.$emit("click", event);
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.n($options.cardClass),
    b: common_vendor.s($options.cardStyle),
    c: common_vendor.o((...args) => $options.handleClick && $options.handleClick(...args))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-aea130cd"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/common/Card.js.map

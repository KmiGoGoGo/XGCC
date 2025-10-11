"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "LoginPopup",
  data() {
    return {
      pactChecked: [true]
    };
  },
  methods: {
    open() {
      this.$refs.popup.open();
    },
    close() {
      this.$refs.popup.close();
    },
    handleClose() {
      this.$emit("close");
    },
    login() {
      common_vendor.index.showToast({
        title: "登录",
        icon: "none"
      });
    },
    toRegister() {
      this.close();
      common_vendor.index.redirectTo({
        url: "./register"
      });
    },
    pactChange(e) {
      common_vendor.index.__f__("log", "at components/login-popup/login.vue:78", e);
      this.pactChecked = e.detail.value;
    },
    toPact() {
      common_vendor.index.showToast({
        title: "协议",
        icon: "none"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {};
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-382b0f3a"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/login-popup/login.js.map

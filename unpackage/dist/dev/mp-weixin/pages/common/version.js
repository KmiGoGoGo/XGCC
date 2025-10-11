"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  methods: {
    goToService() {
      common_vendor.index.navigateTo({
        url: "/pages/common/service"
      });
    },
    goToPrivacy() {
      common_vendor.index.navigateTo({
        url: "/pages/common/privacy"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: common_vendor.o((...args) => $options.goToService && $options.goToService(...args)),
    c: common_vendor.o((...args) => $options.goToPrivacy && $options.goToPrivacy(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a06315ff"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/common/version.js.map

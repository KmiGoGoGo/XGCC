"use strict";
const common_vendor = require("../../common/vendor.js");
const api_member = require("../../api/member.js");
const _sfc_main = {
  methods: {
    goToVersion() {
      common_vendor.index.navigateTo({
        url: "/pages/common/version"
      });
    },
    async handleLogout() {
      try {
        const res = await api_member.logout();
        if (res.code === 0) {
          common_vendor.index.navigateTo({
            url: "/pages/index/index"
          });
          common_vendor.index.removeStorageSync("token");
          common_vendor.index.removeStorageSync("phoneNo");
          common_vendor.index.removeStorageSync("openId");
          common_vendor.index.removeStorageSync("newMember");
          common_vendor.index.removeStorageSync("accessToken");
          common_vendor.index.removeStorageSync("memberInfo");
          common_vendor.index.removeStorageSync("deductMode");
          common_vendor.index.removeStorageSync("tokenMemberType");
        } else {
          common_vendor.index.showToast({
            title: res.message || "退出登录失败",
            icon: "error"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/common/settings.vue:52", "退出登录失败:", error);
        common_vendor.index.showToast({
          title: "退出登录失败",
          icon: "error"
        });
      }
    }
  }
};
if (!Array) {
  const _easycom_uv_button2 = common_vendor.resolveComponent("uv-button");
  _easycom_uv_button2();
}
const _easycom_uv_button = () => "../../uni_modules/uv-button/components/uv-button/uv-button.js";
if (!Math) {
  _easycom_uv_button();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goToVersion && $options.goToVersion(...args)),
    b: common_vendor.index.getStorage("token")
  }, common_vendor.index.getStorage("token") ? {
    c: common_vendor.o($options.handleLogout),
    d: common_vendor.p({
      type: "error",
      shape: "circle",
      text: "退出登录"
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c220e033"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/common/settings.js.map

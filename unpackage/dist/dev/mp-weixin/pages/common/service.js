"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 这里是需要您填写的变量
      appName: "超易充",
      // 应用名称
      companyName: "光烨科技",
      // 公司名称
      customerServicePhone: "020-32163681"
      // 客服电话
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.appName),
    b: common_vendor.t($data.companyName),
    c: common_vendor.t($data.appName),
    d: common_vendor.t($data.companyName),
    e: common_vendor.t($data.appName),
    f: common_vendor.t($data.appName),
    g: common_vendor.t($data.companyName),
    h: common_vendor.t($data.appName),
    i: common_vendor.t($data.appName),
    j: common_vendor.t($data.appName),
    k: common_vendor.t($data.appName),
    l: common_vendor.t($data.customerServicePhone)
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-40cd6601"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/common/service.js.map

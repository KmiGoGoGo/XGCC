"use strict";
const common_vendor = require("../../common/vendor.js");
const UnInvoiceList = () => "../../components/invoice/UnInvoiceList.js";
const InvoiceRecordList = () => "../../components/invoice/InvoiceRecordList.js";
const _sfc_main = {
  name: "InvoicePage",
  components: {
    UnInvoiceList,
    InvoiceRecordList
  },
  data() {
    return {
      // Tab配置
      tabList: [
        { name: "未开发票" },
        { name: "发票记录" }
      ],
      currentTab: 0
    };
  },
  methods: {
    // Tab切换
    onTabChange(index) {
      common_vendor.index.__f__("log", "at pages/invoice/invoice.vue:58", "onTabChange", index.index);
      this.currentTab = index.index;
      this.$nextTick(() => {
        if (index.index === 0 && this.$refs.unInvoiceRef) {
          this.$refs.unInvoiceRef.refresh();
        } else if (index.index === 1 && this.$refs.invoiceRecordRef) {
          this.$refs.invoiceRecordRef.refresh();
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_uv_tabs2 = common_vendor.resolveComponent("uv-tabs");
  const _component_UnInvoiceList = common_vendor.resolveComponent("UnInvoiceList");
  const _component_InvoiceRecordList = common_vendor.resolveComponent("InvoiceRecordList");
  (_easycom_uv_tabs2 + _component_UnInvoiceList + _component_InvoiceRecordList)();
}
const _easycom_uv_tabs = () => "../../uni_modules/uv-tabs/components/uv-tabs/uv-tabs.js";
if (!Math) {
  _easycom_uv_tabs();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($options.onTabChange),
    b: common_vendor.p({
      list: $data.tabList,
      current: $data.currentTab,
      scrollable: false,
      activeStyle: {
        color: "#007AFF",
        fontWeight: "bold"
      },
      inactiveStyle: {
        color: "#666"
      },
      lineColor: "#007AFF",
      itemStyle: {
        height: "88rpx"
      }
    }),
    c: $data.currentTab === 0
  }, $data.currentTab === 0 ? {
    d: common_vendor.sr("unInvoiceRef", "173c115b-1")
  } : {}, {
    e: $data.currentTab === 1
  }, $data.currentTab === 1 ? {
    f: common_vendor.sr("invoiceRecordRef", "173c115b-2")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-173c115b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/invoice/invoice.js.map

"use strict";
const common_vendor = require("../../common/vendor.js");
const api_invoice = require("../../api/invoice.js");
const OrderListModal = () => "../../components/invoice/OrderListModal.js";
const _sfc_main = {
  name: "InvoiceDetail",
  components: {
    OrderListModal
  },
  data() {
    return {
      invoiceId: null,
      loading: false,
      detailData: {},
      showOrderModal: false
    };
  },
  onLoad(options) {
    if (options.id) {
      this.invoiceId = options.id;
      this.loadInvoiceDetail();
    }
  },
  methods: {
    // 加载发票详情
    async loadInvoiceDetail() {
      if (!this.invoiceId)
        return;
      this.loading = true;
      try {
        const response = await api_invoice.queryInvoiceDetailById(this.invoiceId);
        common_vendor.index.__f__("log", "at pages/invoice/invoiceDetail.vue:120", "发票详情:", response);
        if (response.code === 0) {
          this.detailData = response.data;
        } else {
          common_vendor.index.showToast({
            title: response.msg || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/invoice/invoiceDetail.vue:131", "加载发票详情失败:", error);
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
      } finally {
        this.loading = false;
      }
    },
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        "INVOICE_CHECK": "审核中",
        "INVOICE_SUCCESS": "已开票",
        "INVOICE_FAIL": "开票失败",
        "INVOICE_VOID": "已作废",
        "INVOICE_PENDING": "待开票"
      };
      return statusMap[status] || "未知状态";
    },
    // 获取发票内容
    getInvoiceContent() {
      if (this.detailData.invoiceItemEnum) {
        return this.detailData.invoiceItemEnum.replace("&", "&");
      }
      const items = [];
      if (this.detailData.invoiceItem1)
        items.push(this.detailData.invoiceItem1);
      if (this.detailData.invoiceItem2)
        items.push(this.detailData.invoiceItem2);
      if (this.detailData.invoiceItem3)
        items.push(this.detailData.invoiceItem3);
      return items.length > 0 ? items.join("&") : "充电费用&充电服务费";
    },
    // 获取订单汇总文本
    getOrderSummaryText() {
      this.detailData.billTotal || 0;
      const chargingNum = this.detailData.chargingNum || 0;
      return `1张发票，含${chargingNum}个充电订单`;
    },
    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr)
        return "";
      const date = new Date(timeStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
    },
    // 查看订单详情
    viewOrderDetails() {
      if (this.detailData.billList && this.detailData.billList.length > 0) {
        this.showOrderModal = true;
      } else {
        common_vendor.index.showToast({
          title: "暂无订单数据",
          icon: "none"
        });
      }
    },
    // 关闭订单弹窗
    closeOrderModal() {
      this.showOrderModal = false;
    }
  }
};
if (!Array) {
  const _easycom_uv_icon2 = common_vendor.resolveComponent("uv-icon");
  const _easycom_uv_loading_icon2 = common_vendor.resolveComponent("uv-loading-icon");
  const _component_OrderListModal = common_vendor.resolveComponent("OrderListModal");
  (_easycom_uv_icon2 + _easycom_uv_loading_icon2 + _component_OrderListModal)();
}
const _easycom_uv_icon = () => "../../uni_modules/uv-icon/components/uv-icon/uv-icon.js";
const _easycom_uv_loading_icon = () => "../../uni_modules/uv-loading-icon/components/uv-loading-icon/uv-loading-icon.js";
if (!Math) {
  (_easycom_uv_icon + _easycom_uv_loading_icon)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      name: "clock",
      color: "#409eff",
      size: "32rpx"
    }),
    b: common_vendor.t($options.getStatusText($data.detailData.invoiceStatus)),
    c: common_vendor.t($options.formatTime($data.detailData.applicationTime)),
    d: common_vendor.t($data.detailData.invoiceTypeName || "增值税电子专用发票"),
    e: common_vendor.t($data.detailData.invoiceRise || "-"),
    f: common_vendor.t($data.detailData.dutyParagraph || "-"),
    g: common_vendor.t($options.getInvoiceContent()),
    h: common_vendor.t(($data.detailData.totalBalance / 100).toFixed(2)),
    i: common_vendor.t($options.formatTime($data.detailData.applicationTime)),
    j: common_vendor.t($data.detailData.unitName || "-"),
    k: common_vendor.t($data.detailData.phone || "-"),
    l: common_vendor.t($options.getOrderSummaryText()),
    m: common_vendor.p({
      name: "arrow-right",
      color: "#999",
      size: "24rpx"
    }),
    n: common_vendor.o((...args) => $options.viewOrderDetails && $options.viewOrderDetails(...args)),
    o: $data.loading
  }, $data.loading ? {
    p: common_vendor.p({
      text: "加载中...",
      textSize: "28rpx"
    })
  } : {}, {
    q: common_vendor.o($options.closeOrderModal),
    r: common_vendor.p({
      visible: $data.showOrderModal,
      billIds: $data.detailData.billList || []
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-25693e45"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/invoice/invoiceDetail.js.map

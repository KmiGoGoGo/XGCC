"use strict";
const common_vendor = require("../../common/vendor.js");
const api_invoice = require("../../api/invoice.js");
const _sfc_main = {
  name: "InvoiceRecordList",
  data() {
    return {
      // 列表数据
      recordList: [],
      // 分页参数
      pagination: {
        current: 1,
        size: 10,
        total: 0,
        pages: 0
      },
      // 状态
      loading: false,
      loadStatus: "loadmore"
      // loadmore, loading, nomore
    };
  },
  mounted() {
    this.loadRecordList();
  },
  methods: {
    // 加载发票记录列表
    async loadRecordList(isLoadMore = false) {
      if (this.loading)
        return;
      this.loading = true;
      if (!isLoadMore) {
        this.loadStatus = "loading";
      }
      try {
        const params = {
          page: isLoadMore ? this.pagination.current + 1 : 1,
          pageSize: this.pagination.size
        };
        const response = await api_invoice.queryInvoiceRecordList(params);
        if (response.code === 0) {
          const { InvoiceRecordList, total, current, pages } = response.data;
          if (isLoadMore) {
            this.recordList.push(...InvoiceRecordList);
          } else {
            this.recordList = InvoiceRecordList;
          }
          this.pagination = {
            current,
            size: this.pagination.size,
            total,
            pages
          };
          if (current >= pages) {
            this.loadStatus = "nomore";
          } else {
            this.loadStatus = "loadmore";
          }
        } else {
          common_vendor.index.showToast({
            title: response.msg || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at components/invoice/InvoiceRecordList.vue:132", "加载发票记录失败:", error);
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
      } finally {
        this.loading = false;
      }
    },
    // 加载更多
    onLoadMore() {
      if (this.loadStatus === "loadmore") {
        this.loadRecordList(true);
      }
    },
    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr)
        return "";
      const date = new Date(timeStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
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
    // 获取状态样式类
    getStatusClass(status) {
      const classMap = {
        "INVOICE_CHECK": "status-checking",
        "INVOICE_SUCCESS": "status-success",
        "INVOICE_FAIL": "status-failed",
        "INVOICE_VOID": "status-canceled",
        "INVOICE_PENDING": "status-pending"
      };
      return classMap[status] || "";
    },
    // 点击发票记录
    onItemClick(item) {
      common_vendor.index.__f__("log", "at components/invoice/InvoiceRecordList.vue:182", "点击发票记录:", item);
      common_vendor.index.showToast({
        title: "查看发票详情",
        icon: "none"
      });
      common_vendor.index.navigateTo({
        url: `/pages/invoice/invoiceDetail?id=${item.id}`
      });
    },
    // 刷新数据（供父组件调用）
    refresh() {
      this.loadRecordList();
    }
  }
};
if (!Array) {
  const _easycom_uv_icon2 = common_vendor.resolveComponent("uv-icon");
  const _easycom_uv_list_item2 = common_vendor.resolveComponent("uv-list-item");
  const _easycom_uv_load_more2 = common_vendor.resolveComponent("uv-load-more");
  const _easycom_uv_list2 = common_vendor.resolveComponent("uv-list");
  const _easycom_uv_empty2 = common_vendor.resolveComponent("uv-empty");
  const _easycom_uv_loading_icon2 = common_vendor.resolveComponent("uv-loading-icon");
  (_easycom_uv_icon2 + _easycom_uv_list_item2 + _easycom_uv_load_more2 + _easycom_uv_list2 + _easycom_uv_empty2 + _easycom_uv_loading_icon2)();
}
const _easycom_uv_icon = () => "../../uni_modules/uv-icon/components/uv-icon/uv-icon.js";
const _easycom_uv_list_item = () => "../../uni_modules/uv-list/components/uv-list-item/uv-list-item.js";
const _easycom_uv_load_more = () => "../../uni_modules/uv-load-more/components/uv-load-more/uv-load-more.js";
const _easycom_uv_list = () => "../../uni_modules/uv-list/components/uv-list/uv-list.js";
const _easycom_uv_empty = () => "../../uni_modules/uv-empty/components/uv-empty/uv-empty.js";
const _easycom_uv_loading_icon = () => "../../uni_modules/uv-loading-icon/components/uv-loading-icon/uv-loading-icon.js";
if (!Math) {
  (_easycom_uv_icon + _easycom_uv_list_item + _easycom_uv_load_more + _easycom_uv_list + _easycom_uv_empty + _easycom_uv_loading_icon)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.recordList.length > 0
  }, $data.recordList.length > 0 ? {
    b: common_vendor.f($data.recordList, (item, index, i0) => {
      return {
        a: common_vendor.t($options.formatTime(item.recordsCreateTime || item.createTime)),
        b: common_vendor.t((item.totalBalance / 100).toFixed(2)),
        c: common_vendor.t(item.unitName || "-"),
        d: common_vendor.t($options.getStatusText(item.invoiceStatus)),
        e: common_vendor.n($options.getStatusClass(item.invoiceStatus)),
        f: "f0c4d43c-2-" + i0 + "," + ("f0c4d43c-1-" + i0),
        g: common_vendor.o(($event) => $options.onItemClick(item), index),
        h: index,
        i: "f0c4d43c-1-" + i0 + ",f0c4d43c-0"
      };
    }),
    c: common_vendor.p({
      name: "arrow-right",
      color: "#ccc",
      size: "24rpx"
    }),
    d: common_vendor.p({
      customStyle: {
        padding: "20rpx 30rpx"
      }
    }),
    e: common_vendor.o($options.onLoadMore),
    f: common_vendor.p({
      status: $data.loadStatus,
      ["loadmore-text"]: "上拉或点击加载更多",
      ["loading-text"]: "正在加载...",
      ["nomore-text"]: "没有更多数据了"
    })
  } : !$data.loading ? {
    h: common_vendor.p({
      text: "暂无发票记录",
      mode: "data"
    })
  } : {}, {
    g: !$data.loading,
    i: $data.loading
  }, $data.loading ? {
    j: common_vendor.p({
      text: "加载中...",
      textSize: "28rpx"
    })
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f0c4d43c"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/invoice/InvoiceRecordList.js.map

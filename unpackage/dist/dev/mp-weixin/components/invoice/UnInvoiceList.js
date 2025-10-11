"use strict";
const common_vendor = require("../../common/vendor.js");
const api_invoice = require("../../api/invoice.js");
const _sfc_main = {
  name: "UnInvoiceList",
  data() {
    return {
      // 列表数据
      invoiceList: [],
      selectedItems: [],
      // uv-checkbox 相关数据
      checkboxModel: [],
      selectAllModel: [],
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
  computed: {
    // 是否全选当前页
    isAllSelected() {
      if (this.invoiceList.length === 0)
        return false;
      return this.invoiceList.every((item) => this.selectedItems.includes(item.id));
    },
    // 已选择的总金额
    totalSelectedAmount() {
      let total = 0;
      this.invoiceList.forEach((item) => {
        if (this.selectedItems.includes(item.id)) {
          total += item.actualBalance / 100;
        }
      });
      return total;
    }
  },
  watch: {
    // 监听全选状态变化，同步selectAllModel
    isAllSelected(newVal) {
      if (newVal && !this.selectAllModel.includes("selectAll")) {
        this.selectAllModel.push("selectAll");
      } else if (!newVal && this.selectAllModel.includes("selectAll")) {
        const index = this.selectAllModel.indexOf("selectAll");
        this.selectAllModel.splice(index, 1);
      }
    }
  },
  mounted() {
    this.loadInvoiceList();
  },
  methods: {
    // 加载发票列表
    async loadInvoiceList(isLoadMore = false) {
      if (this.loading)
        return;
      this.loading = true;
      if (!isLoadMore) {
        this.loadStatus = "loading";
      }
      try {
        const params = {
          current: isLoadMore ? this.pagination.current + 1 : 1,
          size: this.pagination.size
        };
        const response = await api_invoice.getUnInvoiceBillList(params);
        common_vendor.index.__f__("log", "at components/invoice/UnInvoiceList.vue:182", "response", response);
        if (response.code === 0) {
          const { records, total, current, pages } = response.data;
          if (isLoadMore) {
            this.invoiceList.push(...records);
          } else {
            this.invoiceList = records;
            this.selectedItems = [];
            this.checkboxModel = [];
            this.selectAllModel = [];
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
        common_vendor.index.__f__("error", "at components/invoice/UnInvoiceList.vue:216", "加载发票列表失败:", error);
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
        this.loadInvoiceList(true);
      }
    },
    // 单项选择
    onItemCheck(item, name) {
      const itemId = item.id;
      const isChecked = this.selectedItems.includes(itemId);
      if (!isChecked) {
        this.selectedItems.push(itemId);
        if (!this.checkboxModel.includes(itemId)) {
          this.checkboxModel.push(itemId);
        }
      } else {
        const index = this.selectedItems.indexOf(itemId);
        if (index > -1) {
          this.selectedItems.splice(index, 1);
        }
        const modelIndex = this.checkboxModel.indexOf(itemId);
        if (modelIndex > -1) {
          this.checkboxModel.splice(modelIndex, 1);
        }
      }
    },
    // 单项复选框组事件处理（原生组件方式）
    onItemCheckboxChange(e) {
      common_vendor.index.__f__("log", "at components/invoice/UnInvoiceList.vue:261", "checkbox-group change:", e);
    },
    // 本页全选/取消全选
    onSelectAllChange(name) {
      const isCurrentlyAllSelected = this.isAllSelected;
      if (!isCurrentlyAllSelected) {
        this.invoiceList.forEach((item) => {
          if (!this.selectedItems.includes(item.id)) {
            this.selectedItems.push(item.id);
          }
          if (!this.checkboxModel.includes(item.id)) {
            this.checkboxModel.push(item.id);
          }
        });
        if (!this.selectAllModel.includes("selectAll")) {
          this.selectAllModel.push("selectAll");
        }
      } else {
        this.invoiceList.forEach((item) => {
          const index = this.selectedItems.indexOf(item.id);
          if (index > -1) {
            this.selectedItems.splice(index, 1);
          }
          const modelIndex = this.checkboxModel.indexOf(item.id);
          if (modelIndex > -1) {
            this.checkboxModel.splice(modelIndex, 1);
          }
        });
        const selectAllIndex = this.selectAllModel.indexOf("selectAll");
        if (selectAllIndex > -1) {
          this.selectAllModel.splice(selectAllIndex, 1);
        }
      }
    },
    // 全选复选框组事件处理（原生组件方式）
    onSelectAllCheckboxChange(e) {
      common_vendor.index.__f__("log", "at components/invoice/UnInvoiceList.vue:304", "select all checkbox-group change:", e);
    },
    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr)
        return "";
      const date = new Date(timeStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    },
    // 下一步
    goToNext() {
      if (this.selectedItems.length === 0) {
        common_vendor.index.showToast({
          title: "请选择要开票的订单",
          icon: "none"
        });
        return;
      }
      common_vendor.index.__f__("log", "at components/invoice/UnInvoiceList.vue:325", "选中的订单:", this.selectedItems);
      common_vendor.index.__f__("log", "at components/invoice/UnInvoiceList.vue:326", "总金额:", this.totalSelectedAmount);
      const selectedItems = this.selectedItems.join(",");
      common_vendor.index.navigateTo({
        url: `/pages/invoice/invoiceForm?selectedItems=${selectedItems}&totalSelectedAmount=${this.totalSelectedAmount.toFixed(2)}`
      });
    },
    // 刷新数据（供父组件调用）
    refresh() {
      this.loadInvoiceList();
    }
  }
};
if (!Array) {
  const _easycom_uv_checkbox2 = common_vendor.resolveComponent("uv-checkbox");
  const _easycom_uv_list_item2 = common_vendor.resolveComponent("uv-list-item");
  const _easycom_uv_checkbox_group2 = common_vendor.resolveComponent("uv-checkbox-group");
  const _easycom_uv_load_more2 = common_vendor.resolveComponent("uv-load-more");
  const _easycom_uv_list2 = common_vendor.resolveComponent("uv-list");
  const _easycom_uv_empty2 = common_vendor.resolveComponent("uv-empty");
  const _easycom_uv_button2 = common_vendor.resolveComponent("uv-button");
  (_easycom_uv_checkbox2 + _easycom_uv_list_item2 + _easycom_uv_checkbox_group2 + _easycom_uv_load_more2 + _easycom_uv_list2 + _easycom_uv_empty2 + _easycom_uv_button2)();
}
const _easycom_uv_checkbox = () => "../../uni_modules/uv-checkbox/components/uv-checkbox/uv-checkbox.js";
const _easycom_uv_list_item = () => "../../uni_modules/uv-list/components/uv-list-item/uv-list-item.js";
const _easycom_uv_checkbox_group = () => "../../uni_modules/uv-checkbox/components/uv-checkbox-group/uv-checkbox-group.js";
const _easycom_uv_load_more = () => "../../uni_modules/uv-load-more/components/uv-load-more/uv-load-more.js";
const _easycom_uv_list = () => "../../uni_modules/uv-list/components/uv-list/uv-list.js";
const _easycom_uv_empty = () => "../../uni_modules/uv-empty/components/uv-empty/uv-empty.js";
const _easycom_uv_button = () => "../../uni_modules/uv-button/components/uv-button/uv-button.js";
if (!Math) {
  (_easycom_uv_checkbox + _easycom_uv_list_item + _easycom_uv_checkbox_group + _easycom_uv_load_more + _easycom_uv_list + _easycom_uv_empty + _easycom_uv_button)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.invoiceList, (item, index, i0) => {
      return {
        a: common_vendor.o(($event) => $options.onItemCheck(item, $event), item.id),
        b: "2fc4fb3f-3-" + i0 + "," + ("2fc4fb3f-2-" + i0),
        c: common_vendor.p({
          name: item.id,
          checked: $data.selectedItems.includes(item.id),
          activeColor: "#007AFF"
        }),
        d: common_vendor.t(item.busId),
        e: common_vendor.t(item.unitName),
        f: common_vendor.t($options.formatTime(item.createTime)),
        g: common_vendor.t((item.actualBalance / 100).toFixed(2)),
        h: item.id,
        i: "2fc4fb3f-2-" + i0 + ",2fc4fb3f-1"
      };
    }),
    b: common_vendor.p({
      customStyle: {
        padding: "20rpx 30rpx"
      }
    }),
    c: common_vendor.o(($event) => $data.checkboxModel = $event),
    d: common_vendor.p({
      modelValue: $data.checkboxModel
    }),
    e: common_vendor.o($options.onLoadMore),
    f: common_vendor.p({
      status: $data.loadStatus,
      ["loadmore-text"]: "上拉或点击加载更多",
      ["loading-text"]: "正在加载...",
      ["nomore-text"]: "没有更多数据了"
    }),
    g: !$data.loading && $data.invoiceList.length === 0
  }, !$data.loading && $data.invoiceList.length === 0 ? {
    h: common_vendor.p({
      text: "暂无可开票订单",
      mode: "data"
    })
  } : {}, {
    i: common_vendor.o((...args) => $options.onLoadMore && $options.onLoadMore(...args)),
    j: common_vendor.o($options.onSelectAllChange),
    k: common_vendor.p({
      name: "selectAll",
      checked: $options.isAllSelected,
      activeColor: "#007AFF",
      label: "本页全选"
    }),
    l: common_vendor.o($options.onSelectAllCheckboxChange),
    m: common_vendor.o(($event) => $data.selectAllModel = $event),
    n: common_vendor.p({
      modelValue: $data.selectAllModel
    }),
    o: common_vendor.t($data.selectedItems.length),
    p: common_vendor.t($options.totalSelectedAmount.toFixed(2)),
    q: common_vendor.o($options.goToNext),
    r: common_vendor.p({
      type: "primary",
      size: "default",
      disabled: $data.selectedItems.length === 0,
      customStyle: "border-radius: 40rpx; padding: 0 40rpx;"
    })
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2fc4fb3f"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/invoice/UnInvoiceList.js.map

"use strict";
const common_vendor = require("../../common/vendor.js");
const api_refund = require("../../api/refund.js");
const _sfc_main = {
  data() {
    return {
      selectedRechargeId: null,
      // 选中的充值记录ID
      isSubmitting: false,
      // 是否正在提交
      isLoading: false,
      // 是否正在加载数据
      isLoadingMore: false,
      // 是否正在加载更多
      rechargeRecords: [],
      // 充值记录列表
      // 分页相关
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
        hasMore: true
      },
      buttonStyle: {
        backgroundColor: "#e1f5fe",
        color: "#1f2937",
        fontWeight: "bold",
        height: "48px",
        borderRadius: "8px"
      }
    };
  },
  onLoad(options) {
    this.loadRechargeRecords(true);
    if (options.rechargeId) {
      this.selectedRechargeId = options.rechargeId;
    }
  },
  computed: {
    formatCurrency() {
      return (amount) => {
        if (typeof amount !== "number")
          return "0.00";
        return (amount / 100).toFixed(2);
      };
    }
  },
  /**
   * 触底加载更多
   */
  onReachBottom() {
    if (this.pagination.hasMore && !this.isLoadingMore && !this.isLoading) {
      this.loadRechargeRecords(false);
    }
  },
  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.refreshData();
  },
  methods: {
    /**
     * 返回上一页
     */
    goBack() {
      common_vendor.index.navigateBack();
    },
    /**
     * 加载充值记录数据
     * @param {Boolean} isRefresh 是否为刷新操作
     */
    async loadRechargeRecords(isRefresh = false) {
      try {
        if (this.isLoading || this.isLoadingMore) {
          return;
        }
        if (isRefresh) {
          this.isLoading = true;
          this.pagination.page = 1;
          this.pagination.hasMore = true;
          common_vendor.index.showLoading({ title: "加载中..." });
        } else {
          this.isLoadingMore = true;
          this.pagination.page++;
        }
        const response = await api_refund.getLeaguerAccountRefundList({
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          refundType: "0"
          // 充值记录类型
        });
        if (response.code === 0 && response.data) {
          if (isRefresh) {
            this.rechargeRecords = response.data.rechargeLists || [];
          } else {
            this.rechargeRecords = [...this.rechargeRecords, ...response.data.rechargeLists || []];
          }
        } else {
          throw new Error(response.msg || "获取数据失败");
        }
        if (isRefresh) {
          common_vendor.index.hideLoading();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/refund/leaguerAccountRefundApply.vue:184", "加载充值记录失败：", error);
        if (isRefresh) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "加载失败，请重试",
            icon: "none"
          });
        } else {
          this.pagination.page--;
          common_vendor.index.showToast({
            title: "加载更多失败",
            icon: "none"
          });
        }
      } finally {
        this.isLoading = false;
        this.isLoadingMore = false;
        common_vendor.index.stopPullDownRefresh();
      }
    },
    /**
     * 刷新数据
     */
    async refreshData() {
      this.selectedRechargeId = null;
      await this.loadRechargeRecords(true);
    },
    /**
     * 选择充值记录
     * @param {String} recordId 记录ID
     */
    selectRecord(recordId) {
      this.selectedRechargeId = recordId;
    },
    /**
     * 充值记录选择变化回调
     * @param {String} value 选中的值
     */
    onRechargeSelect(value) {
      common_vendor.index.__f__("log", "at pages/refund/leaguerAccountRefundApply.vue:230", "选中的充值记录：", value);
      this.selectedRechargeId = value;
    },
    /**
     * 提交退款申请
     */
    async submitRefundApplication() {
      if (!this.selectedRechargeId) {
        common_vendor.index.showToast({
          title: "请选择要退款的充值记录",
          icon: "none"
        });
        return;
      }
      const selectedRecord = this.rechargeRecords.find(
        (record) => record.id === this.selectedRechargeId
      );
      if (!selectedRecord) {
        common_vendor.index.showToast({
          title: "所选记录不存在",
          icon: "none"
        });
        return;
      }
      const confirmResult = await this.showConfirmDialog(selectedRecord);
      if (!confirmResult) {
        return;
      }
      try {
        this.isSubmitting = true;
        const response = await api_refund.leaguerAccountRefundApply({
          balance: selectedRecord.balance,
          chargeIds: [selectedRecord.id]
        });
        if (response.code === 0) {
          common_vendor.index.showToast({
            title: "退款申请已提交",
            icon: "success"
          });
        } else {
          throw new Error(response.msg || "提交失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/refund/leaguerAccountRefundApply.vue:284", "提交退款申请失败：", error);
        common_vendor.index.showToast({
          title: error.message || "提交失败，请重试",
          icon: "none"
        });
      } finally {
        this.isSubmitting = false;
      }
    },
    /**
     * 显示确认对话框
     * @param {Object} record 充值记录
     */
    showConfirmDialog(record) {
      return new Promise((resolve) => {
        common_vendor.index.showModal({
          title: "确认退款",
          content: `确定要申请退款 ${this.formatCurrency(record.balance)} 元吗？
充值时间：${record.createTime}`,
          confirmText: "确定",
          cancelText: "取消",
          success: (res) => {
            resolve(res.confirm);
          },
          fail: () => {
            resolve(false);
          }
        });
      });
    }
  }
};
if (!Array) {
  const _easycom_uv_radio2 = common_vendor.resolveComponent("uv-radio");
  const _easycom_uv_radio_group2 = common_vendor.resolveComponent("uv-radio-group");
  const _easycom_uv_loading_icon2 = common_vendor.resolveComponent("uv-loading-icon");
  const _easycom_uv_empty2 = common_vendor.resolveComponent("uv-empty");
  const _easycom_uv_button2 = common_vendor.resolveComponent("uv-button");
  (_easycom_uv_radio2 + _easycom_uv_radio_group2 + _easycom_uv_loading_icon2 + _easycom_uv_empty2 + _easycom_uv_button2)();
}
const _easycom_uv_radio = () => "../../uni_modules/uv-radio/components/uv-radio/uv-radio.js";
const _easycom_uv_radio_group = () => "../../uni_modules/uv-radio/components/uv-radio-group/uv-radio-group.js";
const _easycom_uv_loading_icon = () => "../../uni_modules/uv-loading-icon/components/uv-loading-icon/uv-loading-icon.js";
const _easycom_uv_empty = () => "../../uni_modules/uv-empty/components/uv-empty/uv-empty.js";
const _easycom_uv_button = () => "../../uni_modules/uv-button/components/uv-button/uv-button.js";
if (!Math) {
  (_easycom_uv_radio + _easycom_uv_radio_group + _easycom_uv_loading_icon + _easycom_uv_empty + _easycom_uv_button)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.rechargeRecords, (record, index, i0) => {
      return {
        a: common_vendor.t($options.formatCurrency(record.balance)),
        b: common_vendor.t(record.createTime),
        c: common_vendor.t(record.auditOpinion),
        d: "2c958d8d-1-" + i0 + ",2c958d8d-0",
        e: common_vendor.p({
          name: record.id,
          activeColor: "#e1f5fe",
          size: 20
        }),
        f: record.id,
        g: $data.selectedRechargeId === record.id ? 1 : "",
        h: common_vendor.o(($event) => $options.selectRecord(record.id), record.id)
      };
    }),
    b: common_vendor.o($options.onRechargeSelect),
    c: common_vendor.o(($event) => $data.selectedRechargeId = $event),
    d: common_vendor.p({
      shape: "circle",
      modelValue: $data.selectedRechargeId
    }),
    e: $data.isLoadingMore
  }, $data.isLoadingMore ? {
    f: common_vendor.p({
      show: true,
      color: "#1890ff"
    })
  } : {}, {
    g: !$data.pagination.hasMore && $data.rechargeRecords.length > 0
  }, !$data.pagination.hasMore && $data.rechargeRecords.length > 0 ? {} : {}, {
    h: $data.rechargeRecords.length === 0 && !$data.isLoading
  }, $data.rechargeRecords.length === 0 && !$data.isLoading ? {
    i: common_vendor.p({
      text: "暂无充值记录",
      mode: "data",
      show: true
    })
  } : {}, {
    j: common_vendor.o($options.submitRefundApplication),
    k: common_vendor.p({
      text: "提交退款申请",
      type: "primary",
      disabled: !$data.selectedRechargeId || $data.isSubmitting,
      loading: $data.isSubmitting,
      customStyle: $data.buttonStyle
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2c958d8d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/refund/leaguerAccountRefundApply.js.map

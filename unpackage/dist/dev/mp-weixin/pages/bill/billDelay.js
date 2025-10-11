"use strict";
const common_vendor = require("../../common/vendor.js");
const api_bill = require("../../api/bill.js");
const api_style = require("../../api/style.js");
const _sfc_main = {
  name: "BillDelay",
  data() {
    return {
      billData: {},
      timer: null,
      billId: null
    };
  },
  computed: {
    buttonStyle() {
      return {
        width: "100%",
        height: "88rpx",
        fontSize: "32rpx",
        fontWeight: "bold"
      };
    },
    // 计算底部安全区域高度
    bottomSafeAreaHeight() {
      return "176rpx";
    }
  },
  onLoad(options) {
    this.billId = options.id;
    if (this.billId) {
      this.startPolling();
    }
  },
  onUnload() {
    this.clearTimer();
  },
  methods: {
    // 开始轮询
    startPolling() {
      this.checkBillStatus();
      this.timer = setInterval(() => {
        this.checkBillStatus();
      }, 3e3);
    },
    // 检查账单状态
    async checkBillStatus() {
      try {
        const response = await api_bill.getBillDetailById(this.billId);
        if (response.code === 0 && response.data) {
          this.billData = response.data;
          if (response.data.billStatus === 11) {
            this.clearTimer();
            common_vendor.index.navigateTo({
              url: `/pages/bill/settlementPay?id=${this.billId}`
            });
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/bill/billDelay.vue:171", "获取账单详情失败:", error);
      }
    },
    // 清除定时器
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    // 复制订单号
    copyOrderNo() {
      const orderNo = this.billData.busShowNo || "--";
      common_vendor.index.setClipboardData({
        data: orderNo,
        success: () => {
          common_vendor.index.showToast({
            title: "订单号已复制",
            icon: "success"
          });
        }
      });
    },
    // 前往首页
    goHome() {
      common_vendor.index.switchTab({
        url: "/pages/index/index"
      });
    },
    async goToService() {
      const res = await api_style.getStyleConfig();
      if (res.code !== 0) {
        common_vendor.index.showToast({
          title: res.msg || "获取客服信息失败",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showModal({
        title: "联系客服",
        content: `客服电话：${res.data.telephone || ""}
客服工作时间：${res.data.serviceTime || ""}`,
        showCancel: true,
        cancelText: "取消",
        confirmText: "呼叫客服",
        confirmColor: "#007AFF",
        success: (res1) => {
          if (res1.confirm) {
            common_vendor.index.makePhoneCall({
              phoneNumber: res.data.telephone,
              success: () => {
                common_vendor.index.__f__("log", "at pages/bill/billDelay.vue:225", "呼叫成功");
              },
              fail: (err) => {
                common_vendor.index.__f__("log", "at pages/bill/billDelay.vue:228", "呼叫失败", err);
                common_vendor.index.showToast({
                  title: "呼叫失败",
                  icon: "none"
                });
              }
            });
          }
        }
      });
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
  return {
    a: common_vendor.t($data.billData.stationName || "--"),
    b: common_vendor.t($data.billData.busShowNo || "--"),
    c: common_vendor.o((...args) => $options.copyOrderNo && $options.copyOrderNo(...args)),
    d: common_vendor.t($data.billData.timeS || "--"),
    e: common_vendor.t($data.billData.preFrozenAmount || "--"),
    f: common_vendor.o((...args) => $options.goToService && $options.goToService(...args)),
    g: common_vendor.o($options.goHome),
    h: common_vendor.p({
      type: "primary",
      shape: "circle",
      text: "前往首页",
      customStyle: $options.buttonStyle
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-391493a6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/bill/billDelay.js.map

"use strict";
const common_vendor = require("../../common/vendor.js");
const api_member = require("../../api/member.js");
const _sfc_main = {
  data() {
    return {
      accountInfo: null,
      orderStr: null,
      // 流水相关数据
      flowList: [],
      // 流水列表
      flowPagination: {
        current: 1,
        size: 10,
        total: 0,
        pages: 0
      },
      memberInfo: {},
      loadingMore: false,
      // 是否正在加载更多
      noMoreData: false
      // 是否没有更多数据
    };
  },
  computed: {
    formatCurrency() {
      return (amount) => {
        if (typeof amount !== "number")
          return "0.00";
        return (amount / 100).toFixed(2);
      };
    },
    formattedTotalBalance() {
      return this.accountInfo ? this.formatCurrency(this.accountInfo.totalAccountBalance) : "0.00";
    },
    formattedPersonalBalance() {
      return this.accountInfo ? this.formatCurrency(this.accountInfo.accountBalance) : "0.00";
    },
    formattedPersonalAvailable() {
      return this.accountInfo ? this.formatCurrency(this.accountInfo.availableAccountBalance) : "0.00";
    },
    formattedPersonalUnavailable() {
      return this.accountInfo ? this.formatCurrency(this.accountInfo.unAvailableAccountBalance) : "0.00";
    },
    formattedCardBalance() {
      return this.accountInfo ? this.formatCurrency(this.accountInfo.personBalance) : "0.00";
    },
    formattedCardAvailable() {
      return this.accountInfo ? this.formatCurrency(this.accountInfo.availablePersonBalance) : "0.00";
    },
    formattedCardUnavailable() {
      return this.accountInfo ? this.formatCurrency(this.accountInfo.unAvailablePersonBalance) : "0.00";
    }
  },
  async onLoad() {
    common_vendor.index.showLoading({
      title: "加载中..."
    });
    try {
      this.memberInfo = common_vendor.index.getStorageSync("memberInfo");
      const tokenMemberType = common_vendor.index.getStorageSync("tokenMemberType");
      const res = await api_member.getAccountInfo({
        tab: tokenMemberType === 0 ? 1 : 2
      });
      if (res.code === 0) {
        this.accountInfo = res.data;
      } else {
        common_vendor.index.showToast({
          title: res.msg || "获取资产失败",
          icon: "none"
        });
      }
      if (this.memberInfo.tokenMemberType === 2) {
        await this.getFlowList();
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at pages/account/assets.vue:215", "获取账户信息失败", error);
      common_vendor.index.showToast({
        title: "网络错误",
        icon: "none"
      });
    } finally {
      common_vendor.index.hideLoading();
    }
  },
  methods: {
    goToRecords() {
      common_vendor.index.navigateTo({
        url: "/pages/account/records"
      });
    },
    TaskMoney(e) {
      my.tradePay({
        orderStr: e,
        //完整的支付参数拼接成的字符串，从服务端获取
        success: (res) => {
          my.alert({
            content: JSON.stringify(res)
          });
        },
        fail: (res) => {
          my.alert({
            content: JSON.stringify(res)
          });
        }
      });
    },
    goToRefundPage() {
      common_vendor.index.navigateTo({
        url: "/pages/refund/apply"
      });
    },
    goToRechargePage() {
      common_vendor.index.navigateTo({
        url: "/pages/recharge/recharge"
      });
    },
    /**
     * @description 获取账户流水列表
     * @param {boolean} loadMore - 是否为加载更多
     */
    async getFlowList(loadMore = false) {
      try {
        if (loadMore) {
          this.loadingMore = true;
        }
        const requestData = {
          accountType: "2",
          current: this.flowPagination.current,
          size: this.flowPagination.size,
          tab: 1
        };
        const res = await api_member.getAccountFlowPage(requestData);
        if (res.code === 0 && res.data && res.data.accountFlowMiniVO) {
          const flowData = res.data.accountFlowMiniVO;
          if (loadMore) {
            this.flowList = [...this.flowList, ...flowData.records];
          } else {
            this.flowList = flowData.records;
          }
          this.flowPagination = {
            current: flowData.current,
            size: flowData.size,
            total: flowData.total,
            pages: flowData.pages
          };
          this.noMoreData = this.flowPagination.current >= this.flowPagination.pages;
        } else {
          common_vendor.index.showToast({
            title: res.msg || "获取流水失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/account/assets.vue:303", "获取流水列表失败:", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      } finally {
        if (loadMore) {
          this.loadingMore = false;
        }
      }
    },
    /**
     * @description 加载更多流水数据
     */
    async loadMoreFlow() {
      if (this.loadingMore || this.noMoreData) {
        return;
      }
      this.flowPagination.current += 1;
      await this.getFlowList(true);
    },
    /**
     * @description 格式化金额变化显示
     * @param {string} amountChange - 金额变化字符串，如 "+1" 或 "-1"
     */
    formatAmountChange(amountChange) {
      if (!amountChange)
        return "0.00";
      const amount = parseInt(amountChange.replace(/[^-0-9]/g, ""));
      const formattedAmount = (Math.abs(amount) / 100).toFixed(2);
      if (amountChange.startsWith("+")) {
        return `+¥${formattedAmount}`;
      } else if (amountChange.startsWith("-")) {
        return `-¥${formattedAmount}`;
      }
      return `¥${formattedAmount}`;
    },
    /**
     * @description 格式化账户余额显示
     * @param {number} balance - 账户余额（分）
     */
    formatAccountBalance(balance) {
      if (typeof balance !== "number")
        return "¥0.00";
      return `¥${(balance / 100).toFixed(2)}`;
    },
    // 企业用户专用方法
    goToPersonalRechargePage() {
      common_vendor.index.navigateTo({
        url: "/pages/recharge/leaguerAccountRecharge"
      });
    },
    goToPersonalRefundPage() {
      common_vendor.index.navigateTo({
        url: "/pages/refund/leaguerAccountRefund"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.memberInfo.tokenMemberType === 0
  }, $data.memberInfo.tokenMemberType === 0 ? {
    b: common_vendor.t($options.formattedTotalBalance),
    c: common_vendor.o((...args) => $options.goToRecords && $options.goToRecords(...args))
  } : {}, {
    d: $data.memberInfo.tokenMemberType === 0
  }, $data.memberInfo.tokenMemberType === 0 ? {
    e: common_vendor.t($options.formattedPersonalBalance),
    f: common_vendor.t($options.formattedPersonalAvailable),
    g: common_vendor.t($options.formattedPersonalUnavailable),
    h: common_vendor.o((...args) => $options.goToRecords && $options.goToRecords(...args)),
    i: common_vendor.o((...args) => $options.goToRechargePage && $options.goToRechargePage(...args)),
    j: common_vendor.o((...args) => $options.goToRefundPage && $options.goToRefundPage(...args))
  } : {}, {
    k: $data.memberInfo.tokenMemberType === 0
  }, $data.memberInfo.tokenMemberType === 0 ? {
    l: common_vendor.t($options.formattedCardBalance),
    m: common_vendor.t($options.formattedCardAvailable),
    n: common_vendor.t($options.formattedCardUnavailable),
    o: common_vendor.o((...args) => $options.goToRecords && $options.goToRecords(...args))
  } : {}, {
    p: $data.memberInfo.tokenMemberType === 2
  }, $data.memberInfo.tokenMemberType === 2 ? {
    q: common_vendor.t($options.formattedPersonalBalance),
    r: common_vendor.o((...args) => $options.goToPersonalRechargePage && $options.goToPersonalRechargePage(...args)),
    s: common_vendor.o((...args) => $options.goToPersonalRefundPage && $options.goToPersonalRefundPage(...args))
  } : {}, {
    t: $data.memberInfo.tokenMemberType === 2
  }, $data.memberInfo.tokenMemberType === 2 ? common_vendor.e({
    v: $data.flowList.length > 0
  }, $data.flowList.length > 0 ? {
    w: common_vendor.f($data.flowList, (item, index, i0) => {
      return {
        a: common_vendor.t(item.eventNameStr),
        b: common_vendor.t(item.createTime),
        c: common_vendor.t($options.formatAmountChange(item.amountChange)),
        d: common_vendor.n(item.amountChange.startsWith("+") ? "positive" : "negative"),
        e: common_vendor.t($options.formatAccountBalance(item.accountBalance)),
        f: item.id || index
      };
    })
  } : {}, {
    x: $data.flowList.length > 0
  }, $data.flowList.length > 0 ? common_vendor.e({
    y: !$data.noMoreData && !$data.loadingMore
  }, !$data.noMoreData && !$data.loadingMore ? {
    z: common_vendor.o((...args) => $options.loadMoreFlow && $options.loadMoreFlow(...args))
  } : {}, {
    A: $data.loadingMore
  }, $data.loadingMore ? {} : {}, {
    B: $data.noMoreData
  }, $data.noMoreData ? {} : {}) : {}, {
    C: $data.flowList.length === 0
  }, $data.flowList.length === 0 ? {} : {}) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-940eb0b0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/account/assets.js.map

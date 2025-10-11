"use strict";
const common_vendor = require("../../common/vendor.js");
const api_bill = require("../../api/bill.js");
const FilterOptions = () => "../../components/FilterOptions/FilterOptions.js";
const _sfc_main = {
  components: {
    FilterOptions
  },
  data() {
    return {
      tabs: [
        { name: "全部订单", key: "all", statuses: null },
        { name: "充电中", key: "charging", statuses: [4] },
        { name: "待结算", key: "settling", statuses: [5, 6, 7, 8, 9] },
        { name: "待支付", key: "unpaid", statuses: [11, 12, 13] }
      ],
      activeTab: "all",
      occupyCount: 0,
      orderList: [],
      pagination: {
        current: 1,
        size: 10,
        total: 0
      },
      // 搜索相关
      searchKeyword: "",
      searchInputStyle: {
        backgroundColor: "#fff",
        borderRadius: "30rpx",
        padding: "10rpx 20rpx"
      },
      // 筛选相关
      showFilter: false,
      filterParams: {
        startTimeKey: null,
        endTimeKey: null,
        startTime: null,
        endTime: null
      },
      // 开始时间选项
      startTimeOptions: {
        name: "开始时间",
        list: [
          { value: "今天", key: "today" },
          { value: "昨天", key: "yesterday" },
          { value: "近7天", key: "last7days" },
          { value: "近30天", key: "last30days" },
          { value: "自定义", key: "custom" }
        ]
      },
      // 结束时间选项
      endTimeOptions: {
        name: "结束时间",
        list: [
          { value: "今天", key: "today" },
          { value: "昨天", key: "yesterday" },
          { value: "近7天", key: "last7days" },
          { value: "近30天", key: "last30days" },
          { value: "自定义", key: "custom" }
        ]
      }
    };
  },
  onLoad(options) {
    if (options.activeTab) {
      this.activeTab = options.activeTab;
      this.orderList = [];
      this.pagination.current = 1;
    }
    this.loadData();
  },
  methods: {
    /**
     * @description 加载页面数据
     */
    async loadData() {
      var _a;
      common_vendor.index.showLoading({ title: "加载中..." });
      try {
        const activeStatuses = (_a = this.tabs.find((t) => t.key === this.activeTab)) == null ? void 0 : _a.statuses;
        const [occupyRes, billRes] = await Promise.all([
          api_bill.getMyOccupyBillPage({ current: 1, pageSize: 10 }),
          api_bill.myBillPage({
            current: this.pagination.current,
            size: this.pagination.size,
            billStatusList: activeStatuses,
            // 其他筛选条件
            startTime: this.filterParams.startTime,
            endTime: this.filterParams.endTime,
            memberType: 1,
            searchBarCondition: this.searchKeyword,
            version: 1
          })
        ]);
        if (occupyRes.code === 0) {
          this.occupyCount = occupyRes.data.total;
        }
        common_vendor.index.__f__("log", "at pages/order/list.vue:214", billRes);
        if (billRes.code === 0) {
          this.orderList = [...this.orderList, ...billRes.data.records];
          this.pagination.total = billRes.data.total;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/list.vue:221", "加载订单数据失败:", error);
        common_vendor.index.showToast({ title: "数据加载失败", icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    /**
     * @description 切换状态标签
     */
    changeTab(tabKey) {
      this.activeTab = tabKey;
      this.orderList = [];
      this.pagination.current = 1;
      this.loadData();
    },
    /**
     * @description 格式化金额 (分 -> 元)
     */
    formatAmount(amount) {
      if (typeof amount !== "number")
        return "0.00";
      return (amount / 100).toFixed(2);
    },
    /**
     * @description 格式化时间范围
     */
    formatTimeRange(start, end) {
      if (!start || !end)
        return "";
      const startTime = start.split(" ")[1].substring(0, 5);
      const endTime = end.split(" ")[1].substring(0, 5);
      const startDate = start.split(" ")[0];
      return `${startDate} ${startTime} ~ ${endTime}`;
    },
    /**
     * @description 跳转到占位订单页面
     */
    goToOccupyPage() {
      common_vendor.index.navigateTo({
        url: "/pages/order/occupy"
      });
    },
    /**
     * @description 跳转到订单详情页面
     */
    goToDetails(order) {
      const { id, billStatus, busId, gunId, isCharging, gunNumber, pileNumber, pileId } = order;
      common_vendor.index.__f__("log", "at pages/order/list.vue:266", "order", order);
      if (billStatus === 4 || isCharging) {
        common_vendor.index.navigateTo({
          url: `/pages/charge/charging?billId=${id}&busId=${busId}&gunId=${gunId}&gunNo=${gunNumber}&pileNo=${pileNumber}&pileId=${pileId}&animationEnabled=false`
        });
      } else {
        common_vendor.index.navigateTo({
          url: `/pages/bill/settlementInfo?billId=${id}`
        });
      }
    },
    /**
     * @description 判断订单是否为充电中状态
     */
    isCharging(billStatus) {
      return [4].includes(billStatus);
    },
    /**
     * @description 判断订单是否为待结算状态
     */
    isSettling(billStatus) {
      return [5, 6, 7, 8, 9, 14].includes(billStatus);
    },
    /**
     * @description 判断订单是否为待支付状态
     */
    isUnpaid(billStatus) {
      return [11, 12, 13].includes(billStatus);
    },
    /**
     * @description 跳转到支付页面
     */
    goToPay(billId, busId) {
      if (!billId || !busId) {
        common_vendor.index.showToast({ title: "订单信息不完整", icon: "none" });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/bill/settlementPay?billId=${billId}&busId=${busId}`
      });
    },
    /**
     * @description 再次充电，跳转到首页
     */
    recharge() {
      common_vendor.index.switchTab({
        url: "/pages/index/index"
      });
    },
    /**
     * @description 跳转到评价页面
     */
    goToComment(billid) {
      common_vendor.index.navigateTo({
        url: `/pages/bill/comment?billId=${billid}`
      });
    },
    /**
     * @description 搜索输入处理
     */
    onSearchInput(value) {
      this.searchKeyword = value;
    },
    /**
     * @description 搜索确认
     */
    onSearchConfirm() {
      this.orderList = [];
      this.pagination.current = 1;
      this.loadData();
    },
    /**
     * @description 切换筛选弹窗
     */
    toggleFilter() {
      common_vendor.index.__f__("log", "at pages/order/list.vue:341", "toggleFilter");
      if (this.showFilter) {
        this.$refs.filterPopup.close();
      } else {
        this.$refs.filterPopup.open("bottom");
      }
    },
    /**
     * @description 开始时间选择
     */
    onStartTimeChange(option) {
      this.filterParams.startTimeKey = option.key;
      this.filterParams.startTime = this.convertTimeKeyToDate(option.key);
    },
    /**
     * @description 结束时间选择
     */
    onEndTimeChange(option) {
      this.filterParams.endTimeKey = option.key;
      this.filterParams.endTime = this.convertTimeKeyToDate(option.key, true);
    },
    /**
     * @description 转换时间key为具体日期
     */
    convertTimeKeyToDate(key, isEndTime = false) {
      const now = /* @__PURE__ */ new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      switch (key) {
        case "today":
          return isEndTime ? new Date(today.getTime() + 24 * 60 * 60 * 1e3 - 1).toISOString() : today.toISOString();
        case "yesterday":
          const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1e3);
          return isEndTime ? new Date(yesterday.getTime() + 24 * 60 * 60 * 1e3 - 1).toISOString() : yesterday.toISOString();
        case "last7days":
          const last7days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1e3);
          return isEndTime ? now.toISOString() : last7days.toISOString();
        case "last30days":
          const last30days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1e3);
          return isEndTime ? now.toISOString() : last30days.toISOString();
        case "custom":
          return null;
        default:
          return null;
      }
    },
    /**
     * @description 重置筛选条件
     */
    resetFilter() {
      this.filterParams = {
        startTimeKey: null,
        endTimeKey: null,
        startTime: null,
        endTime: null
      };
      this.$nextTick(() => {
      });
    },
    /**
     * @description 确认筛选条件
     */
    confirmFilter() {
      this.$refs.filterPopup.close();
      this.orderList = [];
      this.pagination.current = 1;
      this.loadData();
    },
    /**
     * @description 弹窗状态变化处理
     */
    onFilterPopupChange(e) {
      this.showFilter = e.show;
      common_vendor.index.__f__("log", "at pages/order/list.vue:421", "弹窗状态改变：", e);
    }
  },
  onReachBottom() {
    if (this.orderList.length < this.pagination.total) {
      this.pagination.current++;
      this.loadData();
    }
  }
};
if (!Array) {
  const _easycom_uv_input2 = common_vendor.resolveComponent("uv-input");
  const _easycom_FilterOptions2 = common_vendor.resolveComponent("FilterOptions");
  const _easycom_uv_popup2 = common_vendor.resolveComponent("uv-popup");
  (_easycom_uv_input2 + _easycom_FilterOptions2 + _easycom_uv_popup2)();
}
const _easycom_uv_input = () => "../../uni_modules/uv-input/components/uv-input/uv-input.js";
const _easycom_FilterOptions = () => "../../components/FilterOptions/FilterOptions.js";
const _easycom_uv_popup = () => "../../uni_modules/uv-popup/components/uv-popup/uv-popup.js";
if (!Math) {
  (_easycom_uv_input + _easycom_FilterOptions + _easycom_uv_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($options.onSearchInput),
    b: common_vendor.o($options.onSearchConfirm),
    c: common_vendor.o(($event) => $data.searchKeyword = $event),
    d: common_vendor.p({
      placeholder: "输入站点名称/桩号搜索",
      border: "none",
      fontSize: "28rpx",
      prefixIcon: "search",
      prefixIconStyle: "font-size: 28rpx; color: #666;",
      customStyle: $data.searchInputStyle,
      modelValue: $data.searchKeyword
    }),
    e: common_vendor.o((...args) => $options.toggleFilter && $options.toggleFilter(...args)),
    f: common_vendor.o((...args) => $options.resetFilter && $options.resetFilter(...args)),
    g: common_vendor.o((...args) => $options.confirmFilter && $options.confirmFilter(...args)),
    h: common_vendor.o($options.onStartTimeChange),
    i: common_vendor.p({
      data: $data.startTimeOptions,
      defaultValue: $data.filterParams.startTimeKey
    }),
    j: common_vendor.o($options.onEndTimeChange),
    k: common_vendor.p({
      data: $data.endTimeOptions,
      defaultValue: $data.filterParams.endTimeKey
    }),
    l: common_vendor.sr("filterPopup", "456ecf67-1"),
    m: common_vendor.o($options.onFilterPopupChange),
    n: common_vendor.p({
      mode: "bottom",
      round: 20,
      customStyle: {
        height: "60%",
        padding: "20rpx"
      }
    }),
    o: common_vendor.f($data.tabs, (tab, k0, i0) => {
      return {
        a: common_vendor.t(tab.name),
        b: $data.activeTab === tab.key ? 1 : "",
        c: tab.key,
        d: common_vendor.o(($event) => $options.changeTab(tab.key), tab.key)
      };
    }),
    p: $data.occupyCount > 0
  }, $data.occupyCount > 0 ? {
    q: common_vendor.t($data.occupyCount),
    r: common_vendor.o((...args) => $options.goToOccupyPage && $options.goToOccupyPage(...args))
  } : {}, {
    s: common_vendor.f($data.orderList, (order, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(order.stationName),
        b: common_vendor.t(order.billTypeStr),
        c: common_vendor.o(($event) => $options.goToDetails(order), order.id),
        d: common_vendor.t($options.formatTimeRange(order.timeS, order.timeE)),
        e: common_vendor.t(order.busShowNo),
        f: common_vendor.t($options.formatAmount(order.actualBalance)),
        g: !$options.isCharging(order.billStatus)
      }, !$options.isCharging(order.billStatus) ? common_vendor.e({
        h: common_vendor.o(($event) => $options.goToComment(order.id), order.id),
        i: $options.isSettling(order.billStatus)
      }, $options.isSettling(order.billStatus) ? {
        j: common_vendor.o((...args) => $options.recharge && $options.recharge(...args), order.id)
      } : {}, {
        k: $options.isUnpaid(order.billStatus)
      }, $options.isUnpaid(order.billStatus) ? {
        l: common_vendor.o(($event) => $options.goToPay(order.billid, order.busId), order.id)
      } : {}) : {}, {
        m: order.id
      });
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-456ecf67"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/list.js.map

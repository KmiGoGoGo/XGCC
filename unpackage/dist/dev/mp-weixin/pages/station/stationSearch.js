"use strict";
const common_vendor = require("../../common/vendor.js");
const api_station = require("../../api/station.js");
const globalData = require("../../globalData.js");
const StationListItem = () => "../../components/station/StationListItem.js";
const _sfc_main = {
  name: "StationSearch",
  components: {
    StationListItem
  },
  data() {
    return {
      searchKeyword: "",
      stationList: [],
      searchHistory: [],
      loading: false,
      refreshing: false,
      pageNo: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
      hasMoreData: true,
      currentCityName: "东莞市",
      // 当前城市名称
      // 位置信息 - 可以从全局状态或上个页面获取
      currentLocation: {
        latitude: 23.02067,
        longitude: 113.75179,
        areaId: 100278,
        areaName: "东莞市"
      }
    };
  },
  computed: {
    showEmptyState() {
      return !this.loading && this.searchKeyword && this.stationList.length === 0;
    },
    showLoadMore() {
      return this.stationList.length > 0 && (this.loading || this.hasMoreData);
    },
    emptyText() {
      return this.searchKeyword ? `未找到"${this.searchKeyword}"相关站点` : "请输入关键词搜索站点";
    },
    loadMoreText() {
      if (this.loading) {
        return "加载中...";
      }
      return this.hasMoreData ? "上拉加载更多" : "没有更多数据了";
    }
  },
  async onLoad() {
    this.loadSearchHistory();
    await this.loadLocationInfo();
    await this.initCityInfo();
    await this.searchStations();
  },
  async onShow() {
    await this.initCityInfo();
    await this.searchStations();
  },
  methods: {
    // 跳转到城市选择页面
    goToCityPicker() {
      common_vendor.index.navigateTo({
        url: `/pages/common/cityPicker`
      });
    },
    // 初始化城市信息
    async initCityInfo() {
      try {
        const savedCityName = common_vendor.index.getStorageSync("currentCityName");
        if (savedCityName) {
          this.currentCityName = savedCityName;
          common_vendor.index.__f__("log", "at pages/station/stationSearch.vue:164", "从storage加载城市名称:", savedCityName);
        } else {
          common_vendor.index.__f__("log", "at pages/station/stationSearch.vue:166", "使用默认城市名称:", this.currentCityName);
        }
        this.currentLocation.areaName = this.currentCityName;
        const currentCity = common_vendor.index.getStorageSync("currentCity");
        this.currentLocation.areaId = currentCity.cityId;
        this.currentLocation.latitude = currentCity.latitude;
        this.currentLocation.longitude = currentCity.longitude;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/station/stationSearch.vue:176", "初始化城市信息失败:", error);
      }
    },
    // 搜索方法
    async onSearch() {
      if (this.searchKeyword.trim()) {
        this.saveToHistory(this.searchKeyword);
      }
      this.pageNo = 1;
      this.stationList = [];
      this.hasMoreData = true;
      await this.searchStations();
    },
    // 执行搜索
    async searchStations() {
      if (this.loading)
        return;
      this.loading = true;
      try {
        const requestData = {
          keyword: this.searchKeyword || "",
          // 允许空关键词搜索
          areaName: this.currentLocation.areaName,
          latitude: this.currentLocation.latitude,
          longitude: this.currentLocation.longitude,
          areaId: this.currentLocation.areaId,
          current: this.pageNo,
          pageSize: this.pageSize,
          sellerNo: globalData.globalData.sellerNo,
          sortMode: 0,
          appointment: false,
          freeParking: false,
          idle: false,
          memberQueryPreferenceDto: {}
        };
        const response = await api_station.getStationPage(requestData);
        if (response && response.code === 0) {
          const data = response.data;
          this.totalCount = data.totalCount;
          this.totalPages = data.pages || Math.ceil(data.totalCount / this.pageSize);
          if (this.pageNo === 1) {
            this.stationList = data.data || [];
          } else {
            this.stationList.push(...data.data || []);
          }
          this.hasMoreData = this.pageNo < this.totalPages;
        } else {
          common_vendor.index.showToast({
            title: (response == null ? void 0 : response.msg) || "搜索失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/station/stationSearch.vue:241", "搜索站点失败:", error);
        common_vendor.index.showToast({
          title: "搜索失败，请重试",
          icon: "none"
        });
      } finally {
        this.loading = false;
        this.refreshing = false;
      }
    },
    // 格式化站点数据以适配StationListItem组件
    formatStationData(station) {
      return {
        id: station.id,
        name: station.name,
        // 价格处理 - API返回的是 currentPriceStr
        currentPriceStr: station.currentPriceStr || "0.00",
        // 距离处理
        distanceDouble: station.distanceDouble || 0,
        // 充电桩数量
        superGunFastCount: station.superGunFastCount || 0,
        superFastFreeGunCount: station.superFastFreeGunCount || 0,
        fastGunCount: station.fastGunCount || 0,
        fastFreeGunCount: station.fastFreeGunCount || 0,
        slowGunCount: station.slowGunCount || 0,
        slowFreeGunCount: station.slowFreeGunCount || 0,
        // 其他属性
        notice: station.notice,
        businessTime: station.businessTime || ["营业时间未知"],
        status: station.status || 1,
        isRepair: station.isRepair || 1,
        isCollection: station.isCollection || false,
        // 超充站判断
        superStation: station.superStation || false,
        fastSlow: station.fastSlow,
        // 合作信息
        hulianId: station.hulianId,
        // 地址信息
        address: station.address,
        area: station.area,
        areaId: station.areaId,
        latitude: station.latitude,
        longitude: station.longitude
      };
    },
    // 加载更多
    async loadMore() {
      if (!this.hasMoreData || this.loading || !this.searchKeyword) {
        return;
      }
      this.pageNo += 1;
      await this.searchStations();
    },
    // 下拉刷新
    async onRefresh() {
      if (!this.searchKeyword) {
        this.refreshing = false;
        return;
      }
      this.refreshing = true;
      this.pageNo = 1;
      this.stationList = [];
      this.hasMoreData = true;
      await this.searchStations();
    },
    // 选择历史关键词
    selectHistoryKeyword(keyword) {
      this.searchKeyword = keyword;
      this.onSearch();
    },
    // 保存搜索历史
    saveToHistory(keyword) {
      if (!keyword || !keyword.trim())
        return;
      const history = this.searchHistory.filter((item) => item !== keyword);
      history.unshift(keyword);
      this.searchHistory = history.slice(0, 5);
      common_vendor.index.setStorage({
        key: "stationSearchHistory",
        data: this.searchHistory
      });
    },
    // 加载搜索历史
    loadSearchHistory() {
      try {
        common_vendor.index.getStorage({
          key: "stationSearchHistory",
          success: (res) => {
            if (res.data && Array.isArray(res.data)) {
              this.searchHistory = res.data;
            }
          },
          fail: (error) => {
            common_vendor.index.__f__("log", "at pages/station/stationSearch.vue:347", "搜索历史为空或加载失败:", error);
            this.searchHistory = [];
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/station/stationSearch.vue:352", "加载搜索历史失败:", error);
        this.searchHistory = [];
      }
    },
    // 清空历史
    clearHistory() {
      common_vendor.index.showModal({
        title: "确认清空",
        content: "确定要清空所有搜索历史吗？",
        success: (res) => {
          if (res.confirm) {
            this.searchHistory = [];
            common_vendor.index.removeStorage({
              key: "stationSearchHistory"
            });
            common_vendor.index.showToast({
              title: "已清空",
              icon: "success"
            });
          }
        }
      });
    },
    // 加载位置信息
    async loadLocationInfo() {
      try {
        const locationInfo = common_vendor.index.getStorageSync("currentLocation");
        if (locationInfo) {
          this.currentLocation = {
            ...this.currentLocation,
            ...locationInfo
          };
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/station/stationSearch.vue:389", "加载位置信息失败:", error);
      }
    },
    // 站点点击事件
    onStationClick(stationData) {
      let tagList = "";
      if (stationData.tag1) {
        tagList += stationData.tag1.map((item) => item.tagName).join(",");
      }
      if (stationData.tag2) {
        if (stationData.tag1) {
          tagList += ",";
        }
        tagList += stationData.tag2.map((item) => item.tagName).join(",");
      }
      common_vendor.index.__f__("log", "at pages/station/stationSearch.vue:406", `/pages/station/stationDetails?id=${stationData.id}&tagList=${tagList}`);
      common_vendor.index.navigateTo({
        url: `/pages/station/stationDetails?id=${stationData.id}&tagList=${tagList}`
      });
    }
  }
};
if (!Array) {
  const _easycom_uv_icon2 = common_vendor.resolveComponent("uv-icon");
  const _easycom_uv_search2 = common_vendor.resolveComponent("uv-search");
  const _component_StationListItem = common_vendor.resolveComponent("StationListItem");
  const _easycom_uv_loading_icon2 = common_vendor.resolveComponent("uv-loading-icon");
  (_easycom_uv_icon2 + _easycom_uv_search2 + _component_StationListItem + _easycom_uv_loading_icon2)();
}
const _easycom_uv_icon = () => "../../uni_modules/uv-icon/components/uv-icon/uv-icon.js";
const _easycom_uv_search = () => "../../uni_modules/uv-search/components/uv-search/uv-search.js";
const _easycom_uv_loading_icon = () => "../../uni_modules/uv-loading-icon/components/uv-loading-icon/uv-loading-icon.js";
if (!Math) {
  (_easycom_uv_icon + _easycom_uv_search + _easycom_uv_loading_icon)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.currentCityName),
    b: common_vendor.p({
      name: "arrow-down",
      color: "#333",
      size: "14"
    }),
    c: common_vendor.o((...args) => $options.goToCityPicker && $options.goToCityPicker(...args)),
    d: common_vendor.o($options.onSearch),
    e: common_vendor.o($options.onSearch),
    f: common_vendor.o(($event) => $data.searchKeyword = $event),
    g: common_vendor.p({
      showAction: true,
      placeholder: "请输入站点名称",
      actionText: "搜索",
      actionStyle: {
        color: "#000"
      },
      boxStyle: {
        borderRadius: "20rpx"
      },
      modelValue: $data.searchKeyword
    }),
    h: $data.searchHistory.length > 0
  }, $data.searchHistory.length > 0 ? {
    i: common_vendor.o((...args) => $options.clearHistory && $options.clearHistory(...args))
  } : {}, {
    j: $data.searchHistory.length > 0
  }, $data.searchHistory.length > 0 ? {
    k: common_vendor.f($data.searchHistory, (item, index, i0) => {
      return {
        a: common_vendor.t(item),
        b: index,
        c: common_vendor.o(($event) => $options.selectHistoryKeyword(item), index)
      };
    })
  } : {}, {
    l: $data.stationList.length > 0
  }, $data.stationList.length > 0 ? {
    m: common_vendor.t($data.totalCount),
    n: common_vendor.f($data.stationList, (station, index, i0) => {
      return {
        a: station.id,
        b: common_vendor.o($options.onStationClick, station.id),
        c: "04c0d692-2-" + i0,
        d: common_vendor.p({
          stationData: $options.formatStationData(station)
        })
      };
    })
  } : {}, {
    o: $options.showEmptyState
  }, $options.showEmptyState ? {
    p: common_vendor.t($options.emptyText)
  } : {}, {
    q: $options.showLoadMore
  }, $options.showLoadMore ? common_vendor.e({
    r: $data.loading
  }, $data.loading ? {
    s: common_vendor.p({
      mode: "circle"
    })
  } : {}, {
    t: common_vendor.t($options.loadMoreText)
  }) : {}, {
    v: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args)),
    w: $data.refreshing,
    x: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-04c0d692"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/station/stationSearch.js.map

"use strict";
const common_vendor = require("../../common/vendor.js");
const api_station = require("../../api/station.js");
const api_member = require("../../api/member.js");
const api_bill = require("../../api/bill.js");
const api_charge = require("../../api/charge.js");
const globalData = require("../../globalData.js");
const Tabbar = () => "../../components/tabbar/tabbar.js";
const loginPopup = () => "../../components/login-popup/login.js";
const StationListItem = () => "../../components/station/StationListItem.js";
const FilterOptions = () => "../../components/FilterOptions/FilterOptions.js";
const FloatingBillReminder = () => "../../components/floating-bill-reminder/floating-bill-reminder.js";
const OccupyBillPopup = () => "../../components/occupy-bill-popup/occupy-bill-popup.js";
const ChargingStatusBar = () => "../../components/charging-status-bar/ChargingStatusBar.js";
const _sfc_main = {
  components: {
    Tabbar,
    loginPopup,
    StationListItem,
    FilterOptions,
    FloatingBillReminder,
    OccupyBillPopup,
    ChargingStatusBar
  },
  data() {
    return {
      stationList: [],
      loadStatus: "loadmore",
      // loadmore-加载前, loading-加载中, nomore-没有更多数据
      // 悬浮账单提醒相关
      showBillReminder: false,
      unpaidBillCount: 0,
      // 超时占位订单相关
      occupyBillData: null,
      // 充电服务监控定时器
      chargeMonitorTimer: null,
      // 充电状态数据
      currentChargeData: null,
      bar_Height: common_vendor.index.getSystemInfoSync().statusBarHeight,
      widnowH: common_vendor.index.getSystemInfoSync().screenHeight,
      tabMenu: [{
        name: "全部站场",
        value: 2
      }, {
        name: "精选站点",
        value: 1
      }],
      navIndex: 1,
      tabIndex: 1,
      scrollInto: "",
      // 轮播图数据
      lunbao: [],
      // 轮播图配置
      indicatorDots: true,
      autoplay: true,
      circular: true,
      vertical: false,
      interval: 3e3,
      duration: 500,
      // 分页相关参数
      currentPage: 1,
      // 当前页码
      pageSize: 10,
      // 每页数量
      totalCount: 0,
      // 总数据量
      hasMore: true,
      // 是否还有更多数据
      isLoadingMore: false,
      // 防止重复加载的标志位
      isTabTapLoading: false,
      // 点击tab时的加载标志位
      // 筛选相关数据
      selectedDistance: null,
      selectedStationType: null,
      selectedChargingMode: null,
      selectedConstructionSite: null,
      selectedDiscount: null,
      selectedDistanceInfo: null,
      selectedStationTypeInfo: null,
      selectedChargingModeInfo: null,
      selectedConstructionSiteInfo: null,
      selectedDiscountInfo: null,
      // 城市信息
      currentCityName: "东莞市",
      // 默认城市
      // 距离筛选数据
      distanceList: {
        name: "距离",
        list: [{
          value: "不限",
          key: null
        }, {
          value: "1KM",
          key: 1
        }, {
          value: "3KM",
          key: 3
        }, {
          value: "5KM",
          key: 5
        }, {
          value: "10KM",
          key: 10
        }, {
          value: "20KM",
          key: 20
        }, {
          value: "50KM",
          key: 50
        }, {
          value: "100KM",
          key: 100
        }]
      },
      // 站点类型筛选数据
      stationTypeList: {
        name: "站点类型",
        list: [{
          value: "不限",
          key: null
        }, {
          value: "公共",
          key: 1
        }, {
          value: "个人",
          key: 2
        }, {
          value: "公交",
          key: 3
        }, {
          value: "环卫",
          key: 4
        }, {
          value: "物流",
          key: 5
        }, {
          value: "出租车",
          key: 6
        }, {
          value: "其他",
          key: 7
        }]
      },
      // 充电模式筛选数据
      chargingModeList: {
        name: "充电模式",
        list: [{
          value: "不限",
          key: null
        }, {
          value: "超充",
          key: "overTake"
        }, {
          value: "快充",
          key: "kuai"
        }, {
          value: "慢充",
          key: "man"
        }]
      },
      // 建设场所筛选数据
      constructionSiteList: {
        name: "建设场所",
        list: [{
          value: "不限",
          key: null
        }, {
          value: "居民区",
          key: 1
        }, {
          value: "公共机构",
          key: 2
        }, {
          value: "企事业单位",
          key: 3
        }, {
          value: "写字楼",
          key: 4
        }, {
          value: "工业园区",
          key: 5
        }, {
          value: "交通枢纽",
          key: 6
        }, {
          value: "大型文体设施",
          key: 7
        }, {
          value: "城市绿地",
          key: 8
        }, {
          value: "大型建筑配件停车场",
          key: 9
        }, {
          value: "路边停车位",
          key: 10
        }, {
          value: "城际高速服务区",
          key: 11
        }, {
          value: "其他",
          key: 12
        }]
      },
      // 优惠筛选数据
      discountList: {
        name: "优惠",
        list: [{
          value: "不限",
          key: 2
        }, {
          value: "有优惠",
          key: 3
        }, {
          value: "无优惠",
          key: 5
        }]
      }
    };
  },
  onLoad() {
    this.initCityInfo();
    this.getLocation();
    this.queryDynamicsActivity();
    common_vendor.index.hideTabBar();
  },
  onShow() {
    this.initCityInfo();
    this.fetchStationList();
    this.checkUnpaidBills();
    this.checkOccupyBills();
    this.checkChargeServiceMonitor();
    this.queryDynamicsActivity();
  },
  onReady() {
  },
  // 页面触底时触发
  onReachBottom() {
    common_vendor.index.__f__("log", "at pages/index/index.vue:468", "触底加载更多", {
      loadStatus: this.loadStatus,
      hasMore: this.hasMore,
      currentPage: this.currentPage,
      totalCount: this.totalCount,
      listLength: this.stationList.length,
      isLoadingMore: this.isLoadingMore
    });
    if (this.loadStatus === "loadmore" && this.hasMore && !this.isLoadingMore) {
      this.isLoadingMore = true;
      this.fetchStationList(true);
    } else if (this.loadStatus === "loading" || this.isLoadingMore) {
      common_vendor.index.__f__("log", "at pages/index/index.vue:482", "正在加载中，忽略触底事件");
    } else if (!this.hasMore) {
      common_vendor.index.__f__("log", "at pages/index/index.vue:484", "没有更多数据，忽略触底事件");
    }
  },
  // 下拉刷新
  onPullDownRefresh() {
    common_vendor.index.__f__("log", "at pages/index/index.vue:489", "下拉刷新");
    this.refreshData();
  },
  // 页面隐藏时清除定时器
  onHide() {
    this.clearChargeMonitorTimer();
  },
  // 页面销毁时清除定时器
  onUnload() {
    this.clearChargeMonitorTimer();
  },
  methods: {
    // 定义命名方法
    // 获取轮播图数据
    async queryDynamicsActivity() {
      const that = this;
      let cityName = common_vendor.index.getStorageSync("cityName") || common_vendor.index.getStorageSync("currentCityName") || "全国";
      try {
        const res = await api_member.queryDynamicsActivity(cityName);
        common_vendor.index.__f__("log", "at pages/index/index.vue:510", "queryDynamicsActivity111111", res);
        if (res.code == 0) {
          var swiperItem = res.data.data.indexAdvertising;
          if (swiperItem && swiperItem.length > 0) {
            swiperItem.forEach(function(element) {
              if (/^http/.test(element.image)) {
                that.lunbao = swiperItem;
              }
            });
          }
          that.lunbao = swiperItem || [];
          common_vendor.index.__f__("log", "at pages/index/index.vue:523", that.lunbao, "that.lunbao");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:526", "获取轮播图数据失败:", error);
        that.lunbao = [];
      }
    },
    // 轮播跳转详情
    advertisingLink: function(e) {
      e.currentTarget.dataset.type;
      e.currentTarget.dataset.link;
      e.currentTarget.dataset.path;
      e.currentTarget.dataset.details;
      e.currentTarget.dataset.title;
      e.currentTarget.dataset.time;
      e.currentTarget.dataset.status;
      e.currentTarget.dataset.mid;
      e.currentTarget.dataset.id;
      common_vendor.index.__f__("log", "at pages/index/index.vue:544", e);
      return;
    },
    // 检查充电服务监控
    async checkChargeServiceMonitor() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        return;
      }
      const telephone = common_vendor.index.getStorageSync("phoneNo");
      if (!telephone) {
        common_vendor.index.__f__("log", "at pages/index/index.vue:586", "未获取到用户手机号，跳过充电服务监控检查");
        return;
      }
      try {
        const response = await api_charge.pageChargeServiceMonitor({
          current: 1,
          memberNo: telephone,
          pageSize: 100
        });
        if (response && response.code === 0 && response.data && response.data.data) {
          const dataLength = response.data.data.length;
          common_vendor.index.__f__("log", "at pages/index/index.vue:599", "充电服务监控数据长度:", dataLength);
          if (dataLength > 0) {
            this.currentChargeData = response.data.data[0];
            this.startChargeMonitorTimer();
          } else {
            this.currentChargeData = null;
            this.clearChargeMonitorTimer();
          }
        } else {
          common_vendor.index.__f__("error", "at pages/index/index.vue:611", "获取充电服务监控数据失败:", response);
          this.currentChargeData = null;
          this.clearChargeMonitorTimer();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:616", "调用pageChargeServiceMonitor接口失败:", error);
        this.currentChargeData = null;
        this.clearChargeMonitorTimer();
      }
    },
    // 开启充电监控定时器
    startChargeMonitorTimer() {
      this.clearChargeMonitorTimer();
      common_vendor.index.__f__("log", "at pages/index/index.vue:627", "开启充电服务监控定时器，每5秒检查一次");
      this.chargeMonitorTimer = setInterval(async () => {
        const telephone = common_vendor.index.getStorageSync("phoneNo");
        if (!telephone) {
          common_vendor.index.__f__("log", "at pages/index/index.vue:631", "定时器中未获取到用户手机号，清除定时器");
          this.currentChargeData = null;
          this.clearChargeMonitorTimer();
          return;
        }
        try {
          const response = await api_charge.pageChargeServiceMonitor({
            current: 1,
            memberNo: telephone,
            pageSize: 100
          });
          if (response && response.code === 0 && response.data && response.data.data) {
            const dataLength = response.data.data.length;
            common_vendor.index.__f__("log", "at pages/index/index.vue:646", "定时器检查充电服务监控数据长度:", dataLength);
            if (dataLength === 0) {
              common_vendor.index.__f__("log", "at pages/index/index.vue:650", "充电服务监控数据为空，清除定时器");
              this.currentChargeData = null;
              this.clearChargeMonitorTimer();
            } else {
              this.currentChargeData = response.data.data[0];
            }
          } else {
            common_vendor.index.__f__("error", "at pages/index/index.vue:658", "定时器中获取充电服务监控数据失败:", response);
            this.currentChargeData = null;
            this.clearChargeMonitorTimer();
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/index/index.vue:663", "定时器中调用pageChargeServiceMonitor接口失败:", error);
          this.currentChargeData = null;
          this.clearChargeMonitorTimer();
        }
      }, 5e3);
    },
    // 清除充电监控定时器
    clearChargeMonitorTimer() {
      if (this.chargeMonitorTimer) {
        clearInterval(this.chargeMonitorTimer);
        this.chargeMonitorTimer = null;
        common_vendor.index.__f__("log", "at pages/index/index.vue:675", "充电服务监控定时器已清除");
      }
      this.currentChargeData = null;
    },
    // 检查未支付账单
    async checkUnpaidBills() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        this.showBillReminder = false;
        return;
      }
      try {
        const response = await api_member.getMyNotPayBillNumber({
          prePayVer: 1
          // 根据API文档要求添加参数
        });
        if (response && response.code === 0) {
          const billCount = response.data || 0;
          common_vendor.index.__f__("log", "at pages/index/index.vue:697", "未支付账单数量:", billCount);
          if (billCount >= 1) {
            this.unpaidBillCount = billCount;
            this.showBillReminder = true;
            common_vendor.index.__f__("log", "at pages/index/index.vue:702", "未支付账单数量大于1，显示悬浮窗");
          } else {
            this.showBillReminder = false;
          }
        } else {
          common_vendor.index.__f__("error", "at pages/index/index.vue:707", "获取未支付账单数量失败:", response);
          this.showBillReminder = false;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:711", "调用getMyNotPayBillNumber接口失败:", error);
        this.showBillReminder = false;
      }
    },
    // 处理悬浮窗点击事件
    handleBillReminderClick() {
      common_vendor.index.__f__("log", "at pages/index/index.vue:718", "点击悬浮账单提醒");
      common_vendor.index.navigateTo({
        url: "/pages/order/list?activeTab=unpaid"
      });
    },
    // 检查超时占位订单
    async checkOccupyBills() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        return;
      }
      try {
        const response = await api_bill.getMyOccupyBillPage({
          billStatus: 11,
          current: 1,
          pageSize: 10
        });
        if (response && response.code === 0 && response.data && response.data.records && response.data.records.length > 0) {
          const firstRecord = response.data.records[0];
          common_vendor.index.__f__("log", "at pages/index/index.vue:743", "超时占位订单数据:", firstRecord);
          this.occupyBillData = this.formatOccupyBillData(firstRecord, response.data.total);
          setTimeout(() => {
            this.$refs.occupyBillPopup.show();
          }, 500);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:754", "调用getMyOccupyBillPage接口失败:", error);
      }
    },
    // 格式化占位订单数据
    formatOccupyBillData(record, total) {
      const timeS = new Date(record.timeS);
      new Date(record.timeE);
      const formattedTime = `${timeS.getFullYear()}.${String(timeS.getMonth() + 1).padStart(2, "0")}.${String(timeS.getDate()).padStart(2, "0")} ${String(timeS.getHours()).padStart(2, "0")}:${String(timeS.getMinutes()).padStart(2, "0")}:${String(timeS.getSeconds()).padStart(2, "0")}`;
      const formattedFee = (record.busBalance / 100).toFixed(2);
      return {
        ...record,
        formattedTime,
        formattedFee,
        totalCount: total
      };
    },
    // 处理占位弹窗关闭事件
    handleOccupyPopupClose() {
      common_vendor.index.__f__("log", "at pages/index/index.vue:778", "占位订单弹窗关闭");
    },
    // 处理占位弹窗稍后再说
    handleOccupyPopupLater() {
      common_vendor.index.__f__("log", "at pages/index/index.vue:783", "稍后再说");
    },
    // 处理占位弹窗立即支付
    handleOccupyPopupPay(billData) {
      common_vendor.index.__f__("log", "at pages/index/index.vue:788", "立即支付占位费用:", billData);
      common_vendor.index.navigateTo({
        url: `/pages/bill/occupyBillPay?id=${billData.id}`
      });
    },
    // 初始化城市信息
    initCityInfo() {
      const savedCityName = common_vendor.index.getStorageSync("currentCityName");
      if (savedCityName) {
        this.currentCityName = savedCityName;
        common_vendor.index.__f__("log", "at pages/index/index.vue:800", "从storage加载城市名称:", savedCityName);
      } else {
        common_vendor.index.__f__("log", "at pages/index/index.vue:802", "使用默认城市名称:", this.currentCityName);
      }
    },
    // 更新城市名称（供其他页面调用）
    updateCityName(cityName) {
      this.currentCityName = cityName;
      common_vendor.index.setStorageSync("currentCityName", cityName);
      common_vendor.index.__f__("log", "at pages/index/index.vue:810", "城市名称已更新:", cityName);
    },
    goToCityPicker() {
      common_vendor.index.navigateTo({
        url: "/pages/common/cityPicker"
      });
    },
    getLocation() {
      const that = this;
      common_vendor.index.getLocation({
        isHighAccuracy: true,
        type: "gcj02",
        // 使用国测局坐标系
        success: function(res) {
          common_vendor.index.__f__("log", "at pages/index/index.vue:824", "纬度：" + res.latitude);
          common_vendor.index.__f__("log", "at pages/index/index.vue:825", "经度：" + res.longitude);
          common_vendor.index.__f__("log", "at pages/index/index.vue:826", "速度：" + res.speed);
          common_vendor.index.__f__("log", "at pages/index/index.vue:827", "精度：" + res.accuracy);
          const longitude = res.longitude;
          const latitude = res.latitude;
          common_vendor.index.setStorageSync("location", {
            latitude,
            longitude
          });
          common_vendor.index.setStorageSync("latitude", latitude);
          common_vendor.index.setStorageSync("longitude", longitude);
          const obj = {
            postStr: JSON.stringify({
              "lon": longitude,
              "lat": latitude,
              "ver": 1
            }),
            type: "geocode",
            tk: "abbe3251071d6b4efb714dbdb6c5417e"
          };
          common_vendor.index.request({
            url: `https://api.tianditu.gov.cn/geocoder?postStr=${obj.postStr}&type=geocode&tk=${obj.tk}`,
            method: "post",
            data: obj,
            header: {
              Accept: "application/json"
            },
            success: function(res2) {
              common_vendor.index.__f__("log", "at pages/index/index.vue:860", "逆地址解析结果:", res2);
              if (res2.data.status === "0") {
                const data = res2.data.result;
                const cityName = data.addressComponent.city;
                common_vendor.index.__f__("log", "at pages/index/index.vue:864", "解析到的城市名称:", cityName);
                common_vendor.index.setStorageSync("currentCityName", cityName);
                api_station.getStationArea().then((res3) => {
                  common_vendor.index.__f__("log", "at pages/index/index.vue:872", "stationArea11", res3);
                  const area = res3.data.find((item) => item.cityName === cityName);
                  common_vendor.index.setStorageSync("currentCity", {
                    cityId: area.cityId,
                    cityName,
                    latitude,
                    longitude
                  });
                });
                that.currentCityName = cityName;
                common_vendor.index.__f__("log", "at pages/index/index.vue:886", "城市名称已保存到storage:", cityName);
              } else {
                common_vendor.index.__f__("error", "at pages/index/index.vue:888", "逆地址解析失败:", res2.data);
                that.setDefaultCity(latitude, longitude);
              }
            },
            fail: function(err) {
              common_vendor.index.__f__("error", "at pages/index/index.vue:894", "逆地址解析请求失败:", err);
              that.setDefaultCity(latitude, longitude);
            }
          });
        },
        fail: function(err) {
          common_vendor.index.__f__("error", "at pages/index/index.vue:901", "获取位置失败", err);
          that.setDefaultCity();
        }
      });
    },
    // 设置默认城市信息
    setDefaultCity(latitude = 22.9167, longitude = 113.75) {
      const defaultCityName = "东莞市";
      common_vendor.index.__f__("log", "at pages/index/index.vue:911", "使用默认城市:", defaultCityName);
      common_vendor.index.setStorageSync("currentCityName", defaultCityName);
      common_vendor.index.setStorageSync("location", {
        latitude,
        longitude
      });
      common_vendor.index.setStorageSync("latitude", latitude);
      common_vendor.index.setStorageSync("longitude", longitude);
      common_vendor.index.setStorageSync("currentCity", {
        cityName: defaultCityName,
        latitude,
        longitude
      });
      this.currentCityName = defaultCityName;
    },
    async fetchStationList(isLoadMore = false) {
      if (isLoadMore && !this.hasMore) {
        this.loadStatus = "nomore";
        this.isLoadingMore = false;
        return;
      }
      this.loadStatus = "loading";
      if (!isLoadMore) {
        this.currentPage = 1;
        this.hasMore = true;
        this.isLoadingMore = false;
      }
      const memberQueryPreferenceDto = {
        "distance": this.selectedDistance,
        "fastSlow": this.selectedChargingMode,
        "stationType": this.selectedStationType,
        "construction": this.selectedConstructionSite,
        "discount": this.selectedDiscount
      };
      common_vendor.index.__f__("log", "at pages/index/index.vue:956", "fetchStationList - 当前筛选条件：", memberQueryPreferenceDto);
      const stationArea = await api_station.getStationArea();
      common_vendor.index.__f__("log", "at pages/index/index.vue:960", "stationArea2222", stationArea);
      const area = stationArea.data.find((item) => item.cityName === this.currentCityName);
      if (!area) {
        common_vendor.index.showToast({
          title: "当前城市暂无站点，请选择其他城市",
          icon: "none"
        });
        return;
      }
      common_vendor.index.setStorageSync("currentCity", {
        cityId: area.cityId,
        cityName: area.cityName,
        latitude: common_vendor.index.getStorageSync("location").latitude,
        longitude: common_vendor.index.getStorageSync("location").longitude
      });
      common_vendor.index.__f__("log", "at pages/index/index.vue:976", "currentCity22", common_vendor.index.getStorageSync("currentCity"));
      const payload = {
        "areaId": area.cityId,
        "areaName": area.cityName,
        "latitude": common_vendor.index.getStorageSync("location").latitude,
        "longitude": common_vendor.index.getStorageSync("location").longitude,
        "sellerNo": globalData.globalData.sellerNo,
        "type": this.navIndex,
        "memberQueryPreferenceDto": memberQueryPreferenceDto,
        "current": this.currentPage,
        "pageSize": this.pageSize
      };
      try {
        const token = common_vendor.index.getStorageSync("token");
        let res;
        if (token) {
          common_vendor.index.__f__("log", "at pages/index/index.vue:996", `用户已登录，调用 getIndexStationNew，第${this.currentPage}页`);
          res = await api_station.getIndexStationNew(payload);
        } else {
          common_vendor.index.__f__("log", "at pages/index/index.vue:1000", `用户未登录，调用 getIndexStationNoAuth，第${this.currentPage}页`);
          res = await api_station.getIndexStationNoAuth(payload);
        }
        common_vendor.index.__f__("log", "at pages/index/index.vue:1004", res);
        if (res.code === 0 && res.data) {
          let newData = [];
          let hasNextPage = false;
          if (token && res.data.data) {
            newData = res.data.data;
            this.totalCount = res.data.totalCount || 0;
            hasNextPage = newData.length >= this.pageSize && this.currentPage * this.pageSize < this.totalCount;
          } else {
            newData = res.data;
            hasNextPage = newData.length >= this.pageSize;
          }
          if (isLoadMore) {
            this.stationList = [...this.stationList, ...newData];
          } else {
            this.stationList = newData;
          }
          if (hasNextPage) {
            this.currentPage++;
            this.hasMore = true;
            this.loadStatus = "loadmore";
          } else {
            this.hasMore = false;
            this.loadStatus = "nomore";
          }
          common_vendor.index.__f__("log", "at pages/index/index.vue:1040", `当前共${this.stationList.length}条数据，总计${this.totalCount}条，${this.hasMore ? "还有更多" : "没有更多了"}`);
        } else {
          if (!isLoadMore) {
            this.stationList = [];
          }
          this.hasMore = false;
          this.loadStatus = "nomore";
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:1049", "获取充电站列表失败:", error);
        this.loadStatus = "loadmore";
        common_vendor.index.showToast({
          title: "加载失败，请重试",
          icon: "error",
          duration: 2e3
        });
      } finally {
        this.isLoadingMore = false;
      }
    },
    // 打开筛选弹窗
    openFilterPopup() {
      this.$refs.filterPopup.open();
    },
    // 关闭筛选弹窗
    closeFilterPopup() {
      this.$refs.filterPopup.close();
    },
    // 距离筛选变化回调
    onDistanceChange(option) {
      common_vendor.index.__f__("log", "at pages/index/index.vue:1076", "距离筛选变化：", option);
      this.selectedDistance = option.key;
      this.selectedDistanceInfo = option;
    },
    // 站点类型筛选变化回调
    onStationTypeChange(option) {
      common_vendor.index.__f__("log", "at pages/index/index.vue:1083", "站点类型筛选变化：", option);
      this.selectedStationType = option.key;
      this.selectedStationTypeInfo = option;
    },
    // 充电模式筛选变化回调
    onChargingModeChange(option) {
      common_vendor.index.__f__("log", "at pages/index/index.vue:1090", "充电模式筛选变化：", option);
      this.selectedChargingMode = option.key;
      this.selectedChargingModeInfo = option;
    },
    // 建设场所筛选变化回调
    onConstructionSiteChange(option) {
      common_vendor.index.__f__("log", "at pages/index/index.vue:1097", "建设场所筛选变化：", option);
      this.selectedConstructionSite = option.key;
      this.selectedConstructionSiteInfo = option;
    },
    // 优惠筛选变化回调
    onDiscountChange(option) {
      common_vendor.index.__f__("log", "at pages/index/index.vue:1104", "优惠筛选变化：", option);
      this.selectedDiscount = option.key;
      this.selectedDiscountInfo = option;
    },
    // 重置筛选条件
    resetFilters() {
      this.selectedDistance = null;
      this.selectedStationType = null;
      this.selectedChargingMode = null;
      this.selectedConstructionSite = null;
      this.selectedDiscount = null;
      this.selectedDistanceInfo = null;
      this.selectedStationTypeInfo = null;
      this.selectedChargingModeInfo = null;
      this.selectedConstructionSiteInfo = null;
      this.selectedDiscountInfo = null;
      this.confirmFilter();
    },
    // 确认筛选
    confirmFilter() {
      common_vendor.index.__f__("log", "at pages/index/index.vue:1128", "确认筛选条件：", {
        distance: this.selectedDistanceInfo,
        stationType: this.selectedStationTypeInfo,
        chargingMode: this.selectedChargingModeInfo,
        constructionSite: this.selectedConstructionSiteInfo,
        discount: this.selectedDiscountInfo
      });
      const filterParams = {
        distance: this.selectedDistance,
        fastSlow: this.selectedChargingMode,
        stationType: this.selectedStationType,
        construction: this.selectedConstructionSite,
        discount: this.selectedDiscount
      };
      common_vendor.index.__f__("log", "at pages/index/index.vue:1145", "实际传递给API的筛选参数：", filterParams);
      this.closeFilterPopup();
      this.fetchStationList();
      let filterText = [];
      if (this.selectedDistanceInfo) {
        filterText.push(`距离：${this.selectedDistanceInfo.value}`);
      }
      if (this.selectedStationTypeInfo) {
        filterText.push(`类型：${this.selectedStationTypeInfo.value}`);
      }
      if (this.selectedChargingModeInfo) {
        filterText.push(`模式：${this.selectedChargingModeInfo.value}`);
      }
      if (this.selectedConstructionSiteInfo) {
        filterText.push(`场所：${this.selectedConstructionSiteInfo.value}`);
      }
      if (this.selectedDiscountInfo) {
        filterText.push(`优惠：${this.selectedDiscountInfo.value}`);
      }
      if (filterText.length > 0) {
        common_vendor.index.showToast({
          title: `已筛选 ${filterText.join("，")}`,
          icon: "none",
          duration: 2e3
        });
      } else {
        common_vendor.index.showToast({
          title: "已重置筛选条件",
          icon: "none",
          duration: 2e3
        });
      }
    },
    ontabtap(e) {
      common_vendor.index.__f__("log", "at pages/index/index.vue:1186", e);
      let index = e.index;
      this.tabIndex = index;
      this.navIndex = e.value;
      this.stationList = [];
      this.isTabTapLoading = true;
      this.fetchStationList();
      this.isTabTapLoading = false;
    },
    // 处理加载更多事件
    onLoadMore() {
      common_vendor.index.__f__("log", "at pages/index/index.vue:1199", "点击加载更多");
      if (this.loadStatus === "loadmore" && this.hasMore && !this.isLoadingMore) {
        this.isLoadingMore = true;
        this.fetchStationList(true);
      }
    },
    // 刷新数据
    async refreshData() {
      try {
        await this.fetchStationList(false);
        common_vendor.index.stopPullDownRefresh();
        common_vendor.index.showToast({
          title: "刷新成功",
          icon: "success",
          duration: 1500
        });
      } catch (error) {
        common_vendor.index.stopPullDownRefresh();
        common_vendor.index.showToast({
          title: "刷新失败",
          icon: "error",
          duration: 1500
        });
      }
    },
    goToSearch() {
      common_vendor.index.navigateTo({
        url: `/pages/station/stationSearch`
      });
    },
    // 充电站点击事件
    onStationClick(stationData) {
      let tagList = "";
      if (stationData.tagList) {
        tagList = stationData.tagList.map((item) => item.tagName).join(",");
      }
      common_vendor.index.__f__("log", "at pages/index/index.vue:1237", `/pages/station/stationDetails?id=${stationData.id}&tagList=${tagList}`);
      common_vendor.index.navigateTo({
        url: `/pages/station/stationDetails?id=${stationData.id}&tagList=${tagList}`
      });
    },
    // 充电站收藏事件
    onStationFavorite({ station, isCollection }) {
      this.updateStationCollection(station.id, isCollection);
    },
    // 更新收藏状态
    async updateStationCollection(stationId, isCollection) {
      try {
        const station = this.stationList.find((item) => item.id === stationId);
        if (station) {
          station.isCollection = isCollection;
        }
        common_vendor.index.showToast({
          title: isCollection ? "收藏成功" : "取消收藏",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:1276", "收藏操作失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "error"
        });
      }
    },
    // 导航栏左侧点击事件
    onNavbarLeftClick() {
      common_vendor.index.__f__("log", "at pages/index/index.vue:1286", "导航栏左侧点击");
    },
    // 导航栏右侧点击事件
    onNavbarRightClick() {
      common_vendor.index.__f__("log", "at pages/index/index.vue:1292", "导航栏右侧点击");
    }
  }
};
if (!Array) {
  const _easycom_uv_icon2 = common_vendor.resolveComponent("uv-icon");
  const _easycom_uv_search2 = common_vendor.resolveComponent("uv-search");
  const _easycom_uv_navbar2 = common_vendor.resolveComponent("uv-navbar");
  const _component_ChargingStatusBar = common_vendor.resolveComponent("ChargingStatusBar");
  const _easycom_uv_tabs2 = common_vendor.resolveComponent("uv-tabs");
  const _component_StationListItem = common_vendor.resolveComponent("StationListItem");
  const _easycom_uv_list_item2 = common_vendor.resolveComponent("uv-list-item");
  const _easycom_uv_load_more2 = common_vendor.resolveComponent("uv-load-more");
  const _easycom_uv_list2 = common_vendor.resolveComponent("uv-list");
  const _easycom_FilterOptions2 = common_vendor.resolveComponent("FilterOptions");
  const _easycom_uv_popup2 = common_vendor.resolveComponent("uv-popup");
  const _component_FloatingBillReminder = common_vendor.resolveComponent("FloatingBillReminder");
  const _component_OccupyBillPopup = common_vendor.resolveComponent("OccupyBillPopup");
  const _component_Tabbar = common_vendor.resolveComponent("Tabbar");
  const _component_loginPopup = common_vendor.resolveComponent("loginPopup");
  (_easycom_uv_icon2 + _easycom_uv_search2 + _easycom_uv_navbar2 + _component_ChargingStatusBar + _easycom_uv_tabs2 + _component_StationListItem + _easycom_uv_list_item2 + _easycom_uv_load_more2 + _easycom_uv_list2 + _easycom_FilterOptions2 + _easycom_uv_popup2 + _component_FloatingBillReminder + _component_OccupyBillPopup + _component_Tabbar + _component_loginPopup)();
}
const _easycom_uv_icon = () => "../../uni_modules/uv-icon/components/uv-icon/uv-icon.js";
const _easycom_uv_search = () => "../../uni_modules/uv-search/components/uv-search/uv-search.js";
const _easycom_uv_navbar = () => "../../uni_modules/uv-navbar/components/uv-navbar/uv-navbar.js";
const _easycom_uv_tabs = () => "../../uni_modules/uv-tabs/components/uv-tabs/uv-tabs.js";
const _easycom_uv_list_item = () => "../../uni_modules/uv-list/components/uv-list-item/uv-list-item.js";
const _easycom_uv_load_more = () => "../../uni_modules/uv-load-more/components/uv-load-more/uv-load-more.js";
const _easycom_uv_list = () => "../../uni_modules/uv-list/components/uv-list/uv-list.js";
const _easycom_FilterOptions = () => "../../components/FilterOptions/FilterOptions.js";
const _easycom_uv_popup = () => "../../uni_modules/uv-popup/components/uv-popup/uv-popup.js";
if (!Math) {
  (_easycom_uv_icon + _easycom_uv_search + _easycom_uv_navbar + _easycom_uv_tabs + _easycom_uv_list_item + _easycom_uv_load_more + _easycom_uv_list + _easycom_FilterOptions + _easycom_uv_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.currentCityName),
    b: common_vendor.p({
      name: "arrow-down",
      color: "#fff",
      size: "14"
    }),
    c: common_vendor.o((...args) => $options.goToCityPicker && $options.goToCityPicker(...args)),
    d: common_vendor.o($options.goToSearch),
    e: common_vendor.p({
      showAction: false,
      placeholder: "请输入站点名称",
      disabled: true,
      actionStyle: {
        backgroundColor: "#007AFF",
        color: "#fff",
        borderRadius: "20rpx"
      },
      boxStyle: {
        borderRadius: "20rpx"
      }
    }),
    f: common_vendor.o($options.onNavbarLeftClick),
    g: common_vendor.o($options.onNavbarRightClick),
    h: common_vendor.p({
      title: "超易充电",
      fixed: true,
      safeAreaInsetTop: true,
      placeholder: true,
      bgColor: "#F3F3F3",
      border: false,
      autoBack: false
    }),
    i: common_vendor.p({
      chargeData: $data.currentChargeData
    }),
    j: $data.lunbao.length
  }, $data.lunbao.length ? {
    k: common_vendor.f($data.lunbao, (item, index, i0) => {
      return {
        a: item.image,
        b: index,
        c: common_vendor.o((...args) => $options.advertisingLink && $options.advertisingLink(...args), index),
        d: item.title,
        e: item.status,
        f: item.timeS,
        g: item.advertisingLink,
        h: item.connectionType,
        i: item.mobilePath,
        j: item.details,
        k: item.id,
        l: item.marketingId
      };
    }),
    l: $data.indicatorDots,
    m: $data.autoplay,
    n: $data.circular,
    o: $data.vertical,
    p: $data.interval,
    q: $data.duration
  } : {}, {
    r: common_vendor.o($options.ontabtap),
    s: common_vendor.p({
      list: $data.tabMenu,
      current: $data.tabIndex,
      activeStyle: {
        color: "#007AFF",
        fontWeight: "bold",
        transform: "scale(1.05)"
      },
      inactiveStyle: {
        color: "#6A6266",
        transform: "scale(1)"
      }
    }),
    t: common_vendor.o((...args) => $options.openFilterPopup && $options.openFilterPopup(...args)),
    v: common_vendor.f($data.stationList, (item, index, i0) => {
      return {
        a: common_vendor.o($options.onStationClick, index),
        b: common_vendor.o($options.onStationFavorite, index),
        c: "b05ded88-7-" + i0 + "," + ("b05ded88-6-" + i0),
        d: common_vendor.p({
          stationData: item
        }),
        e: index,
        f: "b05ded88-6-" + i0 + ",b05ded88-5"
      };
    }),
    w: common_vendor.p({
      customStyle: {
        "background": "linear-gradient(180deg, #F3F3F3 0%, #F3F3F3 30%)",
        "padding": "0"
      }
    }),
    x: common_vendor.o($options.onLoadMore),
    y: common_vendor.p({
      status: $data.loadStatus,
      ["loadmore-text"]: "上拉或点击加载更多",
      ["loading-text"]: "正在加载...",
      ["nomore-text"]: "没有更多数据了",
      ["margin-top"]: 20,
      ["margin-bottom"]: 20
    }),
    z: common_vendor.p({
      customStyle: {
        "background": "#F3F3F3"
      }
    }),
    A: common_vendor.o((...args) => _ctx.loadMore && _ctx.loadMore(...args)),
    B: common_vendor.o($options.closeFilterPopup),
    C: common_vendor.p({
      name: "close",
      size: "20"
    }),
    D: common_vendor.o($options.onDistanceChange),
    E: common_vendor.p({
      data: $data.distanceList,
      defaultValue: $data.selectedDistance
    }),
    F: common_vendor.o($options.onStationTypeChange),
    G: common_vendor.p({
      data: $data.stationTypeList,
      defaultValue: $data.selectedStationType
    }),
    H: common_vendor.o($options.onChargingModeChange),
    I: common_vendor.p({
      data: $data.chargingModeList,
      defaultValue: $data.selectedChargingMode
    }),
    J: common_vendor.o($options.onConstructionSiteChange),
    K: common_vendor.p({
      data: $data.constructionSiteList,
      defaultValue: $data.selectedConstructionSite
    }),
    L: common_vendor.o($options.onDiscountChange),
    M: common_vendor.p({
      data: $data.discountList,
      defaultValue: $data.selectedDiscount
    }),
    N: common_vendor.o((...args) => $options.resetFilters && $options.resetFilters(...args)),
    O: common_vendor.o((...args) => $options.confirmFilter && $options.confirmFilter(...args)),
    P: common_vendor.sr("filterPopup", "b05ded88-9"),
    Q: common_vendor.p({
      mode: "bottom",
      round: 20,
      safeAreaInsetBottom: true
    }),
    R: common_vendor.o($options.handleBillReminderClick),
    S: common_vendor.p({
      visible: $data.showBillReminder,
      billCount: $data.unpaidBillCount
    }),
    T: common_vendor.sr("occupyBillPopup", "b05ded88-17"),
    U: common_vendor.o($options.handleOccupyPopupClose),
    V: common_vendor.o($options.handleOccupyPopupLater),
    W: common_vendor.o($options.handleOccupyPopupPay),
    X: common_vendor.p({
      billData: $data.occupyBillData
    }),
    Y: common_vendor.p({
      activeId: 0
    }),
    Z: common_vendor.sr("loginPopup", "b05ded88-19")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map

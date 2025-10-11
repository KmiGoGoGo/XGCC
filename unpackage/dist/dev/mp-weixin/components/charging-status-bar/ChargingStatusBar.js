"use strict";
const common_vendor = require("../../common/vendor.js");
const api_bill = require("../../api/bill.js");
const _sfc_main = {
  name: "ChargingStatusBar",
  props: {
    chargeData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      // 拖拽相关数据
      positionX: 20,
      // 初始X位置
      positionY: 100,
      // 初始Y位置
      startX: 0,
      // 触摸开始X位置
      startY: 0,
      // 触摸开始Y位置
      isDragging: false,
      // 是否正在拖拽
      screenWidth: 0,
      // 屏幕宽度
      screenHeight: 0,
      // 屏幕高度
      elementWidth: 0,
      // 组件宽度
      elementHeight: 0
      // 组件高度
    };
  },
  computed: {
    // 充电电量
    chargePower() {
      var _a;
      return ((_a = this.chargeData) == null ? void 0 : _a.power) || "0.00";
    },
    // SOC电量百分比
    soc() {
      var _a;
      return ((_a = this.chargeData) == null ? void 0 : _a.soc) || 0;
    },
    // 格式化已充时间
    formattedChargingTime() {
      var _a;
      const chargingTime = parseInt(((_a = this.chargeData) == null ? void 0 : _a.chargingTime) || 0);
      return this.formatTime(chargingTime);
    },
    // 格式化剩余时间
    formattedRetainTime() {
      var _a;
      const retainTime = parseInt(((_a = this.chargeData) == null ? void 0 : _a.retainTime) || 0);
      return this.formatTime(retainTime);
    }
  },
  mounted() {
    this.initScreenInfo();
    common_vendor.index.__f__("log", "at components/charging-status-bar/ChargingStatusBar.vue:95", "充电数据", this.chargeData);
  },
  methods: {
    // 初始化屏幕信息
    initScreenInfo() {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      this.screenWidth = systemInfo.screenWidth;
      this.screenHeight = systemInfo.screenHeight;
      this.elementWidth = Math.min(this.screenWidth - 40, 600);
      this.elementHeight = 140;
      this.positionY = systemInfo.statusBarHeight + 100;
      const maxX = this.screenWidth - this.elementWidth;
      if (this.positionX > maxX) {
        this.positionX = Math.max(20, maxX - 20);
      }
    },
    // 触摸开始
    onTouchStart(e) {
      this.isDragging = true;
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
    },
    // 触摸移动
    onTouchMove(e) {
      if (!this.isDragging)
        return;
      e.preventDefault();
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - this.startX;
      const deltaY = currentY - this.startY;
      let newX = this.positionX + deltaX;
      let newY = this.positionY + deltaY;
      const maxX = this.screenWidth - this.elementWidth;
      const maxY = this.screenHeight - this.elementHeight;
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));
      this.positionX = newX;
      this.positionY = newY;
      this.startX = currentX;
      this.startY = currentY;
    },
    // 触摸结束
    onTouchEnd(e) {
      this.isDragging = false;
      this.snapToEdge();
    },
    // 吸边功能
    snapToEdge() {
      const centerX = this.positionX + this.elementWidth / 2;
      const screenCenter = this.screenWidth / 2;
      if (centerX < screenCenter) {
        this.positionX = 20;
      } else {
        this.positionX = this.screenWidth - this.elementWidth - 20;
      }
    },
    // 格式化时间（秒转换为时:分:秒）
    formatTime(seconds) {
      if (seconds <= 0)
        return "00:00:00";
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor(seconds % 3600 / 60);
      const remainingSeconds = seconds % 60;
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    },
    // 跳转到充电详情页面
    async goToChargingDetail() {
      if (!this.chargeData) {
        common_vendor.index.showToast({
          title: "充电数据异常",
          icon: "none"
        });
        return;
      }
      const routeParams = {
        pileNo: this.chargeData.pileNo,
        gunNo: this.chargeData.gunNo,
        busId: this.chargeData.billNo,
        gunId: this.chargeData.gunId,
        // gunId可能等同于gunNo
        billId: this.chargeData.billId,
        // billId可能是billNo
        animationEnabled: false
      };
      if (!routeParams.pileNo || !routeParams.gunNo && routeParams.gunNo !== "0" || !routeParams.busId) {
        common_vendor.index.__f__("error", "at components/charging-status-bar/ChargingStatusBar.vue:215", "充电详情跳转参数不完整:", routeParams);
        common_vendor.index.showToast({
          title: "充电数据不完整，无法跳转",
          icon: "none"
        });
        return;
      }
      if (!routeParams.billId || routeParams.billId === void 0) {
        const billRes = await api_bill.getBillByNo(routeParams.busId);
        if (billRes.code === 0) {
          routeParams.billId = billRes.data.id;
          routeParams.gunId = billRes.data.gunId;
        } else {
          common_vendor.index.showToast({
            title: "获取账单失败",
            icon: "none"
          });
          return;
        }
      }
      const queryString = Object.keys(routeParams).map((key) => `${key}=${encodeURIComponent(routeParams[key])}`).join("&");
      common_vendor.index.navigateTo({
        url: `/pages/charge/charging?${queryString}`
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.chargeData
  }, $props.chargeData ? {
    b: common_vendor.o((...args) => $options.goToChargingDetail && $options.goToChargingDetail(...args)),
    c: common_vendor.t($options.chargePower),
    d: common_vendor.t($options.soc),
    e: common_vendor.t($options.formattedChargingTime),
    f: common_vendor.t($options.formattedRetainTime),
    g: $data.positionX + "px",
    h: $data.positionY + "px",
    i: common_vendor.o((...args) => $options.onTouchStart && $options.onTouchStart(...args)),
    j: common_vendor.o((...args) => $options.onTouchMove && $options.onTouchMove(...args)),
    k: common_vendor.o((...args) => $options.onTouchEnd && $options.onTouchEnd(...args))
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-cb2f55a8"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/charging-status-bar/ChargingStatusBar.js.map

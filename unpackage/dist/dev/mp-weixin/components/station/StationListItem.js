"use strict";
const common_vendor = require("../../common/vendor.js");
const Card = () => "../common/Card.js";
const _sfc_main = {
  name: "StationListItem",
  components: {
    Card
  },
  props: {
    stationData: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  data() {
    return {
      defaultImage: "https://comppad.didistatic.com/static/comp-pad/default-station.png"
    };
  },
  computed: {
    // 合作类型（合作/自营）
    cooperationType() {
      if (this.stationData.hulianId) {
        return "合作";
      }
      return "自营";
    },
    // 是否有折扣价格
    hasDiscountPrice() {
      return this.stationData.discountPriceStr && this.stationData.discountPriceStr !== "" && this.stationData.discountPriceStr !== "0.00";
    },
    // 是否为超充站
    isSuperStation() {
      return this.stationData.fastSlow === "overTake" || this.stationData.superGunFastCount > 0 || this.stationData.superStation;
    },
    // 是否为特惠站
    isDiscountStation() {
      return this.stationData.hulianId == null;
    },
    // 总充电桩数量
    totalGuns() {
      return (this.stationData.superGunFastCount || 0) + (this.stationData.fastGunCount || 0) + (this.stationData.slowGunCount || 0);
    },
    // 空闲充电桩数量
    totalFreeGuns() {
      return (this.stationData.superFastFreeGunCount || 0) + (this.stationData.fastFreeGunCount || 0) + (this.stationData.slowFreeGunCount || 0);
    },
    // 营业时间文本
    businessTimeText() {
      if (this.stationData.businessTime && this.stationData.businessTime.length > 0) {
        return this.stationData.businessTime[0];
      }
      return "营业时间未知";
    },
    // 是否同时拥有超充和快充
    hasBothGunTypes() {
      return this.stationData.superGunFastCount > 0 && this.stationData.fastGunCount > 0;
    },
    // 超充空闲枪文字颜色
    superFreeGunTextColor() {
      const freeCount = this.stationData.superFastFreeGunCount || 0;
      const totalCount = this.stationData.superGunFastCount || 0;
      if (freeCount >= totalCount / 2 || freeCount > 5) {
        return "#1BA035";
      } else if (freeCount == 0) {
        return "#FF4D4F";
      }
      return "#FBA954";
    },
    // 快充空闲枪文字颜色
    fastFreeGunTextColor() {
      const freeCount = this.stationData.fastFreeGunCount || 0;
      const totalCount = this.stationData.fastGunCount || 0;
      if (freeCount >= totalCount / 2 || freeCount > 5) {
        return "#1BA035";
      } else if (freeCount == 0) {
        return "#FF4D4F";
      }
      return "#FBA954";
    },
    // 慢充空闲枪文字颜色
    slowFreeGunTextColor() {
      const freeCount = this.stationData.slowFreeGunCount || 0;
      const totalCount = this.stationData.slowGunCount || 0;
      if (freeCount >= totalCount / 2 || freeCount > 5) {
        return "#1BA035";
      } else if (freeCount == 0) {
        return "#FF4D4F";
      }
      return "#FBA954";
    }
  },
  methods: {
    // 点击充电站事件
    onStationClick() {
      this.$emit("click", this.stationData);
    },
    // 切换收藏状态
    toggleFavorite() {
      this.$emit("favorite", {
        station: this.stationData,
        isCollection: !this.stationData.isCollection
      });
    },
    // 图片加载失败处理
    onImageError() {
      common_vendor.index.__f__("log", "at components/station/StationListItem.vue:229", "充电站图片加载失败，使用默认图片");
    },
    // 获取服务状态样式类
    getStatusClass() {
      if (this.stationData.status === 1) {
        return "status-normal";
      }
      return "status-abnormal";
    },
    // 获取服务状态文本
    getStatusText() {
      if (this.stationData.isRepair === 0) {
        return "维修中";
      }
      if (this.stationData.status === 1) {
        return "正常营业";
      }
      return "暂停服务";
    }
  }
};
if (!Array) {
  const _easycom_uv_button2 = common_vendor.resolveComponent("uv-button");
  const _component_Card = common_vendor.resolveComponent("Card");
  (_easycom_uv_button2 + _component_Card)();
}
const _easycom_uv_button = () => "../../uni_modules/uv-button/components/uv-button/uv-button.js";
if (!Math) {
  _easycom_uv_button();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $options.isSuperStation
  }, $options.isSuperStation ? {} : {}, {
    b: common_vendor.t($props.stationData.name),
    c: $props.stationData.distanceDouble
  }, $props.stationData.distanceDouble ? {
    d: common_vendor.p({
      color: $options.isSuperStation ? "#FFFFFF" : "#F2F8FF",
      shape: "circle",
      size: "mini",
      customTextStyle: "color: #5aaaff; font-size: 22rpx; font-weight: bold;",
      text: $props.stationData.distanceDouble.toFixed(2) + " km"
    })
  } : {}, {
    e: $options.hasDiscountPrice
  }, $options.hasDiscountPrice ? {
    f: common_vendor.t($props.stationData.discountPriceStr),
    g: common_vendor.t($props.stationData.currentPriceStr)
  } : {
    h: common_vendor.t($props.stationData.currentPriceStr)
  }, {
    i: $props.stationData.superGunFastCount > 0
  }, $props.stationData.superGunFastCount > 0 ? {
    j: common_vendor.t($props.stationData.superFastFreeGunCount || 0),
    k: common_vendor.t($props.stationData.superGunFastCount)
  } : {}, {
    l: $props.stationData.fastGunCount > 0
  }, $props.stationData.fastGunCount > 0 ? {
    m: common_vendor.t($props.stationData.fastFreeGunCount || 0),
    n: common_vendor.t($props.stationData.fastGunCount)
  } : {}, {
    o: $props.stationData.slowGunCount > 0
  }, $props.stationData.slowGunCount > 0 ? {
    p: common_vendor.t($props.stationData.slowFreeGunCount || 0),
    q: common_vendor.t($props.stationData.slowGunCount)
  } : {}, {
    r: $props.stationData.notice
  }, $props.stationData.notice ? {
    s: common_vendor.t($props.stationData.notice)
  } : {}, {
    t: common_vendor.o($options.onStationClick),
    v: common_vendor.p({
      clickable: true
    })
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-0fd4b604"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/station/StationListItem.js.map

"use strict";
const common_vendor = require("../../common/vendor.js");
const api_stationGun = require("../../api/stationGun.js");
const StagePriceInfo = () => "../../components/station/StagePriceInfo.js";
const _sfc_main = {
  components: {
    StagePriceInfo
  },
  data() {
    return {
      gunId: null,
      gunDetails: null,
      hulianinterfaceId: ""
    };
  },
  computed: {
    gunTypeStr() {
      if (!this.gunDetails)
        return "未知";
      switch (this.gunDetails.gunType) {
        case 1:
          return "快充";
        case 2:
          return "慢充";
        case 3:
          return "超充";
        default:
          return "未知";
      }
    },
    gunCurrentTypeStr() {
      if (!this.gunDetails)
        return "未知";
      switch (this.gunDetails.gunType) {
        case 1:
        case 3:
          return "直流";
        case 2:
          return "交流";
        default:
          return "未知";
      }
    },
    currentPrice() {
      if (!this.gunDetails || !this.gunDetails.powerStageDetail)
        return "N/A";
      const currentStage = this.gunDetails.powerStageDetail.find((p) => p.now);
      return currentStage ? currentStage.currentPriceStr : "N/A";
    }
  },
  onLoad(options) {
    if (options.gunId) {
      this.gunId = options.gunId;
      this.fetchGunDetails();
    } else {
      common_vendor.index.showToast({
        title: "缺少必要参数",
        icon: "error"
      });
      common_vendor.index.navigateBack();
    }
    if (options.hulianinterfaceId) {
      this.hulianinterfaceId = options.hulianinterfaceId;
    }
  },
  methods: {
    async fetchGunDetails() {
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        const res = await api_stationGun.getStationGunDetails({
          gunId: this.gunId
        });
        if (res.code === 0) {
          this.gunDetails = res.data;
          common_vendor.index.__f__("log", "at pages/station/stationGunDetails.vue:144", "this.gunDetails", this.gunDetails);
        } else {
          common_vendor.index.showToast({
            title: res.msg || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/station/stationGunDetails.vue:152", "获取充电枪详情失败", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    startCharging() {
      if (!this.gunDetails) {
        common_vendor.index.showToast({
          title: "枪信息未加载完成",
          icon: "error"
        });
        return;
      }
      const gunParams = {
        gunId: this.gunId,
        gunNo: this.gunDetails.gunNo,
        gunName: this.gunDetails.gunName,
        gunType: this.gunDetails.gunType,
        pileName: this.gunDetails.pileName,
        pileNum: this.gunDetails.pileNum,
        maxPower: this.gunDetails.maxPower,
        current: this.gunDetails.current,
        valleyVol: this.gunDetails.valleyVol,
        peakVol: this.gunDetails.peakVol,
        currentPrice: this.currentPrice,
        stationId: this.gunDetails.stationId || "",
        stationName: this.gunDetails.stationName || "",
        hulianinterfaceId: this.hulianinterfaceId || ""
      };
      const queryString = Object.keys(gunParams).map((key) => `${key}=${encodeURIComponent(gunParams[key] || "")}`).join("&");
      common_vendor.index.navigateTo({
        url: `/pages/charge/gunStartingCharge?${queryString}`
      });
      common_vendor.index.__f__("log", "at pages/station/stationGunDetails.vue:198", "传递的枪信息:", gunParams);
    }
  }
};
if (!Array) {
  const _component_stage_price_info = common_vendor.resolveComponent("stage-price-info");
  _component_stage_price_info();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.gunDetails
  }, $data.gunDetails ? {
    b: common_vendor.t($data.gunDetails.gunName),
    c: common_vendor.t($options.gunTypeStr),
    d: common_vendor.t($options.gunCurrentTypeStr),
    e: common_vendor.t($data.gunDetails.pileName),
    f: common_vendor.t($data.gunDetails.pileNum),
    g: common_vendor.t($data.gunDetails.maxPower),
    h: common_vendor.t($data.gunDetails.current),
    i: common_vendor.t($data.gunDetails.valleyVol),
    j: common_vendor.t($data.gunDetails.peakVol),
    k: common_vendor.f($data.gunDetails.powerStageDetail, (price, index, i0) => {
      return {
        a: "92b9246b-0-" + i0,
        b: common_vendor.p({
          ["price-info"]: price
        }),
        c: index
      };
    }),
    l: common_vendor.t($options.currentPrice),
    m: common_vendor.o((...args) => $options.startCharging && $options.startCharging(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-92b9246b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/station/stationGunDetails.js.map

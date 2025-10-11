"use strict";
const common_vendor = require("../../common/vendor.js");
const api_station = require("../../api/station.js");
const PriceInfo = () => "../../components/station/PriceInfo.js";
const _sfc_main = {
  components: {
    PriceInfo
  },
  data() {
    return {
      stationInfo: {},
      sellerBasicsConfig: {},
      icons: [],
      currentStationId: "",
      // 保存当前站点ID
      isHasCouponsExpanded: false,
      isSubsidyExpanded: false,
      lastCollapsedText: "",
      tagList: [],
      parkingSvg: "data:image/svg+xml;base64,PHN2ZyB0PSIxNzU3MTI4NTY3NjI1IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjI3ODMiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNODY0IDY0SDE2MEMxMDcgNjQgNjQgMTA3IDY0IDE2MHY3MDRjMCA1MyA0MyA5NiA5NiA5Nmg3MDRjNTMgMCA5Ni00MyA5Ni05NlYxNjBjMC01My00My05Ni05Ni05NnpNNTQ0IDY0MGgtOTZ2OTZjMCAxNy42LTE0LjQgMzItMzIgMzJoLTY0Yy0xNy42IDAtMzItMTQuNC0zMi0zMlYyODhjMC0xNy42IDE0LjQtMzIgMzItMzJoMTkyYzEwNS44IDAgMTkyIDg2LjIgMTkyIDE5MnMtODYuMiAxOTItMTkyIDE5MnogbTAtMjU2aC05NnYxMjhoOTZjMzUuMiAwIDY0LTI4LjggNjQtNjRzLTI4LjgtNjQtNjQtNjR6IiBmaWxsPSIjMTI5NmRiIiBwLWlkPSIyNzg0Ij48L3BhdGg+PC9zdmc+"
    };
  },
  computed: {
    // 处理站点图片数据，确保兼容不同的数据格式
    stationImages() {
      if (!this.stationInfo.detailsImages) {
        return [];
      }
      if (Array.isArray(this.stationInfo.detailsImages)) {
        return this.stationInfo.detailsImages.filter((img) => img && img.trim() !== "");
      }
      if (typeof this.stationInfo.detailsImages === "string") {
        return this.stationInfo.detailsImages.split(",").map((img) => img.trim()).filter((img) => img !== "");
      }
      return [];
    }
  },
  onLoad(options) {
    const stationId = options.id;
    const tagList = options.tagList;
    if (tagList && tagList.length > 0) {
      this.tagList = tagList.split(",");
    }
    common_vendor.index.__f__("log", "at pages/station/stationDetails.vue:224", "解析得到充电站ID:", stationId);
    this.currentStationId = stationId;
    if (!stationId || stationId === "undefined" || stationId === "null") {
      common_vendor.index.__f__("error", "at pages/station/stationDetails.vue:231", "无效的充电站ID，使用默认值");
      common_vendor.index.showToast({
        title: "充电站信息异常",
        icon: "error"
      });
    } else {
      this.fetchAllData(stationId);
    }
  },
  methods: {
    async fetchAllData(stationId) {
      common_vendor.index.showLoading({ title: "加载中..." });
      try {
        const stationDetailPayload = {
          stationId: parseInt(stationId),
          // 确保ID为数字类型
          latitude: 23.02066993713379,
          longitude: 113.75179290771484
        };
        common_vendor.index.__f__("log", "at pages/station/stationDetails.vue:251", "发送充电站详情请求:", stationDetailPayload);
        const token = common_vendor.index.getStorageSync("token");
        let stationRes;
        if (token && token.trim() !== "") {
          common_vendor.index.__f__("log", "at pages/station/stationDetails.vue:259", "使用认证接口获取充电站详情");
          stationRes = await api_station.getStationDetailByIdNew(stationDetailPayload);
        } else {
          common_vendor.index.__f__("log", "at pages/station/stationDetails.vue:263", "使用非认证接口获取充电站详情");
          stationRes = await api_station.getStationDetailByIdNotAuth(stationDetailPayload);
        }
        if (stationRes.success) {
          common_vendor.index.__f__("log", "at pages/station/stationDetails.vue:267", "充电站详情获取成功:", stationRes.data);
          this.stationInfo = stationRes.data;
        } else {
          common_vendor.index.__f__("error", "at pages/station/stationDetails.vue:270", "充电站详情获取失败:", stationRes);
          common_vendor.index.showToast({
            title: "获取充电站信息失败",
            icon: "error"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/station/stationDetails.vue:296", "获取数据时发生错误:", error);
        common_vendor.index.showToast({
          title: "数据加载失败，请稍后重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    // 跳转到终端列表页面
    goToStationGunList() {
      common_vendor.index.navigateTo({
        url: `/pages/station/stationGunList?stationId=${this.currentStationId}&dataType=0&hulianinterfaceId=${this.stationInfo.hulianinterfaceId}`
      });
    },
    goToScan() {
      common_vendor.index.navigateTo({
        url: "/pages/charge/charging"
      });
    },
    // 图片预览功能
    previewImage(currentUrl, currentIndex) {
      common_vendor.index.previewImage({
        current: currentIndex,
        urls: this.stationImages,
        longPressActions: {
          itemList: ["保存图片"],
          success: (data) => {
            if (data.tapIndex === 0) {
              this.saveImageToAlbum(currentUrl);
            }
          }
        }
      });
    },
    // 保存图片到相册
    saveImageToAlbum(imageUrl) {
      common_vendor.index.downloadFile({
        url: imageUrl,
        success: (res) => {
          if (res.statusCode === 200) {
            common_vendor.index.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                common_vendor.index.showToast({
                  title: "保存成功",
                  icon: "success"
                });
              },
              fail: () => {
                common_vendor.index.showToast({
                  title: "保存失败，请检查权限",
                  icon: "none"
                });
              }
            });
          }
        },
        fail: () => {
          common_vendor.index.showToast({
            title: "下载失败",
            icon: "none"
          });
        }
      });
    },
    // 滚动到左边时触发
    onScrollLeft() {
      common_vendor.index.__f__("log", "at pages/station/stationDetails.vue:364", "滚动到最左边");
    },
    // 滚动到右边时触发  
    onScrollRight() {
      common_vendor.index.__f__("log", "at pages/station/stationDetails.vue:368", "滚动到最右边");
    },
    // 切换优惠说明展开/收起状态
    toggleHasCouponsCollapse() {
      this.isHasCouponsExpanded = !this.isHasCouponsExpanded;
      if (this.isHasCouponsExpanded && this.isSubsidyExpanded) {
        this.isSubsidyExpanded = false;
      }
      this.lastCollapsedText = this.stationInfo.hasCoupons || "暂无可适用卡券";
    },
    // 切换停车费说明展开/收起状态
    toggleSubsidyCollapse() {
      this.isSubsidyExpanded = !this.isSubsidyExpanded;
      if (this.isSubsidyExpanded && this.isHasCouponsExpanded) {
        this.isHasCouponsExpanded = false;
      }
      this.lastCollapsedText = this.stationInfo.subsidy || "暂无停车费说明";
    }
  }
};
if (!Array) {
  const _easycom_uv_scroll_list2 = common_vendor.resolveComponent("uv-scroll-list");
  const _easycom_uv_button2 = common_vendor.resolveComponent("uv-button");
  const _component_PriceInfo = common_vendor.resolveComponent("PriceInfo");
  const _easycom_uv_icon2 = common_vendor.resolveComponent("uv-icon");
  const _easycom_uv_tags2 = common_vendor.resolveComponent("uv-tags");
  (_easycom_uv_scroll_list2 + _easycom_uv_button2 + _component_PriceInfo + _easycom_uv_icon2 + _easycom_uv_tags2)();
}
const _easycom_uv_scroll_list = () => "../../uni_modules/uv-scroll-list/components/uv-scroll-list/uv-scroll-list.js";
const _easycom_uv_button = () => "../../uni_modules/uv-button/components/uv-button/uv-button.js";
const _easycom_uv_icon = () => "../../uni_modules/uv-icon/components/uv-icon/uv-icon.js";
const _easycom_uv_tags = () => "../../uni_modules/uv-tags/components/uv-tags/uv-tags.js";
if (!Math) {
  (_easycom_uv_scroll_list + _easycom_uv_button + _easycom_uv_icon + _easycom_uv_tags)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.stationInfo.name),
    b: $options.stationImages && $options.stationImages.length > 0
  }, $options.stationImages && $options.stationImages.length > 0 ? {
    c: common_vendor.f($options.stationImages, (imageUrl, index, i0) => {
      return {
        a: imageUrl,
        b: index,
        c: common_vendor.o(($event) => $options.previewImage(imageUrl, index), index)
      };
    }),
    d: common_vendor.o($options.onScrollLeft),
    e: common_vendor.o($options.onScrollRight),
    f: common_vendor.p({
      indicator: false
    })
  } : {}, {
    g: common_vendor.t($data.stationInfo.street),
    h: common_vendor.t($data.stationInfo.distance),
    i: common_vendor.o($options.goToStationGunList),
    j: common_vendor.p({
      text: "终端列表 >",
      type: "primary",
      plain: true,
      shape: "circle",
      size: "small"
    }),
    k: $data.stationInfo.gunPriceInfo && $data.stationInfo.gunPriceInfo.slowItem
  }, $data.stationInfo.gunPriceInfo && $data.stationInfo.gunPriceInfo.slowItem ? {
    l: common_vendor.p({
      chargeType: "慢",
      gunCount: $data.stationInfo.gunPriceInfo.slowItem.gunCount,
      freeGunCount: $data.stationInfo.gunPriceInfo.slowItem.freeGunCount,
      timeRange: `${$data.stationInfo.gunPriceInfo.slowItem.currentStartTime}-${$data.stationInfo.gunPriceInfo.slowItem.currentEndTime}`,
      currentPrice: $data.stationInfo.gunPriceInfo.slowItem.currentPriceStr,
      discountPriceStr: $data.stationInfo.gunPriceInfo.slowItem.discountPriceStr,
      electricPrice: $data.stationInfo.gunPriceInfo.slowItem.currentPowerPriceStr || "暂无信息",
      servicePrice: $data.stationInfo.gunPriceInfo.slowItem.currentServicePriceStr || "暂无信息"
    })
  } : {}, {
    m: $data.stationInfo.gunPriceInfo && $data.stationInfo.gunPriceInfo.fastItem
  }, $data.stationInfo.gunPriceInfo && $data.stationInfo.gunPriceInfo.fastItem ? {
    n: common_vendor.p({
      chargeType: "快",
      gunCount: $data.stationInfo.gunPriceInfo.fastItem.gunCount,
      freeGunCount: $data.stationInfo.gunPriceInfo.fastItem.freeGunCount,
      timeRange: `${$data.stationInfo.gunPriceInfo.fastItem.currentStartTime}-${$data.stationInfo.gunPriceInfo.fastItem.currentEndTime}`,
      currentPrice: $data.stationInfo.gunPriceInfo.fastItem.currentPriceStr,
      discountPriceStr: $data.stationInfo.gunPriceInfo.fastItem.discountPriceStr,
      electricPrice: $data.stationInfo.gunPriceInfo.fastItem.currentPowerPriceStr || "暂无信息",
      servicePrice: $data.stationInfo.gunPriceInfo.fastItem.currentServicePriceStr || "暂无信息"
    })
  } : {}, {
    o: $data.stationInfo.gunPriceInfo && $data.stationInfo.gunPriceInfo.superItem
  }, $data.stationInfo.gunPriceInfo && $data.stationInfo.gunPriceInfo.superItem ? {
    p: common_vendor.p({
      chargeType: "超",
      gunCount: $data.stationInfo.gunPriceInfo.superItem.gunCount,
      freeGunCount: $data.stationInfo.gunPriceInfo.superItem.freeGunCount,
      timeRange: `${$data.stationInfo.gunPriceInfo.superItem.currentStartTime}-${$data.stationInfo.gunPriceInfo.superItem.currentEndTime}`,
      currentPrice: $data.stationInfo.gunPriceInfo.superItem.currentPriceStr,
      discountPriceStr: $data.stationInfo.gunPriceInfo.superItem.discountPriceStr,
      electricPrice: $data.stationInfo.gunPriceInfo.superItem.currentPowerPriceStr || "暂无信息",
      servicePrice: $data.stationInfo.gunPriceInfo.superItem.currentServicePriceStr || "暂无信息"
    })
  } : {}, {
    q: $data.parkingSvg,
    r: common_vendor.p({
      name: "arrow-down",
      color: "#999",
      size: "14"
    }),
    s: $data.isHasCouponsExpanded ? 1 : "",
    t: common_vendor.o((...args) => $options.toggleHasCouponsCollapse && $options.toggleHasCouponsCollapse(...args)),
    v: $data.parkingSvg,
    w: common_vendor.p({
      name: "arrow-down",
      color: "#999",
      size: "14"
    }),
    x: $data.isSubsidyExpanded ? 1 : "",
    y: common_vendor.o((...args) => $options.toggleSubsidyCollapse && $options.toggleSubsidyCollapse(...args)),
    z: common_vendor.t($data.lastCollapsedText),
    A: $data.isSubsidyExpanded || $data.isHasCouponsExpanded ? 1 : "",
    B: common_vendor.f($data.tagList, (tag, k0, i0) => {
      return {
        a: tag,
        b: "72a72f92-7-" + i0,
        c: common_vendor.p({
          text: tag,
          plain: true,
          type: "success"
        })
      };
    }),
    C: $data.tagList.length === 0
  }, $data.tagList.length === 0 ? {} : {}, {
    D: $data.stationInfo.occupyCostModel
  }, $data.stationInfo.occupyCostModel ? {
    E: common_vendor.t(parseInt($data.stationInfo.occupyCostModel.occupyPhraseRules[0].price) / 100),
    F: common_vendor.t($data.stationInfo.occupyCostModel.occupyPhraseRules[0].stimeStr),
    G: common_vendor.t($data.stationInfo.occupyCostModel.occupyPhraseRules[0].etimeStr),
    H: common_vendor.t($data.stationInfo.occupyCostModel.freeDuration),
    I: common_vendor.t($data.stationInfo.occupyCostModel.freeDuration),
    J: common_vendor.t(parseInt($data.stationInfo.occupyCostModel.limitAmount) / 100)
  } : {}, {
    K: common_vendor.o($options.goToScan),
    L: common_vendor.p({
      text: "扫码充电",
      type: "primary",
      size: "large",
      shape: "circle"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/station/stationDetails.js.map

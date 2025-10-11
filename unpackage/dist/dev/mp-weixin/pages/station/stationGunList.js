"use strict";
const common_vendor = require("../../common/vendor.js");
const api_stationGun = require("../../api/stationGun.js");
const stationGunListItem = () => "../../components/station/stationGunListItem.js";
const _sfc_main = {
  components: {
    stationGunListItem
  },
  data() {
    return {
      stationId: "",
      // 接收路由参数
      dataType: 0,
      // 接收路由参数
      hulianinterfaceId: "",
      // 接收路由参数
      gunState: {},
      gunList: [],
      activeTab: 0,
      tabList: ["全部", "超充", "快充", "慢充"],
      // uv-subsection组件使用的数组
      tabs: [{
        name: "全部",
        type: 0
        // 0 代表全部
      }, {
        name: "超充",
        type: 3
        // gunType for Super Charge
      }, {
        name: "快充",
        type: 1
        // gunType for Fast Charge
      }, {
        name: "慢充",
        type: 2
        // gunType for Slow Charge
      }],
      chartData: {}
    };
  },
  computed: {
    filteredGunList() {
      const currentType = this.tabs[this.activeTab].type;
      if (currentType === 0) {
        return this.gunList;
      }
      return this.gunList.filter((gun) => gun.gunType === currentType);
    }
  },
  onLoad(options) {
    if (options.stationId) {
      this.stationId = options.stationId;
    } else {
      common_vendor.index.showToast({
        title: "缺少必要参数",
        icon: "none"
      });
      common_vendor.index.navigateBack();
    }
    if (options.hulianinterfaceId) {
      this.hulianinterfaceId = options.hulianinterfaceId;
    }
    this.fetchStationGunData();
  },
  methods: {
    async fetchStationGunData() {
      const params = {
        stationId: this.stationId,
        dataType: 0
      };
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const [stateRes, listRes] = await Promise.all([
          api_stationGun.getStationGunState(params),
          api_stationGun.getStationGunList(params)
        ]);
        if (stateRes.code === 0) {
          this.gunState = stateRes.data;
        }
        if (listRes.code === 0) {
          this.gunList = listRes.data;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/station/stationGunList.vue:127", "获取充电枪数据失败", error);
        common_vendor.index.showToast({
          title: "数据加载失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    updateChart() {
    },
    changeTab(index) {
      this.activeTab = index;
    },
    goToDetails(gunId) {
      common_vendor.index.navigateTo({
        url: `/pages/station/stationGunDetails?gunId=${gunId}&hulianinterfaceId=${this.hulianinterfaceId}`
      });
    }
  }
};
if (!Array) {
  const _easycom_uv_subsection2 = common_vendor.resolveComponent("uv-subsection");
  const _component_station_gun_list_item = common_vendor.resolveComponent("station-gun-list-item");
  (_easycom_uv_subsection2 + _component_station_gun_list_item)();
}
const _easycom_uv_subsection = () => "../../uni_modules/uv-subsection/components/uv-subsection/uv-subsection.js";
if (!Math) {
  _easycom_uv_subsection();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o($options.changeTab),
    b: common_vendor.p({
      list: $data.tabList,
      current: $data.activeTab,
      mode: "button",
      activeColor: "#007aff",
      inactiveColor: "#333",
      bgColor: "#EEEEEF",
      ["custom-style"]: "margin-bottom: 20rpx; border-radius: 30rpx; height: 80rpx;",
      ["custom-item-style"]: "border-radius: 30rpx;"
    }),
    c: common_vendor.t($data.gunState.sum || 0),
    d: common_vendor.t($data.gunState.free || 0),
    e: common_vendor.t($data.gunState.charging || 0),
    f: common_vendor.t($data.gunState.aboutFinish || 0),
    g: common_vendor.o((...args) => $options.updateChart && $options.updateChart(...args)),
    h: common_vendor.f($options.filteredGunList, (gun, k0, i0) => {
      return {
        a: gun.gunId,
        b: common_vendor.o(($event) => $options.goToDetails(gun.gunId), gun.gunId),
        c: "310ad2cb-1-" + i0,
        d: common_vendor.p({
          ["gun-info"]: gun
        })
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-310ad2cb"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/station/stationGunList.js.map

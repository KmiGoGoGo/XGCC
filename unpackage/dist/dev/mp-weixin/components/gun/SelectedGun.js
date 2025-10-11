"use strict";
const common_vendor = require("../../common/vendor.js");
const api_pile = require("../../api/pile.js");
const globalData = require("../../globalData.js");
const SubSelectedGun = () => "./SubSelectedGun.js";
const _sfc_main = {
  name: "SelectedGun",
  components: {
    SubSelectedGun
  },
  props: {
    // 充电桩信息
    pileInfo: {
      type: Object,
      default: () => ({})
    },
    // 主枪参数（从路由传入）
    mainGunParams: {
      type: Object,
      default: () => ({})
    },
    // 充电桩编号
    pileNo: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      selectedSecondaryGun: null,
      // 选中的从枪
      showGunSelection: false,
      // 是否显示枪选择列表
      statusTimer: null
      // 定时器
    };
  },
  mounted() {
    this.startStatusPolling();
  },
  beforeDestroy() {
    this.clearStatusPolling();
  },
  computed: {
    // 选中的主枪（优先从路由参数获取，否则从pileInfo第一个枪）
    selectedMainGun() {
      var _a, _b, _c;
      if (this.mainGunParams.gunId && this.pileInfo) {
        const gun = (_a = this.pileInfo.gunDTOList) == null ? void 0 : _a.find((g) => g.gunid === this.mainGunParams.gunId);
        if (gun) {
          return {
            ...gun,
            gunName: this.mainGunParams.gunName,
            maxPower: this.mainGunParams.maxPower || gun.maxPower
          };
        }
      }
      return ((_c = (_b = this.pileInfo) == null ? void 0 : _b.gunDTOList) == null ? void 0 : _c[0]) || null;
    }
  },
  methods: {
    // 获取枪类型文本
    getGunTypeText(gunType) {
      switch (parseInt(gunType)) {
        case 3:
          return "超充";
        case 2:
          return "快充";
        case 1:
          return "慢充";
        default:
          return "未知";
      }
    },
    // 获取枪状态样式类
    getStatusClass(gunState) {
      switch (gunState) {
        case 1:
          return "status-idle";
        case 2:
          return "status-busy";
        case 3:
          return "status-fault";
        default:
          return "status-unknown";
      }
    },
    // 获取枪状态文本
    getStatusText(gunState) {
      switch (gunState) {
        case 1:
          return "空闲";
        case 2:
          return "充电中";
        case 3:
          return "故障";
        default:
          return "未知";
      }
    },
    // 切换枪选择显示
    toggleGunSelection() {
      this.showGunSelection = !this.showGunSelection;
    },
    // 启动状态轮询定时器
    startStatusPolling() {
      if (!this.pileNo) {
        common_vendor.index.__f__("warn", "at components/gun/SelectedGun.vue:108", "SelectedGun: pileNo为空，无法启动状态轮询");
        return;
      }
      this.updateGunStatus();
      this.clearStatusPolling();
      this.statusTimer = setInterval(() => {
        this.updateGunStatus();
      }, 1e4);
      common_vendor.index.__f__("log", "at components/gun/SelectedGun.vue:122", "SelectedGun: 状态轮询定时器已启动");
    },
    // 清除状态轮询定时器
    clearStatusPolling() {
      if (this.statusTimer) {
        clearInterval(this.statusTimer);
        this.statusTimer = null;
        common_vendor.index.__f__("log", "at components/gun/SelectedGun.vue:130", "SelectedGun: 状态轮询定时器已清除");
      }
    },
    // 更新充电枪状态
    async updateGunStatus() {
      try {
        const params = {
          pileNo: this.pileNo,
          kycContent: "",
          sellerId: globalData.globalData.sellerId,
          platformNo: "null",
          hulianinterfaceId: "null"
        };
        const response = await api_pile.getPileDTOByNo(params);
        if (response.code === 0 && response.data && response.data.gunDTOList) {
          const gunList = response.data.gunDTOList;
          if (this.selectedMainGun) {
            const mainGunUpdate = gunList.find((gun) => gun.gunid === this.selectedMainGun.gunid);
            this.$emit("gun-status-updated", {
              gunId: this.selectedMainGun.gunid,
              newState: mainGunUpdate.gunState,
              type: "main"
            });
            common_vendor.index.__f__("log", "at components/gun/SelectedGun.vue:159", `主枪${this.selectedMainGun.gunid}状态更新: ${this.selectedMainGun.gunState} -> ${mainGunUpdate.gunState}`);
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at components/gun/SelectedGun.vue:163", "SelectedGun: 更新充电枪状态失败:", error);
      }
    }
  },
  watch: {
    // 监听pileNo变化，重新启动定时器
    pileNo(newVal, oldVal) {
      if (newVal !== oldVal) {
        common_vendor.index.__f__("log", "at components/gun/SelectedGun.vue:172", "SelectedGun: pileNo变化，重启定时器", newVal);
        this.startStatusPolling();
      }
    }
  }
};
if (!Array) {
  const _component_SubSelectedGun = common_vendor.resolveComponent("SubSelectedGun");
  _component_SubSelectedGun();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      ["gun-info"]: $options.selectedMainGun,
      ["station-name"]: $props.pileInfo.stationName
    })
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-447ac0b6"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/gun/SelectedGun.js.map

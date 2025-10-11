"use strict";
const common_vendor = require("../../common/vendor.js");
const api_station = require("../../api/station.js");
const citySelect = () => "../../components/city-select/city-select.js";
const _sfc_main = {
  data() {
    return {
      //需要构建索引参数的名称（注意：传递的对象里面必须要有这个名称的参数）
      formatName: "cityName",
      //当前城市
      activeCity: {},
      //热门城市
      hotCity: [],
      //显示的城市数据
      obtainCitys: [],
      //加载状态
      loading: false,
      //错误信息
      error: null
    };
  },
  components: {
    citySelect
  },
  onLoad() {
    this.activeCity = {
      id: 1,
      cityName: "请选择城市"
    };
    this.loadCityData();
  },
  methods: {
    /**
     * 从API加载城市数据
     */
    async loadCityData() {
      try {
        this.loading = true;
        this.error = null;
        const response = await api_station.getStationArea();
        if (response.success && response.data) {
          const cityData = response.data.map((item) => ({
            id: item.cityId,
            cityName: item.cityName,
            cityId: item.cityId,
            cityPinyin: item.cityPinyin,
            latitude: common_vendor.index.getStorageSync("location").latitude,
            longitude: common_vendor.index.getStorageSync("location").longitude
          }));
          this.obtainCitys = cityData;
          common_vendor.index.__f__("log", "at pages/common/cityPicker.vue:86", "obtainCitys", this.obtainCitys);
          if (cityData.length > 0) {
            this.activeCity = {
              id: cityData[0].cityId,
              cityName: cityData[0].cityName
            };
          }
          this.$nextTick(() => {
            common_vendor.index.__f__("log", "at pages/common/cityPicker.vue:98", "数据更新完成，obtainCitys长度:", this.obtainCitys.length);
            common_vendor.index.__f__("log", "at pages/common/cityPicker.vue:99", "当前城市:", this.activeCity);
            this.$forceUpdate();
            if (this.$refs.citys && this.$refs.citys.updateCitys) {
              this.$refs.citys.updateCitys(this.obtainCitys);
            }
          });
          common_vendor.index.showToast({
            icon: "success",
            title: "城市数据加载成功",
            duration: 1500
          });
        } else {
          this.error = response.msg || "获取城市数据失败";
          common_vendor.index.showToast({
            icon: "none",
            title: this.error,
            duration: 2e3
          });
        }
      } catch (error) {
        this.error = "网络错误，请稍后重试";
        common_vendor.index.__f__("error", "at pages/common/cityPicker.vue:125", "获取城市数据出错:", error);
        common_vendor.index.showToast({
          icon: "none",
          title: this.error,
          duration: 2e3
        });
      } finally {
        this.loading = false;
      }
    },
    cityClick(item) {
      common_vendor.index.__f__("log", "at pages/common/cityPicker.vue:137", "选择的城市:", item);
      common_vendor.index.showToast({
        icon: "none",
        title: "选择的城市: " + item.cityName,
        duration: 3e3,
        mask: true
      });
      common_vendor.index.setStorageSync("currentCity", item);
      common_vendor.index.setStorageSync("currentCityName", item.cityName);
      common_vendor.index.navigateBack();
    }
  }
};
if (!Array) {
  const _easycom_city_select2 = common_vendor.resolveComponent("city-select");
  _easycom_city_select2();
}
const _easycom_city_select = () => "../../components/city-select/city-select.js";
if (!Math) {
  _easycom_city_select();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.loading
  }, $data.loading ? {} : {}, {
    b: $data.error && !$data.loading
  }, $data.error && !$data.loading ? {
    c: common_vendor.t($data.error),
    d: common_vendor.o((...args) => $options.loadCityData && $options.loadCityData(...args))
  } : {}, {
    e: !$data.loading && !$data.error
  }, !$data.loading && !$data.error ? {
    f: common_vendor.sr("citys", "21bab11e-0"),
    g: common_vendor.o($options.cityClick),
    h: common_vendor.p({
      formatName: $data.formatName,
      activeCity: $data.activeCity,
      hotCity: $data.hotCity,
      obtainCitys: $data.obtainCitys,
      isSearch: true
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-21bab11e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/common/cityPicker.js.map

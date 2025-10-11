"use strict";
const common_vendor = require("../../common/vendor.js");
const components_citySelect_citySelect = require("./citySelect.js");
const _sfc_main = {
  props: {
    //查询提示文字
    placeholder: {
      type: String,
      default: "请输入城市名称"
    },
    //传入要排序的名称
    formatName: {
      type: String,
      default: "cityName"
    },
    //当前定位城市
    activeCity: {
      type: Object,
      default: () => null
    },
    //热门城市
    hotCity: {
      type: Array,
      default: () => []
    },
    //城市数据
    obtainCitys: {
      type: Array,
      default: () => []
    },
    //是否有搜索
    isSearch: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      itemHeight: 0,
      //索引item高度
      hidden: true,
      //滑动显示
      listCurID: "",
      //滑动显示的字母
      toView: "city-letter-Find",
      //锚链接 初始值
      cityindexs: [],
      // 城市索引
      activeCityIndex: "",
      // 当前所在的城市索引
      handleCity: [],
      // 处理后的城市数据
      serachCity: "",
      // 搜索的城市
      cityData: []
    };
  },
  computed: {
    /**
     * @desc 城市列表排序
     * @return  Array
     */
    sortItems() {
      for (let index = 0; index < this.handleCity.length; index++) {
        if (this.handleCity[index].isCity) {
          let cityArr = this.handleCity[index].citys;
          cityArr = cityArr.sort(function(a, b) {
            var value1 = a.unicode;
            var value2 = b.unicode;
            return value1 - value2;
          });
        }
      }
      return this.handleCity;
    },
    /**
     * @desc 搜索后的城市列表
     * @return Array
     */
    searchDatas() {
      var searchData = [];
      for (let i = 0; i < this.cityData.length; i++) {
        if (this.cityData[i][this.formatName].indexOf(this.serachCity) !== -1) {
          searchData.push({
            oldData: this.cityData[i],
            name: this.cityData[i][this.formatName]
          });
        }
      }
      return searchData;
    }
  },
  created() {
    this.cityData = this.obtainCitys;
    this.initializationCity();
    this.buildCityindexs();
  },
  watch: {
    obtainCitys(newData) {
      this.updateCitys(newData);
    }
  },
  mounted() {
    this.getIndexsHeight();
  },
  methods: {
    //获取索引高度
    getIndexsHeight() {
      let that = this;
      const query = common_vendor.index.createSelectorQuery().in(this);
      query.select("#index-bar").boundingClientRect((data) => {
        that.barTop = data.top;
        const cityIndexName = this.handleCity.filter((item) => item.isCity);
        this.itemHeight = data.height / cityIndexName.length;
      }).exec();
    },
    //滑动选择Item
    tMove(e) {
      this.hidden = false;
      this.listCurID = "";
      const cityIndexName = this.handleCity.filter((item) => item.isCity);
      let y = e.touches[0].clientY, offsettop = this.barTop;
      if (y > offsettop) {
        let num = parseInt((y - offsettop) / this.itemHeight);
        if (num > cityIndexName.length) {
          this.hidden = true;
          this.listCurID = "";
        } else {
          this.hidden = false;
          this.listCurID = cityIndexName[num].name;
        }
      } else {
        this.listCurID = "";
        this.hidden = true;
      }
    },
    //触发全部开始选择
    tStart() {
      if (this.listCurID) {
        this.hidden = false;
        this.listCurID = "";
      }
    },
    //触发结束选择
    tEnd() {
      this.hidden = true;
      this.toView = "city-letter-" + (this.listCurID == "#" ? "0" : this.listCurID);
      this.listCurID = "";
    },
    /**
     * @desc 初始化
     */
    updateCitys(data) {
      if (data && data.length) {
        this.cityData = data;
        this.initializationCity();
        this.buildCityindexs();
        setTimeout(() => {
          this.getIndexsHeight();
        }, 500);
      }
    },
    /**
     * @desc 监听输入框的值
     */
    keyInput(event) {
      this.serachCity = event.detail.value;
    },
    /**
     * @desc 初始化城市数据
     * @return undefind
     */
    initializationCity() {
      this.handleCity = [];
      const cityLetterArr = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
        "#"
      ];
      for (let index = 0; index < cityLetterArr.length; index++) {
        this.handleCity.push({
          name: cityLetterArr[index],
          isCity: false,
          // 用于区分是否含有当前字母开头的城市
          citys: [],
          // 存放城市首字母含是此字母的数组
          forName: "city-letter-" + (cityLetterArr[index] == "#" ? "0" : cityLetterArr[index])
          //label的绑定
        });
      }
    },
    /**
     * @desc 得到城市的首字母
     * @param str String
     */
    getLetter(str) {
      return components_citySelect_citySelect.citySelect.getFirstLetter(str[0]);
    },
    /**
     * @desc 构建城市索引
     * @return undefind
     */
    buildCityindexs() {
      this.cityindexs = [];
      for (let i = 0; i < this.cityData.length; i++) {
        const cityLetter = this.getLetter(this.cityData[i][this.formatName]).firstletter;
        const unicode = this.getLetter(this.cityData[i][this.formatName]).unicode;
        const index = this.cityIndexPosition(cityLetter);
        if (this.cityindexs.indexOf(cityLetter) === -1) {
          this.handleCity[index].isCity = true;
          this.cityindexs.push(cityLetter);
        }
        this.handleCity[index].citys.push({
          cityName: this.cityData[i][this.formatName],
          unicode,
          oldData: this.cityData[i]
        });
      }
    },
    /**
     * @desc 滑动到城市索引所在的地方
     * @param id String 城市索引
     */
    cityindex(id) {
      this.toView = id;
    },
    /**
     * @desc 获取城市首字母的unicode
     * @param letter String 城市索引
     */
    cityIndexPosition(letter) {
      if (!letter) {
        return "";
      }
      const ACode = 65;
      return letter === "#" ? 26 : letter.charCodeAt(0) - ACode;
    },
    /** @desc 城市列表点击事件
     *  @param Object
     */
    cityTrigger(item) {
      this.$emit("cityClick", item.oldData ? item.oldData : item);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.isSearch
  }, $props.isSearch ? {
    b: common_vendor.o((...args) => $options.keyInput && $options.keyInput(...args)),
    c: $props.placeholder
  } : {}, {
    d: $props.activeCity && !$data.serachCity
  }, $props.activeCity && !$data.serachCity ? {} : {}, {
    e: $props.activeCity && !$data.serachCity
  }, $props.activeCity && !$data.serachCity ? {
    f: common_vendor.t($props.activeCity[$props.formatName]),
    g: common_vendor.o(($event) => $options.cityTrigger($props.activeCity))
  } : {}, {
    h: $props.hotCity.length > 0 && !$data.serachCity
  }, $props.hotCity.length > 0 && !$data.serachCity ? {} : {}, {
    i: $props.hotCity.length > 0 && !$data.serachCity
  }, $props.hotCity.length > 0 && !$data.serachCity ? {
    j: common_vendor.f($props.hotCity, (item, index, i0) => {
      return {
        a: common_vendor.t(item[$props.formatName]),
        b: common_vendor.o(($event) => $options.cityTrigger(item, "hot"), index),
        c: index
      };
    })
  } : {}, {
    k: !$data.serachCity
  }, !$data.serachCity ? {
    l: common_vendor.f($options.sortItems, (city, index, i0) => {
      return {
        a: common_vendor.t(city.name),
        b: "city-letter-" + (city.name === "#" ? "0" : city.name),
        c: common_vendor.f(city.citys, (item, inx, i1) => {
          return {
            a: common_vendor.t(item.cityName),
            b: inx,
            c: common_vendor.o(($event) => $options.cityTrigger(item), inx)
          };
        }),
        d: index,
        e: city.isCity
      };
    })
  } : {}, {
    m: $data.serachCity
  }, $data.serachCity ? {
    n: common_vendor.f($options.searchDatas, (item, index, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: common_vendor.o(($event) => $options.cityTrigger(item), _ctx.inx),
        c: index
      };
    }),
    o: _ctx.inx
  } : {}, {
    p: $data.toView,
    q: !$data.serachCity
  }, !$data.serachCity ? {
    r: common_vendor.f($data.handleCity, (cityIns, index, i0) => {
      return {
        a: common_vendor.t(cityIns.name),
        b: cityIns.isCity,
        c: index,
        d: common_vendor.o(($event) => $options.cityindex(cityIns.forName), index)
      };
    }),
    s: common_vendor.o((...args) => $options.tStart && $options.tStart(...args)),
    t: common_vendor.o((...args) => $options.tEnd && $options.tEnd(...args)),
    v: common_vendor.o((...args) => $options.tMove && $options.tMove(...args))
  } : {}, {
    w: common_vendor.t($data.listCurID),
    x: !$data.hidden
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/city-select/city-select.js.map

"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "FilterOptions",
  props: {
    // 筛选数据
    data: {
      type: Object,
      required: true,
      default: () => ({
        name: "",
        list: []
      })
    },
    // 默认选中的值
    defaultValue: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      selectedKey: null
    };
  },
  watch: {
    defaultValue: {
      immediate: true,
      handler(newVal) {
        this.selectedKey = newVal;
      }
    }
  },
  methods: {
    /**
     * 选择选项
     * @param {Object} option - 选中的选项 { value: '1KM', key: 1 }
     */
    selectOption(option) {
      this.selectedKey = option.key;
      this.$emit("change", {
        key: option.key,
        value: option.value,
        name: this.data.name
      });
    },
    /**
     * 重置选择
     */
    reset() {
      this.selectedKey = null;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($props.data.name),
    b: common_vendor.f($props.data.list, (option, index, i0) => {
      return {
        a: common_vendor.t(option.value),
        b: index,
        c: $data.selectedKey === option.key ? 1 : "",
        d: common_vendor.o(($event) => $options.selectOption(option), index)
      };
    })
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9b02abb1"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/FilterOptions/FilterOptions.js.map

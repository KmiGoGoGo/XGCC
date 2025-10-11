"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "VehiclePlateInput",
  props: {
    value: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      selectedProvince: "",
      plateNumber: "",
      inputFocus: false,
      // 中国大陆车牌省份缩写
      provinces: [
        "京",
        "津",
        "冀",
        "晋",
        "蒙",
        "辽",
        "吉",
        "黑",
        "沪",
        "苏",
        "浙",
        "皖",
        "闽",
        "赣",
        "鲁",
        "豫",
        "鄂",
        "湘",
        "粤",
        "桂",
        "琼",
        "渝",
        "川",
        "黔",
        "滇",
        "藏",
        "陕",
        "甘",
        "青",
        "宁",
        "新"
      ]
    };
  },
  computed: {
    fullPlateNumber() {
      return this.selectedProvince + this.plateNumber;
    }
  },
  watch: {
    value: {
      handler(newVal) {
        if (newVal) {
          const province = newVal.charAt(0);
          const number = newVal.slice(1);
          this.selectedProvince = province;
          this.plateNumber = number;
        }
      },
      immediate: true
    },
    fullPlateNumber: {
      handler(newVal) {
        this.$emit("input", newVal);
      },
      immediate: true
    }
  },
  methods: {
    showProvincePicker() {
      this.$refs.provincePicker.open();
    },
    hideProvincePicker() {
      this.$refs.provincePicker.close();
    },
    confirmProvince(e) {
      if (e.value && e.value.length > 0) {
        this.selectedProvince = e.value[0];
        this.$emit("input", this.fullPlateNumber);
      }
      this.hideProvincePicker();
    },
    onPlateInput(e) {
      let value = e;
      if (typeof e === "object" && e.detail) {
        value = e.detail.value;
      }
      value = value.toUpperCase();
      value = value.replace(/[^0-9A-Z]/g, "");
      this.plateNumber = value;
      common_vendor.index.__f__("log", "at components/vehicle-plate-input/vehicle-plate-input.vue:121", "车牌号输入:", {
        inputValue: e,
        processedValue: value,
        plateNumber: this.plateNumber,
        selectedProvince: this.selectedProvince,
        fullPlateNumber: this.fullPlateNumber
      });
      this.$emit("plateInput", this.fullPlateNumber);
    },
    // 车牌号格式化函数
    plateFormatter(value) {
      return value.toUpperCase().replace(/[^0-9A-Z]/g, "");
    },
    // 提交车牌号
    submit() {
      if (!this.selectedProvince) {
        common_vendor.index.showToast({
          title: "请选择省份",
          icon: "none"
        });
        return;
      }
      if (!this.plateNumber) {
        common_vendor.index.showToast({
          title: "请输入车牌号",
          icon: "none"
        });
        return;
      }
      this.$emit("submit", this.fullPlateNumber);
    },
    // 获取完整的车牌号（供父组件调用）
    getFullPlateNumber() {
      return this.fullPlateNumber;
    }
  }
};
if (!Array) {
  const _easycom_uv_input2 = common_vendor.resolveComponent("uv-input");
  const _easycom_uv_picker2 = common_vendor.resolveComponent("uv-picker");
  (_easycom_uv_input2 + _easycom_uv_picker2)();
}
const _easycom_uv_input = () => "../../uni_modules/uv-input/components/uv-input/uv-input.js";
const _easycom_uv_picker = () => "../../uni_modules/uv-picker/components/uv-picker/uv-picker.js";
if (!Math) {
  (_easycom_uv_input + _easycom_uv_picker)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.selectedProvince || "省"),
    b: common_vendor.o((...args) => $options.showProvincePicker && $options.showProvincePicker(...args)),
    c: common_vendor.o(($event) => $data.inputFocus = true),
    d: common_vendor.o(($event) => $data.inputFocus = false),
    e: common_vendor.o($options.onPlateInput),
    f: common_vendor.o($options.onPlateInput),
    g: common_vendor.o(($event) => $data.plateNumber = $event),
    h: common_vendor.p({
      placeholder: $data.selectedProvince ? "请输入车牌号" : "请先选择省份",
      maxlength: 6,
      formatter: $options.plateFormatter,
      focus: $data.inputFocus,
      border: "none",
      customStyle: {
        flex: 1,
        padding: "24rpx",
        fontSize: "32rpx"
      },
      modelValue: $data.plateNumber
    }),
    i: common_vendor.sr("provincePicker", "c6c389d2-1"),
    j: common_vendor.o($options.confirmProvince),
    k: common_vendor.o($options.hideProvincePicker),
    l: common_vendor.p({
      columns: [$data.provinces],
      title: "选择省份"
    })
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c6c389d2"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/vehicle-plate-input/vehicle-plate-input.js.map

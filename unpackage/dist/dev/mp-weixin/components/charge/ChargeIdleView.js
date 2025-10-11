"use strict";
const common_vendor = require("../../common/vendor.js");
const api_member = require("../../api/member.js");
const api_station = require("../../api/station.js");
const PileGunCard = () => "../station/PileGunCard.js";
const Card = () => "../common/Card.js";
const SelectedGun = () => "../gun/SelectedGun.js";
const _sfc_main = {
  // name: 'ChargeIdelView',
  components: {
    PileGunCard,
    Card,
    SelectedGun
  },
  props: {
    pileInfo: Object,
    memberInfo: Object,
    paymentMethods: Array,
    presetAmount: String,
    currentPaymentType: {
      type: Number,
      default: -1
    },
    // 主枪信息（从路由参数传入）
    mainGunParams: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      // 用户身份类型: 'fleet' 车队身份, 'individual' 个人身份
      // 先写死为非车队身份
      userType: "individual",
      presetOptions: [
        { label: "30元", value: 3e3 },
        { label: "50元", value: 5e3 },
        { label: "100元", value: 1e4 },
        { label: "全部余额", value: "all" }
      ],
      // presetAmount: this.presetAmount,
      paymentType: this.currentPaymentType,
      vehicleSvg: "data:image/svg+xml;base64,PHN2ZyB0PSIxNzU3MTI3NTAwNzY0IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE1OTQiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNOTA5LjMyIDQyNC42NmwtMjIuNDgtNTYuMi0zOS44Ni05OS42NkM4MTIuNzYgMTgzLjI2IDczMS4xNCAxMjggNjM5IDEyOGgtMjU0Yy05Mi4xMiAwLTE3My43NiA1NS4yNi0yMDcuOTggMTQwLjhsLTM5Ljg2IDk5LjY2LTIyLjQ4IDU2LjJDNjYuNDQgNDQzIDMyIDQ4OS4zMiAzMiA1NDR2OTZjMCAzMi4yNCAxMi4zMiA2MS4zNCAzMiA4My44NlY4MzJjMCAzNS4zNCAyOC42NiA2NCA2NCA2NGg2NGMzNS4zNCAwIDY0LTI4LjY2IDY0LTY0di02NGg1MTJ2NjRjMCAzNS4zNCAyOC42NiA2NCA2NCA2NGg2NGMzNS4zNCAwIDY0LTI4LjY2IDY0LTY0di0xMDguMTRjMTkuNjgtMjIuNSAzMi01MS42IDMyLTgzLjg2di05NmMwLTU0LjY4LTM0LjQ0LTEwMS04Mi42OC0xMTkuMzR6IG0tNjEzLjQ2LTEwOC4zMmMxNC41OC0zNi40NCA0OS44OC02MC4zNCA4OS4xNC02MC4zNGgyNTRjMzkuMjYgMCA3NC41NiAyMy45IDg5LjE0IDYwLjM0TDc2OCA0MTZIMjU2bDM5Ljg2LTk5LjY2ek0xOTIgNjM5LjZjLTM4LjQgMC02NC0yNS41Mi02NC02My44UzE1My42IDUxMiAxOTIgNTEyczk2IDU3LjQyIDk2IDk1LjctNTcuNiAzMS45LTk2IDMxLjl6IG02NDAgMGMtMzguNCAwLTk2IDYuMzgtOTYtMzEuOVM3OTMuNiA1MTIgODMyIDUxMnM2NCAyNS41MiA2NCA2My44LTI1LjYgNjMuOC02NCA2My44eiIgcC1pZD0iMTU5NSIgZmlsbD0iI0I4REJGRiI+PC9wYXRoPjwvc3ZnPg==",
      parkingSvg: "data:image/svg+xml;base64,PHN2ZyB0PSIxNzU3MTI4NTY3NjI1IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjI3ODMiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNODY0IDY0SDE2MEMxMDcgNjQgNjQgMTA3IDY0IDE2MHY3MDRjMCA1MyA0MyA5NiA5NiA5Nmg3MDRjNTMgMCA5Ni00MyA5Ni05NlYxNjBjMC01My00My05Ni05Ni05NnpNNTQ0IDY0MGgtOTZ2OTZjMCAxNy42LTE0LjQgMzItMzIgMzJoLTY0Yy0xNy42IDAtMzItMTQuNC0zMi0zMlYyODhjMC0xNy42IDE0LjQtMzIgMzItMzJoMTkyYzEwNS44IDAgMTkyIDg2LjIgMTkyIDE5MnMtODYuMiAxOTItMTkyIDE5MnogbTAtMjU2aC05NnYxMjhoOTZjMzUuMiAwIDY0LTI4LjggNjQtNjRzLTI4LjgtNjQtNjQtNjR6IiBmaWxsPSIjMTI5NmRiIiBwLWlkPSIyNzg0Ij48L3BhdGg+PC9zdmc+",
      isParkingExpanded: false,
      isOccupyExpanded: false,
      isKeyboardShow: false,
      // 键盘是否显示
      keyboardHeight: 0,
      // 键盘高度
      amountInputValue: ""
      // 充电金额输入值
    };
  },
  watch: {
    presetAmount: {
      handler(newVal) {
        if (newVal) {
          this.amountInputValue = (parseInt(newVal) / 100).toString();
        } else {
          this.amountInputValue = "";
        }
      },
      immediate: true
    }
  },
  computed: {
    currentPriceInfo() {
      if (!this.pileInfo || !this.pileInfo.gunDTOList)
        return {};
      if (!this.mainGunParams || !this.mainGunParams.gunId)
        return {};
      const targetGun = this.pileInfo.gunDTOList.find((gun) => gun.gunid === this.mainGunParams.gunId);
      return targetGun ? targetGun.nowPrice || {} : {};
    },
    // 根据用户身份过滤支付方式
    filteredPaymentMethods() {
      if (this.userType === "fleet") {
        return this.paymentMethods.filter(
          (item) => item.payType === 3 || item.accountName.includes("车队")
        );
      } else {
        this.paymentMethods.sort((a, b) => a.payType - b.payType);
        return this.paymentMethods.filter(
          (item) => item.payType !== 3 && !item.accountName.includes("车队") && (item.payType !== 6 && item.balance !== "N/A")
        );
      }
    }
  },
  onReady() {
    common_vendor.index.onKeyboardHeightChange((res) => {
      common_vendor.index.__f__("log", "at components/charge/ChargeIdleView.vue:286", "键盘高度变化:", res.height);
      this.keyboardHeight = res.height;
      if (res.height > 0) {
        this.isKeyboardShow = true;
        setTimeout(() => {
          this.adjustViewForKeyboard();
        }, 100);
      } else {
        this.isKeyboardShow = false;
      }
    });
  },
  onUnload() {
    common_vendor.index.offKeyboardHeightChange();
  },
  methods: {
    // 处理输入框获得焦点
    handleInputFocus() {
      common_vendor.index.__f__("log", "at components/charge/ChargeIdleView.vue:306", "输入框获得焦点");
    },
    // 处理输入框失去焦点
    handleInputBlur() {
      common_vendor.index.__f__("log", "at components/charge/ChargeIdleView.vue:311", "输入框失去焦点");
    },
    // 调整视图以适应键盘
    adjustViewForKeyboard() {
      const query = common_vendor.index.createSelectorQuery().in(this);
      const systemInfo = common_vendor.index.getSystemInfoSync();
      const windowHeight = systemInfo.windowHeight;
      query.select(".section-card:nth-last-child(1)").boundingClientRect((inputData) => {
        if (inputData) {
          query.selectViewport().scrollOffset((viewportData) => {
            const inputBottom = inputData.bottom;
            const visibleBottom = windowHeight - this.keyboardHeight;
            if (inputBottom > visibleBottom) {
              const targetPosition = visibleBottom * 0.4;
              const needScrollDistance = inputBottom - targetPosition;
              const currentScrollTop = viewportData.scrollTop;
              const targetScrollTop = currentScrollTop + needScrollDistance;
              common_vendor.index.__f__("log", "at components/charge/ChargeIdleView.vue:339", "键盘遮挡输入框，开始滚动:", {
                inputBottom,
                visibleBottom,
                needScrollDistance,
                targetScrollTop
              });
              common_vendor.index.pageScrollTo({
                scrollTop: Math.max(0, targetScrollTop),
                duration: 300
              });
            }
          }).exec();
        }
      }).exec();
    },
    changeUser() {
      const deductMode = common_vendor.index.getStorageSync("deductMode");
      let changeType = null;
      if (deductMode === "LeaguerAccount" && this.memberInfo.tokenMemberType === 2) {
        changeType = 0;
      } else if (deductMode === "TeamAccount" && this.memberInfo.tokenMemberType === 2) {
        changeType = 0;
      } else if (deductMode === "TeamAccount" && this.memberInfo.tokenMemberType === 0) {
        changeType = 1;
      } else if (deductMode === "LeaguerAccount" && this.memberInfo.tokenMemberType === 0) {
        changeType = 2;
      } else {
        common_vendor.index.showToast({
          title: "无法切换身份请联系客服",
          icon: "none"
        });
        return;
      }
      api_member.changeUser(changeType).then((res) => {
        if (res.code === 0) {
          common_vendor.index.setStorageSync("token", res.data);
          this.$emit("user-changed");
        }
      });
    },
    handlePaymentChange(name) {
      common_vendor.index.__f__("log", "at components/charge/ChargeIdleView.vue:382", name, "name");
      this.$emit("payment-change", Number(name));
    },
    handleAmountInput(event) {
      const value = event.target.value;
      common_vendor.index.__f__("log", "at components/charge/ChargeIdleView.vue:388", "handleAmountInput触发，值:", value);
      this.amountInputValue = value;
      const numValue = parseFloat(value) || 0;
      const centValue = parseInt(numValue * 100);
      common_vendor.index.__f__("log", "at components/charge/ChargeIdleView.vue:394", "发射preset-amount-change事件，值:", centValue);
      this.$emit("preset-amount-change", centValue);
    },
    // 跳转到充值页面
    goToTopUp() {
      common_vendor.index.navigateTo({
        url: "/pages/recharge/recharge"
      });
    },
    // 处理双枪状态变化
    handleDualGunChange(gunData) {
      this.$emit("dual-gun-change", gunData);
    },
    // 处理充电枪状态更新
    handleGunStatusUpdated(statusData) {
      this.$emit("gun-status-updated", statusData);
    },
    // 清理定时器（供父组件调用）
    clearTimers() {
      if (this.$refs.selectedGun && this.$refs.selectedGun.clearStatusPolling) {
        this.$refs.selectedGun.clearStatusPolling();
      }
    },
    goToVehicleList() {
      common_vendor.index.navigateTo({
        url: "/pages/vehicle/list"
      });
    },
    // 切换停车费说明展开/收起状态
    toggleParkingCollapse() {
      this.isParkingExpanded = !this.isParkingExpanded;
    },
    // 切换超时占位说明展开/收起状态
    toggleOccupyCollapse() {
      this.isOccupyExpanded = !this.isOccupyExpanded;
    },
    // 判断预设金额按钮是否为激活状态
    isPresetAmountActive(amount) {
      if (this.presetAmount == amount.value) {
        return true;
      }
      if (this.presetAmount === "all") {
        return true;
      }
      return false;
    },
    // 获取预设金额按钮样式
    getPresetButtonStyle(value) {
      common_vendor.index.__f__("log", "at components/charge/ChargeIdleView.vue:446", value, "value");
      const amount = this.presetOptions.find((option) => option.value === value);
      common_vendor.index.__f__("log", "at components/charge/ChargeIdleView.vue:448", amount, "amount");
      let isActive = amount ? this.isPresetAmountActive(amount) : false;
      if (value === "all") {
        const personalAccount = this.paymentMethods.find((p) => p.payType === 1);
        common_vendor.index.__f__("log", "at components/charge/ChargeIdleView.vue:452", this.presetAmount, "presetAmount");
        isActive = personalAccount.balance == this.presetAmount;
      }
      return {
        width: "auto",
        height: "75rpx",
        backgroundColor: isActive ? "#007aff" : "#F5F7FA",
        color: isActive ? "#fff" : "#333",
        border: isActive ? "1rpx solid #007aff" : "1rpx solid #F5F7FA"
      };
    },
    // 显示价格详情
    async showPriceDetails() {
      if (!this.mainGunParams || !this.mainGunParams.gunId) {
        common_vendor.index.showToast({
          title: "枪信息未加载完成",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "加载价格详情..." });
        const res = await api_station.getStationGunDetails(this.mainGunParams.gunId);
        if (res.code === 0 && res.data && res.data.powerStageDetail) {
          this.$emit("show-price-details", res.data.powerStageDetail);
        } else {
          common_vendor.index.showToast({
            title: "获取价格详情失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at components/charge/ChargeIdleView.vue:488", "获取价格详情失败:", error);
        common_vendor.index.showToast({
          title: "获取价格详情失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    }
  },
  mounted() {
    if (this.memberInfo && this.memberInfo.accountBalance) {
      const accountBalance = parseInt(this.memberInfo.accountBalance);
      if (this.memberInfo.deductMode === "LeaguerAccount" && this.memberInfo.tokenMemberType === 0 && accountBalance > 0) {
        this.$emit("payment-change", 1);
        this.$emit("preset-amount-change", this.memberInfo.accountBalance);
      } else if (this.memberInfo.deductMode === "TeamAccount" && this.memberInfo.tokenMemberType === 2) {
        this.$emit("payment-change", 2);
      } else if (this.memberInfo.deductMode === "LeaguerAccount" && this.memberInfo.tokenMemberType === 2) {
        this.$emit("payment-change", 2);
      } else {
        this.$emit("payment-change", -1);
      }
    } else {
      this.$emit("payment-change", -1);
    }
  }
};
if (!Array) {
  const _component_SelectedGun = common_vendor.resolveComponent("SelectedGun");
  const _easycom_uv_icon2 = common_vendor.resolveComponent("uv-icon");
  const _easycom_uv_button2 = common_vendor.resolveComponent("uv-button");
  const _easycom_uv_radio2 = common_vendor.resolveComponent("uv-radio");
  const _easycom_uv_radio_group2 = common_vendor.resolveComponent("uv-radio-group");
  (_component_SelectedGun + _easycom_uv_icon2 + _easycom_uv_button2 + _easycom_uv_radio2 + _easycom_uv_radio_group2)();
}
const _easycom_uv_icon = () => "../../uni_modules/uv-icon/components/uv-icon/uv-icon.js";
const _easycom_uv_button = () => "../../uni_modules/uv-button/components/uv-button/uv-button.js";
const _easycom_uv_radio = () => "../../uni_modules/uv-radio/components/uv-radio/uv-radio.js";
const _easycom_uv_radio_group = () => "../../uni_modules/uv-radio/components/uv-radio-group/uv-radio-group.js";
if (!Math) {
  (_easycom_uv_icon + _easycom_uv_button + _easycom_uv_radio + _easycom_uv_radio_group)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a;
  return common_vendor.e({
    a: common_vendor.t($props.memberInfo.tokenMemberType === 0 ? "个人身份" : "车队身份"),
    b: common_vendor.t($props.memberInfo.name),
    c: $props.memberInfo.groupName
  }, $props.memberInfo.groupName ? {
    d: common_vendor.o((...args) => $options.changeUser && $options.changeUser(...args))
  } : {}, {
    e: common_vendor.sr("selectedGun", "6192386c-0"),
    f: common_vendor.o($options.handleDualGunChange),
    g: common_vendor.o($options.handleGunStatusUpdated),
    h: common_vendor.p({
      ["pile-info"]: $props.pileInfo,
      ["main-gun-params"]: $props.mainGunParams,
      ["pile-no"]: (_a = $props.pileInfo) == null ? void 0 : _a.pileNo
    }),
    i: common_vendor.o((...args) => $options.showPriceDetails && $options.showPriceDetails(...args)),
    j: common_vendor.t($options.currentPriceInfo.currentStartTime),
    k: common_vendor.t($options.currentPriceInfo.currentEndTime),
    l: common_vendor.t($options.currentPriceInfo.currentPriceStr),
    m: $options.currentPriceInfo.discount
  }, $options.currentPriceInfo.discount ? {
    n: common_vendor.t($options.currentPriceInfo.sweepPriceStr)
  } : {}, {
    o: common_vendor.t($options.currentPriceInfo.currentPowerPriceStr),
    p: common_vendor.t($options.currentPriceInfo.currentServicePriceStr),
    q: $props.memberInfo.plateNo
  }, $props.memberInfo.plateNo ? {
    r: common_vendor.t($props.memberInfo.plateNo),
    s: common_vendor.o($options.goToVehicleList),
    t: common_vendor.p({
      name: "edit-pen",
      color: "#007BFF",
      size: "22"
    })
  } : {
    v: common_vendor.o($options.goToVehicleList),
    w: common_vendor.p({
      type: "primary",
      plain: true,
      shape: "circle"
    })
  }, {
    x: $data.parkingSvg,
    y: common_vendor.p({
      name: "arrow-down",
      color: "#999",
      size: "14"
    }),
    z: $data.isParkingExpanded ? 1 : "",
    A: common_vendor.o((...args) => $options.toggleParkingCollapse && $options.toggleParkingCollapse(...args)),
    B: $data.parkingSvg,
    C: common_vendor.p({
      name: "arrow-down",
      color: "#999",
      size: "14"
    }),
    D: $data.isOccupyExpanded ? 1 : "",
    E: common_vendor.o((...args) => $options.toggleOccupyCollapse && $options.toggleOccupyCollapse(...args)),
    F: common_vendor.t($props.pileInfo.parking),
    G: $data.isParkingExpanded ? 1 : "",
    H: common_vendor.f($options.filteredPaymentMethods, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.accountName),
        b: item.balance
      }, item.balance ? {
        c: common_vendor.t((parseInt(item.balance) / 100).toFixed(2))
      } : {}, {
        d: "6192386c-6-" + i0 + ",6192386c-5",
        e: common_vendor.p({
          name: item.payType,
          label: item.accountName,
          labelColor: item.disabled ? "#c8c9cc" : "#303133",
          disabled: item.disabled,
          customStyle: {
            flex: 1
          }
        }),
        f: item.showTopUp
      }, item.showTopUp ? {
        g: common_vendor.o(($event) => $options.goToTopUp(item), item.payType),
        h: "6192386c-7-" + i0 + ",6192386c-5",
        i: common_vendor.p({
          type: "primary",
          plain: true,
          size: "mini",
          shape: "circle"
        })
      } : {}, {
        j: item.payType
      });
    }),
    I: common_vendor.o($options.handlePaymentChange),
    J: common_vendor.o(($event) => $data.paymentType = $event),
    K: common_vendor.p({
      placement: "column",
      modelValue: $data.paymentType
    }),
    L: $props.memberInfo.tokenMemberType == 0,
    M: $props.memberInfo.tokenMemberType == 2
  }, $props.memberInfo.tokenMemberType == 2 ? {} : {}, {
    N: $props.memberInfo.tokenMemberType == 0
  }, $props.memberInfo.tokenMemberType == 0 ? common_vendor.e({
    O: $data.amountInputValue,
    P: common_vendor.o((...args) => $options.handleAmountInput && $options.handleAmountInput(...args)),
    Q: common_vendor.o((...args) => $options.handleInputFocus && $options.handleInputFocus(...args)),
    R: common_vendor.o((...args) => $options.handleInputBlur && $options.handleInputBlur(...args)),
    S: $data.paymentType == 1
  }, $data.paymentType == 1 ? {
    T: common_vendor.f($data.presetOptions, (amount, k0, i0) => {
      return {
        a: amount.value,
        b: common_vendor.o(($event) => _ctx.$emit("set-preset-amount", amount.value), amount.value),
        c: "6192386c-8-" + i0,
        d: common_vendor.p({
          text: amount.label,
          type: $options.isPresetAmountActive(amount) ? "primary" : "default",
          plain: !$options.isPresetAmountActive(amount),
          hoverStayTime: "0",
          shape: "circle",
          customTextStyle: "font-size: 30rpx;",
          customStyle: $options.getPresetButtonStyle(amount.value)
        })
      };
    })
  } : {}) : {}, {
    U: $props.pileInfo.stationData.occupyCostModel
  }, $props.pileInfo.stationData.occupyCostModel ? {
    V: common_vendor.t(parseInt($props.pileInfo.stationData.occupyCostModel.occupyPhraseRules[0].price) / 100),
    W: common_vendor.t($props.pileInfo.stationData.occupyCostModel.occupyPhraseRules[0].stimeStr),
    X: common_vendor.t($props.pileInfo.stationData.occupyCostModel.occupyPhraseRules[0].etimeStr),
    Y: common_vendor.t($props.pileInfo.stationData.occupyCostModel.freeDuration),
    Z: common_vendor.t($props.pileInfo.stationData.occupyCostModel.freeDuration),
    aa: common_vendor.t(parseInt($props.pileInfo.stationData.occupyCostModel.limitAmount) / 100)
  } : {}, {
    ab: $data.isKeyboardShow ? 1 : ""
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6192386c"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/charge/ChargeIdleView.js.map

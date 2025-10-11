"use strict";
const common_vendor = require("../../common/vendor.js");
const globalData = require("../../globalData.js");
const api_style = require("../../api/style.js");
const api_member = require("../../api/member.js");
const Tabbar = () => "../../components/tabbar/tabbar.js";
const _sfc_main = {
  components: {
    Tabbar
  },
  data() {
    return {
      // 授权码
      authCode: null,
      //  登录标识
      isLogin: false,
      // 标记数据是否初始化完成
      initialized: false,
      // 标记是否正在加载数据，避免重复加载
      isLoading: false,
      // token状态，用于响应式更新
      currentToken: null,
      // API原始数据
      memberInfo: {
        groupName: null,
        level: null,
        nextLevelName: null,
        gap: 0,
        servicePackage: {},
        tokenMemberType: 0,
        couponList: 0,
        isInvoice: 0
      },
      accountInfo: null,
      // 页面渲染数据
      maskedPhone: "",
      balance: "0.00",
      couponCount: 0,
      integral: 0,
      percentage: 0,
      notCommentBillNumber: 0,
      plateNo: null,
      // 完整菜单项
      allMenuItems: [
        {
          name: "站点收藏"
        },
        {
          name: "发票开具",
          navigateTo: "/pages/invoice/invoice"
        },
        // {
        // 	name: '我的账单'
        // },
        {
          name: "客服",
          navigateTo: "/pages/common/service"
        },
        {
          name: "兑券"
        },
        {
          name: "设置",
          navigateTo: "/pages/common/settings"
        }
      ],
      // 未登录时显示的菜单项
      guestMenuItems: [
        {
          name: "客服",
          navigateTo: "/pages/common/service"
        },
        {
          name: "设置",
          navigateTo: "/pages/common/settings"
        }
      ],
      groupMenuItems: [
        {
          name: "站点收藏"
        },
        {
          name: "发票开具"
        },
        {
          name: "客服",
          navigateTo: "/pages/common/service"
        },
        {
          name: "设置",
          navigateTo: "/pages/common/settings"
        }
      ]
    };
  },
  computed: {
    // 检查是否有token
    hasToken() {
      return !!this.currentToken;
    },
    // 根据token状态和isInvoice字段返回对应的菜单项
    filteredMenuItems() {
      common_vendor.index.__f__("log", "at pages/my/my.vue:192", "filteredMenuItems 计算属性被触发, hasToken:", this.hasToken);
      if (!this.hasToken) {
        common_vendor.index.__f__("log", "at pages/my/my.vue:195", "返回未登录菜单项数量:", this.guestMenuItems.length);
        return this.guestMenuItems;
      }
      let menuItems = [];
      if (this.memberInfo.deductMode == "TeamAccount" && this.memberInfo.tokenMemberType === 2 && this.memberInfo.isInvoice === 0) {
        menuItems = this.groupMenuItems.filter((item) => {
          if (item.name === "发票开具") {
            return false;
          }
          return true;
        });
      } else if (this.memberInfo.deductMode == "LeaguerAccount" && this.memberInfo.tokenMemberType === 2 && this.memberInfo.isInvoice === 0) {
        menuItems = this.allMenuItems.filter((item) => {
          if (item.name === "发票开具") {
            return false;
          }
          return true;
        });
      } else {
        menuItems = this.allMenuItems;
      }
      common_vendor.index.__f__("log", "at pages/my/my.vue:220", "返回已登录菜单项数量:", menuItems.length);
      common_vendor.index.__f__("log", "at pages/my/my.vue:221", "isInvoice值:", this.memberInfo.isInvoice);
      return menuItems;
    },
    // 计算显示的账户余额
    displayBalance() {
      common_vendor.index.__f__("log", "at pages/my/my.vue:226", "this.memberInfo.11111", this.memberInfo.deductMode === "TeamAccount" && this.memberInfo.tokenMemberType === 2);
      return this.memberInfo.deductMode === "TeamAccount" && this.memberInfo.tokenMemberType === 2 ? "****" : this.balance;
    }
  },
  onLoad() {
    common_vendor.index.__f__("log", "at pages/my/my.vue:231", "my页面 onLoad 被触发");
    common_vendor.index.hideTabBar();
    this.syncTokenState();
    this.loadPageData();
  },
  onShow() {
    common_vendor.index.__f__("log", "at pages/my/my.vue:245", "my页面 onShow 被触发");
    this.syncTokenState();
    if (!this.currentToken) {
      common_vendor.index.__f__("log", "at pages/my/my.vue:251", "token不存在，清空页面数据");
      this.clearPageData();
      return;
    }
    if (this.initialized) {
      common_vendor.index.__f__("log", "at pages/my/my.vue:259", "页面已初始化，刷新数据");
      this.isLoading = false;
      this.loadPageData();
    }
  },
  methods: {
    /**
     * @description 同步token状态到响应式数据
     */
    syncTokenState() {
      const token = common_vendor.index.getStorageSync("token");
      common_vendor.index.__f__("log", "at pages/my/my.vue:270", "同步token状态:", token ? "有token" : "无token");
      this.currentToken = token;
    },
    /**
     * @description 清空所有页面数据，用于登出或token失效时
     */
    clearPageData() {
      common_vendor.index.__f__("log", "at pages/my/my.vue:278", "清空页面数据");
      this.memberInfo = {
        groupName: null,
        level: null,
        nextLevelName: null,
        gap: 0,
        servicePackage: {},
        tokenMemberType: 0,
        couponList: 0,
        isInvoice: 0
      };
      this.accountInfo = null;
      this.maskedPhone = "";
      this.balance = "0.00";
      this.couponCount = 0;
      this.integral = 0;
      this.percentage = 0;
      this.notCommentBillNumber = 0;
      this.plateNo = null;
      this.initialized = true;
      this.isLoading = false;
      this.isLogin = false;
      this.currentToken = null;
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
      common_vendor.index.showLoading({
        title: "加载中..."
      });
      api_member.changeUser(changeType).then((res) => {
        if (res.code === 0) {
          common_vendor.index.setStorageSync("token", res.data);
          this.syncTokenState();
          this.loadPageData();
          common_vendor.index.hideLoading();
        } else {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: res.msg || "切换身份失败",
            icon: "none"
          });
        }
      });
    },
    updateMaskedPhone() {
      const phoneNo = common_vendor.index.getStorageSync("phoneNo");
      this.maskedPhone = this.maskPhoneNumber(phoneNo);
      common_vendor.index.__f__("log", "at pages/my/my.vue:348", "maskedPhone", this.maskedPhone);
    },
    /**
     * @description 跳转到登录页面
     */
    login() {
      if (!common_vendor.index.getStorageSync("token")) {
        common_vendor.index.navigateTo({
          url: "/pages/login/login"
        });
      }
    },
    /**
     * @description 加载页面所有数据
     * 负责登录、获取Token、并行请求所有业务接口，并处理返回数据
     */
    async loadPageData() {
      common_vendor.index.__f__("log", "at pages/my/my.vue:366", "开始执行 loadPageData 方法");
      if (this.isLoading) {
        common_vendor.index.__f__("log", "at pages/my/my.vue:370", "数据正在加载中，跳过重复请求");
        return;
      }
      this.isLoading = true;
      common_vendor.index.showLoading({
        title: "加载中..."
      });
      try {
        this.syncTokenState();
        if (!this.currentToken) {
          common_vendor.index.__f__("log", "at pages/my/my.vue:383", "loadPageData: token不存在，清空数据");
          this.clearPageData();
          return;
        }
        this.updateMaskedPhone();
        const sellerId = globalData.globalData.sellerId;
        const requests = [
          api_member.getMemberInfo(),
          api_member.listPopUp(),
          api_member.getInvoiceBySellerId(sellerId),
          api_member.getOldAndNewBenifit(sellerId),
          api_member.getMyNotPayBillNumber({
            prePayVer: 1
          })
        ];
        const [
          memberInfoRes
        ] = await Promise.all(requests);
        this.processApiData({
          memberInfoRes
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/my/my.vue:415", "加载页面数据时出错:", error);
        common_vendor.index.showToast({
          title: "数据加载失败",
          icon: "none"
        });
      } finally {
        this.initialized = true;
        this.isLoading = false;
        common_vendor.index.hideLoading();
      }
    },
    /**
     * @description 统一处理API返回的数据，并更新到data中
     * @param {object} results - 包含所有API响应的对象
     */
    processApiData(results) {
      const {
        memberInfoRes
      } = results;
      if (memberInfoRes && memberInfoRes.code === 0) {
        const data = memberInfoRes.data;
        this.memberInfo = data;
        this.couponCount = data.couponList || 0;
        this.integral = data.consumeIntegral || 0;
        this.notCommentBillNumber = data.notCommentBillNumber || 0;
        this.plateNo = data.plateNo || "未绑定";
        this.percentage = parseFloat(data.percentage) || 0;
        this.deductMode = data.deductMode;
        common_vendor.index.setStorageSync("deductMode", this.deductMode);
        if (this.deductMode === "TeamAccount" && data.tokenMemberType === 2) {
          this.balance = "****";
        } else if (this.deductMode === "LeaguerAccount") {
          if (data.tokenMemberType === 0) {
            this.balance = (data.accountBalance / 100).toFixed(2);
          } else {
            this.balance = (data.carAccountBalance / 100).toFixed(2);
          }
        } else if (this.deductMode === "TeamAccount" && data.tokenMemberType === 0) {
          this.balance = (data.accountBalance / 100).toFixed(2);
        }
        common_vendor.index.setStorageSync("tokenMemberType", data.tokenMemberType);
        common_vendor.index.setStorageSync("memberInfo", data);
      }
    },
    /**
     * @description 将手机号中间四位替换为*
     * @param {string} phone - 手机号
     * @returns {string} - 脱敏后的手机号
     */
    maskPhoneNumber(phone) {
      if (typeof phone === "string" && phone.length === 11) {
        return phone.substring(0, 3) + "****" + phone.substring(7);
      }
      return phone;
    },
    /**
     * @description 跳转到个人资产页面
     */
    goToAssetsPage() {
      if (this.deductMode === "TeamAccount" && this.memberInfo.tokenMemberType === 2) {
        common_vendor.index.showToast({
          title: "车队账户无法查看资产",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: "/pages/account/assets"
      });
    },
    /**
     * @description 跳转到我的卡券页面
     */
    goToCouponPage() {
      common_vendor.index.navigateTo({
        url: "/pages/coupon/myCoupon"
      });
    },
    /**
     * @description 跳转到我的积分页面
     */
    goToIntegralPage() {
      common_vendor.index.navigateTo({
        url: "/pages/integral/index"
      });
    },
    /**
     * @description 跳转到我的订单页面
     */
    goToOrderPage() {
      common_vendor.index.navigateTo({
        url: "/pages/order/list"
      });
    },
    /**
     * @description 跳转到我的车辆页面
     */
    goToVehiclePage() {
      common_vendor.index.navigateTo({
        url: "/pages/vehicle/list"
      });
    },
    /**
     * @description 跳转到我的退款页面
     */
    goToRefundPage() {
      common_vendor.index.navigateTo({
        url: "/pages/refund/apply"
      });
    },
    /**
     * @description 跳转到指定页面
     */
    async goToPage(navigateTo) {
      if (navigateTo === "/pages/common/service") {
        const res = await api_style.getStyleConfig();
        if (res.code !== 0) {
          common_vendor.index.showToast({
            title: res.msg || "获取客服信息失败",
            icon: "none"
          });
          return;
        }
        common_vendor.index.showModal({
          title: "联系客服",
          content: `客服电话：${res.data.telephone || ""}
客服工作时间：${res.data.serviceTime || ""}`,
          showCancel: true,
          cancelText: "取消",
          confirmText: "呼叫客服",
          confirmColor: "#007AFF",
          success: (res1) => {
            if (res1.confirm) {
              common_vendor.index.makePhoneCall({
                phoneNumber: res.data.telephone,
                success: () => {
                  common_vendor.index.__f__("log", "at pages/my/my.vue:574", "呼叫成功");
                },
                fail: (err) => {
                  common_vendor.index.__f__("log", "at pages/my/my.vue:577", "呼叫失败", err);
                  common_vendor.index.showToast({
                    title: "呼叫失败",
                    icon: "none"
                  });
                }
              });
            }
          }
        });
        return;
      }
      if (navigateTo) {
        common_vendor.index.navigateTo({
          url: navigateTo
        });
      }
    }
  }
};
if (!Array) {
  const _easycom_uv_button2 = common_vendor.resolveComponent("uv-button");
  const _component_Tabbar = common_vendor.resolveComponent("Tabbar");
  (_easycom_uv_button2 + _component_Tabbar)();
}
const _easycom_uv_button = () => "../../uni_modules/uv-button/components/uv-button/uv-button.js";
if (!Math) {
  _easycom_uv_button();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.initialized || !$options.hasToken
  }, $data.initialized || !$options.hasToken ? common_vendor.e({
    b: common_vendor.t($data.maskedPhone || "注册/登录"),
    c: common_vendor.o((...args) => $options.login && $options.login(...args)),
    d: $data.memberInfo.tokenMemberType === 2
  }, $data.memberInfo.tokenMemberType === 2 ? {
    e: common_vendor.t($data.memberInfo.motorcadeName || "未知车队")
  } : {}, {
    f: $data.memberInfo.groupName
  }, $data.memberInfo.groupName ? {
    g: common_vendor.o((...args) => $options.changeUser && $options.changeUser(...args))
  } : {}, {
    h: $data.memberInfo.tokenMemberType === 0 && false
  }, $data.memberInfo.tokenMemberType === 0 && false ? {
    i: common_vendor.t($data.memberInfo.level),
    j: common_vendor.t($data.memberInfo.servicePackage.name),
    k: common_vendor.t($data.memberInfo.nextLevelName),
    l: $data.percentage,
    m: common_vendor.t($data.memberInfo.gap)
  } : {}, {
    n: common_vendor.t($options.displayBalance),
    o: common_vendor.o((...args) => $options.goToAssetsPage && $options.goToAssetsPage(...args)),
    p: common_vendor.t($data.couponCount),
    q: common_vendor.o((...args) => $options.goToCouponPage && $options.goToCouponPage(...args)),
    r: $data.memberInfo.tokenMemberType === 0
  }, $data.memberInfo.tokenMemberType === 0 ? {
    s: common_vendor.t($data.integral),
    t: common_vendor.o((...args) => $options.goToIntegralPage && $options.goToIntegralPage(...args))
  } : {}, {
    v: common_vendor.t($data.notCommentBillNumber),
    w: common_vendor.o((...args) => $options.goToOrderPage && $options.goToOrderPage(...args)),
    x: common_vendor.t($data.plateNo || "绑定车辆"),
    y: common_vendor.o((...args) => $options.goToVehiclePage && $options.goToVehiclePage(...args)),
    z: common_vendor.p({
      type: "primary",
      shape: "circle",
      text: "点击进入"
    }),
    A: common_vendor.o((...args) => $options.goToRefundPage && $options.goToRefundPage(...args)),
    B: common_vendor.f($options.filteredMenuItems, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: item.name,
        c: common_vendor.o(($event) => $options.goToPage(item.navigateTo), item.name)
      };
    }),
    C: common_vendor.p({
      activeId: 2
    })
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2f1ef635"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my/my.js.map

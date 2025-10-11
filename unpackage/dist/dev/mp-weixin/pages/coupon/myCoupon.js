"use strict";
const common_vendor = require("../../common/vendor.js");
const api_coupon = require("../../api/coupon.js");
const _sfc_main = {
  data() {
    return {
      coupons: []
    };
  },
  onLoad() {
    this.fetchCoupons();
  },
  methods: {
    async fetchCoupons() {
      common_vendor.index.showLoading({
        title: "加载中..."
      });
      try {
        const res = await api_coupon.myCouponPage({
          tab: 1,
          current: 1,
          size: 10
        });
        if (res.code === 0) {
          this.coupons = res.data.records;
        } else {
          common_vendor.index.showToast({
            title: "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/coupon/myCoupon.vue:81", "获取优惠券失败:", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    /**
     * @description 格式化余额，移除不必要的小数
     * @param {number} balance
     * @returns {number}
     */
    formatBalance(balance) {
      return parseInt(balance, 10);
    },
    /**
     * @description 显示适用站点信息
     * @param {Object} coupon 优惠券对象
     */
    showSiteInfo(coupon) {
      if (coupon.availableSiteName && coupon.availableSiteName.length > 0) {
        const siteList = coupon.availableSiteName;
        common_vendor.index.showModal({
          title: "适用站点",
          content: siteList,
          showCancel: false,
          confirmText: "我知道了"
        });
      } else {
        common_vendor.index.showModal({
          title: "适用站点",
          content: "暂无适用站点信息",
          showCancel: false,
          confirmText: "我知道了"
        });
      }
    },
    showUseConfirm() {
      common_vendor.index.showModal({
        title: "提示",
        content: "请在微信小程序端进行使用",
        showCancel: false,
        confirmText: "我知道了"
      });
    }
  }
};
if (!Array) {
  const _easycom_uv_button2 = common_vendor.resolveComponent("uv-button");
  _easycom_uv_button2();
}
const _easycom_uv_button = () => "../../uni_modules/uv-button/components/uv-button/uv-button.js";
if (!Math) {
  _easycom_uv_button();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.coupons, (coupon, k0, i0) => {
      return {
        a: common_vendor.t($options.formatBalance(coupon.couponBalance)),
        b: common_vendor.t(coupon.couponTypeStr),
        c: common_vendor.t(coupon.activityName),
        d: common_vendor.t(coupon.limitBalance),
        e: common_vendor.t(coupon.startDate),
        f: common_vendor.t(coupon.endDate),
        g: common_vendor.o(($event) => $options.showSiteInfo(coupon), coupon.id),
        h: common_vendor.o($options.showUseConfirm, coupon.id),
        i: "f4f12eb7-0-" + i0,
        j: coupon.id
      };
    }),
    b: common_vendor.p({
      type: "primary",
      size: "small"
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f4f12eb7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/coupon/myCoupon.js.map

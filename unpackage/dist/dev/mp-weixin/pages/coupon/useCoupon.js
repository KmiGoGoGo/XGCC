"use strict";
const common_vendor = require("../../common/vendor.js");
const api_coupon = require("../../api/coupon.js");
const _sfc_main = {
  name: "UseCoupon",
  data() {
    return {
      billId: 0,
      couponList: [],
      cIdStr: "",
      num: "",
      deductionAmount: "",
      deductibleBalance: "",
      couponIdStr: "",
      money: "",
      couponType: "",
      deductibleBalanceCoupon: "",
      footerHeight: 180,
      // 底部高度（包含安全区域）
      pageNum: 1,
      pageSize: 10,
      hasMore: true
    };
  },
  onLoad: function(options) {
    if (options.billId) {
      this.billId = options.billId;
    }
    if (options.couponIdStr) {
      this.cIdStr = options.couponIdStr;
    }
    this.getSystemInfo();
  },
  onReady: function() {
  },
  onShow: function() {
    this.getCouponRecodeByBill();
  },
  onHide: function() {
  },
  onUnload: function() {
  },
  onPullDownRefresh: function() {
  },
  onShareAppMessage: function() {
  },
  methods: {
    // 获取系统信息（计算安全区域）
    getSystemInfo() {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      const safeAreaBottom = systemInfo.safeArea ? systemInfo.screenHeight - systemInfo.safeArea.bottom : 0;
      this.footerHeight = 140 + safeAreaBottom;
    },
    // 滚动到底部（分页加载）
    onReachBottom() {
      if (!this.hasMore) {
        return;
      }
      this.pageNum++;
      this.loadMoreCoupons();
    },
    // 加载更多优惠券（示例方法）
    loadMoreCoupons() {
      common_vendor.index.__f__("log", "at pages/coupon/useCoupon.vue:160", "加载更多优惠券，当前页：", this.pageNum);
    },
    // 获取优惠券列表
    getCouponRecodeByBill: function() {
      const that = this;
      api_coupon.getCouponRecodeByBill({
        billId: this.billId
      }).then((res) => {
        if (res.code == 0) {
          const data = res.data;
          const cIdStr = that.cIdStr;
          let num = 0;
          let deductionAmount = 0;
          data.forEach((element) => {
            if (cIdStr == element.id) {
              element.status = 0;
            } else {
              if (cIdStr) {
                if (element.status == 0) {
                  element.status = 1;
                } else {
                  element.status = element.status;
                }
              }
            }
            if (element.status == 0) {
              deductionAmount += element.couponBalance / 100;
              num++;
            }
          });
          that.couponList = res.data;
          that.num = num;
          that.deductionAmount = deductionAmount;
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/coupon/useCoupon.vue:200", "获取优惠券列表失败:", err);
        common_vendor.index.showToast({
          title: "获取优惠券失败",
          icon: "none"
        });
      });
    },
    // 选择优惠券
    checkCoupon: function(e) {
      const id = e.currentTarget.dataset.item.id;
      const list = this.couponList;
      list.forEach((element) => {
        if (element.id == id) {
          element.status = 0;
        } else {
          if (element.status <= 1) {
            element.status = 1;
          }
        }
      });
      let num = 0;
      let deductionAmount = 0;
      list.forEach((element) => {
        if (element.status == 0) {
          deductionAmount += element.couponBalance / 100;
          num++;
        }
      });
      this.couponList = list;
      this.num = num;
      this.deductionAmount = deductionAmount;
    },
    // 确定使用优惠券
    enterCoupon: function() {
      let couponIdStr = "";
      let money = 0;
      let deductibleBalanceCoupon = 0;
      let couponType = "";
      const list = this.couponList;
      let noCheck = false;
      list.forEach((element) => {
        if (element.status == 0) {
          couponIdStr += element.id + ",";
          money += parseFloat((element.couponBalance / 100).toFixed(2));
          couponType = element.couponType;
        }
      });
      list.forEach((e) => {
        if (e.status <= 1) {
          if (couponIdStr == "") {
            common_vendor.index.showModal({
              title: "信息提示",
              content: "请选择优惠券",
              showCancel: false
            });
            noCheck = true;
          }
        }
      });
      if (noCheck) {
        return false;
      }
      const reg = /,$/gi;
      couponIdStr = couponIdStr.replace(reg, "");
      common_vendor.index.showLoading({
        title: "加载中...",
        mask: true
      });
      deductibleBalanceCoupon = money * 100;
      const selectedCouponData = {
        couponIdStr,
        money,
        couponType,
        deductibleBalanceCoupon: (deductibleBalanceCoupon / 100).toFixed(2)
      };
      common_vendor.index.setStorageSync("selectedCoupon", JSON.stringify(selectedCouponData));
      common_vendor.index.hideLoading();
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.couponList.length > 0
  }, $data.couponList.length > 0 ? {
    b: common_vendor.f($data.couponList, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.couponBalance / 100),
        b: common_vendor.n(item.status !== 0 ? "unselected-amount" : ""),
        c: common_vendor.t(item.useType == "QuanChang" ? "全场通用" : "指定站点"),
        d: common_vendor.n(item.status !== 0 ? "unselected-type" : ""),
        e: common_vendor.n(item.status !== 0 ? "unselected-left" : ""),
        f: item.couponType == "FuWuFei"
      }, item.couponType == "FuWuFei" ? {} : {}, {
        g: item.couponType == "DianFei"
      }, item.couponType == "DianFei" ? {} : {}, {
        h: item.couponType == "XianJin"
      }, item.couponType == "XianJin" ? {} : {}, {
        i: common_vendor.n(item.status > 1 ? "txt1_no" : "txt1"),
        j: common_vendor.t(item.limiBalance / 100),
        k: common_vendor.n(item.status > 1 ? "txt2_no" : "txt2"),
        l: common_vendor.t(item.startTime),
        m: common_vendor.t(item.endTime),
        n: item.status === 0
      }, item.status === 0 ? {} : item.status <= 1 ? {
        p: common_vendor.o((...args) => $options.checkCoupon && $options.checkCoupon(...args), index),
        q: item
      } : {}, {
        o: item.status <= 1,
        r: common_vendor.n(item.status === 0 ? "selected" : "unselected"),
        s: index
      });
    }),
    c: common_vendor.f($data.couponList, (item, index, i0) => {
      return common_vendor.e({
        a: item.status > 1
      }, item.status > 1 ? {
        b: common_vendor.t(item.statusDesc)
      } : {}, {
        c: "desc-" + index
      });
    })
  } : {}, {
    d: common_vendor.s("height: calc(100vh - " + $data.footerHeight + "px);"),
    e: common_vendor.o((...args) => $options.onReachBottom && $options.onReachBottom(...args)),
    f: $data.couponList.length > 0
  }, $data.couponList.length > 0 ? {
    g: common_vendor.t($data.num),
    h: common_vendor.t($data.deductionAmount),
    i: common_vendor.f($data.couponList, (item, index, i0) => {
      return common_vendor.e({
        a: item.status == 0
      }, item.status == 0 ? {
        b: common_vendor.t(item.couponType == "FuWuFei" ? "服务费￥" + item.couponBalance / 100 : ""),
        c: common_vendor.t(item.couponType == "DianFei" ? "电费￥" + item.couponBalance / 100 : ""),
        d: common_vendor.t(item.couponType == "XianJin" ? "现金￥" + item.couponBalance / 100 : "")
      } : {}, {
        e: index
      });
    }),
    j: common_vendor.o((...args) => $options.enterCoupon && $options.enterCoupon(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-446caae6"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/coupon/useCoupon.js.map

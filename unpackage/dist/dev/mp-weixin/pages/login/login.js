"use strict";
const common_vendor = require("../../common/vendor.js");
const api_member = require("../../api/member.js");
const globalData = require("../../globalData.js");
const _sfc_main = {
  data() {
    return {
      phoneNumber: "",
      password: "",
      isAgreed: false,
      isNewMember: true,
      openId: null
    };
  },
  onLoad() {
  },
  created() {
    common_vendor.index.showLoading({
      title: "加载中..."
    });
    this.getJsCode();
  },
  methods: {
    getJsCode() {
      var that = this;
      my.getAuthCode({
        scopes: ["auth_base"],
        // 主动授权：auth_user，静默授权：auth_base或者其它scope。如需同时获取用户多项授权，可在 scopes 中传入多个 scope 值。
        success: (authCodeRes) => {
          if (authCodeRes.authCode) {
            that.authCode = authCodeRes.authCode;
            common_vendor.index.__f__("log", "at pages/login/login.vue:115", "授权码", that.authCode);
            my.request({
              url: globalData.globalData.URL + "/api-service/zfbapi/getJsCode2session",
              // 该url是开发者的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
              data: {
                jsCode: that.authCode,
                sellerId: globalData.globalData.sellerId
              },
              method: "POST",
              success: async (tokenRes) => {
                common_vendor.index.__f__("log", "at pages/login/login.vue:125", "调用后端获取token接口得到参数，", tokenRes.data.data);
                if (!tokenRes.data.data.openId) {
                  common_vendor.index.showToast({
                    title: "系统异常，请联系客服",
                    icon: "none"
                  });
                  return;
                }
                common_vendor.index.setStorageSync("accessToken", tokenRes.data.data.accessToken);
                common_vendor.index.setStorageSync("openId", tokenRes.data.data.openId);
                common_vendor.index.setStorageSync("newMember", tokenRes.data.data.newMember);
                this.openId = tokenRes.data.data.openId;
                this.isNewMember = tokenRes.data.data.newMember;
              },
              fail: (e) => {
                common_vendor.index.hideLoading();
                common_vendor.index.__f__("log", "at pages/login/login.vue:143", "调用后端获取token接口失败", e);
                common_vendor.index.showModal({
                  title: "提示",
                  content: "页面数据加载失败，请稍后重试",
                  showCancel: false,
                  confirmText: "确定",
                  success: () => {
                    common_vendor.index.reload();
                  }
                });
              }
            });
          }
          common_vendor.index.hideLoading();
        }
      });
    },
    // 手机号快捷登录
    async handlePhoneLogin() {
      common_vendor.index.__f__("log", "at pages/login/login.vue:165", "手机号快捷登录");
      if (common_vendor.index.getStorageSync("openId")) {
        const b = await this.invokeLoginBeforeCheck();
        if (b) {
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success"
          });
          const memberInfoRes = await api_member.getMemberInfo();
          if (memberInfoRes.code === 0) {
            api_member.changeUser(0).then((res) => {
              if (res.code === 0) {
                common_vendor.index.setStorageSync("token", res.data);
                common_vendor.index.navigateBack();
              }
            });
          }
          return;
        }
      }
    },
    async invokeLoginBeforeCheck() {
      common_vendor.index.__f__("log", "at pages/login/login.vue:197", "调用loginBeforeCheck接口");
      const loginBeforeCheckRes = await api_member.loginBeforeCheck({
        openId: common_vendor.index.getStorageSync("openId"),
        sellerNo: globalData.globalData.sellerNo,
        type: "3"
      });
      if (loginBeforeCheckRes.code === 0) {
        common_vendor.index.__f__("log", "at pages/login/login.vue:206", "调用loginBeforeCheck接口得到参数", loginBeforeCheckRes.data);
        common_vendor.index.setStorageSync("token", loginBeforeCheckRes.data.data.Authorization);
        common_vendor.index.setStorageSync("phoneNo", loginBeforeCheckRes.data.data.phoneNo);
        return true;
      } else {
        return false;
      }
    },
    //  获取用户手机号
    getPhoneNumberAndLogin() {
      my.getPhoneNumber({
        success: (res) => {
          let encryptedDataResponse = res.response;
          common_vendor.index.__f__("log", "at pages/login/login.vue:240", "后端执行解密手机号", encryptedDataResponse);
          my.request({
            //你的服务器地址
            url: globalData.globalData.URL + "/api-service/zfbapi/loginAndRegister",
            data: {
              encryptedData: encryptedDataResponse,
              type: 3,
              sellerNo: globalData.globalData.sellerNo,
              openId: common_vendor.index.getStorageSync("openId")
            },
            method: "POST",
            success: (res2) => {
              common_vendor.index.__f__("log", "at pages/login/login.vue:252", "调用loginAndRegister接口得到参数", res2.data.data);
              if (res2.data.code === 0) {
                common_vendor.index.setStorageSync("token", res2.data.data.Authorization);
                common_vendor.index.setStorageSync("phoneNo", res2.data.data.phoneNo);
                common_vendor.index.showToast({
                  title: "登录成功",
                  icon: "success"
                });
              } else {
                common_vendor.index.showToast({
                  title: "系统异常，请联系客服",
                  icon: "none"
                });
              }
            },
            fail: (err) => {
              common_vendor.index.__f__("log", "at pages/login/login.vue:271", "2222", err);
            }
          });
        },
        fail: (res) => {
          common_vendor.index.__f__("log", "at pages/login/login.vue:276", "授权手机号接口调用失败，哇哈哈哈哈", res);
        }
      });
    },
    // 手机号码登录/注册
    handleRegister() {
      common_vendor.index.__f__("log", "at pages/login/login.vue:284", "手机号码登录/注册");
    },
    // 切换协议同意状态
    toggleAgreement() {
      this.isAgreed = !this.isAgreed;
    },
    // 打开服务协议
    openServiceAgreement() {
      common_vendor.index.__f__("log", "at pages/login/login.vue:295", "打开服务协议");
    },
    // 打开隐私政策
    openPrivacyPolicy() {
      common_vendor.index.__f__("log", "at pages/login/login.vue:301", "打开隐私政策");
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$data.isNewMember && $data.openId
  }, !$data.isNewMember && $data.openId ? {
    b: common_vendor.o((...args) => $options.handlePhoneLogin && $options.handlePhoneLogin(...args))
  } : {}, {
    c: $data.isNewMember && $data.openId
  }, $data.isNewMember && $data.openId ? {
    d: common_vendor.o((...args) => $options.getPhoneNumberAndLogin && $options.getPhoneNumberAndLogin(...args))
  } : {}, {
    e: $data.isAgreed
  }, $data.isAgreed ? {} : {}, {
    f: $data.isAgreed ? 1 : "",
    g: common_vendor.o((...args) => $options.openServiceAgreement && $options.openServiceAgreement(...args)),
    h: common_vendor.o((...args) => $options.openPrivacyPolicy && $options.openPrivacyPolicy(...args)),
    i: common_vendor.o((...args) => $options.toggleAgreement && $options.toggleAgreement(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map

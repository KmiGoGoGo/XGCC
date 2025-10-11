"use strict";
const common_vendor = require("../common/vendor.js");
const globalData = require("../globalData.js");
let isShowingLoginModal = false;
function getToken() {
  return common_vendor.index.getStorageSync("token");
}
function showError(msg = "网络异常，请稍后重试") {
  common_vendor.index.showToast({
    title: msg,
    icon: "none",
    duration: 2e3
  });
}
function toLogin(msg = "请登录") {
  if (isShowingLoginModal) {
    return;
  }
  isShowingLoginModal = true;
  common_vendor.index.showModal({
    title: "提示",
    content: msg,
    showCancel: false,
    confirmText: "去登录",
    success: function(res) {
      isShowingLoginModal = false;
      if (res.confirm) {
        common_vendor.index.redirectTo({ url: "/pages/login/login" });
      }
    },
    fail: function() {
      isShowingLoginModal = false;
    }
  });
}
function request({ url, method = "GET", data = {}, header = {}, showLoading = false }) {
  if (showLoading) {
    common_vendor.index.showLoading({ title: "加载中..." });
  }
  return new Promise((resolve, reject) => {
    if (method.toUpperCase() === "GET" && Object.keys(data).length > 0) {
      const queryString = new URLSearchParams(data).toString();
      url += "?" + queryString;
      data = {};
    }
    common_vendor.index.request({
      url: globalData.globalData.URL + url,
      method,
      data,
      header: {
        "Authorization": getToken(),
        "content-type": "application/json",
        ...header
      },
      success: (res) => {
        if (showLoading)
          common_vendor.index.hideLoading();
        if (res.statusCode === 200) {
          const data2 = res.data;
          if (data2.code === 0) {
            resolve(data2);
          } else if (data2.code === 2) {
            common_vendor.index.removeStorageSync("token");
            toLogin("登录已过期，请重新登录");
            reject(data2);
          } else if (data2.code === -1) {
            toLogin(data2.msg || "请重新登录");
            reject(data2);
          } else if (data2.code === 40623) {
            reject(data2);
          } else if (data2.code === 5) {
            resolve(data2);
          } else if (data2.code === 3) {
            resolve(data2);
          } else if (data2.code === 40624) {
            resolve(data2);
          } else {
            showError("请求失败, 请联系客服");
            reject(data2);
          }
        } else {
          showError("服务器异常, 请联系客服");
          reject(res);
        }
      },
      fail: (err) => {
        if (showLoading)
          common_vendor.index.hideLoading();
        showError("网络异常, 请联系客服");
        reject(err);
      }
    });
  });
}
function get(url, data = {}, options = {}) {
  return request({ url, method: "GET", data, ...options });
}
function post(url, data = {}, options = {}) {
  return request({ url, method: "POST", data, ...options });
}
function postForm(url, data = {}, options = {}) {
  return request({
    url,
    method: "POST",
    data,
    header: {
      "content-type": "application/x-www-form-urlencoded"
    },
    ...options
  });
}
const http = {
  request,
  get,
  post,
  postForm
};
exports.http = http;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map

// utils/request.js
import globalData from '../globalData'

// 防重复弹窗标记
let isShowingLoginModal = false

function getToken() {
  return uni.getStorageSync('token')
  //  || 'eyJhbGciOiJIUzI1NiJ9.eyJzZWxsZXJJZCI6MzY1LCJvbmxpbmVNYXJrIjoiMTc1Njk3NjY5MjMzNiIsImlzTGVhZ3VlciI6MSwiY2FyTWVtYmVySWQiOm51bGwsInR5cGUiOiIzIiwiZXhwIjoxNzg4NTEyNjkyLCJwaG9uZU5vIjoiMTU1NzY3NTM5NTQiLCJtZW1iZXJJZCI6Mjc5MTY0fQ.9vvXWiBdRFfIyHkXjV1tCimX72mjAYtuTF19TlWvJAA'
}

function showError(msg = '网络异常，请稍后重试') {
  uni.showToast({
    title: msg,
    icon: 'none',
    duration: 2000
  })
}

function toLogin(msg = '请登录') {
  // 如果已经在显示登录弹窗，则不重复显示
  if (isShowingLoginModal) {
    return
  }

  isShowingLoginModal = true
  uni.showModal({
    title: '提示',
    content: msg,
    showCancel: false,
    confirmText: '去登录',
    success: function (res) {
      isShowingLoginModal = false // 弹窗关闭后重置状态
      if (res.confirm) {
        uni.redirectTo({ url: '/pages/login/login' })
      }
    },
    fail: function() {
      isShowingLoginModal = false // 弹窗失败时也要重置状态
    }
  })
}

function request({ url, method = 'GET', data = {}, header = {}, showLoading = false }) {
  if (showLoading) {
    uni.showLoading({ title: '加载中...' })
  }

  return new Promise((resolve, reject) => {

    // 处理 GET 请求的参数
    // 不可用 会报错
    if (method.toUpperCase() === 'GET' && Object.keys(data).length > 0) {
      const queryString = new URLSearchParams(data).toString();
      url += '?' + queryString;
      data = {}; // 清空 data，避免重复发送
    }

    uni.request({
      url: globalData.URL + url,
      method,
      data,
      header: {
        'Authorization': getToken(),
        'content-type': 'application/json',
        ...header
      },
      success: (res) => {
        if (showLoading) uni.hideLoading()
        if (res.statusCode === 200) {
          const data = res.data
          // 响应拦截器 - 根据后端返回结构调整
          if (data.code === 0) {
            resolve(data)
          } else if (data.code === 2) {
            // code为2时，清除本地token并跳转到登录页
            uni.removeStorageSync('token')
            toLogin('登录已过期，请重新登录')
            reject(data)
          } else if (data.code === -1) {
            toLogin(data.msg || '请重新登录')
            reject(data)
          } else if (data.code === 40623) {
            reject(data)
          } else if (data.code === 5) {
            resolve(data)
          } else if (data.code === 3) {
            resolve(data)
          } else if (data.code === 40624) {
            resolve(data)
          }
          else {
            showError( '请求失败, 请联系客服')
            reject(data)
          }
        } else {
          showError('服务器异常, 请联系客服')
          reject(res)
        }
      },
      fail: (err) => {
        if (showLoading) uni.hideLoading()
        showError('网络异常, 请联系客服')
        reject(err)
      }
    })
  })
}

// GET 方法
function get(url, data = {}, options = {}) {
  return request({ url, method: 'GET', data, ...options })
}

// POST 方法
function post(url, data = {}, options = {}) {
  return request({ url, method: 'POST', data, ...options })
}

// POST Form 方法
function postForm(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    ...options
  })
}

export default {
  request,
  get,
  post,
  postForm
}

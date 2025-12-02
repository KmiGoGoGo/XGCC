<template>
    <view class="login-container">
        <uv-navbar :border="false" title="登录" bgColor="transparent" @leftClick="back" placeholder safeAreaInsetTop>
          <template v-slot:right>
            <view style="margin-right: 200rpx; margin-bottom: 5rpx;">
              <view class="server-icon-wrapper">
                <uv-icon name="server-fill" size="24" color="#000" @click="contactCustomerService"></uv-icon>
              </view>
            </view>
          </template>
        </uv-navbar>
        <!-- 主要内容区域 -->
        <view class="main-content">
            <!-- 标题区域 -->
            <view class="title-section">
                <!-- Logo 动画区域 -->
                <view class="logo-animation-container">
                    <view class="logo-wrapper" :class="{ 'logo-shift-left': logoShiftLeft }">
                        <image class="logo-svg" src="/static/X.svg" mode="aspectFit"></image>
                    </view>
                    <text class="brand-text" :class="{ 'text-visible': textVisible }">{{ getWxAppName() }}</text>
                </view>
                <view class="title-section-text">
                    <text class="title">欢迎使用</text>
                    <text class="subtitle">请登录/注册</text>
                </view>
            </view>
        </view>

        <!-- 底部协议区域 -->
        <view class="agreement-section">
            <!-- 表单区域 -->
            <view class="form-section">
                <!-- 登录按钮 - 老用户 -->
                <button
                    v-if="!isNewMember && openId"
                    class="login-button" 
                    @click="handlePhoneLogin">
                    <text class="login-button-text">手机号快捷登录</text>
                </button>

                <!-- 登录按钮 - 新用户 微信小程序 -->
                <!-- #ifdef MP-WEIXIN -->
                <button 
                    v-if="isNewMember && openId"
                    class="login-button"
                    open-type="getPhoneNumber"
                    @getphonenumber="getPhoneNumberWx">
                    <text class="login-button-text">手机号快捷登录</text>
                </button>
                <!-- #endif -->

                <!-- 登录按钮 - 新用户 支付宝小程序 -->
                <!-- #ifdef MP-ALIPAY -->
                <button 
                    v-if="isNewMember && openId"
                    class="login-button"
                    open-type="getPhoneNumber"
                    @getphonenumber="getPhoneNumberAlipay">
                    <text class="login-button-text">手机号快捷登录</text>
                </button>
                <!-- #endif -->
            </view>
            <view class="agreement-container">
                <view class="checkbox-container" @click="toggleAgreement">
                    <view class="checkbox" :class="{ 'checked': isAgreed }">
                        <text v-if="isAgreed" class="checkmark">✓</text>
                    </view>
                    <text class="agreement-text">我已阅读并同意 
                        <text class="agreement-link" @click.stop="openServiceAgreement">《服务协议》</text> 
                        和 
                        <text class="agreement-link" @click.stop="openPrivacyPolicy">《隐私政策》</text>
                    </text>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { loginBeforeCheck, alipayLoginBeforeCheck, getMemberInfo, changeUser, loginOther } from '@/api/member';
import globalData from '../../globalData.js';
import { contactCustomerService as contactCustomerServiceFn } from '@/utils/utils';

export default {
    data() {
        return {
            phoneNumber: '',
            password: '',
            isAgreed: false,
            isNewMember: true,
            openId: null,
            authCode: '',
            logoShiftLeft: false, // logo 是否向左移动
            textVisible: false // 文字是否可见
        }
    },
    onLoad() {
        // 页面加载时调用
    },
    onReady() {
        // 页面渲染完成后启动logo动画
        this.startLogoAnimation();
    },
    created() {
        uni.showLoading({
            title: '加载中...'
        })
        this.initAuth()
    },
    methods: {
        getWxAppName() {
            return globalData.wxAppName;
        },
        back() {
            // 判断是否有上一页
            const pages = getCurrentPages()
            if (pages.length > 1) {
                uni.navigateBack()
            } else {
                uni.switchTab({
                    url: '/pages/index/index'
                })
            }
        },
        // 启动 logo 动画
        startLogoAnimation() {
            // 延迟500ms后开始动画
            setTimeout(() => {
                // 1. logo 向左移动
                this.logoShiftLeft = true;
                
                // 2. 延迟 300ms 后文字渐显
                setTimeout(() => {
                    this.textVisible = true;
                }, 300);
            }, 500);
        },
        
        // 初始化授权 - 根据平台调用不同方法
        initAuth() {
            // #ifdef MP-WEIXIN
            this.getWxCode()
            // #endif
            
            // #ifdef MP-ALIPAY
            this.getAlipayAuthCode()
            // #endif
        },

        // 微信小程序 - 获取登录凭证
        // #ifdef MP-WEIXIN
        getWxCode() {
            const that = this
            uni.login({
                provider: 'weixin',
                success: (loginRes) => {
                    console.log('微信登录code:', loginRes.code)
                    that.authCode = loginRes.code
                    
                    // 调用后端接口获取openId
                    uni.request({
                        url: globalData.URL + '/api-service/api/getJsCode2session',
                        data: {
                            jsCode: that.authCode,
                            sellerId: globalData.sellerId
                        },
                        method: 'POST',
                        success: (tokenRes) => {
                            console.log('微信获取token结果:', tokenRes.data.data)
                            if (!tokenRes.data.data.openid) {
                                uni.showToast({
                                    title: '系统异常，请联系客服',
                                    icon: 'none'
                                });
                                return;
                            }
                            uni.setStorageSync('accessToken', tokenRes.data.data.accessToken)
                            uni.setStorageSync('openId', tokenRes.data.data.openid)
                            uni.setStorageSync('newMember', tokenRes.data.data.newMember)
                            
                            uni.setStorageSync('session_key', tokenRes.data.data.session_key)
                            uni.setStorageSync('unionId', tokenRes.data.data.unionid)

                            that.openId = tokenRes.data.data.openid
                            that.isNewMember = tokenRes.data.data.newMember
                        },
                        fail: (e) => {
                            uni.hideLoading()
                            console.log('微信获取token失败', e)
                            uni.showModal({
                                title: '提示',
                                content: '页面数据加载失败，请稍后重试',
                                showCancel: false,
                                confirmText: '确定',
                                success: () => {
                                    uni.reLaunch({
                                        url: '/pages/login/login'
                                    })
                                }
                            })
                        },
                        complete: () => {
                            uni.hideLoading()
                        }
                    })
                },
                fail: (err) => {
                    uni.hideLoading()
                    console.log('微信登录失败:', err)
                    uni.showToast({
                        title: '登录失败，请重试',
                        icon: 'none'
                    })
                }
            })
        },
        // #endif

        // 支付宝小程序 - 获取授权码
        // #ifdef MP-ALIPAY
        getAlipayAuthCode() {
            const that = this
            my.getAuthCode({
                scopes: ['auth_base'],
                success: (authCodeRes) => {
                    if (authCodeRes.authCode) {
                        that.authCode = authCodeRes.authCode
                        console.log('支付宝授权码:', that.authCode)
                        
                        my.request({
                            url: globalData.URL + '/api-service/zfbapi/getJsCode2session',
                            data: {
                                jsCode: that.authCode,
                                sellerId: globalData.sellerId
                            },
                            method: 'POST',
                            success: (tokenRes) => {
                                console.log('支付宝获取token结果:', tokenRes.data.data)
                                if (!tokenRes.data.data.openId) {
                                    uni.showToast({
                                        title: '系统异常，请联系客服',
                                        icon: 'none'
                                    });
                                    return;
                                }
                                uni.setStorageSync('accessToken', tokenRes.data.data.accessToken)
                                uni.setStorageSync('openId', tokenRes.data.data.openId)
                                uni.setStorageSync('newMember', tokenRes.data.data.newMember)

                                that.openId = tokenRes.data.data.openId
                                that.isNewMember = tokenRes.data.data.newMember
                            },
                            fail: (e) => {
                                uni.hideLoading()
                                console.log('支付宝获取token失败', e)
                                uni.showModal({
                                    title: '提示',
                                    content: '页面数据加载失败，请稍后重试',
                                    showCancel: false,
                                    confirmText: '确定',
                                    success: () => {
                                        uni.reLaunch({
                                            url: '/pages/login/login'
                                        })
                                    }
                                })
                            },
                            complete: () => {
                                uni.hideLoading()
                            }
                        });
                    }
                },
                fail: (err) => {
                    uni.hideLoading()
                    console.log('支付宝授权失败:', err)
                }
            });
        },
        // #endif

        // 微信小程序 - 获取手机号
        // #ifdef MP-WEIXIN
        getPhoneNumberWx(e) {
            console.log('微信获取手机号回调:', e)
            
            if (e.detail.errMsg !== 'getPhoneNumber:ok') {
                console.log('用户取消授权或授权失败')
                return;
            }

            if (!e.detail.code) {
                uni.showToast({
                    title: '获取手机号失败',
                    icon: 'none'
                });
                return;
            }

            // 调用后端接口，使用code换取手机号
            uni.request({
                url: globalData.URL + '/api-service/api/loginAndRegister',
                data: {
                    code: e.detail.code,
                    type: 3,
                    sellerNo: globalData.sellerNo,
                    openId: uni.getStorageSync('openId'),
                    iv: e.detail.iv,
                    phoneKey: uni.getStorageSync('session_key'),
                    encryptedData: e.detail.encryptedData
                },
                method: 'POST',
                success: (res) => {
                    console.log('微信登录注册结果:', res.data)
                    if (res.data.code === 0) {
                        uni.setStorageSync('token', res.data.data.Authorization)
                        uni.setStorageSync('phoneNo', res.data.data.phoneNo)
                        uni.showToast({
                            title: '登录成功',
                            icon: 'success'
                        });
                        
                        // 登录成功后返回上一页或跳转首页
                        setTimeout(() => {
                            uni.navigateBack({
                                fail: () => {
                                    uni.switchTab({
                                        url: '/pages/index/index'
                                    });
                                }
                            });
                        }, 1500);
                    } else if (res.data.code === 6000) {
                        uni.showModal({
                            title: '提示',
                            content: res.data.msg,
                            showCancel: true,
                            confirmText: '确定',
                            success: () => {
                                loginOther({
                                    encryptedData: e.detail.encryptedData,
                                    iv: e.detail.iv,
                                    sellerNo: globalData.sellerNo,
                                    phoneKey: uni.getStorageSync('session_key'),
                                    type: "3"
                                }).then(res => {
                                    console.log('微信登录注册结果:', res.data)
                                    if (res.code === 0) {
                                        uni.setStorageSync('token', res.data.Authorization)
                                        uni.setStorageSync('phoneNo', res.data.phoneNo)
                                        uni.showToast({
                                            title: '登录成功',
                                            icon: 'success'
                                        });
                                        setTimeout(() => {
                                            uni.navigateBack({
                                                fail: () => {
                                                    uni.switchTab({
                                                        url: '/pages/index/index'
                                                    });
                                                }
                                            });
                                        }, 1500);
                                    } else {
                                        uni.showToast({
                                            title: res.msg || '登录失败',
                                            icon: 'none'
                                        });
                                    }
                                });
                            }
                        });
                    }
                    
                    else {
                        uni.showToast({
                            title: res.data.msg || '登录失败',
                            icon: 'none'
                        });
                    }
                },
                fail: (err) => {
                    console.log('微信登录注册失败:', err)
                    uni.showToast({
                        title: '系统异常，请联系客服',
                        icon: 'none'
                    });
                }
            });
        },
        // #endif

        // 支付宝小程序 - 获取手机号
        // #ifdef MP-ALIPAY
        getPhoneNumberAlipay() {
            my.getPhoneNumber({
                success: (res) => {
                    let encryptedDataResponse = res.response;
                    console.log('支付宝加密手机号数据:', encryptedDataResponse)
                    
                    my.request({
                        url: globalData.URL + '/api-service/zfbapi/loginAndRegister',
                        data: {
                            encryptedData: encryptedDataResponse,
                            type: 3,
                            sellerNo: globalData.sellerNo,
                            openId: uni.getStorageSync('openId'),
                        },
                        method: 'POST',
                        success: (res) => {
                            console.log('支付宝登录注册结果:', res.data.data)
                            if (res.data.code === 0) {
                                uni.setStorageSync('token', res.data.data.Authorization)
                                uni.setStorageSync('phoneNo', res.data.data.phoneNo)
                                uni.showToast({
                                    title: '登录成功',
                                    icon: 'success'
                                });
                                
                                // 登录成功后返回上一页或跳转首页
                                setTimeout(() => {
                                    uni.navigateBack({
                                        fail: () => {
                                            uni.switchTab({
                                                url: '/pages/index/index'
                                            });
                                        }
                                    });
                                }, 1500);
                            } else {
                                uni.showToast({
                                    title: res.data.msg || '登录失败',
                                    icon: 'none'
                                });
                            }
                        },
                        fail: (err) => {
                            console.log('支付宝登录注册失败:', err)
                            uni.showToast({
                                title: '系统异常，请联系客服',
                                icon: 'none'
                            });
                        }
                    });
                },
                fail: (res) => {
                    console.log('支付宝授权手机号失败:', res);
                },
            });
        },
        // #endif
        
        // 手机号快捷登录 - 老用户直接登录
        async handlePhoneLogin() {
            console.log('老用户手机号快捷登录');
            
            if (!this.isAgreed) {
                uni.showToast({
                    title: '请先同意服务协议和隐私政策',
                    icon: 'none'
                });
                return;
            }
            
            if (uni.getStorageSync('openId')) {
                const loginSuccess = await this.invokeLoginBeforeCheck()
                if (loginSuccess) {
                    uni.showToast({
                        title: '登录成功',
                        icon: 'success'
                    });
                    
                    const memberInfoRes = await getMemberInfo()
                    if (memberInfoRes.code === 0) {
                        changeUser(0).then(res => {
                            if (res.code === 0) {
                                uni.setStorageSync('token', res.data);
                                // 返回上一页或跳转首页
                                setTimeout(() => {
                                    uni.navigateBack({
                                        fail: () => {
                                            uni.switchTab({
                                                url: '/pages/index/index'
                                            });
                                        }
                                    });
                                }, 1500);
                            }
                        });
                    }
                    return;
                }
            }
        },

        // 登录前检查
        async invokeLoginBeforeCheck() {
            console.log('调用登录前检查接口')
            
            // #ifdef MP-WEIXIN
            try {
                const loginBeforeCheckRes = await loginBeforeCheck({
                    openId: uni.getStorageSync('openId'),
                    sellerNo: globalData.sellerNo,
                    type: "3",
                    phoneKey: uni.getStorageSync('session_key'),
                    unionId: uni.getStorageSync('unionId')
                });
                
                if (loginBeforeCheckRes.code === 0) {
                    console.log('微信登录检查成功:', loginBeforeCheckRes.data)
                    uni.setStorageSync('token', loginBeforeCheckRes.data.Authorization)
                    uni.setStorageSync('phoneNo', loginBeforeCheckRes.data.phoneNo)
                    return true;
                } else {
                    return false;
                }
            } catch (error) {
                console.error('微信登录检查失败:', error)
                return false;
            }
            // #endif

            // #ifdef MP-ALIPAY
            try {
                const loginBeforeCheckRes = await alipayLoginBeforeCheck({
                    openId: uni.getStorageSync('openId'),
                    sellerNo: globalData.sellerNo,
                    type: "3"
                });
                
                console.log('支付宝登录检查结果:', loginBeforeCheckRes.data)
                if (loginBeforeCheckRes.code === 0) {
                    console.log('支付宝登录检查成功:', loginBeforeCheckRes.data)
                    uni.setStorageSync('token', loginBeforeCheckRes.data.Authorization)
                    uni.setStorageSync('phoneNo', loginBeforeCheckRes.data.phoneNo)
                    return true;
                } else {
                    return false;
                }
            } catch (error) {
                console.error('支付宝登录检查失败:', error)
                return false;
            }
            // #endif
        },
        
        // 手机号码登录/注册
        handleRegister() {
            console.log('手机号码登录/注册');
            // 跳转到注册页面
        },
        
        // 切换协议同意状态
        toggleAgreement() {
            this.isAgreed = !this.isAgreed;
        },
        
        // 打开服务协议
        openServiceAgreement() {
            // 跳转到服务协议页面
            uni.navigateTo({
                url: '/pages/common/service'
            })
        },
        
        // 打开隐私政策
        openPrivacyPolicy() {
            // 跳转到隐私政策页面
            uni.navigateTo({
                url: '/pages/common/privacy'
            })
        },
        // 联系客服
        contactCustomerService() {
            contactCustomerServiceFn();
        }
    }
}
</script>

<style scoped>
/* 容器样式 */
.login-container {
    min-height: 100vh;
    background-color: #E2F5FF;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 48rpx;
    box-sizing: border-box;
    font-family: "Noto Sans SC", sans-serif;
}

.title-section-text {
    margin-top: 100rpx;
}

/* 主要内容区域 */
.main-content {
    width: 100%;
    max-width: 640rpx;
    text-align: center;
}

/* 标题区域 */
.title-section {
    margin-top: 200rpx;
    margin-bottom: 96rpx;
}

.title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 32rpx;
}

.subtitle {
    display: block;
    font-size: 24rpx;
    color: #4b5563;
}

/* Logo 动画容器 */
.logo-animation-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    min-height: 120rpx;
    position: relative;
}

/* Logo 包装器 */
.logo-wrapper {
    position: relative;
    left: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 500ms ease-out;
}

.logo-wrapper.logo-shift-left {
    transform: translateX(-70rpx);
}

/* Logo SVG */
.logo-svg {
    width: 120rpx;
    height: 120rpx;
}

/* 品牌文字 */
.brand-text {
    position: relative;
    font-size: 48rpx;
    color: #6AAAFB;
    font-weight: bold;
    margin-left: 20rpx;
    opacity: 0;
    transition: opacity 500ms ease-in;
}

.brand-text.text-visible {
    opacity: 1;
}

/* 表单区域 */
.form-section {
    width: 100%;
}

/* 输入框组 */
.input-group {
    margin-bottom: 32rpx;
}

.input-container {
    position: relative;
    width: 100%;
}

.input-icon {
    position: absolute;
    left: 24rpx;
    top: 50%;
    transform: translateY(-50%);
    font-size: 32rpx;
    color: #9ca3af;
    z-index: 2;
}

.input-field {
    width: 100%;
    padding: 24rpx 32rpx 24rpx 80rpx;
    border: 2rpx solid #d1d5db;
    border-radius: 16rpx;
    background-color: #ffffff;
    font-size: 32rpx;
    color: #1f2937;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.3s ease;
}

.input-field:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 6rpx rgba(59, 130, 246, 0.1);
}

.input-field::placeholder {
    color: #9ca3af;
}

/* 登录按钮 */
.login-button {
    width: 100%;
    background-color: #2563eb;
    color: #ffffff;
    font-weight: bold;
    padding: 24rpx 32rpx;
    border-radius: 16rpx;
    margin-bottom: 32rpx;
    transition: background-color 0.3s ease;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    line-height: normal;
}

.login-button::after {
    border: none;
}

.login-button:hover {
    background-color: #1d4ed8;
}

.login-button-text {
    color: #ffffff;
    font-size: 32rpx;
    font-weight: bold;
    display: block;
}

/* 注册链接 */
.register-link {
    text-align: center;
}

.register-text {
    color: #2563eb;
    font-size: 28rpx;
    text-decoration: underline;
    cursor: pointer;
}

.register-text:hover {
    color: #1d4ed8;
}

/* 底部协议区域 */
.agreement-section {
    position: fixed;
    bottom: 64rpx;
    left: 48rpx;
    right: 48rpx;
    width: calc(100% - 96rpx);
    max-width: 640rpx;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.agreement-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.checkbox-container {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    cursor: pointer;
}

.checkbox {
    width: 32rpx;
    height: 32rpx;
    border: 2rpx solid #d1d5db;
    border-radius: 6rpx;
    margin-right: 16rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f3f4f6;
    flex-shrink: 0;
    transition: all 0.3s ease;
}

.checkbox.checked {
    background-color: #2563eb;
    border-color: #2563eb;
}

.checkmark {
    color: #ffffff;
    font-size: 20rpx;
    font-weight: bold;
}

.agreement-text {
    color: #6b7280;
    font-size: 24rpx;
    line-height: 1.5;
}

.agreement-link {
    color: #2563eb;
    text-decoration: underline;
    cursor: pointer;
}

.agreement-link:hover {
    color: #1d4ed8;
}

.server-icon-wrapper {
    width: 55rpx;
    height: 55rpx;
    border-radius: 50%;
    background-color: #FEFFFF;
    opacity: 0.8;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
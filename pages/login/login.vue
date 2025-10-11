<template>
    <view class="login-container">
        <!-- 主要内容区域 -->
        <view class="main-content">
            <!-- 标题区域 -->
            <view class="title-section">
                <text class="title">欢迎使用</text>
                <text class="subtitle">超易充</text>
            </view>

            <!-- 表单区域 -->
            <view class="form-section">
                <!-- 手机号输入框 -->
                <!-- <view class="input-group">
                    <view class="input-container">
                        <text class="input-icon">📱</text>
                        <input 
                            class="input-field" 
                            placeholder="请输入手机号" 
                            type="tel"
                            v-model="phoneNumber"
                        />
                    </view>
                </view> -->

                <!-- 密码输入框 -->
                <!-- <view class="input-group">
                    <view class="input-container">
                        <text class="input-icon">🔓</text>
                        <input 
                            class="input-field" 
                            placeholder="请输入密码" 
                            type="password"
                            v-model="password"
                        />
                    </view>
                </view> -->

                <!-- 登录按钮 -->
                <view
                    v-if="!isNewMember && openId"
                    class="login-button" @click="handlePhoneLogin">
                    <text class="login-button-text">手机号快捷登录</text>
                </view>

                <button v-if="isNewMember && openId"
                    class="login-button"
                    open-type="getPhoneNumber"
                    @getphonenumber="getPhoneNumberAndLogin"
                    >
                    <text class="login-button-text">手机号快捷登录</text>
                </button>


                <!-- 注册链接 -->
                <!-- <view class="register-link" @click="handleRegister">
                    <text class="register-text">手机号码登录/注册</text>
                </view> -->
            </view>
        </view>

        <!-- 底部协议区域 -->
        <view class="agreement-section">
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
import { loginOther } from '@/api/member';
import { loginBeforeCheck, alipayLoginBeforeCheck, alipayLoginAndRegister, getMemberInfo, changeUser } from '@/api/member';
import globalData from '@/globalData';

export default {
    data() {
        return {
            phoneNumber: '',
            password: '',
            isAgreed: false,
            isNewMember: true,
            openId: null
        }
    },
    onLoad() {
        // this.getJsCode()
    },
    created() {
        uni.showLoading({
            title: '加载中...'
        })
        this.getJsCode()
    },
    methods: {
        getJsCode() {
            var that = this
            my.getAuthCode({
                scopes: ['auth_base'],
                // 主动授权：auth_user，静默授权：auth_base或者其它scope。如需同时获取用户多项授权，可在 scopes 中传入多个 scope 值。
                success: (authCodeRes) => {
                    if (authCodeRes.authCode) {
                        // 认证成功
                        // 调用自己的服务端接口，让服务端进行后端的授权认证，并且利用session，需要解决跨域问题
                        that.authCode = authCodeRes.authCode
                        console.log("授权码",that.authCode)
                        my.request({
                            url: globalData.URL + '/api-service/zfbapi/getJsCode2session', // 该url是开发者的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
                            data: {
                                jsCode: that.authCode,
                                sellerId: globalData.sellerId
                            },
                            method: "POST",
                            success: async (tokenRes) => {
                                // 授权成功并且服务器端登录成功
                                console.log("调用后端获取token接口得到参数，",tokenRes.data.data)
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

                                this.openId = tokenRes.data.data.openId
                                this.isNewMember = tokenRes.data.data.newMember
                            },
                            fail: (e) => {
                                // 根据自己的业务场景来进行错误处理
                                uni.hideLoading()
                                console.log("调用后端获取token接口失败",e)
                                uni.showModal({
                                    title: '提示',
                                    content: '页面数据加载失败，请稍后重试',
                                    showCancel: false,
                                    confirmText: '确定',
                                    success: () => {
                                        // 刷新页面
                                        uni.reload()
                                    }
                                })
                            },
                        });
                    }
                    uni.hideLoading()
                },
            });
        },

        // 手机号快捷登录
        async handlePhoneLogin() {

            console.log('手机号快捷登录');
            if (uni.getStorageSync('openId')) {
                const b = await this.invokeLoginBeforeCheck()
                if (b) {
                    uni.showToast({
                        title: '登录成功',
                        icon: 'success'
                    });
                    const memberInfoRes = await getMemberInfo()
                    if (memberInfoRes.code === 0) {
                        changeUser(0).then(res => {
                            if (res.code === 0) {
                                uni.setStorageSync('token', res.data);
                                // 回到上一个页面
                                uni.navigateBack();
                            }
                        });
                    }
                    return;
                }
            }
            
            
            
            // 跳转到主页面或其他页面
            // uni.switchTab({
            //     url: '/pages/index/index'
            // });
        },

        async invokeLoginBeforeCheck() {
            // 调用loginBeforeCheck接口
            console.log('调用loginBeforeCheck接口')
            // #ifdef MP-WEIXIN
            const loginBeforeCheckRes = await loginBeforeCheck({
                openId: uni.getStorageSync('openId'),
                sellerNo: globalData.sellerNo,
                type: "3"
            });
            
            if (loginBeforeCheckRes.code === 0) {
                console.log('调用loginBeforeCheck接口得到参数',loginBeforeCheckRes.data)
                uni.setStorageSync('token', loginBeforeCheckRes.data.data.Authorization)
                uni.setStorageSync('phoneNo', loginBeforeCheckRes.data.data.phoneNo)
                return true;
            } else {
                return false;
            }
            // #endif

            // #ifdef MP-ALIPAY
            
            const loginBeforeCheckRes = await alipayLoginBeforeCheck({
                openId: uni.getStorageSync('openId'),
                sellerNo: globalData.sellerNo,
                type: "3"
            });
            
            console.log('支付宝调用loginBeforeCheck接口得到参数',loginBeforeCheckRes.data)
            if (loginBeforeCheckRes.code === 0) {
                console.log('支付宝调用loginBeforeCheck接口得到参数',loginBeforeCheckRes.data)
                uni.setStorageSync('token', loginBeforeCheckRes.data.Authorization)
                uni.setStorageSync('phoneNo', loginBeforeCheckRes.data.phoneNo)
                return true;
            } else {
                return false;
            }
            // #endif
        },

         //  获取用户手机号
        getPhoneNumberAndLogin() {
            my.getPhoneNumber({
                success: (res) => {
                    let encryptedDataResponse = res.response;
                    console.log("后端执行解密手机号",encryptedDataResponse)
                    my.request({
                        //你的服务器地址
                        url: globalData.URL + '/api-service/zfbapi/loginAndRegister',
                        data: {
                            encryptedData: encryptedDataResponse,
                            type: 3,
                            sellerNo: globalData.sellerNo,
                            openId: uni.getStorageSync('openId'),
                        },
                        method: "POST",
                        success: (res) => {
                            console.log("调用loginAndRegister接口得到参数",res.data.data)
                            if (res.data.code === 0) {
                                uni.setStorageSync('token', res.data.data.Authorization)
                                uni.setStorageSync('phoneNo', res.data.data.phoneNo)
                                uni.showToast({
                                    title: '登录成功',
                                    icon: 'success'
                                });
                                // uni.switchTab({
                                //     url: '/pages/index/index'
                                // });
                            } else {
                                uni.showToast({
                                    title: '系统异常，请联系客服',
                                    icon: 'none'
                                });
                            }
                        },
                        fail: (err) => {
                            console.log("2222",err)
                        }
                    });
                },
                fail: (res) => {
                    console.log("授权手机号接口调用失败，哇哈哈哈哈",res);
                },
            });
            
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
            console.log('打开服务协议');
            // 跳转到服务协议页面
        },
        
        // 打开隐私政策
        openPrivacyPolicy() {
            console.log('打开隐私政策');
            // 跳转到隐私政策页面
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
    justify-content: center;
    align-items: center;
    padding: 0 48rpx;
    box-sizing: border-box;
    font-family: "Noto Sans SC", sans-serif;
}

/* 主要内容区域 */
.main-content {
    width: 100%;
    max-width: 640rpx;
    text-align: center;
}

/* 标题区域 */
.title-section {
    margin-bottom: 96rpx;
}

.title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 16rpx;
}

.subtitle {
    display: block;
    font-size: 36rpx;
    color: #4b5563;
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
</style>
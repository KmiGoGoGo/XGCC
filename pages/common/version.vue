<template>
    <view class="version-page">
        <uv-navbar :border="false" :title="`关于【${getWxAppName()}】`" autoBack placeholder safeAreaInsetTop></uv-navbar>
        <!-- 应用信息 -->
        <view class="app-info">
            <view class="logo-wrapper">
                  <image class="logo-svg" src="/static/X.svg" mode="aspectFit"></image>
              </view>
            <text class="app-name">{{ getWxAppName() }}</text>
            <text class="app-version">v1.0.0</text>
        </view>
        
        <!-- 功能卡片 -->
        <view class="card-list">
            <view class="card-item" @click="goToService">
                <text class="card-text">服务协议</text>
                <uv-icon name="arrow-right" color="#333" size="22"></uv-icon>
            </view> 
            <view class="card-item" @click="goToPrivacy">
                <text class="card-text">隐私政策</text>
                <uv-icon name="arrow-right" color="#333" size="22"></uv-icon>
            </view>
        </view>
        
        <!-- 退出登录按钮 -->
        <view class="bottom-button">
            <!-- 在有token的情况下才显示退出登录按钮 -->
            <uv-button type="error" shape="circle" text="退出登录" @click="handleLogout" v-if="hasToken" />
        </view>
    </view>
</template>

<script>
import { logout } from '@/api/member.js'
import globalData from '../../globalData.js'
export default {
    data() {
        return {
            hasToken: false
        }
    },
    onLoad() {
        this.hasToken = uni.getStorageSync('token') != ''
        console.log('hasToken',this.hasToken)
    },
    methods: {
        getWxAppName() {
            return globalData.wxAppName;
        },
        goToService() {
            uni.navigateTo({
                url: '/pages/common/service'
            })
        },
        goToPrivacy() {
            uni.navigateTo({
                url: '/pages/common/privacy'
            })
        },
        async handleLogout() {
            try {
                const res = await logout()
                if (res.code === 0) {
                    // relaunch
                    uni.reLaunch({
                        url: '/pages/index/index'
                    })
                    // 移除token
                    uni.removeStorageSync('token')
                    uni.removeStorageSync('phoneNo')
                    uni.removeStorageSync('openId')
                    uni.removeStorageSync('newMember')
                    uni.removeStorageSync('accessToken')
                    uni.removeStorageSync('memberInfo')
                    uni.removeStorageSync('deductMode')
                    uni.removeStorageSync('tokenMemberType')
                } else {
                    uni.showToast({
                        title: res.message || '退出登录失败',
                        icon: 'error'
                    })
                }
            } catch (error) {
                console.error('退出登录失败:', error)
                uni.showToast({
                    title: '退出登录失败',
                    icon: 'error'
                })
            }
        }
    }
}
</script>

<style scoped>
.version-page {
    min-height: 100vh;
    background-color: #f5f5f5;
    display: flex;
    padding: 20rpx 20rpx;
    flex-direction: column;
}

.app-info {
    background-color: white;
    border-radius: 8px;
    padding: 30px 20px;
    text-align: center;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Logo 包装器 */
.logo-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Logo SVG */
.logo-svg {
    width: 200rpx;
    height: 200rpx;
}

.app-logo {
    margin-bottom: 15px;
}

.logo-image {
    width: 80px;
    height: 80px;
    border-radius: 16px;
}

.app-name {
    display: block;
    font-size: 20px;
    font-weight: 600;
    color: #6AAAFB;
    margin-bottom: 8px;
}

.app-version {
    display: block;
    font-size: 14px;
    color: #999;
}

.card-list {
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-item {
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
}

.card-item:last-child {
    border-bottom: none;
}

.card-text {
    color: #333;
    font-size: 16px;
}

.arrow {
    color: #ccc;
    font-size: 16px;
}

.bottom-button {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 400px;
}
</style>

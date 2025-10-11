<template>
    <view class="settings-page">
        <!-- 版本设置卡片 -->
        <view class="version-card" @click="goToVersion">
            <text class="version-text">关于【超易充】</text>
            <text class="version-number">v1.0.0</text>
            <text class="arrow">></text>
        </view>
        
        <!-- 退出登录按钮 -->
        <view class="bottom-button">
            <!-- 在有token的情况下才显示退出登录按钮 -->
            <uv-button type="error" shape="circle" text="退出登录" @click="handleLogout" v-if="uni.getStorage('token')" />
        </view>
    </view>
</template>

<script>
import { logout } from '@/api/member.js'

export default {
    methods: {
        goToVersion() {
            uni.navigateTo({
                url: '/pages/common/version'
            })
        },
        async handleLogout() {
            try {
                const res = await logout()
                if (res.code === 0) {
                    // 路由回上一个页面
                    uni.navigateTo({
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
.settings-page {
    width: 100%;
    height: 100vh;
    background-color: #f5f5f5;
    position: relative;
}

.version-card {
    background-color: white;
    margin: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.version-text {
    color: #333;
    font-size: 16px;
    font-weight: 500;
}

.version-number {
    color: #999;
    font-size: 14px;
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
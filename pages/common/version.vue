<template>
    <view class="version-page">
        <!-- 应用信息 -->
        <view class="app-info">
            <view class="app-logo">
                <image src="/static/logo.png" class="logo-image" mode="aspectFit" />
            </view>
            <text class="app-name">超易充</text>
            <text class="app-version">v1.0.0</text>
        </view>
        
        <!-- 功能卡片 -->
        <view class="card-list">
            <view class="card-item" @click="goToService">
                <text class="card-text">服务协议</text>
                <text class="arrow">></text>
            </view>
            <view class="card-item" @click="goToPrivacy">
                <text class="card-text">隐私政策</text>
                <text class="arrow">></text>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    methods: {
        goToService() {
            uni.navigateTo({
                url: '/pages/common/service'
            })
        },
        goToPrivacy() {
            uni.navigateTo({
                url: '/pages/common/privacy'
            })
        }
    }
}
</script>

<style scoped>
.version-page {
    width: 100%;
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 20px;
}

.app-info {
    background-color: white;
    border-radius: 8px;
    padding: 30px 20px;
    text-align: center;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
    color: #333;
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
</style>

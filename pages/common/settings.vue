<template>
    <view class="settings-page">
        <uv-navbar :border="false" :autoBack="false" placeholder safeAreaInsetTop @leftClick="handleNavBack"></uv-navbar>
        <!-- 版本设置卡片 -->
        <view class="version-card" @click="goToVersion">
            <text class="version-text">关于【星光超充】</text>
            <text class="version-number">v1.0.0</text>
            <text class="arrow">></text>
        </view>
    </view>
</template>

<script>
import { handleNavBack } from '@/utils/utils';

export default {
    methods: {
        handleNavBack,
        goToVersion() {
            uni.navigateTo({
                url: '/pages/common/version'
            })
            
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
</style>
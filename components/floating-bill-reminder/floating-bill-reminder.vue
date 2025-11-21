<template>
    <view class="floating-reminder" v-if="visible" @click="handleClick">
        <view class="reminder-content">
            <view class="badge-container">
                <uv-badge numberType="overflow" type="error" max="99" :value="billCount"></uv-badge>
            </view>
            <view class="text-content">
                <text class="reminder-text">未支付</text>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    name: 'FloatingBillReminder',
    props: {
        billCount: {
            type: Number,
            default: 0
        },
        visible: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        handleClick() {
            // 点击悬浮窗跳转到账单页面
            this.$emit('click');
            uni.navigateTo({
                url: '/pages/bill/billList' // 根据实际的账单列表页面路径调整
            });
        }
    }
}
</script>

<style scoped>
.floating-reminder {
    position: fixed;
    bottom: calc(170rpx + env(safe-area-inset-bottom));
    right: 32rpx;
    z-index: 10000;
    background: #FFFFFF;
    border-radius: 50%;
    width: 80rpx;
    height: 80rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
    border: 1rpx solid rgba(0, 0, 0, 0.05);
    animation: slideUp 0.3s ease-out;
}

.reminder-content {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.badge-container {
    position: absolute;
    top: -8rpx;
    right: -8rpx;
    z-index: 10;
}

.text-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 4rpx;
}

.reminder-text {
    color: #333333;
    font-size: 20rpx;
    font-weight: 400;
    line-height: 1.2;
}

/* 动画效果 */
@keyframes slideUp {
    from {
        transform: translateY(100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* 点击效果 */
.floating-reminder:active {
    opacity: 0.8;
    transition: opacity 0.1s ease;
}
</style>

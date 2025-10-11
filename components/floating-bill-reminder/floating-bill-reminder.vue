<template>
    <view class="floating-reminder" v-if="visible" @click="handleClick">
        <view class="reminder-content">
            <text class="reminder-text">您有未支付订单 ({{ billCount }}单)</text>
            <text class="reminder-action">去支付 ></text>
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
    left: 32rpx;
    right: 32rpx;
    z-index: 10000;
    background: #FFFFFF;
    border-radius: 24rpx;
    padding: 24rpx 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
    border: 1rpx solid rgba(0, 0, 0, 0.05);
    animation: slideUp 0.3s ease-out;
}

.reminder-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 750rpx;
}

.reminder-text {
    color: #333333;
    font-size: 28rpx;
    font-weight: 400;
}

.reminder-action {
    color: #007AFF;
    font-size: 28rpx;
    font-weight: 500;
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

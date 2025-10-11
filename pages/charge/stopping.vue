<template>
    <view class="page-container">
        <!-- 居中提示文字 -->
        <view class="message-container">
            <text class="main-message">充电桩预计将在60秒内停止</text>
            <text class="sub-message">请勿离开此页面</text>
            <text class="sub-message">为避免产生额外占位费，充电结束后请拔枪驶离车位</text>
        </view>

        <!-- 倒计时圆环 -->
        <view class="countdown-circle">
            <view class="circle-container" :style="circleStyle">
                <text class="countdown-text">{{ countdown }}<text class="countdown-unit">s</text></text>
            </view>
        </view>

        <!-- 状态提示 -->
        <view class="status-info">
            <text class="status-text">正在停止充电...</text>
        </view>
    </view>
</template>

<script>
import { getBillDetailById } from '@/api/bill.js'

export default {
    data() {
        return {
            countdown: 60,
            timer: null,
            smoothTimer: null,
            pollingTimer: null, // 轮询定时器
            billId: null, // 账单ID
            busId: null, // 账单ID
            progress: 100, // 进度百分比，从100%开始递减
            smoothProgress: 100 // 用于平滑动画的进度值
        }
    },
    computed: {
        circleStyle() {
            // 使用平滑进度值
            return {
                '--progress': `${this.smoothProgress}%`
            }
        }
    },
    onLoad(options) {
        // 从路由参数中获取账单ID
        console.log('停止充电参数', options);
        if (options.billId && options.busId) {
            this.billId = options.billId;
            this.busId = options.busId;
            this.startPolling();
        } else {
            uni.showToast({
                title: '参数错误',
                icon: 'none'
            });
            uni.navigateBack();
        }
        this.startCountdown();
    },
    methods: {
        startCountdown() {
            // 主计时器：每秒更新数字
            this.timer = setInterval(() => {
                if (this.countdown > 0) {
                    this.countdown--;
                } else {
                    this.stopCountdown();
                    this.handleCountdownComplete();
                }
            }, 1000);
            
            // 平滑动画计时器：每50ms更新圆环进度
            this.smoothTimer = setInterval(() => {
                if (this.countdown >= 0) {
                    // 计算目标进度
                    const targetProgress = (this.countdown / 60) * 100;
                    // 使用缓动函数实现平滑过渡
                    const diff = targetProgress - this.smoothProgress;
                    if (Math.abs(diff) > 0.05) {
                        // 使用指数衰减算法，让动画更自然
                        this.smoothProgress += diff * 0.08;
                    } else {
                        this.smoothProgress = targetProgress;
                    }
                }
            }, 50);
        },
        
        stopCountdown() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
            if (this.smoothTimer) {
                clearInterval(this.smoothTimer);
                this.smoothTimer = null;
            }
        },
        
        handleCountdownComplete() {
            // 跳转到结算页面，传递账单ID
            uni.navigateTo({
                url: `/pages/bill/billDelay?id=${this.billId}`
            });
        },
        
        // 启动账单轮询
        startPolling() {
            if (this.pollingTimer) {
                clearInterval(this.pollingTimer);
            }
            
            // 立即执行一次
            this.fetchBillDetail();
            
            // 每2秒轮询一次
            this.pollingTimer = setInterval(() => {
                this.fetchBillDetail();
            }, 2000);
            
            console.log('开始轮询账单详情，间隔: 2秒');
        },
        
        // 停止账单轮询
        stopPolling() {
            if (this.pollingTimer) {
                clearInterval(this.pollingTimer);
                this.pollingTimer = null;
                console.log('停止轮询账单详情');
            }
        },
        
        // 获取账单详情
        async fetchBillDetail() {
            if (!this.billId) {
                console.log('账单ID不存在，跳过本次轮询');
                return;
            }
            
            try {
                const response = await getBillDetailById(this.billId);
                if (response && response.code === 0) {
                    console.log('账单详情更新:', response.data);
                    // 这里可以根据需要处理账单详情数据
                    // 例如：检查账单状态，如果已完成则可以提前结束倒计时
                    this.handleBillDetailResponse(response.data);
                } else {
                    console.error('获取账单详情失败:', response);
                }
            } catch (error) {
                console.error('调用账单详情接口失败:', error);
            }
        },
        
        // 处理账单详情响应
        handleBillDetailResponse(billData) {
            // 检查账单状态
            if (billData.billStatus === 11) {
                console.log('账单状态为11，跳转到结算页面');
                this.stopCountdown();
                this.stopPolling();
                
                // 跳转到结算页面，传递账单ID
                uni.navigateTo({
                    url: `/pages/bill/settlementPay?busId=${this.busId}&billId=${this.billId}`
                });
            } else if (billData.billStatus === 14) {
                console.log('账单状态为14，跳转到结算页面');
                this.stopCountdown();
                this.stopPolling();
                
                // 跳转到结算页面，传递账单ID
                uni.navigateTo({
                    url: `/pages/bill/settlementInfo?busId=${this.busId}&billId=${this.billId}`
                });
            }
        }
    },
    
    // 页面卸载时清理定时器
    onUnload() {
        this.stopCountdown();
        this.stopPolling();
    },
    
    // 页面隐藏时暂停倒计时和轮询
    onHide() {
        this.stopCountdown();
        this.stopPolling();
    },
    
    // 页面显示时重新开始倒计时和轮询
    onShow() {
        if (this.countdown > 0 && !this.timer) {
            this.startCountdown();
        }
        if (this.billId && !this.pollingTimer) {
            this.startPolling();
        }
    }
}
</script>

<style scoped>
.page-container {
    height: 100vh;
    width: 100vw;
    background: #E2F5FF;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0 32rpx;
    box-sizing: border-box;
    position: relative;
}

/* 消息容器 */
.message-container {
    text-align: center;
    margin-bottom: 120rpx;
    animation: fadeInUp 0.8s ease-out;
}

.main-message {
    display: block;
    font-size: 36rpx;
    color: #3B82F6;
    font-weight: bold;
    margin-bottom: 24rpx;
    text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
}

.sub-message {
    display: block;
    font-size: 32rpx;
    color: #3B82F6;
    font-weight: 400;
}

/* 倒计时圆环 */
.countdown-circle {
    display: flex;
    justify-content: center;
    margin-bottom: 120rpx;
    animation: fadeInScale 0.8s ease-out 0.2s both;
}

.circle-container {
    width: 400rpx;
    height: 400rpx;
    border-radius: 50%;
    background: #FFFFFF;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.2);
    position: relative;
    overflow: hidden;
}

.circle-container::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: conic-gradient(
        from 0deg, 
        #3B82F6 0%, 
        #3B82F6 var(--progress, 100%), 
        #f0f0f0 var(--progress, 100%), 
        #f0f0f0 100%
    );
    padding: 16rpx;
    box-sizing: border-box;
    mask: radial-gradient(farthest-side, transparent calc(100% - 16rpx), white calc(100% - 16rpx));
    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 16rpx), white calc(100% - 16rpx));
    transition: background 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    transform: rotate(-90deg); /* 从顶部开始 */
}

.countdown-text {
    font-size: 96rpx;
    font-weight: bold;
    color: #3B82F6;
    z-index: 1;
    position: relative;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.countdown-unit {
    font-size: 48rpx;
    color: #3B82F6;
    margin-left: 8rpx;
}

/* 状态信息 */
.status-info {
    text-align: center;
    animation: fadeInUp 0.8s ease-out 0.4s both;
}

.status-text {
    font-size: 32rpx;
    color: #3B82F6;
    position: relative;
}

.status-text::after {
    content: '';
    display: inline-block;
    width: 8rpx;
    height: 8rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.8);
    margin-left: 16rpx;
    animation: blink 1.5s infinite;
}

/* 动画效果 */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(60rpx);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInScale {
    from {
        opacity: 0;
        transform: scale(0.8);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes blink {
    0%, 50% {
        opacity: 1;
    }
    51%, 100% {
        opacity: 0.3;
    }
}

/* 倒计时数字变化时的缩放动画 */
.countdown-text {
    animation: countdownPulse 1s ease-in-out infinite;
}

@keyframes countdownPulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

/* 移除了警告动画相关样式 */
</style>
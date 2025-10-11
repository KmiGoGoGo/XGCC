<template>
    <view class="page-container">
        
        <view class="lottie-container" :class="{ 'lottie-animation1': animation1, 'no-animation': noAnimation }">
            <lottie
            :autoplay="startingLottie.autoplay" 
            :id="startingLottie.id"
            :path="startingLottie.path" 
            :repeat-count="startingLottie.repeatCount"
            class="startingLottie"
            :style="lottieStyle">
            </lottie>
        </view>
        
        <!-- 固定居中显示的启动中文字 -->
        <view class="loading-text-container" :class="{ 'lottie-animation1': animation1, 'no-animation': noAnimation }">
            <text class="loading-text">启动中</text>
        </view>

        <!-- 充电站信息 -->
        <view class="station-info">
            <text class="station-name">{{ chargingGunInfo.stationName || '--' }}</text>
            <text class="station-gun">{{ chargingGunInfo.gunName || '--' }}</text>
        </view>

        <!-- 电量百分比圆环 -->
        <view class="battery-circle">
            <view class="circle-container">
                <text class="battery-percent">{{ batteryData.percent || '--' }}<text class="battery-percent-unit">%</text>
                </text>
            </view>
        </view>

        <!-- 车牌号和时间 -->
        <view class="car-info">
            <text class="car-number">{{ carNumber || '--' }}</text>
            <text class="charge-time">{{ chargingTime || '--' }}</text>
        </view>

        <!-- 费用统计卡片 -->
        <view class="stats-card">
            <view class="price-info">
                <text class="price-label">当前电价(综合): <text class="price-value">{{ priceData.currentPrice || '--' }}</text>元/度</text>
            </view>
            
            <view class="stats-row">
                <view class="stat-item">
                    <text class="stat-value">{{ chargingStats.duration || '--' }}</text>
                    <text class="stat-label">充电时长(min)</text>
                </view>
                <view class="stat-item">
                    <text class="stat-value">{{ parseFloat(chargingStats.powerAmount).toFixed(2) || '--' }}</text>
                    <text class="stat-label">已充电量(度)</text>
                </view>
                <view class="stat-item">
                    <text class="stat-value">{{ chargingStats.estimatedTime || '--' }}</text>
                    <text class="stat-label">预估充满剩余时间</text>
                </view>
            </view>

            <view class="stats-row">
                <view class="stat-item">
                    <text class="stat-value">{{ parseFloat(electricalData.current).toFixed(2) || '--' }}</text>
                    <text class="stat-label">电流(A)</text>
                </view>
                <view class="stat-item">
                    <text class="stat-value">{{ parseFloat(electricalData.voltage).toFixed(2) || '--' }}</text>
                    <text class="stat-label">电压(V)</text>
                </view>
                <view class="stat-item">
                    <text class="stat-value">{{ parseFloat(electricalData.power).toFixed(2) || '--' }}</text>
                    <text class="stat-label">功率(kW)</text>
                </view>
            </view>

            <view class="stats-row">
                <view class="stat-item">
                    <text class="stat-value">{{ parseFloat(feeData.preChargeAmount).toFixed(2) || '--' }}</text>
                    <text class="stat-label">预充金额</text>
                </view>
                <view class="stat-item">
                    <text class="stat-value">{{ parseFloat(feeData.estimatedFee).toFixed(2) || '--' }}</text>
                    <text class="stat-label">预估费用(元)</text>
                </view>
                <view class="stat-item">
                    <text class="stat-value">{{ parseFloat(feeData.remainingFee).toFixed(2) || '--' }}</text>
                    <text class="stat-label">剩余费用(元)</text>
                </view>
            </view>
        </view>

        <uv-alert title="温馨提示" type="warning" description="预估费用仅供参考，请以实际结算金额为准" showIcon></uv-alert>

        <!-- 停止充电按钮 -->
        <view class="stop-button" @tap="handleStopCharging">
            <text class="stop-text">停止充电</text>
        </view>
    </view>
</template>

<script>
import { querChargeOnline } from '../../api/charge.js'
import { getPreChargeAmountByBusId } from '../../api/charge.js'
import { stopCharge } from '../../api/charge.js'

export default {
    data() {
        return {
            animationEnabled: true,
            animation1: false,
            animation2: false,
            gunStatus: null,
            noAnimation: false,
            startingLottie: {
                id: 'startingLottie',
                desc: '启动中',
                autoplay: false,
                path:'https://lottie.host/4937651f-eae1-4005-8ede-3cde4dd26ee3/Tm5KQBFFBi.json',
                optimize: 'true',
                repeatCount: 0,  
            },
            screenInfo: {
                width: 0,
                height: 0
            },
            // 电池数据
            batteryData: {
                percent: null
            },
            // 充电时间
            chargingTime: '2023年08月20日 16:01:17',
            // 价格数据
            priceData: {
                currentPrice: ''
            },
            // 充电统计数据
            chargingStats: {
                duration: null,
                powerAmount: null,
                estimatedTime: null
            },
            // 电气数据
            electricalData: {
                current: null,
                voltage: null,
                power: null
            },
            // 费用数据
            feeData: {
                preChargeAmount: null,
                estimatedFee: null,
                remainingFee: null
            },
            chargingGunInfo: {
                pileNo: '',
                gunNo: '',
                busId: '',
                gunId: '',
                stationName: '',
                gunName: '',
                pileName: ''
            },
            // 定时器相关
            pollingTimer: null,
            pollingInterval: 5000 // 5秒
        }
    },
    computed: {
        lottieStyle() {
            return {
                // width: `${this.screenInfo.width * 1}px`,  // 使用屏幕宽度的80%
                // height: `${this.screenInfo.height * 1}px`  // 使用屏幕高度的60%
                width: `100%`,
                height: `100%`
            }
        }
    },
    async onLoad(options) {
        console.log('充电中参数', options);
        // 校验参数
        this.animationEnabled = options.animationEnabled;
        if (this.animationEnabled == 'false') {
            this.noAnimation = true;
        }
        console.log('set animationEnabled',this.animationEnabled)
        if (!options.pileNo || !options.gunNo || !options.busId || !options.gunId || !options.billId) {
            uni.showToast({
                title: '参数异常',
                icon: 'none'
            });
            return;
        }
        this.chargingGunInfo = {
            pileNo: options.pileNo,
            gunNo: options.gunNo,
            busId: options.busId,
            gunId: options.gunId,
            billId: options.billId
        };
        
        try {
            console.log('请求预充金额', this.chargingGunInfo.busId);
            const preChargeAmountRes = await getPreChargeAmountByBusId(options.busId)
            if (preChargeAmountRes && preChargeAmountRes.code === 0) {
                this.feeData.preChargeAmount = (parseInt(preChargeAmountRes.data) / 100).toFixed(2);
            }
            
            // 启动定时器进行轮询
            this.startPolling();
        } catch (error) {
            console.error('初始化充电数据失败:', error);
        }

        this.getScreenInfo();
    },
    methods: {
        // 获取充电数据
        async fetchChargingData() {
            // 检查必要参数是否存在
            if (!this.chargingGunInfo.busId || !this.chargingGunInfo.pileNo || !this.chargingGunInfo.gunNo) {
                console.warn('充电桩参数不完整，跳过本次轮询');
                return;
            }
            
            try {
                const querChargeOnlineRes = await querChargeOnline({
                    busId: this.chargingGunInfo.busId,
                    pileNo: this.chargingGunInfo.pileNo,
                    gunNo: this.chargingGunInfo.gunNo
                });
                
                if (querChargeOnlineRes && querChargeOnlineRes.code === 0) {
                    // 这里可以根据接口返回的数据更新页面状态
                    console.log('充电数据更新:', querChargeOnlineRes.data);
                    
                    // 根据实际接口返回的数据结构来更新相应的数据
                    // 请根据实际的API响应结构来调整以下代码
                    if (querChargeOnlineRes.data) {
                        const data = querChargeOnlineRes.data;
                        this.gunStatus = data.chargingStatus;
                        
                        // 更新电池百分比
                        this.batteryData.percent = data.soc;
                        
                        // 更新充电统计数据
                        this.chargingStats.duration = data.chargingTime;
                        this.chargingStats.powerAmount = (parseInt(data.powerinfo) / 1000).toFixed(3);
                        this.chargingStats.estimatedTime = data.remainingtime;
                        
                        // 更新电气数据
                        this.electricalData.current = (parseInt(data.ivoltage) / 1000).toFixed(3);
                        this.electricalData.voltage = (parseInt(data.voltage) / 1000).toFixed(3);
                        this.electricalData.power = data.realTimePower;
                        
                        // 更新费用数据
                        this.feeData.estimatedFee = (parseInt(data.cost) / 1000).toFixed(3);
                        if (this.feeData.preChargeAmount) {
                            this.feeData.remainingFee = (this.feeData.preChargeAmount - this.feeData.estimatedFee).toFixed(2);
                        }

                        if (data.plateno) {
                            this.carNumber = data.plateno;
                        }
                        
                        // 更新充电时间
                        if (data.chargingTime) {
                            this.chargingTime = data.chargingTime;
                        }

                        if (data.stationName) {
                            this.chargingGunInfo.stationName = data.stationName;
                        }

                        if (data.gunName) {
                            this.chargingGunInfo.gunName = data.gunName;
                        }

                        if (data.pileName) {
                            this.chargingGunInfo.pileName = data.pileName;
                        }

                        if (data.electPrice) {
                            this.priceData.currentPrice = (parseInt(data.electPrice) / 10000).toFixed(4);
                        }
                    }
                } else if (querChargeOnlineRes && querChargeOnlineRes.code === 40624) {
                    uni.showModal({
                        title: '温馨提示',
                        content: '平台检测到充电桩已经停止充电，是否结束充电？',
                        confirmText: '结束充电',
                        cancelText: '取消',
                        success: (res) => {
                            if (res.confirm) {
                                this.handleStopCharging()
                            }
                        }
                    });
                } else {
                    console.error('获取充电数据失败:', querChargeOnlineRes);
                }
            } catch (error) {
                console.error('调用充电接口失败:', error);
                // 网络错误时可以考虑增加重试机制或者给用户提示
            }
        },
        
        // 启动轮询
        startPolling() {
            if (this.pollingTimer) {
                clearInterval(this.pollingTimer);
            }
            this.fetchChargingData();
            this.pollingTimer = setInterval(() => {
                this.fetchChargingData();
            }, this.pollingInterval);
            
            console.log('开始轮询充电数据，间隔:', this.pollingInterval, 'ms');
        },
        
        // 停止轮询
        stopPolling() {
            if (this.pollingTimer) {
                clearInterval(this.pollingTimer);
                this.pollingTimer = null;
                console.log('停止轮询充电数据');
            }
        },
        
        // 获取屏幕信息
        getScreenInfo() {
            const systemInfo = uni.getSystemInfoSync();
            this.screenInfo = {
                width: systemInfo.screenWidth,
                height: systemInfo.screenHeight
            };
        },
        onStartingAnimationEnd() {
            console.log('动画结束');
            this.animation1 = true;
        },
        
        // 处理停止充电按钮点击
        handleStopCharging() {
            uni.showModal({
                title: '确认停止充电',
                content: '确定要停止当前充电吗？',
                confirmText: '确定',
                cancelText: '取消',
                success: async (res) => {
                    if (res.confirm) {
                        // 这里可以调用停止充电的API
                        if (!this.gunStatus) {
                            uni.showToast({
                                title: '充电状态同步中，请稍后再试',
                                icon: 'none'
                            });
                            return;
                        }
                        // 然后跳转到结算页面或其他页面
                        console.log('用户确认停止充电');
                        const stopChargeRes = await stopCharge({
                            busId: this.chargingGunInfo.busId
                        });
                        if (stopChargeRes && stopChargeRes.code === 0) {
                            this.stopPolling();
                            // 跳转到结算页面
                            uni.navigateTo({
                                url: `/pages/charge/stopping?busId=${this.chargingGunInfo.busId}&billId=${this.chargingGunInfo.billId}`
                            });
                        }
                    }
                }
            });
        }
    },
    onReady() {
		this.$nextTick(() => {
            // this.startSuccess = true;
            // 五秒后启动成功
            if (my) {
                var lottieContext = my.createLottieContext(this.startingLottie.id);
                console.log('animationEnabled',this.animationEnabled)
                if (this.animationEnabled == 'true' || this.animationEnabled == true) {
                    console.log('播放动画');
                    lottieContext.play()
                    setTimeout(() => {
                        this.animation1 = true;
                    }, 5000);
                }
            }
		});
    },
    
    // 页面隐藏时停止轮询
    onHide() {
        this.stopPolling();
    },
    
    // 页面显示时重新开始轮询
    onShow() {
        if (this.chargingGunInfo.busId) {
            this.startPolling();
        }
    },
    
    // 页面卸载时清理定时器
    onUnload() {
        this.stopPolling();
    },
    
    // 页面销毁前清理定时器
    beforeDestroy() {
        this.stopPolling();
    }
}
</script>

<style scoped>
.lottie-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #288EEE;
    z-index: 998;
    opacity: 1;
}

.no-animation {
    opacity: 0;
    background-color: #E2F5FF;
    pointer-events: none;
}

.lottie-animation1 {
    opacity: 0;
    /* background-color: #E2F5FF; */
    pointer-events: none;
    transition:opacity 4s ease-in-out;
}

.lottie-animation2 {
    background-color: #E2F5FF;
    pointer-events: none;
    /* transition: background-color 1s ease; */
}


.page-container {
    height: 100vh;
    width: 100vw;
    /* display: flex;
    justify-content: center;
    align-items: center; */
    background-color: #E2F5FF;
    position: relative;
    padding: 0 32rpx;
    box-sizing: border-box;
}

/* 固定居中显示的文字容器 */
.loading-text-container {
    position: fixed;
    top: 85%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: transparent;
    z-index: 998;
}
/* 白色文字样式 */
.loading-text {
    color: #FFFFFF;
}
.back-icon {
    font-size: 48rpx;
    color: #333;
    font-weight: bold;
}

.nav-title {
    font-size: 36rpx;
    color: #333;
    font-weight: 500;
}

.info-icon {
    width: 36rpx;
    height: 36rpx;
    border: 2rpx solid #333;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24rpx;
    color: #333;
}

/* 充电站信息 */
.station-info {
    text-align: center;
    padding-top: 20rpx;
    margin-bottom: 60rpx;
}

.station-name {
    display: block;
    font-size: 32rpx;
    color: #333;
    font-weight: bold;
    margin-bottom: 16rpx;
}

.station-gun {
    display: block;
    font-size: 24rpx;
    color: #666;
}

/* 电量圆环 */
.battery-circle {
    display: flex;
    justify-content: center;
    margin-bottom: 60rpx;
}

.circle-container {
    width: 320rpx;
    height: 320rpx;
    border-radius: 50%;
    background: #FFFFFF;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
    position: relative;
}

.circle-container::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: conic-gradient(from 0deg, #4A90E2 0%, #4A90E2 78%, #E8F4FD 78%, #E8F4FD 100%);
    padding: 12rpx;
    box-sizing: border-box;
    mask: radial-gradient(farthest-side, transparent calc(100% - 12rpx), white calc(100% - 12rpx));
    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 12rpx), white calc(100% - 12rpx));
}

.battery-percent {
    font-size: 88rpx;
    font-weight: bold;
    color: #4A90E2;
    /* z-index: 1; */
}
.battery-percent-unit {
    font-size: 48rpx;
    color: #4A90E2;
}
/* 车牌号和时间 */
.car-info {
    text-align: center;
    margin-bottom: 40rpx;
}

.car-number {
    display: block;
    font-size: 40rpx;
    color: #333;
    font-weight: 700;
    margin-bottom: 16rpx;
}

.charge-time {
    display: block;
    font-size: 24rpx;
    color: #666;
}

/* 统计卡片 */
.stats-card {
    background: #FFFFFF;
    border-radius: 24rpx;
    padding: 32rpx;
    margin-bottom: 40rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.price-info {
    margin-bottom: 32rpx;
}

.price-label {
    font-size: 28rpx;
    color: #666;
}
.price-value {
    font-size: 36rpx;
    font-weight: bold;
    color: #4A90E2;
}

.stats-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 48rpx;
}

.stats-row:last-child {
    margin-bottom: 0;
}

.stat-item {
    flex: 1;
    text-align: center;
}

.stat-value {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 8rpx;
}

.stat-label {
    display: block;
    font-size: 24rpx;
    color: #999;
}

/* 停止充电按钮 */
.stop-button {
    background: #4A90E2;
    border-radius: 48rpx;
    height: 96rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto 60rpx;
    width: 100%;
    max-width: 600rpx;
    margin-top: 20rpx;
}

.stop-text {
    color: #FFFFFF;
    font-size: 32rpx;
    font-weight: 500;
}

</style>
<template>
	<view
		class="charging-status-bar"
		v-if="chargeData"
		@click="goToChargingDetail"
	>
		<!-- 左侧 SOC 突出展示 -->
		<view class="soc-section">
			<text class="soc-label">SOC</text>
			<view class="soc-value-row">
				<text class="soc-value">{{ soc }}</text>
				<text class="soc-unit">%</text>
			</view>
			<!-- 仅样式展示，无实际停止充电逻辑 -->
			<view class="stop-btn-style">
				<text class="stop-btn-text">停止充电</text>
			</view>
		</view>

		<!-- 右侧数据网格 -->
		<view class="info-section">
			<view class="info-row">
				<view class="info-item" v-for="item in infoRowTop" :key="item.label">
					<text class="info-label">{{ item.label }}</text>
					<view class="info-value-row">
						<text class="info-value">{{ item.value }}</text>
						<text class="info-unit" v-if="item.unit">{{ item.unit }}</text>
					</view>
				</view>
			</view>
			<view class="info-row info-row--center">
				<view class="info-item" v-for="item in infoRowBottom" :key="item.label">
					<text class="info-label">{{ item.label }}</text>
					<view class="info-value-row">
						<text class="info-value">{{ item.value }}</text>
						<text class="info-unit" v-if="item.unit">{{ item.unit }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getBillByNo } from '@/api/bill';

export default {
	name: 'ChargingStatusBarV2',
	props: {
		chargeData: {
			type: Object,
			default: null
		}
	},
	computed: {
		soc() {
			const val = this.chargeData?.soc;
			return val !== undefined && val !== null && val !== '' ? val : '--';
		},
		// 由电压×电流计算功率（kW）
		calculatedPower() {
			const voltage = parseFloat(this.chargeData?.voltage);
			const current = parseFloat(this.chargeData?.current);
			if (isNaN(voltage) || isNaN(current)) return '--';
			return (voltage * current / 1000).toFixed(2);
		},
		infoRowTop() {
			return [
				{
					label: '充电金额',
					value: this.formatNumber(this.chargeData?.chargeBalance, 2),
					unit: '元'
				},
				{
					label: '充电时长',
					value: this.chargeData?.chargingTime,
					unit: '分钟'
				},
				{
					label: '功率',
					value: this.calculatedPower,
					unit: 'kWh'
				}
			];
		},
		infoRowBottom() {
			return [
				{
					label: '充电量',
					value: this.formatNumber(this.chargeData?.power, 3),
					unit: '度'
				},
				{
					label: '剩余时间',
					value: this.chargeData?.retainTime,
					unit: '分钟'
				}
			];
		}
	},
	methods: {
		formatNumber(val, digits = 2) {
			if (val === undefined || val === null || val === '') return '--';
			const num = parseFloat(val);
			if (isNaN(num)) return '--';
			return num.toFixed(digits);
		},
		// 接口时间为秒，转换为分钟展示
		formatMinutes(val) {
			if (val === undefined || val === null || val === '') return '--';
			const seconds = parseFloat(val);
			if (isNaN(seconds)) return '--';
			return Math.max(0, Math.round(seconds / 60));
		},
		async goToChargingDetail() {
			if (!this.chargeData) {
				uni.showToast({
					title: '充电数据异常',
					icon: 'none'
				});
				return;
			}

			const routeParams = {
				pileNo: this.chargeData.pileNo,
				gunNo: this.chargeData.gunNo,
				busId: this.chargeData.billNo,
				gunId: this.chargeData.gunId,
				billId: this.chargeData.billId,
				animationEnabled: false
			};

			if (!routeParams.pileNo || (!routeParams.gunNo && routeParams.gunNo !== '0') || !routeParams.busId) {
				console.error('充电详情跳转参数不完整:', routeParams);
				uni.showToast({
					title: '充电数据不完整，无法跳转',
					icon: 'none'
				});
				return;
			}

			if (!routeParams.billId || routeParams.billId === undefined) {
				const billRes = await getBillByNo(routeParams.busId);
				if (billRes.code === 0) {
					routeParams.billId = billRes.data.id;
					routeParams.gunId = billRes.data.gunId;
				} else {
					uni.showToast({
						title: '获取账单失败',
						icon: 'none'
					});
					return;
				}
			}

			const queryString = Object.keys(routeParams)
				.map(key => `${key}=${encodeURIComponent(routeParams[key])}`)
				.join('&');

			uni.navigateTo({
				url: `/pages/charge/charging?${queryString}`
			});
		}
	}
}
</script>

<style lang="less" scoped>
.charging-status-bar {
	position: fixed;
	left: 24rpx;
	right: 24rpx;
	/* 组件垂直定位：数值越小越靠下，可按底部导航/悬浮按钮高度微调 */
	bottom: calc(180rpx + env(safe-area-inset-bottom));
	z-index: 10000;
	display: flex;
	align-items: stretch;
	min-height: 160rpx;
	padding: 20rpx 24rpx;
	box-sizing: border-box;
	border-radius: 24rpx;
	/* 浅蓝主题半透明背景，与首页 #E5F6FF / #66A8FA 呼应 */
	background: rgba(229, 246, 255, 0.46);
	border: 1rpx solid rgba(102, 168, 250, 0.35);
	box-shadow: 0 8rpx 32rpx rgba(45, 140, 240, 0.12);
	backdrop-filter: blur(12px);
	animation: slideUp 0.3s ease-out;
	overflow: hidden;
}

/* 左侧 SOC：约占 1/3 */
.soc-section {
	flex: 0 0 30%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	padding-right: 16rpx;
	margin-right: 16rpx;
	border-right: 1rpx solid rgba(102, 168, 250, 0.3);
}

.soc-label {
	font-size: 20rpx;
	color: #7aa8d4;
	line-height: 1.2;
}

.soc-value-row {
	display: flex;
	align-items: center;
}

.soc-value {
	font-size: 72rpx;
	font-weight: 700;
	color: #2d8cf0;
	line-height: 1;
	letter-spacing: -2rpx;
}

.soc-unit {
	font-size: 48rpx;
	font-weight: 600;
	color: #66A8FA;
	margin-left: 8rpx;
}

/* 停止充电样式按钮（仅展示） */
.stop-btn-style {
	margin-top: 4rpx;
	padding: 6rpx 20rpx;
	border-radius: 16rpx;
	background: #FF4D4F;
	display: flex;
	align-items: center;
	justify-content: center;
}

.stop-btn-text {
	font-size: 20rpx;
	font-weight: 500;
	color: #FFFFFF;
	line-height: 1;
}

/* 右侧信息区 */
.info-section {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 12rpx;
}

.info-row {
	display: flex;
	width: 100%;
}

.info-row--center {
	justify-content: center;
	padding-top: 12rpx;
	border-top: 1rpx solid rgba(102, 168, 250, 0.3);
}

.info-item {
	width: 33.33%;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
	box-sizing: border-box;
	padding-right: 8rpx;
}

.info-row--center .info-item {
	padding-right: 0;
	align-items: center;
	text-align: center;
}

.info-label {
	font-size: 20rpx;
	color: #7aa8d4;
	line-height: 1.2;
}

.info-value-row {
	display: flex;
	align-items: baseline;
	flex-wrap: nowrap;
}

.info-value {
	font-size: 26rpx;
	font-weight: 600;
	color: #1a6fbf;
	line-height: 1.2;
}

.info-unit {
	font-size: 18rpx;
	color: #66A8FA;
	margin-left: 4rpx;
	flex-shrink: 0;
}

@keyframes slideUp {
	from {
		transform: translateY(100%);
		opacity: 0;
	}
	to {
		transform: translateY(0);
		opacity: 0.88;
	}
}
</style>

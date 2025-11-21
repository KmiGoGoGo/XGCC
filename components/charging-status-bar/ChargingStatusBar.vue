<template>
	<view 
		class="charging-status-bar" 
		v-if="chargeData"
		@click="goToChargingDetail"
	>
		<view class="border-wrapper">
			<view class="rotating-border"></view>
		</view>
		<view class="soc-container">
			<text class="value">{{ soc }}%</text>
		</view>
	</view>
</template>

<script>
import { getBillByNo } from '@/api/bill';

export default {
	name: 'ChargingStatusBar',
	props: {
		chargeData: {
			type: Object,
			default: null
		}
	},
	data() {
		return {}
	},
	computed: {
		// SOC电量百分比
		soc() {
			return this.chargeData?.soc || 0;
		}
	},
	methods: {
		// 跳转到充电详情页面
		async goToChargingDetail() {
			if (!this.chargeData) {
				uni.showToast({
					title: '充电数据异常',
					icon: 'none'
				});
				return;
			}
			
			// 从chargeData中提取必要的路由参数
			const routeParams = {
				pileNo: this.chargeData.pileNo,
				gunNo: this.chargeData.gunNo,
				busId: this.chargeData.billNo,
				gunId: this.chargeData.gunId, // gunId可能等同于gunNo
				billId: this.chargeData.billId, // billId可能是billNo
				animationEnabled: false
			};

			
			// 校验必要参数
			if (!routeParams.pileNo || (!routeParams.gunNo && routeParams.gunNo !== '0') || !routeParams.busId ) {
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
			
			// 构建查询字符串
			const queryString = Object.keys(routeParams)
				.map(key => `${key}=${encodeURIComponent(routeParams[key])}`)
				.join('&');
			
			// 跳转到充电页面
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
	bottom: calc(320rpx + env(safe-area-inset-bottom));
	right: 32rpx;
	z-index: 10000;
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background: #FFFFFF;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
	display: flex;
	align-items: center;
	justify-content: center;
	animation: slideUp 0.3s ease-out;
	transition: opacity 0.2s ease;
	overflow: visible;
}

.charging-status-bar:active {
	opacity: 0.8;
}

/* 边框容器 */
.border-wrapper {
	position: absolute;
	width: 100%;
	height: 100%;
	border-radius: 50%;
	overflow: hidden;
	pointer-events: none;
}

/* 旋转的蓝色边框线条 */
.rotating-border {
	position: absolute;
	width: 200%;
	height: 200%;
	left: -50%;
	top: -50%;
	background: conic-gradient(
		from 0deg,
		transparent 0deg,
		transparent 40deg,
		rgba(255, 255, 255, 0.3) 40deg,
		rgba(255, 255, 255, 0.5) 50deg,
		rgba(255, 255, 255, 0.8) 60deg,
		#FFFFFF 70deg,
		#E3F2FD 75deg,
		#BBDEFB 80deg,
		#90CAF9 85deg,
		#6DACFA 90deg,
		#4A9FF5 95deg,
		#3D8FE0 100deg,
		transparent 100deg,
		transparent 360deg
	);
	animation: rotateBorder 2.5s linear infinite;
	mask: radial-gradient(
		circle,
		transparent 0,
		transparent 36rpx,
		black 36rpx,
		black 44rpx,
		transparent 44rpx
	);
	-webkit-mask: radial-gradient(
		circle,
		transparent 0,
		transparent 36rpx,
		black 36rpx,
		black 44rpx,
		transparent 44rpx
	);
}

.soc-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
	gap: 8rpx;
	position: relative;
	z-index: 1;
}

.label {
	color: #999999;
	font-size: 20rpx;
	font-weight: 400;
	line-height: 1.2;
}

.value {
	color: #6DACFA;
	font-size: 24rpx;
	font-weight: bold;
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

@keyframes rotateBorder {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
</style>
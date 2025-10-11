<template>
	<view 
		class="charging-status-bar" 
		v-if="chargeData"
		:style="{ left: positionX + 'px', top: positionY + 'px' }"
		@touchstart="onTouchStart"
		@touchmove="onTouchMove"
		@touchend="onTouchEnd"
	>
		<!-- 拖拽提示图标 -->
		<view class="drag-indicator" @click="goToChargingDetail">详情></view>
		
		<view class="status-container">
			<!-- 左上角：充电量 -->
			<view class="status-item top-left">
				<text class="label">充电量</text>
				<text class="value">{{ chargePower }}kW</text>
			</view>
			
			<!-- 右上角：SOC -->
			<view class="status-item top-right">
				<text class="label">SOC</text>
				<text class="value">{{ soc }}%</text>
			</view>
			
			<!-- 分割线 -->
			<view class="divider-horizontal"></view>
			<view class="divider-vertical"></view>
			
			<!-- 左下角：已充时间 -->
			<view class="status-item bottom-left">
				<text class="label">已充时间</text>
				<text class="value">{{ formattedChargingTime }}</text>
			</view>
			
			<!-- 右下角：剩余时间 -->
			<view class="status-item bottom-right">
				<text class="label">剩余时间</text>
				<text class="value">{{ formattedRetainTime }}</text>
			</view>
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
		return {
			// 拖拽相关数据
			positionX: 20, // 初始X位置
			positionY: 100, // 初始Y位置
			startX: 0, // 触摸开始X位置
			startY: 0, // 触摸开始Y位置
			isDragging: false, // 是否正在拖拽
			screenWidth: 0, // 屏幕宽度
			screenHeight: 0, // 屏幕高度
			elementWidth: 0, // 组件宽度
			elementHeight: 0 // 组件高度
		}
	},
	computed: {
		// 充电电量
		chargePower() {
			return this.chargeData?.power || '0.00';
		},
		
		// SOC电量百分比
		soc() {
			return this.chargeData?.soc || 0;
		},
		
		// 格式化已充时间
		formattedChargingTime() {
			const chargingTime = parseInt(this.chargeData?.chargingTime || 0);
			return this.formatTime(chargingTime);
		},
		
		// 格式化剩余时间
		formattedRetainTime() {
			const retainTime = parseInt(this.chargeData?.retainTime || 0);
			return this.formatTime(retainTime);
		}
	},
	mounted() {
		this.initScreenInfo();
		console.log('充电数据', this.chargeData);
	},
	methods: {
		// 初始化屏幕信息
		initScreenInfo() {
			const systemInfo = uni.getSystemInfoSync();
			this.screenWidth = systemInfo.screenWidth;
			this.screenHeight = systemInfo.screenHeight;
			
			// 计算组件实际尺寸
			this.elementWidth = Math.min(this.screenWidth - 40, 600); // 最大宽度600rpx，减去左右边距
			this.elementHeight = 140; // 根据实际内容调整高度
			
			// 调整初始位置到安全区域内
			this.positionY = systemInfo.statusBarHeight + 100;
			
			// 确保初始位置在屏幕范围内
			const maxX = this.screenWidth - this.elementWidth;
			if (this.positionX > maxX) {
				this.positionX = Math.max(20, maxX - 20);
			}
		},
		
		// 触摸开始
		onTouchStart(e) {
			this.isDragging = true;
			this.startX = e.touches[0].clientX;
			this.startY = e.touches[0].clientY;
		},
		
		// 触摸移动
		onTouchMove(e) {
			if (!this.isDragging) return;
			
			e.preventDefault(); // 阻止默认行为
			
			const currentX = e.touches[0].clientX;
			const currentY = e.touches[0].clientY;
			
			// 计算移动距离
			const deltaX = currentX - this.startX;
			const deltaY = currentY - this.startY;
			
			// 计算新位置
			let newX = this.positionX + deltaX;
			let newY = this.positionY + deltaY;
			
			// 边界限制
			const maxX = this.screenWidth - this.elementWidth;
			const maxY = this.screenHeight - this.elementHeight;
			
			newX = Math.max(0, Math.min(newX, maxX));
			newY = Math.max(0, Math.min(newY, maxY));
			
			// 更新位置
			this.positionX = newX;
			this.positionY = newY;
			
			// 更新起始位置
			this.startX = currentX;
			this.startY = currentY;
		},
		
		// 触摸结束
		onTouchEnd(e) {
			this.isDragging = false;
			
			// 可选：添加吸边功能
			this.snapToEdge();
		},
		
		// 吸边功能
		snapToEdge() {
			const centerX = this.positionX + this.elementWidth / 2;
			const screenCenter = this.screenWidth / 2;
			
			// 判断靠近哪一边
			if (centerX < screenCenter) {
				// 吸附到左边
				this.positionX = 20;
			} else {
				// 吸附到右边
				this.positionX = this.screenWidth - this.elementWidth - 20;
			}
		},
		
		// 格式化时间（秒转换为时:分:秒）
		formatTime(seconds) {
			if (seconds <= 0) return '00:00:00';
			
			const hours = Math.floor(seconds / 3600);
			const minutes = Math.floor((seconds % 3600) / 60);
			const remainingSeconds = seconds % 60;
			
			return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
		},
		
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
	z-index: 9999; /* 提高层级，确保在最上层 */
	background-color: #ffffff;
	border-radius: 20rpx;
	box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.15); /* 增强阴影效果 */
	padding: 24rpx;
	width: calc(100vw - 0px); /* 设置固定宽度 */
	max-width: 89%; /* 最大宽度限制 */
	border: 2rpx solid #f0f0f0; /* 添加边框 */
	transition: box-shadow 0.3s ease; /* 添加阴影过渡效果 */
	
	/* 拖拽时的样式 */
	&:active {
		box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.25);
		transform: scale(1.02);
	}
}

.drag-indicator {
	position: absolute;
	top: 8rpx;
	right: 12rpx;
	font-size: 20rpx;
	color: #007AFF;
	letter-spacing: 2rpx;
	user-select: none;
	pointer-events: auto;
	cursor: pointer;
	padding: 4rpx 8rpx;
	border-radius: 8rpx;
	background-color: rgba(0, 122, 255, 0.1);
}

.status-container {
	position: relative;
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr 1fr;
	gap: 16rpx;
	min-height: 120rpx;
}

.status-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 8rpx;
}

.top-left {
	grid-column: 1;
	grid-row: 1;
}

.top-right {
	grid-column: 2;
	grid-row: 1;
}

.bottom-left {
	grid-column: 1;
	grid-row: 2;
}

.bottom-right {
	grid-column: 2;
	grid-row: 2;
}

.label {
	font-size: 22rpx;
	color: #999999;
	margin-bottom: 4rpx;
}

.value {
	font-size: 28rpx;
	font-weight: bold;
	color: #333333;
}

/* 水平分割线 */
.divider-horizontal {
	position: absolute;
	top: 50%;
	left: 8rpx;
	right: 8rpx;
	height: 1rpx;
	background-color: #e0e0e0;
	transform: translateY(-50%);
}

/* 垂直分割线 */
.divider-vertical {
	position: absolute;
	top: 8rpx;
	bottom: 8rpx;
	left: 50%;
	width: 1rpx;
	background-color: #e0e0e0;
	transform: translateX(-50%);
}

/* 特殊值样式 */
.status-item .value {
	&.charging {
		color: #07c160;
	}
	
	&.warning {
		color: #ff9500;
	}
	
	&.error {
		color: #ff3b30;
	}
}
</style>

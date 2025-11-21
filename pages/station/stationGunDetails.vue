<template>
	<uv-navbar :border="false" autoBack="true" :title="gunDetails.gunName" placeholder safeAreaInsetTop></uv-navbar>
	<view class="page-container" v-if="gunDetails">
		<view class="content-wrapper">
			<!-- 充电桩信息 -->
			<view class="pile-card">
				<view class="pile-row">
					<view class="pile-item">
						<view class="param-cell">
							<view style="display: flex; align-items: center; gap: 8rpx;">
								<text class="param-value">{{ gunDetails.maxPower }}</text>
								<text class="param-unit">KW</text>
							</view>
							<text class="param-label">最大功率</text>
						</view>
					</view>
					<view class="pile-divider"></view>
					<view class="pile-item">
						<view class="param-cell">
							<view style="display: flex; align-items: center; gap: 8rpx;">
								<text class="param-value">{{ gunDetails.current }}</text>
								<text class="param-unit">A</text>
							</view>
							<text class="param-label">电流</text>
						</view>
					</view>
				</view>
				<view class="pile-row">
					<view class="pile-item-full">
						<view class="param-cell">
							<view style="display: flex; align-items: center; gap: 8rpx;">
								<text class="param-value">{{ gunDetails.valleyVol }}-{{ gunDetails.peakVol }}</text>
								<text class="param-unit">V</text>
							</view>
							<text class="param-label">电压范围</text>
						</view>
					</view>
				</view>
				<!-- 底部信息栏 -->
				<view class="pile-bottom-info">
					<view class="gun-type-badge">
						<text class="type-main">{{ gunTypeStr }}</text>
						<text class="type-sub">{{ gunCurrentTypeStr }}</text>
					</view>
					<view class="pile-number">
						<text class="pile-number-label">桩编号</text>
						<text class="pile-number-value">{{ gunDetails.pileNum }}</text>
					</view>
				</view>
			</view>
			<!-- 电价时段列表 -->
			<view class="price-section">
				<view class="section-header">
					<text class="section-title">费用详情</text>
					<view class="current-price-tag">
						<text class="tag-label">当前</text>
						<text class="tag-value">{{ currentPrice }} 元/度</text>
					</view>
				</view>
				<view class="price-header">
					<text>时段</text>
					<text style="margin-left: 300rpx;">总费用</text>
					<text style="margin-left: 40rpx;">电费</text>
					<text style="margin-left: 40rpx;">服务费</text>
				</view>
				<view class="price-list">
					<view v-for="(price, index) in gunDetails.powerStageDetail" :key="index">
						<stage-price-info :price-info="price" :index="index" :price-list="gunDetails.powerStageDetail" />
					</view>
				</view>
			</view>
		</view>

		<!-- 底部操作栏 -->
		<view class="action-bar">
			<view class="price-info">
				<text class="price-current">{{ currentPrice }}</text>
				<text class="price-unit">元/度</text>
			</view>
			<button class="start-button" @click="startCharging">
				<text class="button-text">开始充电</text>
			</button>
		</view>
	</view>
	<view v-else class="loading-container">
		<view class="loading-spinner"></view>
		<text class="loading-text">加载中...</text>
	</view>
</template>

<script>
	import {
		getStationGunDetails
	} from '@/api/stationGun.js';
	import StagePriceInfo from '@/components/station/StagePriceInfo.vue';

	export default {
		components: {
			StagePriceInfo
		},
		data() {
			return {
				gunId: null,
				gunDetails: null,
				hulianinterfaceId: ''
			};
		},
		computed: {
			gunTypeStr() {
				if (!this.gunDetails) return '未知';
				switch (this.gunDetails.gunType) {
					case 1:
						return '快充';
					case 2:
						return '慢充';
					case 3:
						return '超充';
					default:
						return '未知';
				}
			},
			gunCurrentTypeStr() {
				if (!this.gunDetails) return '未知';
				switch (this.gunDetails.gunType) {
					case 1:
					case 3:
						return '直流';
					case 2:
						return '交流';
					default:
						return '未知';
				}
			},
			currentPrice() {
				if (!this.gunDetails || !this.gunDetails.powerStageDetail) return 'N/A';
				const currentStage = this.gunDetails.powerStageDetail.find(p => p.now);
				return currentStage ? currentStage.currentPriceStr : 'N/A';
			}
		},
		onLoad(options) {
			if (options.gunId) {
				this.gunId = options.gunId;
				this.fetchGunDetails();
			} else {
				uni.showToast({
					title: '缺少必要参数',
					icon: 'error'
				});
				uni.navigateBack();
			}
			if (options.hulianinterfaceId) {
				this.hulianinterfaceId = options.hulianinterfaceId;
			}
		},
		methods: {
			async fetchGunDetails() {
				try {
					uni.showLoading({
						title: '加载中...'
					});
					const res = await getStationGunDetails({
						gunId: this.gunId
					});
					if (res.code === 0) {
						this.gunDetails = res.data;
						console.log('this.gunDetails', this.gunDetails);
					} else {
						uni.showToast({
							title: res.msg || '加载失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('获取充电枪详情失败', error);
					uni.showToast({
						title: '网络错误',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
			startCharging() {
				if (!this.gunDetails) {
					uni.showToast({
						title: '枪信息未加载完成',
						icon: 'error'
					});
					return;
				}
				
				const gunParams = {
					gunId: this.gunId,
					gunNo: this.gunDetails.gunNo,
					gunName: this.gunDetails.gunName,
					gunType: this.gunDetails.gunType,
					pileName: this.gunDetails.pileName,
					pileNum: this.gunDetails.pileNum,
					maxPower: this.gunDetails.maxPower,
					current: this.gunDetails.current,
					valleyVol: this.gunDetails.valleyVol,
					peakVol: this.gunDetails.peakVol,
					currentPrice: this.currentPrice,
					stationId: this.gunDetails.stationId || '',
					stationName: this.gunDetails.stationName || '',
					hulianinterfaceId: this.hulianinterfaceId || ''
				};
				
				const queryString = Object.keys(gunParams)
					.map(key => `${key}=${encodeURIComponent(gunParams[key] || '')}`)
					.join('&');
				
				uni.navigateTo({
					url: `/pages/charge/gunStartingCharge?${queryString}`
				});
				
				console.log('传递的枪信息:', gunParams);
			}
		}
	};
</script>

<style scoped>
	.price-header {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
		font-weight: normal;
		color: #666;
		font-size: 24rpx;
	}
	.page-container {
		background-color: #f8f9fa;
		min-height: 100vh;
		padding-bottom: 180rpx;
	}

	.content-wrapper {
		padding: 30rpx 24rpx;
	}

	/* 顶部英雄卡片 */
	.hero-card {
		background: #ffffff;
		border-radius: 24rpx;
		padding: 50rpx 40rpx;
		margin-bottom: 24rpx;
		text-align: center;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
		position: relative;
	}

	.gun-icon {
		font-size: 80rpx;
		margin-bottom: 20rpx;
	}

	.gun-name {
		font-size: 40rpx;
		font-weight: 600;
		color: #1a1a1a;
		margin-bottom: 24rpx;
	}

	.gun-type-badge {
		display: inline-flex;
		align-items: center;
		background: #007aff;
		color: #ffffff;
		padding: 8rpx 20rpx;
		border-radius: 50rpx;
		gap: 8rpx;
	}

	.type-main {
		font-size: 28rpx;
		font-weight: 600;
	}

	.type-sub {
		font-size: 24rpx;
		opacity: 0.85;
	}

	/* 桩编号样式 */
	.pile-number {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 4rpx;
	}

	.pile-number-label {
		font-size: 20rpx;
		color: #999999;
	}

	.pile-number-value {
		font-size: 24rpx;
		color: #1a1a1a;
		font-weight: 500;
	}

	/* 充电桩信息卡片 */
	.pile-card {
		background: #ffffff;
		border-radius: 20rpx;
		padding: 32rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
		position: relative;
	}

	/* 底部信息栏 */
	.pile-bottom-info {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-top: 24rpx;
		padding-top: 20rpx;
		border-top: 1rpx solid #f0f0f0;
	}

	.pile-row {
		display: flex;
		align-items: center;
	}

	.pile-row:not(:last-child) {
		margin-bottom: 24rpx;
	}

	.pile-item {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 20rpx;
	}

	.pile-item-full {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.pile-divider {
		width: 2rpx;
		height: 80rpx;
		background: #e8e8e8;
		margin: 0 24rpx;
		flex-shrink: 0;
	}


	/* 参数单元格 */
	.param-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.param-value {
		font-size: 48rpx;
		font-weight: 700;
		color: #007aff;
		line-height: 1.2;
	}

	.param-unit {
		font-size: 24rpx;
		color: #666666;
		margin-top: 4rpx;
		margin-bottom: 12rpx;
	}

	.param-label {
		font-size: 26rpx;
		color: #999999;
	}

	/* 电价时段区域 */
	.price-section {
		background: #ffffff;
		border-radius: 20rpx;
		padding: 32rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #1a1a1a;
	}

	.current-price-tag {
		background: #fff3e6;
		padding: 10rpx 20rpx;
		border-radius: 30rpx;
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.tag-label {
		font-size: 22rpx;
		color: #ff9500;
	}

	.tag-value {
		font-size: 24rpx;
		color: #ff9500;
		font-weight: 600;
	}

	.price-list {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	/* 底部操作栏 */
	.action-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #ffffff;
		padding: 24rpx 30rpx;
		padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
		border-top: 1rpx solid #e8e8e8;
		display: flex;
		align-items: center;
		gap: 30rpx;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.04);
	}

	.price-info {
		display: flex;
		align-items: baseline;
		gap: 8rpx;
	}

	.price-current {
		font-size: 44rpx;
		font-weight: 700;
		color: #ff9500;
	}

	.price-unit {
		font-size: 24rpx;
		color: #666666;
	}

	.start-button {
		flex: 1;
		background: #007aff;
		color: #ffffff;
		border: none;
		border-radius: 50rpx;
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 122, 255, 0.25);
	}

	.button-text {
		font-size: 32rpx;
		font-weight: 600;
		color: #ffffff;
	}

	.button-icon {
		font-size: 36rpx;
		color: #ffffff;
	}

	/* 加载状态 */
	.loading-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100vh;
		gap: 30rpx;
	}

	.loading-spinner {
		width: 80rpx;
		height: 80rpx;
		border: 6rpx solid #e8e8e8;
		border-top-color: #007aff;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-text {
		font-size: 28rpx;
		color: #999999;
	}
</style>
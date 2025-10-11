<template>
	<view class="page-container" v-if="gunDetails">
		<view class="content-wrapper">
			<!-- 基础信息 -->
			<view class="section-card">
				<view class="card-title">基础信息</view>
				<view class="info-row">
					<text class="label">枪名称:</text>
					<text class="value">{{ gunDetails.gunName }}</text>
				</view>
				<view class="info-row">
					<text class="label">枪类型:</text>
					<text class="value">{{ gunTypeStr }} ({{ gunCurrentTypeStr }})</text>
				</view>
				<view class="info-row">
					<text class="label">桩名称:</text>
					<text class="value">{{ gunDetails.pileName }}</text>
				</view>
				<view class="info-row">
					<text class="label">桩编号:</text>
					<text class="value">{{ gunDetails.pileNum }}</text>
				</view>
			</view>

			<!-- 功率信息 -->
			<view class="section-card">
				<view class="card-title">功率信息</view>
				<view class="info-row">
					<text class="label">最大功率:</text>
					<text class="value">{{ gunDetails.maxPower }} KW</text>
				</view>
				<view class="info-row">
					<text class="label">电流:</text>
					<text class="value">{{ gunDetails.current }} A</text>
				</view>
				<view class="info-row">
					<text class="label">电压:</text>
					<text class="value">{{ gunDetails.valleyVol }}V - {{ gunDetails.peakVol }}V</text>
				</view>
			</view>

			<!-- 电价详情 -->
			<view class="section-card">
				<view class="card-title">电价收费详情</view>
				<view class="price-header">
					<text>收费时段</text>
					<text>费用(元/度)</text>
				</view>
				<view v-for="(price, index) in gunDetails.powerStageDetail" :key="index">
					<stage-price-info :price-info="price" />
				</view>
			</view>
		</view>

		<!-- 底部固定操作栏 -->
		<view class="bottom-bar">
			<view class="current-price-display">
				<text class="price-label">当前电价:</text>
				<text class="price-value">{{ currentPrice }} 元/度</text>
			</view>
			<button class="charge-button" @click="startCharging">前往充电</button>
		</view>
	</view>
	<view v-else class="loading-container">
		<text>加载中...</text>
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
				
				// 构造要传递的枪信息参数
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
				
				// 将参数编码为查询字符串
				const queryString = Object.keys(gunParams)
					.map(key => `${key}=${encodeURIComponent(gunParams[key] || '')}`)
					.join('&');
				
				// 跳转到充电启动页面，携带枪信息
				uni.navigateTo({
					url: `/pages/charge/gunStartingCharge?${queryString}`
				});
				
				console.log('传递的枪信息:', gunParams);
			}
		}
	};
</script>

<style scoped>
	.page-container {
		background-color: #f5f5f5;
		min-height: 100vh;
		/* 为底部栏预留安全区域 */
		padding-bottom: 160rpx;
	}

	.content-wrapper {
		padding: 20rpx;
	}

	.section-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 24rpx;
	}

	.card-title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		font-size: 28rpx;
		padding: 10rpx 0;
	}

	.label {
		color: #666;
	}

	.value {
		color: #333;
	}

	.price-header {
		display: flex;
		justify-content: space-between;
		font-size: 28rpx;
		color: #999;
		margin-bottom: 10rpx;
		padding: 0 20rpx;
	}

	.bottom-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 140rpx;
		background-color: #ffffff;
		border-top: 1rpx solid #e0e0e0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 30rpx;
		box-sizing: border-box;
	}

	.current-price-display {
		display: flex;
		align-items: baseline;
	}

	.price-label {
		font-size: 28rpx;
		color: #666;
	}

	.price-value {
		font-size: 36rpx;
		font-weight: bold;
		color: #007AFF;
		margin-left: 10rpx;
	}

	.charge-button {
		background-color: #007aff;
		color: #ffffff;
		border: none;
		border-radius: 40rpx;
		padding: 0 50rpx;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 30rpx;
	}

	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}
</style>

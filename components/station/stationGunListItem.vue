<template>

	<view class="list-item" @click="handleClick">
		<view class="gun-state-container">
			<view class="gun-item-state">
				<text class="gun-state" :class="gunStateClass">{{ gunStateStr }}</text>
			</view>
		</view>
		<view class="gun-item-info">
			<view class="item-top">
				<view class="item-top-left">
					<!-- 枪名称 -->
					<text class="gun-name">{{ gunInfo.gunName }}</text>
					<view class="gun-type-info">
						<!-- 枪类型 -->
						<uv-tags :text="gunTypeStr" size="mini" plain plainFill></uv-tags>
						<!-- 枪输出电流类型 -->
						<uv-tags :text="gunCurrentTypeStr" size="mini" plain plainFill></uv-tags>
						<uv-tags :text="gunInfo.maxPower + 'kW'" size="mini" plain plainFill></uv-tags>
					</view>
				</view>
			</view>

			<view class="item-bottom">
				<view class="item-bottom-item">
					<text class="current-price-value">{{ gunInfo.currentPriceStr }}</text>
					<text class="label">价格(元)</text>
				</view>
				<view class="item-bottom-item">
					<text class="value">{{ gunInfo.currentPowerPriceStr }}</text>
					<text class="label">电费(元)</text>
				</view>
				<view class="item-bottom-item">
					<text class="value">{{ gunInfo.currentServicePriceStr }}</text>
					<text class="label">服务费(元)</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			gunInfo: {
				type: Object,
				default: () => ({})
			}
		},
		computed: {
			/**
			 * @description: 枪状态文字
			 */
			gunStateStr() {
				// gunState: 1 空闲, 2 枪锁定, 3 充电中
				switch (this.gunInfo.gunState) {
					case 1:
						return '空闲'
					case 3:
						return `${this.gunInfo.currentSOC}%`
					case 2:
						return '充电准备'
					case 5:
						return '离线'
					case 6:
						return '枪锁定'
					default:
						return '未知'
				}
			},
			/**
			 * @description: 枪状态样式
			 */
			gunStateClass() {
				switch (this.gunInfo.gunState) {
					case 1:
						return 'free'
					case 3:
						return 'charging'
					case 2:
						return 'ready'
					case 5:
						return 'offline'
					case 6:
						return 'locked'
					default:
						return ''
				}
			},
			/**
			 * @description: 枪类型文字
			 */
			gunTypeStr() {
				// gunType: 1 快充, 2 慢充, 3 超充
				switch (this.gunInfo.gunType) {
					case 1:
						return '快充'
					case 2:
						return '慢充'
					case 3:
						return '超充'
					default:
						return '未知'
				}
			},
			/**
			 * @description: 枪输出电流类型文字
			 */
			gunCurrentTypeStr() {
				// gunType: 1, 3 直流; 2 交流
				switch (this.gunInfo.gunType) {
					case 1:
					case 3:
						return '直流'
					case 2:
						return '交流'
					default:
						return '未知'
				}
			}
		},
		methods: {
			handleClick() {
				this.$emit('click');
			}
		}
	}
</script>

<style scoped>
	.gun-type-info {
		display: flex;
		flex-direction: row;
		gap: 10rpx;
	}
	.current-price-value {
		font-size: 28rpx;
		font-weight: bold;
	}
	.gun-item-state {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #ECF5FF;
		width: 140rpx;
		height: 140rpx;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.gun-item-info {
		display: flex;
		flex-direction: column;
		padding: 20rpx;
		flex: 1;
		gap: 10rpx;
		min-width: 0;
	}
	.gun-item {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 10rpx;
	}
	.gun-state-container {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		padding: 20rpx;
	}

	.list-item {
		display: flex;
		flex-direction: row;
		flex: 1;
		justify-content: space-between;
		background-color: #fff;
		margin-bottom: 20rpx;
		padding: 20rpx;
		border-radius: 10rpx;
	}

	.item-top {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
		width: 100%;
	}

	.item-top-left {
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}

	.gun-name {
		font-size: 32rpx;
		font-weight: bold;
	}

	.gun-type,
	.current-type {
		font-size: 24rpx;
		margin-left: 10rpx;
		padding: 2rpx 8rpx;
		border-radius: 5rpx;
	}
    .gun-type {
        background-color: #e0f0ff;
        color: #007aff;
    }

	.current-type {
		background-color: #e6f7f2;
		color: #00c777;
	}

	.gun-state {
		font-size: 28rpx;
	}

	.gun-state.free {
		color: #00c777;
	}

	.gun-state.charging {
		color: #ff5500;
	}

	.gun-state.ready {
		color: #007aff;
	}

	.gun-state.offline {
		color: #999;
	}

	.item-bottom {
		display: flex;
		justify-content: space-between;
	}

	.item-bottom-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.value {
		font-size: 28rpx;
		font-weight: bold;
	}

	.label {
		font-size: 24rpx;
		color: #999;
	}
</style>

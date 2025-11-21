<template>
	<view class="price-info-item" :class="{'current-price': priceInfo.now, 'next-price': isNext}">
		<!-- 时段标识 -->
		<view class="time-label" v-if="priceInfo.now || isNext">
			<text class="label-text" :class="{'label-text-current': priceInfo.now, 'label-text-next': isNext}">{{ priceInfo.now ? '当前时段' : '下一时段' }}</text>
		</view>
		<!-- <view class="discount-info">
			<text v-if="priceInfo.discount" class="discount-tag">优惠</text>
		</view> -->
		<view class="time-slot">
			<text>{{ priceInfo.currentStartTime }} - {{ priceInfo.currentEndTime }}</text>
		</view>
		<view class="fee-details">
			<view class="fee-item">
				<text v-if="priceInfo.discount" class="original-price">{{ priceInfo.sweepPriceStr }}元</text>
				<text class="current-price total-price">{{ priceInfo.currentPriceStr }}元</text>
			</view>
			<view class="fee-item">
				<!-- <text v-if="priceInfo.discount" class="original-price">{{ priceInfo.sweepPowerPriceStr }}元</text> -->
				<text class="current-price">{{ priceInfo.currentPowerPriceStr }}元</text>
			</view>
			<view class="fee-item">
				<!-- <text v-if="priceInfo.discount" class="original-price">{{ priceInfo.sweepServicePriceStr }}元</text> -->
				<text class="current-price">{{ priceInfo.currentServicePriceStr }}元</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			priceInfo: {
				type: Object,
				default: () => ({})
			},
			index: {
				type: Number,
				default: -1
			},
			priceList: {
				type: Array,
				default: () => []
			}
		},
		computed: {
			// 判断是否为下一个时段
			isNext() {
				if (this.priceInfo.now || this.index < 0 || !this.priceList || this.priceList.length === 0) {
					return false;
				}
				// 找到当前时段的索引
				const currentIndex = this.priceList.findIndex(item => item.now === true);
				// 如果当前项是当前时段的下一个，则返回 true
				return currentIndex >= 0 && this.index === currentIndex + 1;
			}
		}
	}
</script>

<style scoped>
	.price-info-item {
		position: relative;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx;
		margin-bottom: 10rpx;
		background-color: #f9f9f9;
		border-radius: 10rpx;
	}

	.price-info-item.current-price {
		border: 2rpx solid #007aff;
		background-color: #e0f0ff;
	}

	.price-info-item.next-price {
		border: 1rpx solid #999999;
	}

	.time-label {
		position: absolute;
		top: -10rpx;
		left: 10rpx;
	}

	.label-text {
		font-size: 20rpx;
	}

	.label-text-current {
		color: #007aff;
	}

	.label-text-next {
		color: #666;
	}

	.time-slot {
		font-weight: bold;
		margin-top: 10rpx;
	}

	.fee-details {
		display: flex;
		flex-direction: row;
		gap: 24rpx;
		align-items: center;
		font-size: 24rpx;
		color: #666;
	}

	.fee-item {
		display: flex;
		align-items: center;
		margin-bottom: 4rpx;
		flex-wrap: wrap;
	}

	.original-price {
		color: #999;
		font-size: 22rpx;
		text-decoration: line-through;
		margin-right: 8rpx;
	}

	.current-price {
		color: #333;
		font-weight: 500;
	}

	.total-price {
		color: #007aff;
		font-weight: bold;
	}

	.discount-info {
		position: absolute;
		top: 0rpx;
		right: 5rpx;
	}

	.discount-tag {
		background-color: #007AFF;
		color: #fff;
		padding: 4rpx 10rpx;
		border-radius: 8rpx;
		font-size: 22rpx;
	}
</style>

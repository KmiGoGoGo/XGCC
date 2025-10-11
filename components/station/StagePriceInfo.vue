<template>
	<view class="price-info-item" :class="{'current-price': priceInfo.now}">
		<view class="time-slot">
			<text>{{ priceInfo.currentStartTime }} - {{ priceInfo.currentEndTime }}</text>
		</view>
		<view class="fee-details">
			<view class="fee-item">
				<text>总: </text>
				<text v-if="priceInfo.discount" class="original-price">{{ priceInfo.sweepPriceStr }}元</text>
				<text class="current-price total-price">{{ priceInfo.currentPriceStr }}元</text>
			</view>
			<view class="fee-item">
				<text>电费: </text>
				<text v-if="priceInfo.discount" class="original-price">{{ priceInfo.sweepPowerPriceStr }}元</text>
				<text class="current-price">{{ priceInfo.currentPowerPriceStr }}元</text>
			</view>
			<view class="fee-item">
				<text>服务费: </text>
				<text v-if="priceInfo.discount" class="original-price">{{ priceInfo.sweepServicePriceStr }}元</text>
				<text class="current-price">{{ priceInfo.currentServicePriceStr }}元</text>
			</view>
		</view>
		<view class="discount-info">
			<text v-if="priceInfo.discount" class="discount-tag">有优惠</text>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			priceInfo: {
				type: Object,
				default: () => ({})
			}
		}
	}
</script>

<style scoped>
	.price-info-item {
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

	.time-slot {
		font-weight: bold;
	}

	.fee-details {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
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

	.discount-tag {
		background-color: #007AFF;
		color: #fff;
		padding: 4rpx 10rpx;
		border-radius: 5rpx;
		font-size: 22rpx;
	}
</style>

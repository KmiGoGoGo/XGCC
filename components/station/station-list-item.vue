<template>
	<view class="station-list-item" @click="handleClick">
		<view class="station-header">
			<view class="station-info">
				<text class="station-name">{{ station.stationName || '未知站点' }}</text>
				<text class="station-address">{{ station.address || '地址信息暂无' }}</text>
			</view>
			<view class="station-actions">
				<view class="favorite-btn" @click.stop="handleFavorite">
					<text class="favorite-icon">{{ station.isCollection ? '❤️' : '🤍' }}</text>
				</view>
			</view>
		</view>
		
		<view class="station-details">
			<view class="detail-item">
				<text class="detail-label">距离</text>
				<text class="detail-value">{{ formatDistance(station.distance) }}</text>
			</view>
			<view class="detail-item">
				<text class="detail-label">价格</text>
				<text class="detail-value">{{ formatPrice(station.price) }}</text>
			</view>
			<view class="detail-item">
				<text class="detail-label">可用桩数</text>
				<text class="detail-value">{{ station.availableGuns || 0 }}/{{ station.totalGuns || 0 }}</text>
			</view>
		</view>
		
		<view class="station-tags" v-if="station.tagList && station.tagList.length > 0">
			<text 
				v-for="tag in station.tagList.slice(0, 3)" 
				:key="tag.id"
				class="station-tag"
			>
				{{ tag.tagName }}
			</text>
		</view>
	</view>
</template>

<script>
export default {
	name: 'StationListItem',
	props: {
		station: {
			type: Object,
			required: true,
			default: () => ({})
		}
	},
	methods: {
		handleClick() {
			this.$emit('click', this.station);
		},
		handleFavorite() {
			this.$emit('favorite', {
				station: this.station,
				isCollection: !this.station.isCollection
			});
		},
		formatDistance(distance) {
			if (!distance) return '--';
			if (distance < 1) {
				return `${Math.round(distance * 1000)}m`;
			}
			return `${distance.toFixed(1)}km`;
		},
		formatPrice(price) {
			if (!price) return '--';
			return `¥${price}/kWh`;
		}
	}
}
</script>

<style scoped>
.station-list-item {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.station-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 20rpx;
}

.station-info {
	flex: 1;
}

.station-name {
	font-size: 32rpx;
	font-weight: 600;
	color: #333333;
	margin-bottom: 8rpx;
	display: block;
}

.station-address {
	font-size: 26rpx;
	color: #666666;
	line-height: 1.4;
}

.station-actions {
	display: flex;
	align-items: center;
}

.favorite-btn {
	padding: 8rpx;
}

.favorite-icon {
	font-size: 32rpx;
}

.station-details {
	display: flex;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.detail-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
}

.detail-label {
	font-size: 24rpx;
	color: #999999;
	margin-bottom: 8rpx;
}

.detail-value {
	font-size: 28rpx;
	font-weight: 500;
	color: #333333;
}

.station-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.station-tag {
	font-size: 22rpx;
	color: #007AFF;
	background-color: #E3F2FD;
	padding: 6rpx 12rpx;
	border-radius: 12rpx;
}
</style>
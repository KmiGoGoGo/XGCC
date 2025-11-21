<template>
	<view class="list-item" :class="{ 'offline-mode': gunInfo.gunState === 5 }" @click="handleClick">
		<view class="item-top">
			<view class="item-top-left">
				<!-- 枪名称 -->
				<text class="gun-name">{{ gunInfo.gunName }}</text>
				
				<view class="gun-type-info">
					<!-- 枪类型 -->
					<Tag :backgroundColor="gunInfo.gunState === 5 ? '#E5E5E5' : getTagColor(gunTypeStr)" :customStyle="{ fontSize: '24rpx', color: gunInfo.gunState === 5 ? '#999999' : getTagTextColor(gunTypeStr), fontWeight: 'bold' }" borderRadius="30rpx" padding="8rpx 16rpx">
						{{ gunTypeStr }}
					</Tag>
					<!-- 枪输出电流类型 -->
					<Tag :backgroundColor="gunInfo.gunState === 5 ? '#E5E5E5' : '#E5E7EB'" :customStyle="{ fontSize: '24rpx', color: gunInfo.gunState === 5 ? '#999999' : '#374151', fontWeight: 'bold' }" borderRadius="30rpx" padding="8rpx 16rpx">
						{{ gunCurrentTypeStr }}
					</Tag>
				</view>
			</view>
			
			<view class="item-top-right">
				<view class="status-container">
					<text class="status-text" :class="gunStateClass">{{ gunStateStr }}</text>
					<text class="status-label" v-if="stateLabel">{{ stateLabel }}</text>
				</view>
			</view>
		</view>
		
		<view class="divider"></view>
		
		<view class="item-bottom">
			<view class="bottom-item">
				<text class="label">功率</text>
				<text class="value">{{ gunInfo.maxPower }}kW</text>
			</view>
			<view class="bottom-item">
				<text class="label">电费/服务费</text>
				<text class="value">{{ gunInfo.currentPowerPriceStr || '0.00' }}/{{ gunInfo.currentServicePriceStr || '0.00' }}</text>
			</view>
			<view class="bottom-item">
				<text class="label">{{ getCostLabel() }}</text>
				<text class="value">{{ getCostValue() }}</text>
			</view>
		</view>
	</view>
</template>

<script>
import Tag from '../common/Tag.vue'

export default {
	components: {
		Tag
	},
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
			switch (this.gunInfo.gunState) {
				case 1:
					return '空闲'
				case 3:
					return `${this.gunInfo.currentSOC || 0}%`
				case 2:
					return '准备'
				case 5:
					return '离线'
				case 6:
					return '锁定'
				case 4:
					return '充电完成'
				default:
					return '未知'
			}
		},
		/**
		 * @description: 状态标签
		 */
		stateLabel() {
			switch (this.gunInfo.gunState) {
				case 3:
					return '充电中'
				default:
					return ''
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
				case 4:
					return 'completed'
				case 5:
					return 'offline'
				case 6:
					return 'locked'
				default:
					return 'offline'
			}
		},
		/**
		 * @description: 枪类型文字
		 */
		gunTypeStr() {
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
			this.$emit('click')
		},
		
		/**
		 * @description: 获取标签背景颜色
		 */
		getTagColor(type) {
			switch (type) {
				case '超充':
					return '#DBEAFE'
				case '快充':
					return '#DCFCE7'
				case '慢充':
					return '#FEFCE1'
				case '直流':
					return '#E5E7EB'
				case '交流':
					return '#E5E7EB'
				default:
					return '#F5F5F5'
			}
		},

		getTagTextColor(type) {
			switch (type) {
				case '超充':
					return '#2563EB'
				case '快充':
					return '#16A34A'
				case '慢充':
					return '#EAB308'
				case '直流':
					return '#374151'
				case '交流':
					return '#374151'
				default:
					return '#374151'
			}
		},	
		
		/** todo: 需要根据实际电压电流信息获取
		 * @description: 获取电压电流信息
		 */
		getVoltageCurrent() {
			// 根据功率计算电压电流
			const power = this.gunInfo.maxPower || 0
			if (power >= 200) {
				return '1000V/250A'
			} else if (power >= 150) {
				return '1000V/180A'
			} else if (power >= 100) {
				return '1000V/120A'
			} else if (power >= 50) {
				return '400V/150A'
			} else {
				return '220V/32A'
			}
		},
		
		/**
		 * @description: 获取费用标签
		 */
		getCostLabel() {
			return '费用'
		},
		
		/**
		 * @description: 获取费用值
		 */
		getCostValue() {
			if (this.gunInfo.discount) {
				return `¥${this.gunInfo.currentPriceStr || '0.00'}/度`
			} else {
				return `¥${this.gunInfo.sweepPriceStr || '0.00'}/度`
			}
		},
	}
}
</script>

<style scoped>
	.list-item {
		background-color: #F8F8F8;
		border-radius: 30rpx;
		padding: 24rpx;
		margin-bottom: 16rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
	}
	
	.list-item.offline-mode {
		background-color: #F5F5F5;
		opacity: 0.6;
	}
	
	.list-item.offline-mode .gun-name {
		color: #999999;
	}
	
	.list-item.offline-mode .status-text {
		color: #CCCCCC !important;
	}
	
	.list-item.offline-mode .status-label {
		color: #CCCCCC !important;
	}
	
	.list-item.offline-mode .label {
		color: #CCCCCC;
	}
	
	.list-item.offline-mode .value {
		color: #CCCCCC;
	}
	
	.list-item.offline-mode .divider {
		background-color: #E0E0E0;
	}
	
	.item-top {
		display: flex;
		align-items: flex-start;
		margin-bottom: 16rpx;
		position: relative;
	}
	
	.item-top-left {
		flex: 1;
	}
	
	.gun-name {
		font-size: 28rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 16rpx;
		display: block;
	}
	
	.gun-type-info {
		display: flex;
		flex-direction: row;
		gap: 8rpx;
	}
	
	.item-top-right {
		position: absolute;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
	}
	
	.status-container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.status-icon {
		width: 32rpx;
		height: 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 4rpx;
	}
	
	.icon-text {
		font-size: 24rpx;
	}
	
	.status-text {
		font-size: 28rpx;
		font-weight: bold;
		line-height: 1.2;
	}
	
	.status-text.free {
		color: #14B8A6;
	}
	
	.status-text.charging {
		color: #3B82F6;
	}
	
	.status-text.ready {
		color: #3DA4F3;
	}
	
	.status-text.completed {
		color: #22C55E;
	}
	
	.status-text.offline {
		color: #CCCCCC;
	}
	
	.status-text.locked {
		color: #FF9500;
	}
	
	.status-label {
		font-size: 20rpx;
		color: #3B82F6;
		margin-top: 4rpx;
	}
	
	.divider {
		height: 1rpx;
		background-color: #E5E5E5;
		margin: 16rpx 0;
		margin-top: 34rpx;
	}
	
	.item-bottom {
		display: flex;
		justify-content: space-between;
		gap: 16rpx;
	}
	
	.bottom-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.label {
		font-size: 24rpx;
		color: #999999;
		margin-bottom: 8rpx;
	}
	
	.value {
		font-size: 28rpx;
		font-weight: bold;
		color: #333333;
	}
</style>
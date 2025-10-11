<template>
	<view class="records-page">
		<!-- 筛选区域 -->
		<view class="filter-bar">
			<view class="filter-item">
				<text>全部</text>
				<text class="arrow">▼</text>
			</view>
			<view class="filter-item">
				<text>{{ currentMonth }}</text>
				<text class="arrow">▼</text>
			</view>
		</view>

		<!-- 统计信息 -->
		<view class="stats-summary" v-if="stats">
			<view class="stat-item">
				<text class="stat-value income">{{ formattedChargeTotal }}</text>
				<text class="stat-label">充值</text>
			</view>
			<view class="stat-item">
				<text class="stat-value income">{{ formattedAwardTotal }}</text>
				<text class="stat-label">奖励</text>
			</view>
			<view class="stat-item">
				<text class="stat-value spending">{{ formattedConsumptionTotal }}</text>
				<text class="stat-label">消费</text>
			</view>
			<view class="stat-item">
				<text class="stat-value spending">{{ formattedRefundTotal }}</text>
				<text class="stat-label">退款</text>
			</view>
		</view>

		<!-- 分隔线 -->
		<view class="divider"></view>

		<!-- 账单列表 -->
		<view class="records-list">
			<view class="record-item" v-for="item in records" :key="item.id">
				<view class="item-main">
					<text class="item-title">{{ item.eventNameStr }}</text>
					<text class="item-amount" :class="{'income': item.amountChange.startsWith('+'), 'spending': item.amountChange.startsWith('-')}">
						{{ formatCurrency(item.amountChange, true) }}
					</text>
				</view>
				<view class="item-sub">
					<text class="item-balance">余额：{{ formatCurrency(item.accountBalance) }}</text>
					<text class="item-time">{{ item.createTime }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getAccountFlowPage
	} from '@/api/member.js';

	export default {
		data() {
			return {
				stats: null,
				records: [],
				currentMonth: '2025年08月',
			};
		},
		computed: {
			formattedChargeTotal() {
				return this.stats ? this.formatCurrency(this.stats.chargeTotalStr) : '+0.00';
			},
			formattedAwardTotal() {
				return this.stats ? this.formatCurrency(this.stats.awardTotalStr) : '+0.00';
			},
			formattedConsumptionTotal() {
				return this.stats ? this.formatCurrency(this.stats.consumptionTotalStr) : '-0.00';
			},
			formattedRefundTotal() {
				return this.stats ? this.formatCurrency(this.stats.refundTotalStr) : '-0.00';
			}
		},
		async onLoad() {
			uni.showLoading({ title: '加载中...' });
			try {
				const date = this.currentMonth.replace('年', '-').replace('月', '');
				const res = await getAccountFlowPage({
					accountType: "1",
					tab: 1,
					current: 1,
					size: 10000, // Per user request
					date: date
				});
				if (res.code === 0 && res.data) {
					this.stats = res.data.accountFlowStatisticsMiniVO;
					this.records = res.data.accountFlowMiniVO.records;
				} else {
					uni.showToast({ title: res.msg || '获取记录失败', icon: 'none' });
				}
			} catch (error) {
				console.error('获取收支记录失败', error);
				uni.showToast({ title: '网络错误', icon: 'none' });
			} finally {
				uni.hideLoading();
			}
		},
		methods: {
			formatCurrency(amount, keepSign = false) {
				if (amount === null || amount === undefined) return keepSign ? '+0.00' : '0.00';

				let num = parseFloat(amount);
				if(isNaN(num)) {
					// Handle cases like "+20000" or "-32426" from stats
					num = parseFloat(String(amount).substring(1));
				}

				let value = (num / 100).toFixed(2);

				if (keepSign) {
					if (String(amount).startsWith('+')) return '+' + value;
					if (String(amount).startsWith('-')) return '-' + value;
				}
				return value;
			}
		}
	};
</script>

<style lang="scss" scoped>
	.records-page {
		background-color: #ffffff;
		min-height: 100vh;
	}

	.filter-bar {
		display: flex;
		justify-content: space-between;
		padding: 24rpx 32rpx;
		border-bottom: 1px solid #f0f0f0;
	}

	.filter-item {
		display: flex;
		align-items: center;
		font-size: 28rpx;
		color: #333;
		.arrow {
			margin-left: 8rpx;
			font-size: 20rpx;
		}
	}

	.stats-summary {
		display: flex;
		justify-content: space-around;
		padding: 32rpx;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.stat-value {
		font-size: 36rpx;
		font-weight: bold;
		&.income { color: #67c23a; }
		&.spending { color: #fa5151; }
	}

	.stat-label {
		font-size: 24rpx;
		color: #999;
		margin-top: 8rpx;
	}

	.divider {
		height: 20rpx;
		background-color: #f7f8fa;
	}

	.records-list {
		padding-left: 32rpx;
	}

	.record-item {
		padding: 24rpx 32rpx 24rpx 0;
		border-bottom: 1rpx dashed #e0e0e0;
		&:last-child {
			border-bottom: none;
		}
	}

	.item-main {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.item-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
	}

	.item-amount {
		font-size: 32rpx;
		font-weight: bold;
		&.income { color: #67c23a; }
		&.spending { color: #fa5151; }
	}

	.item-sub {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 12rpx;
		font-size: 24rpx;
		color: #999;
	}
</style>

<template>
	<view class="refund-page">
		<!-- 金额信息 -->
		<view class="amount-summary">
			<view class="amount-item">
				<text class="amount-value">{{ formatCurrency(refundAmountInfo.refundableAmount) }}</text>
				<text class="amount-label">可退款(元)</text>
			</view>
			<view class="amount-item">
				<text class="amount-value">{{ formatCurrency(refundAmountInfo.nonRefundableAmount) }}</text>
				<text class="amount-label">不可退款(元)</text>
			</view>
		</view>

		<!-- 操作按钮 -->
		<view class="action-buttons">
			<view class="button apply" @click="goToApplyRefundPage">申请退款</view>
			<view class="button history" @click="goToRecordsPage">退款记录</view>
		</view>

		<!-- 可退金额列表 -->
		<view class="refund-list-card">
			<view class="card-header">
				<text class="card-title">可退金额</text>
				<text class="card-subtitle">余额</text>
			</view>
			<view class="list-content">
				<view class="list-item" v-for="item in refundList" :key="item.id">
					<view class="item-left">
						<text class="item-title">充值{{ formatCurrency(item.balance) }}元</text>
						<text class="item-time">{{ item.time }}</text>
					</view>
					<view class="item-right">
						<text class="item-refundable">可退{{ formatCurrency(item.balance) }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 客服按钮 -->
		<!-- <view class="fab-button" @click="contactCustomerService">
			<text class="fab-icon">[客服]</text>
		</view> -->

		<!-- 底部说明 -->
		<view class="footer">
			<text>如有疑问请查看</text>
			<text class="link" @click="showRefundInstruction">退款说明</text>
			<text>或直接</text>
			<text class="link" @click="contactCustomerService">联系客服</text>
		</view>
	</view>
</template>

<script>
	import { getRefundAmount, getRefundList } from '@/api/refund.js';
	import { getStyleContent, getStyleConfig } from '@/api/style.js';

	export default {
		data() {
			return {
				refundAmountInfo: {},
				refundList: [],
				refundInstruction: '',
				customerInfo: {},
			};
		},
		async onLoad() {
			uni.showLoading({ title: '加载中...' });
			try {
				const [amountRes, listRes, instructionRes] = await Promise.all([
					getRefundAmount(),
					getRefundList({ page: 1, pageSize: 10, refundType: 0 }),
					getStyleContent('REFUND')
					// getStyleConfig(365)
				]);

				if (amountRes.code === 0) this.refundAmountInfo = amountRes.data;
				if (listRes.code === 0) this.refundList = listRes.data.rechargeLists;
				if (instructionRes.code === 0) this.refundInstruction = instructionRes.data;

			} catch (error) {
				console.error('加载退款页面数据失败', error);
				uni.showToast({ title: '数据加载失败', icon: 'none' });
			} finally {
				uni.hideLoading();
			}
		},
		methods: {
			goToApplyRefundPage() {
				uni.navigateTo({
					url: '/pages/refund/applyRefund'
				});
			},
			formatCurrency(amount) {
				if (amount === null || amount === undefined) return '0.00';
				return (amount / 100).toFixed(2);
			},
			showRefundInstruction() {
				uni.showModal({
					title: '退款说明',
					content: this.refundInstruction || '暂无说明',
					showCancel: false
				});
			},
			contactCustomerService() {
				uni.showModal({
					title: '联系客服',
					content: `${this.customerInfo.telephone || ''}\n${this.customerInfo.serviceTime || ''}`,
					showCancel: false
				});
			},
			goToRecordsPage() {
				uni.navigateTo({
					url: '/pages/refund/records?page=1&pageSize=10'
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.refund-page {
		background-color: #f5f5f5;
		min-height: 100vh;
		padding: 24rpx;
	}

	.amount-summary {
		display: flex;
		justify-content: space-around;
		background-color: white;
		padding: 32rpx;
		border-radius: 16rpx;
	}

	.amount-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.amount-value {
		font-size: 40rpx;
		font-weight: bold;
		color: #333;
	}

	.amount-label {
		font-size: 24rpx;
		color: #999;
		margin-top: 8rpx;
	}

	.action-buttons {
		display: flex;
		justify-content: space-between;
		margin: 32rpx 0;
	}

	.button {
		flex: 1;
		text-align: center;
		padding: 16rpx;
		border-radius: 40rpx;
		font-size: 28rpx;
		margin: 0 16rpx;
		&.apply {
			border: 1px solid #007AFF;
			color: #007AFF;
			background-color: #F0F7FF;
		}
		&.history {
			border: 1px solid #ccc;
			color: #666;
			background-color: white;
		}
	}

	.refund-list-card {
		background-color: white;
		border-radius: 16rpx;
		padding: 32rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 24rpx;
		border-bottom: 1px solid #f0f0f0;
	}

	.card-title {
		font-size: 32rpx;
		font-weight: bold;
	}

	.card-subtitle {
		font-size: 24rpx;
		color: #999;
	}

	.list-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx 0;
		border-bottom: 1px solid #f0f0f0;
		&:last-child {
			border-bottom: none;
		}
	}

	.item-left {
		display: flex;
		flex-direction: column;
	}

	.item-title {
		font-size: 28rpx;
		color: #333;
	}

	.item-time {
		font-size: 24rpx;
		color: #999;
		margin-top: 8rpx;
	}

	.item-refundable {
		font-size: 30rpx;
		font-weight: bold;
		color: #fa5151;
	}

	.fab-button {
		position: fixed;
		bottom: 150rpx;
		right: 32rpx;
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		background-color: #67c23a;
		color: white;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.2);
		font-size: 48rpx;
	}

	.footer {
		text-align: center;
		color: #999;
		font-size: 24rpx;
		padding: 40rpx 0;
		margin-top: 40rpx;
	}

	.link {
		color: #007aff;
	}
</style>

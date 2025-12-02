<template>
	<view class="refund-page">
		<uv-navbar :border="false" autoBack="true" placeholder safeAreaInsetTop>
			<template v-slot:right>
				<view style="margin-right: 200rpx; margin-bottom: 5rpx;">
					<view class="server-icon-wrapper">
						<uv-icon name="server-fill" size="24" color="#000" @click="contactCustomerService"></uv-icon>
					</view>
				</view>
			</template>
		</uv-navbar>
		
		<!-- 金额信息卡片 -->
		<view class="amount-card">
			<view class="amount-content">
				<view class="amount-section">
					<text class="amount-label">可退款金额</text>
					<text class="amount-value primary">¥{{ formatCurrency(refundAmountInfo.refundableAmount) }}</text>
				</view>
				<view class="amount-section">
					<text class="amount-label">不可退款金额</text>
					<text class="amount-value secondary">¥{{ formatCurrency(refundAmountInfo.nonRefundableAmount) }}</text>
				</view>
			</view>
		</view>

		<!-- 操作按钮 -->
		<view class="action-buttons">
			<view class="button primary-button" @click="goToApplyRefundPage">
				<text class="button-text">申请退款</text>
			</view>
			<view class="button secondary-button" @click="goToRecordsPage">
				<text class="button-text">退款记录</text>
			</view>
		</view>

		<!-- 可退金额列表标题 -->
		<view class="section-title">
			<text class="title-text">可退金额</text>
		</view>

		<!-- 可退金额列表滚动区域 -->
		<scroll-view 
			class="scroll-container" 
			scroll-y="true" 
			@scrolltolower="loadMore"
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
			refresher-default-style="black"
			refresher-background="#f6f7f8"
		>
			<view class="refund-list">
				<view class="list-item" v-if="refundList.length > 0" v-for="item in refundList" :key="item.id">
					<view class="item-left">
						<view class="item-icon">
							<uv-icon name="weixin-fill" size="48" color="#13a4ec"></uv-icon>
						</view>
						<view class="item-info">
							<text class="item-title">充值</text>
							<text class="item-time">{{ item.time }}</text>
						</view>
					</view>
					<view class="item-right">
						<text class="item-amount">+{{ formatCurrency(item.balance) }}元</text>
						<text class="item-refundable">可退 {{ formatCurrency(item.balance) }}元</text>
					</view>
				</view>
				<view v-else style="display: flex; justify-content: center; align-items: center; flex-direction: column;">
					<uv-icon name="empty-favor" size="200" color="#cbd5e1"></uv-icon>
					<text class="empty-text">暂无可退金额</text>
				</view>
			</view>
			
			<!-- 加载更多状态 -->
			<view class="load-more" v-if="loading">
				<text class="load-text">加载中...</text>
			</view>
			
			<!-- 没有更多数据 -->
			<view class="no-more" v-if="noMore && refundList.length > 0">
				<text class="no-more-text">没有更多数据了</text>
			</view>
		</scroll-view>

		<!-- 底部说明 - 固定在底部 -->
		<view class="footer-section">
			<view class="footer-card">
				<text class="footer-title">退款说明</text>
				<text class="footer-content">
					1. 仅支持退还账户内的可退金额。\n
					2. 退款申请提交后，我们将在1-3个工作日内完成审核。\n
					3. 退款将原路返回到您的支付账户。
				</text>
				<view class="footer-divider"></view>
				<view class="contact-service" @click="contactCustomerService">
					<uv-icon name="server-fill" size="24" color="#13a4ec"></uv-icon>
					<text class="service-text">联系客服</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getRefundAmount, getRefundList } from '@/api/refund.js';
	import { getStyleContent, getStyleConfig } from '@/api/style.js';
	import { contactCustomerService as contactCustomerServiceFn } from '@/utils/utils'
	export default {
		data() {
			return {
				refundAmountInfo: {},
				refundList: [],
				refundInstruction: '',
				customerInfo: {},
				// 分页相关
				currentPage: 1,
				pageSize: 10,
				loading: false,
				refreshing: false,
				noMore: false,
			};
		},
		async onShow() {
			uni.showLoading({ title: '加载中...' });
			try {
				const [amountRes, instructionRes] = await Promise.all([
					getRefundAmount(),
					getStyleContent('REFUND')
				]);

				if (amountRes.code === 0) this.refundAmountInfo = amountRes.data;
				if (instructionRes.code === 0) this.refundInstruction = instructionRes.data;

				// 加载第一页数据
				await this.loadRefundList(true);

			} catch (error) {
				console.error('加载退款页面数据失败', error);
				uni.showToast({ title: '数据加载失败', icon: 'none' });
			} finally {
				uni.hideLoading();
			}
		},
		methods: {
			contactCustomerService() {
				contactCustomerServiceFn()
			},
			// 加载退款列表数据
			async loadRefundList(isRefresh = false) {
				if (this.loading) return;
				
				this.loading = true;
				
				try {
					const res = await getRefundList({ 
						page: this.currentPage, 
						pageSize: this.pageSize, 
						refundType: 0 
					});
					
					if (res.code === 0) {
						const newList = res.data.rechargeLists || [];
						
						if (isRefresh) {
							this.refundList = newList;
						} else {
							this.refundList = [...this.refundList, ...newList];
						}
						
						// 判断是否还有更多数据
						this.noMore = newList.length < this.pageSize;
					} else {
						uni.showToast({ title: res.message || '加载失败', icon: 'none' });
					}
				} catch (error) {
					console.error('加载退款列表失败', error);
					uni.showToast({ title: '加载失败', icon: 'none' });
				} finally {
					this.loading = false;
				}
			},
			
			// 加载更多数据
			async loadMore() {
				if (this.noMore || this.loading) return;
				
				this.currentPage++;
				await this.loadRefundList(false);
			},
			
			// 下拉刷新
			async onRefresh() {
				this.refreshing = true;
				this.currentPage = 1;
				this.noMore = false;
				
				await this.loadRefundList(true);
				
				this.refreshing = false;
			},
			
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
			async contactCustomerService() {
				const res = await getStyleConfig()
					if (res.code !== 0) {
						uni.showToast({
							title: res.msg || '获取客服信息失败',
							icon: 'none'
						});
						return;
					}
				const telephone = res.data.telephone || '4006331838';
				const serviceTime = res.data.serviceTime || '09:00-18:00';
				console.log('telephone', res);
				uni.showModal({
						title: '联系客服',
						content: `客服电话：${telephone || ''}\n客服工作时间：${serviceTime || ''}`,
						showCancel: true,
						cancelText: '取消',
						confirmText: '呼叫客服',
						confirmColor: '#007AFF',
						success: (res1) => {
							if (res1.confirm) {
								// 用户点击了呼叫客服按钮
								uni.makePhoneCall({
									phoneNumber: telephone,
									success: () => {
										console.log('呼叫成功');
									},
									fail: (err) => {
										console.log('呼叫失败', err);
										uni.showToast({
											title: '呼叫失败',
											icon: 'none'
										});
									}
								});
							}
						}
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
		background-color: #f6f7f8;
		min-height: 100vh;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		display: flex;
		flex-direction: column;
	}

	/* 金额信息卡片 */
	.amount-card {
		padding: 32rpx;
	}

	.amount-content {
		background: linear-gradient(135deg, rgba(19, 164, 236, 0.1) 0%, rgba(255, 255, 255, 1) 100%);
		border-radius: 24rpx;
		padding: 48rpx 32rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.amount-section {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.amount-label {
		font-size: 32rpx;
		font-weight: 500;
		color: #4c809a;
		line-height: 1.2;
	}

	.amount-value {
		font-size: 80rpx;
		font-weight: 700;
		line-height: 1;
		letter-spacing: -0.02em;
		
		&.primary {
			color: #0d171b;
		}
		
		&.secondary {
			color: #0d171b;
			font-size: 48rpx;
		}
	}

	/* 操作按钮 */
	.action-buttons {
		display: flex;
		gap: 32rpx;
		padding: 0 32rpx;
		margin-bottom: 32rpx;
	}

	.button {
		flex: 1;
		height: 96rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
		
		&.primary-button {
			background-color: #13a4ec;
			color: white;
			
			&:active {
				background-color: #0f8bc4;
			}
		}
		
		&.secondary-button {
			background-color: rgba(19, 164, 236, 0.2);
			color: #13a4ec;
			
			&:active {
				background-color: rgba(19, 164, 236, 0.3);
			}
		}
	}

	.button-text {
		font-size: 32rpx;
		font-weight: 700;
		letter-spacing: 0.02em;
	}

	/* 列表标题 */
	.section-title {
		padding: 64rpx 32rpx 16rpx;
	}

	.title-text {
		font-size: 36rpx;
		font-weight: 700;
		color: #0d171b;
		letter-spacing: -0.02em;
	}

	/* 滚动容器 */
	.scroll-container {
		flex: 1;
		height: 0; /* 配合flex使用 */
		background-color: #f6f7f8;
		padding-bottom: 200rpx; /* 为固定底部预留空间 */
	}

	/* 可退金额列表 */
	.refund-list {
		background-color: #f6f7f8;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.list-item {
		display: flex;
		align-items: center;
		gap: 32rpx;
		background-color: #f6f7f8;
		padding: 24rpx 32rpx;
		min-height: 144rpx;
		border-bottom: 1rpx solid #e2e8f0;
		
		&:last-child {
			border-bottom: none;
		}
	}

	.item-left {
		display: flex;
		align-items: center;
		gap: 32rpx;
		flex: 1;
	}

	.item-icon {
		width: 96rpx;
		height: 96rpx;
		background-color: rgba(19, 164, 236, 0.2);
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.icon {
		font-size: 48rpx;
		color: #13a4ec;
		font-family: 'Material Symbols Outlined';
	}

	.item-info {
		display: flex;
		flex-direction: column;
		justify-content: center;
		flex: 1;
	}

	.item-title {
		font-size: 32rpx;
		font-weight: 500;
		color: #0d171b;
		line-height: 1.2;
		margin-bottom: 8rpx;
	}

	.item-time {
		font-size: 28rpx;
		color: #4c809a;
		line-height: 1.2;
	}

	.item-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		flex-shrink: 0;
	}

	.item-amount {
		font-size: 32rpx;
		font-weight: 500;
		color: #0d171b;
		line-height: 1.2;
		margin-bottom: 8rpx;
	}

	.item-refundable {
		font-size: 28rpx;
		color: #10b981;
		line-height: 1.2;
	}

	/* 底部说明区域 - 固定在底部 */
	.footer-section {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 32rpx;
		padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
		background-color: #f6f7f8;
		z-index: 100;
	}

	.footer-card {
		background-color: #f1f5f9;
		border-radius: 16rpx;
		padding: 32rpx;
	}

	.footer-title {
		font-size: 32rpx;
		font-weight: 700;
		color: #0d171b;
		line-height: 1.2;
		margin-bottom: 16rpx;
	}

	.footer-content {
		font-size: 28rpx;
		color: #4c809a;
		line-height: 1.6;
		white-space: pre-line;
	}

	.footer-divider {
		height: 1rpx;
		background-color: #cbd5e1;
		margin: 32rpx 0;
	}

	.contact-service {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16rpx;
		cursor: pointer;
		transition: opacity 0.2s ease;
		
		&:active {
			opacity: 0.7;
		}
	}

	.service-icon {
		font-size: 32rpx;
		color: #13a4ec;
		font-family: 'Material Symbols Outlined';
	}

	.service-text {
		font-size: 32rpx;
		font-weight: 500;
		color: #13a4ec;
	}

	/* 加载状态样式 */
	.load-more {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 32rpx;
	}

	.load-text {
		font-size: 28rpx;
		color: #4c809a;
	}

	.no-more {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 32rpx;
	}

	.no-more-text {
		font-size: 28rpx;
		color: #9ca3af;
	}

</style>

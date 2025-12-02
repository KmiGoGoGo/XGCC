<template>
	<view class="assets-page">
		
        <uv-navbar :border="false" autoBack title="我的资产" placeholder safeAreaInsetTop>
          <template v-slot:right>
            <view style="margin-right: 200rpx; margin-bottom: 5rpx;">
              <view class="server-icon-wrapper">
                <uv-icon name="server-fill" size="24" color="#000" @click="contactCustomerService"></uv-icon>
              </view>
            </view>
          </template>
        </uv-navbar>
		
		<!-- 页面内容容器 -->
		<view class="page-container">
			<!-- 个人钱包卡片 -->
			<view class="wallet-card" v-if="memberInfo.tokenMemberType === 0">
				<view class="card-header">
					<text class="card-title">个人钱包</text>
				</view>
				<view class="balance-section">
					<text class="balance-label">可用金额</text>
					<text class="balance-amount">¥ {{ formattedPersonalAvailable }}</text>
					<text class="unavailable-label">不可用金额 ¥ {{ formattedPersonalUnavailable }}</text>
				</view>
			<view class="divider"></view>
			<view class="action-grid">
				<view class="action-item blue" @click="goToRechargePage">
					<text class="action-label" style="color: #FFFFFF;">充值</text>
				</view>
				<view class="action-item water-blue" @click="goToRecords">
					<text class="action-label" style="color: #999;">账单</text>
				</view>
				<view class="action-item green" @click="goToRefundPage">
					<text class="action-label" style="color: #1BA035;">退款</text>
				</view>
			</view>
		</view>

		<!-- 电卡钱包卡片 -->
		<view class="wallet-card" v-if="memberInfo.tokenMemberType === 0">
			<view class="card-header">
				<text class="card-title">电卡钱包</text>
			</view>
			<view class="balance-section">
				<text class="balance-label">可用金额</text>
				<text class="balance-amount">¥ {{ formattedCardAvailable }}</text>
				<text class="unavailable-label">不可用金额 ¥ {{ formattedCardUnavailable }}</text>
			</view>
			<view class="divider"></view>
			<view class="action-grid single">
				<view class="action-item water-blue" @click="goToRecords">
					<text class="action-label" style="color: #999;">账单</text>
				</view>
			</view>
			</view>

			<!-- 企业钱包卡片 -->
			<view class="wallet-card" v-if="memberInfo.tokenMemberType === 2">
				<view class="card-header">
					<text class="card-title">企业钱包</text>
				</view>
				<view class="balance-section">
					<text class="balance-label">可用金额</text>
					<text class="balance-amount">¥ {{ formattedPersonalAvailable }}</text>
				</view>
				<view class="divider"></view>
				<view class="action-grid">
					<view class="action-item blue" @click="goToPersonalRechargePage">
						<text class="action-label" style="color: #FFFFFF;">充值</text>
					</view>
					<view class="action-item green" @click="goToPersonalRefundPage">
						<text class="action-label" style="color: #1BA035;">退款</text>
					</view>
				</view>
			</view>

			<!-- 账户流水列表 -->
			<view class="flow-section" v-if="memberInfo.tokenMemberType === 2">
				<view class="flow-header">
					<text class="flow-title">账户流水</text>
				</view>
				
				<!-- 流水列表 -->
				<view class="flow-list" v-if="flowList.length > 0">
					<view 
						class="flow-item" 
						v-for="(item, index) in flowList" 
						:key="item.id || index"
					>
						<view class="flow-item-left">
							<view class="flow-event-name">{{ item.eventNameStr }}</view>
							<view class="flow-create-time">{{ item.createTime }}</view>
						</view>
						<view class="flow-item-right">
							<view class="flow-amount-change" :class="item.amountChange.startsWith('+') ? 'positive' : 'negative'">
								{{ formatAmountChange(item.amountChange) }}
							</view>
							<view class="flow-balance">
								余额: {{ formatAccountBalance(item.accountBalance) }}
							</view>
						</view>
					</view>
				</view>

				<!-- 加载更多 -->
				<view class="load-more-section" v-if="flowList.length > 0">
					<view class="load-more-btn" @click="loadMoreFlow" v-if="!noMoreData && !loadingMore">
						<text>加载更多</text>
					</view>
					<view class="loading-text" v-if="loadingMore">
						<text>加载中...</text>
					</view>
					<view class="no-more-text" v-if="noMoreData">
						<text>没有更多数据了</text>
					</view>
				</view>

				<!-- 空状态 -->
				<view class="empty-state" v-if="flowList.length === 0">
					<text>暂无流水记录</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getAccountInfo,
		getAccountFlowPage
	} from '@/api/member.js';
import { contactCustomerService as contactCustomerServiceFn } from '@/utils/utils'
	export default {
		data() {
			return {
				accountInfo: null,
				orderStr: null,
				// 流水相关数据
				flowList: [], // 流水列表
				flowPagination: {
					current: 1,
					size: 10,
					total: 0,
					pages: 0
				},
				memberInfo: {},
				loadingMore: false, // 是否正在加载更多
				noMoreData: false // 是否没有更多数据
			};
		},
		computed: {
			formatCurrency() {
				return (amount) => {
					if (typeof amount !== 'number') return '0.00';
					return (amount / 100).toFixed(2);
				};
			},
			formattedTotalBalance() {
				return this.accountInfo ? this.formatCurrency(this.accountInfo.totalAccountBalance) : '0.00';
			},
			formattedPersonalBalance() {
				return this.accountInfo ? this.formatCurrency(this.accountInfo.accountBalance) : '0.00';
			},
			formattedPersonalAvailable() {
				return this.accountInfo ? this.formatCurrency(this.accountInfo.availableAccountBalance) : '0.00';
			},
			formattedPersonalUnavailable() {
				return this.accountInfo ? this.formatCurrency(this.accountInfo.unAvailableAccountBalance) : '0.00';
			},
			formattedCardBalance() {
				return this.accountInfo ? this.formatCurrency(this.accountInfo.personBalance) : '0.00';
			},
			formattedCardAvailable() {
				return this.accountInfo ? this.formatCurrency(this.accountInfo.availablePersonBalance) : '0.00';
			},
			formattedCardUnavailable() {
				return this.accountInfo ? this.formatCurrency(this.accountInfo.unAvailablePersonBalance) : '0.00';
			}
		},
		// onShow时刷新页面
		async onShow() {
			uni.showLoading({
				title: '加载中...'
			});
			try {
				this.memberInfo = uni.getStorageSync('memberInfo');
				const tokenMemberType = uni.getStorageSync('tokenMemberType');
				const res = await getAccountInfo({
					tab: tokenMemberType === 0 ? 1 : 2
				});
				if (res.code === 0) {
					this.accountInfo = res.data;
				} else {
					uni.showToast({
						title: res.msg || '获取资产失败',
						icon: 'none'
					});
				}

				// 如果是企业用户，获取流水列表
				if (this.memberInfo.tokenMemberType === 2) {
					await this.getFlowList();
				}
			} catch (error) {
				console.error('获取账户信息失败', error);
				if (error.code === 2) {
					uni.showToast({ title: '请先登录', icon: 'none' });
					return;
				} else {
					uni.showToast({ title: '网络错误', icon: 'none' });
					return;
				}
			} finally {
				uni.hideLoading();
			}
		},
		async onLoad() {
			uni.showLoading({
				title: '加载中...'
			});
			try {
				this.memberInfo = uni.getStorageSync('memberInfo');
				const tokenMemberType = uni.getStorageSync('tokenMemberType');
				const res = await getAccountInfo({
					tab: tokenMemberType === 0 ? 1 : 2
				});
				if (res.code === 0) {
					this.accountInfo = res.data;
				} else {
					uni.showToast({
						title: res.msg || '获取资产失败',
						icon: 'none'
					});
				}

				// 如果是企业用户，获取流水列表
				if (this.memberInfo.tokenMemberType === 2) {
					await this.getFlowList();
				}
			} catch (error) {
				console.error('获取账户信息失败', error);
				if (error.code === 2) {
					uni.showToast({ title: '请先登录', icon: 'none' });
					return;
				} else {
					uni.showToast({ title: '网络错误', icon: 'none' });
					return;
				}
			} finally {
				uni.hideLoading();
			}
		},
		methods: {
			contactCustomerService() {
				contactCustomerServiceFn()
			},
			goToRecords() {
				uni.navigateTo({
					url: '/pages/account/records'
				});
			},
			TaskMoney(e){
				my.tradePay({
				  orderStr: e, //完整的支付参数拼接成的字符串，从服务端获取
				  success: (res) => {
				    my.alert({
					  content: JSON.stringify(res),
					});
				  },
				  fail: (res) => {
				    my.alert({
					  content: JSON.stringify(res),
					});
				  }
				});
			},
			goToRefundPage() {
				uni.navigateTo({
					url: '/pages/refund/apply'
				});
			},
			goToRechargePage() {
				uni.navigateTo({
					url: '/pages/recharge/recharge'
				});
			},

			/**
			 * @description 获取账户流水列表
			 * @param {boolean} loadMore - 是否为加载更多
			 */
			async getFlowList(loadMore = false) {
				try {
					if (loadMore) {
						this.loadingMore = true;
					}

					const requestData = {
						accountType: "2",
						current: this.flowPagination.current,
						size: this.flowPagination.size,
						tab: 1
					};

					const res = await getAccountFlowPage(requestData);

					if (res.code === 0 && res.data && res.data.accountFlowMiniVO) {
						const flowData = res.data.accountFlowMiniVO;
						
						if (loadMore) {
							// 加载更多：追加数据
							this.flowList = [...this.flowList, ...flowData.records];
						} else {
							// 首次加载：替换数据
							this.flowList = flowData.records;
						}

						// 更新分页信息
						this.flowPagination = {
							current: flowData.current,
							size: flowData.size,
							total: flowData.total,
							pages: flowData.pages
						};

						// 判断是否还有更多数据
						this.noMoreData = this.flowPagination.current >= this.flowPagination.pages;
					} else {
						uni.showToast({
							title: res.msg || '获取流水失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('获取流水列表失败:', error);
					uni.showToast({
						title: '网络错误',
						icon: 'none'
					});
				} finally {
					if (loadMore) {
						this.loadingMore = false;
					}
				}
			},

			/**
			 * @description 加载更多流水数据
			 */
			async loadMoreFlow() {
				if (this.loadingMore || this.noMoreData) {
					return;
				}

				this.flowPagination.current += 1;
				await this.getFlowList(true);
			},

			/**
			 * @description 格式化金额变化显示
			 * @param {string} amountChange - 金额变化字符串，如 "+1" 或 "-1"
			 */
			formatAmountChange(amountChange) {
				if (!amountChange) return '0.00';
				
				// 提取数字部分
				const amount = parseInt(amountChange.replace(/[^-0-9]/g, ''));
				const formattedAmount = (Math.abs(amount) / 100).toFixed(2);
				
				if (amountChange.startsWith('+')) {
					return `+¥${formattedAmount}`;
				} else if (amountChange.startsWith('-')) {
					return `-¥${formattedAmount}`;
				}
				return `¥${formattedAmount}`;
			},

			/**
			 * @description 格式化账户余额显示
			 * @param {number} balance - 账户余额（分）
			 */
			formatAccountBalance(balance) {
				if (typeof balance !== 'number') return '¥0.00';
				return `¥${(balance / 100).toFixed(2)}`;
			},

			// 企业用户专用方法
			goToPersonalRechargePage() {
				uni.navigateTo({
					url: '/pages/recharge/leaguerAccountRecharge'
				});
			},

			goToPersonalRefundPage() {
				uni.navigateTo({
					url: '/pages/refund/leaguerAccountRefund'
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.assets-page {
		background-color: #f6f7f8;
		min-height: 100vh;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
	}

	.page-container {
		padding: 32rpx;
	}

	.wallet-card {
		background-color: white;
		border-radius: 24rpx;
		padding: 48rpx 48rpx 40rpx;
		margin-bottom: 32rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
		border: 1rpx solid rgba(0, 0, 0, 0.06);
	}

	.card-header {
		margin-bottom: 32rpx;
	}

	.card-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #0d171b;
		line-height: 1.2;
		letter-spacing: -0.015em;
	}

	.balance-section {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
		margin-bottom: 32rpx;
	}

	.balance-label {
		font-size: 28rpx;
		font-weight: 400;
		color: #6b7280;
		line-height: 1.4;
	}

	.balance-amount {
		font-size: 80rpx;
		font-weight: 700;
		color: #13a4ec;
		line-height: 1.2;
		letter-spacing: -0.015em;
	}

	.unavailable-label {
		font-size: 28rpx;
		font-weight: 400;
		color: #6b7280;
		line-height: 1.4;
	}

	.divider {
		height: 2rpx;
		background-color: #e5e7eb;
		margin: 32rpx 0;
	}

	.action-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16rpx;

		&.single {
			grid-template-columns: repeat(1, 1fr);
			justify-content: flex-start;
		}
	}

	.action-item {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 12rpx 24rpx;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s ease;
		border-radius: 16rpx;
		min-height: 60rpx;

		&.blue {
			background-color: #1F67FD;
		}

		&.water-blue {
			background-color: #EEF1F6;
		}

		&.green {
			background-color: #F0F9F2;
		}
	}

	.action-label {
		font-size: 28rpx;
		font-weight: 1000;
		color: #0d171b;
		line-height: 1.4;
	}

	/* 流水列表样式 */
	.flow-section {
		background-color: white;
		border-radius: 24rpx;
		margin-bottom: 32rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
		border: 1rpx solid rgba(0, 0, 0, 0.06);
	}

	.flow-header {
		padding: 48rpx 48rpx 32rpx;
		border-bottom: 2rpx solid #f3f4f6;
	}

	.flow-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #0d171b;
		line-height: 1.2;
		letter-spacing: -0.015em;
	}

	.flow-list {
		background-color: white;
	}

	.flow-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 32rpx 48rpx;
		border-bottom: 2rpx solid #f9fafb;

		&:last-child {
			border-bottom: none;
		}
	}

	.flow-item-left {
		flex: 1;
	}

	.flow-event-name {
		font-size: 32rpx;
		font-weight: 500;
		color: #0d171b;
		margin-bottom: 8rpx;
		line-height: 1.4;
	}

	.flow-create-time {
		font-size: 26rpx;
		color: #6b7280;
		line-height: 1.4;
	}

	.flow-item-right {
		text-align: right;
	}

	.flow-amount-change {
		font-size: 32rpx;
		font-weight: 700;
		margin-bottom: 8rpx;
		line-height: 1.2;

		&.positive {
			color: #13a4ec;
		}

		&.negative {
			color: #ef4444;
		}
	}

	.flow-balance {
		font-size: 26rpx;
		color: #6b7280;
		line-height: 1.4;
	}

	.load-more-section {
		padding: 48rpx;
		text-align: center;
	}

	.load-more-btn {
		background-color: #f3f4f6;
		color: #6b7280;
		padding: 24rpx 48rpx;
		border-radius: 16rpx;
		font-size: 28rpx;
		font-weight: 500;
		display: inline-block;
		transition: all 0.2s ease;

		&:active {
			background-color: #e5e7eb;
			transform: scale(0.98);
		}
	}

	.loading-text, .no-more-text {
		color: #6b7280;
		font-size: 26rpx;
		line-height: 1.4;
	}

	.empty-state {
		padding: 120rpx 48rpx;
		text-align: center;
		color: #6b7280;
		font-size: 28rpx;
		line-height: 1.4;
	}
</style>

<template>
	<view class="assets-page">
		<!-- 头部绿色背景 -->
		<view class="header-section" v-if="memberInfo.tokenMemberType === 0">
			<text class="header-title">个人账户总资产</text>
			<view class="total-balance">
				<text>¥ </text>
				<text class="amount">{{ formattedTotalBalance }}</text>
			</view>
			<view class="records-button" @click="goToRecords">
				<text>收支记录</text>
			</view>
		</view>

		<!-- 卡片及列表容器 -->
		<view class="content-container">
			<!-- 个人钱包卡片 -->
			<view class="wallet-card" v-if="memberInfo.tokenMemberType === 0">
				<view class="card-title-bar">
					<text class="card-title">个人钱包(元)</text>
					<text class="question-mark">?</text>
				</view>
				<text class="card-amount">¥ {{ formattedPersonalBalance }}</text>
				<view class="info-strip-group">
					<view class="info-strip">
						<text>• 可用金额：{{ formattedPersonalAvailable }}元</text>
					</view>
					<view class="info-strip">
						<text>• 不可用金额：{{ formattedPersonalUnavailable }}元</text>
					</view>
				</view>
				<view class="card-actions">
					<view class="action-button" @click="goToRecords">
						<text class="icon">[账]</text>
						<text>账单</text>
					</view>
					<view class="action-button primary">
						<text class="icon">[充]</text>
						<text @click="goToRechargePage">余额充值</text>
					</view>
					<view class="action-button" @click="goToRefundPage">
						<text class="icon">[退]</text>
						<text>申请退款</text>
					</view>
				</view>
			</view>

			<!-- 电卡钱包卡片 -->
			<view class="wallet-card" v-if="memberInfo.tokenMemberType === 0">
				<view class="card-title-bar">
					<text class="card-title">电卡钱包(元)</text>
					<text class="question-mark">?</text>
				</view>
				<text class="card-amount">¥ {{ formattedCardBalance }}</text>
				<view class="info-strip-group">
					<view class="info-strip">
						<text>• 可用金额：{{ formattedCardAvailable }}元</text>
					</view>
					<view class="info-strip">
						<text>• 不可用金额：{{ formattedCardUnavailable }}元</text>
					</view>
				</view>
				<view class="card-actions">
					<view class="action-button" @click="goToRecords">
						<text class="icon">[账]</text>
						<text>账单</text>
					</view>
				</view>
			</view>
			<view class="wallet-card" v-if="memberInfo.tokenMemberType === 2" style="margin-top: 32rpx;">
				<view class="card-title-bar">
					<text class="card-title">企业钱包(元)</text>
					<text class="question-mark">?</text>
				</view>
				<text class="card-amount">¥ {{ formattedPersonalBalance }}</text>
				<view class="card-actions">
					<view class="action-button primary">
						<text class="icon">[充]</text>
						<text @click="goToPersonalRechargePage">余额充值</text>
					</view>
					<view class="action-button" @click="goToPersonalRefundPage">
						<text class="icon">[退]</text>
						<text>申请退款</text>
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
				uni.showToast({
					title: '网络错误',
					icon: 'none'
				});
			} finally {
				uni.hideLoading();
			}
		},
		methods: {
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
		background-color: #f7f8fa;
		min-height: 100vh;
	}

	.header-section {
		// 背景颜色 从 #007AFF 渐变到 #F7F8FA
		background: linear-gradient(to bottom, #007AFF, #F7F8FA);
		color: white;
		padding: 40rpx 32rpx;
		position: relative;
	}

	.header-title {
		font-size: 28rpx;
		opacity: 0.8;
	}

	.total-balance {
		font-size: 48rpx;
		font-weight: bold;
		margin-top: 16rpx;

		.amount {
			font-size: 64rpx;
		}
	}

	.records-button {
		position: absolute;
		top: 40rpx;
		right: 32rpx;
		background-color: white;
		color: #007AFF;
		padding: 12rpx 24rpx;
		border-radius: 30rpx;
		font-size: 24rpx;
		font-weight: bold;
	}

	.content-container {
		padding: 0 32rpx;
		margin-top: -40rpx;
		position: relative;
		z-index: 1;
	}

	.wallet-card {
		background-color: white;
		border-radius: 16rpx;
		padding: 32rpx;
		margin-bottom: 24rpx;
	}

	.card-title-bar {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.card-title {
		font-size: 32rpx;
		font-weight: bold;
	}

	.question-mark {
		width: 36rpx;
		height: 36rpx;
		border: 1px solid #ccc;
		border-radius: 50%;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		font-size: 24rpx;
		color: #999;
		margin-left: 16rpx;
	}

	.card-amount {
		font-size: 56rpx;
		font-weight: bold;
		color: #333;
	}

	.info-strip-group {
		margin: 24rpx 0;
	}

	.info-strip {
		background-color: #f7f8fa;
		padding: 8rpx 16rpx;
		border-radius: 8rpx;
		font-size: 24rpx;
		color: #909399;
		margin-bottom: 12rpx;
	}

	.card-actions {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		border-top: 1px solid #f0f0f0;
		padding-top: 24rpx;
		margin-top: 24rpx;
	}

	.action-button {
		display: flex;
		align-items: center;
		font-size: 28rpx;
		color: #606266;
		margin-left: 40rpx;

		&.primary {
			color: #007AFF;
			font-weight: bold;
		}

		.icon {
			margin-right: 8rpx;
		}
	}

	/* 流水列表样式 */
	.flow-section {
		background-color: white;
		border-radius: 16rpx;
		margin-bottom: 24rpx;
		overflow: hidden;
	}

	.flow-header {
		padding: 32rpx 32rpx 24rpx;
		border-bottom: 1px solid #f0f0f0;
	}

	.flow-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.flow-list {
		background-color: white;
	}

	.flow-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx 32rpx;
		border-bottom: 1px solid #f5f5f5;

		&:last-child {
			border-bottom: none;
		}
	}

	.flow-item-left {
		flex: 1;
	}

	.flow-event-name {
		font-size: 30rpx;
		font-weight: 500;
		color: #333;
		margin-bottom: 8rpx;
	}

	.flow-create-time {
		font-size: 24rpx;
		color: #999;
	}

	.flow-item-right {
		text-align: right;
	}

	.flow-amount-change {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 8rpx;

		&.positive {
			color: #007AFF;
		}

		&.negative {
			color: #f56c6c;
		}
	}

	.flow-balance {
		font-size: 24rpx;
		color: #666;
	}

	.load-more-section {
		padding: 32rpx;
		text-align: center;
	}

	.load-more-btn {
		background-color: #f0f0f0;
		color: #666;
		padding: 16rpx 32rpx;
		border-radius: 8rpx;
		font-size: 28rpx;
		display: inline-block;
	}

	.loading-text, .no-more-text {
		color: #999;
		font-size: 24rpx;
	}

	.empty-state {
		padding: 80rpx 32rpx;
		text-align: center;
		color: #999;
		font-size: 28rpx;
	}
</style>

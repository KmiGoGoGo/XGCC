<template>
	<view class="settlement-container">
		<!-- 页面内容 -->
		<view class="page-content">
			<!-- 订单状态提示 -->
			<view class="status-tip" v-if="orderStatus === 2">
				<view class="status-title">订单待支付</view>
				<view class="status-desc">感谢使用，请及时支付订单避免影响后续充电！</view>
			</view>
			<view class="status-tip" v-else>
				<view class="status-title">订单已完成</view>
				<view class="status-desc" v-if="settlementData.disposableOrder">感谢使用，退款会在1～3个工作日内原路退回！</view>
				<view class="status-desc" v-else>感谢使用，期待再次充电！</view>
			</view>

			<!-- 实付金额卡片 -->
			<view class="custom-card amount-card">
				<view class="amount-content">
					<!-- 微信支付分显示待支付金额 -->
					<template v-if="orderStatus === 2 && settlementData.wxppOrder">
						<view class="amount-value">
							<text class="currency">¥</text>
							<text class="value">{{ settlementData.unpaidAmount }}</text>
						</view>
						<view class="amount-label">待支付金额</view>
					</template>
					<template v-else>
						<view class="amount-value">
							<text class="currency">¥</text>
							<text class="value">{{ settlementData.actualAmount }}</text>
						</view>
						<view class="amount-label">实付金额</view>
					</template>
				</view>
			</view>
			
			<!-- 费用明细卡片 -->
			<view class="custom-card detail-card">
				<view class="detail-content">
					<!-- 优惠金额 -->
					<view class="detail-row" v-if="settlementData.totalDiscountBalance > 0">
						<text class="detail-label">优惠金额</text>
						<text class="detail-value discount">- ¥ {{ settlementData.totalDiscountBalance }}</text>
					</view>
					
					<!-- 奖励金抵扣/电卡抵扣 -->
					<view class="detail-row" v-if="settlementData.deductibleBalance > 0">
						<text class="detail-label" v-if="settlementData.payMode != 6">奖励金抵扣</text>
						<text class="detail-label" v-else>电卡抵扣</text>
						<text class="detail-value discount">- ¥ {{ settlementData.deductibleBalance }}</text>
					</view>
					
					<!-- 订单总金额 -->
					<view class="detail-row">
						<text class="detail-label">订单总金额</text>
						<text class="detail-value">¥ {{ settlementData.busBalance }}</text>
					</view>
					
					<!-- 电费服务费说明 -->
					<view class="fee-note">
						电费:¥{{ settlementData.powerBalance }} | 服务费:¥{{ settlementData.serviceBalance }}
					</view>
					
					<!-- 可折叠的费用详情 -->
					<view v-if="feeDetailExpanded">
						<!-- 优惠详情 -->
						<template v-if="settlementData.memberDiscountBalance > 0 || settlementData.discountBalance > 0 || settlementData.cashCouponBalance > 0">
							<view class="section">
								<view class="section-title">优惠详情</view>
								<view class="detail-row" v-if="settlementData.memberDiscountBalance > 0">
									<text class="detail-label">{{ settlementData.payAccountStr == "个人" ? "会员折扣(个人会员)" : "会员折扣(车队会员)" }}</text>
									<text class="detail-value discount">- ¥ {{ settlementData.memberDiscountBalance }}</text>
								</view>
								<view class="detail-row" v-if="settlementData.ruleType != '1' && settlementData.discountBalance > 0">
									<text class="detail-label">优惠活动({{ settlementData.ruleType == "2" ? "累计优惠" : "站点优惠" }})</text>
									<text class="detail-value discount">- ¥ {{ settlementData.discountBalance }}</text>
								</view>
								<view class="detail-row" v-if="settlementData.cashCouponBalance > 0">
									<text class="detail-label">{{ settlementData.couponTypeStr }}</text>
									<text class="detail-value discount">- ¥ {{ settlementData.cashCouponBalance }}</text>
								</view>
							</view>
						</template>
						
						<!-- 费用详情 -->
						<view class="section">
							<view class="section-title">费用详情</view>
							<view class="detail-row" style="margin-bottom: 16rpx;">
								<text class="detail-label" v-if="settlementData.wxppOrder">预付金额（微信支付分)</text>
								<text class="detail-label" v-else>
									{{ settlementData.payAccountStr == "个人" 
										? (settlementData.disposableOrder ? '预付金额（充完即退)' : '预付金额（个人钱包)')
										: (settlementData.payMode == 5 ? '消费金额（储值卡支付)' : '预付金额（车队钱包)')
									}}
								</text>
								<view class="detail-right">
									<text class="detail-value">¥ {{ settlementData.preFrozenAmount || '0' }}</text>
									<text class="detail-time">{{ settlementData.createTime }}</text>
								</view>
							</view>
							
							<!-- 结算退回 -->
							<template v-if="!settlementData.wxppOrder">
								<block v-if="settlementData.disposableOrder">
									<block v-if="settlementData.refundObj">
										<view class="detail-row">
											<text class="detail-label">结算退回（充完即退)</text>
											<view class="detail-right">
												<text class="detail-value">- ¥ {{ settlementData.refundObj ? (settlementData.refundObj.money/100).toFixed(2) : '0' }}</text>
												<text class="detail-time">
													<text style="margin-right: 20rpx;" v-if="settlementData.refundObj">
														<text v-if="settlementData.refundObj.refundStatus==1">退款成功</text>
														<text v-if="settlementData.refundObj.refundStatus==2">退款失败</text>
														<text v-if="settlementData.refundObj.refundStatus==5">退款中</text>
													</text>
													{{ settlementData.refundObj.refundStatus ? settlementData.refundObj.updateTime : settlementData.refundObj.realTime }}
												</text>
											</view>
										</view>
									</block>
								</block>
								<block v-else-if="settlementData.payAccountStr == '个人'">
									<view class="detail-row">
										<text class="detail-label">{{ settlementData.payAccountStr == "个人" ? '结算退回（个人钱包)' : '结算退回（车队钱包)' }}</text>
										<view class="detail-right">
											<text class="detail-value">¥ {{ settlementData.backAmountCalculate || '0' }}</text>
											<text class="detail-time">{{ settlementData.refundObj ? settlementData.refundObj.realTime : '-' }}</text>
										</view>
									</view>
								</block>
							</template>
							
							<!-- 超出金额 -->
							<block v-if="settlementData.disposableOrder && settlementData.walletPayObj && settlementData.walletPayObj.length > 0">
								<block v-for="(item,index) in settlementData.walletPayObj" :key="index">
									<view class="detail-row">
										<text class="detail-label">超出金额(个人钱包)</text>
										<view class="detail-right">
											<text class="detail-value">¥ {{ (item.money/100).toFixed(2) }}</text>
											<text class="detail-time">{{ item.realTime }}</text>
										</view>
									</view>
								</block>
							</block>
							<block v-if="settlementData.disposableOrder && settlementData.wechatPayObj">
								<view class="detail-row">
									<text class="detail-label">超出金额(微信支付)</text>
									<view class="detail-right">
										<text class="detail-value">¥ {{ settlementData.wechatPayObj ? (settlementData.wechatPayObj.money/100).toFixed(2) : '0' }}</text>
										<text class="detail-time">{{ settlementData.wechatPayObj ? settlementData.wechatPayObj.realTime : '-' }}</text>
									</view>
								</view>
							</block>
						</view>
					</view>
					
					<!-- 收起按钮 -->
					<view class="toggle-btn" @click="toggleFeeDetail">
						<text class="toggle-text">{{ feeDetailExpanded ? '收起费用明细' : '展开费用明细' }}</text>
						<uv-icon :name="feeDetailExpanded ? 'arrow-up' : 'arrow-down'" color="#007AFF" size="18"></uv-icon>
					</view>
				</view>
			</view>
			
			<!-- 订单信息卡片 -->
			<view class="custom-card detail-card">
				<view class="detail-content">
					<view class="detail-row">
						<text class="detail-label">订单编号</text>
						<view class="detail-right-with-action">
							<text class="detail-value mono">{{ settlementData.busShowNo }}</text>
							<uv-button text="复制" type="primary" size="mini" plain @click="copyOrderNo"></uv-button>
						</view>
					</view>
					<view class="detail-row">
						<text class="detail-label">充电站点</text>
						<text class="detail-value">{{ settlementData.stationName || '--' }}</text>
					</view>
					<view class="detail-row">
						<text class="detail-label">充电桩枪</text>
						<text class="detail-value">{{ settlementData.pileName || '--' }}{{ settlementData.gunName ? '-' + settlementData.gunName : '' }}</text>
					</view>
					<view class="detail-row">
						<text class="detail-label">电桩编号</text>
						<text class="detail-value mono">{{ settlementData.pileNumber }}</text>
					</view>
				</view>
			</view>

			<!-- 占位信息卡片 -->
			<view class="custom-card detail-card" v-if="settlementData.stationOccupy == 1 && settlementData.occupyBill">
				<view class="detail-content">
					<view class="occupy-header">
						<view class="occupy-title">占位信息</view>
						<view class="occupy-status" v-if="settlementData.occupyBill.billStatus == 11">待支付</view>
						<view class="occupy-status paid" v-if="settlementData.occupyBill.billStatus == 14">已支付</view>
						<view class="occupy-status refunded" v-if="settlementData.occupyBill.billStatus == 18">已退款</view>
					</view>
					<view class="occupy-content">
						<view class="occupy-item">
							<view class="occupy-value">{{ settlementData.occupyBill.duration }}<text class="unit">分钟</text></view>
							<view class="occupy-desc">总占位时长</view>
						</view>
						<view class="occupy-item">
							<view class="occupy-value">{{ settlementData.occupyBill.actualDuration }}<text class="unit">分钟</text></view>
							<view class="occupy-desc">超时占位时长</view>
						</view>
						<view class="occupy-item">
							<view class="occupy-value">{{ (settlementData.occupyBill.busBalance/100).toFixed(2) }}<text class="unit">元</text></view>
							<view class="occupy-desc">超时占位费用</view>
						</view>
					</view>
					<view class="occupy-action">
						<uv-button text="查看详情" type="primary" size="mini" @click="toPlaceholderOrderDetail(settlementData.occupyBill.id)"></uv-button>
					</view>
				</view>
			</view>
			
			<!-- 充电信息卡片 -->
			<view class="custom-card detail-card charge-card">
				<view class="detail-content">
					<!-- 标题和标签 -->
					<view class="charge-header">
						<view class="section-title">充电信息</view>
						<view class="charge-tags">
							<uv-tags :text="settlementData.chargeType == 'man' ? '慢充' : settlementData.chargeType == 'kuai' ? '快充' : settlementData.chargeType == 'overTake' ? '超充' : '其他'" 
								bg-color="#FFF7ED" color="#EA580C" border="none" size="mini"></uv-tags>
							<uv-tags :text="settlementData.pileCurrentMode==1 ? '直流' : settlementData.pileCurrentMode==2 ? '交流' : settlementData.pileCurrentMode==3 ? '交直流一体' : settlementData.pileCurrentMode==4 ? '无线设备' : '其他'" 
								bg-color="#F0FDF4" color="#15803D" border="none" size="mini"></uv-tags>
						</view>
					</view>
					
					<!-- 充电时间信息 -->
					<view class="charge-time-info">
						<view class="time-point">
							<view class="time-date">{{ settlementData.timeS ? settlementData.timeS[0] : '--' }}</view>
							<view class="time-value">{{ settlementData.timeS ? settlementData.timeS[1] : '--' }}</view>
						</view>
						<view class="time-duration">
							<view class="duration-badge">{{ settlementData.difference || '--' }}</view>
							<view class="duration-line"></view>
							<view class="duration-label">充电时长</view>
						</view>
						<view class="time-point">
							<view class="time-date">{{ settlementData.timeE ? settlementData.timeE[0] : '--' }}</view>
							<view class="time-value">{{ settlementData.timeE ? settlementData.timeE[1] : '--' }}</view>
						</view>
					</view>
					
					<!-- 设备信息 -->
					<view class="device-info">
						<uv-icon name="info-circle" color="#6B7280" size="16"></uv-icon>
						<text class="device-text">{{ settlementData.endReasonStr || '暂无停止充电原因' }}</text>
					</view>
					
					<!-- 可折叠的充电详情 -->
					<view v-if="chargeDetailExpanded">
						<!-- 分割线 -->
						<view class="divider"></view>
						
						<!-- 充电详情 -->
						<view class="charge-details">
							<view class="detail-row">
								<text class="detail-label">充电车辆</text>
								<text class="detail-value">{{ settlementData.plateNo || '--' }}</text>
							</view>
							<view class="detail-row">
								<text class="detail-label">已充电量</text>
								<text class="detail-value">{{ settlementData.sumPower }}度</text>
							</view>
							<view class="detail-row">
								<text class="detail-label">结束SOC</text>
								<text class="detail-value">{{ settlementData.endSoc || '0' }}%</text>
							</view>
						</view>
					</view>
					
					<!-- 收起按钮 -->
					<view class="toggle-btn" @click="toggleChargeDetail">
						<text class="toggle-text">{{ chargeDetailExpanded ? '收起充电信息' : '展开充电信息' }}</text>
						<uv-icon :name="chargeDetailExpanded ? 'arrow-up' : 'arrow-down'" color="#007AFF" size="18"></uv-icon>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 支付按钮 -->
		<view class="fixed-bottom-bar" v-if="orderStatus === 2">
			<view class="safe-area-bottom">
				<uv-button 
					text="去支付" 
					type="primary" 
					size="large"
					:custom-style="buttonStyle"
					@click="goPay"
				></uv-button>
			</view>
		</view>

		<!-- 充完即退-欠款订单支付按钮 -->
		<view class="fixed-bottom-bar" v-if="(orderStatus === 2) && settlementData.disposableOrder">
			<view class="safe-area-bottom">
				<uv-button 
					text="立即支付" 
					type="primary" 
					size="large"
					:custom-style="buttonStyle"
					@click="unifiedOrders"
				></uv-button>
			</view>
		</view>

		<!-- 完成按钮 -->
		<view class="fixed-bottom-bar" v-if="orderStatus !== 2">
			<view class="safe-area-bottom">
				<uv-button 
					text="完成" 
					type="primary" 
					size="large"
					:custom-style="buttonStyle"
					@click="handleRecharge"
				></uv-button>
			</view>
		</view>
	</view>
</template>

<script>
import { getBillDetailById } from '@/api/bill.js'

export default {
	name: 'SettlementInfo',
	data() {
		return {
			billId: null, // 从路由参数获取的账单ID
			orderStatus: 3, // 订单状态：1=充电中 2=待支付 3=已完成 4=已关闭
			feeDetailExpanded: false,
			chargeDetailExpanded: false,
			buttonStyle: {
				width: '100%',
				height: '88rpx',
				borderRadius: '44rpx',
				fontSize: '32rpx',
				fontWeight: 'bold'
			},
			// 订单状态映射
			orderStatusArr: [
				{ state: '1', val: 1 }, { state: '2', val: 1 }, { state: '3', val: 3 },
				{ state: '4', val: 1 }, { state: '5', val: 5 }, { state: '6', val: 5 },
				{ state: '7', val: 5 }, { state: '8', val: 5 }, { state: '9', val: 5 },
				{ state: '10', val: 2 }, { state: '11', val: 2 }, { state: '12', val: 2 },
				{ state: '13', val: 2 }, { state: '14', val: 3 }, { state: '15', val: 2 },
				{ state: '16', val: 4 }, { state: '17', val: 3 }, { state: '18', val: 4 }
			],
			settlementData: {
				// 基础信息
				busShowNo: '--',
				stationName: '--',
				pileName: '--',
				gunName: '--',
				pileNumber: '--',
				// 金额信息
				actualAmount: '--',
				actualBalance: 0,
				busBalance: '--',
				powerBalance: '--',
				serviceBalance: '--',
				totalDiscountBalance: '--',
				deductibleBalance: '--',
				memberDiscountBalance: '--',
				discountBalance: '--',
				cashCouponBalance: '--',
				couponTypeStr: '--',
				// 支付信息
				payMode: 0,
				payAccountStr: '--',
				disposableOrder: false,
				wxppOrder: false,
				preFrozenAmount: '--',
				backAmountCalculate: '--',
				// 时间信息
				timeS: null,
				timeE: null,
				difference: '--',
				createTime: '--',
				// 充电信息
				chargeType: '--',
				pileCurrentMode: 0,
				endReasonStr: '--',
				plateNo: '--',
				sumPower: '--',
				endSoc: '--',
				// 其他信息
				stationOccupy: 0,
				occupyBill: null,
				refundObj: null,
				walletPayObj: [],
				wechatPayObj: null,
				ruleType: '--'
			}
		}
	},
	onLoad(options) {
		// 从路由参数中获取账单ID
		if (options.billId) {
			this.billId = options.billId;
			this.fetchBillDetail();
		}
	},
	methods: {
		// 获取账单详情
		async fetchBillDetail() {
			if (!this.billId) {
				console.warn('账单ID不存在，无法获取详情');
				return;
			}
			
			try {
				uni.showLoading({
					title: '加载中...'
				});
				
				const response = await getBillDetailById(this.billId);
				
				if (response && response.code === 0 && response.data) {
					this.updateSettlementData(response.data);
					console.log('账单详情获取成功:', response.data);
				} else {
					console.error('获取账单详情失败:', response);
					uni.showToast({
						title: '获取数据失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('调用getBillDetailById接口失败:', error);
				uni.showToast({
					title: '网络错误',
					icon: 'none'
				});
			} finally {
				uni.hideLoading();
			}
		},
		
		// 判断订单状态
		judgmentState(billStatus) {
			let type = 3; // 默认已完成
			this.orderStatusArr.forEach(item => {
				if (billStatus == item.state) {
					type = item.val;
				}
			});
			return type;
		},

		// 更新结算数据
		updateSettlementData(data) {
			// 判断订单状态
			const billStatus = data.billStatus;
			const type = this.judgmentState(billStatus);
			
			// 设置订单状态
			if (type == 1) {
				// 充电中
			} else if (type == 2) {
				this.orderStatus = 2; // 待支付
			} else if (type == 3) {
				this.orderStatus = 3; // 已完成
			} else if (type == 4) {
				this.orderStatus = 1; // 已关闭
			}

			// 处理时间数据
			if (data.timeS) {
				data.timeS = data.timeS.split(" ");
				data.timeS[0] = data.timeS[0].split("-")[1] + '月' + data.timeS[0].split("-")[2] + '日';
			}
			if (data.timeE) {
				data.timeE = data.timeE.split(" ");
				data.timeE[0] = data.timeE[0].split("-")[1] + '月' + data.timeE[0].split("-")[2] + '日';
			}

			// 计算充电时长
			data.difference = this.getDateDiff(data.timeS ? data.timeS.join(' ') : null, data.timeE ? data.timeE.join(' ') : null);

			// 处理金额数据（分转元）
			const regFenToYuan = (fen) => {
				return (fen / 100).toFixed(2);
			};

			// 更新结算数据
			console.log("qqqqqqqqq", data)
			this.settlementData = {
				// 基础信息
				busShowNo: data.busShowNo || '--',
				stationName: data.stationName || '--',
				pileName: data.pileName || '--',
				gunName: data.gunName || '--',
				pileNumber: data.pileNumber || '--',
				
				// 金额信息
				actualAmount: regFenToYuan(data.actualBalance),
				actualBalance: data.actualBalance,
				busBalance: regFenToYuan(data.busBalance),
				powerBalance: regFenToYuan(data.powerBalance),
				serviceBalance: regFenToYuan(data.serviceBalance),
				totalDiscountBalance: regFenToYuan(data.totalDiscountBalance),
				deductibleBalance: regFenToYuan(data.deductibleBalance),
				memberDiscountBalance: regFenToYuan(data.memberDiscountBalance),
				discountBalance: regFenToYuan(data.discountBalance),
				cashCouponBalance: regFenToYuan(data.cashCouponBalance),
				couponTypeStr: data.couponTypeStr || '--',
				
				// 支付信息
				payMode: data.payMode || 0,
				payAccountStr: data.payAccountStr || '--',
				disposableOrder: data.disposableOrder || false,
				wxppOrder: data.wxppOrder || false,
				preFrozenAmount: data.preFrozenAmount || 0,
				backAmountCalculate: data.backAmount || 0,
				
				// 时间信息
				timeS: data.timeS,
				timeE: data.timeE,
				difference: this.getDateDiff(data.timeS ? data.timeS.join(' ') : null, data.timeE ? data.timeE.join(' ') : null),
				createTime: data.createTime || '--',
				
				// 充电信息
				chargeType: data.chargeType || '--',
				pileCurrentMode: data.pileCurrentMode || 0,
				endReasonStr: data.endReasonStr || '--',
				plateNo: data.plateNo || '--',
				sumPower: data.sumPower ? (data.sumPower / 1000).toFixed(3) : '--',
				endSoc: data.endSoc || '0',
				
				// 其他信息
				stationOccupy: data.stationOccupy || 0,
				occupyBill: data.occupyBill || null,
				refundObj: data.refundObj || null,
				walletPayObj: data.walletPayObj || [],
				wechatPayObj: data.wechatPayObj || null,
				ruleType: data.ruleType || '--'
			};
		},

		// 计算退回金额
		calculateBackAmount(data) {
			const actualBalance = Number(data.actualBalance || 0);
			const preFrozenAmount = Number(data.preFrozenAmount || 0);
			const backAmount = (preFrozenAmount - actualBalance).toFixed(2);
			return backAmount < 0 ? '0.00' : backAmount;
		},

		// 计算时间差
		getDateDiff(timeS, timeE) {
			// 将字符串转为 Date 对象（补全年份，确保可解析）
			const year = new Date().getFullYear();

			const start = new Date(`${year}-${timeS.replace('月', '-').replace('日', '')}`);
			const end = new Date(`${year}-${timeE.replace('月', '-').replace('日', '')}`);

			// 计算差值（毫秒）
			const diffMs = end - start;

			if (isNaN(diffMs) || diffMs < 0) return '00:00:00';

			// 转换为秒
			let diffSec = Math.floor(diffMs / 1000);

			const hours = String(Math.floor(diffSec / 3600)).padStart(2, '0');
			diffSec %= 3600;
			const minutes = String(Math.floor(diffSec / 60)).padStart(2, '0');
			const seconds = String(diffSec % 60).padStart(2, '0');

			return `${hours}:${minutes}:${seconds}`;
		},
		
		// 格式化日期时间
		formatDateTime(dateTimeStr) {
			if (!dateTimeStr) return { date: '--', time: '--' };
			
			try {
				const date = new Date(dateTimeStr);
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hours = String(date.getHours()).padStart(2, '0');
				const minutes = String(date.getMinutes()).padStart(2, '0');
				const seconds = String(date.getSeconds()).padStart(2, '0');
				
				return {
					date: `${month}月${day}日`,
					time: `${hours}:${minutes}:${seconds}`
				};
			} catch (error) {
				console.error('时间格式化失败:', error);
				return { date: '--', time: '--' };
			}
		},
		
		// 计算充电时长
		calculateDuration(startTime, endTime) {
			if (!startTime || !endTime) return '--';
			
			try {
				const start = new Date(startTime);
				const end = new Date(endTime);
				const diffMs = end - start;
				const diffSeconds = Math.floor(diffMs / 1000);
				
				const hours = Math.floor(diffSeconds / 3600);
				const minutes = Math.floor((diffSeconds % 3600) / 60);
				const seconds = diffSeconds % 60;
				
				return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
			} catch (error) {
				console.error('计算充电时长失败:', error);
				return '--';
			}
		},
		
		toggleFeeDetail() {
			this.feeDetailExpanded = !this.feeDetailExpanded;
		},
		toggleChargeDetail() {
			this.chargeDetailExpanded = !this.chargeDetailExpanded;
		},
		copyOrderNo() {
			uni.setClipboardData({
				data: this.settlementData.busShowNo,
				success: () => {
					uni.showToast({
						title: '订单编号已复制',
						icon: 'success'
					});
				}
			});
		},
		
		// 去支付
		goPay() {
			uni.navigateTo({
				url: '../orderSettlement/orderSettlement?busId=' + this.billId
			});
		},
		
		// 立即支付（充完即退）
		unifiedOrders() {
			// 这里可以调用支付接口
			console.log('立即支付');
		},
		
		// 查看占位订单详情
		toPlaceholderOrderDetail(id) {
			uni.navigateTo({
				url: '/orderSub/pages/placeholderOrderDetail/placeholderOrderDetail?id=' + id
			});
		},
		
		handleRecharge() {
			// 返回到首页或充电站列表页面
			uni.navigateBack({
				delta: 999, // 返回到根页面
				fail: () => {
					// 如果返回失败，则跳转到首页
					uni.reLaunch({
						url: '/pages/index/index'
					});
				}
			});
		}
	}
}
</script>

<style lang="scss" scoped>
.settlement-container {
	min-height: 100vh;
	background-color: #EBF5FF;
}

/* 自定义Card样式 */
.custom-card {
	background-color: #FFFFFF;
	border-radius: 24rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	margin: 32rpx 32rpx 0;
	overflow: hidden;
	
	&.amount-card {
		margin: 16rpx 32rpx 0;
	}
	
	&.charge-card {
		margin: 32rpx 32rpx 32rpx;
	}
}

/* 自定义分割线样式 */
.divider {
	height: 1rpx;
	background-color: #E5E7EB;
	margin: 32rpx 0;
}


.page-content {
	padding: 32rpx 0;
	padding-bottom: 200rpx; /* 为底部固定按钮留出空间 */
}

.amount-card {
	.amount-content {
		text-align: center;
		padding: 48rpx 32rpx;
		
		.amount-label {
			font-size: 28rpx;
			color: #6B7280;
			margin-bottom: 16rpx;
		}
		
		.amount-value {
			display: flex;
			align-items: baseline;
			justify-content: center;
			
			.currency {
				font-size: 48rpx;
				color: #1F2937;
				font-weight: bold;
			}
			
			.value {
				font-size: 96rpx;
				color: #1F2937;
				font-weight: bold;
				margin-left: 8rpx;
			}
		}
	}
}

.detail-card {
	.detail-content {
		padding: 48rpx 32rpx 32rpx;
	}
}

.detail-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24rpx;
	
	&:last-child {
		margin-bottom: 0;
	}
	
	.detail-label {
		font-size: 28rpx;
		color: #6B7280;
	}
	
	.detail-value {
		font-size: 28rpx;
		color: #1F2937;
		font-weight: 600;
		
		&.discount {
			color: #EF4444;
		}
		
		&.mono {
			font-family: 'Courier New', monospace;
		}
	}
	
	.detail-right {
		text-align: right;
		
		.detail-time {
			font-size: 24rpx;
			color: #6B7280;
			display: block;
			margin-top: 4rpx;
		}
	}
	
	.detail-right-with-action {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}
}

.fee-note {
	font-size: 24rpx;
	color: #6B7280;
	text-align: right;
	margin-top: 8rpx;
}

.section {
	.section-title {
		font-size: 32rpx;
		color: #1F2937;
		font-weight: 600;
		margin-bottom: 16rpx;
	}
}

.toggle-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	margin-top: 32rpx;
	padding: 16rpx;
	
	.toggle-text {
		font-size: 28rpx;
		color: #007AFF;
		font-weight: 600;
	}
}

.charge-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 32rpx;
	
	.charge-tags {
		display: flex;
		gap: 16rpx;
	}
}

.charge-time-info {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24rpx;
	
	.time-point {
		text-align: center;
		
		.time-date {
			font-size: 24rpx;
			color: #6B7280;
			margin-bottom: 8rpx;
		}
		
		.time-value {
			font-size: 32rpx;
			color: #1F2937;
			font-weight: 600;
		}
	}
	
	.time-duration {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		
		.duration-badge {
			background: rgba(0, 122, 255, 0.1);
			border: 2rpx solid #007AFF;
			border-radius: 48rpx;
			padding: 12rpx 24rpx;
			font-size: 28rpx;
			color: #007AFF;
			font-family: 'Courier New', monospace;
			font-weight: 600;
			z-index: 2;
			background-color: white;
		}
		
		.duration-line {
			position: absolute;
			top: 50%;
			left: 0;
			right: 0;
			height: 2rpx;
			background: repeating-linear-gradient(
				to right,
				#D1D5DB 0,
				#D1D5DB 8rpx,
				transparent 8rpx,
				transparent 16rpx
			);
			z-index: 1;
		}
		
		.duration-label {
			font-size: 24rpx;
			color: #6B7280;
			margin-top: 16rpx;
		}
	}
}

.device-info {
	display: flex;
	align-items: center;
	gap: 8rpx;
	
	.device-text {
		font-size: 28rpx;
		color: #6B7280;
	}
}

.charge-details {
	margin-bottom: 16rpx;
}

/* 订单状态提示样式 */
.status-tip {
	background-color: #FFFFFF;
	border-radius: 24rpx;
	margin: 16rpx 32rpx 32rpx;
	padding: 32rpx;
	text-align: center;
	
	.status-title {
		font-size: 32rpx;
		color: #1F2937;
		font-weight: 600;
		margin-bottom: 16rpx;
	}
	
	.status-desc {
		font-size: 28rpx;
		color: #6B7280;
		line-height: 1.5;
	}
}

/* 占位信息样式 */
.occupy-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 32rpx;
	
	.occupy-title {
		font-size: 32rpx;
		color: #1F2937;
		font-weight: 600;
	}
	
	.occupy-status {
		padding: 8rpx 16rpx;
		border-radius: 16rpx;
		font-size: 24rpx;
		color: #FFFFFF;
		background-color: #F59E0B;
		
		&.paid {
			background-color: #10B981;
		}
		
		&.refunded {
			background-color: #6B7280;
		}
	}
}

.occupy-content {
	display: flex;
	justify-content: space-between;
	margin-bottom: 32rpx;
	
	.occupy-item {
		flex: 1;
		text-align: center;
		
		.occupy-value {
			font-size: 32rpx;
			color: #1F2937;
			font-weight: 600;
			margin-bottom: 8rpx;
			
			.unit {
				font-size: 24rpx;
				color: #6B7280;
				margin-left: 4rpx;
			}
		}
		
		.occupy-desc {
			font-size: 24rpx;
			color: #6B7280;
		}
	}
}

.occupy-action {
	text-align: right;
}

/* 固定底部按钮样式 */
.fixed-bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #FFFFFF;
	border-top: 1rpx solid #E5E7EB;
	box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.08);
	z-index: 999;
	
	.safe-area-bottom {
		padding: 32rpx 32rpx;
		padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
	}
}
</style>

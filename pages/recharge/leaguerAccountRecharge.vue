<template>
    <view class="recharge-container">
        <!-- 充值优惠横幅 -->
        <!-- <view class="promo-banner">
            <view class="promo-content">
                <view class="promo-tag">充值优惠</view>
                <text class="promo-text">{{ promoText || '充值赠券活动赠送优惠券为充电服务...' }}</text>
            </view>
            <view class="promo-action" @click="showPromoDetail">
                <text class="promo-link">查看详情</text>
                <text class="chevron-right">›</text>
            </view>
        </view> -->

        <!-- 充值金额标题 -->
        <view class="section-title">
            <text class="title">充值金额</text>
            <text class="subtitle">充值金额可能出现延迟到账情况，请稍作等待</text>
        </view>

        <!-- 金额输入框 -->
        <view class="amount-input-section">
            <uv-input 
                v-model="rechargeAmount"
                placeholder="请输入充值金额"
                type="digit"
                :disabled="isPaymentProcessing"
                border="none"
                fontSize="36rpx"
                color="#1A202C"
                :customStyle="inputCustomStyle"
                @input="onAmountChange"
            >
                <template v-slot:prefix>
                    <text class="currency-symbol">¥</text>
                </template>
            </uv-input>
        </view>

        <!-- 快捷金额选择 -->
        <view class="amount-grid">
            <view 
                v-for="(amount, index) in quickAmounts" 
                :key="index"
                :class="['amount-card', { 'selected': numericRechargeAmount === amount.value, 'special': amount.special }]"
                @click="selectAmount(amount.value)"
            >
                <view v-if="amount.special" class="special-tag">充值特惠</view>
                <view class="amount-display">
                    <text class="amount-value">{{ amount.value }}</text>
                    <text class="amount-unit">元</text>
                </view>
                <view v-if="numericRechargeAmount === amount.value" class="selected-check">
                    <text class="check-icon">✓</text>
                </view>
            </view>
        </view>

        <!-- 充值奖励 -->
        <!-- <view class="reward-section" v-if="hasReward">
            <text class="section-header">充值奖励</text>
            <view class="reward-card"> -->
                <!-- <view class="reward-title">
                    <text class="gift-icon">🎁</text>
                    <text class="reward-text">{{ currentReward.title }}</text>
                </view>
                <text class="reward-desc">
                    {{ currentReward.description }}
                </text>
                <view class="expand-details" @click="toggleStationList">
                    <text class="expand-text">{{ showStationList ? '收起适用站点详情' : '展开适用站点详情' }}</text>
                    <text class="expand-icon">{{ showStationList ? '⌃' : '⌄' }}</text>
                </view> -->
                
                <!-- 适用站点列表 -->
                <!-- <view v-if="showStationList" class="station-list">
                    <text v-for="(station, index) in stationList" :key="index" class="station-item">
                        {{ station }}
                    </text>
                </view> -->
            <!-- </view>
        </view> -->

        <!-- 支付方式 -->
        <!-- <view class="payment-section">
            <text class="section-header">支付方式</text>
            <view class="payment-method">
                <view class="payment-info">
                    <image class="payment-logo" src="/static/wechat-pay.png" mode="aspectFit"></image>
                    <view class="payment-details">
                        <text class="payment-name">微信支付</text>
                        <text class="payment-desc">推荐微信用户使用</text>
                    </view>
                </view>
                <view class="help-btn">
                    <text class="help-icon">?</text>
                </view>
            </view>
        </view> -->

        <!-- 支付状态提示 -->
        <view v-if="paymentStatus" class="payment-status">
            <text :class="['status-text', paymentStatus.type]">{{ paymentStatus.message }}</text>
        </view>

        <!-- 底部支付按钮 -->
        <view class="bottom-payment">
            <uv-button 
                :text="isPaymentProcessing ? '支付处理中...' : '立即充值'"
                type="primary"
                size="large"
                :disabled="isPaymentProcessing || numericRechargeAmount <= 0"
                :loading="isPaymentProcessing"
                :customStyle="buttonCustomStyle"
                @click="recharge"
            />
        </view>

        <!-- 详情弹窗 -->
        <view v-if="showDetailModal" class="modal-overlay" @click="hidePromoDetail">
            <view class="modal-content" @click.stop>
                <view class="modal-header">
                    <text class="modal-title">充值优惠详情</text>
                    <text class="modal-close" @click="hidePromoDetail">✕</text>
                </view>
                <scroll-view class="modal-body" scroll-y>
                    <text class="detail-content">{{ promoDetailContent }}</text>
                </scroll-view>
            </view>
        </view>
    </view>
</template>

<script>
import { alipayLeaguerUnifiedOrders, alipayOrderResultQuery } from '../../api/pay';
import { getStyleContent } from '../../api/style';

export default {
    data() {
        return {
            rechargeAmount: "200", // 默认金额改为字符串200
            pollingTimer: null, // 轮询定时器
            isPaymentProcessing: false, // 防止重复支付
            currentTradeNo: null, // 当前订单号
            currentOutTradeNo: null, // 当前订单号
            paymentStatus: null, // 支付状态提示 { type: 'success|error|warning', message: '提示信息' }
            quickAmounts: [ // 快捷金额选项
                { value: 50, special: false },
                { value: 100, special: false },
                { value: 200, special: true },
                { value: 300, special: true },
                { value: 600, special: true },
                { value: 1000, special: true }
            ],
            inputCustomStyle: { // uv-input自定义样式
                padding: '32rpx 96rpx 32rpx 96rpx',
                fontSize: '36rpx',
                fontWeight: '500',
                backgroundColor: 'transparent',
                height: '150rpx'
            },
            buttonCustomStyle: { // uv-button自定义样式
                width: '100%',
                height: '96rpx',
                borderRadius: '24rpx',
                fontSize: '36rpx',
                fontWeight: 'bold'
            },
            // 优惠活动相关数据
            promoText: '', // 优惠活动简介文本
            promoDetailContent: '', // 优惠活动详细内容
            showDetailModal: false, // 是否显示详情弹窗
            showStationList: false, // 是否展开站点列表
            stationList: [ // 适用站点列表
                '超易充石龙祥龙路充电站',
                '超易充石龙广源路公共充电站',
                '超易充石龙莞惠枢纽充电站', 
                '超易充高埗政府广场充电站',
                '超易充高埗文化广场充电站',
                '超易充高埗江滨广场充电站',
                '超易充石龙西湖客运站充电站',
                '超易充望牛墩望洪酒店充电站',
                '超易充企石公交枢纽站',
                '超易充常平镇常黄路充电站',
                '超易充万江牌楼基充电站',
                '超易充东城温塘光烨充电站',
                '超易充常平东莞东火车站光烨充电站',
                '超易充高埗汽车北站光烨充电站',
                '超易充黄江实验小学光烨充电站',
                '超易充南城宏图路福地光烨超充站',
                '超易充南城宏图路福地光烨充电站',
                '超易充中堂坤鑫光烨充电站',
                '超易充企石滨江公园光烨充电站',
                '超易充企石森林公园光烨充电站',
                '超易充清溪大利光烨充电站',
                '超易充清溪大绿地光烨充电站',
                '超易充清溪金龙阳光城光烨充电站',
                '超易充塘厦华维大厦光烨充电站',
                '超易充东能横沥职教城充电站',
                '超易充道滘燿盈广场超充站',
                '超易充厚街环冈奥通充电站'
            ],
            // 充值奖励映射
            rewardMapping: {
                200: {
                    title: '价值20元券包',
                    description: '(10元券*1张+5元券*2张，券有效期30天，可在参与充值优惠活动的站点抵扣使用；充值送券后不可退款，请根据充电情况适量充值。)'
                },
                300: {
                    title: '价值25元券包',
                    description: '(10元券*1张+5元券*3张，券有效期45天，可在参与充值优惠活动的站点抵扣使用；充值送券后不可退款，请根据充电情况适量充值。)'
                },
                600: {
                    title: '价值55元券包',
                    description: '(10元券*3张+5元券*5张，券有效期60天，可在参与充值优惠活动的站点抵扣使用；充值送券后不可退款，请根据充电情况适量充值。)'
                },
                1000: {
                    title: '价值120元券包',
                    description: '(10元券*6张+5元券*12张，券有效期90天，可在参与充值优惠活动的站点抵扣使用；充值送券后不可退款，请根据充电情况适量充值。)'
                }
            }
        }
    },
    computed: {
        // 确保充值金额为数字类型
        numericRechargeAmount() {
            return Number(this.rechargeAmount) || 0;
        },
        // 获取当前金额对应的奖励信息
        currentReward() {
            const amount = this.numericRechargeAmount;
            return this.rewardMapping[amount] || {
                title: '价值20元券包',
                description: '(10元券*1张+5元券*2张，券有效期30天，可在参与充值优惠活动的站点抵扣使用；充值送券后不可退款，请根据充电情况适量充值。)'
            };
        },
        // 是否有奖励（只有特定金额才有奖励）
        hasReward() {
            return this.rewardMapping.hasOwnProperty(this.numericRechargeAmount);
        }
    },
    onLoad() {
        // 页面加载时获取优惠活动内容
        this.loadPromoContent();
    },
    beforeDestroy() {
        // 页面销毁时清除定时器
        this.clearPollingTimer();
    },
    methods: {
        /**
         * 发起充值支付
         */
        async recharge() {
            // 输入验证
            const amount = Number(this.rechargeAmount);
            if (amount <= 0) {
                uni.showToast({
                    title: '请输入有效的充值金额',
                    icon: 'none'
                });
                return;
            }

            if (amount > 10000) {
                uni.showToast({
                    title: '单次充值金额不能超过10000元',
                    icon: 'none'
                });
                return;
            }

            if (this.isPaymentProcessing) {
                this.showPaymentStatus('warning', '支付正在处理中，请勿重复操作');
                return;
            }

            try {
                this.isPaymentProcessing = true;
                this.paymentStatus = null; // 清除之前的状态
                uni.showLoading({ title: '正在创建订单...' });

                console.log('发起充值，金额：', amount);
                
                // 调用后端统一下单接口
                const orderRes = await alipayLeaguerUnifiedOrders({
                    totalFee: (Number(amount) * 100).toFixed(0).toString(),
                    openId: uni.getStorageSync('openId'),
                    subject: '账户充值', // 订单标题
                    body: `充值金额：${amount}元` // 订单描述
                });

                console.log('统一下单结果：', orderRes);
                uni.hideLoading();

                if (orderRes.code === 0 && orderRes.data) {
                    // 保存订单号用于后续查询
                    this.currentTradeNo = orderRes.data.tradeNo;
                    this.currentOutTradeNo = orderRes.data.outTradeNo;
                    
                    // 调用支付宝支付接口
                    await this.callAlipayPayment(orderRes.data);
                } else {
                    throw new Error(orderRes.msg || '创建订单失败');
                }
            } catch (error) {
                console.error('充值失败：', error);
                uni.hideLoading();
                if (error.resultCode === '6001') {
                    this.showPaymentStatus('warning', '支付已取消，如需充值请重新操作');
                } else {
                    this.showPaymentStatus('error', error.message || '充值失败，请重试');
                }
                this.isPaymentProcessing = false;
            }
        },

        /**
         * 调用支付宝支付接口
         * @param {Object} orderData 订单数据，包含orderStr或相关支付参数
         */
        callAlipayPayment(orderData) {
            return new Promise((resolve, reject) => {
                // 根据平台选择不同的支付方式
                // #ifdef MP-ALIPAY
                // 支付宝小程序使用 my.tradePay
                my.tradePay({
                    tradeNO: orderData.tradeNo, // 后端返回的支付参数字符串
                    success: (res) => {
                        console.log('支付宝支付调用成功：', res);
                        // 注意：这里的success只是表示调起支付成功，不是支付成功
                        // 真正的支付结果需要通过轮询查询接口获取
                        if (res.resultCode === '6001') {
                            this.onPaymentCancelled(res);
                            reject(res);
                        } else if (res.resultCode === '9000') {
                            this.startPaymentPolling();
                            resolve(res);
                        }
                    },
                    fail: (err) => {
                        console.error('支付宝支付调用失败：', err);
                        uni.showToast({
                            title: '支付调用失败',
                            icon: 'none'
                        });
                        reject(err);
                    }
                });
                // #endif

                // #ifdef APP-PLUS
                // APP使用 uni.requestPayment
                uni.requestPayment({
                    provider: 'alipay',
                    orderInfo: orderData.tradeNo, // 服务器返回的订单信息字符串
                    success: (res) => {
                        console.log('APP支付宝支付成功：', res);
                        this.startPaymentPolling();
                        resolve(res);
                    },
                    fail: (err) => {
                        console.error('APP支付宝支付失败：', err);
                        uni.showToast({
                            title: '支付失败',
                            icon: 'none'
                        });
                        reject(err);
                    }
                });
                // #endif

                // #ifndef MP-ALIPAY || APP-PLUS
                // 其他平台的处理
                uni.showToast({
                    title: '当前平台暂不支持支付宝支付',
                    icon: 'none'
                });
                reject(new Error('当前平台不支持支付宝支付'));
                // #endif
            });
        },

        /**
         * 开始支付结果轮询
         */
        startPaymentPolling() {
            if (!this.currentTradeNo) {
                console.error('订单号为空，无法开始轮询');
                return;
            }

            uni.showLoading({ title: '支付处理中...' });
            
            // 清除之前的定时器
            this.clearPollingTimer();
            
            // 立即查询一次
            this.queryPaymentResult();
            
            // 每3秒轮询一次，最多轮询20次（1分钟）
            let pollCount = 0;
            const maxPollCount = 20;
            
            this.pollingTimer = setInterval(() => {
                pollCount++;
                if (pollCount >= maxPollCount) {
                    this.clearPollingTimer();
                    uni.hideLoading();
                    uni.showToast({
                        title: '支付超时，请稍后查看账户余额',
                        icon: 'none'
                    });
                    return;
                }
                
                this.queryPaymentResult();
            }, 3000);
        },

        /**
         * 查询支付结果
         */
        async queryPaymentResult() {
            try {
                const queryRes = await alipayOrderResultQuery({
                    orderNo: this.currentOutTradeNo
                });

                console.log('支付结果查询：', queryRes);

                if (queryRes.code === 0 && queryRes.data) {
                    // 支付成功
                    this.clearPollingTimer();
                    uni.hideLoading();
                    
                    uni.showToast({
                        title: '充值成功！',
                        icon: 'success'
                    });
                    
                    this.onPaymentSuccess(queryRes.data);
                        
                } else {
                    this.clearPollingTimer();
                    uni.hideLoading();
                    uni.showToast({
                        title: '充值失败！',
                        icon: 'error'
                    });
                    this.onPaymentFailed(queryRes.data);
                }
            } catch (error) {
                console.error('查询支付结果失败：', error);
                // 查询失败不中断轮询，继续等待下次查询
            }
        },

        /**
         * 支付成功处理
         * @param {Object} paymentData 支付成功数据
         */
        onPaymentSuccess(paymentData) {
            console.log('支付成功，支付数据：', paymentData);
            
            this.showPaymentStatus('success', `充值成功！已到账 ${this.rechargeAmount} 元`);
            
            // 发送事件通知父组件或全局
            uni.$emit('rechargeSuccess', {
                orderNo: this.currentOutTradeNo,
                amount: this.rechargeAmount,
                paymentData: paymentData
            });
            
            // 重置表单
            setTimeout(() => {
                this.resetPaymentForm();
            }, 2000);
            
            // 可以选择跳转到充值成功页面
            // uni.navigateTo({
            //     url: '/pages/recharge/success?orderNo=' + this.currentOrderNo
            // });
        },

        /**
         * 支付失败处理
         * @param {Object} paymentData 支付失败数据
         */
        onPaymentFailed(paymentData) {
            console.log('支付失败，支付数据：', paymentData);
            
            const failReason = paymentData.failReason || '支付失败';
            this.showPaymentStatus('error', `${failReason}，请重试或联系客服`);
            
            // 发送事件通知
            uni.$emit('rechargeFailed', {
                orderNo: this.currentOutTradeNo,
                amount: this.rechargeAmount,
                paymentData: paymentData
            });
            
            this.isPaymentProcessing = false;
        },

        /**
         * 支付取消处理
         * @param {Object} paymentData 支付取消数据
         */
        onPaymentCancelled(paymentData) {
            console.log('支付取消，支付数据：', paymentData);
            
            this.showPaymentStatus('warning', '支付已取消，如需充值请重新操作');
            
            // 发送事件通知
            uni.$emit('rechargeCancelled', {
                orderNo: this.currentOutTradeNo,
                amount: this.rechargeAmount,
                paymentData: paymentData
            });
            
            this.isPaymentProcessing = false;
        },

        /**
         * 显示支付状态
         * @param {String} type 状态类型：success、error、warning
         * @param {String} message 状态消息
         */
        showPaymentStatus(type, message) {
            this.paymentStatus = { type, message };
            
            // 3秒后自动清除状态提示（除了成功状态）
            if (type !== 'success') {
                setTimeout(() => {
                    this.paymentStatus = null;
                }, 3000);
            }
        },

        /**
         * 重置支付表单
         */
        resetPaymentForm() {
            this.currentOutTradeNo = null;
            this.isPaymentProcessing = false;
            this.paymentStatus = null;
            this.clearPollingTimer();
        },

        /**
         * 清除轮询定时器
         */
        clearPollingTimer() {
            if (this.pollingTimer) {
                clearInterval(this.pollingTimer);
                this.pollingTimer = null;
            }
        },

        /**
         * 选择快捷金额
         * @param {Number} amount 金额
         */
        selectAmount(amount) {
            if (!this.isPaymentProcessing) {
                this.rechargeAmount = String(amount);
            }
        },

        /**
         * 清空金额输入
         */
        clearAmount() {
            if (!this.isPaymentProcessing) {
                this.rechargeAmount = "";
            }
        },

        /**
         * 金额输入完成事件
         * @param {String|Number} value 输入的值
         */
        onAmountChange(value) {
            // 可以转成数字
            this.rechargeAmount = Number(value);
            // this.rechargeAmount = value;
        },

        /**
         * 加载优惠活动内容
         */
        async loadPromoContent() {
            try {
                const response = await getStyleContent('REFILL_DISCOUNT');
                if (response.code === 0 && response.data) {
                    // 提取简介文本（取第一句或前50个字符）
                    const fullContent = response.data;
                    this.promoDetailContent = fullContent;
                    
                    // 截取简介文本，取第一句话作为简介
                    const firstSentence = fullContent.split('；')[0] + '；';
                    this.promoText = firstSentence.length > 50 ? 
                        firstSentence.substring(0, 50) + '...' : firstSentence;
                }
            } catch (error) {
                console.error('加载优惠活动内容失败：', error);
                // 使用默认文本
                this.promoText = '充值赠券活动赠送优惠券为充电服务...';
            }
        },

        /**
         * 显示优惠详情弹窗
         */
        showPromoDetail() {
            this.showDetailModal = true;
        },

        /**
         * 隐藏优惠详情弹窗
         */
        hidePromoDetail() {
            this.showDetailModal = false;
        },

        /**
         * 切换站点列表展示状态
         */
        toggleStationList() {
            this.showStationList = !this.showStationList;
        }
    }
}
</script>

<style scoped>
.recharge-container {
    padding: 32rpx;
    background-color: #E9F5FF;
    min-height: 100vh;
    font-family: 'PingFang SC', sans-serif;
    padding-bottom: 120rpx; /* 为底部按钮留空间 */
}

/* 充值优惠横幅 */
.promo-banner {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(10px);
    border-radius: 24rpx;
    padding: 24rpx;
    margin-bottom: 48rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.promo-content {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0; /* 允许flex项目收缩 */
}

.promo-tag {
    background: rgba(0, 122, 255, 0.1);
    color: #007AFF;
    font-size: 24rpx;
    font-weight: bold;
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    margin-right: 16rpx;
    flex-shrink: 0; /* 防止标签收缩 */
}

.promo-text {
    color: #1A202C;
    font-size: 28rpx;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    min-width: 0;
}

.promo-action {
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

.promo-link {
    color: #007AFF;
    font-weight: 600;
    font-size: 28rpx;
    margin-right: 8rpx;
}

.chevron-right {
    color: #007AFF;
    font-size: 36rpx;
    font-weight: bold;
}

/* 标题区域 */
.section-title {
    margin-bottom: 32rpx;
}

.title {
    font-size: 36rpx;
    font-weight: 600;
    color: #1A202C;
    display: block;
    margin-bottom: 16rpx;
}

.subtitle {
    font-size: 28rpx;
    color: #4A5568;
    display: block;
}

/* 金额输入框 */
.amount-input-section {
    background: #FFFFFF;
    border-radius: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
    margin-bottom: 48rpx;
    padding: 0;
}

.currency-symbol {
    font-size: 48rpx;
    font-weight: 500;
    color: #1A202C;
    margin-right: 16rpx;
}

/* 快捷金额网格 */
.amount-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32rpx;
    margin-bottom: 64rpx;
}

.amount-card {
    position: relative;
    background: #FFFFFF;
    border-radius: 24rpx;
    padding: 32rpx;
    text-align: center;
    cursor: pointer;
    border: 2rpx solid transparent;
    transition: all 0.2s ease;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.amount-card:hover {
    border-color: #007AFF;
}

.amount-card.selected {
    border-color: #007AFF;
    box-shadow: 0 8rpx 32rpx rgba(0, 122, 255, 0.2);
}

.amount-card.special {
    position: relative;
}

.special-tag {
    position: absolute;
    top: 0;
    left: 0;
    background: rgba(0, 122, 255, 0.1);
    color: #007AFF;
    font-size: 24rpx;
    font-weight: 600;
    padding: 8rpx 16rpx;
    border-top-left-radius: 24rpx;
    border-bottom-right-radius: 24rpx;
}

.amount-display {
    display: flex;
    align-items: baseline;
    justify-content: center;
    white-space: nowrap;
}

.amount-value {
    font-size: 48rpx;
    font-weight: bold;
    color: #1A202C;
}

.amount-card.selected .amount-value {
    color: #007AFF;
}

.amount-unit {
    font-size: 32rpx;
    font-weight: normal;
    color: inherit;
    margin-left: 4rpx;
}

.selected-check {
    position: absolute;
    top: -16rpx;
    right: -16rpx;
    background: #007AFF;
    border-radius: 50%;
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.check-icon {
    color: white;
    font-size: 32rpx;
    font-weight: bold;
}

/* 充值奖励 */
.reward-section {
    margin-bottom: 64rpx;
}

.section-header {
    font-size: 36rpx;
    font-weight: 600;
    color: #1A202C;
    display: block;
    margin-bottom: 16rpx;
}

.reward-card {
    background: rgba(0, 122, 255, 0.1);
    border-radius: 24rpx;
    padding: 32rpx;
    font-size: 28rpx;
}

.reward-title {
    display: flex;
    align-items: center;
    font-weight: 600;
    color: #007AFF;
    margin-bottom: 16rpx;
}

.gift-icon {
    margin-right: 16rpx;
    font-size: 32rpx;
}

.reward-text {
    font-size: 32rpx;
}

.reward-desc {
    color: #4A5568;
    line-height: 1.6;
    display: block;
    margin-bottom: 24rpx;
}

.expand-details {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
}

.expand-text {
    color: #007AFF;
    font-weight: 500;
    margin-right: 8rpx;
}

.expand-icon {
    color: #007AFF;
    font-size: 36rpx;
}

/* 支付方式 */
.payment-section {
    margin-bottom: 64rpx;
}

.payment-method {
    background: #FFFFFF;
    border-radius: 24rpx;
    padding: 32rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.payment-info {
    display: flex;
    align-items: center;
}

.payment-logo {
    width: 80rpx;
    height: 80rpx;
    margin-right: 32rpx;
}

.payment-details {
    display: flex;
    flex-direction: column;
}

.payment-name {
    font-weight: 600;
    color: #1A202C;
    font-size: 32rpx;
    margin-bottom: 8rpx;
}

.payment-desc {
    font-size: 28rpx;
    color: #4A5568;
}

.help-btn {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
}

.help-icon {
    color: #4A5568;
    font-size: 32rpx;
}

/* 支付状态提示 */
.payment-status {
    margin-top: 32rpx;
    padding: 24rpx;
    border-radius: 16rpx;
    text-align: center;
}

.status-text {
    font-size: 28rpx;
    font-weight: 500;
}

.status-text.success {
    color: #52c41a;
    background-color: #f6ffed;
    border: 1px solid #b7eb8f;
}

.status-text.error {
    color: #ff4d4f;
    background-color: #fff2f0;
    border: 1px solid #ffccc7;
}

.status-text.warning {
    color: #faad14;
    background-color: #fffbe6;
    border: 1px solid #ffe58f;
}

.payment-status .status-text {
    display: block;
    padding: 20rpx;
    border-radius: 12rpx;
}

/* 站点列表 */
.station-list {
    margin-top: 24rpx;
    padding: 16rpx;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 12rpx;
    border: 1rpx solid rgba(0, 122, 255, 0.2);
}

.station-item {
    display: block;
    font-size: 26rpx;
    color: #4A5568;
    line-height: 1.5;
    margin-bottom: 8rpx;
    padding: 8rpx 0;
    border-bottom: 1rpx solid rgba(0, 122, 255, 0.1);
}

.station-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

/* 详情弹窗 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.modal-content {
    background: white;
    border-radius: 24rpx;
    width: 90%;
    max-width: 600rpx;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx;
    border-bottom: 1rpx solid #E2E8F0;
}

.modal-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #1A202C;
}

.modal-close {
    font-size: 36rpx;
    color: #4A5568;
    cursor: pointer;
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-body {
    padding: 32rpx;
    max-height: 60vh;
}

.detail-content {
    font-size: 28rpx;
    color: #4A5568;
    line-height: 1.6;
    white-space: pre-line;
}

/* 底部支付按钮 */
.bottom-payment {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 32rpx;
    background: rgba(233, 245, 255, 0.8);
    backdrop-filter: blur(10px);
    border-top: 1rpx solid #E2E8F0;
}
</style>
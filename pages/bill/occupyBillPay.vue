<template>
  <view class="page-container" :class="{ 'no-payment-btn': !showPaymentButton }">
    <uv-navbar :border="false" title="占位订单详情" :autoBack="false" placeholder safeAreaInsetTop @leftClick="handleNavBack"></uv-navbar>
    <!-- 头部金额显示 -->
    <!-- <view class="amount-header">
      <view class="amount-display">
        <text class="amount-value">¥{{ formatFee }}</text>
        <view class="status-badge" :class="statusBadgeClass">{{ statusText }}</view>
      </view>
    </view> -->

    <!-- 主要内容区域 -->
    <view class="content-container">
      <!-- 充电站信息卡片 -->
      <view class="station-card">
        <view class="station-info">
          <view class="station-icon">
            <uv-icon name="map-fill" size="30" color="#4F9EFB"></uv-icon>
          </view>
          <view class="station-details">
            <text class="station-name">{{ billData?.stationName || '--' }}</text>
            <text class="station-gun">{{ billData?.pileName || '' }}-{{ billData?.gunName || '--' }}</text>
          </view>
        </view>
      </view>

      <!-- 统计信息卡片 -->
      <view class="stats-card">
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-value">{{ totalDuration }}</text>
            <text class="stat-unit">分钟</text>
            <text class="stat-label">总占位时长</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ freeDuration }}</text>
            <text class="stat-unit">分钟</text>
            <text class="stat-label">限时免费时长</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ overTimeDuration }}</text>
            <text class="stat-unit">分钟</text>
            <text class="stat-label">超时占位时长</text>
          </view>
        </view>
      </view>

      <!-- 订单详情卡片 -->
      <view class="order-details-card">
        <view class="detail-item">
          <text class="detail-label">占位订单编号</text>
          <view class="detail-value">
            <text>{{ billData?.busId || '--' }}</text>
            <text class="copy-btn" @click="copyOrderNo">复制</text>
          </view>
        </view>
        <view class="detail-item">
          <text class="detail-label">占位开始时间</text>
          <text class="detail-value">{{ formatTime(billData?.timeS) }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">占位结束时间</text>
          <text class="detail-value">{{ formatTime(billData?.timeE) }}</text>
        </view>
      </view>

      <!-- 计费规则卡片 -->
      <view class="billing-rules-card">
        <view class="rules-header" @click="toggleRules">
          <text class="rules-title">计费规则</text>
          <view class="rules-toggle">
            <text class="rules-type">按时段计费</text>
            <text class="expand-icon" :class="{ 'expanded': rulesExpanded }">▼</text>
          </view>
        </view>
        <view class="rules-content" v-if="rulesExpanded">
          <view class="rules-detail">
            <text class="rules-text">{{ billingDetail }}</text>
          </view>
        </view>
      </view>

      <!-- 费用汇总卡片 -->
      <view class="fee-summary-card">
        <view class="fee-item">
          <text class="fee-label">超时占位费用</text>
          <view style="display: flex; flex-direction: row; align-items: center; gap: 10rpx; justify-content: center;">
            <view class="status-badge" :class="statusBadgeClass">{{ statusText }}</view>
            <text class="fee-amount">¥{{ formatFee }}</text>
          </view>
        </view>
      </view>


      <!-- 费用疑问 -->
      <view class="question-section">
        <view class="question-btn" @click="showQuestion">
          <uv-icon name="kefu-ermai" size="16" color="#999"></uv-icon>
          <text class="question-text">费用有疑问</text>
        </view>
      </view>
    </view>

    <!-- 固定底部支付按钮 -->
    <view class="bottom-payment" v-if="showPaymentButton">
      <view class="payment-container">
        <button class="payment-btn" @click="handlePayment">立即支付</button>
      </view>
    </view>
  </view>
</template>

<script>
import {getOccupyBillById} from '@/api/bill.js';
import {getStyleConfig} from '@/api/style.js';
// #ifdef MP-ALIPAY
import {
  alipayDisposableUnifiedOrders,
  alipayDisposableOrderResultQuery,
  alipayDisposableCancelRecharge
} from '@/api/pay.js';
// #endif

// #ifdef MP-WEIXIN
import {
  wechatDisposableUnifiedOrders,
  wechatDisposableOrderResultQuery,
  wechatDisposableCancelRecharge
} from '@/api/pay.js';
// #endif

import { handleNavBack } from '@/utils/utils';
import globalData from '@/globalData';

export default {
  data() {
    return {
      billId: null,
      billData: null,
      loading: true,
      rulesExpanded: false, // 计费规则展开状态
      // 支付相关状态（支持支付宝和微信）
      paymentOrderInfo: {
        orderNo: '', // 订单号
        isProcessing: false, // 是否正在处理中
        pollTimer: null, // 轮询定时器
        pollCount: 0 // 轮询次数
      }
    };
  },

  computed: {
    // 总占位时长
    totalDuration() {
      return this.billData?.duration || '0';
    },

    // 超时占位时长
    overTimeDuration() {
      return this.billData?.actualDuration || '0';
    },

    // 免费时长
    freeDuration() {
      return this.billData?.freeDuration || '0';
    },

    // 格式化费用
    formatFee() {
      if (!this.billData?.busBalance) return '0.00';
      return (this.billData.busBalance / 100).toFixed(2);
    },

    // 计费详情
    billingDetail() {
      if (!this.billData?.occupyCostModelDTO?.occupyPhraseRules?.length) {
        return '计费信息异常，请联系客服处理';
      }

      const rule = this.billData.occupyCostModelDTO.occupyPhraseRules[0];
      const price = (rule.price / 100).toFixed(2);
      const limitAmount = this.billData.occupyCostModelDTO.limitAmount ?
          (this.billData.occupyCostModelDTO.limitAmount / 100).toFixed(2) : '--';

      return `00:00~23:59, ${price}元/分钟;\n(单次封顶${limitAmount}元)`;
    },

    // 支付状态文本
    statusText() {
      if (!this.billData?.billStatus) return '待支付';

      switch (this.billData.billStatus) {
        case 11:
          return '待支付';
        case 14:
          return '已支付';
        default:
          return '待支付';
      }
    },

    // 状态徽章样式类
    statusBadgeClass() {
      if (!this.billData?.billStatus) return 'status-unpaid';

      switch (this.billData.billStatus) {
        case 11:
          return 'status-unpaid';
        case 14:
          return 'status-paid';
        default:
          return 'status-unpaid';
      }
    },

    // 是否显示支付按钮
    showPaymentButton() {
      return this.billData?.billStatus === 11;
    },

    // 付款时间
    paymentTime() {
      if (this.billData?.billStatus === 14 && this.billData?.payTime) {
        return this.billData.payTime;
      }
      return '-';
    },

    // 实付金额
    actualAmount() {
      if (this.billData?.billStatus === 14 && this.billData?.actualBalance) {
        return `¥ ${(this.billData.actualBalance / 100).toFixed(2)}`;
      }
      return '-';
    }
  },
  onShareAppMessage() {
    return {
      title: this.getWxAppName(),
      path: '/pages/index/index'
    }
  },
  onShareTimeline() {
    return {
      title: this.getWxAppName(),
      path: '/pages/index/index'
    }
  },
  onLoad(options) {
    if (options.id) {
      this.billId = options.id;
      this.loadBillData();
    } else {
      uni.showToast({
        title: '缺少订单ID参数',
        icon: 'error'
      });
    }
  },


  onUnload() {
    // 页面卸载时清理定时器
    this.clearPaymentPolling();
  },

  methods: {
    handleNavBack,
    getWxAppName() {
      return globalData.wxAppName;
    },
    // 加载账单数据
    async loadBillData() {
      try {
        uni.showLoading({title: '加载中...'});

        const response = await getOccupyBillById(this.billId);

        if (response && response.code === 0) {
          this.billData = response.data;
          console.log('账单数据:', this.billData);
          console.log('账单状态:', this.billData.billStatus);
          console.log('是否显示支付按钮:', this.showPaymentButton);
        } else {
          uni.showToast({
            title: '加载账单失败',
            icon: 'error'
          });
        }
      } catch (error) {
        console.error('加载账单失败:', error);
        uni.showToast({
          title: '网络错误',
          icon: 'error'
        });
      } finally {
        uni.hideLoading();
        this.loading = false;
      }
    },

    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return '--';
      return timeStr;
    },

    // 返回上一页
    goBack() {
      uni.navigateBack();
    },

    // 复制订单号
    copyOrderNo() {
      const orderNo = this.billData?.busId || '--';
      uni.setClipboardData({
        data: orderNo,
        success: () => {
          uni.showToast({
            title: '订单号已复制',
            icon: 'success'
          });
        }
      });
    },

    // 显示费用疑问
    async showQuestion() {

      const res = await getStyleConfig()
      if (res.code !== 0) {
        uni.showToast({
          title: res.msg || '获取客服信息失败',
          icon: 'none'
        });
        return;
      }
      const telephone = res.data.telephone || '4006331838';
      uni.showModal({
        title: '费用疑问',
        content: '如果您对费用有疑问，请联系客服处理',
        confirmText: '拨打电话',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 这里可以添加联系客服的逻辑
            uni.makePhoneCall({
              phoneNumber: telephone
            });
          }
        },
        fail: (err) => {
          console.log('显示费用疑问失败:', err);
        }
      });
    },

    // 处理支付
    handlePayment() {
      uni.showModal({
        title: '确认支付',
        content: `确认支付超时占位费用 ¥${this.formatFee} 吗？`,
        confirmText: '确认支付',
        success: (res) => {
          if (res.confirm) {
            // 根据平台调用对应的支付流程
            // #ifdef MP-ALIPAY
            this.handleAlipayPayment();
            // #endif
            // #ifdef MP-WEIXIN
            this.handleWechatPayment();
            // #endif
          }
        }
      });
    },

    // 处理支付宝支付
    async handleAlipayPayment() {
      try {
        // 防止重复提交
        if (this.paymentOrderInfo.isProcessing) {
          uni.showToast({title: '正在处理中，请稍候...', icon: 'none'});
          return;
        }

        this.paymentOrderInfo.isProcessing = true;
        uni.showLoading({title: '正在生成支付参数...'});

        // 第1步：支付宝统一下单
        console.log('开始支付宝支付流程 - 统一下单');
        const unifiedOrderRes = await alipayDisposableUnifiedOrders({
          totalFee: parseFloat(this.billData.busBalance), // 费用单位为分
          orderBalance: parseFloat(this.billData.busBalance),
          openId: uni.getStorageSync('openId'),
          occupydBillId: this.billData.id
        });

        if (unifiedOrderRes.code !== 0) {
          throw new Error(unifiedOrderRes.msg || '生成支付参数失败');
        }

        uni.hideLoading();
        console.log('支付参数生成成功，准备调起支付宝支付', unifiedOrderRes.data);
        this.paymentOrderInfo.orderNo = unifiedOrderRes.data.outTradeNo;

        // 第2步：调起支付宝支付
        await this.invokePayment(unifiedOrderRes.data.tradeNo);

      } catch (error) {
        console.error('支付宝支付流程失败:', error);
        setTimeout(() => {
          uni.hideLoading();
        }, 1000);
        uni.showToast({title: error.message || '支付失败', icon: 'none'});

        // 发生错误时取消订单
        if (this.paymentOrderInfo.orderNo) {
          this.cancelPaymentOrder('支付流程异常');
        }
      } finally {
        this.paymentOrderInfo.isProcessing = false;
        setTimeout(() => {
          uni.hideLoading();
        }, 1000);
      }
    },

    // 处理微信支付
    async handleWechatPayment() {
      try {
        // 防止重复提交
        if (this.paymentOrderInfo.isProcessing) {
          uni.showToast({title: '正在处理中，请稍候...', icon: 'none'});
          return;
        }

        this.paymentOrderInfo.isProcessing = true;
        uni.showLoading({title: '正在生成支付参数...'});

        // 第1步：微信统一下单
        console.log('开始微信支付流程 - 统一下单');
        const unifiedOrderRes = await wechatDisposableUnifiedOrders({
          totalFee: parseFloat(this.billData.busBalance), // 费用单位为分
          orderBalance: parseFloat(this.billData.busBalance),
          openId: uni.getStorageSync('openId'),
          occupydBillId: this.billData.id,
          tradeType: "JSAPI"
        });

        if (unifiedOrderRes.code !== 0) {
          throw new Error(unifiedOrderRes.msg || '生成支付参数失败');
        }

        uni.hideLoading();
        console.log('支付参数生成成功，准备调起微信支付', unifiedOrderRes.data);
        this.paymentOrderInfo.orderNo = unifiedOrderRes.data.outTradeNo;

        // 第2步：调起微信支付
        await this.invokePayment(unifiedOrderRes.data);

      } catch (error) {
        console.error('微信支付流程失败:', error);
        setTimeout(() => {
          uni.hideLoading();
        }, 1000);
        uni.showToast({title: error.message || '支付失败', icon: 'none'});

        // 发生错误时取消订单
        if (this.paymentOrderInfo.orderNo) {
          this.cancelPaymentOrder('支付流程异常');
        }
      } finally {
        this.paymentOrderInfo.isProcessing = false;
        setTimeout(() => {
          uni.hideLoading();
        }, 1000);
      }
    },

    // 调起支付（支持支付宝和微信）
    async invokePayment(paymentParams) {
      return new Promise((resolve, reject) => {
        // #ifdef MP-ALIPAY
        // 支付宝小程序使用 my.tradePay
        my.tradePay({
          tradeNO: paymentParams, // 支付宝：后端返回的支付参数字符串（tradeNo）
          success: (res) => {
            console.log('支付宝支付调用成功：', res);
            // 注意：这里的success只是表示调起支付成功，不是支付成功
            // 真正的支付结果需要通过轮询查询接口获取
            if (res.resultCode === '6001') {
              uni.showToast({
                title: '支付已取消',
                icon: 'none'
              });
              reject(res);
            } else if (res.resultCode === '9000') {
              this.startPaymentResultPolling();
              uni.showToast({
                title: '支付成功，请勿离开页面，等待处理结果',
                icon: 'success'
              });
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

        // #ifdef MP-WEIXIN
        // 微信小程序使用 wx.requestPayment
        uni.requestPayment({
          provider: "wxpay",
          timeStamp: paymentParams.timeStamp,
          nonceStr: paymentParams.nonceStr,
          package: paymentParams.package,
          signType: paymentParams.signType || 'RSA',
          paySign: paymentParams.sign,
          success: (res) => {
            console.log('微信支付调用成功：', res);
            // 微信支付成功后需要轮询查询结果
            // this.startPaymentResultPolling();
            uni.showToast({
              title: '支付成功',
              icon: 'success'
            });
            this.loadBillData();
            resolve(res);
          },
          fail: (err) => {
            console.error('微信支付调用失败：', err);
            if (err.errMsg === 'requestPayment:fail cancel') {
              uni.showToast({
                title: '支付已取消',
                icon: 'none'
              });
            } else {
              uni.showToast({
                title: '支付调用失败',
                icon: 'none'
              });
            }
            reject(err);
          }
        });
        // #endif
      });
    },

    // 开始轮询支付结果
    startPaymentResultPolling() {
      this.paymentOrderInfo.pollCount = 0;

      const pollInterval = 3000; // 3秒轮询一次
      const maxPollCount = 20; // 最多轮询20次（60秒）

      this.paymentOrderInfo.pollTimer = setInterval(async () => {
        this.paymentOrderInfo.pollCount++;
        console.log(`第${this.paymentOrderInfo.pollCount}次查询支付结果`);

        try {
          console.log('订单号:', this.paymentOrderInfo.orderNo);

          let queryRes;
          // #ifdef MP-ALIPAY
          queryRes = await alipayDisposableOrderResultQuery({
            orderNo: this.paymentOrderInfo.orderNo
          });
          // #endif

          // #ifdef MP-WEIXIN
          queryRes = await wechatDisposableOrderResultQuery({
            orderNo: this.paymentOrderInfo.orderNo
          });
          // #endif

          if (queryRes.code === 0) {
            // 支付成功，清除轮询并刷新页面
            this.clearPaymentPolling();
            console.log('支付成功，准备刷新页面');
            uni.showToast({
              title: '支付成功',
              icon: 'success'
            });
            // 重新加载账单数据
            await this.loadBillData();

          } else if (this.paymentOrderInfo.pollCount >= maxPollCount) {
            // 轮询超时，取消订单
            this.clearPaymentPolling();
            uni.showToast({title: '支付结果查询超时，订单已取消', icon: 'none'});
            this.cancelPaymentOrder('支付结果查询超时');
          }
          // 其他情况继续轮询

        } catch (error) {
          console.error('查询支付结果失败:', error);
          if (this.paymentOrderInfo.pollCount >= maxPollCount) {
            this.clearPaymentPolling();
            this.cancelPaymentOrder('查询支付结果异常');
          }
        }
      }, pollInterval);
    },

    // 取消支付订单（支持支付宝和微信）
    async cancelPaymentOrder(reason = '用户取消') {
      if (!this.paymentOrderInfo.orderNo) return;

      try {
        console.log(`正在取消订单: ${this.paymentOrderInfo.orderNo}, 原因: ${reason}`);

        let cancelRes;
        // #ifdef MP-ALIPAY
        cancelRes = await alipayDisposableCancelRecharge({
          orderNo: this.paymentOrderInfo.orderNo,
          cancelReason: reason
        });
        // #endif

        // #ifdef MP-WEIXIN
        cancelRes = await wechatDisposableCancelRecharge({
          orderNo: this.paymentOrderInfo.orderNo,
          cancelReason: reason
        });
        // #endif

        if (cancelRes.code === 0) {
          console.log('订单取消成功');
          uni.showToast({title: '订单已取消，款项将原路退回', icon: 'none'});
        } else {
          console.error('订单取消失败:', cancelRes.msg);
        }
      } catch (error) {
        console.error('取消订单请求失败:', error);
      } finally {
        // 清理订单信息
        this.paymentOrderInfo.orderNo = '';
      }
    },

    // 清理支付结果轮询
    clearPaymentPolling() {
      if (this.paymentOrderInfo.pollTimer) {
        clearInterval(this.paymentOrderInfo.pollTimer);
        this.paymentOrderInfo.pollTimer = null;
        console.log('支付结果轮询已清理');
      }
    },

    // 切换计费规则展开状态
    toggleRules() {
      this.rulesExpanded = !this.rulesExpanded;
    }
  }
};
</script>

<style lang="less" scoped>
/* 页面容器 */
.page-container {
  min-height: 100vh;
  background-color: #f6f7f8;
  padding-bottom: 120rpx;

  &.no-payment-btn {
    padding-bottom: 40rpx;
  }
}

/* 头部金额显示 */
.amount-header {
  padding: 64rpx 32rpx 32rpx;
  text-align: center;
  background-color: #f6f7f8;
}

.amount-display {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.amount-value {
  font-size: 86rpx;
  font-weight: bold;
  color: #1C1C1E;
  line-height: 1.2;
  margin-bottom: 16rpx;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8rpx 24rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 500;

  &.status-unpaid {
    background-color: #fed7aa;
    color: #ea580c;
  }

  &.status-paid {
    background-color: #d1fae5;
    color: #059669;
  }
}

/* 内容容器 */
.content-container {
  padding: 0 32rpx;
}

/* 充电站信息卡片 */
.station-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 32rpx;
  margin-top: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.station-info {
  display: flex;
  align-items: flex-start;
  gap: 32rpx;
}

.station-icon {
  width: 80rpx;
  height: 80rpx;
  background-color: rgba(0, 122, 255, 0.1);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .iconfont {
    font-size: 40rpx;
    color: #007AFF;
  }
}

.station-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.station-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #1C1C1E;
  line-height: 1.4;
}

.station-gun {
  font-size: 28rpx;
  color: #8E8E93;
  line-height: 1.4;
}

/* 统计信息卡片 */
.stats-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0;
  text-align: center;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 33.333%;
    top: 0;
    bottom: 0;
    width: 2rpx;
    background-color: #e5e7eb;
  }

  &::after {
    content: '';
    position: absolute;
    left: 66.666%;
    top: 0;
    bottom: 0;
    width: 2rpx;
    background-color: #e5e7eb;
  }
}

.stat-item {
  padding: 0 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 600;
  color: #1C1C1E;
  line-height: 1.2;
  margin-bottom: 8rpx;
}

.stat-unit {
  font-size: 24rpx;
  font-weight: normal;
  color: #1C1C1E;
}

.stat-label {
  font-size: 24rpx;
  color: #8E8E93;
  margin-top: 8rpx;
  line-height: 1.4;
}

/* 订单详情卡片 */
.order-details-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
  font-size: 32rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.detail-label {
  color: #8E8E93;
  flex-shrink: 0;
}

.detail-value {
  color: #1C1C1E;
  font-weight: 500;
  text-align: right;
  flex: 1;
  margin-left: 32rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16rpx;
}

.copy-btn {
  color: #007AFF;
  font-weight: 600;
  font-size: 28rpx;
}

/* 计费规则卡片 */
.billing-rules-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.rules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  list-style: none;
}

.rules-title {
  color: #8E8E93;
  font-size: 32rpx;
}

.rules-toggle {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.rules-type {
  color: #1C1C1E;
  font-size: 32rpx;
  font-weight: 500;
}

.expand-icon {
  color: #8E8E93;
  font-size: 24rpx;
  transition: transform 0.3s ease;

  &.expanded {
    transform: rotate(180deg);
  }
}

.rules-content {
  margin-top: 32rpx;
  padding-top: 32rpx;
  border-top: 2rpx solid #e5e7eb;
}

.rules-detail {
  .rules-text {
    color: #8E8E93;
    font-size: 28rpx;
    line-height: 1.5;
    white-space: pre-line;
  }
}

/* 费用汇总卡片 */
.fee-summary-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.fee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fee-label {
  color: #1C1C1E;
  font-size: 32rpx;
  font-weight: 600;
}

.fee-amount {
  color: #1C1C1E;
  font-size: 32rpx;
  font-weight: 600;
}

/* 费用疑问 */
.question-section {
  text-align: center;
  margin-bottom: 48rpx;
}

.question-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #8E8E93;
}

.question-text {
  margin-left: 8rpx;
}

/* 底部支付按钮 */
.bottom-payment {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #f6f7f8;
  padding: 32rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
}

.payment-container {
  max-width: 686rpx;
  margin: 0 auto;
}

.payment-btn {
  width: 100%;
  height: 112rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #007AFF 0%, #60A5FA 100%);
  color: #ffffff;
  font-size: 36rpx;
  font-weight: bold;
  border-radius: 24rpx;
  border: none;
  box-shadow: 0 8rpx 32rpx rgba(0, 122, 255, 0.3);
  transition: all 0.3s ease;

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 4rpx 16rpx rgba(0, 122, 255, 0.3);
  }
}

.primary-color {
  color: #007AFF;
}
</style>


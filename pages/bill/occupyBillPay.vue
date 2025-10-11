<template>
  <view class="page-container" :class="{ 'no-payment-btn': !showPaymentButton }">
    <!-- 头部导航 -->
    <view class="header">
      <view class="sub-title">{{ billData?.pileName || '--' }}-{{ billData?.gunName || '--' }}</view>
    </view>

    <!-- 主要内容区域 -->
    <view class="content-container">
      <!-- 费用统计卡片 -->
      <view class="stats-card">
        <view class="stats-row">
          <view class="stat-item">
            <view class="stat-value">{{ totalDuration }}<text class="stat-unit">分钟</text></view>
            <view class="stat-label">总占位时长</view>
          </view>
          <view class="stat-item">
            <view class="stat-value">{{ overTimeDuration }}<text class="stat-unit">分钟</text></view>
            <view class="stat-label">超时占位时长</view>
          </view>
          <view class="stat-item">
            <view class="stat-value primary-color">{{ formatFee }}<text class="stat-unit">元</text></view>
            <view class="stat-label">超时占位费用</view>
          </view>
        </view>
        
        <view class="divider"></view>
        
        <!-- 详细信息 -->
        <view class="detail-list">
          <view class="detail-item">
            <view class="detail-label">占位订单编号:</view>
            <view class="detail-value">
              <text>{{ billData?.busId || '--' }}</text>
              <text class="copy-btn" @click="copyOrderNo">复制</text>
            </view>
          </view>
          <view class="detail-item">
            <view class="detail-label">占位开始时间:</view>
            <view class="detail-value">{{ formatTime(billData?.timeS) }}</view>
          </view>
          <view class="detail-item">
            <view class="detail-label">占位结束时间:</view>
            <view class="detail-value">{{ formatTime(billData?.timeE) }}</view>
          </view>
          <view class="detail-item">
            <view class="detail-label">总占位时长:</view>
            <view class="detail-value">{{ totalDuration }}分钟</view>
          </view>
          <view class="detail-item">
            <view class="detail-label">限时免费时长:</view>
            <view class="detail-value">{{ freeDuration }}分钟</view>
          </view>
          <view class="detail-item">
            <view class="detail-label">超时占位时长:</view>
            <view class="detail-value">{{ overTimeDuration }}分钟</view>
          </view>
          <view class="detail-item">
            <view class="detail-label">计费规则:</view>
            <view class="detail-value">按时间段计费</view>
          </view>
          <view class="detail-item">
            <view class="detail-label">计费详情:</view>
            <view class="detail-value billing-detail">{{ billingDetail }}</view>
          </view>
        </view>
      </view>

      <!-- 费用说明卡片 -->
      <view class="fee-card">
        <view class="fee-header">
          <view class="fee-title">费用说明</view>
          <view class="status-badge" :class="statusBadgeClass">{{ statusText }}</view>
        </view>
        <view class="fee-list">
          <view class="fee-item">
            <view class="fee-label">超时占位费用</view>
            <view class="fee-amount primary-color">¥ {{ formatFee }}</view>
          </view>
          <view class="fee-item">
            <view class="fee-label">付款时间</view>
            <view class="fee-value">{{ paymentTime }}</view>
          </view>
          <view class="fee-item">
            <view class="fee-label">实付金额</view>
            <view class="fee-value">{{ actualAmount }}</view>
          </view>
        </view>
      </view>

      <!-- 费用疑问 -->
      <view class="question-section">
        <view class="question-btn" @click="showQuestion">
          <uv-icon name="help-circle" size="16" color="#999"></uv-icon>
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
import { getOccupyBillById } from '@/api/bill.js';
import { 
  alipayDisposableUnifiedOrders, 
  alipayDisposableOrderResultQuery, 
  alipayDisposableCancelRecharge 
} from '@/api/pay.js';

export default {
  data() {
    return {
      billId: null,
      billData: null,
      loading: true,
      // 支付宝支付相关状态
      alipayOrderInfo: {
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
      return this.billData?.duration || '--';
    },
    
    // 超时占位时长  
    overTimeDuration() {
      return this.billData?.actualDuration || '--';
    },
    
    // 免费时长
    freeDuration() {
      return this.billData?.freeDuration || '--';
    },
    
    // 格式化费用
    formatFee() {
      if (!this.billData?.busBalance) return '--';
      return (this.billData.busBalance / 100).toFixed(2);
    },
    
    // 计费详情
    billingDetail() {
      if (!this.billData?.occupyCostModelDTO?.occupyPhraseRules?.length) {
        return '00:00~23:59, 0.10元/分钟;\n(单次封顶1.00元)';
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
    // 加载账单数据
    async loadBillData() {
      try {
        uni.showLoading({ title: '加载中...' });
        
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
    showQuestion() {
      uni.showModal({
        title: '费用疑问',
        content: '如果您对费用有疑问，请联系客服处理',
        confirmText: '拨打客服电话',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 这里可以添加联系客服的逻辑
            uni.makePhoneCall({
              phoneNumber: '--'
            });
          }
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
            // 调用支付宝支付流程
            this.handleAlipayPayment();
          }
        }
      });
    },

    // 处理支付宝支付
    async handleAlipayPayment() {
      try {
        // 防止重复提交
        if (this.alipayOrderInfo.isProcessing) {
          uni.showToast({ title: '正在处理中，请稍候...', icon: 'none' });
          return;
        }
        
        this.alipayOrderInfo.isProcessing = true;
        uni.showLoading({ title: '正在生成支付参数...' });
        
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
        this.alipayOrderInfo.orderNo = unifiedOrderRes.data.outTradeNo;
        
        // 第2步：调起支付宝支付
        await this.invokeAlipayment(unifiedOrderRes.data.tradeNo);
        
      } catch (error) {
        console.error('支付宝支付流程失败:', error);
        setTimeout(() => {
          uni.hideLoading();
        }, 1000);
        uni.showToast({ title: error.message || '支付失败', icon: 'none' });
        
        // 发生错误时取消订单
        if (this.alipayOrderInfo.orderNo) {
          this.cancelAlipayOrder('支付流程异常');
        }
      } finally {
        this.alipayOrderInfo.isProcessing = false;
        setTimeout(() => {
          uni.hideLoading();
        }, 1000);
      }
    },

    // 调起支付宝支付
    async invokeAlipayment(orderStr) {
      return new Promise((resolve, reject) => {
        // 根据平台选择不同的支付方式
        // #ifdef MP-ALIPAY
        // 支付宝小程序使用 my.tradePay
        my.tradePay({
            tradeNO: orderStr, // 后端返回的支付参数字符串
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
      });
    },

    // 开始轮询支付结果
    startPaymentResultPolling() {
      this.alipayOrderInfo.pollCount = 0;
      
      const pollInterval = 3000; // 3秒轮询一次
      const maxPollCount = 20; // 最多轮询20次（60秒）
      
      this.alipayOrderInfo.pollTimer = setInterval(async () => {
        this.alipayOrderInfo.pollCount++;
        console.log(`第${this.alipayOrderInfo.pollCount}次查询支付结果`);
        
        try {
          console.log('this.alipayOrderInfo.orderNo', this.alipayOrderInfo.orderNo);
          const queryRes = await alipayDisposableOrderResultQuery({
            orderNo: this.alipayOrderInfo.orderNo
          });
          
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
            
          } else if (this.alipayOrderInfo.pollCount >= maxPollCount) {
            // 轮询超时，取消订单
            this.clearPaymentPolling();
            uni.showToast({ title: '支付结果查询超时，订单已取消', icon: 'none' });
            this.cancelAlipayOrder('支付结果查询超时');
          }
          // 其他情况继续轮询
          
        } catch (error) {
          console.error('查询支付结果失败:', error);
          if (this.alipayOrderInfo.pollCount >= maxPollCount) {
            this.clearPaymentPolling();
            this.cancelAlipayOrder('查询支付结果异常');
          }
        }
      }, pollInterval);
    },

    // 取消支付宝订单
    async cancelAlipayOrder(reason = '用户取消') {
      if (!this.alipayOrderInfo.orderNo) return;
      
      try {
        console.log(`正在取消订单: ${this.alipayOrderInfo.orderNo}, 原因: ${reason}`);
        const cancelRes = await alipayDisposableCancelRecharge({
          orderNo: this.alipayOrderInfo.orderNo,
          cancelReason: reason
        });
        
        if (cancelRes.code === 0) {
          console.log('订单取消成功');
          uni.showToast({ title: '订单已取消，款项将原路退回', icon: 'none' });
        } else {
          console.error('订单取消失败:', cancelRes.msg);
        }
      } catch (error) {
        console.error('取消订单请求失败:', error);
      } finally {
        // 清理订单信息
        this.alipayOrderInfo.orderNo = '';
      }
    },

    // 清理支付结果轮询
    clearPaymentPolling() {
      if (this.alipayOrderInfo.pollTimer) {
        clearInterval(this.alipayOrderInfo.pollTimer);
        this.alipayOrderInfo.pollTimer = null;
        console.log('支付结果轮询已清理');
      }
    }
  }
};
</script>

<style lang="less" scoped>
.page-container {
  min-height: 100vh;
  background-color: #eff6ff;
  padding-bottom: 120rpx;
  
  &.no-payment-btn {
    padding-bottom: 40rpx;
  }
}

/* 头部导航 */
.header {
  background-color: #eff6ff;
  padding: 20rpx 32rpx;
  padding-top: calc(20rpx + env(safe-area-inset-top));
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
}

.nav-back {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: 600;
  color: #1f2937;
}

.nav-placeholder {
  width: 64rpx;
}

.sub-title {
  text-align: center;
  font-size: 28rpx;
  color: #6b7280;
  margin-top: 16rpx;
}

/* 内容容器 */
.content-container {
  padding: 0 32rpx;
}

/* 统计卡片 */
.stats-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 48rpx;
  margin-bottom: 48rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
}

.stats-row {
  display: flex;
  justify-content: space-around;
  margin-bottom: 48rpx;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 60rpx;
  font-weight: bold;
  color: #1f2937;
  line-height: 1.2;
  
  &.primary-color {
    color: #2563eb;
  }
}

.stat-unit {
  font-size: 32rpx;
  font-weight: normal;
}

.stat-label {
  font-size: 24rpx;
  color: #6b7280;
  margin-top: 16rpx;
}

.divider {
  height: 2rpx;
  background-color: #f3f4f6;
  margin-bottom: 48rpx;
}

/* 详细信息列表 */
.detail-list {
  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32rpx;
    font-size: 28rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .detail-label {
    color: #6b7280;
    flex-shrink: 0;
  }
  
  .detail-value {
    text-align: right;
    color: #1f2937;
    font-weight: 500;
    flex: 1;
    margin-left: 32rpx;
    
    &.billing-detail {
      white-space: pre-line;
      line-height: 1.5;
    }
  }
  
  .copy-btn {
    color: #2563eb;
    font-weight: 600;
    margin-left: 16rpx;
  }
}

/* 费用说明卡片 */
.fee-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 48rpx;
  margin-bottom: 48rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
}

.fee-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48rpx;
}

.fee-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1f2937;
}

.status-badge {
  font-size: 24rpx;
  font-weight: 600;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  
  &.status-unpaid {
    background-color: #fed7aa;
    color: #ea580c;
  }
  
  &.status-paid {
    background-color: #d1fae5;
    color: #059669;
  }
}

.fee-list {
  .fee-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;
    font-size: 28rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .fee-label {
    color: #6b7280;
  }
  
  .fee-amount {
    font-size: 36rpx;
    font-weight: bold;
    
    &.primary-color {
      color: #2563eb;
    }
  }
  
  .fee-value {
    color: #1f2937;
  }
}

/* 费用疑问 */
.question-section {
  text-align: center;
  margin-bottom: 48rpx;
}

.question-btn {
  display: inline-flex;
  align-items: center;
  font-size: 28rpx;
  color: #6b7280;
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
  background-color: #eff6ff;
  border-top: 2rpx solid #e5e7eb;
  padding: 32rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
}

.payment-container {
  max-width: 686rpx;
  margin: 0 auto;
}

.payment-btn {
  width: 100%;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  padding: 24rpx;
  border-radius: 24rpx;
  border: none;
  box-shadow: 0 8rpx 32rpx rgba(37, 99, 235, 0.3);
  transition: all 0.3s ease;
  
  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 4rpx 16rpx rgba(37, 99, 235, 0.3);
  }
}

.primary-color {
  color: #2563eb;
}
</style>

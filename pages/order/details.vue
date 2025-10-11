<template>
  <view class="details-container" v-if="orderDetails">
    <!-- 顶部站点信息 -->
    <view class="header-section">
      <text class="station-name">{{ orderDetails.stationName }}</text>
      <text class="gun-info">{{ orderDetails.pileName }}-{{ orderDetails.gunName }}</text>
    </view>

    <!-- 白色卡片区域 -->
    <view class="content-card">
      <!-- 费用总览 -->
      <!-- <view class="summary-grid">
        <view class="summary-item">
          <text class="value">{{ orderDetails.duration }}</text>
          <text class="label">总占位时长(分钟)</text>
        </view>
        <view class="summary-item">
          <text class="value">{{ orderDetails.actualDuration }}</text>
          <text class="label">超时占位时长(分钟)</text>
        </view>
        <view class="summary-item">
          <text class="value amount">¥{{ formatAmount(orderDetails.busBalance) }}</text>
          <text class="label">超时占位费用(元)</text>
        </view>
      </view> -->

      <!-- 详细信息列表 -->
      <!-- <view class="info-list">
        <view class="info-row">
          <text class="info-label">占位订单编号</text>
          <view class="info-value">
            <text>{{ orderDetails.busId }}</text>
            <text class="copy-btn">复制</text>
          </view>
        </view>
        <view class="info-row">
          <text class="info-label">占位开始时间</text>
          <text class="info-value">{{ orderDetails.timeS }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">占位结束时间</text>
          <text class="info-value">{{ orderDetails.timeE }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">总占位时长</text>
          <text class="info-value">{{ orderDetails.duration }}分钟</text>
        </view>
        <view class="info-row">
          <text class="info-label">限时免费时长</text>
          <text class="info-value">{{ orderDetails.freeDuration }}分钟</text>
        </view>
        <view class="info-row">
          <text class="info-label">超时占位时长</text>
          <text class="info-value">{{ orderDetails.actualDuration }}分钟</text>
        </view>
        <view class="info-row">
          <text class="info-label">计费规则</text>
          <text class="info-value">{{ orderDetails.occupyCostModelDTO.name }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">计费详情</text>
          <text class="info-value" v-if="orderDetails.occupyCostModelDTO.limitAmount > 0">
            (单次封顶{{ formatAmount(orderDetails.occupyCostModelDTO.limitAmount) }}元)
          </text>
        </view>
      </view>
    </view> -->

    <!-- 费用说明 -->
    <!-- <view class="fee-explanation-card">
        <view class="fee-header">
            <text class="fee-title">费用说明</text>
            <text class="fee-status" :class="statusInfo.class">{{ statusInfo.text }}</text>
        </view>
        <view class="fee-row">
            <text class="fee-label">超时占位费用</text>
            <text class="fee-value amount">¥{{ formatAmount(orderDetails.busBalance) }}</text>
        </view>
        <view class="fee-row">
            <text class="fee-label">付款时间</text>
            <text class="fee-value gray">{{ orderDetails.payTime || '-' }}</text>
        </view>
        <view class="fee-row">
            <text class="fee-label">实付金额</text>
            <text class="fee-value gray">¥{{ formatAmount(orderDetails.actualBalance) }}</text>
        </view> -->
    </view>

    <view class="help-tip">
        <text>① 费用有疑问</text>
    </view>

    <!-- 底部支付按钮 -->
    <view class="footer-payment-button" v-if="orderDetails.billStatus === 11">
      立即支付
    </view>
  </view>
</template>

<script>
import { getBillDetailById } from '@/api/bill.js';
export default {
  data() {
    return {
      orderId: null,
      orderDetails: null
    };
  },
  computed: {
    statusInfo() {
      if (!this.orderDetails) return { text: '', class: '' };
      switch (this.orderDetails.billStatus) {
        case 11: return { text: '待支付', class: 'status-unpaid' };
        case 14: return { text: '已支付', class: 'status-paid' };
        default: return { text: '未知', class: '' };
      }
    }
  },
  onLoad(options) {
    if (options.id) {
      this.orderId = options.id;
      this.fetchOrderDetails();
    } else {
      uni.showToast({ title: '订单ID无效', icon: 'none' });
    }
  },
  methods: {
    async fetchOrderDetails() {
      uni.showLoading({ title: '加载中...' });
      try {
		  console.log(this.orderId)
        const res = await getBillDetailById(this.orderId);
		console.log(res)
        if (res.code === 0) {
          this.orderDetails = res.data;
        } else {
          uni.showToast({ title: res.msg || '加载失败', icon: 'none' });
        }
      } catch (error) {
        console.error('获取订单详情失败:', error);
        uni.showToast({ title: '网络错误', icon: 'none' });
      } finally {
        uni.hideLoading();
      }
    },
    formatAmount(amount) {
      if (typeof amount !== 'number') return '0.00';
      return (amount / 100).toFixed(2);
    }
  }
};
</script>

<style scoped>
.details-container {
  background: linear-gradient(to bottom, #00b894, #55e6c1);
  min-height: 100vh;
  padding: 32rpx;
  box-sizing: border-box;
}

.header-section {
  color: white;
  margin-bottom: 32rpx;
}
.station-name {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
}
.gun-info {
  display: block;
  font-size: 28rpx;
  color: #dfe6e9;
  margin-top: 8rpx;
}

.content-card {
  background-color: white;
  border-radius: 16rpx;
  padding: 32rpx;
}
.summary-grid {
  display: flex;
  justify-content: space-around;
  text-align: center;
  padding-bottom: 24rpx;
  border-bottom: 1rpx dashed #dfe6e9;
}
.summary-item .value {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
}
.summary-item .value.amount {
  color: #d63031;
}
.summary-item .label {
  display: block;
  font-size: 24rpx;
  color: #636e72;
  margin-top: 8rpx;
}

.info-list {
  padding-top: 16rpx;
}
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
  padding: 16rpx 0;
}
.info-label {
  color: #636e72;
}
.info-value {
  color: #2d3436;
}
.copy-btn {
  color: #0984e3;
  margin-left: 16rpx;
  font-size: 26rpx;
}

.fee-explanation-card {
    background-color: #f7f7f7;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-top: 24rpx;
}
.fee-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16rpx;
}
.fee-title {
    font-size: 30rpx;
    font-weight: bold;
}
.fee-status.status-unpaid {
    color: #ff976a;
}
.fee-status.status-paid {
    color: #00c777;
}
.fee-row {
    display: flex;
    justify-content: space-between;
    font-size: 28rpx;
    margin-top: 16rpx;
}
.fee-label {
    color: #636e72;
}
.fee-value {
    color: #2d3436;
}
.fee-value.amount {
    color: #d63031;
}
.fee-value.gray {
    color: #999;
}

.help-tip {
    font-size: 24rpx;
    color: #636e72;
    margin-top: 24rpx;
    text-align: center;
}

.footer-payment-button {
  position: fixed;
  bottom: 32rpx;
  left: 5%;
  width: 90%;
  background-color: #00c777;
  color: white;
  text-align: center;
  padding: 24rpx;
  border-radius: 40rpx;
  font-size: 32rpx;
  font-weight: bold;
}
</style>

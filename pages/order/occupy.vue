<template>
  <view class="occupy-order-container">
    <view class="order-list">
      <view class="order-card" v-for="order in orderList" :key="order.id" @click="goToDetails(order.id)">
        <view class="card-header">
          <text class="station-name">{{ order.stationName }}</text>
          <text class="order-status" :class="getStatusClass(order.billStatus)">
            {{ getStatusText(order.billStatus) }} >
          </text>
        </view>
        <view class="card-body">
          <text class="info-line subtitle">{{ order.pileName }}-{{ order.gunName }}</text>
          <text class="info-line">超时占位时长：{{ order.actualDuration }}分钟</text>
          <text class="info-line">
            超时占位费用：
            <text class="amount">¥{{ formatAmount(order.busBalance) }}</text>
          </text>
        </view>
        <view class="card-footer">
          <view class="actions">
            <view class="action-btn btn-secondary">详情</view>
            <view class="action-btn btn-primary" v-if="order.billStatus === 11" @click="goToDetails(order.id)">立即支付</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getMyOccupyBillPage } from '@/api/bill.js';
export default {
  data() {
    return {
      orderList: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      }
    };
  },
  onLoad() {
    this.loadData();
  },
  methods: {
    /**
     * @description 加载占位订单数据
     */
    async loadData() {
      uni.showLoading({ title: '加载中...' });
      try {
        const res = await getMyOccupyBillPage({
          current: this.pagination.current,
          pageSize: this.pagination.pageSize
        });

        if (res.code === 0) {
          this.orderList = [...this.orderList, ...res.data.records];
          this.pagination.total = res.data.total;
        }
      } catch (error) {
        console.error('加载占位订单数据失败:', error);
        uni.showToast({ title: '数据加载失败', icon: 'none' });
      } finally {
        uni.hideLoading();
      }
    },
    /**
     * @description 格式化金额 (分 -> 元)
     */
    formatAmount(amount) {
      if (typeof amount !== 'number') return '0.00';
      return (amount / 100).toFixed(2);
    },
    /**
     * @description 根据账单状态获取状态文本
     * @param {number} status - 账单状态码
     */
    getStatusText(status) {
      // 11-待支付, 14-已支付
      switch (status) {
        case 11: return '待支付';
        case 14: return '已支付';
        default: return '未知';
      }
    },
    /**
     * @description 根据账单状态获取状态样式类
     * @param {number} status - 账单状态码
     */
    getStatusClass(status) {
      switch (status) {
        case 11: return 'status-unpaid';
        case 14: return 'status-paid';
        default: return '';
      }
    },
    /**
     * @description 跳转到订单详情页面
     * @param {number} id - 订单ID
     */
    goToDetails(id) {
      uni.navigateTo({
        url: `/pages/bill/occupyBillPay?id=${id}`
      });
    },
  },
  onReachBottom() {
    if (this.orderList.length < this.pagination.total) {
      this.pagination.current++;
      this.loadData();
    }
  }
};
</script>

<style scoped>
.occupy-order-container {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 16rpx;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.order-card {
  background-color: white;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16rpx;
}

.station-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.order-status {
  font-size: 28rpx;
}
.status-unpaid {
  color: #ff976a; /* 橙色 */
}
.status-paid {
  color: #007AFF; /* 绿色 */
}

.card-body {
  padding: 16rpx 0;
  border-top: 1rpx solid #f5f5f5;
  border-bottom: 1rpx solid #f5f5f5;
}

.info-line {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-top: 12rpx;
}
.info-line .amount {
  color: #ff4d4f;
  font-weight: bold;
}
.subtitle {
  font-size: 24rpx;
  color: #999;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 16rpx;
}

.actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  padding: 10rpx 24rpx;
  border-radius: 30rpx;
  font-size: 28rpx;
  border: 1rpx solid;
}
.btn-secondary {
  color: #666;
  border-color: #ccc;
}
.btn-primary {
  background-color: #007AFF;
  color: white;
  border-color: #007AFF;
}
</style>

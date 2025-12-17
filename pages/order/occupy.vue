<template>
  <view class="occupy-order-container">
    <uv-navbar :border="false" title="超时占位订单" autoBack placeholder safeAreaInsetTop></uv-navbar>
    <view class="order-list">
      <!-- 订单列表 -->
      <template v-if="orderList.length > 0">
        <view class="order-card" v-for="order in orderList" :key="order.id">
          <view class="card-header">
            <text class="station-name">{{ order.stationName }}</text>
            <view class="order-status" :class="getStatusClass(order.billStatus)">
              {{ getStatusText(order.billStatus) }}
            </view>
          </view>
          <view class="card-body">
            <view class="info-item">
              <text class="info-text">超时占位时长: {{ order.actualDuration }}分钟</text>
            </view>
            <view class="info-item">
              <text class="info-text">
                超时占位费用:
                <text class="amount">¥{{ formatAmount(order.busBalance) }}</text>
              </text>
            </view>
          </view>
          <view class="card-footer">
            <view class="actions">
              <view class="action-btn btn-secondary" @click="goToDetails(order.id)">详情</view>
              <view class="action-btn btn-primary" v-if="order.billStatus === 11" @click="goToDetails(order.id)">
                立即支付
              </view>
            </view>
          </view>
        </view>
      </template>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <uv-icon name="empty-favor" size="200" color="#cbd5e1"></uv-icon>
        <text class="empty-text">暂无超时占位订单</text>
      </view>
    </view>
  </view>
</template>

<script>
import {getMyOccupyBillPage} from '@/api/bill.js';
import globalData from '@/globalData';

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
  onShow() {
    this.loadData();
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
  methods: {
    getWxAppName() {
      return globalData.wxAppName;
    },
    /**
     * @description 加载占位订单数据
     */
    async loadData() {
      uni.showLoading({title: '加载中...'});
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
        uni.showToast({title: '数据加载失败', icon: 'none'});
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
        case 11:
          return '待支付';
        case 14:
          return '已支付';
        default:
          return '未知';
      }
    },
    /**
     * @description 根据账单状态获取状态样式类
     * @param {number} status - 账单状态码
     */
    getStatusClass(status) {
      switch (status) {
        case 11:
          return 'status-unpaid';
        case 14:
          return 'status-paid';
        default:
          return '';
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
  background-color: #f6f7f8;
  min-height: 100vh;
  padding: 32rpx;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.order-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.station-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #1e293b;
  flex: 1;
  margin-right: 16rpx;
  line-height: 1.4;
}

.order-status {
  font-size: 24rpx;
  font-weight: 500;
  padding: 8rpx 24rpx;
  border-radius: 9999rpx;
  white-space: nowrap;
}

.status-unpaid {
  background-color: #fed7aa;
  color: #ea580c;
}

.status-paid {
  background-color: #dbeafe;
  color: #13a4ec;
}

.card-body {
  padding: 32rpx 0;
  border-top: 1rpx solid #f1f5f9;
  border-bottom: 1rpx solid #f1f5f9;
  margin: 0 -32rpx;
  padding-left: 32rpx;
  padding-right: 32rpx;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-icon {
  font-size: 32rpx;
  color: #64748b;
  margin-right: 16rpx;
  width: 32rpx;
  text-align: center;
  font-family: 'Material Symbols Outlined', sans-serif;
}

.info-text {
  font-size: 28rpx;
  color: #64748b;
  flex: 1;
}

.amount {
  color: #1e293b;
  font-weight: 600;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 32rpx;
}

.actions {
  display: flex;
  gap: 24rpx;
}

.action-btn {
  padding: 18rpx 40rpx;
  border-radius: 9999rpx;
  font-size: 28rpx;
  font-weight: 500;
  min-width: 168rpx;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-secondary {
  background-color: #f1f5f9;
  color: #475569;
  border: 1rpx solid #e2e8f0;
}

.btn-secondary:active {
  background-color: #e2e8f0;
  transform: scale(0.98);
}

.btn-primary {
  background: linear-gradient(135deg, #60a5fa 0%, #13a4ec 100%);
  color: #ffffff;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(19, 164, 236, 0.3);
}

.btn-primary:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(19, 164, 236, 0.4);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 32rpx;
  min-height: 60vh;
}

.empty-text {
  margin-top: 32rpx;
  font-size: 28rpx;
  color: #94a3b8;
  font-weight: 400;
}
</style>

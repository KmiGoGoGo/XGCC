<template>
  <view class="records-page">
    <uv-navbar :border="false" :autoBack="false" title="退款记录" placeholder safeAreaInsetTop @leftClick="handleNavBack"></uv-navbar>
    <view class="main-content">
      <view class="records-list">
        <view class="record-card" v-for="item in records" :key="item.id" @click="goToDetails(item.id)">
          <view class="card-content">
            <view class="left-section">
              <text class="refund-title">原路退回-{{ formatRefundRoad(item.refundRoad) }}</text>
              <text class="refund-time">退款时间 {{ item.createTime }}</text>
            </view>
            <view class="right-section">
              <text class="refund-amount">¥{{ formatCurrency(item.balance) }}</text>
              <text class="refund-status" :class="getStatusClass(item.checkStatus)">{{
                  formatStatus(item.checkStatus)
                }}
              </text>
            </view>
          </view>
        </view>
      </view>
      <view class="footer-notice">
        <text>全部加载完成</text>
      </view>
    </view>
  </view>
</template>

<script>
import {getLeaguerAccountRefundRecordList} from '@/api/refund.js';
import { handleNavBack } from '@/utils/utils';
import globalData from '@/globalData';

export default {
  data() {
    return {
      records: [],
    };
  },
  async onLoad(options) {
    uni.showLoading({title: '加载中...'});
    try {
      const res = await getLeaguerAccountRefundRecordList({
        page: options.page || 1,
        pageSize: options.pageSize || 10
      });
      if (res.code === 0 && res.data) {
        this.records = res.data.records;
      } else {
        uni.showToast({title: res.msg || '获取记录失败', icon: 'none'});
      }
    } catch (error) {
      console.error('获取退款记录失败', error);
      uni.showToast({title: '网络错误', icon: 'none'});
    } finally {
      uni.hideLoading();
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
  methods: {
    handleNavBack,
    getWxAppName() {
      return globalData.wxAppName;
    },
    formatCurrency(amount) {
      if (amount === null || amount === undefined) return '0.00';
      return (amount / 100).toFixed(2);
    },
    formatStatus(status) {
      const statusMap = {
        'Approve': '退款成功',
        'Reject': '退款失败',
        'AwaitingApproval': '审核中'
      };
      return statusMap[status] || '未知状态';
    },
    formatRefundRoad(refundRoad) {
      const refundRoadMap = {
        'WeChatPay': '微信',
        'Alipay': '支付宝'
      };
      return refundRoadMap[refundRoad] || '未知';
    },
    getStatusClass(status) {
      const classMap = {
        'Approve': 'success',
        'Reject': 'fail',
        'AwaitingApproval': 'AwaitingApproval'
      };
      return classMap[status] || '';
    },
    goToDetails(refundId) {
      uni.navigateTo({
        url: `/pages/refund/details?refundId=${refundId}`
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.records-page {
  background-color: #f6f7f8;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.main-content {
  flex: 1;
  padding: 32rpx;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.record-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.1);
  }
}

.card-content {
  padding: 32rpx;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.left-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.refund-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  line-height: 1.4;
}

.refund-time {
  font-size: 28rpx;
  color: #8E8E93;
  line-height: 1.3;
}

.right-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
  margin-left: 24rpx;
}

.refund-amount {
  font-size: 40rpx;
  font-weight: 700;
  color: #333333;
  line-height: 1.2;
}

.refund-status {
  font-size: 28rpx;
  font-weight: 500;
  line-height: 1.3;

  &.success {
    color: #13a4ec;
  }

  &.fail {
    color: #ff4757;
  }

  &.AwaitingApproval {
    color: #ff9500;
  }
}

.footer-notice {
  text-align: center;
  color: #8E8E93;
  font-size: 28rpx;
  padding: 80rpx 0 40rpx;
  margin-top: 32rpx;
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .records-page {
    background-color: #101c22;
  }

  .record-card {
    background-color: rgba(16, 28, 34, 0.5);
  }

  .refund-title,
  .refund-amount {
    color: #ffffff;
  }

  .refund-time,
  .footer-notice {
    color: #8E8E93;
  }
}
</style>

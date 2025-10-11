<template>
  <view class="records-page">
    <view class="list-container">
      <view class="record-item" v-for="item in records" :key="item.id" @click="goToDetails(item.id)">
        <view class="icon-container">
            <text class="icon">{{ formatRefundRoad(item.refundRoad) }}</text>
        </view>
        <view class="details-container">
          <view class="details-main">
            <text class="title">原路退回{{ formatRefundRoad(item.refundRoad) }}</text>
            <text class="amount">{{ formatCurrency(item.balance) }}</text>
          </view>
          <view class="details-sub">
            <text class="time">{{ item.createTime }}</text>
            <text class="status" :class="getStatusClass(item.checkStatus)">{{ formatStatus(item.checkStatus) }}</text>
          </view>
        </view>
        <view class="arrow-container">
          <text class="arrow">></text>
        </view>
      </view>
    </view>
    <view class="footer-notice">
      <text>全部加载完成</text>
    </view>
  </view>
</template>

<script>
import { getLeaguerAccountRefundRecordList } from '@/api/refund.js';

export default {
  data() {
    return {
      records: [],
    };
  },
  async onLoad(options) {
    uni.showLoading({ title: '加载中...' });
    try {
      const res = await getLeaguerAccountRefundRecordList({
        page: options.page || 1,
        pageSize: options.pageSize || 10
      });
      if (res.code === 0 && res.data) {
        this.records = res.data.records;
      } else {
        uni.showToast({ title: res.msg || '获取记录失败', icon: 'none' });
      }
    } catch (error) {
      console.error('获取退款记录失败', error);
      uni.showToast({ title: '网络错误', icon: 'none' });
    } finally {
      uni.hideLoading();
    }
  },
  methods: {
    formatCurrency(amount) {
      if (amount === null || amount === undefined) return '0.00';
      return (amount / 100).toFixed(2);
    },
    formatStatus(status) {
      const statusMap = {
        'Approve': '退款成功',
        'Reject': '退款失败',
        'AwatingApproval': '审核中'
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
        'AwatingApproval': 'AwatingApproval'
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
  background-color: #f5f5f5;
  min-height: 100vh;
}

.list-container {
  background-color: white;
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 0 32rpx;
}

.record-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx dashed #e0e0e0;
  &:last-child {
    border-bottom: none;
  }
}

.icon-container {
  .icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background-color: #e8f5e9;
    color: #67c23a;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.details-container {
  flex: 1;
  margin: 0 24rpx;
}

.details-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.amount {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.details-sub {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999;
}

.status {
  &.success { color: #67c23a; }
  &.fail { color: #fa5151; }
  &.AwatingApproval { color: #f9ae3d; }
}

.arrow-container {
  .arrow {
    color: #ccc;
    font-size: 32rpx;
  }
}

.footer-notice {
  text-align: center;
  color: #999;
  font-size: 24rpx;
  padding: 40rpx 0;
}
</style>

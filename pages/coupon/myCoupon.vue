<template>
  <view class="container">
    <!-- 优惠券列表 -->
    <view class="coupon-list">
      <view class="coupon-item" v-for="coupon in coupons" :key="coupon.id">
        <!-- 左侧 -->
        <view class="left-section">
          <view class="price-section">
            <text class="currency">¥</text>
            <text class="amount">{{ formatBalance(coupon.couponBalance) }}</text>
          </view>
          <text class="coupon-type">{{ coupon.couponTypeStr }}</text>
          <text class="usage-scope">指定站点</text>
        </view>
        <!-- 右侧 -->
        <view class="right-section">
          <view class="info-section">
            <text class="title">{{ coupon.activityName }}</text>
            <text class="usage-condition">满{{ coupon.limitBalance }}可用</text>
            <text class="date-time">@ {{ coupon.startDate }}</text>
            <text class="date-time">@ {{ coupon.endDate }}</text>
          </view>
          <view class="button-section">
            <view class="site-link" @click="showSiteInfo(coupon)">
              <text>适用站点 ></text>
            </view>
            <uv-button 
              type="primary" 
              size="small"
              @click="showUseConfirm"
              class="use-card-btn"
            >
              使用
            </uv-button>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部标签页 -->
    <view class="bottom-tabs">
      <text class="tab-item active">历史卡券</text>
      <text class="tab-item">券码中心</text>
    </view>

  </view>
</template>

<script>
import { myCouponPage } from '@/api/coupon.js';

export default {
  data() {
    return {
      coupons: []
    };
  },
  onLoad() {
    this.fetchCoupons();
  },
  methods: {
    async fetchCoupons() {
      uni.showLoading({
        title: '加载中...'
      });
      try {
        const res = await myCouponPage({
          tab: 1,
          current: 1,
          size: 10
        });
        if (res.code === 0) {
          this.coupons = res.data.records;
        } else {
          uni.showToast({
            title: '加载失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取优惠券失败:', error);
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    /**
     * @description 格式化余额，移除不必要的小数
     * @param {number} balance
     * @returns {number}
     */
    formatBalance(balance) {
      return parseInt(balance, 10);
    },
    /**
     * @description 显示适用站点信息
     * @param {Object} coupon 优惠券对象
     */
    showSiteInfo(coupon) {
      if (coupon.availableSiteName && coupon.availableSiteName.length > 0) {
        const siteList = coupon.availableSiteName;
        uni.showModal({
          title: '适用站点',
          content: siteList,
          showCancel: false,
          confirmText: '我知道了'
        });
      } else {
        uni.showModal({
          title: '适用站点',
          content: '暂无适用站点信息',
          showCancel: false,
          confirmText: '我知道了'
        });
      }
    },
    showUseConfirm() {
      uni.showModal({
        title: '提示',
        content: '请在微信小程序端进行使用',
        showCancel: false,
        confirmText: '我知道了'
      });
    }
  }
};
</script>

<style scoped>
.container {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 16rpx;
}

.coupon-list {
  padding-bottom: 120rpx; /* 为底部tab留出空间 */
}

.coupon-item {
  display: flex;
  margin-bottom: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.left-section {
  background-color: #FF7F00;
  color: white;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200rpx;
}

.price-section {
  display: flex;
  align-items: baseline;
}

.currency {
  font-size: 32rpx;
}

.amount {
  font-size: 56rpx;
  font-weight: bold;
}

.coupon-type {
  font-size: 24rpx;
  margin-top: 8rpx;
}

.usage-scope {
  font-size: 20rpx;
  margin-top: 4rpx;
}

.right-section {
  background-color: white;
  padding: 24rpx;
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.info-section {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.usage-condition {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.date-time {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}

.site-link {
  margin-top: 16rpx;
  padding: 8rpx 0;
}

.site-link text {
  font-size: 24rpx;
  color: #999;
}

.button-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 16rpx;
}

.use-card-btn {
  width: 120rpx !important;
  height: 60rpx !important;
}

.bottom-tabs {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  padding: 24rpx 0;
  border-top: 1rpx solid #eee;
}

.tab-item {
  font-size: 32rpx;
  color: #999;
  margin: 0 40rpx;
}

.tab-item.active {
  color: #333;
  font-weight: bold;
}

/* 确认模态框样式 */
.confirm-content {
  padding: 32rpx;
  text-align: center;
}

.confirm-content text {
  font-size: 32rpx;
  color: #333;
  line-height: 1.5;
}
</style>

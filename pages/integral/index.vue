<template>
  <view class="integral-container">
    <!-- 当前积分卡片 -->
    <view class="integral-card">
      <text class="card-title">当前积分</text>
      <view class="current-integral">
        {{ formattedIntegral }}
      </view>
      <text class="integral-rules">积分规则</text>
      <!-- 右上角装饰图标 -->
      <view class="deco-icon">
        <text>📱</text>
      </view>
    </view>

    <!-- 积分明细 -->
    <view class="details-section">
      <view class="details-header">
        <text class="details-title">积分明细</text>
        <text class="view-more" @click="goToDetailsPage">查看更多 ></text>
      </view>
      <view class="details-list">
        <view v-for="item in integralDetails" :key="item.id" class="detail-item">
          <view class="item-left">
            <text class="source-text">消费</text>
            <text class="total-integral">积分: {{ formatToDecimal(item.sumIntegral) }}</text>
          </view>
          <view class="item-right">
            <text class="change-amount">+{{ formatToDecimal(item.integralChange) }}</text>
            <text class="date-time">{{ item.createTime }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getIntegral, getMemberGradeRule, getIntegralDetail } from '@/api/integral.js';

export default {
  data() {
    return {
      integralInfo: null,
      gradeRule: null,
      integralDetails: [],
    };
  },
  computed: {
    formattedIntegral() {
      // 格式化当前积分，如果不存在则显示'0'
      return this.integralInfo ? this.integralInfo.consumeIntegral : '0';
    }
  },
  onLoad() {
    this.loadPageData();
  },
  methods: {
    /**
     * @description 并行加载页面所需的所有数据
     */
    async loadPageData() {
      uni.showLoading({
        title: '加载中...'
      });
      try {
        const [integralRes, gradeRuleRes, detailsRes] = await Promise.all([
          getIntegral(),
          getMemberGradeRule(),
          getIntegralDetail({ current: 1, size: 10 })
        ]);

        if (integralRes.code === 0) {
          this.integralInfo = integralRes.data;
        }
        if (gradeRuleRes.code === 0) {
          this.gradeRule = gradeRuleRes.data;
        }
        if (detailsRes.code === 0) {
          this.integralDetails = detailsRes.data.records;
        }

      } catch (error) {
        console.error('加载积分数据失败:', error);
        uni.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    /**
     * @description 将数值格式化为带两位小数的字符串
     * @param {number} value - 需要格式化的数值
     * @returns {string}
     */
    formatToDecimal(value) {
      if (typeof value !== 'number') {
        return '0.00';
      }
      // 根据用户要求，数值除以1000处理
      return (value / 1000).toFixed(2);
    },
    /**
     * @description 跳转到积分明细页面
     */
    goToDetailsPage() {
      uni.navigateTo({
        url: '/pages/integral/details'
      });
    }
  }
};
</script>

<style scoped>
.integral-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #e6f7ff, #ffffff 30%);
  padding: 32rpx;
}

/* 当前积分卡片 */
.integral-card {
  background-color: white;
  border-radius: 24rpx;
  padding: 32rpx;
  position: relative;
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.current-integral {
  font-size: 72rpx;
  font-weight: bold;
  color: #333;
  margin-top: 24rpx;
}

.integral-rules {
  font-size: 24rpx;
  color: #00c777;
  margin-top: 24rpx;
}

.deco-icon {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
  font-size: 48rpx;
  color: #f0f0f0;
}

/* 积分明细 */
.details-section {
  margin-top: 48rpx;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.details-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.view-more {
  font-size: 28rpx;
  color: #00c777;
}

.details-list {
  background-color: white;
  border-radius: 16rpx;
  padding: 0 32rpx;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 0;
  border-bottom: 1rpx dashed #e5e5e5;
}

.detail-item:last-child {
  border-bottom: none;
}

.item-left, .item-right {
  display: flex;
  flex-direction: column;
}

.item-left {
  align-items: flex-start;
}

.item-right {
  align-items: flex-end;
}

.source-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.total-integral {
  font-size: 24rpx;
  color: #ff4d4f; /* 红色 */
  margin-top: 8rpx;
}

.change-amount {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff4d4f; /* 红色 */
}

.date-time {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}
</style>

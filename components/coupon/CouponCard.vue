<template>
  <view 
    :class="['coupon-card', couponClass, { 'selected-card': selectable && selected, 'disabled-card': disabled }]"
    @click="handleCardClick"
  >
    <!-- 装饰圆形背景 -->
    <view class="decoration-circle decoration-top"></view>
    <view class="decoration-circle decoration-bottom"></view>
    
    <!-- 主要内容区域 -->
    <view class="coupon-main">
      <!-- 左侧价格区域 -->
      <view class="coupon-left">
        <view class="price-wrapper">
          <text class="price-currency">¥</text>
          <text class="price-amount">{{ formatBalance(coupon.couponBalance) }}</text>
        </view>
        <text class="price-condition">满{{ coupon.limitBalance }}可用</text>
      </view>

      <!-- 中间信息区域 -->
      <view class="coupon-middle">
        <view class="coupon-header">
          <text class="coupon-title">{{ coupon.couponTypeStr }}</text>
        </view>
        <text class="coupon-desc">{{ coupon.activityName }}</text>
        <view class="coupon-date">
          <text class="date-text">{{ coupon.startDate }}</text>
          <text class="date-text">{{ coupon.endDate }}</text>
        </view>
      </view>

      <!-- 右侧按钮/单选框区域 -->
      <view class="coupon-right">
        <!-- 可选择模式：显示单选框 -->
        <view v-if="selectable" class="radio-wrapper">
          <view :class="['radio-box', couponClass, { 'radio-checked': selected, 'radio-disabled': disabled }]">
            <text v-if="selected" class="radio-check-icon">✓</text>
          </view>
        </view>
        
        <!-- 正常模式：显示按钮和标签 -->
        <template v-else>
          <view 
            :class="['use-button', couponClass]"
            @click.stop="handleUse"
          >
            <text class="use-button-text">去使用</text>
          </view>
          <view v-if="isExpiringSoon">
            <StatusTag 
              text="快过期" 
              textColor="#D2691E"
              backgroundColor="#FFE5B4"
              fontSize="24rpx" 
              borderRadius="24rpx" 
              padding="4rpx 16rpx"
            />
          </view>
        </template>
      </view>
    </view>

    <!-- 底部查看站点（仅在非可选择模式显示） -->
    <view v-if="!selectable" class="coupon-footer" @click.stop="handleShowSiteInfo">
      <text :class="['footer-text', couponClass]">查看适用站点</text>
      <text class="footer-arrow">›</text>
    </view>

    <!-- 不可用原因提示（仅在可选择模式且禁用时显示） -->
    <view v-if="selectable && disabled && statusDesc" class="status-desc">
      <view class="desc">
        <text>不可用原因：</text>
        {{ statusDesc }}
      </view>
    </view>
  </view>
</template>

<script>
import StatusTag from '@/components/common/StatusTag.vue';

export default {
  name: 'CouponCard',
  components: {
    StatusTag
  },
  props: {
    /**
     * 优惠券数据对象
     */
    coupon: {
      type: Object,
      required: true,
      default: () => ({})
    },
    /**
     * 是否为可选择模式
     */
    selectable: {
      type: Boolean,
      default: false
    },
    /**
     * 是否被选中（仅在 selectable 为 true 时有效）
     */
    selected: {
      type: Boolean,
      default: false
    },
    /**
     * 是否禁用（不可选择）
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * 不可用原因描述（仅在 selectable 为 true 且 disabled 为 true 时显示）
     */
    statusDesc: {
      type: String,
      default: ''
    }
  },
  computed: {
    /**
     * @description 计算优惠券类型对应的样式类名
     * @returns {string}
     */
    couponClass() {
        console.log('coupon', this.coupon)
      const type = this.coupon.couponTypeStr || '';
      if (type.includes('服务')) return 'service-coupon';
      if (type.includes('现金')) return 'cash-coupon';
      if (type.includes('洗车')) return 'wash-coupon';
      return 'service-coupon';
    },
    /**
     * @description 判断优惠券是否快过期（7天内）
     * @returns {boolean}
     */
    isExpiringSoon() {
      if (!this.coupon.endDate) return false;
      const endDate = new Date(this.coupon.endDate.replace(/-/g, '/'));
      const now = new Date();
      const diff = endDate - now;
      const days = diff / (1000 * 60 * 60 * 24);
      return days > 0 && days <= 7;
    }
  },
  methods: {
    /**
     * @description 格式化余额，移除不必要的小数
     * @param {number} balance
     * @returns {number}
     */
    formatBalance(balance) {
      return parseInt(balance, 10);
    },
    /**
     * @description 处理卡片点击（可选择模式）
     */
    handleCardClick() {
      if (this.selectable && !this.disabled) {
        this.$emit('select', this.coupon);
      }
    },
    /**
     * @description 处理使用按钮点击
     */
    handleUse() {
      this.$emit('use', this.coupon);
    },
    /**
     * @description 处理查看站点信息点击
     */
    handleShowSiteInfo() {
      this.$emit('show-site-info', this.coupon);
    }
  }
};
</script>

<style scoped>
/* 优惠券卡片 */
.coupon-card {
  position: relative;
  background-color: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(226, 232, 240, 0.5);
  overflow: hidden;
  /* transition: all 0.3s ease; */
}

/* 选中状态的卡片 */
.coupon-card.selected-card.service-coupon {
  border: 4rpx solid #38bdf8;
  box-shadow: 0 8rpx 24rpx rgba(56, 189, 248, 0.3);
}

.coupon-card.selected-card.cash-coupon {
  border: 4rpx solid #22d3ee;
  box-shadow: 0 8rpx 24rpx rgba(34, 211, 238, 0.3);
}

.coupon-card.selected-card.wash-coupon {
  border: 4rpx solid #a78bfa;
  box-shadow: 0 8rpx 24rpx rgba(167, 139, 250, 0.3);
}

/* 禁用状态的卡片 */
.coupon-card.disabled-card {
  opacity: 0.5;
}

/* 装饰圆形 */
.decoration-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.decoration-top {
  width: 192rpx;
  height: 192rpx;
  top: -80rpx;
  right: -80rpx;
}

.decoration-bottom {
  width: 256rpx;
  height: 256rpx;
  bottom: -96rpx;
  left: -64rpx;
}

/* 服务费券 */
.coupon-card.service-coupon .decoration-top,
.coupon-card.service-coupon .decoration-bottom {
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
}

/* 现金券 */
.coupon-card.cash-coupon .decoration-top,
.coupon-card.cash-coupon .decoration-bottom {
  background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
}

/* 洗车券 */
.coupon-card.wash-coupon .decoration-top,
.coupon-card.wash-coupon .decoration-bottom {
  background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
}

/* 主要内容区域 */
.coupon-main {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  padding: 32rpx;
  gap: 32rpx;
}

/* 左侧价格区域 */
.coupon-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-right: 32rpx;
  border-right: 2rpx dashed #e2e8f0;
  min-width: 160rpx;
}

.price-wrapper {
  display: flex;
  align-items: baseline;
}

.price-currency {
  font-size: 32rpx;
  font-weight: 500;
}

.price-amount {
  font-size: 72rpx;
  font-weight: bold;
  line-height: 1;
}

.coupon-card.service-coupon .price-currency,
.coupon-card.service-coupon .price-amount {
  color: #38bdf8;
}

.coupon-card.cash-coupon .price-currency,
.coupon-card.cash-coupon .price-amount {
  color: #22d3ee;
}

.coupon-card.wash-coupon .price-currency,
.coupon-card.wash-coupon .price-amount {
  color: #a78bfa;
}

.price-condition {
  font-size: 24rpx;
  color: #94a3b8;
  margin-top: 8rpx;
  white-space: nowrap;
}

/* 中间信息区域 */
.coupon-middle {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  min-width: 0;
}

.coupon-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.coupon-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1e293b;
}

.coupon-desc {
  font-size: 24rpx;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.coupon-date {
  display: flex;
  width: 300rpx;
  flex-direction: column;
  margin-top: 8rpx;
  gap: 4rpx;
}

.date-text {
  font-size: 22rpx;
  color: #94a3b8;
  line-height: 1.4;
}

/* 右侧按钮区域 */
.coupon-right {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 16rpx;
  flex-shrink: 0;
}

.use-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 168rpx;
  height: 72rpx;
  border-radius: 999rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.use-button.service-coupon {
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
  box-shadow: 0 8rpx 16rpx rgba(56, 189, 248, 0.3);
}

.use-button.cash-coupon {
  background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
  box-shadow: 0 8rpx 16rpx rgba(34, 211, 238, 0.3);
}

.use-button.wash-coupon {
  background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
  box-shadow: 0 8rpx 16rpx rgba(167, 139, 250, 0.3);
}

.use-button:active {
  transform: scale(0.95);
  opacity: 0.9;
}

.use-button-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #ffffff;
}

/* 底部查看站点 */
.coupon-footer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  border-top: 1rpx solid #f1f5f9;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.coupon-footer:active {
  background-color: #f8fafc;
}

.footer-text {
  font-size: 28rpx;
  font-weight: 500;
}

.footer-text.service-coupon {
  color: #38bdf8;
}

.footer-text.cash-coupon {
  color: #22d3ee;
}

.footer-text.wash-coupon {
  color: #a78bfa;
}

.footer-arrow {
  font-size: 36rpx;
  color: #cbd5e1;
}

/* 不可用原因提示 */
.status-desc {
  margin-top: -12rpx;
  margin-bottom: 12rpx;
  padding: 0 32rpx 20rpx 32rpx;
}

.desc {
  font-size: 24rpx;
  color: #3E2723;
  opacity: 0.7;
  line-height: 1.5;
}

/* 单选框容器 */
.radio-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 单选框样式 */
.radio-box {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  border: 3rpx solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background-color: #ffffff;
}

/* 选中状态的单选框 */
.radio-box.radio-checked {
  border-color: transparent;
}

.radio-box.radio-checked.service-coupon {
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
  box-shadow: 0 4rpx 8rpx rgba(56, 189, 248, 0.3);
}

.radio-box.radio-checked.cash-coupon {
  background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
  box-shadow: 0 4rpx 8rpx rgba(34, 211, 238, 0.3);
}

.radio-box.radio-checked.wash-coupon {
  background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
  box-shadow: 0 4rpx 8rpx rgba(167, 139, 250, 0.3);
}

/* 禁用状态的单选框 */
.radio-box.radio-disabled {
  border-color: #e2e8f0;
  background-color: #f1f5f9;
}

/* 选中图标 */
.radio-check-icon {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  line-height: 1;
}
</style>


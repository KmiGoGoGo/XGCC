<template>
  <view class="price-card" :class="{ 'unavailable-card': freeGunCount === 0 }">
    <view class="price-card-content">
      <view class="price-left">
        <view class="price-icon" :class="[iconClass, { 'unavailable-icon': freeGunCount === 0 }]">
          <text class="icon-text" :class="{ 'unavailable-text': freeGunCount === 0 }">{{ chargeTypeDisplay }}</text>
        </view>
        <view class="price-info">
          <text class="charge-type" :class="{ 'unavailable-text': freeGunCount === 0 }">{{ timeRange }}</text>
          <text class="price-details" :class="{ 'unavailable-text': freeGunCount === 0 }">电费 {{ electricPrice }} 服务费 {{ servicePrice }}</text>
        </view>
      </view>
      <view class="price-right">
        <view class="price-container">
          <text v-if="hasDiscountPrice" class="original-price">¥{{ currentPrice }}</text>
          <text class="total-price" :class="{ unavailable: freeGunCount === 0 }">{{ totalPrice }}<text class="price-unit">/度</text></text>
        </view>
        <text class="availability" :class="{ 'unavailable-text': freeGunCount === 0 }">{{ availabilityText }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import StatusTag from '../common/StatusTag.vue'

export default {
  name: 'PriceInfo',
  components: {
    StatusTag
  },
  props: {
    // 充电类型
    chargeType: {
      type: String,
      required: true
    },
    // 时间范围
    timeRange: {
      type: String,
      required: true
    },
    // 当前价格
    currentPrice: {
      type: [String, Number],
      required: true
    },
    // 电费价格
    electricPrice: {
      type: [String, Number],
      required: true
    },
    // 服务费价格
    servicePrice: {
      type: [String, Number],
      required: true
    },
    gunCount: {
      type: [Number],
      required: true
    },
    freeGunCount: {
      type: [Number],
      required: true
    },
    // 折扣价格字符串
    discountPriceStr: {
      type: [String, Number],
      default: ''
    }
  },
  computed: {
    // 是否有折扣价格
    hasDiscountPrice() {
      return this.discountPriceStr && 
             this.discountPriceStr !== '' && 
             this.discountPriceStr !== '0.00';
    },
    // 充电类型显示文本
    chargeTypeDisplay() {
      return this.chargeType;
    },
    // 图标类名
    iconClass() {
      switch (this.chargeType) {
        case '超':
          return 'super-charge';
        case '快':
          return 'fast-charge';
        case '慢':
          return 'slow-charge';
        default:
          return 'fast-charge';
      }
    },
    // 图标名称
    iconName() {
      switch (this.chargeType) {
        case '超':
          return 'electric_bolt';
        case '快':
          return 'bolt';
        case '慢':
          return 'speed';
        default:
          return 'bolt';
      }
    },
    // 总价格
    totalPrice() {
      if (this.hasDiscountPrice) {
        return '¥' + this.discountPriceStr;
      }
      return '¥' + this.currentPrice;
    },
    // 可用性文本
    availabilityText() {
      if (this.freeGunCount === 0) {
        return '全部占用';
      }
      return '空闲 ' + this.freeGunCount;
    }
  }
}
</script>

<style scoped>
.price-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.1);
}

.price-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.price-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.fast-charge {
  background-color: #FFF4E6;
}

.slow-charge {
  background-color: #E8F5E8;
}

.super-charge {
  background-color: #E5F6FF;
}

.icon-text {
  font-size: 32rpx;
  font-weight: bold;
  font-family: 'Material Symbols Outlined';
}

.fast-charge .icon-text {
  color: #FF9500;
}

.slow-charge .icon-text {
  color: #34C759;
}

.super-charge .icon-text {
  color: #00A9FF;
}

.price-info {
  flex: 1;
}

.charge-type {
  font-size: 32rpx;
  font-weight: bold;
  color: #1A1A1A;
  display: block;
  margin-bottom: 8rpx;
}

.price-details {
  font-size: 24rpx;
  color: #8A8A8E;
  display: block;
}

.price-right {
  text-align: right;
}

.price-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.original-price {
  font-size: 28rpx;
  color: #999999;
  text-decoration: line-through;
  font-weight: 400;
}

.total-price {
  font-size: 40rpx;
  font-weight: bold;
  color: #00A9FF;
}

.total-price.unavailable {
  color: #8A8A8E;
}

.price-unit {
  font-size: 28rpx;
  font-weight: 400;
  color: #04AAFF;
}

.availability {
  font-size: 24rpx;
  color: #34C759;
  display: block;
}

/* 不可用状态的灰色样式 */
.unavailable-card {
  opacity: 0.6;
}

.unavailable-icon {
  background-color: #F0F0F0 !important;
}

.unavailable-text {
  color: #8A8A8E !important;
}

.unavailable .price-unit {
  color: #8A8A8E !important;
}
</style>

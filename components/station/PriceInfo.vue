<template>
  <view class="price-info-container">
    <!-- 头部：充电类型和时间 -->
    <view class="price-header">
      <view style="display: flex; justify-content: center; align-items: center;">
        <uv-tags :text="chargeType" :type="chargeType === '快' ? 'error' : chargeType === '超' ? 'primary' : 'success'"></uv-tags>
        <view class="gun-count-container">
            <text class="free-gun-count" :class="freeGunColorClass">闲{{ freeGunCount }}</text>
            <text class="gun-count">/共{{ gunCount }}</text>
        </view>
      </view>
      <view class="time-range">
        <text class="time-text">{{ timeRange }}</text>
      </view>
    </view>

    <!-- 当前价格 -->
    <view class="current-price-section">
      <text class="current-price-label">当前价格</text>
      <view class="price-display">
        <!-- 有折扣价格时显示折扣价 -->
        <template v-if="hasDiscountPrice">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ discountPriceStr }}</text>
          <text class="price-unit">起</text>
          <!-- 原价显示为划线样式 -->
          <view class="original-price">
            <text class="original-price-symbol">¥</text>
            <text class="original-price-value">{{ currentPrice }}起</text>
          </view>
        </template>
        <!-- 无折扣价格时显示原价 -->
        <template v-else>
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ currentPrice }}</text>
          <text class="price-unit">起</text>
        </template>
      </view>
    </view>

    <!-- 费用明细 -->
    <view class="price-detail">
      <text class="detail-text">
        电费{{ electricPrice }}元/度 | 服务费{{ servicePrice }}元/度
      </text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PriceInfo',
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
    // 根据空闲枪数量计算颜色
    freeGunColorClass() {
      const freeCount = this.freeGunCount || 0;
      const totalCount = this.gunCount || 1;
      
      // 空闲枪数量等于0，显示红色
      if (freeCount === 0) {
        return 'gun-count-red';
      }
      
      // 空闲枪数量大于等于5或者大于等于总枪数量一半，显示绿色
      if (freeCount >= 5 || freeCount >= Math.ceil(totalCount / 2)) {
        return 'gun-count-green';
      }
      
      // 其他情况显示黄色
      return 'gun-count-yellow';
    }
  }
}
</script>

<style lang="less" scoped>
.price-info-container {
  background: #F2F8FF;
  border-radius: 12rpx;
  padding: 24rpx;
  margin: 16rpx 0;
}

/* 头部：充电类型和时间 */
.price-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.charge-type-tag {
  background: #ff6b00;
  color: #ffffff;
  border-radius: 8rpx;
  padding: 6rpx 12rpx;
  min-width: 48rpx;
  text-align: center;

  .charge-type-text {
    font-size: 22rpx;
    font-weight: bold;
    color: #ffffff;
  }
}

.time-range {
  .time-text {
    font-size: 22rpx;
    color: #3C9CFF;
  }
}

/* 当前价格区域 */
.current-price-section {
  margin-bottom: 12rpx;
}

.current-price-label {
  font-size: 24rpx;
  color: #666666;
  margin-right: 16rpx;
}

.price-display {
  display: inline-flex;
  align-items: baseline;

  .price-symbol {
    font-size: 28rpx;
    color: #5AAAFF;
    font-weight: bold;
  }

  .price-value {
    font-size: 36rpx;
    color: #5AAAFF;
    font-weight: bold;
    margin: 0 4rpx;
  }

  .price-unit {
    font-size: 24rpx;
    color: #5AAAFF;
    font-weight: 500;
  }
  
  // 原价显示样式（划线效果）
  .original-price {
    display: flex;
    align-items: baseline;
    margin-left: 16rpx;
    
    .original-price-symbol,
    .original-price-value {
      font-size: 20rpx;
      color: #999;
      text-decoration: line-through;
    }
    
    .original-price-symbol {
      margin-right: 2rpx;
    }
  }
}

/* 费用明细 */
.price-detail {
  .detail-text {
    font-size: 22rpx;
    color: #999999;
    line-height: 1.4;
  }
}

.gun-count-container {
    margin-left: 10rpx;
    .free-gun-count {
        font-size: 24rpx;
        font-weight: 500;
        transition: color 0.3s ease;
    }
    .gun-count {
        font-size: 22rpx;
        color: #999999;
    }
}

/* 空闲枪数量颜色状态 */
.gun-count-red {
    color: #f56c6c !important; /* 红色：空闲枪数量为0 */
}

.gun-count-yellow {
    color: #e6a23c !important; /* 黄色：其他情况 */
}

.gun-count-green {
    color: #67c23a !important; /* 绿色：空闲枪数量>=5或>=总数一半 */
}
</style>

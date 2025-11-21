<template>
  <Card clickable @click="onStationClick">
    <!-- 超充站背景渐变层（最底层） -->
    <!-- <view class="super-station-background" v-if="isSuperStation"></view> -->
    
    <!-- 超充站右下角文字（底层） -->
    <view class="super-station-label" v-if="isSuperStation">
      <!-- <text class="super-station-text">超充</text> -->
    </view>
    
    <!-- 左上角合作标签 -->
    <!-- <view class="cooperation-corner-tag" v-if="cooperationType === '合作'">
      <text class="cooperation-corner-text">合作</text>
    </view> -->
    
    <!-- 右上角距离标签已移至内容区域，此处不再显示 -->

    <!-- 主要内容区域 -->
    <view class="station-content">
      <view class="cooperation-tag-distance-section">
        <view class="cooperation-tag-section">
            <!-- <view class="discount-tag" v-if="isDiscountStation">
              <text class="discount-text">特惠</text>
            </view>
            <view class="cooperation-tag" :style="{ backgroundColor: stationData.hulianId ? '#96D77C' : '#FBA954' }">
              <text class="cooperation-text">{{ cooperationType }}</text>
            </view> -->
            <view class="name-section">
              <text class="station-name">{{ stationData.name }}</text>
            </view>
          </view>
        <view class="distance-section" v-if="stationData.distanceDouble">
          <!-- <text class="distance-text" :style="isSuperStation ? 'color: #007AFF' : 'color: #5aaaff'">{{ stationData.distanceDouble }} km</text> -->
          <uv-button :color="'#FFFFFF'" shape="circle" size="mini" customTextStyle="color: #999; font-size: 22rpx;" :text="stationData.distanceDouble.toFixed(2) + ' km'"></uv-button>
        </view>
      </view>
      <!-- 第一行：站点名称与距离 space-between布局 -->

      <!-- 第二行：价格与是否自营 space-between布局 -->
      <view class="price-operate-row">
        <view class="price-section">
          <!-- 有折扣价格时显示折扣价 -->
          <template v-if="hasDiscountPrice">
            <text class="price-symbol">¥</text>
            <text class="price-value">{{ stationData.discountPriceStr }}</text>
            <text class="price-unit">起</text>
            <!-- 原价显示为划线样式 -->
            <view class="original-price">
              <text class="original-price-symbol">¥</text>
              <text class="original-price-value">{{ stationData.currentPriceStr }}起</text>
            </view>
          </template>
          <!-- 无折扣价格时显示原价 -->
          <template v-else>
            <text class="price-symbol">¥</text>
            <text class="price-value">{{ stationData.currentPriceStr }}</text>
            <text class="price-unit">起</text>
          </template>
        </view>
        <view>
          
        </view>
      </view>

      <!-- 第三行：充电桩信息 space-between布局（当同时拥有超充和快充时） -->
      <view class="gun-status-row">
        <!-- 超充桩信息 -->
        <view class="gun-group" v-if="stationData.superGunFastCount > 0">
          <view class="gun-view">
            <Tag backgroundColor="#EDF4FE" borderRadius="30rpx" padding="1rpx 16rpx">
              <text class="super-gun-text">超</text>
              <text class="super-free-gun-text"> &nbsp; {{ stationData.superFastFreeGunCount || 0 }}/{{ stationData.superGunFastCount || 0 }} </text>
            </Tag>
          </view>
        </view>
        <!-- 快充桩信息 -->
        <view class="gun-group" v-if="stationData.fastGunCount > 0">
          <view class="gun-view">
            <Tag backgroundColor="#FAEBDD" borderRadius="30rpx" padding="1rpx 16rpx">
              <text class="fast-gun-text">快</text>
              <text class="fast-free-gun-text"> &nbsp; {{ stationData.fastFreeGunCount || 0 }}/{{ stationData.fastGunCount || 0 }} </text>
            </Tag>
          </view>
        </view>
        <!-- 慢充桩信息 -->
        <view class="gun-group" v-if="stationData.slowGunCount > 0">
          <view class="gun-view">
            <Tag backgroundColor="#F0F9F2" borderRadius="30rpx" padding="1rpx 16rpx">
              <text class="slow-gun-text">慢</text>
              <text class="slow-free-gun-text"> &nbsp; {{ stationData.slowFreeGunCount || 0 }}/{{ stationData.slowGunCount || 0 }} </text>
            </Tag>
          </view>
        </view>
      </view>

      <view></view>

      <!-- 通知信息 -->
      <!-- <view class="notice-bar" v-if="stationData.notice" :style="{marginBottom: isSuperStation ? '16rpx' : '0'}"> -->
      <view class="notice-bar" v-if="stationData.notice || stationData.parkingSubsidy">
        <!-- <view class="notice-icon">🔊</view> -->
        <text class="notice-text" v-if="stationData.notice">· {{ stationData.notice }}</text>
        <text class="notice-text" v-if="stationData.parkingSubsidy">· {{ stationData.parkingSubsidy }}</text>
      </view>
    </view>
  </Card>
</template>

<script>
import Card from '../../components/common/Card.vue'
import StatusTag from '../../components/common/StatusTag.vue'
import Tag from '../../components/common/Tag.vue'

export default {
  name: 'StationListItem',
  components: {
    Card,
    StatusTag,
    Tag
  },
  props: {
    stationData: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  data() {
    return {
      defaultImage: 'https://comppad.didistatic.com/static/comp-pad/default-station.png'
    }
  },
  computed: {
    // 合作类型（合作/自营）
    cooperationType() {
      // 根据hulianId判断是否为合作站点
      if (this.stationData.hulianId) {
        return '合作'
      }
      return '自营'
    },
    // 是否有折扣价格
    hasDiscountPrice() {
      return this.stationData.discountPriceStr && 
             this.stationData.discountPriceStr !== '' && 
             this.stationData.discountPriceStr !== '0.00';
    },
    // 是否为超充站
    isSuperStation() {
      return this.stationData.fastSlow === 'overTake' || 
             this.stationData.superGunFastCount > 0 ||
             this.stationData.superStation
    },
    // 是否为特惠站
    isDiscountStation() {
      return this.stationData.hulianId == null
    },
    // 总充电桩数量
    totalGuns() {
      return (this.stationData.superGunFastCount || 0) + 
             (this.stationData.fastGunCount || 0) + 
             (this.stationData.slowGunCount || 0)
    },
    // 空闲充电桩数量
    totalFreeGuns() {
      return (this.stationData.superFastFreeGunCount || 0) + 
             (this.stationData.fastFreeGunCount || 0) + 
             (this.stationData.slowFreeGunCount || 0)
    },
    // 营业时间文本
    businessTimeText() {
      if (this.stationData.businessTime && this.stationData.businessTime.length > 0) {
        return this.stationData.businessTime[0]
      }
      return '营业时间未知'
    },
    // 是否同时拥有超充和快充
    hasBothGunTypes() {
      return (this.stationData.superGunFastCount > 0) && (this.stationData.fastGunCount > 0)
    },
    // 超充空闲枪文字颜色
    superFreeGunTextColor() {
      const freeCount = this.stationData.superFastFreeGunCount || 0
      const totalCount = this.stationData.superGunFastCount || 0
      // 空闲数量大于等于总数量一半 或者 空闲数量大于5时显示绿色
      if (freeCount >= totalCount / 2 || freeCount > 5) {
        return '#1BA035' // 绿色
      } else if (freeCount == 0) {
        return '#FF4D4F' // 红色
      }
      return '#FBA954' // 默认黄色
    },
    // 快充空闲枪文字颜色
    fastFreeGunTextColor() {
      const freeCount = this.stationData.fastFreeGunCount || 0
      const totalCount = this.stationData.fastGunCount || 0
      // 空闲数量大于等于总数量 或者 空闲数量大于5时显示绿色
      if (freeCount >= totalCount / 2 || freeCount > 5) {
        return '#1BA035' // 绿色
      } else if (freeCount == 0) {
        return '#FF4D4F' // 红色
      }
      return '#FBA954' // 默认黄色
    },
    // 慢充空闲枪文字颜色
    slowFreeGunTextColor() {
      const freeCount = this.stationData.slowFreeGunCount || 0
      const totalCount = this.stationData.slowGunCount || 0
      // 空闲数量大于等于总数量 或者 空闲数量大于5时显示绿色
      if (freeCount >= totalCount / 2 || freeCount > 5) {
        return '#1BA035' // 绿色
      } else if (freeCount == 0) {
        return '#FF4D4F' // 红色
      }
      return '#FBA954' // 默认黄色
    }
  },
  methods: {
    // 点击充电站事件
    onStationClick() {
      this.$emit('click', this.stationData)
    },
    // 切换收藏状态
    toggleFavorite() {
      this.$emit('favorite', {
        station: this.stationData,
        isCollection: !this.stationData.isCollection
      })
    },
    // 图片加载失败处理
    onImageError() {
      console.log('充电站图片加载失败，使用默认图片')
    },
    // 获取服务状态样式类
    getStatusClass() {
      if (this.stationData.status === 1) {
        return 'status-normal'
      }
      return 'status-abnormal'
    },
    // 获取服务状态文本
    getStatusText() {
      if (this.stationData.isRepair === 0) {
        return '维修中'
      }
      if (this.stationData.status === 1) {
        return '正常营业'
      }
      return '暂停服务'
    }
  }
}
</script>

<style lang="less" scoped>

.gun-status-view {
  display: flex;
  position: relative;
  align-items: center;
  background: #E6F0FF;
  padding-left: 16rpx;
  right: 15rpx;
  z-index: 1;
  padding-right: 2rpx;
}

/* 超充站卡片样式 */
.super-station-card {
  position: relative;
  overflow: hidden; /* 确保渐变背景不会超出卡片边界 */
}

/* 超充站背景渐变层（最底层） */
.super-station-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(130deg, #FFFFFF 0%, #007AFF 140%);
  z-index: 1; /* 最底层 */
  pointer-events: none; /* 不阻止点击事件 */
}

/* 超充站右下角文字 */
.super-station-label {
  position: absolute;
  bottom: 12rpx;
  right: 16rpx;
  z-index: 2; /* 在背景之上，但在内容之下 */
  pointer-events: none; /* 不阻止点击事件 */
}

.super-station-text {
  color: #FFFFFF;
  font-size: 200rpx;
  font-weight: bold;
  font-style: italic;
  opacity: 0.75;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3); /* 添加阴影增强可读性 */
}

/* 确保主要内容在最上层 */
.station-content {
  position: relative;
  z-index: 10; /* 确保内容在最上层 */
}

/* 左上角角标（合作/超充/推荐） */
.cooperation-corner-tag {
  position: absolute;
  top: 0;
  left: 0;
  width: 120rpx;
  height: 36rpx;
  background: #ff4d4f;
  color: #fff;
  font-size: 22rpx;
  text-align: center;
  line-height: 36rpx;
  transform: rotate(-45deg) translate(-30rpx, 20rpx);
  transform-origin: left top;
  font-weight: 500;
  z-index: 2;
}

/* 距离（右上角小字） */
.distance-corner-tag {
  position: absolute;
  top: 16rpx;
  right: 20rpx;
  font-size: 22rpx;
  color: #007AFF; /* 绿色 */
  background: transparent;
  font-weight: 500;
}

/* 第一行：站点名称与距离 space-between布局 */
.name-distance-row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 16rpx;
}

.name-section {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0; /* 允许子元素收缩，配合省略号显示 */
}

// .super-tag {
//   background: #007AFF;
//   color: #fff;
//   font-size: 20rpx;
//   padding: 2rpx 8rpx;
//   border-radius: 4rpx;
//   margin-right: 8rpx;
// }

.cooperation-tag-distance-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4rpx;
  padding-right: 16rpx;
  padding-bottom: 8rpx;
}

.cooperation-tag-section {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding-right: 16rpx;
  padding-bottom: 8rpx;
}

.discount-tag {
  background: #FF6F6B;
  color: #fff;
  font-size: 20rpx;
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
  margin-right: 8rpx;
  flex-shrink: 0;
  display: inline-block;
}

.cooperation-tag {
  background: #FBA954;
  color: #fff;
  font-size: 20rpx;
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
  margin-right: 8rpx;
  flex-shrink: 0;
  display: inline-block;
}


.station-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.2;
  /* 不换行，超出部分用省略号隐藏 */
  // white-space: nowrap;
  // overflow: hidden;
  // text-overflow: ellipsis;
  // max-width: 450rpx; /* 限制最大宽度，避免占用过多空间 */
}

.distance-section {
  .distance-text {
    font-size: 26rpx;
    color: #5aaaff;
    font-weight: bold;
    // font-weight: 500;
  }

}

/* 第二行：价格与是否自营 space-between布局 */
.price-operate-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.price-section {
  display: flex;
  align-items: baseline;

  .price-symbol {
    font-size: 20rpx;
    color: #666;
    font-weight: bold;
  }
  .price-value {
    font-size: 36rpx;
    color: #F9761C;
    font-weight: bold;
    margin: 0 4rpx;
  }
  .price-unit {
    font-size: 24rpx;
    color: #F9761C;
  }
  
  // 原价显示样式（划线效果）
  .original-price {
    display: flex;
    align-items: baseline;
    margin-left: 16rpx;
    
    .original-price-symbol,
    .original-price-value {
      font-size: 24rpx;
      color: #999;
      text-decoration: line-through;
    }
    
    .original-price-symbol {
      margin-right: 2rpx;
    }
  }
}


/* 第三行：充电桩状态 */
.gun-status-row {
  display: flex;
  gap: 32rpx;
  margin-bottom: 12rpx;
}

.gun-group {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.gun-icon {
  width: 20rpx;
  height: 20rpx;
  border-radius: 4rpx;

  &.gun-icon-super {
    background: #1890ff;
  }

  &.gun-icon-fast {
    background: #fa8c16;
  }
}

 .gun-view {
  display: flex;

  align-items: flex-end;
   .free-gun-text {
     font-size: 22rpx;
     font-weight: 700;
     // color: #161515; // 移除固定颜色，使用动态颜色
     // 调整文字左右间距
     margin-right: 4rpx;
   }
   .super-gun-text {
    font-size: 22rpx;
    font-weight: 700;
    color: #1890FF;
   }
   .super-free-gun-text {
    font-size: 22rpx;
    font-weight: 700;
    color: #2E4DB5;
   }
   .fast-gun-text {
    font-size: 22rpx;
    font-weight: 700;
    color: #FA8C16;
   }
   .fast-free-gun-text {
    font-size: 22rpx;
    font-weight: 700;
    color: #FBA954;
   }
   .slow-free-gun-text {
    font-size: 22rpx;
    font-weight: 700;
    color: #1BA035;
   }
   .slow-gun-text {
    font-size: 22rpx;
    font-weight: 700;
    color: #1BA035;
   }
  
}

/* 通知栏 */
.notice-bar {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  // 设置背景颜色透明度
  opacity: 0.75;
  background: #FFFFFF;
  border-radius: 6rpx;
  padding: 8rpx 8rpx;
  gap: 6rpx;

  margin-top: 10rpx;
  .notice-icon {
    font-size: 20rpx;
    color: #1890ff;
    margin-top: 2rpx; /* 微调图标位置 */
    flex-shrink: 0; /* 防止图标被压缩 */
  }

  .notice-text {
    font-size: 22rpx;
    color: #000;
    flex: 1;
    line-height: 1.4;
    /* 限制显示两行，超出部分省略 */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2; /* 标准属性，提高兼容性 */
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
  }
}

</style>


<template>
  <view class="gun-card">
    <view class="card-header">
      <text class="station-name">{{ stationName }}</text>
      <text class="pile-name">{{ gunData.pilename }}</text>
    </view>
    <view class="card-body">
      <view class="tags">
        <text class="tag">{{ gunData.currentMode }}</text>
        <text class="tag">{{ chargeTypeStr }}</text>
        <text class="tag">额定功率: {{ gunData.ratedPower }}KW</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    gunData: {
      type: Object,
      required: true
    },
    stationName: {
      type: String,
      default: ''
    }
  },
  computed: {
    chargeTypeStr() {
      // powerMode: 3 液冷超充, 2 快充, 1 慢充
      // gunIsSuper: boolean 是否为超充
      if (this.gunData.gunIsSuper || this.gunData.powerMode === 3) {
        return '超充';
      }
      // 这里的判断可能需要根据实际业务逻辑调整
      // 暂时根据 powerMode 来判断
      switch (this.gunData.powerMode) {
        case 1:
          return '慢充';
        case 2:
          return '快充';
        default:
          return '未知类型';
      }
    }
  }
}
</script>

<style scoped>
.gun-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #e0e0e0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.station-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.pile-name {
  font-size: 28rpx;
  color: #666;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag {
  background-color: #f0f0f0;
  color: #555;
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
}
</style>

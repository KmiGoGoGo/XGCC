<template>
  <view class="busy-container">
    <view class="info-card">
      <view class="info-row">
        <text class="label">站点名称:</text>
        <text class="value">{{ pileInfo.stationName }}</text>
      </view>
      <view class="info-row">
        <text class="label">充电桩名称:</text>
        <text class="value">{{ pileInfo.pileName }}</text>
      </view>
      <view class="info-row">
        <text class="label">充电桩编号:</text>
        <text class="value">{{ pileInfo.pileNo }}</text>
      </view>
      <view class="status-message">
        <text class="status-title">{{ statusTitle }}</text>
        <text class="status-description">{{ statusDescription }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    pileInfo: {
      type: Object,
      required: true
    },
    mainGunState: {
      type: Number,
      required: true
    }
  },
  computed: {
    statusTitle() {
      switch (this.mainGunState) {
        case 2:
          return '充电中';
        case 4: // 假设4为离线状态
          return '离线';
        default:
          return '设备占用';
      }
    },
    statusDescription() {
      switch (this.mainGunState) {
        case 2:
          return '当前设备正在使用中，暂时无法使用，请更换其他电枪或电桩！';
        case 4: // 假设4为离线状态
          return '当前充电设备已经离线，暂时无法使用，请更换其他电枪或者电桩！';
        default:
          return '当前设备正被占用，暂时无法使用，请更换其他电枪或电桩！';
      }
    }
  }
}
</script>

<style scoped>
.busy-container {
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.info-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  width: 100%;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}
.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 28rpx;
  padding: 10rpx 0;
}
.label {
  color: #666;
}
.value {
  color: #333;
  text-align: right;
}
.status-message {
  margin-top: 40rpx;
  text-align: center;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
}
.status-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff5500;
  display: block;
  margin-bottom: 16rpx;
}
.status-description {
  font-size: 28rpx;
  color: #333;
}
</style>

<template>
  <view class="busy-container">
    <!-- Status Section -->
    <view class="status-section">
      <view class="status-content">
        <text class="status-title">{{ statusTitle }}</text>
        <text class="status-description">{{ statusDescription }}</text>
      </view>
    </view>

    <!-- Device Info Card -->
    <view class="info-card">
      <view class="info-row">
        <text class="label">充电站点</text>
        <text class="value">{{ pileInfo.stationName }}</text>
      </view>
      <view class="info-row">
        <text class="label">充电桩名称</text>
        <text class="value">{{ pileInfo.pileName }}</text>
      </view>
      <view class="info-row last-row">
        <text class="label">充电桩编号</text>
        <text class="value">{{ pileInfo.pileNo }}</text>
      </view>
    </view>

    <!-- Fixed Bottom Button -->
    <view class="fixed-bottom-wrapper">
      <button class="fixed-button" @click="handleViewOtherGuns">
        查看其他可用充电枪
      </button>
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
        case 3:
          return '充电中';
        case 4: // 假设4为离线状态
          return '离线';
        default:
          return '设备占用';
      }
    },
    statusDescription() {
      console.log(this.mainGunState);
      switch (this.mainGunState) {
        case 3:
          return '当前设备正在使用中，暂时无法使用，请更换其他电枪或电桩！';
        case 4:
          return '当前设备正在使用中，暂时无法使用，请更换其他电枪或电桩！';
        case 5: // 假设4为离线状态
          return '当前充电设备已经离线，暂时无法使用，请更换其他电枪或者电桩！';
        default:
          return '当前设备正被占用，暂时无法使用，请更换其他电枪或电桩！';
      }
    }
  },
  methods: {
    handleViewOtherGuns() {
      uni.navigateBack();
    }
  }
}
</script>

<style scoped>
.busy-container {
  background-color: #f5f5f5;
  padding: 64rpx 48rpx 160rpx;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Status Section */
.status-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 64rpx;
  text-align: center;
  margin-bottom: 64rpx;
}

.status-icon-wrapper {
  width: 224rpx;
  height: 224rpx;
  background-color: rgba(255, 152, 0, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon {
  font-size: 120rpx;
  line-height: 1;
}

.status-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  max-width: 960rpx;
}

.status-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
  letter-spacing: -0.03em;
}

.status-description {
  font-size: 32rpx;
  font-weight: 400;
  color: #666666;
  line-height: 1.5;
  max-width: 768rpx;
}

/* Device Info Card */
.info-card {
  background-color: #ffffff;
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid rgba(0, 0, 0, 0.08);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
  gap: 48rpx;
}

.info-row.last-row {
  border-bottom: none;
}

.label {
  color: #999999;
  font-size: 28rpx;
  font-weight: 400;
  line-height: 1.5;
  flex-shrink: 0;
}

.value {
  color: #333333;
  font-size: 28rpx;
  font-weight: 500;
  line-height: 1.5;
  text-align: right;
  flex: 1;
  word-break: break-all;
}

/* Fixed Bottom Button */
.fixed-bottom-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32rpx 48rpx;
  background-color: #fff;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.fixed-button {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #1890ff 0%, #0066cc 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 48rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(24, 144, 255, 0.3);
  transition: all 0.3s ease;
}

.fixed-button::after {
  border: none;
}

.fixed-button:active {
  opacity: 0.85;
  transform: scale(0.98);
}
</style>

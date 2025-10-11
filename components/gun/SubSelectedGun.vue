<template>
  <view v-if="gunInfo" class="gun-info-card">
    <view style="display: flex; align-items: center; justify-content: space-between;">
        <view style="width: 80%;">
            <view class="gun-info-header">
                <view style="display: flex; align-items: start; gap: 24rpx; flex-direction: column;">
                    <text class="gun-title">{{ gunTitle }}</text>
                    <text class="station-name">{{ stationName }}</text>
                    <view style="display: flex; align-items: center; gap: 8rpx;">
                        <uv-tags type="primary" size="mini" shape="circle" plain plainFill :text="getGunTypeText(gunInfo.powerMode)"></uv-tags>
                        <uv-tags type="primary" size="mini" shape="circle" plainFill plain :text="gunInfo.currentMode"></uv-tags>
                    </view>
                </view>
            </view>
        </view>
        <view style="width: 20%;" class="gun-status">
            <uv-loading-icon timing-function="linear"></uv-loading-icon>
        </view>
    </view>
    
    <view>
        <uv-divider></uv-divider>
        <view class="gun-info-details">
            <view class="info-row">
                <text class="label">最大功率:</text>
                <text class="value">{{ gunInfo.maxPower }}kW</text>
            </view>
            <view>
                <uv-tags :bgColor="getGunStateText(gunInfo.gunState) === '请插枪' ? '#A0CFFF' : '#54C51D'" shape="circle" :borderColor="getGunStateText(gunInfo.gunState) === '请插枪' ? '#A0CFFF' : '#54C51D'" :text="getGunStateText(gunInfo.gunState)"></uv-tags>
            </view>
        </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SubSelectedGun',
  props: {
    // 枪信息对象
    gunInfo: {
      type: Object,
      default: null
    },
    // 站台名称
    stationName: {
      type: String,
      default: ''
    },
    // 自定义标题
    customTitle: {
      type: String,
      default: ''
    },
    // 是否显示删除按钮
    showDeleteBtn: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    // 枪标题
    gunTitle() {
      if (this.customTitle) {
        return this.customTitle;
      }
      
      return `${this.gunInfo.gunName}`;
    }
  },
  methods: {
    // 获取枪类型文本
    getGunTypeText(gunType) {
      switch (parseInt(gunType)) {
        case 3: return '超充';
        case 2: return '快充';
        case 1: return '慢充';
        default: return '未知';
      }
    },
    getGunStateText(gunState) {
      switch (parseInt(gunState)) {
        case 1: return '请插枪';
        case 2: return '等待启动充电';
        default: return '未知';
      }
    },
    // 处理删除按钮点击
    handleDelete() {
      this.$emit('delete');
    }
  }
}
</script>

<style scoped>
/* 枪信息卡片样式 */
.gun-info-card {
  border: 1rpx solid #E0F0FF;
  border-radius: 24rpx;
  padding: 24rpx;
  margin: 12rpx 0;
  /* flex: 1; */
  display: flex;
  border-left: 4rpx solid #52c41a;
  flex-direction: column;
}

.gun-info-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
  gap: 36rpx;
  padding: 16rpx;
}

.station-name {
  font-size: 24rpx;
  color: #666;
  /* 不换行，超出部分用省略号隐藏 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300rpx;
}

.gun-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.delete-btn {
  background-color: #ff4d4f;
  color: #ffffff;
  padding: 2rpx 8rpx;
  border-radius: 50%;
  font-size: 16rpx;
  width: 28rpx;
  height: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8rpx;
}

.gun-info-details {
  padding-top: 6rpx;
  display: flex;
  justify-content: space-between;
}

.info-row {
  display: flex;
  align-items: center;
  padding: 4rpx 0;
}

.info-row .label {
  font-size: 24rpx;
  color: #666;
}

.info-row .value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.gun-status {   
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

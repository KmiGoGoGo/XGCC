<template>
  <view v-if="gunInfo" class="gun-info-card">
    <!-- 顶部区域：枪名称、标签和功率信息 -->
    <view class="gun-header">
      <view class="gun-title-section">
        <text class="gun-title">{{ gunTitle }}</text>
        <view class="tags-container">
          <Tag :backgroundColor="getPowerTagClass(gunInfo.powerMode)" borderRadius="20rpx">
            <text class="tag-text" :class="getTagTextClass(gunInfo.powerMode)">{{ getGunTypeText(gunInfo.powerMode) }}</text>
          </Tag>
          <!-- <Tag backgroundColor="#FFB366" borderRadius="20rpx">
            <text class="tag-text">直流</text>
          </Tag> -->
          <Tag backgroundColor="#F3F4F6" borderRadius="20rpx">
            <text class="tag-text" style="color: #000;">{{ gunInfo.maxPower }}kW</text>
          </Tag>
        </view>
      </view>
    </view>
    
    <!-- 底部区域：充电状态 -->
    <view class="status-section">
      <view class="status-content">
        <view class="status-icon">
        </view>
        <text class="status-text">{{ getGunStateText(gunInfo.gunState) }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import Tag from '../common/Tag.vue';
export default {
  name: 'SubSelectedGun',
  components: {
    Tag
  },
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
  onLoad() {
    console.log('onLoad1111111');
    console.log(this.gunInfo);
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
    // 获取功率标签背景色类名
    getPowerTagClass(powerMode) {
      console.log(powerMode);
      switch (parseInt(powerMode)) {
        case 1: return '#F0F9F2';
        case 2: return '#FAEBDD';
        case 3: return '#DBEAFE';
        default: return '#F0F9F2';
      }
    },
    // 获取标签文字颜色类名
    getTagTextClass(powerMode) {
      switch (parseInt(powerMode)) {
        case 1: return 'tag-text-slow';
        case 2: return 'tag-text-fast';
        case 3: return 'tag-text-super';
        default: return 'tag-text-default';
      }
    },
    // 获取状态标签背景色类名
    getStatusTagClass(gunState) {
      switch (parseInt(gunState)) {
        case 1: return 'status-tag-blue';
        case 2: return 'status-tag-green';
        default: return 'status-tag-default';
      }
    },
    // 获取状态文字颜色类名
    getStatusTextClass(gunState) {
      switch (parseInt(gunState)) {
        case 1: return 'status-text-blue';
        case 2: return 'status-text-green';
        default: return 'status-text-default';
      }
    },
    getGunStateText(gunState) {
      switch (parseInt(gunState)) {
        case 1: return '请插枪';
        case 2: return '等待启动充电';
        case 3: return '充电中';
        case 4: return '充电完成';
        default: return '未知状态';
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
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* 顶部区域：枪名称、标签和功率信息 */
.gun-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
}

.gun-title-section {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start; 
  justify-content: flex-start;
  gap: 16rpx;
}

.gun-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  line-height: 1.2;
}

.tags-container {
  display: flex;
  flex-direction: row;
  gap: 12rpx;
  align-items: center;
}

.power-tag {
  border-radius: 20rpx;
  padding: 8rpx 16rpx;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 慢充 - 绿色 */
.power-tag-slow {
  background-color: #52c41a;
}

/* 快充 - 浅蓝色 */
.power-tag-fast {
  background-color: #87CEEB;
}

/* 超充 - 蓝色 */
.power-tag-super {
  background-color: #1890ff;
}

/* 默认 - 灰色 */
.power-tag-default {
  background-color: #d9d9d9;
}

.tag-text {
  font-size: 24rpx;
  font-weight: bold;
  color: #ffffff;
}

.tag-text-slow {
  color: #1BA035;
}
.tag-text-fast {
  color: #FA8C16;
}
.tag-text-super {
  color: #2E4DB5;
}

.dc-tag {
  background-color: #FFB366;
  border-radius: 20rpx;
  padding: 8rpx 16rpx;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.power-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.power-desc {
  font-size: 24rpx;
  color: #666666;
  line-height: 1.2;
}

.power-value-container {
  background-color: #f5f5f5;
  border-radius: 20rpx;
  padding: 8rpx 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.power-value {
  font-size: 24rpx;
  font-weight: bold;
  color: #333333;
}

/* 底部区域：充电状态 */
.status-section {
  background-color: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  font-size: 32rpx;
  color: #52c41a;
}

.status-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #52c41a;
  line-height: 1.2;
}
</style>

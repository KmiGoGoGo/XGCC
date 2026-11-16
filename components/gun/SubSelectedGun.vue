<template>
  <view v-if="gunInfo" class="gun-info-card">
    <!-- 顶部区域：枪名称、标签、功率信息与状态 -->
    <view class="gun-header">
      <view class="gun-title-section">
        <text class="gun-title">{{ stationName + '-' + gunTitle }}</text>
        <view class="tags-row">
          <view class="tags-container">
            <Tag :backgroundColor="getPowerTagClass(gunInfo.powerMode)" borderRadius="20rpx">
              <text class="tag-text" :class="getTagTextClass(gunInfo.powerMode)">{{
                  getGunTypeText(gunInfo.powerMode)
                }}
              </text>
            </Tag>
            <!-- <Tag backgroundColor="#FFB366" borderRadius="20rpx">
              <text class="tag-text">直流</text>
            </Tag> -->
            <Tag backgroundColor="#F3F4F6" borderRadius="20rpx">
              <text class="tag-text" style="color: #000;">{{ gunInfo.maxPower }}kW</text>
            </Tag>
            <!-- 插枪状态：与功率标签同款外观，用颜色区分 -->
            <Tag :backgroundColor="plugStatusBackground(gunInfo.gunState)" borderRadius="20rpx">
              <text class="tag-text" :class="plugStatusTextClass(gunInfo.gunState)">{{
                  plugStatusText(gunInfo.gunState)
                }}
              </text>
            </Tag>
            <!-- 站点停车优惠 -->
            <Tag v-if="parkingText" backgroundColor="#EBF2FF" borderRadius="20rpx">
              <text class="tag-text tag-text-parking">{{ parkingText }}</text>
            </Tag>
          </view>
          <!-- 已绑定车牌：新能源绿牌样式（粤B·88888）；未绑定：虚线「绑定车牌」 -->
          <view v-if="plateNo" class="plate-badge" @click="handleManageVehicle">
            <text class="plate-char">{{ plateHead }}</text>
            <text class="plate-char">{{ plateLetter }}</text>
            <text class="plate-dot">·</text>
            <text class="plate-char">{{ plateRest }}</text>
          </view>
          <view v-else class="plate-bind" @click="handleManageVehicle">
            <text class="plate-bind-plus">＋</text>
            <text>绑定车牌</text>
          </view>
        </view>
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
    },
    // 当前绑定车牌
    plateNo: {
      type: String,
      default: ''
    },
    // 站点停车优惠文案，如「免停2小时」
    parkingText: {
      type: String,
      default: ''
    }
  },
  computed: {
    // 枪标题
    gunTitle() {
      if (this.customTitle) {
        return this.customTitle;
      }

      return `${this.gunInfo.gunName}`;
    },
    // 车牌拆段：省份简称 / 字母 / 序号，中间显示「·」
    plateHead() {
      return (this.plateNo || '').slice(0, 1);
    },
    plateLetter() {
      return (this.plateNo || '').slice(1, 2);
    },
    plateRest() {
      return (this.plateNo || '').slice(2);
    }
  },
  onLoad() {
    console.log('onLoad1111111');
    console.log(this.gunInfo);
  },
  methods: {
    // 点击车牌进入车辆管理
    handleManageVehicle() {
      this.$emit('manage-vehicle');
    },
    // 插枪状态标签文案
    plugStatusText(gunState) {
      switch (parseInt(gunState)) {
        case 2:
          return '已插枪';
        case 3:
          return '充电中';
        case 4:
          return '充电完成';
        default:
          return '请插枪';
      }
    },
    // 插枪状态标签底色
    plugStatusBackground(gunState) {
      switch (parseInt(gunState)) {
        case 2:
        case 3:
          return '#EEF5FF';
        case 4:
          return '#F3F4F6';
        default:
          return '#FCEBEB';
      }
    },
    // 插枪状态标签文字颜色类
    plugStatusTextClass(gunState) {
      switch (parseInt(gunState)) {
        case 2:
        case 3:
          return 'tag-text-plug-ready';
        case 4:
          return 'tag-text-plug-done';
        default:
          return 'tag-text-plug-wait';
      }
    },
    // 获取枪类型文本
    getGunTypeText(gunType) {
      switch (parseInt(gunType)) {
        case 3:
          return '超充';
        case 2:
          return '快充';
        case 1:
          return '慢充';
        default:
          return '未知';
      }
    },
    // 获取功率标签背景色类名
    getPowerTagClass(powerMode) {
      switch (parseInt(powerMode)) {
        case 1:
          return '#F0F9F2';
        case 2:
          return '#FAEBDD';
        case 3:
          return '#DBEAFE';
        default:
          return '#F0F9F2';
      }
    },
    // 获取标签文字颜色类名
    getTagTextClass(powerMode) {
      switch (parseInt(powerMode)) {
        case 1:
          return 'tag-text-slow';
        case 2:
          return 'tag-text-fast';
        case 3:
          return 'tag-text-super';
        default:
          return 'tag-text-default';
      }
    },
    // 获取状态标签背景色类名
    getStatusTagClass(gunState) {
      switch (parseInt(gunState)) {
        case 1:
          return 'status-tag-blue';
        case 2:
          return 'status-tag-green';
        default:
          return 'status-tag-default';
      }
    },
    getGunStateText(gunState) {
      switch (parseInt(gunState)) {
        case 1:
          return '请插枪';
        case 2:
          return '等待启动充电';
        case 3:
          return '充电中';
        case 4:
          return '充电完成';
        default:
          return '未知状态';
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
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
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
  flex: 1;
  min-width: 0;
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

.tags-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
}

.tags-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12rpx;
  align-items: center;
  /* 不撑满：标签宽度自适应，车牌才能紧贴标签（无免停标签时左移） */
  flex: 0 1 auto;
  min-width: 0;
}

/* 模拟车牌：新能源绿牌样式，点击进入车辆管理 */
.plate-badge {
  flex-shrink: 0;
  margin-left: 12rpx;
  height: 44rpx;
  padding: 0 12rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #A5DE73 0%, #35A46A 100%);
  border: 1rpx solid #FFFFFF;
  border-radius: 6rpx;
  box-shadow: 0 2rpx 6rpx rgba(53, 164, 106, 0.25);
  font-size: 22rpx;
  font-weight: 500;
  color: #FFFFFF;
  letter-spacing: 1rpx;
  white-space: nowrap;
}

/* 车牌中间的圆点：与车牌同字号，保证能看清 */
.plate-dot {
  margin: 0 2rpx;
  font-size: 22rpx;
  font-weight: bold;
  line-height: 1;
  color: #FFFFFF;
}

/* 未绑定车牌：灰色虚线框，点击进入车辆列表 */
.plate-bind {
  flex-shrink: 0;
  margin-left: 12rpx;
  height: 44rpx;
  padding: 0 12rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background: #FFFFFF;
  border: 1rpx dashed #C0C7D2;
  border-radius: 6rpx;
  font-size: 22rpx;
  font-weight: 500;
  color: #6B7280;
  white-space: nowrap;
}

.plate-bind-plus {
  margin-right: 4rpx;
  font-size: 22rpx;
  color: #8B93A1;
}

/* 免停标签文字色：提高优先级，避免被后面的 .tag-text 白色覆盖 */
.tag-text.tag-text-parking {
  color: #2E6BE6;
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

/* 插枪状态标签配色：与功率标签同款，仅颜色区分 */
.tag-text-plug-wait {
  color: #E24B4A;
}

.tag-text-plug-ready {
  color: #1E6FE8;
}

.tag-text-plug-done {
  color: #8A8A8E;
}
</style>

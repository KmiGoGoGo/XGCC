<template>
  <view class="selected-gun-section">
    <!-- 主枪信息 -->
    <SubSelectedGun 
      :gun-info="selectedMainGun"
      :station-name="pileInfo.stationName"
    />
    
    
  </view>
</template>

<script>
import { getPileDTOByNo } from '@/api/pile.js';
import SubSelectedGun from './SubSelectedGun.vue';
import globalData from '@/globalData.js';

export default {
  name: 'SelectedGun',
  components: {
    SubSelectedGun
  },
  props: {
    // 充电桩信息
    pileInfo: {
      type: Object,
      default: () => ({})
    },
    // 主枪参数（从路由传入）
    mainGunParams: {
      type: Object,
      default: () => ({})
    },
    // 充电桩编号
    pileNo: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      selectedSecondaryGun: null, // 选中的从枪
      showGunSelection: false, // 是否显示枪选择列表
      statusTimer: null // 定时器
    };
  },
  mounted() {
    // 组件挂载时启动定时器
    this.startStatusPolling();
  },
  beforeDestroy() {
    // 组件销毁前清除定时器
    this.clearStatusPolling();
  },
  computed: {
    // 选中的主枪（优先从路由参数获取，否则从pileInfo第一个枪）
    selectedMainGun() {
      if (this.mainGunParams.gunId && this.pileInfo) {
        // 从pileInfo中找到对应的枪
        const gun = this.pileInfo.gunDTOList?.find(g => g.gunid === this.mainGunParams.gunId);
        if (gun) {
          return {
            ...gun,
            gunName: this.mainGunParams.gunName,
            maxPower: this.mainGunParams.maxPower || gun.maxPower
          };
        }
      }
      // 默认选择第一个可用的枪
      return this.pileInfo?.gunDTOList?.[0] || null;
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
    // 获取枪状态样式类
    getStatusClass(gunState) {
      switch (gunState) {
        case 1: return 'status-idle';
        case 2: return 'status-busy';
        case 3: return 'status-fault';
        default: return 'status-unknown';
      }
    },
    // 获取枪状态文本
    getStatusText(gunState) {
      switch (gunState) {
        case 1: return '空闲';
        case 2: return '充电中';
        case 3: return '故障';
        default: return '未知';
      }
    },
    // 切换枪选择显示
    toggleGunSelection() {
      this.showGunSelection = !this.showGunSelection;
    },
    // 启动状态轮询定时器
    startStatusPolling() {
      if (!this.pileNo) {
        console.warn('SelectedGun: pileNo为空，无法启动状态轮询');
        return;
      }
      
      this.updateGunStatus();
      
      // 清除现有定时器
      this.clearStatusPolling();
      
      // 设置定时器，每5秒执行一次
      this.statusTimer = setInterval(() => {
        this.updateGunStatus();
      }, 10000);
      
      console.log('SelectedGun: 状态轮询定时器已启动');
    },
    
    // 清除状态轮询定时器
    clearStatusPolling() {
      if (this.statusTimer) {
        clearInterval(this.statusTimer);
        this.statusTimer = null;
        console.log('SelectedGun: 状态轮询定时器已清除');
      }
    },
    
    // 更新充电枪状态
    async updateGunStatus() {
      try {
        const params = {
          pileNo: this.pileNo,
          kycContent: '',
          sellerId: globalData.sellerId,
          platformNo: 'null',
          hulianinterfaceId: 'null'
        };
        
        const response = await getPileDTOByNo(params);
        
        if (response.code === 0 && response.data && response.data.gunDTOList) {
          const gunList = response.data.gunDTOList;
          
          // 更新主枪状态
          if (this.selectedMainGun) {
            const mainGunUpdate = gunList.find(gun => gun.gunid === this.selectedMainGun.gunid);
            // 更新pileInfo中的主枪状态
            this.$emit('gun-status-updated', {
              gunId: this.selectedMainGun.gunid,
              newState: mainGunUpdate.gunState,
              type: 'main'
            });
            console.log(`主枪${this.selectedMainGun.gunid}状态更新: ${this.selectedMainGun.gunState} -> ${mainGunUpdate.gunState}`);
          }
        }
      } catch (error) {
        console.error('SelectedGun: 更新充电枪状态失败:', error);
      }
    }
  },
  
  watch: {
    // 监听pileNo变化，重新启动定时器
    pileNo(newVal, oldVal) {
      if (newVal !== oldVal) {
        console.log('SelectedGun: pileNo变化，重启定时器', newVal);
        this.startStatusPolling();
      }
    }
  }
}
</script>

<style scoped>
.selected-gun-section {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 4rpx;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.add-gun-button {
  margin-top: 20rpx;
  background-color: #e0f0ff;
  color: #007aff;
  border: none;
  border-radius: 12rpx;
  padding: 16rpx;
  width: 100%;
}


/* 可选枪列表样式 */
.available-guns {
  margin-top: 16rpx;
}

.section-subtitle {
  font-size: 26rpx;
  font-weight: bold;
  color: #666;
  margin-bottom: 12rpx;
}

.gun-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.gun-item {
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 12rpx;
  background-color: #fafafa;
}

.gun-item.disabled {
  opacity: 0.5;
  background-color: #f5f5f5;
}

.gun-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.gun-name {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.gun-power-mode-small {
  background-color: #007AFF;
  color: #ffffff;
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
  font-size: 18rpx;
}

.gun-item-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gun-power {
  font-size: 22rpx;
  color: #666;
}

.gun-status {
  font-size: 20rpx;
  padding: 2rpx 6rpx;
  border-radius: 4rpx;
}

.status-idle {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-busy {
  background-color: #fff7e6;
  color: #fa8c16;
}

.status-fault {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.status-unknown {
  background-color: #f5f5f5;
  color: #999;
}
</style>

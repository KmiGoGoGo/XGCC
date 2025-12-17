<template>
  <view class="page-container">
    <safe-area>
      <uv-navbar autoBack fixed title="充电枪列表" bgColor="transparent" :placeholder="true"
                 :safeAreaInsetTop="true"></uv-navbar>
      <!-- 顶部Tab -->
      <view class="subsection-container">
        <uv-subsection
            :list="updatedSubsectionList"
            :current="activeTab"
            mode="button"
            activeColor="#007aff"
            inactiveColor="#999999"
            bgColor="#F4F9FE"
            :bold="true"
            custom-style="height: 80rpx;border-radius: 10rpx;margin-bottom: 20rpx;"
            custom-item-style="border-radius: 10rpx; box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);"
            @change="changeTab">
        </uv-subsection>
      </view>
      <!-- 枪数量信息卡片 -->
      <view class="gun-state-cards">
        <view class="card-item">
          <text class="card-label">总枪数</text>
          <text class="card-value">{{ gunState.sum || 0 }}</text>
        </view>
        <view class="card-item">
          <text class="card-label">空闲枪</text>
          <text class="card-value free">{{ gunState.free || 0 }}</text>
        </view>
        <view class="card-item">
          <text class="card-label">充电中</text>
          <text class="card-value charging">{{ gunState.charging || 0 }}</text>
        </view>
        <view class="card-item">
          <text class="card-label">将充满</text>
          <text class="card-value about-finish">{{ gunState.aboutFinish || 0 }}</text>
        </view>
      </view>

      <!-- 枪列表 -->
      <view class="gun-list">
        <station-gun-list-item
            v-for="gun in filteredGunList"
            :key="gun.gunId"
            :gun-info="gun"
            @click="goToDetails(gun)"
            @debug-state-change="handleDebugStateChange"
            @debug-soc-change="handleDebugSOCChange"
        />
      </view>
    </safe-area>
  </view>
</template>

<script>
import {
  getStationGunState,
  getStationGunDetails,
  getStationGunList
} from '@/api/stationGun.js'
import stationGunListItem from '@/components/station/stationGunListItem.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import globalData from '@/globalData';

export default {
  components: {
    stationGunListItem,
    SafeArea
  },
  data() {
    return {
      stationId: '', // 接收路由参数
      dataType: 0, // 接收路由参数
      hulianinterfaceId: '', // 接收路由参数
      gunState: {},
      gunList: [],
      activeTab: 0,
      // 保留原有的tabs数组用于逻辑处理
      tabs: [{
        name: '全部',
        type: 0 // 0 代表全部
      }, {
        name: '超充',
        type: 3 // gunType for Super Charge
      }, {
        name: '快充',
        type: 1 // gunType for Fast Charge
      }, {
        name: '慢充',
        type: 2 // gunType for Slow Charge
      }],
      chartData: {},
    }
  },
  computed: {
    filteredGunList() {
      const currentType = this.tabs[this.activeTab].type
      if (currentType === 0) {
        return this.gunList
      }
      return this.gunList.filter(gun => gun.gunType === currentType)
    },
    // 计算不同充电类型枪的数量
    gunTypeCounts() {
      const counts = {
        all: this.gunList.length,      // 全部
        fast: 0,                      // 快充 (gunType = 1)
        slow: 0,                      // 慢充 (gunType = 2)
        super: 0                      // 超充 (gunType = 3)
      }

      this.gunList.forEach(gun => {
        switch (gun.gunType) {
          case 1:
            counts.fast++
            break
          case 2:
            counts.slow++
            break
          case 3:
            counts.super++
            break
        }
      })

      return counts
    },
    // 更新subsectionList中的数量显示
    updatedSubsectionList() {
      return [
        {name: `全部(${this.gunTypeCounts.all})`, count: this.gunTypeCounts.all},
        {name: `超充(${this.gunTypeCounts.super})`, count: this.gunTypeCounts.super},
        {name: `快充(${this.gunTypeCounts.fast})`, count: this.gunTypeCounts.fast},
        {name: `慢充(${this.gunTypeCounts.slow})`, count: this.gunTypeCounts.slow}
      ]
    }
  },
  onLoad(options) {
    // 如果通过路由传递了stationId，则使用它
    if (options.stationId) {
      this.stationId = options.stationId;
    } else {
      uni.showToast({
        title: '缺少必要参数',
        icon: 'none'
      });
      uni.navigateBack();
    }
    if (options.hulianinterfaceId) {
      this.hulianinterfaceId = options.hulianinterfaceId;
    }
    this.fetchStationGunData()
  },
  onShareAppMessage() {
    return {
      title: this.getWxAppName(),
      path: '/pages/station/stationGunList?stationId=' + this.stationId
    }
  },
  onShareTimeline() {
    return {
      title: this.getWxAppName(),
      path: '/pages/station/stationGunList?stationId=' + this.stationId
    }
  },
  methods: {
    getWxAppName() {
      return globalData.wxAppName;
    },
    async fetchStationGunData() {
      const params = {
        stationId: this.stationId,
        dataType: 0
      }

      try {
        uni.showLoading({title: '加载中...'});
        const [stateRes, listRes] = await Promise.all([
          getStationGunState(params),
          getStationGunList(params)
        ])

        if (stateRes.code === 0) {
          this.gunState = stateRes.data
        }

        if (listRes.code === 0) {
          this.gunList = listRes.data
        }
      } catch (error) {
        console.error('获取充电枪数据失败', error)
        uni.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    updateChart() {
    },
    changeTab(index) {
      this.activeTab = index
    },
    async goToDetails(gun) {
      // 判断是否有token，没有则跳转到登录页面
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.navigateTo({
          url: '/pages/login/login'
        });
        return
      }
      uni.showLoading({
        title: "加载中"
      })
      const res = await getStationGunDetails({
        gunId: gun.gunId
      });
      uni.hideLoading()
      console.log("res", res)
      if (res.code === 0) {
        const gunParams = {
          gunNo: res.data.gunNo,
          pileNum: res.data.pileNum,
        };
        const queryString = Object.keys(gunParams)
            .map(key => `${key}=${encodeURIComponent(gunParams[key] || '')}`)
            .join('&');

        uni.navigateTo({
          url: `/pages/charge/gunStartingCharge?${queryString}`
        });
      } else {
        uni.showToast({
          title: res.msg || '加载失败',
          icon: 'none'
        });
      }
    },

    /**
     * @description: 调试用 - 处理枪状态切换
     */
    handleDebugStateChange(data) {
      const {gunId, newState} = data
      const gunIndex = this.gunList.findIndex(gun => gun.gunId === gunId)

      if (gunIndex !== -1) {
        // 更新枪状态
        this.gunList[gunIndex].gunState = newState

        // 强制更新组件
        this.$forceUpdate()

        console.log(`调试: 枪 ${gunId} 状态已切换为 ${newState}`)
      }
    },

    /**
     * @description: 调试用 - 处理SOC百分比调整
     */
    handleDebugSOCChange(data) {
      const {gunId, delta} = data
      const gunIndex = this.gunList.findIndex(gun => gun.gunId === gunId)

      if (gunIndex !== -1) {
        // 更新SOC百分比
        const currentSOC = this.gunList[gunIndex].currentSOC || 0
        const newSOC = Math.max(0, Math.min(100, currentSOC + delta))
        this.gunList[gunIndex].currentSOC = newSOC

        // 强制更新组件
        this.$forceUpdate()

        console.log(`调试: 枪 ${gunId} SOC已调整为 ${newSOC}%`)
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
  background: linear-gradient(to bottom, #E5F6FF 0%, #F3F3F3 10%);
}

/* uv-subsection组件容器样式 */
.subsection-container {
  padding: 0 20rpx;
}

/* 枪数量信息卡片样式 */
.gun-state-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  margin-bottom: 30rpx;
  padding: 0 20rpx;
}

.card-item {
  background-color: #fff;
  border-radius: 25rpx;
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.04);
}

.card-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.card-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  line-height: 1;
}

.card-value.free {
  color: #14B8A6;
}

.card-value.charging {
  color: #3B82F6;
}

.card-value.about-finish {
  color: #22C55E;
}

.gun-list {
  padding-bottom: 40rpx; /* 减少底部内边距 */
  padding: 0 20rpx;
}
</style>

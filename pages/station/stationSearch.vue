<template>
  <view class="page-container">
    <uv-navbar :border="false" title="搜索站点" :autoBack="false" placeholder safeAreaInsetTop @leftClick="handleNavBack"></uv-navbar>
    <!-- 搜索头部 -->
    <view class="search-header">
      <view class="search-content">
        <view class="city-picker" @click="goToCityPicker">
          <text style="color: #333;">{{ currentCityName }}</text>
          <uv-icon style="margin-top: 5rpx;" name="arrow-down" color="#333" size="14"></uv-icon>
        </view>
        <view class="search-input-container">
          <uv-search
              v-model="searchKeyword"
              :showAction="true"
              placeholder="请输入站点名称"
              @search="onSearch"
              @custom="onSearch"
              actionText="搜索"
              :actionStyle="{
              color: '#000',
            }"
              :boxStyle="{
              borderRadius: '20rpx'
            }"
          ></uv-search>
        </view>
      </view>
    </view>

    <view style="padding: 20rpx;">
      <!-- 主内容区域 -->
      <scroll-view
          class="content-container"
          scroll-y="true"
          @scrolltolower="loadMore"
      >
        <!-- 历史搜索 -->
        <view class="history-section">
          <view class="section-title">
            <text>历史搜索</text>
            <text class="clear-history" v-if="searchHistory.length > 0" @click="clearHistory">清空</text>
          </view>
          <view class="history-tags" v-if="searchHistory.length > 0">
            <view
                class="history-tag"
                v-for="(item, index) in searchHistory"
                :key="index"
                @click="selectHistoryKeyword(item)"
            >
              <text>{{ item }}</text>
            </view>
          </view>
          <view class="empty-history" v-else>
            <text class="empty-history-text">暂无搜索历史</text>
          </view>
        </view>

        <!-- 搜索结果 -->
        <view class="search-results" v-if="stationList.length > 0">
          <view class="section-title">
            <text>搜索结果 ({{ totalCount }})</text>
          </view>
          <view class="station-list">
            <StationListItem
                v-for="(station, index) in stationList"
                :key="station.id"
                :stationData="formatStationData(station)"
                @click="onStationClick"
            />
          </view>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-if="showEmptyState">
          <view class="empty-icon">🔍</view>
          <text class="empty-text">{{ emptyText }}</text>
        </view>

      </scroll-view>
    </view>
  </view>
</template>

<script>
import StationListItem from '../../components/station/StationListItem.vue'
import {getStationPage} from '../../api/station.js'
import { handleNavBack } from '@/utils/utils';
import globalData from '@/globalData';

export default {
  name: 'StationSearch',
  components: {
    StationListItem
  },
  data() {
    return {
      searchKeyword: '',
      stationList: [],
      searchHistory: [],
      loading: false,
      refreshing: false,
      pageNo: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
      hasMoreData: true,
      currentCityName: '东莞市', // 当前城市名称
      // 位置信息 - 可以从全局状态或上个页面获取
      currentLocation: {
        latitude: 23.02067,
        longitude: 113.75179,
        areaId: 100278,
        areaName: '东莞市'
      }
    }
  },
  computed: {
    showEmptyState() {
      return !this.loading && this.searchKeyword && this.stationList.length === 0
    },
    showLoadMore() {
      return this.stationList.length > 0 && (this.loading || this.hasMoreData)
    },
    emptyText() {
      return this.searchKeyword ? `未找到"${this.searchKeyword}"相关站点` : '请输入关键词搜索站点'
    },
    loadMoreText() {
      if (this.loading) {
        return '加载中...'
      }
      return this.hasMoreData ? '上拉加载更多' : '没有更多数据了'
    }
  },
  async onLoad() {
    this.loadSearchHistory()
    await this.loadLocationInfo()
    await this.initCityInfo()
    // 城市信息初始化完成后执行搜索
    await this.searchStations()
  },
  async onShow() {
    // 页面显示时重新加载城市信息，以便从城市选择页面返回时更新
    await this.initCityInfo()
    // 城市信息初始化完成后执行搜索
    await this.searchStations()
  },
  onShareAppMessage() {
    return {
      title: this.getWxAppName(),
      path: '/pages/index/index'
    }
  },
  onShareTimeline() {
    return {
      title: this.getWxAppName(),
      path: '/pages/index/index'
    }
  },
  methods: {
    handleNavBack,
    getWxAppName() {
      return globalData.wxAppName;
    },
    // 跳转到城市选择页面
    goToCityPicker() {
      uni.navigateTo({
        url: `/pages/common/cityPicker`
      });
    },

    // 初始化城市信息
    async initCityInfo() {
      try {
        const savedCityName = uni.getStorageSync('currentCityName');
        if (savedCityName) {
          this.currentCityName = savedCityName;
          console.log('从storage加载城市名称:', savedCityName);
        } else {
          console.log('使用默认城市名称:', this.currentCityName);
        }

        // 同时更新currentLocation中的areaName
        this.currentLocation.areaName = this.currentCityName;
        const currentCity = uni.getStorageSync('currentCity');
        this.currentLocation.areaId = currentCity.cityId;
        this.currentLocation.latitude = currentCity.latitude;
        this.currentLocation.longitude = currentCity.longitude;
      } catch (error) {
        console.error('初始化城市信息失败:', error);
      }
    },

    // 搜索方法
    async onSearch() {
      if (this.searchKeyword.trim()) {
        // 保存搜索历史
        this.saveToHistory(this.searchKeyword)
      }


      // 重置分页
      this.pageNo = 1
      this.stationList = []
      this.hasMoreData = true

      await this.searchStations()
    },

    // 执行搜索
    async searchStations() {
      if (this.loading) return

      this.loading = true

      try {
        const requestData = {
          keyword: this.searchKeyword || '', // 允许空关键词搜索
          areaName: this.currentLocation.areaName,
          latitude: this.currentLocation.latitude,
          longitude: this.currentLocation.longitude,
          areaId: this.currentLocation.areaId,
          current: this.pageNo,
          pageSize: this.pageSize,
          sellerNo: globalData.sellerNo,
          sortMode: 0,
          appointment: false,
          freeParking: false,
          idle: false,
          memberQueryPreferenceDto: {}
        }

        const response = await getStationPage(requestData)

        if (response && response.code === 0) {
          const data = response.data
          this.totalCount = data.totalCount
          this.totalPages = data.pages || Math.ceil(data.totalCount / this.pageSize)

          if (this.pageNo === 1) {
            this.stationList = data.data || []
          } else {
            this.stationList.push(...(data.data || []))
          }

          // 检查是否还有更多数据
          this.hasMoreData = this.pageNo < this.totalPages
        } else {
          uni.showToast({
            title: response?.msg || '搜索失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('搜索站点失败:', error)
        uni.showToast({
          title: '搜索失败，请重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },

    // 格式化站点数据以适配StationListItem组件
    formatStationData(station) {
      return {
        id: station.id,
        name: station.name,
        // 价格处理 - API返回的是 currentPriceStr
        currentPriceStr: station.currentPriceStr || '0.00',
        // 距离处理
        distanceDouble: station.distanceDouble || 0,
        // 充电桩数量
        superGunFastCount: station.superGunFastCount || 0,
        superFastFreeGunCount: station.superFastFreeGunCount || 0,
        fastGunCount: station.fastGunCount || 0,
        fastFreeGunCount: station.fastFreeGunCount || 0,
        slowGunCount: station.slowGunCount || 0,
        slowFreeGunCount: station.slowFreeGunCount || 0,
        // 其他属性
        notice: station.notice,
        businessTime: station.businessTime || ['营业时间未知'],
        status: station.status || 1,
        isRepair: station.isRepair || 1,
        isCollection: station.isCollection || false,
        // 超充站判断
        superStation: station.superStation || false,
        fastSlow: station.fastSlow,
        // 合作信息
        hulianId: station.hulianId,
        // 地址信息
        address: station.address,
        area: station.area,
        areaId: station.areaId,
        latitude: station.latitude,
        longitude: station.longitude
      }
    },

    // 加载更多
    async loadMore() {
      if (!this.hasMoreData || this.loading || !this.searchKeyword) {
        return
      }

      this.pageNo += 1
      await this.searchStations()
    },

    // 下拉刷新
    async onRefresh() {
      if (!this.searchKeyword) {
        this.refreshing = false
        return
      }

      this.refreshing = true
      this.pageNo = 1
      this.stationList = []
      this.hasMoreData = true
      await this.searchStations()
    },

    // 选择历史关键词
    selectHistoryKeyword(keyword) {
      this.searchKeyword = keyword
      this.onSearch()
    },

    // 保存搜索历史
    saveToHistory(keyword) {
      if (!keyword || !keyword.trim()) return

      // 去重并限制历史记录数量
      const history = this.searchHistory.filter(item => item !== keyword)
      history.unshift(keyword)

      // 最多保存5条历史记录
      this.searchHistory = history.slice(0, 5)

      // 保存到本地存储
      uni.setStorage({
        key: 'stationSearchHistory',
        data: this.searchHistory
      })
    },

    // 加载搜索历史
    loadSearchHistory() {
      try {
        uni.getStorage({
          key: 'stationSearchHistory',
          success: (res) => {
            if (res.data && Array.isArray(res.data)) {
              this.searchHistory = res.data
            }
          },
          fail: (error) => {
            console.log('搜索历史为空或加载失败:', error)
            this.searchHistory = []
          }
        })
      } catch (error) {
        console.error('加载搜索历史失败:', error)
        this.searchHistory = []
      }
    },

    // 清空历史
    clearHistory() {
      uni.showModal({
        title: '确认清空',
        content: '确定要清空所有搜索历史吗？',
        success: (res) => {
          if (res.confirm) {
            this.searchHistory = []
            uni.removeStorage({
              key: 'stationSearchHistory'
            })
            uni.showToast({
              title: '已清空',
              icon: 'success'
            })
          }
        }
      })
    },

    // 加载位置信息
    async loadLocationInfo() {
      // 这里可以从全局状态、页面参数或存储中获取位置信息
      try {
        const locationInfo = uni.getStorageSync('currentLocation')
        if (locationInfo) {
          this.currentLocation = {
            ...this.currentLocation,
            ...locationInfo
          }
        }
      } catch (error) {
        console.error('加载位置信息失败:', error)
      }
    },

    // 站点点击事件
    onStationClick(stationData) {
      // 跳转到站点详情页
      let tagList = '';
      if (stationData.tag1) {
        tagList += stationData.tag1.map(item => item.tagName).join(',');
      }
      if (stationData.tag2) {
        if (stationData.tag1) {
          tagList += ',';
        }
        tagList += stationData.tag2.map(item => item.tagName).join(',');
      }
      console.log(`/pages/station/stationDetails?id=${stationData.id}&tagList=${tagList}`)
      uni.navigateTo({
        url: `/pages/station/stationDetails?id=${stationData.id}&tagList=${tagList}`
      });
    }
  }
}
</script>

<style lang="less" scoped>
.page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.search-header {
  background-color: #fff;
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.search-content {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.city-picker {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  background-color: #f8f9fa;

  text {
    font-size: 28rpx;
    font-weight: 500;
  }

  &:active {
    background-color: #e9ecef;
  }
}

.search-input-container {
  flex: 1;
}

.content-container {
  flex: 1;
  display: flex;
}

.history-section {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;

  text {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }

  .clear-history {
    font-size: 24rpx !important;
    color: #999 !important;
    font-weight: normal !important;
  }
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.history-tag {
  background-color: #f8f9fa;
  border: 1rpx solid #e9ecef;
  border-radius: 24rpx;
  padding: 12rpx 24rpx;

  text {
    font-size: 26rpx;
    color: #666;
  }

  &:active {
    background-color: #e9ecef;
  }
}

.empty-history {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;

  .empty-history-text {
    font-size: 28rpx;
    color: #999;
  }
}

.search-results {
  .section-title {
    margin-bottom: 20rpx;
  }
}

.station-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 20rpx;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
    text-align: center;
  }
}

.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  gap: 16rpx;

  .load-text {
    font-size: 26rpx;
    color: #999;
  }
}
</style>

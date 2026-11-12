<template>
  <view class="details-container">
    <uv-navbar :border="false" :autoBack="false" placeholder safeAreaInsetTop @leftClick="handleNavBack">
      <template v-slot:right>
        <view style="margin-right: 200rpx; margin-bottom: 5rpx;">
          <CustomerServiceButton
              session-from="integral_details_page"
              custom-class="server-icon-wrapper"
          />
        </view>
      </template>
    </uv-navbar>
    <!-- 筛选区域 -->
    <view class="filter-section">
      <view class="tabs">
        <view
            class="tab-item"
            :class="{ active: activeTab === tab.type }"
            v-for="tab in tabs"
            :key="tab.type"
            @click="changeTab(tab.type)"
        >
          {{ tab.name }}
        </view>
      </view>
      <view class="time-selector">
        <text>请选择时间 ▼</text>
      </view>
    </view>

    <!-- 统计信息 -->
    <view class="summary-section">
      <text class="summary-item increase">增加 +{{ formatValue(summary.positive) }}</text>
      <text class="summary-item decrease">扣减 {{ formatValue(summary.negative) }}</text>
    </view>

    <!-- 明细列表 -->
    <view class="list-section">
      <view v-for="item in detailsList" :key="item.id" class="list-item">
        <view class="item-left">
          <text class="item-source">{{ item.remark || '消费' }}</text>
          <text class="item-date">{{ item.createTime }}</text>
        </view>
        <view class="item-right">
          <text class="item-change" :class="item.integralChange > 0 ? 'increase' : 'decrease'">
            {{ item.integralChange > 0 ? '+' : '' }}{{ formatValue(item.integralChange) }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {getIntegralDetail, getIntegralSum} from '@/api/integral.js';
import {contactCustomerService as contactCustomerServiceFn, handleNavBack} from '@/utils/utils'
import CustomerServiceButton from '@/components/common/CustomerServiceButton.vue';
import globalData from '@/globalData';

export default {
  components: {
    CustomerServiceButton
  },
  data() {
    return {
      tabs: [
        {name: '全部', type: null},
        {name: '增加', type: 1},
        {name: '扣减', type: 2},
      ],
      activeTab: null, // null-全部, 1-增加, 2-扣减
      detailsList: [],
      summary: {
        positive: 0,
        negative: 0
      },
      pagination: {
        current: 1,
        size: 20,
        total: 0
      }
    };
  },
  onLoad() {
    this.loadData();
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
    /**
     * @description 切换筛选标签
     * @param {number|null} type - 标签类型
     */
    changeTab(type) {
      this.activeTab = type;
      this.resetAndLoad();
    },
    /**
     * @description 重置数据并重新加载
     */
    resetAndLoad() {
      this.detailsList = [];
      this.pagination.current = 1;
      this.loadData();
    },
    /**
     * @description 加载所有数据
     */
    async loadData() {
      uni.showLoading({title: '加载中...'});
      try {
        const params = {
          current: this.pagination.current,
          size: this.pagination.size,
          type: this.activeTab,
          startTime: null, // 可扩展
          endTime: null,   // 可扩展
        };

        // 并行获取明细和总计
        const [detailsRes, sumRes] = await Promise.all([
          getIntegralDetail(params),
          getIntegralSum({startTime: params.startTime, endTime: params.endTime})
        ]);

        if (detailsRes.code === 0) {
          this.detailsList = [...this.detailsList, ...detailsRes.data.records];
          this.pagination.total = detailsRes.data.total;
        }

        if (sumRes.code === 0) {
          this.summary = sumRes.data;
        }

      } catch (error) {
        console.error('加载积分明细数据失败:', error);
        uni.showToast({title: '数据加载失败', icon: 'none'});
      } finally {
        uni.hideLoading();
      }
    },
    /**
     * @description 格式化数值，除以1000并保留两位小数
     * @param {number} value
     * @returns {string}
     */
    formatValue(value) {
      if (typeof value !== 'number') return '0.00';
      return (value / 1000).toFixed(2);
    },
    contactCustomerService() {
      contactCustomerServiceFn()
    }
  },
  // 页面触底加载更多
  onReachBottom() {
    if (this.detailsList.length < this.pagination.total) {
      this.pagination.current++;
      this.loadData();
    }
  }
};
</script>

<style scoped>
.details-container {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 16rpx;
}

/* 筛选区域 */
.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx;
  background-color: white;
  border-radius: 16rpx;
}

.tabs {
  display: flex;
  gap: 16rpx;
}

.tab-item {
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  font-size: 28rpx;
  background-color: #f0f0f0;
  color: #333;
  border: 1rpx solid #eee;
}

.tab-item.active {
  background-color: #00c777;
  color: white;
  border-color: #00c777;
}

.time-selector {
  font-size: 28rpx;
  color: #333;
}

/* 统计信息 */
.summary-section {
  display: flex;
  gap: 32rpx;
  padding: 24rpx 16rpx;
}

.summary-item {
  font-size: 28rpx;
  color: #666;
}

.summary-item.increase {
  color: #00c777;
}

/* 列表 */
.list-section {
  background-color: white;
  border-radius: 16rpx;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.list-item:last-child {
  border-bottom: none;
}

.item-left, .item-right {
  display: flex;
  flex-direction: column;
}

.item-left {
  align-items: flex-start;
}

.item-right {
  align-items: flex-end;
}

.item-source {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.item-date {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.item-change {
  font-size: 32rpx;
  font-weight: bold;
}

.item-change.increase {
  color: #00c777;
}

.item-change.decrease {
  color: #ff4d4f;
}
</style>

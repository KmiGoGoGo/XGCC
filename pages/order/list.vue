<template>
  <view class="order-list-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrapper">
        <uv-input 
          v-model="searchKeyword"
          placeholder="输入站点名称/桩号搜索"
          border="none"
          fontSize="28rpx"
          prefixIcon="search"
          prefixIconStyle="font-size: 28rpx; color: #666;"
          :customStyle="searchInputStyle"
          @input="onSearchInput"
          @confirm="onSearchConfirm"
        />
      </view>
      <view class="filter-wrapper" @click="toggleFilter">
        <text class="filter-icon">筛选</text>
      </view>
    </view>
    
    <!-- 筛选弹窗 -->
    <uv-popup 
      ref="filterPopup"
      mode="bottom" 
      :round="20"
      :customStyle="{ height: '60%', padding: '20rpx' }"
      @change="onFilterPopupChange"
    >
      <view class="filter-popup">
        <view class="filter-header">
          <text class="filter-title">筛选条件</text>
          <view class="filter-actions">
            <text class="reset-btn" @click="resetFilter">重置</text>
            <text class="confirm-btn" @click="confirmFilter">确定</text>
          </view>
        </view>
        
        <FilterOptions 
          :data="startTimeOptions"
          :defaultValue="filterParams.startTimeKey"
          @change="onStartTimeChange"
        />
        
        <FilterOptions 
          :data="endTimeOptions"
          :defaultValue="filterParams.endTimeKey"
          @change="onEndTimeChange"
        />
      </view>
    </uv-popup>

    <!-- 状态标签栏 -->
    <view class="status-tabs">
      <view
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        v-for="tab in tabs"
        :key="tab.key"
        @click="changeTab(tab.key)"
      >
        {{ tab.name }}
      </view>
    </view>

    <!-- 超时占位订单提示 -->
    <view class="occupy-banner" v-if="occupyCount > 0" @click="goToOccupyPage">
      <text>超时占位订单 ({{ occupyCount }})</text>
      <text class="arrow">></text>
    </view>

    <!-- 订单列表 -->
    <view class="order-list">
      <view class="order-card" v-for="order in orderList" :key="order.id">
        <view class="card-header">
          <text class="station-name">{{ order.stationName }}</text>
          <text class="order-status" @click="goToDetails(order)">{{ order.billTypeStr }} ></text>
        </view>
        <view class="card-body">
          <text class="info-line">时间：{{ formatTimeRange(order.timeS, order.timeE) }}</text>
          <text class="info-line">订单编号：{{ order.busShowNo }}</text>
        </view>
        <view class="card-footer">
          <text class="amount">¥ {{ formatAmount(order.actualBalance) }}</text>
          <view class="actions">
            <!-- 充电中时不显示任何按钮 -->
            <template v-if="!isCharging(order.billStatus)">
              <view class="action-btn btn-secondary" @click="goToComment(order.id)">评价</view>
              <!-- 待结算时只显示再次充电按钮 -->
              <view 
                v-if="isSettling(order.billStatus)" 
                class="action-btn btn-primary"
                @click="recharge"
              >
                再次充电
              </view>
              <!-- 待支付时显示立即支付按钮 -->
              <view 
                v-if="isUnpaid(order.billStatus)" 
                class="action-btn btn-primary"
                @click="goToPay(order.billid, order.busId)"
              >
                立即支付
              </view>
            </template>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getMyOccupyBillPage, myBillPage } from '@/api/bill.js';
import FilterOptions from '@/components/FilterOptions/FilterOptions.vue';
export default {
  components: {
    FilterOptions
  },
  data() {
    return {
      tabs: [
        { name: '全部订单', key: 'all', statuses: null },
        { name: '充电中', key: 'charging', statuses: [4] },
        { name: '待结算', key: 'settling', statuses: [5, 6, 7, 8, 9] },
        { name: '待支付', key: 'unpaid', statuses: [11, 12, 13] },
      ],
      activeTab: 'all',
      occupyCount: 0,
      orderList: [],
      pagination: {
        current: 1,
        size: 10,
        total: 0
      },
      // 搜索相关
      searchKeyword: '',
      searchInputStyle: {
        backgroundColor: '#fff',
        borderRadius: '30rpx',
        padding: '10rpx 20rpx'
      },
      // 筛选相关
      showFilter: false,
      filterParams: {
        startTimeKey: null,
        endTimeKey: null,
        startTime: null,
        endTime: null
      },
      // 开始时间选项
      startTimeOptions: {
        name: '开始时间',
        list: [
          { value: '今天', key: 'today' },
          { value: '昨天', key: 'yesterday' },
          { value: '近7天', key: 'last7days' },
          { value: '近30天', key: 'last30days' },
          { value: '自定义', key: 'custom' }
        ]
      },
      // 结束时间选项
      endTimeOptions: {
        name: '结束时间',
        list: [
          { value: '今天', key: 'today' },
          { value: '昨天', key: 'yesterday' },
          { value: '近7天', key: 'last7days' },
          { value: '近30天', key: 'last30days' },
          { value: '自定义', key: 'custom' }
        ]
      }
    };
  },
  onLoad(options) {
    // 检查路由参数，设置默认选中的状态
    if (options.activeTab) {
      this.activeTab = options.activeTab;
      // 重置分页和订单列表
      this.orderList = [];
      this.pagination.current = 1;
    }
    this.loadData();
  },
  methods: {
    /**
     * @description 加载页面数据
     */
    async loadData() {
      uni.showLoading({ title: '加载中...' });
      try {
        const activeStatuses = this.tabs.find(t => t.key === this.activeTab)?.statuses;

        const [occupyRes, billRes] = await Promise.all([
          getMyOccupyBillPage({ current: 1, pageSize: 10 }),
          myBillPage({
            current: this.pagination.current,
            size: this.pagination.size,
            billStatusList: activeStatuses,
            // 其他筛选条件
            startTime: this.filterParams.startTime,
            endTime: this.filterParams.endTime,
            memberType: 1,
            searchBarCondition: this.searchKeyword,
            version: 1,
          })
        ]);

        if (occupyRes.code === 0) {
          this.occupyCount = occupyRes.data.total;
        }
		
        console.log(billRes);
        if (billRes.code === 0) {
          this.orderList = [...this.orderList, ...billRes.data.records];
          this.pagination.total = billRes.data.total;
        }

      } catch (error) {
        console.error('加载订单数据失败:', error);
        uni.showToast({ title: '数据加载失败', icon: 'none' });
      } finally {
        uni.hideLoading();
      }
    },
    /**
     * @description 切换状态标签
     */
    changeTab(tabKey) {
      this.activeTab = tabKey;
      this.orderList = [];
      this.pagination.current = 1;
      this.loadData();
    },
    /**
     * @description 格式化金额 (分 -> 元)
     */
    formatAmount(amount) {
      if (typeof amount !== 'number') return '0.00';
      return (amount / 100).toFixed(2);
    },
    /**
     * @description 格式化时间范围
     */
    formatTimeRange(start, end) {
      if (!start || !end) return '';
      const startTime = start.split(' ')[1].substring(0, 5);
      const endTime = end.split(' ')[1].substring(0, 5);
      const startDate = start.split(' ')[0];
      return `${startDate} ${startTime} ~ ${endTime}`;
    },
    /**
     * @description 跳转到占位订单页面
     */
    goToOccupyPage() {
      uni.navigateTo({
        url: '/pages/order/occupy'
      });
    },
    /**
     * @description 跳转到订单详情页面
     */
    goToDetails(order) {
      const { id, billStatus, busId, gunId, isCharging, gunNumber, pileNumber, pileId } = order;
      console.log('order', order);
      if (billStatus === 4 || isCharging) {
        uni.navigateTo({
          url: `/pages/charge/charging?billId=${id}&busId=${busId}&gunId=${gunId}&gunNo=${gunNumber}&pileNo=${pileNumber}&pileId=${pileId}&animationEnabled=false`
        });
      } else {
        uni.navigateTo({
          url: `/pages/bill/settlementInfo?billId=${id}`
        });
      }
    },
    /**
     * @description 判断订单是否为充电中状态
     */
    isCharging(billStatus) {
      return [4].includes(billStatus);
    },
    /**
     * @description 判断订单是否为待结算状态
     */
    isSettling(billStatus) {
      return [5, 6, 7, 8, 9, 14].includes(billStatus);
    },
    /**
     * @description 判断订单是否为待支付状态
     */
    isUnpaid(billStatus) {
      return [11, 12, 13].includes(billStatus);
    },
    /**
     * @description 跳转到支付页面
     */
    goToPay(billId, busId) {
      if (!billId || !busId) {
        uni.showToast({ title: '订单信息不完整', icon: 'none' });
        return;
      }
      uni.navigateTo({
        url: `/pages/bill/settlementPay?billId=${billId}&busId=${busId}`
      });
    },
    /**
     * @description 再次充电，跳转到首页
     */
    recharge() {
      uni.switchTab({
        url: '/pages/index/index'
      });
    },
    /**
     * @description 跳转到评价页面
     */
    goToComment(billid) {
      uni.navigateTo({
        url: `/pages/bill/comment?billId=${billid}`
      });
    },
    /**
     * @description 搜索输入处理
     */
    onSearchInput(value) {
      this.searchKeyword = value;
    },
    /**
     * @description 搜索确认
     */
    onSearchConfirm() {
      this.orderList = [];
      this.pagination.current = 1;
      this.loadData();
    },
    /**
     * @description 切换筛选弹窗
     */
    toggleFilter() {
      console.log('toggleFilter');
      if (this.showFilter) {
        this.$refs.filterPopup.close();
      } else {
        this.$refs.filterPopup.open('bottom');
      }
    },
    /**
     * @description 开始时间选择
     */
    onStartTimeChange(option) {
      this.filterParams.startTimeKey = option.key;
      this.filterParams.startTime = this.convertTimeKeyToDate(option.key);
    },
    /**
     * @description 结束时间选择
     */
    onEndTimeChange(option) {
      this.filterParams.endTimeKey = option.key;
      this.filterParams.endTime = this.convertTimeKeyToDate(option.key, true);
    },
    /**
     * @description 转换时间key为具体日期
     */
    convertTimeKeyToDate(key, isEndTime = false) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (key) {
        case 'today':
          return isEndTime ? 
            new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString() :
            today.toISOString();
        case 'yesterday':
          const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
          return isEndTime ?
            new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString() :
            yesterday.toISOString();
        case 'last7days':
          const last7days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return isEndTime ? now.toISOString() : last7days.toISOString();
        case 'last30days':
          const last30days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return isEndTime ? now.toISOString() : last30days.toISOString();
        case 'custom':
          // 自定义时间需要额外处理，这里先返回null
          return null;
        default:
          return null;
      }
    },
    /**
     * @description 重置筛选条件
     */
    resetFilter() {
      this.filterParams = {
        startTimeKey: null,
        endTimeKey: null,
        startTime: null,
        endTime: null
      };
      // 重置FilterOptions组件的选择状态
      this.$nextTick(() => {
        // 通过ref调用reset方法（如果组件支持）
      });
    },
    /**
     * @description 确认筛选条件
     */
    confirmFilter() {
      this.$refs.filterPopup.close();
      this.orderList = [];
      this.pagination.current = 1;
      this.loadData();
    },
    /**
     * @description 弹窗状态变化处理
     */
    onFilterPopupChange(e) {
      this.showFilter = e.show;
      console.log('弹窗状态改变：', e);
    }
  },
  onReachBottom() {
    if (this.orderList.length < this.pagination.total) {
      this.pagination.current++;
      this.loadData();
    }
  }
};
</script>

<style scoped>
.order-list-container {
  background-color: #fff;
  min-height: 100vh;
  padding-bottom: 16rpx;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background-color: white;
}
.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 30rpx;
  padding: 10rpx 20rpx;
}
.filter-wrapper {
  margin-left: 24rpx;
  cursor: pointer;
}
.filter-icon {
  font-size: 32rpx;
  color: #333;
}

/* 筛选弹窗样式 */
.filter-popup {
  padding: 20rpx;
}
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  margin-bottom: 24rpx;
}
.filter-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}
.filter-actions {
  display: flex;
  gap: 32rpx;
}
.reset-btn, .confirm-btn {
  font-size: 32rpx;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  cursor: pointer;
}
.reset-btn {
  color: #666;
  border: 1rpx solid #ddd;
}
.confirm-btn {
  color: #fff;
  background-color: #2594FB;
}

/* 状态标签栏 */
.status-tabs {
  display: flex;
  justify-content: space-around;
  padding: 16rpx;
  background-color: white;
}
.tab-item {
  padding: 10rpx 20rpx;
  font-size: 28rpx;
  color: #666;
  border-radius: 30rpx;
}
.tab-item.active {
  background-color: #007aff;
  color: white;
}

/* 超时占位订单提示 */
.occupy-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ff976a;
  color: white;
  padding: 16rpx 24rpx;
  margin: 16rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
}

/* 订单列表 */
.order-list {
  padding: 0 16rpx;
}
.order-card {
  background-color: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #fff;
}
.station-name {
  font-size: 32rpx;
  font-weight: bold;
}
.order-status {
  font-size: 28rpx;
  color: #666;
}
.card-body {
  padding: 16rpx 0;
}
.info-line {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
}
.amount {
  font-size: 36rpx;
  color: #ff4d4f;
  font-weight: bold;
}
.actions {
  display: flex;
  gap: 16rpx;
}
.action-btn {
  padding: 10rpx 24rpx;
  border-radius: 30rpx;
  font-size: 28rpx;
  border: 1rpx solid;
}
.btn-secondary {
  color: #666;
  border-color: #ccc;
}
.btn-primary {
  background-color: #007AFF;
  color: white;
  border-color: #007AFF;
}
</style>

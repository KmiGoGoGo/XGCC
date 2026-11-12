<template>
  <view class="order-list-container">
    <uv-navbar :border="false" title="我的订单" :autoBack="false" placeholder safeAreaInsetTop @leftClick="handleNavBack">
      <template v-slot:right>
        <view style="margin-right: 200rpx; margin-bottom: 5rpx;">
          <CustomerServiceButton
              session-from="order_list_page"
              custom-class="server-icon-wrapper"
          />
        </view>
      </template>
    </uv-navbar>

    <!-- 搜索栏 -->
    <!-- <view class="search-section">
      <view class="search-container">
        <view class="search-input-wrapper">
          <view class="search-icon">
            <text class="icon-search">🔍</text>
          </view>
          <uv-input
            v-model="searchKeyword"
            shape="round"
            placeholder="输入站点名称/桩号搜索"
            border="none"
            fontSize="28rpx"
            :customStyle="searchInputStyle"
            @input="onSearchInput"
            @confirm="onSearchConfirm"
          />
        </view>
      </view>
    </view> -->

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
    <view class="status-tabs-container">
      <view class="status-tabs">
        <view
            class="tab-item"
            :class="{ active: activeTab === tab.key }"
            v-for="tab in tabs"
            :key="tab.key"
            @click="changeTab(tab.key)"
        >
          <text class="tab-text">{{ tab.name }}</text>
        </view>
      </view>
    </view>

    <!-- 超时占位订单提示 -->
    <!-- <view class="occupy-banner" v-if="occupyCount > 0" @click="goToOccupyPage">
      <text>超时占位订单 ({{ occupyCount }})</text>
      <text class="arrow">></text>
    </view> -->

    <!-- 订单列表 -->
    <view class="order-list">
      <!-- 订单列表 -->
      <template v-if="orderList.length > 0">
        <view class="order-card" v-for="order in orderList" :key="order.id" @click="goToDetails(order)">
          <view class="card-content">
            <view class="card-header">
              <text class="station-name">{{ order.stationName }}</text>
              <text class="order-status" :class="getStatusClass(order.billStatus)">
                {{ order.billTypeStr }}
              </text>
            </view>

            <view class="card-body">
              <text class="info-line">时间 {{ formatTimeRange(order.timeS, order.timeE) }}</text>
              <text class="info-line">订单编号 {{ order.busShowNo }}</text>
            </view>

            <view class="card-footer">
              <text class="amount" :class="getAmountClass(order.billStatus)">
                ¥ {{ formatAmount(order.actualBalance) }}
              </text>
              <view class="actions">
                <!-- 充电中时不显示任何按钮 -->
                <template v-if="!isCharging(order.billStatus)">
                  <view class="action-btn btn-secondary" @click.stop="goToComment(order.id)">
                    <text class="btn-text">评价</text>
                  </view>
                  <!-- 待结算时只显示再次充电按钮 -->
                  <view
                      v-if="isSettling(order.billStatus)"
                      class="action-btn btn-primary"
                      @click.stop="recharge"
                  >
                    <text class="btn-text">再次充电</text>
                  </view>
                  <!-- 待支付时显示立即支付按钮 -->
                  <view
                      v-if="isUnpaid(order.billStatus)"
                      class="action-btn btn-primary"
                      @click.stop="goToPay(order.id, order.busId)"
                  >
                    <text class="btn-text">立即支付</text>
                  </view>
                </template>
              </view>
            </view>
          </view>
        </view>
      </template>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <uv-icon name="empty-favor" size="200" color="#cbd5e1"></uv-icon>
        <text class="empty-text">暂无相关订单</text>
      </view>
    </view>
  </view>
</template>

<script>
import {getMyOccupyBillPage, myBillPage} from '@/api/bill.js';
import FilterOptions from '@/components/FilterOptions/FilterOptions.vue';
import {contactCustomerService as contactCustomerServiceFn, handleNavBack} from '@/utils/utils'
import CustomerServiceButton from '@/components/common/CustomerServiceButton.vue';
import globalData from '@/globalData';

export default {
  components: {
    FilterOptions,
    CustomerServiceButton
  },
  data() {
    return {
      tabs: [
        {name: '全部订单', key: 'all', statuses: null},
        {name: '充电中', key: 'charging', statuses: [4]},
        {name: '待结算', key: 'settling', statuses: [5, 6, 7, 8, 9]},
        {name: '待支付', key: 'unpaid', statuses: [11, 12, 13]},
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
        backgroundColor: 'transparent',
        borderRadius: '0',
        padding: '0',
        fontSize: '28rpx',
        color: '#1e293b'
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
          {value: '今天', key: 'today'},
          {value: '昨天', key: 'yesterday'},
          {value: '近7天', key: 'last7days'},
          {value: '近30天', key: 'last30days'},
          {value: '自定义', key: 'custom'}
        ]
      },
      // 结束时间选项
      endTimeOptions: {
        name: '结束时间',
        list: [
          {value: '今天', key: 'today'},
          {value: '昨天', key: 'yesterday'},
          {value: '近7天', key: 'last7days'},
          {value: '近30天', key: 'last30days'},
          {value: '自定义', key: 'custom'}
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
    contactCustomerService() {
      contactCustomerServiceFn()
    },
    /**
     * @description 加载页面数据
     */
    async loadData() {
      uni.showLoading({title: '加载中...'});
      try {
        const activeStatuses = this.tabs.find(t => t.key === this.activeTab)?.statuses;

        const tokenMemberType = uni.getStorageSync('tokenMemberType');
        let memberType = 1;
        if (tokenMemberType && tokenMemberType !== 0) {
          memberType = tokenMemberType;
        }
        const [occupyRes, billRes] = await Promise.all([
          getMyOccupyBillPage({current: 1, pageSize: 10}),
          myBillPage({
            current: this.pagination.current,
            size: this.pagination.size,
            billStatusList: activeStatuses,
            // 其他筛选条件
            startTime: this.filterParams.startTime,
            endTime: this.filterParams.endTime,
            memberType: memberType,
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
        uni.showToast({title: '数据加载失败', icon: 'none'});
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
      const {id, billStatus, busId, gunId, isCharging, gunNumber, pileNum, pileId} = order;
      console.log('order', order);
      if (billStatus === 4 || isCharging) {
        uni.navigateTo({
          url: `/pages/charge/charging?billId=${id}&busId=${busId}&gunId=${gunId}&gunNo=${gunNumber}&pileNo=${pileNum}&animationEnabled=false`
        });
      } else if (billStatus === 11) {
        uni.navigateTo({
          url: `/pages/bill/settlementPay?billId=${id}&busId=${busId}`
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
        uni.showToast({title: '订单信息不完整', icon: 'none'});
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
    },
    /**
     * @description 获取状态样式类
     */
    getStatusClass(billStatus) {
      if (this.isCharging(billStatus)) return 'status-charging';
      if (this.isUnpaid(billStatus)) return 'status-unpaid';
      if (this.isSettling(billStatus)) return 'status-settling';
      return 'status-completed';
    },
    /**
     * @description 获取金额样式类
     */
    getAmountClass(billStatus) {
      if (this.isCharging(billStatus)) return 'amount-charging';
      if (this.isUnpaid(billStatus)) return 'amount-unpaid';
      if (this.isSettling(billStatus)) return 'amount-settling';
      return 'amount-completed';
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
  background-color: #f6f7f8;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 搜索栏 */
.search-section {
  padding: 24rpx 32rpx;
  background-color: white;
}

.search-container {
  width: 100%;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background-color: #f1f3f4;
  border-radius: 24rpx;
  height: 96rpx;
  padding: 0 24rpx;
  transition: all 0.3s ease;
}

.search-input-wrapper:focus-within {
  background-color: #e8f0fe;
  box-shadow: 0 0 0 2rpx rgba(19, 164, 236, 0.2);
}

.search-icon {
  margin-right: 16rpx;
  color: #64748b;
}

.icon-search {
  font-size: 32rpx;
}

/* 筛选弹窗样式 */
.filter-popup {
  padding: 40rpx;
  background-color: white;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 32rpx;
  border-bottom: 1rpx solid #e2e8f0;
  margin-bottom: 32rpx;
}

.filter-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.02em;
}

.filter-actions {
  display: flex;
  gap: 24rpx;
}

.reset-btn, .confirm-btn {
  font-size: 28rpx;
  font-weight: 500;
  padding: 16rpx 32rpx;
  border-radius: 20rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn {
  color: #64748b;
  background-color: #f1f3f4;
  border: none;
}

.reset-btn:hover {
  background-color: #e2e8f0;
}

.confirm-btn {
  color: white;
  background: linear-gradient(135deg, #3b82f6 0%, #13a4ec 100%);
  box-shadow: 0 4rpx 12rpx rgba(19, 164, 236, 0.3);
}

.confirm-btn:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 16rpx rgba(19, 164, 236, 0.4);
}

/* 状态标签栏 */
.status-tabs-container {
  padding: 24rpx 32rpx;
  background-color: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.status-tabs {
  display: flex;
  background-color: #f1f3f4;
  border-radius: 20rpx;
  padding: 8rpx;
  height: 80rpx;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  transition: all 0.3s ease;
  cursor: pointer;
}

.tab-item.active {
  background-color: white;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.tab-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #64748b;
  transition: color 0.3s ease;
}

.tab-item.active .tab-text {
  color: #13a4ec;
  font-weight: 600;
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
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.order-card {
  background-color: white;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.12);
  transform: translateY(-2rpx);
}

.card-content {
  padding: 32rpx;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.station-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.order-status {
  font-size: 28rpx;
  font-weight: 500;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
}

.status-charging {
  color: #3b82f6;
  background-color: #dbeafe;
}

.status-unpaid {
  color: #f59e0b;
  background-color: #fef3c7;
}

.status-settling {
  color: #10b981;
  background-color: #d1fae5;
}

.status-completed {
  color: #10b981;
  background-color: #d1fae5;
}

.card-body {
  margin-bottom: 32rpx;
}

.info-line {
  display: block;
  font-size: 28rpx;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 8rpx;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24rpx;
  border-top: 1rpx solid #e2e8f0;
}

.amount {
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1.2;
}

.amount-charging {
  color: #3b82f6;
}

.amount-unpaid {
  color: #f59e0b;
}

.amount-settling {
  color: #10b981;
}

.amount-completed {
  color: #10b981;
}

.actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  padding: 16rpx 32rpx;
  border-radius: 20rpx;
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  min-width: 120rpx;
  text-align: center;
}

.btn-secondary {
  background-color: #f1f3f4;
  color: #64748b;
  border: none;
}

.btn-secondary:hover {
  background-color: #e2e8f0;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #13a4ec 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(19, 164, 236, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 16rpx rgba(19, 164, 236, 0.4);
}

.btn-text {
  font-size: inherit;
  font-weight: inherit;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 32rpx;
  min-height: 60vh;
}

.empty-text {
  margin-top: 32rpx;
  font-size: 28rpx;
  color: #94a3b8;
  font-weight: 400;
}
</style>

<template>
  <view class="integral-container">
    <uv-navbar :border="false" :autoBack="false" placeholder safeAreaInsetTop @leftClick="handleNavBack">
      <template v-slot:right>
        <view style="margin-right: 200rpx; margin-bottom: 5rpx;">
          <CustomerServiceButton
              session-from="integral_index_page"
              custom-class="server-icon-wrapper"
          />
        </view>
      </template>
    </uv-navbar>

    <!-- 当前积分卡片 -->
    <view class="integral-card">
      <text class="card-title">当前总积分</text>
      <view class="current-integral">
        {{ formattedIntegral }}
      </view>
    </view>

    <!-- 筛选标签页 -->
    <view class="filter-tabs">
      <uv-subsection
          :list="filterTabs"
          :current="activeTab"
          @change="switchTab"
          activeColor="#13a4ec"
          inactiveColor="#6b7280"
          bgColor="#f3f4f6"
          customStyle="height: 80rpx;border-radius: 16rpx;"
          customItemStyle="border-radius: 12rpx;"
      ></uv-subsection>
    </view>

    <!-- 日期选择和汇总信息 -->
    <view class="month-summary">
      <view class="summary-left" @click="openCalendar">
        <text class="month-text">{{ getDateRangeText() }}</text>
        <text class="expand-icon">▼</text>
      </view>
      <view class="summary-right">
        <text class="summary-item">
          增加:
          <text class="increase-amount">+{{ formatSumValue(sumData?.positive) }}</text>
        </text>
        <text class="summary-item">
          扣减:
          <text class="decrease-amount">{{ formatSumValue(sumData?.negative) }}</text>
        </text>
      </view>
    </view>

    <!-- 日历组件 -->
    <uv-calendar
        v-model="showCalendar"
        mode="range"
        ref="calendar"
        :minDate="getMinDate()"
        monthNum="13"
        :maxDate="getMaxDate()"
        :startDate="getStartDate()"
        :endDate="getEndDate()"
        @confirm="onDateRangeChange"
        :showConfirm="true"
        :confirmClosePopup="true"
    ></uv-calendar>

    <!-- 积分明细 -->
    <view class="details-section">
      <scroll-view
          class="scroll-container"
          scroll-y
          @scrolltolower="loadMore"
          :refresher-triggered="refreshing"
          @refresherrefresh="onRefresh"
          :lower-threshold="50"
      >
        <view class="details-list">
          <view v-for="item in integralDetails" :key="item.id" class="detail-item">
            <view class="item-left">
              <text class="source-text">消费</text>
              <text class="date-time">{{ item.createTime }}</text>
            </view>
            <view class="item-right">
              <text
                  class="change-amount"
                  :class="{ 'positive': isPositive(item.integralChange), 'negative': !isPositive(item.integralChange) }"
              >
                {{ formatToDecimal(item.integralChange) }}
              </text>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="!loading && integralDetails.length === 0" class="empty-tip">
          <text>暂无积分记录</text>
        </view>

        <!-- 加载更多提示 -->
        <view v-if="loading" class="loading-tip">
          <text>加载中...</text>
        </view>
        <view v-else-if="!hasMore && integralDetails.length > 0" class="no-more-tip">
          <text>没有更多数据了</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import {getIntegral, getMemberGradeRule, getIntegralDetail, getIntegralSum} from '@/api/integral.js';
import {contactCustomerService as contactCustomerServiceFn, handleNavBack} from '@/utils/utils';
import CustomerServiceButton from '@/components/common/CustomerServiceButton.vue';
import globalData from '@/globalData';

export default {
  components: {
    CustomerServiceButton
  },
  data() {
    return {
      integralInfo: null,
      gradeRule: null,
      integralDetails: [],
      filterTabs: ['全部', '增加', '扣减'],
      activeTab: 0,
      // 日期范围
      startTime: null,
      endTime: null,
      // 分页数据
      currentPage: 1,
      pageSize: 10,
      hasMore: true,
      loading: false,
      // 汇总数据
      sumData: {
        positive: 0,
        negative: 0
      },
      // 日历显示状态
      showCalendar: false,
      // 下拉刷新状态
      refreshing: false
    };
  },
  computed: {
    formattedIntegral() {
      // 格式化当前积分，如果不存在则显示'0'
      return this.integralInfo ? this.integralInfo.consumeIntegral : '0';
    }
  },
  onLoad() {
    this.loadPageData();
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
    openCalendar() {
      this.$refs.calendar.open();
    },
    /**
     * @description 并行加载页面所需的所有数据
     */
    async loadPageData() {
      uni.showLoading({
        title: '加载中...'
      });
      try {
        // 获取实际的日期范围，如果为空则使用默认值
        const actualStartTime = this.startTime
        const actualEndTime = this.endTime

        try {
          const integralRes = await getIntegral();
          if (integralRes.code === 0) {
            this.integralInfo = integralRes.data;
          }
        } catch (error) {
          console.error('加载积分数据失败:', error);
        }

        const [gradeRuleRes, sumRes, detailsRes] = await Promise.all([
          getMemberGradeRule(),
          getIntegralSum({
            startTime: actualStartTime,
            endTime: actualEndTime
          }),
          getIntegralDetail({
            current: 1,
            size: this.pageSize,
            startTime: actualStartTime,
            endTime: actualEndTime,
            type: this.getTypeByTab(this.activeTab)
          })
        ]);


        if (gradeRuleRes.code === 0) {
          this.gradeRule = gradeRuleRes.data;
        }
        if (sumRes.code === 0) {
          this.sumData = sumRes.data;
        }
        if (detailsRes.code === 0) {
          this.integralDetails = detailsRes.data.records;
          this.hasMore = detailsRes.data.records.length >= this.pageSize;
        }

      } catch (error) {
        console.error('加载积分数据失败:', error);
        if (error.code === 2) {
          uni.showToast({title: '请先登录', icon: 'none'});
          return;
        } else {
          uni.showToast({title: '网络错误', icon: 'none'});
          return;
        }
      } finally {
        uni.hideLoading();
      }
    },
    /**
     * @description 将数值格式化为带两位小数的字符串，并添加正负号getSum
     * @param {number} value - 需要格式化的数值
     * @returns {string}
     */
    formatToDecimal(value) {
      if (typeof value !== 'number') {
        return '0.00';
      }
      // 根据用户要求，数值除以1000处理
      const formattedValue = (value / 1000).toFixed(2);
      // 添加正负号
      return value >= 0 ? `+${formattedValue}` : formattedValue;
    },
    /**
     * @description 判断数值是否为正数
     * @param {number} value - 需要判断的数值
     * @returns {boolean}
     */
    isPositive(value) {
      return typeof value === 'number' && value >= 0;
    },
    /**
     * @description 跳转到积分明细页面
     */
    goToDetailsPage() {
      uni.navigateTo({
        url: '/pages/integral/details'
      });
    },
    /**
     * @description 切换筛选标签页
     */
    switchTab(index) {
      this.activeTab = index;
      this.currentPage = 1;
      this.integralDetails = [];
      this.loadIntegralDetails();
    },
    /**
     * @description 根据标签页获取type参数
     */
    getTypeByTab(tabIndex) {
      // 全部=2, 增加=1, 扣减=0
      return [2, 1, 0][tabIndex];
    },
    /**
     * @description 加载积分明细数据
     */
    async loadIntegralDetails() {
      if (this.loading) return;

      this.loading = true;
      try {
        // 获取实际的日期范围，如果为空则使用默认值
        const actualStartTime = this.startTime
        const actualEndTime = this.endTime

        const res = await getIntegralDetail({
          current: this.currentPage,
          size: this.pageSize,
          startTime: actualStartTime,
          endTime: actualEndTime,
          type: this.getTypeByTab(this.activeTab)
        });

        if (res.code === 0) {
          const newRecords = res.data.records;
          if (this.currentPage === 1) {
            this.integralDetails = newRecords;
          } else {
            this.integralDetails = [...this.integralDetails, ...newRecords];
          }
          this.hasMore = newRecords.length >= this.pageSize;
        }
      } catch (error) {
        console.error('加载积分明细失败:', error);
        if (error.code === 2) {
          uni.showToast({title: '请先登录', icon: 'none'});
          return;
        } else {
          uni.showToast({title: '网络错误', icon: 'none'});
          return;
        }
      } finally {
        this.loading = false;
      }
    },
    /**
     * @description 加载更多数据
     */
    loadMore() {
      console.log('loadMore triggered', {
        hasMore: this.hasMore,
        loading: this.loading,
        currentPage: this.currentPage,
        detailsLength: this.integralDetails.length
      });

      if (!this.hasMore || this.loading) {
        console.log('loadMore blocked:', {hasMore: this.hasMore, loading: this.loading});
        return;
      }

      this.currentPage++;
      this.loadIntegralDetails();
    },
    /**
     * @description 日期范围选择回调
     */
    onDateRangeChange(dates) {
      if (dates && dates.length >= 2) {
        this.startTime = dates[0] + ' 00:00:00';
        this.endTime = dates[dates.length - 1] + ' 23:59:59';
        this.currentPage = 1;
        this.integralDetails = [];
        this.loadPageData();
      }
    },
    /**
     * @description 格式化汇总数据（3位小数）
     */
    formatSumValue(value) {
      if (typeof value !== 'number') {
        return '0.000';
      }
      return (value / 1000).toFixed(3);
    },
    /**
     * @description 获取日期范围显示文本
     */
    getDateRangeText() {
      const startDate = this.getStartDate();
      const endDate = this.getEndDate();
      const startMonth = startDate.substring(0, 7);
      const endMonth = endDate.substring(0, 7);

      if (startMonth === endMonth) {
        return startMonth;
      } else {
        return `${startMonth} - ${endMonth}`;
      }
    },
    /**
     * @description 下拉刷新
     */
    async onRefresh() {
      this.refreshing = true;
      this.currentPage = 1;
      this.integralDetails = [];
      await this.loadPageData();
      this.refreshing = false;
    },
    /**
     * @description 计算最小日期（当前时间减去一年）
     * @returns {string} 格式为 YYYY-MM-DD 的日期字符串
     */
    getMinDate() {
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      return this.formatDate(oneYearAgo);
    },
    /**
     * @description 计算最大日期（当前时间）
     * @returns {string} 格式为 YYYY-MM-DD 的日期字符串
     */
    getMaxDate() {
      const now = new Date();
      return this.formatDate(now);
    },
    /**
     * @description 格式化日期为 YYYY-MM-DD 格式
     * @param {Date} date - 需要格式化的日期对象
     * @returns {string} 格式化后的日期字符串
     */
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    /**
     * @description 获取开始日期，如果startTime为空则返回当月1号
     * @returns {string} 格式为 YYYY-MM-DD 的日期字符串
     */
    getStartDate() {
      if (this.startTime) {
        return this.startTime.split(' ')[0];
      }
      // 如果startTime为空，返回当月1号
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return this.formatDate(firstDayOfMonth);
    },
    /**
     * @description 获取结束日期，如果endTime为空则返回当天
     * @returns {string} 格式为 YYYY-MM-DD 的日期字符串
     */
    getEndDate() {
      if (this.endTime) {
        return this.endTime.split(' ')[0];
      }
      // 如果endTime为空，返回当天
      const now = new Date();
      return this.formatDate(now);
    },
    /**
     * @description 获取默认开始时间（当月1号 00:00:00）
     * @returns {string} 格式为 YYYY-MM-DD HH:mm:ss 的时间字符串
     */
    getDefaultStartTime() {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return this.formatDate(firstDayOfMonth) + ' 00:00:00';
    },
    /**
     * @description 获取默认结束时间（当天 23:59:59）
     * @returns {string} 格式为 YYYY-MM-DD HH:mm:ss 的时间字符串
     */
    getDefaultEndTime() {
      const now = new Date();
      return this.formatDate(now) + ' 23:59:59';
    },
    // 联系客服
    contactCustomerService() {
      contactCustomerServiceFn();
    }
  }
};
</script>

<style scoped>
.integral-container {
  min-height: 100vh;
  background-color: #f6f7f8;
  padding: 0;
}

/* 当前积分卡片 */
.integral-card {
  background: linear-gradient(135deg, #13a4ec 0%, #60a5fa 100%);
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  margin: 32rpx;
  box-shadow: 0 16rpx 32rpx rgba(19, 164, 236, 0.2);
}

.card-title {
  font-size: 32rpx;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

.current-integral {
  font-size: 96rpx;
  font-weight: 700;
  color: white;
  margin-top: 16rpx;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

/* 筛选标签页 */
.filter-tabs {
  padding: 0 32rpx 24rpx;
  background-color: white;
}

/* 月份汇总信息 */
.month-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  background-color: white;
  border-bottom: 1rpx solid #e5e7eb;
}

.summary-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.calendar-icon {
  font-size: 32rpx;
  color: #6b7280;
}

.month-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #374151;
}

.expand-icon {
  font-size: 24rpx;
  color: #6b7280;
}

.summary-right {
  display: flex;
  gap: 32rpx;
}

.summary-item {
  font-size: 28rpx;
  color: #6b7280;
}

.increase-amount {
  font-weight: 500;
  color: #10b981;
}

.decrease-amount {
  font-weight: 500;
  color: #6b7280;
}

/* 积分明细 */
.details-section {
  flex: 1;
  background-color: #f6f7f8;
  height: calc(100vh - 400rpx); /* 减去顶部固定内容的高度 */
}

.scroll-container {
  height: 100%;
}

.details-list {
  background-color: white;
}

.loading-tip, .no-more-tip, .empty-tip {
  text-align: center;
  padding: 32rpx;
  color: #6b7280;
  font-size: 28rpx;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f3f4f6;
}

.detail-item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.item-right {
  text-align: right;
}

.source-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #111827;
}

.date-time {
  font-size: 28rpx;
  color: #6b7280;
}

.change-amount {
  font-size: 36rpx;
  font-weight: 700;
}

.change-amount.positive {
  color: #10b981;
}

.change-amount.negative {
  color: #ef4444;
}

.server-icon-wrapper {
  width: 55rpx;
  height: 55rpx;
  border-radius: 50%;
  background-color: #FEFFFF;
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

<template>
  <view class="records-page">
    <uv-navbar :border="false" title="账户账单" autoBack placeholder safeAreaInsetTop>
      <template v-slot:right>
        <view style="margin-right: 200rpx; margin-bottom: 5rpx;">
          <CustomerServiceButton
              session-from="records_page"
              custom-class="server-icon-wrapper"
          />
        </view>
      </template>
    </uv-navbar>

    <!-- 顶部筛选区域 -->
    <!-- <view class="top-filter-bar">
      <view class="month-selector">
        <text class="month-text">{{ currentMonth }}</text>
        <text class="dropdown-icon">▼</text>
      </view>
    </view> -->

    <!-- 统计信息卡片 -->
    <view class="stats-container" v-if="stats">
      <view class="stats-grid">
        <view class="stat-card">
          <text class="stat-label">充值</text>
          <text class="stat-value income">{{ formattedChargeTotal }}</text>
        </view>
        <view class="stat-card">
          <text class="stat-label">奖励</text>
          <text class="stat-value neutral">{{ formattedAwardTotal }}</text>
        </view>
        <view class="stat-card">
          <text class="stat-label">消费</text>
          <text class="stat-value spending">{{ formattedConsumptionTotal }}</text>
        </view>
        <view class="stat-card">
          <text class="stat-label">退款</text>
          <text class="stat-value neutral">{{ formattedRefundTotal }}</text>
        </view>
      </view>
    </view>

    <!-- 分段控制器：使用 uv-subsection -->
    <view class="subsection-container">
      <uv-subsection
          :list="subsectionList"
          mode="subsection"
          :current="subsectionCurrent"
          @change="onSubsectionChange"
      ></uv-subsection>
    </view>

    <!-- 日期范围选择 -->
    <view class="date-filter-bar">
      <view class="date-display" @click="openCalendar">
        <text class="date-text">{{ dateRangeText }}</text>
        <text class="dropdown-icon">▼</text>
      </view>
    </view>

    <!-- 记录列表 -->
    <view class="records-container">
      <view class="record-item" v-for="item in records" :key="item.id">
        <!-- <view class="record-icon" :class="getIconClass(item.eventNameStr)">
          <text class="icon-symbol">{{ getIconSymbol(item.eventNameStr) }}</text>
        </view> -->
        <view class="record-content">
          <text class="record-title">{{ item.eventNameStr }}</text>
          <text class="record-time">{{ item.createTime }}</text>
        </view>
        <view class="record-amount">
          <text class="amount-value"
                :class="{'income': item.amountChange.startsWith('+'), 'spending': item.amountChange.startsWith('-')}">
            {{ formatCurrency(item.amountChange, true) }}
          </text>
          <text class="balance-text">余额: {{ formatCurrency(item.accountBalance) }}</text>
        </view>
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
  </view>
</template>

<script>
import {
  getAccountFlowPage
} from '@/api/member.js';
import {contactCustomerService as contactCustomerServiceFn} from '@/utils/utils';
import CustomerServiceButton from '@/components/common/CustomerServiceButton.vue';
import globalData from '@/globalData';

export default {
  components: {
    CustomerServiceButton
  },
  data() {
    return {
      stats: null,
      records: [],
      currentMonth: `${new Date().getFullYear()}年${String(new Date().getMonth() + 1).padStart(2, '0')}月`,
      subsectionList: ['全部', '充值', '奖励', '消费', '退费'],
      subsectionCurrent: 0, // 0..4 对应 tab 1..5
      showCalendar: false,
      startTime: null,
      endTime: null,
    };
  },
  computed: {
    formattedChargeTotal() {
      return this.stats ? this.formatCurrency(this.stats.chargeTotalStr) : '+0.00';
    },
    formattedAwardTotal() {
      return this.stats ? this.formatCurrency(this.stats.awardTotalStr) : '+0.00';
    },
    formattedConsumptionTotal() {
      return this.stats ? this.formatCurrency(this.stats.consumptionTotalStr) : '-0.00';
    },
    formattedRefundTotal() {
      return this.stats ? this.formatCurrency(this.stats.refundTotalStr) : '-0.00';
    },
    dateRangeText() {
      const startDate = this.getStartDate();
      const endDate = this.getEndDate();
      if (startDate === endDate) {
        return startDate;
      }
      const startMonth = startDate.substring(0, 7);
      const endMonth = endDate.substring(0, 7);
      if (startMonth === endMonth) {
        return startMonth;
      }
      return `${startDate} 至 ${endDate}`;
    }
  },
  onShareAppMessage() {
    return {
      title: this.getWxAppName(),
      path: '/pages/account/records'
    }
  },
  onShareTimeline() {
    return {
      title: this.getWxAppName(),
      path: '/pages/account/records'
    }
  },
  async onLoad() {
    this.startTime = this.getDefaultStartTime();
    this.endTime = this.getDefaultEndTime();
    this.currentMonth = this.dateRangeText;
    await this.fetchRecords();
  },
  methods: {
    getWxAppName() {
      return globalData.wxAppName;
    },
    async fetchRecords() {
      uni.showLoading({title: '加载中...'});
      try {
        const tabValue = this.subsectionCurrent + 1; // 1..5
        const startTime = this.startTime || this.getDefaultStartTime();
        const endTime = this.endTime || this.getDefaultEndTime();
        const requestData = {
          accountType: "1",
          tab: tabValue,
          current: 1,
          size: 10000,
          startTime,
          endTime
        };
        const startMonth = startTime.substring(0, 7);
        const endMonth = endTime.substring(0, 7);
        if (startMonth === endMonth) {
          requestData.date = startMonth;
        }
        const res = await getAccountFlowPage(requestData);
        if (res.code === 0 && res.data) {
          this.stats = res.data.accountFlowStatisticsMiniVO;
          this.records = (res.data.accountFlowMiniVO && res.data.accountFlowMiniVO.records) ? res.data.accountFlowMiniVO.records : [];
          this.currentMonth = this.dateRangeText;
        } else {
          uni.showToast({title: res.msg || '获取记录失败', icon: 'none'});
        }
      } catch (error) {
        console.error('获取收支记录失败', error);
        uni.showToast({title: '网络错误', icon: 'none'});
      } finally {
        uni.hideLoading();
      }
    },
    onSubsectionChange(index) {
      this.subsectionCurrent = index;
      this.fetchRecords();
    },
    openCalendar() {
      if (this.$refs.calendar) {
        this.$refs.calendar.open();
      }
    },
    onDateRangeChange(dates) {
      if (dates && dates.length > 0) {
        const start = dates[0];
        const end = dates[dates.length - 1];
        this.startTime = `${start} 00:00:00`;
        this.endTime = `${end} 23:59:59`;
        this.showCalendar = false;
        this.fetchRecords();
      }
    },
    formatCurrency(amount, keepSign = false) {
      if (amount === null || amount === undefined) return keepSign ? '+0.00' : '0.00';

      let num = parseFloat(amount);
      if (isNaN(num)) {
        // Handle cases like "+20000" or "-32426" from stats
        num = parseFloat(String(amount).substring(1));
      }

      let value = (num / 100).toFixed(2);

      if (keepSign) {
        if (String(amount).startsWith('+')) return value;
        if (String(amount).startsWith('-')) return value;
      }
      return value;
    },
    getIconSymbol(eventName) {
      if (eventName.includes('充值')) return 'add_circle';
      if (eventName.includes('消费') || eventName.includes('充电')) return 'account_balance_wallet';
      if (eventName.includes('退款')) return 'undo';
      if (eventName.includes('奖励')) return 'stars';
      return 'receipt';
    },
    getIconClass(eventName) {
      if (eventName.includes('充值')) return 'icon-orange';
      if (eventName.includes('消费') || eventName.includes('充电')) return 'icon-blue';
      if (eventName.includes('退款')) return 'icon-red';
      if (eventName.includes('奖励')) return 'icon-green';
      return 'icon-gray';
    },
    getMinDate() {
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      return this.formatDate(oneYearAgo);
    },
    getMaxDate() {
      const now = new Date();
      return this.formatDate(now);
    },
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    getStartDate() {
      if (this.startTime) {
        return this.startTime.split(' ')[0];
      }
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return this.formatDate(firstDayOfMonth);
    },
    getEndDate() {
      if (this.endTime) {
        return this.endTime.split(' ')[0];
      }
      const now = new Date();
      return this.formatDate(now);
    },
    getDefaultStartTime() {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return this.formatDate(firstDayOfMonth) + ' 00:00:00';
    },
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

<style lang="scss" scoped>
.records-page {
  background: linear-gradient(135deg, #f6f7f8 0%, #e8f4f8 100%);
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* 顶部筛选区域 */
.top-filter-bar {
  display: flex;
  justify-content: center;
  padding: 32rpx;
}

.subsection-container {
  padding: 0 32rpx 24rpx;
}

.month-selector {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 16rpx 24rpx;
  border-radius: 50rpx;
  backdrop-filter: blur(10px);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.month-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-right: 8rpx;
}

.dropdown-icon {
  font-size: 20rpx;
  color: #666;
}

.date-filter-bar {
  padding: 0 32rpx 24rpx;
}

.date-display {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  background: rgba(255, 255, 255, 0.9);
  padding: 16rpx 24rpx;
  border-radius: 50rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.date-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

/* 统计信息卡片 */
.stats-container {
  margin-top: 32rpx;
  padding: 0 32rpx 32rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
}

.stat-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.12);
  }
}

.stat-label {
  font-size: 24rpx;
  font-weight: 500;
  color: #8E8E93;
}

.stat-value {
  font-size: 48rpx;
  font-weight: 700;

  &.income {
    color: #FFA500;
  }

  &.spending {
    color: #333333;
  }

  &.neutral {
    color: #333333;
  }
}

/* 分段控制器 */
.segmented-control {
  padding: 0 32rpx 24rpx;
}

.control-container {
  display: flex;
  height: 80rpx;
  background: #E5E5EA;
  border-radius: 50rpx;
  padding: 8rpx;
  position: relative;
}

.control-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;

  &.active {
    background: #ffffff;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  }
}

.control-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #8E8E93;
  transition: color 0.3s ease;

  .active & {
    color: #333333;
    font-weight: 600;
  }
}

/* 记录列表 */
.records-container {
  padding: 0 32rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-item {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 8rpx 32rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-height: 176rpx;

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  }
}

.record-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.icon-blue {
    background: rgba(59, 130, 246, 0.1);
  }

  &.icon-orange {
    background: rgba(251, 146, 60, 0.1);
  }

  &.icon-red {
    background: rgba(239, 68, 68, 0.1);
  }

  &.icon-green {
    background: rgba(34, 197, 94, 0.1);
  }

  &.icon-gray {
    background: rgba(107, 114, 128, 0.1);
  }
}

.icon-symbol {
  font-size: 48rpx;
  font-weight: 400;

  .icon-blue & {
    color: #3B82F6;
  }

  .icon-orange & {
    color: #FB923C;
  }

  .icon-red & {
    color: #EF4444;
  }

  .icon-green & {
    color: #22C55E;
  }

  .icon-gray & {
    color: #6B7280;
  }
}

.record-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.record-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  line-height: 1.4;
}

.record-time {
  font-size: 24rpx;
  color: #8E8E93;
  line-height: 1.3;
}

.record-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
  flex-shrink: 0;
}

.amount-value {
  font-size: 36rpx;
  font-weight: 700;

  &.income {
    color: #FFA500;
  }

  &.spending {
    color: #333333;
  }
}

.balance-text {
  font-size: 24rpx;
  color: #8E8E93;
  line-height: 1.3;
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

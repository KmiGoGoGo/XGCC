<template>
  <view class="invoice-page">
    <uv-navbar :border="false" title="发票管理" autoBack placeholder safeAreaInsetTop></uv-navbar>
    
    <!-- 温馨提示区域 -->
    <view class="tip-container">
      <view class="tip-card">
        <view class="tip-header">
          <text class="tip-icon">ℹ️</text>
          <text class="tip-title">温馨提示</text>
        </view>
        <text class="tip-content">若遇发票开具失败（自动开票系统繁忙）等情况的相关说明。</text>
      </view>
    </view>
    
    <!-- Tab切换 -->
    <view class="tabs-container">
      <view class="tabs-wrapper">
        <view 
          v-for="(tab, index) in tabList" 
          :key="index"
          class="tab-item"
          :class="{ 'tab-active': currentTab === index }"
          @tap="onTabChange({ index })"
        >
          <text class="tab-text">{{ tab.name }}</text>
        </view>
      </view>
    </view>
    
    <!-- Tab内容区域 -->
    <view class="tab-content">
      <!-- 未开发票 -->
      <UnInvoiceList 
        v-if="currentTab === 0" 
        ref="unInvoiceRef"
      />
      
      <!-- 发票记录 -->
      <InvoiceRecordList 
        v-if="currentTab === 1" 
        ref="invoiceRecordRef"
      />
    </view>
  </view>
</template>

<script>
import UnInvoiceList from '@/components/invoice/UnInvoiceList.vue'
import InvoiceRecordList from '@/components/invoice/InvoiceRecordList.vue'

export default {
  name: 'InvoicePage',
  components: {
    UnInvoiceList,
    InvoiceRecordList
  },
  data() {
    return {
      // Tab配置
      tabList: [
        { name: '未开发票' },
        { name: '发票记录' }
      ],
      currentTab: 0
    }
  },
  
  methods: {
    // Tab切换
    onTabChange(index) {
        console.log('onTabChange', index.index)
      this.currentTab = index.index
      
      // 切换Tab时刷新对应组件的数据
      this.$nextTick(() => {
        if (index.index === 0 && this.$refs.unInvoiceRef) {
          this.$refs.unInvoiceRef.refresh()
        } else if (index.index === 1 && this.$refs.invoiceRecordRef) {
          this.$refs.invoiceRecordRef.refresh()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.invoice-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f6f7f8;
  font-family: 'Inter', 'PingFang SC', sans-serif;
}

.tip-container {
  padding: 32rpx;
}

.tip-card {
  background: linear-gradient(135deg, #e7f5fe 0%, #d1ecf1 100%);
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(19, 164, 236, 0.1);
  
  .tip-header {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 16rpx;
    
    .tip-icon {
      font-size: 40rpx;
    }
    
    .tip-title {
      font-size: 28rpx;
      font-weight: 700;
      color: #13a4ec;
    }
  }
  
  .tip-content {
    font-size: 28rpx;
    color: #666666;
    line-height: 1.5;
  }
}

.tabs-container {
  padding: 0 32rpx 24rpx;
}

.tabs-wrapper {
  background: #f1f3f4;
  border-radius: 16rpx;
  padding: 8rpx;
  display: flex;
  justify-content: space-around;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 0;
  border-radius: 12rpx;
  transition: all 0.3s ease;
  
  &.tab-active {
    background: #fff;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
    
    .tab-text {
      color: #13a4ec;
      font-weight: 700;
    }
  }
  
  .tab-text {
    font-size: 28rpx;
    font-weight: 600;
    color: #666666;
    transition: all 0.3s ease;
  }
}

.tab-content {
  flex: 1;
  overflow: hidden;
  padding: 0 32rpx;
}
</style>

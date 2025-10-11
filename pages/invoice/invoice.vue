<template>
  <view class="invoice-page">
    <!-- Tab切换 -->
    <view class="tabs-container">
      <uv-tabs 
        :list="tabList" 
        :current="currentTab"
        :scrollable="false"
        @change="onTabChange"
        :activeStyle="{ color: '#007AFF', fontWeight: 'bold' }"
        :inactiveStyle="{ color: '#666' }"
        lineColor="#007AFF"
        :itemStyle="{ height: '88rpx' }"
      ></uv-tabs>
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
  background-color: #f5f5f5;
}

.page-header {
  background: #fff;
  padding: 20rpx 30rpx;
  
  .page-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
}

.tabs-container {
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.tab-content {
  flex: 1;
  overflow: hidden;
}
</style>

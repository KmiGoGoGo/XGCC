<template>
  <view class="invoice-record-container">
    <!-- 发票记录列表 -->
    <view v-if="recordList.length > 0">
      <uv-list>
        <uv-list-item 
          v-for="(item, index) in recordList" 
          :key="index"
          :customStyle="{ padding: '20rpx 30rpx' }"
        >
          <view class="record-item" @click="onItemClick(item)">
            <view class="record-info">
              <view class="info-row">
                <text class="label">申请时间：</text>
                <text class="value">{{ formatTime(item.recordsCreateTime || item.createTime) }}</text>
              </view>
              <view class="info-row">
                <text class="label">充电费用：</text>
                <text class="amount">¥{{ (item.totalBalance / 100).toFixed(2) }}</text>
              </view>
              <view class="info-row">
                <text class="label">运营单位：</text>
                <text class="value">{{ item.unitName || '-' }}</text>
              </view>
              <view class="info-row">
                <text class="label">开票状态：</text>
                <text class="status" :class="getStatusClass(item.invoiceStatus)">{{ getStatusText(item.invoiceStatus) }}</text>
              </view>
            </view>
            <view class="arrow-icon">
              <uv-icon name="arrow-right" color="#ccc" size="24rpx"></uv-icon>
            </view>
          </view>
        </uv-list-item>
        
        <!-- 加载更多 -->
        <uv-load-more 
          :status="loadStatus" 
          @loadmore="onLoadMore"
          loadmore-text="上拉或点击加载更多"
          loading-text="正在加载..."
          nomore-text="没有更多数据了"
        />
      </uv-list>
    </view>
    
    <!-- 空状态 -->
    <uv-empty v-else-if="!loading" text="暂无发票记录" mode="data"></uv-empty>
    
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <uv-loading-icon text="加载中..." textSize="28rpx"></uv-loading-icon>
    </view>
  </view>
</template>

<script>
import { queryInvoiceRecordList } from '@/api/invoice.js'

export default {
  name: 'InvoiceRecordList',
  data() {
    return {
      // 列表数据
      recordList: [],
      
      // 分页参数
      pagination: {
        current: 1,
        size: 10,
        total: 0,
        pages: 0
      },
      
      // 状态
      loading: false,
      loadStatus: 'loadmore', // loadmore, loading, nomore
    }
  },
  
  mounted() {
    this.loadRecordList()
  },
  
  methods: {
    // 加载发票记录列表
    async loadRecordList(isLoadMore = false) {
      if (this.loading) return
      
      this.loading = true
      if (!isLoadMore) {
        this.loadStatus = 'loading'
      }
      
      try {
        const params = {
          page: isLoadMore ? this.pagination.current + 1 : 1,
          pageSize: this.pagination.size
        }
        
        const response = await queryInvoiceRecordList(params)
        
        if (response.code === 0) {
          const { InvoiceRecordList, total, current, pages } = response.data
          
          if (isLoadMore) {
            this.recordList.push(...InvoiceRecordList)
          } else {
            this.recordList = InvoiceRecordList
          }
          
          this.pagination = {
            current,
            size: this.pagination.size,
            total,
            pages
          }
          
          // 更新加载状态
          if (current >= pages) {
            this.loadStatus = 'nomore'
          } else {
            this.loadStatus = 'loadmore'
          }
        } else {
          uni.showToast({
            title: response.msg || '加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('加载发票记录失败:', error)
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 加载更多
    onLoadMore() {
      if (this.loadStatus === 'loadmore') {
        this.loadRecordList(true)
      }
    },
    
    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    },
    
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        'INVOICE_CHECK': '审核中',
        'INVOICE_SUCCESS': '已开票',
        'INVOICE_FAIL': '开票失败',
        'INVOICE_VOID': '已作废',
        'INVOICE_PENDING': '待开票'
      }
      return statusMap[status] || '未知状态'
    },
    
    // 获取状态样式类
    getStatusClass(status) {
      const classMap = {
        'INVOICE_CHECK': 'status-checking',
        'INVOICE_SUCCESS': 'status-success',
        'INVOICE_FAIL': 'status-failed',
        'INVOICE_VOID': 'status-canceled',
        'INVOICE_PENDING': 'status-pending'
      }
      return classMap[status] || ''
    },
    
    // 点击发票记录
    onItemClick(item) {
      console.log('点击发票记录:', item)
      // 这里可以跳转到发票详情页面
      uni.showToast({
        title: '查看发票详情',
        icon: 'none'
      })
      uni.navigateTo({
        url: `/pages/invoice/invoiceDetail?id=${item.id}`
      })
    },
    
    // 刷新数据（供父组件调用）
    refresh() {
      this.loadRecordList()
    }
  }
}
</script>

<style lang="scss" scoped>
.invoice-record-container {
  height: 100%;
}

.record-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  
  .record-info {
    flex: 1;
    
    .info-row {
      display: flex;
      margin-bottom: 16rpx;
      
      .label {
        color: #666;
        font-size: 28rpx;
        min-width: 160rpx;
      }
      
      .value {
        color: #333;
        font-size: 28rpx;
        flex: 1;
      }
      
      .amount {
        color: #ff6b35;
        font-size: 32rpx;
        font-weight: 600;
        flex: 1;
      }
      
      .status {
        flex: 1;
        font-size: 28rpx;
        
        &.status-pending {
          color: #f56c6c;
        }
        
        &.status-checking {
          color: #409eff;
        }
        
        &.status-success {
          color: #67c23a;
        }
        
        &.status-failed {
          color: #f56c6c;
        }
        
        &.status-canceled {
          color: #909399;
        }
      }
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  .arrow-icon {
    margin-left: 20rpx;
  }
}

.loading-container {
  padding: 60rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

<template>
  <view class="invoice-record-container">
    <!-- 发票记录列表 -->
    <view v-if="recordList.length > 0" class="record-list">
      <view 
        v-for="(item, index) in recordList" 
        :key="index"
        class="record-card"
        @click="onItemClick(item)"
      >
        <view class="record-item">
          <view class="record-info">
            <view class="info-header">
              <text class="company-name">{{ item.unitName || '-' }}</text>
              <text class="amount">¥{{ (item.totalBalance / 100).toFixed(2) }}</text>
            </view>
            <view class="info-details">
              <text class="detail-item">申请时间：{{ formatTime(item.recordsCreateTime || item.createTime) }}</text>
              <view class="status-row">
                <text class="detail-item">开票状态：</text>
                <text class="status">{{ getStatusText(item.invoiceStatus) }}</text>
              </view>
            </view>
          </view>
          <view class="arrow-icon">
            <text class="arrow">›</text>
          </view>
        </view>
      </view>
      
      <!-- 加载更多 -->
      <uv-load-more 
        :status="loadStatus" 
        @loadmore="onLoadMore"
        loadmore-text="上拉或点击加载更多"
        loading-text="正在加载..."
        nomore-text="没有更多数据了"
      />
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
  
  onShow() {
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
          pageSize: this.pagination.size,
          invoiceBillType: "1"
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
        // 审核中状态
        'INVOICE_APPLYING': '审核中',
        'INVOICE_CHECK': '审核中',
        'IN_INVOICE': '审核中',
        'RED_APPLYING': '审核中',
        'RED_CHECK': '审核中',
        'IN_RED': '审核中',
        'RED_INVOICE': '审核中',
        // 开票相关状态
        'INVOICE_FINISH': '已开票',
        'INVOICE_SUCCESS': '已开票',
        'INVOICE_FAIL': '开票失败',
        'NO_INVOICE': '未开票',
        // 退票相关状态
        'CANCEL_INVOICE': '已退票',
        'INVOICE_REJECT': '已退票',
        'REDED': '已退票',
        'RED_REJECT': '驳回冲红',
        'RED_FAIL': '冲红失败',
        // 作废相关状态
        'VOIDED': '已作废',
        'INVOICE_VOID': '已作废',
        'IN_THE_VOID': '作废中',
        'VOID_APPLYING': '申请作废',
        // 其他状态
        'TO_PUSH': '重新推送',
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
  background-color: #f6f7f8;
}

.record-list {
  padding: 0;
}

.record-card {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 1rpx 6rpx rgba(0, 0, 0, 0.12);
  }
}

.record-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  gap: 24rpx;
  
  .record-info {
    flex: 1;
    
    .info-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24rpx;
      
      .company-name {
        font-size: 32rpx;
        font-weight: 700;
        color: #333333;
        flex: 1;
      }
      
      .amount {
        font-size: 32rpx;
        font-weight: 700;
        color: #333333;
      }
    }
    
    .info-details {
      display: flex;
      flex-direction: column;
      gap: 12rpx;
      
      .detail-item {
        font-size: 28rpx;
        color: #999999;
        line-height: 1.4;
      }
      
      .status-row {
        display: flex;
        align-items: center;
        gap: 8rpx;
        
        .status {
          font-size: 28rpx;
          font-weight: 500;
          
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
      }
    }
  }
  
  .arrow-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48rpx;
    height: 48rpx;
    
    .arrow {
      font-size: 48rpx;
      color: #ccc;
      font-weight: 300;
    }
  }
}

.loading-container {
  padding: 60rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

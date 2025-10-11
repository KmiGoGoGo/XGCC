<template>
  <view v-if="visible" class="modal-overlay" @click="closeModal">
    <view class="modal-container" @click.stop>
      <!-- 弹窗头部 -->
      <view class="modal-header">
        <text class="modal-title">订单列表</text>
        <view class="close-btn" @click="closeModal">
          <uv-icon name="close" color="#999" size="32rpx"></uv-icon>
        </view>
      </view>
      
      <!-- 订单列表 -->
      <scroll-view class="order-list" scroll-y>
        <view v-if="loading" class="loading-container">
          <uv-loading-icon text="加载中..." textSize="28rpx"></uv-loading-icon>
        </view>
        
        <view v-else-if="orderList.length === 0" class="empty-container">
          <text class="empty-text">暂无订单数据</text>
        </view>
        
        <view v-else class="order-item" v-for="(item, index) in orderList" :key="index">
          <view class="order-info">
            <view class="order-row">
              <text class="label">订单号：</text>
              <text class="value">{{ item.busId }}</text>
            </view>
            <view class="order-row">
              <text class="label">下单时间：</text>
              <text class="value">{{ formatTime(item.createTime) }}</text>
            </view>
          </view>
          <view class="order-amount">
            <text class="amount">¥{{ (item.actualBalance / 100).toFixed(2) }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { getInvoiceBillList } from '@/api/invoice.js'

export default {
  name: 'OrderListModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    billIds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      orderList: []
    }
  },
  watch: {
    visible(newVal) {
      if (newVal && this.billIds.length > 0) {
        this.loadOrderList()
      }
    }
  },
  methods: {
    // 加载订单列表
    async loadOrderList() {
      if (this.billIds.length === 0) return
      
      this.loading = true
      try {
        const ids = this.billIds.map(item => item.id)
        const response = await getInvoiceBillList({"billIds": ids})
        console.log('订单列表响应:', response)
        
        if (response.code === 0) {
          this.orderList = response.data || []
        } else {
          uni.showToast({
            title: response.msg || '加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('加载订单列表失败:', error)
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
    },
    
    // 关闭弹窗
    closeModal() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-container {
  width: 90%;
  max-width: 600rpx;
  max-height: 80vh;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
  
  .modal-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
  
  .close-btn {
    padding: 10rpx;
  }
}

.order-list {
  flex: 1;
  padding: 0 30rpx;
}

.loading-container {
  padding: 60rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.empty-container {
  padding: 60rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}

.order-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  .order-info {
    flex: 1;
    
    .order-row {
      display: flex;
      align-items: center;
      margin-bottom: 8rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .label {
        color: #666;
        font-size: 26rpx;
        min-width: 120rpx;
      }
      
      .value {
        color: #333;
        font-size: 26rpx;
        flex: 1;
      }
    }
  }
  
  .order-amount {
    .amount {
      color: #ff6b35;
      font-weight: 600;
      font-size: 30rpx;
    }
  }
}
</style>

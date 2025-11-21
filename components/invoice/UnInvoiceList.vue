<template>
  <view class="uninvoice-container">
    <!-- 发票列表 -->
    <scroll-view 
      class="list-scroll-view"
      scroll-y="true"
      :show-scrollbar="false"
      @scrolltolower="onLoadMore"
    >
      <view style="padding-bottom: 350rpx;">
        <view class="invoice-list">
          <uv-checkbox-group v-model="checkboxModel">
            <view 
              v-for="(item, index) in invoiceList" 
              :key="item.id"
              class="invoice-card"
            >
              <view class="invoice-item" @tap="onItemCheck(item, $event)">
                <!-- 顶部信息行 -->
                <view class="top-row">
                  <text class="company-name">{{ item.unitName }}</text>
                  <text class="amount">¥{{ (item.actualBalance / 100).toFixed(2) }}</text>
                </view>
                
                <!-- 底部信息行 -->
                <view class="bottom-row">
                  <!-- 复选框 -->
                  <view class="checkbox-wrapper">
                    <uv-checkbox
                      :name="item.id"
                      :checked="isItemSelected(item)"
                      @change="onItemCheck(item, $event)"
                      activeColor="#13a4ec"
                    ></uv-checkbox>
                  </view>
                  
                  <!-- 订单信息 -->
                  <view class="order-info">
                    <text class="order-number">订单号：{{ item.busId }}</text>
                    <text class="order-time">下单时间：{{ formatTime(item.createTime) }}</text>
                  </view>
                </view>
              </view>
            </view>
          </uv-checkbox-group>
          
          <!-- 加载更多 -->
          <uv-load-more 
            :status="loadStatus" 
            @loadmore="onLoadMore"
            loadmore-text="上拉或点击加载更多"
            loading-text="正在加载..."
            nomore-text="没有更多数据了"
          />
        </view>
      </view>
      
      <!-- 空状态 -->
      <uv-empty v-if="!loading && invoiceList.length === 0" text="暂无可开票订单" mode="data"></uv-empty>
      
    </scroll-view>
    
    <!-- 底部汇总栏 -->
    <view class="summary-bar">
      <view class="summary-left">
        <uv-checkbox-group v-model="selectAllModel" @change="onSelectAllCheckboxChange">
          <uv-checkbox
            name="selectAll"
            :checked="isAllSelected"
            @change="onSelectAllChange"
            activeColor="#13a4ec"
            :customStyle="{ transform: 'scale(1.2)' }"
          ></uv-checkbox>
        </uv-checkbox-group>
        <text class="select-all-text">本页全选</text>
        <view class="total-info">
          已选金额：<text class="total-amount">¥{{ totalSelectedAmount.toFixed(2) }}</text>
        </view>
      </view>
      <view class="summary-right">
        <button 
          class="next-button"
          :disabled="selectedItems.length === 0"
          @click="goToNext"
        >
          下一步
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { getUnInvoiceBillList } from '@/api/invoice.js'

export default {
  name: 'UnInvoiceList',
  data() {
    return {
      // 列表数据
      invoiceList: [],
      selectedItems: [],
      
      // uv-checkbox 相关数据
      checkboxModel: [],
      selectAllModel: [],
      
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
  
  computed: {
    // 是否全选当前页
    isAllSelected() {
      if (this.invoiceList.length === 0) return false
      return this.invoiceList.every(item => this.isItemSelected(item))
    },
    
    // 已选择的总金额
    totalSelectedAmount() {
      let total = 0
      this.invoiceList.forEach(item => {
        if (this.isItemSelected(item)) {
          total += item.actualBalance / 100
        }
      })
      return total
    }
  },
  
  watch: {
    // 监听全选状态变化，同步selectAllModel
    isAllSelected(newVal) {
      if (newVal && !this.selectAllModel.includes('selectAll')) {
        this.selectAllModel.push('selectAll')
      } else if (!newVal && this.selectAllModel.includes('selectAll')) {
        const index = this.selectAllModel.indexOf('selectAll')
        this.selectAllModel.splice(index, 1)
      }
    }
  },
  
  mounted() {
    this.loadInvoiceList()
  },
  
  methods: {
    // 加载发票列表
    async loadInvoiceList(isLoadMore = false) {
      if (this.loading) return
      
      this.loading = true
      if (!isLoadMore) {
        this.loadStatus = 'loading'
      }
      
      try {
        const params = {
          current: isLoadMore ? this.pagination.current + 1 : 1,
          size: this.pagination.size
        }
        
        const response = await getUnInvoiceBillList(params)
        console.log('response', response)
        
        if (response.code === 0) {
          const { records, total, current, pages } = response.data
          
          if (isLoadMore) {
            this.invoiceList.push(...records)
          } else {
            this.invoiceList = records
            this.selectedItems = [] // 重新加载时清空选择
            this.checkboxModel = [] // 清空复选框模型
            this.selectAllModel = [] // 清空全选模型
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
        console.error('加载发票列表失败:', error)
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
        this.loadInvoiceList(true)
      }
    },
    
    // 检查项目是否被选中
    isItemSelected(item) {
      return this.selectedItems.some(selected => selected.id === item.id)
    },
    
    // 单项选择
    onItemCheck(item, name) {
      const isChecked = this.isItemSelected(item)
      
      if (!isChecked) {
        // 添加到选中列表
        this.selectedItems.push({
          id: item.id,
          unitId: item.unitId
        })
        if (!this.checkboxModel.includes(item.id)) {
          this.checkboxModel.push(item.id)
        }
      } else {
        // 从选中列表中移除
        const index = this.selectedItems.findIndex(selected => selected.id === item.id)
        if (index > -1) {
          this.selectedItems.splice(index, 1)
        }
        const modelIndex = this.checkboxModel.indexOf(item.id)
        if (modelIndex > -1) {
          this.checkboxModel.splice(modelIndex, 1)
        }
      }
    },
    
    // 单项复选框组事件处理（原生组件方式）
    onItemCheckboxChange(e) {
      // 原生 checkbox-group 的 change 事件处理
      // 这里可以用于处理特定需求，目前使用 tap 事件处理单项选择
      console.log('checkbox-group change:', e)
    },
    
    // 本页全选/取消全选
    onSelectAllChange(name) {
      const isCurrentlyAllSelected = this.isAllSelected
      
      if (!isCurrentlyAllSelected) {
        // 全选当前页
        this.invoiceList.forEach(item => {
          if (!this.isItemSelected(item)) {
            this.selectedItems.push({
              id: item.id,
              unitId: item.unitId
            })
          }
          if (!this.checkboxModel.includes(item.id)) {
            this.checkboxModel.push(item.id)
          }
        })
        if (!this.selectAllModel.includes('selectAll')) {
          this.selectAllModel.push('selectAll')
        }
      } else {
        // 取消当前页的选择
        this.invoiceList.forEach(item => {
          const index = this.selectedItems.findIndex(selected => selected.id === item.id)
          if (index > -1) {
            this.selectedItems.splice(index, 1)
          }
          const modelIndex = this.checkboxModel.indexOf(item.id)
          if (modelIndex > -1) {
            this.checkboxModel.splice(modelIndex, 1)
          }
        })
        const selectAllIndex = this.selectAllModel.indexOf('selectAll')
        if (selectAllIndex > -1) {
          this.selectAllModel.splice(selectAllIndex, 1)
        }
      }
    },
    
    // 全选复选框组事件处理（原生组件方式）
    onSelectAllCheckboxChange(e) {
      // 原生 checkbox-group 的 change 事件处理
      // 这里可以用于处理特定需求，目前使用 tap 事件处理全选
      console.log('select all checkbox-group change:', e)
    },
    
    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    },
    
    // 下一步
    goToNext() {
      if (this.selectedItems.length === 0) {
        uni.showToast({
          title: '请选择要开票的订单',
          icon: 'none'
        })
        return
      }

      // 判断选中的item中是否有unitId == 26的订单，如果有，则提示不能开票
      console.log('选中的订单:', this.selectedItems)
      const hasUnitId26 = this.selectedItems.some(item => item.unitId === 26)
      if (hasUnitId26) {
        uni.showToast({
          title: '小桔订单暂时无法开票，请取消选择小桔订单后再次提交',
          icon: 'none'
        })
        return
      }
      
      // 这里可以跳转到下一步页面，传递选中的订单ID
      console.log('选中的订单:', this.selectedItems)
      console.log('总金额:', this.totalSelectedAmount)
      
      // 将对象数组转换为 JSON 字符串传递
      const selectedItemsStr = encodeURIComponent(JSON.stringify(this.selectedItems))
      uni.navigateTo({
        url: `/pages/invoice/invoiceForm?selectedItems=${selectedItemsStr}&totalSelectedAmount=${this.totalSelectedAmount.toFixed(2)}`
      })
    },
    
    // 刷新数据（供父组件调用）
    refresh() {
      this.loadInvoiceList()
    }
  }
}
</script>

<style lang="scss" scoped>
.uninvoice-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f6f7f8;
}

.list-scroll-view {
  flex: 1;
  height: 0;
  width: 100%;
  padding-bottom: 360rpx;
}

.invoice-list {
  padding: 0;
  width: 100%;
}

.invoice-card {
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
}

.invoice-item {
  padding: 24rpx;
  
  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .company-name {
      font-size: 30rpx;
      font-weight: 700;
      color: #333333;
    }
    
    .amount {
      font-size: 30rpx;
      font-weight: 700;
      color: #333333;
    }
  }
  
  .bottom-row {
    display: flex;
    align-items: flex-start;
    gap: 20rpx;
    
    .checkbox-wrapper {
      padding-top: 2rpx;
    }
    
    .order-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6rpx;
      
      .order-number {
        font-size: 26rpx;
        color: #999999;
        line-height: 1.3;
      }
      
      .order-time {
        font-size: 26rpx;
        color: #999999;
        line-height: 1.3;
      }
    }
  }
}

.loading-container {
  padding: 60rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.summary-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20rpx);
  border-top: 1rpx solid #e5e7eb;
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
  
  .summary-left {
    display: flex;
    align-items: center;
    gap: 32rpx;
    
    .select-all-text {
      font-size: 24rpx;
      color: #666666;
      font-weight: 500;
    }
    
    .total-info {
      font-size: 24rpx;
      color: #333333;
      
      .total-amount {
        color: #13a4ec;
        font-weight: 700;
      }
    }
  }
  
  .summary-right {
    .next-button {
      background: linear-gradient(135deg, #55C9FF 0%, #13a4ec 100%);
      color: #fff;
      font-size: 32rpx;
      font-weight: 700;
      padding: 6rpx 64rpx;
      border-radius: 50rpx;
      border: none;
      box-shadow: 0 4rpx 16rpx rgba(19, 164, 236, 0.3);
      transition: all 0.3s ease;
      
      &:active {
        transform: scale(0.95);
        box-shadow: 0 2rpx 8rpx rgba(19, 164, 236, 0.4);
      }
      
      &:disabled {
        background: #e5e7eb;
        color: #9ca3af;
        box-shadow: none;
        transform: none;
      }
    }
  }
}
</style>

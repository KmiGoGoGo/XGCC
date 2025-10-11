<template>
  <view class="uninvoice-container">
    <!-- 发票列表 -->
    <scroll-view 
      class="list-scroll-view"
      scroll-y="true"
      :show-scrollbar="false"
      @scrolltolower="onLoadMore"
    >
      <view>
        <uv-list>
          <uv-checkbox-group v-model="checkboxModel">
            <uv-list-item 
              v-for="(item, index) in invoiceList" 
              :key="item.id"
              :customStyle="{ padding: '20rpx 30rpx' }"
            >
              <view class="invoice-item">
                <!-- 左侧复选框 -->
                <view class="checkbox-wrapper">
                  
                    <uv-checkbox
                      :name="item.id"
                      :checked="selectedItems.includes(item.id)"
                      @change="onItemCheck(item, $event)"
                      activeColor="#007AFF"
                    ></uv-checkbox>
                </view>
                
                <!-- 发票信息 -->
                <view class="invoice-info">
                  <view class="info-row">
                    <text class="label">订单号：</text>
                    <text class="value">{{ item.busId }}</text>
                  </view>
                  <view class="info-row">
                    <text class="label">运营单位：</text>
                    <text class="value">{{ item.unitName }}</text>
                  </view>
                  <view class="info-row">
                    <text class="label">下单时间：</text>
                    <text class="value">{{ formatTime(item.createTime) }}</text>
                  </view>
                  <view class="info-row amount-row">
                    <text class="label">总金额：</text>
                    <text class="amount">¥{{ (item.actualBalance / 100).toFixed(2) }}</text>
                  </view>
                </view>
              </view>
            </uv-list-item>
          </uv-checkbox-group>
          
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
            activeColor="#007AFF"
            label="本页全选"
          ></uv-checkbox>
        </uv-checkbox-group>
      </view>
      <view class="summary-right">
        <view class="selected-info">
          <text class="selected-text">已选择 {{ selectedItems.length }} 单</text>
          <text class="total-amount">合计：¥{{ totalSelectedAmount.toFixed(2) }}</text>
        </view>
        <uv-button 
          type="primary" 
          size="default"
          :disabled="selectedItems.length === 0"
          @click="goToNext"
          customStyle="border-radius: 40rpx; padding: 0 40rpx;"
        >
          下一步
        </uv-button>
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
      return this.invoiceList.every(item => this.selectedItems.includes(item.id))
    },
    
    // 已选择的总金额
    totalSelectedAmount() {
      let total = 0
      this.invoiceList.forEach(item => {
        if (this.selectedItems.includes(item.id)) {
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
    
    // 单项选择
    onItemCheck(item, name) {
      const itemId = item.id
      const isChecked = this.selectedItems.includes(itemId)
      
      if (!isChecked) {
        // 添加到选中列表
        this.selectedItems.push(itemId)
        if (!this.checkboxModel.includes(itemId)) {
          this.checkboxModel.push(itemId)
        }
      } else {
        // 从选中列表中移除
        const index = this.selectedItems.indexOf(itemId)
        if (index > -1) {
          this.selectedItems.splice(index, 1)
        }
        const modelIndex = this.checkboxModel.indexOf(itemId)
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
          if (!this.selectedItems.includes(item.id)) {
            this.selectedItems.push(item.id)
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
          const index = this.selectedItems.indexOf(item.id)
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
      
      // 这里可以跳转到下一步页面，传递选中的订单ID
      console.log('选中的订单:', this.selectedItems)
      console.log('总金额:', this.totalSelectedAmount)
      

      const selectedItems = this.selectedItems.join(',')
      uni.navigateTo({
        url: `/pages/invoice/invoiceForm?selectedItems=${selectedItems}&totalSelectedAmount=${this.totalSelectedAmount.toFixed(2)}`
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
}

.list-scroll-view {
  flex: 1;
  height: 0; /* 确保 scroll-view 能正确计算高度 */
  padding-bottom: 140rpx; /* 为底部汇总栏留出空间 */
}

.invoice-item {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  
  .checkbox-wrapper {
    padding-top: 10rpx;
  }
  
  .invoice-info {
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
      
      &.amount-row {
        margin-bottom: 0;
        
        .amount {
          color: #ff6b35;
          font-size: 32rpx;
          font-weight: 600;
        }
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
  background: #fff;
  border-top: 1rpx solid #eee;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
  
  .summary-left {
    display: flex;
    align-items: center;
  }
  
  .summary-right {
    display: flex;
    align-items: center;
    gap: 30rpx;
    
    .selected-info {
      text-align: right;
      
      .selected-text {
        display: block;
        font-size: 24rpx;
        color: #666;
        margin-bottom: 4rpx;
      }
      
      .total-amount {
        display: block;
        font-size: 32rpx;
        color: #ff6b35;
        font-weight: 600;
      }
    }
  }
}
</style>

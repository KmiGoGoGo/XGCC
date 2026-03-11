<template>
  <view class="invoice-detail-container">
    <!-- 状态头部 -->
    <uv-navbar :border="false" title="发票详情" :autoBack="false" placeholder safeAreaInsetTop @leftClick="handleNavBack">
      <template v-slot:right>
        <view style="margin-right: 200rpx; margin-bottom: 5rpx;">
          <CustomerServiceButton
              session-from="invoice_detail_page"
              custom-class="server-icon-wrapper"
          />
        </view>
      </template>
    </uv-navbar>
    <view class="status-header">
      <view class="status-info">
        <uv-icon name="clock" color="#409eff" size="32rpx"></uv-icon>
        <text class="status-text">{{ getStatusText(detailData.invoiceStatus) }}</text>
      </view>
      <text class="status-time">{{ formatTime(detailData.applicationTime) }}</text>
    </view>

    <!-- 发票详情 -->
    <view class="detail-section">
      <view class="section-title">发票详情</view>

      <view class="detail-row">
        <text class="label">发票类型</text>
        <text class="value">{{ detailData.invoiceTypeName || '增值税电子专用发票' }}</text>
      </view>

      <view class="detail-row">
        <text class="label">发票抬头</text>
        <text class="value">{{ detailData.invoiceRise || '-' }}</text>
      </view>

      <view class="detail-row">
        <text class="label">税号</text>
        <text class="value">{{ detailData.dutyParagraph || '-' }}</text>
      </view>

      <view class="detail-row">
        <text class="label">发票内容</text>
        <text class="value">{{ getInvoiceContent() }}</text>
      </view>

      <view class="detail-row">
        <text class="label">发票金额</text>
        <text class="value amount">¥{{ (detailData.totalBalance / 100).toFixed(2) }}</text>
      </view>

      <view class="detail-row">
        <text class="label">申请时间</text>
        <text class="value">{{ formatTime(detailData.applicationTime) }}</text>
      </view>

      <view class="detail-row">
        <text class="label">运营单位</text>
        <text class="value">{{ detailData.unitName || '-' }}</text>
      </view>
    </view>

    <!-- 收件方式 -->
    <view class="detail-section">
      <view class="section-title">收件方式</view>

      <view class="detail-row">
        <text class="label">{{ detailData.acceptInvoiceType == 1 ? '邮箱' : '手机号' }}</text>
        <text class="value">{{ detailData.acceptInvoiceType == 1 ? detailData.email : detailData.phone }}</text>
      </view>
    </view>

    <!-- 订单汇总 -->
    <view class="summary-section" @click="viewOrderDetails">
      <view class="summary-info">
        <text class="summary-text">{{ getOrderSummaryText() }}</text>
      </view>
      <view class="summary-action">
        <text class="action-text">查看</text>
        <uv-icon name="arrow-right" color="#999" size="24rpx"></uv-icon>
      </view>
    </view>

    <!-- 复制发票PDF下载链接按钮 -->
    <view
        v-if="detailData.invoiceStatus === 'INVOICE_FINISH' && detailData.invoiceUrl"
        class="copy-link-section"
        @click="copyInvoiceUrl"
    >
      <uv-icon name="file-text" color="#409eff" size="32rpx"></uv-icon>
      <text class="copy-link-text">复制发票PDF下载链接</text>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <uv-loading-icon text="加载中..." textSize="28rpx"></uv-loading-icon>
    </view>

    <!-- 订单列表弹窗 -->
    <OrderListModal
        :visible="showOrderModal"
        :billIds="detailData.billList || []"
        @close="closeOrderModal"
    />
  </view>
</template>

<script>
import {queryInvoiceDetailById} from '@/api/invoice.js'
import OrderListModal from '@/components/invoice/OrderListModal.vue'
import {contactCustomerService as contactCustomerServiceFn, handleNavBack} from '@/utils/utils';
import CustomerServiceButton from '@/components/common/CustomerServiceButton.vue';
import globalData from '@/globalData';

export default {
  name: 'InvoiceDetail',
  components: {
    OrderListModal,
    CustomerServiceButton
  },
  data() {
    return {
      invoiceId: null,
      loading: false,
      detailData: {},
      showOrderModal: false
    }
  },

  onLoad(options) {
    if (options.id) {
      this.invoiceId = options.id
      this.loadInvoiceDetail()
    }
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
    // 加载发票详情
    async loadInvoiceDetail() {
      if (!this.invoiceId) return

      this.loading = true
      try {
        const response = await queryInvoiceDetailById(this.invoiceId)
        console.log('发票详情:', response)

        if (response.code === 0) {
          this.detailData = response.data
        } else {
          uni.showToast({
            title: response.msg || '加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('加载发票详情失败:', error)
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
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

    // 获取发票内容
    getInvoiceContent() {
      if (this.detailData.invoiceItemEnum) {
        return this.detailData.invoiceItemEnum.replace('&', '&')
      }

      const items = []
      if (this.detailData.invoiceItem1) items.push(this.detailData.invoiceItem1)
      if (this.detailData.invoiceItem2) items.push(this.detailData.invoiceItem2)
      if (this.detailData.invoiceItem3) items.push(this.detailData.invoiceItem3)

      return items.length > 0 ? items.join('&') : '充电费用&充电服务费'
    },

    // 获取订单汇总文本
    getOrderSummaryText() {
      const billTotal = this.detailData.billTotal || 0
      const chargingNum = this.detailData.chargingNum || 0
      return `1张发票，含${chargingNum}个充电订单`
    },

    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
    },

    // 查看订单详情
    viewOrderDetails() {
      if (this.detailData.billList && this.detailData.billList.length > 0) {
        this.showOrderModal = true
      } else {
        uni.showToast({
          title: '暂无订单数据',
          icon: 'none'
        })
      }
    },

    // 关闭订单弹窗
    closeOrderModal() {
      this.showOrderModal = false
    },

    // 复制发票PDF下载链接
    copyInvoiceUrl() {
      if (!this.detailData.invoiceUrl) {
        uni.showToast({
          title: '发票链接不存在',
          icon: 'none'
        })
        return
      }

      uni.setClipboardData({
        data: this.detailData.invoiceUrl,
        success: () => {
          uni.showToast({
            title: '链接已复制到剪切板',
            icon: 'success'
          })
        },
        fail: (err) => {
          console.error('复制失败:', err)
          uni.showToast({
            title: '复制失败，请重试',
            icon: 'none'
          })
        }
      })
    },
    // 联系客服
    contactCustomerService() {
      contactCustomerServiceFn();
    }
  }
}
</script>

<style lang="scss" scoped>
.invoice-detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.status-header {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .status-info {
    display: flex;
    align-items: center;
    gap: 12rpx;

    .status-text {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
  }

  .status-time {
    font-size: 28rpx;
    color: #666;
  }
}

.detail-section {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;

  .section-title {
    background: #f8f9fa;
    padding: 24rpx 30rpx;
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    border-bottom: 1rpx solid #eee;
  }

  .detail-row {
    display: flex;
    align-items: center;
    padding: 24rpx 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .label {
      color: #666;
      font-size: 28rpx;
      min-width: 140rpx;
    }

    .value {
      color: #333;
      font-size: 28rpx;
      flex: 1;

      &.amount {
        color: #ff6b35;
        font-weight: 600;
        font-size: 30rpx;
      }
    }
  }
}

.summary-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

  .summary-info {
    flex: 1;

    .summary-text {
      font-size: 28rpx;
      color: #333;
    }
  }

  .summary-action {
    display: flex;
    align-items: center;
    gap: 8rpx;

    .action-text {
      font-size: 28rpx;
      color: #999;
    }
  }
}

.copy-link-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  cursor: pointer;
  transition: background-color 0.3s;

  &:active {
    background-color: #f5f5f5;
  }

  .copy-link-text {
    font-size: 28rpx;
    color: #409eff;
    font-weight: 500;
  }
}

.loading-container {
  padding: 60rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
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

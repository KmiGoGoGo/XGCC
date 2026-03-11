<template>
  <view class="details-page">
    <uv-navbar :border="false" :autoBack="false" title="退款详情" placeholder safeAreaInsetTop @leftClick="handleNavBack">
      <template v-slot:right>
        <view style="margin-right: 200rpx; margin-bottom: 5rpx;">
          <CustomerServiceButton
              session-from="refund_details_page"
              custom-class="server-icon-wrapper"
          />
        </view>
      </template>
    </uv-navbar>
    <!-- 顶部卡片 -->
    <view class="top-card">
      <view class="card-header">
        <text class="title">原路退回-{{ formatRefundRoad(details.refundRoad) }}</text>
      </view>
      <view class="card-body">
        <text class="amount">{{ formatCurrency(details.balance) }}</text>
        <text class="status" :class="getStatusClass(details.checkStatus)">{{ formatStatus(details.checkStatus) }}</text>
      </view>
    </view>

    <!-- 详情列表 -->
    <view class="details-list-card">
      <view class="detail-item">
        <text class="label">商户单号</text>
        <text class="value">{{ details.serialNumber || 'N/A' }}</text>
      </view>
      <view class="detail-item">
        <text class="label">交易单号</text>
        <text class="value">{{ details.auditOpinion || 'N/A' }}</text>
      </view>
      <view class="detail-item">
        <text class="label">退款单号</text>
        <text class="value">{{ details.refundBus || 'N/A' }}</text>
      </view>
      <view class="detail-item">
        <text class="label">备注信息</text>
        <text class="value">{{ details.remark || '暂无' }}</text>
      </view>
    </view>

    <!-- 底部说明 -->
    <view class="footer">
      <text>如有疑问请查看</text>
      <text class="link" @click="showRefundInstruction">退款说明</text>
      <text>或直接</text>
      <text class="link" @click="contactCustomerService">联系客服</text>
    </view>
  </view>
</template>

<script>
import {getRefundRecordById} from '@/api/member.js';
// I will assume getStyleContent exists in member.js for simplicity now, to avoid the refactoring mistake.
// In a real scenario, I'd create api/style.js and import from there.
// For now, I will just mock the data for instruction and customer service.
import globalData from '@/globalData';
import { handleNavBack } from '@/utils/utils';
import CustomerServiceButton from '@/components/common/CustomerServiceButton.vue';

export default {
  components: {
    CustomerServiceButton
  },
  data() {
    return {
      details: {},
      refundInstruction: '充值赠券活动，优惠券抵扣后不接受退款。（注：1、若仍需退款将计算并扣除优惠券抵扣部分退回；2、仅支持一年内充值订单退款；3、充值优惠活动最终解释权归 '+this.getCompanyName()+' 所有）',
    };
  },
  async onLoad(options) {
    if (!options.refundId) {
      uni.showToast({title: '缺少必要参数', icon: 'none'});
      return;
    }
    uni.showLoading({title: '加载中...'});
    try {
      const detailsRes = await getRefundRecordById({refundId: options.refundId});

      if (detailsRes.code === 0) {
        this.details = detailsRes.data;
      } else {
        uni.showToast({title: detailsRes.msg || '获取详情失败', icon: 'none'});
      }

    } catch (error) {
      console.error('获取退款详情失败', error);
      uni.showToast({title: '数据加载失败', icon: 'none'});
    } finally {
      uni.hideLoading();
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
    getCompanyName() {
      return globalData.companyName || '本公司';
    },
    getWxAppName() {
      return globalData.wxAppName;
    },
    formatRefundRoad(refundRoad) {
      const refundRoadMap = {
        'WeChatPay': '微信',
        'Alipay': '支付宝'
      };
      return refundRoadMap[refundRoad] || '未知';
    },
    formatCurrency(amount) {
      if (amount === null || amount === undefined) return '0.00';
      return (amount / 100).toFixed(2);
    },
    formatStatus(status) {
      const statusMap = {'Approve': '退款成功', 'Reject': '退款失败', 'AwaitingApproval': '审核中'};
      return statusMap[status] || '未知状态';
    },
    getStatusClass(status) {
      const classMap = {'Approve': 'success', 'Reject': 'fail', 'AwaitingApproval': 'pending'};
      return classMap[status] || '';
    },
    showRefundInstruction() {
      uni.showModal({
        title: '退款说明',
        content: this.refundInstruction,
        showCancel: false
      });
    },
    contactCustomerService() {
      const phone = this.details.customerTelephone;
      uni.makePhoneCall({
        phoneNumber: phone
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.details-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 24rpx;
}

.top-card {
  background-color: white;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.icon-container {
  .icon {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    background-color: #e8f5e9;
    color: #67c23a;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.title {
  font-size: 30rpx;
  margin-left: 16rpx;
}

.card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40rpx;
}

.amount {
  font-size: 56rpx;
  font-weight: bold;
  color: #333;
}

.status {
  font-size: 28rpx;
  margin-top: 16rpx;

  &.success {
    color: #67c23a;
  }

  &.fail {
    color: #fa5151;
  }

  &.pending {
    color: #f9ae3d;
  }
}

.details-list-card {
  background-color: white;
  border-radius: 16rpx;
  padding: 16rpx 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  font-size: 28rpx;
}

.label {
  color: #999;
}

.value {
  color: #333;
  max-width: 75%;
  word-break: break-all;
  text-align: right;
}

.footer {
  text-align: center;
  color: #999;
  font-size: 24rpx;
  padding: 40rpx 0;
  margin-top: 40rpx;
}

.link {
  color: #007aff;
}
</style>

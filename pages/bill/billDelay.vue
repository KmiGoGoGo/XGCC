<template>
  <view class="page-container">
    <uv-navbar :border="false" :autoBack="false" placeholder safeAreaInsetTop @leftClick="handleNavBack"></uv-navbar>
    <view class="content-wrapper">
      <!-- 状态显示区域 -->
      <view class="status-section">
        <text class="status-title">
          充电已完成，订单结算中...
        </text>
        <text class="status-subtitle">
          因电桩网络延迟，账单仍在同步获取中，
          <text class="highlight-text">不影响二次充电</text>
        </text>
      </view>

      <!-- 订单信息卡片 -->
      <view class="info-card">
        <text class="card-title">
          {{ billData.stationName || '--' }}
        </text>
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">订单编号</text>
            <view class="info-value-group">
              <text class="info-value">
                {{ billData.busShowNo || '--' }}
              </text>
              <button @click="copyOrderNo" class="copy-btn">复制</button>
            </view>
          </view>
          <view class="info-item">
            <text class="info-label">启动时间</text>
            <text class="info-value">
              {{ billData.timeS || '--' }}
            </text>
          </view>
          <view class="info-item">
            <text class="info-label">订单冻结金额</text>
            <view class="amount-group">
              <text class="amount-value">
                ¥ {{ billData.preFrozenAmount || '--' }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 结算说明 -->
      <view class="info-card">
        <text class="card-title">
          结算说明
        </text>
        <view class="explanation-list">
          <text class="explanation-item">
            1. 获取账单后会自动完成结算，结算金额以实际账单为准，多退少补，结算后解冻剩余金额。
          </text>
          <text class="explanation-item">
            2. 账单结算过程中，
            <text class="explanation-highlight">
              不影响您的二次充电
            </text>
            。
          </text>
        </view>
      </view>

      <!-- 帮助链接 -->
      <navigator url="/pages/common/howToStopPile" class="help-link">
        <view>
          <text class="help-title">
            充电完成后终端仍在运行中？
          </text>
          <text class="help-subtitle">
            请点击此处查看完整解决方案。
          </text>
        </view>
      </navigator>

      <!-- 客服联系 -->
      <view class="contact-section">
        <text @click="goToService" class="contact-link">
          如有疑问请联系客服
        </text>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-section">
      <uv-button
          type="primary"
          @click="goHome"
          shape="circle"
          text="前往首页"
          :customStyle="buttonStyle"
      ></uv-button>
    </view>
  </view>
</template>

<script>
import {getBillDetailById} from '@/api/bill.js'
import {getStyleConfig} from '@/api/style.js'
import { handleNavBack } from '@/utils/utils';
import globalData from '@/globalData';

export default {
  name: 'BillDelay',
  data() {
    return {
      billData: {},
      timer: null,
      billId: null
    }
  },

  computed: {
    buttonStyle() {
      return {
        width: '100%',
        height: '88rpx',
        fontSize: '32rpx',
        fontWeight: 'bold'
      }
    },
    // 计算底部安全区域高度
    bottomSafeAreaHeight() {
      // 按钮高度88rpx + 上下padding 64rpx + 安全间距24rpx = 176rpx
      return '176rpx'
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
  onLoad(options) {
    // 从路由参数获取id
    this.billId = options.id
    if (this.billId) {
      this.startPolling()
    }
  },

  onUnload() {
    // 页面卸载时清除定时器
    this.clearTimer()
  },

  methods: {
    handleNavBack,
    getWxAppName() {
      return globalData.wxAppName;
    },
    // 开始轮询
    startPolling() {
      // 立即执行一次
      this.checkBillStatus()

      // 设置定时器，每3秒执行一次
      this.timer = setInterval(() => {
        this.checkBillStatus()
      }, 3000)
    },

    // 检查账单状态
    async checkBillStatus() {
      try {
        const response = await getBillDetailById(this.billId)

        if (response.code === 0 && response.data) {
          this.billData = response.data

          // 如果billStatus == 11，跳转到settlementPay页面
          if (response.data.billStatus === 11) {
            this.clearTimer()
            uni.navigateTo({
              url: `/pages/bill/settlementPay?id=${this.billId}`
            })
          }
        }
      } catch (error) {
        console.error('获取账单详情失败:', error)
      }
    },

    // 清除定时器
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },

    // 复制订单号
    copyOrderNo() {
      const orderNo = this.billData.busShowNo || '--'
      uni.setClipboardData({
        data: orderNo,
        success: () => {
          uni.showToast({
            title: '订单号已复制',
            icon: 'success'
          })
        }
      })
    },

    // 前往首页
    goHome() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    },
    async goToService() {
      const res = await getStyleConfig()
      if (res.code !== 0) {
        uni.showToast({
          title: res.msg || '获取客服信息失败',
          icon: 'none'
        });
        return;
      }
      uni.showModal({
        title: '联系客服',
        content: `客服电话：${res.data.telephone || ''}\n客服工作时间：${res.data.serviceTime || ''}`,
        showCancel: true,
        cancelText: '取消',
        confirmText: '呼叫客服',
        confirmColor: '#007AFF',
        success: (res1) => {
          if (res1.confirm) {
            // 用户点击了呼叫客服按钮
            uni.makePhoneCall({
              phoneNumber: res.data.telephone,
              success: () => {
                console.log('呼叫成功');
              },
              fail: (err) => {
                console.log('呼叫失败', err);
                uni.showToast({
                  title: '呼叫失败',
                  icon: 'none'
                });
              }
            });
          }
        }
      });
    }
  }
}
</script>

<style>
page {
  min-height: 100vh;
  background-color: #F0F7FF;
  font-family: 'PingFang SC', sans-serif;
}
</style>

<style scoped>

/* 页面主容器 */
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 16rpx;
  background-color: #F0F7FF;
  position: relative;
}

/* 内容包装器 */
.content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  /* 底部安全区域：按钮高度88rpx + 上下padding 64rpx + 额外安全间距24rpx = 176rpx */
  padding-bottom: calc(176rpx + env(safe-area-inset-bottom));
}

/* 状态显示区域 */
.status-section {
  text-align: center;
  padding: 48rpx 0;
}

.status-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 160rpx;
  height: 160rpx;
  background-color: rgba(0, 122, 255, 0.2);
  border-radius: 50%;
  margin-bottom: 32rpx;
}

.status-icon .material-icons {
  color: #007AFF;
  font-size: 120rpx;
}

.status-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #1C1C1E;
  margin-bottom: 16rpx;
}

.status-subtitle {
  display: block;
  font-size: 28rpx;
  color: #6B7280;
  margin-top: 16rpx;
}

.highlight-text {
  font-weight: 600;
  color: #007AFF;
}

/* 信息卡片 */
.info-card {
  background-color: #FFFFFF;
  padding: 48rpx;
  border-radius: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 24rpx;
}

.card-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #1C1C1E;
  margin-bottom: 32rpx;
}

/* 信息列表 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  font-size: 28rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  color: #6B7280;
}

.info-value-group {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.info-value {
  color: #1C1C1E;
  font-weight: 500;
}

.copy-btn {
  color: #007AFF;
  font-size: 24rpx;
  font-weight: 600;
  background: none;
  border: none;
  padding: 0;
}

.amount-group {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.amount-value {
  color: #1C1C1E;
  font-weight: bold;
  font-size: 36rpx;
}

.help-icon {
  color: #6B7280;
  font-size: 32rpx;
}

/* 说明列表 */
.explanation-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  font-size: 28rpx;
  color: #6B7280;
}

.explanation-item {
  display: block;
}

.explanation-highlight {
  font-weight: 600 !important;
  color: #1C1C1E !important;
}

/* 帮助链接 */
.help-link {
  background-color: #FFFFFF;
  padding: 32rpx;
  border-radius: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-decoration: none;
  margin-bottom: 24rpx;
}

.help-title {
  display: block;
  font-weight: bold;
  color: #1C1C1E;
}

.help-subtitle {
  display: block;
  font-size: 28rpx;
  color: #6B7280;
  margin-top: 8rpx;
}

.help-arrow {
  color: #6B7280;
}

/* 联系客服 */
.contact-section {
  text-align: center;
  margin-top: 48rpx;
  /* 最后一个元素，添加额外的底部边距确保不被按钮遮挡 */
  margin-bottom: 32rpx;
}

.contact-link {
  font-size: 28rpx;
  color: #007AFF;
  font-weight: 500;
  text-decoration: none;
}

/* 底部按钮区域 */
.bottom-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
  background-color: #F0F7FF;
  z-index: 100;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
}

/* 移除了旧的home-btn样式，现在使用uv-button组件 */

/* Material Icons 字体 */
.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 48rpx;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  font-feature-settings: 'liga';
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  page {
    background-color: #1C1C1E;
  }

  .page-container {
    background-color: #1C1C1E;
  }

  .info-card {
    background-color: #2C2C2E;
  }

  .help-link {
    background-color: #2C2C2E;
  }

  .status-title,
  .card-title,
  .info-value,
  .amount-value,
  .explanation-highlight,
  .help-title {
    color: #000;
  }

  .status-subtitle,
  .info-label,
  .help-icon,
  .explanation-list,
  .help-subtitle,
  .help-arrow {
    color: #A0A0A0;
  }

  .bottom-section {
    background-color: #1C1C1E;
    box-shadow: 0 -4rpx 20rpx rgba(255, 255, 255, 0.1);
  }
}
</style>

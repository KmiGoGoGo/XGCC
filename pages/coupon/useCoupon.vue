<template>
  <view class="page-container">
    <!-- 可滚动的主内容区域 -->
    <scroll-view 
      class="scroll-content" 
      scroll-y 
      :style="'height: calc(100vh - ' + footerHeight + 'px);'"
      @scrolltolower="onReachBottom"
    >
      <view v-if="couponList.length > 0" class="main-content">
        <header class="header">
          <text class="header-text">单笔订单可使用<text class="highlight-text">1</text>张券</text>
        </header>
        <main class="coupon-list">
          <view 
            class="coupon-card" 
            :class="item.status === 0 ? 'selected' : 'unselected'"
            v-for="(item, index) in couponList" 
            :key="index"
          >
            <view class="coupon-left" :class="item.status !== 0 ? 'unselected-left' : ''">
              <view class="circle-decoration top"></view>
              <view class="circle-decoration bottom"></view>
              <text class="coupon-amount" :class="item.status !== 0 ? 'unselected-amount' : ''">
                <text class="currency-symbol">¥</text>{{ item.couponBalance / 100 }}
              </text>
              <text class="coupon-type" :class="item.status !== 0 ? 'unselected-type' : ''">
                {{ item.useType == 'QuanChang' ? '全场通用' : '指定站点' }}
              </text>
            </view>
            <view class="coupon-right">
              <view class="coupon-info">
                <text class="coupon-title" :class="item.status > 1 ? 'txt1_no' : 'txt1'">
                  <view v-if="item.couponType == 'FuWuFei'">服务费券</view>
                  <view v-if="item.couponType == 'DianFei'">电费券</view>
                  <view v-if="item.couponType == 'XianJin'">现金券</view>
                </text>
                <text class="coupon-condition" :class="item.status > 1 ? 'txt2_no' : 'txt2'">
                  满{{ item.limiBalance / 100 }}可用
                </text>
                <view class="coupon-dates">
                  <text>{{ item.startTime }}</text>
                  <text>{{ item.endTime }}</text>
                </view>
              </view>
              <view class="check-icon" v-if="item.status === 0">
                <text class="check-mark">✓</text>
              </view>
              <view class="empty-circle" v-else-if="item.status <= 1" @tap="checkCoupon" :data-item="item"></view>
              <view class="disabled-circle" v-else></view>
            </view>
          </view>

          <!-- 不可用原因提示 -->
          <template v-for="(item, index) in couponList" :key="'desc-' + index">
            <view class="status-desc" v-if="item.status > 1">
              <view class="desc">
                <text>不可用原因：</text>
                {{ item.statusDesc }}
              </view>
            </view>
          </template>
          
          <!-- 底部安全区域占位 -->
          <view class="bottom-safe-area"></view>
        </main>
      </view>

      <view v-else class="no-coupon">
        <text>暂无优惠券</text>
      </view>
    </scroll-view>

    <!-- 固定底部 -->
    <footer class="footer" v-if="couponList.length > 0">
      <view class="footer-content">
        <view class="footer-info">
          <text class="footer-text">
            已选{{ num }}张，可减 <text class="footer-highlight">¥{{ deductionAmount }}</text>
            <template v-for="(item, index) in couponList" :key="index">
              <text class="footer-subtext" v-if="item.status == 0">
                （{{ item.couponType == 'FuWuFei' ? '服务费￥' + item.couponBalance / 100 : '' }}{{ item.couponType == 'DianFei' ? '电费￥' + item.couponBalance / 100 : '' }}{{ item.couponType == 'XianJin' ? '现金￥' + item.couponBalance / 100 : '' }}）
              </text>
            </template>
          </text>
        </view>
        <button class="confirm-button" @tap="enterCoupon">
          确定
        </button>
      </view>
      <!-- 底部安全区域 -->
      <view class="safe-area-inset-bottom"></view>
    </footer>
  </view>
</template>

<script>
import { getCouponRecodeByBill } from '../../api/coupon.js'

export default {
  name: 'UseCoupon',
  data() {
    return {
      billId: 0,
      couponList: [],
      cIdStr: '',
      num: '',
      deductionAmount: '',
      deductibleBalance: '',
      couponIdStr: '',
      money: '',
      couponType: '',
      deductibleBalanceCoupon: '',
      footerHeight: 180, // 底部高度（包含安全区域）
      pageNum: 1,
      pageSize: 10,
      hasMore: true
    }
  },
  onLoad: function (options) {
    if (options.billId) {
      this.billId = options.billId
    }
    if (options.couponIdStr) {
      this.cIdStr = options.couponIdStr
    }
    
    // 获取底部安全区域高度
    this.getSystemInfo()
  },
  onReady: function () {},
  onShow: function () {
    this.getCouponRecodeByBill()
  },
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onShareAppMessage: function () {},
  methods: {
    // 获取系统信息（计算安全区域）
    getSystemInfo() {
      const systemInfo = uni.getSystemInfoSync()
      const safeAreaBottom = systemInfo.safeArea ? systemInfo.screenHeight - systemInfo.safeArea.bottom : 0
      // 底部内容高度 + 安全区域高度
      this.footerHeight = 140 + safeAreaBottom
    },
    
    // 滚动到底部（分页加载）
    onReachBottom() {
      if (!this.hasMore) {
        return
      }
      this.pageNum++
      this.loadMoreCoupons()
    },
    
    // 加载更多优惠券（示例方法）
    loadMoreCoupons() {
      // 这里添加分页加载逻辑
      console.log('加载更多优惠券，当前页：', this.pageNum)
      // 根据实际API调整
    },

    // 获取优惠券列表
    getCouponRecodeByBill: function () {
      const that = this
      getCouponRecodeByBill({
        billId: this.billId
      }).then(res => {
        if (res.code == 0) {
          const data = res.data
          const cIdStr = that.cIdStr
          let num = 0
          let deductionAmount = 0
          
          data.forEach(element => {
            if (cIdStr == element.id) {
              element.status = 0
            } else {
              if (cIdStr) {
                if (element.status == 0) {
                  element.status = 1
                } else {
                  element.status = element.status
                }
              }
            }

            if (element.status == 0) {
              deductionAmount += element.couponBalance / 100
              num++
            }
          })
          
          that.couponList = res.data
          that.num = num
          that.deductionAmount = deductionAmount
        }
      }).catch(err => {
        console.error('获取优惠券列表失败:', err)
        uni.showToast({
          title: '获取优惠券失败',
          icon: 'none'
        })
      })
    },

    // 选择优惠券
    checkCoupon: function (e) {
      const id = e.currentTarget.dataset.item.id
      const list = this.couponList
      
      list.forEach(element => {
        if (element.id == id) {
          element.status = 0
        } else {
          if (element.status <= 1) {
            element.status = 1
          }
        }
      })
      
      let num = 0
      let deductionAmount = 0
      list.forEach(element => {
        if (element.status == 0) {
          deductionAmount += element.couponBalance / 100
          num++
        }
      })
      
      this.couponList = list
      this.num = num
      this.deductionAmount = deductionAmount
    },

    // 确定使用优惠券
    enterCoupon: function () {
      const that = this
      let couponIdStr = ''
      let money = 0
      let deductibleBalanceCoupon = 0
      let couponType = ''
      const list = this.couponList
      let noCheck = false
      
      list.forEach(element => {
        if (element.status == 0) {
          couponIdStr += element.id + ','
          money += parseFloat((element.couponBalance / 100).toFixed(2))
          couponType = element.couponType
        }
      })
      
      list.forEach(e => {
        if (e.status <= 1) {
          if (couponIdStr == '') {
            uni.showModal({
              title: '信息提示',
              content: '请选择优惠券',
              showCancel: false
            })
            noCheck = true
          }
        }
      })

      if (noCheck) {
        return false
      }

      const reg = /,$/gi
      couponIdStr = couponIdStr.replace(reg, '')
      
      uni.showLoading({
        title: '加载中...',
        mask: true
      })
      
      deductibleBalanceCoupon = money * 100
      
      const selectedCouponData = {
        couponIdStr: couponIdStr,
        money: money,
        couponType: couponType,
        deductibleBalanceCoupon: (deductibleBalanceCoupon / 100).toFixed(2)
      }
      
      uni.setStorageSync('selectedCoupon', JSON.stringify(selectedCouponData))
      
      uni.hideLoading()
      
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.page-container {
  background-color: #f5f9ff;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 可滚动内容区域 */
.scroll-content {
  flex: 1;
  overflow-y: auto;
}

.main-content {
  min-height: 100%;
}

/* 顶部标题 */
.header {
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #333;
  background: #e9f1ff;
  border-radius: 24rpx 24rpx 0 0;
  font-weight: 500;
}

.highlight-text {
  color: #1a73e8;
  font-weight: bold;
}

/* 优惠券列表 */
.coupon-list {
  padding: 20rpx;
  padding-bottom: 0;
}

/* 优惠券卡片基础样式 */
.coupon-card {
  display: flex;
  border-radius: 24rpx;
  overflow: hidden;
  background: #fff;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 已选中样式 */
.selected {
  border: 2rpx solid #1a73e8;
}

/* 未选中样式 */
.unselected {
  opacity: 0.6;
}

/* 左侧金额区 */
.coupon-left {
  position: relative;
  width: 200rpx;
  background: #e6f0ff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #1a73e8;
  font-weight: bold;
}

.unselected-left {
  background: #f1f3f6;
  color: #9ea7b5;
}

/* 金额符号和数字 */
.currency-symbol {
  font-size: 32rpx;
  vertical-align: top;
}
.coupon-amount {
  font-size: 64rpx;
  line-height: 1;
}
.coupon-type {
  margin-top: 6rpx;
  font-size: 26rpx;
}

/* 装饰圆角切割 */
.circle-decoration {
  position: absolute;
  left: -12rpx;
  width: 24rpx;
  height: 24rpx;
  background: #f5f9ff;
  border-radius: 50%;
  z-index: 2;
}
.circle-decoration.top {
  top: 10rpx;
}
.circle-decoration.bottom {
  bottom: 10rpx;
}

/* 右侧信息区 */
.coupon-right {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #fff;
}

/* 文本信息 */
.coupon-info {
  flex: 1;
}
.coupon-title {
  font-size: 32rpx;
  color: #222;
  font-weight: bold;
}
.coupon-condition {
  font-size: 24rpx;
  color: #666;
  margin-top: 4rpx;
}
.coupon-dates {
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
  display: flex;
  flex-direction: column;
}

/* 选中圆圈 */
.check-icon {
  width: 48rpx;
  height: 48rpx;
  background: #1a73e8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.check-mark {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
}

/* 空圆圈（未选） */
.empty-circle {
  width: 46rpx;
  height: 46rpx;
  border-radius: 50%;
  border: 2rpx solid #ccc;
}

/* 禁用状态圆圈 */
.disabled-circle {
  width: 46rpx;
  height: 46rpx;
  border-radius: 50%;
  background: #e0e0e0;
}

/* 不可用提示 */
.status-desc {
  margin-top: -12rpx;
  margin-bottom: 12rpx;
  padding: 0 20rpx;
}
.desc {
  font-size: 24rpx;
  color: #999;
}

/* 底部占位，防止内容被遮挡 */
.bottom-safe-area {
  height: 40rpx;
}

/* 固定底部区域 */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1rpx solid #eee;
  box-shadow: 0 -4rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 999;
}

.footer-content {
  padding: 20rpx 32rpx;
}

.footer-text {
  font-size: 26rpx;
  color: #444;
}
.footer-highlight {
  color: #1a73e8;
  font-weight: bold;
}
.footer-subtext {
  color: #888;
}

/* 按钮样式 */
.confirm-button {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #1a73e8 0%, #1877ff 100%);
  color: #fff;
  border-radius: 44rpx;
  margin-top: 24rpx;
  font-size: 32rpx;
  font-weight: bold;
  box-shadow: 0 6rpx 12rpx rgba(26, 115, 232, 0.3);
}
.confirm-button:active {
  opacity: 0.9;
}

/* 底部安全区域 */
.safe-area-inset-bottom {
  height: constant(safe-area-inset-bottom);
  height: env(safe-area-inset-bottom);
  background: #fff;
}

/* 无优惠券提示 */
.no-coupon {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 28rpx;
  min-height: 100vh;
}
</style>
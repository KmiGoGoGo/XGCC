<template>
  <view class="page-container">
    <uv-navbar :border="false" autoBack="true" placeholder safeAreaInsetTop bgColor="transparent" title="使用优惠券"></uv-navbar>
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
          <CouponCard
            v-for="(item, index) in couponList"
            :key="index"
            :coupon="transformCouponData(item)"
            :selectable="true"
            :selected="item.status === 0"
            :disabled="item.status > 1"
            :status-desc="item.statusDesc"
            @select="handleSelectCoupon(item)"
          />

          <!-- 底部安全区域占位 -->
          <view class="bottom-safe-area" :style="'height: ' + footerHeight + 'px;'"></view>
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
import CouponCard from '@/components/coupon/CouponCard.vue'

export default {
  name: 'UseCoupon',
  components: {
    CouponCard
  },
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
      // 底部内容高度 + 安全区域高度（根据实际footer高度调整）
      // footer-content约160rpx（转px约107px）+ 安全区域 + 额外边距
      this.footerHeight = 120 + safeAreaBottom + 20
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

    /**
     * @description 转换优惠券数据格式以适配 CouponCard 组件
     * @param {Object} item 原始优惠券数据
     * @returns {Object} 转换后的数据
     */
    transformCouponData(item) {
      // 转换券类型名称
      let couponTypeStr = ''
      if (item.couponType === 'FuWuFei') {
        couponTypeStr = '服务费券'
      } else if (item.couponType === 'DianFei') {
        couponTypeStr = '电费券'
      } else if (item.couponType === 'XianJin') {
        couponTypeStr = '现金券'
      }

      return {
        id: item.id,
        couponBalance: (item.couponBalance / 100).toFixed(2),
        limitBalance: item.limiBalance,
        couponTypeStr: couponTypeStr,
        activityName: item.useType === 'QuanChang' ? '全场通用' : '指定站点',
        startDate: item.startTime,
        endDate: item.endTime,
        status: item.status,
        statusDesc: item.statusDesc
      }
    },

    /**
     * @description 处理选择优惠券
     * @param {Object} item 优惠券对象
     */
    handleSelectCoupon(item) {
      if (item.status > 1) {
        return
      }

      const list = this.couponList

      list.forEach(element => {
        if (element.id == item.id) {
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
  display: flex;
  flex-direction: column;
  gap: 24rpx;
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

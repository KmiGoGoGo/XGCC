<template>
  <view class="settlement-pay-container">
    <uv-navbar :border="false" title="感谢使用!请支付订单" autoBack placeholder safeAreaInsetTop>
      <template v-slot:right>
        <view style="margin-right: 200rpx; margin-bottom: 5rpx;">
          <CustomerServiceButton
              session-from="settlement_pay_page"
              custom-class="server-icon-wrapper"
          />
        </view>
      </template>
    </uv-navbar>
    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 订单号卡片 -->
      <view class="custom-card order-card">
        <view class="order-card-content">
          <view class="order-icon-wrapper">
            <uv-icon name="file-text" size="40" color="#0ea5e9"></uv-icon>
          </view>
          <text class="order-text">订单号：{{ orderData.orderNo }}</text>
          <view class="copy-btn">
            <uv-button text="复制" type="primary" size="mini" plain @click="copyOrderNo"></uv-button>
          </view>
        </view>
      </view>

      <!-- 充电信息卡片 -->
      <view class="custom-card charge-info-card">
        <view class="charge-info-content">
          <view class="section-title">充电信息</view>
          <view class="charge-stats">
            <view class="stat-item">
              <text class="stat-value">{{ orderData.chargeDuration }}</text>
              <text class="stat-label">充电时长</text>
            </view>
            <view class="stat-divider"></view>
            <view class="stat-item">
              <text class="stat-value">{{ orderData.chargedAmount }}
                <text class="stat-unit">kwh</text>
              </text>
              <text class="stat-label">已充电量</text>
            </view>
            <view class="stat-divider"></view>
            <view class="stat-item">
              <text class="stat-value total-price">¥{{ orderData.busBalance }}</text>
              <text class="stat-label">充电总费用</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 价格明细卡片 -->
      <view class="custom-card price-card">
        <view class="price-content">
          <view class="section-title">价格明细</view>

          <!-- 支付方式 -->
          <view class="price-row">
            <text class="price-label">支付方式</text>
            <!-- 微信支付分显示 -->
            <view class="price-value flex-row-start" v-if="orderData.wxppOrder">
              <image src="https://oos-cn.ctyunapi.cn/front-end/static/zhifufen_icon.png"
                     class='zhifufen_icon'></image>
              微信支付分
            </view>
            <view class="price-value" v-else-if="orderData.payMode == 6">电卡支付</view>
            <view class="price-value" v-else-if="orderData.payMode == 5">储值卡支付</view>
            <view class="price-value" v-else>
              {{
                orderData.payAccountStr == '团队账户' ? '车队账户' : orderData.disposableOrder ? '充完即退' : orderData.payAccountStr + '账户'
              }}
            </view>
          </view>

          <!-- 预充金额 -->
          <view class="price-row" v-if="orderData.disposableOrder">
            <text class="price-label">预充金额</text>
            <view class="balance-info">
              <text class="balance-amount">￥{{ orderData.preFrozenAmount ? orderData.preFrozenAmount : '-' }}</text>
            </view>
          </view>
          <view class="price-row" v-else-if="orderData.wxppOrder">
            <text class="price-label">预充金额</text>
            <view class="balance-info">
              <text class="balance-amount">￥{{ orderData.preFrozenAmount ? orderData.preFrozenAmount : '-' }}</text>
            </view>
          </view>
          <view class="price-row" v-else-if="orderData.payMode !=5">
            <text class="price-label">账户余额</text>
            <view class="balance-info">
              <view class="balance-amount" v-if="orderData.payAccountStr == '个人'">
                <text>￥</text>
                {{
                  orderData.payMode == 6 ? memberInfo.jlAccountBalance ? memberInfo.jlAccountBalance : '-' : memberInfo.accountBalance ? GetBalance(memberInfo.accountBalance - memberInfo.jlAccountBalance) : '-'
                }}
              </view>
              <view class="balance-amount" v-if="orderData.payAccountStr !== '个人'">
                <text v-if="memberInfo.deductMode !== 'TeamAccount'">￥</text>
                {{
                  memberInfo.deductMode == 'TeamAccount' ? '****' : memberInfo.carAccountBalance ? (memberInfo.carAccountBalance / 100).toFixed(2) : '-'
                }}
              </view>
            </view>
          </view>

          <view class="dashed-divider"></view>

          <!-- 电费 -->
          <view class="price-row">
            <text class="price-label">电费</text>
            <text class="price-value">¥{{ orderData.electricityFee }}</text>
          </view>

          <!-- 服务费 -->
          <view class="price-row">
            <text class="price-label">服务费</text>
            <text class="price-value">¥{{ orderData.serviceFee }}</text>
          </view>

          <view class="dashed-divider"></view>

          <!-- 充电总费用 -->
          <view class="price-row">
            <text class="price-label">充电总费用</text>
            <text class="price-value">¥{{ orderData.busBalance ? orderData.busBalance : '-' }}</text>
          </view>

          <!-- 优惠券 -->
          <view class="price-row coupon-row" v-if="orderData.payAccountStr == '个人' && orderData.payMode!=6"
                @click="handleCoupon" :data-id="orderData.id">
            <text class="price-label">优惠券优惠</text>
            <view class="coupon-info">
              <text class="discount-value">-¥{{ orderData.couponAmount }}</text>
              <text class="arrow-icon" v-if="orderData.billStatus != 14">›</text>
            </view>
          </view>

          <view class="price-row">
            <text class="price-label">已优惠</text>
            <text class="price-value">¥{{ orderData.allCouponAmount ? orderData.allCouponAmount : '0.00' }}</text>
          </view>

          <view class="dashed-divider"></view>

          <!-- 应付金额汇总 -->
          <view class="price-row final-amount-row">
            <text class="final-amount-label">应付金额</text>
            <text class="final-amount-value">¥{{ orderData.actualBalance1 }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 固定底部区域 -->
    <view class="fixed-bottom-bar" v-if="orderData.billStatus !== 13">
      <view class="countdown-info">
        <text class="countdown-text">
          结算前可更换使用优惠券，
          <text class="countdown-time">{{ countdownText }}</text>
          后将自动付款
        </text>
      </view>
      <view class="safe-area-bottom">
        <uv-button
            :text="payButtonText"
            type="primary"
            size="large"
            :custom-style="buttonStyle"
            @click="handlePay"
        ></uv-button>
      </view>
    </view>
  </view>
</template>

<script>
import {getDelayPayBill, delayDeductionCharge} from '@/api/bill.js'
import {getMemberInfo} from '@/api/member.js'
import CustomerServiceButton from '@/components/common/CustomerServiceButton.vue';
import globalData from '@/globalData';

export default {
  name: 'SettlementPay',
  components: {
    CustomerServiceButton
  },
  data() {
    return {
      busId: null, // 从路由参数获取的busId
      billId: null, // 从路由参数获取的billId
      stationOccupy: 0, // 站点占位状态，1表示有占位费
      countdown: 60, // 倒计时秒数
      timer: null,
      couponIdStr: null, // 优惠券ID字符串
      deductibleBalanceCoupon: 0, // 优惠券抵扣金额
      couponType: null, // 优惠券类型：FuWuFei(服务费券)、DianFei(电费券)、XianJin(现金券)
      memberInfo: {}, // 会员信息
      buttonStyle: {
        width: '100%',
        height: '88rpx',
        borderRadius: '44rpx',
        fontSize: '32rpx',
        fontWeight: 'bold'
      },
      orderData: {
        orderNo: '--',
        stationImage: '/static/images/default-station.png', // 默认图片
        stationName: '--',
        chargeDuration: '--',
        chargedAmount: '--',
        electricityFee: '--',
        serviceFee: '--',
        payAccountStr: '--',
        accountBalance: '--',
        busBalance: '--',
        memberDiscountBalance: '0.00',
        couponAmount: '0.00',
        leftSecond: '--',
        billStatus: null, // 账单状态
        billPayLog: [], // 账单支付日志
        orderDiscount: null, // 订单优惠信息
        discountBalance: 0, // 优惠活动金额
        deductibleBalance: 0, // 可抵扣奖励金金额
        wxppOrder: null,
        payMode: 0,
        disposableOrder: 0,
        preFrozenAmount: 0,
        allCouponAmount: 0,
        actualBalance1: 0
      }
    }
  },
  computed: {
    totalDiscount() {
      const member = parseFloat(this.orderData.memberDiscountBalance) || 0;
      const coupon = parseFloat(this.orderData.couponAmount) || 0;
      const discount = (this.orderData.discountBalance / 100) || 0; // 优惠活动
      const bonus = (this.orderData.deductibleBalance / 100) || 0; // 奖励金
      return (member + coupon + discount + bonus).toFixed(2);
    },
    finalAmount() {
      const total = parseFloat(this.orderData.busBalance);
      const discount = parseFloat(this.totalDiscount);
      const result = total - discount;
      return result > 0 ? result.toFixed(2) : '0.00';
    },
    countdownText() {
      return `${this.countdown}秒`;
    },
    payButtonText() {
      // 当 billStatus 为 13 时，显示特定文案
      if (this.orderData.billStatus === 13 && this.orderData.billPayLog && this.orderData.billPayLog.length > 0) {
        const payLog = this.orderData.billPayLog[0];
        const debt = (payLog.debt / 100).toFixed(2);
        const paidAmount = (payLog.paidAmount / 100).toFixed(2);
        return `请充值（待支付${debt}元，已支付${paidAmount}元）`;
      }
      return '立即支付';
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
  async onLoad(options) {
    // 从路由参数中获取busId
    if (options.busId && options.billId) {
      this.busId = options.busId;
      this.billId = options.billId;
      await this.fetchBillData();
    } else {
      uni.showToast({
        title: '参数错误',
        icon: 'none'
      });
    }
    this.startCountdown();
  },
  onUnload() {
    this.clearCountdown();
  },

  // 从优惠券页面返回时更新数据
  onShow() {
    // 检查是否有优惠券选择的变化
    const selectedCoupon = uni.getStorageSync('selectedCoupon');
    console.log('selectedCoupon show', selectedCoupon);
    if (selectedCoupon) {
      try {
        const couponData = JSON.parse(selectedCoupon);
        this.couponType = couponData.couponType;
        this.deductibleBalanceCoupon = parseFloat(couponData.deductibleBalanceCoupon) || 0;
        this.couponIdStr = couponData.couponIdStr;

        console.log('从优惠券页面返回，更新优惠券信息:', couponData);

        // 重新获取账单数据以更新优惠券信息
        this.fetchBillData();

        // 清除存储的优惠券数据
        uni.removeStorageSync('selectedCoupon');
      } catch (error) {
        console.error('解析优惠券数据失败:', error);
        uni.removeStorageSync('selectedCoupon');
      }
    }
  },
  methods: {
    getWxAppName() {
      return globalData.wxAppName;
    },
    copyOrderNo() {
      uni.setClipboardData({
        data: this.orderData.orderNo,
        success: () => {
          uni.showToast({
            title: '订单编号已复制',
            icon: 'success'
          });
        }
      });
    },
    // 获取账单数据
    async fetchBillData() {
      if (!this.busId) {
        console.warn('busId不存在，无法获取账单数据');
        return;
      }

      try {
        uni.showLoading({
          title: '加载中...'
        });

        const response = await getDelayPayBill({
          busId: this.busId
        });

        if (response && response.code === 0 && response.data) {
          this.updateOrderData(response.data);
          console.log('账单数据获取成功:', response.data);
        } else {
          console.error('获取账单数据失败:', response);
          uni.showToast({
            title: '获取数据失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('调用getDelayPayBill接口失败:', error);
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },

    // 更新订单数据
    async updateOrderData(data) {
      // 计算充电时长（从timeS到timeE）
      const chargeDuration = this.calculateChargeDuration(data.timeS, data.timeE);

      // 更新站点占位状态
      this.stationOccupy = data.stationOccupy || 0;

      const memberInfo = await getMemberInfo()
      let accountBalance = 0;
      if (memberInfo.code === 0) {
        this.memberInfo = memberInfo.data;
        accountBalance = this.memberInfo.accountBalance;
      }

      // 处理优惠券相关数据
      if (data.useCouponId) {
        this.couponIdStr = data.useCouponId;
      }

      // 如果用户从优惠券页面选择了新的优惠券，优先使用用户选择的数据
      const selectedCoupon = uni.getStorageSync('selectedCoupon');
      if (selectedCoupon) {
        try {
          const couponData = JSON.parse(selectedCoupon);
          this.couponIdStr = couponData.couponIdStr;
          this.couponType = couponData.couponType;
          this.deductibleBalanceCoupon = parseFloat(couponData.deductibleBalanceCoupon) || 0;
        } catch (error) {
          console.error('解析优惠券数据失败:', error);
        }
      }

      // 计算优惠券金额 - 参考原代码逻辑
      const couponAmount = this.calculateCouponAmount(data);

      // 计算奖励金 - 处理与优惠券的抵扣关系
      const deductibleBalance = this.calculateDeductibleBalance(data, couponAmount);

      // 计算总优惠金额
      let allDiscountAmount = data.totalDiscountBalance && data.totalDiscountBalance > 0 ? data.totalDiscountBalance / 100 : 0;
      let paidinAmount = (data.busBalance - allDiscountAmount).toFixed(2);

      this.orderData = {
        ...this.orderData,
        orderNo: data.busShowNo || data.busId || this.orderData.orderNo,
        stationName: data.stationName || this.orderData.stationName,
        chargeDuration: chargeDuration,
        chargedAmount: (data.sumPower / 1000).toFixed(2),
        electricityFee: (data.powerBalance / 100).toFixed(2),
        serviceFee: (data.serviceBalance / 100).toFixed(2),
        payAccountStr: data.payAccountStr || this.orderData.payAccountStr,
        accountBalance: (accountBalance / 100).toFixed(2),
        busBalance: (data.busBalance / 100).toFixed(2),
        memberDiscountBalance: (data.memberDiscountBalance / 100).toFixed(2),
        couponAmount: couponAmount,
        leftSecond: data.leftSecond,
        billStatus: data.billStatus || null,
        billPayLog: data.billPayLog || [],
        orderDiscount: data.orderDiscount || null,
        discountBalance: data.discountBalance || 0, // 优惠活动金额
        deductibleBalance: deductibleBalance, // 处理后的奖励金金额
        allDiscountAmount: allDiscountAmount.toFixed(2),
        paidinAmount: paidinAmount,
        memberDiscountType: data.memberDiscountType || 0,
        discountType: data.discountType || 0,
        wxppOrder: data.wxppOrder,
        payMode: data.payMode || 0,
        disposableOrder: data.disposableOrder || 0,
        preFrozenAmount: data.preFrozenAmount || 0,
        allCouponAmount: this.calculateAllCouponAmount(couponAmount, data, deductibleBalance),
      };
      // 计算应付金额  = 总金额 - 总优惠
      this.orderData.actualBalance1 = (data.busBalance / 100 - this.orderData.allCouponAmount).toFixed(2)
      this.countdown = data.leftSecond;
      uni.setStorageSync('bestCoupons', JSON.stringify(data.orderDiscount?.bestCoupons || []));
    },

    // 计算充电时长
    calculateChargeDuration(startTime, endTime) {
      if (!startTime || !endTime) return '0min';

      try {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const diffMs = end - start;
        const diffMinutes = Math.round(diffMs / (1000 * 60));

        if (diffMinutes < 60) {
          return `${diffMinutes}min`;
        } else {
          const hours = Math.floor(diffMinutes / 60);
          const minutes = diffMinutes % 60;
          return minutes > 0 ? `${hours}h${minutes}min` : `${hours}h`;
        }
      } catch (error) {
        console.error('计算充电时长失败:', error);
        return '0min';
      }
    },

    startCountdown() {
      this.timer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          this.clearCountdown();
          this.handleAutoPay();
        }
      }, 1000);
    },
    clearCountdown() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    handleRecharge() {
      uni.navigateTo({
        url: '/pages/recharge/recharge'
      });
    },
    handleCoupon() {
      uni.navigateTo({
        url: `/pages/coupon/useCoupon?billId=${this.billId}&${this.couponIdStr ? '&couponIdStr=' + this.couponIdStr : ''}`
      });
    },


    async handlePay() {
      if (this.orderData.billStatus === 13) {
        uni.navigateTo({
          url: '/pages/recharge/recharge'
        });
        return;
      }
      this.clearCountdown();

      try {
        uni.showLoading({
          title: '支付中...'
        });

        // 调用延迟扣款接口
        const response = await delayDeductionCharge({
          id: this.billId.toString(),
          couponIdStr: this.couponIdStr || null
        });

        if (response && response.code === 0) {
          uni.hideLoading();
          uni.showToast({
            title: '支付成功',
            icon: 'success'
          });

          // 根据stationOccupy决定后续行为
          setTimeout(() => {
            this.handlePaymentComplete();
          }, 1500);
        } else {
          uni.hideLoading();
          uni.showToast({
            title: response.msg || '支付失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('支付失败:', error);
        uni.hideLoading();
        uni.showToast({
          title: '支付失败，请重试',
          icon: 'none'
        });
      }
    },

    // 处理支付完成后的逻辑
    async handlePaymentComplete() {
      // 刷新页面数据
      const response = await this.fetchBillData();
      if (response && response.code === 0) {
        await this.updateOrderData(response.data);
        if (this.orderData.billStatus === 13) {
          return;
        }
      }

      if (this.stationOccupy === 1) {
        // 弹窗提醒用户尽快驶离
        uni.showModal({
          title: '支付成功',
          content: '订单已支付，请尽快驶离车位避免产生占位费。',
          confirmText: '确认',
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
              this.navigateToSettlementInfo();
            }
          }
        });
      } else {
        // 直接跳转到结算信息页面
        this.navigateToSettlementInfo();
      }
    },

    // 跳转到结算信息页面
    navigateToSettlementInfo() {
      uni.redirectTo({
        url: `/pages/bill/settlementInfo?billId=${this.billId}`
      });
    },
    handleAutoPay() {
      if (this.stationOccupy === 1) {
        // 有占位费时，先确认支付再弹出占位提醒
        // 支付后弹出占位提醒
        this.handleAutoPayWithOccupyWarning();
      } else {
        // 无占位费时，直接支付并跳转
        this.handleAutoPayDirect();
      }
    },

    // 自动支付（有占位费提醒）
    async handleAutoPayWithOccupyWarning() {
      try {
        uni.showLoading({
          title: '支付中...'
        });

        // 调用延迟扣款接口
        const response = await delayDeductionCharge({
          id: this.billId.toString(),
          couponIdStr: this.couponIdStr || null
        });

        if (response && response.code === 0) {
          uni.hideLoading();

          // 支付成功后立即弹出占位提醒
          uni.showModal({
            title: '支付成功',
            content: '订单已支付，请尽快驶离车位避免产生占位费。',
            confirmText: '确认',
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                this.navigateToSettlementInfo();
              }
            }
          });
        } else {
          uni.hideLoading();
          uni.showToast({
            title: response.msg || '支付失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('自动支付失败:', error);
        uni.hideLoading();
        uni.showToast({
          title: '支付失败，请重试',
          icon: 'none'
        });
      }
    },

    // 自动支付（直接跳转）
    async handleAutoPayDirect() {
      try {
        uni.showLoading({
          title: '支付中...'
        });

        // 调用延迟扣款接口
        const response = await delayDeductionCharge({
          id: this.billId.toString(),
          couponIdStr: this.couponIdStr || null
        });

        if (response && response.code === 0) {
          uni.hideLoading();
          uni.showToast({
            title: '支付成功',
            icon: 'success'
          });

          // 直接跳转到结算信息页面
          setTimeout(() => {
            this.navigateToSettlementInfo();
          }, 1500);
        } else {
          uni.hideLoading();
          uni.showToast({
            title: response.msg || '支付失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('自动支付失败:', error);
        uni.hideLoading();
        uni.showToast({
          title: '支付失败，请重试',
          icon: 'none'
        });
      }
    },

    // 获取余额（格式化显示）
    GetBalance(amount) {
      console.log(amount, 'amount')
      if (!amount) return '0.00';
      return (amount / 100).toFixed(2);
    },

    // 计算优惠券金额 - 参考原代码逻辑
    calculateCouponAmount(data) {
      // 获取各种优惠券金额（分转元）
      const powerCoupon = data.powerCoupon ? (data.powerCoupon / 100).toFixed(2) : '0.00';
      const serviceCoupon = data.serviceCoupon ? (data.serviceCoupon / 100).toFixed(2) : '0.00';
      const cashCoupon = data.cashCoupon ? (data.cashCoupon / 100).toFixed(2) : '0.00';

      // 获取服务费、电费、总费用（分转元）
      const serviceBalance = (data.serviceBalance / 100).toFixed(2);
      const powerBalance = (data.powerBalance / 100).toFixed(2);
      const busBalance = (data.busBalance / 100).toFixed(2);
      const memberDiscountBalance = (data.memberDiscountBalance / 100).toFixed(2);
      const discountBalance = data.discountBalance ? (data.discountBalance / 100).toFixed(2) : '0.00';

      let couponAmount = 0;

      // 如果有选中的优惠券类型，按类型计算
      if (this.couponType) {
        let money = parseFloat(this.deductibleBalanceCoupon) || 0;

        if (this.couponType === 'FuWuFei') {
          // 服务费券
          const maxServiceAmount = parseFloat(serviceBalance) - parseFloat(discountBalance) - parseFloat(memberDiscountBalance);
          couponAmount = Math.min(money, maxServiceAmount);
        } else if (this.couponType === 'DianFei') {
          // 电费券
          couponAmount = Math.min(money, parseFloat(powerBalance));
        } else if (this.couponType === 'XianJin') {
          // 现金券
          const maxCashAmount = parseFloat(busBalance) - parseFloat(discountBalance) - parseFloat(memberDiscountBalance);
          couponAmount = Math.min(money, maxCashAmount);
        }
      } else {
        // 默认情况：使用接口返回的三种券金额总和
        couponAmount = parseFloat(powerCoupon) + parseFloat(serviceCoupon) + parseFloat(cashCoupon);
      }

      return couponAmount.toFixed(2);
    },

    // 计算奖励金 - 处理与优惠券的抵扣关系
    calculateDeductibleBalance(data, couponAmount) {
      let deductibleBalance = data.deductibleBalance ? (data.deductibleBalance / 100).toFixed(2) : '0.00';

      // 如果没有奖励金，直接返回
      if (parseFloat(deductibleBalance) <= 0) {
        return deductibleBalance;
      }

      const serviceBalance = (data.serviceBalance / 100).toFixed(2);
      const powerBalance = (data.powerBalance / 100).toFixed(2);
      const cashBalance = (data.cashBalance / 100).toFixed(2);

      // 计算优惠券减去服务费后的剩余金额
      let couponAmountReduceService = parseFloat(couponAmount) - parseFloat(serviceBalance);

      // 根据优惠券类型处理奖励金
      if (!this.couponType) {
        // 默认情况：根据接口返回的券类型处理
        if (data.serviceCoupon && parseFloat(data.serviceCoupon) > 0) {
          // 服务费券
          if (couponAmountReduceService >= 0) {
            deductibleBalance = '0.00';
          } else {
            const remainingAmount = Math.abs(couponAmountReduceService);
            deductibleBalance = parseFloat(deductibleBalance) >= remainingAmount ? remainingAmount.toFixed(2) : deductibleBalance;
          }
        } else if (data.powerCoupon && parseFloat(data.powerCoupon) > 0) {
          // 电费券不处理奖励金
          deductibleBalance = deductibleBalance;
        } else if (data.cashCoupon && parseFloat(data.cashCoupon) > 0) {
          // 现金券
          if (couponAmountReduceService >= 0) {
            deductibleBalance = '0.00';
          } else {
            const remainingAmount = Math.abs(couponAmountReduceService);
            deductibleBalance = parseFloat(deductibleBalance) >= remainingAmount ? remainingAmount.toFixed(2) : deductibleBalance;
          }
        }
      } else {
        // 选中优惠券后的处理
        let couponAmountReduceService2 = parseFloat(couponAmount) - parseFloat(serviceBalance);

        if (this.couponType === 'FuWuFei') {
          // 服务费券
          if (couponAmountReduceService2 >= 0) {
            deductibleBalance = '0.00';
          } else {
            const remainingAmount = Math.abs(couponAmountReduceService2);
            deductibleBalance = parseFloat(deductibleBalance) >= remainingAmount ? remainingAmount.toFixed(2) : deductibleBalance;
          }
        } else if (this.couponType === 'DianFei') {
          // 电费券不处理奖励金
          deductibleBalance = deductibleBalance;
        } else if (this.couponType === 'XianJin') {
          // 现金券
          if (couponAmountReduceService2 >= 0) {
            deductibleBalance = '0.00';
          } else {
            const remainingAmount = Math.abs(couponAmountReduceService2);
            deductibleBalance = parseFloat(deductibleBalance) >= remainingAmount ? remainingAmount.toFixed(2) : deductibleBalance;
          }
        }
      }

      return deductibleBalance;
    },

    // 计算总优惠金额 - 确保不超过总费用
    calculateAllCouponAmount(couponAmount, data, deductibleBalance) {
      const busBalance = (data.busBalance / 100).toFixed(2);
      const memberDiscountBalance = (data.memberDiscountBalance / 100).toFixed(2);
      const discountBalance = data.discountBalance ? (data.discountBalance / 100).toFixed(2) : '0.00';

      // 计算总优惠金额
      let allCouponAmount = (
          parseFloat(couponAmount) +
          parseFloat(memberDiscountBalance) +
          parseFloat(discountBalance) +
          parseFloat(deductibleBalance)
      ).toFixed(2);

      // 总优惠不能超过总费用
      if (parseFloat(allCouponAmount) > parseFloat(busBalance)) {
        allCouponAmount = busBalance;
      }

      return allCouponAmount;
    }
  }
}
</script>

<style lang="scss" scoped>
.settlement-pay-container {
  min-height: 100vh;
  background-color: #f0f9ff; /* sky-50 */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* 自定义Card样式 */
.custom-card {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  border: 1px solid rgba(229, 231, 235, 0.8);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  margin: 0 32rpx 32rpx;
  overflow: hidden;
}

/* 分割线样式 */
.dashed-divider {
  height: 1px;
  border-top: 1px dashed rgba(229, 231, 235, 0.8);
  margin: 24rpx 0;
}

.page-content {
  flex: 1;
  padding: 32rpx 0;
  padding-bottom: 240rpx; /* 为底部固定区域留出空间 */
}

/* 订单号卡片样式 */
.order-card {
  padding: 32rpx;

  .order-card-content {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .order-icon-wrapper {
      width: 80rpx;
      height: 80rpx;
      border-radius: 16rpx;
      background-color: #dbeafe; /* sky-100 */
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .order-icon {
        font-size: 40rpx;
        color: #0ea5e9; /* primary color */
      }
    }

    .order-text {
      flex: 1;
      font-size: 28rpx;
      font-weight: 500;
      color: #1f2937;
      margin-left: 24rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .copy-btn {
      width: 64rpx;
      height: 64rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      flex-shrink: 0;

      .copy-icon {
        font-size: 36rpx;
      }
    }
  }
}

/* 充电信息卡片样式 */
.charge-info-card {
  padding: 32rpx;

  .charge-info-content {
    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 32rpx;
      letter-spacing: -0.3rpx;
    }

    .charge-stats {
      display: flex;
      align-items: flex-start;
      justify-content: space-around;

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8rpx;
        text-align: center;

        .stat-value {
          font-size: 40rpx;
          font-weight: bold;
          color: #1f2937;

          .stat-unit {
            font-size: 32rpx;
            font-weight: 500;
          }

          &.total-price {
            color: #0ea5e9;
          }
        }

        .stat-label {
          font-size: 24rpx;
          color: #6b7280;
        }
      }

      .stat-divider {
        width: 1px;
        height: 80rpx;
        background-color: #e5e7eb;
      }
    }
  }
}

.price-card {
  .price-content {
    padding: 32rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 32rpx;
      letter-spacing: -0.3rpx;
    }
  }
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;

  &.coupon-row {
    padding: 8rpx 0;
    cursor: pointer;
  }

  &:last-child {
    margin-bottom: 0;
  }

  .price-label {
    font-size: 28rpx;
    color: #6b7280;
  }

  .price-value {
    font-size: 28rpx;
    color: #1f2937;
    font-weight: 500;
  }

  .price-value-large {
    font-size: 40rpx;
    color: #1f2937;
    font-weight: bold;
  }

  .discount-value {
    font-size: 28rpx;
    color: #f97316; /* orange-500 */
    font-weight: 500;
  }

  .balance-info {
    display: flex;
    align-items: center;
    gap: 16rpx;

    .balance-amount {
      font-size: 32rpx;
      color: #1f2937;
      font-weight: 500;
    }
  }

  .coupon-info {
    display: flex;
    align-items: center;
    gap: 16rpx;

    .arrow-icon {
      font-size: 36rpx;
      color: #9ca3af;
      font-weight: bold;
    }
  }

  .zhifufen_icon {
    width: 32rpx;
    height: 32rpx;
    margin-right: 8rpx;
  }

  .flex-row-start {
    display: flex;
    align-items: center;
  }

  .img {
    width: 24rpx;
    height: 24rpx;
    margin-left: 8rpx;
  }

  &.final-amount-row {
    padding-top: 16rpx;

    .final-amount-label {
      font-size: 32rpx;
      font-weight: 600;
      color: #1f2937;
    }

    .final-amount-value {
      font-size: 48rpx;
      font-weight: bold;
      color: #0ea5e9;
    }
  }
}

/* 固定底部区域样式 */
.fixed-bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20rpx);
  border-top: 1px solid rgba(229, 231, 235, 0.5);
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.08);
  z-index: 999;

  .countdown-info {
    padding: 24rpx 32rpx;
    text-align: center;

    .countdown-text {
      font-size: 24rpx;
      color: #6b7280;

      .countdown-time {
        color: #f97316; /* orange-500 */
        font-weight: 600;
      }
    }
  }

  .safe-area-bottom {
    padding: 0 32rpx 32rpx;
    padding-bottom: calc(32rpx + env(safe-area-inset-bottom));

    ::v-deep .uv-button {
      background: linear-gradient(to right, #38bdf8, #2563eb) !important;
      box-shadow: 0 8rpx 24rpx rgba(56, 189, 248, 0.2);
      border: none !important;
      transition: all 0.2s ease;

      &:active {
        transform: scale(0.98);
      }
    }
  }
}
</style>

<template>
  <view class="recharge-container">

    <uv-navbar :border="false" title="余额充值" autoBack placeholder safeAreaInsetTop>
      <template v-slot:right>
        <view style="margin-right: 200rpx; margin-bottom: 5rpx;">
          <CustomerServiceButton
              session-from="recharge_page"
              custom-class="server-icon-wrapper"
          />
        </view>
      </template>
    </uv-navbar>

    <view class="content-wrapper">
      <!-- 充值优惠横幅 -->
      <view class="promo-banner">
        <view class="promo-content">
          <text class="promo-title">充值优惠</text>
          <text class="promo-text">{{ promoText || '当前充值享多重好礼' }}</text>
        </view>
        <view class="promo-action" @click="showPromoDetail">
          <text class="promo-link">查看详情</text>
          <text class="chevron-right">›</text>
        </view>
      </view>

      <!-- 金额输入框 -->
      <view class="amount-input-section">
        <view class="amount-input-header">
          <view class="amount-label">充值金额</view>
          <view class="navbar-action" @click="goToRecords">
            <text class="action-text">充值记录</text>
          </view>
        </view>
        <view class="amount-input-wrapper">
          <text class="currency-symbol">¥</text>
          <uv-input
              v-model="rechargeAmount"
              placeholder="请输入充值金额"
              placeholderStyle="font-size: 40rpx;"
              type="digit"
              :disabled="isPaymentProcessing"
              border="none"
              fontSize="48rpx"
              color="#0d171b"
              :customStyle="inputCustomStyle"
              @input="onAmountChange"
          />
        </view>
      </view>

      <!-- 快捷金额选择 -->
      <view class="amount-grid">
        <view
            v-for="(amount, index) in quickAmounts"
            :key="index"
            :class="['amount-card', { 'selected': numericRechargeAmount === amount.value, 'special': amount.special }]"
            @click="selectAmount(amount.value)"
        >
          <view v-if="amount.special" class="special-offer">特惠</view>
          <text class="amount-text">{{ amount.value }}元</text>
        </view>
      </view>

      <!-- 支付方式选择（可选） -->
      <view class="payment-method-section" v-if="false">
        <view class="payment-method-label">支付方式</view>
        <view class="payment-method-options">
          <view
              :class="['payment-method-item', { 'active': payType === 'wechat' }]"
              @click="switchPayType('wechat')"
          >
            <text class="method-icon">💳</text>
            <text class="method-name">微信支付</text>
          </view>
          <view
              :class="['payment-method-item', { 'active': payType === 'alipay' }]"
              @click="switchPayType('alipay')"
          >
            <text class="method-icon">💵</text>
            <text class="method-name">支付宝</text>
          </view>
        </view>
      </view>

      <!-- 充值奖励 -->
      <view class="reward-section" v-if="hasReward">
        <view class="reward-card">
          <!-- <text class="reward-title">{{ currentReward.title || '充值奖励' }}</text> -->
          <view style="margin-bottom: 16rpx;">
            <StatusTag
                :text="currentReward.title || '充值奖励'"
                backgroundColor="#FDEEEE"
                textColor="#E53E3E"
                fontSize="24rpx"
                padding="8rpx 12rpx"
                borderRadius="12rpx"
                fontWeight="bold"
            ></StatusTag>
          </view>
          <view class="reward-content" v-if="currentReward.description">
            <rich-text :nodes="currentReward.description"></rich-text>
          </view>
          <view class="expand-details" @click="toggleStationList"
                v-if="currentReward.stationList && currentReward.stationList.length > 0">
            <text class="expand-text">{{ showStationList ? '收起适用站点详情' : '展开适用站点详情' }}</text>
            <uv-icon v-if="showStationList" name="arrow-down" size="16" color="#007AFF"></uv-icon>
            <uv-icon v-else name="arrow-up" size="16" color="#007AFF"></uv-icon>
          </view>

          <!-- 适用站点列表 -->
          <view v-if="showStationList && currentReward.stationList && currentReward.stationList.length > 0"
                class="station-list">
            <text v-for="(station, index) in currentReward.stationList" :key="index" class="station-item">
              {{ station }}
            </text>
          </view>
        </view>
      </view>

      <!-- 支付方式 -->
      <!-- <view class="payment-section">
          <text class="section-header">支付方式</text>
          <view class="payment-method">
              <view class="payment-info">
                  <image class="payment-logo" src="/static/wechat-pay.png" mode="aspectFit"></image>
                  <view class="payment-details">
                      <text class="payment-name">微信支付</text>
                      <text class="payment-desc">推荐微信用户使用</text>
                  </view>
              </view>
              <view class="help-btn">
                  <text class="help-icon">?</text>
              </view>
          </view>
      </view> -->

      <!-- 支付状态提示 -->
      <view v-if="paymentStatus" class="payment-status">
        <text :class="['status-text', paymentStatus.type]">{{ paymentStatus.message }}</text>
      </view>
    </view>

    <!-- 底部支付按钮 -->
    <view class="bottom-payment">
      <view
          class="payment-button"
          :class="{ 'disabled': isPaymentProcessing || numericRechargeAmount <= 0 }"
          @click="recharge"
      >
        <text class="button-text">{{ isPaymentProcessing ? '支付处理中...' : '立即充值' }}</text>
      </view>
    </view>

    <!-- 详情弹窗 -->
    <view v-if="showDetailModal" class="modal-overlay" @click="hidePromoDetail">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">充值优惠详情</text>
          <text class="modal-close" @click="hidePromoDetail">✕</text>
        </view>
        <view class="modal-body">
          <text class="detail-content">{{ promoDetailContent }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {alipayUnifiedOrder, alipayOrderResultQuery, wechatUnifiedOrder, wechatOrderResultQuery} from '../../api/pay';
import {getStyleContent} from '../../api/style';
import {getRechargeDiscounts, getRechargeAwardExplain} from '../../api/member';
import StatusTag from '../../components/common/StatusTag.vue';
import {contactCustomerService as contactCustomerServiceFn} from '@/utils/utils';
import CustomerServiceButton from '@/components/common/CustomerServiceButton.vue';

export default {
  components: {
    StatusTag,
    CustomerServiceButton
  },
  data() {
    return {
      rechargeAmount: "200", // 默认金额改为字符串200
      payType: 'wechat', // 支付方式：'alipay' 支付宝, 'wechat' 微信支付
      pollingTimer: null, // 轮询定时器
      isPaymentProcessing: false, // 防止重复支付
      currentTradeNo: null, // 当前订单号
      currentOutTradeNo: null, // 当前订单号
      paymentStatus: null, // 支付状态提示 { type: 'success|error|warning', message: '提示信息' }
      quickAmounts: [ // 快捷金额选项
        {value: 50, special: false},
        {value: 100, special: false},
        {value: 200, special: false},
        {value: 300, special: false},
        {value: 600, special: false},
        {value: 1000, special: false}
      ],
      inputCustomStyle: { // uv-input自定义样式
        padding: '0',
        fontSize: '48rpx',
        fontWeight: 'bold',
        backgroundColor: 'transparent',
        height: 'auto',
        flex: '1'
      },
      buttonCustomStyle: { // uv-button自定义样式
        width: '100%',
        height: '96rpx',
        borderRadius: '24rpx',
        fontSize: '36rpx',
        fontWeight: 'bold'
      },
      // 优惠活动相关数据
      promoText: '', // 优惠活动简介文本
      promoDetailContent: '', // 优惠活动详细内容
      showDetailModal: false, // 是否显示详情弹窗
      showStationList: false, // 是否展开站点列表
      stationList: [], // 适用站点列表（从接口动态获取）
      // 充值奖励映射（动态获取）
      rewardMapping: {},
      // 当前加载中的金额（防止重复请求）
      loadingAmount: null,
      // 输入金额的防抖定时器
      amountInputTimer: null
    }
  },
  computed: {
    // 确保充值金额为数字类型
    numericRechargeAmount() {
      return Number(this.rechargeAmount) || 0;
    },
    // 获取当前金额对应的奖励信息
    currentReward() {
      const amount = this.numericRechargeAmount;
      return this.rewardMapping[amount] || {
        title: null,
        description: null,
        stationList: []
      };
    },
    // 是否有奖励（只有特定金额才有奖励）
    hasReward() {
      const amount = this.numericRechargeAmount;
      const reward = this.rewardMapping[amount];
      return reward && reward.title && reward.stationList && reward.stationList.length > 0;
    }
  },
  watch: {
    // 监听充值金额变化，限制小数位
    rechargeAmount(newVal) {
      if (newVal && typeof newVal === 'string') {
        // 如果包含小数点，检查小数位数
        if (newVal.includes('.')) {
          const parts = newVal.split('.');
          // 如果小数点后超过两位，截取前两位
          if (parts[1] && parts[1].length > 2) {
            const limitedValue = parts[0] + '.' + parts[1].substring(0, 2);
            // 使用 $nextTick 确保在下一个 tick 更新，避免循环更新
            this.$nextTick(() => {
              if (this.rechargeAmount !== limitedValue) {
                this.rechargeAmount = limitedValue;
              }
            });
          }
        }
      }
    }
  },
  onLoad() {
    // 页面加载时获取优惠活动内容
    this.loadPromoContent();
    // 获取充值优惠金额列表
    this.loadRechargeDiscounts();
    // 加载默认金额的奖励说明
    const defaultAmount = Number(this.rechargeAmount) || 0;
    if (defaultAmount > 0) {
      this.loadRechargeAwardExplain(defaultAmount);
    }
  },
  beforeDestroy() {
    // 页面销毁时清除定时器
    this.clearPollingTimer();
    // 清除输入防抖定时器
    if (this.amountInputTimer) {
      clearTimeout(this.amountInputTimer);
      this.amountInputTimer = null;
    }
  },
  methods: {
    /**
     * 发起充值支付
     */
    async recharge() {
      // 输入验证
      const amount = Number(this.rechargeAmount);

      if (amount <= 0) {
        uni.showToast({
          title: '请输入有效的充值金额',
          icon: 'none'
        });
        return;
      }

      if (amount > 10000) {
        uni.showToast({
          title: '单次充值金额不能超过10000元',
          icon: 'none'
        });
        return;
      }

      if (this.isPaymentProcessing) {
        this.showPaymentStatus('warning', '支付正在处理中，请勿重复操作');
        return;
      }

      try {
        this.isPaymentProcessing = true;
        this.paymentStatus = null; // 清除之前的状态
        uni.showLoading({title: '正在创建订单...'});

        console.log('发起充值，金额：', amount)
        if (isNaN(amount)) {
          uni.showToast({
            title: '充值金额非法',
            icon: 'none'
          });
          this.isPaymentProcessing = false;
          return;
        }

        // 根据支付方式调用不同的统一下单接口
        let orderRes;
        if (this.payType === 'wechat') {
          // 微信支付
          orderRes = await this.callWechatUnifiedOrder(amount);
        } else {
          // 支付宝
          // #ifdef MP-ALIPAY
          // 支付宝小程序使用 alipayUnifiedOrder
          orderRes = await alipayUnifiedOrder({
            totalFee: Math.round(Number(amount) * 100).toString(),
            openId: uni.getStorageSync('openId'),
            subject: '账户充值', // 订单标题
            body: `充值金额：${amount}元` // 订单描述
          });
          // #endif

          // #ifndef MP-ALIPAY
          // 非支付宝小程序平台暂不支持支付宝支付
          throw new Error('当前平台不支持支付宝支付');
          // #endif
        }

        console.log('统一下单结果：', orderRes);
        uni.hideLoading();

        if (orderRes.code === 0 && orderRes.data) {
          // 保存订单号用于后续查询
          this.currentTradeNo = orderRes.data.tradeNo;
          this.currentOutTradeNo = orderRes.data.outTradeNo || orderRes.data.orderNo;

          // 调用支付接口
          if (this.payType === 'wechat') {
            this.currentTradeNo = orderRes.data.orderNo;
            await this.callWechatPayment(orderRes.data);
          } else {
            // #ifdef MP-ALIPAY
            await this.callAlipayPayment(orderRes.data);
            // #endif
          }
        } else {
          throw new Error(orderRes.msg || '创建订单失败');
        }
      } catch (error) {
        console.error('充值失败：', error);
        uni.hideLoading();
        if (error.resultCode === '6001') {
          this.showPaymentStatus('warning', '支付已取消，如需充值请重新操作');
        } else {
          this.showPaymentStatus('error', error.message || '充值失败，请重试');
        }
        this.isPaymentProcessing = false;
      }
    },

    /**
     * 调用支付宝支付接口
     * @param {Object} orderData 订单数据，包含orderStr或相关支付参数
     */
    callAlipayPayment(orderData) {
      return new Promise((resolve, reject) => {
        // 根据平台选择不同的支付方式
        // #ifdef MP-ALIPAY
        // 支付宝小程序使用 my.tradePay
        my.tradePay({
          tradeNO: orderData.tradeNo, // 后端返回的支付参数字符串
          success: (res) => {
            console.log('支付宝支付调用成功：', res);
            // 注意：这里的success只是表示调起支付成功，不是支付成功
            // 真正的支付结果需要通过轮询查询接口获取
            if (res.resultCode === '6001') {
              this.onPaymentCancelled(res);
              reject(res);
            } else if (res.resultCode === '9000') {
              this.startPaymentPolling();
              resolve(res);
            }
          },
          fail: (err) => {
            console.error('支付宝支付调用失败：', err);
            uni.showToast({
              title: '支付调用失败',
              icon: 'none'
            });
            reject(err);
          }
        });
        // #endif

        // #ifdef APP-PLUS
        // APP使用 uni.requestPayment
        uni.requestPayment({
          provider: 'alipay',
          orderInfo: orderData.tradeNo, // 服务器返回的订单信息字符串
          success: (res) => {
            console.log('APP支付宝支付成功：', res);
            this.startPaymentPolling();
            resolve(res);
          },
          fail: (err) => {
            console.error('APP支付宝支付失败：', err);
            uni.showToast({
              title: '支付失败',
              icon: 'none'
            });
            reject(err);
          }
        });
        // #endif

        // #ifndef MP-ALIPAY || APP-PLUS
        // 其他平台的处理
        uni.showToast({
          title: '当前平台暂不支持支付宝支付',
          icon: 'none'
        });
        reject(new Error('当前平台不支持支付宝支付'));
        // #endif
      });
    },

    /**
     * 开始支付结果轮询
     */
    startPaymentPolling() {
      if (!this.currentTradeNo) {
        console.error('订单号为空，无法开始轮询');
        return;
      }

      uni.showLoading({title: '支付处理中...'});

      // 清除之前的定时器
      this.clearPollingTimer();

      // 立即查询一次
      this.queryPaymentResult();

      // 每3秒轮询一次，最多轮询20次（1分钟）
      let pollCount = 0;
      const maxPollCount = 20;

      this.pollingTimer = setInterval(() => {
        pollCount++;
        if (pollCount >= maxPollCount) {
          this.clearPollingTimer();
          uni.hideLoading();
          uni.showToast({
            title: '支付超时，请稍后查看账户余额',
            icon: 'none'
          });
          return;
        }

        this.queryPaymentResult();
      }, 3000);
    },

    /**
     * 调用微信统一下单接口
     */
    async callWechatUnifiedOrder(amount) {
      // 获取 openId
      let openId = uni.getStorageSync('openId');

      // 根据平台确定交易类型
      let tradeType = 'JSAPI';
      // #ifdef APP-PLUS
      tradeType = 'APP';
      // #endif

      // #ifdef H5
      tradeType = 'MWEB';
      // #endif

      return await wechatUnifiedOrder({
        openId: openId,
        totalFee: Math.round(Number(amount) * 100).toString(),
        tradeType: tradeType
      });
    },

    /**
     * 调用微信支付接口
     * 根据不同的平台使用条件编译实现不同的支付方式
     * 支持平台：
     * - MP-WEIXIN: 微信小程序支付
     * - APP-PLUS: APP微信支付
     *
     * @param {Object} orderData 订单数据，包含以下字段：
     *   - timeStamp: 时间戳
     *   - nonceStr: 随机字符串
     *   - package: 包含prepay_id的包
     *   - sign: 签名
     *   - signType: 签名类型（RSA或MD5）
     *   - appId: 小程序/公众号ID
     */
    callWechatPayment(orderData) {
      return new Promise((resolve, reject) => {
        console.log('微信支付参数：', orderData);

        // #ifdef MP-WEIXIN
        // 微信小程序
        let paymentParams = {
          timeStamp: orderData.timeStamp + '',
          nonceStr: orderData.nonceStr,
          package: orderData.package || orderData.packageStr,
          signType: orderData.signType || 'MD5',
          paySign: orderData.sign || orderData.paySign,
          success: (res) => {
            console.log('微信小程序支付调起成功：', res);
            // 调起支付成功不代表支付成功，需要轮询查询结果
            this.startPaymentPolling();
            resolve(res);
          },
          fail: (err) => {
            console.error('微信小程序支付失败：', err);
            uni.hideLoading();
            if (err.errMsg && err.errMsg.includes('cancel')) {
              // 用户取消支付
              this.onPaymentCancelled(err);
            } else {
              this.showPaymentStatus('error', '支付失败，请重试');
            }
            this.isPaymentProcessing = false;
            reject(err);
          }
        };

        console.log('发起微信小程序支付，参数：', paymentParams);
        uni.requestPayment(paymentParams);
        // #endif

        // #ifdef APP-PLUS
        // APP 微信支付
        let appPaymentParams = {
          provider: 'wxpay',
          orderInfo: {
            appid: orderData.appId || orderData.appid,
            noncestr: orderData.nonceStr,
            package: orderData.package || 'Sign=WXPay',
            partnerid: orderData.partnerId || orderData.partnerid,
            prepayid: orderData.prepayId || orderData.prepayid,
            timestamp: orderData.timeStamp + '',
            sign: orderData.sign,
            signType: orderData.signType || 'MD5'
          },
          success: (res) => {
            console.log('APP微信支付调起成功：', res);
            this.startPaymentPolling();
            resolve(res);
          },
          fail: (err) => {
            console.error('APP微信支付失败：', err);
            uni.hideLoading();
            this.isPaymentProcessing = false;
            this.showPaymentStatus('error', '支付失败，请重试');
            reject(err);
          }
        };

        console.log('发起APP微信支付，参数：', appPaymentParams);
        uni.requestPayment(appPaymentParams);
        // #endif

        // #ifndef MP-WEIXIN || APP-PLUS
        // 其他平台不支持微信支付
        console.error('当前平台不支持微信支付');
        uni.showToast({
          title: '当前平台暂不支持微信支付',
          icon: 'none'
        });
        this.isPaymentProcessing = false;
        reject(new Error('当前平台不支持微信支付'));
        // #endif
      });
    },

    /**
     * 查询支付结果
     */
    async queryPaymentResult() {
      try {
        let queryRes;
        if (this.payType === 'wechat') {
          // 查询微信支付结果
          queryRes = await wechatOrderResultQuery({
            orderNo: this.currentOutTradeNo
          });
        } else {
          // 查询支付宝支付结果
          queryRes = await alipayOrderResultQuery({
            orderNo: this.currentOutTradeNo
          });
        }

        console.log('支付结果查询：', queryRes);

        if (queryRes.code === 0 && queryRes.data) {
          // 支付成功
          this.clearPollingTimer();
          uni.hideLoading();

          uni.showToast({
            title: '充值成功！',
            icon: 'success'
          });

          this.onPaymentSuccess(queryRes.data);

        } else {
          this.clearPollingTimer();
          uni.hideLoading();
          uni.showToast({
            title: '充值失败！',
            icon: 'error'
          });
          this.onPaymentFailed(queryRes.data);
        }
      } catch (error) {
        console.error('查询支付结果失败：', error);
        // 查询失败不中断轮询，继续等待下次查询
      }
    },

    /**
     * 支付成功处理
     * @param {Object} paymentData 支付成功数据
     */
    onPaymentSuccess(paymentData) {
      console.log('支付成功，支付数据：', paymentData);

      this.showPaymentStatus('success', `充值成功！已到账 ${this.rechargeAmount} 元`);

      // 发送事件通知父组件或全局
      uni.$emit('rechargeSuccess', {
        orderNo: this.currentOutTradeNo,
        amount: this.rechargeAmount,
        paymentData: paymentData
      });

      // 重置表单
      setTimeout(() => {
        // this.resetPaymentForm();
        uni.navigateBack();
      }, 2000);

      // 可以选择跳转到充值成功页面
      // uni.navigateTo({
      //     url: '/pages/recharge/success?orderNo=' + this.currentOrderNo
      // });
    },

    /**
     * 支付失败处理
     * @param {Object} paymentData 支付失败数据
     */
    onPaymentFailed(paymentData) {
      console.log('支付失败，支付数据：', paymentData);

      const failReason = paymentData.failReason || '支付失败';
      this.showPaymentStatus('error', `${failReason}，请重试或联系客服`);

      // 发送事件通知
      uni.$emit('rechargeFailed', {
        orderNo: this.currentOutTradeNo,
        amount: this.rechargeAmount,
        paymentData: paymentData
      });

      this.isPaymentProcessing = false;
    },

    /**
     * 支付取消处理
     * @param {Object} paymentData 支付取消数据
     */
    onPaymentCancelled(paymentData) {
      console.log('支付取消，支付数据：', paymentData);

      this.showPaymentStatus('warning', '支付已取消，如需充值请重新操作');

      // 发送事件通知
      uni.$emit('rechargeCancelled', {
        orderNo: this.currentOutTradeNo,
        amount: this.rechargeAmount,
        paymentData: paymentData
      });

      this.isPaymentProcessing = false;
    },

    /**
     * 显示支付状态
     * @param {String} type 状态类型：success、error、warning
     * @param {String} message 状态消息
     */
    showPaymentStatus(type, message) {
      this.paymentStatus = {type, message};

      // 3秒后自动清除状态提示（除了成功状态）
      if (type !== 'success') {
        setTimeout(() => {
          this.paymentStatus = null;
        }, 3000);
      }
    },

    /**
     * 重置支付表单
     */
    resetPaymentForm() {
      this.currentOutTradeNo = null;
      this.isPaymentProcessing = false;
      this.paymentStatus = null;
      this.clearPollingTimer();
    },

    /**
     * 清除轮询定时器
     */
    clearPollingTimer() {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
        this.pollingTimer = null;
      }
    },

    /**
     * 选择快捷金额
     * @param {Number} amount 金额
     */
    async selectAmount(amount) {
      if (!this.isPaymentProcessing) {
        this.rechargeAmount = String(amount);
        // 请求该金额对应的奖励说明
        await this.loadRechargeAwardExplain(amount);
      }
    },

    /**
     * 清空金额输入
     */
    clearAmount() {
      if (!this.isPaymentProcessing) {
        this.rechargeAmount = "";
      }
    },

    /**
     * 金额输入完成事件
     * @param {String|Number} value 输入的值
     */
    onAmountChange(value) {
      // 将值转为字符串处理
      let inputValue = String(value || '');

      // 限制最多两位小数
      if (inputValue) {
        // 如果包含小数点，检查小数位数
        if (inputValue.includes('.')) {
          const parts = inputValue.split('.');
          // 如果小数点后超过两位，截取前两位
          if (parts[1] && parts[1].length > 2) {
            inputValue = parts[0] + '.' + parts[1].substring(0, 2);
          }
        }
      }

      // 更新 rechargeAmount，确保输入框显示的是限制后的值
      this.rechargeAmount = inputValue;

      // 清除之前的定时器
      if (this.amountInputTimer) {
        clearTimeout(this.amountInputTimer);
      }

      // 防抖：用户停止输入500ms后，如果是整数金额，则加载奖励说明
      this.amountInputTimer = setTimeout(() => {
        const amount = Number(inputValue);
        // 如果是整数且大于0，加载对应的奖励说明
        if (amount > 0 && amount % 1 === 0) {
          this.loadRechargeAwardExplain(amount);
        }
      }, 500);
    },

    /**
     * 加载优惠活动内容
     */
    async loadPromoContent() {
      try {
        const response = await getStyleContent('REFILL_DISCOUNT');
        if (response.code === 0 && response.data) {
          // 提取简介文本（取第一句或前50个字符）
          const fullContent = response.data;
          this.promoDetailContent = fullContent;

          // 截取简介文本，取第一句话作为简介
          const firstSentence = fullContent.split('；')[0] + '；';
          this.promoText = firstSentence.length > 50 ?
              firstSentence.substring(0, 50) + '...' : firstSentence;
        }
      } catch (error) {
        console.error('加载优惠活动内容失败：', error);
        // 使用默认文本
        this.promoText = '充值赠券活动赠送优惠券为充电服务...';
      }
    },

    /**
     * 加载充值优惠金额列表
     */
    async loadRechargeDiscounts() {
      try {
        const response = await getRechargeDiscounts(100000);
        if (response.code === 0 && response.data && Array.isArray(response.data)) {
          // 将返回的金额数组（单位：分）转换为元，并更新 quickAmounts 的 special 属性
          const discountAmounts = response.data.map(amount => amount / 100); // 将分转换为元

          // 更新 quickAmounts，如果金额在优惠列表中，则设置 special 为 true
          this.quickAmounts = this.quickAmounts.map(item => {
            return {
              ...item,
              special: discountAmounts.includes(item.value)
            };
          });
        }
      } catch (error) {
        console.error('加载充值优惠金额列表失败：', error);
      }
    },

    /**
     * 加载充值奖励说明
     * @param {Number} amount 金额（单位：元）
     */
    async loadRechargeAwardExplain(amount) {
      // 防止重复请求
      if (this.loadingAmount === amount) {
        return;
      }

      // 如果已经加载过该金额的奖励说明，直接返回
      if (this.rewardMapping[amount]) {
        return;
      }

      try {
        this.loadingAmount = amount;
        const price = amount * 100; // 转换为分
        const response = await getRechargeAwardExplain(price);

        if (response.code === 0 && response.data && Array.isArray(response.data)) {
          const [title, descriptionHtml, stationArray] = response.data;
          console.log('descriptionHtml', descriptionHtml);
          console.log('stationArray', stationArray);

          // 提取站点名称列表
          const stationList = Array.isArray(stationArray)
              ? stationArray.map(item => item.name || item).filter(Boolean)
              : [];

          // 更新 rewardMapping - 使用展开运算符创建新对象，确保响应式更新
          this.rewardMapping = {
            ...this.rewardMapping,
            [amount]: {
              title: title || '充值奖励',
              description: descriptionHtml || '',
              stationList: stationList
            }
          };
        }
      } catch (error) {
        console.error('加载充值奖励说明失败：', error);
      } finally {
        this.loadingAmount = null;
      }
    },

    /**
     * 显示优惠详情弹窗
     */
    showPromoDetail() {
      this.showDetailModal = true;
    },

    /**
     * 隐藏优惠详情弹窗
     */
    hidePromoDetail() {
      this.showDetailModal = false;
    },

    /**
     * 切换站点列表展示状态
     */
    toggleStationList() {
      this.showStationList = !this.showStationList;
    },

    /**
     * 返回上一页
     */
    goBack() {
      uni.navigateBack();
    },

    /**
     * 跳转到充值记录页面
     */
    goToRecords() {
      uni.navigateTo({
        url: '/pages/account/records'
      });
    },

    /**
     * 切换支付方式（如果需要UI选择）
     */
    switchPayType(type) {
      this.payType = type;
      console.log('切换支付方式：', type);
    },
    // 联系客服
    contactCustomerService() {
      contactCustomerServiceFn();
    }
  }
}
</script>

<style scoped>
.amount-input-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.recharge-container {
  background-color: #f6f7f8;
  min-height: 100vh;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  position: relative;
}

/* 顶部导航栏 */
.top-navbar {
  position: sticky;
  top: 0;
  background-color: rgba(246, 247, 248, 0.8);
  backdrop-filter: blur(10px);
  z-index: 10;
  padding: 32rpx 32rpx 16rpx;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.back-icon {
  font-size: 48rpx;
  color: #0d171b;
  font-weight: bold;
}

.navbar-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #0d171b;
  flex: 1;
  text-align: center;
  padding-right: 80rpx;
}

.navbar-action {
  flex-shrink: 0;
}

.action-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #007AFF;
}

/* 内容包装器 */
.content-wrapper {
  padding: 0 32rpx 128rpx;
}

/* 充值优惠横幅 */
.promo-banner {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 48rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.promo-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex: 1;
}

.promo-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #007AFF;
  line-height: 1.2;
}

.promo-text {
  font-size: 28rpx;
  color: #64748b;
  line-height: 1.4;
}

.promo-action {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-shrink: 0;
}

.promo-link {
  font-size: 28rpx;
  font-weight: 500;
  color: #007AFF;
}

.chevron-right {
  font-size: 32rpx;
  color: #007AFF;
  font-weight: bold;
}

/* 金额输入框 */
.amount-input-section {
  margin-bottom: 48rpx;
}

.amount-label {
  font-size: 32rpx;
  font-weight: 500;
  color: #334155;
  display: block;
}

.amount-input-wrapper {
  position: relative;
  background: #FFFFFF;
  border-radius: 24rpx;
  border: 2rpx solid #e2e8f0;
  height: 128rpx;
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.amount-input-wrapper:focus-within {
  border-color: #007AFF;
  box-shadow: 0 0 0 4rpx rgba(0, 122, 255, 0.1);
}

.currency-symbol {
  font-size: 48rpx;
  font-weight: bold;
  color: #334155;
  margin-right: 16rpx;
}

/* 快捷金额网格 */
.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
  margin-bottom: 48rpx;
}

/* 支付方式选择 */
.payment-method-section {
  margin-bottom: 48rpx;
}

.payment-method-label {
  font-size: 32rpx;
  font-weight: 500;
  color: #334155;
  margin-bottom: 16rpx;
  display: block;
}

.payment-method-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.payment-method-item {
  background: #FFFFFF;
  border-radius: 24rpx;
  border: 2rpx solid #e2e8f0;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  transition: all 0.2s ease;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.payment-method-item:active {
  background-color: rgba(0, 122, 255, 0.05);
  border-color: #007AFF;
}

.payment-method-item.active {
  border-color: #007AFF;
  background-color: rgba(0, 122, 255, 0.1);
}

.method-icon {
  font-size: 32rpx;
}

.method-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #334155;
}

.payment-method-item.active .method-name {
  color: #007AFF;
}

.amount-card {
  position: relative;
  background: #FFFFFF;
  border-radius: 24rpx;
  height: 128rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #e2e8f0;
  transition: all 0.2s ease;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.amount-card:active {
  background-color: rgba(0, 122, 255, 0.1);
  border-color: #007AFF;
}

.amount-card.selected {
  border-color: #007AFF;
  background-color: rgba(0, 122, 255, 0.1);
}

.amount-text {
  font-size: 32rpx;
  font-weight: 500;
  color: #334155;
}

.amount-card.selected .amount-text {
  color: #007AFF;
}

.special-offer {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  background-color: #FFA500;
  color: white;
  padding: 4rpx 12rpx;
  font-size: 20rpx;
  font-weight: 500;
  border-radius: 12rpx;
  transform: rotate(15deg);
}

/* 充值奖励 */
.reward-section {
  margin-bottom: 48rpx;
}

.reward-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.reward-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #0d171b;
  line-height: 1.2;
  margin-bottom: 24rpx;
  display: block;
}

.reward-content {
  border-top: 2rpx solid #e2e8f0;
  padding-top: 24rpx;
  margin-bottom: 24rpx;
}

.reward-item {
  font-size: 32rpx;
  color: #64748b;
  line-height: 1.4;
  display: block;
  margin-bottom: 8rpx;
}

.reward-item:last-child {
  margin-bottom: 0;
}

.expand-details {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 2rpx solid #e2e8f0;
  padding-top: 24rpx;
}

.expand-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #007AFF;
}

.expand-icon {
  font-size: 36rpx;
  color: #007AFF;
}

/* 站点列表 */
.station-list {
  margin-top: 24rpx;
  padding: 16rpx;
  background: rgba(0, 122, 255, 0.05);
  border-radius: 12rpx;
  border: 1rpx solid rgba(0, 122, 255, 0.1);
}

.station-item {
  display: block;
  font-size: 26rpx;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 8rpx;
  padding: 8rpx 0;
  border-bottom: 1rpx solid rgba(0, 122, 255, 0.1);
}

.station-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

/* 支付状态提示 */
.payment-status {
  margin-top: 32rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  text-align: center;
}

.status-text {
  font-size: 28rpx;
  font-weight: 500;
  display: block;
  padding: 20rpx;
  border-radius: 12rpx;
}

.status-text.success {
  color: #16a34a;
  background-color: #f0fdf4;
  border: 1rpx solid #bbf7d0;
}

.status-text.error {
  color: #dc2626;
  background-color: #fef2f2;
  border: 1rpx solid #fecaca;
}

.status-text.warning {
  color: #d97706;
  background-color: #fffbeb;
  border: 1rpx solid #fed7aa;
}

/* 详情弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 24rpx;
  width: 90%;
  max-width: 600rpx;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #E2E8F0;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1A202C;
}

.modal-close {
  font-size: 36rpx;
  color: #4A5568;
  cursor: pointer;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 32rpx;
  max-height: 60vh;
}

.detail-content {
  font-size: 28rpx;
  color: #4A5568;
  line-height: 1.6;
  white-space: pre-line;
}

/* 底部支付按钮 */
.bottom-payment {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32rpx;
  background: linear-gradient(to top, #f6f7f8, transparent);
  backdrop-filter: blur(10px);
}

.payment-button {
  width: 100%;
  height: 112rpx;
  background: linear-gradient(to right, #007AFF, #60a5fa);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(0, 122, 255, 0.3);
  transition: all 0.2s ease;
}

.payment-button:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 16rpx rgba(0, 122, 255, 0.4);
}

.payment-button.disabled {
  background: #e2e8f0;
  box-shadow: none;
  transform: none;
}

.button-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #FFFFFF;
}

.payment-button.disabled .button-text {
  color: #94a3b8;
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

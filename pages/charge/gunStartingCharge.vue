<template>
  <view class="page-container">
    <!-- 条件渲染视图 -->
    <template v-if="pileInfo && memberInfo">
      <charge-idle-view
          ref="chargeIdleView"
          v-if="mainGunState === 1 || mainGunState === 2"
          :pile-info="pileInfo"
          :member-info="memberInfo"
          :payment-methods="paymentMethods"
          :preset-amount="presetAmount"
          :current-payment-type="currentPaymentType"
          :main-gun-params="gunParams"
          @show-price-details="handleShowPriceDetails"
          @payment-change="paymentMethodChange"
          @preset-amount-change="handlePresetAmountChange"
          @set-preset-amount="setPresetAmount"
          @dual-gun-change="handleDualGunChange"
          @gun-status-updated="handleGunStatusUpdated"
          @user-changed="handleUserChanged"
      />
      <charge-busy-view
          v-else
          :pile-info="pileInfo"
          :main-gun-state="mainGunState"
      />
    </template>

    <!-- 加载状态 -->
    <view v-else class="loading-container">
      <text>加载中...</text>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <uv-button 
        text="刷新" 
        type="info" 
        size="large"
        shape="circle"
        @click="refreshData">
      </uv-button>
      <uv-button 
        :text="chargeButtonText" 
        type="primary" 
        size="large"
        :disabled="isChargeButtonDisabled"
        shape="circle"
        :custom-style="startChargeButtonStyle"
        @click="startCharging">
      </uv-button>
    </view>

    <!-- 价格详情弹窗 -->
    <uv-popup 
      ref="priceDetailsPopup" 
      mode="bottom" 
      :round="20"
      :safe-area-inset-bottom="true"
      :closeable="true"
      close-icon-pos="top-right"
      bg-color="#fff"
      @change="handlePopupChange"
    >
      <view class="price-details-content">
        <view class="popup-header">
          <text class="popup-title">电价收费详情</text>
        </view>
        <view class="price-header">
          <text>收费时段</text>
          <text>费用(元/度)</text>
        </view>
        <view class="price-list">
          <stage-price-info v-for="(price, index) in priceDetailsData" :key="index" :price-info="price" />
        </view>
      </view>
    </uv-popup>

  </view>
</template>

<script>
import { getPileDTOByNo } from '@/api/pile.js';
import { getMemberInfo } from '@/api/member.js';
import { queryPayAccountSetting, getMinimumStartBalance } from '@/api/common.js';
import ChargeIdleView from '@/components/charge/ChargeIdleView.vue';
import ChargeBusyView from '@/components/charge/ChargeBusyView.vue';
import StagePriceInfo from '@/components/station/StagePriceInfo.vue';
import globalData from '@/globalData.js';
import { queryMemberStatus } from '@/api/member.js';
import { queryChargeRealy } from '@/api/charge.js';
import { startCharge } from '@/api/charge.js';
// 导入支付宝充完即退相关API
import { 
  disposableStartCharge,
  alipayDisposableUnifiedOrders, 
  alipayDisposableOrderResultQuery,
  alipayDisposableCancelRecharge
} from '@/api/pay.js';

export default {
  components: {
    ChargeIdleView,
    ChargeBusyView,
    StagePriceInfo
  },
  data() {
    return {
      pileNo: null,
      pileInfo: null,
      memberInfo: null,
      paymentMethods: [],
      minimumStartBalance: 0,
      isGunPlugged: false, // 假设默认未插枪
      presetAmount: '',
      currentPaymentType: -1,
      showPriceDetails: false,
      priceDetailsData: [], // 存储价格详情数据
      mainGunState: null,
      // 当前选中的枪信息（通过接口获取）
      gunParams: {
        gunNo: null,
        gunId: null,
        gunName: '',
        gunType: '',
        pileName: '',
        pileNum: '',
        maxPower: '',
        current: '',
        valleyVol: '',
        peakVol: '',
        currentPrice: '',
        stationId: '',
        stationName: ''
      },
      // 双枪状态
      dualGunInfo: {
        mainGun: null,
        secondaryGun: null
      },
      startChargeButtonStyle: {
        width: '90%',
        backgroundColor: '#007aff',
        color: '#fff'
      },
      // 支付宝充完即退相关状态
      alipayOrderInfo: {
        orderNo: '',
        isProcessing: false,
        pollTimer: null,
        pollCount: 0
      },
      // 启动中状态
      isStarting: false,
    };
  },
  computed: {
    chargeButtonText() {
      // 启动中时显示启动状态
      if (this.isStarting) {
        return '启动中...';
      }
      // 正在轮询支付结果时显示等待状态
      if (this.alipayOrderInfo.pollTimer) {
        return '支付确认中...';
      }
      // 支付宝订单处理中时显示处理状态
      if (this.alipayOrderInfo.isProcessing) {
        return '处理中...';
      }
      // 当主枪和从枪都有时显示双枪并充
      if (this.dualGunInfo.mainGun && this.dualGunInfo.secondaryGun) {
        return '双枪并充';
      }

      if ((this.presetAmount == 0 || this.presetAmount == '0') && this.currentPaymentType == 1) {
        return '余额不足';
      }

      if (this.currentPaymentType == -1 && this.presetAmount < 300) {
        return '预充金额小于三元';
      }

      return '开启充电';
    },
    // 控制充电按钮的禁用状态
    isChargeButtonDisabled() {
      // 启动中时禁用
      if (this.isStarting) {
        return true;
      }
      // 未插枪时禁用
      if (!this.isGunPlugged) {
        return true;
      }
      // 支付宝订单处理中时禁用
      if (this.alipayOrderInfo.isProcessing) {
        return true;
      }
      // 正在轮询支付结果时禁用
      if (this.alipayOrderInfo.pollTimer) {
        return true;
      }
      if ((this.presetAmount == 0 || this.presetAmount == '0') && this.currentPaymentType == 1) {
        return true;
      }
      if (this.currentPaymentType == -1 && this.presetAmount < 300) {
        return true;
      }
      return false;
    }
  },
  onLoad(options) {
    console.log('gunStartingCharge onLoad', options)
    // 只接收 pileNo 和 gunNo 参数，其他数据通过 getPileDTOByNo 接口获取
    if (!options.pileNum || !options.gunNo) {
      uni.showToast({
        title: '参数缺失：需要桩编号和枪编号',
        icon: 'none'
      });
      return;
    }
    
    this.pileNo = options.pileNum;
    // 只保存必要的参数用于后续查找
    this.gunParams.gunNo = options.gunNo;
    
    console.log('接收到的参数:', { pileNo: this.pileNum, gunNo: options.gunNo });
    
    // 页面打开时立即调用获取桩详情数据
    this.refreshData();
  },
  onUnload() {
    // 页面卸载时清理定时器
    this.clearAllTimers();
  },
  onHide() {
    // 页面隐藏时清理定时器（例如切换到其他应用）
    this.clearAllTimers();
  },
  methods: {
    handlePresetAmountChange(value) {
      console.log('handlePresetAmountChange',value)
      this.presetAmount = value;
    },
    async refreshData() {
      uni.showLoading({ title: '正在刷新...' });
      try {
        const [pileRes, memberRes, paymentRes, balanceRes] = await Promise.all([
          getPileDTOByNo({ pileNo: this.pileNo, sellerId: globalData.sellerId }),
          getMemberInfo(),
          queryPayAccountSetting({ disposablePayMode: true, pileNo: this.pileNo }),
          getMinimumStartBalance()
        ]);

        if (pileRes.code === 0) {
          console.log('获取桩详情数据成功:', pileRes.data);
          this.pileInfo = pileRes.data;
          
          // 从接口返回数据中查找指定的枪
          if (this.pileInfo && this.pileInfo.gunDTOList) {
            console.log('枪列表数据:', this.pileInfo.gunDTOList);
            console.log('查找枪编号:', this.gunParams.gunNo);
            
            // 根据枪编号查找对应的枪
            const targetGun = this.pileInfo.gunDTOList.find(gun => gun.gunno === this.gunParams.gunNo);
            
            if (targetGun) {
              // 更新gunParams，补充从接口获取的枪详细信息
              this.gunParams = {
                ...this.gunParams,
                gunId: targetGun.gunid,
                gunName: targetGun.gunName,
                gunType: targetGun.currentMode,
                pileName: targetGun.pilename,
                pileNum: targetGun.pileno,
                maxPower: targetGun.ratedPower,
                current: targetGun.ratedCurrent,
                valleyVol: targetGun.ratedMinVoltage,
                peakVol: targetGun.ratedMaxVoltage,
                currentPrice: targetGun.nowPrice ? targetGun.nowPrice.currentPriceStr : '0.00',
                stationId: this.pileInfo.stationId,
                stationName: this.pileInfo.stationName
              };
              
              // 更新主枪状态
              this.mainGunState = targetGun.gunState;
              
              console.log('找到目标枪信息:', this.gunParams);
              console.log(`枪${this.gunParams.gunId}状态: ${this.mainGunState}`);
              
              // 检查枪状态并给出相应提示
              if (this.mainGunState === 3) {
                // 枪正在充电
                uni.showModal({
                  title: '提示',
                  content: '该充电枪正在充电中，请重新选择其他充电枪',
                  showCancel: false,
                  success: (res) => {
                    if (res.confirm) {
                      uni.navigateBack();
                    }
                  }
                });
              } else if (this.mainGunState === 5) {
                // 枪离线
                uni.showModal({
                  title: '提示',
                  content: '该充电枪离线，请重新选择其他充电枪',
                  showCancel: false,
                  success: (res) => {
                    if (res.confirm) {
                      uni.navigateBack();
                    }
                  }
                });
              }
            } else {
              // 未找到指定的枪
              uni.showToast({
                title: `未找到枪编号为 ${this.gunParams.gunNo} 的充电枪`,
                icon: 'none'
              });
              return;
            }
          }
        }
        if (memberRes.code === 0) {
          this.memberInfo = memberRes.data;
          uni.setStorageSync('tokenMemberType', this.memberInfo.tokenMemberType);
          uni.setStorageSync('memberInfo', this.memberInfo);
        }
        if (paymentRes.code === 0) {
          this.paymentMethods = paymentRes.data.map(p => {
            if (p.payType === 1) p.balance = this.memberInfo.accountBalance;
            if (p.payType === 6) p.balance = 'N/A';
            p.showTopUp = p.payType === 1;
            return p;
          });
        }
        
        // 根据账户余额设置默认支付方式
        console.log('this.memberInfo',this.memberInfo)
        if (this.memberInfo && this.memberInfo.accountBalance) {
          const accountBalance = parseInt(this.memberInfo.accountBalance);
          if (this.memberInfo.deductMode === 'LeaguerAccount' && this.memberInfo.tokenMemberType === 0 && accountBalance > 0) {
            this.currentPaymentType = 1; // 个人账户
            this.setPresetAmount('all');
          } else if (this.memberInfo.deductMode === 'TeamAccount' && this.memberInfo.tokenMemberType === 2) {
            this.currentPaymentType = 2; // 车队账户
          } else if (this.memberInfo.deductMode === 'LeaguerAccount' && this.memberInfo.tokenMemberType === 2) {
            this.currentPaymentType = 2; // 车队账户
          } else {
            this.currentPaymentType = -1; // 无支付方式
            this.setPresetAmount('5000');
          }
        } else {
          this.currentPaymentType = -1; // 没有账户信息时默认为-1
        }
        if (balanceRes.code === 0) {
          this.minimumStartBalance = balanceRes.data.configurationValue;
        }

      } catch (error) {
        console.error("刷新数据失败", error);
        uni.showToast({ title: '刷新失败', icon: 'none' });
      } finally {
        uni.hideLoading();
      }
    },
    // 处理双枪状态变化
    handleDualGunChange(gunInfo) {
      this.dualGunInfo = gunInfo;
      console.log('双枪状态变化:', gunInfo);
    },
    // 处理充电枪状态更新
    handleGunStatusUpdated(statusData) {
      console.log('充电枪状态更新:', statusData);
      
      if (this.pileInfo && this.pileInfo.gunDTOList) {
        // 根据枪ID或枪编号找到对应的枪并更新状态
        const gunIndex = this.pileInfo.gunDTOList.findIndex(gun => 
          gun.gunid === statusData.gunId || gun.gunno === statusData.gunNo
        );
        if (gunIndex !== -1) {
          // 使用Vue.set或直接赋值来确保响应式更新
          this.$set(this.pileInfo.gunDTOList, gunIndex, {
            ...this.pileInfo.gunDTOList[gunIndex],
            gunState: statusData.newState
          });
          
          // 如果更新的是当前选中的枪，同时更新主枪状态
          if (this.pileInfo.gunDTOList[gunIndex].gunno === this.gunParams.gunNo) {
            this.mainGunState = statusData.newState;
          }
          
          // 更新插枪状态
          this.isGunPlugged = this.pileInfo.gunDTOList.some(gun => gun.gunState === 2);
          
          console.log(`枪${statusData.gunId || statusData.gunNo}状态已更新为: ${statusData.newState}`);
        }
      }
    },
    // 处理用户身份切换后的重新加载
    handleUserChanged() {
      console.log('用户身份已切换，重新加载页面数据');
      uni.showToast({
        title: '身份切换成功',
        icon: 'success'
      });
      // 重新加载页面数据
      this.refreshData();
    },
    // 处理显示价格详情
    handleShowPriceDetails(priceDetailsData) {
      console.log('收到价格详情数据:', priceDetailsData);
      this.priceDetailsData = priceDetailsData;
      // 使用 uv-popup 的 open 方法打开弹窗
      this.$refs.priceDetailsPopup.open();
    },
    // 处理弹窗状态变化
    handlePopupChange(e) {
      console.log('弹窗状态变化:', e);
      this.showPriceDetails = e.show;
    },
    paymentMethodChange(newType) {
      this.currentPaymentType = newType;
      console.log('newType',newType)
      if (newType == -1) {
        this.setPresetAmount('5000');
      } else if (newType == 1) {
        this.setPresetAmount('all');
      }
    },
    setPresetAmount(value) {
      if (value === 'all') {
        const personalAccount = this.paymentMethods.find(p => p.payType === 1);
        this.presetAmount = personalAccount ? personalAccount.balance : '0';
      } else {
        this.presetAmount = value;
      }
    },
    async startCharging() {
      if (!this.gunParams.pileNum || !this.gunParams.gunId) {
        uni.showToast({ title: '枪信息未加载完成无法启动充电', icon: 'none' });
        return;
      }
      
      // 设置启动中状态
      this.isStarting = true;
      uni.showLoading({ title: '正在启动充电...' });
      
      try {
        // 检查充电枪状态
        const res = await queryChargeRealy({
          pileNo: this.gunParams.pileNum,
          gunNo: this.gunParams.gunNo,
          platformNo: null,
          hulianinterfaceId: null
        });
        
        if (res && res.code === 0 && res.data.flag) {
          const memberRes = await queryMemberStatus();
          if (memberRes && memberRes.code === 0 && memberRes.data.chargeStatus === 'Free') {
            // 校验是否正在充电
            if (memberRes.data.ifCharging === true) {
              uni.showToast({ title: '当前正在充电无法启动', icon: 'none' });
              return;
            }
            
            const balanceRes = await getMinimumStartBalance();
            console.log('当前账户余额:', this.memberInfo.accountBalance);
            console.log('当前支付方式:', this.currentPaymentType);
            
            // 判断支付方式：个人余额充电 vs 充完即退
            if (this.currentPaymentType === 1) {
              // 个人余额充电逻辑
              await this.handleBalanceCharging(balanceRes);
            } else if (this.currentPaymentType === -1) {
              // 支付宝充完即退逻辑
              await this.handleAlipayDisposableCharging();
            } else if (this.currentPaymentType === 2) {
              // 车队账户充电逻辑
              await this.handleFleetAccountCharging();
            } else {
              uni.showToast({ title: '不支持的支付方式', icon: 'none' });
            }
          } else {
            if (memberRes && memberRes.code === 3) {
              uni.showToast({ title: '存在未支付账单无法启动充电', icon: 'none' });
            } else {
              uni.showToast({ title: '会员状态异常无法启动充电', icon: 'none' });
            }
          }
        } else {
          uni.showToast({ title: '枪状态异常无法启动充电', icon: 'none' });
        }
      } catch (error) {
        console.error('启动充电过程中发生错误:', error);
        uni.showToast({ title: '启动充电失败，请重试', icon: 'none' });
      } finally {
        // 无论成功还是失败，都要重置启动中状态
        this.isStarting = false;
        setTimeout(() => {
          uni.hideLoading();
        }, 1000);
      }
    },
    
    // 处理个人余额充电
    async handleBalanceCharging(balanceRes) {
      try {
        console.log('this.presetAmount',this.presetAmount)
        
        // 校验金额小数位数是否超过2位
        const amountInYuan = this.presetAmount / 100;
        const decimalPart = amountInYuan.toString().split('.')[1];
        console.log('decimalPart',decimalPart)
        if ((decimalPart && decimalPart.length > 2)) {
          uni.showToast({ 
            title: '充电金额最多支持2位小数，请重新输入', 
            icon: 'none' 
          });
          return;
        }
        
        if (balanceRes && balanceRes.code === 0 && (this.presetAmount / 100) < balanceRes.data.configurationValue) {
          uni.showToast({ 
            title: `最低启动金额为${balanceRes.data.configurationValue}元，当前启动金额为${this.presetAmount / 100}元，无法启动充电`, 
            icon: 'none' 
          });
          return;
        }

        if (this.memberInfo.accountBalance < this.presetAmount) {
          uni.showToast({ 
            title: `当前账户余额为${this.memberInfo.accountBalance / 100}元，无法启动充电`, 
            icon: 'none' 
          });
          return;
        }
        
        const startChargeRes = await startCharge({
          carNum: this.memberInfo.plateNo,
          chargeMode: 0,
          gunNo: this.gunParams.gunNo,
          hulianinterfaceId: null,
          isParallelCharge: 0,
          payMode: parseInt(this.currentPaymentType),
          pileNo: this.gunParams.pileNum,
          platformNo: null,
          preChargeAmount: this.presetAmount / 100 > 200 ? 200 : (this.presetAmount / 100).toFixed(2), // 单位为分
          qrCode: "undefined",
          valtageType: 0
        });
      
        if (startChargeRes && startChargeRes.code === 0 && startChargeRes.data.busId) {
          console.log('启动充电参数', startChargeRes.data);
          uni.navigateTo({
            url: `/pages/charge/charging?pileNo=${this.gunParams.pileNum}&gunNo=${this.gunParams.gunNo}&busId=${startChargeRes.data.busId}&gunId=${this.gunParams.gunId}&billId=${startChargeRes.data.orderId}&animationEnabled=true`
          });
        } else {
          uni.showToast({ title: startChargeRes.msg || '启动充电失败', icon: 'none' });
        }
      } catch (error) {
        console.error('个人余额充电失败:', error);
        uni.showToast({ title: '启动充电失败，请重试', icon: 'none' });
      } finally {
        // 无论成功还是失败，都要重置启动中状态
        this.isStarting = false;
        setTimeout(() => {
          uni.hideLoading();
        }, 1000);
      }
    },
    // 车队账户充电
    async handleFleetAccountCharging() {
      try {
        // 车队账户充电逻辑
        const startChargeRes = await startCharge({
          carNum: this.memberInfo.plateNo,
          chargeMode: 0,
          gunNo: this.gunParams.gunNo,
          hulianinterfaceId: null,
          isParallelCharge: 0,
          payMode: 2,
          pileNo: this.gunParams.pileNum,
          platformNo: null,
          qrCode: "undefined",
          valtageType: 0
        });

        if (startChargeRes && startChargeRes.code === 0 && startChargeRes.data.busId) {
          uni.navigateTo({
            url: `/pages/charge/charging?pileNo=${this.gunParams.pileNum}&gunNo=${this.gunParams.gunNo}&busId=${startChargeRes.data.busId}&gunId=${this.gunParams.gunId}&billId=${startChargeRes.data.orderId}&animationEnabled=true`
          });
        } else if (startChargeRes && startChargeRes.code === 5) {
          uni.showToast({ title: startChargeRes.msg || '启动充电失败请联系客服', icon: 'none' });
        } 
        else {
          uni.showToast({ title: startChargeRes.msg || '启动充电失败', icon: 'none' });
        }
      } catch (error) {
        console.error('车队账户充电失败:', error);
        uni.showToast({ title: '启动充电失败，请重试', icon: 'none' });
      } finally {
        // 无论成功还是失败，都要重置启动中状态
        this.isStarting = false;
        setTimeout(() => {
          uni.hideLoading();
        }, 1000);
      }
    },
    // 处理支付宝充完即退充电
    async handleAlipayDisposableCharging() {
      try {
        // 防止重复提交
        if (this.alipayOrderInfo.isProcessing) {
          uni.showToast({ title: '正在处理中，请稍候...', icon: 'none' });
          return;
        }
        
        this.alipayOrderInfo.isProcessing = true;
        uni.showLoading({ title: '正在创建订单...' });
        
        // 第1步：充电前校验
        console.log('开始支付宝充完即退流程 - 充电前校验');
        const createOrderRes = await disposableStartCharge({
          pileNo: this.gunParams.pileNum,
          gunNo: this.gunParams.gunNo,
          preChargeAmount: (parseFloat(this.presetAmount) / 100).toFixed(2), // 单位为元
          carNum: null,
          chargeMode: 0,
          valtageType: 0,
          payMode: 1
        });
        
        if (createOrderRes.code !== 0) {
          throw new Error(createOrderRes.msg || '充电前校验失败');
        }
        
        console.log('充电前校验成功', createOrderRes.data);
        
        // 第2步：支付宝统一下单
        uni.showLoading({ title: '正在生成支付参数...' });
        const unifiedOrderRes = await alipayDisposableUnifiedOrders({
          totalFee: parseFloat(this.presetAmount),
          openId: uni.getStorageSync('openId'),
        });
        
        if (unifiedOrderRes.code !== 0) {
          throw new Error(unifiedOrderRes.msg || '生成支付参数失败');
        }
        
        uni.hideLoading();
        console.log('支付参数生成成功，准备调起支付宝支付',unifiedOrderRes.data);
        this.alipayOrderInfo.orderNo = unifiedOrderRes.data.outTradeNo;
        
        // 第3步：调起支付宝支付
        await this.invokeAlipayment(unifiedOrderRes.data.tradeNo);
        
      } catch (error) {
        console.error('支付宝充完即退流程失败:', error);
        setTimeout(() => {
          uni.hideLoading();
        }, 1000);
        uni.showToast({ title: error.message || '启动充电失败', icon: 'none' });
        
        // 发生错误时取消订单
        if (this.alipayOrderInfo.orderNo) {
          this.cancelAlipayOrder('启动流程异常');
        }
      } finally {
        this.alipayOrderInfo.isProcessing = false;
        // 无论成功还是失败，都要重置启动中状态
        this.isStarting = false;
        setTimeout(() => {
          uni.hideLoading();
        }, 1000);
      }
    },
    
    // 调起支付宝支付
    async invokeAlipayment(orderStr) {
      return new Promise((resolve, reject) => {
        // 根据平台选择不同的支付方式
        // #ifdef MP-ALIPAY
        // 支付宝小程序使用 my.tradePay
        my.tradePay({
            tradeNO: orderStr, // 后端返回的支付参数字符串
            success: (res) => {
                console.log('支付宝支付调用成功：', res);
                // 注意：这里的success只是表示调起支付成功，不是支付成功
                // 真正的支付结果需要通过轮询查询接口获取
                if (res.resultCode === '6001') {
                  uni.showToast({
                    title: '支付已取消',
                    icon: 'none'
                  });
                  reject(res);
                } else if (res.resultCode === '9000') {
                  this.startPaymentResultPolling();
                  uni.showToast({
                    title: '支付成功，请勿离开页面，等待充电启动',
                    icon: 'success'
                  });
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
      });
    },
    
    // 开始轮询支付结果
    startPaymentResultPolling() {
      console.log('开始轮询支付结果...');
      this.alipayOrderInfo.pollCount = 0;
      
      const pollInterval = 3000; // 3秒轮询一次
      const maxPollCount = 20; // 最多轮询10次（30秒）
      
      this.alipayOrderInfo.pollTimer = setInterval(async () => {
        this.alipayOrderInfo.pollCount++;
        console.log(`第${this.alipayOrderInfo.pollCount}次查询支付结果`);
        
        try {
          console.log('this.alipayOrderInfo.orderNo', this.alipayOrderInfo.orderNo);
          const queryRes = await alipayDisposableOrderResultQuery({
            orderNo: this.alipayOrderInfo.orderNo
          });
          
          if (queryRes.code === 0) {
            // 支付成功，清除轮询并启动充电
            this.clearPaymentPolling();
            console.log('支付成功，准备启动充电');
            await this.startChargingAfterPayment();
            
          } else if (this.alipayOrderInfo.pollCount >= maxPollCount) {
            // 轮询超时，取消订单
            this.clearPaymentPolling();
            uni.showToast({ title: '支付结果查询超时，订单已取消', icon: 'none' });
            this.cancelAlipayOrder('支付结果查询超时');
          }
          // 其他情况继续轮询
          
        } catch (error) {
          console.error('查询支付结果失败:', error);
          if (this.alipayOrderInfo.pollCount >= maxPollCount) {
            this.clearPaymentPolling();
            this.cancelAlipayOrder('查询支付结果异常');
          }
        }
      }, pollInterval);
    },
    
    // 充完即退支付成功后启动充电
    async startChargingAfterPayment() {
      try {
        uni.showLoading({ title: '正在启动充电...' });
        
        
        uni.hideLoading();

        const startChargeRes = await disposableStartCharge({
          pileNo: this.gunParams.pileNum,
          gunNo: this.gunParams.gunNo,
          preChargeAmount: parseFloat(this.presetAmount) / 100, // 单位为元
          carNum: this.memberInfo.plateNo,
          chargeMode: 0,
          valtageType: 0,
          payMode: 1,
          qrCode: "undefined",
          disposablePayMode: true,
          orderNumber: this.alipayOrderInfo.orderNo,
          isParallelCharge: 0
        })
        
        if (startChargeRes && startChargeRes.code === 0 && startChargeRes.data.busId) {
          // 成功启动充电，跳转到充电页面
          uni.showToast({ title: '充电启动成功', icon: 'success' });
          uni.navigateTo({
            url: `/pages/charge/charging?pileNo=${this.gunParams.pileNum}&gunNo=${this.gunParams.gunNo}&busId=${startChargeRes.data.busId}&gunId=${this.gunParams.gunId}&billId=${startChargeRes.data.orderId}&animationEnabled=true`
          });
          
          // 清理订单信息
          this.alipayOrderInfo.orderNo = '';
        } else {
          throw new Error(startChargeRes.msg || '启动充电失败');
        }
        
      } catch (error) {
        console.error('启动充电失败:', error);
        setTimeout(() => {
          uni.hideLoading();
        }, 1000);
        uni.showToast({ title: error.message || '启动充电失败', icon: 'none' });
        
        // 启动失败，退款处理由后端自动处理
        uni.showModal({
          title: '提示',
          content: '充电启动失败，支付款项将在1-3个工作日内自动退回',
          showCancel: false
        });
      }
    },
    
    // 取消支付宝订单
    async cancelAlipayOrder(reason = '用户取消') {
      if (!this.alipayOrderInfo.orderNo) return;
      
      try {
        console.log(`正在取消订单: ${this.alipayOrderInfo.orderNo}, 原因: ${reason}`);
        const cancelRes = await alipayDisposableCancelRecharge({
          orderNo: this.alipayOrderInfo.orderNo,
          cancelReason: reason
        });
        
        if (cancelRes.code === 0) {
          console.log('订单取消成功');
          uni.showToast({ title: '订单已取消，款项将原路退回', icon: 'none' });
        } else {
          console.error('订单取消失败:', cancelRes.msg);
        }
      } catch (error) {
        console.error('取消订单请求失败:', error);
      } finally {
        // 清理订单信息
        this.alipayOrderInfo.orderNo = '';
      }
    },
    
    // 清理支付结果轮询
    clearPaymentPolling() {
      if (this.alipayOrderInfo.pollTimer) {
        clearInterval(this.alipayOrderInfo.pollTimer);
        this.alipayOrderInfo.pollTimer = null;
        console.log('支付结果轮询已清理');
      }
    },
    contactSupport() {
      uni.makePhoneCall({ phoneNumber: '400-011-0328' });
    },
    // 清理所有定时器
    clearAllTimers() {
      console.log('正在清理页面中的所有定时器...');
      
      // 清理ChargeIdleView中的定时器
      if (this.$refs.chargeIdleView && this.$refs.chargeIdleView.clearTimers) {
        this.$refs.chargeIdleView.clearTimers();
        console.log('ChargeIdleView定时器已清理');
      }
      
      // 清理支付宝支付结果轮询定时器
      this.clearPaymentPolling();
      
      // 如果正在处理支付宝订单，取消订单
      if (this.alipayOrderInfo.isProcessing && this.alipayOrderInfo.orderNo) {
        this.cancelAlipayOrder('页面离开，取消订单');
      }
      
      console.log('所有定时器清理完成');
    }
  }
};
</script>

<style scoped>
.page-container {
  background-color: #f5f5f5;
  padding-bottom: 180rpx; /* 为底部栏预留安全区域 */
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 160rpx;
  background-color: #fff;
  border-top: 1rpx solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  gap: 15rpx;
  padding-left: 30rpx;
  padding-right: 30rpx;
  padding-top: 10rpx;
  padding-bottom: 10rpx;
}
.refresh-button {
  background-color: #f0f0f0;
}
.start-charge-button {
  flex-grow: 1;
  margin-left: 20rpx;
  background-color: #007aff;
  color: #fff;
}
.start-charge-button.disabled {
  background-color: #a0cfff;
}
.fab-button {
  position: fixed;
  right: 30rpx;
  bottom: 200rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #007aff;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.2);
}
/* 价格详情弹窗样式 */
.price-details-content {
  padding: 30rpx;
  min-height: 400rpx;
}

.popup-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #e0e0e0;
}

.popup-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.price-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
  font-weight: bold;
  color: #666;
  font-size: 28rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.price-list {
  max-height: 60vh;
  overflow-y: auto;
}
</style>

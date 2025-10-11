<template>
  <view class="content-wrapper" :class="{ 'keyboard-show': isKeyboardShow }">
    <!-- 当前身份 -->
      <view class="identity-section">
        <view>
          <text>当前身份：</text>
          <text>{{ memberInfo.tokenMemberType === 0 ? '个人身份' : '车队身份' }}</text>
          <text>（{{ memberInfo.name }}）</text>
        </view>
        <text @click="changeUser" v-if="memberInfo.groupName">切换身份</text>
      </view>

    <!-- 选中枪信息 -->
    <SelectedGun 
      ref="selectedGun"
      :pile-info="pileInfo" 
      :main-gun-params="mainGunParams"
      :pile-no="pileInfo?.pileNo"
      @dual-gun-change="handleDualGunChange"
      @gun-status-updated="handleGunStatusUpdated"
    />

    <!-- 价格信息 -->
    <view class="price-section-card">
      <view class="price-symbol">
        <text class="price-symbol-text">¥</text>
      </view>
      <view class="price-section-header">
        <text class="price-section-title">费用信息</text>
        <text class="price-details-btn" @click="showPriceDetails">价格详情</text>
      </view>
      <view class="tag">
        <text>当前计费时段 {{ currentPriceInfo.currentStartTime }} - {{ currentPriceInfo.currentEndTime }}</text>
      </view>
      <view>
        <text class="current-price">{{ currentPriceInfo.currentPriceStr }}</text>
        <text style="font-size: 28rpx; color: #999;"> 元/度</text>
        <text v-if="currentPriceInfo.discount" class="original-price">{{ currentPriceInfo.sweepPriceStr }} 元/度</text>
      </view>
      <view class="price-row sub-price">
        <text>电费 {{ currentPriceInfo.currentPowerPriceStr }} 元/度</text>
        <text style="margin-left: 10rpx;">服务费 {{ currentPriceInfo.currentServicePriceStr }} 元/度</text>
      </view>
      <!-- <view class="price-row" v-if="currentPriceInfo.discount">
        <text class="discount-tag">有优惠</text>
      </view> -->
    </view>

    <!-- 充电车辆 -->
    <view class="vehicle-section-card">
      <view class="vehicle-symbol">
        <!-- <image 
          :src="vehicleSvg" 
          mode="widthFix" 
          :style="{width: memberInfo.plateNo ? '72px' : '32px', height: memberInfo.plateNo ? '72px' : '32px'}"
        /> -->
      </view>
      <text class="section-title">充电车辆</text>
      <view class="plate-no-wrapper" v-if="memberInfo.plateNo">
        <text class="plate-no">{{ memberInfo.plateNo }}</text>
        <uv-icon name="edit-pen" color="#007BFF" size="22" @click="goToVehicleList"></uv-icon>
      </view>
      <view style="margin-top: 20rpx;" v-else>
        <uv-button type="primary" plain shape="circle" @click="goToVehicleList">添加车辆</uv-button>
      </view>
      <view class="parking-collapse">
        <view class="parking-header" @click="toggleParkingCollapse">
          <image
            :src="parkingSvg"
            mode="widthFix"
            style="width: 30rpx; height: 30rpx;"
          />
          <text class="parking-title">停车费说明</text>
          <view class="arrow-icon" :class="{ 'rotated': isParkingExpanded }">
            <uv-icon name="arrow-down" color="#999" size="14"></uv-icon>
          </view>
        </view>

        <view>
          <view class="parking-header" @click="toggleOccupyCollapse">
            <image
              :src="parkingSvg"
              mode="widthFix"
              style="width: 30rpx; height: 30rpx;"
            />
            <text class="parking-title">超时占位说明</text>
            <view class="arrow-icon" :class="{ 'rotated': isOccupyExpanded }">
              <uv-icon name="arrow-down" color="#999" size="14"></uv-icon>
            </view>
          </view>
        </view>
      </view>
      <view class="parking-content" :class="{ 'expanded': isParkingExpanded }">
        <text class="parking-text">{{ pileInfo.parking }}</text>
      </view>

    </view>

    <!-- 支付方式 -->
    <view class="section-card">
      <text class="section-title">支付方式</text>
      <view v-show="memberInfo.tokenMemberType == 0">
        <uv-radio-group 
        v-model="paymentType" 
        placement="column" 
        @change="handlePaymentChange"
        >
          <view v-for="item in filteredPaymentMethods" :key="item.payType" class="payment-option">
            <uv-radio
              :name="item.payType"
              :label="item.accountName"
              :labelColor="item.disabled ? '#c8c9cc' : '#303133'"
              :disabled="item.disabled"
              :customStyle="{flex: 1}"
            >
              <template #default>
                <view class="payment-label">
                  <text>{{ item.accountName }}</text>
                  <text v-if="item.balance" class="balance-text">(余额：<text class="balance-text-value">{{ (parseInt(item.balance) / 100).toFixed(2) }}</text>元)</text>
                </view>
              </template>
            </uv-radio>
            <uv-button 
              v-if="item.showTopUp" 
              type="primary"
              plain
              size="mini"
              shape="circle"
              @click="goToTopUp(item)"
            >
              去充值
            </uv-button>
          </view>
        </uv-radio-group>
      </view>
      <view v-if="memberInfo.tokenMemberType == 2"> 车队账户 </view>
    </view>

    <!-- 预设充电金额 -->
    <view class="section-card" v-if="memberInfo.tokenMemberType == 0">
      <text class="section-title">预设充电金额</text>
      <text class="section-description">充电费用达到上限或者充满电量则自动停止充电</text>
      <input 
        class="amount-input"
        placeholder="请输入充电金额" 
        type="number"
        inputmode="numeric"
        :value="amountInputValue"
        @input="handleAmountInput"
        @focus="handleInputFocus"
        @blur="handleInputBlur"
        ref="amountInput"
      />
        <view class="preset-options" v-if="paymentType == 1">
          <uv-button 
            v-for="amount in presetOptions" 
            :key="amount.value" 
            :text="amount.label"
            :type="isPresetAmountActive(amount) ? 'primary' : 'default'"
            :plain="!isPresetAmountActive(amount)"
            hoverStayTime="0"
            shape="circle"
            customTextStyle="font-size: 30rpx;"
            :customStyle="getPresetButtonStyle(amount.value)"
            @click="$emit('set-preset-amount', amount.value)"
          />
        </view>
    </view>

    <!-- 超时占位费说明 -->
    <view class="section-card" v-if="pileInfo.stationData.occupyCostModel">
      <text class="section-title">超时占位费说明</text>
      <view class="occupy-fee-details">
        <view class="occupy-fee-item">
          <text class="occupy-fee-label">超时占位费:</text>
          <text class="occupy-fee-value">{{ parseInt(pileInfo.stationData.occupyCostModel.occupyPhraseRules[0].price) / 100 }}元/分钟</text>
        </view>
        <view class="occupy-fee-item">
          <text class="occupy-fee-label">当前收费时段:</text>
          <text class="occupy-fee-value">{{ pileInfo.stationData.occupyCostModel.occupyPhraseRules[0].stimeStr}}-{{ pileInfo.stationData.occupyCostModel.occupyPhraseRules[0].etimeStr }}</text>
        </view>
        <view class="occupy-fee-description">
          充电结束后请于{{ pileInfo.stationData.occupyCostModel.freeDuration }}分钟内拔枪驶离充电车位，若车辆充电结束{{ pileInfo.stationData.occupyCostModel.freeDuration }}分钟后仍继续占用充电车位或充电设备，将收取占位费用，单次封顶{{ parseInt(pileInfo.stationData.occupyCostModel.limitAmount) / 100 }}元
        </view>
      </view>
    </view>

  </view>
</template>

<script>
import PileGunCard from '@/components/station/PileGunCard.vue';
import Card from '@/components/common/Card.vue';
import SelectedGun from '@/components/gun/SelectedGun.vue';
import { changeUser } from '@/api/member';
import { getStationGunDetails } from '@/api/station';

export default {
  // name: 'ChargeIdelView',
  components: {
    PileGunCard,
    Card,
    SelectedGun
  },
  props: {
    pileInfo: Object,
    memberInfo: Object,
    paymentMethods: Array,
    presetAmount: String,
    currentPaymentType: {
      type: Number,
      default: -1
    },
    // 主枪信息（从路由参数传入）
    mainGunParams: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      // 用户身份类型: 'fleet' 车队身份, 'individual' 个人身份
      // 先写死为非车队身份
      userType: 'individual',
      presetOptions: [
        { label: '30元', value: 3000 },
        { label: '50元', value: 5000 },
        { label: '100元', value: 10000 },
        { label: '全部余额', value: 'all' }
      ],
      // presetAmount: this.presetAmount,
      paymentType: this.currentPaymentType,
      vehicleSvg: 'data:image/svg+xml;base64,PHN2ZyB0PSIxNzU3MTI3NTAwNzY0IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE1OTQiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNOTA5LjMyIDQyNC42NmwtMjIuNDgtNTYuMi0zOS44Ni05OS42NkM4MTIuNzYgMTgzLjI2IDczMS4xNCAxMjggNjM5IDEyOGgtMjU0Yy05Mi4xMiAwLTE3My43NiA1NS4yNi0yMDcuOTggMTQwLjhsLTM5Ljg2IDk5LjY2LTIyLjQ4IDU2LjJDNjYuNDQgNDQzIDMyIDQ4OS4zMiAzMiA1NDR2OTZjMCAzMi4yNCAxMi4zMiA2MS4zNCAzMiA4My44NlY4MzJjMCAzNS4zNCAyOC42NiA2NCA2NCA2NGg2NGMzNS4zNCAwIDY0LTI4LjY2IDY0LTY0di02NGg1MTJ2NjRjMCAzNS4zNCAyOC42NiA2NCA2NCA2NGg2NGMzNS4zNCAwIDY0LTI4LjY2IDY0LTY0di0xMDguMTRjMTkuNjgtMjIuNSAzMi01MS42IDMyLTgzLjg2di05NmMwLTU0LjY4LTM0LjQ0LTEwMS04Mi42OC0xMTkuMzR6IG0tNjEzLjQ2LTEwOC4zMmMxNC41OC0zNi40NCA0OS44OC02MC4zNCA4OS4xNC02MC4zNGgyNTRjMzkuMjYgMCA3NC41NiAyMy45IDg5LjE0IDYwLjM0TDc2OCA0MTZIMjU2bDM5Ljg2LTk5LjY2ek0xOTIgNjM5LjZjLTM4LjQgMC02NC0yNS41Mi02NC02My44UzE1My42IDUxMiAxOTIgNTEyczk2IDU3LjQyIDk2IDk1LjctNTcuNiAzMS45LTk2IDMxLjl6IG02NDAgMGMtMzguNCAwLTk2IDYuMzgtOTYtMzEuOVM3OTMuNiA1MTIgODMyIDUxMnM2NCAyNS41MiA2NCA2My44LTI1LjYgNjMuOC02NCA2My44eiIgcC1pZD0iMTU5NSIgZmlsbD0iI0I4REJGRiI+PC9wYXRoPjwvc3ZnPg==',
      parkingSvg: 'data:image/svg+xml;base64,PHN2ZyB0PSIxNzU3MTI4NTY3NjI1IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjI3ODMiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNODY0IDY0SDE2MEMxMDcgNjQgNjQgMTA3IDY0IDE2MHY3MDRjMCA1MyA0MyA5NiA5NiA5Nmg3MDRjNTMgMCA5Ni00MyA5Ni05NlYxNjBjMC01My00My05Ni05Ni05NnpNNTQ0IDY0MGgtOTZ2OTZjMCAxNy42LTE0LjQgMzItMzIgMzJoLTY0Yy0xNy42IDAtMzItMTQuNC0zMi0zMlYyODhjMC0xNy42IDE0LjQtMzIgMzItMzJoMTkyYzEwNS44IDAgMTkyIDg2LjIgMTkyIDE5MnMtODYuMiAxOTItMTkyIDE5MnogbTAtMjU2aC05NnYxMjhoOTZjMzUuMiAwIDY0LTI4LjggNjQtNjRzLTI4LjgtNjQtNjQtNjR6IiBmaWxsPSIjMTI5NmRiIiBwLWlkPSIyNzg0Ij48L3BhdGg+PC9zdmc+',
      isParkingExpanded: false,
      isOccupyExpanded: false,
      isKeyboardShow: false, // 键盘是否显示
      keyboardHeight: 0, // 键盘高度
      amountInputValue: '' // 充电金额输入值
    };
  },
  watch: {
    presetAmount: {
      handler(newVal) {
        // 当props变化时，更新输入框的值
        if (newVal) {
          this.amountInputValue = (parseInt(newVal) / 100).toString();
        } else {
          this.amountInputValue = '';
        }
      },
      immediate: true
    }
  },
  computed: {
    currentPriceInfo() {
      if (!this.pileInfo || !this.pileInfo.gunDTOList) return {};
      if (!this.mainGunParams || !this.mainGunParams.gunId) return {};
      
      // 根据 gunId 查找对应的枪
      const targetGun = this.pileInfo.gunDTOList.find(gun => gun.gunid === this.mainGunParams.gunId);
      return targetGun ? (targetGun.nowPrice || {}) : {};
    },
    // 根据用户身份过滤支付方式
    filteredPaymentMethods() {
      // 如果有传入数据，根据用户身份过滤
      if (this.userType === 'fleet') {
        // 车队身份：只显示车队相关的支付方式
        return this.paymentMethods.filter(item => 
          item.payType === 3 || item.accountName.includes('车队')
        );
      } else {
        // 非车队身份：显示除车队和电卡6外的其他支付方式
        // 根据支付方式从小到大排序
        this.paymentMethods.sort((a, b) => a.payType - b.payType);
        return this.paymentMethods.filter(item => 
          (item.payType !== 3 && !item.accountName.includes('车队'))
          && (item.payType !== 6 && item.balance !== 'N/A')
        );
      }
    }
  },
  onReady() {
    // 监听键盘高度变化
    uni.onKeyboardHeightChange((res) => {
      console.log('键盘高度变化:', res.height);
      this.keyboardHeight = res.height;
      if (res.height > 0) {
        this.isKeyboardShow = true;
        // 延迟执行滚动，确保键盘完全弹起
        setTimeout(() => {
          this.adjustViewForKeyboard();
        }, 100);
      } else {
        this.isKeyboardShow = false;
      }
    });
  },
  onUnload() {
    // 移除键盘监听
    uni.offKeyboardHeightChange();
  },
  methods: {
    // 处理输入框获得焦点
    handleInputFocus() {
      console.log('输入框获得焦点');
      // 不在这里设置键盘状态，由键盘监听器处理
    },
    // 处理输入框失去焦点
    handleInputBlur() {
      console.log('输入框失去焦点');
      // 不在这里设置键盘状态，由键盘监听器处理
    },
    // 调整视图以适应键盘
    adjustViewForKeyboard() {
      const query = uni.createSelectorQuery().in(this);
      
      // 获取系统信息
      const systemInfo = uni.getSystemInfoSync();
      const windowHeight = systemInfo.windowHeight;
      
      query.select('.section-card:nth-last-child(1)').boundingClientRect((inputData) => {
        if (inputData) {
          query.selectViewport().scrollOffset((viewportData) => {
            // 计算输入框相对于当前视口的位置
            const inputBottom = inputData.bottom;
            
            // 计算可视区域的底部位置（减去键盘高度）
            const visibleBottom = windowHeight - this.keyboardHeight;
            
            // 如果输入框被键盘遮挡
            if (inputBottom > visibleBottom) {
              // 计算需要滚动的距离，让输入框位于可视区域的上半部分
              const targetPosition = visibleBottom * 0.4; // 放在可视区域的40%位置
              const needScrollDistance = inputBottom - targetPosition;
              const currentScrollTop = viewportData.scrollTop;
              const targetScrollTop = currentScrollTop + needScrollDistance;
              
              console.log('键盘遮挡输入框，开始滚动:', {
                inputBottom,
                visibleBottom,
                needScrollDistance,
                targetScrollTop
              });
              
              uni.pageScrollTo({
                scrollTop: Math.max(0, targetScrollTop),
                duration: 300
              });
            }
          }).exec();
        }
      }).exec();
    },
    changeUser() {
      const deductMode = uni.getStorageSync('deductMode')
      let changeType = null;
      if (deductMode === 'LeaguerAccount' && this.memberInfo.tokenMemberType === 2) {
        changeType = 0;
      } else if (deductMode === 'TeamAccount' && this.memberInfo.tokenMemberType === 2) {
        changeType = 0;
      } else if (deductMode === 'TeamAccount' && this.memberInfo.tokenMemberType === 0) {
        changeType = 1;
      } else if (deductMode === 'LeaguerAccount' && this.memberInfo.tokenMemberType === 0) {
        changeType = 2;
      } else {
        uni.showToast({
          title: '无法切换身份请联系客服',
          icon: 'none'
        });
        return;
      }
      changeUser(changeType).then(res => {
        if (res.code === 0) {
          uni.setStorageSync('token', res.data);
          // 发射事件通知父组件重新加载页面
          this.$emit('user-changed');
        }
      });
    },
    handlePaymentChange(name) {
      console.log(name, "name");
      // uv-radio-group的change事件直接传递name值
      this.$emit('payment-change', Number(name));
    },
    handleAmountInput(event) {
      const value = event.target.value;
      console.log('handleAmountInput触发，值:', value);
      // 更新本地输入值
      this.amountInputValue = value;
      // 将输入的元转换为分
      const numValue = parseFloat(value) || 0;
      const centValue = parseInt(numValue * 100);
      console.log('发射preset-amount-change事件，值:', centValue);
      this.$emit('preset-amount-change', centValue);
    },
    // 跳转到充值页面
    goToTopUp() {
      // 根据不同的支付方式跳转到相应的充值页面
      uni.navigateTo({
        url: '/pages/recharge/recharge'
      });
    },
    // 处理双枪状态变化
    handleDualGunChange(gunData) {
      // 向父组件转发双枪状态变化事件
      this.$emit('dual-gun-change', gunData);
    },
    // 处理充电枪状态更新
    handleGunStatusUpdated(statusData) {
      // 向父组件转发状态更新事件
      this.$emit('gun-status-updated', statusData);
    },
    // 清理定时器（供父组件调用）
    clearTimers() {
      if (this.$refs.selectedGun && this.$refs.selectedGun.clearStatusPolling) {
        this.$refs.selectedGun.clearStatusPolling();
      }
    },
    goToVehicleList() {
      uni.navigateTo({
        url: '/pages/vehicle/list'
      });
    },
    // 切换停车费说明展开/收起状态
    toggleParkingCollapse() {
      this.isParkingExpanded = !this.isParkingExpanded;
    },
    // 切换超时占位说明展开/收起状态
    toggleOccupyCollapse() {
      this.isOccupyExpanded = !this.isOccupyExpanded;
    },
    // 判断预设金额按钮是否为激活状态
    isPresetAmountActive(amount) {
      // 首先检查是否与数值匹配
      if (this.presetAmount == amount.value) {
        return true;
      }
      if (this.presetAmount === 'all') {
        return true;
      }
      return false;
    },
    // 获取预设金额按钮样式
    getPresetButtonStyle(value) {
      console.log(value, "value");
      const amount = this.presetOptions.find(option => option.value === value);
      console.log(amount, "amount");
      let isActive = amount ? this.isPresetAmountActive(amount) : false;
      if (value === 'all') {
        const personalAccount = this.paymentMethods.find(p => p.payType === 1);
        console.log(this.presetAmount, "presetAmount");
        isActive = personalAccount.balance == this.presetAmount;
      }
      return {
        width: 'auto',
        height: '75rpx',
        backgroundColor: isActive ? '#007aff' : '#F5F7FA',
        color: isActive ? '#fff' : '#333',
        border: isActive ? '1rpx solid #007aff' : '1rpx solid #F5F7FA'
      };
    },
    // 显示价格详情
    async showPriceDetails() {
      if (!this.mainGunParams || !this.mainGunParams.gunId) {
        uni.showToast({
          title: '枪信息未加载完成',
          icon: 'none'
        });
        return;
      }
      
      try {
        uni.showLoading({ title: '加载价格详情...' });
        
        const res = await getStationGunDetails(this.mainGunParams.gunId);
        
        if (res.code === 0 && res.data && res.data.powerStageDetail) {
          // 将获取的价格详情数据传递给父组件
          this.$emit('show-price-details', res.data.powerStageDetail);
        } else {
          uni.showToast({
            title: '获取价格详情失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取价格详情失败:', error);
        uni.showToast({
          title: '获取价格详情失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    }
  },
  mounted() {
    if (this.memberInfo && this.memberInfo.accountBalance) {
      const accountBalance = parseInt(this.memberInfo.accountBalance);
      if (this.memberInfo.deductMode === 'LeaguerAccount' && this.memberInfo.tokenMemberType === 0 && accountBalance > 0) {
        this.$emit('payment-change', 1); // 个人账户
        this.$emit('preset-amount-change', this.memberInfo.accountBalance);
      } else if (this.memberInfo.deductMode === 'TeamAccount' && this.memberInfo.tokenMemberType === 2) {
        this.$emit('payment-change', 2); // 车队账户
      } else if (this.memberInfo.deductMode === 'LeaguerAccount' && this.memberInfo.tokenMemberType === 2) {
        this.$emit('payment-change', 2); // 车队账户
      } else {
        this.$emit('payment-change', -1);
      }
    } else {
      this.$emit('payment-change', -1); // 没有账户信息时默认为-1
    }
  }
}
</script>

<style scoped>
.price-section-title {
  font-size: 36rpx;
  font-weight: bold;
}

.section-title {
  font-size: 36rpx;
  font-weight: bold;
}

.current-price {
  font-size: 48rpx;
  font-weight: bold;
  color: #007BFF;
}

.original-price {
  font-size: 24rpx;
  color: #999;
  margin-left: 10rpx;
  text-decoration: line-through;
}

.tag {
  background: #E7F1FE;
  color: #007BFF;
  font-size: 26rpx;
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
  margin-right: 8rpx;
  flex-shrink: 0;
  display: inline-block;
  width: fit-content;
}

.content-wrapper {
  padding: 20rpx;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 键盘显示时，在内容底部添加一个虚拟的安全区域 */
.content-wrapper.keyboard-show::after {
  content: '';
  display: block;
  height: 300px; /* 为键盘留出空间，使用px单位更准确 */
  pointer-events: none;
}

.section-card {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.price-section-card {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  gap: 20rpx;
  margin-bottom: 24rpx;
}
.vehicle-section-card {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx 30rpx 0 30rpx;
  gap: 20rpx;
  margin-bottom: 24rpx;
}
.identity-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plate-no-wrapper {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.plate-no {
  font-size: 30rpx;
  font-weight: bold;
}

.vehicle-symbol {
  position: absolute;
  /* bottom: 100rpx; */
  /* margin-top: 5rpx; */
  right: 30rpx;
  z-index: 1;
  pointer-events: none; /* 不阻止点击事件 */
}

.price-symbol {
  position: absolute;
  /* bottom: 100rpx; */
  margin-top: 30rpx;
  right: 80rpx;
  /* z-index: -999; 在背景之上，但在内容之下 */
  pointer-events: none; /* 不阻止点击事件 */
}
.price-symbol-text {
  color: #A0CFFF;
  font-size: 200rpx;
  font-weight: bold;
  font-style: italic;
  opacity: 0.75;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3); /* 添加阴影增强可读性 */
}
.price-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.price-details-btn {
  color: #007aff;
}
.sub-price {
  color: #999;
  font-size: 24rpx;
}
.discount-tag {
  color: #ff5500;
}
.payment-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 0;
  min-height: 50rpx;
}

.payment-label {
  display: flex;
  align-items: center;
  flex: 1;
}

.balance-text {
  margin-left: 20rpx;
  font-size: 24rpx;
  color: #999;
}
.balance-text-value {
  font-size: 24rpx;
  color: #FC7F5D;
}
.section-description {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 16rpx;
  color: #F7A756;
}
.preset-input {
  border: 1rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 10rpx;
  margin-bottom: 16rpx;
}
.preset-options {
  display: flex;
  justify-content: flex-start;
  gap: 20rpx;
}
/* 停车费折叠组件样式 */
.parking-collapse {
  margin-top: 10rpx;
  display: flex;
  flex: 1;
  justify-content: space-between;
}
.parking-title {
  margin-left: 5rpx;
  font-size: 24rpx;
  color: #999;
  /* 斜体 */
  font-style: italic;
  /* 下划线 */
  text-decoration: underline;
  /* z-index: 10; */
}

.parking-header {
  display: flex;
  flex: 1;
  align-items: center;
  cursor: pointer;
  /* z-index: 10; */
  padding: 5rpx 0;
}

.arrow-icon {
  margin-left: 10rpx;
  transition: transform 300ms ease;
  transform: rotate(-90deg);
}

.arrow-icon.rotated {
  transform: rotate(0deg);
}

.arrow-icon text {
  font-size: 24rpx;
  color: #999;
}

.parking-content {
  overflow: hidden;
  max-height: 0;
  transition: max-height 300ms ease;
}

.parking-content.expanded {
  max-height: 200rpx; /* 足够的最大高度 */
}

.parking-text {
  font-size: 24rpx;
  color: #999;
  padding: 10rpx 0 20rpx 0;
  display: block;
}

/* 超时占位费说明样式 */
.occupy-fee-details {
  margin-top: 20rpx;
}

.occupy-fee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.occupy-fee-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.occupy-fee-value {
  font-size: 28rpx;
  color: #666;
}

.occupy-fee-description {
  font-size: 24rpx;
  color: #999;
  line-height: 1.5;
  margin-top: 16rpx;
  padding: 16rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
}

/* 原生input样式 */
.amount-input {
  width: 100%;
  height: 80rpx;
  font-size: 40rpx;
  border: none;
  border-bottom: 2rpx solid #e0e0e0;
  background: transparent;
  outline: none;
  padding: 20rpx 0 10rpx 0;
  box-sizing: border-box;
}

.amount-input:focus {
  border-bottom-color: #007aff;
}

.amount-input::placeholder {
  color: #999;
  font-size: 32rpx;
}
</style>

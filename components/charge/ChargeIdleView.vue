<template>
  <view class="content-wrapper" :class="{ 'keyboard-show': isKeyboardShow }">
    <!-- 当前身份 -->
    <!-- <view class="identity-section">
      <view>
        <text>当前身份：</text>
        <text>{{ memberInfo.tokenMemberType === 0 ? '个人身份' : '车队身份' }}</text>
        <text>（{{ memberInfo.name }}）</text>
      </view>
      <text @click="changeUser" v-if="memberInfo.groupName">切换身份</text>
    </view> -->

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
      <!-- 当前时段价格信息 -->
      <view class="current-price-section">
        <view class="price-main-row">
          <view class="price-left">
            <view class="main-price">
              <view class="price-row">
                <text class="price-value">{{ currentPriceInfo.currentPriceStr }}</text>
                <text class="price-unit">元/度</text>
                <view v-if="currentPriceInfo.discount && currentPriceInfo.sweepPriceStr" class="discount-price-row">
                  <text class="discount-price">{{ currentPriceInfo.sweepPriceStr }}</text>
                  <text class="discount-unit">元/度</text>
                </view>
              </view>
            </view>
            <view class="price-breakdown">
              <text class="breakdown-text">电费{{ currentPriceInfo.currentPowerPriceStr }}元/度</text>
              <text class="breakdown-separator">|</text>
              <text class="breakdown-text">服务费{{ currentPriceInfo.currentServicePriceStr }}元/度</text>
            </view>
            <view class="current-time-slot">
              <text class="time-slot-text">时段 {{ currentPriceInfo.currentStartTime }} -
                {{ currentPriceInfo.currentEndTime }}
              </text>
            </view>
          </view>
          <view class="price-right">
            <view class="details-link" @click="showPriceDetails">
              <text class="details-text">费用详细</text>
              <!-- <text class="details-arrow">></text> -->
            </view>
          </view>
        </view>
      </view>

      <!-- 分隔线 -->
      <view class="price-divider"></view>

      <!-- 下一时段价格信息 -->
      <view class="next-price-section" v-if="nextPriceInfo && nextPriceInfo.currentStartTime">
        <view class="next-price-row">
          <!-- <text class="next-time-text">下一时段 {{ nextPriceInfo.currentStartTime }}-{{ nextPriceInfo.currentEndTime }}</text> -->
          <StatusTag
              :text="`下一时段 ${nextPriceInfo.currentStartTime}-${nextPriceInfo.currentEndTime}`"
              backgroundColor="#E2F7FA"
              textColor="#6AAAFB"
              fontSize="24rpx"
              padding="4rpx 12rpx"
              borderRadius="8rpx"
              fontWeight="bold"
          />
          <view class="next-price-info">
            <text class="next-price-value" :class="isPriceDown ? 'trend-down' : 'trend-up'">
              {{ nextPriceInfo.currentPriceStr }}元/度
            </text>
            <view class="price-trend" :class="isPriceDown ? 'trend-down' : 'trend-up'">
              <text class="trend-icon">{{ isPriceDown ? '↓' : '↑' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 超时占位说明（内嵌分区，默认收起为一行） -->
      <template v-if="pileInfo.stationData.occupyCostModel">
        <view class="price-divider"></view>
        <view class="occupy-inline-header" @click="toggleOccupyCollapse">
          <image
              :src="parkingSvg"
              mode="widthFix"
              style="width: 26rpx; height: 26rpx; flex-shrink: 0;"
          />
          <text class="occupy-inline-summary">超时占位 {{ parseInt(pileInfo.stationData.occupyCostModel.occupyPhraseRules[0].price) / 100 }}元/分钟</text>
          <text class="occupy-inline-dot">·</text>
          <text class="occupy-inline-summary">免费{{ pileInfo.stationData.occupyCostModel.freeDuration }}分钟</text>
          <view class="occupy-inline-toggle">
            <text class="occupy-inline-toggle-text">{{ isOccupyExpanded ? '收起' : '展开' }}</text>
            <view class="occupy-inline-arrow" :class="{ 'is-up': isOccupyExpanded }">
              <uv-icon name="arrow-down" color="#007AFF" size="12"></uv-icon>
            </view>
          </view>
        </view>
        <view class="occupy-inline-content" :class="{ 'is-expanded': isOccupyExpanded }">
          <view class="occupy-inline-detail">
            <view class="occupy-inline-item">
              <text class="occupy-inline-key">超时占位费</text>
              <text class="occupy-inline-value">
                {{ parseInt(pileInfo.stationData.occupyCostModel.occupyPhraseRules[0].price) / 100 }}元/分钟
              </text>
            </view>
            <view class="occupy-inline-item">
              <text class="occupy-inline-key">当前收费时段</text>
              <text class="occupy-inline-value">{{
                  pileInfo.stationData.occupyCostModel.occupyPhraseRules[0].stimeStr || '00:00'
                }}-{{ pileInfo.stationData.occupyCostModel.occupyPhraseRules[0].etimeStr || '23:59' }}
              </text>
            </view>
            <view class="occupy-inline-desc">
              充电结束后请于{{
                pileInfo.stationData.occupyCostModel.freeDuration
              }}分钟内拔枪驶离充电车位，若车辆充电结束{{
                pileInfo.stationData.occupyCostModel.freeDuration
              }}分钟后仍继续占用充电车位或充电设备，将收取占位费用，单次封顶{{
                parseInt(pileInfo.stationData.occupyCostModel.limitAmount) / 100
              }}元
            </view>
          </view>
        </view>
      </template>
    </view>

    <!-- 充电车辆 -->
    <view class="vehicle-section-card">
      <view class="vehicle-header">
        <view class="vehicle-info">
          <text class="plate-no">{{ memberInfo.plateNo || '未绑定车辆' }}</text>
        </view>
        <text class="switch-vehicle-btn" @click="goToVehicleList">管理车辆</text>
      </view>
      <text class="vehicle-warning" v-if="memberInfo.plateNo">{{
          pileInfo.parking || '临牌不享受停车减免政策,启动充电后无法修改车牌'
        }}
      </text>
    </view>

    <!-- 支付方式 -->
    <view class="section-card">
      <view
          style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 20rpx;">
        <text class="section-title">支付方式</text>
        <view
            style="display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 5rpx; margin-left: 10rpx; margin-top: 10rpx;">
          <view style="display: flex; align-items: center;">
            <view
                v-if="memberInfo.motorcadeName"
                :style="{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: memberInfo.tokenMemberType === 2 ? '#E8F5E9' : '#FFF3E0',
                padding: '4rpx 12rpx',
                borderRadius: '8rpx'
              }"
            >
              <text :style="{
                color: memberInfo.tokenMemberType === 2 ? '#4CAF50' : '#FF9800',
                fontSize: '22rpx'
              }">
                {{ memberInfo.tokenMemberType === 2 ? memberInfo.motorcadeName : '个人身份' }}
              </text>
            </view>
          </view>
          <view @click="changeUser" style="display: flex; align-items: center;">
            <view v-if="memberInfo.motorcadeName"
                  style="display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 4rpx;">
              <view class="change-user">切换身份</view>
              <view>
                <uv-icon name="reload" color="#007AFF" size="14"></uv-icon>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view v-show="memberInfo.tokenMemberType == 0">
        <view class="payment-methods-container">
          <view class="payment-divider"></view>
          <template v-for="(item, index) in filteredPaymentMethods" :key="item.payType">
            <view v-if="index > 0" class="payment-divider"></view>
            <view
                class="payment-option-new"
                @tap="selectPaymentMethod(item.payType)">
            <view v-if="item.payType != -2" class="payment-left">
              <view class="payment-icon" :class="getPaymentIconClass(item.payType)">
                <!-- <image v-if="item.payType == -2" src="../../static/zhifufen_icon.png" mode="widthFix" style="width: 30rpx; height: 30rpx"></image> -->
                <!--                <text class="icon-text">{{ getPaymentIconText(item.payType) }}</text>-->
                <uv-icon size="18" :name="getPaymentIconText(item.payType)"></uv-icon>
              </view>
              <view class="payment-info">
                <view style="display: flex; align-items: center; gap: 8rpx;">
                  <text class="payment-name-new">{{ item.accountName }}</text>
                  <uv-icon name="question-circle" size="18" v-if="item.payType == -1"
                           @click.stop="showPaymentHelp(item.payType)"
                  ></uv-icon>
                </view>
                <text v-if="item.balance && item.payType != -2" class="balance-text-new">余额 {{
                    (parseInt(item.balance) / 100).toFixed(2)
                  }}元
                </text>
                <text v-if="item.balance && item.payType == -2" class="balance-text-new-credit">
                  {{
                    item.balance
                  }}
                </text>
              </view>
            </view>
            <view v-else-if="item.payType == -2" class="payment-left">
              <view class="payment-info">
                <ZhifufenTitle />
                <text class="zhifufen-balance">{{ String(item.balance || '').replace(/[()]/g, '') }}</text>
              </view>
            </view>
            <view class="payment-right">
              <uv-button
                  v-if="item.showTopUp"
                  type="primary"
                  plain
                  size="mini"
                  shape="circle"
                  customStyle="background: linear-gradient(to right, #6099ff, #3a7dff); color: white; border: none; font-size: 24rpx; padding: 8rpx 24rpx;"
                  @click.stop="goToTopUp(item)"
              >
                去充值
              </uv-button>
              <view class="radio-button" :class="{ 'radio-selected': paymentType == item.payType }">
                <view v-if="paymentType == item.payType" class="radio-inner"></view>
              </view>
            </view>
            </view>
          </template>
          <view class="payment-divider"></view>
        </view>
      </view>
      <view v-if="memberInfo.tokenMemberType == 2" class="fleet-account-badge"> 车队账户</view>
      <uv-divider v-if="memberInfo.tokenMemberType != 2 && paymentType != -2"></uv-divider>
      <!-- 预设充电金额 -->
      <view v-if="memberInfo.tokenMemberType == 0 && paymentType != -2">
        <text class="section-description-new">充电费用达到上限或者充满电量则自动停止充电</text>
        <view class="amount-input-container-new">
          <text class="currency-symbol-new">¥</text>
          <input
              class="amount-input-new"
              placeholder="0.00"
              type="digit"
              inputmode="numeric"
              :value="amountInputValue"
              @input="handleAmountInput"
              @focus="handleInputFocus"
              @blur="handleInputBlur"
              ref="amountInput"
          />
        </view>
        <view class="preset-options-new" v-if="paymentType == 1">
          <view
              v-for="amount in presetOptions"
              :key="amount.value"
              class="preset-button"
              :class="{ 'preset-button-active': isPresetAmountActive(amount) }"
              @click="$emit('set-preset-amount', amount.value)"
          >
            <text class="preset-button-text">{{ amount.label }}</text>
          </view>
        </view>
      </view>
    </view>


    <!-- 超时占位说明已内嵌到资费卡片底部，此处不再单独成卡 -->

  </view>
</template>

<script>
import PileGunCard from '@/components/station/PileGunCard.vue';
import Card from '@/components/common/Card.vue';
import SelectedGun from '@/components/gun/SelectedGun.vue';
import {changeUser} from '@/api/member';
import {getStationGunDetails} from '@/api/station';
import StatusTag from '@/components/common/StatusTag.vue';
import ZhifufenTitle from '@/components/charge/ZhifufenTitle.vue';

export default {
  // name: 'ChargeIdelView',
  components: {
    PileGunCard,
    Card,
    SelectedGun,
    StatusTag,
    ZhifufenTitle
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
        {label: '30元', value: 3000},
        {label: '50元', value: 5000},
        {label: '100元', value: 10000},
        {label: '全部余额', value: 'all'}
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
    },
    currentPaymentType: {
      handler(newVal) {
        // 当父组件的currentPaymentType改变时，同步更新子组件的paymentType
        this.paymentType = newVal;
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
    // 下一时段价格信息
    nextPriceInfo() {
      if (!this.pileInfo || !this.pileInfo.gunDTOList) return {};
      if (!this.mainGunParams || !this.mainGunParams.gunId) return {};

      // 根据 gunId 查找对应的枪
      const targetGun = this.pileInfo.gunDTOList.find(gun => gun.gunid === this.mainGunParams.gunId);
      return targetGun ? (targetGun.nextStagePrice || {}) : {};
    },
    // 价格趋势：true表示下降，false表示上升
    isPriceDown() {
      if (!this.currentPriceInfo || !this.nextPriceInfo) return false;
      const currentPrice = this.currentPriceInfo.currentPrice || 0;
      const nextPrice = this.nextPriceInfo.currentPrice || 0;
      return nextPrice < currentPrice;
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
          this.paymentType = -1;
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
    selectPaymentMethod(payType) {
      // 点击行时选中对应的支付方式
      if (!this.filteredPaymentMethods.find(item => item.payType === payType)?.disabled) {
        this.paymentType = payType;
        console.log("selectPaymentMethod触发 emit payment-change")
        this.$emit('payment-change', Number(payType));
      }
    },
    handleAmountInput(event) {
      let value = event.target.value || event.detail?.value || '';
      console.log('handleAmountInput触发，值:', value);

      // 限制最多两位小数
      if (value) {
        // 如果包含小数点，检查小数位数
        if (value.includes('.')) {
          const parts = value.split('.');
          // 如果小数点后超过两位，截取前两位
          if (parts[1] && parts[1].length > 2) {
            value = parts[0] + '.' + parts[1].substring(0, 2);
          }
        }
      }

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
    // 显示支付帮助信息
    showPaymentHelp(payType) {
      if (payType == -2) {
        uni.showModal({
          title: '支付说明',
          content: '微信信用分达到550分以上，可以先充电后付款。微信信用分由微信官方授权评分。',
          showCancel: false,
          confirmText: '我知道了'
        })
      } else {
        uni.showModal({
          title: '支付说明',
          content: '充电需预先支付费用，充电结束后，剩余费用将在 1-3 个工作日内自动退回至原支付账户。因充电桩信息传输存在时差，可能出现实际费用超出预付金额的情况，届时将默认优先从你的个人账户余额中补足差额。',
          showCancel: false,
          confirmText: '我知道了'
        });
      }
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
      // 如果是"全部余额"选项
      if (amount.value === 'all') {
        // 检查当前预设金额是否等于个人账户余额
        const personalAccount = this.paymentMethods.find(p => p.payType === 1);
        if (personalAccount && personalAccount.balance) {
          const accountBalance = parseInt(personalAccount.balance);
          return this.presetAmount == accountBalance;
        }
        return false;
      }

      // 其他选项直接比较数值
      return this.presetAmount == amount.value;
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
        uni.showLoading({title: '加载价格详情...'});

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
    },
    // 获取支付方式图标样式类
    getPaymentIconClass(payType) {
      switch (payType) {
        case -1: // 充完即退
          return 'icon-refresh';
        case 1: // 个人账户
          return 'icon-wallet';
        case 2: // 车队账户
          return 'icon-team';
        default:
          return 'icon-default';
      }
    },
    // 获取支付方式图标文本
    getPaymentIconText(payType) {
      switch (payType) {
        case -1: // 充完即退
          return 'reload';
        case 1: // 个人账户
          return 'account';
        case 2: // 车队账户
          return 'account-fill';
        default:
          return 'empty-coupon';
      }
    }
  },
  mounted() {
    console.log('ChargeIdleView mounted', this.memberInfo);
    if (this.memberInfo && this.memberInfo.accountBalance) {
      const accountBalance = parseInt(this.memberInfo.accountBalance);
      if ((this.memberInfo.deductMode === 'LeaguerAccount' || this.memberInfo.deductMode == null) && this.memberInfo.tokenMemberType === 0 && accountBalance > 0) {
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
.zhifufen-balance {
  font-size: 24rpx;
  color: #666;
}

.section-title {
  font-size: 36rpx;
  font-weight: bold;
}

.content-wrapper {
  padding: 20rpx;
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

/* 价格卡片容器 */
.price-section-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

/* 当前时段价格区域 */
.current-price-section {
  margin-bottom: 20rpx;
}

.price-main-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.price-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.price-right {
  display: flex;
  align-items: center;
}

/* 主价格显示 */
.main-price {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.price-value {
  font-size: 64rpx;
  font-weight: bold;
  color: #00A9FF;
  line-height: 1;
}

.price-unit {
  font-size: 32rpx;
  font-weight: normal;
  color: #04AAFF;
}

/* 折扣价格显示 */
.discount-price-row {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.discount-price {
  font-size: 24rpx;
  font-weight: normal;
  color: #999999;
  text-decoration: line-through;
  line-height: 1;
}

.discount-unit {
  font-size: 18rpx;
  font-weight: normal;
  color: #999999;
  text-decoration: line-through;
}

/* 价格明细 */
.price-breakdown {
  display: flex;
  align-items: center;
}

.breakdown-text {
  font-size: 24rpx;
  color: #999999;
  line-height: 1.2;
}

.breakdown-separator {
  font-size: 24rpx;
  color: #999999;
  margin: 0 8rpx;
}

/* 当前时段信息 */
.current-time-slot {
  margin-top: 4rpx;
}

.time-slot-text {
  font-size: 24rpx;
  color: #999999;
  line-height: 1.2;
}

/* 费用详细链接 */
.details-link {
  display: flex;
  align-items: center;
  gap: 8rpx;
  cursor: pointer;
}

.details-text {
  font-size: 28rpx;
  color: #1890ff;
  line-height: 1.2;
}

.details-arrow {
  font-size: 24rpx;
  color: #1890ff;
  font-weight: bold;
}

/* 分隔线 */
.price-divider {
  height: 1rpx;
  background-color: #f0f0f0;
  margin: 20rpx 0;
}

/* 内嵌超时占位说明：收起时只占一行，点击展开完整规则 */
.occupy-inline-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 6rpx 0 4rpx 0;
}

.occupy-inline-summary {
  font-size: 24rpx;
  color: #8A8F99;
}

.occupy-inline-dot {
  font-size: 24rpx;
  color: #C2C7CF;
}

.occupy-inline-toggle {
  margin-left: auto;
  display: flex;
  align-items: center;
  padding-left: 12rpx;
}

.occupy-inline-toggle-text {
  font-size: 24rpx;
  color: #007AFF;
}

.occupy-inline-arrow {
  margin-left: 4rpx;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.occupy-inline-arrow.is-up {
  transform: rotate(180deg);
}

.occupy-inline-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.occupy-inline-content.is-expanded {
  max-height: 500rpx;
}

.occupy-inline-detail {
  background-color: #FAFBFD;
  border-radius: 12rpx;
  padding: 18rpx 20rpx;
  margin-top: 14rpx;
}

.occupy-inline-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.occupy-inline-key {
  font-size: 24rpx;
  color: #8A8F99;
}

.occupy-inline-value {
  font-size: 24rpx;
  color: #3D434D;
  font-weight: 500;
}

.occupy-inline-desc {
  font-size: 22rpx;
  color: #8A8F99;
  line-height: 1.6;
  margin-top: 10rpx;
}

/* 下一时段价格区域 */
.next-price-section {
  margin-top: 20rpx;
}

.next-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.next-time-text {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.2;
}

.next-price-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.next-price-value {
  font-size: 28rpx;
  color: #22C55E;
  font-weight: bold;
  line-height: 1.2;
}

.next-price-value.trend-down {
  color: #52c41a;
}

.next-price-value.trend-up {
  color: #ff4d4f;
}

/* 价格趋势图标 */
.price-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
}

.trend-down {
  background-color: #f6ffed;
}

.trend-up {
  background-color: #fff2e8;
}

.trend-icon {
  font-size: 20rpx;
  font-weight: bold;
}

.trend-down .trend-icon {
  color: #52c41a;
}

.trend-up .trend-icon {
  color: #ff4d4f;
}

.vehicle-section-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.vehicle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.vehicle-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.plate-no {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.common-tag {
  background-color: #ffffff;
  border: 1rpx solid #e0e0e0;
  border-radius: 6rpx;
  padding: 4rpx 12rpx;
  font-size: 24rpx;
  color: #333;
}

.switch-vehicle-btn {
  font-size: 28rpx;
  color: #007AFF;
  font-weight: 500;
}

.vehicle-warning {
  font-size: 24rpx;
  color: #999;
  line-height: 1.4;
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

.payment-option {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  min-height: 60rpx;
  border-radius: 12rpx;
  margin-bottom: 8rpx;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.payment-option-selected {
  background: linear-gradient(to right, rgba(170, 223, 250, 0.1) -20%, #FFFFFF 100%);
  padding: 24rpx 16rpx;
  margin: 0 -16rpx 8rpx -16rpx;
}

.payment-radio {
  margin-right: 20rpx;
}

.payment-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.payment-label {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

.payment-name {
  font-size: 32rpx;
  color: #303133;
  font-weight: 500;
}

.recommend-tag {
  background-color: #FF6B35;
  color: #ffffff;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 8rpx;
  font-weight: 500;
}

.balance-text {
  font-size: 24rpx;
  color: #999;
}

.balance-text-value {
  font-size: 24rpx;
  color: #FC7F5D;
  font-weight: 500;
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
.parking-section-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.occupy-section-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.parking-header, .occupy-header {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.parking-title, .occupy-title {
  margin-left: 10rpx;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  flex: 1;
}

.arrow-icon {
  transition: transform 0.3s ease;
}

.arrow-icon.rotated {
  transform: rotate(180deg);
}

.parking-content, .occupy-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.parking-content.expanded, .occupy-content.expanded {
  max-height: 300rpx;
  margin-top: 20rpx;
}

.parking-text, .occupy-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
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

/* 金额输入框容器样式 */
.amount-input-container {
  display: flex;
  align-items: center;
  background-color: #F7F8FC;
  border: 1rpx solid #B8DBFF;
  border-radius: 20rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 20rpx;
  position: relative;
  z-index: 0;
}

.currency-symbol {
  font-size: 36rpx;
  color: #333;
  font-weight: bold;
  margin-right: 16rpx;
}

/* 原生input样式 */
.amount-input {
  flex: 1;
  height: 60rpx;
  font-size: 36rpx;
  border: none;
  background: transparent;
  outline: none;
  padding: 0;
  box-sizing: border-box;
  color: #333;
  font-weight: bold;
  z-index: 1;
  position: relative;
}

.amount-input:focus {
  outline: none;
}

.amount-input::placeholder {
  color: #999;
  font-size: 32rpx;
  font-weight: normal;
}

/* 新的支付方式样式 */
.payment-methods-container {
  display: flex;
  flex-direction: column;
  gap: 0rpx;
}

.payment-divider {
  height: 1rpx;
  background-color: #e5e5e5;
  margin: 0 16rpx;
}

.payment-option-new {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  min-height: 20rpx;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  border-radius: 12rpx;
  margin: 0 -16rpx;
  padding: 24rpx 16rpx;
}

.payment-option-selected {
  background-color: #04AAFF;
}

.payment-option-selected .payment-name-new {
  color: white;
}

.payment-option-selected .balance-text-new {
  color: rgba(255, 255, 255, 0.8);
}

.payment-left {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 24rpx;
}

.payment-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

.icon-refresh {
  background-color: #E8F5E8;
  color: #4CAF50;
}

.icon-wallet {
  background-color: #E3F2FD;
  color: #2196F3;
}

.icon-team {
  background-color: #FFF3E0;
  color: #FF9800;
}

.icon-default {
  background-color: #F5F5F5;
  color: #666;
}

.icon-text {
  font-size: 32rpx;
  font-weight: bold;
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.payment-name-new {
  font-size: 28rpx;
  color: #666;
  font-weight: 700;
}

.balance-text-new {
  font-size: 24rpx;
  color: #FF4444;
  font-weight: 500;
}

.payment-right {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.radio-button {
  width: 48rpx;
  height: 48rpx;
  border: 2rpx solid #D3D3D3;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  transition: all 0.3s ease;
}

.radio-selected {
  border-color: #007AFF;
  background-color: white;
}

.radio-inner {
  width: 24rpx;
  height: 24rpx;
  background-color: #007AFF;
  border-radius: 50%;
}

/* 新的预设金额样式 */
.section-description-new {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 64rpx;
  line-height: 1.4;
}

.amount-input-container-new {
  position: relative;
  background-color: #F5F7FA;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  margin-top: 24rpx;
}

.currency-symbol-new {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-right: 16rpx;
}

.amount-input-new {
  flex: 1;
  height: 48rpx;
  font-size: 48rpx;
  font-weight: bold;
  border: none;
  background: transparent;
  outline: none;
  padding: 0;
  box-sizing: border-box;
  color: #333;
  z-index: 1;
  position: relative;
}

.amount-input-new:focus {
  outline: none;
}

.amount-input-new::placeholder {
  color: #999;
  font-size: 48rpx;
  font-weight: bold;
}

.preset-options-new {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 24rpx;
}

.preset-button {
  padding: 20rpx 0;
  border-radius: 16rpx;
  background-color: #F5F7FA;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1rpx solid #F5F7FA;
}

.preset-button-active {
  background-color: #007AFF;
  border-color: #007AFF;
}

.preset-button-text {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.preset-button-active .preset-button-text {
  color: white;
}

.fleet-account-badge {
  display: inline-block;
  padding: 16rpx 20rpx;
  background-color: #E8F5E9;
  color: #2E7D32;
  border-radius: 8rpx;
  font-size: 28rpx;
  font-weight: 500;
}

/* 切换身份按钮样式 */
.change-user {
  font-size: 24rpx;
  color: #007AFF;
  font-weight: bold;
}

.balance-text-new-credit {
  font-size: 24rpx;
  /* 灰色 */
  color: #999;
  font-weight: 600;
}
</style>

<template>
  <!-- <uv-popup
    ref="popup"
    mode="bottom"
    :safe-area-inset-bottom="true"
    :round="20"
    @close="handleClose"
  >
    <view class="login-popup">
      <view class="title">
        <view>您好，欢迎登录！</view>
      </view>
      <view class="form">
        <view class="button">
          <view @click="login">
            手机号快捷登录
          </view>
        </view>
        <view class="tip">
          <text @click="toRegister">没有账号？去注册</text>
        </view>
      </view>
      <view class="pact">
        <view>
          <uv-checkbox-group v-model="pactChecked">
          <uv-checkbox
            name="true"
            shape="circle"
            @change="pactChange"
          >
            <view>我已阅读并同意<text @click="toPact">《用户协议》</text>和<text @click="toPact">《隐私协议》</text></view>
          </uv-checkbox>
        </uv-checkbox-group>
        </view>
      </view>
    </view>
  </uv-popup> -->
</template>

<script>
export default {
  name: 'LoginPopup',
  data() {
    return {
      pactChecked: [true],
    }
  },
  methods: {
    open() {
      this.$refs.popup.open()
    },

    close() {
      this.$refs.popup.close()
    },

    handleClose() {
      this.$emit('close')
    },

    login() {
      uni.showToast({
        title: "登录",
        icon: 'none'
      })
      // 登录成功后可以自动关闭弹窗
      // this.close()
    },

    toRegister() {
      this.close()
      uni.redirectTo({
        url: "./register"
      })
    },

    pactChange(e) {
      console.log(e)
      this.pactChecked = e.detail.value
    },

    toPact() {
      uni.showToast({
        title: "协议",
        icon: 'none'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login-popup {
  border-radius: 32rpx 32rpx 0 0;
  background-color: #fff;
  height: 50vh;
  background: url("../../static/login-C/pageBg.png") no-repeat top center;
  background-size: 100%; /* 等比例缩放，完整显示图片 */

  .title {
    padding-top: 100rpx;
    padding-bottom: 60rpx;

    view {
      padding-left: 20rpx;
      font-size: 44rpx;
      font-weight: 700;
      line-height: 1;
    }
  }

  .form {
    padding: 70rpx 20rpx;

    .button {
      view {
        line-height: 96rpx;
        border-radius: 48rpx;
        text-align: center;
        font-size: 32rpx;
        background: linear-gradient(90deg, rgba(255, 222, 102, 1) 0%, rgba(202, 245, 253, 1) 100%);
      }
    }

    .tip {
      font-size: 28rpx;
      text-align: center;
      margin-top: 100rpx;
      color: #666;
    }
  }

  .pact {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40rpx 0;
    font-size: 24rpx;

    text {
      color: #ffde66;
    }

    .uv-checkbox {
      transform: scale(0.6);
      margin-right: 8rpx;
    }
  }
}
</style>

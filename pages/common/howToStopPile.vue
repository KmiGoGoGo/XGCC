<template>
    <view :style="objColor">
      <uv-navbar :border="false" autoBack="true" placeholder safeAreaInsetTop></uv-navbar>
      <view class="stopCon">
        <view class="title">若在小程序上结束充电后电桩仍在充电运行中：</view>
        <view class="textCon">
             <p>1、查看充电桩屏幕上是否有【结束充电】或【停止充电】类的操作按钮，如有此按钮，请点击该按钮，并根据屏幕指引操作，停止充电后确保充电桩停止充电后可拔枪离场。充电订单账单信息将会自动同步上传，届时前往个人中心查看充电订单明细即可。 </p>
             <p>2.若充电桩无屏幕或以上操作失败，可尝试在充电桩上找到【紧急急停】按钮，按下图指示操作完成后可直接拔枪。</p>
             <image
                class="img"
                src="https://oos-cn.ctyunapi.cn/front-end/static/cartoon/pic_1.png"
              ></image>
         </view>
         <view class="title">01.在充电桩上找到并<text class="textRed">按下急停按钮</text></view>
         <image
                class="img"
                src="https://oos-cn.ctyunapi.cn/front-end/static/cartoon/pic_2.png"
              ></image>
         <view class="title">02.<text class="textRed">再次按下并顺时针旋转</text>急停按钮</view>
         <image
                class="img"
                src="https://oos-cn.ctyunapi.cn/front-end/static/cartoon/pic_3.png"
              ></image>
              <view class="title">03.设备停止充电后可<text class="textRed">拔出充电枪</text></view>
      </view>

      <view class="orderClothes">
        如有疑问请联系<text class="orderClothesText">客服</text>
      </view>
    </view>
  </template>
  
<script>
export default {
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
  
  onPageScroll(e) {
    
  }
};
  </script>
<style>
page {
  background-color: #f4f6f8;
  height: 100vh;
  padding-bottom: 40rpx;
}

.stopCon {
  background: linear-gradient(0deg, #ffffff, #f4f6f8);
  box-shadow: 4rpx 7rpx 20rpx 0rpx rgba(166, 171, 179, 0.24);
  border: 2rpx solid #ffffff;
  margin: 16rpx 24rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  padding: 40rpx 40rpx;
}

.title {
  font-size: 34rpx;
  font-family: PingFang SC;
  font-weight: bold;
  color: #18181a;
}

.textCon {
  font-size: 28rpx;
  font-weight: 400;
  color: #606266;
  margin-top: 15rpx;
}

.img {
  width: 100%;
  height: 350rpx;
  margin: 24rpx 0;
}

.orderClothes {
  font-weight: 400;
  color: #606266;
  font-size: 24rpx;
  text-align: center;
  padding: 40rpx 0;
}

.orderClothesText {
  color: #007AFF; /* 使用蓝色作为默认主色调 */
}

.textRed {
  color: #FC724C;
}
</style>
  
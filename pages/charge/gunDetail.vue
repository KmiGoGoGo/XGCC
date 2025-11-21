<template>
  <view :style="objColor">
    <customer></customer>
    <u-popup :show="showSelectGun" mode="center" round="15" @close="showSelectGun=false">
      <view class="selectGun_title">请选择新增的枪</view>
      <scroll-view class="selectGun_box" :scroll-y='true'>

        <template v-for="gunDetail in gunDTOList">
          <navigator class="pile_head" @click='selectGun(gunDetail)'>
            <!-- <image class="pile_img" :src="stationDetail.stationIcon ? stationDetail.stationIcon : 'https://oos-cn.ctyunapi.cn/front-end/static/static/pic.png'"></image> -->
            <view class="plie_box">
              <view class="plie_name">{{ stationDetail.stationName }}</view>
              <view class="plie_detail">当前电桩：{{ stationDetail.pileName }}-{{ gunDetail.gunName }}</view>
              <view class="plieInfo">{{ gunDetail.currentMode }}
                <text class="tagDivision"></text>
                {{ gunDetail.powerMode == 1 ? '慢充' : gunDetail.powerMode == 2 ? '快充' : '超充' }}
                <text class="tagDivision"></text>
                {{ gunDetail.ratedPower }}kw
              </view>
            </view>
            <view class="plie_item2">
              <block v-if="gunDetail.gunState == 1">
                <view class="img"></view>
                <view class="img2">空闲</view>
              </block>
              <block v-if="gunDetail.gunState == 2">
                <view class="img"></view>
                <view class="img2">充电准备</view>
              </block>
              <block v-if="gunDetail.gunState == 4">
                <view class="img"></view>
                <view class="img6">充电<br>完成</view>
              </block>
              <block v-if="gunDetail.gunState == 3">
                <view class="img"></view>
                <view class="img6">充电中</view>
              </block>
              <block v-if="gunDetail.gunState == 5">
                <view class="status"></view>
                <view class="status3">离线</view>
              </block>
              <block v-if="gunDetail.gunState == 6">
                <view class="status"></view>
                <view class="status3">充电锁定</view>
              </block>
              <block v-if="gunDetail.gunState == 7">
                <view class="status"></view>
                <view class="status3">故障</view>
              </block>
              <block v-if="gunDetail.gunState == 8">
                <view class="img"></view>
                <view class="img2">预约</view>
              </block>
              <block v-if="gunDetail.gunState == 9">
                <view class="status"></view>
                <view class="status3">禁用</view>
              </block>
              <block v-if="gunDetail.gunState == 255">
                <view class="status"></view>
                <view class="status3">默认</view>
              </block>

            </view>
            <!-- <image class="img" src="https://oos-cn.ctyunapi.cn/front-end/static/homeSub/images/turn.png"></image> -->
          </navigator>
        </template>

      </scroll-view>
    </u-popup>
    <!-- homeSub/pages/terminal/gunDetail/gunDetail.wxml -->
    <view class="switch-nav" v-if="isLogin">
      <text class="t1">
        <text>当前身份：</text>
        <text v-if="memberInfo.memberType == 1 || memberInfo.memberType == 2">
          {{ memberInfo.groupName }}-{{ memberInfo.motorcadeName }}
        </text>
        <text v-else>个人身份（{{ memberInfo.name }}）</text>
      </text>
      <view class="t2" @click="switchUserType"
            v-if="memberInfo.deductMode === 'TeamAccount' || memberInfo.deductMode === 'LeaguerAccount'">
        <image src="https://oos-cn.ctyunapi.cn/front-end/static/static/switch2.png"></image>
        <text>切换</text>
      </view>
    </view>
    <navigator class="pile_head" :url="'/homeSub/pages/siteDetail/siteDetail?stationId=' + stationDetail.stationId"
               open-type="redirect">
      <!-- <image class="pile_img" :src="stationDetail.stationIcon ? stationDetail.stationIcon : 'https://oos-cn.ctyunapi.cn/front-end/static/static/pic.png'"></image> -->
      <view class="plie_box">
        <view class="plie_name">{{ stationDetail.stationName }}</view>
        <view class="plie_detail">当前电桩：{{ stationDetail.pileName }}-{{ gunDetail.gunName }}</view>
        <view class="plieInfo">{{ gunDetail.currentMode }}
          <text class="tagDivision"></text>
          {{ gunDetail.powerMode == 1 ? '慢充' : gunDetail.powerMode == 2 ? '快充' : '超充' }}
          <text class="tagDivision"></text>
          {{ gunDetail.ratedPower }}kw
        </view>
      </view>
      <view class="plie_item2">
        <block v-if="gunDetail.gunState == 1">
          <view class="img"></view>
          <view class="img2">空闲</view>
        </block>
        <block v-if="gunDetail.gunState == 2">
          <view class="img"></view>
          <view class="img2">充电准备</view>
        </block>
        <block v-if="gunDetail.gunState == 4">
          <view class="img"></view>
          <view class="img6">充电<br>完成</view>
        </block>
        <block v-if="gunDetail.gunState == 3">
          <!-- <van-circle :value="gunDetail.soc" size="55" color="#1487FA" class="charging">
                        <view>{{ gunDetail.soc }}%</view>
                        <view>{{ gunDetail.gunState == 3 ? '充电中' : '充电完成' }}</view>
                    </van-circle> -->
          <u-circle-progress active-color="#6DB12E" :percent="gunDetail.soc" :width="130" :borderWidth="12">
            <view class="u-progress-content">
              <view class="soc">{{ gunDetail.soc }}%</view>
              <view class='status5'>{{ '充电中' }}</view>
            </view>
          </u-circle-progress>
        </block>
        <block v-if="gunDetail.gunState == 5">
          <view class="status"></view>
          <view class="status3">离线</view>
        </block>
        <block v-if="gunDetail.gunState == 6">
          <view class="status"></view>
          <view class="status3">充电锁定</view>
        </block>
        <block v-if="gunDetail.gunState == 7">
          <view class="status"></view>
          <view class="status3">故障</view>
        </block>
        <block v-if="gunDetail.gunState == 8">
          <view class="img"></view>
          <view class="img2">预约</view>
        </block>
        <block v-if="gunDetail.gunState == 9">
          <view class="status"></view>
          <view class="status3">禁用</view>
        </block>
        <block v-if="gunDetail.gunState == 255">
          <view class="status"></view>
          <view class="status3">默认</view>
        </block>

      </view>
      <!-- <image class="img" src="https://oos-cn.ctyunapi.cn/front-end/static/homeSub/images/turn.png"></image> -->
    </navigator>


    <view class="pile_head" style="padding:20rpx" @click="addGun" v-if="!gunDetail1.gunid">
      <view class='add-gun'>新增枪 +</view>
    </view>
    <navigator class="pile_head" :url="'/homeSub/pages/siteDetail/siteDetail?stationId=' + stationDetail.stationId"
               open-type="redirect" v-else>
      <!-- <image class="pile_img" :src="stationDetail.stationIcon ? stationDetail.stationIcon : 'https://oos-cn.ctyunapi.cn/front-end/static/static/pic.png'"></image> -->
      <view class="plie_box">
        <view class="plie_name">{{ stationDetail.stationName }}</view>
        <view class="plie_detail">当前电桩：{{ stationDetail.pileName }}-{{ gunDetail1.gunName }}</view>
        <view class="plieInfo">{{ gunDetail1.currentMode }}
          <text class="tagDivision"></text>
          {{ gunDetail1.powerMode == 1 ? '慢充' : gunDetail1.powerMode == 2 ? '快充' : '超充' }}
          <text class="tagDivision"></text>
          {{ gunDetail1.ratedPower }}kw
        </view>
      </view>
      <view class="plie_item2">
        <block v-if="gunDetail1.gunState == 1">
          <view class="img"></view>
          <view class="img2">空闲</view>
        </block>
        <block v-if="gunDetail1.gunState == 2">
          <view class="img"></view>
          <view class="img2">充电准备</view>
        </block>
        <block v-if="gunDetail1.gunState == 4">
          <view class="img"></view>
          <view class="img6">充电<br>完成</view>
        </block>
        <block v-if="gunDetail1.gunState == 3">
          <!-- <van-circle :value="gunDetail.soc" size="55" color="#1487FA" class="charging">
		                <view>{{ gunDetail.soc }}%</view>
		                <view>{{ gunDetail.gunState == 3 ? '充电中' : '充电完成' }}</view>
		            </van-circle> -->
          <u-circle-progress active-color="#6DB12E" :percent="gunDetail.soc" :width="130" :borderWidth="12">
            <view class="u-progress-content">
              <view class="soc">{{ gunDetail1.soc }}%</view>
              <view class='status5'>{{ '充电中' }}</view>
            </view>
          </u-circle-progress>
        </block>
        <block v-if="gunDetail1.gunState == 5">
          <view class="status"></view>
          <view class="status3">离线</view>
        </block>
        <block v-if="gunDetail1.gunState == 6">
          <view class="status"></view>
          <view class="status3">充电锁定</view>
        </block>
        <block v-if="gunDetail1.gunState == 7">
          <view class="status"></view>
          <view class="status3">故障</view>
        </block>
        <block v-if="gunDetail1.gunState == 8">
          <view class="img"></view>
          <view class="img2">预约</view>
        </block>
        <block v-if="gunDetail1.gunState == 9">
          <view class="status"></view>
          <view class="status3">禁用</view>
        </block>
        <block v-if="gunDetail1.gunState == 255">
          <view class="status"></view>
          <view class="status3">默认</view>
        </block>

      </view>
      <!-- <image class="img" src="https://oos-cn.ctyunapi.cn/front-end/static/homeSub/images/turn.png"></image> -->
    </navigator>

    <!-- <view class="pile_head" style="padding:20rpx" @click="anewAddGun" v-if="gunDetail1.gunid && gunDetail.gunid">
			<view class='add-gun'> 重新选择 </view>
		</view> -->

    <!-- 枪列表 -->
    <view class="plie_list">
      <view class="plie_item">
        <view class="item">
          <view class="item_name">
            <text v-if="!gunDetail.nowPrice.allDayPriceUnifyFlag">
              价格信息：(当前时段{{
                gunDetail.nowPrice.currentStartTime || '--'
              }}~{{ gunDetail.nowPrice.currentEndTime || '' }})
            </text>
            <text v-else>价格信息：全天价格统一</text>
            <!-- <image class="item_img" src="https://oos-cn.ctyunapi.cn/front-end/static/static/slow.png" v-if="gunDetail.powerMode === 1"></image>
                        <image class="item_img" src="https://oos-cn.ctyunapi.cn/front-end/static/static/fast.png" v-else-if="gunDetail.powerMode === 2"></image>
                        <image class="item_img" src="https://oos-cn.ctyunapi.cn/front-end/static/static/exceed.png" v-else-if="gunDetail.powerMode === 3"></image> -->
            <view class="priceDetail" @tap="pricePopupVisible" data-type="open" :data-gunid="gunDetail.gunid">
              价格详情
              <image class="turn_img"
                     :src="sellerNo=='jw'?'https://oos-cn.ctyunapi.cn/front-end/static/mine/images/turn-blue.png':'https://oos-cn.ctyunapi.cn/front-end/static/cartoon/turn_act.png'"></image>
            </view>
          </view>

          <!-- 营销获客未开启 -->
          <view v-if="!marketingSwitch">
            <view class="item_info">
              <view class="price" v-if="gunDetail.nowPrice.discount || gunDetail.nextStagePrice.contractDiscount">
                <image class="active-icon" src="https://oos-cn.ctyunapi.cn/front-end/static/static/car.png"
                       mode="heightFix" v-if="gunDetail.nextStagePrice.contractDiscount"></image>
                <image class="active-icon" src="https://oos-cn.ctyunapi.cn/front-end/static/static/gift.png"
                       mode="heightFix" v-else></image>
                <text class="price">
                  <text class="sp">￥</text>
                  {{
                    gunDetail.nowPrice.discount ? gunDetail.nowPrice.currentPriceStr : gunDetail.nowPrice.sweepPriceStr
                  }}
                  <text class="sp">起</text>
                </text>
                <text style="color: #909399;text-decoration: line-through;margin-left: 10rpx;font-size: 24rpx;"
                      v-if="gunDetail.nowPrice.discount">￥{{ gunDetail.nowPrice.sweepPriceStr }}起
                </text>
              </view>
              <view v-else class="price">
                <text class="price">
                  <text class="sp">￥</text>
                  {{
                    gunDetail.nowPrice.discount ? gunDetail.nowPrice.currentPriceStr : gunDetail.nowPrice.sweepPriceStr
                  }}
                  <text class="sp">起</text>
                </text>
                <text style="color: #909399;text-decoration: line-through;margin-left: 10rpx;font-size: 24rpx;"
                      v-if="gunDetail.nowPrice.discount">￥{{ gunDetail.nowPrice.sweepPriceStr }}起
                </text>
              </view>
            </view>
          </view>

          <!-- 营销获客已开启 -->
          <view v-if="marketingSwitch">
            <view class="item_info" v-if="gunDetail.marketing == null">
              <view class="price" v-if="gunDetail.nowPrice.discount || gunDetail.nextStagePrice.contractDiscount">
                <image class="active-icon" src="https://oos-cn.ctyunapi.cn/front-end/static/static/car.png"
                       mode="heightFix" v-if="gunDetail.nextStagePrice.contractDiscount"></image>
                <image class="active-icon" src="https://oos-cn.ctyunapi.cn/front-end/static/static/gift.png"
                       mode="heightFix" v-else></image>
                <text class="price">
                  <text class="sp">￥</text>
                  {{
                    gunDetail.nowPrice.discount ? gunDetail.nowPrice.currentPriceStr : gunDetail.nowPrice.sweepPriceStr
                  }}
                  <text class="sp">起</text>
                </text>
                <text style="color: #909399;text-decoration: line-through;margin-left: 10rpx;font-size: 24rpx;"
                      v-if="gunDetail.nowPrice.discount">￥{{ gunDetail.nowPrice.sweepPriceStr }}起
                </text>
              </view>
              <view v-else class="price">
                <text class="price">
                  <text class="sp">￥</text>
                  {{
                    gunDetail.nowPrice.discount ? gunDetail.nowPrice.currentPriceStr : gunDetail.nowPrice.sweepPriceStr
                  }}
                  <text class="sp">起</text>
                </text>
                <text style="color: #909399;text-decoration: line-through;margin-left: 10rpx;font-size: 24rpx;"
                      v-if="gunDetail.nowPrice.discount">￥{{ gunDetail.nowPrice.sweepPriceStr }}起
                </text>
              </view>
            </view>

            <!-- 营销获客处理 -->
            <view class="item_info" style="display:flex;" v-if="gunDetail.marketing != null">
              <view class="yhimg_box"
                    v-if="gunDetail.marketing.payleMemerLevel == 0 && gunDetail.marketing.discountStatus == 1">
                <image class="discount_img"
                       src="https://oos-cn.ctyunapi.cn/front-end/static/static/gift.png"></image>
              </view>
              <view class="yhimg_box" v-if="gunDetail.marketing.payleMemerLevel != 0">
                <image class="discount_img"
                       src="http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/static/pay_discount.png"></image>
                <view class="vip_text">V{{ gunDetail.marketing.payleMemerLevel }}</view>
              </view>
              <view class="price">
                <text class="price">
                  <text class="sp">￥</text>
                  {{ gunDetail.marketing.marketingFinaPriceStr }}
                  <text class="sp">起</text>
                </text>
                <text style="color: #909399;text-decoration: line-through;margin-left: 10rpx;font-size: 24rpx;">
                  ￥{{ gunDetail.nowPrice.sweepPriceStr }}起
                </text>
              </view>
            </view>
          </view>


          <!-- 营销获客未开启 -->
          <view v-if="!marketingSwitch">
            <view class="nextInfo">
              电费{{ gunDetail.nowPrice.currentPowerPriceStr ? gunDetail.nowPrice.currentPowerPriceStr : '--' }}元/度 |
              服务费{{
                gunDetail.nowPrice.currentServicePriceStr ? gunDetail.nowPrice.currentServicePriceStr : '--'
              }}元/度
            </view>
          </view>

          <!-- 营销获客已开启 -->
          <view v-if="marketingSwitch">
            <view class="nextInfo" v-if="gunDetail.marketing == null">
              电费{{ gunDetail.nowPrice.currentPowerPriceStr ? gunDetail.nowPrice.currentPowerPriceStr : '--' }}元/度 |
              服务费{{
                gunDetail.nowPrice.currentServicePriceStr ? gunDetail.nowPrice.currentServicePriceStr : '--'
              }}元/度
            </view>

            <!-- 营销获客处理 -->
            <view class="nextInfo" v-if="gunDetail.marketing != null">
              电费{{ gunDetail.nowPrice.currentPowerPriceStr ? gunDetail.nowPrice.currentPowerPriceStr : '--' }}元/度 |
              服务费{{
                gunDetail.marketing.marketingFinaServicePriceStr ? gunDetail.marketing.marketingFinaServicePriceStr : '--'
              }}元/度
            </view>
          </view>

        </view>
      </view>
    </view>

    <!-- 车辆信息 -->
    <view class="carInfo">
      <view class="tip">充电车辆</view>
      <view class="plateNo" @tap="goCarList" v-if="isLogin">
        <text v-if="memberInfo.vehicles && memberInfo.vehicles.length > 0">{{ plateNo }}</text>
        <text v-else>去添加</text>
        <image class="turn_img"
               :src="sellerNo=='jw'?'https://oos-cn.ctyunapi.cn/front-end/static/mine/images/turn-blue.png':'https://oos-cn.ctyunapi.cn/front-end/static/cartoon/turn_act.png'"></image>
      </view>
      <view class="plateNo" @tap="goLogin" v-if="!isLogin">
        <text>请登录后选择</text>
        <image class="turn_img" src="https://oos-cn.ctyunapi.cn/front-end/static/cartoon/turn_act.png"></image>
      </view>
    </view>


    <!-- 支付方式 -->
    <view class="payType" v-if="isLogin">
      <view class="title">
        <view class="txt1">支付方式</view>
      </view>
      <view>
        <view>
          <view v-for="(item, index) in payment" :key="index" @click="onChange(item.payType)"
                :data-paytype="item.payType">
            <!-- @tap="onChange($event)" -->
            <view class="radio"
                  v-if="
													(memberInfo.memberType == 0 && [1,-1,-2,6].includes(Number(item.payType))) ||
													([1,2].includes(Number(memberInfo.memberType)) && [2].includes(Number(item.payType))) ||
													([1,2].includes(Number(memberInfo.memberType)) && [5].includes(Number(item.payType))&& enableCardPay)"
                  :data-payType="item.payType"
            >
              <view class="account">
                <!-- 微信支付分图标 -->
                <image v-if="item.payType == -2" class="zhifufen_icon"
                       src="https://oos-cn.ctyunapi.cn/front-end/static/zhifufen_icon.png"></image>
                {{ item.accountName }}
                <view class="txt2" @tap="disposableVisible" v-if="item.payType == -1">
                  <image class="turn_img1" src="https://oos-cn.ctyunapi.cn/front-end/static/cartoon/wenhao.png"></image>
                </view>
                <view v-if="item.payType == 1" style="display: flex;">
                  （余额：
                  <text class="money">{{
                      item.payType == 1 ? item.value : (memberInfo.deductMode == 'TeamAccount') ? '****' : item.value
                    }}元
                  </text>
                  ）
                  <view class="txt2" @tap.stop="rechargeVisible" data-type="open" v-if="item.payType == 1">
                    去充值
                    <image class="turn_img"
                           :src="sellerNo=='jw'?'https://oos-cn.ctyunapi.cn/front-end/static/mine/images/turn-blue.png':'https://oos-cn.ctyunapi.cn/front-end/static/cartoon/turn_act.png'"></image>
                  </view>

                </view>
				<view v-if="item.payType == 6" style="display: flex;">
						  （余额：
						  <text class="money">{{
							  item.payType == 6 ? item.value: (memberInfo.deductMode == 'TeamAccount') ? '****' : item.value
							}}元
						  </text>
						  ）


				</view>
                <view class="txt3" v-if="item.payType == -2">
                  <span style="margin:0 14rpx">|</span>550分及以上专享
                  <image @click="showzhifufenTips" class="turn_img1"
                         src="https://oos-cn.ctyunapi.cn/front-end/static/cartoon/wenhao.png"></image>
                </view>

              </view>
              <image
                  :src="radio == item.payType ? sellerNo=='jw'?'https://oos-cn.ctyunapi.cn/front-end/static/mine/images/checkbox_sel-blue.png':'https://oos-cn.ctyunapi.cn/front-end/static/cartoon/checkbox_sel.png' : 'https://oos-cn.ctyunapi.cn/front-end/static/mine/images/checkRefund.png'"
                  :data-id="item.id" class="img1"
                  v-if="((memberInfo.memberType == 1 || memberInfo.memberType == 2) && item.payType == 2 && !enableCardPay)?false:true"></image>
              <!--  <van-radio slot="right-icon" checked-color="#1487FA" :name="item.payType" /> -->
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- 设置充电上限 -->
    <view class="setting" v-if="(radio == 1 || radio==6 )&& isLogin">
      <view class="setting_title">
        <text>预设充电金额</text>
        <text class="setting_tip">充电费用达到上限或充满电量则自动停止充电</text>
      </view>
      <view class="PrechargeInput">
        <text>￥</text>
        <input class="custom_input" type="digit" :value="customPrice" @input="getCustomPrice" placeholder="自定义"/>
      </view>
      <view class="priceType">

        <view :class="'type ' + (priceType == index ? 'type_action' : '')" :data-index="index" @tap="checkPriceType"
              v-for="(item, index) in priceTypeList" :key="index">
          {{ item }}{{ index == priceTypeList.length - 1 ? '' : '元' }}
        </view>
        <!-- <view class="custom">
        <image class="custom_img" src="https://oos-cn.ctyunapi.cn/front-end/static/homeSub/images/Editor.png"></image>
        <input class="custom_input" type="digit" :value="customPrice" @input="getCustomPrice" placeholder="自定义" />
        元
        </view> -->
      </view>
    </view>
    <!-- 设置充电上限 充完即退 -->
    <view class="setting" v-if="radio == -1 || radio == -2">
      <view class="setting_title">
        <text>预设充电金额</text>
        <text class="setting_tip">充电费用达到上限或充满电量则自动停止充电</text>
      </view>
      <view class="PrechargeInput">
        <text>￥</text>
        <input class="custom_input" type="digit" :value="customPrice" @input="getCustomPrice" placeholder="自定义"/>
      </view>
    </view>

    <!-- 停车费说明 -->
    <view class="stopExplain" v-if="isLogin">
      <!-- 营销获客未开启 -->
      <view v-if="marketingSwitch">
        <!-- 营销获客处理 -->
        <view class="explain">优惠说明</view>
        <view class="discount_list">
          <view class="discount_item" v-if="stationCouponDetail.enableCouponCount" @tap="cardCouponShowPopup">
            <text>可用卡券</text>
          </view>
          <view class="discount_item" v-if="stationCouponDetail.consume" @tap="goCumulativeMoney"
                :data-hdid="stationCouponDetail.consume.activityDetail.id">
            <text>累计消费</text>
          </view>
          <view class="discount_item" v-if="stationCouponDetail.single" @tap="goSingleMoney"
                :data-hdid="stationCouponDetail.single.activityDetail.id">
            <text>单笔折扣</text>
          </view>
          <view class="discount_item" v-if="stationCouponDetail.stationDiscount" @tap="goSiteOffers"
                :data-hdid="stationCouponDetail.stationDiscount.activityDetail.id">
            <text>站点优惠</text>
          </view>
        </view>
      </view>

      <view class="explain">停车费说明</view>
      <view class="tip">
        <view>{{ stationDetail.parking ? stationDetail.parking : '暂无' }}</view>
      </view>
    </view>

    <view style="margin:16rpx 26rpx">
      <placeholPileList :detail="stationDetail"></placeholPileList>
    </view>
    <!-- 底部操作栏 -->
    <view class="fot_operation" v-if="isLogin">
      <view class="reFresh" @tap="refresh">
        <image class="fot_img" src="https://oos-cn.ctyunapi.cn/front-end/static/homeSub/images/reFresh1.png"></image>
        <view>刷新</view>
      </view>
      <view class="rechargeRemind" v-if="recharge.value">{{ recharge.text }}</view>
      <view class="rechargeRemind" :style="recharge.value ? 'top: -150rpx;' : 'top: -75rpx;'"
            v-if="gunDetail.gunState == 1">请您在插枪后 点击启动
      </view>
      <!-- 判断有枪状态是空闲或者充电准备、桩号、余额、计费字段都有数据才能开启充电 2023.9.5-->
      <template
          v-if="isInsert && stationDetail.pileName && payment.length>0 && gunDetail.nowPrice && (!recharge.value || gunDetail.pileno.length >= 10)">
        <view class="fot_btn fot_btn1" @tap="whetherChargeFd">{{ gunDetail1.gunid ? '双枪并充' : '开启充电' }}</view>
      </template>
      <template v-else>
        <view class="fot_btn fot_btn2 ">{{ gunDetail1.gunid ? '双枪并充' : '开启充电' }}</view>
      </template>

    </view>
    <view class="fot_operation2" v-if="!isLogin">
      <view class="fot_btn" @tap="whetherCharge3">登录启动充电</view>
    </view>


    <!-- 价格详情弹窗 -->
    <!-- <uni-popup round='25' :show="showPrice" position="bottom" @close="pricePopupVisible($event, { type: 'close' })" data-type="close" custom-class="price_popup">
            <view class="priceList">
                <view class="priceItem" v-for="(item, index) in priceList" :key="item.price_list">
                    <view class="priceTop">
                        <view class="first">
                            <image class="price_img" :src="item.stageIcon"></image>
                            <view class="txt">{{ item.timeStr }}</view>
                            <image class="price_current" v-if="item.nowPowerPrice" src="https://oos-cn.ctyunapi.cn/front-end/static/homeSub/images/current.png"></image>
                        </view>
                        <view class="txt1">
                            <text class="txt2">¥</text>
                            {{ item.totalPrice }}
                            <text class="txt3">元/度</text>
                        </view>
                    </view>

                    <view class="servePrice">{{ item.powerprice }}</view>
                </view>
            </view>
        </uni-popup> -->

    <u-popup round='25' :show="showPrice" mode="bottom" position="bottom" @close="closePricePopupVisible"
             data-type="close" custom-class="price_popup">
      <view class="box-info">
        <view class="title">电价收费详情</view>
        <view class="t1">
          <text>收费时段</text>
          <text>费用(元/度) = 电费 + 服务费</text>
        </view>
        <view class="list">
          <view class="item" :class="item.now?'active':''" v-for="(item,index) in powerStageDetail" :key="index">
            <view class="time">{{ item.currentStartTime }}-{{ item.currentEndTime }}</view>
            <text class="t1 active" v-if="item.discount">优惠价</text>
            <text class="t2 active" v-if="item.now">当前价</text>

            <!-- 营销获客未开启 -->
            <view v-if="!marketingSwitch">
              <view class="right-item">
                <view class="type1" v-if="item.discount">
                  <view class="l1">
                    <text class="t2">{{ item.currentPriceStr }}</text>
                    <text>{{ item.currentPowerPriceStr }}</text>
                    <text>{{ item.currentServicePriceStr }}</text>
                  </view>
                  <view class="delete">
                    <text>{{ item.sweepPriceStr }}</text>
                    <text>{{ item.sweepPowerPriceStr }}</text>
                    <text>{{ item.sweepServicePriceStr }}</text>
                  </view>
                </view>
                <view class="type2" v-else>
                  <text class="t1">{{item.discount?item.currentPriceStr:item.sweepPriceStr }}</text>
                  <text>{{ item.discount?item.currentPowerPriceStr:item.sweepPowerPriceStr }}</text>
                  <text>{{ item.discount?item.currentServicePriceStr: item.sweepServicePriceStr}}</text>
                </view>
              </view>
            </view>

            <!-- 营销获客已开启 -->
            <view v-if="marketingSwitch">
              <view class="right-item" v-if="item.marketing == null">
                <view class="type1" v-if="item.discount">
                  <view class="l1">
                    <text class="t2">{{ item.currentPriceStr }}</text>
                    <text>{{ item.currentPowerPriceStr }}</text>
                    <text>{{ item.currentServicePriceStr }}</text>
                  </view>
                  <view class="delete">
                    <text>{{ item.sweepPriceStr }}</text>
                    <text>{{ item.sweepPowerPriceStr }}</text>
                    <text>{{ item.sweepServicePriceStr }}</text>
                  </view>
                </view>
                <view class="type2" v-else>
                  <text class="t1">{{ item.currentPriceStr }}</text>
                  <text>{{ item.currentPowerPriceStr }}</text>
                  <text>{{ item.currentServicePriceStr }}</text>
                </view>
              </view>

              <!-- 营销获客处理 -->
              <view class="right-item" v-if="item.marketing != null">
                <view class="type1">
                  <view class="l1">
                    <view class="yhimg_box"
                          v-if="item.marketing.payleMemerLevel == 0 && item.marketing.discountStatus == 1">
                      <image class="discount_img"
                             src="https://oos-cn.ctyunapi.cn/front-end/static/static/gift.png"></image>
                    </view>
                    <view class="yhimg_box" v-if="item.marketing.payleMemerLevel != 0">
                      <image class="discount_img"
                             src="http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/static/pay_discount.png"></image>
                      <view class="vip_text">V{{ item.marketing.payleMemerLevel }}</view>
                    </view>
                    <text class="t2">{{ item.marketing.marketingFinaPriceStr }}</text>
                    <text>{{ item.currentPowerPriceStr }}</text>
                    <text>{{ item.marketing.marketingFinaServicePriceStr }}</text>
                  </view>
                  <view class="delete" style="margin-left: 40rpx;">
                    <text>{{ item.currentPriceStr }}</text>
                    <text>{{ item.currentPowerPriceStr }}</text>
                    <text>{{ item.currentServicePriceStr }}</text>
                  </view>
                </view>
              </view>
            </view>

          </view>
        </view>
      </view>
      <!-- 充值中 -->
      <view class="recharge-loading" v-if="rechargeLoading">
        <view class="body">
          <image class="icon" src="https://oos-cn.ctyunapi.cn/front-end/static/static/recharge.png"
                 mode="widthFix"></image>
          <view class="title">正在充值</view>
          <view class="desc">请勿关闭程序或窗口</view>
        </view>
      </view>
      <!-- 充值异常 -->
      <view class="recharge-error" v-if="rechargeError">
        <view class="body">
          <view class="title">
            <text>充值异常</text>
            <image class="close" src="https://oos-cn.ctyunapi.cn/front-end/static/static/close.png" mode="widthFix"
                   @tap.stop.prevent="closeRechargeError"></image>
          </view>
          <view class="content">
            <view class="msg">{{ remark }}</view>
            <view class="phone">
              <text v-if="showStatus && phoneNumber">客服电话：{{ phoneNumber }}</text>
            </view>
          </view>
          <button class="btn"
                  @tap.stop.prevent="calltel">{{ showStatus && phoneNumber ? '呼叫客服' : '我知道了' }}
          </button>
        </view>
      </view>
    </u-popup>
    <!-- 充完即退提示弹框 -->
    <u-popup :show="showDisposable" mode='center' closeable
             custom-style="width:580rpx;border-radius: 16rpx;padding: 24rpx 38rpx 40rpx;line-height: 48rpx;"
             @close="disposableVisible1">
      <view style="color: #3f4042;text-align: center;margin-bottom: 26rpx;font-size: 36rpx;">温馨提示</view>
      <view style="color: #3f4042;">预先支付充电费用，充电结束后1-3个工作日内自动退回多余费用；</view>
      <view style="color: #3f4042;">
        充电过程中，由于桩信息传输存在时差，可能会产生超出预付金额的情况，默认优先扣除个人账户的余额。
      </view>
    </u-popup>

    <!-- 充值弹窗 -->
    <u-popup :show="showRecharge" mode='center' closeable
             custom-style="width:674rpx;height:482rpx;border-radius: 16rpx;" @close="rechargeVisible1">
      <Payment @getbalance="getMemberInfo" style="padding:32rpx"></Payment>
    </u-popup>

    <!--绑定车辆对话框-->
    <!--<uni-popup ref="alertDialog" type="dialog">-->
    <!--<uni-popup-dialog type="info" :cancelText="cancelText" :confirmText="confirmText" title="温馨提示" :content="content" @confirm="dialogConfirm2" @close="dialogClose2"></uni-popup-dialog>-->
    <!--</uni-popup>-->

    <!--切换身份-->
    <UserTypePopup ref="UserTypePopup" @dialogConfirm="dialogConfirm" :userType="memberInfo.memberType"
                   :deductMode="memberInfo.deductMode"></UserTypePopup>


    <!-- 可用卡券 -->
    <u-popup
        :show="cardCoupon"
        position="bottom"
        closeable
        @close="cardCouponClose"
        custom-style="border-radius:16rpx;width:95%;margin:0 24rpx 37rpx;box-shadow: 4rpx 7rpx 20rpx 0rpx rgba(166,171,179,0.2400);padding:0 31rpx;background:#F5F7FA;"
    >
      <view class="card_wrap">
        <view class="card_title">本站可用优惠券</view>
        <view class="card_list" style="max-height: 500rpx">
          <view class="card_item" @tap.stop.prevent="toCardCoupons" :data-id="items.id"
                v-for="(items, index) in cardCouponList" :key="index">
            <!-- <image class="card_bg" src="http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/homeSub/images/line_bg2.png"></image> -->

            <image
                class="card_bg"
                :src="items.picture ? items.picture : 'http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/homeSub/images/line_bg.png'"
                v-if="items.applyStationType == 1"
            ></image>

            <image
                class="card_bg"
                :src="items.picture ? items.picture : 'http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/homeSub/images/line_bg2.png'"
                v-if="items.applyStationType == 2 || items.applyStationType == 3"
            ></image>

            <view class="card_content">
              <view class="card_money">
                <view class="card_money_num">
                  ￥
                  <text>{{ items.couponAmount }}</text>
                </view>
                <view class="card_money_des" v-if="items.applyStationType == 1">通用</view>
                <view class="card_money_des" v-if="items.applyStationType == 2 || items.applyStationType == 3">
                  站点专属
                </view>
              </view>
              <view class="card_riqi">
                <view class="card_riqi_title" v-if="items.type == 1">服务费券</view>
                <view class="card_riqi_title" v-if="items.type == 2">电费券</view>
                <view class="card_riqi_title" v-if="items.type == 3">现金券</view>
                <view class="card_riqi_des">满{{ items.meetAmount }}可用</view>
                <view class="card_riqi_riqi">
                  <view>
                    <image class="card_riqi_icon"
                           src="http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/homeSub/images/icon1.png"></image>
                    {{ items.receiveTime }}
                  </view>
                  <view>
                    <image class="card_riqi_icon"
                           src="http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/homeSub/images/icon2.png"></image>
                    {{ items.expireTime }}
                  </view>
                </view>
              </view>
              <view class="card_xd">
                {{ items.applyStationTypeStr }}
                <image class="card_xd_icon"
                       src="http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/homeSub/images/turn.png"></image>
              </view>
            </view>
          </view>
        </view>
      </view>
    </u-popup>
	<ua-pop ref="uapop" />
  </view>
</template>

<script>
'use strict';
// import vanCircle from '@vant/weapp/circle/index';
// import vanPopup from '@vant/weapp/popup/index';
// import vanRadio from '@vant/weapp/radio/index';
// import vanRadioGroup from '@vant/weapp/radio-group/index';

var util = require('@/utils/util.js');
var debounce = new util.Debounce();

import {getStationCoupon, getStationDiscount, getTerminalDiscount} from '../../../../api/marketing/stationListApi';

import {currentTemplateId, queryWxOrder} from '@/api/zhifufen';
import {
  getMyOccupyBillPage
} from '@/api/placeholder.js';
import {getSellerPayConfigBySellerId} from '@/api/apiServe'
import Payment from '@/components/payment/payment';
import placeholPileList from '@/components/placeholPileList/placeholPileList';
import uapop from '@/components/ua-pop/ua-pop';
import UserTypePopup from '@/components/switchUserType/userTypePopup';

var app = getApp();
var https_1 = require('./../../../../api/https.js');
var Interval = null;
let waitingTimes = ''


// #ifdef APP-PLUS
let KJOpenBusinessView = uni.requireNativePlugin('JXUNIPlugin-JXUniPluginModule');
// #endif

import {cancelOrder} from '@/api/zhifufen'

export default {
  components: {
    // vanCircle,
    // vanPopup,
    // vanRadio,
    placeholPileList,
    Payment,
    UserTypePopup,
	uapop
  },
  data() {
    return {
		cardChong:true,
      showSelectGun: false,
      gunDTOList: [],
      sellerNo: app.globalData.sellerNo,
      kycContent: '',//康亿创文本
      showDisposable: false,
      showRecharge: false,
      getRechargeResultNum: 1,
      rechargeLoading: false,
      rechargeError: false,
      remark: '',
      phoneNumber: '',
      showStatus: false,
      memberInfo: {
        vehicles: '',
        memberType: 0,
        deductMode: ''
      },
	  accountInfo:{
		  jlAccountBalance:0
	  },
      cancelText: '',
      confirmText: '',
      content: '',
      stationDetail: {
        stationId: '',
        stationIcon: false,
        stationName: '',
        stationAddress: '',
        parkingFeeDesc: false,
		cardCharge: 2,
      },

      gunDetail: {
        gunState: 0,
        soc: '',
        gunName: '',
        powerMode: 0,
        gunid: '',
        electPrice: '',
        nextStageTime: false,
        nextStageBalance: false,
        nowPrice: {},
        nextStagePrice: {}
      },
      gunDetail1: {
        gunState: 0,
        soc: '',
        gunName: '',
        powerMode: 0,
        gunid: '',
        electPrice: '',
        nextStageTime: false,
        nextStageBalance: false,
        nowPrice: {},
        nextStagePrice: {}
      },

      priceList: [],
      isInsert: false,
      status: 1,
      radio: '1',
      payment: [],
      priceType: 3,
      rechargeIndex: 0,
      customRechargePrice: '',
      customPrice: '',
      showPrice: false,
      //priceTypeList: ['100', '60', '30', '全部余额'],
      priceTypeList: ['30', '50', '100', '全部余额'],
      chargeParameter: {},
      pileNo: '',
      gunid: '',
      gunno: '',
      plateNo: '',

      guns: [
        {
          value: 0,
          name: 'A'
        },
        {
          value: 1,
          name: 'B'
        },
        {
          value: 2,
          name: 'C'
        },
        {
          value: 3,
          name: 'D'
        },
        {
          value: 4,
          name: 'E'
        },
        {
          value: 5,
          name: 'F'
        },
        {
          value: 6,
          name: 'G'
        },
        {
          value: 7,
          name: 'H'
        },
        {
          value: 8,
          name: 'I'
        },
        {
          value: 9,
          name: 'J'
        },
        {
          value: 10,
          name: 'K'
        },
        {
          value: 11,
          name: 'L'
        },
        {
          value: 12,
          name: 'M'
        },
        {
          value: 13,
          name: 'N'
        },
        {
          value: 14,
          name: 'O'
        },
        {
          value: 15,
          name: 'P'
        },
        {
          value: 16,
          name: 'Q'
        },
        {
          value: 17,
          name: 'R'
        },
        {
          value: 18,
          name: 'S'
        },
        {
          value: 19,
          name: 'T'
        },
        {
          value: 20,
          name: 'U'
        },
        {
          value: 21,
          name: 'V'
        },
        {
          value: 22,
          name: 'W'
        },
        {
          value: 23,
          name: 'X'
        },
        {
          value: 24,
          name: 'Y'
        },
        {
          value: 25,
          name: 'Z'
        }
      ],

      recharge: {
        text: '余额不足请充值',
        value: false
      },
      powerStageDetail: [],
      dataShow: false,
      tips: '',
      orderNo: '',
      payType: 6,
      isChange: false,
      placeholdOrderCount: 0,//占位订单数量
      placeholdOrderDetail: {},//占位订单详情
      unifiedOrderStstus: false,

      isLogin: false,

      //可用卡券弹窗
      cardCoupon: false,
      cardCouponList: [],

      //站点详情 优惠说明
      stationCouponDetail: {
        enableCouponCount: '',

        consume: {
          activityDetail: {
            id: ''
          }
        },

        single: {
          activityDetail: {
            id: ''
          }
        },

        stationDiscount: {
          activityDetail: {
            id: ''
          }
        }
      },

      ljxfDetail: {},
      dbzkDetail: {},
      zdyhDetail: {},
      userTypes: '',
      stationCouponPriceDetail: {},
      yhsmBox: false,
      wxTemplateIds: [],
      platformNo: '',//扫码域名
      hulianinterfaceId: '',
      appType: 'mini',
      chargingOrderList: [],
      // 商家支付配置
      sellerPayConfigBySellerId: {},
    };
  },
  computed: {
    enableCardPay() {
      // 允许使用储蓄卡支付条件
      return (
          this.stationDetail?.isStoreCardPay &&
          this.plateNo &&
          this.memberInfo.vehicles.length > 0 &&
          this.memberInfo.vehicles.find((item) => item.plateNo == this.plateNo)
              ?.hasStoreCard
      );
    },
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("gunDetail=>>>>>>>>", options)

    if (this.isnylH5()) {
      uni.setStorageSync('gunDetailOptions', options)
    }

    if (options.status) {
      this.status = options.status
    }

    if (options.pileNo) {
      this.pileNo = options.pileNo
    }

    if (options.gunNo) {
      this.gunno = options.gunNo
    }
    if (options.gunid) {
		this.gunid = options.gunid
    }


    if (options.kycText) {
      this.kycContent = options.kycText
    }
    if (options.hasStateGrid == 1 && options.qrCode) {
      this.hasStateGrid = options.hasStateGrid,
          this.qrCode = options.qrCode
    }

    this.pileNo = options.pileNo


    //   营销获客处理
    if (options.stationID) {
      this.setData({
        stationId: options.stationID
      });
    }


    this.codeSellerType = options.codeSellerType
    this.connectorID = options.connectorID

    this.platformNo = options.platformNo || ''
    this.hulianinterfaceId = options.hulianinterfaceId || ''


    // waitingTimes = setInterval(() => {
    //   this.getPileDTOByNo()
    // }, 5000)

    //  if (options.preFrozenAmount && options.qrCode) {
    // 	 this.preFrozenAmount = options.preFrozenAmount,
    // 	 this.qrCode = options.qrCode
    //     }

    //需要登录
    // if (uni.getStorageSync('token')) {
    // 	this.currentTemplateId()
    // }

    //移动端优化 未登录扫码进入枪详情后
    if (uni.getStorageSync('token')) {
      this.isLogin = true

      //营销获客 优惠
      let userInfo = uni.getStorageSync('userInfo');
      console.log(userInfo);
      if (userInfo.memberType == 0) {
        this.userTypes = '1';
      } else {
        this.userTypes = '2';
      }

      const that = this
      // 充完即退合并
      https_1.selectAbnormalConfig().then(function (res) {
        if (res.code == 0 && res.data) {
          that.remark = res.data.remark,
              that.phoneNumber = res.data.telephone,
              that.showStatus = res.data.showStatus === 1 ? true : false
        }
      });
      // 获取占位订单
      this.getMyOccupyBillPage()

      if (this.codeSellerType == 'sudiantong') {
        this.getRealyFnSudiantong()
      } else {
        this.getRealyFn()
      }

      this.getSellerPayConfigBySellerId()
	  this.getThirdActivity()
    } else {
      this.isLogin = false

      this.getPileDTOByNo()
    }

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('生命周期函数--监听页面显示', this.plateNo)

    // this.getMemberInfo()
    Promise.all([this.getPileDTOByNo(), this.getMemberInfo()]);
    // cancelOrder({
    //     "sellerId":getApp().globalData.sellerId,
    //     "busId":'342017083',
    //     "cancelReason":'取消订单'
    // }).then(res=>{
    //     console.log('支付分取消订单',res)
    // })
    waitingTimes = setInterval(() => {
      this.getPileDTOByNo()
    }, 5000)
    // console.log('token',uni.getStorageSync('token'))
    // #ifdef APP-PLUS
    this.appType = 'app'
    // #endif
    this.unifiedOrderStstus = false


if (uni.getStorageSync('token')) {
      this.isLogin = true

      //营销获客 优惠
      let userInfo = uni.getStorageSync('userInfo');
      console.log(userInfo);
      if (userInfo.memberType == 0) {
        this.userTypes = '1';
      } else {
        this.userTypes = '2';
      }

      const that = this
      // 充完即退合并
      https_1.selectAbnormalConfig().then(function (res) {
        if (res.code == 0 && res.data) {
          that.remark = res.data.remark,
              that.phoneNumber = res.data.telephone,
              that.showStatus = res.data.showStatus === 1 ? true : false
        }
      });
      // 获取占位订单
      this.getMyOccupyBillPage()

      if (this.codeSellerType == 'sudiantong') {
        this.getRealyFnSudiantong()
      } else {
        this.getRealyFn()
      }

      this.getSellerPayConfigBySellerId()
	  this.getThirdActivity()
    } else {
      this.isLogin = false

      this.getPileDTOByNo()
    }

  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('生命周期函数--监听页面隐藏', this.plateNo)
    // #ifdef H5
    // alert(`这是onHide，定时器id${waitingTimes}`)
    // #endif
    clearInterval(waitingTimes)
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('生命周期函数--监听页面卸载', this.plateNo)
    // #ifdef H5
    // alert(`这是onUnload，定时器id${waitingTimes}`)
    // #endif
    clearInterval(waitingTimes)
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  },
  methods: {
	  getThirdActivity(){
	  		  if(this.pileNo!=null){
	  			  var t=this;
	  			  https_1.getThirdActivity(t.pileNo).then(function(res) {
	  				  if(res.code==0&&res.data!=null&&res.data.content!=null&&res.data.content!=""){
	  					  let itemrr = res.data.content;
	  					  let uniPop = t.$refs.uapop
	  					      uniPop.show({
	  					          content: `
	  					             <div class="aboutme" style="text-align: center;padding:20px 0;height:100px;">
	  					                             <div style="color:#999;font-family:simsun;margin-top:10px;">${itemrr}</div>
	  					                         </div>
	  					          `,
	  					          shadeClose: false,
	  					  			  title: '活动通知' ,
	  					          xclose: true,
	  					          anim: 'shake',
	  					      })
	  				  }
	  			  	console.log(res)
	  			  	
	  			  })
	  		  }
	  },
    selectGun(gunDetail) {
      this.gunDetail1 = gunDetail
      setTimeout(() => {
        this.showSelectGun = false
        // 双枪充电处理
        this.isInsert = (gunDetail.gunState == 2 && this.gunDetail.gunState == 2)

        // this.getQuery(this.memberInfo.memberType == 0);
        // that.minimumAmount();
      }, 500)
    },
    addGun() {
      if (this.gunDTOList.length) {
        this.showSelectGun = true
      } else {
        uni.showToast({
          title: '暂无可选择的枪',
          icon: 'none'
        })
      }
    },
    anewAddGun() {

    },
    getSellerPayConfigBySellerId() {
      getSellerPayConfigBySellerId(getApp().globalData.sellerId).then(res => {
        console.log('这是商家配置11', res)
        if (res.code == 0) {
          // let { isusebhPay, ishidebhPay,isUseNyPay,isUseJHPay} =
          this.sellerPayConfigBySellerId = res.data || {}

          // 有携带订单号的话轮询
          // if (this.orderNo) {
          // this.getRechargeResult1()
          // setTimeout(()=>{
          // 	// 定义支付失败状态
          // 	this.payErr = true
          // },4000)
          // }
        }
      })
    },
    //查询正在充电订单
    chargeInfos: function () {
      var that = this;
      https_1.pageChargeServiceMonitorNew({
        current: 1,
        pageSize: 100,
        memberNo: uni.getStorageSync('tel')
      }).then(function (res) {
        if (res.code == 0) {
          that.chargingOrderList = res.data.data

          if (res.data.data.length) {
            clearInterval(waitingTimes)
            that.goChargingOrder1()
            // that.getMyNotPayBillNumber();
          }
        }
      });
    },
    //获取未结算订单数
    getMyNotPayBillNumber: function () {
      var that = this;
      https_1.getMyNotPayBillNumber({
        prePayVer: 1
      }).then(function (res) {
        if (res.code == 0) {
          that.unpaidOrderNum = res.data
        }
      });
    },
    //充电中订单（单台）
    goChargingOrder1: function () {
      console.log(this.chargingOrderList)
      // #ifndef H5
      // alert('跳转充电中的页面拉')
      // alert(window.location.href)
      // #endif
      uni.redirectTo({
        url: '/echartsPages/pages/power/power?busId=' +
            this.chargingOrderList[0].billNo +
            '&pileNo=' +
            this.chargingOrderList[0].pileNo +
            '&gunNo=' +
            this.chargingOrderList[0].gunNo
      });
    },
    //可用卡券信息
    getStationCouponDetail() {
      const tmp = this;
      getStationCoupon({
        stationId: this.stationId,
        userId: uni.getStorageSync('memberId'),
        userType: this.userTypes
      })
          .then((res) => {
            console.log(res.data, 'kkkkkkkkkkk');
            if (res.code == 200) {
              res.data.forEach((item) => {
                if (item.applyStationType == 1) {
                  item.applyStationTypeStr = '所有站点';
                } else if (item.applyStationType == 2) {
                  item.applyStationTypeStr = '指定站点';
                } else if (item.applyStationType == 3) {
                  item.applyStationTypeStr = '指定条件';
                }
              });
              tmp.setData({
                cardCouponList: res.data
              });
            }
          })
          .catch((err) => {
            console.log(err);
          });
    },

    //获取站点终端优惠说明 //不传车和终端的是否超充类型
    getStationDiscounts(applyTerminalStatus, applyModelStatus) {
      console.log('终端优惠说明.....');
      getStationDiscount({
        stationId: this.stationId,
        userId: uni.getStorageSync('memberId'),
        userType: this.userTypes
        // applyTerminalStatus: applyTerminalStatus,
        // applyModelStatus: applyModelStatus,
      })
          .then((res) => {
            console.log(res.data, 'yhsm........!!!!!!!!!!!!!!!!');
            if (res.code == 200 && res.data) {
              this.setData({
                stationCouponDetail: res.data,
                ljxfDetail: res.data.consumeRewardMemo,
                dbzkDetail: res.data.singleRewardMemo,
                zdyhDetail: res.data.stationDiscount ? res.data.stationDiscount.serviceFeeDiscountDetail : null,
                yhsmBox: true
              });
              console.log(this.ljxfDetail, 'lll...');
              console.log(this.dbzkDetail, 'ddd...');
              console.log(this.zdyhDetail, 'zzz...');
            } else {
              this.setData({
                yhsmBox: false
              });
            }
          })
          .catch((err) => {
            console.log(err);
          });
    },

    // 可用卡券弹窗
    cardCouponShowPopup() {
      this.setData({
        cardCoupon: true
      });
    },

    cardCouponClose() {
      this.setData({
        cardCoupon: false
      });
    },

    //去优惠券卡券详情
    toCardCoupons(e) {
      console.log(e.currentTarget.dataset);
      uni.navigateTo({
        url: '/homeSub/pages/discount/cardCoupons/cardCoupons?id=' + e.currentTarget.dataset.id
      });
    },

    // 累计消费
    goCumulativeMoney(e) {
      // wx.navigateTo({
      //     url: '/homeSub/pages/discount/cumulativeMoney/cumulativeMoney'
      // })
      console.log(e.currentTarget.dataset, 'llllllllll');
      uni.navigateTo({
        url: '/homeSub/pages/discount/cumulativeMoney/cumulativeMoney?HD=' + `${e.currentTarget.dataset.hdid}`
      });
    },

    // 单笔折扣
    goSingleMoney(e) {
      // wx.navigateTo({
      //     url: '/homeSub/pages/discount/singleMoney/singleMoney'
      // })
      console.log(e.currentTarget.dataset, 'dddddddd');
      uni.navigateTo({
        url: '/homeSub/pages/discount/singleMoney/singleMoney?HD=' + `${e.currentTarget.dataset.hdid}`
      });
    },

    // 站点优惠
    goSiteOffers(e) {
      // wx.navigateTo({
      //     url: '/homeSub/pages/discount/siteOffers/siteOffers'
      // })
      console.log(e.currentTarget.dataset, 'zzzzzzz');
      uni.navigateTo({
        url: '/homeSub/pages/discount/siteOffers/siteOffers?HD=' + `${e.currentTarget.dataset.hdid}`
      });
    },
    getRealyFn() {
      const that = this
      https_1.querChargeRealy({
        pileNo: this.pileNo,
        gunNo: this.gunno,
        qrCode: this.pileNo,
        platformNo: that.platformNo || null,
        hulianinterfaceId: that.hulianinterfaceId || null
      }).then(async function (res) {
        that.gunno = res.data.gunNo
        that.pileNo = res.data.pileNo
        // Promise.all([that.getPileDTOByNo(), that.getMemberInfo()]);
      })
      // this.getInitPayType()
      this.getUserType()
    },
    getRealyFnSudiantong() {
      const that = this
      https_1.querChargeRealy({
        pileNo: this.pileNo,
        gunNo: this.gunno,
        connectorID: this.connectorID,
        platformNo: that.platformNo || null,
        hulianinterfaceId: that.hulianinterfaceId || null
      }).then(async function (res) {
        that.gunno = res.data.gunNo
        that.pileNo = res.data.pileNo
        Promise.all([that.getPileDTOByNo(), that.getMemberInfo()]);
      })
      // this.getInitPayType()
      this.getUserType()
    },
    // 获取占位订单
    getMyOccupyBillPage() {
      getMyOccupyBillPage({
        // memberId:uni.getStorageSync('memberId'),
        billStatus: 11,
        current: 1,
        pageSize: 10
      }).then(res => {
        let records = res.data.records || []
        if (records.length) {
          this.placeholdOrderCount = records.length
          this.placeholdOrderDetail = records[0]
        } else {
          this.placeholdOrderCount = 0
        }
      })
    },

    //获取站点详情(查询枪最低价格信息)
    getStationGunPriceDetail: function (gunId) {
      var that = this;
      https_1.getStationGunDetails(gunId).then((res) => {
        if (res.code == 0) {
          this.powerStageDetail = res.data?.powerStageDetail || [];
          that.showPrice = true
        }
		console.log(this.powerStageDetail,"电价详细")
		if(that.radio==6){
			console.log("电卡支付显示原价")
		that.powerStageDetail.forEach(function(item){
			item.discount=false
			// item.now=true
		})
		}
      }).catch(err => {
        uni.showToast({
          title: err,
          icon: "none",
          duration: 2000,
        })
      })
    },
    // 获取初始的payType
    async getInitPayType() {
      await https_1.getMemberInfo({}).then((res) => {
        if (res.code == 0) {
          this.setData({
            memberType: res.data.memberType
          })
        }
      })
      if (res.data.memberType == 0) {

        await this.getQuery(true)

      } else {

        await this.getQuery()

      }
      await https_1.queryList({}).then((res) => {
        if (res.code == 0) {
          if (this.memberType == 0) {
            this.setData({
              payType: 1
            })
          } else {
            switch (res.data[0].payType) {
              case 1:
                this.setData({
                  payType: 1
                })
                break;
              case 2:
                this.setData({
                  payType: 2
                })
                break;
              case -1:
                this.setData({
                  payType: 1
                })
                break;
            }
          }
          let index = this.payment.findIndex((item) => {
            return this.payType == item.payType
          })
          console.log(this.payment, '222')
          this.setData({
            priceType: 3,
            customPrice: this.payment[index].value
          })
        }
      })

    },
    switchUserType() {
      this.$refs.UserTypePopup.$refs.alertDialog.open()
    },
    dialogConfirm2() {
      console.log(11)
    },
    dialogClose2() {
      console.log(22)
    },
    dialogConfirm(e) {
      this.memberInfo.memberType = e
      uni.setStorageSync('memberType', e)
      this.getPileDTOByNo(e)
      this.$refs.UserTypePopup.$refs.alertDialog2.close()
      if (this.memberInfo.memberType == 1 || this.memberInfo.memberType === 2) {
        this.radio = '2'
      } else {
        this.radio = '1'
      }
      this.getMemberInfo()
    },
    // 获取枪详情
    getPileDTOByNo: function (type = '') {
      console.log(type, '枪号类型..........')

      var that = this;
      // let data = type.toString()?{pileNo: this.pileNo, type:(type == 2 || type == 1)?1:0}:{pileNo: this.pileNo}
      let data = type.toString() ? {
        pileNo: this.pileNo,
        type: (type == 2 || type == 1) ? 1 : 0,
        kycContent: this.kycContent,
        sellerId: getApp().globalData.sellerId
      } : {pileNo: this.pileNo, kycContent: this.kycContent, sellerId: getApp().globalData.sellerId}


      data.platformNo = that.platformNo || null
      data.hulianinterfaceId = that.hulianinterfaceId || null

      return https_1
          .getPileDTOByNo(data)
          .then(function (res) {
            if (res.code == 0) {

              var gunDTO_1 = {};
              var pluggable_1 = false;
              console.log("打印getPileDTOByNo", res, res.code)
              that.gunDTOList = res.data.gunDTOList.filter(item => item.gunno != that.gunno)
              res.data.gunDTOList.map(function (item) {
                if (!item.gunName) {
                  item.gunName = that.guns[item.gunno].name + '枪';
                }
                if (item.gunno == that.gunno) {
                  console.log("打印item.gunid == that.gunid", item.gunid == that.gunid)
                  if (item.hasContract && that.payType == 2) {
                    item.electPrice = Number(item.contractElectPrice).toFixed(2)
                    item.nextStageBalance = Number(item.contractNextStageBalance).toFixed(2)
                    item.nextStageTime = item.contractNextStageTime
                  } else {
                    item.electPrice = (item.electPrice / 100).toFixed(2)
                    item.nextStageBalance = (item.nextStageBalance / 100).toFixed(2)
                    item.nextStageTime = item.nextStageTime
                  }
                  // item.electPrice = (item.electPrice / 100).toFixed(4);
                  // item.nextStageBalance = (item.nextStageBalance / 100).toFixed(4);


                  gunDTO_1 = item;


                  // 1 空闲  2  充电准备 3 充电中  4 充电完成  5 离线  6 充电锁定  7  故障  8 预约  9 禁用  255 默认  国网状态 item.hasStateGrid
                  if (item.gunState == 2) {
                    pluggable_1 = true;
                  } else {
                    pluggable_1 = false
                  }
                  console.log(item.pileno.length)
                  // 中研空闲要求可以启动充电  // 创烨空闲要求可以启动充电
                  // 根据枪号判断是否可以启动充电
                  if ((app.globalData.sellerNo == 'cy') && item.pileno.length >= 10) {
                    if (item.gunState == 1) {
                      pluggable_1 = true;
                    }
                  }

                  // 双枪充电处理
                  if (that.gunDetail1.gunid) {
                    pluggable_1 = (item.gunState == 2 && that.gunDetail1.gunState == 2)
                  }

                  that.gunno = item.gunno,
                      that.isInsert = pluggable_1,
                      that.gunid = item.gunid

                  that.stationDetail = res.data.stationData,
				  console.log(that.stationDetail ,"站点数据")
                      that.stationDetail.pileName = res.data.pileName
                  that.gunDetail = gunDTO_1
                  uni.setStorageSync('chargStationInfo', JSON.stringify({
                    stationName: that.stationDetail.stationName,
                    gunName: that.gunDetail.gunName
                  }))

                  console.log(that.gunDetail, '枪详情.....')

                  if (that.gunDetail.isSuspend != null && that.gunDetail.isSuspend) {
                    that.gunDetail.gunState = 10
                  }
                  // 判断枪状态,跳转到枪状态页
                  if (that.gunDetail.gunState == 7 || that.gunDetail.gunState == 3 || that.gunDetail.gunState == 5 || that.gunDetail.gunState == 6 || that.gunDetail.gunState == 10) {
                    console.log(that, '枪状态是不正常的.........')
                    setTimeout(() => {
                      uni.redirectTo({
                        url: '../fault/fault?pileNo=' + that.pileNo + '&gunid=' + that.gunid + '&status=' + that.gunDetail.gunState + "&kycText=" + that.kycContent + "&platformNo=" + that.platformNo + "&hulianinterfaceId=" + that.hulianinterfaceId
                      });
                    })
                  }

                  // 营销获客处理
                  console.log('获取终端详情的超充标识====>终端&车.....', res.data.pileData.overchargeTermina, res.data.pileData.overchargeCar);
                  // this.getStationDiscounts(res.data.pileData.overchargeTermina, res.data.pileData.overchargeCar)

                  let terminaNum;
                  if (gunDTO_1.powerMode == 1 || gunDTO_1.powerMode == 2) {
                    terminaNum = 2;
                    // console.log('超充终端.......')
                  } else {
                    terminaNum = 3;
                    // console.log('非超充终端.......')
                  }

                  console.log(gunDTO_1, '单个终端详情gunDTO_1...................')

                  //获取站点id
                  that.setData({
                    stationId: res.data.stationId
                  });

                  //终端详情页面有营销获客活动返回时, 请求卡券及活动....
                  if (gunDTO_1.marketing) {
                    console.log(gunDTO_1.marketing, "终端详情有marketing设置~~~~~~~~~~~~")
                    // 获取终端优惠说明接口
                    that.getStationDiscounts(terminaNum, res.data.pileData.overchargeCar);
                    that.getStationCouponDetail();
                  }
                  console.log(gunDTO_1, '终端单价......');

                  console.log(that.gunDetail, 'ddddddzzzzzzzz');
					if(that.radio==6){
						that.gunDetail.nowPrice.discount=false
						that.gunDetail.nowPrice.currentServicePriceStr=that.gunDetail.nowPrice.sweepServicePriceStr
					}
                }
              });
            } else {
              // wx.navigateBack()
              //   wx.switchTab({
              //     url:'../../../../pages/index/index'
              //  })
              uni.showToast({
                title: res.msg,
                icon: 'error',
                duration: 2000
              });
            }
          });
    },

    // 获取个人信息
    getMemberInfo: function () {
      var that = this;
      return https_1.getMemberInfo().then(function (res) {
        var plateNo = '';
        if (res.data.vehicles && res.data.vehicles.length > 0) {
          res.data.vehicles.map(function (item) {
            if (item.defaultVehicle == 0) {
              plateNo = item.plateNo;
            }
          });
        }

        var data = res.data;

        if (data.accountBalance) {
          // 余额 = 余额-冻结金额-奖励金金额
          data.accountBalance = ((data.accountBalance - data.frozenAmount - data.jlAccountBalance) / 100).toFixed(2);

          if (data.accountBalance <= 0) {
            data.accountBalance = '0.00'
          }
        } else {
          data.accountBalance = '0.00';
        }

		if(data.jlAccountBalance){
			data.jlAccountBalance = (data.jlAccountBalance / 100).toFixed(2);
		} else {
			data.jlAccountBalance = '0.00';
		}
        if (data.carAccountBalance) {
          data.carAccountBalance = (data.carAccountBalance / 100).toFixed(2);
        } else {
          data.carAccountBalance = '0.00';
        }
        if (uni.getStorageSync('memberType').toString()) {
          data.memberType = uni.getStorageSync('memberType')
        } else {
          uni.setStorageSync('memberType', data.memberType)
        }
        that.plateNo = plateNo || getApp().globalData.plateNo
        that.memberInfo = data

        that.rechargeVisible1()
        if (data.memberType == 0) {

          that.getQuery(true);

        } else {

          that.getQuery();
        }
      });
    },

    goCarList: function () {
      uni.navigateTo({
        url: '/mine/pages/myCarList/myCarList?type=select'
      });
    },
    goLogin: function () {
      // #ifdef H5
      let gunDetailUrl = window.location.href
      uni.setStorageSync('gunDetailUrl', gunDetailUrl)
      // #endif
      uni.navigateTo({
        url: '/pages/login/login'
      });
    },

    closePricePopupVisible() {
      this.showPrice = false

    },

	// //账户信息
	// getAccountInfo: function () {
	//   // menberType:0个人2车队
	//   let tab = 1
	//   var that = this;
	//   https_1
	//       .getAccountInfo({
	//         tab
	//       })
	//       .then(function (res) {
	//         if (res.code == 0) {
	//           that.accountInfo = res.data
	// 		  that.accountInfo.jiangLiBalance =(that.accountInfo.jiangLiBalance/100).toFixed(2)
	//         }
	//       })

	// 	  console.log(that.accountInfo,"账号")
	// },
    // 获取支付方式
    getQuery: function (disposablePayMode) {
      let payment = []
      let that = this

		console.log(that.pileNo,"桩号----------")
	https_1.queryList({disposablePayMode: disposablePayMode,pileNo: that.pileNo} ).then(function (res) {
        payment = res.data.sort(function (a, b) {
          return a.sortNum - b.sortNum;
        });
        payment.map(function (item) {
          item.payType = String(item.payType);
          if (item.payType == 1) {
            item.value = that.memberInfo.accountBalance;
          } else if (item.payType == 2) {
            item.value = that.memberInfo.carAccountBalance;
          }else if(item.payType==6){
			   item.value = that.memberInfo.jlAccountBalance;
			   // that.radio= '6'
		  }

          return item;
        });
        if (that.memberInfo.memberType == 1 || that.memberInfo.memberType === 2) {
          that.radio = '2'
        } else if (that.memberInfo.memberType == 0 && disposablePayMode) {
          that.radio = '6'

		  var cardBo=false;
		  var accBo=false;
		  var cwjtBo=false;


		  for(var ii=0;ii<payment.length;ii++){
		    // console.log(that.payType == item1.payType, that.payType, item1.payType)
			if(payment[ii].value && payment[ii].value > 0 && payment[ii].payType=='6'){
				cardBo=true;
				break;
			}
		  }
		  for(var ii=0;ii<payment.length;ii++){
		    // console.log(that.payType == item1.payType, that.payType, item1.payType)
		  			if(payment[ii].payType=='1' && payment[ii].value > 0 && !cardBo){
		  				accBo=true;
		  				break;
		  			}
		  }
		  for(var ii=0;ii<payment.length;ii++){
		    // console.log(that.payType == item1.payType, that.payType, item1.payType)
		  	if(payment[ii].accountName == '充完即退' && !cardBo && ! accBo){
		  				cwjtBo=true;
		  				break;
			}
		  }



		  for(var i=0;i<payment.length;i++){
			  if (cardBo && payment[i].payType=='6') {
			    that.radio = '6'
			    that.gunDetail.nowPrice.discount=false
			    if(10 > payment[i].value){
			    uni.showModal({
			      title: '温馨提示',
			      content: `电卡余额低于10元，系统将会在余额过低时停止充电，请及时充值`,
			      confirmText: '去充值',
			      cancelText: '知道了',
			      confirmColor: that.objColor2.textColor,
			      success: function (r) {
			        if (r.confirm) {

			          uni.navigateTo({
			            url: '/mine/pages/vouchers/vouchers'
			          })
			        } else if (r.cancel) {
			          return false
			        }
			      }
			    })
			    }
			  } else if (payment[i].accountName == '充完即退' &&cwjtBo) {
			    that.radio = '-1'
			  } else if(accBo && payment[i].payType=='1'){
				  that.payType= '1'
			    that.radio = '1'
			  }
		  }
   //        payment.forEach(function (item, index) {
   //          if (item.accountName == '充完即退') {
   //            that.radio = '-1'
			//   return;
   //          }

   //          if (item.value && item.value > 0 &&  item.payType==6) {
   //            that.radio = '6'
			//   that.gunDetail.nowPrice.discount=false

			//   if(10 > item.value){


			//   uni.showModal({
			//     title: '温馨提示',
			//     content: `电卡余额低于10元`,
			//     confirmText: '去充值',
			//     cancelText: '知道了',
			//     confirmColor: that.objColor2.textColor,
			//     success: function (r) {
			//       if (r.confirm) {

			//         uni.navigateTo({
			//           url: '/mine/pages/vouchers/vouchers'
			//         })
			//       } else if (r.cancel) {
			//         return false
			//       }
			//     }
			//   })
			//   }

   //          }else if(item.value && item.value > 0 &&  item.payType==1){
			//   that.radio = '1'
			// }
   //        })

        } else {
          that.radio = '1'
        }
        that.payment = payment


        // that.payType=payment[0].payType
        if (that.radio != '-1') {
          let index = payment.findIndex((item1) => {
            console.log(that.payType == item1.payType, that.payType, item1.payType)
            return that.payType == item1.payType
          })
		 if(index>0){
			 that.customPrice = that.payment[index].value
		 }else{
			 that.customPrice = that.payment[0].value
		 }

        }
        // 账号余额大于等于100元时默认选择100，小于100默认全部余额
        if (that.customPrice >= 200) {
          that.priceType = -1
          that.customPrice = 200
        } else {
          that.priceType = 3
        }


        if (that.radio === '-1') {
          that.customPrice = '50'
        }
        console.log("对的", that.priceType, that.customPrice)

        // #ifdef APP-PLUS
        // APP隐藏支付分
        // that.payment = that.payment.filter(item=>{
        // 	return item.payType !=-2
        // })
        // #endif

        // #ifdef H5
        // H5隐藏支付分
        that.payment = that.payment.filter(item => {
          return item.payType != -2
        })
        // #endif
        // 双枪处理
        // if(that.gunDetail1.gunid){
        // 	that.payment = that.payment.filter(item=>{
        // 		return item.payType == 1
        // 	})
        // }
        that.minimumAmount();
      })
    },

    //价格弹窗
    pricePopupVisible: function (e, _dataset) {
      /* ---处理dataset begin--- */
      this.datasetHandle(e, _dataset);
      /* ---处理dataset end--- */
      var that = this;
      var type = e.currentTarget.dataset.type;

      var gunid = this.gunid;

      if (type === 'open') {
        this.getStationGunPriceDetail(gunid);

        // https_1
        // 	.queryElectPriceDatil({
        // 		stationId: that.stationDetail.stationId,
        // 		gunId: gunid
        // 	})
        // 	.then(function (res) {
        // 		var pileList = []
        //
        // 		if(Number(that.radio)==2){
        // 			if(res.data.ContractPilelist.length){
        // 				pileList =  res.data.ContractPilelist;
        // 			}else{
        // 				pileList =  res.data.Pilelist;
        // 			}
        //
        // 		}else{
        // 			pileList =  res.data.Pilelist;
        // 		}
        //
        // 		if (pileList.length === 0) {
        // 			that.dataShow=false,
        // 				that.tips='暂无数据~'
        // 			return;
        // 		}
        //
        // 		var priceList = [];
        // 		pileList.forEach(function (pile) {
        // 			pile.chargingStage.forEach(function (item, index) {
        // 				if (index === pile.chargingStage.length - 1) {
        // 					item.timeStr = item.time + '-24:00';
        // 				} else {
        // 					item.timeStr = item.time + '-' + pile.chargingStage[index + 1].time;
        // 				}
        //
        // 				item.powerprice = item.powerprice.replace(/:/g, '：').replace(',', ' | ');
        // 				item.stageText = that.jfpg(item.stageEnum).text;
        // 				item.stageStyle = that.jfpg(item.stageEnum).style;
        // 				item.stageIcon = that.jfpg(item.stageEnum).icon;
        // 				item.totalPrice = that.calculation(item.powerprice);
        // 				priceList.push(item);
        // 			});
        // 		});
        // 		that.priceList=priceList,
        // 			that.showPrice=true
        // 	});
      } else {
        this.showPrice = false
      }
    },

    // 尖峰平谷
    jfpg: function (jfpg) {
      var text = '';
      var style = '';
      var icon = '';
      switch (jfpg) {
        case 'Jian':
          text = '尖';
          style = 'jian';
          icon = 'https://oos-cn.ctyunapi.cn/front-end/static/homeSub/images/tip.png';
          break;

        case 'Feng':
          text = '峰';
          style = 'feng';
          icon = 'https://oos-cn.ctyunapi.cn/front-end/static/homeSub/images/peak.png';
          break;

        case 'Ping':
          text = '平';
          style = 'ping';
          icon = 'https://oos-cn.ctyunapi.cn/front-end/static/homeSub/images/flat.png';
          break;

        case 'Gu':
          text = '谷';
          style = 'gu';
          icon = 'https://oos-cn.ctyunapi.cn/front-end/static/homeSub/images/valley.png';
          break;

        default:
          break;
      }

      return {
        text: text,
        style: style,
        icon: icon
      };
    },

    // 计算总价
    calculation: function (str) {
      var numArr = str.match(/\d+\.?\d*/g) || [];
      var totalPrice = 0;
      numArr.forEach(function (item) {
        totalPrice += Number(item);
      });
      return totalPrice.toFixed(4);
    },

    //充值弹窗
    rechargeVisible: function (e) {
      // #ifdef H5
      let gunDetailUrl = window.location.href
      uni.setStorageSync('gunDetailUrl', gunDetailUrl)
      // #endif

      uni.showModal({
        title: '是否充值到个人账户',
        content: '注：未使用完的金额会保留在超易充小程序个人账户中，需要退款请在超易充小程序-账户金额中申请退款',
        confirmText: '确认',
        cancelText: '不想充了',
        confirmColor: this.objColor2.textColor,
        success: function (r) {
          if (r.confirm) {
            uni.navigateTo({
              url: '/mine/pages/recharge/recharge'
            })
          }
        }
      })
    },
    rechargeVisible1() {
      this.showRecharge = false
    },
    disposableVisible: function (e) {
      this.showDisposable = true

    },
    disposableVisible1() {
      this.showDisposable = false
    },

    //立即充值
    toCharge: function () {
      var that = this;
      uni.showLoading({
        title: '提交中...',
        mask: true
      });
      var chargePrice = 0;

      if (that.customRechargePrice !== '' && that.customRechargePrice > 0) {
        chargePrice = that.customRechargePrice * 100;
      } else if (that.rechargeIndex !== -1) {
        chargePrice = that.priceTypeList[that.rechargeIndex] * 100;
      } else {
        uni.showToast({
          title: '请选择充值金额',
          icon: 'none'
        });
        return false;
      }
      let type = 'JSAPI'
      //#ifdef APP-PLUS
      type = 'APP'
      //#endif
      https_1
          .unifiedOrder({
            openId: uni.getStorageSync('openid'),
            totalFee: chargePrice,
            tradeType: type // 交易类型：JSAPI -JSAPI支付 NATIVE -Native支付 APP -APP支付
          })
          .then(function (res) {
            if (res.code == 0) {
              //微信
              //#ifdef MP-WEIXIN
              var getpar = {
                timeStamp: res.data.timeStamp,
                nonceStr: res.data.nonceStr,
                package: res.data.package,
                paySign: res.data.sign,
                orderNo: res.data.orderNo
              };
              //#endif
              //APP
              //#ifdef APP-PLUS
              console.log("进入app充值", res.data)
              var getpar = {
                "appid": res.data.appid, // 微信开放平台 - 应用 - AppId，注意和微信小程序、公众号 AppId 可能不一致
                "noncestr": res.data.noncestr, // 随机字符串
                "package": res.data.package, // 固定值
                "partnerid": res.data.partnerid, // 微信支付商户号
                "prepayid": res.data.prepayid, // 统一下单订单号
                "timestamp": res.data.timestamp, // 时间戳（单位：秒）
                "sign": res.data.sign // 签名，这里用的 MD5/RSA 签名
              };
              //#endif
              that.orderNo = res.data.orderNo
              that.gopay(getpar);
            }

            uni.hideLoading();
          })
          ['catch'](function (res) {
        uni.hideLoading();
        uni.showModal({
          title: '充值失败',
          content: res.msg || '服务异常',
          showCancel: false
        });
      });
    },

    //调起支付
    gopay: function (data) {
      var that = this;

      //#ifdef APP-PLUS
      //APP
      var _data = JSON.stringify(data)
      uni.requestPayment({
        provider: 'wxpay',
        orderInfo: _data, //微信、支付宝订单数据 【注意微信的订单信息，键值应该全部是小写，不能采用驼峰命名】
        success: function (res) {
          that.getUserMoney(data.orderNo);
          console.log('success:' + JSON.stringify(res));
        },
        fail: function (err) {
          uni.showModal({
            title: '消息提示',
            content: '充值失败',
            showCancel: false
          });
        }
      });
      //#endif

      //微信小程序
      //#ifdef MP-WEIXIN
      uni.requestPayment({
        timeStamp: data.timeStamp + '',
        nonceStr: data.nonceStr,
        package: data.package,
        signType: 'MD5',
        paySign: data.paySign,
        success: function () {
          that.getUserMoney(data.orderNo);
        },
        fail: function () {
          uni.showModal({
            title: '消息提示',
            content: '充值失败',
            showCancel: false
          });
        }
      });
      //#endif
    },

    //查询充值结果
    getUserMoney: function (orderNo) {
      var that = this;
      uni.showLoading({
        title: '查询余额...',
        mask: true
      });
      https_1
          .orderQuery({
            orderNo: orderNo
          })
          .then(function () {
            uni.showModal({
              title: '消息提示',
              content: '充值成功',
              showCancel: false
            });
            that.getMemberInfo();
            uni.hideLoading();
          });
    },
    //查询用户身份
    getUserType: function () {
      https_1
          .getUserType().then((res) => {
        console.log(res)
        if (res.data && res.data.length > 1) {
          this.isChange = true
        } else {
          this.isChange = false
        }
      });
    },

    //选择支付方式
    onChange: function (paytype) {
      this.recharge = {
        text: '',
        value: false
      }
      this.payType = paytype
      this.radio = paytype
      // 车队切换支付方式不重置
      if (paytype < 2) {
        this.customPrice = ''
      }
      if (paytype == 1) {
        this.priceType = 0
      }
      //  只有微信支付分才调用这个接口
      else if (paytype == -2) {
        // this.currentTemplateId()
      } else {
        this.priceType = -1
      }
      let index = this.payment.findIndex((item) => {
        return paytype == item.payType
      })
      if (this.radio == 1) {
        this.setData({
          priceType: 3,
          customPrice: this.payment[index].value,

        })
        this.minimumAmount();
      }
	  if(this.radio==6){
		  this.gunDetail.nowPrice.discount=false
		  // if(0>=this.accountInfo.jiangLiBalance){
			 //  this.cardChong=false
		  // }
		  this.setData({
		    priceType: 3,
		    customPrice: this.payment[index].value,

		  })

		  if(10 > this.payment[index].value){


		  uni.showModal({
		    title: '温馨提示',
		    content: `电卡余额低于10元`,
		    confirmText: '去充值',
		    cancelText: '知道了',
		    confirmColor: this.objColor2.textColor,
		    success: function (r) {
		      if (r.confirm) {

		        uni.navigateTo({
		          url: '/mine/pages/vouchers/vouchers'
		        })
		      } else if (r.cancel) {
		        return false
		      }
		    }
		  })
		  }

		  this.minimumAmount();
		  console.log("选择电卡支付")
	  }

      if (this.radio == -1) {

        this.customPrice = '50'
      }


      this.getPileDTOByNo()

    },

    //选择设置充电上限
    checkPriceType: function (e) {
      this.priceType = e.currentTarget.dataset.index,
          this.customPrice = ''
      if (e.currentTarget.dataset.index == 3) {
        let index = this.payment.findIndex((item) => {
          return this.payType == item.payType
        })
        this.setData({
          priceType: 3,
          customPrice: this.payment[index].value
        })
      } else {
        this.setData({
          customPrice: this.priceTypeList[e.currentTarget.dataset.index]
        })
      }
      this.minimumAmount();
    },

    //选择充值金额
    checkRechargePrice: function (e) {
      this.rechargeIndex = e.currentTarget.dataset.index,
          this.customRechargePrice = ''
    },

    //输入时触发（自定义设置充电上限）
    getCustomPrice: function (e) {
      this.priceType = -1,
          this.customPrice = e.detail.value
      this.minimumAmount();
    },

    //输入时触发（自定义充值金额）
    getCustomRechargePrice: function (e) {
      this.rechargeIndex = -1,
          this.customRechargePrice = e.detail.value
    },

    // 刷新
    refresh: function () {
      uni.showLoading({
        title: '刷新中...',
        mask: true
      });
      Promise.all([this.getPileDTOByNo(), this.getMemberInfo()]);
      uni.hideLoading();
    },
    // 启动充电防抖
    whetherChargeFd() {
    let that = this
    let memberType = uni.getStorageSync('memberType');
    if (memberType != null && memberType != 2) {
     const tmplIds = ['yF5qdhZcRAgPaxCDj9sJJAe1qoegEnum2jWJt6dByxE',
     'tzisBi10YnTjlze5A1DDsjV2tuiYLfA-FSAp6s7W0ps','41VKKT4Zs_zFPuV9FwgqILW-tBNiDQT3JVW44KBVANI']; // 替换为实际的模板 ID
	//const tmplIds = ['8l9IZaRJxnf2mzgbuxynLtU2DQ32451S2Ni2GjnRYns']; // 替换为实际的模板 ID
    	uni.requestSubscribeMessage({
    		tmplIds: tmplIds,
    		uccess(res) {
    		console.log('订阅成功', res);
    			},fail(err) {
				console.log('订阅失败', err);
    		},
    		complete(e) {
    		debounce.use(function() {
    		that.whetherCharge2()
    		}, 1000)();
    		}});
    		} else {
    			debounce.use(function() {
    			that.whetherCharge2()
    		}, 1000)();
    	}
    },
    // 判断是否满足充电要求 --- 道闸提醒等判断
    whetherCharge2() {

      let that = this
      console.log(this.isInsert, '54545')
      const pattern = /^\d+(\.\d{1,2})?$/;
      if (this.radio < 2 && !pattern.test(this.customPrice)) {
        uni.showModal({
          title: '提示',
          content: '请检查预充金额，最多小数点后两位',
          showCancel: false,
        })
        return
      }

      if (this.placeholdOrderCount) {
        uni.showModal({
          title: '温馨提示',
          content: `当前账号存在${this.placeholdOrderCount}笔未支付超时占位订单费用，请先完成支付再进行充电`,
          confirmText: '立即处理',
          cancelText: '暂不处理',
          confirmColor: that.objColor2.textColor,
          success: function (r) {
            if (r.confirm) {
              uni.navigateTo({
                url: '/orderSub/pages/placeholderOrderDetail/placeholderOrderDetail?id=' + that.placeholdOrderDetail.id
              })
            } else if (r.cancel) {
              return false
            }
          }
        })
        return
      }


      if (that.isInsert && !that.recharge.value) {
        //是否开启道闸
        if (that.stationDetail.openBarrier === '1') {
          console.log(1, that.memberInfo)
          if (that.memberInfo.vehicles && that.memberInfo.vehicles.length > 0) {
            console.log(2)
            let url = '请核实确认当前充电车辆是否为：' + that.plateNo + '，车辆信息错误将导致无法享受停车费优惠活动。'
            // #ifdef MP-WEIXIN
            url = '请核实确认当前充电车辆是否为：' + that.plateNo + '，车辆信息错误将导致无法享受停车费优惠活动。'
            // #endif
            uni.showModal({
              title: '温馨提示',
              content: url,
              confirmText: '确认无误',
              cancelText: '选择车辆',
              confirmColor: that.objColor2.textColor,
              success: function (r) {
                if (r.confirm) {
                  that.whetherCharge();
                } else if (r.cancel) {
                  that.goCarList()
                }
              }
            })
          } else {
            let url = '您没有选择充电车辆，这样将无法享受停车费优惠活动。'
            // #ifdef MP-WEIXIN
            url = '您没有选择充电车辆，这样将\n无法享受停车费优惠活动。'
            // #endif
            uni.showModal({
              title: '温馨提示',
              content: url,
              confirmText: '绑定车辆',
              cancelText: '暂不绑定',
              confirmColor: that.objColor2.textColor,
              success: function (r) {
                if (r.confirm) {
                  that.goCarList()
                } else if (r.cancel) {
                  return false
                }
              }
            })

          }
        } else {
          //是否开启强制绑定车辆
          if (that.stationDetail.isCarPlate) {
            if (!(that.memberInfo.vehicles && that.memberInfo.vehicles.length)) {
              uni.showModal({
                title: '温馨提示',
                content: '请先绑定车辆信息再启动充电，否则无法享受充电减免停场优惠！',
                confirmText: '绑定车辆',
                cancelText: '暂不绑定',
                confirmColor: that.objColor2.textColor,
                success: function (r) {
                  if (r.confirm) {
                    that.goCarList()
                  } else if (r.cancel) {
                    return false
                  }
                }
              })
            } else {
              that.whetherCharge();
            }
          } else {
            //是否开启提醒
            if (that.stationDetail.warnCarPlate) {
              if (!(that.memberInfo.vehicles && that.memberInfo.vehicles.length)) {
                uni.showModal({
                  title: '温馨提示',
                  content: '请先绑定车辆信息再启动充电，否则无法享受充电减免停场优惠！',
                  confirmText: '绑定车辆',
                  cancelText: '暂不绑定',
                  confirmColor: that.objColor2.textColor,
                  success: function (r) {
                    if (r.confirm) {
                      that.goCarList()
                    } else if (r.cancel) {
                      that.whetherCharge();
                    }
                  }
                })
              } else {
                that.whetherCharge();
              }
            } else {
              that.whetherCharge();
            }
          }
        }
      } else {
        uni.showModal({
          title: '消息提示',
          content: that.recharge.text,
          showCancel: false
        })
      }


    },

    //登录启动充电
    whetherCharge3() {
      uni.showModal({
        title: '温馨提示',
        content: '请先完成登录后再启动充电。',
        confirmText: '登录',
        success: (res) => {
          if (res.confirm) {
            // #ifdef H5
            let gunDetailUrl = window.location.href
            uni.setStorageSync('gunDetailUrl', gunDetailUrl)
            // #endif
            uni.navigateTo({
              url: '/pages/login/login'
            });
          }

        }
      });
    },

    // 判断是否满足充电要求
    whetherCharge() {
      let that = this

      https_1.querChargeRealy({
        pileNo: this.pileNo,
        gunNo: this.gunno,
        platformNo: that.platformNo || null,
        hulianinterfaceId: that.hulianinterfaceId || null,
      }).then(function (res) {
		console.log(res,"启动充电前")
        if (res.code == 0) {
          if (res.data.flag) {
            //判断个人还是车队,如何是车队
            https_1.querMemberStatus().then(async (res) => {
              if (res.code == 0) {
                console.log(res, '00000000')
                if (res.data.ifCharging) {
                  // 在充电
                  uni.showModal({
                    title: '消息提示',
                    content: '您当前正在充电',
                    confirmText: '充电详情',
                    confirmColor: that.objColor2.textColor,
                    success: function (r) {
                      if (r.confirm) {
                        // 查看充电详情
                        uni.navigateTo({
                          url: `/echartsPages/pages/power/power?busId=${res.data.billList[0].busId}&pileNo=${res.data.billList[0].pileNo}&gunNo=${res.data.billList[0].gunNo}`
                        })
                      }
                    }
                  })
                } else {
                  console.log('2222222')
                  if (that.radio == '-1') {
                    console.log('----11')
                    await that.minimumAmount()

                    if (!that.unifiedOrderStstus) {
                      // that.requestSubscribeMessage(()=>{
                      that.disposableStartCharge()
                      // })
                    }
                  } else if (that.radio == '-2') {
                    console.log('----22')
                    if (!that.unifiedOrderStstus) {
                      that.requestSubscribeMessage(() => {
                        that.disposableStartChargeZhifuFen()
                      })
                    }
                  } else {
                    await that.minimumAmount()
                    console.log('----1222')
                    // that.requestSubscribeMessage(()=>{
                    that.openCharge()
                    // })
                  }
                }
              } else {
                uni.showModal({
                  title: '提示',
                  content: res.msg ? res.msg : `启动失败`,
                  showCancel: false,
                  confirmText: '关闭',
                  confirmColor: that.objColor2.textColor,
                })
              }
            })
          } else {
            uni.showModal({
              title: '信息提示',
              content: res.data.msg ? res.data.msg : `启动失败`,
              showCancel: false,
            })
            that.refresh()
            // setTimeout(() => {
            // wx.navigateBack()
            // }, 2000)
          }
        } else {
          uni.showModal({
            title: '信息提示',
            content: res.msg ? res.msg : `鉴权失败`,
            showCancel: false,
          })
        }
      }).catch(err => {
        uni.showModal({
          title: '信息提示',
          content: err.msg ? err.msg : '启动异常，请退出重试',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              uni.navigateBack()
            }
          }
        });
      })
    },
    // 最低充值金额
    minimumAmount: function () {
      return new Promise((resolve, reject) => {

        let that = this
        console.log("minimumAmount方法", that.radio)
        https_1.getMinimumStartBalance().then(async (res) => {

          var payment = 0;
          that.payment.map(function (item) {
            if (item.payType == that.radio) {
              payment = item.value;
            }
          });
          console.log(that.memberInfo.memberType)
          console.log(Number(payment))
          console.log(that.customPrice)
          let configurationValue = Number((Number(res.data.configurationValue) / 100).toFixed(2))
          if (that.memberInfo.memberType) {
            console.log('车队')
          } else {
            console.log('个人')
          }
          if ((that.customPrice > Number(payment)) && !that.memberInfo.memberType) {
            that.recharge = {
              text: '预设充电上限不能大于账户余额',
              value: true
            }
          } else {
            if (configurationValue <= Number(payment)) {
              that.recharge = {
                text: '',
                value: false
              }
            }
            if (configurationValue <= that.customPrice && that.radio == '-1') {
              that.recharge = {
                text: '',
                value: false
              }
            }
            // else {
            // 	that.recharge={
            // 		text: '余额低于最低启动充电余额',
            // 		value: false
            // 	}
            // }
          }
          if (that.customPrice < configurationValue && !that.memberInfo.memberType && (that.radio == '1'|| that.radio == '6')) {
            console.log(that.radio, this.radio, that.customPrice <= 0, "余额不足", !that.memberInfo.memberType, that.radio == '1')
            if (Number(payment) < configurationValue) {
              that.recharge = {
                text: '余额不足',
                value: true
              }
            } else {
              that.recharge = {
                text: '预设充电金额小于最低启动额',
                value: true
              }
            }
          }
          if (that.customPrice < configurationValue && !that.memberInfo.memberType && that.radio == '-1') {
            console.log(that.customPrice <= 0, "充值金额不能低于最低启动充电余额", that.customPrice <= 0 && !that.memberInfo.memberType && that.radio == '-1')
            that.recharge = {
              text: '充值金额不能低于最低启动充电金额',
              value: true
            }
          }
          // if (
          // 	Number(payment) >= Number(that.customPrice != '' ? that.customPrice : that.priceTypeList[that.priceType] ? that.priceTypeList[that.priceType] : 0)
          // ) {
          // 	if (Number((Number(res.data.configurationValue) / 100).toFixed(2)) <= Number(payment)) {
          // 		that.recharge={
          // 			text: '',
          // 			value: false
          // 		}
          // 	} else {
          // 		that.recharge={
          // 			text: '余额低于最低启动充电余额',
          // 			value: true
          // 		}
          // 	}
          // } else {
          // 	that.recharge={
          // 		text: '充电上限不能大于账户余额',
          // 		value: true
          // 	}
          // }
          resolve('');

        })

      })

    },


    // 开启充电
    // openCharge: function () {
    // 	console.log(this.recharge.value)
    // 	if (!this.recharge.value) {
    // 		var str = {
    // 			pileNo: this.pileNo,
    // 			gunNo: this.gunno,
    // 			chargeMode: 0, // app充电模式(1自动模式,2金额模式,3时间模式,4电量模式)
    // 			valtageType: 0, //辅助电源参数
    // 			carNum: this.plateNo, //车牌号
    // 			payMode: Number(this.radio), //支付方式
    // 			qrCode: this.qrCode,
    // 			preChargeAmount: Number(this.customPrice != '' ? this.customPrice : this.priceTypeList[this.priceType] ? this.priceTypeList[this.priceType] : 0) //预冲金额
    // 		};
    // 		// console.log(this.payType)
    // 		// if(this.payType == 2){
    // 		// 	delete str.preChargeAmount
    // 		//   }else{
    // 		// 	str.preChargeAmount = str.preChargeAmount
    // 		//   }

    // 		if(this.memberInfo.memberType){
    // 			str.payMode = 2
    // 			delete str.preChargeAmount
    // 		}else{
    // 			str.payMode = 1
    // 			str.preChargeAmount = str.preChargeAmount
    // 		}
    // 		console.log(JSON.stringify(str),'999999999')
    // 		uni.navigateTo({
    // 			url: '../../../../homeSub/pages/startCharging/startCharging?parameter=' + JSON.stringify(str)
    // 		});
    // 	}
    // },
    openCharge: function () {
      let that = this
      console.log(this.recharge.value)
      if (!this.recharge.value) {
        var str = {
          pileNo: this.pileNo,
          gunNo: this.gunno,
          gunNo1: this.gunDetail1.gunno,
          isParallelCharge: this.gunDetail1.gunid ? 1 : 0,
          chargeMode: 0, // app充电模式(1自动模式,2金额模式,3时间模式,4电量模式)
          valtageType: 0, //辅助电源参数
          carNum: this.plateNo, //车牌号
          payMode: Number(this.radio), //支付方式
          qrCode: this.qrCode,
          preChargeAmount: Number(this.customPrice != '' ? this.customPrice : this.priceTypeList[this.priceType] ? this.priceTypeList[this.priceType] : 0), //预冲金额
          platformNo: that.platformNo || null,
          hulianinterfaceId: that.hulianinterfaceId || null,
        };
        // console.log(this.payType)
        // if(this.payType == 2){
        // 	delete str.preChargeAmount
        //   }else{
        // 	str.preChargeAmount = str.preChargeAmount
        //   }
		console.log(str)
		if(Number(this.radio)!=6){


        if (this.memberInfo.memberType) {
          str.payMode = 2

          // 车队充电不传自定义金额
          // 国网要传车队余额
          if (this.hasStateGrid == 1) {
            str.preChargeAmount = Number(this.memberInfo.carAccountBalance)
          } else {
            delete str.preChargeAmount
          }
        } else {
          str.payMode = 1
          str.preChargeAmount = str.preChargeAmount
        }

        // 储值卡支付
        if (Number(this.radio) === 5) {

          str.payMode = 5
          const target = this.memberInfo.vehicles.length > 0 && this.memberInfo.vehicles.find((item) => item.plateNo === this.plateNo)
          str.vin = target?.vin
          str.storeCardNum = target?.storedCard
        }

		}else{
			 str.preChargeAmount = str.preChargeAmount
		}
        console.log(JSON.stringify(str), '999999999')
        uni.navigateTo({
          url: '../../../../homeSub/pages/startCharging/startCharging?parameter=' + JSON.stringify(str)
        });
      }
    },
    // 唤醒模板消息
    requestSubscribeMessage(fn) {
      let that = this
      // #ifdef MP-WEIXIN
      wx.requestSubscribeMessage({
        tmplIds: app.globalData.tmplIds || [],
        complete() {
          console.log('订阅消息回调')
        }
      })
      fn()
      // #endif


      // #ifndef MP-WEIXIN
      fn()
      // #endif

    },
    convertObj(data) {
      var _result = [];
      for (var key in data) {
        var value = data[key];
        if (value.constructor == Array) {
          value.forEach(function (_value) {
            _result.push(key + "=" + _value);
          });
        } else {
          _result.push(key + '=' + value);
        }
      }
      return _result.join('&');
    },
    // 唤醒微信支付分
    openBusinessView(extraData) {
      let that = this
      // 默认小程序
      let appType = that.appType

      // #ifdef APP-PLUS
      console.log('走到这里了000000000000000000000000000000000000000000000000000000000000000000000000000000000', extraData.query)
      KJOpenBusinessView.jx_requestWithData({
            'businessType': 'wxpayScoreUse',
            'query': extraData.query,
            'extInfo': '{\"miniProgramType\":0}'
          },
          (res) => {
            console.log('支付结果', res, '支付结果')
            if (res.errCode == 0 && res.extMsg) {
              res.extMsg = res.extMsg || {}
              that.queryWxOrder(res.extMsg.query_id, extraData.busId)
            } else {
              getApp().hideLoading()
              uni.showModal({
                title: '温馨提示',
                content: res.errStr
              });
            }

          }
      );
      console.log('完毕')

      // KJOpenBusinessView.auth({
      // 	"businessType":"wxpayScoreUse",
      // 	"query":`mch_id=${extraData1.mch_id}&package=${extraData1.package}&timestamp=${extraData1.timestamp}&nonce_str=${extraData1.nonce_str}&sign_type=${extraData1.sign_type}&sign=${extraData1.sign}`,
      // }, (res) => {
      // 	console.log('走到这里了吗')
      // 	if (res.code === 0) {
      // 		uni.showToast({
      // 			title: '微信授权成功',
      // 		})
      // 	} else {
      // 		uni.showToast({
      // 			title: '授权失败',
      // 		})
      // 	}
      // })
      return
      // #endif
      if (wx.openBusinessView) {
        wx.openBusinessView({
          businessType: 'wxpayScoreUse',
          extraData,
          success(res) {
            console.log(res, '唤醒支付分成功')
            if (res.errCode == 0 && res.extraData) {
              console.log('支付分回调成功', res.extraData.query_id)
              let query_id = res.extraData.query_id
              that.queryWxOrder(query_id, extraData.busId)
            }
            //dosomething
          },
          fail(err) {
            console.log(err, '唤醒支付分失败')
            uni.showToast({
              title: '支付分唤醒失败',
              icon: 'none'
            })
            //dosomething
          },
          complete() {
            getApp().hideLoading()
            //dosomething
          }
        });
      } else {
        //引导用户升级微信版本
      }

    },
    queryWxOrder(query_id, busId) {
      let that = this
      if (query_id) {
        queryWxOrder({
          queryId: query_id,
          sellerId: getApp().globalData.sellerId,
          appType: that.appType
        }).then(res => {
          getApp().hideLoading()
          console.log('检测支付分唤醒成功后订单状态', res)
          if (res.data == 'DOING') {
            console.log('这里应该启动充电啦啊啦啦')
            that.zhiFuFenChong(busId)

          } else {
            const msgObj = {
              CREATED: '商户已创建服务订单',
              REVOKED: '商户取消服务订单',
              EXPIRED: '服务订单已失效'
            }
            console.log(msgObj[res.data])
            uni.showToast({
              title: '支付失败',
              icon: 'none'
            })
          }
          that.unifiedOrderStstus = false
        })

      } else {
        getApp().hideLoading()
        that.unifiedOrderStstus = false
        uni.showToast({
          title: '取消支付',
          icon: 'none'
        })
      }
    },
    zhiFuFenChong(orderNumber) {
      let that = this
      var str = {
        orderNumber,
        pileNo: that.pileNo,
        gunNo: that.gunno,
        gunNo1: this.gunDetail1.gunno,
        isParallelCharge: this.gunDetail1.gunid ? 1 : 0,
        chargeMode: 0, // app充电模式(1自动模式,2金额模式,3时间模式,4电量模式)
        valtageType: 0, //辅助电源参数
        carNum: that.plateNo, //车牌号
        payMode: 3, //支付方式
        qrCode: that.qrCode,
        preChargeAmount: Number(that.customPrice != '' ? that.customPrice : 0), //预冲金额
        isZhiFuFen: true,//支付分支付
      };
      console.log(JSON.stringify(str), '支付分支付启动充电')
      // getApp().globalData.referrerInfo = null
      uni.navigateTo({
        url: '../../../../homeSub/pages/startCharging/startCharging?parameter=' + JSON.stringify(str)
      });


    },
    //启动充电-支付分
    disposableStartChargeZhifuFen: function () {
      if (!this.customPrice) {
        return uni.showToast({
          title: '请输入预充金额',
          icon: "none",
          duration: 2000,
        })
      }
      console.log('执行支付分')
      var that = this
      if (!this.recharge.value) {
        that.unifiedOrderStstus = true
        let appType = that.appType
        var str = {
          appType,
          pileNo: this.pileNo,
          gunNo: this.gunno,
          chargeMode: 0, // app充电模式(1自动模式,2金额模式,3时间模式,4电量模式)
          valtageType: 0, //辅助电源参数
          carNum: this.plateNo, //车牌号
          payMode: 3, //支付方式
          qrCode: this.qrCode,
          preChargeAmount: Number(this.customPrice != '' ? this.customPrice : 0) //预冲金额
        };
        // if(start){
        // 	str.busId = that.zhiFuFenBusId
        // }
        console.log('微信支付分入参', str)
        getApp().showLoading({title: '支付中'})
        https_1.disposableStartCharge(str)
            .then(function (res) {
              console.log(res, '获取到的支付分配置拉')
              if (res.code == 0) {

                that.zhiFuFenBusId = res.data.busId
                that.openBusinessView(res.data)
                // openBusinessView
                // that.disposableUnifiedOrders()
              } else {
                getApp().hideLoading()
                uni.showModal({
                  title: '信息提示',
                  content: res.msg || '启动异常，请退出重试',
                  showCancel: false,
                });
                that.unifiedOrderStstus = false
              }
            })
      }
    },
    //启动充电-充完即退-微信支付前校验
    disposableStartCharge: function () {
      var that = this
      if (!this.recharge.value) {
        that.unifiedOrderStstus = true
        var str = {
          pileNo: this.pileNo,
          gunNo: this.gunno,
          chargeMode: 0, // app充电模式(1自动模式,2金额模式,3时间模式,4电量模式)
          valtageType: 0, //辅助电源参数
          carNum: this.plateNo, //车牌号
          payMode: 1, //支付方式
          qrCode: this.qrCode,
          preChargeAmount: Number(this.customPrice != '' ? this.customPrice : 0) //预冲金额
        };


        https_1.disposableStartCharge(str)
            .then(function (res) {
              if (res.code == 0) {
                that.disposableUnifiedOrders()
              } else {
                uni.showModal({
                  title: '信息提示',
                  content: res.msg || '启动异常，请退出重试',
                  showCancel: false,
                  success: function (res) {
                    if (res.confirm) {
                      uni.navigateBack()
                    }
                  }
                });
              }
            })
      }
    },
    //启动充电-充完即退-微信预下单
    disposableUnifiedOrders: function () {
      var that = this;
      uni.showLoading({
        title: '提交中...',
        mask: true
      });
      let lockWxPay = null

      let tradeType = null

      let payChannel = null

      // #ifdef MP-WEIXIN
      tradeType = 'JSAPI'
      // #endif

      // #ifdef APP-PLUS
      tradeType = 'APP'
      lockWxPay = 1
      // #endif


      // #ifdef H5
      tradeType = 'JSAPI'
      if (that.sellerPayConfigBySellerId.isUseJHPay) {
        tradeType = 'JH'
        payChannel = 'wx_lite'
      }
      lockWxPay = null
      // #endif


      let openId = uni.getStorageSync('openId')

      if (that.isnylH5()) {
        openId = uni.getStorageSync('nylOpenId')
      }

      // let
      https_1
          .disposableUnifiedOrders({
            openId,
            gunId: that.gunDetail.gunid,
            totalFee: that.customPrice * 100,
            tradeType, // 交易类型：JSAPI -JSAPI支付 NATIVE -Native支付 APP -APP支付
            lockWxPay,
            payChannel,
            stationId: that.stationDetail.stationId
          })
          .then(function (res) {
            if (res.code == 0) {
              that.orderNo = res.data.orderNo
              // 即充即退支付
              that.goDisposablePay(res);
            } else {
              that.unifiedOrderStstus = false
              uni.showModal({
                title: '消息提示',
                content: res.msg || '服务异常',
                showCancel: false
              });
            }
            uni.hideLoading();
          })
          ['catch'](function (res) {
        that.unifiedOrderStstus = false
        uni.hideLoading();
        uni.showModal({
          title: '充值失败',
          content: res.msg || '服务异常',
          showCancel: false
        });
      });
    },
    //调起支付
    goDisposablePay: function (res) {
      var that = this;

      //#ifdef APP-PLUS
      var orderInfo = JSON.stringify({
        "appid": res.data.appid, // 微信开放平台 - 应用 - AppId，注意和微信小程序、公众号 AppId 可能不一致
        "noncestr": res.data.noncestr, // 随机字符串
        "package": res.data.package, // 固定值
        "partnerid": res.data.partnerid, // 微信支付商户号
        "prepayid": res.data.prepayid, // 统一下单订单号
        "timestamp": res.data.timestamp, // 时间戳（单位：秒）
        "sign": res.data.sign // 签名，这里用的 MD5/RSA 签名
      })
      uni.requestPayment({
        provider: 'wxpay',
        orderInfo, //微信、支付宝订单数据 【注意微信的订单信息，键值应该全部是小写，不能采用驼峰命名】
        success: function (res) {
          console.log(res)
          that.unifiedOrderStstus = false
          that.getRechargeResult();
        },
        fail: function (err) {
          console.log(err)
          that.unifiedOrderStstus = false
          that.cancelCharge()
        }
      });
      //#endif

      // #ifdef MP-WEIXIN
      uni.requestPayment({
        provider: 'wxpay',
        timeStamp: res.data.timeStamp,
        nonceStr: res.data.nonceStr,
        package: res.data.package,
        signType: res.data.signType,
        paySign: res.data.sign,
        success: function (res) {
          console.log(res)
          that.unifiedOrderStstus = false
          that.getRechargeResult();
        },
        fail: function (err) {
          console.log(err)
          that.unifiedOrderStstus = false
          https_1
              .memberOrderResultQuery({
                orderNo: that.orderNo
              })
              .then(function (res) {
                if (res.code === 0) {
                  that.unifiedOrderStstus = false
                  if (res.data) {
                    that.getRechargeResult();
                  } else {
                    that.cancelCharge()
                  }
                }
              });
        }
      });
      // #endif
      // #ifdef H5
      if (that.isnylH5()) {

        if (!that.sellerPayConfigBySellerId.isUseJHPay) {
          // 未开启桔禾付执行
          uni.showModal({
            title: '消息提示',
            content: '未开启桔禾付，请选择其他支付方式',
            showCancel: false,
          });
          return
        }
        let orderNo = that.orderNo

        console.log(res.data, '支付入参')
        var getpar = {
          timeStamp: res.data.timeStamp + '',
          nonceStr: res.data.nonceStr,
          package: res.data.package || res.data.packageStr,
          paySign: res.data.sign || res.data.paySign,
          signType: res.data.signType || 'MD5',
          // price:chargePrice,
        };
        let payInfo = encodeURIComponent(JSON.stringify(getpar))

        let url = app.globalData.imgUrl
        // url = 'http://172.16.88.57:8081'

        let backUrl = encodeURIComponent(`${url}/h5/${app.globalData.sellerNo}/#/homeSub/pages/terminal/gunDetail/payIng?orderNo=${orderNo}&backPage=gunDetail`)

        console.log(payInfo)
        console.log(backUrl)

        uni.setStorageSync('payIngData', {
          pileNo: that.pileNo,
          gunNo: that.gunno,
          chargeMode: 0, // app充电模式(1自动模式,2金额模式,3时间模式,4电量模式)
          valtageType: 0, //辅助电源参数
          carNum: that.plateNo, //车牌号
          payMode: 1, //支付方式
          qrCode: that.qrCode,
          preChargeAmount: Number(this.customPrice != '' ? this.customPrice : 0), //预冲金额
          orderNumber: that.orderNo,
          disposablePayMode: true
        })
        // return
        wx.miniProgram.redirectTo({
          url: `/pages/wechatPay/wechatPay?payInfo=${payInfo}&backUrl=${backUrl}`
        })
      } else {
        uni.showModal({
          title: '消息提示',
          content: '请选择其他支付方式',
          showCancel: false,
        });
      }
      // #endif
    },
    //取消充值 -- 支付前
    cancelCharge: function () {
      https_1
          .disposableUnifiedOrders({
            openId: uni.getStorageSync('openid'),
            totalFee: this.customPrice * 100,
            tradeType: 'APP',
            orderNo: this.orderNo,
            cancelRecharge: 2
          })
          .then((res) => {
            if (res.code == 0) {
              uni.showModal({
                title: '消息提示',
                content: '已取消充值',
                showCancel: false
              });
            }
          });
    },
    //启动充电-充完即退-微信取消充值 -- 支付后
    disposableCancelRecharge: function () {
      uni.showModal({
        title: '消息提示',
        content: '网络异常，如果产生多次扣费，请联系客服人员退款',
        showCancel: false
      });
      var that = this;
      https_1
          .disposableCancelRecharge({
            orderNo: this.orderNo
          })
          .then(function () {
            that.rechargeLoading = false,
                that.rechargeError = true,
                that.getRechargeResultNum = 1
          });
    },
    //查询充值结果
    getRechargeResult: function () {
      var that = this;
      this.rechargeLoading = true
      uni.showLoading({title: '充值中..', mask: true})
      this.disposableOrderResultQuery();
      this.Interval = setInterval(function () {
        if (that.getRechargeResultNum > 10) {
          uni.hideLoading()
          clearInterval(that.Interval);
          that.disposableCancelRecharge();
        } else {
          that.disposableOrderResultQuery();
        }
      }, 3000);
    },

    //启动充电-充完即退-微信查询支付结果
    disposableOrderResultQuery: function () {
      var that = this;
      var num = this.getRechargeResultNum + 1;
      this.getRechargeResultNum = num
      https_1
          .disposableOrderResultQuery({
            orderNo: this.orderNo
          })
          .then(function (res) {
            if (res.code === 0) {
              uni.hideLoading()
              clearInterval(that.Interval);
              that.rechargeLoading = false,
                  that.getRechargeResultNum = 1,
                  that.customPrice = '',
                  // uni.showModal({
                  // 	title: '消息提示',
                  // 	content: '充值成功',
                  // 	showCancel: false
                  // });
                  that.enterDisposableStartCharge()
            }

            if (res.code === 204) {
              uni.hideLoading()
              clearInterval(that.Interval);
              that.rechargeLoading = false,
                  that.getRechargeResultNum = 1,
                  uni.showModal({
                    title: '信息提示',
                    content: '支付确认超时，金额已退回',
                    showCancel: false,
                  })
            }
          });
    },
    //启动充电-充完即退-微信支付成功后鉴权
    enterDisposableStartCharge: function () {
      var that = this

      // if (!this.recharge.value) {
      var str = {
        pileNo: this.pileNo,
        gunNo: this.gunno,
        gunNo1: this.gunDetail1.gunno,
        isParallelCharge: this.gunDetail1.gunid ? 1 : 0,
        chargeMode: 0, // app充电模式(1自动模式,2金额模式,3时间模式,4电量模式)
        valtageType: 0, //辅助电源参数
        carNum: this.plateNo, //车牌号
        payMode: 1, //支付方式
        qrCode: this.qrCode,
        preChargeAmount: Number(this.customPrice != '' ? this.customPrice : 0), //预冲金额
        orderNumber: this.orderNo,
        disposablePayMode: true
      };
      console.log(JSON.stringify(str), '8888888')
      uni.navigateTo({
        url: '../../../../homeSub/pages/startCharging/startCharging?parameter=' + JSON.stringify(str)
      });
      // https_1.disposableStartCharge(str)
      // .then(function (res) {
      // 	if (res.code == 0) {
      // 		uni.navigateTo({
      // 			url: '../../../../homeSub/pages/startCharging/startCharging?parameter=' + JSON.stringify(str)
      // 		});
      // 	}else{

      // 	}
      // })
      // }
    },

    // 关闭充值异常
    closeRechargeError: function () {
      this.rechargeError = false
    },
    // 客服
    calltel: function () {
      if (this.phoneNumber) {
        uni.makePhoneCall({
          phoneNumber: this.phoneNumber
        });
      } else {
        this.closeRechargeError();
      }
    },
    // 获取模板消息id
    currentTemplateId() {
      currentTemplateId(getApp().globalData.sellerId).then(res => {
        this.wxTemplateIds = [res.data]
        console.log(res, '获取id')
      })
    },
    // 显示支付分弹窗
    showzhifufenTips() {
      uni.showModal({
        title: '信息提示',
        content: '微信信用分达到550分以上，可以先充电后付款。微信信用分由微信官方授权评分。',
        showCancel: false,
      })
    }
  },

};
</script>
<style lang="less">
@import './yhsm.less';

@import '../../../../commin/flex.less';
@import '../../../../commin/commin.less';
/* homeSub/pages/terminal/gunDetail/gunDetail.wxss */
/*颜色*/
/*数字*/
/*文字溢出隐藏*/
/*固定布局*/
/* grid是（布局 */
/*宽高*/
/* 字体大小*/
/* 行高 */
/* 圆角 */
/* 外边距 */
/* 内边距 */
/* 实边框 */
/* 虚边框 */
/* 定位  */
/* 数组  */

.add-gun {
  color: var(--textColor);
  text-align: center;
  width: 100%;
  font-weight: bold;
}

.record-in .aaa1 {
  color: #909399;
}

.record-in .aaa2 {
  color: var(--textColor);
}

.record-in .aaa3 {
  color: #f7a14a;
}

.record-in .aaa4 {
  color: #72c23d;
}

.record-in .aaa5 {
  color: #606266;
}

page {
  background-color: #f5f7fa;
  padding-bottom: 150rpx;
}

.pile_head {
  margin: 16rpx 24rpx 16rpx 24rpx;
  align-items: center;
  padding: 40rpx 32rpx 40rpx 32rpx;
  display: flex;
  background: linear-gradient(0deg, #ffffff, #f4f6f8);
  border: 2rpx solid #ffffff;
  box-shadow: 4rpx 7rpx 20rpx 0rpx rgba(166, 171, 179, 0.24);
  border-radius: 16rpx 16rpx 16rpx 16rpx;
  justify-content: space-between;
}

.pile_head .pile_img {
  width: 140rpx;
  height: 120rpx;
}

.pile_head .plie_box {
  width: 408rpx;

}

.pile_head .plie_box .plie_name {
  font-size: 30rpx;
  font-family: PingFang SC;
  font-weight: bold;
  color: #1a1a1a;
}

.pile_head .plie_box .plie_detail {
  overflow: hidden;
  -webkit-line-clamp: 1;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  margin-top: 28rpx;
  font-size: 26rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: #606266;
}

.pile_head .img {
  width: 16rpx;
  height: 27rpx;
}

.plie_list {
  width: 638rpx;
  background: linear-gradient(0deg, #fff, #f4f6f8);
  border: 2rpx solid #fff;
  box-shadow: 4rpx 7rpx 20rpx 0rpx rgba(166, 171, 179, 0.24);
  border-radius: 16rpx 16rpx 16rpx 16rpx;
  margin: 16rpx 24rpx 0rpx 24rpx;
  padding: 40rpx 32rpx 37rpx 32rpx;
}

.plie_list .plie_item {
  display: flex;
  align-items: center;
}

.plie_list .plie_item .img {
  width: 111rpx;
  height: 111rpx;
  background: #fff;
  border: 7rpx solid var(--textColor);
  opacity: 0.06;
  border-radius: 50%;
}

.plie_list .plie_item .img2, .img6 {
  width: 100rpx;
  height: 100rpx;
  background: rgba(20, 135, 250, 0.06);
  border-radius: 50%;
  position: absolute;
  margin-left: 13rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 24rpx;
  font-family: PingFangSC;
  font-weight: 400;
  color: var(--textColor);
}

.img6 {
  background: rgba(121, 132, 197, 0.16);
  color: rgba(121, 132, 197);
  box-sizing: border-box;
  padding-top: 20rpx;
  line-height: 30rpx;
}

.plie_list .plie_item .status {
  width: 111rpx;
  height: 111rpx;
  background: #fff;
  border: 7rpx solid #909399;
  opacity: 0.06;
  border-radius: 50%;
}

.plie_list .plie_item .status3 {
  width: 100rpx;
  height: 100rpx;
  background: rgba(144, 147, 153, 0.06);
  border-radius: 50%;
  position: absolute;
  margin-left: 13rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 24rpx;
  font-family: PingFangSC;
  font-weight: 400;
  color: #909399;
}

.plie_list .plie_item .item {
  // margin: 0 0 0 32rpx;
}

.plie_list .plie_item .item_name {
  font-size: 30rpx;
  font-family: PingFang SC;
  font-weight: bold;
  color: #1a1a1a;
  display: flex;
  align-items: center;
}

.plie_list .plie_item .item_name .item_img {
  width: 44rpx;
  height: 34rpx;
  margin-left: 33rpx;
}

.plie_list .plie_item .item_info {
  margin: 30rpx 0 30rpx 0;
  font-size: 26rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: #606266;
}

.plie_list .plie_item .item_info .price {
  font-size: 40rpx;
  color: var(--textColor);
}

.price .sp {
  font-size: 24rpx;
  font-family: PingFang-SC-Medium;
  font-weight: 500;
}

.plie_list .plie_item .nextInfo {
  font-size: 24rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: #909399;
}

.plie_list .priceDetail {
  position: absolute;
  right: 57rpx;
  align-items: center;
  display: flex;
  font-size: 24rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: var(--textColor);
}

.priceList {
  padding: 0rpx 34rpx 0rpx 34rpx;
  height: 700rpx;
  overflow: auto;
}

.priceList .priceItem {
  padding-bottom: 40rpx;
  border-bottom: 1rpx solid #dcdfe6;
  margin-top: 40rpx;
}

.priceList .priceItem .priceTop {
  display: flex;
  justify-content: space-between;
}

.priceList .priceItem .priceTop .first {
  display: flex;
  align-items: center;
}

.priceList .priceItem .priceTop .first .txt {
  font-size: 30rpx;
  margin: 0 32rpx 0 15rpx;
  font-family: PingFangSC;
  font-weight: 400;
  color: #1a1a1a;
}

.priceList .priceItem .priceTop .first .price_img {
  width: 39rpx;
  height: 31rpx;
}

.priceList .priceItem .priceTop .first .price_current {
  width: 56rpx;
  height: 32rpx;
}

.priceList .priceItem .priceTop .txt1 {
  color: #fc724c;
  font-size: 32rpx;
  font-family: DIN;
  font-weight: bold;
}

.priceList .priceItem .priceTop .txt2 {
  font-size: 22rpx;
  font-family: PingFangSC;
  font-weight: 500;
}

.priceList .priceItem .priceTop .txt3 {
  font-size: 30rpx;
  font-family: PingFang-SC-Medium;
  font-weight: Medium;
}

.priceList .priceItem .servePrice {
  font-size: 26rpx;
  padding-top: 31rpx;
  font-family: PingFangSC;
  font-weight: 400;
  color: #606266;
}

.carInfo {
  width: 638rpx;
  height: 108rpx;
  line-height: 108rpx;
  background: linear-gradient(0deg, #ffffff, #f4f6f8);
  border: 2rpx solid #ffffff;
  box-shadow: 4rpx 7rpx 20rpx 0rpx rgba(166, 171, 179, 0.24);
  border-radius: 16rpx 16rpx 16rpx 16rpx;
  margin: 16rpx 24rpx 0rpx 24rpx;
  padding: 0 32rpx 0 32rpx;
  display: flex;
  justify-content: space-between;
}

.carInfo .tip {
  font-size: 30rpx;
  font-family: PingFang SC;
  font-weight: bold;
  color: #1a1a1a;
}

.carInfo .plateNo {
  font-size: 30rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: #909399;
}

.stopExplain {
  width: 638rpx;
  background: linear-gradient(0deg, #fff, #f4f6f8);
  border: 2rpx solid #fff;
  box-shadow: 4rpx 7rpx 20rpx 0rpx rgba(166, 171, 179, 0.24);
  border-radius: 16rpx 16rpx 16rpx 16rpx;
  margin: 16rpx 24rpx 0rpx 24rpx;
  padding: 40rpx 32rpx 37rpx 32rpx;
  line-height: 48rpx;
}

.stopExplain .explain {
  font-size: 30rpx;
  font-family: PingFang SC;
  font-weight: bold;
  color: #1a1a1a;
}

.stopExplain .tip {
  font-size: 24rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: #909399;
}

.stopExplain .tip .txt {
  font-size: 22rpx;
}

.stopExplain .explainCost {
  display: flex;
  justify-content: space-between;
}

.stopExplain .explainCost .time {
  font-size: 24rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: #909399;
}

.stopExplain .explainCost .price {
  font-size: 24rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: #606266;
}

.payType {
  width: 638rpx;
  background: linear-gradient(0deg, #fff, #f4f6f8);
  line-height: 60rpx;
  border: 2rpx solid #fff;
  box-shadow: 4rpx 7rpx 20rpx 0rpx rgba(166, 171, 179, 0.24);
  border-radius: 16rpx 16rpx 16rpx 16rpx;
  margin: 16rpx 24rpx 0rpx 24rpx;
  padding: 40rpx 32rpx 37rpx 32rpx;
}

.payType .title {
  display: flex;
  justify-content: space-between;
}

.payType .title .txt1 {
  font-size: 30rpx;
  font-family: PingFang SC;
  font-weight: bold;
  color: #1a1a1a;
}

.payType .txt2 {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: var(--textColor);
}

.payType .txt3 {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  font-family: PingFang SC;
  font-weight: 500;
}

.payType .radio {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.payType .radio .account {
  font-size: 24rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: #909399;
  display: flex;
  align-items: center;
}

.payType .radio .account .money {
  color: #fc724c;
}

.payType .radio image {
  width: 30rpx;
  height: 30rpx;
  margin-right: 17rpx;
}

.payType .radio .turn_img, .turn_img {
  width: 16rpx;
  height: 27rpx;
  margin-left: 17rpx;
}

.payType .radio .turn_img1 {
  width: 34rpx;
  height: 34rpx;
  margin-left: 17rpx;
}

.setting {
  width: 638rpx;
  background: linear-gradient(0deg, #fff, #f4f6f8);
  line-height: 60rpx;
  border: 2rpx solid #fff;
  box-shadow: 4rpx 7rpx 20rpx 0rpx rgba(166, 171, 179, 0.24);
  border-radius: 16rpx 16rpx 16rpx 16rpx;
  margin: 16rpx 24rpx 16rpx 24rpx;
  padding: 40rpx 32rpx 37rpx 32rpx;
}

.setting .setting_title {
  font-size: 30rpx;
  font-family: PingFang SC;
  font-weight: bold;
  color: #1a1a1a;
  display: flex;
  justify-content: space-between;
  align-items: center;

}

.setting .priceType {
  display: flex;
  flex-wrap: wrap;
}

.setting .priceType .type {
  // width: 170rpx;
  height: 64rpx;
  padding: 0rpx 25rpx;
  line-height: 64rpx;
  background: #f5f7fa;
  border-radius: 32rpx 32rpx 32rpx 32rpx;
  text-align: center;
  font-size: 30rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: #606266;
  margin: 36rpx 24rpx 0 0;
}

.setting .priceType .type_action {
  background: var(--btnColor);

  border-radius: 32rpx 32rpx 32rpx 32rpx;
  font-size: 30rpx;
  font-family: PingFang SC;
  color: #fff;
}

.setting .priceType .custom {
  display: flex;
  align-items: center;
  margin-top: 36rpx;
  font-size: 30rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: #606266;
}

.setting .priceType .custom .custom_img {
  margin-left: 23rpx;
  width: 26rpx;
  height: 27rpx;
}

.setting .priceType .custom .custom_input {
  width: 80 wh;
  text-align: center;
  font-size: 28rpx;
  color: #606266;
  //border-bottom: 1rpx solid #606266;
}

.setting .setting_tip {
  font-size: 22rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: #f7a14a;
}

.fot_operation {
  position: fixed;
  bottom: 0;
  z-index: 2;
  display: flex;
  width: 616rpx;
  height: 88rpx;
  padding: 10rpx 32rpx 10rpx 102rpx;
  background: linear-gradient(0deg, #ffffff, #f4f6f8);
  border: 2rpx solid rgba(255, 255, 255, 0.55);
  box-shadow: 0rpx -25rpx 67rpx 0rpx rgba(177, 182, 190, 0.2);
}

.fot_operation .reFresh {
  font-size: 24rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: #606266;
  text-align: center;
  margin: 10rpx 101rpx 0 0;
}

.fot_operation .reFresh .fot_img {
  width: 34rpx;
  height: 33rpx;
}

.fot_operation .fot_btn {
  width: 468rpx;
  height: 88rpx;
  border-radius: 44rpx 44rpx 44rpx 44rpx;
  text-align: center;
  line-height: 88rpx;
  font-size: 34rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: #fff;
}

.fot_operation .fot_btn1 {
  background: var(--btnColor);
}

.fot_operation .fot_btn2 {
  background: #c0c4cc;
}

.rechargeTitle {
  font-size: 34rpx;
  font-family: PingFang SC;
  font-weight: bold;
  color: #1a1a1a;
}

.priceType1 {
  display: flex;
  flex-wrap: wrap;
}

.priceType1 .type1 {
  width: 180rpx;
  height: 64rpx;
  line-height: 64rpx;
  background: #f5f7fa;
  border-radius: 32rpx 32rpx 32rpx 32rpx;
  text-align: center;
  font-size: 30rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: #606266;
  margin: 36rpx 42rpx 0 0;
}

.priceType1 .type_action1 {
  background: rgba(20, 135, 250, 0.06);
  border: 1rpx solid var(--textColor);
  border-radius: 32rpx 32rpx 32rpx 32rpx;
  font-size: 30rpx;
  font-family: PingFang SC;
  font-weight: bold;
  color: var(--textColor);
}

.priceType1 .custom1 {
  display: flex;
  align-items: center;
  margin-top: 36rpx;
  font-size: 30rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: #606266;
}

.priceType1 .custom1 .custom_img1 {
  margin-left: 23rpx;
  width: 26rpx;
  height: 27rpx;
}

.priceType1 .custom1 .custom_input1 {
  width: 150rpx;
  text-align: center;
  font-size: 28rpx;
  color: #606266;
  border-bottom: 1rpx solid #606266;
}

.rechargeBtn {
  width: 400rpx;
  height: 88rpx;
  line-height: 88rpx;
  background: var(--btnColor);
  border-radius: 44rpx 44rpx 44rpx 44rpx;
  text-align: center;
  font-size: 30rpx;
  font-family: PingFang SC;
  font-weight: bold;
  color: #fff;
  margin: 83rpx 0 0 115rpx;
}

.price_popup {
  width: 702rpx !important;
  height: 691rpx;
  margin: 0 24rpx 26rpx 24rpx;
  background: linear-gradient(0deg, #ffffff, #f4f6f8);
  border: 2rpx solid #ffffff;
  box-shadow: 4rpx 7rpx 20rpx 0rpx rgba(166, 171, 179, 0.24);
  border-radius: 16rpx;
}

.rechargeRemind {
  position: absolute;
  // top: -90rpx;
  top: -75rpx;
  right: 70rpx;
  background: linear-gradient(105deg, #F7B068, #F7A14A);
  box-shadow: 4rpx 7rpx 20rpx 0rpx rgba(166, 171, 179, 0.24);
  border-radius: 16rpx;
  font-size: 24rpx;
  font-family: PingFang SC;
  font-weight: 400;
  color: #FEFEFE;
  padding: 20rpx;
}

.filtrate {
  background: #fff;
  padding: 41rpx 32rpx;
  border-radius: 16rpx;
  margin: auto 24rpx;
}

.switch-nav {
  display: flex;
  justify-content: space-between;
  padding: 24rpx 32rpx;

  .t1 {
    text {
      &:first-of-type {
        font-size: 26rpx;
        font-weight: 400;
        color: #606266;
      }

      &:last-of-type {
        font-size: 26rpx;
        font-weight: 400;
        color: #303133;
      }
    }
  }

  .t2 {
    display: flex;
    align-items: center;
    color: #606266;
    font-size: 26rpx;

    image {
      width: 26rpx;
      height: 26rpx;
      margin-right: 15rpx;
    }
  }
}

.box-info {
  width: 680rpx;
  height: 660rpx;
  padding: 40rpx 32rpx;
  margin: 0 auto;
  overflow: auto;
  padding-top: 0;

  .title {
    font-size: 30rpx;
    font-weight: bold;
    color: #303133;
    position: fixed;
    z-index: 10;
    background-color: #fff;
    width: 93%;
    height: 100rpx;
    line-height: 100rpx;

    &:after {
      content: '';
      display: block;
      position: absolute;
      top: 36rpx;
      left: -15rpx;
      width: 6rpx;
      height: 30rpx;
      background-color: #6DB12E;
      z-index: 2;
    }
  }

  & > .t1 {
    display: flex;
    justify-content: space-between;
    font-size: 26rpx;
    font-family: PingFang SC;
    font-weight: 500;
    color: #303133;
    margin-bottom: 24rpx;
    margin-top: 32rpx;
    padding-top: 80rpx;
  }

  .list {
    .item {
      width: 620rpx;
      padding: 40rpx 32rpx;
      position: relative;
      display: flex;
      justify-content: space-between;
      background: #F5F7FA;
      margin-bottom: 16rpx;
      align-items: center;

      &:last-of-type {
        margin-bottom: 0;
      }

      .time {
        font-size: 26rpx;
        font-family: PingFang SC;
        font-weight: 500;
        color: #303133;
      }

      & > .t1 {
        width: 80rpx;
        height: 38rpx;
        display: none;
        background: #FC724C;
        border-radius: 17rpx 17rpx 0px 17rpx;
        color: #F5F7FA;
        text-align: center;
        line-height: 38rpx;
        font-size: 20rpx;
        position: absolute;
        top: 40rpx;
        left: 220rpx;
        z-index: 1;
      }

      & > .t2 {
        width: 110rpx;
        height: 40rpx;
        line-height: 40rpx;
        text-align: center;
        display: none;
        background: #FC724C;
        border-radius: 0px 20rpx 20rpx 0px;
        color: #fff;
        font-size: 26rpx;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
      }

      .t2.active, .t1.active {
        display: block;
      }

      .right-item {
        .type1, .type2 {
          font-size: 26rpx;
          font-weight: 500;
          color: #606266;

          .l1 {
            display: flex;
            justify-content: space-between;
            align-items: center;

            text {
              margin-left: 20rpx;
            }
          }

          .t2 {
            font-size: 32rpx;
            font-weight: bold;
            color: var(--textColor);
          }

          .delete {
            font-size: 26rpx;
            font-weight: 400;
            text-decoration: line-through;
            color: #909399;
            margin-top: 30rpx;

            text {
              margin-left: 20rpx;
            }
          }

          & > text {
            margin-left: 20rpx;
          }
        }

        .type2 {
          .t1 {
            font-size: 32rpx;
            font-weight: bold;
            color: var(--textColor);
          }
        }
      }

    }

    .item.active {
      background: rgba(252, 114, 76, 0.08);
    }
  }
}

.u-progress-content {
  .soc, .status5 {
    font-size: 20rpx;
    text-align: center;
    color: var(--textColor);
  }
}

.PrechargeInput {
  border-bottom: 1rpx solid #C0C4CC;
  margin-top: 18rpx;

  .custom_input {
    width: 500rpx;
    font-size: 28rpx;
    color: #606266;
    display: inline-block;
    vertical-align: middle;
    margin-left: 30rpx;
    //border-bottom: 1rpx solid #606266;
  }
}


.plie_item2 {
  display: flex;
  align-items: center;
}

.plie_item2 .img {
  width: 111rpx;
  height: 111rpx;
  background: #fff;
  border: 7rpx solid var(--textColor);
  opacity: 0.06;
  border-radius: 50%;
}

.plie_item2 .img2, .img6 {
  width: 100rpx;
  height: 100rpx;
  background: rgba(20, 135, 250, 0.06);
  border-radius: 50%;
  position: absolute;
  margin-left: 13rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 24rpx;
  font-family: PingFangSC;
  font-weight: 400;
  color: var(--textColor);
}

.img6 {
  background: rgba(121, 132, 197, 0.16);
  color: rgba(121, 132, 197);
  box-sizing: border-box;
  padding-top: 20rpx;
  line-height: 30rpx;
}

.plie_item2 .status {
  width: 111rpx;
  height: 111rpx;
  background: #fff;
  border: 7rpx solid #909399;
  opacity: 0.06;
  border-radius: 50%;
}

.plie_item2 .status3 {
  width: 100rpx;
  height: 100rpx;
  background: rgba(144, 147, 153, 0.06);
  border-radius: 50%;
  position: absolute;
  margin-left: 13rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 24rpx;
  font-family: PingFangSC;
  font-weight: 400;
  color: #909399;
}

.plie_item2 .item {
  margin: 0 0 0 32rpx;
}

.plie_item2 .item_name {
  font-size: 30rpx;
  font-family: PingFang SC;
  font-weight: bold;
  color: #1a1a1a;
  display: flex;
  align-items: center;
}

.plie_item2 .item_name .item_img {
  width: 44rpx;
  height: 34rpx;
  margin-left: 33rpx;
}

.plie_item2 .item_info {
  margin: 30rpx 0 30rpx 0;
  font-size: 26rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: #606266;
}

.plie_item2 .item_info .price {
  color: #fc724c;
}

.plie_item2 .nextInfo {
  font-size: 24rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: #909399;
}

.plieInfo {
  color: #909399;
  font-weight: 400;
  font-size: 26rpx;
  margin-top: 24rpx;

  .interval {
    margin: 0 10rpx
  }
}

.tagDivision {
  margin: 0rpx 15rpx;
  display: inline;
  position: relative;

  &::after {
    position: absolute;
    right: 0;
    top: 8rpx;
    content: '';
    height: 22rpx;
    width: 1px;
    background: #909399;
  }
}

.active-icon {
  width: 24rpx;
  height: 28rpx;
  margin-right: 12rpx;
}

.recharge-loading {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.recharge-loading .body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 630rpx;
  height: 522rpx;
  background: #ffffff;
  border-radius: 20rpx;
}

.recharge-loading .body .icon {
  width: 230rpx;
  height: 222rpx;
}

.recharge-loading .body .title {
  font-size: 32rpx;
  font-weight: bold;
  color: #18181a;
  margin-top: 24rpx;
}

.recharge-loading .body .desc {
  font-size: 26rpx;
  font-weight: 500;
  color: #fc724c;
  margin-top: 32rpx;
}

.recharge-error {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.recharge-error .body {
  width: 630rpx;
  background: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
}

.recharge-error .body .title {
  font-size: 34rpx;
  font-weight: bold;
  color: #fc724c;
  text-align: center;
  margin-top: 42rpx;
  margin-bottom: 16rpx;
  position: relative;
}

.recharge-error .body .title .close {
  position: absolute;
  top: -12px;
  right: 20rpx;
  width: 28rpx;
  height: 28rpx;
  padding: 14rpx;
}

.recharge-error .body .content {
  padding: 34rpx;
}

.recharge-error .body .content .msg {
  font-size: 30rpx;
  font-weight: 500;
  color: #303133;
  line-height: 44rpx;
}

.recharge-error .body .content .phone {
  font-size: 30rpx;
  font-weight: 500;
  color: #303133;
  line-height: 48rpx;
  margin: 50rpx 0 40rpx;
}

.recharge-error .body .btn {
  height: 110rpx;
  line-height: 110rpx;
  background: #ffffff;
  font-size: 30rpx;
  font-weight: bold;
  color: var(--textColor);
  border-top: 1px solid #dcdfe6;
  border-radius: 0;
}

.recharge-error .body .btn::after {
  border: 0;
}


//移动端优化  启动充电
.fot_operation2 {
  position: fixed;
  bottom: 0;
  z-index: 2;
  display: flex;
  justify-content: center;
  width: 100%;
  height: 88rpx;
  background: linear-gradient(0deg, #ffffff, #f4f6f8);
  border: 2rpx solid rgba(255, 255, 255, 0.55);
  box-shadow: 0rpx -25rpx 67rpx 0rpx rgba(177, 182, 190, 0.2);

  .fot_btn {
    width: 90%;
    height: 88rpx;
    border-radius: 44rpx 44rpx 44rpx 44rpx;
    text-align: center;
    line-height: 88rpx;
    font-size: 34rpx;
    font-family: PingFang SC;
    font-weight: 500;
    color: #fff;
    background: var(--btnColor);
  }
}


/*站点优惠价格样式*/
.yhimg_box {
  width: 40rpx;
  height: 40rpx;
  // margin-right: 8rpx;
  position: relative;

  .discount_img {
    width: 40rpx;
    height: 40rpx;
    position: absolute;
  }

  .vip_text {
    position: absolute;
    top: 40%;
    left: 55%;
    transform: translate(-50%, -50%);
    font-size: 16rpx;
    font-family: DIN-BlackItalic;
    font-weight: 600;
    // font-style:italic;
    color: #A65424;
  }
}

.selectGun_box {
  max-height: 800rpx;
}

.selectGun_title {
  font-size: 30rpx;
  font-weight: bold;
  text-align: center;
  padding: 20rpx 0;
}


</style>

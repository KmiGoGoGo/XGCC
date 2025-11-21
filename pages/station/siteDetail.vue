<template>
  <view :style="objColor" v-if="pageApiObj" class='pages-wrap'>
    <customer></customer>
    <!-- homeSub/pages/siteDetail/siteDetail.wxml -->
    <view class="sitePage">
      <!-- 站点信息 -->
      <view class="siteDetail">
        <view class="title">{{ siteItemData.name }}</view>
        <!-- <view class="tagList">
                    <view
                        class="tag_item"
                        :style="item.color == 'rgba(96, 98, 102, 0.06)' ? 'color:#909399;' + 'background:' + item.color + ';' : 'color:#1487FA;' + 'background:' + item.color + ';'"
                        v-if="item.name"
                        v-for="(item, index) in siteItemData.stationLabel"
                        :key="index"
                    >
                        {{ item.name }}
                    </view>
                </view> -->
        <!-- 	<view class="siteTime" v-if="siteItemData.timeList.length">
            <view class="showTime" >
                {{ siteItemData.timeList[0]==='全天开放'? '全天开放':'分时段开放'}}
            </view>
        </view> -->
        <!-- 标签 -->
        <view class="tagList" v-if="siteItemData.tagList&&siteItemData.tagList.length">
          <view v-for="(item, index1) in siteItemData.tagList" :key="index1" class="tagCon">
            <view :key="index1" style="display: inline;" class="tag"
                  :class="[item.bright == 1? 'tag1' : 'tag2']"
                  :style="{padding:(index1==0&&item.bright != 1?'0rpx 16rpx 0 0':'6rpx 16rpx')}">
              <text>{{ item.tagName }}</text>
            </view>
            <text class="tagDivision" v-if="siteItemData.tagList.length-1!=index1&&item.bright!=1"></text>
          </view>

        </view>

        <scroll-view :scroll-x="true" class="siteImg"
                     v-if="siteItemData.picArr && siteItemData.picArr.length > 0">
          <view class="view_list">
            <view v-for="(item, index) in siteItemData.picArr" :key="index">
              <image class="mypic" :src="item.url" :data-index="index" @tap="seeImg"></image>
            </view>
          </view>
        </scroll-view>
        <scroll-view :scroll-x="true" class="siteImg"
                     v-else-if="siteItemData.detailsImages && siteItemData.detailsImages.length > 0">
          <view class="view_list">
            <view v-for="(item, index) in siteItemData.detailsImages" :key="index">
              <image class="mypic" :src="item" :data-index="index" @tap="seeImg"></image>
            </view>
          </view>
        </scroll-view>


        <view class="timeListCon" v-if="siteItemData.timeList.length && siteItemData.timeList[0]!='全天开放'">
          <image class="img" src="https://oos-cn.ctyunapi.cn/front-end/static/homeSub/images/time.png">
          </image>
          <text class="timeListText" v-for="(item, index) in siteItemData.timeList.slice(1)" :key="index">
            {{ item }}
            <text v-if="index+1<siteItemData.timeList.slice(1).length">,</text>
          </text>
        </view>

        <view class="info">
          <view class="address">
            <image class="img" src="https://oos-cn.ctyunapi.cn/front-end/static/homeSub/images/add.png">
            </image>
            {{ siteItemData.street }}
          </view>
          <!-- <view class="item" @tap="goNearbyStations" :data-name="siteItemData.street">
                        附近站点
                        <image class="img" src="https://oos-cn.ctyunapi.cn/front-end/static/homeSub/images/charg.png"></image>
                    </view>
                    <view class="item">|</view> -->
          <template v-if="!(isxmgjMix() || isnylH5())">
            <view class="item" @tap.stop.prevent="goAddress" :data-latitude="siteItemData.latitude"
                  :data-longitude="siteItemData.longitude" :data-name="siteItemData.name"
                  :data-street="siteItemData.street" v-if="siteItemData.distance != null">
              {{ siteItemData.distance }}km
              <image class="img"
                     :src="(otherIconListSync[0] && otherIconListSync[0].icon) || 'https://oos-cn.ctyunapi.cn/front-end/static/static/Navigation.png'"
                     mode="aspectFill"></image>
            </view>
            <view class="item" v-if="siteItemData.distance == null">未授权定位</view>
          </template>
        </view>
        <view class="notice" v-if="siteItemData.notice">
          <image class="img"
                 :src="sellerNo=='jw'?'https://oos-cn.ctyunapi.cn/front-end/static/mine/images/notice-blue.png':'https://oos-cn.ctyunapi.cn/front-end/static/homeSub/images/notice.png'">
          </image>
          <scroll-view class="scrollIsf">
            <!-- 内容 start -->
            <view :class="'user-content-view ' + (isF ? 'hide' : 'show')">
              <text class="user-content">{{ siteItemData.notice ? siteItemData.notice : '暂无' }}</text>
            </view>
            <!-- 内容 end -->
            <!-- 展开 收起 strat -->
            <view v-if="siteItemData.noticeStatus" @tap="change" class="state">{{ isF ? '展开' : '收起' }}
            </view>
            <!-- 展开 收起  end -->
          </scroll-view>
        </view>
      </view>
      <!-- 价格信息 -->
      <view class="sitePrice">
        <!--        <view class="priceInfo">-->
        <!--          <view>价格信息</view>-->
        <!--          <view class="txt" @tap="goPriceDetail" v-if="isToken">-->
        <!--            价格详情-->
        <!--            <image class="txtImg"-->
        <!--                   :src="sellerNo=='jw'?'https://oos-cn.ctyunapi.cn/front-end/static/mine/images/turn-blue.png':'https://oos-cn.ctyunapi.cn/front-end/static/cartoon/turn_act.png'"></image>-->
        <!--          </view>-->
        <!--        </view>-->

        <!-- 移动端优化 -->
        <view class="priceInfo">
          <view>费用信息</view>
          <view class="txt" @tap="goPriceDetail">
            终端列表
            <image class="txtImg" src="https://oos-cn.ctyunapi.cn/front-end/static/cartoon/turn_act.png">
            </image>
          </view>
        </view>


        <!-- 营销获客处理 -->
        <view class="yxhk_ffhy" v-if="marketingSwitch">
          <!-- 开通会员/使用组件 -->
          <payMemberCard cardMsg="siteDelPage"></payMemberCard>
        </view>


        <!-- 超 -->
        <view class="exceed" @tap="pricePopupVisible" data-type="open"
              :data-gunid="siteItemData.gunPriceInfo.superItem.currentGunId"
              v-if="siteItemData.gunPriceInfo.superItem">
          <view class="disFlex">
            <view class="one">
              <image class="img"
                     src="https://oos-cn.ctyunapi.cn/front-end/static/homeSub/images/exceed.png"></image>
              <view class="txt1">闲{{ siteItemData.gunPriceInfo.superItem.freeGunCount }}</view>
              <view class="txt2">/共{{ siteItemData.gunPriceInfo.superItem.gunCount }}</view>
            </view>
            <view class="txt2" v-if="!siteItemData.gunPriceInfo.superItem.allDayPriceUnifyFlag">
              {{
                siteItemData.gunPriceInfo.superItem.currentStartTime
              }}-{{ siteItemData.gunPriceInfo.superItem.currentEndTime }}
            </view>
            <view class="txt2" v-else>全天价格统一</view>
          </view>

          <!-- 营销获客未开启 -->
          <view v-if="!marketingSwitch">
            <view>
              <view class="disFlex1" style="margin: 24rpx 0">
                <view class="txt3">当前价格</view>
                <view class="txt4"
                      v-if="siteItemData.gunPriceInfo.superItem.discount||siteItemData.gunPriceInfo.superItem.contractDiscount">
                  <view class="yuan">¥</view>
                  {{ siteItemData.gunPriceInfo.superItem.discountPriceStr }}
                  <view class="txt5">起</view>
                  <view class="originalPrice">
                    ¥{{ siteItemData.gunPriceInfo.superItem.currentPriceStr }}起
                  </view>
                </view>
                <view class="txt4" v-else>
                  <view class="yuan">¥</view>
                  {{ siteItemData.gunPriceInfo.superItem.currentPriceStr }}
                  <view class="txt5">起</view>
                </view>
              </view>
              <view class="disFlex">
                <view class="txt2">
                  电费{{ siteItemData.gunPriceInfo.superItem.currentPowerPriceStr }}元/度 |
                  服务费{{ siteItemData.gunPriceInfo.superItem.currentServicePriceStr }}元/度
                </view>
              </view>
            </view>
          </view>
          <!-- 营销获客已开启 -->
          <view v-if="marketingSwitch">
            <!-- 营销获客处理 -->
            <view v-if="siteItemData.gunPriceInfo.superItem.marketing != null &&
                                siteItemData.gunPriceInfo.superItem.currentPriceStr != siteItemData.gunPriceInfo.superItem.marketing.marketingFinaPriceStr
                            ">
              <view class="disFlex1" style="margin: 24rpx 0">
                <view class="txt3">当前价格</view>
                <view class="yhimg_box"
                      v-if="siteItemData.gunPriceInfo.superItem.marketing.payleMemerLevel == 0 && siteItemData.gunPriceInfo.superItem.marketing.discountStatus == 1">
                  <image class="discount_img"
                         src="http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/static/geren_discount.png">
                  </image>
                </view>
                <view class="yhimg_box"
                      v-if="siteItemData.gunPriceInfo.superItem.marketing.payleMemerLevel != 0">
                  <image class="discount_img"
                         src="http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/static/pay_discount.png">
                  </image>
                  <view class="vip_text">
                    V{{ siteItemData.gunPriceInfo.superItem.marketing.payleMemerLevel }}
                  </view>
                </view>
                <view class="txt4">
                  {{ siteItemData.gunPriceInfo.superItem.marketing.marketingFinaPriceStr }}
                  <view class="txt5">元/起</view>
                  <text
                      style="text-decoration: line-through;font-size: 24rpx;font-family: PingFang SC;font-weight: 500;color: #A6ABB3;">
                    {{ siteItemData.gunPriceInfo.superItem.currentPriceStr }}元/起
                  </text>
                </view>
              </view>
              <view class="disFlex">
                <view class="txt2">
                  电费{{ siteItemData.gunPriceInfo.superItem.currentPowerPriceStr }}元/度 | 服务费
                  <text>{{ siteItemData.gunPriceInfo.superItem.marketing.marketingFinaServicePriceStr }}元/度</text>
                  <!-- <text style="text-decoration: line-through">{{ siteItemData.gunPriceInfo.superItem.currentServicePriceStr }}元/度</text> -->
                </view>
              </view>
            </view>
            <view v-else>
              <view class="disFlex1" style="margin: 24rpx 0">
                <view class="txt3">当前价格</view>
                <view class="txt4"
                      v-if="siteItemData.gunPriceInfo.superItem.discount||siteItemData.gunPriceInfo.superItem.contractDiscount">
                  <view class="yuan">¥</view>
                  {{ siteItemData.gunPriceInfo.superItem.discountPriceStr }}
                  <view class="txt5">起</view>
                  <view class="originalPrice">
                    ¥{{ siteItemData.gunPriceInfo.superItem.currentPriceStr }}起
                  </view>
                </view>
                <view class="txt4" v-else>
                  <view class="yuan">¥</view>
                  {{ siteItemData.gunPriceInfo.superItem.currentPriceStr }}
                  <view class="txt5">起</view>
                </view>
              </view>
              <view class="disFlex">
                <view class="txt2">
                  电费{{ siteItemData.gunPriceInfo.superItem.currentPowerPriceStr }}元/度 |
                  服务费{{ siteItemData.gunPriceInfo.superItem.currentServicePriceStr }}元/度
                </view>
              </view>
            </view>
          </view>


        </view>
        <!-- 快 -->
        <view class="fast" @tap="pricePopupVisible" data-type="open"
              :data-gunid="siteItemData.gunPriceInfo.fastItem.currentGunId"
              v-if="siteItemData.gunPriceInfo.fastItem">
          <view class="disFlex">
            <view class="one">
              <image class="img"
                     src="https://oos-cn.ctyunapi.cn/front-end/static/homeSub/images/fast.png"></image>
              <view class="txt1">闲{{ siteItemData.gunPriceInfo.fastItem.freeGunCount }}</view>
              <view class="txt2">/共{{ siteItemData.gunPriceInfo.fastItem.gunCount }}</view>
            </view>
            <view class="txt2" v-if="!siteItemData.gunPriceInfo.fastItem.allDayPriceUnifyFlag">
              {{
                siteItemData.gunPriceInfo.fastItem.currentStartTime
              }}-{{ siteItemData.gunPriceInfo.fastItem.currentEndTime }}
            </view>
            <view class="txt2" v-else>全天价格统一</view>
          </view>

          <!-- 营销获客未开启 -->
          <view v-if="!marketingSwitch">
            <view>
              <view class="disFlex1" style="margin: 24rpx 0">
                <view class="txt3">当前价格</view>
                <view class="txt4"
                      v-if="siteItemData.gunPriceInfo.fastItem.discount||siteItemData.gunPriceInfo.fastItem.contractDiscount">
                  <view class="yuan">¥</view>

                  {{ siteItemData.gunPriceInfo.fastItem.discountPriceStr }}
                  <view class="txt5">起</view>
                  <view class="originalPrice">
                    ¥{{ siteItemData.gunPriceInfo.fastItem.currentPriceStr }}起
                  </view>
                </view>
                <view class="txt4" v-else>
                  <view class="yuan">¥</view>

                  {{ siteItemData.gunPriceInfo.fastItem.currentPriceStr }}
                  <view class="txt5">起</view>
                </view>
              </view>
              <view class="disFlex">
                <view class="txt2">
                  电费{{ siteItemData.gunPriceInfo.fastItem.currentPowerPriceStr }}元/度 |
                  服务费{{ siteItemData.gunPriceInfo.fastItem.currentServicePriceStr }}元/度
                </view>
              </view>
            </view>
          </view>
          <!-- 营销获客已开启 -->
          <view v-if="marketingSwitch">
            <!-- 营销获客处理 -->
            <view v-if="siteItemData.gunPriceInfo.fastItem.marketing != null &&
                                siteItemData.gunPriceInfo.fastItem.currentPriceStr != siteItemData.gunPriceInfo.fastItem.marketing.marketingFinaPriceStr
                            ">
              <view class="disFlex1" style="margin: 24rpx 0">
                <view class="txt3">当前价格</view>
                <view class="yhimg_box"
                      v-if="siteItemData.gunPriceInfo.fastItem.marketing.payleMemerLevel == 0 && siteItemData.gunPriceInfo.fastItem.marketing.discountStatus == 1">
                  <image class="discount_img"
                         src="http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/static/geren_discount.png">
                  </image>
                </view>
                <view class="yhimg_box"
                      v-if="siteItemData.gunPriceInfo.fastItem.marketing.payleMemerLevel != 0">
                  <image class="discount_img"
                         src="http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/static/pay_discount.png">
                  </image>
                  <view class="vip_text">
                    V{{ siteItemData.gunPriceInfo.fastItem.marketing.payleMemerLevel }}
                  </view>
                </view>
                <view class="txt4">
                  {{ siteItemData.gunPriceInfo.fastItem.marketing.marketingFinaPriceStr }}
                  <view class="txt5">元/起</view>
                  <text
                      style="text-decoration: line-through;font-size: 24rpx;font-family: PingFang SC;font-weight: 500;color: #A6ABB3;">
                    {{ siteItemData.gunPriceInfo.fastItem.currentPriceStr }}元/起
                  </text>
                </view>
              </view>
              <view class="disFlex">
                <view class="txt2">
                  电费{{ siteItemData.gunPriceInfo.fastItem.currentPowerPriceStr }}元/度 | 服务费
                  <text>{{ siteItemData.gunPriceInfo.fastItem.marketing.marketingFinaServicePriceStr }}元/度</text>
                  <!-- <text style="text-decoration: line-through">{{ siteItemData.gunPriceInfo.fastItem.currentServicePriceStr }}元/度</text> -->
                </view>
              </view>
            </view>
            <view v-else>
              <view class="disFlex1" style="margin: 24rpx 0">
                <view class="txt3">当前价格</view>
                <view class="txt4"
                      v-if="siteItemData.gunPriceInfo.fastItem.discount||siteItemData.gunPriceInfo.fastItem.contractDiscount">
                  <view class="yuan">¥</view>

                  {{ siteItemData.gunPriceInfo.fastItem.discountPriceStr }}
                  <view class="txt5">起</view>
                  <view class="originalPrice">
                    ¥{{ siteItemData.gunPriceInfo.fastItem.currentPriceStr }}起
                  </view>
                </view>
                <view class="txt4" v-else>
                  <view class="yuan">¥</view>

                  {{ siteItemData.gunPriceInfo.fastItem.currentPriceStr }}
                  <view class="txt5">起</view>
                </view>
              </view>
              <view class="disFlex">
                <view class="txt2">
                  电费{{ siteItemData.gunPriceInfo.fastItem.currentPowerPriceStr }}元/度 |
                  服务费{{ siteItemData.gunPriceInfo.fastItem.currentServicePriceStr }}元/度
                </view>
              </view>
            </view>
          </view>

        </view>
        <!-- 慢 -->
        <view class="slow" @tap="pricePopupVisible" data-type="open"
              :data-gunid="siteItemData.gunPriceInfo.slowItem.currentGunId"
              v-if="siteItemData.gunPriceInfo.slowItem">

          <view class="disFlex">
            <view class="one">
              <image class="img"
                     src="https://oos-cn.ctyunapi.cn/front-end/static/homeSub/images/slow.png"></image>
              <view class="txt1">闲{{ siteItemData.gunPriceInfo.slowItem.freeGunCount }}</view>
              <view class="txt2">/共{{ siteItemData.gunPriceInfo.slowItem.gunCount }}</view>
            </view>
            <view class="txt2" v-if="!siteItemData.gunPriceInfo.slowItem.allDayPriceUnifyFlag">
              {{
                siteItemData.gunPriceInfo.slowItem.currentStartTime
              }}-{{ siteItemData.gunPriceInfo.slowItem.currentEndTime }}
            </view>
            <view class="txt2" v-else>全天价格统一</view>
          </view>

          <!-- 营销获客未开启 -->
          <view v-if="!marketingSwitch">
            <view>
              <view class="disFlex1" style="margin: 24rpx 0">
                <view class="txt3">当前价格</view>
                <view class="txt4"
                      v-if="siteItemData.gunPriceInfo.slowItem.discount||siteItemData.gunPriceInfo.slowItem.contractDiscount">
                  <view class="yuan">¥</view>
                  {{ siteItemData.gunPriceInfo.slowItem.discountPriceStr }}
                  <view class="txt5">起</view>
                  <view class="originalPrice">
                    ¥{{ siteItemData.gunPriceInfo.slowItem.currentPriceStr }}起
                  </view>
                </view>
                <view class="txt4" v-else>
                  <view class="yuan">¥</view>
                  {{ siteItemData.gunPriceInfo.slowItem.currentPriceStr }}
                  <view class="txt5">起</view>
                </view>
              </view>
              <view class="disFlex">
                <view class="txt2">
                  电费{{ siteItemData.gunPriceInfo.slowItem.currentPowerPriceStr }}元/度 |
                  服务费{{ siteItemData.gunPriceInfo.slowItem.currentServicePriceStr }}元/度
                </view>
              </view>
            </view>
          </view>

          <!-- 营销获客已开启 -->
          <view v-if="marketingSwitch">
            <!-- 营销获客处理 -->
            <view v-if="siteItemData.gunPriceInfo.slowItem.marketing != null &&
                                siteItemData.gunPriceInfo.slowItem.currentPriceStr != siteItemData.gunPriceInfo.slowItem.marketing.marketingFinaPriceStr
                            ">
              <view class="disFlex1" style="margin: 24rpx 0">
                <view class="txt3">当前价格</view>
                <view class="yhimg_box"
                      v-if="siteItemData.gunPriceInfo.slowItem.marketing.payleMemerLevel == 0 && siteItemData.gunPriceInfo.slowItem.marketing.discountStatus == 1">
                  <image class="discount_img"
                         src="http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/static/geren_discount.png">
                  </image>
                </view>
                <view class="yhimg_box"
                      v-if="siteItemData.gunPriceInfo.slowItem.marketing.payleMemerLevel != 0">
                  <image class="discount_img"
                         src="http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/static/pay_discount.png">
                  </image>
                  <view class="vip_text">
                    V{{ siteItemData.gunPriceInfo.slowItem.marketing.payleMemerLevel }}
                  </view>
                </view>
                <view class="txt4">
                  {{ siteItemData.gunPriceInfo.slowItem.marketing.marketingFinaPriceStr }}
                  <view class="txt5">元/起</view>
                  <text
                      style="text-decoration: line-through;font-size: 24rpx;font-family: PingFang SC;font-weight: 500;color: #A6ABB3;">
                    {{ siteItemData.gunPriceInfo.slowItem.currentPriceStr }}元/起
                  </text>
                </view>
              </view>
              <view class="disFlex">
                <view class="txt2">
                  电费{{ siteItemData.gunPriceInfo.slowItem.currentPowerPriceStr }}元/度 | 服务费
                  <text>{{ siteItemData.gunPriceInfo.slowItem.marketing.marketingFinaServicePriceStr }}元/度</text>
                  <!-- <text style="text-decoration: line-through">{{ siteItemData.gunPriceInfo.slowItem.currentServicePriceStr }}元/度</text> -->
                </view>
              </view>
            </view>
            <view v-else>
              <view class="disFlex1" style="margin: 24rpx 0">
                <view class="txt3">当前价格</view>
                <view class="txt4"
                      v-if="siteItemData.gunPriceInfo.slowItem.discount||siteItemData.gunPriceInfo.slowItem.contractDiscount">
                  <view class="yuan">¥</view>
                  {{ siteItemData.gunPriceInfo.slowItem.discountPriceStr }}
                  <view class="txt5">起</view>
                  <view class="originalPrice">
                    ¥{{ siteItemData.gunPriceInfo.slowItem.currentPriceStr }}起
                  </view>
                </view>
                <view class="txt4" v-else>
                  <view class="yuan">¥</view>
                  {{ siteItemData.gunPriceInfo.slowItem.currentPriceStr }}
                  <view class="txt5">起</view>
                </view>
              </view>
              <view class="disFlex">
                <view class="txt2">
                  电费{{ siteItemData.gunPriceInfo.slowItem.currentPowerPriceStr }}元/度 |
                  服务费{{ siteItemData.gunPriceInfo.slowItem.currentServicePriceStr }}元/度
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 优惠说明 -->
        <view v-if="!marketingSwitch">
          <view class="explain" v-if="isToken">
            <view class="txt1">优惠说明</view>
            <view class="txt2"
                  v-if="!siteItemData.hasCoupons || ((memberType == 1 || memberType == 2) && siteItemData.hasCoupons)">
              暂无可适用卡券
            </view>
            <view class="disFlex" v-else @tap="goCardVoucher">
              <view>有可适用卡券</view>
              <image class="explainImg" src="/static/static/turn_act.png"></image>
            </view>
          </view>
          <view class="explain" v-else>
            <view class="txt1">优惠说明</view>
            <view class="txt2">暂无可适用卡券</view>
          </view>
        </view>

        <!-- 营销获客处理 -->
        <!-- 优惠说明 -->
        <view v-if="marketingSwitch && isToken">
          <view class="explain">
            <view class="txt1">优惠说明</view>
            <view class="txt2" v-if="!stationCouponDetail.enableCouponCount">暂无可适用卡券</view>
          </view>
          <!-- 可用卡券 -->
          <view class="discount_list" v-if="stationCouponDetail.enableCouponCount" @tap="cardCouponShowPopup">
            <view class="discount_type">
              <text>可用卡券</text>
            </view>
            <view class="discount_des">
              本站可用优惠券
              <text class="num_text">（{{ stationCouponDetail.enableCouponCount }}张）</text>
            </view>
            <view class="discount_img">
              <image
                  src="http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/homeSub/images/turn.png">
              </image>
            </view>
          </view>

          <view class="discount_line" v-if="stationCouponDetail.enableCouponCount"></view>

          <!-- 累计消费 -->
          <view class="discount_list" v-if="stationCouponDetail.consume" @tap="goCumulativeMoney"
                :data-hdid="stationCouponDetail.consume.activityDetail.id">
            <view class="discount_type">
              <text>累计消费</text>
            </view>
            <view class="discount_des discount_des_exceed">
              累计消费满
              <text class="num_text">{{ ljxfDetail.lowAmount }}元</text>
              ，

              <!-- 奖励方式 -->
              <text v-if="ljxfDetail.bonus">
                送奖励金
                <text class="num_text">{{ ljxfDetail.bonus }}元</text>
                ，
              </text>
              <text v-if="ljxfDetail.couponCount">
                送优惠券
                <text class="num_text">{{ ljxfDetail.couponCount }}张</text>
                ，
              </text>
              <text v-if="ljxfDetail.discount">
                送折扣
                <text class="num_text">{{ ljxfDetail.discount }}折</text>
                ，
              </text>
              <text v-if="ljxfDetail.integral">
                送积分
                <text class="num_text">{{ ljxfDetail.integral }}分</text>
                ，
              </text>
              <text v-if="ljxfDetail.serviceFeeCount">
                送免服务费
                <text class="num_text">{{ ljxfDetail.serviceFeeCount }}次</text>
                ，
              </text>

              <!-- 奖励方式最高 -->
              <text v-if="ljxfDetail.highestStatus == 1">
                <text v-if="ljxfDetail.highestBonus">
                  最高送奖励金
                  <text class="num_text">{{ ljxfDetail.highestBonus }}元</text>
                  ，
                </text>
                <text v-if="ljxfDetail.highestCouponCount">
                  最高送优惠券
                  <text class="num_text">{{ ljxfDetail.highestCouponCount }}张</text>
                  ，
                </text>
                <text v-if="ljxfDetail.highestDiscount">
                  最高送折扣
                  <text class="num_text">{{ ljxfDetail.highestDiscount }}折</text>
                  ，
                </text>
                <text v-if="ljxfDetail.highestIntegral">
                  最高送积分
                  <text class="num_text">{{ ljxfDetail.highestIntegral }}分</text>
                  ，
                </text>
                <text v-if="ljxfDetail.highestServiceFeeCount">
                  最高送免服务费
                  <text class="num_text">{{ ljxfDetail.highestServiceFeeCount }}次</text>
                  ，
                </text>
              </text>
            </view>
            <view class="discount_img">
              <image
                  src="http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/homeSub/images/turn.png">
              </image>
            </view>
          </view>

          <view class="discount_line" v-if="stationCouponDetail.consume"></view>

          <!-- 单笔折扣 -->
          <view class="discount_list" v-if="stationCouponDetail.single" @tap="goSingleMoney"
                :data-hdid="stationCouponDetail.single.activityDetail.id">
            <view class="discount_type">
              <text>单笔折扣</text>
            </view>
            <view class="discount_des">
              单笔消费满
              <text class="num_text">{{ dbzkDetail.lowAmount }}元</text>
              ，

              <!-- 奖励方式 -->
              <text v-if="dbzkDetail.bonus">
                送奖励金
                <text class="num_text">{{ dbzkDetail.bonus }}元</text>
                ，
              </text>
              <text v-if="dbzkDetail.couponCount">
                送优惠券
                <text class="num_text">{{ dbzkDetail.couponCount }}张</text>
                ，
              </text>
              <text v-if="dbzkDetail.discount">
                送折扣
                <text class="num_text">{{ dbzkDetail.discount }}折</text>
                ，
              </text>
              <text v-if="dbzkDetail.integral">
                送积分
                <text class="num_text">{{ dbzkDetail.integral }}分</text>
                ，
              </text>
              <text v-if="dbzkDetail.serviceFeeCount">
                送免服务费
                <text class="num_text">{{ dbzkDetail.serviceFeeCount }}次</text>
                ，
              </text>

              <!-- 奖励方式最高 -->
              <text v-if="dbzkDetail.highestStatus == 1">
                <text v-if="dbzkDetail.highestBonus">
                  最高送奖励金
                  <text class="num_text">{{ dbzkDetail.highestBonus }}元</text>
                  ，
                </text>
                <text v-if="dbzkDetail.highestCouponCount">
                  最高送优惠券
                  <text class="num_text">{{ dbzkDetail.highestCouponCount }}张</text>
                  ，
                </text>
                <text v-if="dbzkDetail.highestDiscount">
                  最高送折扣
                  <text class="num_text">{{ dbzkDetail.highestDiscount }}折</text>
                  ，
                </text>
                <text v-if="dbzkDetail.highestIntegral">
                  最高送积分
                  <text class="num_text">{{ dbzkDetail.highestIntegral }}分</text>
                  ，
                </text>
                <text v-if="dbzkDetail.highestServiceFeeCount">
                  最高送免服务费
                  <text class="num_text">{{ dbzkDetail.highestServiceFeeCount }}次</text>
                  ，
                </text>
              </text>
            </view>
            <view class="discount_img">
              <image
                  src="http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/homeSub/images/turn.png">
              </image>
            </view>
          </view>

          <view class="discount_line" v-if="stationCouponDetail.single"></view>

          <!-- 站点优惠 -->
          <view class="discount_list" v-if="stationCouponDetail.stationDiscount" @tap="goSiteOffers"
                :data-hdid="stationCouponDetail.stationDiscount.activityDetail.id">
            <view class="discount_type">
              <text>站点优惠</text>
            </view>
            <view class="discount_des">
              <text v-if="zdyhDetail.discountModel == 1">
                <text v-if="zdyhDetail.discountType == 1">
                  活动期间服务费单价为
                  <text class="num_text">{{ zdyhDetail.singleAmount }}元</text>
                  ，
                </text>

                <text v-if="zdyhDetail.discountType == 2">
                  活动期间服务费单价减
                  <text class="num_text">{{ zdyhDetail.singleReduceAmount }}元</text>
                  ，
                </text>

                <text v-if="zdyhDetail.discountType == 3">
                  活动期间服务费单价打
                  <text class="num_text">{{ zdyhDetail.singleDiscount }}折</text>
                  ，
                </text>
              </text>

              <text v-if="zdyhDetail.discountModel == 2">
                <text v-if="zdyhDetail.discountType == 4">
                  服务费总金额
                  <text class="num_text">{{ zdyhDetail.totalAchieveAmount }}元</text>
                  ，减
                  <text class="num_text">{{ zdyhDetail.totalReduceAmount }}元</text>
                  ，
                </text>

                <text v-if="zdyhDetail.discountType == 5">
                  服务费总金额
                  <text class="num_text">{{ zdyhDetail.totalAchieveAmount }}元</text>
                  ，打
                  <text class="num_text">{{ zdyhDetail.totalDiscount }}折</text>
                  ，
                </text>
              </text>

              <text v-if="zdyhDetail.discountModel == 3">
                <text v-if="zdyhDetail.discountType == 6">
                  充电量大于
                  <text class="num_text">{{ zdyhDetail.socPercentage }}%</text>
                  时，在电量
                  <text
                      class="num_text">{{ zdyhDetail.socStartPercentage }}%-{{ zdyhDetail.socEndPercentage }}%
                  </text>
                  时停止，总服务费打
                  <text class="num_text">{{ zdyhDetail.socDiscount }}折</text>
                </text>

                <text v-if="zdyhDetail.discountType == 7">
                  充电量大于
                  <text class="num_text">{{ zdyhDetail.socPercentage }}%</text>
                  时，在电量
                  <text
                      class="num_text">{{ zdyhDetail.socStartPercentage }}%-{{ zdyhDetail.socEndPercentage }}%
                  </text>
                  时停止，总服务费减
                  <text class="num_text">{{ zdyhDetail.socReduceAmount }}元</text>
                </text>
              </text>
            </view>
            <view class="discount_img">
              <image
                  src="http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/homeSub/images/turn.png">
              </image>
            </view>
          </view>
        </view>


        <!-- 停车费说明 -->
        <view class="explain2" v-if="siteItemData.subsidy">
          <view class="txt1">停车费说明</view>
          <rich-text class="txt2" :nodes="siteItemData.subsidy ? siteItemData.subsidy : '暂无'"></rich-text>
          <!-- <view>
      <view class="txt2">充电免费停车2小时<text style="font-size: 22rpx;">（充电启动前请确认绑定的车牌号是否准确）</text></view>
      <view class="disFlex">
        <view>08:00-22:00</view>
        <view class="money">16元/小时</view>
      </view>
      <view class="disFlex">
        <view>22:00-次日08:00</view>
        <view class="money">8元/小时</view>
      </view>
    </view> -->
        </view>


      </view>

      <placeholPileList :detail="siteItemData"></placeholPileList>
      <!-- 站点信息-info -->
      <view class="fotInfo">
        <view class="txt1">站点信息</view>
        <view class="txt2">
          支付方式
          <view class="type">微信支付</view>
        </view>
        <view class="txt2">
          资源类型
          <view class="type">{{ siteItemData.fastSlow }}</view>
        </view>
        <view class="txt2">
          运营单位
          <view class="type">{{ siteItemData.serviceOrg ? siteItemData.serviceOrg : '--' }}</view>
        </view>
        <!-- <view class="txt3">
                    客服电话
                    <view class="num" @tap="call">{{ siteItemData.managerPhone }}</view>
                </view> -->
      </view>


      <!-- 移动端优化 联系客服 -->
      <callPhone :siteItemData="siteItemData"></callPhone>

    </view>
    <!-- 底部按钮操作 -->
    <view class="fot-do">
      <view class="disFlex">
        <view class="mode"
              @tap="parseEventDynamicCode($event, siteItemData.isCollection ? 'cancelCollection' : 'collection')"
              :data-id="siteItemData.id" v-if="isToken">
          <image class="img"
                 :src="siteItemData.isCollection ? 'https://oos-cn.ctyunapi.cn/front-end/static/static/Collection_sel.png' : 'https://oos-cn.ctyunapi.cn/front-end/static/static/Collection.png'">
          </image>
          <view>收藏</view>
        </view>
        <view class="mode" @tap="goProblemFeedback" v-if="isToken">
          <image class="img" src="https://oos-cn.ctyunapi.cn/front-end/static/homeSub/images/refresh.png">
          </image>
          <view>反馈</view>
        </view>
        <view :class="siteItemData.business ? 'scanBtn' : 'scanBtn1'"
              @tap="parseEventDynamicCode($event, siteItemData.business ? 'goScanCode' : 'showTip')"
              v-if="!(isxmgjMix() || isnylH5())">扫码充电
        </view>
      </view>
    </view>

    <!-- 灰色遮罩，防止误触，可加可不加 -->
    <view class="mask" v-show="showDialog"></view>
    <!-- 自定义的弹窗 -->
    <view class="windows" v-if="showDialog">
      <view class="tips">确定取消收藏此站点吗</view>
      <view class="btn">
        <button class="Button1" @tap="onClick_1">
          <text class="word1">取消</text>
        </button>
        <button class="Button2" @tap="onClick_2">
          <text class="word2">确定</text>
        </button>
      </view>
    </view>

    <u-popup round='25' :show="showPrice" mode="bottom" position="bottom" @close="closePricePopupVisible"
             data-type="close" customClass="price_popup">
      <view class="box-info">
        <view class="title">电价收费详情</view>
        <view class="t1">
          <text>收费时段</text>
          <text>费用(元/度) = 电费 + 服务费</text>
        </view>
        <view class="list">
          <view class="item" :class="item.now?'active':''" v-for="(item,index) in powerStageDetail"
                :key="index">
            <view class="time">{{ item.currentStartTime }}-{{ item.currentEndTime }}</view>
            <text class="t1 active" v-if="item.discount">优惠价</text>
            <text class="t3 active" v-if="item.isCheapest">价格最低</text>
            <text class="t2 active" v-if="item.now">当前价</text>
            <!--            <text class="t2 active" v-if="item.isCheapest">当前价/最低价</text>-->

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
                  <text class="t1">{{ item.currentPriceStr }}</text>
                  <text>{{ item.currentPowerPriceStr }}</text>
                  <text>{{ item.currentServicePriceStr }}</text>
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
                             src="http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/static/geren_discount.png">
                      </image>
                    </view>
                    <view class="yhimg_box" v-if="item.marketing.payleMemerLevel != 0">
                      <image class="discount_img"
                             src="http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/static/pay_discount.png">
                      </image>
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
    </u-popup>


    <uni-popup ref="showCustomerPup" type="dialog">
      <!-- <view style="padding:100rpx 60rpx 60rpx;width:500rpx;border-radius: 16px;">
            <view class="dataInfo">联系客服：{{ siteItemData.managerPhone }}</view>
            <view class="dataInfo">工作时间：{{ siteItemData.serviceTime ? siteItemData.serviceTime : '暂无' }}</view>
            <view class="customerBtn">
                <view class="btn1" @tap="onCloseCustomer">取消</view>
                <view class="btn2" @tap="callCustomer">呼叫</view>
            </view>
      </view> -->
      <uni-popup-dialog type="info" cancelText="取消" confirmText="呼叫" title="温馨提示" @confirm="callCustomer"
                        @close="onCloseCustomer">
        <view>
          <view class="infoPopup">
            <view class="infoTitle">联系客服：</view>
            <text
                class="infoValue">{{ siteItemData.managerPhone }}
            </text>
          </view>
          <view class="infoPopup">
            <view class="infoTitle">工作时间：</view>
            {{ siteItemData.serviceTime ? siteItemData.serviceTime : '暂无' }}
          </view>
        </view>
      </uni-popup-dialog>
    </uni-popup>


    <!-- 可用卡券 -->
    <u-popup :show="cardCoupon" position="bottom" closeable @close="cardCouponClose"
             custom-style="border-radius:16rpx;margin:0 24rpx 37rpx;box-shadow: 4rpx 7rpx 20rpx 0rpx rgba(166,171,179,0.2400);padding:0 31rpx;background:#F5F7FA;overflow-y: scroll;">
      <view class="card_wrap">
        <view class="card_title">本站可用优惠券</view>
        <view class="card_list" style="max-height: 500rpx">
          <view class="card_item" @tap.stop.prevent="toCardCoupons" :data-id="items.id"
                v-for="(items, index) in cardCouponList" :key="index">
            <image class="card_bg"
                   :src="items.picture ? items.picture : 'http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/homeSub/images/line_bg.png'"
                   v-if="items.applyStationType == 1"></image>

            <image class="card_bg"
                   :src="items.picture ? items.picture : 'http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/homeSub/images/line_bg2.png'"
                   v-if="items.applyStationType == 2 || items.applyStationType == 3"></image>

            <view class="card_content">
              <view class="card_money">
                <view class="card_money_num">
                  ￥
                  <text>{{ items.couponAmount }}</text>
                </view>
                <view class="card_money_des" v-if="items.applyStationType == 1">通用</view>
                <view class="card_money_des"
                      v-if="items.applyStationType == 2 || items.applyStationType == 3">站点专属
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
                           src="http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/homeSub/images/icon1.png">
                    </image>
                    {{ items.receiveTime }}
                  </view>
                  <view>
                    <image class="card_riqi_icon"
                           src="http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/homeSub/images/icon2.png">
                    </image>
                    {{ items.expireTime }}
                  </view>
                </view>
              </view>
              <view class="card_xd">
                {{ items.applyStationTypeStr }}
                <image class="card_xd_icon"
                       src="http://oos-cn.ctyunapi.cn/front-end/static/marketingImg/homeSub/images/turn.png">
                </image>
              </view>
            </view>
          </view>
        </view>
      </view>
    </u-popup>

  </view>
</template>

<script>
// 'use strict';

import payMemberCard from '../../../components/payMemberCard/index.vue';

import callPhone from '../../components/callPhone/callPhone.vue';

// exports.__esModule = true; // homeSub/pages/siteDetail/siteDetail.ts
import placeholPileList from '../../../components/placeholPileList/placeholPileList.vue';

var app = getApp();

var scanCode = require('./../../../utils/scanCode.js');

var https_1 = require('./../../../api/https.js');

import {
  getStationCoupon,
  getStationDiscount,
  getStationPriceDiscount
} from '../../../api/marketing/stationListApi';

export default {
  components: {
    placeholPileList,

    callPhone,
    payMemberCard,
  },
  data() {
    return {
      sellerNo: app.globalData.sellerNo,
      otherIconListSync: [], // 拿缓存数据
      isToken: false,
      isF: true,
      showDialog: false,
      collectionId: 0,
      showPrice: false,
      powerStageDetail: [],
      siteItemData: {
        name: '',
        stationLabel: [],
        picArr: [],
        timeList: [],
        street: '',
        latitude: '',
        longitude: '',
        distance: '',
        notice: '',
        noticeStatus: '',

        gunPriceInfo: {
          superItem: {
            freeGunCount: '',
            gunCount: '',
            currentStartTime: '',
            currentEndTime: '',
            discount: '',
            currentPrice: '',
            currentPowerPrice: '',
            currentServicePrice: ''
          },

          fastItem: {
            freeGunCount: '',
            gunCount: '',
            currentStartTime: '',
            currentEndTime: '',
            discount: '',
            currentPrice: '',
            currentPowerPrice: '',
            currentServicePrice: ''
          },

          slowItem: {
            freeGunCount: '',
            gunCount: '',
            currentStartTime: '',
            currentEndTime: '',
            discount: '',
            currentPrice: '',
            currentPowerPrice: '',
            currentServicePrice: ''
          }
        },

        hasCoupons: '',
        parkingFeeDesc: '',
        managerPhone: '',
        id: '',
        isCollection: false,
        business: false,
        serviceTime: false
      },

      stationGunPriceInfo: {},
      imgList: [],
      id: '',
      stationId: '',
      memberType: '',


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

      ljxfDetail: {
        lowAmount: '',
        bonus: '',
        couponCount: '',
        discount: '',
        integral: '',
        serviceFeeCount: '',
        highestStatus: 0,
        highestBonus: '',
        highestCouponCount: '',
        highestDiscount: '',
        highestIntegral: '',
        highestServiceFeeCount: ''
      },

      dbzkDetail: {
        lowAmount: '',
        bonus: '',
        couponCount: '',
        discount: '',
        integral: '',
        serviceFeeCount: '',
        highestStatus: 0,
        highestBonus: '',
        highestCouponCount: '',
        highestDiscount: '',
        highestIntegral: '',
        highestServiceFeeCount: ''
      },

      zdyhDetail: {
        discountModel: 0,
        discountType: 0,
        singleAmount: '',
        singleReduceAmount: '',
        singleDiscount: '',
        totalAchieveAmount: '',
        totalReduceAmount: '',
        totalDiscount: '',
        socPercentage: '',
        socStartPercentage: '',
        socEndPercentage: '',
        socDiscount: '',
        socReduceAmount: ''
      },

      userTypes: '',
      stationCouponPriceDetail: {},
      showFeedback: true,
      yhsmBox: false,
      platformNo: '',
      hulianinterfaceId: ''
    };
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.stationId) {
      this.stationId = options.stationId
      this.platformNo = options.platformNo || ''
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.otherIconListSync = uni.getStorageSync('otherIconList')
    this.getStationDetail(this.stationId);
    this.memberType = uni.getStorageSync('memberType').toString()
    this.setData({
      isToken: uni.getStorageSync('token')
    });

    if (uni.getStorageSync('token')) {
      let userInfo = uni.getStorageSync('userInfo');
      console.log(userInfo);
      if (userInfo.memberType == 0) {
        this.userTypes = '1';
      } else {
        this.userTypes = '2';
      }
      this.memberType = uni.getStorageSync('memberType').toString()
      this.getStationCouponDetail();
      this.getStationDiscounts();
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  },
  methods: {
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
              console.log(this.cardCouponList, 'kkkqqqqq');
            }
          })
          .catch((err) => {
            console.log(err);
          });
    },

    //获取站点优惠说明
    getStationDiscounts() {
      getStationDiscount({
        stationId: this.stationId,
        userId: uni.getStorageSync('memberId'),
        userType: this.userTypes
      })
          .then((res) => {
            console.log(res.data, 'yhsm........');
            if (res.code == 200 && res.data) {
              this.setData({
                stationCouponDetail: res.data,
                ljxfDetail: res.data.consumeRewardMemo,
                dbzkDetail: res.data.singleRewardMemo,
                zdyhDetail: res.data.stationDiscount ? res.data.stationDiscount
                    .serviceFeeDiscountDetail : null,
                yhsmBox: true
              });
              console.log(this.ljxfDetail, '累计消费啊.......');
              console.log(this.dbzkDetail, '单笔折扣啊........');
              console.log(this.zdyhDetail, '站点优惠啊..............');
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
      console.log(e.currentTarget.dataset, 'llllllllll');
      uni.navigateTo({
        url: '/homeSub/pages/discount/cumulativeMoney/cumulativeMoney?HD=' +
            `${e.currentTarget.dataset.hdid}`
      });
    },

    // 单笔折扣
    goSingleMoney(e) {
      console.log(e.currentTarget.dataset, 'dddddddd');
      uni.navigateTo({
        url: '/homeSub/pages/discount/singleMoney/singleMoney?HD=' + `${e.currentTarget.dataset.hdid}`
      });
    },

    // 站点优惠
    goSiteOffers(e) {
      console.log(e.currentTarget.dataset, 'zzzzzzz');
      uni.navigateTo({
        url: '/homeSub/pages/discount/siteOffers/siteOffers?HD=' + `${e.currentTarget.dataset.hdid}`
      });
    },
    closePricePopupVisible() {
      this.showPrice = false
    },
    //获取站点详情(查询枪最低价格信息)
    getStationGunPriceDetail: function (gunId) {
      var that = this;
      console.log(gunId);
      https_1.getStationGunDetails(gunId).then((res) => {
        if (res.code == 0) {
          this.powerStageDetail = res.data?.powerStageDetail || [];
          let minPriceProduct = this.powerStageDetail[0]
          this.powerStageDetail.forEach(product => {
            if (product.currentPrice < minPriceProduct.currentPrice) {
              minPriceProduct = product;
            }
          });
          minPriceProduct.isCheapest = true
          that.showPrice = true
        }
      }).catch(err => {
        uni.showToast({
          title: err,
          icon: "none",
          duration: 2000,
        })
      })
    },
    //价格弹窗
    pricePopupVisible: function (e) {
      var that = this;
      var type = e.currentTarget.dataset.type;
      var gunid = e.currentTarget.dataset.gunid;
      if (type === 'open') {
        this.getStationGunPriceDetail(gunid);
      } else {
        this.showPrice = false
      }
    },
    // 扫码
    async goScanCode() {
      // scanCode.stateOfCharge();
      //#ifdef APP-PLUS
      let result = await this.$store.dispatch("requestPermissions", 'CAMERA')
      if (result !== 1) {
        return
      } else {
        if (uni.getStorageSync('token')) {
          scanCode.stateOfCharge()
        } else {
          scanCode.scanCode()
        }
      }
      //#endif
      //#ifdef MP-WEIXIN
      if (uni.getStorageSync('token')) {
        scanCode.stateOfCharge()
      } else {
        scanCode.scanCode()
      }
      //#endif
    },

    showTip: function () {
      uni.showModal({
        title: '信息提示',
        content: '休息中',
        showCancel: false
      });
    },

    //获取站点详情
    getStationDetail: function (stationId) {
      let getStationDetailById = uni.getStorageSync('token') ? https_1
          .getStationDetailByIdNew : https_1
          .getStationDetailByIdNotAuth
      var that = this;
      getStationDetailById({
        stationId: stationId,
        latitude: uni.getStorageSync('latitude'),
        longitude: uni.getStorageSync('longitude')
      })
          .then(function (res) {
            if (res.code == 0) {
              res.data.noticeStatus = (res.data?.notice?.length >= 44) ? true : false
              //值小数点大于4位就保留4位小数
              if (res.data.gunPriceInfo.fastItem) {
                if (String(res.data.gunPriceInfo.fastItem.currentPrice).split(".").length > 1 &&
                    String(res.data.gunPriceInfo.fastItem.currentPrice).split(".")[1].length >= 4
                ) {
                  res.data.gunPriceInfo.fastItem.currentPrice = Number(res.data.gunPriceInfo
                      .fastItem.currentPrice).toFixed(4)
                }
              }
              if (res.data.gunPriceInfo.slowItem) {
                if (String(res.data.gunPriceInfo.slowItem.currentPrice).split(".").length > 1 &&
                    String(res.data.gunPriceInfo.slowItem.currentPrice).split(".")[1].length >= 4
                ) {
                  res.data.gunPriceInfo.slowItem.currentPrice = Number(res.data.gunPriceInfo
                      .slowItem.currentPrice).toFixed(4)
                }
              }
              if (res.data.gunPriceInfo.superItem) {
                if (String(res.data.gunPriceInfo.superItem.currentPrice).split(".").length > 1 &&
                    String(res.data.gunPriceInfo.superItem.currentPrice).split(".")[1].length >= 4
                ) {
                  res.data.gunPriceInfo.superItem.currentPrice = Number(res.data.gunPriceInfo
                      .superItem.currentPrice).toFixed(4)
                }
              }
              that.siteItemData = res.data,
                  that.siteItemData.tagList = that.siteItemData.tagList;
              res.data.picArr = JSON.parse(res.data.picArr)
              that.imgList = res.data.picArr && res.data.picArr.length > 0 ? res.data.picArr : (res
                  .data.detailsImages ? res.data.detailsImages.map(item => ({
                url: item
              })) : []) || []
              that.id = res.data.id
              that.platformNo = res.data.equipChannelId || ''
              that.hulianinterfaceId = res.data.hulianinterfaceId || ''

              //页面加载最慢的请求结束后再显示
              that.pageApiObj = true
            }
          });
    },

    //附近站点
    goNearbyStations: function (e) {
      var stationsStreet = e.currentTarget.dataset.name;
      uni.redirectTo({
        url: '../../../pages/siteList/siteList?stationsStreet=' + stationsStreet
      });
    },

    //取消-弹窗
    onClick_1: function () {
      this.showDialog = false
    },

    //调起-弹窗
    cancelCollection: function (e) {
      var that = this;
      app.globalData.CHECK_LOGIN(function () {
        that.collectionId = e.currentTarget.dataset.id,
            that.showDialog = true
      });
    },

    //确定取消收藏-弹窗
    onClick_2: function () {
      var that = this;
      https_1.cancelCollectStation(this.collectionId).then(function (res) {
        if (res.code == 0) {
          var data = that.siteItemData;
          data.isCollection = false;
          that.siteItemData = data,
              that.showDialog = false
        }
      });
    },

    //收藏
    collection: function (e) {
      var that = this;
      app.globalData.CHECK_LOGIN(function () {
        var id = e.currentTarget.dataset.id;
        https_1.collectStation(id).then(function (res) {
          if (res.code == 0) {
            var data = that.siteItemData;
            data.isCollection = true;
            that.siteItemData = data,
                that.showDialog = false
          }
        });
      });
    },

    //跳转卡券中心
    goCardVoucher: function () {
      // uni.navigateTo({
      //     url: '../../../mine/pages/cardVoucher/cardVoucher'
      // });

      console.log(this.marketingSwitch);
      if (this.marketingSwitch) {
        uni.navigateTo({
          url: '../../../mine/pages/cardVoucherYx/cardVoucherYx'
        });
      } else {
        uni.navigateTo({
          url: '../../../mine/pages/cardVoucher/cardVoucher'
        });
      }
    },

    //反馈
    goProblemFeedback: function () {
      // uni.navigateTo({
      //     url: '../../../mine/pages/problemFeedback/problemFeedback?feedbackType=other' + '&stationId=' + this.id
      // });
      uni.navigateTo({
        url: '../../../mine/pages/customer/customer'
      })
    },

    call: function () {
      this.$refs.showCustomerPup.open()
    },

    onCloseCustomer: function () {
      this.$refs.showCustomerPup.close()
    },

    //客服电话
    async callCustomer() {
      this.$refs.showCustomerPup.close()
      //#ifdef APP-PLUS
      let result = await this.$store.dispatch("requestPermissions", 'CALL_PHONE')
      if (result !== 1) {
        return
      } else {
        uni.makePhoneCall({
          phoneNumber: this.siteItemData.managerPhone
        });
      }
      //#endif
      //#ifdef MP-WEIXIN
      uni.makePhoneCall({
        phoneNumber: this.siteItemData.managerPhone
      });
      //#endif

    },

    // 导航
    goAddress: function (e) {
      // console.log("导航",e)
      var latitude = parseFloat(e.currentTarget.dataset.latitude);
      var longitude = parseFloat(e.currentTarget.dataset.longitude);
      var name = e.currentTarget.dataset.name;
      var street = e.currentTarget.dataset.street;
      uni.openLocation({
        latitude: latitude,
        longitude: longitude,
        name: name,
        address: street
      });
    },

    //图片预览
    seeImg: function (e) {
      var indx = e.currentTarget.dataset.index; // 找到点击图片的索引位置

      uni.previewImage({
        current: this.imgList[indx].url,
        urls: this.imgList.map(item => item.url) // 需要预览的图片http链接列表
      });
    },

    //展开  收起
    change: function () {
      var that = this;
      that.isF = !that.isF
    },

    //价格详情
    goPriceDetail: function () {
		console.log('/echartsPages/pages/priceDetail/priceDetail?stationId=' + this.stationId +
            "&platformNo=" + this.platformNo + "&hulianinterfaceId=" + this.hulianinterfaceId)
      uni.navigateTo({
        url: '/echartsPages/pages/priceDetail/priceDetail?stationId=' + this.stationId +
            "&platformNo=" + this.platformNo + "&hulianinterfaceId=" + this.hulianinterfaceId
      });
    }
  }
};
</script>
<style lang="less" scoped>
@import url('./siteDetail.less');

.pages-wrap {
  padding-bottom: 100rpx;
}

// 累计消费
.discount_list {
  display: flex;
  align-items: center;
  margin: 20rpx 0;

  .discount_type {
    width: 150rpx;
    height: 48rpx;
    background: linear-gradient(-10deg, #FFEFDF, #F7D0A8);
    border-radius: 24rpx;
    text-align: center;

    text {
      font-size: 24rpx;
      font-family: PingFang;
      font-weight: bold;
      color: #A56332;
    }
  }

  .discount_des_exceed {
    //超出省略号
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .discount_des {
    width: 445rpx;
    line-height: 36rpx;
    margin-left: 15rpx;

    font-size: 24rpx;
    font-family: PingFang;
    font-weight: 500;
    color: #909399;

    .num_text {
      color: #FC724C;
    }


  }

  .discount_img {
    margin-left: 15rpx;

    image {
      width: 14rpx;
      height: 25rpx;
    }
  }
}

// 虚线
.discount_line {
  border-bottom: 0.5rpx dashed #DCDFE6;
}

.price_popup {
  width: 702rpx !important;
  //height: 700rpx;
  margin: 0 24rpx 26rpx 24rpx;
  background: linear-gradient(0deg, #ffffff, #f4f6f8);
  border: 2rpx solid #ffffff;
  box-shadow: 4rpx 7rpx 20rpx 0rpx rgba(166, 171, 179, 0.24);
  border-radius: 16rpx;
}


.box-info {
  width: 680rpx;
  height: 1000rpx;
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

      & > .t3 {
        width: 110rpx;
        height: 40rpx;
        line-height: 40rpx;
        text-align: center;
        display: none;
        background: #17c8a1;
        border-radius: 0px 20rpx 20rpx 0px;
        color: #fff;
        font-size: 26rpx;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
      }

      .t2.active,
      .t3.active,
      .t1.active {
        display: block;
      }

      .right-item {

        .type1,
        .type2 {
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


// 可用卡券
.card_wrap {
  .card_title {
    font-size: 34rpx;
    font-family: PingFang;
    font-weight: bold;
    color: #303133;
    width: 100%;
    text-align: center;
    margin-top: 39rpx;
  }

  .card_list {
    margin: 39rpx 0;

    .card_item {
      width: 100%;
      height: 223rpx;
      position: relative;
      margin-bottom: 16rpx;

      .card_bg {
        position: absolute;
        width: 100%;
        height: 223rpx;
      }

      .card_content {
        position: absolute;
        z-index: 1;
        display: flex;
        height: 100%;

        .card_money {
          width: 220rpx;
          text-align: center;
          padding: 65rpx 0;

          //    background: yellow;
          .card_money_num {
            font-size: 26rpx;
            font-family: PingFang;
            font-weight: bold;
            color: #FFFFFF;

            > text {
              font-size: 46rpx;
            }
          }

          .card_money_des {
            margin-top: 10rpx;
            font-size: 26rpx;
            font-family: PingFang;
            font-weight: 500;
            color: #FFFFFF;
          }
        }

        .card_riqi {
          width: 265rpx;
          padding: 32rpx 0;
          padding-left: 22rpx;

          //    background: pink;
          .card_riqi_title {
            font-size: 34rpx;
            font-family: PingFang;
            font-weight: bold;
            color: #303133;
          }

          .card_riqi_des {
            margin: 15rpx 0;
            font-size: 26rpx;
            font-family: PingFang;
            font-weight: 500;
            color: #606266;
          }

          .card_riqi_riqi {
            line-height: 36rpx;

            > view {
              font-size: 24rpx;
              font-family: PingFang;
              font-weight: 500;
              color: #909399;
              width: 105%;

              .card_riqi_icon {
                width: 18rpx;
                height: 18rpx;
              }
            }
          }
        }

        .card_xd {
          padding: 36rpx 0;
          font-size: 24rpx;
          font-family: PingFang;
          font-weight: 500;
          color: #909399;

          .card_xd_icon {
            width: 12rpx;
            height: 21rpx;
          }
        }
      }
    }
  }
}


/*站点优惠价格样式*/
.yhimg_box {
  width: 40rpx;
  height: 40rpx;
  margin-right: 12rpx;
  position: relative;
  margin-left: 32rpx;

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
</style>

<template>
	<view class="page-container">
		<!-- 自定义导航栏 -->
		<uv-navbar 
			:fixed="true"
			:safeAreaInsetTop="true"
			:placeholder="true"
			bgColor="transparent"
			:border="false"
			:autoBack="false"
			@leftClick="onNavbarLeftClick"
			@rightClick="onNavbarRightClick"
		>
			<template v-slot:left>
				<view class="navbar-left" @click="goToCityPicker">
					<text class="city-text">{{ getCityName() }}</text>
					<uv-icon name="arrow-down" color="#0F172A" size="16"></uv-icon>
				</view>
			</template>
			
			<template v-slot:center>
				<view class="navbar-center">
					<uv-search 
						:showAction="false" 
						placeholder="请输入站点名称" 
						disabled 
						bgColor="#FFFFFF"
						custom-style="width: 330rpx;"
						@click="goToSearch" 
						:boxStyle="{
							borderRadius: '40rpx',
							height: '50rpx'
						}"
					></uv-search>
				</view>
			</template>
			
		</uv-navbar>
		
		<!-- 充电状态栏 -->
		<ChargingStatusBar 
			:chargeData="currentChargeData"
		/>
		<!-- 可滚动内容区域 -->
		<scroll-view class="content-container" scroll-y @scrolltolower="loadMore">
			<view class="swiper-view">
				<view class="swiper-view-item">
					<!-- banner -->
					<view v-if="lunbao.length">
					<swiper class="swiper-banner" :indicator-dots="indicatorDots" :autoplay="autoplay"
						:circular="circular" :vertical="vertical" :interval="interval" :duration="duration"
						indicator-color="rgba(255, 255, 255, 0.4)" indicator-active-color="#fff">
						<!-- <view > -->
						<swiper-item v-for="(item, index) in lunbao" :key="index" @tap="advertisingLink"
							:data-title="item.title" :data-status="item.status" :data-time="item.timeS"
							:data-link="item.advertisingLink" :data-type="item.connectionType"
							:data-path="item.mobilePath" :data-details="item.details" :data-id="item.id"
							:data-mid="item.marketingId">
							<image :src="item.image" mode="aspectFill" class="swiper-item-images" />
						</swiper-item>
						<!-- </view> -->
					</swiper>
					</view>
					<view v-else>
						<view class="charge-card">
							<view class="card-content">
								<text class="title">星光超充</text>
								<text class="sub-title">加盟热线 400-633-1838</text>
							</view>
							<view style="display: flex; justify-content: flex-start;">
								<button class="check-btn" @click="callPhone">拨打电话</button>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="head-nav">
					<view class='nav'>
						<uv-subsection 
							:list="tabMenu" 
							:current="tabIndex" 
							@change="ontabtap"
							activeColor="#fff"
							inactiveColor="#6A6266"
							mode="button"
							:bold="true"
							bgColor="transparent"
							:fontSize="14"
							custom-style="height: 75rpx;border-radius: 40rpx;" 
							custom-item-style="border-radius: 40rpx; background-color: #3B82F6;" 
						></uv-subsection>
					</view>
					<view class="filter" @click="openFilterPopup">
						<image class="filter-img" src="https://oos-cn.ctyunapi.cn/front-end/static/static/screening.png"></image>
						<text style="color: #6A6266;">筛选</text>
					</view>
				</view>
			<view class="list-container">
				<uv-list :customStyle="{'backgroundColor': 'transparent'}">
					<uv-list-item  :customStyle="{'backgroundColor': 'transparent', 'padding': '0', 'borderRadius': '16rpx'}" v-for="(item, index) in stationList" :key="index">
						<StationListItem 
							:stationData="item"
							@click="onStationClick"
							@favorite="onStationFavorite"
						/>
					</uv-list-item>
					<uv-load-more 
						:status="loadStatus" 
						@loadmore="onLoadMore"
						loadmore-text="上拉或点击加载更多"
						loading-text="正在加载..."
						nomore-text="没有更多数据了"
						:margin-top="20"
						:margin-bottom="20"
					/>
				</uv-list>
			</view>
			<!-- 底部安全区域 -->
			<view class="bottom-safe-area"></view>
		</scroll-view>
		
		<!-- 筛选弹窗 -->
		<uv-popup ref="filterPopup" mode="bottom" :round="20" :safeAreaInsetBottom="true">
			<view class="filter-popup-content">
				<!-- 筛选标题栏 -->
				<view class="filter-header">
					<text class="filter-title">筛选条件</text>
					<uv-icon name="close" size="20" @click="closeFilterPopup"></uv-icon>
				</view>
				
				<!-- 筛选内容 -->
				<view class="filter-content">
					<!-- 距离筛选 -->
					<FilterOptions 
						:data="distanceList" 
						:defaultValue="selectedDistance"
						@change="onDistanceChange"
					/>
					
					<!-- 站点类型筛选 -->
					<FilterOptions 
						:data="stationTypeList" 
						:defaultValue="selectedStationType"
						@change="onStationTypeChange"
					/>
					
					<!-- 充电模式筛选 -->
					<FilterOptions 
						:data="chargingModeList" 
						:defaultValue="selectedChargingMode"
						@change="onChargingModeChange"
					/>
					
					<!-- 建设场所筛选 -->
					<FilterOptions 
						:data="constructionSiteList" 
						:defaultValue="selectedConstructionSite"
						@change="onConstructionSiteChange"
					/>
					
					<!-- 优惠筛选 -->
					<FilterOptions 
						:data="discountList" 
						:defaultValue="selectedDiscount"
						@change="onDiscountChange"
					/>
				</view>
				
				<!-- 筛选底部按钮 -->
				<view class="filter-footer">
					<button class="reset-btn" @click="resetFilters">重置</button>
					<button class="confirm-btn" @click="confirmFilter">确定</button>
				</view>
			</view>
		</uv-popup>
		
		<!-- 悬浮账单提醒 -->
		<FloatingBillReminder 
			:visible="showBillReminder"
			:billCount="unpaidBillCount"
			@click="handleBillReminderClick"
		/>
		
		<!-- 超时占位订单弹窗 -->
		<OccupyBillPopup 
			ref="occupyBillPopup"
			:billData="occupyBillData"
			@close="handleOccupyPopupClose"
			@later="handleOccupyPopupLater"
			@pay="handleOccupyPopupPay"
		/>
		
		<!-- 固定底部导航 -->
		<Tabbar :activeId="0"></Tabbar>
		<loginPopup ref="loginPopup"></loginPopup>
	</view>
</template>

<script>
	import Tabbar from '@/components/tabbar/tabbar';
	import StationListItem from '@/components/station/StationListItem.vue';
	import { getStationArea, getIndexStationNew, getIndexStationNoAuth } from '@/api/station.js';
	import FilterOptions from '@/components/FilterOptions/FilterOptions.vue';
	import FloatingBillReminder from '@/components/floating-bill-reminder/floating-bill-reminder.vue';
	import OccupyBillPopup from '@/components/occupy-bill-popup/occupy-bill-popup.vue';
	import ChargingStatusBar from '@/components/charging-status-bar/ChargingStatusBar.vue';
	import { getMyNotPayBillNumber, queryDynamicsActivity } from '@/api/member.js';
	import { getMyOccupyBillPage } from '@/api/bill.js';
	import { pageChargeServiceMonitor } from '@/api/charge.js';
	import globalData from '@/globalData.js';
	import { contactCustomerService as contactCustomerServiceFn } from '@/utils/utils';
	export default {
		components: {
			Tabbar,
			StationListItem,
			FilterOptions,
			FloatingBillReminder,
			OccupyBillPopup,
			ChargingStatusBar
		},
		data() {
			return {
				stationList: [],
				loadStatus: 'loadmore', // loadmore-加载前, loading-加载中, nomore-没有更多数据
				// 悬浮账单提醒相关
				showBillReminder: false,
				unpaidBillCount: 0,
				// 超时占位订单相关
				occupyBillData: null,
				// 充电服务监控定时器
				chargeMonitorTimer: null,
				// 充电状态数据
				currentChargeData: null,
				bar_Height: uni.getSystemInfoSync().statusBarHeight,
				widnowH: uni.getSystemInfoSync().screenHeight,
				tabMenu: [{
					name: '全部站场',
					value: 2
				}, {
					name: '精选站点',
					value: 1
				}],
				navIndex: 2,
				tabIndex: 0,
				scrollInto: "",
				// 轮播图数据
				lunbao: [],
				// 轮播图配置
				indicatorDots: true,
				autoplay: true,
				circular: true,
				vertical: false,
				interval: 3000,
				duration: 500,
				// 分页相关参数
				currentPage: 1,       // 当前页码
				pageSize: 10,         // 每页数量
				totalCount: 0,        // 总数据量
				hasMore: true,        // 是否还有更多数据
				isLoadingMore: false,  // 防止重复加载的标志位
				isTabTapLoading: false, // 点击tab时的加载标志位
				
				// 筛选相关数据
				selectedDistance: null,
				selectedStationType: null,
				selectedChargingMode: null,
				selectedConstructionSite: null,
				selectedDiscount: null,
				selectedDistanceInfo: null,
				selectedStationTypeInfo: null,
				selectedChargingModeInfo: null,
				selectedConstructionSiteInfo: null,
				selectedDiscountInfo: null,
				
				// 城市信息
				currentCityName: '东莞市', // 默认城市
				cityName: '东莞市', // 默认城市
				
				// 距离筛选数据
				distanceList: {
					name: '距离',
					list: [{
						value: '不限',
						key: null
					}, {
						value: '1KM',
						key: 1
					}, {
						value: '3KM',
						key: 3
					}, {
						value: '5KM',
						key: 5
					}, {
						value: '10KM',
						key: 10
					}, {
						value: '20KM',
						key: 20
					}, {
						value: '50KM',
						key: 50
					}, {
						value: '100KM',
						key: 100
					}]
				},
				
				// 站点类型筛选数据
				stationTypeList: {
					name: '站点类型',
					list: [{
					value: '不限',
					key: null
					}, {
					value: '公共',
					key: 1
					}, {
					value: '个人',
					key: 2
					}, {
					value: '公交',
					key: 3
					}, {
					value: '环卫',
					key: 4
					}, {
					value: '物流',
					key: 5
					}, {
					value: '出租车',
					key: 6
					}, {
					value: '其他',
					key: 7
					}]
				},
				
				// 充电模式筛选数据
				chargingModeList: {
					name: '充电模式',
					list: [{
						value: '不限',
						key: null
					}, {
						value: '超充',
						key: 'overTake'
					}, {
						value: '快充',
						key: 'kuai'
					}, {
						value: '慢充',
						key: 'man'
					}]
				},
				
				// 建设场所筛选数据
				constructionSiteList: {
					name: '建设场所',
					list: [{
						value: '不限',
						key: null
					}, {
						value: '居民区',
						key: 1
					}, {
						value: '公共机构',
						key: 2
					}, {
						value: '企事业单位',
						key: 3
					}, {
						value: '写字楼',
						key: 4
					}, {
						value: '工业园区',
						key: 5
					}, {
						value: '交通枢纽',
						key: 6
					}, {
						value: '大型文体设施',
						key: 7
					}, {
						value: '城市绿地',
						key: 8
					}, {
						value: '大型建筑配件停车场',
						key: 9
					}, {
						value: '路边停车位',
						key: 10
					}, {
						value: '城际高速服务区',
						key: 11
					}, {
						value: '其他',
						key: 12
					}]
				},
				
				// 优惠筛选数据
				discountList: {
					name: '优惠',
					list: [{
						value: '不限',
						key: 2
					}, {
						value: '有优惠',
						key: 3
					}, {
						value: '无优惠',
						key: 5
					}]
				}
			}
		},
		onLoad(options) {
			// this.initCityInfo();
			// this.getLocation();
			// this.queryDynamicsActivity();
			uni.hideTabBar();
			console.log("打印数据1q", options, options.q)
			var that = this;

			var url = decodeURIComponent(options.q);
			const code = url.trim()

			// 提取域名部分
			const domain = code.split("/")[2];
			console.log('地址' + code)
			console.log('域名' + domain)
			// 要兼容老扫码
			if (domain != null && (domain.endsWith("cc.gy-ev.com") || domain.endsWith("xgcc.cc") || domain.endsWith(
					"saas.gy-ev.com"))) {
				let sellerNoGy = "";
				let pileNo = "";
				let gunNoI = "";

				// 1. 先解码 URL（避免特殊字符问题，小程序中必加）
				const decodedCode = decodeURIComponent(code);

				// 2. 拆分「路径部分」和「查询参数部分」（只关注 gunNo，忽略 connectorid）
				let pathPart = decodedCode;
				let queryPart = "";
				const queryStartIndex = decodedCode.indexOf("?") !== -1 ? decodedCode.indexOf("?") : decodedCode
					.indexOf(
						"&");

				if (queryStartIndex !== -1) {
					pathPart = decodedCode.slice(0, queryStartIndex); // 路径：http://cc.gy-ev.com/10600102
					queryPart = decodedCode.slice(queryStartIndex + 1); // 查询参数：gunNo=0&connectorid=0000
				}

				// 3. 解析查询参数：只提取 gunNo（忽略 connectorid）
				if (queryPart) {
					// 小程序高版本（基础库 ≥2.21.0）用原生 API
					if (typeof URLSearchParams !== "undefined") {
						const params = new URLSearchParams(queryPart);
						gunNoI = params.get("gunNo") || ""; // 只拿 gunNo，其他参数不管
					}
					// 小程序低版本（基础库 <2.21.0）手动解析（只找 gunNo）
					else {
						const paramArr = queryPart.split("&");
						for (const item of paramArr) {
							const [key, value] = item.split("=");
							if (key === "gunNo") { // 只处理 gunNo，忽略 connectorid
								gunNoI = value || "";
								break; // 找到就退出，不用遍历其他参数
							}
						}
					}
				}

				// 4. 解析路径部分（获取桩号和商户号，保留原有逻辑）
				const pathSegments = pathPart.split("/");
				const lastPathSegment = pathSegments.pop() || "";

				// 情况1：路径最后一段是纯数字（含 "路径+参数" 和 原 "纯数字单路径"）
				if (/^\d+$/.test(lastPathSegment)) {
					sellerNoGy = "cy"; // 固定商户号（按业务调整）
					pileNo = lastPathSegment; // 纯数字直接当桩号（无需截取）

					// 若查询参数中没拿到 gunNo，再用原逻辑截取（兼容旧格式）
					if (!gunNoI) {
						pileNo = lastPathSegment.slice(0, lastPathSegment.length - 2);
						gunNoI = lastPathSegment.slice(lastPathSegment.length - 2);
						gunNoI =  that.decrementGunNumber(gunNoI).toString(); // 原逻辑的枪号递减（按需保留）
					}
				}
				// 情况2：原有 "/商家/桩号_枪号" 格式
				else {
					sellerNoGy = pathSegments[3] || "";
					[pileNo, gunNoI] = lastPathSegment.split("_");
					if (lastPathSegment.split("_").length === 1) {
						pileNo = pathSegments.pop() || "";
						gunNoI = lastPathSegment;
					}
				}

				// 5. 原有逻辑：shicheng 商户枪号减1
				if (sellerNoGy === "shicheng" && gunNoI) {
					gunNoI = (parseInt(gunNoI) - 1).toString();
				}

				console.log(pileNo, '编码');
				console.log(sellerNoGy, '商户');
				console.log(gunNoI, '枪号');
				console.log(globalData, '域名')
				if ((globalData.sellerNo == 'xg' || sellerNoGy == globalData.sellerNo) && pileNo !== '' &&
					gunNoI !== '' && !isNaN(parseInt(
						gunNoI))) {
					// ('未能识别二维码2')
					// const requestParams = this.handleRequestParams(url)
					const requestParams = {
						pileNo: pileNo, // 枪编号
						gunNo: gunNoI // 桩编号
					}
					// 扫桩枪二维码充电
					this.goTerminalDetails(requestParams)
				} else {
					uni.showModal({
						title: '提示',
						content: '未能识别的二维码',
						showCancel: false
					});
				}
			} else if (domain != null && domain.endsWith("gy-ev.com")) {
				const requestParams = this.handleRequestParams(url)
				const {
					parkNumber,
					lineNum,
					carPortCode,
					gunNo
				} = requestParams
				if (gunNo) {
					// 扫桩枪二维码充电
					this.goTerminalDetails(requestParams)
				} else {
					uni.showModal({
						title: '提示',
						content: '未能识别的二维码',
						showCancel: false
					});
				}
			}
		},
		async onShow() {
			uni.showLoading({
				title: '定位中...',
				mask: true
			});
			try {
				if (!uni.getStorageSync('cityName')) {
					uni.setStorageSync('cityName', this.cityName);
				}
				await this.checkLocationPermission();
				uni.hideLoading();
				this.initCityInfo();
				// 确保定位完成后再调用 fetchStationList
				await this.fetchStationList();
			} catch (error) {
				console.error('定位失败:', error);
				uni.hideLoading();
				this.initCityInfo();
				// 即使定位失败，也尝试获取站点列表（使用默认位置）
				await this.fetchStationList();
			}
			this.checkUnpaidBills();
			this.checkOccupyBills();
			this.checkChargeServiceMonitor();
			this.queryDynamicsActivity();
			
			// 临时测试模拟数据
			// setTimeout(() => {
			// 	this.currentChargeData = {
			// 		billNo: "1000003014",
			// 		busType: null,
			// 		carBatteryTemperature: null,
			// 		carsSelfNumber: "",
			// 		chargeBalance: "0.24",
			// 		chargePolicy: null,
			// 		chargeTime: 0,
			// 		chargingTime: "3600", // 改为3600秒，即1小时，这样能看到时间格式化效果
			// 		condictionKey: null,
			// 		current: "10.0",
			// 		groupName: null,
			// 		gunName: "A",
			// 		gunNo: "0",
			// 		gunTemperature: "2.0",
			// 		memberId: 215001,
			// 		memberName: "微信充电用户_3954",
			// 		memberNo: "15576753954",
			// 		memberType: 1,
			// 		pileId: 5901,
			// 		pileName: "广源05",
			// 		pileNo: "12345671231234",
			// 		pileTypeName: null,
			// 		plateno: "京888889",
			// 		power: "0.006",
			// 		retainTime: 1800, // 改为1800秒，即30分钟
			// 		soc: 85, // 改为85%，这样更真实
			// 		starsoc: 0,
			// 		startDateTime: 0,
			// 		startTime: "2025-09-27 16:58:21",
			// 		stationId: 1135,
			// 		stationName: "TEST",
			// 		vin: "",
			// 		voltage: "221.4",
			// 		vpower: "-2080967"
			// 	};
			// }, 1000); // 延迟1秒设置，确保其他初始化完成
		},
		onReady() {
			// 页面准备完成
		},
		// 页面触底时触发
		onReachBottom() {
			console.log('触底加载更多', {
				loadStatus: this.loadStatus,
				hasMore: this.hasMore,
				currentPage: this.currentPage,
				totalCount: this.totalCount,
				listLength: this.stationList.length,
				isLoadingMore: this.isLoadingMore
			});
			
			// 防止重复触发，只有在可以加载更多的状态下才触发
			if (this.loadStatus === 'loadmore' && this.hasMore && !this.isLoadingMore) {
				this.isLoadingMore = true;
				this.fetchStationList(true);
			} else if (this.loadStatus === 'loading' || this.isLoadingMore) {
				console.log('正在加载中，忽略触底事件');
			} else if (!this.hasMore) {
				console.log('没有更多数据，忽略触底事件');
			}
		},
		// 下拉刷新
		onPullDownRefresh() {
			console.log('下拉刷新');
			this.refreshData();
		},
		// 页面隐藏时清除定时器
		onHide() {
			this.clearChargeMonitorTimer();
		},
		// 页面销毁时清除定时器
		onUnload() {
			this.clearChargeMonitorTimer();
		},
		methods: {    // 定义命名方法
			// 枪号减一操作
			decrementGunNumber(gunNoStr) {
				const gunNoInt = parseInt(gunNoStr, 10);
				if (isNaN(gunNoInt)) {
					console.error("枪号不是有效的数字");
					return null;
				}
			
				const decrementedGunNo = gunNoInt - 1;
			
				// 返回减一后的结果，不再保持两位数
				return decrementedGunNo;
			},
			goTerminalDetails(theRequest) {
				// var theRequest = {
				//   pileNo: '',
				//   gunNo: ''
				// };
				// var str = url.split("?")[1];
				// let strs = str.split("&");
				// for (var i = 0; i < strs.length; i++) {
				//   theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
				// }
				if (theRequest.pileNo && theRequest.gunNo) {
					this.wxScanCodeLogin(
						`/pages/charge/gunStartingCharge?pileNum=${theRequest.pileNo}&gunNo=${theRequest.gunNo}&platformNo=${theRequest.platformNo}`
					)
					// app.globalData.CHECK_LOGIN(function() {
					// uni.navigateTo({
					//   url: '../../homeSub/pages/terminal/gunDetail/gunDetail?pileNo=' + theRequest.pileNo + '&gunNo=' + theRequest.gunNo
					// })
					// })
				}
			},
			wxScanCodeLogin(url) {
				if (uni.getStorageSync('token')) {
					uni.navigateTo({
						url
					})
				} else {
					uni.navigateTo({
						url: `/pages/login/login`
					})
				}
			},
			getWxAppName() {
				return globalData.wxAppName;
			},
			goToTestPage() {
				uni.navigateTo({
					url: `/pages/coupon/useCoupon?billId=${12244308}`
				});
			},

			getCityName() {
				return uni.getStorageSync('cityName') || this.cityName;
			},
			
			// 获取轮播图数据
			async queryDynamicsActivity() {
				const that = this;
				let cityName = uni.getStorageSync('cityName') || uni.getStorageSync('currentCityName') || '全国';
				
				try {
					const res = await queryDynamicsActivity(cityName);
					
					console.log('queryDynamicsActivity111111', res)
					if (res.statusCode == 200) {
						var swiperItem = res.data.data.indexAdvertising;

						if (swiperItem && swiperItem.length > 0) {
							swiperItem.forEach(function(element) {
								if (/^http/.test(element.image)) {
									that.lunbao = swiperItem
								}
							});
						}

						that.lunbao = swiperItem
						console.log(that.lunbao, 'that.lunbao')
					}
				} catch (error) {
					console.error('获取轮播图数据失败:', error);
					that.lunbao = [];
				}
			},
			
	// 轮播跳转详情
	advertisingLink: function(e) {
		console.log('轮播图点击事件:', e);
		
		var connectionType = e.currentTarget.dataset.type; // connectionType: 1:外链跳转 2:详情页 4:营销活动 5:小程序路径
		var advertisingLink = e.currentTarget.dataset.link; // advertisingLink: 广告链接
		var path = e.currentTarget.dataset.path;
		var details = e.currentTarget.dataset.details;
		var title = e.currentTarget.dataset.title;
		var timeS = e.currentTarget.dataset.time;
		var status = e.currentTarget.dataset.status;
		var id = e.currentTarget.dataset.id;
		const marketingId = e.currentTarget.dataset.mid;
		
		// 从 lunbao 数组中获取完整的轮播图数据
		const itemData = this.lunbao.find(item => item.id === id) || {};
		const activityType = itemData.activityType || null;
		
		console.log('轮播图参数:', {
			connectionType,
			advertisingLink,
			activityType,
			marketingId,
			itemData
		});
		
		// 业务逻辑判断
		// 规则1: advertisingLink 不为 1，使用路由跳转到 advertisingLink
		if (advertisingLink && advertisingLink != '1' && advertisingLink != 1) {
			console.log('规则1: 跳转到 advertisingLink:', advertisingLink);
			
			// 判断是否是外部链接
			if (/^https?:\/\//.test(advertisingLink)) {
				// 外部链接
				// #ifdef APP-PLUS
				plus.runtime.openURL(advertisingLink);
				// #endif
				
				// #ifdef H5
				window.open(advertisingLink);
				// #endif
				
				// #ifdef MP-WEIXIN
				uni.navigateTo({
					url: '/components/webView/webView?link=' + encodeURIComponent(advertisingLink)
				});
				// #endif
			} else {
				// 内部路由
				uni.navigateTo({
					url: advertisingLink
				});
			}
			return;
		}
		
		// 规则2: advertisingLink = 1 且 activityType = null 且 connectionType = 1，不执行任何动作
		if ((advertisingLink == '1' || advertisingLink == 1) && 
		    !activityType && 
		    (connectionType == 1 || connectionType == '1')) {
			console.log('规则2: 不执行任何动作');
			return;
		}
		
		// 规则3: activityType = null 且 (advertisingLink = null 或 = 1) 且 connectionType = 2，跳转到 advertisDetail.vue
		if (!activityType && 
		    (!advertisingLink || advertisingLink == '1' || advertisingLink == 1) && 
		    (connectionType == 2 || connectionType == '2')) {
			console.log('规则3: 跳转到详情页');
			
			const params = {
				id: id || '',
				title: encodeURIComponent(title || itemData.title || '活动详情'),
				time: timeS || itemData.timeS || '',
				status: status || itemData.status || '',
				details: details ? encodeURIComponent(details) : '',
				image: itemData.image ? encodeURIComponent(itemData.image) : '',
				link: advertisingLink ? encodeURIComponent(advertisingLink) : ''
			};
			
			// 构建URL参数
			const queryString = Object.keys(params)
				.filter(key => params[key])
				.map(key => `${key}=${params[key]}`)
				.join('&');
			
			uni.navigateTo({
				url: `/pages/advertisDetail/advertisDetail?${queryString}`
			});
			return;
		}
		
		// 其他情况：按照原有的 connectionType 逻辑处理
		if (connectionType == 1) {
			// 外链跳转
			if (advertisingLink) {
				// #ifdef APP-PLUS
				plus.runtime.openURL(advertisingLink);
				// #endif
				
				// #ifdef H5
				window.open(advertisingLink);
				// #endif
				
				// #ifdef MP-WEIXIN
				uni.navigateTo({
					url: '/components/webView/webView?link=' + encodeURIComponent(advertisingLink)
				});
				// #endif
			}
		} else if (connectionType == 2) {
			// 跳转到详情页
			const params = {
				id: id || '',
				title: encodeURIComponent(title || itemData.title || '活动详情'),
				time: timeS || itemData.timeS || '',
				status: status || itemData.status || '',
				details: details ? encodeURIComponent(details) : '',
				image: itemData.image ? encodeURIComponent(itemData.image) : '',
				link: advertisingLink ? encodeURIComponent(advertisingLink) : ''
			};
			
			// 构建URL参数
			const queryString = Object.keys(params)
				.filter(key => params[key])
				.map(key => `${key}=${params[key]}`)
				.join('&');
			
			uni.navigateTo({
				url: `/pages/advertisDetail/advertisDetail?${queryString}`
			});
		} else if (connectionType == 4) {
			// 处理营销获客逻辑
			if (activityType && marketingId) {
				this.disposeMarketingActivity(activityType, marketingId);
			} else {
				console.log('营销活动缺少必要参数:', { activityType, marketingId });
			}
		} else if (connectionType == 5) {
			// 小程序内路径跳转
			if (path) {
				uni.navigateTo({
					url: path
				});
			}
		} else {
			console.log('未知的跳转类型:', connectionType);
		}
	},
		
		// 处理营销活动
		disposeMarketingActivity(activityType, marketingId) {
			console.log('营销活动类型:', activityType, '活动ID:', marketingId);
			
			switch (activityType) {
				// activityType:  1 => 充值奖励活动, 2 => 累计消费活动, 3 => 单笔折扣活动, 4 => 站点优惠活动,
				// 5 => 邀请奖励, 6 => 新客有礼, 7=> 多人拼团 8=>付费会员 9=>推广员
				// marketingId: 活动id
				case 1:
					uni.navigateTo({
						url: '/marketing_page/pages/pay/payAward/payAward?HD=' + marketingId
					});
					break;
				case 2:
					uni.navigateTo({
						url: '/homeSub/pages/discount/cumulativeMoney/cumulativeMoney?HD=' + marketingId
					});
					break;
				case 3:
					uni.navigateTo({
						url: '/homeSub/pages/discount/singleMoney/singleMoney?HD=' + marketingId
					});
					break;
				case 4:
					uni.navigateTo({
						url: '/homeSub/pages/discount/siteOffers/siteOffers?HD=' + marketingId
					});
					break;
				case 5:
					uni.navigateTo({
						url: '/marketing_page/pages/invite/invitation/invitation?HD=' + marketingId
					});
					break;
				case 6:
					console.log('弹出新客有礼弹窗');
					uni.navigateTo({
						url: '/pages/index/index'
					});
					break;
				case 7:
					uni.navigateTo({
						url: '/marketing_page/pages/group/list/index'
					});
					break;
				case 8:
					uni.navigateTo({
						url: '/marketing_page/pages/member/index/index'
					});
					break;
				case 9:
					const url = this.getPromoterDetailFun?.spreadStatus == 1 
						? '/marketing_page/pages/promotion/index/index' 
						: '/marketing_page/pages/promotion/recruit_plan/recruit_plan';
					uni.navigateTo({
						url
					});
					break;
				default:
					console.log('未知的营销活动类型:', activityType);
					break;
			}
		},
			
			// 检查充电服务监控
			async checkChargeServiceMonitor() {
				// 检查是否登录
				const token = uni.getStorageSync('token');
				if (!token) {
					return;
				}
				
				const telephone = uni.getStorageSync('phoneNo');
				if (!telephone) {
					console.log('未获取到用户手机号，跳过充电服务监控检查');
					return;
				}
				
				try {
					const response = await pageChargeServiceMonitor({
						current: 1,
						memberNo: telephone,
						pageSize: 100
					});
					
					if (response && response.code === 0 && response.data && response.data.data) {
						const dataLength = response.data.data.length;
						console.log('充电服务监控数据长度:', dataLength);
						
						if (dataLength > 0) {
							// 有数据，保存第一条数据并开启定时器
							this.currentChargeData = response.data.data[0];
							this.startChargeMonitorTimer();
						} else {
							// 没有数据，清除数据和定时器
							this.currentChargeData = null;
							this.clearChargeMonitorTimer();
						}
					} else {
						console.error('获取充电服务监控数据失败:', response);
						this.currentChargeData = null;
						this.clearChargeMonitorTimer();
					}
				} catch (error) {
					console.error('调用pageChargeServiceMonitor接口失败:', error);
					this.currentChargeData = null;
					this.clearChargeMonitorTimer();
				}
			},
			
			// 开启充电监控定时器
			startChargeMonitorTimer() {
				// 先清除已存在的定时器
				this.clearChargeMonitorTimer();
				
				console.log('开启充电服务监控定时器，每5秒检查一次');
				this.chargeMonitorTimer = setInterval(async () => {
					const telephone = uni.getStorageSync('phoneNo');
					if (!telephone) {
						console.log('定时器中未获取到用户手机号，清除定时器');
						this.currentChargeData = null;
						this.clearChargeMonitorTimer();
						return;
					}
					
					try {
						const response = await pageChargeServiceMonitor({
							current: 1,
							memberNo: telephone,
							pageSize: 100
						});
						
						if (response && response.code === 0 && response.data && response.data.data) {
							const dataLength = response.data.data.length;
							console.log('定时器检查充电服务监控数据长度:', dataLength);
							
							if (dataLength === 0) {
								// 数据为空，清除数据和定时器
								console.log('充电服务监控数据为空，清除定时器');
								this.currentChargeData = null;
								this.clearChargeMonitorTimer();
							} else {
								// 更新充电数据
								this.currentChargeData = response.data.data[0];
							}
						} else {
							console.error('定时器中获取充电服务监控数据失败:', response);
							this.currentChargeData = null;
							this.clearChargeMonitorTimer();
						}
					} catch (error) {
						console.error('定时器中调用pageChargeServiceMonitor接口失败:', error);
						this.currentChargeData = null;
						this.clearChargeMonitorTimer();
					}
				}, 5000); // 5秒间隔
			},
			
			// 清除充电监控定时器
			clearChargeMonitorTimer() {
				if (this.chargeMonitorTimer) {
					clearInterval(this.chargeMonitorTimer);
					this.chargeMonitorTimer = null;
					console.log('充电服务监控定时器已清除');
				}
				// 清除充电数据
				this.currentChargeData = null;
			},
			
			// 检查未支付账单
			async checkUnpaidBills() {
				// 检查是否登录
				const token = uni.getStorageSync('token');
				if (!token) {
					this.showBillReminder = false;
					return;
				}
				
				try {
					const response = await getMyNotPayBillNumber({
						prePayVer: 1 // 根据API文档要求添加参数
					});
					
					if (response && response.code === 0) {
						const billCount = response.data || 0;
						console.log('未支付账单数量:', billCount);
						
						if (billCount >= 1) {
							this.unpaidBillCount = billCount;
							this.showBillReminder = true;
							console.log('未支付账单数量大于1，显示悬浮窗');
						} else {
							this.showBillReminder = false;
						}
					} else {
						console.error('获取未支付账单数量失败:', response);
						this.showBillReminder = false;
					}
				} catch (error) {
					console.error('调用getMyNotPayBillNumber接口失败:', error);
					this.showBillReminder = false;
				}
			},
			
			// 处理悬浮窗点击事件
			handleBillReminderClick() {
				console.log('点击悬浮账单提醒');
				// 跳转到订单列表页面，并设置默认选中"待支付"状态
				uni.navigateTo({
					url: '/pages/order/list?activeTab=unpaid'
				});
			},
			
			// 检查超时占位订单
			async checkOccupyBills() {
				// 检查是否登录
				const token = uni.getStorageSync('token');
				if (!token) {
					return;
				}
				
				try {
					const response = await getMyOccupyBillPage({
						billStatus: 11,
						current: 1,
						pageSize: 10
					});
					
					if (response && response.code === 0 && response.data && response.data.records && response.data.records.length > 0) {
						// 取第一条数据
						const firstRecord = response.data.records[0];
						console.log('超时占位订单数据:', firstRecord);
						
						// 格式化数据
						this.occupyBillData = this.formatOccupyBillData(firstRecord, response.data.total);
						
						// 延迟显示弹窗，避免与其他弹窗冲突
						setTimeout(() => {
							this.$refs.occupyBillPopup.show();
						}, 500);
					}
				} catch (error) {
					console.error('调用getMyOccupyBillPage接口失败:', error);
				}
			},
			
			// 格式化占位订单数据
			formatOccupyBillData(record, total) {
				// 格式化时间
				const timeS = new Date(record.timeS);
				const timeE = new Date(record.timeE);
				const formattedTime = `${timeS.getFullYear()}.${String(timeS.getMonth() + 1).padStart(2, '0')}.${String(timeS.getDate()).padStart(2, '0')} ${String(timeS.getHours()).padStart(2, '0')}:${String(timeS.getMinutes()).padStart(2, '0')}:${String(timeS.getSeconds()).padStart(2, '0')}`;
				
				// 格式化费用（分转元）
				const formattedFee = (record.busBalance / 100).toFixed(2);
				
				return {
					...record,
					formattedTime: formattedTime,
					formattedFee: formattedFee,
					totalCount: total
				};
			},
			
			// 处理占位弹窗关闭事件
			handleOccupyPopupClose() {
				console.log('占位订单弹窗关闭');
			},
			
			// 处理占位弹窗稍后再说
			handleOccupyPopupLater() {
				console.log('稍后再说');
			},
			
			// 处理占位弹窗立即支付
			handleOccupyPopupPay(billData) {
				console.log('立即支付占位费用:', billData);
				// 跳转到超时占位订单支付页面
				uni.navigateTo({
					url: `/pages/bill/occupyBillPay?id=${billData.id}`
				});
			},
			
			// 初始化城市信息
			initCityInfo() {
				const savedCityName = uni.getStorageSync('currentCityName');
				if (savedCityName) {
					this.currentCityName = savedCityName;
					console.log('从storage加载城市名称:', savedCityName);
				} else {
					console.log('使用默认城市名称:', this.currentCityName);
				}
			},
			
			// 更新城市名称（供其他页面调用）
			updateCityName(cityName) {
				this.currentCityName = cityName;
				uni.setStorageSync('currentCityName', cityName);
				console.log('城市名称已更新:', cityName);
			},
			
			goToCityPicker() {
				uni.navigateTo({
					url: '/pages/common/cityPicker'
				});
			},
			checkLocationPermission() {
				return new Promise((resolve, reject) => {
					const that = this;
					uni.getSetting({
						success: (res) => {
							// 检查是否有位置权限
							if (!res.authSetting['scope.userLocation']) {
								// 未授权，发起授权请求
								uni.authorize({
									scope: 'scope.userLocation',
									success: () => {
										console.log("用户位置权限授权成功");
										// 授权成功后再调用获取位置
										that.getLocation().then(resolve).catch(reject);
									},
									fail: () => {
										// 用户拒绝授权，引导到设置页开启
										uni.showModal({
											title: '权限提示',
											content: '需要获取您的位置信息，请在设置中开启',
											success: (modalRes) => {
												if (modalRes.confirm) {
													// 打开小程序设置页
													uni.openSetting({
														success: (settingRes) => {
															if (settingRes.authSetting['scope.userLocation']) {
																that.getLocation().then(resolve).catch(reject);
															} else {
																// 用户仍然拒绝，使用默认城市
																that.setDefaultCity();
																resolve();
															}
														},
														fail: () => {
															that.setDefaultCity();
															resolve();
														}
													});
												} else {
													// 用户拒绝，使用默认城市
													that.setDefaultCity();
													resolve();
												}
											}
										});
									}
								});
							} else {
								// 已授权，直接调用
								console.log("用户位置权限已授权");
								that.getLocation().then(resolve).catch(reject);
							}
						},
						fail: function (err) {
							console.error('获取位置权限失败', err);
							// 位置获取失败时使用默认城市和位置
							that.setDefaultCity();
							resolve(); // 即使失败也resolve，使用默认位置
						}
					});
				});
			},
			getLocation() {
				return new Promise((resolve, reject) => {
					const that = this;
					uni.getLocation({
						isHighAccuracy: true,
						type: 'gcj02', // 使用国测局坐标系
						success: function (res) {
							console.log('纬度：' + res.latitude);
							console.log('经度：' + res.longitude);
							console.log('速度：' + res.speed);
							console.log('精度：' + res.accuracy);
							
							const longitude = res.longitude;
							const latitude = res.latitude;
							
							// 先保存基础位置信息
							uni.setStorageSync('location', {
								latitude: latitude,
								longitude: longitude
							});
							uni.setStorageSync('latitude', latitude);
							uni.setStorageSync('longitude', longitude);
							
							// 构建天地图逆地址解析请求参数
							const obj = {
								postStr: JSON.stringify({
									'lon': longitude,
									'lat': latitude,
									'ver': 1
								}),
								type: 'geocode',
								tk: 'abbe3251071d6b4efb714dbdb6c5417e'
							};
							console.log("url", `https://api.tianditu.gov.cn/geocoder?postStr=${obj.postStr}&type=geocode&tk=${obj.tk}`)
							
							// 调用天地图逆地址解析API获取城市名称
							uni.request({
								url: `https://api.tianditu.gov.cn/geocoder?postStr=${obj.postStr}&type=geocode&tk=${obj.tk}`,
								method: "post",
								data: obj,
								header: {
									Accept: "application/json"
								},
								success: function (res2) {
									console.log('逆地址解析结果:', res2);
									if (res2.data.status === '0') {
										const data = res2.data.result;
										const cityName = data.addressComponent.city;
										console.log('解析到的城市名称:', cityName);
										
										// 保存城市信息到storage
										uni.setStorageSync('currentCityName', cityName);

										if (!uni.getStorageSync('cityName')) {
											uni.setStorageSync('cityName', cityName);
										}
										// 请求stationArea
										getStationArea().then(areaRes => {
											console.log('stationArea11', areaRes);
											const area = areaRes.data.find(item => item.cityName === cityName);
											if (area) {
												uni.setStorageSync('currentCity', {
													cityId: area.cityId,
													cityName: cityName,
													latitude: latitude,
													longitude: longitude
												});
											}
											// 更新页面显示的城市名称
											// that.currentCityName = cityName;
											// 定位和解析都完成，resolve Promise
											resolve();
										}).catch(err => {
											console.error('获取stationArea失败:', err);
											// 即使获取area失败，也resolve，因为位置信息已经保存
											that.cityName = cityName;
											resolve();
										});
									} else {
										console.error('逆地址解析失败:', res2.data);
										// 解析失败时使用默认城市
										that.setDefaultCity(latitude, longitude);
										resolve(); // 即使解析失败也resolve，使用默认位置
									}
								},
								fail: function (err) {
									console.error('逆地址解析请求失败:', err);
									// 请求失败时使用默认城市
									that.setDefaultCity(latitude, longitude);
									resolve(); // 即使请求失败也resolve，使用默认位置
								}
							});
						},
						fail: function (err) {
							console.error('获取位置失败', err);
							// 位置获取失败时使用默认城市和位置
							// 判断storage中是否存在currentCityName，如果存在，则不使用默认城市
							if (uni.getStorageSync('currentCityName')) {
								resolve(); // 如果已有城市信息，直接resolve
								return;
							}
							that.setDefaultCity();
							resolve(); // 即使失败也resolve，使用默认位置
						}
					});
				});
			},
			
			// 设置默认城市信息
			setDefaultCity(latitude = 22.9167, longitude = 113.7500) {
				const defaultCityName = '东莞市';
				console.log('使用默认城市:', defaultCityName);
				
				uni.setStorageSync('currentCityName', defaultCityName);
				uni.setStorageSync('location', {
					latitude: latitude,
					longitude: longitude
				});
				uni.setStorageSync('latitude', latitude);
				uni.setStorageSync('longitude', longitude);
				uni.setStorageSync('currentCity', {
					cityName: defaultCityName,
					latitude: latitude,
					longitude: longitude
				});
				
				// 更新页面显示的城市名称
				this.cityName = defaultCityName;
			},
			callPhone() {
				uni.makePhoneCall({
					phoneNumber: '400-633-1838'
				});
			},
			async fetchStationList(isLoadMore = false) {
				// 如果是加载更多且没有更多数据，直接返回
				if (isLoadMore && !this.hasMore) {
					this.loadStatus = 'nomore';
					this.isLoadingMore = false;
					return;
				}
				
				this.loadStatus = 'loading';
				
				// 如果不是加载更多，重置分页参数和加载标志
				if (!isLoadMore) {
					this.currentPage = 1;
					this.hasMore = true;
					this.isLoadingMore = false;
				}
				
				// 构建筛选条件对象
				const memberQueryPreferenceDto = {
					"distance": this.selectedDistance,
					"fastSlow": this.selectedChargingMode,
					"stationType": this.selectedStationType,
					"construction": this.selectedConstructionSite,
					"discount": this.selectedDiscount
				};
				
				// 调试输出：显示当前应用的筛选条件
				console.log('fetchStationList - 当前筛选条件：', memberQueryPreferenceDto);

				// 请求stationArea
				const stationArea = await getStationArea();
				console.log('stationArea2222', stationArea);
				const area = stationArea.data.find(item => item.cityName === uni.getStorageSync('cityName'));

				console.log('area5555', area);
				if (!area) {
					uni.showToast({
						title: '当前城市暂无站点，请选择其他城市',
						icon: 'none'
					});
					return
				}
				// uni.setStorageSync('currentCity', {
				// 	cityId: area.cityId,
				// 	cityName: area.cityName,
				// 	latitude: uni.getStorageSync('location').latitude,
				// 	longitude: uni.getStorageSync('location').longitude
				// });
				console.log('currentCity22', uni.getStorageSync('currentCity'));
				const payload = {
					"areaId": area.cityId,
					"areaName": area.cityName,
					"latitude": uni.getStorageSync('location').latitude, // 用户当前位置的纬度
					"longitude": uni.getStorageSync('location').longitude, // 用户当前位置的经度
					"sellerNo": globalData.sellerNo,
					"type": this.navIndex,
					"memberQueryPreferenceDto": memberQueryPreferenceDto,
					"current": this.currentPage,
					"pageSize": this.pageSize,
				};

				try {
					// 检查是否有token，根据token存在与否调用不同的API
					const token = uni.getStorageSync('token');
					let res;
					
					if (token) {
						// 有token时调用新的API方法
						console.log(`用户已登录，调用 getIndexStationNew，第${this.currentPage}页`);
						res = await getIndexStationNew(payload);
					} else {
						// 无token时调用原有的API方法
						console.log(`用户未登录，调用 getIndexStationNoAuth，第${this.currentPage}页`);
						res = await getIndexStationNoAuth(payload);
					}
					
					console.log(res);
					if (res.code === 0 && res.data) {
						let newData = [];
						let hasNextPage = false;
						
						// 处理新API的分页数据结构
						if (token && res.data.data) {
							// 新API返回的数据结构包含分页信息
							newData = res.data.data;
							this.totalCount = res.data.totalCount || 0;
							hasNextPage = newData.length >= this.pageSize && this.currentPage * this.pageSize < this.totalCount;
						} else {
							// 原API的数据结构
							newData = res.data;
							hasNextPage = newData.length >= this.pageSize;
						}
						
						// 处理数据
						if (isLoadMore) {
							// 加载更多：追加数据
							this.stationList = [...this.stationList, ...newData];
						} else {
							// 首次加载或刷新：替换数据
							this.stationList = newData;
						}
						
						// 更新分页状态
						if (hasNextPage) {
							this.currentPage++;
							this.hasMore = true;
							this.loadStatus = 'loadmore';
						} else {
							this.hasMore = false;
							this.loadStatus = 'nomore';
						}
						
						console.log(`当前共${this.stationList.length}条数据，总计${this.totalCount}条，${this.hasMore ? '还有更多' : '没有更多了'}`);
					} else {
						if (!isLoadMore) {
							this.stationList = [];
						}
						this.hasMore = false;
						this.loadStatus = 'nomore';
					}
				} catch (error) {
					console.error('获取充电站列表失败:', error);
					// uv-load-more组件不支持loadfail状态，直接设置为loadmore允许重试
					this.loadStatus = 'loadmore';
					
					// 显示错误提示
					uni.showToast({
						title: '加载失败，请重试',
						icon: 'error',
						duration: 2000
					});
				} finally {
					// 无论成功失败都要重置加载标志
					this.isLoadingMore = false;
				}
			},
			// 打开筛选弹窗
			openFilterPopup() {
				this.$refs.filterPopup.open();
			},
			
			// 关闭筛选弹窗
			closeFilterPopup() {
				this.$refs.filterPopup.close();
			},
			
			// 距离筛选变化回调
			onDistanceChange(option) {
				console.log('距离筛选变化：', option);
				this.selectedDistance = option.key;
				this.selectedDistanceInfo = option;
			},
			
			// 站点类型筛选变化回调
			onStationTypeChange(option) {
				console.log('站点类型筛选变化：', option);
				this.selectedStationType = option.key;
				this.selectedStationTypeInfo = option;
			},
			
			// 充电模式筛选变化回调
			onChargingModeChange(option) {
				console.log('充电模式筛选变化：', option);
				this.selectedChargingMode = option.key;
				this.selectedChargingModeInfo = option;
			},
			
			// 建设场所筛选变化回调
			onConstructionSiteChange(option) {
				console.log('建设场所筛选变化：', option);
				this.selectedConstructionSite = option.key;
				this.selectedConstructionSiteInfo = option;
			},
			
			// 优惠筛选变化回调
			onDiscountChange(option) {
				console.log('优惠筛选变化：', option);
				this.selectedDiscount = option.key;
				this.selectedDiscountInfo = option;
			},
			
			// 重置筛选条件
			resetFilters() {
				this.selectedDistance = null;
				this.selectedStationType = null;
				this.selectedChargingMode = null;
				this.selectedConstructionSite = null;
				this.selectedDiscount = null;
				this.selectedDistanceInfo = null;
				this.selectedStationTypeInfo = null;
				this.selectedChargingModeInfo = null;
				this.selectedConstructionSiteInfo = null;
				this.selectedDiscountInfo = null;
				
				// 重置筛选条件后，立即应用筛选（实际上是清除筛选）
				this.confirmFilter();
			},
			
			// 确认筛选
			confirmFilter() {
				console.log('确认筛选条件：', {
					distance: this.selectedDistanceInfo,
					stationType: this.selectedStationTypeInfo,
					chargingMode: this.selectedChargingModeInfo,
					constructionSite: this.selectedConstructionSiteInfo,
					discount: this.selectedDiscountInfo
				});
				
				// 构建请求参数对象，用于调试输出
				const filterParams = {
					distance: this.selectedDistance,
					fastSlow: this.selectedChargingMode,
					stationType: this.selectedStationType,
					construction: this.selectedConstructionSite,
					discount: this.selectedDiscount
				};
				
				console.log('实际传递给API的筛选参数：', filterParams);
				
				// 关闭弹窗
				this.closeFilterPopup();
				
				// 重新获取数据，应用筛选条件
				this.fetchStationList();
				
				// 显示筛选结果提示
				let filterText = [];
				if (this.selectedDistanceInfo) {
					filterText.push(`距离：${this.selectedDistanceInfo.value}`);
				}
				if (this.selectedStationTypeInfo) {
					filterText.push(`类型：${this.selectedStationTypeInfo.value}`);
				}
				if (this.selectedChargingModeInfo) {
					filterText.push(`模式：${this.selectedChargingModeInfo.value}`);
				}
				if (this.selectedConstructionSiteInfo) {
					filterText.push(`场所：${this.selectedConstructionSiteInfo.value}`);
				}
				if (this.selectedDiscountInfo) {
					filterText.push(`优惠：${this.selectedDiscountInfo.value}`);
				}
				
				if (filterText.length > 0) {
					uni.showToast({
						title: `已筛选 ${filterText.join('，')}`,
						icon: 'none',
						duration: 2000
					});
				} else {
					uni.showToast({
						title: '已重置筛选条件',
						icon: 'none',
						duration: 2000
					});
				}
			},
			ontabtap(index) {
				console.log('选中的索引:', index)
				this.tabIndex = index;
				// 根据索引获取对应的value值
				this.navIndex = this.tabMenu[index].value;
				// 切换tab时重新获取数据，会根据token自动选择合适的API
				// 清除stationList
				this.stationList = [];
				this.isTabTapLoading = true;
				this.fetchStationList();
				this.isTabTapLoading = false;
			},
			// 处理滚动到底部加载更多
			loadMore() {
				console.log('滚动到底部，触发加载更多');
				if (this.loadStatus === 'loadmore' && this.hasMore && !this.isLoadingMore) {
					this.isLoadingMore = true;
					this.fetchStationList(true);
				}
			},
			// 处理点击加载更多事件
			onLoadMore() {
				console.log('点击加载更多');
				if (this.loadStatus === 'loadmore' && this.hasMore && !this.isLoadingMore) {
					this.isLoadingMore = true;
					this.fetchStationList(true);
				}
			},
			// 刷新数据
			async refreshData() {
				try {
					await this.fetchStationList(false); // 重新加载第一页
					uni.stopPullDownRefresh(); // 停止下拉刷新动画
					uni.showToast({
						title: '刷新成功',
						icon: 'success',
						duration: 1500
					});
				} catch (error) {
					uni.stopPullDownRefresh();
					uni.showToast({
						title: '刷新失败',
						icon: 'error',
						duration: 1500
					});
				}
			},
			goToSearch() {
				uni.navigateTo({
					url: `/pages/station/stationSearch`
				});
			},
			// 充电站点击事件
			onStationClick(stationData) {
				// TODO 测试: 跳转到充电站详情页
				// 将stationData中的tagList使用map取出tagName
				if (!stationData.id) {
					return;
				}
				let tagList = '';
				if (stationData.tagList) {
					tagList = stationData.tagList.map(item => item.tagName).join(',');
				}
				console.log(`/pages/station/stationDetails?id=${stationData.id}&tagList=${tagList}`)
				uni.navigateTo({
					url: `/pages/station/stationDetails?id=${stationData.id}&tagList=${tagList}`
				});
				// uni.navigateTo({
				// 	url: `/pages/bill/billDelay`
				// });
				// uni.navigateTo({
				// 	url: '/pages/bill/settlementPay'
				// });
				// uni.navigateTo({
				// 	url: '/pages/charge/stopping'
				// });
			},
			// 充电站收藏事件
			onStationFavorite({ station, isCollection }) {
				// TODO: 调用收藏API
				this.updateStationCollection(station.id, isCollection);
			},
			// 更新收藏状态
			async updateStationCollection(stationId, isCollection) {
				try {
					// 这里调用收藏API
					// const res = await this.$stationApi.updateCollection({
					//   stationId: stationId,
					//   isCollection: isCollection
					// });
					
					// 更新本地数据
					const station = this.stationList.find(item => item.id === stationId);
					if (station) {
						station.isCollection = isCollection;
					}
					
					uni.showToast({
						title: isCollection ? '收藏成功' : '取消收藏',
						icon: 'success'
					});
				} catch (error) {
					console.error('收藏操作失败:', error);
					uni.showToast({
						title: '操作失败',
						icon: 'error'
					});
				}
			},
			
			// 导航栏左侧点击事件
			onNavbarLeftClick() {
				console.log('导航栏左侧点击');
				// 这里可以添加左侧点击的逻辑，比如返回上一页
			},
			
			// 导航栏右侧点击事件
			onNavbarRightClick() {
				console.log('导航栏右侧点击');
				// 这里可以添加右侧点击的逻辑
			},
			// 联系客服
			contactCustomerService() {
				contactCustomerServiceFn();
			}
		}
	}
</script>

<style lang="less" scoped>
	page {
		height: 100%;
		/* 从白色到 #F3F3F3 的快速渐变背景 */
		background: #F3F4F6;
	}

	.page-container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		padding-left: 20rpx;
		padding-right: 20rpx;
		// background: linear-gradient(90deg, #FFF9FB 0%, #F8F9FA 100%);
				/* 从白色到 #F3F3F3 的快速渐变背景 */
		background: linear-gradient(to bottom, #E5F6FF 30%, #F3F3F3 50%);
	}

	/* 自定义导航栏样式 */
	.navbar-left {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 5rpx;
		padding: 8rpx 12rpx;
		border-radius: 20rpx;
	}

	.navbar-center {
		width: 51%;
	}
	
	
	.city-text {
		color: #0F172A;
		font-size: 28rpx;
		font-weight: bold;
	}
	
	
	.navbar-right {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 8rpx 12rpx;
		border-radius: 20rpx;
		background-color: rgba(255, 255, 255, 0.2);
	}
	
	.filter-text {
		color: #fff;
		font-size: 26rpx;
	}

	.swiper-view {
		background-color: #ffffff;
		margin-top: 20rpx;
		// 设置底部圆角
		border-radius: 20rpx;
	}

	.header-image2 {
		width: 100%;
		height: 200rpx;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 1;
	}

	.swiper-banner {
		width: 100%;
		height: 300rpx;
		position: relative;
		z-index: 2;
		border-radius: 20rpx;
		overflow: hidden;
	}

	.swiper-item-images {
		width: 100%;
		height: 100%;
		border-radius: 20rpx;
	}

	/* 可滚动内容区域 */
	.content-container {
		flex: 1;
		overflow-y: auto;
		/* uv-navbar组件会自动处理占位，不需要手动设置margin-top */
	}

	/* 底部安全区域 */
	.bottom-safe-area {
		height: calc(140rpx + env(safe-area-inset-bottom));
		background: transparent;
	}

	.scroll-h {
		width: 750rpx;
		/* #ifdef H5 */
		width: 100%;
		/* #endif */
		height: 80rpx;
		flex-direction: row;
		/* #ifndef APP-PLUS */
		white-space: nowrap;
		/* #endif */
	}

	.uni-tab-item {
		/* #ifndef APP-PLUS */
		display: inline-block;
		/* #endif */
		flex-wrap: nowrap;
		padding-left: 34rpx;
		padding-right: 34rpx;
	}

	.uni-tab-item-title {
		color: #fff;
		font-size: 30rpx;
		height: 80rpx;
		line-height: 80rpx;
		flex-wrap: nowrap;
		/* #ifndef APP-PLUS */
		white-space: nowrap;
		/* #endif */
	}

	.uni-tab-item-title-active {
		color: #FFC0CB;
	}

	.content {
		margin-top: 100rpx;
	}

.head-nav {
	flex: 1;
	display: flex;
	justify-content: space-between;
	align-items: center;
	// padding: 0 20rpx;
	margin-top: 10rpx;
	// 设置底部圆角
	// border-radius: 20rpx;
	background-color: transparent;
    // font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;  /* 字体 */
    // font-weight: 500;  /* 字体粗细 */
    // color: #606266;  /* 字体颜色 */
	// background: #FFFFFF;  /* 背景色 */

    /* 活动状态样式 */
    .activite {
        // font-size: 34px;  /* 字号 */
        // font-weight: bold;  /* 加粗 */
		color: #000000;
        color: #1890FF;  /* 主题蓝色 */
    }

    /* 图片1样式 */
    .img1 {
        width: 30px;  /* 宽度 */
        height: 30px;  /* 高度 */
        position: absolute;  /* 绝对定位 */
        margin-left: 50px;  /* 左外边距 */
    }

    /* 图片2样式 */
    .img2 {
        width: 72px;  /* 宽度 */
        height: 6px;  /* 高度 */
        position: absolute;  /* 绝对定位 */
        margin-top: 46px;  /* 上外边距 */
        margin-left: -68px;  /* 左外边距 */
    }

    /* 导航栏样式 */
    .nav {
		display: flex;  /* 弹性布局 */
		align-items: center;  /* 垂直居中 */
		font-size: 13px;  /* 字号 */
		width: 55%;

		/* 导航项 */
		.nav-item {
			margin: 0 24px;  /* 左右外边距 */
		}
    }

    /* 全局样式 */
    .all {
        display: flex;  /* 弹性布局 */
		align-items: center;  /* 垂直居中 */
        font-size: 13px;  /* 字号 */
        // color: #303133;  /* 字体颜色 */

        /* 全站图标 */
        .allSite {
            width: 15px;  /* 宽度 */
            height: 15px;  /* 高度 */
            margin-right: 11px;  /* 右外边距 */
        }
    }

	.filter-img {
		width: 30rpx;
		height: 30rpx;
	}
}

.header {
	background-color: #007AFF; 
}

/* 筛选弹窗样式 */
.filter-popup-content {
	background-color: #fff;
	border-radius: 20rpx 20rpx 0 0;
	padding: 0;
	max-height: 80vh;
}

.filter-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 32rpx 32rpx 16rpx 32rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.filter-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.filter-content {
	padding: 0 32rpx;
	max-height: 60vh;
	overflow-y: auto;
}

.filter-footer {
	display: flex;
	padding: 24rpx 32rpx 32rpx 32rpx;
	gap: 16rpx;
	border-top: 1rpx solid #f0f0f0;
	background-color: #fff;
}

.reset-btn, .confirm-btn {
	flex: 1;
	height: 80rpx;
	border-radius: 40rpx;
	border: none;
	font-size: 28rpx;
	line-height: 80rpx;
}

.reset-btn {
	background-color: #f5f5f5;
	color: #666;
}

.confirm-btn {
	background-color: #2594FB;
	color: #fff;
}

.charge-card {
  background: linear-gradient(to bottom right, #66A8FA, #e8f4fd);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  height: 120px; /* 可根据实际需求调整高度 */
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
}

.sub-title {
  font-size: 14px;
  color: #ffffff;
  opacity: 0.8;
}

.check-btn {
  background-color: #cbe2ff;
  color: #fff;
  border-radius: 30px;
  padding: 0px 10px;
  font-size: 12px;
  margin-top: 10px;
}

.filter {
	display: flex;
	justify-content: center;
	align-items: center;
}
</style>

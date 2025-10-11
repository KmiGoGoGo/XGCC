<template>
	<view class="page-container">
		<!-- 自定义导航栏 -->
		<uv-navbar 
			title="超易充电" 
			:fixed="true"
			:safeAreaInsetTop="true"
			:placeholder="true"
			bgColor="#F3F3F3"
			:border="false"
			:autoBack="false"
			@leftClick="onNavbarLeftClick"
			@rightClick="onNavbarRightClick"
		>
			<template v-slot:left>
				<view class="navbar-left" @click="goToCityPicker">
					<text class="city-text">{{ currentCityName }}</text>
					<uv-icon name="arrow-down" color="#fff" size="14"></uv-icon>
				</view>
			</template>
			
			<template v-slot:center>
				<view class="navbar-center">
					<uv-search 
						:showAction="false" 
						placeholder="请输入站点名称" 
						disabled 
						@click="goToSearch" 
						:actionStyle="{
							backgroundColor: '#007AFF',
							color: '#fff',
							borderRadius: '20rpx'
						}"
						:boxStyle="{
							borderRadius: '20rpx'
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
						<image class="header-image2" src="https://oos-cn.ctyunapi.cn/front-end/static/cartoon/home_bgB.png">
						</image>
						<swiper class="swiper-banner" :indicator-dots="indicatorDots" :autoplay="autoplay"
							:circular="circular" :vertical="vertical" :interval="interval" :duration="duration"
							indicator-color="rgba(255, 255, 255, 0.4)" indicator-active-color="#fff">
							<swiper-item v-for="(item, index) in lunbao" :key="index" @tap="advertisingLink"
								:data-title="item.title" :data-status="item.status" :data-time="item.timeS"
								:data-link="item.advertisingLink" :data-type="item.connectionType"
								:data-path="item.mobilePath" :data-details="item.details" :data-id="item.id"
								:data-mid="item.marketingId">
								<image :src="item.image" mode="aspectFill" class="swiper-item-images" />
							</swiper-item>
						</swiper>
					</view>
				</view>
			</view>
			<view class="head-nav">
					<view class='nav'>
						<uv-tabs :list="tabMenu" :current="tabIndex" @change="ontabtap"
						:activeStyle="{
							color: '#007AFF',
							fontWeight: 'bold',
							transform: 'scale(1.05)'
						}"
						:inactiveStyle="{
							color: '#6A6266',
							transform: 'scale(1)'
						}"
						></uv-tabs>
					</view>
					<view class="filter" @click="openFilterPopup">
						<image class="filter-img" src="https://oos-cn.ctyunapi.cn/front-end/static/static/screening.png"></image>
						<text style="color: #6A6266;">筛选</text>
					</view>
				</view>
			<view class="list-container">
				<uv-list :customStyle="{'background': '#F3F3F3'}">
					<!-- <uv-loading-icon text="加载中" textSize="30rpx" v-if="isTabTapLoading"></uv-loading-icon> -->
					<uv-list-item  :customStyle="{'background': 'linear-gradient(180deg, #F3F3F3 0%, #F3F3F3 30%)', 'padding': '0'}" v-for="(item, index) in stationList" :key="index">
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
	import loginPopup from '@/components/login-popup/login.vue';
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
	export default {
		components: {
			Tabbar,
			loginPopup,
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
				navIndex: 1,
				tabIndex: 1,
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
		onLoad() {
			this.initCityInfo();
			this.getLocation();
			this.queryDynamicsActivity();
			uni.hideTabBar();
		},
		onShow() {
			this.initCityInfo();
			this.fetchStationList();
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
			
			// 获取轮播图数据
			async queryDynamicsActivity() {
				const that = this;
				let cityName = uni.getStorageSync('cityName') || uni.getStorageSync('currentCityName') || '全国';
				
				try {
					const res = await queryDynamicsActivity(cityName);
					
					console.log('queryDynamicsActivity111111', res)
					if (res.code == 0) {
						var swiperItem = res.data.data.indexAdvertising;

						if (swiperItem && swiperItem.length > 0) {
							swiperItem.forEach(function(element) {
								if (/^http/.test(element.image)) {
									that.lunbao = swiperItem
								}
							});
						}

						that.lunbao = swiperItem || [];
						console.log(that.lunbao, 'that.lunbao')
					}
				} catch (error) {
					console.error('获取轮播图数据失败:', error);
					that.lunbao = [];
				}
			},
			
			// 轮播跳转详情
			advertisingLink: function(e) {
				// app.globalData.CHECK_LOGIN(function() {
				var types = e.currentTarget.dataset.type //1跳转 2是详情
				var link = e.currentTarget.dataset.link
				var path = e.currentTarget.dataset.path
				var details = e.currentTarget.dataset.details
				var title = e.currentTarget.dataset.title
				var timeS = e.currentTarget.dataset.time
				var status = e.currentTarget.dataset.status

				const marketingId = e.currentTarget.dataset.mid;
				var id = e.currentTarget.dataset.id
				console.log(e)
				return
				if (types == 1) {
					app.globalData.CHECK_LOGIN(() => {
						util_1.LinkType(link);
					})
				} else if (types == 2) {
					// app.globalData.richText = details;
					// uni.navigateTo({
					// 	url: `../../homeSub/pages/advertisDetails/advertisDetails?title=` + title + '&time=' + timeS + '&status=' + status
					// });
					//为解决跳转后分享问题使用新的页面方法;
					uni.navigateTo({
						url: `/homeSub/pages/advertisDetails/advertisDetailsNew?id=${id}`
					});
				} else if (types == 4) {
					// 处理营销获客逻辑
					this.disposeMarketingActivity(types, marketingId);
				} else if (types == 5) {
					app.globalData.CHECK_LOGIN(() => {
						uni.navigateTo({
							url: path
						});
					})
				} else {
					app.globalData.CHECK_LOGIN(() => {
						return false;
					})
				}
				// })
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
			getLocation() {
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
									// 请求stationArea
									getStationArea().then(res => {
										console.log('stationArea11', res);
										const area = res.data.find(item => item.cityName === cityName);
										uni.setStorageSync('currentCity', {
											cityId: area.cityId,
											cityName: cityName,
											latitude: latitude,
											longitude: longitude
										});
									});
									
									
									// 更新页面显示的城市名称
									that.currentCityName = cityName;
									
									console.log('城市名称已保存到storage:', cityName);
								} else {
									console.error('逆地址解析失败:', res2.data);
									// 解析失败时使用默认城市
									that.setDefaultCity(latitude, longitude);
								}
							},
							fail: function (err) {
								console.error('逆地址解析请求失败:', err);
								// 请求失败时使用默认城市
								that.setDefaultCity(latitude, longitude);
							}
						});
					},
					fail: function (err) {
						console.error('获取位置失败', err);
						// 位置获取失败时使用默认城市和位置
						that.setDefaultCity();
					}
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
				this.currentCityName = defaultCityName;
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
				const area = stationArea.data.find(item => item.cityName === this.currentCityName);
				
				if (!area) {
					uni.showToast({
						title: '当前城市暂无站点，请选择其他城市',
						icon: 'none'
					});
					return
				}
				uni.setStorageSync('currentCity', {
					cityId: area.cityId,
					cityName: area.cityName,
					latitude: uni.getStorageSync('location').latitude,
					longitude: uni.getStorageSync('location').longitude
				});
				console.log('currentCity22', uni.getStorageSync('currentCity'));
				const payload = {
					"areaId": area.cityId,
					"areaName": area.cityName,
					"latitude": uni.getStorageSync('location').latitude,
					"longitude": uni.getStorageSync('location').longitude,
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
			ontabtap(e) {
				console.log(e)
				let index = e.index
				this.tabIndex = index;
				this.navIndex = e.value;
				// 切换tab时重新获取数据，会根据token自动选择合适的API
				// 清除stationList
				this.stationList = [];
				this.isTabTapLoading = true;
				this.fetchStationList();
				this.isTabTapLoading = false;
			},
			// 处理加载更多事件
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
			}
		}
	}
</script>

<style lang="less">
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
		background: #F3F3F3;
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
		background-color: rgba(255, 255, 255, 0.2);
	}
	
	.city-text {
		color: #fff;
		font-size: 28rpx;
		font-weight: 500;
	}
	
	.navbar-center {
		flex: 1;
		margin: 0 20rpx;
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
		height: 200rpx;
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
	display: flex;
	justify-content: space-between;
	align-items: center;
	// padding: 0 20rpx;
	// margin-top: 10rpx;
	// 设置底部圆角
	// border-radius: 20rpx;
	background-color: #F3F3F3;
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

</style>

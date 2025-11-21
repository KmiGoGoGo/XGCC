<template>
    <view class="city-picker-container">
        <uv-navbar :border="false" autoBack="true" placeholder safeAreaInsetTop></uv-navbar>
        <!-- 加载状态 -->
        <view class="loading-container" v-if="loading">
            <view class="loading-text">正在加载城市数据...</view>
        </view>
        
        <!-- 错误状态 -->
        <view class="error-container" v-if="error && !loading">
            <view class="error-text">{{ error }}</view>
            <view class="retry-btn" @click="loadCityData">重试</view>
        </view>
        
        <!-- 城市选择组件 -->
        <city-select
            v-if="!loading && !error"
            @cityClick="cityClick"
            :formatName="formatName"
            :activeCity="activeCity"
            :hotCity="hotCity"
            :obtainCitys="obtainCitys"
            :isSearch="true"
            ref="citys"
        ></city-select>
        
    </view>
</template>

<script>
import citySelect from '@/components/city-select/city-select.vue'
import { getStationArea } from '@/api/station.js'

export default {
    data() {
        return {
            //需要构建索引参数的名称（注意：传递的对象里面必须要有这个名称的参数）
            formatName: 'cityName',
            //当前城市
            activeCity: {
            },
            //热门城市
            hotCity: [
            ],
            //显示的城市数据
            obtainCitys: [],
            //加载状态
            loading: false,
            //错误信息
            error: null
        }
    },
    components: {
        citySelect
    },
    onLoad() {
        // 页面加载时获取城市数据
        this.activeCity = {
            id: 1,
            cityName: '请选择城市'
        }
        this.loadCityData();
    },
    methods: {
        /**
         * 从API加载城市数据
         */
        async loadCityData() {
            try {
                this.loading = true;
                this.error = null;
                
                const response = await getStationArea();
                
                if (response.success && response.data) {
                    // 处理API返回的数据格式
                    const cityData = response.data.map(item => ({
                        id: item.cityId,
                        cityName: item.cityName,
                        cityId: item.cityId,
                        cityPinyin: item.cityPinyin,
                        latitude: uni.getStorageSync('location').latitude,
                        longitude: uni.getStorageSync('location').longitude
                    }));
                    
                    this.obtainCitys = cityData;
                    console.log('obtainCitys', this.obtainCitys);
                    
                    // 设置默认当前城市（取第一个城市）
                    if (cityData.length > 0) {
                        this.activeCity = {
                            id: cityData[0].cityId,
                            cityName: cityData[0].cityName
                        };
                    }
                    
                    // 强制更新组件
                    this.$nextTick(() => {
                        console.log('数据更新完成，obtainCitys长度:', this.obtainCitys.length);
                        console.log('当前城市:', this.activeCity);
                        // 强制更新子组件
                        this.$forceUpdate();
                        
                        // 直接调用子组件的更新方法
                        if (this.$refs.citys && this.$refs.citys.updateCitys) {
                            this.$refs.citys.updateCitys(this.obtainCitys);
                        }
                    });
                    
                    
                    uni.showToast({
                        icon: 'success',
                        title: '城市数据加载成功',
                        duration: 1500
                    });
                } else {
                    this.error = response.msg || '获取城市数据失败';
                    uni.showToast({
                        icon: 'none',
                        title: this.error,
                        duration: 2000
                    });
                }
            } catch (error) {
                this.error = '网络错误，请稍后重试';
                console.error('获取城市数据出错:', error);
                uni.showToast({
                    icon: 'none',
                    title: this.error,
                    duration: 2000
                });
            } finally {
                this.loading = false;
            }
        },
        
        cityClick(item) {
            console.log('选择的城市:', item);
            uni.showToast({
                icon: 'none',
                title: '选择的城市: ' + item.cityName,
                // #ifdef MP-WEIXIN
                duration: 3000,
                // #endif
                mask: true
            });
            uni.setStorageSync('city', item);
            uni.setStorageSync('cityName', item.cityName);
            uni.navigateBack();
        }
    }
}
</script>

<style lang="scss" scoped>
.city-picker-container {
    width: 100%;
    height: 100vh;
    background-color: #f6f5fa;
}

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    
    .loading-text {
        font-size: 28rpx;
        color: #9b9b9b;
    }
}

.error-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    padding: 0 40rpx;
    
    .error-text {
        font-size: 28rpx;
        color: #ff6b6b;
        margin-bottom: 40rpx;
        text-align: center;
    }
    
    .retry-btn {
        padding: 16rpx 40rpx;
        background-color: #4d8cfd;
        color: #fff;
        font-size: 24rpx;
        border-radius: 8rpx;
        
        &:active {
            background-color: #3a7ae8;
        }
    }
}

.debug-info {
    position: fixed;
    top: 100rpx;
    left: 20rpx;
    right: 20rpx;
    background-color: rgba(0, 0, 0, 0.8);
    color: #fff;
    padding: 20rpx;
    border-radius: 8rpx;
    font-size: 24rpx;
    z-index: 1000;
    
    text {
        display: block;
        margin-bottom: 10rpx;
        
        &:last-child {
            margin-bottom: 0;
        }
    }
}
</style>
<template>
    <view class="refund-apply-container">
        <uv-navbar :border="false" autoBack="true" placeholder safeAreaInsetTop></uv-navbar>
        
        <!-- 主要内容区域 -->
        <view class="main-content">
            <view class="tip-text">请选择需要退款的订单</view>
            
            <!-- 充值记录列表 -->
            <uv-radio-group 
                v-model="selectedRechargeId" 
                @change="onRechargeSelect"
                shape="circle"
            >
                <view class="records-container">
                    <view 
                        v-for="(record, index) in rechargeRecords" 
                        :key="record.id"
                        class="record-item-wrapper"
                    >
                        <view 
                            class="record-item"
                            :class="{ 'selected': selectedRechargeId === record.id }"
                            @click="selectRecord(record.id)"
                        >
                            <view class="icon-container">
                                <uv-icon name="weixin-fill" size="36" color="#13a4ec"></uv-icon>
                            </view>
                            <view class="record-info-container">
                                <text class="amount-text">充值金额：¥{{ formatCurrency(record.balance) }}</text>
                                <text class="time-text">{{ record.createTime }}</text>
                                <text class="order-text">订单号：{{ record.auditOpinion }}</text>
                            </view>
                            <view class="radio-container">
                                <uv-radio 
                                    :name="record.id" 
                                    :activeColor="'#007AFF'"
                                    :size="20"
                                />
                            </view>
                        </view>
                        <view v-if="index < rechargeRecords.length - 1" class="divider"></view>
                    </view>
                </view>
            </uv-radio-group>
            
            <!-- 加载更多状态 -->
            <view v-if="isLoadingMore" class="loading-more">
                <uv-loading-icon :show="true" color="#007AFF" />
                <text class="loading-text">加载更多...</text>
            </view>
            
            <!-- 没有更多数据提示 -->
            <view v-if="!pagination.hasMore && rechargeRecords.length > 0" class="no-more">
                <text class="no-more-text">没有更多数据了</text>
            </view>
            
            <!-- 空状态 -->
            <view v-if="rechargeRecords.length === 0 && !isLoading" class="empty-state">
                <view class="empty-icon">📋</view>
                <text class="empty-title">暂无待退款的订单</text>
                <text class="empty-desc">所有可退款的订单将显示在这里。</text>
            </view>
        </view>
        
        <!-- 底部提交按钮 -->
        <view class="footer-container">
            <uv-button 
                :text="'提交退款申请'" 
                type="primary"
                :disabled="!selectedRechargeId || isSubmitting"
                :loading="isSubmitting"
                @click="submitRefundApplication"
                :customStyle="buttonStyle"
            />
        </view>
    </view>
</template>

<script>
import { getRefundList, refundApply } from '../../api/refund';

export default {
    data() {
        return {
            selectedRechargeId: null, // 选中的充值记录ID
            isSubmitting: false, // 是否正在提交
            isLoading: false, // 是否正在加载数据
            isLoadingMore: false, // 是否正在加载更多
            rechargeRecords: [], // 充值记录列表
            // 分页相关
            pagination: {
                page: 1,
                pageSize: 10,
                total: 0,
                hasMore: true
            },
            buttonStyle: {
                backgroundColor: '#007AFF',
                color: '#ffffff',
                fontWeight: 'bold',
                height: '48px',
                borderRadius: '8px'
            }
        }
    },
    onLoad(options) {
        // 页面加载时获取充值记录
        this.loadRechargeRecords(true);
        
        // 如果有传递的充值记录ID，则默认选中
        if (options.rechargeId) {
            this.selectedRechargeId = options.rechargeId;
        }
    },

    computed: {
        formatCurrency() {
            return (amount) => {
                if (typeof amount !== 'number') return '0.00';
                return (amount / 100).toFixed(2);
            };
        },
    },
    
    /**
     * 触底加载更多
     */
    onReachBottom() {
        if (this.pagination.hasMore && !this.isLoadingMore && !this.isLoading) {
            this.loadRechargeRecords(false);
        }
    },
    
    /**
     * 下拉刷新
     */
    onPullDownRefresh() {
        this.refreshData();
    },
    methods: {
        /**
         * 返回上一页
         */
        goBack() {
            uni.navigateBack();
        },
        
        /**
         * 加载充值记录数据
         * @param {Boolean} isRefresh 是否为刷新操作
         */
        async loadRechargeRecords(isRefresh = false) {
            try {
                // 防止重复请求
                if (this.isLoading || this.isLoadingMore) {
                    return;
                }
                
                if (isRefresh) {
                    this.isLoading = true;
                    this.pagination.page = 1;
                    this.pagination.hasMore = true;
                    uni.showLoading({ title: '加载中...' });
                } else {
                    this.isLoadingMore = true;
                    this.pagination.page++;
                }
                
                // 调用退款列表API
                const response = await getRefundList({
                    page: this.pagination.page,
                    pageSize: this.pagination.pageSize,
                    refundType: '0' // 充值记录类型
                });
                
                if (response.code === 0 && response.data) {
                    if (isRefresh) {
                        this.rechargeRecords = response.data.rechargeLists || [];
                    } else {
                        this.rechargeRecords = [...this.rechargeRecords, ...(response.data.rechargeLists || [])];
                    }
                    
                    
                } else {
                    throw new Error(response.msg || '获取数据失败');
                }
                
                if (isRefresh) {
                    uni.hideLoading();
                }
                
            } catch (error) {
                console.error('加载充值记录失败：', error);
                
                if (isRefresh) {
                    uni.hideLoading();
                    uni.showToast({
                        title: '加载失败，请重试',
                        icon: 'none'
                    });
                } else {
                    // 加载更多失败时回退页码
                    this.pagination.page--;
                    uni.showToast({
                        title: '加载更多失败',
                        icon: 'none'
                    });
                }
            } finally {
                this.isLoading = false;
                this.isLoadingMore = false;
                
                // 停止下拉刷新
                uni.stopPullDownRefresh();
            }
        },
        
        /**
         * 刷新数据
         */
        async refreshData() {
            this.selectedRechargeId = null;
            await this.loadRechargeRecords(true);
        },
        
        /**
         * 选择充值记录
         * @param {String} recordId 记录ID
         */
        selectRecord(recordId) {
            this.selectedRechargeId = recordId;
        },
        
        /**
         * 充值记录选择变化回调
         * @param {String} value 选中的值
         */
        onRechargeSelect(value) {
            console.log('选中的充值记录：', value);
            this.selectedRechargeId = value;
        },
        
        /**
         * 提交退款申请
         */
        async submitRefundApplication() {
            if (!this.selectedRechargeId) {
                uni.showToast({
                    title: '请选择要退款的充值记录',
                    icon: 'none'
                });
                return;
            }
            
            // 获取选中的充值记录
            const selectedRecord = this.rechargeRecords.find(
                record => record.id === this.selectedRechargeId
            );
            
            if (!selectedRecord) {
                uni.showToast({
                    title: '所选记录不存在',
                    icon: 'none'
                });
                return;
            }
            
            // 确认对话框
            const confirmResult = await this.showConfirmDialog(selectedRecord);
            if (!confirmResult) {
                return;
            }
            
            try {
                this.isSubmitting = true;
                
                // 调用退款申请API
                const response = await refundApply({
                    balance: selectedRecord.balance,
                    chargeIds: [selectedRecord.id]
                });
                
                if (response.code === 0) {
                    uni.showToast({
                        title: '退款申请已提交',
                        icon: 'success'
                    });
                    // 刷新页面
                    this.refreshData();
                } else if (response.code === 40002) {
                    uni.showToast({
                        title: response.msg,
                        icon: 'none'
                    });
                } else {
                    throw new Error(response.msg || '提交失败');
                }
                
            } catch (error) {
                console.error('提交退款申请失败：', error);
                uni.showToast({
                    title: error.msg || '提交失败，请重试',
                    icon: 'none'
                });
            } finally {
                this.isSubmitting = false;
            }
        },
        
        /**
         * 显示确认对话框
         * @param {Object} record 充值记录
         */
        showConfirmDialog(record) {
            return new Promise((resolve) => {
                uni.showModal({
                    title: '确认退款',
                    content: `确定要申请退款 ${this.formatCurrency(record.balance)} 元吗？\n充值时间：${record.createTime}`,
                    confirmText: '确定',
                    cancelText: '取消',
                    success: (res) => {
                        resolve(res.confirm);
                    },
                    fail: () => {
                        resolve(false);
                    }
                });
            });
        },
        
    }
}
</script>

<style scoped>
.refund-apply-container {
    min-height: 100vh;
    background-color: #f7f8fc;
    display: flex;
    flex-direction: column;
}

.main-content {
    flex: 1;
    padding: 16px;
    padding-bottom: calc(100px + env(safe-area-inset-bottom));
}

.tip-text {
    margin-bottom: 16px;
    font-size: 14px;
    color: #8A8A8E;
}

.records-container {
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    padding: 4px;
}

.record-item-wrapper {
    width: 100%;
}

.record-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    background-color: #ffffff;
}

.record-item:active {
    background-color: #f5f5f5;
}

.record-item.selected {
    background-color: rgba(19, 164, 236, 0.1);
}

.icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 9999px;
    background-color: rgba(19, 164, 236, 0.1);
    flex-shrink: 0;
}

.wallet-icon {
    font-size: 24px;
}

.record-info-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.amount-text {
    font-size: 16px;
    font-weight: 500;
    color: #1C1C1E;
    line-height: 1.4;
}

.time-text {
    font-size: 14px;
    font-weight: 400;
    color: #8A8A8E;
    line-height: 1.4;
}

.order-text {
    font-size: 13px;
    font-weight: 400;
    color: #8A8A8E;
    line-height: 1.4;
}

.radio-container {
    flex-shrink: 0;
}

.divider {
    height: 1px;
    background-color: rgba(0, 0, 0, 0.1);
    margin: 0 16px;
}

.footer-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(247, 248, 252, 0.8);
    backdrop-filter: blur(10px);
    padding: 12px 16px;
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    z-index: 100;
}

.loading-more {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    gap: 8px;
}

.loading-text {
    font-size: 14px;
    color: #8A8A8E;
}

.no-more {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.no-more-text {
    font-size: 14px;
    color: #8A8A8E;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    text-align: center;
}

.empty-icon {
    width: 96px;
    height: 96px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background-color: rgba(19, 164, 236, 0.1);
    font-size: 48px;
    margin-bottom: 24px;
}

.empty-title {
    font-size: 18px;
    font-weight: 600;
    color: #1C1C1E;
    margin-bottom: 8px;
}

.empty-desc {
    font-size: 16px;
    color: #8A8A8E;
}

/* 响应式设计 */
@media screen and (max-width: 375px) {
    .main-content {
        padding: 12px;
    }
    
    .record-item {
        padding: 12px;
        gap: 12px;
    }
    
    .icon-container {
        width: 44px;
        height: 44px;
    }
    
    .wallet-icon {
        font-size: 22px;
    }
    
    .amount-text {
        font-size: 15px;
    }
}
</style>
<template>
    <view class="refund-apply-container">
        
        <!-- 主要内容区域 -->
        <view class="main-content">
            <!-- 充值记录列表 -->
            <uv-radio-group 
                v-model="selectedRechargeId" 
                @change="onRechargeSelect"
                shape="circle"
            >
                <view 
                    v-for="(record, index) in rechargeRecords" 
                    :key="record.id"
                    class="record-item"
                    :class="{ 'selected': selectedRechargeId === record.id }"
                    @click="selectRecord(record.id)"
                >
                    <view class="record-content">
                        <view class="record-info">
                            <text class="amount-text">充值金额: {{ formatCurrency(record.balance) }}</text>
                            <text class="time-text">{{ record.createTime }}</text>
                            <text class="order-text">订单号: {{ record.auditOpinion }}</text>
                        </view>
                        <view class="radio-container">
                            <uv-radio 
                                :name="record.id" 
                                :activeColor="'#e1f5fe'"
                                :size="20"
                            />
                        </view>
                    </view>
                </view>
            </uv-radio-group>
            
            <!-- 加载更多状态 -->
            <view v-if="isLoadingMore" class="loading-more">
                <uv-loading-icon :show="true" color="#1890ff" />
                <text class="loading-text">加载更多...</text>
            </view>
            
            <!-- 没有更多数据提示 -->
            <view v-if="!pagination.hasMore && rechargeRecords.length > 0" class="no-more">
                <text class="no-more-text">没有更多数据了</text>
            </view>
            
            <!-- 空状态 -->
            <uv-empty 
                v-if="rechargeRecords.length === 0 && !isLoading" 
                text="暂无充值记录"
                mode="data"
                :show="true"
            />
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
                backgroundColor: '#e1f5fe',
                color: '#1f2937',
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
    background-color: #f5f7f8;
    display: flex;
    flex-direction: column;
}

.main-content {
    flex: 1;
    padding: 16px;
    padding-bottom: calc(100px + env(safe-area-inset-bottom)); /* 为底部按钮和安全区域留出空间 */
}

.record-item {
    margin-bottom: 16px;
    background-color: #ffffff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    cursor: pointer;
    width: 100%;
}

.record-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.record-item.selected {
    background-color: rgba(225, 245, 254, 0.5);
    border: 1px solid #e1f5fe;
}

.record-content {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 12px;
}

.record-info {
    display: flex;
    flex-direction: column;
    min-width: 95%;
    gap: 6px;
    flex: 1;
}

.amount-text {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
}

.time-text {
    font-size: 14px;
    color: #6b7280;
}

.order-text {
    font-size: 13px;
    color: #9ca3af;
}

.status-text {
    font-size: 13px;
    color: #059669;
    font-weight: 500;
}

.radio-container {
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

.footer-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #f5f7f8;
    padding: 16px;
    padding-bottom: calc(16px + env(safe-area-inset-bottom)); /* 添加安全区域适配 */
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    z-index: 100;
}

/* 加载更多状态样式 */
.loading-more {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    gap: 8px;
}

.loading-text {
    font-size: 14px;
    color: #666666;
}

/* 没有更多数据样式 */
.no-more {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.no-more-text {
    font-size: 14px;
    color: #999999;
}


/* 响应式设计 */
@media screen and (max-width: 375px) {
    .main-content {
        padding: 12px;
    }
    
    .record-item {
        padding: 12px;
        margin-bottom: 12px;
    }
    
    .amount-text {
        font-size: 15px;
    }
    
    .time-text {
        font-size: 13px;
    }
}
</style>
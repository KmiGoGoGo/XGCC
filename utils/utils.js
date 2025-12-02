import { getStyleConfig } from '@/api/style';
export async function contactCustomerService() {
    const res = await getStyleConfig()
        if (res.code !== 0) {
            uni.showToast({
                title: res.msg || '获取客服信息失败',
                icon: 'none'
            });
            return;
        }
    const telephone = res.data.telephone || '4006331838';
    const serviceTime = res.data.serviceTime || '09:00-18:00';
    uni.showModal({
            title: '联系客服',
            content: `客服电话：${telephone || ''}\n客服工作时间：${serviceTime || ''}`,
            showCancel: true,
            cancelText: '取消',
            confirmText: '呼叫客服',
            confirmColor: '#007AFF',
            success: (res1) => {
                if (res1.confirm) {
                    // 用户点击了呼叫客服按钮
                    uni.makePhoneCall({
                        phoneNumber: telephone,
                        success: () => {
                            console.log('呼叫成功');
                        },
                        fail: (err) => {
                            console.log('呼叫失败', err);
                            uni.showToast({
                                title: '呼叫失败',
                                icon: 'none'
                            });
                        }
                    });
                }
            }
        });
}
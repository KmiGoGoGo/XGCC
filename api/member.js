import http from '../utils/request'
import globalData from '../globalData.js';

/**
 * @description 获取当前登录会员的信息
 * @returns {Promise<object>}
 *
 * @example
 * // 响应体
 * {
 *   "code": 0,
 *   "msg": "成功",
 *   "data": {
 *     "name": "微信充电用户_3954",
 *     "telephone": "15576753954",
 *     "accountBalance": "5103"
 *   }
 * }
 */
export function getMemberInfo() {
    return http.post('/api-service/api/getMemberInfo')
}

/**
 * @description 分页获取我的占位费账单
 * @param {object} data - 请求体
 * @param {number} data.billStatus - 账单状态
 * @param {number} data.current - 当前页码
 * @param {number} data.pageSize - 每页数量
 * @returns {Promise<object>}
 *
 * @example
 * // 请求
 * { "billStatus": 11, "current": 1, "pageSize": 10 }
 *
 * // 响应体
 * {
 *   "code": 0,
 *   "msg": "成功",
 *   "data": {
 *     "records": [ ... ],
 *     "total": 2
 *   }
 * }
 */
export function getMyOccupyBillPage(data) {
    return http.post('/api-service/api/getMyOccupyBillPage', data)
}

/**
 * @description 获取用户类型
 * @returns {Promise<object>}
 *
 * @example
 * // 响应体
 * {
 *   "code": 0,
 *   "msg": "成功",
 *   "data": ["0"]
 * }
 */
export function getUserType() {
    return http.post('/api-service/api/getUserType')
}

export function loginAndRegister(data) {
    return http.post('/api-service/api/loginAndRegister', data);
}

export function alipayLoginAndRegister(data) {
    return http.post('/api-service/zfbapi/loginAndRegister', data);
}

/**
 * @description 登录前检查，用于获取token
 * @param {object} data - 请求体
 * @returns {Promise<object>}
 */
export function loginBeforeCheck(data) {
    return http.post('/api-service/api/loginBeforeCheck', data);
}

export function alipayLoginBeforeCheck(data) {
    return http.post('/api-service/zfbapi/loginBeforeCheck', data);
}

/**
 * @description 登录其他方式
 * @param {object} data - 请求体
 * @returns {Promise<object>}
 */
export function loginOther(data) {
    return http.post('/api-service/api/loginOther', data);
}

export function alipayLoginOther(data) {
    return http.post('/api-service/zfbapi/loginOther', data);
}


/**
 * @description 获取弹窗信息
 * @returns {Promise<object>}
 */
export function listPopUp() {
    return http.post('/api-service/api/popUp/listPopUp');
}

/**
 * @description 根据sellerId获取发票信息
 * @returns {Promise<object>}
 */
export function getInvoiceBySellerId() {
    const sellerId = globalData.sellerId;
    return http.post(`/api-service/api/invoice/getBySellerId/${sellerId}`);
}

/**
 * @description 查询动态活动
 * @param {string} cityName - 城市名称
 * @returns {Promise<object>}
 */
export function queryDynamicsActivity(cityName) {
    if (!cityName) {
        cityName = '全国'
    }
    return new Promise((resolve, reject) => {
        uni.request({
        url: `http://cy.gy-ev.com/api/api-service/api/queryDynamicsActivity?sellerNo=${globalData.sellerNo}&address=${cityName}`,
        method: 'GET',
        success: (res) => {
            console.log('queryDynamicsActivity', res)
            resolve(res)
        },
        fail: (err) => {
            reject(err)
        }
        })
    })
    // return http.get(`/api-service/api/queryDynamicsActivity?sellerNo=${globalData.sellerNo}&address=${cityName}`);
}

/**
 * @description 获取新旧带新福利信息
 * @returns {Promise<object>}
 */
export function getOldAndNewBenifit() {
    const sellerId = globalData.sellerId;
    return http.post(`/api-service/api/friend/getOldAndNewBenifit/${sellerId}`);
}

/**
 * @description 获取我的未支付账单数量
 * @param {object} data - 请求体
 * @returns {Promise<object>}
 */
export function getMyNotPayBillNumber(data) {
    return http.post('/api-service/api/getMyNotPayBillNumber', data);
}

/**
 * @description 获取账户信息
 * @param {object} data - 请求体
 * @returns {Promise<object>}
 */
export function getAccountInfo(data) {
    return http.post('/api-service/api/getAccountInfo', data);
}

/**
 * @description 分页获取账户流水列表
 * @param {object} data - 请求体
 * @returns {Promise<object>}
 */
export function getAccountFlowPage(data) {
    return http.post('/api-service/api/pageList', data);
}


/**
 * @description 根据ID获取退款记录详情
 * @param {object} data - 请求体，包含 refundId
 * @returns {Promise<object>}
 */
export function getRefundRecordById(data) {
    return http.post('/api-service/api/refund/refundRecordById', data);
}

/**
 * @description 获取退款记录列表
 * @param {object} data - 请求体，包含 page, pageSize
 * @returns {Promise<object>}
 */
export function getRefundRecordList(data) {
    return http.post('/api-service/api/refund/refundRecordList', data);
}

/**
 * @description 查询会员状态
 * @returns {Promise<object>}
 */
export function queryMemberStatus() {
    return http.post('/api-service/api/querMemberStatus');
}

/**
 * @description 查询证书状态
 * @param {object} data - 请求体，包含 orderCode, telephone, memberId
 * @returns {Promise<object>}
 */
export function isCertificate(data) {
    return http.post('/api-service/api/isCertificate', data);
}


/**
 * @description 修改用户信息
 * @param {number} changeType - 修改类型 0- 个人身份 1- 车队身份
 * @returns {Promise<object>}
 */
export function changeUser(changeType) {
    return http.post(`/api-service/api/changeUser?changeType=${changeType}`);
}


/**
 * @description 退出登录
 * @returns {Promise<object>}
 */
export function logout() {
    return http.post('/api-service/api/AppH5logout', { type: '3'});
}



/**
 * @description 上传图片
 * @param {object} data - 请求体，包含 file
 * @returns {Promise<object>}
 */
export function upload(data) {
    return http.post('/api-service/common/upload', data);
}

/**
 * @description 获取充值优惠金额列表
 * @param {number} price - 充值金额（单位：分），用于查询哪些金额有优惠
 * @returns {Promise<object>}
 *
 * @example
 * // 请求
 * getRechargeDiscounts(100000) // 查询1000元对应的优惠金额列表
 *
 * // 响应体
 * {
 *   "code": 0,
 *   "msg": "成功",
 *   "data": [60000, 30000, 20000, 100000],
 *   "fail": false,
 *   "success": true
 * }
 */
export function getRechargeDiscounts(price = 100000) {
    return http.post(`/api-service/api/getRechargeDiscounts?price=${price}`)
}

/**
 * @description 获取充值奖励说明
 * @param {number} price - 充值金额（单位：分）
 * @returns {Promise<object>}
 *
 * @example
 * // 请求
 * getRechargeAwardExplain(20000) // 查询200元对应的奖励说明
 *
 * // 响应体
 * {
 *   "code": 0,
 *   "data": ["优惠说明(p标签)", [{"name": "祥龙路"}]]
 * }
 */
export function getRechargeAwardExplain(price) {
    return http.post(`/api-service/api/getRechargeAwardExplain?price=${price}`)
}
import http from '../utils/request'

/**
 * @description 获取退款金额信息
 * @returns {Promise<object>}
 */
export function getRefundAmount() {
    return http.post('/api-service/api/refund/refundAmount');
}

/**
 * @description 获取可退款列表
 * @param {object} data - 请求体，包含 page, pageSize, refundType
 * @returns {Promise<object>}
 */
export function getRefundList(data) {
    return http.post('/api-service/api/refund/refundList', data);
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
 * @description 申请退款
 * @param {object} data - 请求体，{ balance, chargeIds }
 * @returns {Promise<object>}
 */
export function refundApply(data) {
    return http.post('/api-service/api/refund/refundApply', data);
}

export function getLeaguerAccountRefundList(data) {
    return http.post('/api-service/api/refund/personalRefundList', data);
}

export function getLeaguerAccountRefundRecordList(data) {
    return http.post('/api-service/api/refund/personalRefundRecordList', data);
}

export function leaguerAccountRefundApply(data) {
    return http.post('/api-service/api/refund/personalRecordApply', data);
}

/**
 * @description 获取退款金额信息
 * @returns {Promise<object>}
 */
export function getLeaguerAccountRefundAmount() {
    return http.post('/api-service/api/refund/personalRefundAmount');
}

// 优惠券相关API
import  request  from '../utils/request'

/**
 * 获取我的优惠券页面数据
 * @param {object} data - 请求参数
 * @param {number} data.tab - 标签页 (例如: 1)
 * @param {number} data.current - 当前页码
 * @param {number} data.size - 每页数量
 * @returns {Promise}
 */
export const myCouponPage = (data) => {
  return request.post('/api-service/api/myCouponPage', data)
}

/**
 * @description 查询是否已发送优惠券
 * @param {object} data - 请求体, 包含 busId
 * @returns {Promise<object>}
 */
export function query_isSendCoupon(data) {
    return request.post('/api/api-service/api/query_isSendCoupon', data);
}


/**
 * @description 查询优惠券记录
 * @param {object} data - 请求体, 包含 billId
 * @returns {Promise<object>}
 */
export function getCouponRecodeByBill(data) {
    return request.post('/api-service/api/getCouponRecodeByBill', data);
}
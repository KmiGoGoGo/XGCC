// 订单/账单相关API
import  request  from '../utils/request'

/**
 * 获取我的超时占位订单分页列表
 * @param {object} params - 请求参数
 * @param {number} params.current - 当前页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise}
 */
export const getMyOccupyBillPage = (params) => {
  return request.post('/api-service/api/getMyOccupyBillPage', params)
}

/**
 * 根据ID获取账单详情
 * @param {number} id - 账单ID
 * @returns {Promise}
 */
export const getBillDetailById = (id) => {
  return request.get(`/api-service/api/myBillDetails?id=${id}`)
}

/**
 * 获取我的账单分页列表
 * @param {object} params - 请求参数
 * @param {number} params.current - 当前页码
 * @param {number} params.size - 每页数量
 * @returns {Promise}
 */
export const myBillPage = (params) => {
  return request.post('/api-service/api/myBillPage', params)
}

/**
 * 
 * @param {string} busId 业务ID
 * @returns 
 */
export const getBillByNo = (busId) => {
  return request.post(`/bill-service/bill/getBillByNo?busId=${busId}`)
}

/**
 * 根据ID获取我的账单详情
 * @param {object} params - 请求参数, 包含 id
 * @returns {Promise}
 */
// export const myBillDetails = (params) => {
//   return request.get('/api/api-service/api/myBillDetails', params)
// }

/**
 * @description 获取可延迟支付的账单
 * @param {object} data - 请求体, 包含 busId
 * @returns {Promise<object>}
 */
export function getDelayPayBill(data) {
    return request.post('/api-service/api/getDelayPayBill', data);
}

/**
 * @description 延迟扣款
 * @param {object} data - 请求体, 包含 id, couponIdStr
 * @returns {Promise<object>}
 */
export function delayDeductionCharge(data) {
    return request.post('/api-service/api/delayDeductionCharge', data);
}


/**
 * @description 支付账单
 * @param {string} id - 账单ID
 * @returns {Promise<object>}
 */
export function getOccupyBillById(id) {
    return request.post(`/api-service/api/getBillDetailById?id=${id}`);
}


/**
 * @description 评论账单
 * @param {object} data - 请求体，包含 billId, comment, score
 * @returns {Promise<object>}
 */
export function billComment(data) {
    return request.post('/api-service/api/billComment', data);
}

/**
 * @param {Object} params
 */
export function getDetailsByBusId(params) {
  return request.post(`/api-service/api/getDetailsByBusId?busId=${params}`);
}
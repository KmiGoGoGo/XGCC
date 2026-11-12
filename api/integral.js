// 积分相关API
import  request  from '../utils/request.js'

/**
 * 获取会员等级规则
 * @returns {Promise}
 */
export const getMemberGradeRule = () => {
  return request.post('/api-service/api/getMemberGradeRule')
}

/**
 * 获取当前用户积分信息
 * @returns {Promise}
 */
export const getIntegral = () => {
  return request.post('/api-service/api/getIntegral')
}

/**
 * 获取积分明细列表
 * @param {object} data - 请求参数
 * @param {number} data.current - 当前页码
 * @param {number} data.size - 每页数量
 * @returns {Promise}
 */
export const getIntegralDetail = (data) => {
  return request.post('/api-service/api/integral/getDetail', data)
}

/**
 * 获取积分收支总计
 * @param {object} data - 请求参数
 * @param {string} data.startTime - 开始时间
 * @param {string} data.endTime - 结束时间
 * @returns {Promise}
 */
export const getIntegralSum = (data) => {
  return request.post('/api-service/api/integral/getSum', data)
}

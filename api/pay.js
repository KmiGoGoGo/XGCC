import http from '../utils/request'

/**
 * =====================================
 * 支付宝"充完即退"支付流程相关API
 * =====================================
 */

/**
 * @description 支付宝充完即退-创建订单（第1步：后端预校验）
 * @param {object} data - 请求体
 * @param {string} data.pileNo - 充电桩编号
 * @param {string} data.gunNo - 充电枪编号
 * @param {number} data.preChargeAmount - 预设充电金额
 * @returns {Promise<object>} 返回订单创建结果
 * 
 * @example
 * // 请求参数
 * {
 *   "pileNo": "PILE001",
 *   "gunNo": "GUN01", 
 *   "preChargeAmount": 50.00
 * }
 * 
 * // 响应结果
 * {
 *   "code": 0,
 *   "msg": "成功",
 *   "data": {
 *     "orderNo": "ALI202403150001",
 *     "status": "待支付"
 *   }
 * }
 */
export function alipayDisposableStartCharge(data) {
    return http.post('/api-service/api/alipay/charge/disposableStartCharge', data);
}

/**
 * @description 支付宝充完即退-统一下单（第2步：微信支付预下单）
 * @param {object} data - 请求体
 * @param {string} data.orderNo - 订单号
 * @param {number} data.preChargeAmount - 预设充电金额
 * @param {string} data.pileNo - 充电桩编号
 * @param {string} data.gunNo - 充电枪编号
 * @returns {Promise<object>} 返回支付宝统一下单结果，包含调起支付宝支付所需的参数
 * 
 * @example
 * // 请求参数
 * {
 *   "orderNo": "ALI202403150001",
 *   "preChargeAmount": 50.00,
 *   "pileNo": "PILE001",
 *   "gunNo": "GUN01"
 * }
 * 
 * // 响应结果
 * {
 *   "code": 0,
 *   "msg": "成功", 
 *   "data": {
 *     "orderStr": "alipay_sdk=alipay-sdk-java...", // 支付宝支付参数字符串
 *     "orderNo": "ALI202403150001"
 *   }
 * }
 */
export function alipayDisposableUnifiedOrders(data) {
    return http.post('/api-service/api/alipay/disposable/unifiedOrders', data);
}

/**
 * @description 支付宝充完即退-查询支付结果（第3步：轮询支付结果）
 * @param {object} data - 请求体
 * @param {string} data.orderNo - 订单号
 * @returns {Promise<object>} 返回支付状态查询结果
 * 
 * @example
 * // 请求参数
 * {
 *   "orderNo": "ALI202403150001"
 * }
 * 
 * // 响应结果 - 支付成功
 * {
 *   "code": 0,
 *   "msg": "成功",
 *   "data": {
 *     "payStatus": "SUCCESS",
 *     "orderNo": "ALI202403150001",
 *     "actualAmount": 50.00,
 *     "payTime": "2024-03-15 14:30:25"
 *   }
 * }
 * 
 * // 响应结果 - 支付中
 * {
 *   "code": 0,
 *   "msg": "支付中",
 *   "data": {
 *     "payStatus": "PAYING",
 *     "orderNo": "ALI202403150001"
 *   }
 * }
 */
export function alipayDisposableOrderResultQuery(data) {
    return http.post('/api-service/api/alipay/disposable/orderResultQuery', data);
}

/**
 * @description 支付宝充完即退-取消支付（第4步：异常处理-全额退款）
 * @param {object} data - 请求体
 * @param {string} data.orderNo - 订单号
 * @param {string} [data.cancelReason] - 取消原因
 * @returns {Promise<object>} 返回取消结果
 * 
 * @example
 * // 请求参数
 * {
 *   "orderNo": "ALI202403150001",
 *   "cancelReason": "用户取消支付"
 * }
 * 
 * // 响应结果
 * {
 *   "code": 0,
 *   "msg": "订单已取消，退款将在1-3个工作日内到账",
 *   "data": {
 *     "orderNo": "ALI202403150001",
 *     "refundStatus": "REFUNDING",
 *     "refundAmount": 50.00
 *   }
 * }
 */
export function alipayDisposableCancelRecharge(data) {
    return http.post('/api-service/api/alipay/disposable/cancelRecharge', data);
}

/**
 * =====================================
 * 支付宝普通支付相关API (备用)
 * =====================================
 */

/**
 * @description 支付宝统一下单接口（非充完即退模式）
 * @param {object} data - 请求体
 * @param {string} data.orderNo - 订单号
 * @param {number} data.amount - 支付金额
 * @param {string} data.subject - 订单标题
 * @param {string} [data.body] - 订单描述
 * @returns {Promise<object>} 返回支付宝下单结果
 */
export function alipayUnifiedOrder(data) {
    return http.post('/api-service/api/alipay/unifiedOrders', data);
}

/**
 * @description 支付宝订单状态查询接口
 * @param {object} data - 请求体  
 * @param {string} data.orderNo - 订单号
 * @returns {Promise<object>} 返回订单状态
 */
export function alipayOrderQuery(data) {
    return http.post('/api-service/api/alipay/orderQuery', data);
}

/**
 * @description 支付宝订单支付结果查询接口
 * @param {object} data - 请求体  
 * @param {string} data.orderNo - 订单号
 * @returns {Promise<object>} 返回订单状态
 */
export function alipayOrderResultQuery(data) {
    return http.post('/api-service/api/alipay/orderResultQuery', data);
}

/**
 * @description 支付宝申请退款接口
 * @param {object} data - 请求体
 * @param {string} data.orderNo - 原订单号
 * @param {number} data.refundAmount - 退款金额
 * @param {string} [data.refundReason] - 退款原因
 * @returns {Promise<object>} 返回退款申请结果
 */
export function alipayRefund(data) {
    return http.post('/api-service/api/alipay/refund', data);
}

/**
 * @description 支付宝退款查询接口
 * @param {object} data - 请求体
 * @param {string} data.orderNo - 原订单号
 * @param {string} [data.refundRequestNo] - 退款请求号
 * @returns {Promise<object>} 返回退款状态
 */
export function alipayRefundQuery(data) {
    return http.post('/api-service/api/alipay/refundQuery', data);
}

/**
 * =====================================
 * 微信支付"充完即退"相关API (保留原有功能)
 * =====================================
 */

/**
 * @description 微信充完即退-创建订单
 * @param {object} data - 请求体
 * @param {string} data.pileNo - 充电桩编号
 * @param {string} data.gunNo - 充电枪编号  
 * @param {number} data.preChargeAmount - 预设充电金额
 * @returns {Promise<object>} 返回订单创建结果
 */
export function disposableStartCharge(data) {
    return http.post('/api-service/api/charge/disposableStartCharge', data);
}

/**
 * @description 微信充完即退-统一下单
 * @param {object} data - 请求体
 * @param {string} data.orderNo - 订单号
 * @param {number} data.preChargeAmount - 预设充电金额
 * @param {string} data.pileNo - 充电桩编号
 * @param {string} data.gunNo - 充电枪编号
 * @returns {Promise<object>} 返回微信统一下单结果
 */
export function disposableUnifiedOrders(data) {
    return http.post('/api-service/api/disposable/unifiedOrders', data);
}

/**
 * @description 微信充完即退-查询支付结果
 * @param {object} data - 请求体
 * @param {string} data.orderNo - 订单号
 * @returns {Promise<object>} 返回支付状态查询结果
 */
export function disposableOrderResultQuery(data) {
    return http.post('/api-service/api/disposable/orderResultQuery', data);
}

/**
 * @description 微信充完即退-取消支付
 * @param {object} data - 请求体
 * @param {string} data.orderNo - 订单号
 * @param {string} [data.cancelReason] - 取消原因
 * @returns {Promise<object>} 返回取消结果
 */
export function disposableCancelRecharge(data) {
    return http.post('/api-service/api/disposable/cancelRecharge', data);
}


/**
 * @description 车队子成员会员统一下单
 * @param {object} data - 请求体
 * @param {string} data.orderNo - 订单号
 * @param {number} data.amount - 支付金额
 * @param {string} data.subject - 订单标题
 * @param {string} [data.body] - 订单描述
 * @returns {Promise<object>} 返回会员统一下单结果
 */

export function alipayLeaguerUnifiedOrders(data) {
    return http.post('/api-service/api/alipay/leaguerUnifiedOrders', data);
}

/**
 * @description 车队子成员会员统一下单
 * @param {object} data - 请求体
 * @param {string} data.orderNo - 订单号
 * @param {number} data.amount - 支付金额
 * @param {string} data.subject - 订单标题
 * @param {string} [data.body] - 订单描述
 * @returns {Promise<object>} 返回会员统一下单结果
 */

export function wechatLeaguerUnifiedOrders(data) {
    return http.post('/api-service/api/leaguerUnifiedOrders', data);
}

/**
 * =====================================
 * 微信占位订单支付相关API
 * =====================================
 */

/**
 * @description 微信占位订单-统一下单
 * @param {object} data - 请求体
 * @param {number} data.totalFee - 支付金额（分）
 * @param {number} data.orderBalance - 订单金额（分）
 * @param {string} data.openId - 用户openId
 * @param {string} data.occupydBillId - 占位账单ID
 * @returns {Promise<object>} 返回微信统一下单结果，包含调起微信支付所需的参数
 * 
 * @example
 * // 请求参数
 * {
 *   "totalFee": 100,
 *   "orderBalance": 100,
 *   "openId": "oABCD1234567890",
 *   "occupydBillId": "BILL123456"
 * }
 * 
 * // 响应结果
 * {
 *   "code": 0,
 *   "msg": "成功",
 *   "data": {
 *     "timeStamp": "1234567890",
 *     "nonceStr": "abc123",
 *     "package": "prepay_id=wx123456",
 *     "paySign": "signature",
 *     "signType": "RSA",
 *     "outTradeNo": "WX202403150001"
 *   }
 * }
 */
export function wechatDisposableUnifiedOrders(data) {
    return http.post('/api-service/api/disposable/unifiedOrders', data);
}

/**
 * @description 微信占位订单-查询支付结果
 * @param {object} data - 请求体
 * @param {string} data.orderNo - 订单号
 * @returns {Promise<object>} 返回支付状态查询结果
 * 
 * @example
 * // 请求参数
 * {
 *   "orderNo": "WX202403150001"
 * }
 * 
 * // 响应结果 - 支付成功
 * {
 *   "code": 0,
 *   "msg": "成功",
 *   "data": {
 *     "payStatus": "SUCCESS",
 *     "orderNo": "WX202403150001",
 *     "actualAmount": 100,
 *     "payTime": "2024-03-15 14:30:25"
 *   }
 * }
 */
export function wechatDisposableOrderResultQuery(data) {
    return http.post('/api-service/api/disposable/orderResultQuery', data);
}

/**
 * @description 微信占位订单-取消支付
 * @param {object} data - 请求体
 * @param {string} data.orderNo - 订单号
 * @param {string} [data.cancelReason] - 取消原因
 * @returns {Promise<object>} 返回取消结果
 * 
 * @example
 * // 请求参数
 * {
 *   "orderNo": "WX202403150001",
 *   "cancelReason": "用户取消支付"
 * }
 * 
 * // 响应结果
 * {
 *   "code": 0,
 *   "msg": "订单已取消，退款将在1-3个工作日内到账",
 *   "data": {
 *     "orderNo": "WX202403150001",
 *     "refundStatus": "REFUNDING",
 *     "refundAmount": 100
 *   }
 * }
 */
export function wechatDisposableCancelRecharge(data) {
    return http.post('/api-service/api/disposable/cancelRecharge', data);
}

/**
 * =====================================
 * 微信支付充值相关API
 * =====================================
 */

/**
 * @description 微信支付统一下单接口（充值）
 * @param {object} data - 请求体
 * @param {string} data.openId - 用户openId
 * @param {string} data.totalFee - 支付金额（分）
 * @param {string} data.tradeType - 交易类型：JSAPI(小程序)/APP(APP支付)/MWEB(H5支付)
 * @returns {Promise<object>} 返回微信支付下单结果
 * 
 * @example
 * // 响应结果
 * {
 *   "code": 0,
 *   "msg": "成功",
 *   "data": {
 *     "timeStamp": "1234567890",
 *     "nonceStr": "abc123",
 *     "package": "prepay_id=wx123456",
 *     "paySign": "signature",
 *     "orderNo": "ORDER001"
 *   }
 * }
 */
export function wechatUnifiedOrder(data) {
    return http.post('/api-service/api/unifiedOrders', data);
}

/**
 * @description 微信支付订单状态查询接口（充值）
 * @param {object} data - 请求体  
 * @param {string} data.orderNo - 订单号
 * @returns {Promise<object>} 返回订单状态
 * 
 * @example
 * // 响应结果
 * {
 *   "code": 0,
 *   "msg": "成功",
 *   "data": {
 *     "payStatus": "SUCCESS",
 *     "orderNo": "ORDER001"
 *   }
 * }
 */
export function wechatOrderResultQuery(data) {
    return http.post('/api-service/api/orderResultQuery', data);
}
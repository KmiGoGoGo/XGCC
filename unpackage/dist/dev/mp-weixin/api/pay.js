"use strict";
const utils_request = require("../utils/request.js");
function alipayDisposableUnifiedOrders(data) {
  return utils_request.http.post("/api-service/api/alipay/disposable/unifiedOrders", data);
}
function alipayDisposableOrderResultQuery(data) {
  return utils_request.http.post("/api-service/api/alipay/disposable/orderResultQuery", data);
}
function alipayDisposableCancelRecharge(data) {
  return utils_request.http.post("/api-service/api/alipay/disposable/cancelRecharge", data);
}
function alipayUnifiedOrder(data) {
  return utils_request.http.post("/api-service/api/alipay/unifiedOrders", data);
}
function alipayOrderResultQuery(data) {
  return utils_request.http.post("/api-service/api/alipay/orderResultQuery", data);
}
function disposableStartCharge(data) {
  return utils_request.http.post("/api-service/api/charge/disposableStartCharge", data);
}
function alipayLeaguerUnifiedOrders(data) {
  return utils_request.http.post("/api-service/api/alipay/leaguerUnifiedOrders", data);
}
exports.alipayDisposableCancelRecharge = alipayDisposableCancelRecharge;
exports.alipayDisposableOrderResultQuery = alipayDisposableOrderResultQuery;
exports.alipayDisposableUnifiedOrders = alipayDisposableUnifiedOrders;
exports.alipayLeaguerUnifiedOrders = alipayLeaguerUnifiedOrders;
exports.alipayOrderResultQuery = alipayOrderResultQuery;
exports.alipayUnifiedOrder = alipayUnifiedOrder;
exports.disposableStartCharge = disposableStartCharge;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/pay.js.map

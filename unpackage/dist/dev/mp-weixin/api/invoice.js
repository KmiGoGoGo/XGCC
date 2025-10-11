"use strict";
const utils_request = require("../utils/request.js");
function getUnInvoiceBillList(data) {
  return utils_request.http.post("/api-service/api/invoice/getUnInvoiceBillList", data);
}
function queryInvoiceRecordList(data) {
  return utils_request.http.post("/api-service/api/invoice/queryInvoiceRecordList", data);
}
function queryInvoiceDetailById(id) {
  return utils_request.http.post(`/api-service/api/invoice/queryInvoiceDetailById/${id}`);
}
function getInvoiceBillList(billIds) {
  return utils_request.http.post("/api-service/api/invoice/getInvoiceBillList", billIds);
}
exports.getInvoiceBillList = getInvoiceBillList;
exports.getUnInvoiceBillList = getUnInvoiceBillList;
exports.queryInvoiceDetailById = queryInvoiceDetailById;
exports.queryInvoiceRecordList = queryInvoiceRecordList;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/invoice.js.map

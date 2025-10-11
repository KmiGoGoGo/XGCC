"use strict";
const utils_request = require("../utils/request.js");
const getMyOccupyBillPage = (params) => {
  return utils_request.http.post("/api-service/api/getMyOccupyBillPage", params);
};
const getBillDetailById = (id) => {
  return utils_request.http.get(`/api-service/api/myBillDetails?id=${id}`);
};
const myBillPage = (params) => {
  return utils_request.http.post("/api-service/api/myBillPage", params);
};
const getBillByNo = (busId) => {
  return utils_request.http.post(`/bill-service/bill/getBillByNo?busId=${busId}`);
};
function getDelayPayBill(data) {
  return utils_request.http.post("/api-service/api/getDelayPayBill", data);
}
function delayDeductionCharge(data) {
  return utils_request.http.post("/api-service/api/delayDeductionCharge", data);
}
function getOccupyBillById(id) {
  return utils_request.http.post(`/api-service/api/getBillDetailById?id=${id}`);
}
function billComment(data) {
  return utils_request.http.post("/api-service/api/billComment", data);
}
exports.billComment = billComment;
exports.delayDeductionCharge = delayDeductionCharge;
exports.getBillByNo = getBillByNo;
exports.getBillDetailById = getBillDetailById;
exports.getDelayPayBill = getDelayPayBill;
exports.getMyOccupyBillPage = getMyOccupyBillPage;
exports.getOccupyBillById = getOccupyBillById;
exports.myBillPage = myBillPage;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/bill.js.map

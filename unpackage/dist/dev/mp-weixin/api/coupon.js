"use strict";
const utils_request = require("../utils/request.js");
const myCouponPage = (data) => {
  return utils_request.http.post("/api-service/api/myCouponPage", data);
};
function getCouponRecodeByBill(data) {
  return utils_request.http.post("/api-service/api/getCouponRecodeByBill", data);
}
exports.getCouponRecodeByBill = getCouponRecodeByBill;
exports.myCouponPage = myCouponPage;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/coupon.js.map

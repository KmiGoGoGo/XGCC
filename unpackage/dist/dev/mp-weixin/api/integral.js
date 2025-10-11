"use strict";
const utils_request = require("../utils/request.js");
const getMemberGradeRule = () => {
  return utils_request.http.post("/api-service/api/getMemberGradeRule");
};
const getIntegral = () => {
  return utils_request.http.post("/api-service/api/getIntegral");
};
const getIntegralDetail = (data) => {
  return utils_request.http.post("/api-service/api/integral/getDetail", data);
};
const getIntegralSum = (data) => {
  return utils_request.http.post("/api-service/api/integral/getSum", data);
};
exports.getIntegral = getIntegral;
exports.getIntegralDetail = getIntegralDetail;
exports.getIntegralSum = getIntegralSum;
exports.getMemberGradeRule = getMemberGradeRule;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/integral.js.map

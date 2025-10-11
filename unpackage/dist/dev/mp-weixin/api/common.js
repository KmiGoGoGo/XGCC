"use strict";
const utils_request = require("../utils/request.js");
function queryPayAccountSetting(data) {
  return utils_request.http.post("/api-service/api/payAccountSetting/queryList", data);
}
function getMinimumStartBalance() {
  return utils_request.http.post("/api-service/api/getMinimumStartBalance");
}
exports.getMinimumStartBalance = getMinimumStartBalance;
exports.queryPayAccountSetting = queryPayAccountSetting;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/common.js.map

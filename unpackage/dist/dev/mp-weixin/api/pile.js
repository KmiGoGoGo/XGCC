"use strict";
const utils_request = require("../utils/request.js");
function getPileDTOByNo(data) {
  return utils_request.http.postForm("/api-service/api/getPileDTOByNo", data);
}
exports.getPileDTOByNo = getPileDTOByNo;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/pile.js.map

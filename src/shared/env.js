if (process.env.IS_SERVER) {
  module.exports = require('../../env.json');
} else {
  module.exports = require('!!../tools/env-filter-loader!../../env.json');
}

if (process.env.IS_SERVER) {
  module.exports = JSON.parse(
    require('fs').readFileSync(require('path').join(__dirname, '../../env.json'))
  );
} else {
  module.exports = window.__ENV;
}

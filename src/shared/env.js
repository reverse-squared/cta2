if (process.env.IS_SERVER) {
  module.exports = JSON.parse(
    require('fs').readFileSync(require('path').join(process.cwd(), 'env.json'))
  );
} else {
  module.exports = window.__ENV;
}

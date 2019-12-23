module.exports.default = function(source) {
  const env = JSON.parse(source);

  // filter what env the client can get
  return JSON.stringify({
    googleAnalyticsID: env.googleAnalyticsID,
  });
};

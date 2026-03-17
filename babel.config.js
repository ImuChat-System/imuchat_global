// Root Babel config — ensures Jest can parse TS/JSX from workspace root
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
  };
};

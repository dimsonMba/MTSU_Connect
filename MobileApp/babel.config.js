module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { unstable_transformImportMeta: true }],
      // nativewind/babel exports a preset-like object (it defines .plugins),
      // so it must be added to `presets` rather than `plugins` to avoid
      // Babel validation errors.
      require("nativewind/babel"),
    ],
  };
};

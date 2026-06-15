(function () {
  "use strict";

  window.PixelIconConstants = {
    DEFAULT_OUTPUT_WIDTH: 32,
    DEFAULT_OUTPUT_HEIGHT: 32,
    LEGACY_OUTPUT_SIZE: 32,
    MAX_OUTPUT_DIMENSION: 256,
    PRESET_OUTPUT_SIZES: [
      { width: 16, height: 16, label: "16x16" },
      { width: 24, height: 24, label: "24x24" },
      { width: 32, height: 32, label: "32x32" },
      { width: 48, height: 48, label: "48x48" },
      { width: 64, height: 64, label: "64x64" }
    ],
    SAMPLING_MODES: ["median", "average", "center"],
    DEFAULT_SAMPLING_MODE: "median",
    OUTPUT_FORMATS: ["png", "jpg", "aseprite"],
    DEFAULT_OUTPUT_FORMAT: "png",
    PALETTE_LIMIT_MODES: ["off", "auto", "4", "8", "16", "32", "64", "128", "256", "custom"],
    DEFAULT_PALETTE_MODE: "off",
    MIN_PALETTE_COLORS: 2,
    MAX_PALETTE_COLORS: 256,
    AUTO_PALETTE_RULES: [
      { maxDimension: 16, colors: 4 },
      { maxDimension: 24, colors: 8 },
      { maxDimension: 32, colors: 16 },
      { maxDimension: 48, colors: 16 },
      { maxDimension: 64, colors: 32 },
      { maxDimension: Infinity, colors: 32 }
    ],
    FORMAT_LABELS: {
      png: "PNG",
      jpg: "JPG",
      aseprite: "Aseprite"
    },
    FORMAT_EXTENSIONS: {
      png: "png",
      jpg: "jpg",
      aseprite: "aseprite"
    },
    FORMAT_MIME_TYPES: {
      png: "image/png",
      jpg: "image/jpeg",
      aseprite: "application/octet-stream"
    },
    TRANSPARENT_ALPHA_THRESHOLD: 16,
    MIN_OPAQUE_RATIO: 0.1,
    SUPPORTED_MIME_TYPES: ["image/png", "image/jpeg"],
    SUPPORTED_EXTENSIONS: [".png", ".jpg", ".jpeg"],
    DEFAULT_OUTPUT_FILENAME: "pixel_icon_32x32_median.png",
    JPG_BACKGROUND_COLOR: [255, 255, 255, 255],
    ASEPRITE_MAGIC: 0xA5E0,
    ASEPRITE_FRAME_MAGIC: 0xF1FA,
    ASEPRITE_LAYER_CHUNK_TYPE: 0x2004,
    ASEPRITE_CEL_CHUNK_TYPE: 0x2005
  };
})();

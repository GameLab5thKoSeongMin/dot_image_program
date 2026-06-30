(function () {
  "use strict";

  window.PixelIconConstants = {
    DEFAULT_OUTPUT_WIDTH: 32,
    DEFAULT_OUTPUT_HEIGHT: 32,
    LEGACY_OUTPUT_SIZE: 32,
    SIZE_PRESET_VALUES: [16, 32, 64, 128, 256],
    DEFAULT_WIDTH_OPTION: "32",
    DEFAULT_HEIGHT_OPTION: "32",
    DEFAULT_CUSTOM_SIZE_ENABLED: false,
    PERFORMANCE_WARNING_PIXEL_THRESHOLD: 65536,
    PERFORMANCE_STRONG_WARNING_PIXEL_THRESHOLD: 262144,
    SAMPLING_MODES: ["median", "average", "center", "dominant"],
    DEFAULT_SAMPLING_MODE: "median",
    DITHERING_MODES: ["off", "floydSteinberg", "bayer4x4"],
    DEFAULT_DITHERING_MODE: "off",
    DEFAULT_DITHERING_STRENGTH: 1,
    PREPROCESS_ADJUSTMENT_MIN: -100,
    PREPROCESS_ADJUSTMENT_MAX: 100,
    DEFAULT_BRIGHTNESS: 0,
    DEFAULT_CONTRAST: 0,
    DEFAULT_SATURATION: 0,
    SHARPEN_MODES: ["off", "low", "medium"],
    DEFAULT_SHARPEN_MODE: "off",
    DEFAULT_BACKGROUND_CLEANUP_ENABLED: false,
    DEFAULT_BACKGROUND_CLEANUP_COLOR: "#ffffff",
    BACKGROUND_CLEANUP_TOLERANCE_MIN: 0,
    BACKGROUND_CLEANUP_TOLERANCE_MAX: 255,
    DEFAULT_BACKGROUND_CLEANUP_TOLERANCE: 0,
    OUTLINE_MODES: ["off", "black", "dark"],
    DEFAULT_OUTLINE_MODE: "off",
    OUTPUT_FORMATS: ["png", "jpg", "aseprite"],
    DEFAULT_OUTPUT_FORMAT: "png",
    PALETTE_LIMIT_MODES: ["off", "auto", "4", "8", "16", "32", "64", "128", "256", "custom"],
    DEFAULT_PALETTE_MODE: "off",
    PALETTE_SOURCE_MODES: ["generated", "builtIn", "imported"],
    DEFAULT_PALETTE_SOURCE: "generated",
    DEFAULT_BUILT_IN_PALETTE_ID: "grayscale4",
    BUILT_IN_PALETTES: [
      {
        id: "grayscale4",
        label: "Grayscale 4",
        colors: ["#111111", "#555555", "#aaaaaa", "#f4f4f4"]
      },
      {
        id: "gameboyLike4",
        label: "Gameboy-like 4",
        colors: ["#0f1f0f", "#416044", "#8aa163", "#d7e894"]
      },
      {
        id: "picoLike16",
        label: "Pico-like 16",
        colors: [
          "#000000", "#1d2b53", "#7e2553", "#008751",
          "#ab5236", "#5f574f", "#c2c3c7", "#fff1e8",
          "#ff004d", "#ffa300", "#ffec27", "#00e436",
          "#29adff", "#83769c", "#ff77a8", "#ffccaa"
        ]
      },
      {
        id: "warm8",
        label: "Warm 8",
        colors: ["#21130d", "#5a2616", "#9b3f22", "#d66b2d", "#f2a65a", "#ffd08a", "#fff1c2", "#7a1f2b"]
      },
      {
        id: "cool8",
        label: "Cool 8",
        colors: ["#0c1b2a", "#12395a", "#1f5f7a", "#2f8f9d", "#51c4b8", "#a2e6d4", "#e8fff6", "#4a4e8a"]
      }
    ],
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
    DOMINANT_BUCKET_SIZE: 32,
    PALETTE_LIMIT_ALPHA_MODE: "binary",
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

(function () {
  "use strict";

  var constants = window.PixelIconConstants;

  function getFileExtension(filename) {
    var lastDotIndex = filename.lastIndexOf(".");
    if (lastDotIndex < 0) {
      return "";
    }
    return filename.slice(lastDotIndex).toLowerCase();
  }

  function hasSupportedMimeType(file) {
    if (!file.type) {
      return true;
    }
    return constants.SUPPORTED_MIME_TYPES.indexOf(file.type) !== -1;
  }

  function hasSupportedExtension(file) {
    var extension = getFileExtension(file.name || "");
    return constants.SUPPORTED_EXTENSIONS.indexOf(extension) !== -1;
  }

  function validateImageFile(file) {
    if (!file) {
      return {
        valid: false,
        message: "이미지 파일을 선택하세요."
      };
    }

    if (!hasSupportedMimeType(file) || !hasSupportedExtension(file)) {
      return {
        valid: false,
        message: "지원하지 않는 파일입니다. PNG, JPG, JPEG 파일을 선택하세요."
      };
    }

    return {
      valid: true,
      message: ""
    };
  }

  function toInteger(value) {
    if (typeof value === "number") {
      return Number.isInteger(value) ? value : NaN;
    }

    if (typeof value !== "string" || value.trim() === "") {
      return NaN;
    }

    if (!/^-?\d+$/.test(value.trim())) {
      return NaN;
    }

    return Number(value);
  }

  function validateOutputSize(outputWidth, outputHeight, imageWidth, imageHeight) {
    var width = toInteger(outputWidth);
    var height = toInteger(outputHeight);
    var sourceWidth = toInteger(imageWidth);
    var sourceHeight = toInteger(imageHeight);
    var hasSourceWidth = Number.isInteger(sourceWidth) && sourceWidth > 0;
    var hasSourceHeight = Number.isInteger(sourceHeight) && sourceHeight > 0;

    if (!Number.isInteger(width)) {
      return {
        valid: false,
        message: "출력 너비는 1 이상의 정수여야 합니다."
      };
    }

    if (!Number.isInteger(height)) {
      return {
        valid: false,
        message: "출력 높이는 1 이상의 정수여야 합니다."
      };
    }

    if (width < 1) {
      return {
        valid: false,
        message: "출력 너비는 1 이상이어야 합니다."
      };
    }

    if (height < 1) {
      return {
        valid: false,
        message: "출력 높이는 1 이상이어야 합니다."
      };
    }

    if (hasSourceWidth && width > sourceWidth) {
      return {
        valid: false,
        message: "출력 너비가 원본 이미지 너비(" + sourceWidth + ")보다 큽니다."
      };
    }

    if (hasSourceHeight && height > sourceHeight) {
      return {
        valid: false,
        message: "출력 높이가 원본 이미지 높이(" + sourceHeight + ")보다 큽니다."
      };
    }

    return {
      valid: true,
      message: "",
      width: width,
      height: height,
      maxWidth: hasSourceWidth ? sourceWidth : null,
      maxHeight: hasSourceHeight ? sourceHeight : null
    };
  }

  function getOutputSizePerformanceWarning(outputWidth, outputHeight) {
    var width = toInteger(outputWidth);
    var height = toInteger(outputHeight);
    var pixelCount;

    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
      return null;
    }

    pixelCount = width * height;

    if (pixelCount > constants.PERFORMANCE_STRONG_WARNING_PIXEL_THRESHOLD) {
      return {
        level: "strong",
        pixelCount: pixelCount,
        message: "매우 큰 출력 해상도입니다. 변환 중 브라우저가 잠시 멈춘 것처럼 보일 수 있습니다."
      };
    }

    if (pixelCount > constants.PERFORMANCE_WARNING_PIXEL_THRESHOLD) {
      return {
        level: "moderate",
        pixelCount: pixelCount,
        message: "출력 해상도가 커서 변환 시간이 길어질 수 있습니다."
      };
    }

    return null;
  }

  function normalizeSamplingMode(samplingMode) {
    if (constants.SAMPLING_MODES.indexOf(samplingMode) === -1) {
      return constants.DEFAULT_SAMPLING_MODE;
    }
    return samplingMode;
  }

  function normalizeOutputFormat(outputFormat) {
    if (constants.OUTPUT_FORMATS.indexOf(outputFormat) === -1) {
      return constants.DEFAULT_OUTPUT_FORMAT;
    }
    return outputFormat;
  }

  function normalizePaletteMode(paletteMode) {
    if (constants.PALETTE_LIMIT_MODES.indexOf(paletteMode) === -1) {
      return constants.DEFAULT_PALETTE_MODE;
    }
    return paletteMode;
  }

  function normalizePaletteSource(paletteSource) {
    if (constants.PALETTE_SOURCE_MODES.indexOf(paletteSource) === -1) {
      return constants.DEFAULT_PALETTE_SOURCE;
    }
    return paletteSource;
  }

  function getBuiltInPaletteById(paletteId) {
    var palettes = constants.BUILT_IN_PALETTES || [];
    var fallback = palettes[0] || null;

    return palettes.find(function (palette) {
      return palette.id === paletteId;
    }) || fallback;
  }

  function normalizeBuiltInPaletteId(paletteId) {
    var palette = getBuiltInPaletteById(paletteId || constants.DEFAULT_BUILT_IN_PALETTE_ID);
    return palette ? palette.id : constants.DEFAULT_BUILT_IN_PALETTE_ID;
  }

  function normalizeDitheringMode(ditheringMode) {
    if (constants.DITHERING_MODES.indexOf(ditheringMode) === -1) {
      return constants.DEFAULT_DITHERING_MODE;
    }
    return ditheringMode;
  }

  function normalizeRangedNumber(value, minimum, maximum, fallback) {
    var numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return fallback;
    }

    return Math.max(minimum, Math.min(maximum, numericValue));
  }

  function normalizePreprocessAdjustment(value, fallback) {
    return normalizeRangedNumber(
      value,
      constants.PREPROCESS_ADJUSTMENT_MIN,
      constants.PREPROCESS_ADJUSTMENT_MAX,
      fallback
    );
  }

  function normalizeSharpenMode(sharpenMode) {
    if (constants.SHARPEN_MODES.indexOf(sharpenMode) === -1) {
      return constants.DEFAULT_SHARPEN_MODE;
    }
    return sharpenMode;
  }

  function normalizeBackgroundCleanupTolerance(tolerance) {
    return normalizeRangedNumber(
      tolerance,
      constants.BACKGROUND_CLEANUP_TOLERANCE_MIN,
      constants.BACKGROUND_CLEANUP_TOLERANCE_MAX,
      constants.DEFAULT_BACKGROUND_CLEANUP_TOLERANCE
    );
  }

  function normalizeOutlineMode(outlineMode) {
    if (constants.OUTLINE_MODES.indexOf(outlineMode) === -1) {
      return constants.DEFAULT_OUTLINE_MODE;
    }
    return outlineMode;
  }

  function normalizeHexToken(token) {
    var value = String(token || "").trim();
    var hex;

    if (!value) {
      return null;
    }

    if (value.charAt(0) === "#") {
      value = value.slice(1);
    }

    if (/^[0-9a-fA-F]{3}$/.test(value)) {
      hex = value.split("").map(function (character) {
        return character + character;
      }).join("");
      return "#" + hex.toLowerCase();
    }

    if (/^[0-9a-fA-F]{6}$/.test(value)) {
      return "#" + value.toLowerCase();
    }

    return null;
  }

  function hexToRgb(hexColor) {
    var normalized = normalizeHexToken(hexColor);

    if (!normalized) {
      return null;
    }

    return {
      r: parseInt(normalized.slice(1, 3), 16),
      g: parseInt(normalized.slice(3, 5), 16),
      b: parseInt(normalized.slice(5, 7), 16),
      hex: normalized
    };
  }

  function createRgbPaletteFromHexColors(hexColors) {
    return (hexColors || []).map(hexToRgb).filter(function (color) {
      return !!color;
    });
  }

  function parseHexPaletteText(text) {
    var rawText = String(text || "");
    var tokens = rawText.split(/[\s,;]+/).filter(function (token) {
      return token.trim() !== "";
    });
    var seen = Object.create(null);
    var colors = [];
    var invalidTokens = [];

    tokens.forEach(function (token) {
      var normalized = normalizeHexToken(token);

      if (!normalized) {
        invalidTokens.push(token);
        return;
      }

      if (!seen[normalized]) {
        seen[normalized] = true;
        colors.push(normalized);
      }
    });

    if (invalidTokens.length) {
      return {
        valid: false,
        message: "유효한 HEX 색상이 필요합니다.",
        colors: colors,
        invalidTokens: invalidTokens
      };
    }

    if (colors.length < constants.MIN_PALETTE_COLORS) {
      return {
        valid: false,
        message: "palette 색상은 2개 이상이어야 합니다.",
        colors: colors
      };
    }

    if (colors.length > constants.MAX_PALETTE_COLORS) {
      return {
        valid: false,
        message: "palette 색상은 최대 256개까지 지원합니다.",
        colors: colors
      };
    }

    return {
      valid: true,
      message: "",
      colors: colors,
      rgbColors: createRgbPaletteFromHexColors(colors),
      colorCount: colors.length
    };
  }

  function validatePaletteOptions(paletteMode, customPaletteCount) {
    var normalizedMode = normalizePaletteMode(paletteMode);
    var count;

    if (normalizedMode !== "custom") {
      return {
        valid: true,
        message: "",
        paletteMode: normalizedMode
      };
    }

    count = toInteger(customPaletteCount);

    if (!Number.isInteger(count)) {
      return {
        valid: false,
        message: "유효한 색상 수를 입력해주세요."
      };
    }

    if (count < constants.MIN_PALETTE_COLORS) {
      return {
        valid: false,
        message: "색상 수는 2 이상이어야 합니다."
      };
    }

    if (count > constants.MAX_PALETTE_COLORS) {
      return {
        valid: false,
        message: "색상 수는 256 이하로 제한됩니다."
      };
    }

    return {
      valid: true,
      message: "",
      paletteMode: normalizedMode,
      customPaletteCount: count
    };
  }

  function readFileAsDataURL(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();

      reader.onload = function () {
        resolve(reader.result);
      };

      reader.onerror = function () {
        reject(new Error("파일을 읽을 수 없습니다."));
      };

      reader.readAsDataURL(file);
    });
  }

  function readFileAsText(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();

      reader.onload = function () {
        resolve(reader.result || "");
      };

      reader.onerror = function () {
        reject(new Error("파일을 읽을 수 없습니다."));
      };

      reader.readAsText(file);
    });
  }

  function sanitizeBaseName(filename) {
    var withoutExtension = filename.replace(/\.[^.]+$/, "");
    var safeName = withoutExtension
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "_")
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");

    return safeName || "pixel_icon";
  }

  function createOutputFilename(originalFilename, options) {
    var normalizedOptions = options || {};
    var width = normalizedOptions.outputWidth || constants.DEFAULT_OUTPUT_WIDTH;
    var height = normalizedOptions.outputHeight || constants.DEFAULT_OUTPUT_HEIGHT;
    var samplingMode = normalizeSamplingMode(normalizedOptions.samplingMode);
    var outputFormat = normalizeOutputFormat(normalizedOptions.outputFormat);
    var paletteMode = normalizePaletteMode(normalizedOptions.paletteMode);
    var paletteCount = normalizedOptions.paletteCount;
    var extension = constants.FORMAT_EXTENSIONS[outputFormat];
    var baseName = originalFilename ? sanitizeBaseName(originalFilename) : "pixel_icon";
    var paletteSuffix = paletteMode === constants.DEFAULT_PALETTE_MODE || !paletteCount
      ? ""
      : "_p" + paletteCount;

    return baseName + "_" + width + "x" + height + "_" + samplingMode + paletteSuffix + "." + extension;
  }

  function getReadableFileSize(bytes) {
    if (typeof bytes !== "number" || Number.isNaN(bytes)) {
      return "-";
    }

    if (bytes < 1024) {
      return bytes + " B";
    }

    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    }

    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  window.PixelIconFileHandler = {
    validateImageFile: validateImageFile,
    validateOutputSize: validateOutputSize,
    validatePaletteOptions: validatePaletteOptions,
    getOutputSizePerformanceWarning: getOutputSizePerformanceWarning,
    normalizeSamplingMode: normalizeSamplingMode,
    normalizeOutputFormat: normalizeOutputFormat,
    normalizePaletteMode: normalizePaletteMode,
    normalizePaletteSource: normalizePaletteSource,
    normalizeBuiltInPaletteId: normalizeBuiltInPaletteId,
    normalizeDitheringMode: normalizeDitheringMode,
    normalizePreprocessAdjustment: normalizePreprocessAdjustment,
    normalizeSharpenMode: normalizeSharpenMode,
    normalizeBackgroundCleanupTolerance: normalizeBackgroundCleanupTolerance,
    normalizeOutlineMode: normalizeOutlineMode,
    getBuiltInPaletteById: getBuiltInPaletteById,
    normalizeHexToken: normalizeHexToken,
    hexToRgb: hexToRgb,
    parseHexPaletteText: parseHexPaletteText,
    createRgbPaletteFromHexColors: createRgbPaletteFromHexColors,
    readFileAsDataURL: readFileAsDataURL,
    readFileAsText: readFileAsText,
    createOutputFilename: createOutputFilename,
    getFileExtension: getFileExtension,
    getReadableFileSize: getReadableFileSize,
    toInteger: toInteger
  };
})();

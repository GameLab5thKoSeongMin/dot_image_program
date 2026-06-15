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
    var maxWidth = Math.min(imageWidth || 0, constants.MAX_OUTPUT_DIMENSION);
    var maxHeight = Math.min(imageHeight || 0, constants.MAX_OUTPUT_DIMENSION);

    if (!Number.isInteger(width) || !Number.isInteger(height)) {
      return {
        valid: false,
        message: "출력 width와 height는 정수여야 합니다."
      };
    }

    if (width < 1 || height < 1) {
      return {
        valid: false,
        message: "출력 width와 height는 1 이상이어야 합니다."
      };
    }

    if (width > constants.MAX_OUTPUT_DIMENSION || height > constants.MAX_OUTPUT_DIMENSION) {
      return {
        valid: false,
        message: "출력 width와 height는 256을 초과할 수 없습니다."
      };
    }

    if (imageWidth && width > imageWidth) {
      return {
        valid: false,
        message: "출력 width는 원본 이미지 width(" + imageWidth + ")를 초과할 수 없습니다."
      };
    }

    if (imageHeight && height > imageHeight) {
      return {
        valid: false,
        message: "출력 height는 원본 이미지 height(" + imageHeight + ")를 초과할 수 없습니다."
      };
    }

    return {
      valid: true,
      message: "",
      width: width,
      height: height,
      maxWidth: maxWidth,
      maxHeight: maxHeight
    };
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
    normalizeSamplingMode: normalizeSamplingMode,
    normalizeOutputFormat: normalizeOutputFormat,
    normalizePaletteMode: normalizePaletteMode,
    readFileAsDataURL: readFileAsDataURL,
    createOutputFilename: createOutputFilename,
    getFileExtension: getFileExtension,
    getReadableFileSize: getReadableFileSize
  };
})();

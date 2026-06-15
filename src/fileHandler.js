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

  function createOutputFilename(originalFilename) {
    if (!originalFilename) {
      return constants.DEFAULT_OUTPUT_FILENAME;
    }

    return sanitizeBaseName(originalFilename) + "_32x32.png";
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
    readFileAsDataURL: readFileAsDataURL,
    createOutputFilename: createOutputFilename,
    getFileExtension: getFileExtension,
    getReadableFileSize: getReadableFileSize
  };
})();

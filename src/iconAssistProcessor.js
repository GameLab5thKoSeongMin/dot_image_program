(function () {
  "use strict";

  var constants = window.PixelIconConstants;

  function cloneImageData(imageData) {
    return new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
  }

  function clampChannel(value) {
    var numericValue = Number(value);
    return Number.isFinite(numericValue)
      ? Math.max(0, Math.min(255, Math.round(numericValue)))
      : 0;
  }

  function normalizeOutlineMode(mode) {
    return constants.OUTLINE_MODES.indexOf(mode) === -1
      ? constants.DEFAULT_OUTLINE_MODE
      : mode;
  }

  function isVisibleAlpha(alpha) {
    return alpha >= constants.TRANSPARENT_ALPHA_THRESHOLD;
  }

  function rgbToHex(color) {
    return "#" + [color.r, color.g, color.b].map(function (channel) {
      return clampChannel(channel).toString(16).padStart(2, "0");
    }).join("");
  }

  function getDarkOutlineColor(imageData) {
    var data = imageData.data;
    var totals = { r: 0, g: 0, b: 0 };
    var visiblePixelCount = 0;

    for (var index = 0; index < data.length; index += 4) {
      if (!isVisibleAlpha(data[index + 3])) {
        continue;
      }

      totals.r += data[index];
      totals.g += data[index + 1];
      totals.b += data[index + 2];
      visiblePixelCount += 1;
    }

    if (!visiblePixelCount) {
      return { r: 32, g: 32, b: 32 };
    }

    return {
      r: clampChannel((totals.r / visiblePixelCount) * 0.35),
      g: clampChannel((totals.g / visiblePixelCount) * 0.35),
      b: clampChannel((totals.b / visiblePixelCount) * 0.35)
    };
  }

  function resolveOutlineColor(imageData, mode, colorOverride) {
    if (colorOverride) {
      return {
        r: clampChannel(colorOverride.r),
        g: clampChannel(colorOverride.g),
        b: clampChannel(colorOverride.b)
      };
    }

    if (mode === "black") {
      return { r: 0, g: 0, b: 0 };
    }

    return getDarkOutlineColor(imageData);
  }

  function hasVisibleNeighbor(data, width, height, x, y) {
    for (var offsetY = -1; offsetY <= 1; offsetY += 1) {
      for (var offsetX = -1; offsetX <= 1; offsetX += 1) {
        if (offsetX === 0 && offsetY === 0) {
          continue;
        }

        var neighborX = x + offsetX;
        var neighborY = y + offsetY;

        if (neighborX < 0 || neighborX >= width || neighborY < 0 || neighborY >= height) {
          continue;
        }

        var neighborIndex = (neighborY * width + neighborX) * 4;
        if (isVisibleAlpha(data[neighborIndex + 3])) {
          return true;
        }
      }
    }

    return false;
  }

  function applyOutlineToImageData(imageData, options) {
    var safeOptions = typeof options === "string" ? { mode: options } : (options || {});
    var mode = normalizeOutlineMode(safeOptions.mode);

    if (mode === "off") {
      return {
        imageData: imageData,
        outlineMode: mode,
        outlineApplied: false,
        outlineAddedPixelCount: 0,
        outlineColor: null,
        outlineColorHex: ""
      };
    }

    var source = imageData.data;
    var outlined = cloneImageData(imageData);
    var output = outlined.data;
    var width = imageData.width;
    var height = imageData.height;
    var outlineColor = resolveOutlineColor(imageData, mode, safeOptions.colorOverride);
    var outlineAddedPixelCount = 0;

    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        var index = (y * width + x) * 4;

        if (isVisibleAlpha(source[index + 3]) || !hasVisibleNeighbor(source, width, height, x, y)) {
          continue;
        }

        output[index] = outlineColor.r;
        output[index + 1] = outlineColor.g;
        output[index + 2] = outlineColor.b;
        output[index + 3] = 255;
        outlineAddedPixelCount += 1;
      }
    }

    return {
      imageData: outlined,
      outlineMode: mode,
      outlineApplied: outlineAddedPixelCount > 0,
      outlineAddedPixelCount: outlineAddedPixelCount,
      outlineColor: outlineColor,
      outlineColorHex: rgbToHex(outlineColor)
    };
  }

  function canvasToImageData(canvas) {
    return canvas.getContext("2d", { willReadFrequently: true })
      .getImageData(0, 0, canvas.width, canvas.height);
  }

  function imageDataToCanvas(imageData) {
    var canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    canvas.getContext("2d").putImageData(imageData, 0, 0);
    return canvas;
  }

  function applyOutlineToCanvas(canvas, options) {
    var imageData = canvasToImageData(canvas);
    var result = applyOutlineToImageData(imageData, options);
    result.canvas = result.imageData === imageData ? canvas : imageDataToCanvas(result.imageData);
    return result;
  }

  window.PixelIconIconAssistProcessor = {
    normalizeOutlineMode: normalizeOutlineMode,
    getDarkOutlineColor: getDarkOutlineColor,
    applyOutlineToImageData: applyOutlineToImageData,
    applyOutlineToCanvas: applyOutlineToCanvas
  };
})();

(function () {
  "use strict";

  var constants = window.PixelIconConstants;

  function loadImageFromDataURL(dataURL) {
    return new Promise(function (resolve, reject) {
      var image = new Image();

      image.onload = function () {
        resolve(image);
      };

      image.onerror = function () {
        reject(new Error("이미지를 불러올 수 없습니다. 손상된 파일일 수 있습니다."));
      };

      image.src = dataURL;
    });
  }

  function getImageWidth(image) {
    return image.naturalWidth || image.width;
  }

  function getImageHeight(image) {
    return image.naturalHeight || image.height;
  }

  function createSourceImageData(image) {
    var width = getImageWidth(image);
    var height = getImageHeight(image);

    if (!width || !height) {
      throw new Error("이미지 크기를 확인할 수 없습니다.");
    }

    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    var context = canvas.getContext("2d", { willReadFrequently: true });
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return context.getImageData(0, 0, width, height);
  }

  function cloneImageData(imageData) {
    return new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
  }

  function clampChannel(value) {
    var numericValue = Number(value);
    return Number.isFinite(numericValue)
      ? Math.max(0, Math.min(255, Math.round(numericValue)))
      : 0;
  }

  function clampNumber(value, minimum, maximum, fallback) {
    var numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return fallback;
    }

    return Math.max(minimum, Math.min(maximum, numericValue));
  }

  function normalizeSharpenMode(mode) {
    return constants.SHARPEN_MODES.indexOf(mode) === -1
      ? constants.DEFAULT_SHARPEN_MODE
      : mode;
  }

  function normalizePreprocessOptions(options) {
    var safeOptions = options || {};
    var cleanupColor = safeOptions.backgroundCleanupColor || { r: 255, g: 255, b: 255 };

    return {
      brightness: clampNumber(
        safeOptions.brightness,
        constants.PREPROCESS_ADJUSTMENT_MIN,
        constants.PREPROCESS_ADJUSTMENT_MAX,
        constants.DEFAULT_BRIGHTNESS
      ),
      contrast: clampNumber(
        safeOptions.contrast,
        constants.PREPROCESS_ADJUSTMENT_MIN,
        constants.PREPROCESS_ADJUSTMENT_MAX,
        constants.DEFAULT_CONTRAST
      ),
      saturation: clampNumber(
        safeOptions.saturation,
        constants.PREPROCESS_ADJUSTMENT_MIN,
        constants.PREPROCESS_ADJUSTMENT_MAX,
        constants.DEFAULT_SATURATION
      ),
      sharpenMode: normalizeSharpenMode(safeOptions.sharpenMode),
      backgroundCleanupEnabled: !!safeOptions.backgroundCleanupEnabled,
      backgroundCleanupColor: {
        r: clampChannel(cleanupColor.r),
        g: clampChannel(cleanupColor.g),
        b: clampChannel(cleanupColor.b)
      },
      backgroundCleanupTolerance: clampNumber(
        safeOptions.backgroundCleanupTolerance,
        constants.BACKGROUND_CLEANUP_TOLERANCE_MIN,
        constants.BACKGROUND_CLEANUP_TOLERANCE_MAX,
        constants.DEFAULT_BACKGROUND_CLEANUP_TOLERANCE
      )
    };
  }

  function cleanupBackgroundInImageData(imageData, color, tolerance) {
    var cleaned = cloneImageData(imageData);
    var data = cleaned.data;
    var target = color || { r: 255, g: 255, b: 255 };
    var safeTolerance = Math.max(0, Number(tolerance) || 0);
    var removedPixelCount = 0;

    for (var index = 0; index < data.length; index += 4) {
      if (isTransparentPixel(data[index + 3])) {
        continue;
      }

      var redDelta = data[index] - target.r;
      var greenDelta = data[index + 1] - target.g;
      var blueDelta = data[index + 2] - target.b;
      var distance = Math.sqrt(
        redDelta * redDelta +
        greenDelta * greenDelta +
        blueDelta * blueDelta
      );

      if (distance <= safeTolerance) {
        data[index] = 0;
        data[index + 1] = 0;
        data[index + 2] = 0;
        data[index + 3] = 0;
        removedPixelCount += 1;
      }
    }

    return {
      imageData: cleaned,
      removedPixelCount: removedPixelCount
    };
  }

  function adjustImageData(imageData, brightness, contrast, saturation) {
    var adjusted = cloneImageData(imageData);
    var data = adjusted.data;
    var brightnessOffset = 255 * brightness / 100;
    var contrastValue = 255 * contrast / 100;
    var contrastFactor = (259 * (contrastValue + 255)) / (255 * (259 - contrastValue));
    var saturationFactor = 1 + saturation / 100;

    for (var index = 0; index < data.length; index += 4) {
      if (isTransparentPixel(data[index + 3])) {
        continue;
      }

      var red = contrastFactor * (data[index] - 128) + 128 + brightnessOffset;
      var green = contrastFactor * (data[index + 1] - 128) + 128 + brightnessOffset;
      var blue = contrastFactor * (data[index + 2] - 128) + 128 + brightnessOffset;
      var luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;

      data[index] = clampChannel(luminance + (red - luminance) * saturationFactor);
      data[index + 1] = clampChannel(luminance + (green - luminance) * saturationFactor);
      data[index + 2] = clampChannel(luminance + (blue - luminance) * saturationFactor);
    }

    return adjusted;
  }

  function getSharpenNeighborChannel(data, width, height, x, y, channel, centerValue) {
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return centerValue;
    }

    var index = (y * width + x) * 4;
    return isTransparentPixel(data[index + 3]) ? centerValue : data[index + channel];
  }

  function sharpenImageData(imageData, mode) {
    var sharpenMode = normalizeSharpenMode(mode);

    if (sharpenMode === "off") {
      return imageData;
    }

    var source = imageData.data;
    var sharpened = cloneImageData(imageData);
    var output = sharpened.data;
    var width = imageData.width;
    var height = imageData.height;
    var amount = sharpenMode === "medium" ? 0.7 : 0.35;

    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        var index = (y * width + x) * 4;

        if (isTransparentPixel(source[index + 3])) {
          continue;
        }

        for (var channel = 0; channel < 3; channel += 1) {
          var center = source[index + channel];
          var sharpenedValue = center * 5 -
            getSharpenNeighborChannel(source, width, height, x - 1, y, channel, center) -
            getSharpenNeighborChannel(source, width, height, x + 1, y, channel, center) -
            getSharpenNeighborChannel(source, width, height, x, y - 1, channel, center) -
            getSharpenNeighborChannel(source, width, height, x, y + 1, channel, center);

          output[index + channel] = clampChannel(center + (sharpenedValue - center) * amount);
        }
      }
    }

    return sharpened;
  }

  function applyPreprocessToImageData(imageData, options) {
    var normalized = normalizePreprocessOptions(options);
    var hasAdjustments = normalized.brightness !== constants.DEFAULT_BRIGHTNESS ||
      normalized.contrast !== constants.DEFAULT_CONTRAST ||
      normalized.saturation !== constants.DEFAULT_SATURATION;
    var hasSharpen = normalized.sharpenMode !== constants.DEFAULT_SHARPEN_MODE;
    var currentImageData = imageData;
    var removedPixelCount = 0;

    if (normalized.backgroundCleanupEnabled) {
      var cleanupResult = cleanupBackgroundInImageData(
        currentImageData,
        normalized.backgroundCleanupColor,
        normalized.backgroundCleanupTolerance
      );
      currentImageData = cleanupResult.imageData;
      removedPixelCount = cleanupResult.removedPixelCount;
    }

    if (hasAdjustments) {
      currentImageData = adjustImageData(
        currentImageData,
        normalized.brightness,
        normalized.contrast,
        normalized.saturation
      );
    }

    if (hasSharpen) {
      currentImageData = sharpenImageData(currentImageData, normalized.sharpenMode);
    }

    return {
      imageData: currentImageData,
      options: normalized,
      preprocessApplied: normalized.backgroundCleanupEnabled || hasAdjustments || hasSharpen,
      removedPixelCount: removedPixelCount
    };
  }

  function normalizeConversionOptions(options) {
    var safeOptions = options || {};
    var outputWidth = Number(safeOptions.outputWidth) || constants.DEFAULT_OUTPUT_WIDTH;
    var outputHeight = Number(safeOptions.outputHeight) || constants.DEFAULT_OUTPUT_HEIGHT;
    var samplingMode = constants.SAMPLING_MODES.indexOf(safeOptions.samplingMode) === -1
      ? constants.DEFAULT_SAMPLING_MODE
      : safeOptions.samplingMode;

    return {
      outputWidth: outputWidth,
      outputHeight: outputHeight,
      samplingMode: samplingMode,
      preprocess: normalizePreprocessOptions(safeOptions.preprocess)
    };
  }

  function calculateTileBounds(tileX, tileY, imageWidth, imageHeight, outputWidth, outputHeight) {
    var safeOutputWidth = outputWidth || constants.DEFAULT_OUTPUT_WIDTH;
    var safeOutputHeight = outputHeight || constants.DEFAULT_OUTPUT_HEIGHT;
    var xStart = Math.floor(tileX * imageWidth / safeOutputWidth);
    var xEnd = Math.floor((tileX + 1) * imageWidth / safeOutputWidth);
    var yStart = Math.floor(tileY * imageHeight / safeOutputHeight);
    var yEnd = Math.floor((tileY + 1) * imageHeight / safeOutputHeight);

    var safeXEnd = Math.max(xEnd, xStart + 1);
    var safeYEnd = Math.max(yEnd, yStart + 1);
    var clampedXStart = Math.max(0, Math.min(xStart, imageWidth - 1));
    var clampedYStart = Math.max(0, Math.min(yStart, imageHeight - 1));
    var clampedXEnd = Math.max(clampedXStart + 1, Math.min(safeXEnd, imageWidth));
    var clampedYEnd = Math.max(clampedYStart + 1, Math.min(safeYEnd, imageHeight));

    return {
      xStart: clampedXStart,
      xEnd: clampedXEnd,
      yStart: clampedYStart,
      yEnd: clampedYEnd
    };
  }

  function calculateMedian(values) {
    if (!values.length) {
      return 0;
    }

    var sorted = values.slice().sort(function (a, b) {
      return a - b;
    });
    var middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 1) {
      return sorted[middle];
    }

    return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
  }

  function calculateAverage(values) {
    if (!values.length) {
      return 0;
    }

    var sum = values.reduce(function (total, value) {
      return total + value;
    }, 0);

    return Math.round(sum / values.length);
  }

  function isTransparentPixel(alpha) {
    return alpha < constants.TRANSPARENT_ALPHA_THRESHOLD;
  }

  function shouldTileBeTransparent(totalPixelCount, opaquePixelCount) {
    if (opaquePixelCount <= 0 || totalPixelCount <= 0) {
      return true;
    }

    return opaquePixelCount / totalPixelCount < constants.MIN_OPAQUE_RATIO;
  }

  function collectTileChannels(imageData, tileBounds) {
    var data = imageData.data;
    var width = imageData.width;
    var channels = {
      redValues: [],
      greenValues: [],
      blueValues: [],
      alphaValues: [],
      totalPixelCount: 0,
      opaquePixelCount: 0
    };

    for (var y = tileBounds.yStart; y < tileBounds.yEnd; y += 1) {
      for (var x = tileBounds.xStart; x < tileBounds.xEnd; x += 1) {
        var index = (y * width + x) * 4;
        var alpha = data[index + 3];
        channels.totalPixelCount += 1;

        if (!isTransparentPixel(alpha)) {
          channels.redValues.push(data[index]);
          channels.greenValues.push(data[index + 1]);
          channels.blueValues.push(data[index + 2]);
          channels.alphaValues.push(alpha);
          channels.opaquePixelCount += 1;
        }
      }
    }

    return channels;
  }

  function getPixelColor(imageData, x, y) {
    var clampedX = Math.max(0, Math.min(x, imageData.width - 1));
    var clampedY = Math.max(0, Math.min(y, imageData.height - 1));
    var index = (clampedY * imageData.width + clampedX) * 4;

    return [
      imageData.data[index],
      imageData.data[index + 1],
      imageData.data[index + 2],
      imageData.data[index + 3]
    ];
  }

  function calculateTileMedianColor(imageData, tileBounds) {
    var channels = collectTileChannels(imageData, tileBounds);

    if (shouldTileBeTransparent(channels.totalPixelCount, channels.opaquePixelCount)) {
      return [0, 0, 0, 0];
    }

    return [
      calculateMedian(channels.redValues),
      calculateMedian(channels.greenValues),
      calculateMedian(channels.blueValues),
      calculateMedian(channels.alphaValues)
    ];
  }

  function calculateTileAverageColor(imageData, tileBounds) {
    var channels = collectTileChannels(imageData, tileBounds);

    if (shouldTileBeTransparent(channels.totalPixelCount, channels.opaquePixelCount)) {
      return [0, 0, 0, 0];
    }

    return [
      calculateAverage(channels.redValues),
      calculateAverage(channels.greenValues),
      calculateAverage(channels.blueValues),
      calculateAverage(channels.alphaValues)
    ];
  }

  function calculateTileCenterColor(imageData, tileBounds) {
    var centerX = Math.floor((tileBounds.xStart + tileBounds.xEnd - 1) / 2);
    var centerY = Math.floor((tileBounds.yStart + tileBounds.yEnd - 1) / 2);
    var color = getPixelColor(imageData, centerX, centerY);

    if (isTransparentPixel(color[3])) {
      return [0, 0, 0, 0];
    }

    return color;
  }

  function createDominantBucketKey(red, green, blue) {
    var bucketSize = constants.DOMINANT_BUCKET_SIZE;
    return [
      Math.floor(red / bucketSize),
      Math.floor(green / bucketSize),
      Math.floor(blue / bucketSize)
    ].join(",");
  }

  function calculateTileDominantColor(imageData, tileBounds) {
    var data = imageData.data;
    var width = imageData.width;
    var buckets = Object.create(null);
    var winningBucket = null;

    for (var y = tileBounds.yStart; y < tileBounds.yEnd; y += 1) {
      for (var x = tileBounds.xStart; x < tileBounds.xEnd; x += 1) {
        var index = (y * width + x) * 4;
        var alpha = data[index + 3];

        if (isTransparentPixel(alpha)) {
          continue;
        }

        var red = data[index];
        var green = data[index + 1];
        var blue = data[index + 2];
        var key = createDominantBucketKey(red, green, blue);

        if (!buckets[key]) {
          buckets[key] = {
            count: 0,
            redTotal: 0,
            greenTotal: 0,
            blueTotal: 0,
            alphaTotal: 0
          };
        }

        buckets[key].count += 1;
        buckets[key].redTotal += red;
        buckets[key].greenTotal += green;
        buckets[key].blueTotal += blue;
        buckets[key].alphaTotal += alpha;

        if (!winningBucket || buckets[key].count > winningBucket.count) {
          winningBucket = buckets[key];
        }
      }
    }

    if (!winningBucket) {
      return [0, 0, 0, 0];
    }

    return [
      Math.round(winningBucket.redTotal / winningBucket.count),
      Math.round(winningBucket.greenTotal / winningBucket.count),
      Math.round(winningBucket.blueTotal / winningBucket.count),
      Math.round(winningBucket.alphaTotal / winningBucket.count)
    ];
  }

  function calculateTileRepresentativeColor(imageData, tileBounds, samplingMode) {
    if (samplingMode === "average") {
      return calculateTileAverageColor(imageData, tileBounds);
    }

    if (samplingMode === "center") {
      return calculateTileCenterColor(imageData, tileBounds);
    }

    if (samplingMode === "dominant") {
      return calculateTileDominantColor(imageData, tileBounds);
    }

    return calculateTileMedianColor(imageData, tileBounds);
  }

  function imageDataHasTransparency(imageData) {
    var data = imageData.data;

    for (var index = 3; index < data.length; index += 4) {
      if (data[index] < 255) {
        return true;
      }
    }

    return false;
  }

  function convertImageDataToPixelIcon(originalSourceImageData, options) {
    var conversionOptions = normalizeConversionOptions(options);
    var preprocessResult = applyPreprocessToImageData(
      originalSourceImageData,
      conversionOptions.preprocess
    );
    var sourceImageData = preprocessResult.imageData;
    var outputWidth = conversionOptions.outputWidth;
    var outputHeight = conversionOptions.outputHeight;
    var samplingMode = conversionOptions.samplingMode;
    var outputImageData = new ImageData(
      new Uint8ClampedArray(outputWidth * outputHeight * 4),
      outputWidth,
      outputHeight
    );

    for (var tileY = 0; tileY < outputHeight; tileY += 1) {
      for (var tileX = 0; tileX < outputWidth; tileX += 1) {
        var bounds = calculateTileBounds(
          tileX,
          tileY,
          sourceImageData.width,
          sourceImageData.height,
          outputWidth,
          outputHeight
        );
        var color = calculateTileRepresentativeColor(sourceImageData, bounds, samplingMode);
        var outputIndex = (tileY * outputWidth + tileX) * 4;

        outputImageData.data[outputIndex] = color[0];
        outputImageData.data[outputIndex + 1] = color[1];
        outputImageData.data[outputIndex + 2] = color[2];
        outputImageData.data[outputIndex + 3] = color[3];
      }
    }

    return {
      imageData: outputImageData,
      width: outputWidth,
      height: outputHeight,
      sourceWidth: sourceImageData.width,
      sourceHeight: sourceImageData.height,
      samplingMode: samplingMode,
      sourceHasTransparency: imageDataHasTransparency(originalSourceImageData),
      preprocessedSourceHasTransparency: imageDataHasTransparency(sourceImageData),
      preprocessApplied: preprocessResult.preprocessApplied,
      preprocessOptions: preprocessResult.options,
      backgroundRemovedPixelCount: preprocessResult.removedPixelCount,
      resultHasTransparency: imageDataHasTransparency(outputImageData)
    };
  }

  function convertImageToPixelIcon(image, options) {
    var result = convertImageDataToPixelIcon(createSourceImageData(image), options);
    var outputCanvas = document.createElement("canvas");

    outputCanvas.width = result.width;
    outputCanvas.height = result.height;
    outputCanvas.getContext("2d").putImageData(result.imageData, 0, 0);
    result.canvas = outputCanvas;
    return result;
  }

  window.PixelIconImageProcessor = {
    loadImageFromDataURL: loadImageFromDataURL,
    createSourceImageData: createSourceImageData,
    convertImageDataToPixelIcon: convertImageDataToPixelIcon,
    convertImageToPixelIcon: convertImageToPixelIcon,
    calculateTileBounds: calculateTileBounds,
    calculateTileMedianColor: calculateTileMedianColor,
    calculateTileAverageColor: calculateTileAverageColor,
    calculateTileCenterColor: calculateTileCenterColor,
    calculateTileDominantColor: calculateTileDominantColor,
    calculateTileRepresentativeColor: calculateTileRepresentativeColor,
    calculateMedian: calculateMedian,
    calculateAverage: calculateAverage,
    normalizePreprocessOptions: normalizePreprocessOptions,
    cleanupBackgroundInImageData: cleanupBackgroundInImageData,
    adjustImageData: adjustImageData,
    sharpenImageData: sharpenImageData,
    applyPreprocessToImageData: applyPreprocessToImageData,
    isTransparentPixel: isTransparentPixel,
    shouldTileBeTransparent: shouldTileBeTransparent,
    imageDataHasTransparency: imageDataHasTransparency
  };
})();

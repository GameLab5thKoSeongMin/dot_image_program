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
      samplingMode: samplingMode
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

  function convertImageToPixelIcon(image, options) {
    var sourceImageData = createSourceImageData(image);
    var conversionOptions = normalizeConversionOptions(options);
    var outputWidth = conversionOptions.outputWidth;
    var outputHeight = conversionOptions.outputHeight;
    var samplingMode = conversionOptions.samplingMode;
    var outputCanvas = document.createElement("canvas");
    outputCanvas.width = outputWidth;
    outputCanvas.height = outputHeight;

    var outputContext = outputCanvas.getContext("2d");
    var outputImageData = outputContext.createImageData(outputWidth, outputHeight);

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

    outputContext.putImageData(outputImageData, 0, 0);

    return {
      canvas: outputCanvas,
      width: outputCanvas.width,
      height: outputCanvas.height,
      sourceWidth: sourceImageData.width,
      sourceHeight: sourceImageData.height,
      samplingMode: samplingMode,
      sourceHasTransparency: imageDataHasTransparency(sourceImageData),
      resultHasTransparency: imageDataHasTransparency(outputImageData)
    };
  }

  window.PixelIconImageProcessor = {
    loadImageFromDataURL: loadImageFromDataURL,
    convertImageToPixelIcon: convertImageToPixelIcon,
    calculateTileBounds: calculateTileBounds,
    calculateTileMedianColor: calculateTileMedianColor,
    calculateTileAverageColor: calculateTileAverageColor,
    calculateTileCenterColor: calculateTileCenterColor,
    calculateTileDominantColor: calculateTileDominantColor,
    calculateTileRepresentativeColor: calculateTileRepresentativeColor,
    calculateMedian: calculateMedian,
    calculateAverage: calculateAverage,
    isTransparentPixel: isTransparentPixel,
    shouldTileBeTransparent: shouldTileBeTransparent,
    imageDataHasTransparency: imageDataHasTransparency
  };
})();

(function () {
  "use strict";

  var constants = window.PixelIconConstants;

  function cloneImageData(imageData) {
    return new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
  }

  function canvasToImageData(canvas) {
    var context = canvas.getContext("2d", { willReadFrequently: true });
    return context.getImageData(0, 0, canvas.width, canvas.height);
  }

  function imageDataToCanvas(imageData) {
    var canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    canvas.getContext("2d").putImageData(imageData, 0, 0);
    return canvas;
  }

  function isVisibleAlpha(alpha) {
    return alpha >= constants.TRANSPARENT_ALPHA_THRESHOLD;
  }

  function createColorKey(red, green, blue) {
    return red + "," + green + "," + blue;
  }

  function createRgbaKey(red, green, blue, alpha) {
    return red + "," + green + "," + blue + "," + alpha;
  }

  function countUniqueVisibleColors(imageData) {
    var data = imageData.data;
    var colors = Object.create(null);
    var count = 0;

    for (var index = 0; index < data.length; index += 4) {
      if (isVisibleAlpha(data[index + 3])) {
        var key = createColorKey(data[index], data[index + 1], data[index + 2]);
        if (!colors[key]) {
          colors[key] = true;
          count += 1;
        }
      }
    }

    return count;
  }

  function countUniqueRgbaColors(imageData) {
    var data = imageData.data;
    var colors = Object.create(null);
    var count = 0;

    for (var index = 0; index < data.length; index += 4) {
      var key = createRgbaKey(data[index], data[index + 1], data[index + 2], data[index + 3]);
      if (!colors[key]) {
        colors[key] = true;
        count += 1;
      }
    }

    return count;
  }

  function rgbToHex(red, green, blue) {
    return "#" + [red, green, blue].map(function (channel) {
      return clampChannel(channel).toString(16).padStart(2, "0");
    }).join("");
  }

  function getResultPaletteFromImageData(imageData) {
    var data = imageData.data;
    var colorMap = Object.create(null);
    var visiblePixelCount = 0;
    var transparentPixelCount = 0;

    for (var index = 0; index < data.length; index += 4) {
      if (!isVisibleAlpha(data[index + 3])) {
        transparentPixelCount += 1;
        continue;
      }

      var key = createColorKey(data[index], data[index + 1], data[index + 2]);
      visiblePixelCount += 1;

      if (!colorMap[key]) {
        colorMap[key] = {
          r: data[index],
          g: data[index + 1],
          b: data[index + 2],
          hex: rgbToHex(data[index], data[index + 1], data[index + 2]),
          count: 0,
          percentage: 0
        };
      }

      colorMap[key].count += 1;
    }

    var colors = Object.keys(colorMap).map(function (key) {
      var color = colorMap[key];
      color.percentage = visiblePixelCount
        ? Math.round((color.count / visiblePixelCount) * 1000) / 10
        : 0;
      return color;
    }).sort(function (colorA, colorB) {
      if (colorB.count !== colorA.count) {
        return colorB.count - colorA.count;
      }
      return colorA.hex.localeCompare(colorB.hex);
    });

    return {
      colors: colors,
      visibleColorCount: colors.length,
      visiblePixelCount: visiblePixelCount,
      transparentPixelCount: transparentPixelCount,
      totalPixelCount: imageData.width * imageData.height
    };
  }

  function getResultPaletteFromCanvas(canvas) {
    return getResultPaletteFromImageData(canvasToImageData(canvas));
  }

  function replaceColorInImageData(imageData, sourceColor, targetColor) {
    var edited = cloneImageData(imageData);
    var data = edited.data;
    var safeSource = sourceColor || {};
    var safeTarget = targetColor || {};
    var sourceRed = clampChannel(safeSource.r);
    var sourceGreen = clampChannel(safeSource.g);
    var sourceBlue = clampChannel(safeSource.b);
    var targetRed = clampChannel(safeTarget.r);
    var targetGreen = clampChannel(safeTarget.g);
    var targetBlue = clampChannel(safeTarget.b);
    var replacedPixelCount = 0;

    for (var index = 0; index < data.length; index += 4) {
      if (!isVisibleAlpha(data[index + 3])) {
        continue;
      }

      if (data[index] === sourceRed &&
        data[index + 1] === sourceGreen &&
        data[index + 2] === sourceBlue) {
        data[index] = targetRed;
        data[index + 1] = targetGreen;
        data[index + 2] = targetBlue;
        replacedPixelCount += 1;
      }
    }

    return {
      imageData: edited,
      replacedPixelCount: replacedPixelCount,
      sourceHex: rgbToHex(sourceRed, sourceGreen, sourceBlue),
      targetHex: rgbToHex(targetRed, targetGreen, targetBlue)
    };
  }

  function replaceColorInCanvas(canvas, sourceColor, targetColor) {
    var result = replaceColorInImageData(canvasToImageData(canvas), sourceColor, targetColor);
    result.canvas = imageDataToCanvas(result.imageData);
    result.palette = getResultPaletteFromImageData(result.imageData);
    return result;
  }

  function normalizeAlphaForPaletteLimit(imageData) {
    var normalized = cloneImageData(imageData);
    var data = normalized.data;

    for (var index = 0; index < data.length; index += 4) {
      if (isVisibleAlpha(data[index + 3])) {
        data[index + 3] = 255;
      } else {
        data[index] = 0;
        data[index + 1] = 0;
        data[index + 2] = 0;
        data[index + 3] = 0;
      }
    }

    return normalized;
  }

  function extractVisiblePixels(imageData) {
    var data = imageData.data;
    var pixels = [];

    for (var index = 0; index < data.length; index += 4) {
      if (isVisibleAlpha(data[index + 3])) {
        pixels.push({
          r: data[index],
          g: data[index + 1],
          b: data[index + 2]
        });
      }
    }

    return pixels;
  }

  function getChannelRange(pixels, channel) {
    var min = 255;
    var max = 0;

    pixels.forEach(function (pixel) {
      min = Math.min(min, pixel[channel]);
      max = Math.max(max, pixel[channel]);
    });

    return max - min;
  }

  function getLongestChannel(pixels) {
    var redRange = getChannelRange(pixels, "r");
    var greenRange = getChannelRange(pixels, "g");
    var blueRange = getChannelRange(pixels, "b");

    if (redRange >= greenRange && redRange >= blueRange) {
      return "r";
    }

    if (greenRange >= redRange && greenRange >= blueRange) {
      return "g";
    }

    return "b";
  }

  function canSplitBucket(bucket) {
    return bucket.pixels.length > 1 &&
      (getChannelRange(bucket.pixels, "r") > 0 ||
        getChannelRange(bucket.pixels, "g") > 0 ||
        getChannelRange(bucket.pixels, "b") > 0);
  }

  function sortBucketsForSplit(bucketA, bucketB) {
    var rangeA = Math.max(
      getChannelRange(bucketA.pixels, "r"),
      getChannelRange(bucketA.pixels, "g"),
      getChannelRange(bucketA.pixels, "b")
    );
    var rangeB = Math.max(
      getChannelRange(bucketB.pixels, "r"),
      getChannelRange(bucketB.pixels, "g"),
      getChannelRange(bucketB.pixels, "b")
    );

    if (rangeB !== rangeA) {
      return rangeB - rangeA;
    }

    return bucketB.pixels.length - bucketA.pixels.length;
  }

  function splitBucket(bucket) {
    var channel = getLongestChannel(bucket.pixels);
    var sorted = bucket.pixels.slice().sort(function (pixelA, pixelB) {
      return pixelA[channel] - pixelB[channel];
    });
    var middle = Math.floor(sorted.length / 2);

    return [
      { pixels: sorted.slice(0, middle) },
      { pixels: sorted.slice(middle) }
    ];
  }

  function averageBucketColor(bucket) {
    var totals = bucket.pixels.reduce(function (sum, pixel) {
      sum.r += pixel.r;
      sum.g += pixel.g;
      sum.b += pixel.b;
      return sum;
    }, { r: 0, g: 0, b: 0 });
    var length = bucket.pixels.length || 1;

    return {
      r: Math.round(totals.r / length),
      g: Math.round(totals.g / length),
      b: Math.round(totals.b / length)
    };
  }

  function buildMedianCutPalette(pixels, colorCount) {
    var buckets = [{ pixels: pixels.slice() }];

    while (buckets.length < colorCount) {
      buckets.sort(sortBucketsForSplit);

      var splitIndex = buckets.findIndex(canSplitBucket);
      if (splitIndex === -1) {
        break;
      }

      var bucket = buckets.splice(splitIndex, 1)[0];
      var splitBuckets = splitBucket(bucket);
      buckets.push(splitBuckets[0], splitBuckets[1]);
    }

    return buckets
      .filter(function (bucket) {
        return bucket.pixels.length > 0;
      })
      .map(averageBucketColor);
  }

  function getDistanceSquared(red, green, blue, paletteColor) {
    var redDelta = red - paletteColor.r;
    var greenDelta = green - paletteColor.g;
    var blueDelta = blue - paletteColor.b;

    return redDelta * redDelta + greenDelta * greenDelta + blueDelta * blueDelta;
  }

  function clampChannel(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
  }

  function normalizeDitheringMode(ditheringMode) {
    if (constants.DITHERING_MODES.indexOf(ditheringMode) === -1) {
      return constants.DEFAULT_DITHERING_MODE;
    }
    return ditheringMode;
  }

  function normalizeDitheringStrength(strength) {
    var numericStrength = Number(strength);

    if (!Number.isFinite(numericStrength)) {
      return constants.DEFAULT_DITHERING_STRENGTH;
    }

    return Math.max(0, Math.min(1, numericStrength));
  }

  function findNearestPaletteColor(red, green, blue, palette) {
    var nearest = palette[0];
    var nearestDistance = getDistanceSquared(red, green, blue, nearest);

    for (var index = 1; index < palette.length; index += 1) {
      var distance = getDistanceSquared(red, green, blue, palette[index]);
      if (distance < nearestDistance) {
        nearest = palette[index];
        nearestDistance = distance;
      }
    }

    return nearest;
  }

  function distributeFloydSteinbergError(workingData, sourceData, width, height, x, y, redError, greenError, blueError, factor) {
    var targetX = x;
    var targetY = y;
    var index;

    if (targetX < 0 || targetX >= width || targetY < 0 || targetY >= height) {
      return;
    }

    index = (targetY * width + targetX) * 4;

    if (!isVisibleAlpha(sourceData[index + 3])) {
      return;
    }

    workingData[index] += redError * factor;
    workingData[index + 1] += greenError * factor;
    workingData[index + 2] += blueError * factor;
  }

  function mapImageDataWithFloydSteinberg(imageData, palette, strength) {
    var mapped = cloneImageData(imageData);
    var outputData = mapped.data;
    var sourceData = imageData.data;
    var workingData = new Float32Array(sourceData.length);
    var width = imageData.width;
    var height = imageData.height;
    var x;
    var y;

    for (var copyIndex = 0; copyIndex < sourceData.length; copyIndex += 1) {
      workingData[copyIndex] = sourceData[copyIndex];
    }

    for (y = 0; y < height; y += 1) {
      for (x = 0; x < width; x += 1) {
        var index = (y * width + x) * 4;

        if (isVisibleAlpha(sourceData[index + 3])) {
          var oldRed = clampChannel(workingData[index]);
          var oldGreen = clampChannel(workingData[index + 1]);
          var oldBlue = clampChannel(workingData[index + 2]);
          var nearest = findNearestPaletteColor(oldRed, oldGreen, oldBlue, palette);
          var redError = (oldRed - nearest.r) * strength;
          var greenError = (oldGreen - nearest.g) * strength;
          var blueError = (oldBlue - nearest.b) * strength;

          outputData[index] = nearest.r;
          outputData[index + 1] = nearest.g;
          outputData[index + 2] = nearest.b;

          distributeFloydSteinbergError(workingData, sourceData, width, height, x + 1, y, redError, greenError, blueError, 7 / 16);
          distributeFloydSteinbergError(workingData, sourceData, width, height, x - 1, y + 1, redError, greenError, blueError, 3 / 16);
          distributeFloydSteinbergError(workingData, sourceData, width, height, x, y + 1, redError, greenError, blueError, 5 / 16);
          distributeFloydSteinbergError(workingData, sourceData, width, height, x + 1, y + 1, redError, greenError, blueError, 1 / 16);
        }
      }
    }

    return mapped;
  }

  function getBayer4x4Offset(x, y, strength) {
    var matrix = [
      0, 8, 2, 10,
      12, 4, 14, 6,
      3, 11, 1, 9,
      15, 7, 13, 5
    ];
    var matrixIndex = (y % 4) * 4 + (x % 4);

    return (((matrix[matrixIndex] + 0.5) / 16) - 0.5) * 64 * strength;
  }

  function mapImageDataWithBayer4x4(imageData, palette, strength) {
    var mapped = cloneImageData(imageData);
    var data = mapped.data;
    var width = imageData.width;
    var height = imageData.height;
    var x;
    var y;

    for (y = 0; y < height; y += 1) {
      for (x = 0; x < width; x += 1) {
        var index = (y * width + x) * 4;

        if (isVisibleAlpha(data[index + 3])) {
          var offset = getBayer4x4Offset(x, y, strength);
          var nearest = findNearestPaletteColor(
            clampChannel(data[index] + offset),
            clampChannel(data[index + 1] + offset),
            clampChannel(data[index + 2] + offset),
            palette
          );

          data[index] = nearest.r;
          data[index + 1] = nearest.g;
          data[index + 2] = nearest.b;
        }
      }
    }

    return mapped;
  }

  function mapImageDataToPalette(imageData, palette, options) {
    var mapped = cloneImageData(imageData);
    var data = mapped.data;
    var safeOptions = options || {};
    var ditheringMode = normalizeDitheringMode(safeOptions.ditheringMode);
    var strength = normalizeDitheringStrength(safeOptions.ditheringStrength);

    if (!palette.length) {
      return mapped;
    }

    if (ditheringMode === "floydSteinberg" && strength > 0) {
      return mapImageDataWithFloydSteinberg(imageData, palette, strength);
    }

    if (ditheringMode === "bayer4x4" && strength > 0) {
      return mapImageDataWithBayer4x4(imageData, palette, strength);
    }

    for (var index = 0; index < data.length; index += 4) {
      if (isVisibleAlpha(data[index + 3])) {
        var nearest = findNearestPaletteColor(data[index], data[index + 1], data[index + 2], palette);
        data[index] = nearest.r;
        data[index + 1] = nearest.g;
        data[index + 2] = nearest.b;
      }
    }

    return mapped;
  }

  function sanitizePaletteColors(colors) {
    var sanitized = [];
    var seen = Object.create(null);

    (colors || []).forEach(function (color) {
      var red = clampChannel(color && color.r);
      var green = clampChannel(color && color.g);
      var blue = clampChannel(color && color.b);
      var key = createColorKey(red, green, blue);

      if (!seen[key]) {
        seen[key] = true;
        sanitized.push({
          r: red,
          g: green,
          b: blue,
          hex: color && color.hex
        });
      }
    });

    return sanitized;
  }

  function resolveEffectivePaletteCount(paletteMode, customPaletteCount, outputWidth, outputHeight) {
    var mode = paletteMode || constants.DEFAULT_PALETTE_MODE;
    var maxDimension = Math.max(outputWidth || 0, outputHeight || 0);

    if (mode === "off") {
      return null;
    }

    if (mode === "auto") {
      for (var index = 0; index < constants.AUTO_PALETTE_RULES.length; index += 1) {
        if (maxDimension <= constants.AUTO_PALETTE_RULES[index].maxDimension) {
          return constants.AUTO_PALETTE_RULES[index].colors;
        }
      }
    }

    if (mode === "custom") {
      return Number(customPaletteCount);
    }

    return Number(mode);
  }

  function applyPaletteLimitToImageData(imageData, options) {
    var safeOptions = options || {};
    var paletteMode = safeOptions.paletteMode || constants.DEFAULT_PALETTE_MODE;
    var paletteSource = safeOptions.paletteSource || constants.DEFAULT_PALETTE_SOURCE;
    var fixedPalette = sanitizePaletteColors(safeOptions.fixedPaletteColors);
    var hasFixedPalette = paletteSource !== constants.DEFAULT_PALETTE_SOURCE &&
      fixedPalette.length >= constants.MIN_PALETTE_COLORS;
    var ditheringMode = normalizeDitheringMode(safeOptions.ditheringMode);
    var ditheringStrength = normalizeDitheringStrength(safeOptions.ditheringStrength);
    var effectivePaletteCount = resolveEffectivePaletteCount(
      paletteMode,
      safeOptions.customPaletteCount,
      imageData.width,
      imageData.height
    );
    var beforeColorCount = countUniqueVisibleColors(imageData);
    var beforeRgbaColorCount = countUniqueRgbaColors(imageData);

    if (paletteMode === "off" && !hasFixedPalette) {
      return {
        imageData: imageData,
        paletteMode: paletteMode,
        paletteSource: paletteSource,
        paletteApplied: false,
        fixedPaletteApplied: false,
        effectivePaletteCount: null,
        beforeColorCount: beforeColorCount,
        afterColorCount: beforeColorCount,
        beforeRgbaColorCount: beforeRgbaColorCount,
        afterRgbaColorCount: beforeRgbaColorCount,
        alphaMode: "preserve",
        ditheringMode: ditheringMode,
        ditheringApplied: false,
        ditheringSkipped: ditheringMode !== constants.DEFAULT_DITHERING_MODE
      };
    }

    var normalizedImageData = normalizeAlphaForPaletteLimit(imageData);
    var normalizedColorCount = countUniqueVisibleColors(normalizedImageData);

    if (!normalizedColorCount) {
      return {
        imageData: normalizedImageData,
        paletteMode: paletteMode,
        paletteSource: paletteSource,
        paletteApplied: true,
        fixedPaletteApplied: hasFixedPalette,
        effectivePaletteCount: hasFixedPalette ? fixedPalette.length : effectivePaletteCount,
        beforeColorCount: beforeColorCount,
        afterColorCount: 0,
        beforeRgbaColorCount: beforeRgbaColorCount,
        afterRgbaColorCount: countUniqueRgbaColors(normalizedImageData),
        alphaMode: constants.PALETTE_LIMIT_ALPHA_MODE,
        ditheringMode: ditheringMode,
        ditheringApplied: false,
        ditheringSkipped: false
      };
    }

    if (hasFixedPalette) {
      var fixedMappedImageData = mapImageDataToPalette(normalizedImageData, fixedPalette, {
        ditheringMode: ditheringMode,
        ditheringStrength: ditheringStrength
      });

      return {
        imageData: fixedMappedImageData,
        paletteMode: paletteMode,
        paletteSource: paletteSource,
        paletteApplied: true,
        fixedPaletteApplied: true,
        effectivePaletteCount: fixedPalette.length,
        beforeColorCount: beforeColorCount,
        afterColorCount: countUniqueVisibleColors(fixedMappedImageData),
        beforeRgbaColorCount: beforeRgbaColorCount,
        afterRgbaColorCount: countUniqueRgbaColors(fixedMappedImageData),
        alphaMode: constants.PALETTE_LIMIT_ALPHA_MODE,
        palette: fixedPalette,
        ditheringMode: ditheringMode,
        ditheringApplied: ditheringMode !== constants.DEFAULT_DITHERING_MODE && ditheringStrength > 0,
        ditheringSkipped: false
      };
    }

    if (effectivePaletteCount >= normalizedColorCount) {
      return {
        imageData: normalizedImageData,
        paletteMode: paletteMode,
        paletteSource: paletteSource,
        paletteApplied: true,
        fixedPaletteApplied: false,
        effectivePaletteCount: effectivePaletteCount,
        beforeColorCount: beforeColorCount,
        afterColorCount: normalizedColorCount,
        beforeRgbaColorCount: beforeRgbaColorCount,
        afterRgbaColorCount: countUniqueRgbaColors(normalizedImageData),
        alphaMode: constants.PALETTE_LIMIT_ALPHA_MODE,
        ditheringMode: ditheringMode,
        ditheringApplied: false,
        ditheringSkipped: false
      };
    }

    var visiblePixels = extractVisiblePixels(normalizedImageData);
    var palette = buildMedianCutPalette(visiblePixels, effectivePaletteCount);
    var mappedImageData = mapImageDataToPalette(normalizedImageData, palette, {
      ditheringMode: ditheringMode,
      ditheringStrength: ditheringStrength
    });

    return {
      imageData: mappedImageData,
      paletteMode: paletteMode,
      paletteSource: paletteSource,
      paletteApplied: true,
      fixedPaletteApplied: false,
      effectivePaletteCount: effectivePaletteCount,
      beforeColorCount: beforeColorCount,
      afterColorCount: countUniqueVisibleColors(mappedImageData),
      beforeRgbaColorCount: beforeRgbaColorCount,
      afterRgbaColorCount: countUniqueRgbaColors(mappedImageData),
      alphaMode: constants.PALETTE_LIMIT_ALPHA_MODE,
      palette: palette,
      ditheringMode: ditheringMode,
      ditheringApplied: ditheringMode !== constants.DEFAULT_DITHERING_MODE && ditheringStrength > 0,
      ditheringSkipped: false
    };
  }

  function applyPaletteLimitToCanvas(canvas, options) {
    var imageData = canvasToImageData(canvas);
    var result = applyPaletteLimitToImageData(imageData, options);
    result.canvas = result.imageData === imageData ? canvas : imageDataToCanvas(result.imageData);
    return result;
  }

  window.PixelIconPaletteQuantizer = {
    applyPaletteLimitToCanvas: applyPaletteLimitToCanvas,
    applyPaletteLimitToImageData: applyPaletteLimitToImageData,
    extractVisiblePixels: extractVisiblePixels,
    buildMedianCutPalette: buildMedianCutPalette,
    mapImageDataToPalette: mapImageDataToPalette,
    findNearestPaletteColor: findNearestPaletteColor,
    countUniqueVisibleColors: countUniqueVisibleColors,
    countUniqueRgbaColors: countUniqueRgbaColors,
    rgbToHex: rgbToHex,
    getResultPaletteFromImageData: getResultPaletteFromImageData,
    getResultPaletteFromCanvas: getResultPaletteFromCanvas,
    replaceColorInImageData: replaceColorInImageData,
    replaceColorInCanvas: replaceColorInCanvas,
    normalizeAlphaForPaletteLimit: normalizeAlphaForPaletteLimit,
    resolveEffectivePaletteCount: resolveEffectivePaletteCount
  };
})();

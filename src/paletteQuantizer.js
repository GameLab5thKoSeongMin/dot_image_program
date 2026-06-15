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

  function mapImageDataToPalette(imageData, palette) {
    var mapped = cloneImageData(imageData);
    var data = mapped.data;

    if (!palette.length) {
      return mapped;
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
    var effectivePaletteCount = resolveEffectivePaletteCount(
      paletteMode,
      safeOptions.customPaletteCount,
      imageData.width,
      imageData.height
    );
    var beforeColorCount = countUniqueVisibleColors(imageData);

    if (paletteMode === "off") {
      return {
        imageData: imageData,
        paletteMode: paletteMode,
        paletteApplied: false,
        effectivePaletteCount: null,
        beforeColorCount: beforeColorCount,
        afterColorCount: beforeColorCount
      };
    }

    if (!beforeColorCount) {
      return {
        imageData: cloneImageData(imageData),
        paletteMode: paletteMode,
        paletteApplied: true,
        effectivePaletteCount: effectivePaletteCount,
        beforeColorCount: 0,
        afterColorCount: 0
      };
    }

    if (effectivePaletteCount >= beforeColorCount) {
      return {
        imageData: cloneImageData(imageData),
        paletteMode: paletteMode,
        paletteApplied: true,
        effectivePaletteCount: effectivePaletteCount,
        beforeColorCount: beforeColorCount,
        afterColorCount: beforeColorCount
      };
    }

    var visiblePixels = extractVisiblePixels(imageData);
    var palette = buildMedianCutPalette(visiblePixels, effectivePaletteCount);
    var mappedImageData = mapImageDataToPalette(imageData, palette);

    return {
      imageData: mappedImageData,
      paletteMode: paletteMode,
      paletteApplied: true,
      effectivePaletteCount: effectivePaletteCount,
      beforeColorCount: beforeColorCount,
      afterColorCount: countUniqueVisibleColors(mappedImageData),
      palette: palette
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
    resolveEffectivePaletteCount: resolveEffectivePaletteCount
  };
})();

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

  function calculateTileBounds(tileX, tileY, imageWidth, imageHeight) {
    var outputSize = constants.OUTPUT_SIZE;
    var xStart = Math.floor(tileX * imageWidth / outputSize);
    var xEnd = Math.floor((tileX + 1) * imageWidth / outputSize);
    var yStart = Math.floor(tileY * imageHeight / outputSize);
    var yEnd = Math.floor((tileY + 1) * imageHeight / outputSize);

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

  function isTransparentPixel(alpha) {
    return alpha < constants.TRANSPARENT_ALPHA_THRESHOLD;
  }

  function shouldTileBeTransparent(totalPixelCount, opaquePixelCount) {
    if (opaquePixelCount <= 0 || totalPixelCount <= 0) {
      return true;
    }

    return opaquePixelCount / totalPixelCount < constants.MIN_OPAQUE_RATIO;
  }

  function calculateTileMedianColor(imageData, tileBounds) {
    var data = imageData.data;
    var width = imageData.width;
    var redValues = [];
    var greenValues = [];
    var blueValues = [];
    var alphaValues = [];
    var totalPixelCount = 0;
    var opaquePixelCount = 0;

    for (var y = tileBounds.yStart; y < tileBounds.yEnd; y += 1) {
      for (var x = tileBounds.xStart; x < tileBounds.xEnd; x += 1) {
        var index = (y * width + x) * 4;
        var alpha = data[index + 3];
        totalPixelCount += 1;

        if (!isTransparentPixel(alpha)) {
          redValues.push(data[index]);
          greenValues.push(data[index + 1]);
          blueValues.push(data[index + 2]);
          alphaValues.push(alpha);
          opaquePixelCount += 1;
        }
      }
    }

    if (shouldTileBeTransparent(totalPixelCount, opaquePixelCount)) {
      return [0, 0, 0, 0];
    }

    return [
      calculateMedian(redValues),
      calculateMedian(greenValues),
      calculateMedian(blueValues),
      calculateMedian(alphaValues)
    ];
  }

  function convertImageToPixelIcon(image) {
    var sourceImageData = createSourceImageData(image);
    var outputSize = constants.OUTPUT_SIZE;
    var outputCanvas = document.createElement("canvas");
    outputCanvas.width = outputSize;
    outputCanvas.height = outputSize;

    var outputContext = outputCanvas.getContext("2d");
    var outputImageData = outputContext.createImageData(outputSize, outputSize);

    for (var tileY = 0; tileY < outputSize; tileY += 1) {
      for (var tileX = 0; tileX < outputSize; tileX += 1) {
        var bounds = calculateTileBounds(tileX, tileY, sourceImageData.width, sourceImageData.height);
        var color = calculateTileMedianColor(sourceImageData, bounds);
        var outputIndex = (tileY * outputSize + tileX) * 4;

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
      sourceHeight: sourceImageData.height
    };
  }

  window.PixelIconImageProcessor = {
    loadImageFromDataURL: loadImageFromDataURL,
    convertImageToPixelIcon: convertImageToPixelIcon,
    calculateTileBounds: calculateTileBounds,
    calculateTileMedianColor: calculateTileMedianColor,
    calculateMedian: calculateMedian,
    isTransparentPixel: isTransparentPixel,
    shouldTileBeTransparent: shouldTileBeTransparent
  };
})();

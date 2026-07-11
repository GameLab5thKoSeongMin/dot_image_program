(function () {
  "use strict";

  var root = self;
  root.window = root;

  importScripts(
    "constants.js",
    "imageProcessor.js",
    "paletteQuantizer.js",
    "iconAssistProcessor.js"
  );

  var constants = root.PixelIconConstants;
  var imageProcessor = root.PixelIconImageProcessor;
  var paletteQuantizer = root.PixelIconPaletteQuantizer;
  var iconAssistProcessor = root.PixelIconIconAssistProcessor;

  function postStage(requestId, stage) {
    root.postMessage({
      type: "stage",
      requestId: requestId,
      stage: stage
    });
  }

  function cloneImageData(imageData) {
    return new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
  }

  function createOutputImageData(width, height) {
    return new ImageData(new Uint8ClampedArray(width * height * 4), width, height);
  }

  function normalizeSamplingMode(samplingMode) {
    return constants.SAMPLING_MODES.indexOf(samplingMode) === -1
      ? constants.DEFAULT_SAMPLING_MODE
      : samplingMode;
  }

  function convertImageDataToPixelIcon(sourceImageData, options, requestId) {
    var outputWidth = Number(options.outputWidth) || constants.DEFAULT_OUTPUT_WIDTH;
    var outputHeight = Number(options.outputHeight) || constants.DEFAULT_OUTPUT_HEIGHT;
    var samplingMode = normalizeSamplingMode(options.samplingMode);
    var preprocessResult;
    var processedSource;
    var outputImageData;

    postStage(requestId, "전처리 중");
    preprocessResult = imageProcessor.applyPreprocessToImageData(
      sourceImageData,
      options.preprocess || {}
    );
    processedSource = preprocessResult.imageData;

    postStage(requestId, "픽셀 변환 중");
    outputImageData = createOutputImageData(outputWidth, outputHeight);

    for (var tileY = 0; tileY < outputHeight; tileY += 1) {
      for (var tileX = 0; tileX < outputWidth; tileX += 1) {
        var bounds = imageProcessor.calculateTileBounds(
          tileX,
          tileY,
          processedSource.width,
          processedSource.height,
          outputWidth,
          outputHeight
        );
        var color = imageProcessor.calculateTileRepresentativeColor(
          processedSource,
          bounds,
          samplingMode
        );
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
      sourceWidth: processedSource.width,
      sourceHeight: processedSource.height,
      samplingMode: samplingMode,
      sourceHasTransparency: imageProcessor.imageDataHasTransparency(sourceImageData),
      preprocessedSourceHasTransparency: imageProcessor.imageDataHasTransparency(processedSource),
      preprocessApplied: preprocessResult.preprocessApplied,
      preprocessOptions: preprocessResult.options,
      backgroundRemovedPixelCount: preprocessResult.removedPixelCount,
      resultHasTransparency: imageProcessor.imageDataHasTransparency(outputImageData)
    };
  }

  function buildPaletteInfo(paletteResult, paletteSourceOptions, outlineResult, finalImageData) {
    return {
      paletteMode: paletteResult.paletteMode,
      paletteSource: paletteResult.paletteSource,
      paletteSourceId: paletteSourceOptions.paletteId,
      paletteSourceLabel: paletteSourceOptions.label,
      paletteApplied: paletteResult.paletteApplied,
      fixedPaletteApplied: paletteResult.fixedPaletteApplied,
      effectivePaletteCount: paletteResult.effectivePaletteCount,
      beforeColorCount: paletteResult.beforeColorCount,
      afterColorCount: paletteResult.afterColorCount,
      beforeRgbaColorCount: paletteResult.beforeRgbaColorCount,
      afterRgbaColorCount: paletteResult.afterRgbaColorCount,
      alphaMode: paletteResult.alphaMode,
      ditheringMode: paletteResult.ditheringMode,
      ditheringApplied: paletteResult.ditheringApplied,
      ditheringSkipped: paletteResult.ditheringSkipped,
      outlineMode: outlineResult.outlineMode,
      outlineApplied: outlineResult.outlineApplied,
      outlineAddedPixelCount: outlineResult.outlineAddedPixelCount,
      outlineColorHex: outlineResult.outlineColorHex,
      finalColorCount: paletteQuantizer.countUniqueVisibleColors(finalImageData)
    };
  }

  function processRequest(message) {
    var requestId = message.requestId;
    var sourceImageData = message.sourceImageData;
    var options = message.options || {};
    var conversionResult;
    var paletteResult;
    var outlineResult;
    var finalImageData;
    var editableImageData;
    var resultPalette;
    var transferList;

    postStage(requestId, "이미지 준비 중");
    conversionResult = convertImageDataToPixelIcon(sourceImageData, options.conversion || {}, requestId);

    postStage(requestId, "팔레트 처리 중");
    paletteResult = paletteQuantizer.applyPaletteLimitToImageData(
      conversionResult.imageData,
      options.palette || {}
    );

    postStage(requestId, "외곽선 처리 중");
    outlineResult = iconAssistProcessor.applyOutlineToImageData(
      paletteResult.imageData,
      { mode: options.outlineMode || constants.DEFAULT_OUTLINE_MODE }
    );

    editableImageData = outlineResult.imageData === paletteResult.imageData
      ? cloneImageData(paletteResult.imageData)
      : paletteResult.imageData;
    finalImageData = outlineResult.imageData;

    postStage(requestId, "미리보기 갱신 중");
    resultPalette = paletteQuantizer.getResultPaletteFromImageData(finalImageData);

    conversionResult.editableImageData = editableImageData;
    conversionResult.imageData = finalImageData;
    conversionResult.outlineInfo = outlineResult;
    conversionResult.resultHasTransparency = imageProcessor.imageDataHasTransparency(finalImageData);
    conversionResult.paletteInfo = buildPaletteInfo(
      paletteResult,
      options.paletteSource || {},
      outlineResult,
      finalImageData
    );
    conversionResult.resultPalette = resultPalette;
    conversionResult.workerUsed = true;

    transferList = [finalImageData.data.buffer, editableImageData.data.buffer];
    root.postMessage({
      type: "complete",
      requestId: requestId,
      result: conversionResult
    }, transferList);
  }

  root.onmessage = function (event) {
    var message = event.data || {};

    if (message.type !== "process") {
      return;
    }

    try {
      processRequest(message);
    } catch (error) {
      root.postMessage({
        type: "error",
        requestId: message.requestId,
        message: error && error.message ? error.message : "Worker conversion failed."
      });
    }
  };
})();

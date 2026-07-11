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

  function convertImageDataToPixelIcon(sourceImageData, options, requestId) {
    postStage(requestId, "전처리 및 픽셀 변환 중");
    return imageProcessor.convertImageDataToPixelIcon(sourceImageData, options);
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

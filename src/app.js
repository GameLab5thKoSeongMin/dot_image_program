(function () {
  "use strict";

  var constants = window.PixelIconConstants;
  var fileHandler = window.PixelIconFileHandler;
  var imageProcessor = window.PixelIconImageProcessor;
  var paletteQuantizer = window.PixelIconPaletteQuantizer;
  var iconAssistProcessor = window.PixelIconIconAssistProcessor;
  var exporter = window.PixelIconExporter;
  var ui = window.PixelIconUIController;
  var presetManager = window.PixelIconPresetManager;
  var exampleGallery = window.PixelIconExampleGallery;
  var WorkerClient = window.PixelIconWorkerClient;

  var state = {
    currentFile: null,
    sourceImage: null,
    sourceDataURL: "",
    sourceWidth: 0,
    sourceHeight: 0,
    convertedCanvas: null,
    resultCanvas: null,
    resultPalette: null,
    paletteEditCount: 0,
    resultHasTransparency: false,
    outputFilename: "",
    outputFormat: constants.DEFAULT_OUTPUT_FORMAT,
    samplingMode: constants.DEFAULT_SAMPLING_MODE,
    ditheringMode: constants.DEFAULT_DITHERING_MODE,
    paletteSource: constants.DEFAULT_PALETTE_SOURCE,
    preprocessOptions: null,
    outlineMode: constants.DEFAULT_OUTLINE_MODE,
    outlineInfo: null,
    outlineColorOverride: null,
    paletteInfo: null,
    isProcessing: false,
    processingRequestId: 0,
    workerClient: WorkerClient ? new WorkerClient() : null,
    layered: {
      enabled: false,
      layers: [],
      compositeCanvas: null
    }
  };

  function refreshPresetControls(selectedId) {
    if (!presetManager) {
      return;
    }

    ui.updatePresetControls(presetManager.getAllPresets(), selectedId);
  }

  function getRenderableExamples() {
    if (!exampleGallery) {
      return [];
    }

    return exampleGallery.getExamples().map(function (example) {
      example.previewDataURL = exampleGallery.createExampleDataURL(example.id);
      return example;
    });
  }

  function setProcessing(isProcessing, status, canCancel) {
    var processingOptions = {
      canCancel: !!canCancel,
      canConvert: !!state.sourceImage,
      sourceWidth: state.sourceWidth,
      sourceHeight: state.sourceHeight
    };

    state.isProcessing = isProcessing;
    if (status !== null) {
      processingOptions.stage = status || (isProcessing ? "이미지를 처리하는 중입니다." : "이미지를 기다리는 중입니다.");
    }
    ui.setProcessingState(isProcessing, processingOptions);
    if (!isProcessing) {
      refreshPresetControls(ui.getSelectedPresetId && ui.getSelectedPresetId());
    }
  }

  function resetForNewInput() {
    state.convertedCanvas = null;
    state.resultCanvas = null;
    state.resultPalette = null;
    state.paletteEditCount = 0;
    state.resultHasTransparency = false;
    state.outputFilename = "";
    state.ditheringMode = constants.DEFAULT_DITHERING_MODE;
    state.paletteSource = constants.DEFAULT_PALETTE_SOURCE;
    state.preprocessOptions = null;
    state.outlineMode = constants.DEFAULT_OUTLINE_MODE;
    state.outlineInfo = null;
    state.outlineColorOverride = null;
    state.paletteInfo = null;
    ui.clearError();
    ui.hideWarning();
    ui.resetResult();
  }

  function getNormalizedOptions() {
    var selectedOptions = ui.getSelectedOptions();
    var outputWidth = selectedOptions.customSizeEnabled ? selectedOptions.customWidth : selectedOptions.widthOption;
    var outputHeight = selectedOptions.customSizeEnabled ? selectedOptions.customHeight : selectedOptions.heightOption;
    var outputFormat = fileHandler.normalizeOutputFormat(selectedOptions.outputFormat);
    var samplingMode = fileHandler.normalizeSamplingMode(selectedOptions.samplingMode);
    var ditheringMode = fileHandler.normalizeDitheringMode(selectedOptions.ditheringMode);
    var paletteSource = fileHandler.normalizePaletteSource(selectedOptions.paletteSource);
    var backgroundCleanupColor = fileHandler.hexToRgb(selectedOptions.backgroundCleanupColor);

    return {
      customSizeEnabled: selectedOptions.customSizeEnabled,
      widthOption: selectedOptions.widthOption,
      heightOption: selectedOptions.heightOption,
      outputWidth: outputWidth,
      outputHeight: outputHeight,
      samplingMode: samplingMode,
      ditheringMode: ditheringMode,
      brightness: fileHandler.normalizePreprocessAdjustment(
        selectedOptions.brightness,
        constants.DEFAULT_BRIGHTNESS
      ),
      contrast: fileHandler.normalizePreprocessAdjustment(
        selectedOptions.contrast,
        constants.DEFAULT_CONTRAST
      ),
      saturation: fileHandler.normalizePreprocessAdjustment(
        selectedOptions.saturation,
        constants.DEFAULT_SATURATION
      ),
      sharpenMode: fileHandler.normalizeSharpenMode(selectedOptions.sharpenMode),
      backgroundCleanupEnabled: !!selectedOptions.backgroundCleanupEnabled,
      backgroundCleanupColor: selectedOptions.backgroundCleanupColor,
      backgroundCleanupRgb: backgroundCleanupColor,
      backgroundCleanupTolerance: fileHandler.normalizeBackgroundCleanupTolerance(
        selectedOptions.backgroundCleanupTolerance
      ),
      outlineMode: fileHandler.normalizeOutlineMode(selectedOptions.outlineMode),
      outputFormat: outputFormat,
      paletteSource: paletteSource,
      builtInPaletteId: fileHandler.normalizeBuiltInPaletteId(selectedOptions.builtInPaletteId),
      importedPaletteText: selectedOptions.importedPaletteText,
      paletteMode: fileHandler.normalizePaletteMode(selectedOptions.paletteMode),
      customPaletteCount: selectedOptions.customPaletteCount
    };
  }

  function validateCurrentOptions(options) {
    return fileHandler.validateOutputSize(
      options.outputWidth,
      options.outputHeight,
      state.sourceWidth,
      state.sourceHeight
    );
  }

  function applyOutline(canvas, outlineMode, colorOverride) {
    return iconAssistProcessor.applyOutlineToCanvas(canvas, {
      mode: outlineMode,
      colorOverride: colorOverride
    });
  }

  function buildPaletteText(paletteResult, paletteSourceOptions) {
    if (paletteResult.fixedPaletteApplied) {
      return paletteSourceOptions.label + " (" + paletteResult.effectivePaletteCount + " colors)";
    }

    if (paletteResult.paletteMode === "off") {
      return "off";
    }

    return paletteResult.paletteMode + " (" + paletteResult.effectivePaletteCount + " colors)";
  }

  function resolvePaletteSourceOptions(options) {
    var paletteSource = options.paletteSource || constants.DEFAULT_PALETTE_SOURCE;
    var builtInPalette;
    var importedPalette;

    if (paletteSource === "builtIn") {
      builtInPalette = fileHandler.getBuiltInPaletteById(options.builtInPaletteId);
      return {
        valid: !!builtInPalette,
        message: builtInPalette ? "" : "Built-in palette을 찾을 수 없습니다.",
        paletteSource: paletteSource,
        paletteId: builtInPalette && builtInPalette.id,
        label: builtInPalette ? builtInPalette.label : "Built-in palette",
        fixedPaletteColors: builtInPalette ? fileHandler.createRgbPaletteFromHexColors(builtInPalette.colors) : []
      };
    }

    if (paletteSource === "imported") {
      importedPalette = fileHandler.parseHexPaletteText(options.importedPaletteText);
      ui.updateImportedPalettePreview(importedPalette);

      if (!importedPalette.valid) {
        return {
          valid: false,
          message: importedPalette.message,
          paletteSource: paletteSource,
          label: "Imported palette",
          fixedPaletteColors: []
        };
      }

      return {
        valid: true,
        message: "",
        paletteSource: paletteSource,
        paletteId: "imported",
        label: "Imported palette",
        fixedPaletteColors: importedPalette.rgbColors
      };
    }

    return {
      valid: true,
      message: "",
      paletteSource: constants.DEFAULT_PALETTE_SOURCE,
      paletteId: "generated",
      label: "generated",
      fixedPaletteColors: []
    };
  }

  function buildWarningMessage(outputFormat, resultHasTransparency, paletteInfo, performanceWarning) {
    var messages = [];

    if (performanceWarning) {
      messages.push(performanceWarning.message);
    }

    if (outputFormat === "jpg" && resultHasTransparency) {
      messages.push("JPG는 투명도를 저장할 수 없어 흰색 배경으로 합성해서 내보냅니다.");
    }

    if (paletteInfo &&
      paletteInfo.paletteApplied &&
      !paletteInfo.fixedPaletteApplied &&
      paletteInfo.beforeColorCount > 0 &&
      paletteInfo.effectivePaletteCount >= paletteInfo.beforeColorCount) {
      messages.push("현재 이미지의 실제 색상 수보다 팔레트 제한값이 큽니다. 결과가 거의 변하지 않을 수 있습니다.");
    }

    if (paletteInfo && paletteInfo.ditheringSkipped) {
      messages.push("Dithering은 palette 제한이 적용된 상태에서 사용할 수 있습니다.");
    }

    return messages.join(" ");
  }

  function updateResultWarning(outputFormat, resultHasTransparency, paletteInfo, performanceWarning) {
    var message = buildWarningMessage(outputFormat, resultHasTransparency, paletteInfo, performanceWarning);

    if (message) {
      ui.showWarning(message);
      return;
    }

    ui.hideWarning();
  }

  function imageDataToCanvas(imageData) {
    var canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    canvas.getContext("2d").putImageData(imageData, 0, 0);
    return canvas;
  }

  function getConversionOptions(options, sizeValidation) {
    return {
      outputWidth: sizeValidation.width,
      outputHeight: sizeValidation.height,
      samplingMode: options.samplingMode,
      preprocess: {
        brightness: options.brightness,
        contrast: options.contrast,
        saturation: options.saturation,
        sharpenMode: options.sharpenMode,
        backgroundCleanupEnabled: options.backgroundCleanupEnabled,
        backgroundCleanupColor: options.backgroundCleanupRgb,
        backgroundCleanupTolerance: options.backgroundCleanupTolerance
      }
    };
  }

  function getPaletteProcessingOptions(options, paletteValidation, paletteSourceOptions) {
    return {
      paletteMode: paletteValidation.paletteMode,
      customPaletteCount: paletteValidation.customPaletteCount,
      paletteSource: paletteSourceOptions.paletteSource,
      fixedPaletteColors: paletteSourceOptions.fixedPaletteColors,
      ditheringMode: options.ditheringMode
    };
  }

  function createOutputFilename(result, options) {
    var paletteInfo = result.paletteInfo || {};

    return fileHandler.createOutputFilename(state.currentFile && state.currentFile.name, {
      outputWidth: result.width,
      outputHeight: result.height,
      samplingMode: options.samplingMode,
      outputFormat: options.outputFormat,
      paletteMode: paletteInfo.paletteApplied ? "custom" : paletteInfo.paletteMode,
      paletteCount: paletteInfo.effectivePaletteCount
    });
  }

  function normalizeWorkerResult(workerResult, paletteSourceOptions) {
    var result = workerResult || {};
    result.canvas = imageDataToCanvas(result.imageData);
    result.editableCanvas = imageDataToCanvas(result.editableImageData || result.imageData);
    result.paletteText = buildPaletteText(result.paletteInfo || { paletteMode: "off" }, paletteSourceOptions);
    return result;
  }

  function processImageElementOnMainThread(sourceImage, conversionOptions, paletteOptions, paletteSourceOptions, options) {
    var result = imageProcessor.convertImageToPixelIcon(sourceImage, conversionOptions);
    var paletteResult = paletteQuantizer.applyPaletteLimitToCanvas(result.canvas, paletteOptions);
    var paletteText = buildPaletteText(paletteResult, paletteSourceOptions);
    var outlineResult = applyOutline(paletteResult.canvas, options.outlineMode, null);

    result.editableCanvas = paletteResult.canvas;
    result.canvas = outlineResult.canvas;
    result.outlineInfo = outlineResult;
    result.resultHasTransparency = exporter.canvasHasTransparency(result.canvas);
    result.paletteInfo = {
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
      finalColorCount: paletteQuantizer.countUniqueVisibleColors(
        result.canvas.getContext("2d", { willReadFrequently: true })
          .getImageData(0, 0, result.canvas.width, result.canvas.height)
      )
    };
    result.paletteText = paletteText;
    result.workerUsed = false;
    return result;
  }

  function processImageOnMainThread(conversionOptions, paletteOptions, paletteSourceOptions, options) {
    return processImageElementOnMainThread(
      state.sourceImage,
      conversionOptions,
      paletteOptions,
      paletteSourceOptions,
      options
    );
  }

  function createWorkerPayload(conversionOptions, paletteOptions, paletteSourceOptions, options) {
    return {
      conversion: conversionOptions,
      palette: paletteOptions,
      paletteSource: {
        paletteId: paletteSourceOptions.paletteId,
        label: paletteSourceOptions.label
      },
      outlineMode: options.outlineMode
    };
  }

  function updateResultState(result, options, filename, performanceWarning) {
    state.convertedCanvas = result.editableCanvas || result.canvas;
    state.resultCanvas = result.canvas;
    state.resultPalette = paletteQuantizer.getResultPaletteFromCanvas(result.canvas);
    state.paletteEditCount = 0;
    state.resultHasTransparency = result.resultHasTransparency;
    state.outputFilename = filename;
    state.outputFormat = options.outputFormat;
    state.samplingMode = options.samplingMode;
    state.ditheringMode = options.ditheringMode;
    state.paletteSource = options.paletteSource;
    state.preprocessOptions = result.preprocessOptions || null;
    state.outlineMode = options.outlineMode;
    state.outlineInfo = result.outlineInfo || null;
    state.outlineColorOverride = null;
    state.paletteInfo = result.paletteInfo || null;
    if (state.paletteInfo) {
      state.paletteInfo.manualEditCount = 0;
    }

    ui.showResultPreview(result.canvas);
    ui.updatePaletteEditor(state.resultPalette);
    ui.updateFileInfo({
      outputFilename: filename,
      outputWidth: result.width,
      outputHeight: result.height,
      samplingMode: options.samplingMode,
      ditheringMode: options.ditheringMode,
      preprocessApplied: !!result.preprocessApplied,
      outlineMode: options.outlineMode,
      outputFormat: options.outputFormat,
      paletteSource: options.paletteSource,
      paletteInfo: result.paletteInfo,
      paletteText: result.paletteText
    });
    ui.setDownloadEnabled(true);
    ui.clearError();
    updateResultWarning(options.outputFormat, result.resultHasTransparency, result.paletteInfo, performanceWarning);
    ui.setStatus(result.width + "x" + result.height + " 아이콘 생성이 완료되었습니다.");
  }

  function resetResultWithWarning(message, status) {
    state.convertedCanvas = null;
    state.resultCanvas = null;
    state.resultPalette = null;
    state.paletteEditCount = 0;
    state.outputFilename = "";
    state.ditheringMode = constants.DEFAULT_DITHERING_MODE;
    state.paletteSource = constants.DEFAULT_PALETTE_SOURCE;
    state.preprocessOptions = null;
    state.outlineMode = constants.DEFAULT_OUTLINE_MODE;
    state.outlineInfo = null;
    state.outlineColorOverride = null;
    state.paletteInfo = null;
    ui.resetResult();
    ui.showWarning(message);
    ui.setStatus(status);
  }

  function createLayerId() {
    return "layer-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function getLayerNameFromFile(file) {
    return String(file && file.name ? file.name : "Layer").replace(/\.[^.]+$/, "").slice(0, 80) || "Layer";
  }

  function updateLayeredSourceBounds() {
    if (!state.layered.layers.length) {
      state.sourceWidth = 0;
      state.sourceHeight = 0;
      ui.updateSizeControls(0, 0);
      return;
    }

    state.sourceWidth = Math.min.apply(null, state.layered.layers.map(function (layer) {
      return layer.sourceWidth;
    }));
    state.sourceHeight = Math.min.apply(null, state.layered.layers.map(function (layer) {
      return layer.sourceHeight;
    }));
    ui.updateSizeControls(state.sourceWidth, state.sourceHeight);
  }

  function getVisibleProcessedLayers() {
    return state.layered.layers.filter(function (layer) {
      return layer.visible !== false && layer.processedCanvas;
    }).map(function (layer) {
      return {
        id: layer.id,
        name: layer.name,
        visible: layer.visible,
        canvas: layer.processedCanvas
      };
    });
  }

  function refreshLayerList() {
    ui.renderLayerList(state.layered.layers, {
      onRename: handleLayerRename,
      onToggleVisibility: handleLayerVisibilityToggle,
      onMove: handleLayerMove,
      onDelete: handleLayerDelete
    });
  }

  function refreshLayerComposite() {
    var visibleLayers = getVisibleProcessedLayers();

    if (!visibleLayers.length) {
      state.layered.compositeCanvas = null;
      state.resultCanvas = null;
      ui.clearResultPreview();
      ui.setDownloadEnabled(false);
      ui.setLayeredStatus("No visible processed layers.");
      return;
    }

    state.layered.compositeCanvas = exporter.createLayeredCompositeCanvas(
      visibleLayers,
      visibleLayers[0].canvas.width,
      visibleLayers[0].canvas.height
    );
    state.resultCanvas = state.layered.compositeCanvas;
    state.resultHasTransparency = exporter.canvasHasTransparency(state.resultCanvas);
    ui.showResultPreview(state.resultCanvas);
    ui.setDownloadEnabled(true);
    ui.setLayeredStatus("Composite updated from " + visibleLayers.length + " visible layer(s).");
  }

  function updateLayeredResultInfo(result, options, performanceWarning) {
    var visibleLayers = getVisibleProcessedLayers();
    var filename = fileHandler.createOutputFilename("layered.png", {
      outputWidth: result.width,
      outputHeight: result.height,
      samplingMode: options.samplingMode,
      outputFormat: options.outputFormat,
      paletteMode: "off",
      paletteCount: null
    });

    state.outputFilename = filename;
    state.outputFormat = options.outputFormat;
    state.samplingMode = options.samplingMode;
    state.ditheringMode = options.ditheringMode;
    state.paletteSource = options.paletteSource;
    state.outlineMode = options.outlineMode;
    state.paletteInfo = {
      paletteApplied: false,
      layerCount: state.layered.layers.length,
      visibleLayerCount: visibleLayers.length
    };

    ui.resetPaletteEditor();
    ui.updateFileInfo({
      outputFilename: filename,
      outputWidth: result.width,
      outputHeight: result.height,
      samplingMode: options.samplingMode,
      ditheringMode: options.ditheringMode,
      preprocessApplied: !!result.preprocessApplied,
      outlineMode: options.outlineMode,
      outputFormat: options.outputFormat,
      paletteInfo: state.paletteInfo,
      paletteText: "layered (" + visibleLayers.length + " visible)"
    });
    updateResultWarning(options.outputFormat, state.resultHasTransparency, null, performanceWarning);
    ui.setStatus("Layered composite generated from " + visibleLayers.length + " visible layer(s).");
  }

  async function processLayeredImages(runOptions) {
    var executionOptions = runOptions || {};
    var requestId;
    var options;
    var firstSizeValidation;
    var performanceWarning;
    var paletteValidation;
    var paletteSourceOptions;
    var paletteOptions;
    var resultMetadata = null;

    if (!state.layered.enabled) {
      return false;
    }

    if (state.isProcessing) {
      return true;
    }

    if (!state.layered.layers.length) {
      resetResultWithWarning("Layered Mode is on. Add image layers first.", "Layered Mode is waiting for layers.");
      return true;
    }

    updateLayeredSourceBounds();
    ui.updatePaletteControls();
    ui.updatePreprocessControls();

    options = getNormalizedOptions();
    firstSizeValidation = validateCurrentOptions(options);

    if (!firstSizeValidation.valid) {
      resetResultWithWarning(firstSizeValidation.message, "Check layered output size.");
      return true;
    }

    for (var layerIndex = 0; layerIndex < state.layered.layers.length; layerIndex += 1) {
      var layer = state.layered.layers[layerIndex];
      var layerSizeValidation = fileHandler.validateOutputSize(
        firstSizeValidation.width,
        firstSizeValidation.height,
        layer.sourceWidth,
        layer.sourceHeight
      );

      if (!layerSizeValidation.valid) {
        resetResultWithWarning(layer.name + ": " + layerSizeValidation.message, "Check layer source dimensions.");
        return true;
      }
    }

    performanceWarning = fileHandler.getOutputSizePerformanceWarning(
      firstSizeValidation.width,
      firstSizeValidation.height
    );

    if (executionOptions.auto && performanceWarning) {
      resetResultWithWarning(
        performanceWarning.message + " Use the preview refresh button to process layered output.",
        "Layered preview refresh is required for large output."
      );
      return true;
    }

    paletteValidation = fileHandler.validatePaletteOptions(options.paletteMode, options.customPaletteCount);
    paletteSourceOptions = resolvePaletteSourceOptions(options);

    if (options.paletteSource !== constants.DEFAULT_PALETTE_SOURCE) {
      paletteValidation = {
        valid: true,
        paletteMode: options.paletteMode,
        customPaletteCount: null
      };
    }

    if (!paletteSourceOptions.valid) {
      resetResultWithWarning(paletteSourceOptions.message, "Check layered palette source.");
      return true;
    }

    if (!paletteValidation.valid) {
      resetResultWithWarning(paletteValidation.message, "Check layered palette count.");
      return true;
    }

    requestId = state.processingRequestId + 1;
    state.processingRequestId = requestId;
    setProcessing(true, "Processing layered output...", false);

    try {
      paletteOptions = getPaletteProcessingOptions(options, paletteValidation, paletteSourceOptions);

      for (var processIndex = 0; processIndex < state.layered.layers.length; processIndex += 1) {
        var currentLayer = state.layered.layers[processIndex];
        var conversionOptions = getConversionOptions(options, firstSizeValidation);
        var layerResult;

        setProcessing(true, "Processing layer " + (processIndex + 1) + " / " + state.layered.layers.length, false);
        layerResult = processImageElementOnMainThread(
          currentLayer.sourceImage,
          conversionOptions,
          paletteOptions,
          paletteSourceOptions,
          options
        );
        currentLayer.processedCanvas = layerResult.canvas;
        currentLayer.resultHasTransparency = layerResult.resultHasTransparency;
        resultMetadata = layerResult;
      }

      if (requestId !== state.processingRequestId) {
        return true;
      }

      refreshLayerComposite();

      if (state.resultCanvas && resultMetadata) {
        updateLayeredResultInfo({
          width: firstSizeValidation.width,
          height: firstSizeValidation.height,
          preprocessApplied: resultMetadata.preprocessApplied
        }, {
          outputFormat: options.outputFormat,
          samplingMode: options.samplingMode,
          ditheringMode: options.ditheringMode,
          paletteSource: options.paletteSource,
          outlineMode: options.outlineMode
        }, performanceWarning);
      }
    } catch (error) {
      resetResultWithWarning(
        error.message || "Layered conversion failed.",
        "Layered conversion failed."
      );
    } finally {
      if (requestId === state.processingRequestId) {
        setProcessing(false, null, false);
      }
    }

    return true;
  }

  async function processCurrentImage(runOptions) {
    var executionOptions = runOptions || {};
    var requestId;
    var options;
    var sizeValidation;
    var performanceWarning;
    var paletteValidation;
    var paletteSourceOptions;
    var conversionOptions;
    var paletteOptions;
    var sourceImageData;
    var result;
    var filename;

    if (state.layered.enabled) {
      await processLayeredImages(runOptions);
      return;
    }

    if (!state.sourceImage) {
      ui.resetResult();
      return;
    }

    if (state.isProcessing) {
      return;
    }

    ui.updateSizeControls(state.sourceWidth, state.sourceHeight);
    ui.updatePaletteControls();
    ui.updatePreprocessControls();

    options = getNormalizedOptions();
    sizeValidation = validateCurrentOptions(options);

    if (!sizeValidation.valid) {
      resetResultWithWarning(sizeValidation.message, "출력 크기 설정을 확인하세요.");
      return;
    }

    performanceWarning = fileHandler.getOutputSizePerformanceWarning(
      sizeValidation.width,
      sizeValidation.height
    );

    if (executionOptions.auto && performanceWarning) {
      resetResultWithWarning(
        performanceWarning.message + " 자동 반복 변환을 피하기 위해 미리보기 갱신 버튼을 눌러 변환하세요.",
        "큰 출력 크기는 미리보기 갱신 버튼으로 변환합니다."
      );
      return;
    }

    paletteValidation = fileHandler.validatePaletteOptions(options.paletteMode, options.customPaletteCount);
    paletteSourceOptions = resolvePaletteSourceOptions(options);

    if (options.paletteSource !== constants.DEFAULT_PALETTE_SOURCE) {
      paletteValidation = {
        valid: true,
        paletteMode: options.paletteMode,
        customPaletteCount: null
      };
    }

    if (!paletteSourceOptions.valid) {
      resetResultWithWarning(paletteSourceOptions.message, "palette source를 확인하세요.");
      return;
    }

    if (!paletteValidation.valid) {
      resetResultWithWarning(paletteValidation.message, "팔레트 색상 수를 확인하세요.");
      return;
    }

    if (options.backgroundCleanupEnabled && !options.backgroundCleanupRgb) {
      resetResultWithWarning("유효한 배경 제거 HEX 색상이 필요합니다.", "배경 제거 색상을 확인하세요.");
      return;
    }

    requestId = state.processingRequestId + 1;
    state.processingRequestId = requestId;
    setProcessing(true, "이미지 준비 중", !!state.workerClient);

    try {
      conversionOptions = getConversionOptions(options, sizeValidation);
      paletteOptions = getPaletteProcessingOptions(options, paletteValidation, paletteSourceOptions);
      sourceImageData = imageProcessor.createSourceImageData(state.sourceImage);

      if (state.workerClient) {
        try {
          result = await state.workerClient.process(
            sourceImageData,
            createWorkerPayload(conversionOptions, paletteOptions, paletteSourceOptions, options),
            {
              onStage: function (stage) {
                if (requestId === state.processingRequestId) {
                  setProcessing(true, stage, true);
                }
              },
              onFallback: function () {
                ui.showWarning("Web Worker를 사용할 수 없어 main thread fallback으로 변환합니다.");
              }
            }
          );
          result = normalizeWorkerResult(result, paletteSourceOptions);
        } catch (workerError) {
          if (workerError && workerError.canceled) {
            if (requestId === state.processingRequestId) {
              ui.setStatus("변환을 취소했습니다.");
            }
            return;
          }

          if (!workerError || !workerError.fallback) {
            ui.showWarning("Worker 변환에 실패해 main thread fallback으로 변환합니다.");
          }

          setProcessing(true, "main thread fallback 처리 중", false);
          result = processImageOnMainThread(conversionOptions, paletteOptions, paletteSourceOptions, options);
        }
      } else {
        ui.showWarning("Web Worker를 사용할 수 없어 main thread fallback으로 변환합니다.");
        setProcessing(true, "main thread fallback 처리 중", false);
        result = processImageOnMainThread(conversionOptions, paletteOptions, paletteSourceOptions, options);
      }

      if (requestId !== state.processingRequestId) {
        return;
      }

      filename = createOutputFilename(result, options);
      updateResultState(result, {
        outputFormat: options.outputFormat,
        samplingMode: options.samplingMode,
        ditheringMode: options.ditheringMode,
        paletteSource: options.paletteSource,
        outlineMode: options.outlineMode
      }, filename, performanceWarning);
    } catch (error) {
      if (error && error.canceled) {
        ui.setStatus("변환을 취소했습니다.");
        return;
      }

      resetResultWithWarning(
        error.message || "이미지 변환 중 오류가 발생했습니다.",
        "변환에 실패했습니다."
      );
    } finally {
      if (requestId === state.processingRequestId) {
        setProcessing(false, null, false);
      }
    }
  }
  async function handleFile(file) {
    if (state.isProcessing) {
      return;
    }

    resetForNewInput();

    var validation = fileHandler.validateImageFile(file);
    if (!validation.valid) {
      state.currentFile = null;
      state.sourceImage = null;
      state.sourceDataURL = "";
      state.sourceWidth = 0;
      state.sourceHeight = 0;
      ui.clearOriginalPreview();
      ui.showError(validation.message);
      ui.showWarning(validation.message);
      ui.setStatus("입력 파일을 다시 확인하세요.");
      return;
    }

    try {
      setProcessing(true, "이미지 준비 중", false);
      var dataURL = await fileHandler.readFileAsDataURL(file);
      var image = await imageProcessor.loadImageFromDataURL(dataURL);

      state.currentFile = file;
      state.sourceImage = image;
      state.sourceDataURL = dataURL;
      state.sourceWidth = image.naturalWidth || image.width;
      state.sourceHeight = image.naturalHeight || image.height;

      ui.showOriginalPreview(dataURL, state.sourceWidth, state.sourceHeight);
      setProcessing(false, "이미지를 기다리는 중입니다.", false);
      await processCurrentImage({ auto: true });
    } catch (error) {
      state.currentFile = null;
      state.sourceImage = null;
      state.sourceDataURL = "";
      state.sourceWidth = 0;
      state.sourceHeight = 0;
      state.convertedCanvas = null;
      state.resultCanvas = null;
      state.resultPalette = null;
      state.paletteEditCount = 0;
      state.outputFilename = "";
      state.ditheringMode = constants.DEFAULT_DITHERING_MODE;
      state.paletteSource = constants.DEFAULT_PALETTE_SOURCE;
      state.preprocessOptions = null;
      state.outlineMode = constants.DEFAULT_OUTLINE_MODE;
      state.outlineInfo = null;
      state.outlineColorOverride = null;
      state.paletteInfo = null;
      ui.clearOriginalPreview();
      ui.resetResult();
      ui.showError(error.message || "이미지 처리 중 오류가 발생했습니다.");
      ui.showWarning(error.message || "이미지 처리 중 오류가 발생했습니다.");
      ui.setStatus("처리에 실패했습니다.");
      setProcessing(false, "처리에 실패했습니다.", false);
    } finally {
      if (!state.sourceImage) {
        setProcessing(false, "이미지를 기다리는 중입니다.", false);
      }
    }
  }

  async function handleExampleSelect(exampleId) {
    var example;
    var dataURL;
    var image;

    if (!exampleGallery || state.isProcessing) {
      return;
    }

    example = exampleGallery.getExampleById(exampleId);
    if (!example) {
      ui.showWarning("Example could not be found.");
      ui.setExampleStatus("Example could not be found.");
      return;
    }

    resetForNewInput();
    state.currentFile = null;
    state.sourceImage = null;
    state.sourceDataURL = "";
    state.sourceWidth = 0;
    state.sourceHeight = 0;
    ui.clearOriginalPreview();
    applyPresetSettings(example.settings, "Applied example settings: " + example.title);

    try {
      setProcessing(true, "Example source loading...", false);
      dataURL = exampleGallery.createExampleDataURL(example.id);
      image = await imageProcessor.loadImageFromDataURL(dataURL);

      state.currentFile = {
        name: example.fileName || (example.id + ".png"),
        type: "image/png"
      };
      state.sourceImage = image;
      state.sourceDataURL = dataURL;
      state.sourceWidth = image.naturalWidth || image.width;
      state.sourceHeight = image.naturalHeight || image.height;

      ui.showOriginalPreview(dataURL, state.sourceWidth, state.sourceHeight);
      setProcessing(false, null, false);
      ui.setExampleStatus("Loaded example: " + example.title);
      await processCurrentImage({ auto: false });
    } catch (error) {
      resetForNewInput();
      ui.showWarning(error.message || "Example could not be loaded.");
      ui.setExampleStatus("Example load failed.");
      setProcessing(false, null, false);
    }
  }

  async function handleExampleQa() {
    if (!exampleGallery || state.isProcessing) {
      return;
    }

    try {
      ui.setExampleStatus("Running generated example QA...");
      var results = await exampleGallery.runQa({
        imageProcessor: imageProcessor,
        fileHandler: fileHandler
      });
      ui.setExampleStatus("QA passed for " + results.length + " generated examples.");
      ui.hideWarning();
    } catch (error) {
      ui.showWarning(error.message || "Example QA failed.");
      ui.setExampleStatus("Example QA failed.");
    }
  }

  async function handleLayerFiles(event) {
    var files = Array.prototype.slice.call(event.target.files || []);
    var addedCount = 0;

    if (!files.length || !state.layered.enabled || state.isProcessing) {
      event.target.value = "";
      return;
    }

    try {
      setProcessing(true, "Loading layers...", false);

      for (var index = 0; index < files.length; index += 1) {
        var file = files[index];
        var validation = fileHandler.validateImageFile(file);
        var dataURL;
        var image;

        if (!validation.valid) {
          ui.showWarning(validation.message);
          continue;
        }

        dataURL = await fileHandler.readFileAsDataURL(file);
        image = await imageProcessor.loadImageFromDataURL(dataURL);
        state.layered.layers.push({
          id: createLayerId(),
          name: getLayerNameFromFile(file),
          visible: true,
          sourceImage: image,
          sourceDataURL: dataURL,
          sourceWidth: image.naturalWidth || image.width,
          sourceHeight: image.naturalHeight || image.height,
          processedCanvas: null,
          resultHasTransparency: false
        });
        addedCount += 1;
      }

      refreshLayerList();
      updateLayeredSourceBounds();
      ui.setLayeredStatus("Added " + addedCount + " layer(s).");
      setProcessing(false, null, false);

      if (addedCount) {
        await processCurrentImage({ auto: true });
      }
    } catch (error) {
      ui.showWarning(error.message || "Layer files could not be loaded.");
      ui.setLayeredStatus("Layer load failed.");
      setProcessing(false, null, false);
    } finally {
      event.target.value = "";
    }
  }

  function handleLayerRename(layerId, name) {
    var layer = state.layered.layers.find(function (candidate) {
      return candidate.id === layerId;
    });

    if (layer) {
      layer.name = String(name || layer.name || "Layer").slice(0, 80);
      refreshLayerList();
      ui.setLayeredStatus("Layer renamed.");
    }
  }

  function handleLayerVisibilityToggle(layerId) {
    var layer = state.layered.layers.find(function (candidate) {
      return candidate.id === layerId;
    });

    if (layer) {
      layer.visible = layer.visible === false;
      refreshLayerList();
      refreshLayerComposite();
      ui.setLayeredStatus("Layer visibility updated.");
    }
  }

  function handleLayerMove(layerId, direction) {
    var index = state.layered.layers.findIndex(function (layer) {
      return layer.id === layerId;
    });
    var targetIndex = index + direction;
    var layer;

    if (index < 0 || targetIndex < 0 || targetIndex >= state.layered.layers.length) {
      return;
    }

    layer = state.layered.layers.splice(index, 1)[0];
    state.layered.layers.splice(targetIndex, 0, layer);
    refreshLayerList();
    refreshLayerComposite();
    ui.setLayeredStatus("Layer order updated.");
  }

  function handleLayerDelete(layerId) {
    state.layered.layers = state.layered.layers.filter(function (layer) {
      return layer.id !== layerId;
    });
    refreshLayerList();
    updateLayeredSourceBounds();
    refreshLayerComposite();
    ui.setLayeredStatus("Layer deleted.");
  }

  function handleLayeredModeToggle() {
    state.layered.enabled = ui.isLayeredModeEnabled();
    ui.updateLayeredControls(state.layered.enabled);
    refreshLayerList();

    if (state.layered.enabled) {
      ui.setLayeredStatus("Layered Mode is on. Add image layers.");
      processCurrentImage({ auto: true });
    } else {
      ui.setLayeredStatus("Layered Mode is off.");
      state.layered.compositeCanvas = null;
      if (state.sourceImage) {
        processCurrentImage({ auto: true });
      } else {
        ui.resetResult();
      }
    }
  }

  function getFirstDroppedFile(event) {
    if (!event.dataTransfer || !event.dataTransfer.files || !event.dataTransfer.files.length) {
      return null;
    }

    return event.dataTransfer.files[0];
  }

  function preventDefaultDrag(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  function bindFileInput(elements) {
    elements.fileInput.addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      handleFile(file);
      event.target.value = "";
    });
  }

  function bindDropZone(elements) {
    ["dragenter", "dragover"].forEach(function (eventName) {
      elements.dropZone.addEventListener(eventName, function (event) {
        preventDefaultDrag(event);
        ui.setDropActive(true);
      });
    });

    ["dragleave", "drop"].forEach(function (eventName) {
      elements.dropZone.addEventListener(eventName, function (event) {
        preventDefaultDrag(event);
        ui.setDropActive(false);
      });
    });

    elements.dropZone.addEventListener("drop", function (event) {
      handleFile(getFirstDroppedFile(event));
    });

    elements.dropZone.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        elements.fileInput.click();
      }
    });
  }

  function handleOptionChange() {
    ui.updateSizeControls(state.sourceWidth, state.sourceHeight);
    ui.updatePaletteControls();
    ui.updatePreprocessControls();

    if (state.sourceImage) {
      processCurrentImage({ auto: true });
    }
  }

  function applyPresetSettings(settings, statusMessage) {
    var sanitized = presetManager.sanitizeSettings(settings);

    ui.setSelectedOptions(sanitized);
    updateImportedPalettePreviewFromInput();
    ui.setPresetStatus(statusMessage || "Preset loaded.");
    handleOptionChange();
  }

  function handleSavePreset() {
    var name = ui.getPresetName();
    var result = presetManager.savePreset(name, ui.getSelectedOptions());

    if (!result.valid) {
      ui.showWarning(result.message);
      ui.setPresetStatus(result.message);
      return;
    }

    refreshPresetControls(result.preset.id);
    ui.setPresetStatus("Saved preset: " + result.preset.name);
    ui.hideWarning();
  }

  function handleLoadPreset() {
    var presetId = ui.getSelectedPresetId();
    var preset = presetManager.findPreset(presetId);

    if (!preset) {
      ui.showWarning("Preset could not be found.");
      ui.setPresetStatus("Preset could not be found.");
      return;
    }

    applyPresetSettings(preset.settings, "Loaded preset: " + preset.name);
  }

  function handleDeletePreset() {
    var presetId = ui.getSelectedPresetId();
    var result = presetManager.deletePreset(presetId);

    if (!result.valid) {
      ui.showWarning(result.message);
      ui.setPresetStatus(result.message);
      return;
    }

    refreshPresetControls();
    ui.setPresetStatus("Preset deleted.");
    ui.hideWarning();
  }

  function handleResetPreset() {
    applyPresetSettings(presetManager.getDefaultSettings(), "Restored default settings.");
  }

  function handleExportPresets() {
    ui.setPresetJsonText(presetManager.exportPresets());
    ui.setPresetStatus("Preset JSON exported.");
    ui.hideWarning();
  }

  function handleImportPresets() {
    var result = presetManager.importPresets(ui.getPresetJsonText());

    if (!result.valid) {
      ui.showWarning(result.message);
      ui.setPresetStatus(result.message);
      return;
    }

    refreshPresetControls();
    ui.setPresetStatus("Imported " + result.importedCount + " preset(s).");
    ui.hideWarning();
  }

  function handleCancelProcessing() {
    state.processingRequestId += 1;

    if (state.workerClient && state.workerClient.cancel()) {
      ui.setStatus("변환을 취소했습니다.");
    } else {
      ui.setStatus("현재 취소할 worker 변환이 없습니다.");
    }

    setProcessing(false, "변환을 취소했습니다.", false);
  }

  function updateImportedPalettePreviewFromInput() {
    var options = ui.getSelectedOptions();
    var parsed = fileHandler.parseHexPaletteText(options.importedPaletteText);
    ui.updateImportedPalettePreview(parsed);
    return parsed;
  }

  function handleImportedPaletteApply() {
    var parsed = updateImportedPalettePreviewFromInput();

    if (!parsed.valid) {
      ui.showWarning(parsed.message);
    } else if (!state.sourceImage) {
      ui.hideWarning();
    }

    handleOptionChange();
  }

  async function handleImportedPaletteFile(event) {
    var file = event.target.files && event.target.files[0];

    if (!file) {
      return;
    }

    try {
      var text = await fileHandler.readFileAsText(file);
      ui.setImportedPaletteText(text);
      handleImportedPaletteApply();
    } catch (error) {
      ui.showWarning(error.message || "palette 파일을 읽을 수 없습니다.");
    } finally {
      event.target.value = "";
    }
  }

  function applyPaletteColorEdit(targetHex, actionLabel) {
    var sourceHex = ui.getSelectedPaletteHex();
    var sourceColor = fileHandler.hexToRgb(sourceHex);
    var targetColor = fileHandler.hexToRgb(targetHex);

    if (state.layered.enabled) {
      ui.showWarning("Manual Palette Editor edits are not available in Layered Mode.");
      return false;
    }

    if (!state.resultCanvas) {
      ui.showWarning("먼저 변환 결과를 생성하세요.");
      return false;
    }

    if (!sourceColor) {
      ui.showWarning("편집할 palette swatch를 선택하세요.");
      return false;
    }

    if (!targetColor) {
      ui.showWarning("유효한 HEX 색상을 입력하세요.");
      return false;
    }

    if (sourceColor.hex === targetColor.hex) {
      ui.showWarning("원본 색상과 대상 색상이 같습니다.");
      return false;
    }

    var editableCanvas = state.convertedCanvas || state.resultCanvas;
    var editResult = paletteQuantizer.replaceColorInCanvas(
      editableCanvas,
      sourceColor,
      targetColor
    );

    if (!editResult.replacedPixelCount) {
      if (state.outlineInfo &&
        state.outlineInfo.outlineApplied &&
        state.outlineInfo.outlineColorHex === sourceColor.hex) {
        state.outlineColorOverride = targetColor;
        editResult = {
          canvas: editableCanvas,
          imageData: editableCanvas.getContext("2d", { willReadFrequently: true })
            .getImageData(0, 0, editableCanvas.width, editableCanvas.height),
          replacedPixelCount: state.outlineInfo.outlineAddedPixelCount
        };
      } else {
        ui.showWarning("선택한 색상과 일치하는 visible pixel이 없습니다.");
        return false;
      }
    } else {
      state.convertedCanvas = editResult.canvas;
    }

    var outlineResult = applyOutline(
      state.convertedCanvas || editResult.canvas,
      state.outlineMode,
      state.outlineColorOverride
    );

    state.resultCanvas = outlineResult.canvas;
    state.outlineInfo = outlineResult;
    state.resultPalette = paletteQuantizer.getResultPaletteFromCanvas(state.resultCanvas);
    state.paletteEditCount += 1;
    state.resultHasTransparency = exporter.canvasHasTransparency(state.resultCanvas);

    if (!state.paletteInfo) {
      state.paletteInfo = {
        paletteApplied: false,
        manualEditCount: state.paletteEditCount
      };
    }

    state.paletteInfo.afterColorCount = state.resultPalette.visibleColorCount;
    var finalImageData = state.resultCanvas.getContext("2d", { willReadFrequently: true })
      .getImageData(0, 0, state.resultCanvas.width, state.resultCanvas.height);
    state.paletteInfo.afterRgbaColorCount = paletteQuantizer.countUniqueRgbaColors(finalImageData);
    state.paletteInfo.manualEditCount = state.paletteEditCount;
    state.paletteInfo.outlineMode = outlineResult.outlineMode;
    state.paletteInfo.outlineApplied = outlineResult.outlineApplied;
    state.paletteInfo.outlineAddedPixelCount = outlineResult.outlineAddedPixelCount;
    state.paletteInfo.outlineColorHex = outlineResult.outlineColorHex;
    state.paletteInfo.finalColorCount = state.resultPalette.visibleColorCount;

    ui.showResultPreview(state.resultCanvas);
    ui.updatePaletteEditor(state.resultPalette, {
      selectedHex: targetColor.hex,
      status: actionLabel + ": " + sourceColor.hex + " ->" + targetColor.hex +
        " / " + editResult.replacedPixelCount + " pixels"
    });
    ui.updatePaletteSummary(state.paletteInfo);
    ui.hideWarning();
    ui.setStatus("수동 palette 편집을 최종 canvas에 적용했습니다.");
    return true;
  }

  function handleCopyPaletteHex() {
    var selectedHex = ui.getSelectedPaletteHex();

    if (!selectedHex) {
      ui.showWarning("복사할 palette swatch를 선택하세요.");
      return;
    }

    ui.copyTextToClipboard(selectedHex).then(function () {
      ui.setPaletteEditorStatus(selectedHex + " copied.");
      ui.hideWarning();
    }).catch(function () {
      ui.showWarning("클립보드에 복사할 수 없습니다. HEX 값을 직접 선택해 주세요.");
    });
  }

  function bindPaletteEditor(elements) {
    elements.resultPaletteSwatches.addEventListener("click", function (event) {
      var button = event.target.closest(".result-palette-swatch");

      if (button) {
        ui.selectPaletteSwatch(button.getAttribute("data-hex"));
        ui.setPaletteEditorStatus("");
      }
    });

    elements.copyPaletteHexButton.addEventListener("click", handleCopyPaletteHex);

    elements.replacePaletteColorButton.addEventListener("click", function () {
      applyPaletteColorEdit(ui.getPaletteReplacementHex(), "Replace color");
    });

    elements.mergePaletteColorButton.addEventListener("click", function () {
      var targetHex = ui.getPaletteMergeTargetHex();

      if (!targetHex) {
        ui.showWarning("Merge target 색상을 선택하세요.");
        return;
      }

      applyPaletteColorEdit(targetHex, "Merge color");
    });

    elements.paletteMergeTargetSelect.addEventListener("change", function () {
      ui.updatePaletteMergeActionState();
    });
  }

  function bindOptions(elements) {
    elements.sizeAxisButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        if (button.disabled) {
          return;
        }

        ui.selectSizeOption(button.getAttribute("data-axis"), button.getAttribute("data-value"));
        handleOptionChange();
      });
    });

    [
      elements.outputWidthInput,
      elements.outputHeightInput,
      elements.samplingModeSelect,
      elements.ditheringModeSelect,
      elements.brightnessInput,
      elements.contrastInput,
      elements.saturationInput,
      elements.sharpenModeSelect,
      elements.backgroundCleanupToggle,
      elements.backgroundCleanupColorInput,
      elements.backgroundCleanupToleranceInput,
      elements.outlineModeSelect,
      elements.paletteSourceSelect,
      elements.builtInPaletteSelect,
      elements.outputFormatSelect,
      elements.paletteModeSelect,
      elements.customPaletteCountInput
    ].forEach(function (element) {
      element.addEventListener("change", handleOptionChange);
      element.addEventListener("input", function () {
        ui.updatePaletteControls();
        ui.updatePreprocessControls();
      });
    });

    elements.importedPaletteTextInput.addEventListener("change", handleImportedPaletteApply);
    elements.applyImportedPaletteButton.addEventListener("click", handleImportedPaletteApply);
    elements.importedPaletteFileInput.addEventListener("change", handleImportedPaletteFile);

    elements.previewRefreshButton.addEventListener("click", function () {
      processCurrentImage({ auto: false });
    });

    elements.processingCancelButton.addEventListener("click", handleCancelProcessing);
    elements.layeredModeToggle.addEventListener("change", handleLayeredModeToggle);
    elements.layerFileInput.addEventListener("change", handleLayerFiles);

    if (presetManager) {
      elements.savePresetButton.addEventListener("click", handleSavePreset);
      elements.loadPresetButton.addEventListener("click", handleLoadPreset);
      elements.deletePresetButton.addEventListener("click", handleDeletePreset);
      elements.resetPresetButton.addEventListener("click", handleResetPreset);
      elements.exportPresetsButton.addEventListener("click", handleExportPresets);
      elements.importPresetsButton.addEventListener("click", handleImportPresets);
      elements.presetSelect.addEventListener("change", function () {
        refreshPresetControls(ui.getSelectedPresetId());
      });
    }

    elements.customSizeToggle.addEventListener("change", handleOptionChange);

    elements.resultZoomSelect.addEventListener("change", function () {
      ui.applyResultZoom();
    });

    elements.warningCloseButton.addEventListener("click", function () {
      ui.hideWarning();
    });
  }

  function bindExamples(elements) {
    if (!exampleGallery) {
      return;
    }

    ui.renderExampleGallery(getRenderableExamples(), {
      onSelect: handleExampleSelect
    });
    elements.runExampleQaButton.addEventListener("click", handleExampleQa);
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function handleDownload() {
    if (!state.resultCanvas) {
      return;
    }

    var filename = state.outputFilename || constants.DEFAULT_OUTPUT_FILENAME;
    var blob;

    if (state.layered.enabled && state.outputFormat === "aseprite") {
      var visibleLayers = getVisibleProcessedLayers();
      if (!visibleLayers.length) {
        ui.showWarning("No visible processed layers are available for Aseprite export.");
        return;
      }
      blob = exporter.createAsepriteBlobFromLayers(
        visibleLayers,
        state.resultCanvas.width,
        state.resultCanvas.height
      );
    } else {
      blob = await exporter.exportCanvas(state.resultCanvas, state.outputFormat);
    }
    downloadBlob(blob, filename);
  }

  function bindDownload(elements) {
    elements.downloadButton.addEventListener("click", handleDownload);
  }

  function initApp() {
    var elements = ui.initUI();
    bindFileInput(elements);
    bindDropZone(elements);
    bindOptions(elements);
    bindPaletteEditor(elements);
    bindExamples(elements);
    bindDownload(elements);
    refreshPresetControls();
  }

  document.addEventListener("DOMContentLoaded", initApp);

  window.PixelIconApp = {
    handleFile: handleFile,
    processCurrentImage: processCurrentImage,
    applyPaletteColorEdit: applyPaletteColorEdit,
    applyPresetSettings: applyPresetSettings,
    handleExampleSelect: handleExampleSelect,
    runExampleQa: handleExampleQa,
    getNormalizedOptions: getNormalizedOptions,
    validateCurrentOptions: validateCurrentOptions,
    getState: function () {
      return state;
    }
  };
})();

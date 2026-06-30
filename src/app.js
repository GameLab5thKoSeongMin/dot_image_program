(function () {
  "use strict";

  var constants = window.PixelIconConstants;
  var fileHandler = window.PixelIconFileHandler;
  var imageProcessor = window.PixelIconImageProcessor;
  var paletteQuantizer = window.PixelIconPaletteQuantizer;
  var iconAssistProcessor = window.PixelIconIconAssistProcessor;
  var exporter = window.PixelIconExporter;
  var ui = window.PixelIconUIController;

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
    isProcessing: false
  };

  function setProcessing(isProcessing) {
    state.isProcessing = isProcessing;
    ui.setStatus(isProcessing ? "이미지를 처리하는 중입니다." : "이미지를 기다리는 중입니다.");
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

  function processCurrentImage(runOptions) {
    var executionOptions = runOptions || {};

    if (!state.sourceImage) {
      ui.resetResult();
      return;
    }

    ui.updateSizeControls(state.sourceWidth, state.sourceHeight);
    ui.updatePaletteControls();
    ui.updatePreprocessControls();

    var options = getNormalizedOptions();
    var sizeValidation = validateCurrentOptions(options);

    if (!sizeValidation.valid) {
      resetResultWithWarning(sizeValidation.message, "출력 크기 설정을 확인하세요.");
      return;
    }

    var performanceWarning = fileHandler.getOutputSizePerformanceWarning(
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

    var paletteValidation = fileHandler.validatePaletteOptions(options.paletteMode, options.customPaletteCount);
    var paletteSourceOptions = resolvePaletteSourceOptions(options);

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

    try {
      ui.setStatus("이미지를 변환하는 중입니다.");

      var conversionOptions = {
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
      var result = imageProcessor.convertImageToPixelIcon(state.sourceImage, conversionOptions);
      var paletteResult = paletteQuantizer.applyPaletteLimitToCanvas(result.canvas, {
        paletteMode: paletteValidation.paletteMode,
        customPaletteCount: paletteValidation.customPaletteCount,
        paletteSource: paletteSourceOptions.paletteSource,
        fixedPaletteColors: paletteSourceOptions.fixedPaletteColors,
        ditheringMode: options.ditheringMode
      });
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

      var filename = fileHandler.createOutputFilename(state.currentFile && state.currentFile.name, {
        outputWidth: result.width,
        outputHeight: result.height,
        samplingMode: options.samplingMode,
        outputFormat: options.outputFormat,
        paletteMode: paletteResult.paletteApplied ? "custom" : paletteResult.paletteMode,
        paletteCount: paletteResult.effectivePaletteCount
      });

      updateResultState(result, {
        outputFormat: options.outputFormat,
        samplingMode: options.samplingMode,
        ditheringMode: options.ditheringMode,
        paletteSource: options.paletteSource,
        outlineMode: options.outlineMode
      }, filename, performanceWarning);
    } catch (error) {
      resetResultWithWarning(
        error.message || "이미지 변환 중 오류가 발생했습니다.",
        "변환에 실패했습니다."
      );
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
      setProcessing(true);
      var dataURL = await fileHandler.readFileAsDataURL(file);
      var image = await imageProcessor.loadImageFromDataURL(dataURL);

      state.currentFile = file;
      state.sourceImage = image;
      state.sourceDataURL = dataURL;
      state.sourceWidth = image.naturalWidth || image.width;
      state.sourceHeight = image.naturalHeight || image.height;

      ui.showOriginalPreview(dataURL, state.sourceWidth, state.sourceHeight);
      processCurrentImage({ auto: true });
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
    } finally {
      state.isProcessing = false;
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
      status: actionLabel + ": " + sourceColor.hex + " → " + targetColor.hex +
        " / " + editResult.replacedPixelCount + " pixels"
    });
    ui.updatePaletteSummary(state.paletteInfo);
    ui.hideWarning();
    ui.setStatus("수동 palette 편집이 최종 canvas에 적용되었습니다.");
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

    elements.customSizeToggle.addEventListener("change", handleOptionChange);

    elements.resultZoomSelect.addEventListener("change", function () {
      ui.applyResultZoom();
    });

    elements.warningCloseButton.addEventListener("click", function () {
      ui.hideWarning();
    });
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
    var blob = await exporter.exportCanvas(state.resultCanvas, state.outputFormat);
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
    bindDownload(elements);
  }

  document.addEventListener("DOMContentLoaded", initApp);

  window.PixelIconApp = {
    handleFile: handleFile,
    processCurrentImage: processCurrentImage,
    applyPaletteColorEdit: applyPaletteColorEdit,
    getNormalizedOptions: getNormalizedOptions,
    validateCurrentOptions: validateCurrentOptions,
    getState: function () {
      return state;
    }
  };
})();

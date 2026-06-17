(function () {
  "use strict";

  var constants = window.PixelIconConstants;
  var fileHandler = window.PixelIconFileHandler;
  var imageProcessor = window.PixelIconImageProcessor;
  var paletteQuantizer = window.PixelIconPaletteQuantizer;
  var exporter = window.PixelIconExporter;
  var ui = window.PixelIconUIController;

  var state = {
    currentFile: null,
    sourceImage: null,
    sourceDataURL: "",
    sourceWidth: 0,
    sourceHeight: 0,
    resultCanvas: null,
    resultHasTransparency: false,
    outputFilename: "",
    outputFormat: constants.DEFAULT_OUTPUT_FORMAT,
    samplingMode: constants.DEFAULT_SAMPLING_MODE,
    paletteInfo: null,
    isProcessing: false
  };

  function setProcessing(isProcessing) {
    state.isProcessing = isProcessing;
    ui.setStatus(isProcessing ? "이미지를 처리하는 중입니다." : "이미지를 기다리는 중입니다.");
  }

  function resetForNewInput() {
    state.resultCanvas = null;
    state.resultHasTransparency = false;
    state.outputFilename = "";
    state.paletteInfo = null;
    ui.clearError();
    ui.hideWarning();
    ui.resetResult();
  }

  function resolveAxisSize(axis, selectedOption, customValue) {
    var sourceDimension = axis === "width" ? state.sourceWidth : state.sourceHeight;

    if (selectedOption === "original") {
      if (!sourceDimension) {
        return {
          valid: false,
          message: "이미지를 먼저 업로드해야 Original 크기를 선택할 수 있습니다."
        };
      }

      return {
        valid: true,
        value: sourceDimension
      };
    }

    if (selectedOption === "custom") {
      return {
        valid: true,
        value: customValue
      };
    }

    return {
      valid: true,
      value: selectedOption
    };
  }

  function getNormalizedOptions() {
    var selectedOptions = ui.getSelectedOptions();
    var widthResult = resolveAxisSize("width", selectedOptions.widthOption, selectedOptions.customWidth);
    var heightResult = resolveAxisSize("height", selectedOptions.heightOption, selectedOptions.customHeight);
    var outputFormat = fileHandler.normalizeOutputFormat(selectedOptions.outputFormat);
    var samplingMode = fileHandler.normalizeSamplingMode(selectedOptions.samplingMode);

    return {
      widthOption: selectedOptions.widthOption,
      heightOption: selectedOptions.heightOption,
      outputWidth: widthResult.value,
      outputHeight: heightResult.value,
      widthResolveError: widthResult.valid ? "" : widthResult.message,
      heightResolveError: heightResult.valid ? "" : heightResult.message,
      samplingMode: samplingMode,
      outputFormat: outputFormat,
      paletteMode: fileHandler.normalizePaletteMode(selectedOptions.paletteMode),
      customPaletteCount: selectedOptions.customPaletteCount
    };
  }

  function validateCurrentOptions(options) {
    if (options.widthResolveError) {
      return {
        valid: false,
        message: options.widthResolveError
      };
    }

    if (options.heightResolveError) {
      return {
        valid: false,
        message: options.heightResolveError
      };
    }

    return fileHandler.validateOutputSize(
      options.outputWidth,
      options.outputHeight,
      state.sourceWidth,
      state.sourceHeight
    );
  }

  function buildPaletteText(paletteResult) {
    if (paletteResult.paletteMode === "off") {
      return "off";
    }

    return paletteResult.paletteMode + " (" + paletteResult.effectivePaletteCount + " colors)";
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
      paletteInfo.paletteMode !== "off" &&
      paletteInfo.beforeColorCount > 0 &&
      paletteInfo.effectivePaletteCount >= paletteInfo.beforeColorCount) {
      messages.push("현재 이미지의 실제 색상 수보다 팔레트 제한값이 큽니다. 결과가 거의 변하지 않을 수 있습니다.");
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
    state.resultCanvas = result.canvas;
    state.resultHasTransparency = result.resultHasTransparency;
    state.outputFilename = filename;
    state.outputFormat = options.outputFormat;
    state.samplingMode = options.samplingMode;
    state.paletteInfo = result.paletteInfo || null;

    ui.showResultPreview(result.canvas);
    ui.updateFileInfo({
      outputFilename: filename,
      outputWidth: result.width,
      outputHeight: result.height,
      samplingMode: options.samplingMode,
      outputFormat: options.outputFormat,
      paletteInfo: result.paletteInfo,
      paletteText: result.paletteText
    });
    ui.setDownloadEnabled(true);
    ui.clearError();
    updateResultWarning(options.outputFormat, result.resultHasTransparency, result.paletteInfo, performanceWarning);
    ui.setStatus(result.width + "x" + result.height + " 아이콘 생성이 완료되었습니다.");
  }

  function resetResultWithWarning(message, status) {
    state.resultCanvas = null;
    state.outputFilename = "";
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

    if (!paletteValidation.valid) {
      resetResultWithWarning(paletteValidation.message, "팔레트 색상 수를 확인하세요.");
      return;
    }

    try {
      ui.setStatus("이미지를 변환하는 중입니다.");

      var conversionOptions = {
        outputWidth: sizeValidation.width,
        outputHeight: sizeValidation.height,
        samplingMode: options.samplingMode
      };
      var result = imageProcessor.convertImageToPixelIcon(state.sourceImage, conversionOptions);
      var paletteResult = paletteQuantizer.applyPaletteLimitToCanvas(result.canvas, {
        paletteMode: paletteValidation.paletteMode,
        customPaletteCount: paletteValidation.customPaletteCount
      });
      var paletteText = buildPaletteText(paletteResult);

      result.canvas = paletteResult.canvas;
      result.resultHasTransparency = exporter.canvasHasTransparency(result.canvas);
      result.paletteInfo = {
        paletteMode: paletteResult.paletteMode,
        paletteApplied: paletteResult.paletteApplied,
        effectivePaletteCount: paletteResult.effectivePaletteCount,
        beforeColorCount: paletteResult.beforeColorCount,
        afterColorCount: paletteResult.afterColorCount
      };
      result.paletteText = paletteText;

      var filename = fileHandler.createOutputFilename(state.currentFile && state.currentFile.name, {
        outputWidth: result.width,
        outputHeight: result.height,
        samplingMode: options.samplingMode,
        outputFormat: options.outputFormat,
        paletteMode: paletteResult.paletteMode,
        paletteCount: paletteResult.effectivePaletteCount
      });

      updateResultState(result, {
        outputFormat: options.outputFormat,
        samplingMode: options.samplingMode
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
      state.resultCanvas = null;
      state.outputFilename = "";
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

    if (state.sourceImage) {
      processCurrentImage({ auto: true });
    }
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
      elements.outputFormatSelect,
      elements.paletteModeSelect,
      elements.customPaletteCountInput
    ].forEach(function (element) {
      element.addEventListener("change", handleOptionChange);
      element.addEventListener("input", function () {
        ui.updatePaletteControls();
      });
    });

    elements.convertButton.addEventListener("click", function () {
      processCurrentImage({ auto: false });
    });

    elements.previewRefreshButton.addEventListener("click", function () {
      processCurrentImage({ auto: false });
    });

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
    bindDownload(elements);
  }

  document.addEventListener("DOMContentLoaded", initApp);

  window.PixelIconApp = {
    handleFile: handleFile,
    processCurrentImage: processCurrentImage,
    getNormalizedOptions: getNormalizedOptions,
    validateCurrentOptions: validateCurrentOptions,
    getState: function () {
      return state;
    }
  };
})();

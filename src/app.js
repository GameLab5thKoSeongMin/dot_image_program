(function () {
  "use strict";

  var constants = window.PixelIconConstants;
  var fileHandler = window.PixelIconFileHandler;
  var imageProcessor = window.PixelIconImageProcessor;
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
    ui.clearError();
    ui.hideWarning();
    ui.resetResult();
  }

  function getNormalizedOptions() {
    var selectedOptions = ui.getSelectedOptions();
    var outputFormat = fileHandler.normalizeOutputFormat(selectedOptions.outputFormat);
    var samplingMode = fileHandler.normalizeSamplingMode(selectedOptions.samplingMode);

    return {
      outputWidth: selectedOptions.outputWidth,
      outputHeight: selectedOptions.outputHeight,
      samplingMode: samplingMode,
      outputFormat: outputFormat
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

  function updateResultWarning(outputFormat, resultHasTransparency) {
    if (outputFormat === "jpg" && resultHasTransparency) {
      ui.showWarning("JPG는 투명도를 저장할 수 없어 흰색 배경으로 합성해서 내보냅니다.");
      return;
    }

    ui.hideWarning();
  }

  function updateResultState(result, options, filename) {
    state.resultCanvas = result.canvas;
    state.resultHasTransparency = result.resultHasTransparency;
    state.outputFilename = filename;
    state.outputFormat = options.outputFormat;
    state.samplingMode = options.samplingMode;

    ui.showResultPreview(result.canvas);
    ui.updateFileInfo({
      outputFilename: filename,
      outputWidth: result.width,
      outputHeight: result.height,
      samplingMode: options.samplingMode,
      outputFormat: options.outputFormat
    });
    ui.setDownloadEnabled(true);
    ui.clearError();
    updateResultWarning(options.outputFormat, result.resultHasTransparency);
    ui.setStatus(result.width + "x" + result.height + " 아이콘 생성이 완료되었습니다.");
  }

  function processCurrentImage() {
    if (!state.sourceImage) {
      ui.resetResult();
      return;
    }

    var options = getNormalizedOptions();
    var sizeValidation = validateCurrentOptions(options);

    ui.updatePresetSelection();

    if (!sizeValidation.valid) {
      state.resultCanvas = null;
      state.outputFilename = "";
      ui.resetResult();
      ui.showWarning(sizeValidation.message);
      ui.setStatus("출력 크기 설정을 확인하세요.");
      return;
    }

    var conversionOptions = {
      outputWidth: sizeValidation.width,
      outputHeight: sizeValidation.height,
      samplingMode: options.samplingMode
    };
    var result = imageProcessor.convertImageToPixelIcon(state.sourceImage, conversionOptions);
    var filename = fileHandler.createOutputFilename(state.currentFile && state.currentFile.name, {
      outputWidth: result.width,
      outputHeight: result.height,
      samplingMode: options.samplingMode,
      outputFormat: options.outputFormat
    });

    updateResultState(result, {
      outputFormat: options.outputFormat,
      samplingMode: options.samplingMode
    }, filename);
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
      processCurrentImage();
    } catch (error) {
      state.currentFile = null;
      state.sourceImage = null;
      state.sourceDataURL = "";
      state.sourceWidth = 0;
      state.sourceHeight = 0;
      state.resultCanvas = null;
      state.outputFilename = "";
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

  function bindOptions(elements) {
    elements.presetButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        if (button.disabled) {
          ui.showWarning("원본 이미지보다 큰 preset은 사용할 수 없습니다.");
          return;
        }

        ui.setSelectedSize(button.getAttribute("data-width"), button.getAttribute("data-height"));
        processCurrentImage();
      });
    });

    [
      elements.outputWidthInput,
      elements.outputHeightInput,
      elements.samplingModeSelect,
      elements.outputFormatSelect
    ].forEach(function (element) {
      element.addEventListener("change", processCurrentImage);
      element.addEventListener("input", function () {
        ui.updatePresetSelection();
      });
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
    getState: function () {
      return state;
    }
  };
})();

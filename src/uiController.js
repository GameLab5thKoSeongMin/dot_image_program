(function () {
  "use strict";

  var constants = window.PixelIconConstants;
  var elements = {};

  function requireElement(id) {
    var element = document.getElementById(id);
    if (!element) {
      throw new Error("Missing required element: " + id);
    }
    return element;
  }

  function initUI() {
    elements = {
      fileInput: requireElement("fileInput"),
      dropZone: requireElement("dropZone"),
      originalPreview: requireElement("originalPreview"),
      originalPlaceholder: requireElement("originalPlaceholder"),
      resultPreview: requireElement("resultPreview"),
      resultPlaceholder: requireElement("resultPlaceholder"),
      errorMessage: requireElement("errorMessage"),
      statusMessage: requireElement("statusMessage"),
      sourceSizeLabel: requireElement("sourceSizeLabel"),
      resultMetaLabel: requireElement("resultMetaLabel"),
      outputFilename: requireElement("outputFilename"),
      outputSize: requireElement("outputSize"),
      outputMode: requireElement("outputMode"),
      outputFormatLabel: requireElement("outputFormatLabel"),
      downloadButton: requireElement("downloadButton"),
      outputWidthInput: requireElement("outputWidthInput"),
      outputHeightInput: requireElement("outputHeightInput"),
      samplingModeSelect: requireElement("samplingModeSelect"),
      outputFormatSelect: requireElement("outputFormatSelect"),
      presetButtons: Array.prototype.slice.call(document.querySelectorAll(".preset-button")),
      warningBanner: requireElement("warningBanner"),
      warningMessage: requireElement("warningMessage"),
      warningCloseButton: requireElement("warningCloseButton")
    };

    setDownloadEnabled(false);
    updatePresetSelection();
    hideWarning();
    return elements;
  }

  function getElements() {
    return elements;
  }

  function getSelectedOptions() {
    return {
      outputWidth: elements.outputWidthInput.value,
      outputHeight: elements.outputHeightInput.value,
      samplingMode: elements.samplingModeSelect.value,
      outputFormat: elements.outputFormatSelect.value
    };
  }

  function setSelectedSize(width, height) {
    elements.outputWidthInput.value = width;
    elements.outputHeightInput.value = height;
    updatePresetSelection();
  }

  function updatePresetSelection() {
    var width = Number(elements.outputWidthInput.value);
    var height = Number(elements.outputHeightInput.value);

    elements.presetButtons.forEach(function (button) {
      var presetWidth = Number(button.getAttribute("data-width"));
      var presetHeight = Number(button.getAttribute("data-height"));
      button.classList.toggle("is-selected", presetWidth === width && presetHeight === height);
    });
  }

  function updatePresetAvailability(imageWidth, imageHeight) {
    elements.presetButtons.forEach(function (button) {
      var presetWidth = Number(button.getAttribute("data-width"));
      var presetHeight = Number(button.getAttribute("data-height"));
      var disabled = false;

      if (imageWidth && imageHeight) {
        disabled = presetWidth > imageWidth ||
          presetHeight > imageHeight ||
          presetWidth > constants.MAX_OUTPUT_DIMENSION ||
          presetHeight > constants.MAX_OUTPUT_DIMENSION;
      }

      button.disabled = disabled;
      button.title = disabled ? "원본 이미지보다 큰 preset입니다." : "";
    });
  }

  function updateInputMaximums(imageWidth, imageHeight) {
    var maxWidth = Math.min(imageWidth || constants.MAX_OUTPUT_DIMENSION, constants.MAX_OUTPUT_DIMENSION);
    var maxHeight = Math.min(imageHeight || constants.MAX_OUTPUT_DIMENSION, constants.MAX_OUTPUT_DIMENSION);
    elements.outputWidthInput.max = maxWidth;
    elements.outputHeightInput.max = maxHeight;
  }

  function showOriginalPreview(dataURL, width, height) {
    elements.originalPreview.src = dataURL;
    elements.originalPreview.hidden = false;
    elements.originalPlaceholder.hidden = true;
    elements.sourceSizeLabel.textContent = width && height ? width + "x" + height + " px" : "loaded";
    updatePresetAvailability(width, height);
    updateInputMaximums(width, height);
  }

  function clearOriginalPreview() {
    elements.originalPreview.removeAttribute("src");
    elements.originalPreview.hidden = true;
    elements.originalPlaceholder.hidden = false;
    elements.sourceSizeLabel.textContent = "대기 중";
    updatePresetAvailability(null, null);
    updateInputMaximums(null, null);
  }

  function showResultPreview(canvas) {
    elements.resultPreview.src = canvas.toDataURL("image/png");
    elements.resultPreview.hidden = false;
    elements.resultPlaceholder.hidden = true;
  }

  function clearResultPreview() {
    elements.resultPreview.removeAttribute("src");
    elements.resultPreview.hidden = true;
    elements.resultPlaceholder.hidden = false;
  }

  function showError(message) {
    elements.errorMessage.textContent = message || "";
  }

  function clearError() {
    showError("");
  }

  function showWarning(message) {
    if (!message) {
      hideWarning();
      return;
    }

    elements.warningMessage.textContent = message;
    elements.warningBanner.hidden = false;
  }

  function hideWarning() {
    elements.warningMessage.textContent = "";
    elements.warningBanner.hidden = true;
  }

  function setStatus(message) {
    elements.statusMessage.textContent = message || "";
  }

  function setDownloadEnabled(enabled) {
    elements.downloadButton.disabled = !enabled;
  }

  function setDropActive(active) {
    elements.dropZone.classList.toggle("is-active", !!active);
  }

  function resetResult() {
    clearResultPreview();
    updateFileInfo(null);
    setDownloadEnabled(false);
  }

  function updateFileInfo(fileInfo) {
    if (!fileInfo) {
      elements.outputFilename.textContent = "-";
      elements.outputSize.textContent =
        constants.DEFAULT_OUTPUT_WIDTH + "x" + constants.DEFAULT_OUTPUT_HEIGHT + " px";
      elements.outputMode.textContent = constants.DEFAULT_SAMPLING_MODE;
      elements.outputFormatLabel.textContent = constants.FORMAT_LABELS[constants.DEFAULT_OUTPUT_FORMAT];
      elements.resultMetaLabel.textContent =
        constants.DEFAULT_OUTPUT_WIDTH + "x" + constants.DEFAULT_OUTPUT_HEIGHT +
        " · " + constants.DEFAULT_SAMPLING_MODE + " · " +
        constants.FORMAT_LABELS[constants.DEFAULT_OUTPUT_FORMAT];
      return;
    }

    elements.outputFilename.textContent = fileInfo.outputFilename;
    elements.outputSize.textContent = fileInfo.outputWidth + "x" + fileInfo.outputHeight + " px";
    elements.outputMode.textContent = fileInfo.samplingMode;
    elements.outputFormatLabel.textContent = constants.FORMAT_LABELS[fileInfo.outputFormat];
    elements.resultMetaLabel.textContent =
      fileInfo.outputWidth + "x" + fileInfo.outputHeight +
      " · " + fileInfo.samplingMode + " · " +
      constants.FORMAT_LABELS[fileInfo.outputFormat];
  }

  window.PixelIconUIController = {
    initUI: initUI,
    getElements: getElements,
    getSelectedOptions: getSelectedOptions,
    setSelectedSize: setSelectedSize,
    updatePresetSelection: updatePresetSelection,
    updatePresetAvailability: updatePresetAvailability,
    updateInputMaximums: updateInputMaximums,
    showOriginalPreview: showOriginalPreview,
    clearOriginalPreview: clearOriginalPreview,
    showResultPreview: showResultPreview,
    clearResultPreview: clearResultPreview,
    showError: showError,
    clearError: clearError,
    showWarning: showWarning,
    hideWarning: hideWarning,
    setStatus: setStatus,
    setDownloadEnabled: setDownloadEnabled,
    setDropActive: setDropActive,
    resetResult: resetResult,
    updateFileInfo: updateFileInfo
  };
})();

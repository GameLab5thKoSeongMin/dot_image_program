(function () {
  "use strict";

  var constants = window.PixelIconConstants;
  var elements = {};
  var resultPreviewCanvas = null;

  function requireElement(id) {
    var element = document.getElementById(id);
    if (!element) {
      throw new Error("Missing required element: " + id);
    }
    return element;
  }

  function queryButtons(axis) {
    return Array.prototype.slice.call(document.querySelectorAll(".size-axis-button[data-axis='" + axis + "']"));
  }

  function initUI() {
    elements = {
      fileInput: requireElement("fileInput"),
      dropZone: requireElement("dropZone"),
      originalPreview: requireElement("originalPreview"),
      originalPlaceholder: requireElement("originalPlaceholder"),
      resultPreview: requireElement("resultPreview"),
      resultPlaceholder: requireElement("resultPlaceholder"),
      resultZoomSelect: requireElement("resultZoomSelect"),
      errorMessage: requireElement("errorMessage"),
      statusMessage: requireElement("statusMessage"),
      sourceSizeLabel: requireElement("sourceSizeLabel"),
      resultMetaLabel: requireElement("resultMetaLabel"),
      outputFilename: requireElement("outputFilename"),
      outputSize: requireElement("outputSize"),
      outputMode: requireElement("outputMode"),
      outputFormatLabel: requireElement("outputFormatLabel"),
      outputPalette: requireElement("outputPalette"),
      resultSummary: requireElement("resultSummary"),
      downloadButton: requireElement("downloadButton"),
      convertButton: requireElement("convertButton"),
      outputWidthInput: requireElement("outputWidthInput"),
      outputHeightInput: requireElement("outputHeightInput"),
      customWidthField: requireElement("customWidthField"),
      customHeightField: requireElement("customHeightField"),
      samplingModeSelect: requireElement("samplingModeSelect"),
      outputFormatSelect: requireElement("outputFormatSelect"),
      paletteModeSelect: requireElement("paletteModeSelect"),
      customPaletteCountInput: requireElement("customPaletteCountInput"),
      customPaletteField: requireElement("customPaletteField"),
      paletteSummary: requireElement("paletteSummary"),
      widthAxisButtons: queryButtons("width"),
      heightAxisButtons: queryButtons("height"),
      sizeAxisButtons: Array.prototype.slice.call(document.querySelectorAll(".size-axis-button")),
      warningBanner: requireElement("warningBanner"),
      warningMessage: requireElement("warningMessage"),
      warningCloseButton: requireElement("warningCloseButton")
    };

    installPreviewErrorHandlers();
    setDownloadEnabled(false);
    setConvertEnabled(false);
    updateSizeControls(0, 0);
    updateCustomSizeVisibility();
    updatePaletteControls();
    clearOriginalPreview();
    clearResultPreview();
    updateFileInfo(null);
    hideWarning();
    return elements;
  }

  function installPreviewErrorHandlers() {
    elements.originalPreview.addEventListener("error", function () {
      clearOriginalPreview();
      showWarning("원본 미리보기를 표시할 수 없습니다. 이미지 파일을 다시 확인하세요.");
    });

    elements.resultPreview.addEventListener("error", function () {
      clearResultPreview();
      showWarning("결과 미리보기를 표시할 수 없습니다. 다시 변환해 주세요.");
    });
  }

  function getElements() {
    return elements;
  }

  function getAxisButtonList(axis) {
    return axis === "width" ? elements.widthAxisButtons : elements.heightAxisButtons;
  }

  function getSelectedAxisOption(axis) {
    var buttons = getAxisButtonList(axis);
    var selected = buttons.find(function (button) {
      return button.classList.contains("is-selected");
    });

    if (selected) {
      return selected.getAttribute("data-value");
    }

    return axis === "width" ? constants.DEFAULT_WIDTH_OPTION : constants.DEFAULT_HEIGHT_OPTION;
  }

  function selectSizeOption(axis, value) {
    getAxisButtonList(axis).forEach(function (button) {
      button.classList.toggle("is-selected", button.getAttribute("data-value") === value);
    });
    updateCustomSizeVisibility();
  }

  function selectOptionFromSize(axis, size) {
    var sizeText = String(size);
    var matchingButton = getAxisButtonList(axis).find(function (button) {
      return button.getAttribute("data-value") === sizeText;
    });

    if (matchingButton) {
      selectSizeOption(axis, sizeText);
      return;
    }

    selectSizeOption(axis, "custom");
    if (axis === "width") {
      elements.outputWidthInput.value = size;
    } else {
      elements.outputHeightInput.value = size;
    }
  }

  function getSelectedOptions() {
    return {
      widthOption: getSelectedAxisOption("width"),
      heightOption: getSelectedAxisOption("height"),
      customWidth: elements.outputWidthInput.value,
      customHeight: elements.outputHeightInput.value,
      samplingMode: elements.samplingModeSelect.value,
      outputFormat: elements.outputFormatSelect.value,
      paletteMode: elements.paletteModeSelect.value,
      customPaletteCount: elements.customPaletteCountInput.value
    };
  }

  function setSelectedSize(width, height) {
    selectOptionFromSize("width", width);
    selectOptionFromSize("height", height);
  }

  function updateCustomSizeVisibility() {
    var widthIsCustom = getSelectedAxisOption("width") === "custom";
    var heightIsCustom = getSelectedAxisOption("height") === "custom";

    elements.customWidthField.hidden = !widthIsCustom;
    elements.customHeightField.hidden = !heightIsCustom;
    elements.outputWidthInput.disabled = !widthIsCustom;
    elements.outputHeightInput.disabled = !heightIsCustom;
  }

  function updateAxisAvailability(axis, sourceDimension) {
    var hasSourceDimension = Number.isInteger(sourceDimension) && sourceDimension > 0;

    getAxisButtonList(axis).forEach(function (button) {
      var value = button.getAttribute("data-value");
      var numericValue = Number(value);
      var disabled = false;

      if (value === "original") {
        disabled = !hasSourceDimension;
      } else if (Number.isInteger(numericValue) && hasSourceDimension) {
        disabled = numericValue > sourceDimension;
      }

      button.disabled = disabled;
      if (disabled && value === "original") {
        button.title = "이미지를 먼저 업로드하면 Original을 선택할 수 있습니다.";
      } else if (disabled) {
        button.title = "원본 이미지 크기보다 큰 값입니다.";
      } else {
        button.title = "";
      }
    });
  }

  function updateInputMaximums(imageWidth, imageHeight) {
    if (imageWidth) {
      elements.outputWidthInput.max = imageWidth;
    } else {
      elements.outputWidthInput.removeAttribute("max");
    }

    if (imageHeight) {
      elements.outputHeightInput.max = imageHeight;
    } else {
      elements.outputHeightInput.removeAttribute("max");
    }
  }

  function updateSizeControls(imageWidth, imageHeight) {
    updateAxisAvailability("width", imageWidth);
    updateAxisAvailability("height", imageHeight);
    updateInputMaximums(imageWidth, imageHeight);
    updateCustomSizeVisibility();
  }

  function updatePresetSelection() {
    updateCustomSizeVisibility();
  }

  function updatePresetAvailability(imageWidth, imageHeight) {
    updateSizeControls(imageWidth, imageHeight);
  }

  function updatePaletteControls() {
    var isCustom = elements.paletteModeSelect.value === "custom";
    elements.customPaletteCountInput.disabled = !isCustom;
    elements.customPaletteField.classList.toggle("is-disabled", !isCustom);
  }

  function showOriginalPreview(dataURL, width, height) {
    elements.originalPreview.hidden = true;
    elements.originalPreview.removeAttribute("src");
    elements.originalPreview.src = dataURL;
    elements.originalPreview.hidden = false;
    elements.originalPlaceholder.hidden = true;
    elements.sourceSizeLabel.textContent = width && height ? width + "x" + height + " px" : "loaded";
    updateSizeControls(width, height);
    setConvertEnabled(true);
  }

  function clearOriginalPreview() {
    elements.originalPreview.removeAttribute("src");
    elements.originalPreview.hidden = true;
    elements.originalPlaceholder.hidden = false;
    elements.sourceSizeLabel.textContent = "대기 중";
    updateSizeControls(0, 0);
    setConvertEnabled(false);
  }

  function applyResultZoom() {
    var zoom = elements.resultZoomSelect.value;
    var scale;

    elements.resultPreview.setAttribute("data-zoom", zoom);
    elements.resultPreview.style.removeProperty("width");
    elements.resultPreview.style.removeProperty("height");

    if (!resultPreviewCanvas || zoom === "fit") {
      return;
    }

    scale = zoom === "actual" ? 1 : Number(zoom);
    elements.resultPreview.style.width = Math.max(1, resultPreviewCanvas.width * scale) + "px";
    elements.resultPreview.style.height = Math.max(1, resultPreviewCanvas.height * scale) + "px";
  }

  function showResultPreview(canvas) {
    resultPreviewCanvas = canvas;
    elements.resultPreview.hidden = true;
    elements.resultPreview.removeAttribute("src");
    elements.resultPreview.src = canvas.toDataURL("image/png");
    elements.resultPreview.hidden = false;
    elements.resultPlaceholder.hidden = true;
    applyResultZoom();
  }

  function clearResultPreview() {
    resultPreviewCanvas = null;
    elements.resultPreview.removeAttribute("src");
    elements.resultPreview.hidden = true;
    elements.resultPreview.removeAttribute("data-zoom");
    elements.resultPreview.style.removeProperty("width");
    elements.resultPreview.style.removeProperty("height");
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

  function setConvertEnabled(enabled) {
    elements.convertButton.disabled = !enabled;
  }

  function setDropActive(active) {
    elements.dropZone.classList.toggle("is-active", !!active);
  }

  function resetResult() {
    clearResultPreview();
    updateFileInfo(null);
    setDownloadEnabled(false);
  }

  function createResultSummary(fileInfo) {
    var width = fileInfo ? fileInfo.outputWidth : constants.DEFAULT_OUTPUT_WIDTH;
    var height = fileInfo ? fileInfo.outputHeight : constants.DEFAULT_OUTPUT_HEIGHT;
    var samplingMode = fileInfo ? fileInfo.samplingMode : constants.DEFAULT_SAMPLING_MODE;
    var outputFormat = fileInfo ? fileInfo.outputFormat : constants.DEFAULT_OUTPUT_FORMAT;
    var paletteText = fileInfo && fileInfo.paletteText ? fileInfo.paletteText : "off";

    return width + "x" + height + " / " + samplingMode + " / palette " +
      paletteText + " / " + constants.FORMAT_LABELS[outputFormat];
  }

  function updateFileInfo(fileInfo) {
    var summary = createResultSummary(fileInfo);

    if (!fileInfo) {
      elements.outputFilename.textContent = "-";
      elements.outputSize.textContent =
        constants.DEFAULT_OUTPUT_WIDTH + "x" + constants.DEFAULT_OUTPUT_HEIGHT + " px";
      elements.outputMode.textContent = constants.DEFAULT_SAMPLING_MODE;
      elements.outputFormatLabel.textContent = constants.FORMAT_LABELS[constants.DEFAULT_OUTPUT_FORMAT];
      elements.outputPalette.textContent = "off";
      elements.resultMetaLabel.textContent = summary;
      elements.resultSummary.textContent = summary;
      updatePaletteSummary(null);
      return;
    }

    elements.outputFilename.textContent = fileInfo.outputFilename;
    elements.outputSize.textContent = fileInfo.outputWidth + "x" + fileInfo.outputHeight + " px";
    elements.outputMode.textContent = fileInfo.samplingMode;
    elements.outputFormatLabel.textContent = constants.FORMAT_LABELS[fileInfo.outputFormat];
    elements.outputPalette.textContent = fileInfo.paletteText || "off";
    elements.resultMetaLabel.textContent = summary;
    elements.resultSummary.textContent = summary;
    updatePaletteSummary(fileInfo.paletteInfo);
  }

  function updatePaletteSummary(paletteInfo) {
    if (!paletteInfo || paletteInfo.paletteMode === "off") {
      elements.paletteSummary.textContent = "팔레트 제한: off";
      return;
    }

    var parts = [];
    if (paletteInfo.paletteMode === "auto") {
      parts.push("자동 추천 팔레트: " + paletteInfo.effectivePaletteCount + "색");
    } else {
      parts.push("제한 색상 수: " + paletteInfo.effectivePaletteCount);
    }
    parts.push("현재 색상 수: " + paletteInfo.beforeColorCount);
    parts.push("적용 후 색상 수: " + paletteInfo.afterColorCount);
    elements.paletteSummary.textContent = parts.join(" / ");
  }

  window.PixelIconUIController = {
    initUI: initUI,
    getElements: getElements,
    getSelectedOptions: getSelectedOptions,
    getSelectedAxisOption: getSelectedAxisOption,
    selectSizeOption: selectSizeOption,
    setSelectedSize: setSelectedSize,
    updateCustomSizeVisibility: updateCustomSizeVisibility,
    updateSizeControls: updateSizeControls,
    updatePresetSelection: updatePresetSelection,
    updatePresetAvailability: updatePresetAvailability,
    updateInputMaximums: updateInputMaximums,
    updatePaletteControls: updatePaletteControls,
    updatePaletteSummary: updatePaletteSummary,
    showOriginalPreview: showOriginalPreview,
    clearOriginalPreview: clearOriginalPreview,
    showResultPreview: showResultPreview,
    clearResultPreview: clearResultPreview,
    applyResultZoom: applyResultZoom,
    showError: showError,
    clearError: clearError,
    showWarning: showWarning,
    hideWarning: hideWarning,
    setStatus: setStatus,
    setDownloadEnabled: setDownloadEnabled,
    setConvertEnabled: setConvertEnabled,
    setDropActive: setDropActive,
    resetResult: resetResult,
    updateFileInfo: updateFileInfo
  };
})();

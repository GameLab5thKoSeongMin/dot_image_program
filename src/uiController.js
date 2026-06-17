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
      previewRefreshButton: requireElement("previewRefreshButton"),
      customSizeToggle: requireElement("customSizeToggle"),
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
      widthAxisButtonGroup: requireElement("widthAxisButtons"),
      heightAxisButtonGroup: requireElement("heightAxisButtons"),
      warningBanner: requireElement("warningBanner"),
      warningMessage: requireElement("warningMessage"),
      warningCloseButton: requireElement("warningCloseButton")
    };

    installPreviewErrorHandlers();
    elements.customSizeToggle.checked = constants.DEFAULT_CUSTOM_SIZE_ENABLED;
    elements.outputWidthInput.value = constants.DEFAULT_OUTPUT_WIDTH;
    elements.outputHeightInput.value = constants.DEFAULT_OUTPUT_HEIGHT;
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

    setCustomSizeEnabled(true);
    if (axis === "width") {
      elements.outputWidthInput.value = size;
    } else {
      elements.outputHeightInput.value = size;
    }
  }

  function isCustomSizeEnabled() {
    return !!elements.customSizeToggle.checked;
  }

  function setCustomSizeEnabled(enabled) {
    elements.customSizeToggle.checked = !!enabled;
    updateCustomSizeVisibility();
  }

  function setCustomSizeInputDefaults(width, height) {
    if (Number.isInteger(width) && width > 0) {
      elements.outputWidthInput.value = width;
    } else {
      elements.outputWidthInput.value = constants.DEFAULT_OUTPUT_WIDTH;
    }

    if (Number.isInteger(height) && height > 0) {
      elements.outputHeightInput.value = height;
    } else {
      elements.outputHeightInput.value = constants.DEFAULT_OUTPUT_HEIGHT;
    }
  }

  function getSelectedOptions() {
    return {
      customSizeEnabled: isCustomSizeEnabled(),
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
    var customEnabled = isCustomSizeEnabled();

    elements.widthAxisButtonGroup.hidden = customEnabled;
    elements.heightAxisButtonGroup.hidden = customEnabled;
    elements.customWidthField.hidden = !customEnabled;
    elements.customHeightField.hidden = !customEnabled;
    elements.outputWidthInput.disabled = !customEnabled;
    elements.outputHeightInput.disabled = !customEnabled;
  }

  function updateAxisAvailability(axis, sourceDimension) {
    var hasSourceDimension = Number.isInteger(sourceDimension) && sourceDimension > 0;

    getAxisButtonList(axis).forEach(function (button) {
      var numericValue = Number(button.getAttribute("data-value"));
      var disabled = hasSourceDimension && Number.isInteger(numericValue) && numericValue > sourceDimension;

      button.disabled = disabled;
      button.title = disabled ? "원본 이미지 크기보다 큰 preset입니다." : "";
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
    setCustomSizeInputDefaults(width, height);
    updateSizeControls(width, height);
    setConvertEnabled(true);
  }

  function clearOriginalPreview() {
    elements.originalPreview.removeAttribute("src");
    elements.originalPreview.hidden = true;
    elements.originalPlaceholder.hidden = false;
    elements.sourceSizeLabel.textContent = "대기 중";
    setCustomSizeInputDefaults(0, 0);
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
    elements.previewRefreshButton.disabled = !enabled;
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
      parts.push("자동 추천 팔레트 " + paletteInfo.effectivePaletteCount + "색");
    } else {
      parts.push("제한 색상 수 " + paletteInfo.effectivePaletteCount);
    }
    parts.push("visible RGB " + paletteInfo.beforeColorCount + " -> " + paletteInfo.afterColorCount);

    if (Number.isInteger(paletteInfo.beforeRgbaColorCount) &&
      Number.isInteger(paletteInfo.afterRgbaColorCount)) {
      parts.push("unique RGBA " + paletteInfo.beforeRgbaColorCount + " -> " + paletteInfo.afterRgbaColorCount);
    }

    if (paletteInfo.alphaMode === constants.PALETTE_LIMIT_ALPHA_MODE) {
      parts.push("alpha 0/255");
    }

    elements.paletteSummary.textContent = parts.join(" / ");
  }

  window.PixelIconUIController = {
    initUI: initUI,
    getElements: getElements,
    getSelectedOptions: getSelectedOptions,
    getSelectedAxisOption: getSelectedAxisOption,
    selectSizeOption: selectSizeOption,
    setSelectedSize: setSelectedSize,
    isCustomSizeEnabled: isCustomSizeEnabled,
    setCustomSizeEnabled: setCustomSizeEnabled,
    setCustomSizeInputDefaults: setCustomSizeInputDefaults,
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

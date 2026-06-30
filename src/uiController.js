(function () {
  "use strict";

  var constants = window.PixelIconConstants;
  var elements = {};
  var resultPreviewCanvas = null;
  var resultPaletteData = null;
  var selectedPaletteHex = "";

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
      ditheringModeSelect: requireElement("ditheringModeSelect"),
      preprocessSection: requireElement("preprocessSection"),
      brightnessInput: requireElement("brightnessInput"),
      brightnessValue: requireElement("brightnessValue"),
      contrastInput: requireElement("contrastInput"),
      contrastValue: requireElement("contrastValue"),
      saturationInput: requireElement("saturationInput"),
      saturationValue: requireElement("saturationValue"),
      sharpenModeSelect: requireElement("sharpenModeSelect"),
      backgroundCleanupToggle: requireElement("backgroundCleanupToggle"),
      backgroundCleanupControls: requireElement("backgroundCleanupControls"),
      backgroundCleanupColorInput: requireElement("backgroundCleanupColorInput"),
      backgroundCleanupToleranceInput: requireElement("backgroundCleanupToleranceInput"),
      backgroundCleanupToleranceValue: requireElement("backgroundCleanupToleranceValue"),
      iconAssistSection: requireElement("iconAssistSection"),
      outlineModeSelect: requireElement("outlineModeSelect"),
      paletteSourceSelect: requireElement("paletteSourceSelect"),
      builtInPaletteSelect: requireElement("builtInPaletteSelect"),
      builtInPaletteField: requireElement("builtInPaletteField"),
      importedPaletteField: requireElement("importedPaletteField"),
      importedPaletteTextInput: requireElement("importedPaletteTextInput"),
      importedPaletteFileInput: requireElement("importedPaletteFileInput"),
      applyImportedPaletteButton: requireElement("applyImportedPaletteButton"),
      importedPalettePreview: requireElement("importedPalettePreview"),
      outputFormatSelect: requireElement("outputFormatSelect"),
      paletteModeSelect: requireElement("paletteModeSelect"),
      customPaletteCountInput: requireElement("customPaletteCountInput"),
      customPaletteField: requireElement("customPaletteField"),
      paletteSummary: requireElement("paletteSummary"),
      paletteEditorSection: requireElement("paletteEditorSection"),
      paletteEditorNotice: requireElement("paletteEditorNotice"),
      resultPaletteStats: requireElement("resultPaletteStats"),
      resultPaletteSwatches: requireElement("resultPaletteSwatches"),
      selectedPaletteColor: requireElement("selectedPaletteColor"),
      copyPaletteHexButton: requireElement("copyPaletteHexButton"),
      paletteReplacementInput: requireElement("paletteReplacementInput"),
      replacePaletteColorButton: requireElement("replacePaletteColorButton"),
      paletteMergeTargetSelect: requireElement("paletteMergeTargetSelect"),
      mergePaletteColorButton: requireElement("mergePaletteColorButton"),
      paletteEditorStatus: requireElement("paletteEditorStatus"),
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
    elements.brightnessInput.value = constants.DEFAULT_BRIGHTNESS;
    elements.contrastInput.value = constants.DEFAULT_CONTRAST;
    elements.saturationInput.value = constants.DEFAULT_SATURATION;
    elements.sharpenModeSelect.value = constants.DEFAULT_SHARPEN_MODE;
    elements.backgroundCleanupToggle.checked = constants.DEFAULT_BACKGROUND_CLEANUP_ENABLED;
    elements.backgroundCleanupColorInput.value = constants.DEFAULT_BACKGROUND_CLEANUP_COLOR;
    elements.backgroundCleanupToleranceInput.value = constants.DEFAULT_BACKGROUND_CLEANUP_TOLERANCE;
    elements.outlineModeSelect.value = constants.DEFAULT_OUTLINE_MODE;
    setDownloadEnabled(false);
    setConvertEnabled(false);
    updateSizeControls(0, 0);
    updateCustomSizeVisibility();
    updatePaletteControls();
    updatePreprocessControls();
    updateImportedPalettePreview(null);
    clearOriginalPreview();
    clearResultPreview();
    resetPaletteEditor();
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
      ditheringMode: elements.ditheringModeSelect.value,
      brightness: elements.brightnessInput.value,
      contrast: elements.contrastInput.value,
      saturation: elements.saturationInput.value,
      sharpenMode: elements.sharpenModeSelect.value,
      backgroundCleanupEnabled: elements.backgroundCleanupToggle.checked,
      backgroundCleanupColor: elements.backgroundCleanupColorInput.value,
      backgroundCleanupTolerance: elements.backgroundCleanupToleranceInput.value,
      outlineMode: elements.outlineModeSelect.value,
      paletteSource: elements.paletteSourceSelect.value,
      builtInPaletteId: elements.builtInPaletteSelect.value,
      importedPaletteText: elements.importedPaletteTextInput.value,
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
    var paletteSource = elements.paletteSourceSelect.value;
    var isGenerated = paletteSource === constants.DEFAULT_PALETTE_SOURCE;
    var isBuiltIn = paletteSource === "builtIn";
    var isImported = paletteSource === "imported";
    var isCustom = isGenerated && elements.paletteModeSelect.value === "custom";

    elements.builtInPaletteField.hidden = !isBuiltIn;
    elements.builtInPaletteSelect.disabled = !isBuiltIn;
    elements.importedPaletteField.hidden = !isImported;
    elements.importedPaletteTextInput.disabled = !isImported;
    elements.importedPaletteFileInput.disabled = !isImported;
    elements.applyImportedPaletteButton.disabled = !isImported;
    elements.paletteModeSelect.disabled = !isGenerated;
    elements.customPaletteCountInput.disabled = !isCustom;
    elements.customPaletteField.classList.toggle("is-disabled", !isCustom);
  }

  function updatePreprocessControls() {
    var cleanupEnabled = !!elements.backgroundCleanupToggle.checked;

    elements.brightnessValue.textContent = elements.brightnessInput.value;
    elements.contrastValue.textContent = elements.contrastInput.value;
    elements.saturationValue.textContent = elements.saturationInput.value;
    elements.backgroundCleanupToleranceValue.textContent = elements.backgroundCleanupToleranceInput.value;
    elements.backgroundCleanupColorInput.disabled = !cleanupEnabled;
    elements.backgroundCleanupToleranceInput.disabled = !cleanupEnabled;
    elements.backgroundCleanupControls.classList.toggle("is-disabled", !cleanupEnabled);
  }

  function setImportedPaletteText(text) {
    elements.importedPaletteTextInput.value = text || "";
  }

  function updateImportedPalettePreview(parseResult) {
    elements.importedPalettePreview.textContent = "";

    if (!parseResult || !parseResult.colors || !parseResult.colors.length) {
      elements.importedPalettePreview.textContent = "Imported palette: none";
      return;
    }

    if (!parseResult.valid) {
      elements.importedPalettePreview.textContent = parseResult.message || "Invalid imported palette";
      return;
    }

    parseResult.colors.slice(0, 32).forEach(function (hexColor) {
      var chip = document.createElement("span");
      chip.className = "palette-preview-chip";
      chip.style.backgroundColor = hexColor;
      chip.title = hexColor;
      elements.importedPalettePreview.appendChild(chip);
    });

    var label = document.createElement("span");
    label.textContent = parseResult.colors.length + " colors";
    elements.importedPalettePreview.appendChild(label);
  }

  function setPaletteEditorActionState(enabled) {
    elements.copyPaletteHexButton.disabled = !enabled;
    elements.replacePaletteColorButton.disabled = !enabled;
    elements.paletteMergeTargetSelect.disabled = !enabled;
    elements.mergePaletteColorButton.disabled = !enabled ||
      elements.paletteMergeTargetSelect.options.length <= 1 ||
      !elements.paletteMergeTargetSelect.value;
  }

  function updatePaletteMergeActionState() {
    setPaletteEditorActionState(!!selectedPaletteHex);
  }

  function populatePaletteMergeTargets() {
    elements.paletteMergeTargetSelect.textContent = "";

    var placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select target";
    elements.paletteMergeTargetSelect.appendChild(placeholder);

    if (!resultPaletteData || !resultPaletteData.colors) {
      return;
    }

    resultPaletteData.colors.forEach(function (color) {
      if (color.hex === selectedPaletteHex) {
        return;
      }

      var option = document.createElement("option");
      option.value = color.hex;
      option.textContent = color.hex + " (" + color.count + ")";
      elements.paletteMergeTargetSelect.appendChild(option);
    });
  }

  function selectPaletteSwatch(hexColor) {
    var normalized = String(hexColor || "").toLowerCase();
    var exists = resultPaletteData && resultPaletteData.colors && resultPaletteData.colors.some(function (color) {
      return color.hex === normalized;
    });

    selectedPaletteHex = exists ? normalized : "";

    Array.prototype.slice.call(elements.resultPaletteSwatches.querySelectorAll(".result-palette-swatch")).forEach(function (button) {
      button.classList.toggle("is-selected", button.getAttribute("data-hex") === selectedPaletteHex);
      button.setAttribute("aria-pressed", button.getAttribute("data-hex") === selectedPaletteHex ? "true" : "false");
    });

    elements.selectedPaletteColor.textContent = selectedPaletteHex || "없음";
    populatePaletteMergeTargets();
    setPaletteEditorActionState(!!selectedPaletteHex);
  }

  function updatePaletteEditor(paletteData, options) {
    var safeOptions = options || {};
    var requestedSelection = String(safeOptions.selectedHex || "").toLowerCase();

    resultPaletteData = paletteData || null;
    selectedPaletteHex = "";
    elements.resultPaletteSwatches.textContent = "";
    elements.paletteEditorStatus.textContent = safeOptions.status || "";

    if (!paletteData || !paletteData.colors || !paletteData.colors.length) {
      elements.resultPaletteStats.textContent = paletteData
        ? "사용 색상 0개 / 투명 픽셀 " + paletteData.transparentPixelCount + "개"
        : "결과를 생성하면 palette swatch가 표시됩니다.";
      elements.selectedPaletteColor.textContent = "없음";
      populatePaletteMergeTargets();
      setPaletteEditorActionState(false);
      return;
    }

    elements.resultPaletteStats.textContent =
      "사용 색상 " + paletteData.visibleColorCount + "개 / visible pixel " +
      paletteData.visiblePixelCount + "개 / 투명 픽셀 " + paletteData.transparentPixelCount + "개";

    paletteData.colors.forEach(function (color) {
      var button = document.createElement("button");
      var chip = document.createElement("span");
      var label = document.createElement("span");

      button.className = "result-palette-swatch";
      button.type = "button";
      button.setAttribute("data-hex", color.hex);
      button.setAttribute("aria-pressed", "false");
      button.title = color.hex + " / " + color.count + " pixels / " + color.percentage + "%";

      chip.className = "result-palette-chip";
      chip.style.backgroundColor = color.hex;
      label.className = "result-palette-label";
      label.textContent = color.hex + " · " + color.count + " · " + color.percentage + "%";

      button.appendChild(chip);
      button.appendChild(label);
      elements.resultPaletteSwatches.appendChild(button);
    });

    var initialSelection = paletteData.colors.some(function (color) {
      return color.hex === requestedSelection;
    }) ? requestedSelection : paletteData.colors[0].hex;

    selectPaletteSwatch(initialSelection);
  }

  function resetPaletteEditor() {
    resultPaletteData = null;
    selectedPaletteHex = "";
    elements.resultPaletteStats.textContent = "결과를 생성하면 palette swatch가 표시됩니다.";
    elements.resultPaletteSwatches.textContent = "";
    elements.selectedPaletteColor.textContent = "없음";
    elements.paletteReplacementInput.value = "#000000";
    elements.paletteEditorStatus.textContent = "";
    populatePaletteMergeTargets();
    setPaletteEditorActionState(false);
  }

  function getSelectedPaletteHex() {
    return selectedPaletteHex;
  }

  function getPaletteReplacementHex() {
    return elements.paletteReplacementInput.value;
  }

  function getPaletteMergeTargetHex() {
    return elements.paletteMergeTargetSelect.value;
  }

  function setPaletteEditorStatus(message) {
    elements.paletteEditorStatus.textContent = message || "";
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        if (document.execCommand && document.execCommand("copy")) {
          resolve();
        } else {
          reject(new Error("Clipboard copy failed."));
        }
      } catch (error) {
        reject(error);
      } finally {
        textarea.remove();
      }
    });
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
    resetPaletteEditor();
    updateFileInfo(null);
    setDownloadEnabled(false);
  }

  function createResultSummary(fileInfo) {
    var width = fileInfo ? fileInfo.outputWidth : constants.DEFAULT_OUTPUT_WIDTH;
    var height = fileInfo ? fileInfo.outputHeight : constants.DEFAULT_OUTPUT_HEIGHT;
    var samplingMode = fileInfo ? fileInfo.samplingMode : constants.DEFAULT_SAMPLING_MODE;
    var outputFormat = fileInfo ? fileInfo.outputFormat : constants.DEFAULT_OUTPUT_FORMAT;
    var paletteText = fileInfo && fileInfo.paletteText ? fileInfo.paletteText : "off";
    var ditheringMode = fileInfo && fileInfo.ditheringMode ? fileInfo.ditheringMode : constants.DEFAULT_DITHERING_MODE;
    var ditheringText = ditheringMode === constants.DEFAULT_DITHERING_MODE ? "" : " / dither " + ditheringMode;
    var preprocessText = fileInfo && fileInfo.preprocessApplied ? " / preprocess" : "";
    var outlineMode = fileInfo && fileInfo.outlineMode ? fileInfo.outlineMode : constants.DEFAULT_OUTLINE_MODE;
    var outlineText = outlineMode === constants.DEFAULT_OUTLINE_MODE ? "" : " / outline " + outlineMode;

    return width + "x" + height + " / " + samplingMode + preprocessText + ditheringText + " / palette " +
      paletteText + outlineText + " / " + constants.FORMAT_LABELS[outputFormat];
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
    if (!paletteInfo || !paletteInfo.paletteApplied) {
      var offParts = ["팔레트 제한: off"];
      if (paletteInfo && paletteInfo.outlineApplied) {
        offParts.push("outline " + paletteInfo.outlineMode + " +" + paletteInfo.outlineAddedPixelCount + "px");
      }
      if (paletteInfo && paletteInfo.manualEditCount) {
        offParts.push("manual edits " + paletteInfo.manualEditCount);
      }
      elements.paletteSummary.textContent = offParts.join(" / ");
      return;
    }

    var parts = [];
    if (paletteInfo.fixedPaletteApplied) {
      parts.push((paletteInfo.paletteSourceLabel || "fixed palette") + " " + paletteInfo.effectivePaletteCount + "색");
    } else if (paletteInfo.paletteMode === "auto") {
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

    if (paletteInfo.ditheringApplied) {
      parts.push("dither " + paletteInfo.ditheringMode);
    }

    if (paletteInfo.manualEditCount) {
      parts.push("manual edits " + paletteInfo.manualEditCount);
    }

    if (paletteInfo.outlineApplied) {
      parts.push("outline " + paletteInfo.outlineMode + " +" + paletteInfo.outlineAddedPixelCount + "px");
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
    updatePreprocessControls: updatePreprocessControls,
    setImportedPaletteText: setImportedPaletteText,
    updateImportedPalettePreview: updateImportedPalettePreview,
    updatePaletteEditor: updatePaletteEditor,
    resetPaletteEditor: resetPaletteEditor,
    selectPaletteSwatch: selectPaletteSwatch,
    getSelectedPaletteHex: getSelectedPaletteHex,
    getPaletteReplacementHex: getPaletteReplacementHex,
    getPaletteMergeTargetHex: getPaletteMergeTargetHex,
    updatePaletteMergeActionState: updatePaletteMergeActionState,
    setPaletteEditorStatus: setPaletteEditorStatus,
    copyTextToClipboard: copyTextToClipboard,
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

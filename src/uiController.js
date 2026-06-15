(function () {
  "use strict";

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
      outputFilename: requireElement("outputFilename"),
      outputSize: requireElement("outputSize"),
      downloadButton: requireElement("downloadButton")
    };

    setDownloadEnabled(false);
    return elements;
  }

  function getElements() {
    return elements;
  }

  function showOriginalPreview(dataURL, width, height) {
    elements.originalPreview.src = dataURL;
    elements.originalPreview.hidden = false;
    elements.originalPlaceholder.hidden = true;
    elements.sourceSizeLabel.textContent = width && height ? width + "x" + height + " px" : "loaded";
  }

  function clearOriginalPreview() {
    elements.originalPreview.removeAttribute("src");
    elements.originalPreview.hidden = true;
    elements.originalPlaceholder.hidden = false;
    elements.sourceSizeLabel.textContent = "대기 중";
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
      elements.outputSize.textContent = "32x32 px";
      return;
    }

    elements.outputFilename.textContent = fileInfo.outputFilename;
    elements.outputSize.textContent = fileInfo.outputWidth + "x" + fileInfo.outputHeight + " px";
  }

  window.PixelIconUIController = {
    initUI: initUI,
    getElements: getElements,
    showOriginalPreview: showOriginalPreview,
    clearOriginalPreview: clearOriginalPreview,
    showResultPreview: showResultPreview,
    clearResultPreview: clearResultPreview,
    showError: showError,
    clearError: clearError,
    setStatus: setStatus,
    setDownloadEnabled: setDownloadEnabled,
    setDropActive: setDropActive,
    resetResult: resetResult,
    updateFileInfo: updateFileInfo
  };
})();

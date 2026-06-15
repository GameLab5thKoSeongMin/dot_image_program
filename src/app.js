(function () {
  "use strict";

  var fileHandler = window.PixelIconFileHandler;
  var imageProcessor = window.PixelIconImageProcessor;
  var ui = window.PixelIconUIController;

  var state = {
    resultCanvas: null,
    outputFilename: "",
    isProcessing: false
  };

  function setProcessing(isProcessing) {
    state.isProcessing = isProcessing;
    ui.setStatus(isProcessing ? "이미지를 처리하는 중입니다." : "이미지를 기다리는 중입니다.");
  }

  function resetForNewInput() {
    state.resultCanvas = null;
    state.outputFilename = "";
    ui.clearError();
    ui.resetResult();
  }

  async function handleFile(file) {
    if (state.isProcessing) {
      return;
    }

    resetForNewInput();

    var validation = fileHandler.validateImageFile(file);
    if (!validation.valid) {
      ui.clearOriginalPreview();
      ui.showError(validation.message);
      ui.setStatus("입력 파일을 다시 확인하세요.");
      return;
    }

    try {
      setProcessing(true);
      var dataURL = await fileHandler.readFileAsDataURL(file);
      var image = await imageProcessor.loadImageFromDataURL(dataURL);
      var result = imageProcessor.convertImageToPixelIcon(image);
      var outputFilename = fileHandler.createOutputFilename(file.name);

      state.resultCanvas = result.canvas;
      state.outputFilename = outputFilename;

      ui.showOriginalPreview(dataURL, result.sourceWidth, result.sourceHeight);
      ui.showResultPreview(result.canvas);
      ui.updateFileInfo({
        outputFilename: outputFilename,
        outputWidth: result.width,
        outputHeight: result.height
      });
      ui.setDownloadEnabled(true);
      ui.clearError();
      ui.setStatus("32x32 아이콘 생성이 완료되었습니다.");
    } catch (error) {
      state.resultCanvas = null;
      state.outputFilename = "";
      ui.resetResult();
      ui.showError(error.message || "이미지 처리 중 오류가 발생했습니다.");
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

  function downloadWithDataURL(canvas, filename) {
    var link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function handleDownload() {
    if (!state.resultCanvas) {
      return;
    }

    var filename = state.outputFilename || window.PixelIconConstants.DEFAULT_OUTPUT_FILENAME;

    if (!state.resultCanvas.toBlob) {
      downloadWithDataURL(state.resultCanvas, filename);
      return;
    }

    state.resultCanvas.toBlob(function (blob) {
      if (!blob) {
        downloadWithDataURL(state.resultCanvas, filename);
        return;
      }

      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  function bindDownload(elements) {
    elements.downloadButton.addEventListener("click", handleDownload);
  }

  function initApp() {
    var elements = ui.initUI();
    bindFileInput(elements);
    bindDropZone(elements);
    bindDownload(elements);
  }

  document.addEventListener("DOMContentLoaded", initApp);

  window.PixelIconApp = {
    handleFile: handleFile
  };
})();

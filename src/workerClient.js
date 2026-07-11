(function () {
  "use strict";

  var nextRequestId = 1;
  var workerClientScriptUrl = findWorkerClientScriptUrl();

  function findWorkerClientScriptUrl() {
    var currentScript = document.currentScript && document.currentScript.src;
    var scripts;

    if (currentScript) {
      return currentScript;
    }

    scripts = document.getElementsByTagName("script");
    for (var index = scripts.length - 1; index >= 0; index -= 1) {
      if (/workerClient\.js(?:\?.*)?$/.test(scripts[index].src || "")) {
        return scripts[index].src;
      }
    }

    return "";
  }

  function createFallbackError(message) {
    var error = new Error(message || "Worker conversion is not available.");
    error.fallback = true;
    return error;
  }

  function createCanceledError() {
    var error = new Error("Conversion canceled.");
    error.canceled = true;
    return error;
  }

  function resolveWorkerUrl() {
    var scriptUrl = workerClientScriptUrl || findWorkerClientScriptUrl();

    if (scriptUrl) {
      return scriptUrl.replace(/workerClient\.js(?:\?.*)?$/, "conversionWorker.js");
    }

    return "./src/conversionWorker.js";
  }

  function WorkerClient(options) {
    var safeOptions = options || {};
    this.forceFallback = !!safeOptions.forceFallback;
    this.workerUrl = safeOptions.workerUrl || resolveWorkerUrl();
    this.currentWorker = null;
    this.currentReject = null;
    this.currentRequestId = null;
  }

  WorkerClient.prototype.isSupported = function () {
    return !this.forceFallback && typeof Worker !== "undefined";
  };

  WorkerClient.prototype.createWorker = function () {
    if (!this.isSupported()) {
      throw createFallbackError("Worker conversion is disabled or unsupported.");
    }

    return new Worker(this.workerUrl);
  };

  WorkerClient.prototype.process = function (sourceImageData, options, callbacks) {
    var self = this;
    var safeCallbacks = callbacks || {};
    var requestId = nextRequestId;
    var worker;

    nextRequestId += 1;

    try {
      worker = this.createWorker();
    } catch (error) {
      if (safeCallbacks.onFallback) {
        safeCallbacks.onFallback(error.message);
      }
      return Promise.reject(createFallbackError(error.message));
    }

    this.currentWorker = worker;
    this.currentRequestId = requestId;

    return new Promise(function (resolve, reject) {
      self.currentReject = reject;

      worker.onmessage = function (event) {
        var message = event.data || {};

        if (message.requestId !== requestId) {
          return;
        }

        if (message.type === "stage") {
          if (safeCallbacks.onStage) {
            safeCallbacks.onStage(message.stage);
          }
          return;
        }

        self.disposeWorker();

        if (message.type === "complete") {
          resolve(message.result);
          return;
        }

        reject(new Error(message.message || "Worker conversion failed."));
      };

      worker.onerror = function (event) {
        var message = event && event.message ? event.message : "Worker conversion failed.";
        self.disposeWorker();
        reject(new Error(message));
      };

      worker.postMessage({
        type: "process",
        requestId: requestId,
        sourceImageData: sourceImageData,
        options: options || {}
      });
    });
  };

  WorkerClient.prototype.cancel = function () {
    if (!this.currentWorker) {
      return false;
    }

    if (this.currentReject) {
      this.currentReject(createCanceledError());
    }

    this.disposeWorker();
    return true;
  };

  WorkerClient.prototype.disposeWorker = function () {
    if (this.currentWorker) {
      this.currentWorker.terminate();
    }

    this.currentWorker = null;
    this.currentReject = null;
    this.currentRequestId = null;
  };

  window.PixelIconWorkerClient = WorkerClient;
})();

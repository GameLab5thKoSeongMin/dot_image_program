(function () {
  "use strict";

  var constants = window.PixelIconConstants;

  function dataURLToBlob(dataURL) {
    var parts = dataURL.split(",");
    var header = parts[0];
    var binary = atob(parts[1]);
    var mimeMatch = header.match(/data:([^;]+);/);
    var mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    var bytes = new Uint8Array(binary.length);

    for (var index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return new Blob([bytes], { type: mimeType });
  }

  function canvasToBlob(canvas, mimeType, quality) {
    return new Promise(function (resolve) {
      if (!canvas.toBlob) {
        resolve(dataURLToBlob(canvas.toDataURL(mimeType, quality)));
        return;
      }

      canvas.toBlob(function (blob) {
        if (blob) {
          resolve(blob);
        } else {
          resolve(dataURLToBlob(canvas.toDataURL(mimeType, quality)));
        }
      }, mimeType, quality);
    });
  }

  function createWhiteBackgroundCanvas(canvas) {
    var outputCanvas = document.createElement("canvas");
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;

    var context = outputCanvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
    context.drawImage(canvas, 0, 0);

    return outputCanvas;
  }

  function canvasHasTransparency(canvas) {
    var context = canvas.getContext("2d", { willReadFrequently: true });
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;

    for (var index = 3; index < data.length; index += 4) {
      if (data[index] < 255) {
        return true;
      }
    }

    return false;
  }

  function BinaryWriter() {
    this.bytes = [];
  }

  BinaryWriter.prototype.writeU8 = function (value) {
    this.bytes.push(value & 0xff);
  };

  BinaryWriter.prototype.writeU16 = function (value) {
    this.bytes.push(value & 0xff, (value >> 8) & 0xff);
  };

  BinaryWriter.prototype.writeI16 = function (value) {
    this.writeU16(value < 0 ? 0x10000 + value : value);
  };

  BinaryWriter.prototype.writeU32 = function (value) {
    this.bytes.push(
      value & 0xff,
      (value >> 8) & 0xff,
      (value >> 16) & 0xff,
      (value >> 24) & 0xff
    );
  };

  BinaryWriter.prototype.writeBytes = function (bytes) {
    for (var index = 0; index < bytes.length; index += 1) {
      this.writeU8(bytes[index]);
    }
  };

  BinaryWriter.prototype.writeZeros = function (count) {
    for (var index = 0; index < count; index += 1) {
      this.writeU8(0);
    }
  };

  BinaryWriter.prototype.writeString = function (value) {
    var encoded = new TextEncoder().encode(value);
    this.writeU16(encoded.length);
    this.writeBytes(encoded);
  };

  BinaryWriter.prototype.toUint8Array = function () {
    return new Uint8Array(this.bytes);
  };

  BinaryWriter.prototype.getLength = function () {
    return this.bytes.length;
  };

  function createChunk(type, dataWriter) {
    var writer = new BinaryWriter();
    var data = dataWriter.toUint8Array();
    writer.writeU32(6 + data.length);
    writer.writeU16(type);
    writer.writeBytes(data);
    return writer.toUint8Array();
  }

  function createLayerChunk() {
    var data = new BinaryWriter();
    data.writeU16(1 | 2);
    data.writeU16(0);
    data.writeU16(0);
    data.writeU16(0);
    data.writeU16(0);
    data.writeU16(0);
    data.writeU8(255);
    data.writeZeros(3);
    data.writeString("Generated");
    return createChunk(constants.ASEPRITE_LAYER_CHUNK_TYPE, data);
  }

  function createCelChunk(canvas) {
    var context = canvas.getContext("2d", { willReadFrequently: true });
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var data = new BinaryWriter();

    data.writeU16(0);
    data.writeI16(0);
    data.writeI16(0);
    data.writeU8(255);
    data.writeU16(0);
    data.writeI16(0);
    data.writeZeros(5);
    data.writeU16(canvas.width);
    data.writeU16(canvas.height);
    data.writeBytes(imageData.data);

    return createChunk(constants.ASEPRITE_CEL_CHUNK_TYPE, data);
  }

  function createAsepriteArrayBuffer(canvas) {
    var layerChunk = createLayerChunk();
    var celChunk = createCelChunk(canvas);
    var frameBytes = 16 + layerChunk.length + celChunk.length;
    var fileBytes = 128 + frameBytes;
    var writer = new BinaryWriter();

    writer.writeU32(fileBytes);
    writer.writeU16(constants.ASEPRITE_MAGIC);
    writer.writeU16(1);
    writer.writeU16(canvas.width);
    writer.writeU16(canvas.height);
    writer.writeU16(32);
    writer.writeU32(1);
    writer.writeU16(100);
    writer.writeU32(0);
    writer.writeU32(0);
    writer.writeU8(0);
    writer.writeZeros(3);
    writer.writeU16(0);
    writer.writeU8(1);
    writer.writeU8(1);
    writer.writeI16(0);
    writer.writeI16(0);
    writer.writeU16(0);
    writer.writeU16(0);
    writer.writeZeros(84);

    writer.writeU32(frameBytes);
    writer.writeU16(constants.ASEPRITE_FRAME_MAGIC);
    writer.writeU16(2);
    writer.writeU16(100);
    writer.writeZeros(2);
    writer.writeU32(2);
    writer.writeBytes(layerChunk);
    writer.writeBytes(celChunk);

    return writer.toUint8Array().buffer;
  }

  function createAsepriteBlob(canvas) {
    return new Blob([createAsepriteArrayBuffer(canvas)], {
      type: constants.FORMAT_MIME_TYPES.aseprite
    });
  }

  function readU16(view, offset) {
    return view.getUint16(offset, true);
  }

  function readU32(view, offset) {
    return view.getUint32(offset, true);
  }

  function inspectAsepriteArrayBuffer(arrayBuffer) {
    var view = new DataView(arrayBuffer);

    return {
      fileSize: readU32(view, 0),
      magic: readU16(view, 4),
      frames: readU16(view, 6),
      width: readU16(view, 8),
      height: readU16(view, 10),
      colorDepth: readU16(view, 12),
      frameMagic: readU16(view, 128 + 4)
    };
  }

  function exportCanvas(canvas, outputFormat) {
    if (outputFormat === "jpg") {
      return canvasToBlob(
        createWhiteBackgroundCanvas(canvas),
        constants.FORMAT_MIME_TYPES.jpg,
        0.92
      );
    }

    if (outputFormat === "aseprite") {
      return Promise.resolve(createAsepriteBlob(canvas));
    }

    return canvasToBlob(canvas, constants.FORMAT_MIME_TYPES.png);
  }

  window.PixelIconExporter = {
    exportCanvas: exportCanvas,
    canvasHasTransparency: canvasHasTransparency,
    createWhiteBackgroundCanvas: createWhiteBackgroundCanvas,
    createAsepriteArrayBuffer: createAsepriteArrayBuffer,
    createAsepriteBlob: createAsepriteBlob,
    inspectAsepriteArrayBuffer: inspectAsepriteArrayBuffer
  };
})();

(function () {
  "use strict";

  var EXAMPLES = [
    {
      id: "skill-badge-32",
      title: "스킬 배지 32",
      description: "작은 UI 스킬용 투명 배지 예제입니다.",
      fileName: "example_skill_badge.png",
      expectedWidth: 32,
      expectedHeight: 32,
      settings: {
        customSizeEnabled: false,
        widthOption: "32",
        heightOption: "32",
        samplingMode: "median",
        paletteSource: "generated",
        paletteMode: "auto",
        ditheringMode: "off",
        outlineMode: "dark",
        outputFormat: "png"
      }
    },
    {
      id: "item-gem-64",
      title: "아이템 보석 64",
      description: "아이템 아이콘용 고대비 투명 오브젝트 예제입니다.",
      fileName: "example_item_gem.png",
      expectedWidth: 64,
      expectedHeight: 64,
      settings: {
        customSizeEnabled: false,
        widthOption: "64",
        heightOption: "64",
        samplingMode: "dominant",
        paletteSource: "generated",
        paletteMode: "32",
        ditheringMode: "bayer4x4",
        outlineMode: "black",
        outputFormat: "png"
      }
    },
    {
      id: "portrait-base-64",
      title: "인물 기본형 64",
      description: "인물 샘플링과 배경 정리 확인용 얼굴 블록 예제입니다.",
      fileName: "example_portrait_base.png",
      expectedWidth: 64,
      expectedHeight: 64,
      settings: {
        customSizeEnabled: false,
        widthOption: "64",
        heightOption: "64",
        samplingMode: "average",
        brightness: 4,
        contrast: 6,
        saturation: 8,
        sharpenMode: "low",
        paletteSource: "generated",
        paletteMode: "32",
        ditheringMode: "off",
        outlineMode: "dark",
        outputFormat: "png"
      }
    },
    {
      id: "cleanup-sprite-32",
      title: "배경 정리 스프라이트 32",
      description: "배경 제거와 외곽선 확인용 흰색 배경 예제입니다.",
      fileName: "example_cleanup_sprite.png",
      expectedWidth: 32,
      expectedHeight: 32,
      settings: {
        customSizeEnabled: false,
        widthOption: "32",
        heightOption: "32",
        samplingMode: "center",
        backgroundCleanupEnabled: true,
        backgroundCleanupColor: "#ffffff",
        backgroundCleanupTolerance: 8,
        paletteSource: "generated",
        paletteMode: "16",
        ditheringMode: "off",
        outlineMode: "black",
        outputFormat: "png"
      }
    }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createCanvas(width, height) {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  function drawDiamond(context, cx, cy, radius, colors) {
    var gradient = context.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.55, colors[1]);
    gradient.addColorStop(1, colors[2]);

    context.fillStyle = gradient;
    context.beginPath();
    context.moveTo(cx, cy - radius);
    context.lineTo(cx + radius, cy);
    context.lineTo(cx, cy + radius);
    context.lineTo(cx - radius, cy);
    context.closePath();
    context.fill();
  }

  function createSkillBadgeCanvas() {
    var canvas = createCanvas(64, 64);
    var context = canvas.getContext("2d");

    context.clearRect(0, 0, 64, 64);
    context.fillStyle = "#2f7d56";
    context.beginPath();
    context.moveTo(32, 5);
    context.lineTo(53, 16);
    context.lineTo(48, 48);
    context.lineTo(32, 59);
    context.lineTo(16, 48);
    context.lineTo(11, 16);
    context.closePath();
    context.fill();
    context.fillStyle = "#eaf6ed";
    context.fillRect(25, 18, 14, 29);
    context.fillRect(18, 29, 28, 8);
    context.fillStyle = "#173a2a";
    context.fillRect(29, 22, 6, 21);
    return canvas;
  }

  function createItemGemCanvas() {
    var canvas = createCanvas(96, 96);
    var context = canvas.getContext("2d");

    context.clearRect(0, 0, 96, 96);
    context.fillStyle = "rgba(0,0,0,0.18)";
    context.beginPath();
    context.ellipse(48, 75, 25, 8, 0, 0, Math.PI * 2);
    context.fill();
    drawDiamond(context, 48, 42, 31, ["#dbf7ff", "#37a7d8", "#1f4f92"]);
    context.fillStyle = "rgba(255,255,255,0.75)";
    context.beginPath();
    context.moveTo(48, 11);
    context.lineTo(61, 40);
    context.lineTo(48, 42);
    context.lineTo(35, 40);
    context.closePath();
    context.fill();
    return canvas;
  }

  function createPortraitCanvas() {
    var canvas = createCanvas(128, 128);
    var context = canvas.getContext("2d");

    context.fillStyle = "#dce8ef";
    context.fillRect(0, 0, 128, 128);
    context.fillStyle = "#73513c";
    context.fillRect(36, 18, 56, 30);
    context.fillStyle = "#d89f74";
    context.fillRect(42, 34, 44, 52);
    context.fillStyle = "#b77b54";
    context.fillRect(35, 46, 9, 24);
    context.fillRect(84, 46, 9, 24);
    context.fillStyle = "#1f2730";
    context.fillRect(51, 55, 8, 5);
    context.fillRect(69, 55, 8, 5);
    context.fillStyle = "#9b493d";
    context.fillRect(58, 74, 14, 5);
    context.fillStyle = "#394b63";
    context.fillRect(28, 88, 72, 40);
    return canvas;
  }

  function createCleanupSpriteCanvas() {
    var canvas = createCanvas(80, 80);
    var context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 80, 80);
    context.fillStyle = "#f2d04f";
    context.fillRect(24, 19, 32, 34);
    context.fillStyle = "#a85c20";
    context.fillRect(18, 47, 44, 14);
    context.fillStyle = "#344a65";
    context.fillRect(31, 29, 6, 6);
    context.fillRect(44, 29, 6, 6);
    context.fillStyle = "#d95745";
    context.fillRect(35, 42, 10, 4);
    return canvas;
  }

  function getExampleById(id) {
    return EXAMPLES.find(function (example) {
      return example.id === id;
    }) || null;
  }

  function createExampleCanvas(id) {
    if (id === "skill-badge-32") {
      return createSkillBadgeCanvas();
    }
    if (id === "item-gem-64") {
      return createItemGemCanvas();
    }
    if (id === "portrait-base-64") {
      return createPortraitCanvas();
    }
    if (id === "cleanup-sprite-32") {
      return createCleanupSpriteCanvas();
    }
    return null;
  }

  function createExampleDataURL(id) {
    var canvas = createExampleCanvas(id);
    return canvas ? canvas.toDataURL("image/png") : "";
  }

  function getExamples() {
    return EXAMPLES.map(function (example) {
      return clone(example);
    });
  }

  function getConversionOptionsFromSettings(settings, width, height) {
    return {
      outputWidth: width,
      outputHeight: height,
      samplingMode: settings.samplingMode || "median",
      preprocess: {
        brightness: settings.brightness || 0,
        contrast: settings.contrast || 0,
        saturation: settings.saturation || 0,
        sharpenMode: settings.sharpenMode || "off",
        backgroundCleanupEnabled: !!settings.backgroundCleanupEnabled,
        backgroundCleanupColor: { r: 255, g: 255, b: 255 },
        backgroundCleanupTolerance: settings.backgroundCleanupTolerance || 0
      }
    };
  }

  async function runQa(dependencies) {
    var deps = dependencies || {};
    var processor = deps.imageProcessor;
    var fileHandler = deps.fileHandler;
    var results = [];

    if (!processor || !fileHandler) {
      throw new Error("예제 품질 검사에 필요한 기능을 찾을 수 없습니다.");
    }

    for (var index = 0; index < EXAMPLES.length; index += 1) {
      var example = EXAMPLES[index];
      var canvas = createExampleCanvas(example.id);
      var image = await processor.loadImageFromDataURL(canvas.toDataURL("image/png"));
      var settings = example.settings;
      var width = Number(settings.customSizeEnabled ? settings.customWidth : settings.widthOption);
      var height = Number(settings.customSizeEnabled ? settings.customHeight : settings.heightOption);
      var sizeValidation = fileHandler.validateOutputSize(width, height, canvas.width, canvas.height);
      var conversion;

      if (!sizeValidation.valid) {
        throw new Error(example.title + " 크기 검증 실패: " + sizeValidation.message);
      }

      conversion = processor.convertImageToPixelIcon(
        image,
        getConversionOptionsFromSettings(settings, sizeValidation.width, sizeValidation.height)
      );

      if (conversion.width !== example.expectedWidth || conversion.height !== example.expectedHeight) {
        throw new Error(example.title + " output size mismatch.");
      }

      results.push({
        id: example.id,
        title: example.title,
        width: conversion.width,
        height: conversion.height
      });
    }

    return results;
  }

  window.PixelIconExampleGallery = {
    getExamples: getExamples,
    getExampleById: getExampleById,
    createExampleCanvas: createExampleCanvas,
    createExampleDataURL: createExampleDataURL,
    runQa: runQa
  };
})();

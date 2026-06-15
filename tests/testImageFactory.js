(function () {
  "use strict";

  function createCanvas(width, height) {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  function fillCanvas(canvas, color) {
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  function createSolidColorImage() {
    var canvas = createCanvas(96, 96);
    fillCanvas(canvas, "rgb(210, 72, 68)");
    return canvas;
  }

  function createSmallImage() {
    var canvas = createCanvas(17, 17);
    var context = canvas.getContext("2d");
    context.fillStyle = "rgb(40, 120, 210)";
    context.fillRect(0, 0, 17, 17);
    context.fillStyle = "rgb(240, 220, 80)";
    context.fillRect(8, 8, 9, 9);
    return canvas;
  }

  function createLeftRightSplitImage() {
    var canvas = createCanvas(128, 96);
    var context = canvas.getContext("2d");
    context.fillStyle = "rgb(230, 70, 70)";
    context.fillRect(0, 0, 64, 96);
    context.fillStyle = "rgb(65, 150, 85)";
    context.fillRect(64, 0, 64, 96);
    return canvas;
  }

  function createTopBottomSplitImage() {
    var canvas = createCanvas(96, 128);
    var context = canvas.getContext("2d");
    context.fillStyle = "rgb(60, 105, 210)";
    context.fillRect(0, 0, 96, 64);
    context.fillStyle = "rgb(235, 190, 70)";
    context.fillRect(0, 64, 96, 64);
    return canvas;
  }

  function createTransparentShapeImage() {
    var canvas = createCanvas(128, 128);
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, 128, 128);
    context.fillStyle = "rgba(30, 120, 210, 1)";
    context.beginPath();
    context.arc(64, 64, 42, 0, Math.PI * 2);
    context.fill();
    return canvas;
  }

  function createFullyTransparentImage() {
    var canvas = createCanvas(64, 64);
    canvas.getContext("2d").clearRect(0, 0, 64, 64);
    return canvas;
  }

  function createLowAlphaImage() {
    var canvas = createCanvas(96, 96);
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, 96, 96);
    context.fillStyle = "rgba(200, 40, 80, 0.04)";
    context.fillRect(0, 0, 96, 96);
    context.fillStyle = "rgba(30, 160, 100, 0.9)";
    context.fillRect(28, 28, 40, 40);
    return canvas;
  }

  function createWideImage() {
    var canvas = createCanvas(320, 40);
    var context = canvas.getContext("2d");
    var gradient = context.createLinearGradient(0, 0, 320, 0);
    gradient.addColorStop(0, "rgb(40, 80, 200)");
    gradient.addColorStop(1, "rgb(230, 210, 70)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 320, 40);
    return canvas;
  }

  function createTallImage() {
    var canvas = createCanvas(40, 320);
    var context = canvas.getContext("2d");
    var gradient = context.createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0, "rgb(70, 170, 120)");
    gradient.addColorStop(1, "rgb(220, 80, 120)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 40, 320);
    return canvas;
  }

  function createLargeImage() {
    var canvas = createCanvas(1920, 1080);
    var context = canvas.getContext("2d");
    var gradient = context.createLinearGradient(0, 0, 1920, 1080);
    gradient.addColorStop(0, "rgb(38, 88, 170)");
    gradient.addColorStop(0.5, "rgb(76, 150, 92)");
    gradient.addColorStop(1, "rgb(226, 196, 76)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1920, 1080);
    return canvas;
  }

  function createTestImages() {
    return [
      {
        name: "Solid color 96x96",
        description: "Solid color image larger than 32x32.",
        canvas: createSolidColorImage()
      },
      {
        name: "Small 17x17",
        description: "Image smaller than 32x32.",
        canvas: createSmallImage()
      },
      {
        name: "Left/right split",
        description: "Image split into two clear vertical color regions.",
        canvas: createLeftRightSplitImage()
      },
      {
        name: "Top/bottom split",
        description: "Image split into two clear horizontal color regions.",
        canvas: createTopBottomSplitImage()
      },
      {
        name: "Transparent shape",
        description: "Transparent PNG-like canvas with an opaque circle.",
        canvas: createTransparentShapeImage()
      },
      {
        name: "Fully transparent",
        description: "All pixels are transparent.",
        canvas: createFullyTransparentImage()
      },
      {
        name: "Low alpha plus opaque",
        description: "Low-alpha area plus a visible opaque square.",
        canvas: createLowAlphaImage()
      },
      {
        name: "Very wide 320x40",
        description: "Extreme wide aspect ratio.",
        canvas: createWideImage()
      },
      {
        name: "Very tall 40x320",
        description: "Extreme tall aspect ratio.",
        canvas: createTallImage()
      },
      {
        name: "Large 1920x1080",
        description: "Large image conversion case.",
        canvas: createLargeImage()
      }
    ];
  }

  window.PixelIconTestImageFactory = {
    createCanvas: createCanvas,
    createSolidColorImage: createSolidColorImage,
    createSmallImage: createSmallImage,
    createLeftRightSplitImage: createLeftRightSplitImage,
    createTopBottomSplitImage: createTopBottomSplitImage,
    createTransparentShapeImage: createTransparentShapeImage,
    createFullyTransparentImage: createFullyTransparentImage,
    createLowAlphaImage: createLowAlphaImage,
    createWideImage: createWideImage,
    createTallImage: createTallImage,
    createLargeImage: createLargeImage,
    createTestImages: createTestImages
  };
})();

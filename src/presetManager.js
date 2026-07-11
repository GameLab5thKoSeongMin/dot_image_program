(function () {
  "use strict";

  var constants = window.PixelIconConstants;
  var fileHandler = window.PixelIconFileHandler;
  var STORAGE_KEY = "pixelIconGenerator.presets.v1";
  var SCHEMA_VERSION = 1;

  function createId() {
    return "preset-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function isSizePreset(value) {
    return constants.SIZE_PRESET_VALUES.map(String).indexOf(String(value)) !== -1;
  }

  function normalizeInteger(value, fallback, minimum, maximum) {
    var numeric = Number(value);

    if (!Number.isFinite(numeric)) {
      return fallback;
    }

    numeric = Math.round(numeric);
    if (minimum && numeric < minimum) {
      return minimum;
    }
    if (maximum && numeric > maximum) {
      return maximum;
    }
    return numeric;
  }

  function normalizeHex(value, fallback) {
    var text = String(value || "").trim();

    if (/^#[0-9a-fA-F]{6}$/.test(text)) {
      return text.toLowerCase();
    }

    return fallback;
  }

  function getDefaultSettings() {
    return {
      customSizeEnabled: constants.DEFAULT_CUSTOM_SIZE_ENABLED,
      widthOption: constants.DEFAULT_WIDTH_OPTION,
      heightOption: constants.DEFAULT_HEIGHT_OPTION,
      customWidth: constants.DEFAULT_OUTPUT_WIDTH,
      customHeight: constants.DEFAULT_OUTPUT_HEIGHT,
      samplingMode: constants.DEFAULT_SAMPLING_MODE,
      ditheringMode: constants.DEFAULT_DITHERING_MODE,
      brightness: constants.DEFAULT_BRIGHTNESS,
      contrast: constants.DEFAULT_CONTRAST,
      saturation: constants.DEFAULT_SATURATION,
      sharpenMode: constants.DEFAULT_SHARPEN_MODE,
      backgroundCleanupEnabled: constants.DEFAULT_BACKGROUND_CLEANUP_ENABLED,
      backgroundCleanupColor: constants.DEFAULT_BACKGROUND_CLEANUP_COLOR,
      backgroundCleanupTolerance: constants.DEFAULT_BACKGROUND_CLEANUP_TOLERANCE,
      outlineMode: constants.DEFAULT_OUTLINE_MODE,
      paletteSource: constants.DEFAULT_PALETTE_SOURCE,
      builtInPaletteId: constants.DEFAULT_BUILT_IN_PALETTE_ID,
      importedPaletteText: "",
      outputFormat: constants.DEFAULT_OUTPUT_FORMAT,
      paletteMode: constants.DEFAULT_PALETTE_MODE,
      customPaletteCount: 16
    };
  }

  function sanitizeSettings(settings) {
    var source = settings || {};
    var defaults = getDefaultSettings();
    var customWidth = normalizeInteger(source.customWidth, defaults.customWidth, 1);
    var customHeight = normalizeInteger(source.customHeight, defaults.customHeight, 1);
    var paletteMode = fileHandler.normalizePaletteMode(source.paletteMode);
    var paletteSource = fileHandler.normalizePaletteSource(source.paletteSource);
    var customPaletteCount = normalizeInteger(
      source.customPaletteCount,
      defaults.customPaletteCount,
      constants.MIN_PALETTE_COLORS,
      constants.MAX_PALETTE_COLORS
    );

    return {
      customSizeEnabled: !!source.customSizeEnabled,
      widthOption: isSizePreset(source.widthOption) ? String(source.widthOption) : defaults.widthOption,
      heightOption: isSizePreset(source.heightOption) ? String(source.heightOption) : defaults.heightOption,
      customWidth: customWidth,
      customHeight: customHeight,
      samplingMode: fileHandler.normalizeSamplingMode(source.samplingMode),
      ditheringMode: fileHandler.normalizeDitheringMode(source.ditheringMode),
      brightness: fileHandler.normalizePreprocessAdjustment(source.brightness, defaults.brightness),
      contrast: fileHandler.normalizePreprocessAdjustment(source.contrast, defaults.contrast),
      saturation: fileHandler.normalizePreprocessAdjustment(source.saturation, defaults.saturation),
      sharpenMode: fileHandler.normalizeSharpenMode(source.sharpenMode),
      backgroundCleanupEnabled: !!source.backgroundCleanupEnabled,
      backgroundCleanupColor: normalizeHex(source.backgroundCleanupColor, defaults.backgroundCleanupColor),
      backgroundCleanupTolerance: fileHandler.normalizeBackgroundCleanupTolerance(source.backgroundCleanupTolerance),
      outlineMode: fileHandler.normalizeOutlineMode(source.outlineMode),
      paletteSource: paletteSource,
      builtInPaletteId: fileHandler.normalizeBuiltInPaletteId(source.builtInPaletteId),
      importedPaletteText: paletteSource === "imported" ? String(source.importedPaletteText || "") : "",
      outputFormat: fileHandler.normalizeOutputFormat(source.outputFormat),
      paletteMode: paletteMode,
      customPaletteCount: customPaletteCount
    };
  }

  function createPreset(name, settings, options) {
    var safeOptions = options || {};

    return {
      id: safeOptions.id || createId(),
      name: String(name || "Untitled preset").trim().slice(0, 80) || "Untitled preset",
      builtIn: !!safeOptions.builtIn,
      createdAt: safeOptions.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schemaVersion: SCHEMA_VERSION,
      settings: sanitizeSettings(settings)
    };
  }

  function getBuiltInPresets() {
    return [
      createPreset("Skill Icon 32", {
        customSizeEnabled: false,
        widthOption: "32",
        heightOption: "32",
        samplingMode: "median",
        paletteSource: "generated",
        paletteMode: "auto",
        ditheringMode: "off",
        outlineMode: "off",
        outputFormat: "png"
      }, { id: "builtin-skill-icon-32", builtIn: true, createdAt: "2026-07-01T00:00:00.000Z" }),
      createPreset("Item Icon 64", {
        customSizeEnabled: false,
        widthOption: "64",
        heightOption: "64",
        samplingMode: "dominant",
        paletteSource: "generated",
        paletteMode: "32",
        ditheringMode: "bayer4x4",
        outlineMode: "black",
        outputFormat: "png"
      }, { id: "builtin-item-icon-64", builtIn: true, createdAt: "2026-07-01T00:00:00.000Z" }),
      createPreset("Portrait Base 64", {
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
      }, { id: "builtin-portrait-base-64", builtIn: true, createdAt: "2026-07-01T00:00:00.000Z" }),
      createPreset("Palette Cleanup Original", {
        customSizeEnabled: true,
        customWidth: 32,
        customHeight: 32,
        samplingMode: "median",
        paletteSource: "generated",
        paletteMode: "16",
        ditheringMode: "off",
        backgroundCleanupEnabled: true,
        backgroundCleanupColor: "#ffffff",
        backgroundCleanupTolerance: 12,
        outlineMode: "off",
        outputFormat: "png"
      }, { id: "builtin-palette-cleanup", builtIn: true, createdAt: "2026-07-01T00:00:00.000Z" })
    ];
  }

  function readUserPresets() {
    var raw;
    var parsed;

    try {
      raw = window.localStorage && window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return [];
    }

    if (!raw) {
      return [];
    }

    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      return [];
    }

    return normalizePresetList(parsed.presets || parsed, { includeBuiltIns: false });
  }

  function writeUserPresets(presets) {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
          schemaVersion: SCHEMA_VERSION,
          presets: presets
        }, null, 2));
      }
    } catch (error) {
      return false;
    }

    return true;
  }

  function normalizePresetList(input, options) {
    var safeOptions = options || {};
    var sourceList = Array.isArray(input) ? input : [];
    var seen = {};

    return sourceList.reduce(function (list, item) {
      var source = item || {};
      var settings = source.settings || source;
      var preset = createPreset(source.name || "Imported preset", settings, {
        id: String(source.id || createId()),
        builtIn: !!source.builtIn && !!safeOptions.includeBuiltIns,
        createdAt: source.createdAt
      });

      if (seen[preset.id]) {
        preset.id = createId();
      }
      seen[preset.id] = true;

      if (!preset.builtIn || safeOptions.includeBuiltIns) {
        list.push(preset);
      }
      return list;
    }, []);
  }

  function getAllPresets() {
    return getBuiltInPresets().concat(readUserPresets());
  }

  function findPreset(id) {
    return getAllPresets().find(function (preset) {
      return preset.id === id;
    }) || null;
  }

  function savePreset(name, settings) {
    var presets = readUserPresets();
    var preset = createPreset(name, settings);

    presets.push(preset);
    if (!writeUserPresets(presets)) {
      return {
        valid: false,
        message: "Preset storage is unavailable."
      };
    }

    return {
      valid: true,
      preset: preset,
      presets: getAllPresets()
    };
  }

  function deletePreset(id) {
    var presets = readUserPresets();
    var nextPresets = presets.filter(function (preset) {
      return preset.id !== id;
    });

    if (nextPresets.length === presets.length) {
      return {
        valid: false,
        message: "Built-in presets cannot be deleted."
      };
    }

    writeUserPresets(nextPresets);
    return {
      valid: true,
      presets: getAllPresets()
    };
  }

  function exportPresets() {
    return JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      presets: readUserPresets().map(function (preset) {
        return {
          id: preset.id,
          name: preset.name,
          schemaVersion: preset.schemaVersion,
          settings: preset.settings
        };
      })
    }, null, 2);
  }

  function importPresets(jsonText) {
    var parsed;
    var imported;
    var existing;
    var merged;

    try {
      parsed = JSON.parse(String(jsonText || ""));
    } catch (error) {
      return {
        valid: false,
        message: "Preset JSON is invalid."
      };
    }

    imported = normalizePresetList(parsed.presets || parsed, { includeBuiltIns: false });
    if (!imported.length) {
      return {
        valid: false,
        message: "Preset JSON does not contain valid presets."
      };
    }

    existing = readUserPresets();
    merged = existing.concat(imported.map(function (preset) {
      preset.id = createId();
      preset.builtIn = false;
      preset.updatedAt = new Date().toISOString();
      return preset;
    }));
    writeUserPresets(merged);

    return {
      valid: true,
      importedCount: imported.length,
      presets: getAllPresets()
    };
  }

  window.PixelIconPresetManager = {
    STORAGE_KEY: STORAGE_KEY,
    getDefaultSettings: getDefaultSettings,
    sanitizeSettings: sanitizeSettings,
    createPreset: createPreset,
    getBuiltInPresets: getBuiltInPresets,
    getAllPresets: getAllPresets,
    findPreset: findPreset,
    savePreset: savePreset,
    deletePreset: deletePreset,
    exportPresets: exportPresets,
    importPresets: importPresets,
    normalizePresetList: normalizePresetList,
    clearUserPresets: function () {
      try {
        if (window.localStorage) {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        return false;
      }
      return true;
    },
    clone: clone
  };
})();

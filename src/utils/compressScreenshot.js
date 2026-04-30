const KB = 1024;
const DEFAULT_MIN_KB = 100;
const DEFAULT_MAX_KB = 150;
const DEFAULT_TARGET_TYPE = 'image/jpeg';
const DEFAULT_MAX_WIDTH = 1600;
const DEFAULT_MAX_HEIGHT = 1600;
const MIN_QUALITY = 0.42;
const MAX_QUALITY = 0.92;
const MIN_SCALE = 0.55;
const SCALE_STEP = 0.08;

const loadImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();

  reader.onload = () => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The screenshot image could not be opened.'));
    image.src = typeof reader.result === 'string' ? reader.result : '';
  };

  reader.onerror = () => reject(new Error('The screenshot file could not be read.'));
  reader.readAsDataURL(file);
});

const canvasToBlob = (canvas, type, quality) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (!blob) {
      reject(new Error('The screenshot could not be compressed.'));
      return;
    }

    resolve(blob);
  }, type, quality);
});

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const normalizeDimensions = (image, maxWidth, maxHeight) => {
  const ratio = Math.min(maxWidth / image.width, maxHeight / image.height, 1);

  return {
    width: Math.max(1, Math.round(image.width * ratio)),
    height: Math.max(1, Math.round(image.height * ratio)),
  };
};

const drawImageToCanvas = (context, canvas, image) => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
};

const renameToJpeg = (fileName = 'screenshot.jpg') => {
  const trimmed = fileName.trim() || 'screenshot';
  const withoutExtension = trimmed.replace(/\.[a-z0-9]+$/i, '');
  return `${withoutExtension}.jpg`;
};

export const compressScreenshot = async (file, options = {}) => {
  const {
    minKB = DEFAULT_MIN_KB,
    maxKB = DEFAULT_MAX_KB,
    targetType = DEFAULT_TARGET_TYPE,
    maxWidth = DEFAULT_MAX_WIDTH,
    maxHeight = DEFAULT_MAX_HEIGHT,
  } = options;

  if (!file) {
    return file;
  }

  if (!file.type?.startsWith('image/')) {
    throw new Error('Please choose a valid screenshot image.');
  }

  const maxBytes = maxKB * KB;
  const midpointBytes = ((minKB + maxKB) / 2) * KB;

  if (file.size <= maxBytes && file.size >= minKB * KB) {
    return file;
  }

  const image = await loadImage(file);
  const dimensions = normalizeDimensions(image, maxWidth, maxHeight);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('The browser could not prepare the screenshot for compression.');
  }

  let bestBlob = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let scale = 1; scale >= MIN_SCALE; scale -= SCALE_STEP) {
    canvas.width = Math.max(1, Math.round(dimensions.width * scale));
    canvas.height = Math.max(1, Math.round(dimensions.height * scale));
    drawImageToCanvas(context, canvas, image);

    let low = MIN_QUALITY;
    let high = MAX_QUALITY;

    for (let iteration = 0; iteration < 7; iteration += 1) {
      const quality = clamp((low + high) / 2, MIN_QUALITY, MAX_QUALITY);
      const blob = await canvasToBlob(canvas, targetType, quality);
      const size = blob.size;
      const score = Math.abs(size - midpointBytes);

      if (score < bestScore) {
        bestScore = score;
        bestBlob = blob;
      }

      if (size >= minKB * KB && size <= maxBytes) {
        return new File([blob], renameToJpeg(file.name), {
          type: targetType,
          lastModified: Date.now(),
        });
      }

      if (size > maxBytes) {
        high = quality - 0.04;
      } else {
        low = quality + 0.04;
      }
    }
  }

  if (!bestBlob) {
    throw new Error('The screenshot could not be compressed.');
  }

  return new File([bestBlob], renameToJpeg(file.name), {
    type: targetType,
    lastModified: Date.now(),
  });
};

export default compressScreenshot;

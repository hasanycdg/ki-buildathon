import imageKnowledge from "./data/imageKnowledge.json";

// Fingerabdruck: Bild erst grob vorskalieren, dann in JS per Flaechenmittel auf 8x8
// bzw. 9x8 rechnen. Das macht den Hash unabhaengig davon, wie der Browser skaliert.
const FINGERPRINT_EDGE = 512;
const FINGERPRINT_TOLERANCE = 12; // von 128 Bit
const MAX_FILE_BYTES = 12 * 1024 * 1024;

const fallbackAnswer = {
  de: {
    answer: "Ich kann das Bild nicht sicher zuordnen. Bei Schäden gilt immer: nicht selbst reparieren. Mach ein Foto und frag deine Vorgesetzte.",
    steps: [
      "Foto vom Schaden machen",
      "Hausdame Anna Berger fragen oder Rezeption intern 100 anrufen",
      "Bei Gefahr oder Wasser: sofort intern 100"
    ],
    linkLabel: "Schaden melden"
  },
  en: {
    answer: "I cannot identify this picture for sure. For any damage the rule is: do not repair it yourself. Take a photo and ask your supervisor.",
    steps: [
      "Take a photo of the damage",
      "Ask housekeeper Anna Berger or call reception on internal 100",
      "If there is danger or water: call internal 100 right away"
    ],
    linkLabel: "Report damage"
  },
  tr: {
    answer: "Bu görseli kesin olarak tanıyamadım. Hasarlarda kural şu: kendin tamir etme. Fotoğraf çek ve amirine sor.",
    steps: [
      "Hasarın fotoğrafını çek",
      "Kat şefi Anna Berger'e sor veya resepsiyonu dahili 100'den ara",
      "Tehlike veya su varsa: hemen dahili 100'ü ara"
    ],
    linkLabel: "Hasar bildir"
  }
};

export function isSupportedImage(file) {
  return Boolean(file) && file.type.startsWith("image/") && file.size <= MAX_FILE_BYTES;
}

export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      name: file.name,
      type: file.type,
      size: file.size,
      dataUrl: reader.result
    });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Bild konnte nicht gelesen werden"));
    image.src = dataUrl;
  });
}

function drawScaled(image, maxEdge) {
  const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function toGrayscale(canvas) {
  const { width, height } = canvas;
  const { data } = canvas.getContext("2d").getImageData(0, 0, width, height);
  const gray = new Float64Array(width * height);
  for (let index = 0; index < gray.length; index++) {
    const offset = index * 4;
    gray[index] = 0.299 * data[offset] + 0.587 * data[offset + 1] + 0.114 * data[offset + 2];
  }
  return { width, height, gray };
}

function boxResize(source, targetWidth, targetHeight) {
  const gray = new Float64Array(targetWidth * targetHeight);
  for (let ty = 0; ty < targetHeight; ty++) {
    for (let tx = 0; tx < targetWidth; tx++) {
      const x0 = Math.floor((tx * source.width) / targetWidth);
      const x1 = Math.max(x0 + 1, Math.floor(((tx + 1) * source.width) / targetWidth));
      const y0 = Math.floor((ty * source.height) / targetHeight);
      const y1 = Math.max(y0 + 1, Math.floor(((ty + 1) * source.height) / targetHeight));
      let sum = 0;
      let count = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          sum += source.gray[y * source.width + x];
          count++;
        }
      }
      gray[ty * targetWidth + tx] = sum / count;
    }
  }
  return { width: targetWidth, height: targetHeight, gray };
}

function bitsToHex(bits) {
  let hex = "";
  for (let index = 0; index < bits.length; index += 4) {
    hex += ((bits[index] << 3) | (bits[index + 1] << 2) | (bits[index + 2] << 1) | bits[index + 3]).toString(16);
  }
  return hex;
}

function averageHash(tile) {
  const mean = tile.gray.reduce((sum, value) => sum + value, 0) / tile.gray.length;
  return bitsToHex(Array.from(tile.gray, (value) => (value > mean ? 1 : 0)));
}

function differenceHash(tile) {
  const bits = [];
  for (let y = 0; y < tile.height; y++) {
    for (let x = 0; x < tile.width - 1; x++) {
      bits.push(tile.gray[y * tile.width + x] > tile.gray[y * tile.width + x + 1] ? 1 : 0);
    }
  }
  return bitsToHex(bits);
}

export async function computeImageFingerprint(dataUrl) {
  const image = await loadImage(dataUrl);
  const source = toGrayscale(drawScaled(image, FINGERPRINT_EDGE));
  return averageHash(boxResize(source, 8, 8)) + differenceHash(boxResize(source, 9, 8));
}

export function hammingDistance(left, right) {
  if (left.length !== right.length) return Number.MAX_SAFE_INTEGER;
  let distance = 0;
  for (let index = 0; index < left.length; index++) {
    let diff = parseInt(left[index], 16) ^ parseInt(right[index], 16);
    while (diff) {
      distance += diff & 1;
      diff >>= 1;
    }
  }
  return distance;
}

export function matchKnownImage({ fingerprint, fileName = "", question = "" }) {
  const haystack = `${fileName} ${question}`.toLowerCase();

  let best = null;
  imageKnowledge.forEach((entry) => {
    const distance = Math.min(...entry.fingerprints.map((known) => hammingDistance(fingerprint, known)));
    if (distance <= FINGERPRINT_TOLERANCE && (!best || distance < best.distance)) {
      best = { entry, distance, reason: "fingerprint" };
    }
  });
  if (best) return best;

  const byText = imageKnowledge.find((entry) => [...entry.fileNameKeywords, ...entry.questionKeywords]
    .some((keyword) => haystack.includes(keyword.toLowerCase())));

  return byText ? { entry: byText, distance: null, reason: "keyword" } : null;
}

export async function analyzeImage({ dataUrl, fileName, language = "de", question = "" }) {
  let fingerprint = "";
  try {
    fingerprint = await computeImageFingerprint(dataUrl);
  } catch (error) {
    console.warn("Fingerabdruck fehlgeschlagen", error);
  }

  const match = fingerprint ? matchKnownImage({ fingerprint, fileName, question }) : null;
  if (match) {
    const localized = match.entry[language] ?? match.entry.de;
    return { ...localized, source: "catalog", matchedBy: match.reason };
  }

  return { ...(fallbackAnswer[language] ?? fallbackAnswer.de), source: "fallback" };
}

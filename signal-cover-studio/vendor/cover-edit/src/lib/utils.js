export function deepClone(value) {
  return structuredClone(value);
}

export function percentFrame(canvas, box) {
  return {
    x: Math.round(canvas.width * box.x),
    y: Math.round(canvas.height * box.y),
    width: Math.round(canvas.width * box.width),
    height: Math.round(canvas.height * box.height)
  };
}

export function insetFrame(frame, inset) {
  return {
    x: frame.x + inset.left,
    y: frame.y + inset.top,
    width: frame.width - inset.left - inset.right,
    height: frame.height - inset.top - inset.bottom
  };
}

export function lineClamp(text, maxChars) {
  if (!text) return '';
  return text.length > maxChars ? `${text.slice(0, maxChars - 1)}…` : text;
}

export function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'target';
}

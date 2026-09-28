// PDF Rendering Service for Project Documents & Brochures
// Utilizes PDF.js with automatic CDN loading, high-DPI canvas rendering, and caching

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

const PDFJS_CDN_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER_CDN_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfJsLoadingPromise: Promise<any> | null = null;
const thumbnailCache = new Map<string, string>();
const docPageCountCache = new Map<string, number>();

/**
 * Ensures PDF.js library is loaded and configured with worker
 */
export async function ensurePdfJs(): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('PDF.js can only run in browser environment');
  }

  if (window.pdfjsLib) {
    if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN_URL;
    }
    return window.pdfjsLib;
  }

  if (pdfJsLoadingPromise) {
    return pdfJsLoadingPromise;
  }

  pdfJsLoadingPromise = new Promise((resolve, reject) => {
    // Check if script element is already in DOM
    const existingScript = document.querySelector(`script[src="${PDFJS_CDN_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN_URL;
          resolve(window.pdfjsLib);
        } else {
          reject(new Error('PDF.js failed to initialize on window object'));
        }
      });
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.src = PDFJS_CDN_URL;
    script.async = true;
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN_URL;
        resolve(window.pdfjsLib);
      } else {
        reject(new Error('PDF.js loaded but window.pdfjsLib is undefined'));
      }
    };
    script.onerror = () => {
      pdfJsLoadingPromise = null;
      reject(new Error('Failed to load PDF.js from CDN'));
    };
    document.head.appendChild(script);
  });

  return pdfJsLoadingPromise;
}

/**
 * Load PDF Document by URL
 */
export async function loadPdfDocument(url: string): Promise<any> {
  const pdfjs = await ensurePdfJs();
  const loadingTask = pdfjs.getDocument({
    url,
    withCredentials: false,
    cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
    cMapPacked: true
  });
  const pdfDoc = await loadingTask.promise;
  docPageCountCache.set(url, pdfDoc.numPages);
  return pdfDoc;
}

/**
 * Renders a PDF page onto an HTML5 Canvas with High-DPI sharpness
 */
export async function renderPdfPage(
  page: any,
  canvas: HTMLCanvasElement,
  scale: number = 1.0,
  rotation: number = 0
): Promise<{ width: number; height: number }> {
  const effectiveRotation = (page.rotate + rotation) % 360;
  const viewport = page.getViewport({ scale, rotation: effectiveRotation });
  
  // High-DPI support (retina screens)
  const pixelRatio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(viewport.width * pixelRatio);
  canvas.height = Math.floor(viewport.height * pixelRatio);
  canvas.style.width = `${Math.floor(viewport.width)}px`;
  canvas.style.height = `${Math.floor(viewport.height)}px`;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  ctx.save();
  ctx.scale(pixelRatio, pixelRatio);

  // Clear canvas with crisp white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, viewport.width, viewport.height);

  const renderContext = {
    canvasContext: ctx,
    viewport: viewport
  };

  await page.render(renderContext).promise;
  ctx.restore();

  return { width: viewport.width, height: viewport.height };
}

/**
 * Generates and caches a high-quality thumbnail of Page 1 of a PDF
 */
export async function generatePdfThumbnail(url: string, targetWidth: number = 400): Promise<string> {
  if (thumbnailCache.has(url)) {
    return thumbnailCache.get(url)!;
  }

  try {
    const pdfDoc = await loadPdfDocument(url);
    const page = await pdfDoc.getPage(1);
    const unscaledViewport = page.getViewport({ scale: 1.0 });
    const scale = targetWidth / unscaledViewport.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(viewport.width * pixelRatio);
    canvas.height = Math.floor(viewport.height * pixelRatio);

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Cannot get canvas context');

    ctx.save();
    ctx.scale(pixelRatio, pixelRatio);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, viewport.width, viewport.height);

    await page.render({
      canvasContext: ctx,
      viewport: viewport
    }).promise;
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    thumbnailCache.set(url, dataUrl);
    return dataUrl;
  } catch (err) {
    console.warn('Could not generate PDF thumbnail:', err);
    throw err;
  }
}

/**
 * Get cached page count for a PDF
 */
export function getCachedPageCount(url: string): number | null {
  return docPageCountCache.get(url) || null;
}

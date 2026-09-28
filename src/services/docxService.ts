// Word Document (.docx) In-Browser Rendering Service
// Dynamically loads mammoth.js to convert .docx array buffers into rich HTML with styling

declare global {
  interface Window {
    mammoth?: any;
  }
}

const MAMMOTH_CDN_URL = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
let mammothLoadingPromise: Promise<any> | null = null;

/**
 * Ensures mammoth.js is loaded in the browser
 */
export async function ensureMammoth(): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('Mammoth can only run in browser environment');
  }

  if (window.mammoth) {
    return window.mammoth;
  }

  if (mammothLoadingPromise) {
    return mammothLoadingPromise;
  }

  mammothLoadingPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${MAMMOTH_CDN_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.mammoth) {
          resolve(window.mammoth);
        } else {
          reject(new Error('Mammoth failed to initialize'));
        }
      });
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.src = MAMMOTH_CDN_URL;
    script.async = true;
    script.onload = () => {
      if (window.mammoth) {
        resolve(window.mammoth);
      } else {
        reject(new Error('Mammoth loaded but window.mammoth is undefined'));
      }
    };
    script.onerror = (e) => reject(new Error('Failed to load mammoth.js script from CDN'));
    document.head.appendChild(script);
  });

  return mammothLoadingPromise;
}

/**
 * Converts a Word (.docx) file URL to styled HTML for in-browser reading
 */
export async function renderDocxToHtml(fileUrl: string): Promise<{ html: string; messages: string[] }> {
  const mammoth = await ensureMammoth();

  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch Word document: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });

  return {
    html: result.value,
    messages: result.messages || []
  };
}

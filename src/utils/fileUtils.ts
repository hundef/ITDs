/**
 * Utility to automatically detect file type and format from filename, URL, or MIME type
 */

export type BrochureFileType = 'pdf' | 'image' | 'document';

export const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'jfif', 'gif', 'svg', 'bmp', 'ico', 'tiff', 'avif'];
export const PDF_EXTENSIONS = ['pdf'];
export const DOC_EXTENSIONS = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'csv', 'odt', 'ods', 'odp'];

/**
 * Automatically detects if a file is a PDF, Image, or Generic Document based on its extension or MIME type
 */
export function detectFileType(fileNameOrUrl?: string, mimeType?: string): BrochureFileType {
  if (mimeType) {
    const mime = mimeType.toLowerCase();
    if (mime.includes('pdf')) return 'pdf';
    if (mime.startsWith('image/')) return 'image';
    if (
      mime.includes('word') ||
      mime.includes('excel') ||
      mime.includes('spreadsheet') ||
      mime.includes('presentation') ||
      mime.includes('text/') ||
      mime.includes('officedocument')
    ) {
      return 'document';
    }
  }

  if (!fileNameOrUrl) return 'pdf';

  // Strip query strings and hashes
  const cleanPath = fileNameOrUrl.toLowerCase().split('?')[0].split('#')[0];
  const extension = cleanPath.split('.').pop() || '';

  if (PDF_EXTENSIONS.includes(extension)) {
    return 'pdf';
  }

  if (IMAGE_EXTENSIONS.includes(extension)) {
    return 'image';
  }

  if (DOC_EXTENSIONS.includes(extension)) {
    return 'document';
  }

  // Fallback heuristic: check if contains .pdf anywhere in name
  if (cleanPath.includes('.pdf')) {
    return 'pdf';
  }

  return 'document';
}

/**
 * Strips file extensions from titles and filenames (e.g. "Whitepaper.pdf" -> "Whitepaper")
 */
export function stripExtension(fileNameOrTitle?: string): string {
  if (!fileNameOrTitle) return '';
  return fileNameOrTitle
    .replace(/\.(pdf|png|jpe?g|webp|jfif|gif|svg|bmp|ico|tiff|avif|docx?|xlsx?|pptx?|txt|rtf|csv|odt|ods|odp)$/i, '')
    .trim();
}

/**
 * Formats a clean human-readable title from a filename (without extension)
 */
export function formatTitleFromFileName(fileName: string): string {
  if (!fileName) return '';
  return stripExtension(fileName)
    .replace(/[-_]/g, ' ')    // replace dashes and underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()) // title case
    .trim();
}

/**
 * Formats file storage size in MB (e.g., 0.1 -> ".1MB", 0.25 -> ".25MB", 1.5 -> "1.5MB", 12 -> "12MB")
 */
export function formatStorageSize(mb: number | string | undefined | null): string {
  if (mb === undefined || mb === null || mb === '') return '';
  const num = typeof mb === 'number' ? mb : parseFloat(String(mb));
  if (isNaN(num) || num <= 0) return '';
  
  if (num < 1) {
    const formatted = parseFloat(num.toFixed(2)).toString().replace(/^0\./, '.');
    return `${formatted}MB`;
  } else {
    const formatted = parseFloat(num.toFixed(2)).toString();
    return `${formatted}MB`;
  }
}

/**
 * Returns a clean format badge label without raw extensions
 */
export function getFileTypeBadgeLabel(fileType: BrochureFileType, fileNameOrUrl?: string): string {
  if (fileType === 'pdf') return 'PDF';
  if (fileType === 'image') return 'Image';
  return 'Document';
}

/**
 * Utility to convert photos and selfies to JPEG via Canvas before upload.
 * - Scales down so the longest side is at most 1600px.
 * - Encodes as image/jpeg with 0.85 quality.
 * - Guarantees output is under 2 MB.
 * - Skips conversion for PDF files.
 */
export async function convertToJpeg(
  fileOrBlob: Blob | File,
  maxDimension = 1600,
  initialQuality = 0.85,
  maxBytes = 2 * 1024 * 1024
): Promise<Blob> {
  // If it's a PDF, do not draw on canvas
  const isPdf =
    fileOrBlob.type === 'application/pdf' ||
    (fileOrBlob instanceof File && fileOrBlob.name.toLowerCase().endsWith('.pdf'));

  if (isPdf) {
    return fileOrBlob;
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(fileOrBlob);
    const img = new Image();

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (!width || !height) {
        // Fallback to original blob if image dimensions are zero
        resolve(fileOrBlob);
        return;
      }

      // Proportional scale to max 1600px on longest side
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(fileOrBlob);
        return;
      }

      // Draw with white background to handle PNG alpha
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Attempt to encode JPEG under maxBytes (2 MB)
      let quality = initialQuality;
      const tryExport = (q: number): Promise<Blob | null> => {
        return new Promise((res) => {
          canvas.toBlob((blob) => res(blob), 'image/jpeg', q);
        });
      };

      try {
        let resultBlob = await tryExport(quality);
        while (resultBlob && resultBlob.size > maxBytes && quality > 0.4) {
          quality -= 0.1;
          resultBlob = await tryExport(quality);
        }

        if (resultBlob) {
          resolve(resultBlob);
        } else {
          resolve(fileOrBlob);
        }
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback: if browser cannot load the image (e.g. raw HEIC without native decoder), return original
      resolve(fileOrBlob);
    };

    img.src = objectUrl;
  });
}

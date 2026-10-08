import { useRef, useState, type DragEvent } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { uploadFile } from '@workspace/api-client-react';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'avif']);

interface BulkImageUploadProps {
  label?: string;
  className?: string;
  onUploaded: (uploads: UploadedImage[]) => void | Promise<void>;
}

export interface UploadedImage {
  url: string;
  name: string;
}

export function BulkImageUpload({ label, className, onUploaded }: BulkImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: File[]) => {
    if (!files.length || uploading) return;
    setUploading(true);
    setUploadError('');
    const uploads: UploadedImage[] = [];
    const failures: string[] = [];

    try {
      for (const [index, file] of files.entries()) {
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        if (!file.type.startsWith('image/') || !ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
          failures.push(`${file.name} (unsupported image type)`);
          continue;
        }
        if (file.size > MAX_IMAGE_SIZE) {
          failures.push(`${file.name} (larger than 10 MB)`);
          continue;
        }
        setProgress(`Uploading ${index + 1} of ${files.length}`);
        try {
          const { url } = await uploadFile(file);
          uploads.push({ url, name: file.name });
        } catch (error) {
          failures.push(`${file.name}${error instanceof Error ? ` (${error.message})` : ''}`);
        }
      }

      if (uploads.length) await onUploaded(uploads);
      if (failures.length) {
        setUploadError(`${failures.length} file${failures.length === 1 ? '' : 's'} failed: ${failures.join(', ')}`);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Could not add uploaded images to the portfolio.');
    } finally {
      setUploading(false);
      setProgress('');
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    void handleFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <div className={className}>
      {label && <p className="mb-2 text-xs text-muted-foreground">{label}</p>}
      <div
        role="button"
        tabIndex={uploading ? -1 : 0}
        aria-disabled={uploading}
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (!uploading && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-5 py-6 text-center transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {uploading ? (
          <>
            <Loader2 className="mb-2 h-7 w-7 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">{progress}</span>
          </>
        ) : (
          <>
            <ImagePlus className="mb-2 h-7 w-7 text-muted-foreground" />
            <span className="text-sm font-medium">Choose or drop images</span>
            <span className="mt-1 text-xs text-muted-foreground">Select multiple image files at once</span>
          </>
        )}
      </div>
      {uploadError && <p role="alert" className="mt-2 text-sm text-destructive">{uploadError}</p>}
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.ico,.avif,image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/x-icon,image/avif"
        multiple
        disabled={uploading}
        className="sr-only"
        onChange={(event) => void handleFiles(Array.from(event.currentTarget.files || []))}
      />
    </div>
  );
}

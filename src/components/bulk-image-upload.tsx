import { useRef, useState } from 'react';
import { Upload, X, Loader2, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadFile } from '@workspace/api-client-react';

interface BulkImageUploadProps {
  /** Current array of uploaded image URLs */
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  className?: string;
  /** When provided, uploaded images are handed back as separate items instead of being appended to one gallery. */
  onUploaded?: (uploads: UploadedImage[]) => void | Promise<void>;
}

export interface UploadedImage {
  url: string;
  name: string;
}

export function BulkImageUpload({ values, onChange, label, className, onUploaded }: BulkImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [recentUploads, setRecentUploads] = useState<UploadedImage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    const uploads: UploadedImage[] = [];
    for (let i = 0; i < files.length; i++) {
      setUploadProgress(`Uploading ${i + 1} / ${files.length}…`);
      try {
        const { url } = await uploadFile(files[i]);
        uploads.push({ url, name: files[i].name });
      } catch {
        // skip failed files silently
      }
    }
    if (onUploaded) {
      setRecentUploads(uploads);
      await onUploaded(uploads);
    } else {
      onChange([...values, ...uploads.map((upload) => upload.url)]);
    }
    setUploading(false);
    setUploadProgress('');
  };

  const remove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length) handleFiles(files);
  };

  return (
    <div className={className}>
      {label && <p className="text-xs text-muted-foreground mb-2">{label}</p>}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-border rounded-lg p-4 mb-3 text-center hover:border-primary/40 transition-colors cursor-pointer"
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{uploadProgress}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-3">
            <ImagePlus className="w-6 h-6 text-muted-foreground" />
            <p className="text-sm font-medium">Click or drag images here</p>
            <p className="text-xs text-muted-foreground">Select multiple images at once — JPG, PNG, WebP, GIF, SVG</p>
          </div>
        )}
      </div>

      {/* Upload button (single or bulk) */}
      <div className="flex gap-2 mb-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.multiple = true;
              inputRef.current.click();
            }
          }}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? 'Uploading…' : 'Upload Multiple Images'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.multiple = false;
              inputRef.current.click();
            }
          }}
        >
          <ImagePlus className="w-4 h-4 mr-2" />
          Single
        </Button>
      </div>

      {/* Thumbnail grid */}
      {(values.length > 0 || recentUploads.length > 0) && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {(onUploaded ? recentUploads.map((upload) => upload.url) : values).map((url, i) => (
            <div key={`${url}-${i}`} className="relative group rounded-lg overflow-hidden border border-border aspect-square bg-muted/10">
              <img
                src={url}
                alt={`Gallery image ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                aria-label="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) handleFiles(files);
          e.target.value = '';
        }}
      />
    </div>
  );
}

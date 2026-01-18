interface ImagePreviewProps {
  title: string;
  imageSrc: string | null;
  size?: number;
  className?: string;
}

export function ImagePreview({ 
  title, 
  imageSrc, 
  size = 256,
  className = '' 
}: ImagePreviewProps) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        {title}
      </h3>
      <div 
        className="image-preview flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <div className="text-muted-foreground text-sm text-center p-4">
            No image
          </div>
        )}
      </div>
    </div>
  );
}

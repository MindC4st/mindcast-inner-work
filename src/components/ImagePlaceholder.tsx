interface ImagePlaceholderProps {
  label: string;
  className?: string;
  aspectRatio?: string;
}

const ImagePlaceholder = ({ label, className = "", aspectRatio }: ImagePlaceholderProps) => (
  <div
    className={`bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-center p-4 ${className}`}
    style={aspectRatio ? { aspectRatio } : undefined}
  >
    <span className="text-xs tracking-widest text-primary/40 font-medium uppercase">
      [IMAGE: {label}]
    </span>
  </div>
);

export const ImagePlaceholderDark = ({ label, className = "", aspectRatio }: ImagePlaceholderProps) => (
  <div
    className={`bg-silver/10 border-2 border-silver/20 flex items-center justify-center text-center p-4 ${className}`}
    style={aspectRatio ? { aspectRatio } : undefined}
  >
    <span className="text-xs tracking-widest text-silver/40 font-medium uppercase">
      [IMAGE: {label}]
    </span>
  </div>
);

export default ImagePlaceholder;

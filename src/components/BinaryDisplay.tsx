interface BinaryDisplayProps {
  binary: string | null;
  character: string | null;
  label: string;
}

export function BinaryDisplay({ binary, character, label }: BinaryDisplayProps) {
  if (!binary) return null;

  return (
    <div className="animate-fade-in">
      <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
      <div className="binary-display">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-muted-foreground">Character: </span>
            <span className="text-primary font-semibold text-lg">
              '{character}'
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">ASCII: </span>
            <span className="text-foreground font-medium">
              {character?.charCodeAt(0)}
            </span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <span className="text-muted-foreground">Binary: </span>
          <span className="text-accent font-mono font-medium tracking-widest">
            {binary.split('').map((bit, i) => (
              <span 
                key={i} 
                className={bit === '1' ? 'text-primary' : 'text-muted-foreground'}
              >
                {bit}
              </span>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

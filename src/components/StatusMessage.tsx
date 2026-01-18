import { CheckCircle, XCircle, Info } from 'lucide-react';

interface StatusMessageProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

export function StatusMessage({ type, message }: StatusMessageProps) {
  const styles = {
    success: {
      container: 'bg-accent/10 border-accent/30 text-accent',
      icon: CheckCircle
    },
    error: {
      container: 'bg-destructive/10 border-destructive/30 text-destructive',
      icon: XCircle
    },
    info: {
      container: 'bg-primary/10 border-primary/30 text-primary',
      icon: Info
    }
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${style.container} animate-fade-in`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

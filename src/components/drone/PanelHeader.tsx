interface PanelHeaderProps {
  title: string;
  status?: 'active' | 'warning' | 'error' | 'idle';
  children?: React.ReactNode;
}

export function PanelHeader({ title, status = 'active', children }: PanelHeaderProps) {
  const statusColor = {
    active: 'bg-tactical-green',
    warning: 'bg-warning',
    error: 'bg-destructive animate-pulse-alert',
    idle: 'bg-muted-foreground',
  }[status];

  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-panel-header border-b border-panel-border">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-foreground">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

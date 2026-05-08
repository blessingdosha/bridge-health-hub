import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6 mb-8">
      <div className="space-y-2 min-w-0">
        <h1 className="text-3xl font-bold tracking-tight text-balance text-foreground">{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">{description}</p>
        ) : null}
      </div>
      {children ? (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{children}</div>
      ) : null}
    </div>
  );
}

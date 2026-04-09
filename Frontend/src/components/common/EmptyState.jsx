import React from 'react';
import { Button } from '@/components/ui/button';

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-card px-6 py-10 text-center shadow-sm">
      {Icon ? (
        <div className="mb-4 rounded-full bg-neutral-100 p-3 text-neutral-500">
          <Icon className="h-8 w-8" />
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-xl text-sm text-neutral-500">{description}</p>
      {actionLabel && onAction ? (
        <Button
          className="mt-4 bg-indigo-600 text-white hover:bg-indigo-500"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

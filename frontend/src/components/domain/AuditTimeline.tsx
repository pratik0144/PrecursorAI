import React from 'react';
import { cn } from '@/lib/utils';

export const AuditTimeline = (props: any) => {
  return (
    <div className={cn("p-2 border border-gray-800 rounded-md", props.className)}>
      AuditTimeline Component
    </div>
  );
};

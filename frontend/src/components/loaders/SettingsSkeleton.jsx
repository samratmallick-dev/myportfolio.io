import React from 'react';
import { Skeleton } from '../ui/skeleton';

const SettingsSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* User Info Card */}
      <div className="bg-card rounded-lg border p-6 mb-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="bg-card rounded-lg border">
        {/* Tab Headers */}
        <div className="border-b p-4">
          <div className="flex space-x-6">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6">
          {/* Email Settings */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full max-w-md" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-full max-w-md" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Password Settings */}
          <div className="space-y-4 pt-6 border-t">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full max-w-md" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-full max-w-md" />
              <Skeleton className="h-10 w-full max-w-md" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Settings */}
      <div className="mt-6 space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  </div>
);

export default SettingsSkeleton;

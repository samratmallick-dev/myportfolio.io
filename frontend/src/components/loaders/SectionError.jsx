import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

/**
 * Inline, non-blocking error state for a single lazily loaded section.
 * The rest of the page stays usable and the user can retry explicitly.
 */
const SectionError = ({ message = 'Unable to load this section.', onRetry, className = '' }) => (
      <div className={`flex flex-col items-center justify-center gap-3 py-10 text-center ${className}`}>
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  {message}
            </span>
            {onRetry && (
                  <Button variant="outline" size="sm" onClick={onRetry}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try again
                  </Button>
            )}
      </div>
);

export default React.memo(SectionError);

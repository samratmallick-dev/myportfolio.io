import React from 'react';

const PageLoader = () => {
      return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
                  <div className="relative flex items-center justify-center">
                        {/* Outer pulsing glow circle */}
                        <div className="absolute w-24 h-24 rounded-full bg-primary/20 animate-ping opacity-75"></div>
                        {/* Middle rotating gradient border */}
                        <div className="w-16 h-16 rounded-full border-4 border-t-primary border-r-secondary border-b-transparent border-l-transparent animate-spin duration-1000"></div>
                        {/* Inner pulsing solid core */}
                        <div className="absolute w-8 h-8 rounded-full bg-linear-to-tr from-primary to-secondary animate-pulse shadow-lg shadow-primary/50"></div>
                  </div>
                  <p className="mt-6 text-sm font-medium tracking-widest text-muted-foreground uppercase animate-pulse">
                        Loading Experience
                  </p>
            </div>
      );
};

export default PageLoader;

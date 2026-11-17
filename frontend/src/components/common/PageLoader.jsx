import React from 'react';

const PageLoader = () => {
      return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
                  <div className="relative flex items-center justify-center">
                        <div className="absolute w-24 h-24 rounded-full bg-primary/20 animate-ping opacity-75"></div>
                        <div className="w-16 h-16 rounded-full border-4 border-t-primary border-r-secondary border-b-transparent border-l-transparent animate-spin duration-1000"></div>
                        <div className="absolute w-8 h-8 rounded-full bg-linear-to-tr from-primary to-secondary animate-pulse shadow-lg shadow-primary/50"></div>
                  </div>
            </div>
      );
};

export default PageLoader;

import React from 'react';
import { Outlet } from 'react-router-dom';
import MyPortfolioHeader from './header';
import Footer from './footer';

const MyPortfoliopageLayout = () => {
      return (
            <div className='flex flex-col overflow-hidden bg-background relative'>
                  <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground focus:top-0 focus:left-0">
                        Skip to main content
                  </a>
                  <MyPortfolioHeader />
                  <main id="main-content" className='flex flex-col w-full'>
                        <Outlet />
                  </main>
                  <Footer />
            </div>
      );
}

export default MyPortfoliopageLayout;

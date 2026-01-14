import React, { Fragment } from 'react'
import { Button } from '../ui/button'
import * as Icons from 'lucide-react'
import { ThemeToggle } from '../common/theme-toggle'

const AdminHeader = ({ onMenuClick, isMobile, pageTitle }) => (
      <header
            className={`backdrop-blur-sm ${isMobile ? 'fixed top-0 left-0 w-full z-50' : ''
                  }`}
            style={{ borderBottom: '1px solid var(--border)' }}
      >
            <div className="container mx-auto flex items-center justify-between h-20 px-4 md:px-6">
                  {isMobile ? (
                        <Fragment>
                              <div className="flex items-center flex-col justify-center">
                                    <div className="flex items-end px-4 select-none">
                                          <span className="text-5xl font-bold text-green-600">S</span>
                                          <span className="font-bold text-3xl">amrat.</span>
                                    </div>
                                    <span className="text-xs">Admin Panel</span>
                              </div>

                              <div className="flex items-center gap-2">
                                    <ThemeToggle />
                                    <Button
                                          variant="outline"
                                          size="icon"
                                          className="bg-background/80 backdrop-blur-sm"
                                          onClick={onMenuClick}
                                    >
                                          <Icons.Menu className="h-6 w-6" />
                                    </Button>
                              </div>
                        </Fragment>
                  ) : (
                        <div className="w-full flex items-center justify-between">
                              <h1 className="text-2xl font-bold">Admin Panel - {pageTitle}</h1>
                              <ThemeToggle />
                        </div>
                  )}
            </div>
      </header>
)

export default AdminHeader

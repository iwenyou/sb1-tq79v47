import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Ruler, Menu, X } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Generate Quote', href: '/generate-quote' },
  { name: 'Quotes', href: '/quotes' },
  { name: 'Orders', href: '/orders' },
  { name: 'Catalog', href: '/catalog' },
  { name: 'Settings', items: [
    { name: 'Preset Values', href: '/preset-values' },
    { name: 'Quote Template', href: '/quote-template' },
    { name: 'Receipt Template', href: '/receipt-template' },
    { name: 'Database Status', href: '/db-status' },
  ]},
];

export function Header() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Ruler className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">CabinetQuote</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:space-x-6">
            {navigation.map((item) => 
              item.items ? (
                <div key={item.name} className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`${
                      item.items.some(subItem => location.pathname === subItem.href)
                        ? 'text-indigo-600'
                        : 'text-gray-500 hover:text-gray-900'
                    } inline-flex items-center px-1 pt-1 text-sm font-medium`}
                  >
                    {item.name}
                  </button>
                  {showSettings && (
                    <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          className={`${
                            location.pathname === subItem.href
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700'
                          } block px-4 py-2 text-sm hover:bg-gray-50`}
                          onClick={() => setShowSettings(false)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    location.pathname === item.href
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-900'
                  } inline-flex items-center px-1 pt-1 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>

          <Link
            to="/login"
            className="hidden lg:inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Log in
          </Link>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => 
                item.items ? (
                  <div key={item.name} className="space-y-1">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      {item.name}
                    </button>
                    {showSettings && (
                      <div className="pl-4">
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            className={`${
                              location.pathname === subItem.href
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'text-gray-600'
                            } block px-3 py-2 text-base font-medium hover:bg-gray-50 hover:text-gray-900`}
                            onClick={() => {
                              setShowSettings(false);
                              setIsOpen(false);
                            }}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      location.pathname === item.href
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600'
                    } block px-3 py-2 text-base font-medium hover:bg-gray-50 hover:text-gray-900`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              )}
              <Link
                to="/login"
                className="block w-full text-center px-3 py-2 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Log in
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    FAQ_DATA, SmartwatchImageSVG, 
    LoginIcon, ChartBarIcon, DocumentTextIcon, CogIcon, WristCareLogoIcon, ChevronDownIcon, PlusIcon, MinusIcon
} from '../constants';
import { FAQItem } from '../types';


const FAQAccordionItem: React.FC<{ item: FAQItem }> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-gray-200">
      <h2>
        <button
          type="button"
          className="flex items-center justify-between w-full py-5 px-6 text-left text-gray-700 hover:bg-gray-50 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls={`faq-panel-${item.id}`}
        >
          <span className="font-medium">{item.question}</span>
          {isOpen ? <MinusIcon className="w-5 h-5 text-brand-primary"/> : <PlusIcon className="w-5 h-5 text-gray-400"/>}
        </button>
      </h2>
      <div
        id={`faq-panel-${item.id}`}
        className={`px-6 pb-5 text-gray-600 text-sm ${isOpen ? 'block' : 'hidden'}`}
      >
        {item.answer}
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center text-brand-primary hover:text-brand-secondary transition-colors">
              <WristCareLogoIcon className="h-8 w-auto mr-2" />
              <span className="font-bold text-2xl">WristBud</span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-brand-primary transition-colors font-medium">Features</a>
              <a href="#faq" className="text-gray-600 hover:text-brand-primary transition-colors font-medium">FAQs</a>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
              >
                <LoginIcon className="w-5 h-5 mr-2 -ml-1" />
                Admin Login
              </Link>
            </div>
            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-500 hover:text-gray-700 focus:outline-none">
                <span className="sr-only">Open menu</span>
                 {isMobileMenuOpen ? (
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                )}
              </button>
            </div>
          </div>
        </div>
         {/* Mobile menu */}
        {isMobileMenuOpen && (
            <div className="md:hidden absolute top-16 inset-x-0 p-2 transition transform origin-top-right bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="rounded-lg">
                <div className="pt-2 pb-3 space-y-1">
                    <a href="#features" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">Features</a>
                    <a href="#faq" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">FAQs</a>
                </div>
                <Link
                    to="/login"
                    className="block w-full px-5 py-3 text-center font-medium text-brand-primary bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                    Admin Login
                </Link>
                </div>
            </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24 text-center bg-gradient-to-br from-brand-secondary via-sidebar to-indigo-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <SmartwatchImageSVG className="w-56 h-56 sm:w-64 sm:h-64 mx-auto mb-8" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-brand-light">
              Welcome to WristBud
            </h1>
            <p className="text-lg sm:text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
              Intelligent health data monitoring and management for everyone. Gain insights, track trends, and oversee connected smartwatch data with ease.
            </p>
            <a
              href="#features"
              className="inline-block px-8 py-3 border border-transparent text-base font-medium rounded-md text-brand-secondary bg-white hover:bg-indigo-50 transition-transform transform hover:scale-105"
            >
              Discover Features
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-16">Why WristBud?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: ChartBarIcon, title: "Comprehensive Dashboard", description: "Visualize key health metrics, track real-time data, and understand overall system status at a glance." },
              { icon: DocumentTextIcon, title: "Detailed Trend Analysis", description: "Access historical data and identify long-term health trends for individuals or groups." },
              { icon: CogIcon, title: "System Management", description: "Configure settings, manage users (conceptual), and oversee the operational aspects of the platform." }
            ].map(feature => (
              <div key={feature.title} className="bg-gray-50 rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center p-4 bg-brand-primary/10 text-brand-primary rounded-full mb-6">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-16">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
              {FAQ_DATA.map((item) => (
                <FAQAccordionItem key={item.id} item={item} />
              ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-800 text-gray-300 text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mb-1">&copy; {new Date().getFullYear()} WristBud. All rights reserved.</p>
          <p className="text-sm text-gray-400">Empowering Health Data Management.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
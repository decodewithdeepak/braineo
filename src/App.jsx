import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import "./App.css";
import { useAuth } from './context/AuthContext';

const App = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const showSidebar = isAuthenticated && ![
    "/login",
    "/signup",
    "/",
    "/home",
    "/reset-password",
  ].includes(location.pathname);
  
  // Check if screen is larger than mobile size for initial sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.innerWidth >= 768; // Open by default on tablets/laptops (md breakpoint)
  });
  
  // Update sidebar state when window is resized
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true); // Keep sidebar open on larger screens
      } else {
        setIsSidebarOpen(false); // Close sidebar on mobile
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      {/* Navbar */}
      <Navbar
        isDashboard={showSidebar}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex flex-1 pt-12 relative">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        )}

        {/* Main Content */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            showSidebar && isSidebarOpen ? "md:ml-64" : ""
          }`}
        >
          {children}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default App;

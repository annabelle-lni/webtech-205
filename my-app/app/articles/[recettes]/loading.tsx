"use client";
import { useEffect, useState } from "react";

export default function Loading() {
  return <LoadingSkeleton />;
}

function LoadingSkeleton() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Vérifier si le mode sombre est activé
    const checkDarkMode = () => {
      const darkThemeSelected = localStorage.getItem('selectedTheme') === 'sombre';
      const hasDarkClass = document.documentElement.classList.contains('dark-theme');
      setIsDarkMode(darkThemeSelected || hasDarkClass);
    };

    checkDarkMode();

    // Écouter les changements de thème
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div 
        className={`p-8 rounded-[15px] shadow-[0_6px_20px_rgba(0,0,0,0.08)] transition-colors duration-300 ${
          isDarkMode 
            ? "bg-[#1F2937] text-[#E5E7EB]" 
            : "bg-[#FFFCEE] text-[#333]"
        }`}
        style={{
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '90%'
        }}
      >
        {/* Animation de chargement */}
        <div className="flex justify-center mb-4">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDarkMode ? "border-[#FFFFFF]" : "border-[#f4a887]"
          }`}></div>
        </div>
        
        <p className={`text-lg font-medium ${
          isDarkMode ? "text-[#E5E7EB]" : "text-[#374151]"
        }`}>
          Chargement en cours...
        </p>
        
        {/* Barre de progression simulée */}
        <div className={`mt-4 w-full bg-opacity-20 rounded-full h-2 ${
          isDarkMode ? "bg-[#4B5563]" : "bg-[#D1D5DB]"
        }`}>
          <div 
            className={`h-2 rounded-full animate-pulse ${
              isDarkMode ? "bg-[#9CA3AF]" : "bg-[#f4a887]"
            }`}
            style={{
              width: '60%',
              animation: 'pulse 2s infinite'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
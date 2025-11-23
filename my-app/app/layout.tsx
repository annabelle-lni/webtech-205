"use client";

import Link from "next/link";
import "./globals.css";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/supabase/client"; 
import { AuthProvider, useAuth } from "@/components/authentification"; 

const HeaderButtons = () => {
  const { user } = useAuth(); 
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Gestion du mode sombre pour les boutons du header
  useEffect(() => {
    const checkDarkMode = () => {
      const darkThemeSelected = localStorage.getItem('selectedTheme') === 'sombre';
      const hasDarkClass = document.documentElement.classList.contains('dark-theme');
      const isDarkBody = document.body.style.backgroundColor === '#1a1a1a';
      setIsDarkMode(darkThemeSelected || hasDarkClass || isDarkBody);
    };

    checkDarkMode();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' || mutation.attributeName === 'style') {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    observer.observe(document.body, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/"; 
  };

  if (user) {
    return (
      <>
        <Link href="/moncompte">
          <button className="px-[1.2rem] py-[0.7rem] bg-[#f4a887] border-none rounded-[3px] text-base cursor-pointer hover:bg-[#FFFCEE]">
            Mon compte
          </button>
        </Link>
        <button 
          onClick={handleLogout}
          className="px-[1.2rem] py-[0.7rem] bg-[#ff6b6b] text-white border-none rounded-[3px] text-base cursor-pointer hover:bg-[#ff5252]"
        >
          Déconnexion
        </button>
      </>
    );
  }

  return (
    <Link href="/connexion">
      <button className="px-[1.2rem] py-[0.7rem] bg-[#f4a887] border-none rounded-[3px] text-base cursor-pointer hover:bg-[#FFFCEE]">
        Se connecter
      </button>
    </Link>
  );
};

// Fonction qui permet de supprimer les accents pour la recherche
const normalizeText = (text: string) => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}){
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  // Gestion du mode sombre pour le layout principal
  useEffect(() => {
    const checkDarkMode = () => {
      const darkThemeSelected = localStorage.getItem('selectedTheme') === 'sombre';
      const hasDarkClass = document.documentElement.classList.contains('dark-theme');
      const isDarkBody = document.body.style.backgroundColor === '#1a1a1a';
      setIsDarkMode(darkThemeSelected || hasDarkClass || isDarkBody);
    };

    checkDarkMode();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' || mutation.attributeName === 'style') {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    observer.observe(document.body, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // permet de retirer les accents pour la recherche
      const normalizedSearch = normalizeText(searchQuery.trim());
      router.push(`/articles?search=${encodeURIComponent(normalizedSearch)}`);
      setSearchQuery("");
    }
  };

  // Fonction simplifiée pour les filtres - juste la redirection
  const handleFilter = (filterType: string, filterValue: string) => {
    router.push(`/articles?${filterType}=${encodeURIComponent(filterValue)}`);
    setOpen(false);
  };

  return(
    <html className={`font-[Aptos] min-h-screen flex flex-col color-black ${isDarkMode ? "text-[#FFFFFF]" : "text-[#333]"}`} lang="fr">
      <body className={`flex flex-col min-h-screen ${isDarkMode ? "bg-[#111827]" : "bg-[#f5f8fc]"}`}>
        
        <AuthProvider>
          
          <header 
            className="fixed w-full flex justify-between items-center px-[30px] py-[10px] border-b border-[#dce3eb] bg-[url('/banniere-patisserie.png')] bg-center bg-cover h-[100px] z-[2000]"
            style={{boxSizing: "border-box"}}
          >
             <div className={`text-[20px] px-[10px] py-[5px] rounded-[5px] flex items-center ${isDarkMode ? "bg-[#1F2937] text-[#FFFFFF]" : "text-[#333] bg-[#FFFCEE]"}`}>
              <button 
                className="px-[1.2rem] py-[0.7rem] bg-[#f4a887] border-none rounded-[3px] text-base cursor-pointer hover:bg-[#FFFCEE]"
                onClick={() => setOpen(!open)}
              >
                {open ? "x" : "≡"}
              </button>
              <Link href="/" className="mx-[10px] font-bold italic">Cooking.com</Link>
            </div>

            <div className={`text-[20px] px-[10px] py-[5px] rounded-[5px] ${isDarkMode ? "bg-[#1F2937] text-[#FFFFFF]" : "text-[#333] bg-[#FFFCEE]"}`}>
              <form onSubmit={handleSearch} className="flex items-center">
                <input 
                  type="text" 
                  placeholder="Rechercher une recette..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`px-[0.7rem] py-[0.7rem] text-base border rounded-[3px] mr-2 ${isDarkMode ? "bg-[#374151] border-[#4B5563] text-[#FFFFFF] placeholder-[#9CA3AF]" : "border-[#ccc]"}`}
                />
                <button type="submit" className="px-[1.2rem] py-[0.7rem] bg-[#f4a887] border-none rounded-[3px] text-base cursor-pointer hover:bg-[#FFFCEE]">
                  Rechercher
                </button>
              </form>
            </div>

            <div className={`text-[20px] px-[10px] py-[5px] rounded-[5px] flex gap-3 ${isDarkMode ? "bg-[#1F2937] text-[#FFFFFF]" : "text-[#333] bg-[#FFFCEE]"}`}>
              <Link href="/notrehistoire" className="mx-[10px] font-bold italic self-center">
                Notre histoire
              </Link>
              
              <HeaderButtons />
            </div>  
          </header>

          {/* Menu déroulant avec les VRAIES valeurs de votre BDD */}
          <nav className={`fixed left-0 w-full shadow-[0_4px_10px_rgba(0,0,0,0.1)] py-[20px] flex justify-around transition-top duration-700 z-[999] ${
            open ? "top-[100px]" : "top-[-50vh]"
          } ${isDarkMode ? "bg-[#1F2937] text-[#FFFFFF]" : "bg-[#fff3e0]"}`}>

            {/* Recettes par catégorie - VALEURS CORRIGÉES */}
            <div>
              <h3 className="mb-2 font-semibold">Recettes par catégorie</h3>
              <p 
                className="cursor-pointer hover:text-[#f4a887] transition-colors py-1"
                onClick={() => handleFilter('categorie', 'apéro')}
              >
                Apéro
              </p>
              <p 
                className="cursor-pointer hover:text-[#f4a887] transition-colors py-1"
                onClick={() => handleFilter('categorie', 'entrée')}
              >
                Entrées
              </p>
              <p 
                className="cursor-pointer hover:text-[#f4a887] transition-colors py-1"
                onClick={() => handleFilter('categorie', 'plat')}
              >
                Plats
              </p>
              <p 
                className="cursor-pointer hover:text-[#f4a887] transition-colors py-1"
                onClick={() => handleFilter('categorie', 'dessert')}
              >
                Desserts
              </p>
            </div>

            {/* Recettes par fête - VALEURS CORRIGÉES */}
            <div>
              <h3 className="mb-2 font-semibold">Recettes par fête</h3>
              <p 
                className="cursor-pointer hover:text-[#f4a887] transition-colors py-1"
                onClick={() => handleFilter('fete', 'nouvel an')}
              >
                Nouvel an
              </p>
              <p 
                className="cursor-pointer hover:text-[#f4a887] transition-colors py-1"
                onClick={() => handleFilter('fete', 'noel')}
              >
                Noël
              </p>
              <p 
                className="cursor-pointer hover:text-[#f4a887] transition-colors py-1"
                onClick={() => handleFilter('fete', 'paques')}
              >
                Pâques
              </p>
              <p 
                className="cursor-pointer hover:text-[#f4a887] transition-colors py-1"
                onClick={() => handleFilter('fete', 'anniversaire')}
              >
                Anniversaire
              </p>
            </div>

            {/* Recettes du monde - VALEURS CORRIGÉES */}
            <div>
              <h3 className="mb-2 font-semibold">Recettes du monde</h3>
              <p 
                className="cursor-pointer hover:text-[#f4a887] transition-colors py-1"
                onClick={() => handleFilter('origine', 'française')}
              >
                Françaises
              </p>
              <p 
                className="cursor-pointer hover:text-[#f4a887] transition-colors py-1"
                onClick={() => handleFilter('origine', 'japonaise')}
              >
                Japonaises
              </p>
              <p
                className="cursor-pointer hover:text-[#f4a887] transition-colors py-1"
                onClick={() => handleFilter('origine', 'italienne')}
              >
                Italiennes
              </p>
              <p 
                className="cursor-pointer hover:text-[#f4a887] transition-colors py-1"
                onClick={() => handleFilter('origine', 'indienne')}
              >
                Indiennes
              </p>
              <br />
              <Link href="/articles" className="mx-[10px]">
                <h4 className="hover:text-[#f4a887] transition-colors py-1">Toutes les recettes</h4>
              </Link>
            </div>
          </nav>

          <main className="flex-1 mt-[100px] pb-[80px]">
            {children}
          </main>

          <footer className={`text-center text-[13px] py-[15px] border-t relative z-[100] mt-auto ${isDarkMode ? "text-[#9CA3AF] border-[#374151] bg-[#1F2937]" : "text-[#777] border-[#dce3eb]"}`}>
            Copyright © 2025 Cooking aka le meilleur site de nourriture du monde
          </footer>

        </AuthProvider>
      </body>
    </html>
  );
}
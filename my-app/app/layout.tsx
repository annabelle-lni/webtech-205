"use client";

import Link from "next/link";
import "./globals.css";
import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Va permettre de faire la redirection

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}){
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter(); // Initialisation du router

  // Fonction de recherche qui redirige vers la page articles
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirection vers /articles avec le paramètre de recherche
      router.push(`/articles?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); // Vide la barre de recherche
    }
  };

  return(
    <html className="font-[Aptos] text-[#333] min-h-screen flex flex-col color-black" lang="en">
      <body className="bg-[#f5f8fc] flex flex-col min-h-screen">
        {/* Header */}
        <header 
          className="fixed w-full flex justify-between items-center px-[30px] py-[10px] bg-white border-b border-[#dce3eb] bg-[url('/banniere-patisserie.png')] bg-center bg-cover h-[100px] z-[2000]"
          style={{boxSizing: "border-box"}}
        >
          {/* Header Left */}
          <div className="text-[20px] text-[#333] px-[10px] py-[5px] rounded-[5px] bg-[#FFFCEE] flex items-center">
            <button 
              className="px-[1.2rem] py-[0.7rem] bg-[#f4a887] border-none rounded-[3px] text-base cursor-pointer hover:bg-[#FFFCEE]"
              onClick={() => setOpen(!open)}
            >
              {open ? "x" : "≡"}
            </button>
            <Link href="/" className="mx-[10px] font-bold italic">Cooking.com</Link>
          </div>


          {/* Header Center */}
          <div className="text-[20px] text-[#333] px-[10px] py-[5px] rounded-[5px] bg-[#FFFCEE]">
            <form onSubmit={handleSearch} className="flex items-center">
              <input 
                type="text" 
                placeholder="Rechercher une recette..." 
                value={searchQuery} //valeur de searchQuery
                onChange={(e) => setSearchQuery(e.target.value)} //va mettre à jour la valeur de searchQuery
                className="px-[0.7rem] py-[0.7rem] text-base border border-[#ccc] rounded-[3px] mr-2"
              />
              <button 
                type="submit"
                className="px-[1.2rem] py-[0.7rem] bg-[#f4a887] border-none rounded-[3px] text-base cursor-pointer hover:bg-[#FFFCEE]"
              >
                Rechercher
              </button>
            </form>
          </div>

          {/* Header Right */}
          <div className="text-[20px] text-[#333] px-[10px] py-[5px] rounded-[5px] bg-[#FFFCEE]">
            <Link href="/notrehistoire" className="mx-[10px] font-bold italic">
              Notre histoire
            </Link>
            <Link href="/connexion">
              <button className="px-[1.2rem] py-[0.7rem] bg-[#f4a887] border-none rounded-[3px] text-base cursor-pointer hover:bg-[#FFFCEE]">
                Se connecter
              </button>
            </Link>
          </div>  
        </header>

        {/* Menu déroulant */}
        <nav className={`fixed left-0 w-full bg-[#fff3e0] shadow-[0_4px_10px_rgba(0,0,0,0.1)] py-[20px] flex justify-around transition-top duration-700 z-[999] ${
          open ? "top-[100px]" : "top-[-50vh]"
        }`}>
          <div>
            <h3 className="mb-2">Recettes par catégorie</h3>
            <p className="cursor-pointer hover:text-[#f4a887]">Apéro</p>
            <p className="cursor-pointer hover:text-[#f4a887]">Entrées</p>
            <p className="cursor-pointer hover:text-[#f4a887]">Plats</p>
            <p className="cursor-pointer hover:text-[#f4a887]">Desserts</p>
          </div>
          <div>
            <h3 className="mb-2">Recettes par fête</h3>
            <p className="cursor-pointer hover:text-[#f4a887]">Nouvel an</p>
            <p className="cursor-pointer hover:text-[#f4a887]">Noël</p>
            <p className="cursor-pointer hover:text-[#f4a887]">Pâques</p>
            <p className="cursor-pointer hover:text-[#f4a887]">Anniversaire</p>
          </div>
          <div>
            <h3 className="mb-2">Recettes du monde</h3>
            <p className="cursor-pointer hover:text-[#f4a887]">Italiennes</p>
            <p className="cursor-pointer hover:text-[#f4a887]">Japonaises</p>
            <p className="cursor-pointer hover:text-[#f4a887]">Indiennes</p>
            <p className="cursor-pointer hover:text-[#f4a887]">Françaises</p>
            <br />
            <Link href="/articles" className="mx-[10px]">
              <h4 className="hover:text-[#f4a887]">Tout</h4>
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 mt-[100px] pb-[80px]">
          {children}
        </main>

        {/* Footer */}
        <footer className="text-center text-[13px] text-[#777] py-[15px] border-t border-[#dce3eb] bg-white relative z-[100] mt-auto">
          Copyright © 2025 Cooking aka le meilleur site de nourriture du monde
        </footer>
        
      </body>
    </html>
  );
}

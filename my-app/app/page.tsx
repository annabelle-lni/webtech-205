"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/supabase/client.js";

//fonction qui permet de faire un mélange aléatoire
function shuffle<T>(arr: T[]) { 
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [recettes, setRecettes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gestion du mode sombre (identique aux autres pages)
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

  // Récupération des recettes
  useEffect(() => {
    const fetchRecettes = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("recette")
          .select("id, nom, temps_preparation, images");

        if (error) {
          console.error("Erreur de récupération des recettes :", error.message);
          setError(error.message);
          return;
        }

        setRecettes(data || []);
      } catch (err) {
        console.error("Erreur:", err);
        setError("Erreur lors du chargement des recettes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecettes();
  }, []);

  const recettesWithImages = recettes || [];

  // On affiche aléatoirement 4 recettes
  const recettesToShow = recettesWithImages && recettesWithImages.length > 4 
    ? shuffle(recettesWithImages).slice(0, 4) 
    : recettesWithImages ?? [];

  if (isLoading) return (
    <div className={`min-h-screen pt-8 flex justify-center items-center transition-colors duration-300 ${
      isDarkMode ? "bg-[#111827] text-[#FFFFFF]" : "bg-[#f5f8fc] text-[#333333]"
    }`}>
      Chargement...
    </div>
  );

  if (error) {
    return (
      <div className={`min-h-screen pt-8 flex justify-center items-center transition-colors duration-300 ${
        isDarkMode ? "bg-[#111827] text-[#FFFFFF]" : "bg-[#f5f8fc] text-[#333333]"
      }`}>
        <p>Erreur lors du chargement des recettes</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-8 transition-colors duration-300 ${
      isDarkMode ? "bg-[#111827]" : "bg-[#f5f8fc]"
    }`}>
      
      {/* Premier bloc */}
      <div className={`mx-[10%] my-[30px] flex flex-col items-center text-center rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-colors duration-300 ${
        isDarkMode ? "bg-[#1F2937] text-[#FFFFFF]" : "bg-[#FFFCEE] text-[#333333]"
      }`}>
        <h1 className="font-bold mt-8 pt-8">Bienvenue sur Cooking.com !</h1>

        <p className={`italic mx-[30px] my-4 ${
          isDarkMode ? "text-[#D1D5DB]" : "text-[#333333]"
        }`}>
          Découvrez des recettes délicieuses et faciles à préparer pour toutes les occasions.
          <br />
          Que vous soyez un chef expérimenté ou un débutant en cuisine, nous avons quelque chose pour vous.
        </p>
        <br />
      </div>

      {/* Deuxième bloc avec espace */}
      <div className={`mx-[10%] flex flex-col items-center text-center rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-colors duration-300 ${
        isDarkMode ? "bg-[#1F2937] text-[#FFFFFF]" : "bg-[#FFFCEE] text-[#333333]"
      }`}>
        <h2 className="font-bold mt-8 pt-8">Nos recettes du moment :</h2>

        {/* Grille des recettes - STYLE PAGE ARTICLES */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-8 w-[calc(100%-80px)] max-w-[1100px] justify-items-center my-8">
          {recettesToShow.length > 0 ? (
            recettesToShow.map((recette) => (
              <div
                key={recette.id}
                className={`shadow-[0_1px_3px_rgba(0,0,0,0.1)] w-[250px] text-left transition-colors duration-300 ${
                  isDarkMode 
                    ? "bg-[#374151] shadow-[0_1px_3px_rgba(0,0,0,0.3)]" 
                    : "bg-[#FFFCEE]"
                }`}
              >
                {/* Image */}
                <div className={`h-[140px] transition-colors duration-300 ${
                  isDarkMode ? "bg-[#4B5563]" : "bg-[#FFFFFF]"
                }`}>
                  {recette.images ? (
                    <img 
                      src={recette.images} 
                      alt={recette.nom}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br flex items-center justify-center transition-colors duration-300 ${
                      isDarkMode 
                        ? "from-[#4B5563] to-[#374151]" 
                        : "from-[#FFFFFF] to-[#EEEEEE]"
                    }`}>
                      <span className={`italic ${
                        isDarkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"
                      }`}>Pas d'image</span>
                    </div>
                  )}
                </div>
              
                {/* Partie basse dans la couleur de base avec plus d'espace */}
                <div className={`mx-[10px] my-[10px] pb-[15px] transition-colors duration-300 ${
                  isDarkMode ? "bg-[#374151]" : "bg-[#FFFCEE]"
                }`}>
                  <h3 className={`font-semibold ${
                    isDarkMode ? "text-[#E5E7EB]" : "text-[#333333]"
                  }`}>
                    {recette.nom}
                  </h3>
                  <p className={`text-[13px] ${
                    isDarkMode ? "text-[#D1D5DB]" : "text-[#555555]"
                  }`}>
                    Temps de préparation : {recette.temps_preparation} min
                  </p>
                  <Link 
                    href={`/articles/${recette.id}`} 
                    className="text-[13px] text-[#f4a887] no-underline hover:underline hover:text-[#FB923C] transition-colors duration-200"
                  >                 
                    Voir la recette →
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className={`text-center my-8 ${
              isDarkMode ? "text-[#D1D5DB]" : "text-[#333333]"
            }`}>
              Aucune recette trouvée.
            </p>
          )}
        </div>
      

      {/* Témoignage avec plus d'espace depuis les recettes */}
      <div className={`my-[50px] pb-[20px] border-l-4 border-[#f4a887] w-[90%] max-w-4xl mx-auto text-left shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-colors duration-300 ${
        isDarkMode 
          ? "bg-[#374151] text-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.3)]" 
          : "bg-[#FFFFFF] text-[#333333]"
      }`}>
        <p className={`mx-[15px] leading-relaxed mb-4 text-base ${
          isDarkMode ? "text-[#D1D5DB]" : "text-[#333333]"
        }`}>
          <strong className="font-semibold">Cooking a changé ma vie !</strong> Grâce à ce site j'ai pu diversifier mes
          connaissances dans les plats et les desserts. J'ai pu totalement me reconstruire et
          retrouver une famille. Maintenant j'ai une femme et 2 enfants qui mangent
          diversifiés. Merci encore !
        </p>
        <em className={`mx-[15px] text-sm ${
          isDarkMode ? "text-[#9CA3AF]" : "text-[#555555]"
        }`}>
          ~ Commentaire de l'un de nos meilleurs clients (Jonathan Cohen)
        </em>
      </div>
    </div>
    </div>
  );
}
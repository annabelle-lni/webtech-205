"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/supabase/client.js";


// Composant principal qui utilise useSearchParams
function ArticlesContent() {
  const searchParams = useSearchParams();
  
  const search = searchParams.get('search') || "";
  const categorie = searchParams.get('categorie') || "";
  const fete = searchParams.get('fete') || "";
  const origine = searchParams.get('origine') || "";
 
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [recettes, setRecettes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔍 Paramètres de filtrage:", { search, categorie, fete, origine });

  // Gestion du mode sombre
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

  // Récupération des recettes avec filtres
  useEffect(() => {
    const fetchRecettes = async () => {
      try {
        setIsLoading(true);
        let query = supabase
          .from("recette")
          .select("id, nom, temps_preparation, categorie, fete, origine, difficulte, images");

        if (search) {
          query = query.ilike("nom", `%${search}%`);
        }
        if (categorie) {
          query = query.eq("categorie", categorie);
        }
        if (fete) {
          query = query.eq("fete", fete);
        }
        if (origine) {
          query = query.eq("origine", origine);
        }

        const { data, error } = await query;

        if (error) {
          console.error("❌ Erreur de récupération des recettes :", error.message);
          setError(error.message);
          return;
        }

        console.log("📊 Recettes trouvées:", data?.length);
        setRecettes(data || []);
      } catch (err) {
        console.error("Erreur:", err);
        setError("Erreur lors du chargement des recettes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecettes();
  }, [search, categorie, fete, origine]);

  // Utiliser directement les recettes avec la colonne images
  const recettesWithImages = recettes || [];

  // Fonction pour générer le titre selon le filtre actif
  const getPageTitle = () => {
    if (search) {
      return <>Nos recettes pour <span className="font-bold text-[#f4a887] italic">"{search}"</span></>;
    }
    if (categorie) {
      return <>Recettes : <span className="font-bold text-[#f4a887] italic">{categorie}</span></>;
    }
    if (fete) {
      return <>Recettes pour : <span className="font-bold text-[#f4a887] italic">{fete}</span></>;
    }
    if (origine) {
      return <>Recettes : <span className="font-bold text-[#f4a887] italic">{origine}</span></>;
    }
    return "Toutes nos recettes";
  };

  // Vérifier si un filtre est actif
  const hasActiveFilter = search || categorie || fete || origine;

  if (isLoading) return (
    <div className={`my-[30px] min-h-screen flex justify-center pt-32 transition-colors duration-300 ${
      isDarkMode ? "bg-[#111827] text-[#FFFFFF]" : "bg-[#f5f8fc] text-[#333333]"}`}>
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f4a887] mb-4"></div>
        <p>Chargement des recettes...</p>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className={`my-[30px] min-h-screen flex justify-center pt-32 transition-colors duration-300 ${
        isDarkMode ? "bg-[#111827] text-[#FFFFFF]" : "bg-[#f5f8fc] text-[#333333]"}`}>
        <div className="text-center">
          <p className="text-lg mb-4">Erreur lors du chargement des recettes 😢</p>
          <p className="text-sm opacity-75 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#f4a887] text-[#333333] rounded-[5px] hover:bg-[#FB923C] transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`my-[30px] min-h-screen transition-colors duration-300 ${
      isDarkMode ? "bg-[#111827]" : "bg-[#f5f8fc]"}`}>
      
      <main className={`flex-1 text-left mx-[10%] my-10 flex flex-col items-center text-center pb-20 rounded-[20px] shadow-[0_6px_20px_rgba(0,0,0,0.08)] mt-32 overflow-hidden box-border transition-colors duration-300 ${
        isDarkMode ? "bg-[#1F2937] text-[#FFFFFF]" : "bg-[#FFFCEE] text-[#333333]"}`}>  
        
        {/* Titre selon le filtre actif */}
        <h1 className="text-[22px] font-bold mt-12 pt-8 mb-8">
          {getPageTitle()}
        </h1>

        {/* Message si aucun résultat avec filtre actif */}
        {hasActiveFilter && recettesWithImages.length === 0 && (
          <div className="mb-8">
            <p className={`text-lg mb-4 ${
              isDarkMode ? "text-[#D1D5DB]" : "text-[#555555]"
            }`}>
              Aucune recette trouvée pour ce filtre
            </p>
            <Link 
              href="/articles" 
              className={`px-4 py-2 bg-[#f4a887] text-[#333333] rounded-[5px] hover:bg-[#FB923C] transition-colors inline-block`}
            >
              Voir toutes les recettes
            </Link>
          </div>
        )}

        {/* Message si aucune recette du tout (sans filtre) */}
        {!hasActiveFilter && recettesWithImages.length === 0 && (
          <div className="mb-8">
            <p className={`text-lg ${
              isDarkMode ? "text-[#D1D5DB]" : "text-[#555555]"
            }`}>
              Aucune recette disponible pour le moment.
            </p>
          </div>
        )}

        {/* Informations sur les résultats */}
        {recettesWithImages.length > 0 && (
          <div className="mb-6">
            <p className={`text-lg ${
              isDarkMode ? "text-[#D1D5DB]" : "text-[#555555]"
            }`}>
              {recettesWithImages.length} recette(s) trouvée(s)
              {hasActiveFilter && (
                <Link 
                  href="/articles" 
                  className={`ml-4 text-[#f4a887] hover:text-[#FB923C] hover:underline text-sm transition-colors duration-200`}
                >
                  Voir toutes les recettes
                </Link>
              )}
            </p>
          </div>
        )}

        {/* Grille des recettes */}
        <div className="my-12 mx-auto grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-8 items-start w-[calc(100%-80px)] max-w-[1100px] box-border justify-items-center">
          {recettesWithImages.length > 0 ? (
            recettesWithImages.map((recette) => (
              <div 
                key={recette.id} 
                className={`my-[10px] rounded-[5px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] w-[250px] overflow-hidden text-left my-4 transition-colors duration-300 ${
                  isDarkMode 
                    ? "bg-[#374151] shadow-[0_1px_3px_rgba(0,0,0,0.3)]" 
                    : "bg-[#FFFCEE]"
                }`}
              >
                {/* Image de la recette */}
                <div className={`h-[140px] transition-colors duration-300 ${
                  isDarkMode ? "bg-[#4B5563]" : "bg-[#FFFFFF]"
                }`}>
                  {recette.images ? (
                    <img 
                      src={recette.images} 
                      alt={recette.nom}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback si l'image ne charge pas
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full bg-gradient-to-br flex items-center justify-center transition-colors duration-300 ${
                    isDarkMode 
                      ? "from-[#4B5563] to-[#374151]" 
                      : "from-[#FFFFFF] to-[#EEEEEE]"
                  } ${recette.images ? 'hidden' : ''}`}>
                    <span className={`italic ${
                      isDarkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"
                    }`}>Pas d'image</span>
                  </div>
                </div>

                {/* Contenu de la carte */}
                <div className={`p-5 transition-colors duration-300 ${
                  isDarkMode ? "bg-[#374151]" : "bg-[#FFFCEE]"
                }`}>
                  <h3 className={`text-lg font-semibold mb-3 ${
                    isDarkMode ? "text-[#E5E7EB]" : "text-[#333333]"
                  }`}>
                    {recette.nom}
                  </h3>
                  <p className={`text-[13px] mb-3 ${
                    isDarkMode ? "text-[#D1D5DB]" : "text-[#555555]"
                  }`}>
                    Temps de préparation : {recette.temps_preparation} min
                  </p>
                  <p className={`text-[13px] mb-3 ${
                    isDarkMode ? "text-[#D1D5DB]" : "text-[#555555]"
                  }`}>
                    Difficulté : {recette.difficulte}
                  </p>

                  <Link 
                    href={`/articles/${recette.id}`} 
                    className="inline-block text-[13px] text-[#f4a887] hover:text-[#FB923C] no-underline hover:underline transition-colors duration-200"
                  >
                    Voir la recette →
                  </Link>
                </div>
              </div>
            ))
          ) : null}
        </div>
      </main>
    </div>
  );
}

// Composant de page principal avec Suspense
export default function ArticlesPage() {
  return (
    <Suspense fallback={
      <div className="my-[30px] min-h-screen flex justify-center pt-32 bg-[#f5f8fc]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f4a887] mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    }>
      <ArticlesContent />
    </Suspense>
  );
}
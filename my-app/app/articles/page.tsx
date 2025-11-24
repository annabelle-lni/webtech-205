import React from "react";
import Link from "next/link";
import { supabase } from "@/supabase/client.js";

export default async function ArticlesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Méthode 1 : Utiliser await directement
  const searchParams = await props.searchParams;
  
  // Extraire les paramètres avec des valeurs par défaut
  const searchQuery = (searchParams.search as string) || "";
  const categorie = (searchParams.categorie as string) || "";
  const fete = (searchParams.fete as string) || "";
  const origine = (searchParams.origine as string) || "";

  console.log("🔍 Paramètres de filtrage:", { searchQuery, categorie, fete, origine });

  // Récupération des recettes avec filtres
  let query = supabase
    .from("recette")
    .select("id, nom, temps_preparation, categorie, fete, origine, difficulte, images");

  // Appliquer les filtres selon les paramètres
  if (searchQuery) {
    query = query.ilike("nom", `%${searchQuery}%`);
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

  const { data: recettes, error } = await query;

  if (error) {
    console.error("❌ Erreur de récupération des recettes :", error.message);
    return <p>Erreur lors du chargement des recettes 😢</p>;
  }

  console.log("📊 Recettes trouvées:", recettes?.length);
  if (recettes && recettes.length > 0) {
    console.log("📝 Exemple de recette:", recettes[0]);
  }

  // Utiliser directement les recettes avec la colonne images
  const recettesWithImages = recettes || [];

  // Fonction pour générer le titre selon le filtre actif
  const getPageTitle = () => {
    if (searchQuery) {
      return <>Nos recettes pour <span className="font-bold text-[#f4a887] italic">"{searchQuery}"</span></>;
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
  const hasActiveFilter = searchQuery || categorie || fete || origine;

  return (
    <main
      className="flex-1 text-left mx-[10%] my-10 my-[30px] bg-[#FFFCEE] flex flex-col items-center text-center pb-20 rounded-[20px] mt-32 overflow-hidden box-border"
    >  
      {/* Titre selon le filtre actif */}
      <h1 className="text-[22px] font-bold mt-12 pt-8 mb-8">
        {getPageTitle()}
      </h1>

      {/* Message si aucun résultat avec filtre actif */}
      {hasActiveFilter && recettesWithImages.length === 0 && (
        <div className="mb-8">
          <p className="text-[#555] text-lg mb-4">
            Aucune recette trouvée pour ce filtre
          </p>
          <Link 
            href="/articles" 
            className="px-4 py-2 bg-[#f4a887] text-[#333] rounded-[5px] hover:bg-[#FFFCEE] transition-colors inline-block"
          >
            Voir toutes les recettes
          </Link>
        </div>
      )}

      {/* Message si aucune recette du tout (sans filtre) */}
      {!hasActiveFilter && recettesWithImages.length === 0 && (
        <div className="mb-8">
          <p className="text-[#555] text-lg">
            Aucune recette disponible pour le moment.
          </p>
        </div>
      )}

      {/* Informations sur les résultats */}
      {recettesWithImages.length > 0 && (
        <div className="mb-6">
          <p className="text-[#555] text-lg">
            {recettesWithImages.length} recette(s) trouvée(s)
            {hasActiveFilter && (
              <Link 
                href="/articles" 
                className="ml-4 text-[#f4a887] hover:underline text-sm"
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
              className="my-[10px] bg-[#FFFCEE] rounded-[5px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] w-[250px] overflow-hidden text-left my-4"
            >
              {/* Image de la recette : utilisation de recette.images */}
              <div className="bg-[#FFFFFF] h-[140px]">
                {recette.images ? (
                  <img 
                    src={recette.images} 
                    alt={recette.nom}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#FFFFFF] to-[#EEEEEE] flex items-center justify-center">
                    <span className="italic">Pas d'image</span>
                  </div>
                )}
              </div>

              {/* Contenu de la carte */}
              <div className="p-5 bg-[#FFFCEE]">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{recette.nom}</h3>
                <p className="text-[13px] text-[#555] mb-3">
                  Temps de préparation : {recette.temps_preparation} min
                </p>
                <p className="text-[13px] text-[#555] mb-3">
                  Difficulté : {recette.difficulte}
                </p>

                <Link 
                  href={`/articles/${recette.id}`} 
                  className="inline-block text-[13px] text-[#f4a887] no-underline hover:underline"
                >
                  Voir la recette →
                </Link>
              </div>
            </div>
          ))
        ) : null}
      </div>
    </main>
  );
}
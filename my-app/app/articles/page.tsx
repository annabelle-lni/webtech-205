import React from "react";
import Link from "next/link";
import { supabase } from "@/supabase/client.js";

type PageProps = {
  searchParams: {
    search?: string;
    categorie?: string;
    fete?: string;
    origine?: string;
  };
};

export default async function ArticlesPage({ searchParams }: PageProps) {
  const searchQuery = searchParams.search || "";
  const categorie = searchParams.categorie || "";
  const fete = searchParams.fete || "";
  const origine = searchParams.origine || "";

  console.log("🔍 Paramètres de filtrage:", { searchQuery, categorie, fete, origine });

  // Récupération des recettes avec filtres
  let query = supabase
    .from("recette")
    .select("id, nom, temps_preparation, categorie, fete, origine");

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

  // Récupération des photos pour chaque recette
  const recettesWithPhotos = await Promise.all(
    (recettes || []).map(async (recette) => {
      const { data: photos } = await supabase
        .from("photo")
        .select("url_photo")
        .eq("id_recette", recette.id)
        .limit(1);

      return {
        ...recette,
        photoUrl: photos && photos.length > 0 ? photos[0].url_photo : null
      };
    })
  );

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
      {hasActiveFilter && recettesWithPhotos.length === 0 && (
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
      {!hasActiveFilter && recettesWithPhotos.length === 0 && (
        <div className="mb-8">
          <p className="text-[#555] text-lg">
            Aucune recette disponible pour le moment.
          </p>
        </div>
      )}

      {/* Informations sur les résultats */}
      {recettesWithPhotos.length > 0 && (
        <div className="mb-6">
          <p className="text-[#555] text-lg">
            {recettesWithPhotos.length} recette(s) trouvée(s)
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

      {/* Grille des recettes (identique à avant) */}
      <div className="my-12 mx-auto grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-8 items-start w-[calc(100%-80px)] max-w-[1100px] box-border justify-items-center">
        {recettesWithPhotos.length > 0 ? (
          recettesWithPhotos.map((recette) => (
            <div 
              key={recette.id} 
              className="my-[10px] bg-[#FFFCEE] rounded-[5px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] w-[250px] overflow-hidden text-left my-4"
            >
              {/* Image de la recette */}
              <div className="bg-[#FFFFFF] h-[140px]">
                {recette.photoUrl ? (
                  <img 
                    src={recette.photoUrl} 
                    alt={recette.nom}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Pas d'image</span>
                  </div>
                )}
              </div>

              {/* Contenu de la carte - SIMPLIFIÉ */}
              <div className="p-5 bg-[#FFFCEE]">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{recette.nom}</h3>
                <p className="text-[13px] text-[#555] mb-3">
                  Temps de préparation : {recette.temps_preparation} min
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
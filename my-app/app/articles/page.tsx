import React from "react";
import Link from "next/link";
import { supabase } from "@/supabase/client.js";

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  // Récupération des recettes depuis Supabase
  const { data: recettes, error } = await supabase
    .from("recette")
    .select("id, nom, temps_preparation");

  if (error) {
    console.error("Erreur de récupération des recettes :", error.message);
    return <p>Erreur lors du chargement des recettes 😢</p>;
  }

  return (
    <main 
      className="flex-1 text-left mx-[10%] my-10 my-[30px] bg-[#FFFCEE] flex flex-col items-center text-center pb-20 rounded-[20px] mt-32 overflow-hidden box-border"
    >
      <h1 className="text-[22px] font-bold mt-12 pt-8 mb-8">Nos recettes</h1>
      <div className="my-12 mx-auto grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-8 items-start w-[calc(100%-80px)] max-w-[1100px] box-border justify-items-center">
        {recettes?.length > 0 ? (
          recettes.map((recette) => (
            <div
              key={recette.id}
              className="my-[10px] bg-[#FFFCEE] rounded-[5px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] w-[250px] overflow-hidden text-left my-4"
            >
              {/* Partie haute en blanc */}
              <div className="bg-[#FFFFFF]">
                <div className="h-[140px] bg-gradient-to-br from-gray-300 to-gray-600" />
                <div className="p-4">
                  <h3 className="bg-[#FFFCEE] text-[16px] font-semibold mb-2">{recette.nom}</h3>
                </div>
              </div>
              
              {/* Partie basse dans la couleur de base avec plus d'espace */}
              <div className="p-5 bg-[#FFFCEE]">
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
        ) : (
          <p className="text-center">Aucune recette trouvée.</p>
        )}
      </div>
    </main>
  );
}

    //conseil du prof
    //object subpabase puis on stock et apres on obtient une url de l'image pour l'envoyer dans la bdd
    //https://supabase.com/docs/guides/storage

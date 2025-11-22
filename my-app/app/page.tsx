import React from "react";
import Link from "next/link";
import { supabase } from "@/supabase/client.js";

export const dynamic = "force-dynamic"; // Force le rendu à jour côté serveur

//fonction qui permet de faire un mélange aléatoire
function shuffle<T>(arr: T[]) { 
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default async function Home() {
  // Récupération des recettes depuis Supabase
  const { data: recettes, error } = await supabase
    .from("recette")
    .select("id, nom, temps_preparation");

  if (error) {
    console.error("Erreur de récupération des recettes :", error.message);
    return <p>Erreur lors du chargement des recettes </p>;
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

  // On affiche aléatoirement 4 recettes
  const recettesToShow = recettesWithPhotos && recettesWithPhotos.length > 4 
    ? shuffle(recettesWithPhotos).slice(0, 4) 
    : recettesWithPhotos ?? [];

  return (
    <div className="min-h-screen pt-8 ">
      
      {/* Premier bloc */}
      <div className="mx-[10%] my-[30px] bg-[#FFFCEE] flex flex-col items-center text-center rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
        {/* mx-[10%] → marge gauche/droite de 10% */}
        {/* my-[30px] → marge haut/bas de 30px */}
        {/* rounded-[20px] → coins arrondis de 20px */}
        {/*flex flex-col items-center → centre le contenu */}
        {/*shadow-[0_2px_10px_rgba(0,0,0,0.1)] → ombre légère */}

        <h1 className="font-bold">Bienvenue sur Cooking.com !</h1>

        <p className="italic">
          Découvrez des recettes délicieuses et faciles à préparer pour toutes les occasions.
          <br />
          Que vous soyez un chef expérimenté ou un débutant en cuisine, nous avons quelque chose pour vous.
        </p>
        <br />
      </div>

      {/* Deuxième bloc avec espace */}
      <div className="mx-[10%] bg-[#FFFCEE] flex flex-col items-center text-center rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
        <h2 className="font-bold">Nos recettes du moment :</h2>

        {/* Grille des recettes - STYLE PAGE ARTICLES */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] w-[calc(100%-80px)] max-w-[1100px] justify-items-center">
          {/* grid-cols-[repeat(auto-fill,minmax(230px,1fr))] → grille responsive avec min 230px */}
          {/* gap-8 → espace de 2rem (32px) entre les cartes */}
          {/* w-[calc(100%-80px)] → largeur 100% moins 80px : pour avoir l'espace entre les cartes de recette */}
          {/* max-w-[1100px] → largeur max de 1100px */}


          {recettesToShow.length > 0 ? (
            recettesToShow.map((recette) => (
              <div
                key={recette.id}
                className="bg-[#FFFCEE] shadow-[0_1px_3px_rgba(0,0,0,0.1)] w-[250px] text-left"
              >
                {/* shadow-[0_1px_3px_rgba(0,0,0,0.1)] → ombre légère */}
                {/* w-[250px] → largeur fixe de 250px */}

                {/* Image */}
                  <div className="h-[140px]">
                    {/* h-[140px] → hauteur fixe de 140px */}
                    {recette.photoUrl ? (
                      <img 
                        src={recette.photoUrl} 
                        alt={recette.nom}
                        className="w-full h-full object-cover"/>
                      
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#FFFFFF] to-[#EEEEEE] flex items-center justify-center">
                        {/* bg-gradient-to-br → dégradé gris */}
                        <span className="italic">Pas d'image</span>
                      </div>
                    )}
                </div>
                
                {/* Partie basse dans la couleur de base avec plus d'espace */}
                <div className="bg-[#FFFCEE] mx-[10px] my-[10px] pb-[15px]">
                  {/* mx-[10px], my-[10px] & pb-[15px] → marges pour meilleur affichage */}
                  <h3 className="font-semibold">{recette.nom}</h3>
                  <p className="text-[13px]">
                    Temps de préparation : {recette.temps_preparation} min
                  </p>
                  <Link 
                    href={`/articles/${recette.id}`} 
                    className="text-[13px] text-[#f4a887] no-underline hover:underline">                 
                    Voir la recette →
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">Aucune recette trouvée.</p>
          )}
        </div>

        {/* Témoignage avec plus d'espace depuis les recettes */}
        <div className="bg-[#FFFFFF] my-[50px] pb-[20px] border-l-4 border-[#f4a887] w-[90%] max-w-4xl mx-auto text-left shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          {/* max-w-4xl → Largeur maximale de 56rem (896px) */}
          {/* my-[50px] → marge haut et bas de 50px */}
          {/* pb-[20px] → fait un padding de 20px en bas*/}
          {/* border-l-4 et border-[#f4a887] → barre orange de 4px sur le côté gauche */}
          
          <p className="mx-[15px] leading-relaxed mb-4 text-base">

            <strong className="font-semibold">Cooking a changé ma vie !</strong> Grâce à ce site j'ai pu diversifier mes
            connaissances dans les plats et les desserts. J'ai pu totalement me reconstruire et
            retrouver une famille. Maintenant j'ai une femme et 2 enfants qui mangent
            diversifiés. Merci encore !
          </p>
          <em className="mx-[5px] text-sm">~ Commentaire de l'un de nos meilleurs clients (Jonathan Cohen)</em>
        </div>
      </div>
    </div>
  );
}

    //conseil du prof
    //object subpabase puis on stock et apres on obtient une url de l'image pour l'envoyer dans la bdd
    //https://supabase.com/docs/guides/storage
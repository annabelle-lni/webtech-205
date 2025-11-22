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
    return <p>Erreur lors du chargement des recettes 😢</p>;
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
      <div className="mx-[10%] my-[30px] bg-[#FFFCEE] flex flex-col items-center text-center pb-12 rounded-[20px] mt-32 mb-12">
        {/* mx-[10%] → marge gauche/droite de 10% */}
        {/* my-[30px] → marge haut/bas de 30px */}
        {/* pb-12 → padding bas de 3rem (48px) */}
        {/* rounded-[20px] → coins arrondis de 20px */}
        {/* mt-32 → marge haut de 8rem (128px) depuis le header */}
        {/* mb-12 → marge bas de 3rem (48px) vers le bloc suivant */}

        <h1 className="text-2xl font-bold mt-12 pt-8">Bienvenue sur Cooking.com !</h1>

        <p className="text-[#555] py-5 w-4/5 text-center leading-relaxed text-lg mb-4 italic">
          {/* py-5 → padding vertical de 1.25rem (20px) */}
          {/* w-4/5 → largeur de 80% */}

          Découvrez des recettes délicieuses et faciles à préparer pour toutes les occasions.
          <br />
          Que vous soyez un chef expérimenté ou un débutant en cuisine, nous avons quelque chose pour vous.
        </p>
        <br />
      </div>

      {/* Deuxième bloc avec espace */}
      <div className="mx-[10%] my-[30px] bg-[#FFFCEE] flex flex-col items-center text-center pb-16 rounded-[20px] mb-12">
        {/*mb-12 → marge en bas de 12px */}
        {/*pb-16 → padding en bas de 4rem (64px) */}


        <h2 className="text-[22px] font-bold mt-12 pt-8 mb-12">Nos recettes du moment :</h2>
        {/* mt-12 pt-8 → espace en haut */}
        {/* mb-12 → marge bas de 3rem (48px) vers les recettes */}

        {/* Grille des recettes - STYLE PAGE ARTICLES */}
        <div className="my-12 mx-auto grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-8 items-start w-[calc(100%-80px)] max-w-[1100px] box-border justify-items-center">
          {/* my-12 → marge verticale de 3rem (48px) */}
          {/* grid-cols-[repeat(auto-fill,minmax(230px,1fr))] → grille responsive avec min 230px */}
          {/* gap-8 → espace de 2rem (32px) entre les cartes */}
          {/* w-[calc(100%-80px)] → largeur 100% moins 80px */}
          {/* max-w-[1100px] → largeur max de 1100px */}


          {recettesToShow.length > 0 ? (
            recettesToShow.map((recette) => (
              <div
                key={recette.id}
                className="bg-[#FFFCEE] rounded-[5px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] w-[250px] overflow-hidden text-left my-4"
              >
                {/* rounded-[5px] → coins arrondis de 5px */}
                {/* shadow-[0_1px_3px_rgba(0,0,0,0.1)] → ombre légère */}
                {/* w-[250px] → largeur fixe de 250px */}
                {/* my-4 → marge verticale de 1rem (16px) */}

                {/* Partie haute en blanc */}
                <div className="bg-[#FFFFFF]">
                  <div className="h-[140px] flex items-center justify-center">
                    {/* h-[140px] → hauteur fixe de 140px */}
                    {/* flex items-center justify-center → centre le contenu */}
                    {recette.photoUrl ? (
                      <img 
                        src={recette.photoUrl} 
                        alt={recette.nom}
                        className="w-full h-full object-cover"/>
                      
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-600 flex items-center justify-center">
                        {/* bg-gradient-to-br → dégradé gris */}
                        <span className="text-gray-500 text-sm">Pas d'image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    {/* p-4 → padding de 1rem (16px) */}
                    <h3 className="bg-[#FFFCEE] text-[16px] font-semibold mb-2">{recette.nom}</h3>
                    {/* mb-2 → marge basse de 0.5rem (8px) */}
                  </div>
                </div>
                
                {/* Partie basse dans la couleur de base avec plus d'espace */}
                <div className="p-5 bg-[#FFFCEE]">
                  <p className="text-[13px] text-[#555] mb-3">
                    {/* mb-3 → marge basse de 0.75rem (12px) */}
                    Temps de préparation : <span className="font-medium">{recette.temps_preparation} min</span>
                  </p>
                  <Link 
                    href={`/articles/${recette.id}`} 
                    className="inline-block text-[13px] text-[#f4a887] no-underline hover:underline">
                    {/* inline-block → affichage en ligne avec largeur */}
                  
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
        <div className="bg-[#FFFFFF] my-[50px] pb-[20px] p-8 border-l-4 border-[#f4a887] w-[90%] max-w-4xl mx-auto text-left">
          {/* max-w-4xl → Largeur maximale de 56rem (896px) */}
          {/* my-[50px] → marge haut et bas de 50px */}
          {/* pb-[20px] → fait un padding de 20px en bas*/}
          {/* border-l-4 et border-[#f4a887] → barre orange de 4px sur le côté gauche */}
          
          <p className="mx-[15px] text-gray-700 leading-relaxed mb-4 text-base">

            <strong className="font-semibold">Cooking a changé ma vie !</strong> Grâce à ce site j'ai pu diversifier mes
            connaissances dans les plats et les desserts. J'ai pu totalement me reconstruire et
            retrouver une famille. Maintenant j'ai une femme et 2 enfants qui mangent
            diversifiés. Merci encore !
          </p>
          <em className="mx-[5px] text-gray-600 text-sm">~ Commentaire de l'un de nos meilleurs clients (Jonathan Cohen)</em>
        </div>
      </div>
    </div>
  );
}

    //conseil du prof
    //object subpabase puis on stock et apres on obtient une url de l'image pour l'envoyer dans la bdd
    //https://supabase.com/docs/guides/storage
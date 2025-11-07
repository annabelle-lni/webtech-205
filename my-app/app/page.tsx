import React from "react";
import "./globals.css";
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

  // On affiche aléatoirement 4 recettes
  const recettesToShow = recettes && recettes.length > 4 ? shuffle(recettes).slice(0, 4) : recettes ?? [];

  return (
    <div className="Page accueil">
      {/* Section principale */}
      <main className="main-content" style={{ marginTop: "130px" }}>
        <h1>Bienvenue sur Cooking.com !</h1>
        <p>
          Découvrez des recettes délicieuses et faciles à préparer pour toutes les occasions.
          <br />
          Que vous soyez un chef expérimenté ou un débutant en cuisine,nous avons quelque chose
          pour vous.
        </p>
      </main>

      <main className="main-content">
        <h2 className="titre">Nos recettes du moment :</h2>
        <div className="recipes">
          {recettesToShow.length > 0 ? (
            recettesToShow.map((recette) => (
              <div key={recette.id} className="recipe-card">
                <div className="recipe-image" />
                <div className="recipe-content">
                  <h3>{recette.nom}</h3>
                  <p>Temps de préparation : {recette.temps_preparation} min</p>
                  <Link href={`/articles/${recette.id}`} className="recipe-link">
                    Voir la recette →
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p>Aucune recette trouvée.</p>
          )}
        </div>

        <div className="temoignage">
          <p>
            <strong>Cooking a changé ma vie !</strong> Grâce à ce site j'ai pu diversifier mes
            connaissances dans les plats et les desserts. J'ai pu totalement me reconstruire et
            retrouver une famille. Maintenant j'ai une femme et 2 enfants qui mangent
            diversifiés. Merci encore !
          </p>
          <em>~ Commentaire de l'un de nos meilleurs clients (Jonathan Cohen)</em>
        </div>
        <br />
      </main>
    </div>
  );
}

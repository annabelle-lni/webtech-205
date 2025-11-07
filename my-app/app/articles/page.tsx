import React from "react";
import Link from "next/link";
import { supabase } from "@/supabase/client.js";

export const dynamic = "force-dynamic"; // Force le rendu à jour côté serveur

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
      className="main-content"
      style={{ marginTop: "130px", overflow: "hidden", boxSizing: "border-box" }}
    >
      <h1 className="titre">Nos recettes</h1>
      <div
        className="recipes">
        {recettes?.length > 0 ? (
          recettes.map((recette) => (
            <div
              key={recette.id}
              className="recipe-card">
              <div className="recipe-image" />
              <div
                className="recipe-content">
                <h3>{recette.nom}</h3>
                <p>
                  Temps de préparation : {recette.temps_preparation} min
                </p>
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
    </main>
  );
}

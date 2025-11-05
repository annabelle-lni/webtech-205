import React from "react";
import "./globals.css";

export default function Home() {
  return (
    <div className="Page accueil">
      {/* Section principale */}
      <main className="main-content" style ={{ marginTop: "130px" }}> {/* On décale le main pour pas qu'il soit caché par le header qui est maintenant fixé */}
        {/* Introduction */}
        <h1>Bienvenue sur Cooking.com !</h1>
        <p>Découvrez des recettes délicieuses et faciles à préparer pour toutes lesoccasions.
        <p>Que vous soyez un chef expérimenté ou un débutant en cuisine,nous avons quelque chose pour vous.
        </p></p>
      </main>

      <main className="main-content">
        <h2 className="titre">Nos recettes du moment :</h2>
        {/* Cartes de recettes */}
        <div className="recipes">
          {[1, 2, 3].map((num) => (
            <div key={num} className="recipe-card">
              <div className="recipe-image" />
              <div className="recipe-content">
                <h3>Recette {num}</h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
                <a href="#" className="recipe-link">
                  Plus d'infos sur la recette →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Témoignage */}
        <div className="temoignage">
          <p>
            <strong>Cooking a changé ma vie !</strong> Grâce à ce site j'ai pu
            diversifier mes connaissances dans les plats et les desserts. J'ai pu
            totalement me reconstruire et retrouver une famille. Maintenant j'ai une
            femme et 2 enfants qui mangent diversifiés. Merci encore !
          </p>
          <em>
            ~ Commentaire de l'un de nos meilleurs clients (Jonathan Cohen)
          </em>
        </div>
        <br></br>

      </main>
    </div>
    
  );
}

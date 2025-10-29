import React from "react";
import "./globals.css";

export default function Home() {
  return (
    <div className="Page accueil">
      {/* Section principale */}
      <main className="main-content">
        {/* Introduction */}
        <h2 className="titre">Cooking, notre histoire :</h2>
        <p className="subtitle">
          Le plus beau site web que vous aurez vu. On accepte aucune critique
          négative mais uniquement les critiques constructives et surtout
          positives.
        </p>
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

      {/* Footer */}
      <footer className="footer">Copyright © 2021 Company name</footer>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";

export default function Notrehistoire() {
  const [selectedTheme, setSelectedTheme] = useState("clair");

  // Charger et appliquer le thème au chargement
    useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme') || "clair";
    setSelectedTheme(savedTheme);
  }, []);

  // Appliquer le thème quand il change
  useEffect(() => {
    if (selectedTheme === "sombre") {
      document.documentElement.classList.add("dark-theme");
      document.body.style.backgroundColor = "#1a1a1a";
      document.body.style.color = "#ffffff";
    } else {
      document.documentElement.classList.remove("dark-theme");
      document.body.style.backgroundColor = "#f5f8fc";
      document.body.style.color = "#333";
    }
  }, [selectedTheme]);

  return (
    <div className={`my-[30px] min-h-screen transition-colors duration-300 ${
      selectedTheme === "sombre" ? "bg-[#111827]" : "bg-[#f5f8fc]"
    }`}>
      
      {/* Section principale */}
      <main className={`flex-1 text-left mx-[10%] my-10 flex flex-col items-center text-center gap-2 pb-[60px] rounded-[20px] shadow-[0_6px_20px_rgba(0,0,0,0.08)] mt-32 transition-colors duration-300 ${
        selectedTheme === "sombre" ? "bg-[#1F2937] text-[#FFFFFF]" : "bg-[#FFFCEE] text-[#333333]"
      }`}>
        
        {/* Titre avec les mêmes styles que .titre */}
        <h2>Cooking, notre histoire :</h2>
        
        {/* Paragraphes avec marges */}
        <p className={`mx-[30px] my-4 text-justify ${
          selectedTheme === "sombre" ? "text-[#D1D5DB]" : "text-[#333333]"
        }`}>
          Coocking a été fondé en 2023 par Jean Dupont, un passionné de cuisine qui voulait partager ses recettes familiales avec le monde entier. L'idée est née dans la cuisine de sa grand-mère, où il a appris à préparer des plats traditionnels tout en y ajoutant une touche moderne. Depuis lors, Cooking.com est devenu une plateforme où les amateurs de cuisine peuvent découvrir, apprendre et partager des recettes de toutes sortes.
        </p>
        
        <p className={`mx-[30px] my-4 text-justify ${
          selectedTheme === "sombre" ? "text-[#D1D5DB]" : "text-[#333333]"
        }`}>
          Notre mission est de rendre la cuisine accessible à tous, en proposant des recettes simples, délicieuses et adaptées à tous les niveaux de compétence. Que vous soyez un débutant cherchant à apprendre les bases ou un chef expérimenté à la recherche d'inspiration, Cooking.com a quelque chose à offrir.
        </p>

        {/* Image avec hauteur maximale */}
        <img 
          src="/notrehistoire.jpg" 
          className="my-[30px] max-h-[200px]"
          alt="René, la grand-mère du fondateur de Cooking.com"
        />
        
        {/* Légende avec les mêmes styles que .subtitle */}
        <p className={`py-5 w-4/5 text-center leading-relaxed italic ${
          selectedTheme === "sombre" ? "text-[#D1D5DB]" : "text-[#555555]"
        }`}>
          René, la grand mère du fondateur de Cooking.com
        </p>  
      </main>
    </div>
  );
}
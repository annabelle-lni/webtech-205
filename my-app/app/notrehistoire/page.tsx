export default function Notrehistoire() {
  return (
    <div className="my-[30px] min-h-screen">
      {/* Section principale */}
      <main className="flex-1 text-left mx-[10%] my-10 bg-[#FFFCEE] flex flex-col items-center text-center gap-2 pb-[60px] rounded-[20px] mt-32">
        
        {/* Titre avec les mêmes styles que .titre */}
        <h2 className="text-[22px] font-bold mt-8 pt-8 mb-0">Cooking, notre histoire :</h2>
        
        {/* Paragraphes avec marges */}
        <p className="mx-[30px] my-4 text-justify">
          {/* mx-[30px] → remplace marginLeft et marginRight */}
          {/* my-4 → marge verticale de 1rem */}
          {/* text-justify → texte justifié */}
          Coocking a été fondé en 2023 par Jean Dupont, un passionné de cuisine qui voulait partager ses recettes familiales avec le monde entier. L'idée est née dans la cuisine de sa grand-mère, où il a appris à préparer des plats traditionnels tout en y ajoutant une touche moderne. Depuis lors, Cooking.com est devenu une plateforme où les amateurs de cuisine peuvent découvrir, apprendre et partager des recettes de toutes sortes.
        </p>
        
        <p className="mx-[30px] my-4 text-justify">
          Notre mission est de rendre la cuisine accessible à tous, en proposant des recettes simples, délicieuses et adaptées à tous les niveaux de compétence. Que vous soyez un débutant cherchant à apprendre les bases ou un chef expérimenté à la recherche d'inspiration, Cooking.com a quelque chose à offrir.
        </p>

        {/* Image avec hauteur maximale */}
        <img 
          src="/notrehistoire.jpg" 
          className="my-[30px] max-h-[200px] my-4"
          alt="René, la grand-mère du fondateur de Cooking.com"
        />
        
        {/* Légende avec les mêmes styles que .subtitle */}
        <p className="text-[#555] py-5 w-4/5 text-center leading-relaxed text-lg mb-4 italic">
          René, la grand mère du fondateur de Cooking.com
        </p>  
      </main>
    </div>
  );
}

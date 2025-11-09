export default function Notrehistoire() {
  return (
    <div className="Page sur notre histoire">
      {/* Section principale */}
      <main className="main-content" style ={{ marginTop: "130px" }}> {/* On décale le main pour pas qu'il soit caché par le header qui est maintenant fixé */}
        {/* Introduction */}
        <h2 className="titre">Cooking, notre histoire :</h2>
        
          <p style={{marginLeft : "30px", marginRight : "30px"}}>Coocking a été fondé en 2023 par Jean Dupont, un passionné de cuisine qui voulait partager ses recettes familiales avec le monde entier. L'idée est née dans la cuisine de sa grand-mère, où il a appris à préparer des plats traditionnels tout en y ajoutant une touche moderne. Depuis lors, Cooking.com est devenu une plateforme où les amateurs de cuisine peuvent découvrir, apprendre et partager des recettes de toutes sortes.</p>
          <p style={{marginLeft : "30px", marginRight : "30px"}}>Notre mission est de rendre la cuisine accessible à tous, en proposant des recettes simples, délicieuses et adaptées à tous les niveaux de compétence. Que vous soyez un débutant cherchant à apprendre les bases ou un chef expérimenté à la recherche d'inspiration, Cooking.com a quelque chose à offrir.</p>

          <img src="/notrehistoire.jpg" style={{maxHeight : "200px"}}/>
          <p className="subtitle">
            René, la grand mère du fondateur de Cooking.com
        </p>  
      </main>

    </div>
)
}

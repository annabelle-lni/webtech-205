import { supabase } from "@/supabase/client.js";

export default async function RecettePage({ params }: { params: { recettes: string } }) {
  const { recettes } = params; // correspond à l'id dans l'URL

  // On récupère la recette correspondante depuis Supabase
  const { data, error } = await supabase
    .from("recette")
    .select("*")
    .eq("id", recettes)
    .single();

  if (error) {
    console.error("Erreur Supabase :", error.message);
    return (
      <main className="main-content">
        <h1 className="titre">Recette introuvable 😢</h1>
        <p>Impossible de trouver la recette avec l’id {recettes}.</p>
      </main>
    );
  }

  return (
    <main className="main-content" style ={{ marginTop: "130px" }}>
      <h1 className="titre">{data.nom}</h1>

      <section className="recipe-details">
        <p>
          <strong>Temps de préparation :</strong>{" "}
          {data.temps_preparation} minutes
        </p>

        <h2>Ingrédients</h2>
        <p>{data.ingredient}</p>

        <h2>Préparation</h2>
        <p>{data.preparation}</p>
      </section>
    </main>
  );
}

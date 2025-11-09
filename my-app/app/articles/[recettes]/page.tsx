import { supabase } from "@/supabase/client";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    recettes: string;
  };
};

export default async function RecettePage({ params }: any) {
  const { recettes } = params;

  const { data, error } = await supabase
    .from("recette")
    .select("*")
    .eq("id", recettes)
    .single();

  if (error || !data) {
    console.error("Erreur Supabase :", error?.message);
    return notFound(); // Utilise la page 404 de Next.js
  }

  return (
    <main className="main-content" style={{ marginTop: "130px" }}>
      <h1 className="titre">{data.nom}</h1>

      <section className="recipe-details">
        <p>
          <strong>Temps de préparation :</strong> {data.temps_preparation} minutes
        </p>

        <h2>Ingrédients</h2>
        <p>{data.ingredient}</p>

        <h2>Préparation</h2>
        <p>{data.preparation}</p>
      </section>
    </main>
  );
}

import { supabase } from "@/supabase/client";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    recettes: string;
  };
};

{/*VISUEL A GR2ANDEMENT AMELIORER*/}
export default async function RecettePage({ params }: any) {
  const { recettes } = params;

  // Récupération de la recette et de ses photos
  const { data: recetteData, error } = await supabase
    .from("recette")
    .select("*")
    .eq("id", recettes)
    .single();

  // Récupération des photos associées à la recette
  const { data: photosData } = await supabase
    .from("photo")
    .select("url_photo")
    .eq("id_recette", recettes)
    .limit(1);

  if (error || !recetteData) {
    console.error("Erreur Supabase :", error?.message);
    return notFound();
  }

  const photoUrl = photosData && photosData.length > 0 ? photosData[0].url_photo : null;

  return (
    <div className="my-[30px] min-h-screen">
      {/* Main content avec layout amélioré */}
      <main className="flex-1 text-left mx-[10%] my-10 bg-[#FFFCEE] flex flex-col pb-[60px] rounded-[20px] mt-32">
        
        {/* Titre centré */}
        <h1 className="text-[22px] font-bold mt-8 pt-8 mb-8 text-center">
          {recetteData.nom}
        </h1>

        {/* Container principal avec sidebar pour l'image */}
        <div className="flex flex-col lg:flex-row gap-8 px-8">
          
          {/* Sidebar pour l'image - visible à gauche sur grand écran */}
          <div className="lg:w-1/3 flex flex-col items-center">
            <div className="w-full max-w-[300px] bg-white rounded-lg shadow-md overflow-hidden">
              {photoUrl ? (
                <img 
                  src={photoUrl} 
                  alt={recetteData.nom}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                  <span className="text-gray-500">Image non disponible</span>
                </div>
              )}
            </div>
            
            {/* Informations temps de préparation dans la sidebar */}
            <div className="mt-6 p-4 bg-white rounded-lg shadow-sm w-full max-w-[300px]">
              <p className="text-lg font-semibold text-center text-gray-800">
                ⏱️ Temps de préparation :{" "}
                <span className="text-[#f4a887] font-bold">
                  {recetteData.temps_preparation} minutes
                </span>
              </p>
            </div>
          </div>

          {/* Contenu principal de la recette */}
          <div className="lg:w-2/3 space-y-8">
            
            {/* Section Ingrédients */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f4a887]">
                🛒 Ingrédients
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {recetteData.ingredient}
              </div>
            </section>

            {/* Section Préparation */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f4a887]">
                👨‍🍳 Préparation
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {recetteData.preparation}
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
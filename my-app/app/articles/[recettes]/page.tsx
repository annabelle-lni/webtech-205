"use client";
import { useState, useEffect, use } from "react";
import { supabase } from "@/supabase/client";
import { useRouter } from "next/navigation";

type PageProps = {
  params: Promise<{
    recettes: string;
  }>;
};

export default function RecettePage({ params }: PageProps) {
  const { recettes } = use(params);
  const router = useRouter();
  
  const [recetteData, setRecetteData] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  
  // userRating symbolise la note de l'utilisateur
  const [userRating, setUserRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [recettes]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      const { data: recette, error } = await supabase
        .from("recette")
        .select("*")
        .eq("id", recettes)
        .single();

      if (error || !recette) throw error;
      setRecetteData(recette);
      
      // Les commentaires
      await fetchComments(recettes);
      
      if (currentUser) {
        const { data: myNote } = await supabase
          .from("notes")
          .select("valeur")
          .eq("recette_id", recettes)
          .eq("user_id", currentUser.id)
          .maybeSingle();
          
        if (myNote) setUserRating(myNote.valeur);
      }

      if (currentUser) {
        const { data: savedEntry } = await supabase
          .from("recettes_sauvegardees")
          .select("id")
          .eq("user_id", currentUser.id)
          .eq("recette_id", recettes)
          .maybeSingle();

        if (savedEntry) setIsSaved(true);
    }

    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async (recetteId: string) => {
    const { data } = await supabase
      .from("commentaire")
      .select(`*, profiles:proprietaire_id(prenom, nom)`)
      .eq("id_recette", recetteId)
      .order("created_at", { ascending: false });
    if (data) setComments(data);
  };

  const handleRating = async (rating: number) => {
    if (!user) {
      alert("Connectez-vous pour noter !");
      router.push('/connexion');
      return;
    }

    try {
      setIsSubmitting(true);
      setUserRating(rating);

      const { error } = await supabase
        .from("notes")
        .upsert({
          user_id: user.id,
          recette_id: recettes, 
          valeur: rating
        }, { onConflict: 'user_id, recette_id' });

      if (error) throw error;

      const { data: updatedRecette } = await supabase
        .from("recette")
        .select("note")
        .eq("id", recettes)
        .single();
        
      if (updatedRecette) {
        setRecetteData((prev: any) => ({ ...prev, note: updatedRecette.note }));
      }

    } catch (error) {
      console.error("Erreur notation:", error);
      alert("Erreur lors de la notation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      alert("Connectez-vous pour enregistrer une recette !");
      router.push('/connexion');
      return;
    }

    try {
      if (isSaved) {
        const { error } = await supabase
          .from("recettes_sauvegardees")
          .delete()
          .eq("user_id", user.id)
          .eq("recette_id", recettes);
      
        if (error) throw error;
        setIsSaved(false);
      } else {
        const { error } = await supabase
          .from("recettes_sauvegardees")
          .insert([{ user_id: user.id, recette_id: recettes }]);
      
        if (error) throw error;
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Erreur favoris:", error);
    }
  };

  const handleAddComment = async () => {
    if (!user) return alert("Connectez-vous !");
    if (!newComment.trim()) return;
    try {
      setIsSubmitting(true);
      const { error } = await supabase.from("commentaire").insert([{
        id_recette: recettes, proprietaire_id: user.id, contenu: newComment.trim()
      }]);
      if (error) throw error;
      setNewComment("");
      await fetchComments(recettes);
    } catch (e) { console.error(e); } finally { setIsSubmitting(false); }
  };

  const handleDeleteComment = async (id: string) => {
    if (!confirm("Supprimer ?")) return;
    const { error } = await supabase.from("commentaire").delete().eq("id", id);
    if (!error) await fetchComments(recettes);
  };

  if (isLoading) return <div className="my-[30px] min-h-screen flex justify-center pt-32">Chargement...</div>;
  if (!recetteData) return <div className="my-[30px] min-h-screen flex justify-center pt-32">Recette introuvable</div>;

  const displayAverage = recetteData.note ? Number(recetteData.note).toFixed(1) : "0";

  return (
    <div className="my-[30px] min-h-screen">
      <main className="flex-1 text-left mx-[10%] my-10 bg-[#FFFCEE] flex flex-col pb-[60px] rounded-[20px] mt-32">
        
        <h1 className="text-[22px] font-bold mt-8 pt-8 mb-8 text-center">{recetteData.nom}</h1>

        <div className="flex flex-col lg:flex-row gap-8 px-8">
          <div className="lg:w-1/3 flex flex-col items-center">
            
            {/* Image */}
            <div className="w-full max-w-[300px] bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {recetteData.images ? (
                <img 
                  src={recetteData.images} 
                  alt={recetteData.nom} 
                  className="w-full h-64 object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#FFFFFF] to-[#EEEEEE] flex items-center justify-center">
                  {/* bg-gradient-to-br → dégradé gris */}
                  <span className="italic">Pas d'image</span>
                </div>
              )}
            </div> 

            {/* Temps de préparation */}
            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm w-full max-w-[300px]">
              <p className="text-lg font-semibold text-center text-gray-800">
                ⏱️ Préparation : <span className="text-[#f4a887]">{recetteData.temps_preparation} min</span>
              </p>
            </div>

          {/* AJOUT: Affichage des informations supplémentaires */}
            {(recetteData.categorie || recetteData.fete || recetteData.origine) && (
              <div className="mt-4 p-4 rounded-lg shadow-sm w-full max-w-[300px]">
                <h3 className="text-lg font-semibold text-center mb-2">Informations</h3>
                
                {/* Bloc Moyenne Globale */}
                <div className="p-4 rounded-lg shadow-sm w-full max-w-[300px]">
                  <p className="text-lg font-semibold text-center">
                  Note moyenne : <span className="text-[#f4a887] font-bold text-2xl">{displayAverage}</span>/5
                  </p>
                </div>

                {recetteData.categorie && (
                  <p className="text-sm text-gray-700 mb-1 text-center">
                    <span className="font-medium">Catégorie:</span> {recetteData.categorie}
                  </p>
                )}
                {recetteData.fete && (
                  <p className="text-sm text-gray-700 mb-1 text-center">
                    <span className="font-medium">Fête:</span> {recetteData.fete}
                  </p>
                )}
                {recetteData.origine && (
                  <p className="text-sm text-gray-700 text-center">
                    <span className="font-medium">Origine:</span> {recetteData.origine}
                  </p>
                )}
              </div>        
            )}
            {/* Bouton Enregistrer */}
            
          </div>

          {/*je veux que le bouton soit a droite de l image*/}
          <div className=" my-[10px] mx-[10px] text-right">
            <button
              onClick={handleToggleSave}
              className={`px-[1.2rem] py-[0.7rem] border-none rounded-[3px] text-base cursor-pointer bg-[#f4a887] hover:bg-[#FFFCEE]`}
            >
              {isSaved ? "Recette enregistrée ★" : "Enregistrer la recette ☆"}
            </button>
          </div>


          {/*si on aime pas le blanc on pourra remettre la*/}
          <div className="bg-[#FFFFFF] p-6 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.04)] mx-[10px]">
            {/* Ingrédients */}
            <section className="bg-[#FFFCEE] p-6 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.04)] mx-[10px]">
              <h2>🛒 Ingrédients</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">{recetteData.ingredient}</div>
            </section>

            {/* Préparation */}
            <section className="bg-[#FFFCEE] p-6 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.04)] mx-[10px]">
              <h2>👨‍🍳 Préparation</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">{recetteData.preparation}</div>
            </section>

            {/* Bloc Notation */}
            <section className="bg-[#FFFCEE] p-6 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.04)] mx-[10px]">
              <h2>🗒️ Notez cette recette</h2>
              <div className="flex space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    disabled={isSubmitting}
                    className={`text-2xl ${star <= userRating ? "text-yellow-500" : "text-gray-300"}`}
                  >★</button>
                ))}
              </div>
              <p className="text-sm text-gray-500">{userRating > 0 ? `Votre note : ${userRating}` : "Vous avez essayé la recette ? Donnez une note !"}</p>
            </section>

            {/* Commentaires */}
            <section className="bg-[#FFFCEE] p-6 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.04)] mx-[10px]">
              <h2>💬 Commentaires ({comments.length})</h2>
              
              {user && (
                <div className="">
                  <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Votre avis..." className="w-full px-4 py-3 border-2 border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] outline-none resize-none" rows={3} />
                  <button onClick={handleAddComment} disabled={isSubmitting || !newComment.trim()} className="px-[1.2rem] py-[0.7rem] bg-[#f4a887] border-none rounded-[3px] text-base cursor-pointer hover:bg-[#FFFCEE]">
                    {isSubmitting ? "Envoi..." : "Publier"}
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {comments.length > 0 ? comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-gray-800">{comment.profiles?.prenom || "Anonyme"} {comment.profiles?.nom}</p>
                      {user && user.id === comment.proprietaire_id && <button onClick={() => handleDeleteComment(comment.id)} className="text-red-500 text-xs hover:underline">Supprimer</button>}
                    </div>
                    <p className="text-gray-700">{comment.contenu}</p>
                  </div>
                )) : <p className="text-gray-500 text-center italic">Soyez le premier à commenter !</p>}
              </div>
              
              {!user && <div className="text-center mt-4"><button onClick={() => router.push("/connexion")} className="text-[#f4a887] underline hover:text-orange-600">Connectez-vous pour participer</button></div>}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
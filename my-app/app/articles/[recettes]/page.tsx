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
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
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

      // On récupère la photo
      const { data: photos } = await supabase
        .from("photo")
        .select("url_photo")
        .eq("id_recette", recettes)
        .limit(1);
      setPhotoUrl(photos?.[0]?.url_photo || null);

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
              {photoUrl ? <img src={photoUrl} alt={recetteData.nom} className="w-full h-64 object-cover" /> : <div className="h-64 bg-gray-200 text-center pt-24">Pas d'image</div>}
            </div>

            {/* Bloc Notation */}
            <div className="p-4 bg-white rounded-lg shadow-sm w-full max-w-[300px] mb-4">
              <h3 className="text-lg font-semibold text-center mb-3">Noter cette recette</h3>
              <div className="flex justify-center space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    disabled={isSubmitting}
                    className={`text-2xl ${star <= userRating ? "text-yellow-500" : "text-gray-300"}`}
                  >★</button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-500">{userRating > 0 ? `Votre note : ${userRating}` : "Notez !"}</p>
            </div>

            {/* Bloc Moyenne Globale */}
            <div className="p-4 bg-white rounded-lg shadow-sm w-full max-w-[300px]">
              <p className="text-lg font-semibold text-center">
                Note moyenne : <span className="text-[#f4a887] font-bold text-2xl">{displayAverage}</span>/5
              </p>
            </div>

            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm w-full max-w-[300px]">
              <p className="text-lg font-semibold text-center text-gray-800">
                ⏱️ Préparation : <span className="text-[#f4a887]">{recetteData.temps_preparation} min</span>
              </p>
            </div>
          </div>

          <div className="lg:w-2/3 space-y-8">
            {/* Ingrédients */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f4a887]">🛒 Ingrédients</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">{recetteData.ingredient}</div>
            </section>

            {/* Préparation */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f4a887]">👨‍🍳 Préparation</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">{recetteData.preparation}</div>
            </section>

            {/* Commentaires */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f4a887]">
                💬 Commentaires ({comments.length})
              </h2>
              
              {user && (
                <div className="mb-6">
                  <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Votre avis..." className="w-full px-4 py-3 border-2 border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] outline-none resize-none" rows={3} />
                  <button onClick={handleAddComment} disabled={isSubmitting || !newComment.trim()} className="mt-3 px-6 py-2 bg-[#f4a887] text-[#333] rounded-[5px] hover:bg-[#FFFCEE] disabled:opacity-50">
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
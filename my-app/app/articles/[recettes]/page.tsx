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
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // userRating symbolise la note de l'utilisateur
  const [userRating, setUserRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [recettes]);

  // Gestion du mode sombre
  useEffect(() => {
  const checkDarkMode = () => {
    const darkThemeSelected = localStorage.getItem('selectedTheme') === 'sombre';
    const hasDarkClass = document.documentElement.classList.contains('dark-theme');
    const isDarkBody = document.body.style.backgroundColor === '#1a1a1a';
    setIsDarkMode(darkThemeSelected || hasDarkClass || isDarkBody);
  };

  checkDarkMode();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class' || mutation.attributeName === 'style') {
        checkDarkMode();
      }
    });
  });

  observer.observe(document.documentElement, { attributes: true });
  observer.observe(document.body, { attributes: true });

  return () => observer.disconnect();
}, []);


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

  if (isLoading) return (
    <div className={`my-[30px] min-h-screen flex justify-center pt-32 transition-colors duration-300 ${
      isDarkMode ? "bg-[#111827] text-[#FFFFFF]" : "bg-[#f5f8fc] text-[#333333]"}`}>
      Chargement...
    </div>);


  if (!recetteData) return (
    <div className={`my-[30px] min-h-screen flex justify-center pt-32 transition-colors duration-300 ${
      isDarkMode ? "bg-[#111827] text-[#FFFFFF]" : "bg-[#f5f8fc] text-[#333333]"}`}>
      Recette introuvable
    </div>

);
  const displayAverage = recetteData.note ? Number(recetteData.note).toFixed(1) : "0";

  return (
  <div className="my-[30px] min-h-screen">
    <main className={`flex-1 text-left mx-[10%] my-10 flex flex-col pb-[60px] rounded-[20px] mt-32 transition-colors duration-300 ${
      isDarkMode ? "bg-[#1F2937] text-[#FFFFFF]" : "bg-[#FFFCEE] text-[#333333]"}`}> 
             
        <h1 className="text-[22px] font-bold mt-8 pt-8 mb-8 text-center">{recetteData.nom}</h1>

        <div className="flex flex-col lg:flex-row gap-8 px-8">
          <div className="lg:w-1/3 flex flex-col items-center">
            
            {/* Image */}
            <div className="w-full max-w-[300px] rounded-lg shadow-md overflow-hidden mb-6">
              {recetteData.images ? (
                <img 
                  src={recetteData.images} 
                  alt={recetteData.nom} 
                  className="w-full h-64 object-cover" 
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center transition-colors duration-300 ${
                  isDarkMode 
                    ? "bg-gradient-to-br from-[#374151] to-[#4B5563]" 
                    : "bg-gradient-to-br from-[#FFFFFF] to-[#EEEEEE]"}`}>
                  
                  <span className={`italic ${isDarkMode ? "text-[#D1D5DB]" : "text-[#6B7280]"}`}>Pas d'image</span>
                </div>)}
              </div> 

            {/* Temps de préparation */}
            <div className={`mt-4 p-4 rounded-lg shadow-sm w-full max-w-[300px] transition-colors duration-300 ${
              isDarkMode ? "bg-[#374151]" : "bg-[#FFFFFF]"}`}>
            
              <p className={`text-lg font-semibold text-center ${
                isDarkMode ? "text-[#E5E7EB]" : "text-[#1F2937]"}`}>
                ⏱️ Préparation : <span className={isDarkMode ? "text-[#f4a887]" : "text-[#f4a887]"}>{recetteData.temps_preparation} min</span>
              </p>
            </div>

          {/* AJOUT: Affichage des informations supplémentaires */}
            {(recetteData.categorie || recetteData.fete || recetteData.origine) && (
              <div className={`mt-4 p-4 rounded-lg shadow-sm w-full max-w-[300px] transition-colors duration-300 ${
                isDarkMode ? "bg-[#374151]" : "bg-[#FFFFFF]"}`}>
                
                <h3 className={`text-lg font-semibold text-center mb-2 ${
                  isDarkMode ? "text-[#E5E7EB]" : "text-[#1F2937]"
                }`}>Informations</h3>
  
                <div className={`p-4 rounded-lg shadow-sm w-full max-w-[300px] transition-colors duration-300 ${
                  isDarkMode ? "bg-[#4B5563]" : "bg-[#F9FAFB]"}`}>
                  <p className={`text-lg font-semibold text-center ${
                    isDarkMode ? "text-[#E5E7EB]" : "text-[#1F2937]"}`}>
                    Note moyenne : <span className={`font-bold text-2xl ${
                      isDarkMode ? "text-[#f4a887]" : "text-[#f4a887]"
                    }`}>{displayAverage}</span>/5
                  </p>
                </div>

                {recetteData.categorie && (
                  <p className={`text-sm mb-1 text-center ${
                    isDarkMode ? "text-[#D1D5DB]" : "text-[#374151]"}`}>
                      <span className="font-medium">Catégorie:</span> {recetteData.categorie}
                 </p>
                )}

                {recetteData.fete && (
                  <p className={`text-sm mb-1 text-center ${
                    isDarkMode ? "text-[#D1D5DB]" : "text-[#374151]"}`}>
                      <span className="font-medium">Fête:</span> {recetteData.fete}
                  </p>)}

                {recetteData.origine && (
                  <p className={`text-sm text-center ${
                    isDarkMode ? "text-[#D1D5DB]" : "text-[#374151]"}`}>
                      <span className="font-medium">Origine:</span> {recetteData.origine}
                  </p>)}
              </div>         
            )}            
          </div>

          {/*Bouton enregistrer*/}
          <div className=" my-[10px] mx-[10px] text-right">
            <button
              onClick={handleToggleSave}
              className={`px-[1.2rem] py-[0.7rem] border-none rounded-[3px] text-base cursor-pointer bg-[#f4a887] hover:transparent`}
            >
              {isSaved ? "Recette enregistrée ★" : "Enregistrer la recette ☆"}
            </button>
          </div>


          {/*si on aime pas le blanc on pourra remettre la*/}
            <div className={`p-6 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.04)] mx-[10px] transition-colors duration-300 ${
              isDarkMode ? "bg-[#4B5563]" : "bg-[#FFFFFF]"
            }`}>            
            
            {/* Ingrédients */}
            <section className={`p-6 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.04)] mx-[10px] transition-colors duration-300 ${
              isDarkMode ? "bg-[#1F2937]" : "bg-[#FFFCEE]"
            }`}>              
              <h2 className={`${isDarkMode ? "text-[#E5E7EB]" : "text-[#1F2937]"}`}>🛒 Ingrédients</h2>
              <div className={`leading-relaxed whitespace-pre-line ${
                isDarkMode ? "text-bg-[#FFFFFF]" : "text-[#374151]"
              }`}>{recetteData.ingredient}</div>            
            
            </section>

            {/* Préparation */}
            <section className={`p-6 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.04)] mx-[10px] transition-colors duration-300 ${
              isDarkMode ? "bg-[#1F2937]" : "bg-[#FFFCEE]"
            }`}>
              <h2 className={`${isDarkMode ? "text-[#E5E7EB]" : "text-[#1F2937]"}`}>👨‍🍳 Préparation</h2>
              <div className={`leading-relaxed whitespace-pre-line ${
                isDarkMode ? "text-bg-[#FFFFFF]" : "text-[#374151]"
              }`}>{recetteData.ingredient}</div>
            </section>

            {/* Bloc Notation */}
            <section className={`p-6 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.04)] mx-[10px] transition-colors duration-300 ${
              isDarkMode ? "bg-[#1F2937]" : "bg-[#FFFCEE]"
            }`}>
              <h2 className={`${isDarkMode ? "text-[#E5E7EB]" : "text-[#1F2937]"}`}>🗒️ Notez cette recette</h2>
              <div className="flex space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    disabled={isSubmitting}
                    className={`text-2xl ${star <= userRating ? "text-[#F59E0B]" : isDarkMode ? "text-[#6B7280]" : "text-[#D1D5DB]"}`}
                  >★</button>
                ))}
              </div>

              <p className={`text-sm ${
                isDarkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"
              }`}>{userRating > 0 ? `Votre note : ${userRating}` : "Vous avez essayé la recette ? Donnez une note !"}</p>            </section>

            {/* Commentaires */}
            <section className={`p-6 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.04)] mx-[10px] transition-colors duration-300 ${
              isDarkMode ? "bg-[#1F2937]" : "bg-[#FFFCEE]"
            }`}>
              <h2 className={`${isDarkMode ? "text-[#E5E7EB]" : "text-[#1F2937]"}`}>💬 Commentaires ({comments.length})</h2>
              
              {user && (
                <div className="">
                  <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Votre avis..." className=" border-[#E5E7EB] resize-none my-[10px] mx-[10px]" rows={3} />
                  <button onClick={handleAddComment} disabled={isSubmitting || !newComment.trim()} className="px-[1.2rem] py-[0.7rem] bg-[#f4a887] border-none rounded-[3px] text-base cursor-pointer hover:bg-[#FFFCEE]">
                    {isSubmitting ? "Envoi..." : "Publier"}
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {comments.length > 0 ? comments.map((comment) => (
                  <div key={comment.id} className={`border-b pb-4 last:border-b-0 transition-colors duration-300 ${
                    isDarkMode ? "border-[#4B5563]" : "border-[#E5E7EB]"
                  }`}>
                    <div className="flex justify-between items-start mb-1">
                      <p className={`font-semibold ${
                        isDarkMode ? "text-[#E5E7EB]" : "text-[#1F2937]"
                      }`}>{comment.profiles?.prenom || "Anonyme"} {comment.profiles?.nom}</p>
                      {user && user.id === comment.proprietaire_id && (
                        <button onClick={() => handleDeleteComment(comment.id)} className={`text-xs hover:underline ${
                          isDarkMode ? "text-[#F87171]" : "text-[#EF4444]"
                        }`}>Supprimer</button>
                      )}
                    </div>
                    <p className={isDarkMode ? "text-[#D1D5DB]" : "text-[#374151]"}>{comment.contenu}</p>
                  </div>
                )) : <p className={`text-center italic ${
                  isDarkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"
                }`}>Soyez le premier à commenter !</p>}
              </div>
              
              {!user && <div className="text-center mt-4"><button 
                onClick={() => router.push("/connexion")} 
                className={`${isDarkMode ? "text-[#f4a887] hover:text-[#FB923C]" : "text-[#f4a887] hover:text-[#F97316]"} underline`}
              >Connectez-vous pour participer</button></div>}            
              </section>
          </div>
        </div>
      </main>
    </div>
  );
}
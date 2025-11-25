"use client";
import { useState, useEffect, use } from "react";
import { supabase } from "@/supabase/client";
import { useRouter } from "next/navigation";

//----
//Malgré les paramètres le mode sombre ne s'applique pas correctement 
//----

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
    
    // Convertir l'ID de recette en number si nécessaire
    const recetteId = parseInt(recettes); // ou Number(recettes)
    
    const { error } = await supabase.from("commentaire").insert([{
      id_recette: recetteId,  // Utiliser le number
      proprietaire_id: user.id, 
      contenu: newComment.trim()
    }]);
    
    if (error) throw error;
    setNewComment("");
    await fetchComments(recettes);
  } catch (e) { 
    console.error(e); 
    alert("Erreur lors de l'ajout du commentaire");
  } finally { 
    setIsSubmitting(false); 
  }
};

  {/*Espace --- Suppression commentaire*/}
  const handleDeleteComment = async (id: string) => {
    if (!confirm("Supprimer ce commentaire ?")) return;
    try {
      const { error } = await supabase.from("commentaire").delete().eq("id", id);
      if (error) throw error;
      await fetchComments(recettes);
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  {/*Espace --- Chargement*/}
  if (isLoading) return (
    <div className={`my-[30px] flex justify-center ${
      //permet d'avoir un "Chargement..." centré pendant le chargement 
      isDarkMode ? "bg-[#111827] text-[#FFFFFF]" : "bg-[#f5f8fc] text-[#333333]"}`}>
      Chargement...
    </div>
  );

  {/*Espace --- Recette introuvable*/}
  if (!recetteData) return (
    <div className={`my-[30px] flex justify-center ${
      isDarkMode ? "bg-[#111827] text-[#FFFFFF]" : "bg-[#f5f8fc] text-[#333333]"}`}>
      Recette introuvable
    </div>
  );

  const displayAverage = recetteData.note ? Number(recetteData.note).toFixed(1) : "0";

  {/*Espace --- Affichage de la recette*/}
  return (
    <div className="my-[30px] min-h-screen">
      {/*min-h-screen permet à ce que la page soit adaptative*/}
   
      {/*Espace --- Bloc principal*/}
      <main className={`mx-[10%] flex flex-col rounded-[20px] shadow-[0_6px_20px_rgba(0,0,0,0.08)] ${
        //mx-[10%] : marge horizontale de 10%
        //flex flex-col : disposition en colonne
        isDarkMode ? "bg-[#1F2937] text-[#FFFFFF]" : "bg-[#FFFCEE] text-[#333333]"}`}>         
        
        {/*Espace --- Première section : Image & infos*/}
        <div className="flex flex-col items-center text-center">
          <h1 className="font-bold">{recetteData.nom}</h1>
         
          {/* Image */}
          <div className={`h-[140px] w-[300px] ${
            isDarkMode ? "bg-[#4B5563]" : "bg-[#FFFFFF]"
            }`}>
            {recetteData.images ? (
              <img 
                src={recetteData.images} 
                alt={recetteData.nom}
                className="w-full h-full"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br flex items-center justify-center ${
                isDarkMode 
                  ? "from-[#4B5563] to-[#374151]" 
                  : "from-[#FFFFFF] to-[#EEEEEE]"
                }`}>
                  <span className={`italic ${
                    isDarkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"
                    }`}>Pas d'image</span>
              </div>
            )}
          </div> 


            {/* Espace --- Informations supplémentaires */}
            {(recetteData.categorie || recetteData.fete || recetteData.origine) && (
              <div className={` w-full max-w-[300px] ${
                isDarkMode ? "bg-[#374151]" : "bg-[#FFFFFF]"}`}>           
                
                <h3>Informations</h3>
                <div className={`w-full max-w-[300px]`}>

                  <p> {/* Description --- Temps de préparation */}  
                    ⏱️ Préparation : <span>{recetteData.temps_preparation} min</span>
                  </p>
                  
                  <p> {/* Description --- Note moyenne */}
                    Note moyenne : <span>{displayAverage}</span>/5
                  </p>

                  {recetteData.categorie && ( //Description --- Catégorie
                    <p>
                      <span>Catégorie:</span> {recetteData.categorie}
                    </p>
                  )}

                  {recetteData.fete && ( //Description --- Fête
                    <p>
                      <span>Fête:</span> {recetteData.fete}
                    </p>
                  )}

                  {recetteData.origine && ( //Description --- Origine
                    <p>
                      <span className="font-medium">Origine:</span> {recetteData.origine}
                    </p>
                  )}
                </div>             
              </div>         
            )}            
          </div>

          {/* Bouton enregistrer */}
          <div className=" my-[10px] mx-[10px] text-right">
            <button
              onClick={handleToggleSave}
              className={`px-[1.2rem] py-[0.7rem] border-none rounded-[3px] bg-[#f4a887] hover:bg-transparent`}
            >
              {isSaved ? "Recette enregistrée ★" : "Enregistrer la recette ☆"}
            </button>
          </div>



          {/*Espace --- Deuxième section : Ingrédients, Préparation, Notation, Commentaires*/}
          <div className={`rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.04)] mx-[10px] my-[10px] ${
            isDarkMode ? "bg-[#4B5563]" : "bg-[#FFFFFF]"
          }`}>            
            
            {/* Description --- Ingrédients */}
            <section className={`rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.04)] mx-[10px] my-[10px] ${
              isDarkMode ? "bg-[#1F2937] text-[#E5E7EB]" : "bg-[#FFFCEE] text-[#1F2937]"
            }`}>              
              <h2>🛒 Ingrédients</h2>
              {recetteData.ingredient}            
            </section>

            {/* Description --- Préparation */}
            <section className={`rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.04)] mx-[10px] ${
              isDarkMode ? "bg-[#1F2937] text-[#E5E7EB]" : "bg-[#FFFCEE] text-[#1F2937]"
            }`}>
              <h2>👨‍🍳 Préparation</h2>
              <div className={`whitespace-pre-line`}>
                {recetteData.preparation}</div>
            </section>

            {/* Description --- Notation */}
            <section className={`rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.04)] mx-[10px] ${
              isDarkMode ? "bg-[#1F2937] text-[#E5E7EB]" : "bg-[#FFFCEE] text-[#1F2937]"
            }`}>
              <h2>🗒️ Notez cette recette</h2>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  disabled={isSubmitting}
                  className={`text-2xl ${star <= userRating}`}
                >
                  ★
                </button>
              ))}
             
              {/* Description --- Affichage de la note utilisateur */}
              <p>
                {userRating > 0 ? `Votre note : ${userRating}` : "Vous avez essayé la recette ? Donnez une note !"}
              </p>
            </section>

            {/* Description --- Commentaires */}
            <section className={`rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.04)] mx-[10px] my-[10px] ${
              isDarkMode ? "bg-[#1F2937] text-[#E5E7EB]" : "bg-[#FFFCEE] text-[#1F2937]"
            }`}>
              <h2>💬 Commentaires ({comments.length})</h2>
              {/* Description --- Ajout de commentaire */}
              {user && (
                <div>
                  <textarea 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)} 
                    placeholder="Partagez votre avis sur cette recette..."
                    className={`w-[99%] resize-none ${
                      isDarkMode 
                        ? "bg-[#374151] border-[#4B5563] text-[#000000]" 
                        : "bg-[#FFFFFF] border-[#D1D5DB] text-[#111827]"
                    }`}
                    rows={3}
                  />
                  
                  {/* Espace --- Bouton publier commentaire */}
                  <button 
                    onClick={handleAddComment} 
                    disabled={isSubmitting || !newComment.trim()} 
                    className={`px-[1.2rem] py-[0.7rem] border-none rounded-[3px] bg-[#f4a887] hover:bg-transparent
                    ${
                      isSubmitting || !newComment.trim()
                        ? "bg-[#9CA3AF] cursor-not-allowed"
                        : "bg-[#f4a887] hover:bg-[#e8976f] text-[#000000]"
                    }`}
                  >
                    {isSubmitting ? "Publication..." : "Publier le commentaire"}
                  </button>
                </div>  
              )}

              {/* Espace --- Liste de commentaires publiés */}
              <div>
                {comments.length > 0 ? comments.map((comment) => (
                  <div key={comment.id} className={`resize-none my-[10px] mx-[10px] ${
                    isDarkMode ? "bg-[#374151] border-[#4B5563]" : "bg-[#FFFFFF] border-[#E5E7EB]"
                  } border`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className={`font-semibold ${
                          isDarkMode ? "text-[#E5E7EB]" : "text-[#1F2937]"
                        }`}>
                          Profil : <span className="italic">{comment.profiles?.prenom || "Anonyme"} {comment.profiles?.nom}</span>
                        </p>
                        <p className={`${
                          isDarkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"
                        }`}>
                          Heure de publication : <span className="italic">{new Date(comment.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </p>
                      </div>
                      {user && user.id === comment.proprietaire_id && (
                        <button 
                          onClick={() => handleDeleteComment(comment.id)} 
                          className={`px-[1.2rem] py-[0.7rem] bg-[#ff6b6b] border-none rounded-[3px] hover:bg-[#ff5252]

                            ${
                            isDarkMode 
                              ? "text-[#F87171] hover:bg-[#4B5563]" 
                              : "text-[#EF4444] hover:bg-[#F3F4F6]"
                          }`}
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                    <p className={` ${
                      isDarkMode ? "text-[#D1D5DB]" : "text-[#374151]"
                    }`}>
                      {comment.contenu}
                    </p>
                  </div>
                )) : (
                  <div className={` ${
                    isDarkMode ? "bg-[#374151] text-[#9CA3AF]" : "text-[#6B7280]"
                  }`}>
                    <p className="italic">Soyez le premier à commenter cette recette !</p>
                  </div>
                )}
              </div>
              
              {/* Espace --- Message de connexion */}
              {!user && (
                <div>
                  <p className={`${isDarkMode ? "text-[#9CA3AF]" : "text-[#4B5563]"}`}>
                    Connectez-vous pour ajouter un commentaire
                  </p>
                  <button 
                    onClick={() => router.push("/connexion")} 
                    className={`px-[1.2rem] py-[0.7rem] border-none rounded-[3px] bg-[#f4a887] hover:bg-transparent my-[10px]
                    ${

                      isDarkMode 
                        ? "bg-[#f4a887] hover:bg-[#e8976f] text-[#000000]" 
                        : "bg-[#f4a887] hover:bg-[#e8976f] text-[#000000]"
                    }`}
                  >
                    Se connecter
                  </button>
                </div>
              )}            
            </section>
          </div>
          </main>
        </div>
  );
}
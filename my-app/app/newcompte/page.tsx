"use client";

import { supabase } from "@/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreerCompte() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [civilite, setCivilite] = useState(""); // Nouvel état pour la civilité

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    //Création du compte dans Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          prenom,
          nom,
          civilite, // Ajout de la civilité dans les données utilisateur
        }
      }
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setSuccessMsg("Compte créé ! Vérifiez vos emails.");
    
    // Redirection vers /connexion après 2 sec
    setTimeout(() => {
      router.push("/connexion");
    }, 2000);
  }

  return (
    <div className="my-[30px] min-h-screen">
      {/* Main content - Container principal avec styles cohérents */}
      <main className="flex-1 text-left mx-[10%] my-10 bg-[#FFFCEE] flex flex-col items-center text-center pb-[60px] rounded-[20px] mt-32">
        
        {/* Titre principal en italique et gras */}
        <h2 className="text-[22px] font-bold mt-12 pt-8 mb-8">
          Création de compte
        </h2>

        {/* Sous-titre avec style cohérent */}
        <p className="text-[#555] py-5 w-4/5 text-center leading-relaxed text-lg mb-8 italic">
          Heureux que vous rejoigniez la team cooking !  
          <br />
          <u>Veuillez remplir les informations suivantes</u> :
        </p>

        {/* Formulaire avec espacement entre les champs */}
        <form className="flex flex-col gap-6 w-[300px]" onSubmit={handleSignup}>

          {/* Civilité - Options de sélection avec disposition horizontale */}
          <p className="text-left m-0 font-bold italic">Civilité :</p>
          <div className="flex gap-4 justify-start">
            {/* flex → disposition horizontale */}
            {/* gap-4 → espace de 1rem entre les options */}
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="civilite"
                value="M."
                checked={civilite === "M."}
                onChange={(e) => setCivilite(e.target.value)}
                className="w-4 h-4"
              />
              M.
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="civilite"
                value="Mme"
                checked={civilite === "Mme"}
                onChange={(e) => setCivilite(e.target.value)}
                className="w-4 h-4"
              />
              Mme
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="civilite"
                value=""
                checked={civilite === ""}
                onChange={(e) => setCivilite(e.target.value)}
                className="w-4 h-4"
              />
              Ne pas renseigner
            </label>
          </div>

          {/* Prénom avec titre en italique et gras */}
          <p className="text-left m-0 italic">Prénom :</p>
          <input 
            value={prenom} 
            onChange={(e) => setPrenom(e.target.value)} 
            className="px-[0.7rem] py-[0.7rem] text-base border border-[#ccc] rounded-[3px]"
            required 
          />

          {/* Nom avec titre en italique et gras */}
          <p className="text-left m-0 italic">Nom :</p>
          <input 
            value={nom} 
            onChange={(e) => setNom(e.target.value)} 
            className="px-[0.7rem] py-[0.7rem] text-base border border-[#ccc] rounded-[3px]"
            required 
          />

          {/* Email avec titre en italique et gras */}
          <p className="text-left m-0 italic">Email :</p>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="px-[0.7rem] py-[0.7rem] text-base border border-[#ccc] rounded-[3px]"
            required 
          />

          {/* Mot de passe avec titre en italique et gras */}
          <p className="text-left m-0 italic">Mot de passe :</p>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="px-[0.7rem] py-[0.7rem] text-base border border-[#ccc] rounded-[3px]"
            required 
          />

          {/* Affichage des messages d'erreur et succès */}
          {errorMsg && <p className="text-red-500">{errorMsg}</p>}
          {successMsg && <p className="text-green-500">{successMsg}</p>}

          {/* Bouton de soumission avec espacement supplémentaire */}
          <button 
            type="submit" 
            className="my-[30px] px-[1.2rem] py-[0.7rem] bg-[#f4a887] text-black border-none rounded-[3px] text-base cursor-pointer hover:bg-[#FFFCEE] mt-4"
            // my-[30px] → marge verticale personnalisée de 30px
            // hover:bg-[#FFFCEE] → changement de couleur au survol
          >
            Créer le compte
          </button>
        </form>
      </main>
    </div>
    
    
  );
}
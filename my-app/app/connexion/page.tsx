"use client";

import { supabase } from "@/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Connexion() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    // on se déconnecte d'abord pour s'assurer qu'aucun utilisateur n'est connecté
    await supabase.auth.signOut();

    // permet de lancer la connexion
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Email ou mot de passe incorrect");
      return;
    }

    // une fois connecté on redirige vers la page 
    window.location.href = "/moncompte";
  }

  return (
    <div className=" my-[30px] min-h-screen">
      <main className="mx-[10%] bg-[#FFFCEE] flex flex-col items-center text-center pb-[60px] rounded-[20px] shadow-[0_6px_20px_rgba(0,0,0,0.08)]">
        
        <h2><strong>Se connecter</strong></h2>
        <p><em>Heureux de vous revoir !</em></p>

        {/*Espace --- formulaire de connexion */}
        <form
          className=" my-[10px] flex flex-col w-[300px]" 
          onSubmit={handleLogin}
        >
          {/*Description --- champs email */}
          <input
            type="email"
            placeholder="Entrez votre mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="my-[20px] px-[0.7rem] py-[0.7rem] text-base border border-[#ccc] rounded-[3px]"
            required
          />

          {/*Description --- champs mot de passe */}
          <input
            type="password"
            placeholder="Entrez votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-[0.7rem] py-[0.7rem] text-base border border-[#ccc] rounded-[3px]"
            required
          />

          {errorMsg && <p className="text-red-500">{errorMsg}</p>} {/* Affiche le message d'erreur si nécessaire */}

          {/*Espace --- boutons créer un compte et se connecter */}
          <div className="my-[30px] flex justify-between">
            <Link href="/newcompte">
              <button 
                type="button" 
                className="px-[1.2rem] py-[0.7rem] bg-[#f4a887] text-black border-none rounded-[3px] text-base cursor-pointer hover:bg-[#FFFCEE]"
              >
                Créer un compte
              </button>
            </Link>

            {/* Ce bouton soumet le formulaire */}
            <button 
              type="submit"
              className="px-[1.2rem] py-[0.7rem] bg-[#f4a887] text-black border-none rounded-[3px] text-base cursor-pointer hover:bg-[#FFFCEE] no-underline flex items-center"
            >
              Se connecter
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
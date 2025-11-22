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

    // On déconnecte tout utilisateur avant de commencer
    await supabase.auth.signOut();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Email ou mot de passe incorrect");
      return;
    }

    window.location.href = "/moncompte";
  }

  return (
    <div className=" my-[30px] min-h-screen">
      <main className="flex-1 text-left mx-[10%] my-10 bg-[#FFFCEE] flex flex-col items-center text-center gap-2 pb-[60px] rounded-[20px] mt-32">
        
        <h2 className="text-[22px] font-bold mt-8 pt-8 mb-0">
          <strong>Se connecter</strong>
        </h2>

        <p className="text-[#555] py-5 w-4/5 text-center leading-relaxed text-lg mb-4 italic">
          <em>Heureux de vous revoir !</em>
        </p>

        <form 
          className=" my-[10px] flex flex-col gap-4 w-[300px]" 
          onSubmit={handleLogin}
        >
          <input
            type="email"
            placeholder="Entrez votre mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="my-[20px] px-[0.7rem] py-[0.7rem] text-base border border-[#ccc] rounded-[3px]"
            required
          />

          <input
            type="password"
            placeholder="Entrez votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-[0.7rem] py-[0.7rem] text-base border border-[#ccc] rounded-[3px]"
            required
          />

          {errorMsg && <p className="text-red-500">{errorMsg}</p>}

          <div className="my-[30px] flex justify-between mt-4">
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
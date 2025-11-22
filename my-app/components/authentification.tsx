"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/supabase/client"; 
import { useRouter } from "next/navigation";

// On crée le contexte
const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Changement Auth détecté :", event);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh(); 
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
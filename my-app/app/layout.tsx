"use client"; // nécéssaire pour utiliser des hooks comme useState

import Link from "next/link";
import "./globals.css";
import React from "react";
import { useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}){
  const [open, setOpen] = useState(false); // état pour le menu déroulant

  return(
    <html className="cooking-page" >
      <body>
      {/* Header */} {/* On met le header dans le layout comme ça il sera visible sur toutes les pages chargées */}
      <header className="header"  style={{boxSizing: "border-box"}}>
        <div className="header-left"> {/* Header left : contient le ≡ (menu déroulant) + et lien qui renvoit sur le menu principal */} 
          <button className="menu-button" 
          onClick={() => setOpen(!open)}
            >{open ? "x" :"≡"}</button>
          
        <Link href="/" style={{marginRight : "10px", marginLeft : "10px", color : "black"}}>Cooking.com</Link>
        </div>

        <div className="header-center">
          <input type="text" placeholder="Search..." className="search-bar" />
          <button className="search-button">Search</button>
        </div>

        <div className="header-right">
          <Link href="/notrehistoire" style={{marginRight : "10px", marginLeft : "10px", color : "black"}}>
          Notre histoire</Link>

          <Link href="/connexion"><button className="login-button">Se connecter</button></Link>
        </div>  
            
      </header>

      {/* Menu déroulant (en dessous du header) */}
        <nav className={`menu-deroulant ${open ? "open" : ""}`}>
          <div>
            <h3>Recettes par catégorie</h3>
            <p>Apéro</p>
            <p>Entrées</p>
            <p>Plats</p>
            <p>Desserts</p>
          </div>
          <div>
            <h3>Recettes par fête</h3>
            <p>Nouvel an</p>
            <p>Noël</p>
            <p>Pâques</p>
            <p>Anniversaire</p>
          </div>
          <div>
            <h3>Recettes du monde</h3>
            <p>Italiennes</p>
            <p>Japonaises</p>
            <p>Indiennes</p>
            <p>Françaises</p>
          </div>
        </nav>


      {/* Footer */} {/* On met le footer dans le layout comme ça il sera visible sur toutes les pages chargées */}
      <footer className="footer">Copyright © 2025 Cooking aka le meilleur site de nourriture du monde</footer>
      
      
      <main>{children}</main>
      </body>
    </html>
    
  );
}
    
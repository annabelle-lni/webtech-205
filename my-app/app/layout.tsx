import Link from "next/link";
import "./globals.css";
import React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}){
  return(
    <html className="cooking-page">
      <body>
      {/* Header */} {/* On met le header dans le layout comme ça il sera visible sur toutes les pages chargées */}
      <header className="header">
        <Link href="/"><div className="header-left">Cooking.com</div></Link>
        <div className="header-center">
          <input type="text" placeholder="Search..." className="search-bar" />
          <button className="search-button">Search</button>
        </div>
        <Link href="/connexion"><button className="login-button">Se connecter</button></Link>
      </header>

      {/* Footer */} {/* On met le footer dans le layout comme ça il sera visible sur toutes les pages chargées */}
      <footer className="footer">Copyright © 2025 Cooking aka le meilleur site de nourriture du monde</footer>
      
      
      <main>{children}</main>
      </body>
    </html>
    
  );
}
    
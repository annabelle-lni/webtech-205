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
      {/* Header */}
      <header className="header">
        <div className="header-left">Cooking.com</div>
        <div className="header-center">
          <input type="text" placeholder="Search..." className="search-bar" />
          <button className="search-button">Search</button>
        </div>
        <button className="login-button">Se connecter</button>
      </header>
  {/*<nav>*/}
   {/*  <Link href="/">Accueil</Link>*/}
   {/*  <Link href="/about">About</Link>*/}
   {/*  <Link href="/articles">Articles</Link>*/}
   {/*  <Link href="/contacts">Contacts</Link>*/}
  {/*</nav>*/}
        </body>
        <main>{children}</main>
    </html>
    
  );
}
import Link from "next/link";
import "./globals.css";
import React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}){
  return(
    <html className="translated-ltr">
      <body>
        <header>
          <nav>
            <Link href="/">Accueil</Link>
            <Link href="/about">About</Link>
            <Link href="/articles">Articles</Link>
            <Link href="/contacts">Contacts</Link>
          </nav>
        </header>

        <main>{children}</main>
      </body>
    </html>
    
  );
}
"use client";

import { createContext, useContext, useState } from "react";

const NavbarContext = createContext(null);

export function NavbarProvider({ children }) {
  const [navbarTheme, setNavbarTheme] = useState("hero");
  const [start, setStart] = useState(false);

  return (
    <NavbarContext.Provider
      value={{
        navbarTheme,
        setNavbarTheme,
        start,
        setStart,
      }}
    >
      {children}
    </NavbarContext.Provider>
  );
}

export function useNavbar() {
  const context = useContext(NavbarContext);

  if (!context) {
    throw new Error("useNavbar must be used inside NavbarProvider");
  }

  return context;
}
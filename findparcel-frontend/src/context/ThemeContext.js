import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("findparcelTheme") || "light";
  });

  useEffect(() => {
    document.body.classList.remove(
      "findparcel-light-mode",
      "findparcel-dark-mode"
    );

    document.body.classList.add(
      theme === "dark"
        ? "findparcel-dark-mode"
        : "findparcel-light-mode"
    );

    localStorage.setItem(
      "findparcelTheme",
      theme
    );
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "light"
        ? "dark"
        : "light"
    );
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
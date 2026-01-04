"use client";

import { useTheme } from "./ThemeProvider";
import { FaSun, FaMoon } from "react-icons/fa";
import styles from "./ThemeToggleButton.module.css";

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className={styles.toggleButton}>
      {theme === "light" ? (
        <FaMoon className={`${styles.icon} ${styles.lightIcon}`} />
      ) : (
        <FaSun className={`${styles.icon} ${styles.darkIcon}`} />
      )}
    </button>
  );
};

export default ThemeToggleButton;

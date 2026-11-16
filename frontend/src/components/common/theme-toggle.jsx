import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/common/theme-provider";
import { Button } from "@/components/ui/button";

export const ThemeToggle = () => {
      const { resolvedTheme, setTheme } = useTheme();
      const isDark = resolvedTheme === "dark";

      const toggleTheme = () => {
            setTheme(isDark ? "light" : "dark");
      };

      return (
            <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTheme}
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                  title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                  className="relative bg-background/80 backdrop-blur-sm"
            >
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
            </Button>
      );
};

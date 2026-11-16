import { useTheme } from "@/components/common/theme-provider";
import { Toaster as Sonner } from "sonner";

const Toaster = (props) => {
      const { resolvedTheme } = useTheme();

      return (
            <Sonner
                  theme={resolvedTheme || "system"}
                  position="top-center"
                  className="custom-toast"
                  style={{
                        "--normal-bg": "var(--popover)",
                        "--normal-text": "var(--popover-foreground)",
                        "--normal-border": "var(--border)",
                  }}
                  toastOptions={{
                        classNames: {
                              toast: "text-sm rounded-md shadow-lg animate-toast-slide",
                              description: "text-muted-foreground",
                              actionButton: "bg-primary text-primary-foreground",
                              cancelButton: "bg-muted text-muted-foreground",
                        },
                  }}
                  {...props}
            />
      );
};

export { Toaster };

import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
// import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
// import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";

// src/routes/__root.tsx
/// <reference types="vite/client" />
// other imports...
import appCss from "@/styles.css?url";

import Header from "../components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "SyncNotes",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light"); // Or retrieve from local storage

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Create a client
  const queryClient = new QueryClient();

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <QueryClientProvider client={queryClient}>
        <body>
          <Header theme={theme} toggleTheme={toggleTheme} />
          <main>{children}</main>
          <Footer />
          {/* <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        /> */}
          <Scripts />
          <Toaster position="top-center" expand={true} richColors />
        </body>
      </QueryClientProvider>
    </html>
  );
}

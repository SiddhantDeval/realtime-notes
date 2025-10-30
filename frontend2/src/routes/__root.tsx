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
import { AuthProvider } from "@/utils/auth";
import { createClientOnlyFn, createIsomorphicFn } from "@tanstack/react-start";
const readLocalStorage = createClientOnlyFn((key: string) => {
  console.log('reading local');
  return JSON.parse(localStorage.getItem(key) || 'null');

})

export const Route = createRootRoute({
  beforeLoad:     async () => {
      logMessage("Before Load");
    },


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


// API: Framework handles it
const logMessage = createIsomorphicFn()
  .server((msg) => console.log(`[SERVER]: ${msg}`))
  .client((msg) => console.log(`[CLIENT]: ${msg}`))
  
function RootDocument({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light"); // Or retrieve from local storage
        readLocalStorage("auth")

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
      <AuthProvider>
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
      </AuthProvider>
    </html>
  );
}

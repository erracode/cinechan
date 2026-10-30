import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { getQueryClient } from "../lib/query-client";
import "../lib/pixi-setup";

import appCss from "../styles.css?url";

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

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
        title: "TanStack Start Starter",
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
  const [queryClient] = useState(getQueryClient);
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="/lib/live2dcubismcore.min.js" />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased text-foreground bg-background h-screen flex flex-col overflow-hidden dark">
     
     

        <main className="flex-1 relative flex flex-col">
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </main>

        <Scripts />
      </body>
    </html>
  );
}

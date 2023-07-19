import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import {
  Session,
  createPagesBrowserClient,
} from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useState } from "react";

const MyApp: AppType<{ initialSession: Session }> = ({
  Component,
  pageProps,
}) => {
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Component {...pageProps} />;
    </SessionContextProvider>
  );
};

export default api.withTRPC(MyApp);

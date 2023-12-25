import type { DefaultSession } from "next-auth";

import type { User } from "@/lib/types/db";

// We can add to the default session object by extending the
// built-in Session type from next-auth. This will allow us to
// use the properties we added to the user object in the
// database when accessing the session object in our app.
// 此為宣告檔案，可以改套件裡的Type

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: User;//用自定義的format，而不是Session原生的
  }
}

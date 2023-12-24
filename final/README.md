# Run the project

1. Install dependencies
   ```bash
   yarn
   ```
2. Get Pusher credentials
   Please refer to the [Pusher Setup](#pusher-setup) section for more details.

3. Get Github OAuth credentials
   Please refer to the [NextAuth Setup](#nextauth-setup) section for more details.

4. Create `.env.local` file in the project root and add the following content:

   ```text
   PUSHER_ID=
   NEXT_PUBLIC_PUSHER_KEY=
   PUSHER_SECRET=
   NEXT_PUBLIC_PUSHER_CLUSTER=

   AUTH_SECRET=<this can be any random string>
   AUTH_GITHUB_ID=
   AUTH_GITHUB_SECRET=
   ```

5. Start the database
   ```bash
   docker compose up -d
   ```
6. Run migrations
   ```bash
   yarn migrate
   ```
7. Start the development server
   ```bash
   yarn dev
   ```
8. Open http://localhost:3000 in your browser

# Setup Guide

## Prettier and ESLint

1. Install prettier and prettier plugins
   ```bash
   yarn add -D prettier prettier-plugin-tailwindcss @trivago/prettier-plugin-sort-imports
   ```
2. Install eslint and eslint plugins
   ```bash
   yarn add -D eslint typescript @typescript-eslint/parser eslint-config-prettier @typescript-eslint/eslint-plugin
   ```
3. Copy and paste the `./prettierrc.cjs` and `./eslintrc.json` from this repo to your project root.

4. Add `format` script to `package.json`
   ```json
   {
     "scripts": {
       "format": "prettier --write ."
     }
   }
   ```
5. Check if the scripts work
   ```bash
   yarn format
   yarn lint
   ```

## Drizzle Setup

1. Install drizzle

   ```bash
   yarn add drizzle-orm pg
   yarn add -D drizzle-kit @types/pg
   ```

2. Copy the `docker-compose.yml` from this repo to your project root.

3. Start the database

   ```bash
   docker compose up -d
   ```

4. Add `POSTGRES_URL` to `.env.local`:
   ```text
   ...
   POSTGRES_URL=postgres://postgres:postgres@localhost:5432/notion-clone
   ```
5. Create `db` folder
   ```bash
   cd ./src
   mkdir db
   ```
6. Create the `./src/db/index.ts` file:

   ```ts
   import { drizzle } from "drizzle-orm/node-postgres";
   import { Client } from "pg";

   import { privateEnv } from "@/lib/env/private";

   const client = new Client({
     connectionString: privateEnv.POSTGRES_URL,
     connectionTimeoutMillis: 5000,
   });
   await client.connect();
   export const db = drizzle(client);
   ```

   Remember to setup the environment variables handlers in `src/lib/env/private.ts`:

   ```ts
   import { z } from "zod";

   const privateEnvSchema = z.object({
     POSTGRES_URL: z.string().url(),
   });

   type PrivateEnv = z.infer<typeof privateEnvSchema>;

   export const privateEnv: PrivateEnv = {
     POSTGRES_URL: process.env.POSTGRES_URL!,
   };

   privateEnvSchema.parse(privateEnv);
   ```

7. Create an empty `./src/db/schema.ts` file

8. Copy the `./drizzle.config.ts` from this repo to your project root.
   Remember to install `dotenv`:

   ```bash
   yarn add dotenv
   ```

9. Change the `target` option in `tsconfig.json` to `es2017`:

   ```json
   {
     "compilerOptions": {
       "target": "es2017",
       ...
     }
   }
   ```

10. Add scripts
    Add the following scripts to the `./package.json` file:

    ```json
    {
      "scripts": {
        // This script will update the database schema
        "migrate": "drizzle-kit push:pg",
        // This script opens a GUI to manage the database
        "studio": "drizzle-kit studio"
      }
    }
    ```

    Remember to run `yarn migrate` after you make changes to the database schema, namely the `./src/db/schema.ts` file.

11. Add `pg-data` to `.gitignore`
    ```text
    ...
    pg-data/
    ```

## Shadcn UI setup

1. Setup Shadcn UI
   ```bash
   npx shadcn-ui@latest init
   ```
2. Answer the questions carefully since **some of the default options are not compatible with our setup**.

   - Would you like to use TypeScript (recommended)? `yes`
   - Which style would you like to use? › `New York`
     - I personally prefer New York style, but you can choose any style you like.
   - Which color would you like to use as base color? › `Slate`
     - You can choose any color you like.
   - Where is your global CSS file? › › `src/app/globals.css`
     - **IMPORTANT**: You must enter `src/app/globals.css` here. Otherwise, the setup will fail.
   - Do you want to use CSS variables for colors? › `yes`
   - Where is your tailwind.config.js located? › `tailwind.config.ts`
     - **IMPORTANT**: We are using TypeScript, so you must enter `tailwind.config.ts` here.
   - Configure the import alias for components: › `@/components`
   - Configure the import alias for utils: › `@/lib/utils/shadcn`
   - Are you using React Server Components? › `yes`

## Pusher Setup

1.  Install pusher

    ```bash
    yarn add pusher pusher-js
    ```

2.  Create a pusher account at https://pusher.com/
3.  Create a new app

    - Click `Get Started` or `Manage/Create app`on the `Channel` tab
    - Enter the app name
    - Select a cluster. Pick the one closest to you, i.e. `ap3(Asia Pacific (Tokyo))`
    - Click `Create app`

4.  Go to `App Keys` tab, you will see the following keys:
    - `app_id`
    - `key`
    - `secret`
    - `cluster`
5.  Copy these keys to your `.env.local` file:

    ```text
    PUSHER_ID=<app_id>
    NEXT_PUBLIC_PUSHER_KEY=<key>
    PUSHER_SECRET=<secret>
    NEXT_PUBLIC_PUSHER_CLUSTER=<cluster>
    ```

    `NEXT_PUBLIC` prefix is required for the client side to access the env variable.

    Also, please remember to add these keys to your environment variables handler in `src/lib/env/private.ts` and `src/lib/env/public.ts`. You can view those two files for more details.

6.  Go to `App Settings` tab, scroll down to `Enable authorized connections` and enable it.
    Note: If you enable the `Enable client events` option, every connection will last only 30 seconds if not authorized. So if you just want to do some experiments, you might need to disable this option.

## NextAuth Setup

We use the latest version (v5) of NextAuth, which is still in beta. So there are some differences between the documentation and the actual code. You can find the detailed v5 migration guide here: https://authjs.dev/guides/upgrade-to-v5#authenticating-server-side

1. Install next-auth

   ```bash
   yarn add next-auth@beta
   ```

2. Get Github OAuth credentials

   - Go to `Settings` tab of your Github account
   - Click `Developer settings` on the left sidebar
   - Click `OAuth Apps` on the left sidebar
   - Click `New OAuth App` or `Registr a new application`
   - Enter the following information:
     - `Application name`: `Notion Clone` (or any name you like)
     - `Homepage URL`: `http://localhost:3000`
     - `Authorization callback URL`: `http://localhost:3000/api/auth/callback/github`
   - Click `Register application`
   - Copy the `Client ID` and `Client Secret` to your `.env.local` file:

     ```text
     AUTH_GITHUB_ID=<Client ID>
     AUTH_GITHUB_SECRET=<Client Secret>
     ```

     Before copying the Clinet Secret, you may need to click on `Generate a new client secret` first.

     Note that in NextAuth v5, the prefix `AUTH_` is required for the env variables.

     Note that you do not have to add those keys to `src/lib/env/private.ts` since they are automatically handled by NextAuth.

3. Add `AUTH_SECRET` to `.env.local`:

   ```text
   AUTH_SECRET=any-random-string
   ```

   This is used to encrypt the session token. You can use any random string here. Make sure to keep it secret and update it regularly.

   Note that you do not have to add those keys to `src/lib/env/private.ts` since they are automatically handled by NextAuth.

4. Create `./src/lib/auth.ts`

   ```ts
   import NextAuth from "next-auth";
   import GitHub from "next-auth/providers/github";

   export const {
     handlers: { GET, POST },
     auth,
   } = NextAuth({
     providers: [GitHub],
   });
   ```

5. Add `./src/app/api/auth/[...nextauth]/route.ts`

   ```ts
   export { GET, POST } from "@/lib/auth";
   ```

6. Add providers to `./src/app/layout.ts`
   ```tsx
   import { SessionProvider } from "next-auth/react";
   ...
      return (
         <html lang="en">
            <body className={inter.className}>
               <SessionProvider>{children}</SessionProvider>
            </body>
         </html>
      );
   ...
   ```

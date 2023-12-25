import { z } from "zod";

// 先把型別定義好，避免在.env.local就手殘
const privateEnvSchema = z.object({
  POSTGRES_URL: z.string().url(),
  PUSHER_ID: z.string(),
  PUSHER_SECRET: z.string(),
});

type PrivateEnv = z.infer<typeof privateEnvSchema>;

// export出去
export const privateEnv: PrivateEnv = {
  POSTGRES_URL: process.env.POSTGRES_URL!,
  PUSHER_ID: process.env.PUSHER_ID!,
  PUSHER_SECRET: process.env.PUSHER_SECRET!,
};

//進行驗證
privateEnvSchema.parse(privateEnv);

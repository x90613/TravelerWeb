export type User = {
  id: string;
  username: string;
  provider: "Github" | "credentials" | "google";
  email: string;
  token: string;
};

// 定義前端可以拿到的type

export type User = {
  id: string;
  username: string;
  email: string;
  provider: "github" | "credentials";
};

export type JourneyData = {
  id: string;
  title: string;
  start: string;
  end: string;
  location: string;
  note: string;
  // description: string;
  // list_id: string; //才能返回去刪除Plan的list，在關聯式資料庫應該不用直接刪那個table即可
};

export type PlanData = {
  id: string;
  name: string;
  description: string;
  // Journeys: JourneyData[]; //refer journey的型別，不確定要不要因為現在不是NoSQL
};
export type PlayerType = {
  id: string;
  name: string;
  password: string;
};

export type RoomType = {
  id: string;
  players: PlayerType[];
};

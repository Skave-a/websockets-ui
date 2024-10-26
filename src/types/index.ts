export type PlayerType = {
  id: string;
  name: string;
  password: string;
  ships?: Ship[];
};

export type RoomType = {
  id: string;
  players: PlayerType[];
};

export type Ship = {
  position: { x: number; y: number };
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
};
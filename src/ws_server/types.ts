export interface Player {
  name: string;
  password: string;
}

export interface Room {
  [key: string]: Player[];
}

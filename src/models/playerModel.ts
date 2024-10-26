import { WebSocket } from 'ws';
import { Ship } from '../types';

export class Player {
  id: string;
  name: string;
  password: string;
  ws: WebSocket;
  ships: Ship[];
  wins: number;

  constructor(name: string, password: string, ws: WebSocket) {
    this.id = crypto.randomUUID().substring(0, 9);
    this.name = name;
    this.password = password;
    this.ws = ws;
    this.ships = [];
    this.wins = 0;
  }
}

export const players: Player[] = [];

export const addPlayer = (player: Player) => {
  players.push(player);
};

export const getPlayerByName = (name: string): Player | undefined => {
  return players.find((player) => player.name === name);
};

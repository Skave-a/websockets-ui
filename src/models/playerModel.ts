import { PlayerType } from '../types';

export class Player {
  public id: string;
  public name: string;
  public password: string;

  constructor(name: string, password: string) {
    this.name = name;
    this.password = password;
    this.id = Player.generateId();
  }

  private static generateId(): string {
    return crypto.randomUUID().slice(0, 9);
  }
}

const players: PlayerType[] = [];

export const addPlayer = (player: Player) => {
  players.push(player);
};

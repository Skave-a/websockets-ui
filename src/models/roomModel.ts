import { Player } from './playerModel';

export class Room {
  id: string;
  players: Player[];
  currentTurnId: string;

  constructor() {
    this.id = crypto.randomUUID().substring(0, 9);
    this.players = [];
    this.currentTurnId = '';
  }

  addPlayer(player: Player) {
    if (this.players.length < 2) {
      this.players.push(player);
    }
  }

  isFull() {
    return this.players.length === 2;
  }
}

export const rooms: Room[] = [];

export const addRoom = (room: Room) => {
  rooms.push(room);
};

export const getRoomById = (id: string): Room | undefined => {
  return rooms.find((room) => room.id === id);
};

export const removeRoom = (id: string) => {
  const index = rooms.findIndex((room) => room.id === id);
  if (index !== -1) {
    rooms.splice(index, 1);
  }
};

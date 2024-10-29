import { WebSocket } from 'ws';
import { players } from '../models/playerModel';
import { Room, addRoom, getRoomById } from '../models/roomModel';
import { RoomUpdate } from '../utils';

export const handleCreateRoom = (ws: WebSocket) => {
  const player = players.find((p) => p.ws === ws);

  const room = new Room();
  if (player) {
    room.addPlayer(player);
  }
  addRoom(room);

  RoomUpdate();
};

export const handleAddUserToRoom = (ws: WebSocket, data: string) => {
  const { indexRoom } = JSON.parse(data);
  const room = getRoomById(indexRoom);
  const player = players.find((p) => p.ws === ws);

  if (player && room) {
    room.addPlayer(player);
  }

  RoomUpdate();

  const createGameMessage = (playerId: string) =>
    JSON.stringify({
      type: 'create_game',
      data: JSON.stringify({
        idGame: room?.id,
        idPlayer: playerId,
      }),
      id: 0,
    });

  room?.players.forEach((p) => {
    p.ws.send(createGameMessage(p.id));
  });
};

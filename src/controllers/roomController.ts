import { WebSocket } from 'ws';
import {
  Room,
  addRoom,
  getRoomById,
  rooms,
} from '../models/roomModel';
import { players } from '../models/playerModel';

export const handleCreateRoom = (ws: WebSocket) => {
  const player = players.find((p) => p.ws === ws);
  if (!player) {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: 'Player not found' },
        id: 0,
      }),
    );
    return;
  }

  const room = new Room();
  room.addPlayer(player);
  addRoom(room);

  ws.send(
    JSON.stringify({
      type: 'create_game',
      data: JSON.stringify({
        idGame: room.id,
        idPlayer: player.id,
      }),
      id: 0,
    }),
  );

  broadcastRoomUpdate();
};

export const handleAddUserToRoom = (ws: WebSocket, data: string) => {
  const { indexRoom } = JSON.parse(data);
  const room = getRoomById(indexRoom);
  const player = players.find((p) => p.ws === ws);

  if (!room) {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: 'Room not found' },
        id: 0,
      }),
    );
    return;
  }

  if (!player) {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: 'Player not found' },
        id: 0,
      }),
    );
    return;
  }

  if (!room.addPlayer(player)) {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: 'Room is full' },
        id: 0,
      }),
    );
    return;
  }

  const createGameMessage = (playerId: string) =>
    JSON.stringify({
      type: 'create_game',
      data: JSON.stringify({
        idGame: room.id,
        idPlayer: playerId,
      }),
      id: 0,
    });

  room.players.forEach((p) => {
    p.ws.send(createGameMessage(p.id));
  });

  broadcastRoomUpdate();
};

export const broadcastRoomUpdate = () => {
  const roomData = rooms.map((room) => ({
    roomId: room.id,
    roomUsers: room.players.map((player) => ({
      name: player.name,
      index: player.id,
    })),
  }));

  const message = JSON.stringify({
    type: 'update_room',
    data: JSON.stringify(roomData),
    id: 0,
  });

  players.forEach((player) => {
    player.ws.send(message);
  });
};

import { WebSocket } from 'ws';
import { getRoomById, removeRoom } from '../models/roomModel';
import { players } from '../models/playerModel';
import { broadcastRoomUpdate } from './roomController';

export const handleAddShips = (ws: WebSocket, data: string) => {
  const { gameId, ships, indexPlayer } = JSON.parse(data);
  console.log('JSON.parse(data) :>> ', JSON.parse(data));
  const room = getRoomById(gameId);
  const player = players.find((p) => p.id === indexPlayer);

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

  if (!player || !room.players.some((p) => p.id === indexPlayer)) {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: 'Player not found in the room' },
        id: 0,
      }),
    );
    return;
  }

  player.ships = ships;

  if (room.players.every((p) => p.ships)) {
    room.players.forEach((p) => {
      p.ws.send(
        JSON.stringify({
          type: 'start_game',
          data: {
            ships: p.ships,
            currentPlayerIndex: p.id,
          },
          id: 0,
        }),
      );
    });
  }
  removeRoom(room.id);
  broadcastRoomUpdate();
};

import { WebSocket } from 'ws';
import { getRoomById, removeRoom } from '../models/roomModel';
import { players } from '../models/playerModel';

export const handleAddShips = (ws: WebSocket, data: string) => {
  const { gameId, ships, indexPlayer } = JSON.parse(data);
  const room = getRoomById(gameId);
  const player = players.find((p) => p.id === indexPlayer);

  if (!room || !player) {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: 'Room or player not found' },
        id: 0,
      }),
    );
    return;
  }

  player.ships = ships;

  if (room.players.every((p) => p.ships.length > 0)) {
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
    removeRoom(room.id);
  }
};

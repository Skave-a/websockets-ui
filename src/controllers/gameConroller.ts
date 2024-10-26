import { WebSocket } from 'ws';
import { getRoomById } from '../models/roomModel';
import { players } from '../models/playerModel';

export const handleAttack = (ws: WebSocket, data: string) => {
  const { gameId, x, y, indexPlayer } = JSON.parse(data);
  const room = getRoomById(gameId);
  const attacker = players.find((p) => p.id === indexPlayer);
  console.log(2);

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

  if (!attacker || !room?.players.some((p) => p.id === indexPlayer)) {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: 'Player not found in the room' },
        id: 0,
      }),
    );
    return;
  }

  const defender = room.players.find((p) => p.id !== indexPlayer);

  if (!defender) {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: 'Defender not found' },
        id: 0,
      }),
    );
    return;
  }

  let status: 'miss' | 'killed' | 'shot' = 'miss';
  const hitShip = defender.ships.find((ship) => {
    const isHit =
      x >= ship.position.x &&
      x < ship.position.x + ship.length &&
      (y === ship.position.y ||
        y === ship.position.y + (ship.direction ? 0 : ship.length - 1));
    if (isHit) {
      if (ship.length === 1) {
        status = 'killed';
      } else {
        status = 'shot';
      }
    }
    return isHit;
  });

  const feedbackMessage = JSON.stringify({
    type: 'attack',
    data: JSON.stringify({
      position: { x, y },
      currentPlayer: attacker.id,
      status,
    }),
    id: 0,
  });

  defender.ws.send(feedbackMessage);
  ws.send(feedbackMessage);
};

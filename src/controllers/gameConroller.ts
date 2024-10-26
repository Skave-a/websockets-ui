import { WebSocket } from 'ws';
import { players } from '../models/playerModel';
import { getRoomById } from '../models/roomModel';
import { isHit, isShipSunk, sendTurnInfo } from '../utils';

export const handleAttack = (ws: WebSocket, data: string) => {
  const { gameId, x, y, indexPlayer } = JSON.parse(data);
  const room = getRoomById(gameId);
  const attacker = players.find((p) => p.id === indexPlayer);

  if (!room || !attacker) {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: 'Room or attacker not found' },
        id: 0,
      }),
    );
    return;
  }

  const currentTurnPlayer = room.players.find((player) => {
    return player.id === room.currentTurnId;
  });

  if (currentTurnPlayer?.id === attacker.id) {
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

    let status: 'miss' | 'shot' | 'killed' = 'miss';

    const hitShip = defender.ships.find((ship) => isHit(ship, x, y));

    if (hitShip) {
      if (isShipSunk(hitShip)) {
        status = 'killed';
      } else {
        status = 'shot';
      }
    }

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

    room.currentTurnId = defender.id;

    sendTurnInfo(room.id, defender.id);
  } else {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: 'It is not your turn to attack' },
        id: 0,
      }),
    );
  }
};

export const handleRandomAttack = (ws: WebSocket, data: string) => {
  const { gameId, indexPlayer } = JSON.parse(data);
  const room = getRoomById(gameId);
  const attacker = players.find((p) => p.id === indexPlayer);

  if (!room || !attacker) {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: 'Room or attacker not found' },
        id: 0,
      }),
    );
    return;
  }

  const currentTurnPlayer = room.players.find((player) => {
    return player.id === room.currentTurnId;
  });

  if (currentTurnPlayer?.id === attacker.id) {
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

    let x: number, y: number;
    let status: 'miss' | 'shot' | 'killed' = 'miss';

    do {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
    } while (defender.ships.some((ship) => isHit(ship, x, y)));

    const hitShip = defender.ships.find((ship) => isHit(ship, x, y));

    if (hitShip) {
      if (isShipSunk(hitShip)) {
        status = 'killed';
      } else {
        status = 'shot';
      }
    }

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

    room.currentTurnId = defender.id;

    sendTurnInfo(room.id, defender.id);
  } else {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: 'It is not your turn to attack' },
        id: 0,
      }),
    );
  }
};

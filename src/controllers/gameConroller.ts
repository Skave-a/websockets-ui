import { WebSocket } from 'ws';
import { Player, players } from '../models/playerModel';
import { addRoom, getRoomById, Room } from '../models/roomModel';
import { finishGame, isHit, isShipSunk, sendTurnInfo } from '../utils';
import { shotType } from '../types';

const sendErrorMessage = (ws: WebSocket, message: string) => {
  ws.send(
    JSON.stringify({
      type: 'error',
      data: { message },
      id: 0,
    }),
  );
};

const sendAttackMessage = (
  attackerWs: WebSocket,
  defenderWs: WebSocket,
  attackerId: string,
  x: number,
  y: number,
  status: shotType,
) => {
  const feedbackMessage = JSON.stringify({
    type: 'attack',
    data: JSON.stringify({
      position: { x, y },
      currentPlayer: attackerId,
      status,
    }),
    id: 0,
  });

  defenderWs.send(feedbackMessage);
  attackerWs.send(feedbackMessage);
};

const handleTurn = (
  ws: WebSocket,
  roomId: string,
  attackerId: string,
  defenderId: string,
  x: number,
  y: number,
) => {
  const room = getRoomById(roomId);
  const defender = players.find((p) => p.id === defenderId);

  if (!room || !defender) {
    sendErrorMessage(ws, 'Room or defender not found');
    return;
  }

  let status: shotType = 'miss';
  const hitShip = defender.ships.find((ship) => isHit(ship, x, y));

  if (hitShip) {
    status = isShipSunk(hitShip, room) ? 'killed' : 'shot';
    room.attackedPositions.push({ x, y });
    room.currentTurnId = attackerId;
    sendTurnInfo(room.id, attackerId);
  } else {
    room.attackedPositions.push({ x, y });
    room.currentTurnId = defenderId;
    sendTurnInfo(room.id, defenderId);
  }

  room.attackedPositions.push({ x, y });

  sendAttackMessage(ws, defender.ws, attackerId, x, y, status);

  if (defender.ships.every((ship) => isShipSunk(ship, room))) {
    finishGame(attackerId);
  }
};

export const handleAttack = (ws: WebSocket, data: string) => {
  const { gameId, x, y, indexPlayer } = JSON.parse(data);
  const room = getRoomById(gameId);
  const attacker = players.find((p) => p.id === indexPlayer);

  if (!room || !attacker) {
    sendErrorMessage(ws, 'Room or attacker not found');
    return;
  }

  if (room.currentTurnId === attacker.id) {
    const defender = room.players.find((p) => p.id !== indexPlayer);
    if (defender) handleTurn(ws, gameId, attacker.id, defender.id, x, y);
    else sendErrorMessage(ws, 'Defender not found');
  } else {
    sendErrorMessage(ws, 'It is not your turn to attack');
  }
};

export const handleRandomAttack = (ws: WebSocket, data: string) => {
  const { gameId, indexPlayer } = JSON.parse(data);
  const room = getRoomById(gameId);
  const attacker = players.find((p) => p.id === indexPlayer);

  if (!room || !attacker) {
    sendErrorMessage(ws, 'Room or attacker not found');
    return;
  }

  if (room.currentTurnId === attacker.id) {
    const defender = room.players.find((p) => p.id !== indexPlayer);

    if (defender) {
      let x: number, y: number;
      do {
        x = Math.floor(Math.random() * 10);
        y = Math.floor(Math.random() * 10);
      } while (defender.ships.some((ship) => isHit(ship, x, y)));

      handleTurn(ws, gameId, attacker.id, defender.id, x, y);
    } else {
      sendErrorMessage(ws, 'Defender not found');
    }
  } else {
    sendErrorMessage(ws, 'It is not your turn to attack');
  }
};

export const handleSinglePlay = (ws: WebSocket) => {
  const player = players.find((p) => p.ws === ws);
  const playerName = new Player(player?.name ?? '', '', ws);

  const room = new Room();
  room.addPlayer(playerName);
  addRoom(room);

  const message = JSON.stringify({
    type: 'single_play_start',
    data: {
      roomId: room.id,
      message: `Welcome to single play, ${playerName.name}!`,
    },
    id: 0,
  });

  ws.send(message);
};

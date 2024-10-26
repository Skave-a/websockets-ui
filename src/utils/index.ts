import { players } from '../models/playerModel';
import { getRoomById, rooms } from '../models/roomModel';
import { Ship } from '../types';

export const RoomUpdate = () => {
  const roomData = rooms
    .filter((room) => !room.isFull())
    .map((room) => ({
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

export const sendTurnInfo = (roomId: string, currentPlayerId: string) => {
  const room = getRoomById(roomId);

  if (!room) {
    return;
  }

  const message = JSON.stringify({
    type: 'turn',
    data: JSON.stringify({
      currentPlayer: currentPlayerId,
    }),
    id: 0,
  });

  room.players.forEach((player) => {
    player.ws.send(message);
  });
};

export const finishGame = (winPlayerId: string) => {
  const message = JSON.stringify({
    type: 'finish',
    data: JSON.stringify({
      winPlayer: winPlayerId,
    }),
    id: 0,
  });

  players.forEach((player) => {
    player.ws.send(message);
  });
};

export const isHit = (ship: Ship, x: number, y: number): boolean => {
  const { position, direction, length } = ship;
  const { x: shipX, y: shipY } = position;

  if (direction) {
    for (let i = 0; i < length; i++) {
      if (shipX + i === x && shipY === y) {
        return true;
      }
    }
  } else {
    for (let i = 0; i < length; i++) {
      if (shipX === x && shipY + i === y) {
        return true;
      }
    }
  }

  return false;
};

const attackedPositions: { x: number; y: number }[] = [];

export const isShipSunk = (ship: Ship): boolean => {
  const shipPositions = [];
  const { position, direction, length } = ship;

  if (direction) {
    for (let i = 0; i < length; i++) {
      shipPositions.push({ x: position.x + i, y: position.y });
    }
  } else {
    for (let i = 0; i < length; i++) {
      shipPositions.push({ x: position.x, y: position.y + i });
    }
  }

  return shipPositions.every((pos) =>
    attackedPositions.some(
      (atkPos) => atkPos.x === pos.x && atkPos.y === pos.y,
    ),
  );
};

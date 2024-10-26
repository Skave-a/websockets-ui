import { players } from '../models/playerModel';
import { rooms } from '../models/roomModel';

export const RoomUpdate = () => {
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

export const sendTurnInfo = (currentPlayerId: string) => {
  const message = JSON.stringify({
    type: 'turn',
    data: JSON.stringify({
      currentPlayer: currentPlayerId,
    }),
    id: 0,
  });

  players.forEach((player) => {
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

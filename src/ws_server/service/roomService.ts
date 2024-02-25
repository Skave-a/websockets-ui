import { rooms } from '../DB/db';
import { players } from './userService';

const createRoom = (playerName: string) => {
  const roomId = Math.random().toString(36).substring(7);
  rooms[roomId] = [{ name: playerName, password: '' }];
  return { type: 'create_room', data: '', id: 0 };
};

const addUserToRoom = (roomId: string, playerId: string) => {
  if (rooms[roomId]) {
    const player = players.find((player) => player.name === playerId);
    if (player) {
      rooms[roomId].push(player);
      delete rooms[roomId];
      return {
        type: 'create_game',
        data: {
          idGame: Math.random().toString(36).substring(7),
          idPlayer: Math.random().toString(36).substring(7),
        },
        id: 0,
      };
    } else {
      return { type: 'error', data: 'Player not found', id: 0 };
    }
  } else {
    return { type: 'error', data: 'Room not found', id: 0 };
  }
};

const updateRoomState = () => {
  const roomsWithOnePlayer = Object.entries(rooms)
    .filter(([roomId, room]) => room.length === 1)
    .map(([roomId, room]) => {
      return {
        roomId,
        roomUsers: room.map((user, index) => ({ name: user.name, index })),
      };
    });

  const updateMessage = {
    type: 'update_room',
    data: JSON.stringify(roomsWithOnePlayer),
    id: 0,
  };

  return updateMessage;
};

export { rooms, createRoom, addUserToRoom, updateRoomState };

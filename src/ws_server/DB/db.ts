import { Player, Room } from '../types';

export const players: Player[] = [];

export const rooms: Room = {};

export const winners = new Map<number, { name: string; wins: number }>();

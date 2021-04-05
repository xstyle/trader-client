import { io } from 'socket.io-client';
import { HOSTNAME } from './env';

export const socket = io(`http://${HOSTNAME}:3001/`)
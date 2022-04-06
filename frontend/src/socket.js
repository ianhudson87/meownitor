import {ENDPOINT} from './config'
import io from "socket.io-client";

let socket = io(ENDPOINT);

export {socket}
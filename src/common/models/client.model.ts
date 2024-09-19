import { UserModel } from "./user.model";

export interface ClientCreateDto {
  id: string;
  socket: any;
}

/**
 * Represents a user in the system.
 */
export class ClientModel {
  id: string; // unique id generated by server
  socket: any; // web socket object
  user?: UserModel; // user information if login

  constructor(clientCreate: ClientCreateDto) {
    this.id = clientCreate.id;
    this.socket = clientCreate.socket;
  }
}

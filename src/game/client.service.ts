import { Injectable } from "@nestjs/common";
import { ClientCreateDto, ClientModel } from "src/common/models/client.model";
import { UserService } from "./user.service";

@Injectable()
export class ClientService {
  public clients: ClientModel[] = [];

  constructor(private userService: UserService) {
    //
  }

  create(clientCreate: ClientCreateDto): ClientModel {
    const room = new ClientModel(clientCreate);
    this.clients.push(room);
    return room;
  }

  findById(id: string): ClientModel {
    return this.clients.find((client) => client.id === id) ?? null;
  }

  findBySocket(socket: unknown): ClientModel {
    return this.clients.find((client) => client.socket === socket) ?? null;
  }

  findAll(): ClientModel[] {
    return this.clients;
  }

  delete(toDelete: ClientModel): void {
    this.clients = this.clients.filter((client) => client.id !== toDelete.id);
  }
}

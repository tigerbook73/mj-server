import { ClientModel } from "./client.model";

/**
 * Represents a user in the system.
 */
export class UserModel {
  name: string; // use email as default
  firstName: string;
  lastName: string;
  email: string;
  client?: ClientModel; // if undefined, user is offline
}

/**
 * Represents a user in one game.
 */
export class PlayerModel {
  userName: string; // user name
  roomName: string; // room name
  role: "player" | "observer";
  position: "east" | "south" | "west" | "north";
}

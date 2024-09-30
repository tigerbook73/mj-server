import { Injectable } from "@nestjs/common";
import { ClientModel } from "src/common/models/client.model";
import { UserModel } from "src/common/models/user.model";
import { SignInRequest } from "src/common/protocols/apis.models";

@Injectable()
export class AuthService {
  public users: UserModel[] = [];

  constructor() {
    //
  }

  signIn(data: SignInRequest["data"], client: ClientModel): UserModel {
    const user = this.users.find((user) => user.email === data.email);

    if (!user) {
      throw new Error("User not found");
    }

    if (client.user && client.user.email !== user.email) {
      // sign out the current user
      // sign in current user

      // temporary solution
      throw new Error("User already signed in");
    }

    client.user = user;
    user.client = client;
    return user;
  }

  signOut(client: ClientModel): void {
    if (!client.user) {
      throw new Error("User not signed in");
    }

    client.user.client = null;
    client.user = null;
  }
}

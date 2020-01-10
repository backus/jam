import { PendingInboundFriendRequest } from "./api/graphql";
import { LoadedApp } from "./AppContainer";

export const acceptFriendRequest = async (app: LoadedApp, id: string) => {
  const {
    me: { encryptedPrivateKey },
  } = await app.graphql().GetMe();

  const result = await app.graphql().AcceptFriendRequest({ id });
  if (!result) throw new Error("Bad response from AcceptFriendRequest?");
};

export const rejectFriendRequest = async (app: LoadedApp, id: string) => {
  const result = await app.graphql().RejectFriendRequest({ requestId: id });
  if (!result) throw new Error("Bad response from AcceptFriendRequest?");
};

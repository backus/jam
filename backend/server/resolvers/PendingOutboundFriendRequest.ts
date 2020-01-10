import { User, Login } from "./../models";
import {
  PendingOutboundFriendRequestResolvers,
  PendingOutboundFriendRequest,
} from "../resolvers";
import { GraphQLContext, requireVerifiedUser } from "../server";

const PendingOutboundFriendRequestResolver: PendingOutboundFriendRequestResolvers<
  GraphQLContext,
  Required<PendingOutboundFriendRequest>
> = {
  loginPreviewTodos: async (friendRequest, parent, ctx, info) => {
    if (!friendRequest.recipient)
      throw new Error(
        "Expected recipient to be included in resolved friend request"
      );
    const { user: currentUser } = requireVerifiedUser(ctx.req);
    const friendUser = await User.findByPk(friendRequest.recipient.id);

    if (!friendUser)
      throw new Error(
        "Invariant failed: Model lookup for Friend shouldn't be null!"
      );

    return Login.loginPreviewTodoForFriend({
      loginOwner: currentUser,
      friend: friendRequest.recipient,
    });
  },
};

export default PendingOutboundFriendRequestResolver;

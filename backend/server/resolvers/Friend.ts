import { Invite, User, Login } from "./../models";
import { FriendResolvers, Friend } from "../resolvers";
import { GraphQLContext, requireVerifiedUser } from "../server";

const FriendResolver: FriendResolvers<GraphQLContext, Required<Friend>> = {
  loginPreviewTodos: async (friend, parent, ctx, info) => {
    const { user: currentUser } = requireVerifiedUser(ctx.req);
    const friendUser = await User.findByPk(friend.id);

    if (!friendUser)
      throw new Error(
        "Invariant failed: Model lookup for Friend shouldn't be null!"
      );

    return Login.loginPreviewTodoForFriend({
      loginOwner: currentUser,
      friend: friendUser,
    });
  },
  originalInvite: async (friend: Required<Friend>, _parent, ctx) => {
    const { user: currentUser } = requireVerifiedUser(ctx.req);

    return Invite.findOne({
      where: { fromId: currentUser.id, toId: friend.id },
    });
  },

  loginsSharedWithThem: async (friend: Required<Friend>, _parent, ctx) => {
    const { user } = requireVerifiedUser(ctx.req);

    return Login.sharedWithFriend({
      userId: user.id,
      friendId: friend.id,
    });
  },
  loginsSharedWithMe: async (friend: Required<Friend>, _parent, ctx) => {
    const { user } = requireVerifiedUser(ctx.req);

    return Login.sharedWithUser({
      userId: user.id,
      friendId: friend.id,
    });
  },
  loginPreviewsVisibleToThem: async (
    friend: Required<Friend>,
    _parent,
    ctx
  ) => {
    const { user } = requireVerifiedUser(ctx.req);

    return Login.previewsSharedWithFriend({
      userId: user.id,
      friendId: friend.id,
    });
  },
  loginPreviewsVisibleToMe: async (friend: Required<Friend>, _parent, ctx) => {
    const { user } = requireVerifiedUser(ctx.req);

    return Login.previewsSharedWithUser({
      userId: user.id,
      friendId: friend.id,
    });
  },
};

export default FriendResolver;

import { Invite, InviteLoginAccess, LoginData, Login } from "./../models";
import { InviteResolvers } from "../resolvers";
import { GraphQLContext, requireVerifiedUser } from "../server";
import { Op } from "sequelize";

const InviteResolver: InviteResolvers<GraphQLContext, Required<Invite>> = {
  loginShares: async (invite, { includePreviews }) => {
    let shares: InviteLoginAccess[];

    if (includePreviews) {
      shares = await InviteLoginAccess.findAll({
        where: { inviteId: invite.id },
        include: [LoginData],
      });
    } else {
      shares = await InviteLoginAccess.findAll({
        where: {
          inviteId: invite.id,
          credentialsKey: {
            [Op.not]: null,
          },
        },
        include: [LoginData],
      });
    }

    return shares.map((share) => ({
      id: share.loginData.id,
      preview: share.loginData.preview,
      previewKey: share.previewKey,
      credentialsKey: share.credentialsKey,
      schemaVersion: share.loginData.schemaVersion,
      type: share.loginData.type,
    }));
  },
  loginPreviewTodos: async (invite: Required<Invite>, parent, ctx, info) => {
    const { user: currentUser } = requireVerifiedUser(ctx.req);

    return Login.loginPreviewTodoForInvite({
      loginOwner: currentUser,
      inviteId: invite.id,
    });
  },
};

export default InviteResolver;

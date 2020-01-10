import { LoginAccess } from "./../models";
import { SharedLoginResolvers, SharedLogin } from "../resolvers";
import { GraphQLContext } from "../server";
import { userMembersOf } from "../db/loginMembers";

const SharedLoginResolver: SharedLoginResolvers<
  GraphQLContext,
  Required<SharedLogin>
> = {
  manager: async (login: Required<SharedLogin>) => {
    const managerAccess = await LoginAccess.findOne({
      where: { loginDataId: login.id, status: "manager" },
      include: ["user"],
    });

    if (!managerAccess) throw new Error("Not found!");

    return managerAccess.user;
  },
  members: async (login: Required<SharedLogin>, parent, ctx, info) => {
    return userMembersOf(login);
  },
};

export default SharedLoginResolver;

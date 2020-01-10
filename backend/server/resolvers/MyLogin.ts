import { LoginAccess } from "./../models";
import { MyLoginResolvers, MyLogin } from "../resolvers";
import { GraphQLContext } from "../server";
import { allMembersOf } from "../db/loginMembers";

const MyLoginResolver: MyLoginResolvers<GraphQLContext, Required<MyLogin>> = {
  manager: async (login: Required<MyLogin>) => {
    const managerAccess = await LoginAccess.findOne({
      where: { loginDataId: login.id, status: "manager" },
      include: ["user"],
    });

    if (!managerAccess) throw new Error("Not found!");

    return managerAccess.user;
  },
  members: async (login: Required<MyLogin>, parent, ctx, info) => {
    return allMembersOf(login);
  },
};

export default MyLoginResolver;

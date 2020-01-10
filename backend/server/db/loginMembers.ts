import * as _ from "lodash";
import {
  LoginAccess,
  InviteLoginAccess,
  Login,
  User,
  LoginData,
  Friend,
  Invite,
} from "./../models";
import { RsaEncryptedBlob, AesEncryptedBlob } from "../models/types";
import { Op, Transaction } from "sequelize";
import { LoginAccessStatus } from "../models/LoginAccess";

export const userMembersOf = async (login: { id: string }) => {
  const accessList = await LoginAccess.findAll({
    where: {
      loginDataId: login.id,
      status: LoginAccessStatus.Shared,
    },
    include: ["user"],
  });

  return _.map(accessList, "user");
};

export const allMembersOf = async (login: { id: string }) => {
  const accessList = await LoginAccess.findAll({
    where: {
      loginDataId: login.id,
      status: { [Op.or]: ["shared", "offer/pending"] },
    },
    include: ["user"],
  });

  const inviteAccessList = await InviteLoginAccess.findAll({
    where: { loginDataId: login.id, status: "offer/pending" },
    include: ["invite"],
  });

  return [..._.map(accessList, "user"), ..._.map(inviteAccessList, "invite")];
};

export const shareLoginWithFriends = async (
  user: User,
  login: LoginData,
  shares: {
    id: string;
    previewKey: RsaEncryptedBlob;
    credentialsKey: RsaEncryptedBlob;
  }[],
  transaction: Transaction
) => {
  if (login.userId !== user.id) throw new Error("Not the manager");

  const friendCount = await Friend.count({
    where: {
      userId: user.id,
      friendId: { [Op.in]: _.map(shares, "id") },
    },
    transaction,
  });

  if (shares.length !== friendCount)
    throw new Error("Mismatch between # of shares and # of friends");

  return Promise.all(
    shares.map(async (share) =>
      LoginAccess.upsert(
        {
          loginDataId: login.id,
          previewKey: share.previewKey,
          credentialsKey: share.credentialsKey,
          userId: share.id,
          status: "offer/pending",
        },
        { transaction }
      )
    )
  );
};

export const shareLoginWithInvitedFriends = async (
  user: User,
  login: LoginData,
  shares: {
    id: string;
    previewKey: AesEncryptedBlob;
    credentialsKey: AesEncryptedBlob;
  }[],
  transaction: Transaction
) => {
  if (login.userId !== user.id) throw new Error("Not the manager");

  const inviteCount = await Invite.count({
    where: {
      fromId: user.id,
      id: { [Op.in]: _.map(shares, "id") },
    },
    transaction,
  });

  if (shares.length !== inviteCount)
    throw new Error("Mismatch between # of shares and # of invites");

  return Promise.all(
    shares.map(async (share) => {
      return InviteLoginAccess.upsert(
        {
          loginDataId: login.id,
          previewKey: share.previewKey,
          credentialsKey: share.credentialsKey,
          inviteId: share.id,
          status: "offer/pending",
        },
        { transaction }
      );
    })
  );
};

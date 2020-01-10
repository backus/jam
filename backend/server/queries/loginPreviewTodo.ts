import { sequelize, User, Login } from "../models";
import { QueryTypes } from "sequelize";
import * as _ from "lodash";

type RawQueryResultType = { friendId: string; loginIds: string[] }[];

export const loginPreviewTodo = async (userId: string) => {
  const todo: RawQueryResultType = await sequelize.query(
    `SELECT
      friend_id AS "friendId", array_agg(login_data.id) AS "loginIds"
    FROM friends
    CROSS JOIN login_data
    LEFT JOIN login_access
      ON login_access.login_data_id = login_data.id
      AND login_access.user_id = friend_id
    WHERE friends.user_id = :user_id
    AND login_data.user_id = :user_id
    AND login_data.share_previews = 't'
    AND login_access.login_data_id IS NULL
    GROUP BY friend_id;`,
    {
      replacements: { user_id: userId },
      type: QueryTypes.SELECT,
      raw: true,
    }
  );

  const byFriendId = _.keyBy(todo, "friendId");
  const friends = await User.findAll({
    where: { id: Object.keys(byFriendId) },
    attributes: ["id", "publicKey"],
  });

  const withPubKeys = friends.map((friend) => ({
    ...byFriendId[friend.id],
    publicKey: friend.publicKey,
  }));

  return {
    todo: withPubKeys,
    logins: await Login.findAll({
      where: {
        id: _.uniq(_.flatMap(todo, "loginIds")),
        managerId: userId,
        memberId: userId,
      },
    }),
  };
};

import React from "react";
import { UserList, ViewFriendRow } from "./AddFriendRow";
import { Card } from "./Card";
import distanceInWordsToNow from "date-fns/formatDistanceToNow";
import { SocialGraphFriend } from "../FindFriends";

export const YourFriends: React.FC<{ friends: SocialGraphFriend[] }> = ({
  friends,
}) => (
  <Card flush wide verticalPadding={40} label="Your Friends">
    <UserList>
      {friends.map((friend, index) => {
        let description = "Not sharing anything... yet!";

        const receivingCount = friend.loginsSharedWithMe.length;
        const givingCount = friend.loginsSharedWithThem.length;

        if (receivingCount > 0) {
          description = `Sharing ${receivingCount} account${
            receivingCount > 1 ? "s" : ""
          } with you`;
        } else if (givingCount > 0) {
          description = `Has access to ${givingCount} of your accounts`;
        }
        return (
          <ViewFriendRow key={index} {...friend} description={description} />
        );
      })}
    </UserList>
  </Card>
);

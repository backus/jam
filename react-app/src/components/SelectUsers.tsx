import React, { useState } from "react";
import styled from "styled-components/macro";
import * as _ from "lodash";
import { SelectableLoginMember, Grid } from "./LoginMember";
import { props } from "ramda";

type TSelectUser = { id: string; name: string; avatarUrl?: string };

export const SelectUsers: React.FC<{
  users: TSelectUser[];
  selected: TSelectUser[];
  onChange: (value: TSelectUser[]) => void;
}> = (props) => {
  const [selectedIds, setSelectedIds] = useState<{
    [key: string]: boolean;
  }>(
    _.fromPairs(props.selected.map((selectedUser) => [selectedUser.id, true]))
  );

  // Sort users so that existing members come first, so that they line up with where they were displayed
  // before edit mode in the ViewLogin state. Using `useState` so that we don't re-sort users on each render
  // which would move users around when selected
  const [sortedUsers, _set] = useState(
    _.sortBy(props.users, (user) => !selectedIds[user.id])
  );

  React.useEffect(() => {
    props.onChange(props.users.filter((user) => selectedIds[user.id]));
  }, [selectedIds]);

  return (
    <React.Fragment>
      {sortedUsers.map((user, index) => (
        <SelectableLoginMember
          key={index}
          username={user.name}
          avatarUrl={user.avatarUrl || ""}
          onClick={() => {
            setSelectedIds({
              ...selectedIds,
              [user.id]: !selectedIds[user.id],
            });
          }}
          selected={selectedIds[user.id]}
        />
      ))}
    </React.Fragment>
  );
};

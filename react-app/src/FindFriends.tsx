import React, { useState, useEffect } from "react";
import styled from "styled-components/macro";
import {
  AddFriendRow,
  RespondToFriendRequestRow,
  PendingFriendRequestRow,
  ExistingFriendRow,
  InvitedFriendRow,
  UserList,
  ViewFriendRow,
} from "./components/AddFriendRow";
import { Card, Body, SectionHeader, Cards } from "./components/Card";
import { SearchBar } from "./components/SearchBar";
import { InviteVia } from "./components/InviteVia";
import { LoadedApp } from "./AppContainer";
import { Invite } from "./api/graphql";
import { trim } from "ramda";
import distanceInWordsToNow from "date-fns/formatDistanceToNow";
import { parseISO } from "date-fns";
import { ApiReturnType } from "./graphqlApi";
import { Unboxed } from "./generics";
import { assertNever } from "./assertNever";
import { acceptFriendRequest, rejectFriendRequest } from "./friendRequests";
import {
  CreateInviteModal,
  PresentInviteLinkModal,
} from "./components/InviteModal";
import clientEnv from "./clientEnv";
import { YourFriends } from "./components/YourFriends";

const FindFriendsCard = styled(Card)`
  & > ${Body} > * {
    margin-bottom: 20px;
  }
`;

const Pad = styled.div`
  padding: 0 24px;
`;

interface OtherUser {
  username: string;
  id: string;
  avatarUrl: string | null;
  createdAt: string;
  publicKey: string;
}

const SearchResultsMessage = styled.div`
  height: 60px;
  font-size: 16px;
  font-weight: 500;
  line-height: 60px;
  width: 100%;
  text-align: center;
  color: #555a60;
`;

const SearchResultsPlaceholder: React.FC<{
  search: string;
  searchResults: any[];
  loading: boolean;
}> = (props) => {
  let text: string;

  if (!props.loading && props.searchResults.length > 0) return null;

  if (props.search.length === 0) {
    text = "💬 Type to find your friends...";
  } else if (props.search.length < 3) {
    text = "💬 Keep typing to find your friends...";
  } else if (props.loading) {
    text = "⏳ Searching...";
  } else if (props.searchResults.length === 0) {
    text = "😞 No results";
  } else {
    return null;
  }

  return <SearchResultsMessage>{text}</SearchResultsMessage>;
};

const FindFriendsRow: React.FC<Unboxed<SearchResults> & { app: LoadedApp }> = ({
  app,
  status,
  user,
  inboundFriendRequestId,
}) => {
  const addFriend = async (user: OtherUser) => {
    const result = await app.api().addFriend(user);
    if (!result) throw new Error("Bad response from AddFriend?");

    app.syncLoginAccessKeys();
  };

  const acceptReq = async () => {
    if (!inboundFriendRequestId) throw new Error("Expected id to be defined");

    return acceptFriendRequest(app, inboundFriendRequestId);
  };

  const rejectReq = async () => {
    if (!inboundFriendRequestId) throw new Error("Expected id to be defined");
    return rejectFriendRequest(app, inboundFriendRequestId);
  };

  const memberSinceText = `Joined ${distanceInWordsToNow(
    parseISO(user.createdAt)
  )} ago`;

  switch (status) {
    case "stranger":
      return (
        <AddFriendRow
          avatarUri={user.avatarUrl}
          name={user.username}
          description={memberSinceText}
          onAdd={() => addFriend(user)}
        />
      );
    case "inbound_pending":
      return (
        <RespondToFriendRequestRow
          avatarUri={user.avatarUrl}
          name={user.username}
          onAccept={async () => acceptReq()}
          onReject={async () => rejectReq()}
        />
      );
    case "outbound_pending":
      return (
        <PendingFriendRequestRow
          avatarUri={user.avatarUrl}
          name={user.username}
        />
      );
    case "friend":
      return (
        <ExistingFriendRow
          avatarUri={user.avatarUrl}
          name={user.username}
          description={memberSinceText}
        />
      );
    default:
      return assertNever();
  }
};

type SearchResults = ApiReturnType<"FindFriends">["findFriends"];
type SocialGraphInvite = Unboxed<ApiReturnType<"GetSocialGraph">["invites"]>;
export type SocialGraphFriend = Unboxed<
  ApiReturnType<"GetSocialGraph">["friends"]
>;

export const FindFriends: React.FC<{ app: LoadedApp }> = (props) => {
  const { currentUser, crypto } = props.app.state;
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults>([]);
  const [createInviteModal, setCreateInviteModal] = useState(false);
  const [viewInvite, setViewInvite] = useState<null | Omit<
    Invite,
    "email" | "from" | "loginShares" | "loginPreviewTodos"
  >>(null);
  const [viewInviteLink, setViewInviteLink] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);
  const [invites, setInvites] = useState<SocialGraphInvite[]>([]);
  const [friends, setFriends] = useState<SocialGraphFriend[]>([]);

  useEffect(() => {
    const lookup = async () => {
      setLoading(true);
      const { findFriends: results } = await props.app
        .graphql()
        .FindFriends({ search });
      setSearchResults(results);
      setLoading(false);
    };

    if (trim(search).length > 2) {
      lookup();
    } else if (trim(search).length === 0) {
      setSearchResults([]);
    }
  }, [props.app, search]);

  const loadInvites = async () => {
    const { invites, friends } = await props.app.graphql().GetSocialGraph();
    setInvites(invites);
    setFriends(friends);
  };

  useEffect(() => {
    loadInvites();
  }, []);

  useEffect(() => {
    const reconstructInviteLink = async () => {
      if (!viewInvite)
        throw new Error("Should only be called if viewInvite is defined");

      const linkKey = await currentUser.unwrapDataKey(viewInvite.key);
      const encodedKey = await crypto.exportDataKeyAsBase64(linkKey);

      const url = clientEnv.absolutePath(
        `/invite/${viewInvite.id}#${encodedKey}`
      );

      setViewInviteLink(url.toString());
    };

    if (viewInvite) reconstructInviteLink();
  }, [viewInvite, crypto, currentUser]);

  return (
    <Cards>
      {createInviteModal && (
        <CreateInviteModal
          app={props.app}
          onClose={() => {
            loadInvites();
            setCreateInviteModal(false);
          }}
        />
      )}
      {viewInvite && viewInviteLink && (
        <PresentInviteLinkModal
          nickname={viewInvite.nickname}
          link={viewInviteLink}
          onClose={() => {
            setViewInvite(null);
            setViewInviteLink(null);
          }}
        />
      )}
      <FindFriendsCard flush wide verticalPadding={40} label="find friends">
        <Pad>
          <SearchBar
            autoFocus
            onChange={(e: any) => setSearch(e.currentTarget.value)}
          />
        </Pad>
        <UserList>
          <SearchResultsPlaceholder
            search={search}
            searchResults={searchResults}
            loading={loading}
          />
          {searchResults.map((result, i) => (
            <FindFriendsRow app={props.app} {...result} key={i} />
          ))}
        </UserList>
        <SectionHeader>send an invite</SectionHeader>
        <div>
          {/* <InviteVia
            type="sms"
            text="By phone number"
            onClick={() => setInviteModal("sms")}
          /> */}
          {/* <InviteVia type="email" text="By email" /> */}
          <InviteVia
            data-jam-analyze="find-friends/generate-invite/link"
            type="link"
            text="Generate invite link"
            onClick={() => setCreateInviteModal(true)}
          />
        </div>
      </FindFriendsCard>
      {invites.length > 0 && (
        <Card flush wide verticalPadding={40} label="Pending Invites">
          <UserList>
            {invites.map((invite, index) => (
              <InvitedFriendRow
                key={index}
                nickname={invite.nickname}
                description={`Invited ${distanceInWordsToNow(
                  parseISO(invite.createdAt)
                )} ago`}
                onView={() => setViewInvite(invite)}
                onDelete={async () => {
                  await props.app.api().deleteInvite(invite.id);
                  await loadInvites();
                }}
              />
            ))}
          </UserList>
        </Card>
      )}
      {friends.length > 0 && <YourFriends friends={friends} />}
    </Cards>
  );
};

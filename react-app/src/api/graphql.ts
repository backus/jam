import { GraphQLClient } from "graphql-request";
import { print } from "graphql";
import gql from "graphql-tag";
export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
};

export type AcceptBetaInviteInput = {
  id: Scalars["String"];
  user: CreateBetaUserInput;
};

export type AcceptInviteAccessKeyInput = {
  id: Scalars["String"];
  previewKey: RsaEncryptedBlobInput;
  credentialsKey: Maybe<RsaEncryptedBlobInput>;
};

export type AcceptInviteInput = {
  id: Scalars["String"];
  user: CreateUserInput;
  accessKeys: Array<AcceptInviteAccessKeyInput>;
};

export type AesEncryptedBlob = {
  __typename?: "AesEncryptedBlob";
  ciphertext: Scalars["String"];
  iv: Scalars["String"];
  salt: Scalars["String"];
  algorithm: Scalars["String"];
};

export type AesEncryptedBlobInput = {
  ciphertext: Scalars["String"];
  iv: Scalars["String"];
  salt: Scalars["String"];
  algorithm: Scalars["String"];
};

export type ApproveShareRequestInput = {
  id: Scalars["String"];
  memberId: Scalars["String"];
  credentialsKey: RsaEncryptedBlobInput;
};

export type AvatarUploadInstructions = {
  __typename?: "AvatarUploadInstructions";
  avatarUrl: Scalars["String"];
  uploadUrl: Scalars["String"];
};

/** Same as CreateUserInput, but no email since it should already be set */
export type CreateBetaUserInput = {
  username: Scalars["String"];
  avatarUrl: Maybe<Scalars["String"]>;
  srpPbkdf2Salt: Scalars["String"];
  masterKeyPbkdf2Salt: Scalars["String"];
  srpSalt: Scalars["String"];
  srpVerifier: Scalars["String"];
  publicKey: Scalars["String"];
  encryptedPrivateKey: AesEncryptedBlobInput;
};

export type CreateInviteInput = {
  phone: Maybe<Scalars["String"]>;
  email: Maybe<Scalars["String"]>;
  key: RsaEncryptedBlobInput;
  nickname: Scalars["String"];
};

export type CreateLoginFriendShareInput = {
  id: Scalars["String"];
  previewKey: RsaEncryptedBlobInput;
  credentialsKey: RsaEncryptedBlobInput;
};

export type CreateLoginInput = {
  credentials: AesEncryptedBlobInput;
  preview: AesEncryptedBlobInput;
  credentialsKey: RsaEncryptedBlobInput;
  previewKey: RsaEncryptedBlobInput;
  friendShares: Array<CreateLoginFriendShareInput>;
  inviteShares: Array<CreateLoginInvitedFriendShareInput>;
  sharePreviews: Scalars["Boolean"];
  schemaVersion: LoginSchemaVersion;
  type: LoginType;
};

export type CreateLoginInvitedFriendShareInput = {
  id: Scalars["String"];
  previewKey: AesEncryptedBlobInput;
  credentialsKey: AesEncryptedBlobInput;
};

export type CreateUserInput = {
  username: Scalars["String"];
  email: Scalars["String"];
  avatarUrl: Maybe<Scalars["String"]>;
  srpPbkdf2Salt: Scalars["String"];
  masterKeyPbkdf2Salt: Scalars["String"];
  srpSalt: Scalars["String"];
  srpVerifier: Scalars["String"];
  publicKey: Scalars["String"];
  encryptedPrivateKey: AesEncryptedBlobInput;
};

export type FindFriendResult = {
  __typename?: "FindFriendResult";
  status: FindFriendType;
  inboundFriendRequestId: Maybe<Scalars["String"]>;
  user: Stranger;
};

export enum FindFriendType {
  OutboundPending = "outbound_pending",
  InboundPending = "inbound_pending",
  Friend = "friend",
  Stranger = "stranger",
}

export type FinishSrpHandshakeInput = {
  id: Scalars["String"];
  clientProof: Scalars["String"];
};

export type Friend = {
  __typename?: "Friend";
  id: Scalars["String"];
  email: Scalars["String"];
  username: Scalars["String"];
  publicKey: Scalars["String"];
  avatarUrl: Scalars["String"];
  loginPreviewTodos: Array<MyLogin>;
  originalInvite: Maybe<Invite>;
  loginsSharedWithThem: Array<MyLogin>;
  loginsSharedWithMe: Array<SharedLogin>;
  loginPreviewsVisibleToThem: Array<MyLogin>;
  loginPreviewsVisibleToMe: Array<LoginPreviewSummary>;
};

export type Invite = {
  __typename?: "Invite";
  id: Scalars["String"];
  createdAt: Maybe<Scalars["Date"]>;
  nickname: Scalars["String"];
  email: Maybe<Scalars["String"]>;
  key: RsaEncryptedBlob;
  from: Stranger;
  loginShares: Array<InviteLoginShare>;
  loginPreviewTodos: Array<MyLogin>;
};

export type InviteLoginSharesArgs = {
  includePreviews?: Maybe<Scalars["Boolean"]>;
};

export type InviteLoginShare = {
  __typename?: "InviteLoginShare";
  id: Scalars["String"];
  preview: AesEncryptedBlob;
  previewKey: AesEncryptedBlob;
  credentialsKey: Maybe<AesEncryptedBlob>;
  schemaVersion: LoginSchemaVersion;
  type: LoginType;
};

/** We define separate types for the two because resolver logic is different from membership */
export type Login = MyLogin | SharedLogin;

export type LoginPreviewForInviteInput = {
  loginId: Scalars["String"];
  previewKey: AesEncryptedBlobInput;
};

export type LoginPreviewInput = {
  loginId: Scalars["String"];
  previewKey: RsaEncryptedBlobInput;
};

export type LoginPreviewsForInviteInput = {
  inviteId: Scalars["String"];
  loginPreviewKeys: Array<LoginPreviewForInviteInput>;
};

export type LoginPreviewsInput = {
  friendId: Scalars["String"];
  loginPreviewKeys: Array<LoginPreviewInput>;
};

export type LoginPreviewSummary = {
  __typename?: "LoginPreviewSummary";
  id: Scalars["String"];
  createdAt: Scalars["Date"];
  accessRequested: Scalars["Boolean"];
  preview: AesEncryptedBlob;
  previewKey: RsaEncryptedBlob;
  schemaVersion: LoginSchemaVersion;
  type: LoginType;
  manager: Friend;
};

export type LoginPreviewTodo = {
  __typename?: "LoginPreviewTodo";
  friendId: Scalars["String"];
  publicKey: Scalars["String"];
  loginIds: Array<Scalars["String"]>;
};

export type LoginPreviewTodoList = {
  __typename?: "LoginPreviewTodoList";
  todo: Array<LoginPreviewTodo>;
  logins: Array<MyLogin>;
};

export enum LoginSchemaVersion {
  V1 = "v1",
  V0 = "v0",
}

export type LoginShare = {
  __typename?: "LoginShare";
  id: Scalars["String"];
  manager: Friend;
  preview: AesEncryptedBlob;
  previewKey: RsaEncryptedBlob;
  schemaVersion: LoginSchemaVersion;
  type: LoginType;
};

export type LoginShareRequest = {
  __typename?: "LoginShareRequest";
  id: Scalars["String"];
  preview: AesEncryptedBlob;
  previewKey: RsaEncryptedBlob;
  credentialsKey: RsaEncryptedBlob;
  schemaVersion: LoginSchemaVersion;
  type: LoginType;
  member: Friend;
};

export type LoginTransfer = {
  __typename?: "LoginTransfer";
  id: Scalars["String"];
  credentials: AesEncryptedBlob;
  credentialsKey: RsaEncryptedBlob;
};

export enum LoginType {
  RawCredentials = "raw_credentials",
  BrowserState = "browser_state",
}

export enum MagicLinkPulseState {
  Activating = "activating",
  Success = "success",
  Fail = "fail",
}

export type Me = {
  __typename?: "Me";
  id: Scalars["String"];
  isInBetaOnboarding: Scalars["Boolean"];
  createdAt: Scalars["Date"];
  updatedAt: Scalars["Date"];
  srpSalt: Scalars["String"];
  username: Scalars["String"];
  avatarUrl: Scalars["String"];
  email: Scalars["String"];
  publicKey: Scalars["String"];
  encryptedPrivateKey: AesEncryptedBlob;
  showOnboardingCard: Scalars["Boolean"];
  emailVerified: Scalars["Boolean"];
  forcedPasswordChangeEnabled: Scalars["Boolean"];
};

export type Mutation = {
  __typename?: "Mutation";
  addFriend: Maybe<Scalars["Boolean"]>;
  acceptFriendRequest: Maybe<Scalars["Boolean"]>;
  rejectFriendRequest: Maybe<Scalars["Boolean"]>;
  unfriend: Maybe<Scalars["Boolean"]>;
  createUser: Me;
  updatePassword: Scalars["Boolean"];
  updateAccount: Scalars["Boolean"];
  acceptInvite: Me;
  acceptBetaInvite: Me;
  createLogin: MyLogin;
  updateLogin: Scalars["Boolean"];
  deleteLogin: Scalars["Boolean"];
  deleteInvite: Scalars["Boolean"];
  acceptLoginShare: Scalars["Boolean"];
  rejectLoginShare: Scalars["Boolean"];
  startSRPHandshake: SrpStartHandshakeResponse;
  finishSRPHandshake: SrpFinishHandshakeResponse;
  signOut: Scalars["Boolean"];
  shareLogin: Scalars["Boolean"];
  preshareLogin: Scalars["Boolean"];
  createInvite: Scalars["String"];
  updateInvite: Scalars["Boolean"];
  dismissOnboardingCard: Scalars["Boolean"];
  verifyEmail: Scalars["Boolean"];
  joinWaitlist: WaitlistStatus;
  unsubscribeFromWaitlist: Scalars["Boolean"];
  confirmWaitlist: WaitlistStatus;
  publishLoginPreviews: Scalars["Boolean"];
  publishLoginPreviewsForInvite: Scalars["Boolean"];
  requestLoginShare: Scalars["Boolean"];
  approveShareRequest: Scalars["Boolean"];
  rejectShareRequest: Scalars["Boolean"];
  finishBetaOnboarding: Scalars["Boolean"];
  recordMagicLinkUsage: Scalars["Boolean"];
};

export type MutationAddFriendArgs = {
  userId: Scalars["String"];
};

export type MutationAcceptFriendRequestArgs = {
  id: Scalars["String"];
};

export type MutationRejectFriendRequestArgs = {
  requestId: Scalars["String"];
};

export type MutationUnfriendArgs = {
  id: Scalars["String"];
};

export type MutationCreateUserArgs = {
  params: CreateUserInput;
};

export type MutationUpdatePasswordArgs = {
  params: UpdatePasswordInput;
};

export type MutationUpdateAccountArgs = {
  username: Maybe<Scalars["String"]>;
  avatarUrl: Maybe<Scalars["String"]>;
};

export type MutationAcceptInviteArgs = {
  params: AcceptInviteInput;
};

export type MutationAcceptBetaInviteArgs = {
  params: AcceptBetaInviteInput;
};

export type MutationCreateLoginArgs = {
  params: CreateLoginInput;
};

export type MutationUpdateLoginArgs = {
  params: UpdateLoginInput;
};

export type MutationDeleteLoginArgs = {
  id: Scalars["String"];
};

export type MutationDeleteInviteArgs = {
  id: Scalars["String"];
};

export type MutationAcceptLoginShareArgs = {
  loginId: Scalars["String"];
};

export type MutationRejectLoginShareArgs = {
  id: Scalars["String"];
};

export type MutationStartSrpHandshakeArgs = {
  params: StartSrpHandshakeInput;
};

export type MutationFinishSrpHandshakeArgs = {
  params: FinishSrpHandshakeInput;
};

export type MutationShareLoginArgs = {
  params: ShareLoginInput;
};

export type MutationPreshareLoginArgs = {
  params: PreshareLoginInput;
};

export type MutationCreateInviteArgs = {
  params: CreateInviteInput;
};

export type MutationUpdateInviteArgs = {
  id: Scalars["String"];
  changes: UpdateInviteInput;
};

export type MutationVerifyEmailArgs = {
  id: Scalars["String"];
};

export type MutationJoinWaitlistArgs = {
  email: Scalars["String"];
  firstName: Scalars["String"];
};

export type MutationUnsubscribeFromWaitlistArgs = {
  id: Scalars["String"];
};

export type MutationConfirmWaitlistArgs = {
  secret: Scalars["String"];
};

export type MutationPublishLoginPreviewsArgs = {
  params: LoginPreviewsInput;
};

export type MutationPublishLoginPreviewsForInviteArgs = {
  params: LoginPreviewsForInviteInput;
};

export type MutationRequestLoginShareArgs = {
  id: Scalars["String"];
};

export type MutationApproveShareRequestArgs = {
  params: ApproveShareRequestInput;
};

export type MutationRejectShareRequestArgs = {
  id: Scalars["String"];
  memberId: Scalars["String"];
};

export type MutationRecordMagicLinkUsageArgs = {
  id: Scalars["String"];
  state: MagicLinkPulseState;
};

export type MyLogin = {
  __typename?: "MyLogin";
  id: Scalars["String"];
  createdAt: Scalars["Date"];
  updatedAt: Scalars["Date"];
  credentials: AesEncryptedBlob;
  preview: AesEncryptedBlob;
  credentialsKey: RsaEncryptedBlob;
  previewKey: RsaEncryptedBlob;
  manager: Me;
  members: Maybe<Array<ShareRecipient>>;
  sharePreviews: Scalars["Boolean"];
  schemaVersion: LoginSchemaVersion;
  type: LoginType;
};

export type MyLoginSummary = {
  __typename?: "MyLoginSummary";
  id: Scalars["String"];
  createdAt: Scalars["Date"];
  credentials: AesEncryptedBlob;
  credentialsKey: RsaEncryptedBlob;
  schemaVersion: LoginSchemaVersion;
  type: LoginType;
};

export type PendingInboundFriendRequest = {
  __typename?: "PendingInboundFriendRequest";
  id: Scalars["String"];
  initiator: Stranger;
};

export type PendingOutboundFriendRequest = {
  __typename?: "PendingOutboundFriendRequest";
  createdAt: Scalars["Date"];
  recipient: Stranger;
  loginPreviewTodos: Array<MyLogin>;
};

export type PotentialShare = {
  __typename?: "PotentialShare";
  friend: ShareRecipient;
  numSharing: Scalars["Int"];
};

export type PreshareLoginInput = {
  inviteId: Scalars["String"];
  loginId: Scalars["String"];
  credentialsKey: AesEncryptedBlobInput;
  previewKey: AesEncryptedBlobInput;
};

export type Query = {
  __typename?: "Query";
  time: Scalars["Date"];
  me: Me;
  friends: Array<Friend>;
  friend: Maybe<Friend>;
  invites: Array<Invite>;
  pendingInboundFriendRequests: Array<PendingInboundFriendRequest>;
  pendingInboundFriendRequest: PendingInboundFriendRequest;
  pendingOutboundFriendRequests: Array<PendingOutboundFriendRequest>;
  login: Login;
  myLogins: Array<MyLoginSummary>;
  loginsSharedWithMe: Array<SharedLoginSummary>;
  loginPreviews: Array<LoginPreviewSummary>;
  pendingLoginShares: Array<LoginShare>;
  potentialShares: Array<PotentialShare>;
  getAvatarUploadUrl: AvatarUploadInstructions;
  findFriends: Array<FindFriendResult>;
  invite: Invite;
  sessionWrapper: Scalars["String"];
  loginPreviewTodo: LoginPreviewTodoList;
  loginPreview: LoginPreviewSummary;
  loginShareRequests: Array<LoginShareRequest>;
  waitlistEntry: Maybe<WaitlistEntry>;
  isUsernameAvailable: Scalars["Boolean"];
  isEmailAvailable: Scalars["Boolean"];
};

export type QueryFriendArgs = {
  id: Scalars["String"];
};

export type QueryPendingInboundFriendRequestArgs = {
  id: Scalars["String"];
};

export type QueryLoginArgs = {
  id: Scalars["String"];
};

export type QueryPotentialSharesArgs = {
  id: Maybe<Scalars["String"]>;
};

export type QueryFindFriendsArgs = {
  search: Scalars["String"];
};

export type QueryInviteArgs = {
  id: Scalars["String"];
};

export type QueryLoginPreviewArgs = {
  id: Scalars["String"];
};

export type QueryWaitlistEntryArgs = {
  id: Scalars["String"];
};

export type QueryIsUsernameAvailableArgs = {
  username: Scalars["String"];
};

export type QueryIsEmailAvailableArgs = {
  email: Scalars["String"];
};

export type RsaEncryptedBlob = {
  __typename?: "RsaEncryptedBlob";
  ciphertext: Scalars["String"];
  algorithm: Scalars["String"];
};

export type RsaEncryptedBlobInput = {
  ciphertext: Scalars["String"];
  algorithm: Scalars["String"];
};

export type SharedLogin = {
  __typename?: "SharedLogin";
  id: Scalars["String"];
  createdAt: Scalars["Date"];
  updatedAt: Scalars["Date"];
  credentials: AesEncryptedBlob;
  preview: AesEncryptedBlob;
  credentialsKey: RsaEncryptedBlob;
  previewKey: RsaEncryptedBlob;
  schemaVersion: LoginSchemaVersion;
  type: LoginType;
  manager: Friend;
  members: Maybe<Array<Stranger>>;
};

export type SharedLoginSummary = {
  __typename?: "SharedLoginSummary";
  id: Scalars["String"];
  createdAt: Scalars["Date"];
  credentials: AesEncryptedBlob;
  credentialsKey: RsaEncryptedBlob;
  schemaVersion: LoginSchemaVersion;
  type: LoginType;
  manager: Friend;
};

export type ShareLoginInput = {
  friendId: Scalars["String"];
  loginId: Scalars["String"];
  credentialsKey: RsaEncryptedBlobInput;
  previewKey: RsaEncryptedBlobInput;
};

export type ShareRecipient = Friend | Invite;

export type SrpFinishHandshakeResponse = {
  __typename?: "SRPFinishHandshakeResponse";
  id: Scalars["String"];
  serverProof: Scalars["String"];
  sessionWrapper: Scalars["String"];
  masterKeyPbkdf2Salt: Scalars["String"];
};

export type SrpStartHandshakeResponse = {
  __typename?: "SRPStartHandshakeResponse";
  id: Scalars["String"];
  srpSalt: Scalars["String"];
  srpPbkdf2Salt: Scalars["String"];
  serverPublicEphemeral: Scalars["String"];
};

export type StartSrpHandshakeInput = {
  email: Scalars["String"];
  clientPublicEphemeral: Scalars["String"];
};

export type Stranger = {
  __typename?: "Stranger";
  id: Scalars["String"];
  username: Scalars["String"];
  publicKey: Scalars["String"];
  avatarUrl: Scalars["String"];
  createdAt: Maybe<Scalars["Date"]>;
};

export type UpdateInviteInput = {
  email: Maybe<Scalars["String"]>;
  nickname: Maybe<Scalars["String"]>;
};

export type UpdateLoginInput = {
  id: Scalars["String"];
  credentials: AesEncryptedBlobInput;
  preview: AesEncryptedBlobInput;
  newFriendShares: Array<CreateLoginFriendShareInput>;
  newInviteShares: Array<CreateLoginInvitedFriendShareInput>;
  revokedFriendShares: Array<Scalars["String"]>;
  revokedInviteShares: Array<Scalars["String"]>;
  sharePreviews: Scalars["Boolean"];
  schemaVersion: LoginSchemaVersion;
};

export type UpdatePasswordInput = {
  srpPbkdf2Salt: Scalars["String"];
  masterKeyPbkdf2Salt: Scalars["String"];
  srpSalt: Scalars["String"];
  srpVerifier: Scalars["String"];
  encryptedPrivateKey: AesEncryptedBlobInput;
};

export type WaitlistEntry = {
  __typename?: "WaitlistEntry";
  id: Scalars["String"];
  email: Scalars["String"];
  createdAt: Scalars["Date"];
  unsubscribedAt: Maybe<Scalars["Date"]>;
};

export enum WaitlistStatus {
  Unverified = "unverified",
  Waiting = "waiting",
  Invited = "invited",
  Accepted = "accepted",
}

export type CreateUserMutationVariables = {
  params: CreateUserInput;
};

export type CreateUserMutation = { __typename?: "Mutation" } & {
  createUser: { __typename?: "Me" } & Pick<
    Me,
    "id" | "email" | "createdAt" | "updatedAt"
  >;
};

export type UpdatePasswordMutationVariables = {
  params: UpdatePasswordInput;
};

export type UpdatePasswordMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "updatePassword"
>;

export type StartSrpHandshakeMutationVariables = {
  params: StartSrpHandshakeInput;
};

export type StartSrpHandshakeMutation = { __typename?: "Mutation" } & {
  startSRPHandshake: { __typename?: "SRPStartHandshakeResponse" } & Pick<
    SrpStartHandshakeResponse,
    "id" | "srpSalt" | "srpPbkdf2Salt" | "serverPublicEphemeral"
  >;
};

export type FinishSrpHandshakeMutationVariables = {
  params: FinishSrpHandshakeInput;
};

export type FinishSrpHandshakeMutation = { __typename?: "Mutation" } & {
  finishSRPHandshake: { __typename?: "SRPFinishHandshakeResponse" } & Pick<
    SrpFinishHandshakeResponse,
    "id" | "serverProof" | "sessionWrapper" | "masterKeyPbkdf2Salt"
  >;
};

export type SignOutMutationVariables = {};

export type SignOutMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "signOut"
>;

export type AesEncryptedBlobFieldsFragment = {
  __typename?: "AesEncryptedBlob";
} & Pick<AesEncryptedBlob, "ciphertext" | "iv" | "salt" | "algorithm">;

export type RsaEncryptedBlobFieldsFragment = {
  __typename?: "RsaEncryptedBlob";
} & Pick<RsaEncryptedBlob, "ciphertext" | "algorithm">;

type ShareRecipientFields_Friend_Fragment = { __typename?: "Friend" } & Pick<
  Friend,
  "id" | "avatarUrl" | "publicKey"
> & { name: Friend["username"]; kind: "Friend" };

type ShareRecipientFields_Invite_Fragment = { __typename?: "Invite" } & Pick<
  Invite,
  "id"
> & { name: Invite["nickname"]; kind: "Invite" } & {
    dataKey: { __typename?: "RsaEncryptedBlob" } & Pick<
      RsaEncryptedBlob,
      "ciphertext" | "algorithm"
    >;
  };

export type ShareRecipientFieldsFragment =
  | ShareRecipientFields_Friend_Fragment
  | ShareRecipientFields_Invite_Fragment;

export type MySessionWrapperQueryVariables = {};

export type MySessionWrapperQuery = { __typename?: "Query" } & Pick<
  Query,
  "sessionWrapper"
>;

export type GetTimeQueryVariables = {};

export type GetTimeQuery = { __typename?: "Query" } & Pick<Query, "time">;

export type CreateNewLoginMutationVariables = {
  params: CreateLoginInput;
};

export type CreateNewLoginMutation = { __typename?: "Mutation" } & {
  createLogin: { __typename?: "MyLogin" } & Pick<
    MyLogin,
    "id" | "schemaVersion"
  > & {
      credentials: {
        __typename?: "AesEncryptedBlob";
      } & AesEncryptedBlobFieldsFragment;
      credentialsKey: {
        __typename?: "RsaEncryptedBlob";
      } & RsaEncryptedBlobFieldsFragment;
    };
};

export type UpdateLoginMutationVariables = {
  params: UpdateLoginInput;
};

export type UpdateLoginMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "updateLogin"
>;

export type UpdateAccountMutationVariables = {
  username: Maybe<Scalars["String"]>;
  avatarUrl: Maybe<Scalars["String"]>;
};

export type UpdateAccountMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "updateAccount"
>;

export type DeleteInviteMutationVariables = {
  id: Scalars["String"];
};

export type DeleteInviteMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "deleteInvite"
>;

export type DeleteLoginMutationVariables = {
  id: Scalars["String"];
};

export type DeleteLoginMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "deleteLogin"
>;

export type AcceptLoginShareMutationVariables = {
  loginId: Scalars["String"];
};

export type AcceptLoginShareMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "acceptLoginShare"
>;

export type RejectLoginShareMutationVariables = {
  id: Scalars["String"];
};

export type RejectLoginShareMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "rejectLoginShare"
>;

export type GetLoginsOverviewQueryVariables = {};

export type GetLoginsOverviewQuery = { __typename?: "Query" } & {
  mine: Array<
    { __typename?: "MyLoginSummary" } & Pick<
      MyLoginSummary,
      "id" | "createdAt" | "type" | "schemaVersion"
    > & {
        credentials: {
          __typename?: "AesEncryptedBlob";
        } & AesEncryptedBlobFieldsFragment;
        credentialsKey: {
          __typename?: "RsaEncryptedBlob";
        } & RsaEncryptedBlobFieldsFragment;
      }
  >;
  shared: Array<
    { __typename?: "SharedLoginSummary" } & Pick<
      SharedLoginSummary,
      "id" | "createdAt" | "type" | "schemaVersion"
    > & {
        credentials: {
          __typename?: "AesEncryptedBlob";
        } & AesEncryptedBlobFieldsFragment;
        credentialsKey: {
          __typename?: "RsaEncryptedBlob";
        } & RsaEncryptedBlobFieldsFragment;
        manager: { __typename?: "Friend" } & Pick<
          Friend,
          "username" | "avatarUrl"
        >;
      }
  >;
  previews: Array<
    { __typename?: "LoginPreviewSummary" } & Pick<
      LoginPreviewSummary,
      "id" | "createdAt" | "type" | "schemaVersion"
    > & {
        preview: {
          __typename?: "AesEncryptedBlob";
        } & AesEncryptedBlobFieldsFragment;
        previewKey: {
          __typename?: "RsaEncryptedBlob";
        } & RsaEncryptedBlobFieldsFragment;
        manager: { __typename?: "Friend" } & Pick<
          Friend,
          "username" | "avatarUrl"
        >;
      }
  >;
};

export type GetMeQueryVariables = {};

export type GetMeQuery = { __typename?: "Query" } & {
  me: { __typename?: "Me" } & Pick<
    Me,
    | "id"
    | "isInBetaOnboarding"
    | "createdAt"
    | "updatedAt"
    | "srpSalt"
    | "username"
    | "avatarUrl"
    | "email"
    | "publicKey"
    | "showOnboardingCard"
    | "emailVerified"
    | "forcedPasswordChangeEnabled"
  > & {
      encryptedPrivateKey: {
        __typename?: "AesEncryptedBlob";
      } & AesEncryptedBlobFieldsFragment;
    };
};

export type GetLoginKeysQueryVariables = {
  id: Scalars["String"];
};

export type GetLoginKeysQuery = { __typename?: "Query" } & {
  login:
    | ({ __typename?: "MyLogin" } & {
        credentialsKey: {
          __typename?: "RsaEncryptedBlob";
        } & RsaEncryptedBlobFieldsFragment;
        previewKey: {
          __typename?: "RsaEncryptedBlob";
        } & RsaEncryptedBlobFieldsFragment;
      })
    | ({ __typename?: "SharedLogin" } & {
        credentialsKey: {
          __typename?: "RsaEncryptedBlob";
        } & RsaEncryptedBlobFieldsFragment;
        previewKey: {
          __typename?: "RsaEncryptedBlob";
        } & RsaEncryptedBlobFieldsFragment;
      });
};

export type GetLoginQueryVariables = {
  id: Scalars["String"];
};

export type GetLoginQuery = { __typename?: "Query" } & {
  login:
    | ({ __typename?: "MyLogin" } & Pick<
        MyLogin,
        | "id"
        | "createdAt"
        | "updatedAt"
        | "schemaVersion"
        | "type"
        | "sharePreviews"
      > & {
          credentials: {
            __typename?: "AesEncryptedBlob";
          } & AesEncryptedBlobFieldsFragment;
          credentialsKey: {
            __typename?: "RsaEncryptedBlob";
          } & RsaEncryptedBlobFieldsFragment;
          previewKey: {
            __typename?: "RsaEncryptedBlob";
          } & RsaEncryptedBlobFieldsFragment;
          manager: { __typename?: "Me" } & Pick<
            Me,
            "id" | "username" | "avatarUrl"
          >;
          members: Maybe<
            Array<
              | ({
                  __typename?: "Friend";
                } & ShareRecipientFields_Friend_Fragment)
              | ({
                  __typename?: "Invite";
                } & ShareRecipientFields_Invite_Fragment)
            >
          >;
        })
    | ({ __typename?: "SharedLogin" } & Pick<
        SharedLogin,
        "id" | "createdAt" | "updatedAt" | "schemaVersion" | "type"
      > & {
          credentials: {
            __typename?: "AesEncryptedBlob";
          } & AesEncryptedBlobFieldsFragment;
          credentialsKey: {
            __typename?: "RsaEncryptedBlob";
          } & RsaEncryptedBlobFieldsFragment;
          previewKey: {
            __typename?: "RsaEncryptedBlob";
          } & RsaEncryptedBlobFieldsFragment;
          manager: { __typename?: "Friend" } & Pick<
            Friend,
            "id" | "username" | "avatarUrl"
          >;
          members: Maybe<
            Array<
              { __typename?: "Stranger" } & Pick<
                Stranger,
                "id" | "avatarUrl" | "publicKey"
              > & { kind: "Stranger"; name: Stranger["username"] }
            >
          >;
        });
};

export type GetLoginPreviewQueryVariables = {
  id: Scalars["String"];
};

export type GetLoginPreviewQuery = { __typename?: "Query" } & {
  loginPreview: { __typename?: "LoginPreviewSummary" } & Pick<
    LoginPreviewSummary,
    "id" | "createdAt" | "accessRequested" | "schemaVersion" | "type"
  > & {
      preview: {
        __typename?: "AesEncryptedBlob";
      } & AesEncryptedBlobFieldsFragment;
      previewKey: {
        __typename?: "RsaEncryptedBlob";
      } & RsaEncryptedBlobFieldsFragment;
      manager: { __typename?: "Friend" } & Pick<
        Friend,
        "id" | "username" | "avatarUrl"
      >;
    };
};

export type MyFriendsQueryVariables = {};

export type MyFriendsQuery = { __typename?: "Query" } & {
  friends: Array<
    { __typename?: "Friend" } & Pick<
      Friend,
      "id" | "username" | "email" | "publicKey" | "avatarUrl"
    >
  >;
};

export type GetPotentialSharesQueryVariables = {
  id: Maybe<Scalars["String"]>;
};

export type GetPotentialSharesQuery = { __typename?: "Query" } & {
  potentialShares: Array<
    { __typename?: "PotentialShare" } & Pick<PotentialShare, "numSharing"> & {
        friend:
          | ({ __typename?: "Friend" } & ShareRecipientFields_Friend_Fragment)
          | ({ __typename?: "Invite" } & ShareRecipientFields_Invite_Fragment);
      }
  >;
};

export type GetAvatarUploadUrlQueryVariables = {};

export type GetAvatarUploadUrlQuery = { __typename?: "Query" } & {
  getAvatarUploadUrl: { __typename?: "AvatarUploadInstructions" } & Pick<
    AvatarUploadInstructions,
    "avatarUrl" | "uploadUrl"
  >;
};

export type GetNotificationsQueryVariables = {};

export type GetNotificationsQuery = { __typename?: "Query" } & {
  loginShares: Array<
    { __typename?: "LoginShare" } & Pick<
      LoginShare,
      "id" | "schemaVersion" | "type"
    > & {
        manager: { __typename?: "Friend" } & Pick<
          Friend,
          "username" | "avatarUrl"
        >;
        preview: {
          __typename?: "AesEncryptedBlob";
        } & AesEncryptedBlobFieldsFragment;
        previewKey: {
          __typename?: "RsaEncryptedBlob";
        } & RsaEncryptedBlobFieldsFragment;
      }
  >;
  friendRequests: Array<
    { __typename?: "PendingInboundFriendRequest" } & Pick<
      PendingInboundFriendRequest,
      "id"
    > & {
        initiator: { __typename?: "Stranger" } & Pick<
          Stranger,
          "id" | "username" | "publicKey" | "avatarUrl" | "createdAt"
        >;
      }
  >;
  shareRequests: Array<
    { __typename?: "LoginShareRequest" } & Pick<
      LoginShareRequest,
      "id" | "schemaVersion" | "type"
    > & {
        preview: {
          __typename?: "AesEncryptedBlob";
        } & AesEncryptedBlobFieldsFragment;
        previewKey: {
          __typename?: "RsaEncryptedBlob";
        } & RsaEncryptedBlobFieldsFragment;
        credentialsKey: {
          __typename?: "RsaEncryptedBlob";
        } & RsaEncryptedBlobFieldsFragment;
        member: { __typename?: "Friend" } & Pick<
          Friend,
          "id" | "username" | "avatarUrl" | "publicKey"
        >;
      }
  >;
};

export type GetPendingLoginSharesQueryVariables = {};

export type GetPendingLoginSharesQuery = { __typename?: "Query" } & {
  pendingLoginShares: Array<
    { __typename?: "LoginShare" } & Pick<LoginShare, "id"> & {
        manager: { __typename?: "Friend" } & Pick<
          Friend,
          "username" | "avatarUrl"
        >;
        preview: {
          __typename?: "AesEncryptedBlob";
        } & AesEncryptedBlobFieldsFragment;
        previewKey: {
          __typename?: "RsaEncryptedBlob";
        } & RsaEncryptedBlobFieldsFragment;
      }
  >;
};

export type GetPendingInboundFriendRequestQueryVariables = {
  id: Scalars["String"];
};

export type GetPendingInboundFriendRequestQuery = { __typename?: "Query" } & {
  pendingInboundFriendRequest: {
    __typename?: "PendingInboundFriendRequest";
  } & Pick<PendingInboundFriendRequest, "id">;
};

export type GetPendingInboundFriendRequestsQueryVariables = {};

export type GetPendingInboundFriendRequestsQuery = { __typename?: "Query" } & {
  pendingInboundFriendRequests: Array<
    { __typename?: "PendingInboundFriendRequest" } & Pick<
      PendingInboundFriendRequest,
      "id"
    > & {
        initiator: { __typename?: "Stranger" } & Pick<
          Stranger,
          "id" | "username" | "publicKey" | "avatarUrl" | "createdAt"
        >;
      }
  >;
};

export type FindFriendsQueryVariables = {
  search: Scalars["String"];
};

export type FindFriendsQuery = { __typename?: "Query" } & {
  findFriends: Array<
    { __typename?: "FindFriendResult" } & Pick<
      FindFriendResult,
      "status" | "inboundFriendRequestId"
    > & {
        user: { __typename?: "Stranger" } & Pick<
          Stranger,
          "id" | "username" | "avatarUrl" | "createdAt" | "publicKey"
        >;
      }
  >;
};

export type GetInviteQueryVariables = {
  id: Scalars["String"];
};

export type GetInviteQuery = { __typename?: "Query" } & {
  invite: { __typename?: "Invite" } & {
    from: { __typename?: "Stranger" } & Pick<
      Stranger,
      "id" | "username" | "publicKey" | "avatarUrl" | "createdAt"
    >;
    loginShares: Array<
      { __typename?: "InviteLoginShare" } & Pick<
        InviteLoginShare,
        "id" | "schemaVersion" | "type"
      > & {
          preview: {
            __typename?: "AesEncryptedBlob";
          } & AesEncryptedBlobFieldsFragment;
          previewKey: {
            __typename?: "AesEncryptedBlob";
          } & AesEncryptedBlobFieldsFragment;
          credentialsKey: Maybe<
            { __typename?: "AesEncryptedBlob" } & AesEncryptedBlobFieldsFragment
          >;
        }
    >;
  };
};

export type GetSocialGraphQueryVariables = {};

export type GetSocialGraphQuery = { __typename?: "Query" } & {
  invites: Array<
    { __typename?: "Invite" } & Pick<
      Invite,
      "id" | "createdAt" | "nickname"
    > & {
        key: {
          __typename?: "RsaEncryptedBlob";
        } & RsaEncryptedBlobFieldsFragment;
      }
  >;
  friends: Array<
    { __typename?: "Friend" } & Pick<
      Friend,
      "id" | "username" | "avatarUrl"
    > & {
        loginsSharedWithThem: Array<
          { __typename?: "MyLogin" } & Pick<
            MyLogin,
            "id" | "schemaVersion" | "type"
          > & {
              preview: {
                __typename?: "AesEncryptedBlob";
              } & AesEncryptedBlobFieldsFragment;
              previewKey: {
                __typename?: "RsaEncryptedBlob";
              } & RsaEncryptedBlobFieldsFragment;
            }
        >;
        loginsSharedWithMe: Array<
          { __typename?: "SharedLogin" } & Pick<
            SharedLogin,
            "id" | "schemaVersion" | "type"
          > & {
              preview: {
                __typename?: "AesEncryptedBlob";
              } & AesEncryptedBlobFieldsFragment;
              previewKey: {
                __typename?: "RsaEncryptedBlob";
              } & RsaEncryptedBlobFieldsFragment;
            }
        >;
        loginPreviewsVisibleToThem: Array<
          { __typename?: "MyLogin" } & Pick<
            MyLogin,
            "id" | "schemaVersion" | "type"
          > & {
              preview: {
                __typename?: "AesEncryptedBlob";
              } & AesEncryptedBlobFieldsFragment;
              previewKey: {
                __typename?: "RsaEncryptedBlob";
              } & RsaEncryptedBlobFieldsFragment;
            }
        >;
        loginPreviewsVisibleToMe: Array<
          { __typename?: "LoginPreviewSummary" } & Pick<
            LoginPreviewSummary,
            "id" | "schemaVersion" | "type"
          > & {
              preview: {
                __typename?: "AesEncryptedBlob";
              } & AesEncryptedBlobFieldsFragment;
              previewKey: {
                __typename?: "RsaEncryptedBlob";
              } & RsaEncryptedBlobFieldsFragment;
            }
        >;
      }
  >;
};

export type GetFriendWithShareGraphQueryVariables = {
  id: Scalars["String"];
};

export type GetFriendWithShareGraphQuery = { __typename?: "Query" } & {
  friend: Maybe<
    { __typename?: "Friend" } & Pick<
      Friend,
      "id" | "username" | "avatarUrl"
    > & {
        loginsSharedWithThem: Array<
          { __typename?: "MyLogin" } & Pick<
            MyLogin,
            "id" | "schemaVersion" | "type"
          > & {
              preview: {
                __typename?: "AesEncryptedBlob";
              } & AesEncryptedBlobFieldsFragment;
              previewKey: {
                __typename?: "RsaEncryptedBlob";
              } & RsaEncryptedBlobFieldsFragment;
            }
        >;
        loginsSharedWithMe: Array<
          { __typename?: "SharedLogin" } & Pick<
            SharedLogin,
            "id" | "schemaVersion" | "type"
          > & {
              preview: {
                __typename?: "AesEncryptedBlob";
              } & AesEncryptedBlobFieldsFragment;
              previewKey: {
                __typename?: "RsaEncryptedBlob";
              } & RsaEncryptedBlobFieldsFragment;
            }
        >;
        loginPreviewsVisibleToThem: Array<
          { __typename?: "MyLogin" } & Pick<
            MyLogin,
            "id" | "schemaVersion" | "type"
          > & {
              preview: {
                __typename?: "AesEncryptedBlob";
              } & AesEncryptedBlobFieldsFragment;
              previewKey: {
                __typename?: "RsaEncryptedBlob";
              } & RsaEncryptedBlobFieldsFragment;
            }
        >;
        loginPreviewsVisibleToMe: Array<
          { __typename?: "LoginPreviewSummary" } & Pick<
            LoginPreviewSummary,
            "id" | "schemaVersion" | "type"
          > & {
              preview: {
                __typename?: "AesEncryptedBlob";
              } & AesEncryptedBlobFieldsFragment;
              previewKey: {
                __typename?: "RsaEncryptedBlob";
              } & RsaEncryptedBlobFieldsFragment;
            }
        >;
      }
  >;
};

export type GetLoginPreviewTodoQueryVariables = {};

export type GetLoginPreviewTodoQuery = { __typename?: "Query" } & {
  friends: Array<
    { __typename?: "Friend" } & Pick<Friend, "id" | "publicKey"> & {
        invite: Maybe<
          { __typename?: "Invite" } & Pick<Invite, "id"> & {
              key: {
                __typename?: "RsaEncryptedBlob";
              } & RsaEncryptedBlobFieldsFragment;
              loginShares: Array<
                { __typename?: "InviteLoginShare" } & Pick<
                  InviteLoginShare,
                  "id"
                > & {
                    previewKey: {
                      __typename?: "AesEncryptedBlob";
                    } & AesEncryptedBlobFieldsFragment;
                    credentialsKey: Maybe<
                      {
                        __typename?: "AesEncryptedBlob";
                      } & AesEncryptedBlobFieldsFragment
                    >;
                  }
              >;
            }
        >;
        logins: Array<
          { __typename?: "MyLogin" } & Pick<MyLogin, "id"> & {
              previewKey: {
                __typename?: "RsaEncryptedBlob";
              } & RsaEncryptedBlobFieldsFragment;
            }
        >;
      }
  >;
  friendRequests: Array<
    { __typename?: "PendingOutboundFriendRequest" } & {
      recipient: { __typename?: "Stranger" } & Pick<
        Stranger,
        "id" | "publicKey"
      >;
      logins: Array<
        { __typename?: "MyLogin" } & Pick<MyLogin, "id"> & {
            previewKey: {
              __typename?: "RsaEncryptedBlob";
            } & RsaEncryptedBlobFieldsFragment;
          }
      >;
    }
  >;
  invites: Array<
    { __typename?: "Invite" } & Pick<Invite, "id"> & {
        key: {
          __typename?: "RsaEncryptedBlob";
        } & RsaEncryptedBlobFieldsFragment;
        logins: Array<
          { __typename?: "MyLogin" } & Pick<MyLogin, "id"> & {
              previewKey: {
                __typename?: "RsaEncryptedBlob";
              } & RsaEncryptedBlobFieldsFragment;
            }
        >;
      }
  >;
};

export type GetBetaOnboardingQueryVariables = {};

export type GetBetaOnboardingQuery = { __typename?: "Query" } & {
  logins: Array<
    { __typename?: "MyLoginSummary" } & Pick<
      MyLoginSummary,
      "id" | "createdAt" | "schemaVersion" | "type"
    > & {
        credentials: { __typename?: "AesEncryptedBlob" } & Pick<
          AesEncryptedBlob,
          "ciphertext" | "iv" | "salt" | "algorithm"
        >;
        credentialsKey: { __typename?: "RsaEncryptedBlob" } & Pick<
          RsaEncryptedBlob,
          "ciphertext" | "algorithm"
        >;
      }
  >;
  invites: Array<
    { __typename?: "Invite" } & Pick<Invite, "id" | "nickname" | "email"> & {
        key: {
          __typename?: "RsaEncryptedBlob";
        } & RsaEncryptedBlobFieldsFragment;
        loginShares: Array<
          { __typename?: "InviteLoginShare" } & Pick<InviteLoginShare, "id">
        >;
      }
  >;
};

export type GetWaitlistEntryQueryVariables = {
  id: Scalars["String"];
};

export type GetWaitlistEntryQuery = { __typename?: "Query" } & {
  waitlistEntry: Maybe<
    { __typename?: "WaitlistEntry" } & Pick<
      WaitlistEntry,
      "createdAt" | "email" | "unsubscribedAt"
    >
  >;
};

export type IsUsernameAvailableQueryVariables = {
  username: Scalars["String"];
};

export type IsUsernameAvailableQuery = { __typename?: "Query" } & {
  available: Query["isUsernameAvailable"];
};

export type IsEmailAvailableQueryVariables = {
  email: Scalars["String"];
};

export type IsEmailAvailableQuery = { __typename?: "Query" } & {
  available: Query["isEmailAvailable"];
};

export type ApproveShareRequestMutationVariables = {
  params: ApproveShareRequestInput;
};

export type ApproveShareRequestMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "approveShareRequest"
>;

export type RejectShareRequestMutationVariables = {
  id: Scalars["String"];
  memberId: Scalars["String"];
};

export type RejectShareRequestMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "rejectShareRequest"
>;

export type RequestLoginShareMutationVariables = {
  id: Scalars["String"];
};

export type RequestLoginShareMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "requestLoginShare"
>;

export type PublishLoginPreviewsMutationVariables = {
  params: LoginPreviewsInput;
};

export type PublishLoginPreviewsMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "publishLoginPreviews"
>;

export type PublishLoginPreviewsForInviteMutationVariables = {
  params: LoginPreviewsForInviteInput;
};

export type PublishLoginPreviewsForInviteMutation = {
  __typename?: "Mutation";
} & Pick<Mutation, "publishLoginPreviewsForInvite">;

export type ShareLoginMutationVariables = {
  params: ShareLoginInput;
};

export type ShareLoginMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "shareLogin"
>;

export type PreshareLoginMutationVariables = {
  params: PreshareLoginInput;
};

export type PreshareLoginMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "preshareLogin"
>;

export type AddFriendMutationVariables = {
  userId: Scalars["String"];
};

export type AddFriendMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "addFriend"
>;

export type AcceptFriendRequestMutationVariables = {
  id: Scalars["String"];
};

export type AcceptFriendRequestMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "acceptFriendRequest"
>;

export type RejectFriendRequestMutationVariables = {
  requestId: Scalars["String"];
};

export type RejectFriendRequestMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "rejectFriendRequest"
>;

export type UnfriendMutationVariables = {
  id: Scalars["String"];
};

export type UnfriendMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "unfriend"
>;

export type CreateInviteMutationVariables = {
  params: CreateInviteInput;
};

export type CreateInviteMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "createInvite"
>;

export type UpdateInviteMutationVariables = {
  id: Scalars["String"];
  changes: UpdateInviteInput;
};

export type UpdateInviteMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "updateInvite"
>;

export type DismissOnboardingCardMutationVariables = {};

export type DismissOnboardingCardMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "dismissOnboardingCard"
>;

export type AcceptInviteMutationVariables = {
  params: AcceptInviteInput;
};

export type AcceptInviteMutation = { __typename?: "Mutation" } & {
  acceptInvite: { __typename?: "Me" } & Pick<
    Me,
    "id" | "email" | "createdAt" | "updatedAt"
  >;
};

export type AcceptBetaInviteMutationVariables = {
  params: AcceptBetaInviteInput;
};

export type AcceptBetaInviteMutation = { __typename?: "Mutation" } & {
  acceptBetaInvite: { __typename?: "Me" } & Pick<
    Me,
    "id" | "email" | "createdAt" | "updatedAt"
  >;
};

export type VerifyEmailMutationVariables = {
  id: Scalars["String"];
};

export type VerifyEmailMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "verifyEmail"
>;

export type UnsubscribeFromWaitlistMutationVariables = {
  id: Scalars["String"];
};

export type UnsubscribeFromWaitlistMutation = { __typename?: "Mutation" } & {
  success: Mutation["unsubscribeFromWaitlist"];
};

export type JoinWaitlistMutationVariables = {
  email: Scalars["String"];
  firstName: Scalars["String"];
};

export type JoinWaitlistMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "joinWaitlist"
>;

export type ConfirmWaitlistMutationVariables = {
  secret: Scalars["String"];
};

export type ConfirmWaitlistMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "confirmWaitlist"
>;

export type FinishBetaOnboardingMutationVariables = {};

export type FinishBetaOnboardingMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "finishBetaOnboarding"
>;

export type RecordMagicLinkUsageMutationVariables = {
  id: Scalars["String"];
  state: MagicLinkPulseState;
};

export type RecordMagicLinkUsageMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "recordMagicLinkUsage"
>;

export const AesEncryptedBlobFieldsFragmentDoc = gql`
  fragment aesEncryptedBlobFields on AesEncryptedBlob {
    ciphertext
    iv
    salt
    algorithm
  }
`;
export const RsaEncryptedBlobFieldsFragmentDoc = gql`
  fragment rsaEncryptedBlobFields on RsaEncryptedBlob {
    ciphertext
    algorithm
  }
`;
export const ShareRecipientFieldsFragmentDoc = gql`
  fragment shareRecipientFields on ShareRecipient {
    kind: __typename
    ... on Friend {
      id
      name: username
      avatarUrl
      publicKey
    }
    ... on Invite {
      id
      name: nickname
      dataKey: key {
        ciphertext
        algorithm
      }
    }
  }
`;
export const CreateUserDocument = gql`
  mutation CreateUser($params: CreateUserInput!) {
    createUser(params: $params) {
      id
      email
      createdAt
      updatedAt
    }
  }
`;
export const UpdatePasswordDocument = gql`
  mutation UpdatePassword($params: UpdatePasswordInput!) {
    updatePassword(params: $params)
  }
`;
export const StartSrpHandshakeDocument = gql`
  mutation StartSRPHandshake($params: StartSRPHandshakeInput!) {
    startSRPHandshake(params: $params) {
      id
      srpSalt
      srpPbkdf2Salt
      serverPublicEphemeral
    }
  }
`;
export const FinishSrpHandshakeDocument = gql`
  mutation FinishSRPHandshake($params: FinishSRPHandshakeInput!) {
    finishSRPHandshake(params: $params) {
      id
      serverProof
      sessionWrapper
      masterKeyPbkdf2Salt
    }
  }
`;
export const SignOutDocument = gql`
  mutation SignOut {
    signOut
  }
`;
export const MySessionWrapperDocument = gql`
  query MySessionWrapper {
    sessionWrapper
  }
`;
export const GetTimeDocument = gql`
  query GetTime {
    time
  }
`;
export const CreateNewLoginDocument = gql`
  mutation CreateNewLogin($params: CreateLoginInput!) {
    createLogin(params: $params) {
      id
      credentials {
        ...aesEncryptedBlobFields
      }
      credentialsKey {
        ...rsaEncryptedBlobFields
      }
      schemaVersion
    }
  }
  ${AesEncryptedBlobFieldsFragmentDoc}
  ${RsaEncryptedBlobFieldsFragmentDoc}
`;
export const UpdateLoginDocument = gql`
  mutation UpdateLogin($params: UpdateLoginInput!) {
    updateLogin(params: $params)
  }
`;
export const UpdateAccountDocument = gql`
  mutation UpdateAccount($username: String, $avatarUrl: String) {
    updateAccount(username: $username, avatarUrl: $avatarUrl)
  }
`;
export const DeleteInviteDocument = gql`
  mutation DeleteInvite($id: String!) {
    deleteInvite(id: $id)
  }
`;
export const DeleteLoginDocument = gql`
  mutation DeleteLogin($id: String!) {
    deleteLogin(id: $id)
  }
`;
export const AcceptLoginShareDocument = gql`
  mutation AcceptLoginShare($loginId: String!) {
    acceptLoginShare(loginId: $loginId)
  }
`;
export const RejectLoginShareDocument = gql`
  mutation RejectLoginShare($id: String!) {
    rejectLoginShare(id: $id)
  }
`;
export const GetLoginsOverviewDocument = gql`
  query GetLoginsOverview {
    mine: myLogins {
      id
      createdAt
      credentials {
        ...aesEncryptedBlobFields
      }
      credentialsKey {
        ...rsaEncryptedBlobFields
      }
      type
      schemaVersion
    }
    shared: loginsSharedWithMe {
      id
      createdAt
      credentials {
        ...aesEncryptedBlobFields
      }
      credentialsKey {
        ...rsaEncryptedBlobFields
      }
      manager {
        username
        avatarUrl
      }
      type
      schemaVersion
    }
    previews: loginPreviews {
      id
      createdAt
      preview {
        ...aesEncryptedBlobFields
      }
      previewKey {
        ...rsaEncryptedBlobFields
      }
      manager {
        username
        avatarUrl
      }
      type
      schemaVersion
    }
  }
  ${AesEncryptedBlobFieldsFragmentDoc}
  ${RsaEncryptedBlobFieldsFragmentDoc}
`;
export const GetMeDocument = gql`
  query GetMe {
    me {
      id
      isInBetaOnboarding
      createdAt
      updatedAt
      srpSalt
      username
      avatarUrl
      email
      publicKey
      encryptedPrivateKey {
        ...aesEncryptedBlobFields
      }
      showOnboardingCard
      emailVerified
      forcedPasswordChangeEnabled
    }
  }
  ${AesEncryptedBlobFieldsFragmentDoc}
`;
export const GetLoginKeysDocument = gql`
  query GetLoginKeys($id: String!) {
    login(id: $id) {
      ... on MyLogin {
        credentialsKey {
          ...rsaEncryptedBlobFields
        }
        previewKey {
          ...rsaEncryptedBlobFields
        }
      }
      ... on SharedLogin {
        credentialsKey {
          ...rsaEncryptedBlobFields
        }
        previewKey {
          ...rsaEncryptedBlobFields
        }
      }
    }
  }
  ${RsaEncryptedBlobFieldsFragmentDoc}
`;
export const GetLoginDocument = gql`
  query GetLogin($id: String!) {
    login(id: $id) {
      ... on MyLogin {
        id
        createdAt
        updatedAt
        credentials {
          ...aesEncryptedBlobFields
        }
        credentialsKey {
          ...rsaEncryptedBlobFields
        }
        previewKey {
          ...rsaEncryptedBlobFields
        }
        schemaVersion
        type
        manager {
          id
          username
          avatarUrl
        }
        members {
          ...shareRecipientFields
        }
        sharePreviews
      }
      ... on SharedLogin {
        id
        createdAt
        updatedAt
        credentials {
          ...aesEncryptedBlobFields
        }
        credentialsKey {
          ...rsaEncryptedBlobFields
        }
        previewKey {
          ...rsaEncryptedBlobFields
        }
        schemaVersion
        type
        manager {
          id
          username
          avatarUrl
        }
        members {
          kind: __typename
          id
          name: username
          avatarUrl
          publicKey
        }
      }
    }
  }
  ${AesEncryptedBlobFieldsFragmentDoc}
  ${RsaEncryptedBlobFieldsFragmentDoc}
  ${ShareRecipientFieldsFragmentDoc}
`;
export const GetLoginPreviewDocument = gql`
  query GetLoginPreview($id: String!) {
    loginPreview(id: $id) {
      id
      createdAt
      accessRequested
      preview {
        ...aesEncryptedBlobFields
      }
      previewKey {
        ...rsaEncryptedBlobFields
      }
      schemaVersion
      type
      manager {
        id
        username
        avatarUrl
      }
    }
  }
  ${AesEncryptedBlobFieldsFragmentDoc}
  ${RsaEncryptedBlobFieldsFragmentDoc}
`;
export const MyFriendsDocument = gql`
  query MyFriends {
    friends {
      id
      username
      email
      publicKey
      avatarUrl
    }
  }
`;
export const GetPotentialSharesDocument = gql`
  query GetPotentialShares($id: String) {
    potentialShares(id: $id) {
      friend {
        ...shareRecipientFields
      }
      numSharing
    }
  }
  ${ShareRecipientFieldsFragmentDoc}
`;
export const GetAvatarUploadUrlDocument = gql`
  query GetAvatarUploadUrl {
    getAvatarUploadUrl {
      avatarUrl
      uploadUrl
    }
  }
`;
export const GetNotificationsDocument = gql`
  query GetNotifications {
    loginShares: pendingLoginShares {
      id
      manager {
        username
        avatarUrl
      }
      preview {
        ...aesEncryptedBlobFields
      }
      previewKey {
        ...rsaEncryptedBlobFields
      }
      schemaVersion
      type
    }
    friendRequests: pendingInboundFriendRequests {
      id
      initiator {
        id
        username
        publicKey
        avatarUrl
        createdAt
      }
    }
    shareRequests: loginShareRequests {
      id
      preview {
        ...aesEncryptedBlobFields
      }
      previewKey {
        ...rsaEncryptedBlobFields
      }
      credentialsKey {
        ...rsaEncryptedBlobFields
      }
      schemaVersion
      type
      member {
        id
        username
        avatarUrl
        publicKey
      }
    }
  }
  ${AesEncryptedBlobFieldsFragmentDoc}
  ${RsaEncryptedBlobFieldsFragmentDoc}
`;
export const GetPendingLoginSharesDocument = gql`
  query GetPendingLoginShares {
    pendingLoginShares {
      id
      manager {
        username
        avatarUrl
      }
      preview {
        ...aesEncryptedBlobFields
      }
      previewKey {
        ...rsaEncryptedBlobFields
      }
    }
  }
  ${AesEncryptedBlobFieldsFragmentDoc}
  ${RsaEncryptedBlobFieldsFragmentDoc}
`;
export const GetPendingInboundFriendRequestDocument = gql`
  query GetPendingInboundFriendRequest($id: String!) {
    pendingInboundFriendRequest(id: $id) {
      id
    }
  }
`;
export const GetPendingInboundFriendRequestsDocument = gql`
  query GetPendingInboundFriendRequests {
    pendingInboundFriendRequests {
      id
      initiator {
        id
        username
        publicKey
        avatarUrl
        createdAt
      }
    }
  }
`;
export const FindFriendsDocument = gql`
  query FindFriends($search: String!) {
    findFriends(search: $search) {
      status
      inboundFriendRequestId
      user {
        id
        username
        avatarUrl
        createdAt
        publicKey
      }
    }
  }
`;
export const GetInviteDocument = gql`
  query GetInvite($id: String!) {
    invite(id: $id) {
      from {
        id
        username
        publicKey
        avatarUrl
        createdAt
      }
      loginShares {
        id
        preview {
          ...aesEncryptedBlobFields
        }
        previewKey {
          ...aesEncryptedBlobFields
        }
        credentialsKey {
          ...aesEncryptedBlobFields
        }
        schemaVersion
        type
      }
    }
  }
  ${AesEncryptedBlobFieldsFragmentDoc}
`;
export const GetSocialGraphDocument = gql`
  query GetSocialGraph {
    invites {
      id
      createdAt
      nickname
      key {
        ...rsaEncryptedBlobFields
      }
    }
    friends {
      id
      username
      avatarUrl
      loginsSharedWithThem {
        id
        preview {
          ...aesEncryptedBlobFields
        }
        previewKey {
          ...rsaEncryptedBlobFields
        }
        schemaVersion
        type
      }
      loginsSharedWithMe {
        id
        preview {
          ...aesEncryptedBlobFields
        }
        previewKey {
          ...rsaEncryptedBlobFields
        }
        schemaVersion
        type
      }
      loginPreviewsVisibleToThem {
        id
        preview {
          ...aesEncryptedBlobFields
        }
        previewKey {
          ...rsaEncryptedBlobFields
        }
        schemaVersion
        type
      }
      loginPreviewsVisibleToMe {
        id
        preview {
          ...aesEncryptedBlobFields
        }
        previewKey {
          ...rsaEncryptedBlobFields
        }
        schemaVersion
        type
      }
    }
  }
  ${RsaEncryptedBlobFieldsFragmentDoc}
  ${AesEncryptedBlobFieldsFragmentDoc}
`;
export const GetFriendWithShareGraphDocument = gql`
  query GetFriendWithShareGraph($id: String!) {
    friend(id: $id) {
      id
      username
      avatarUrl
      loginsSharedWithThem {
        id
        preview {
          ...aesEncryptedBlobFields
        }
        previewKey {
          ...rsaEncryptedBlobFields
        }
        schemaVersion
        type
      }
      loginsSharedWithMe {
        id
        preview {
          ...aesEncryptedBlobFields
        }
        previewKey {
          ...rsaEncryptedBlobFields
        }
        schemaVersion
        type
      }
      loginPreviewsVisibleToThem {
        id
        preview {
          ...aesEncryptedBlobFields
        }
        previewKey {
          ...rsaEncryptedBlobFields
        }
        schemaVersion
        type
      }
      loginPreviewsVisibleToMe {
        id
        preview {
          ...aesEncryptedBlobFields
        }
        previewKey {
          ...rsaEncryptedBlobFields
        }
        schemaVersion
        type
      }
    }
  }
  ${AesEncryptedBlobFieldsFragmentDoc}
  ${RsaEncryptedBlobFieldsFragmentDoc}
`;
export const GetLoginPreviewTodoDocument = gql`
  query GetLoginPreviewTodo {
    friends {
      id
      publicKey
      invite: originalInvite {
        id
        key {
          ...rsaEncryptedBlobFields
        }
        loginShares(includePreviews: false) {
          id
          previewKey {
            ...aesEncryptedBlobFields
          }
          credentialsKey {
            ...aesEncryptedBlobFields
          }
        }
      }
      logins: loginPreviewTodos {
        id
        previewKey {
          ...rsaEncryptedBlobFields
        }
      }
    }
    friendRequests: pendingOutboundFriendRequests {
      recipient {
        id
        publicKey
      }
      logins: loginPreviewTodos {
        id
        previewKey {
          ...rsaEncryptedBlobFields
        }
      }
    }
    invites {
      id
      key {
        ...rsaEncryptedBlobFields
      }
      logins: loginPreviewTodos {
        id
        previewKey {
          ...rsaEncryptedBlobFields
        }
      }
    }
  }
  ${RsaEncryptedBlobFieldsFragmentDoc}
  ${AesEncryptedBlobFieldsFragmentDoc}
`;
export const GetBetaOnboardingDocument = gql`
  query GetBetaOnboarding {
    logins: myLogins {
      id
      createdAt
      credentials {
        ciphertext
        iv
        salt
        algorithm
      }
      credentialsKey {
        ciphertext
        algorithm
      }
      schemaVersion
      type
    }
    invites {
      id
      nickname
      email
      key {
        ...rsaEncryptedBlobFields
      }
      loginShares {
        id
      }
    }
  }
  ${RsaEncryptedBlobFieldsFragmentDoc}
`;
export const GetWaitlistEntryDocument = gql`
  query GetWaitlistEntry($id: String!) {
    waitlistEntry(id: $id) {
      createdAt
      email
      unsubscribedAt
    }
  }
`;
export const IsUsernameAvailableDocument = gql`
  query IsUsernameAvailable($username: String!) {
    available: isUsernameAvailable(username: $username)
  }
`;
export const IsEmailAvailableDocument = gql`
  query IsEmailAvailable($email: String!) {
    available: isEmailAvailable(email: $email)
  }
`;
export const ApproveShareRequestDocument = gql`
  mutation ApproveShareRequest($params: ApproveShareRequestInput!) {
    approveShareRequest(params: $params)
  }
`;
export const RejectShareRequestDocument = gql`
  mutation RejectShareRequest($id: String!, $memberId: String!) {
    rejectShareRequest(id: $id, memberId: $memberId)
  }
`;
export const RequestLoginShareDocument = gql`
  mutation RequestLoginShare($id: String!) {
    requestLoginShare(id: $id)
  }
`;
export const PublishLoginPreviewsDocument = gql`
  mutation PublishLoginPreviews($params: LoginPreviewsInput!) {
    publishLoginPreviews(params: $params)
  }
`;
export const PublishLoginPreviewsForInviteDocument = gql`
  mutation PublishLoginPreviewsForInvite(
    $params: LoginPreviewsForInviteInput!
  ) {
    publishLoginPreviewsForInvite(params: $params)
  }
`;
export const ShareLoginDocument = gql`
  mutation ShareLogin($params: ShareLoginInput!) {
    shareLogin(params: $params)
  }
`;
export const PreshareLoginDocument = gql`
  mutation PreshareLogin($params: PreshareLoginInput!) {
    preshareLogin(params: $params)
  }
`;
export const AddFriendDocument = gql`
  mutation AddFriend($userId: String!) {
    addFriend(userId: $userId)
  }
`;
export const AcceptFriendRequestDocument = gql`
  mutation AcceptFriendRequest($id: String!) {
    acceptFriendRequest(id: $id)
  }
`;
export const RejectFriendRequestDocument = gql`
  mutation RejectFriendRequest($requestId: String!) {
    rejectFriendRequest(requestId: $requestId)
  }
`;
export const UnfriendDocument = gql`
  mutation Unfriend($id: String!) {
    unfriend(id: $id)
  }
`;
export const CreateInviteDocument = gql`
  mutation CreateInvite($params: CreateInviteInput!) {
    createInvite(params: $params)
  }
`;
export const UpdateInviteDocument = gql`
  mutation UpdateInvite($id: String!, $changes: UpdateInviteInput!) {
    updateInvite(id: $id, changes: $changes)
  }
`;
export const DismissOnboardingCardDocument = gql`
  mutation DismissOnboardingCard {
    dismissOnboardingCard
  }
`;
export const AcceptInviteDocument = gql`
  mutation AcceptInvite($params: AcceptInviteInput!) {
    acceptInvite(params: $params) {
      id
      email
      createdAt
      updatedAt
    }
  }
`;
export const AcceptBetaInviteDocument = gql`
  mutation AcceptBetaInvite($params: AcceptBetaInviteInput!) {
    acceptBetaInvite(params: $params) {
      id
      email
      createdAt
      updatedAt
    }
  }
`;
export const VerifyEmailDocument = gql`
  mutation VerifyEmail($id: String!) {
    verifyEmail(id: $id)
  }
`;
export const UnsubscribeFromWaitlistDocument = gql`
  mutation UnsubscribeFromWaitlist($id: String!) {
    success: unsubscribeFromWaitlist(id: $id)
  }
`;
export const JoinWaitlistDocument = gql`
  mutation JoinWaitlist($email: String!, $firstName: String!) {
    joinWaitlist(email: $email, firstName: $firstName)
  }
`;
export const ConfirmWaitlistDocument = gql`
  mutation ConfirmWaitlist($secret: String!) {
    confirmWaitlist(secret: $secret)
  }
`;
export const FinishBetaOnboardingDocument = gql`
  mutation FinishBetaOnboarding {
    finishBetaOnboarding
  }
`;
export const RecordMagicLinkUsageDocument = gql`
  mutation RecordMagicLinkUsage($id: String!, $state: MagicLinkPulseState!) {
    recordMagicLinkUsage(id: $id, state: $state)
  }
`;

export type SdkFunctionWrapper = <T>(action: () => Promise<T>) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (sdkFunction) => sdkFunction();
export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper
) {
  return {
    CreateUser(
      variables: CreateUserMutationVariables
    ): Promise<CreateUserMutation> {
      return withWrapper(() =>
        client.request<CreateUserMutation>(print(CreateUserDocument), variables)
      );
    },
    UpdatePassword(
      variables: UpdatePasswordMutationVariables
    ): Promise<UpdatePasswordMutation> {
      return withWrapper(() =>
        client.request<UpdatePasswordMutation>(
          print(UpdatePasswordDocument),
          variables
        )
      );
    },
    StartSRPHandshake(
      variables: StartSrpHandshakeMutationVariables
    ): Promise<StartSrpHandshakeMutation> {
      return withWrapper(() =>
        client.request<StartSrpHandshakeMutation>(
          print(StartSrpHandshakeDocument),
          variables
        )
      );
    },
    FinishSRPHandshake(
      variables: FinishSrpHandshakeMutationVariables
    ): Promise<FinishSrpHandshakeMutation> {
      return withWrapper(() =>
        client.request<FinishSrpHandshakeMutation>(
          print(FinishSrpHandshakeDocument),
          variables
        )
      );
    },
    SignOut(variables?: SignOutMutationVariables): Promise<SignOutMutation> {
      return withWrapper(() =>
        client.request<SignOutMutation>(print(SignOutDocument), variables)
      );
    },
    MySessionWrapper(
      variables?: MySessionWrapperQueryVariables
    ): Promise<MySessionWrapperQuery> {
      return withWrapper(() =>
        client.request<MySessionWrapperQuery>(
          print(MySessionWrapperDocument),
          variables
        )
      );
    },
    GetTime(variables?: GetTimeQueryVariables): Promise<GetTimeQuery> {
      return withWrapper(() =>
        client.request<GetTimeQuery>(print(GetTimeDocument), variables)
      );
    },
    CreateNewLogin(
      variables: CreateNewLoginMutationVariables
    ): Promise<CreateNewLoginMutation> {
      return withWrapper(() =>
        client.request<CreateNewLoginMutation>(
          print(CreateNewLoginDocument),
          variables
        )
      );
    },
    UpdateLogin(
      variables: UpdateLoginMutationVariables
    ): Promise<UpdateLoginMutation> {
      return withWrapper(() =>
        client.request<UpdateLoginMutation>(
          print(UpdateLoginDocument),
          variables
        )
      );
    },
    UpdateAccount(
      variables?: UpdateAccountMutationVariables
    ): Promise<UpdateAccountMutation> {
      return withWrapper(() =>
        client.request<UpdateAccountMutation>(
          print(UpdateAccountDocument),
          variables
        )
      );
    },
    DeleteInvite(
      variables: DeleteInviteMutationVariables
    ): Promise<DeleteInviteMutation> {
      return withWrapper(() =>
        client.request<DeleteInviteMutation>(
          print(DeleteInviteDocument),
          variables
        )
      );
    },
    DeleteLogin(
      variables: DeleteLoginMutationVariables
    ): Promise<DeleteLoginMutation> {
      return withWrapper(() =>
        client.request<DeleteLoginMutation>(
          print(DeleteLoginDocument),
          variables
        )
      );
    },
    AcceptLoginShare(
      variables: AcceptLoginShareMutationVariables
    ): Promise<AcceptLoginShareMutation> {
      return withWrapper(() =>
        client.request<AcceptLoginShareMutation>(
          print(AcceptLoginShareDocument),
          variables
        )
      );
    },
    RejectLoginShare(
      variables: RejectLoginShareMutationVariables
    ): Promise<RejectLoginShareMutation> {
      return withWrapper(() =>
        client.request<RejectLoginShareMutation>(
          print(RejectLoginShareDocument),
          variables
        )
      );
    },
    GetLoginsOverview(
      variables?: GetLoginsOverviewQueryVariables
    ): Promise<GetLoginsOverviewQuery> {
      return withWrapper(() =>
        client.request<GetLoginsOverviewQuery>(
          print(GetLoginsOverviewDocument),
          variables
        )
      );
    },
    GetMe(variables?: GetMeQueryVariables): Promise<GetMeQuery> {
      return withWrapper(() =>
        client.request<GetMeQuery>(print(GetMeDocument), variables)
      );
    },
    GetLoginKeys(
      variables: GetLoginKeysQueryVariables
    ): Promise<GetLoginKeysQuery> {
      return withWrapper(() =>
        client.request<GetLoginKeysQuery>(
          print(GetLoginKeysDocument),
          variables
        )
      );
    },
    GetLogin(variables: GetLoginQueryVariables): Promise<GetLoginQuery> {
      return withWrapper(() =>
        client.request<GetLoginQuery>(print(GetLoginDocument), variables)
      );
    },
    GetLoginPreview(
      variables: GetLoginPreviewQueryVariables
    ): Promise<GetLoginPreviewQuery> {
      return withWrapper(() =>
        client.request<GetLoginPreviewQuery>(
          print(GetLoginPreviewDocument),
          variables
        )
      );
    },
    MyFriends(variables?: MyFriendsQueryVariables): Promise<MyFriendsQuery> {
      return withWrapper(() =>
        client.request<MyFriendsQuery>(print(MyFriendsDocument), variables)
      );
    },
    GetPotentialShares(
      variables?: GetPotentialSharesQueryVariables
    ): Promise<GetPotentialSharesQuery> {
      return withWrapper(() =>
        client.request<GetPotentialSharesQuery>(
          print(GetPotentialSharesDocument),
          variables
        )
      );
    },
    GetAvatarUploadUrl(
      variables?: GetAvatarUploadUrlQueryVariables
    ): Promise<GetAvatarUploadUrlQuery> {
      return withWrapper(() =>
        client.request<GetAvatarUploadUrlQuery>(
          print(GetAvatarUploadUrlDocument),
          variables
        )
      );
    },
    GetNotifications(
      variables?: GetNotificationsQueryVariables
    ): Promise<GetNotificationsQuery> {
      return withWrapper(() =>
        client.request<GetNotificationsQuery>(
          print(GetNotificationsDocument),
          variables
        )
      );
    },
    GetPendingLoginShares(
      variables?: GetPendingLoginSharesQueryVariables
    ): Promise<GetPendingLoginSharesQuery> {
      return withWrapper(() =>
        client.request<GetPendingLoginSharesQuery>(
          print(GetPendingLoginSharesDocument),
          variables
        )
      );
    },
    GetPendingInboundFriendRequest(
      variables: GetPendingInboundFriendRequestQueryVariables
    ): Promise<GetPendingInboundFriendRequestQuery> {
      return withWrapper(() =>
        client.request<GetPendingInboundFriendRequestQuery>(
          print(GetPendingInboundFriendRequestDocument),
          variables
        )
      );
    },
    GetPendingInboundFriendRequests(
      variables?: GetPendingInboundFriendRequestsQueryVariables
    ): Promise<GetPendingInboundFriendRequestsQuery> {
      return withWrapper(() =>
        client.request<GetPendingInboundFriendRequestsQuery>(
          print(GetPendingInboundFriendRequestsDocument),
          variables
        )
      );
    },
    FindFriends(
      variables: FindFriendsQueryVariables
    ): Promise<FindFriendsQuery> {
      return withWrapper(() =>
        client.request<FindFriendsQuery>(print(FindFriendsDocument), variables)
      );
    },
    GetInvite(variables: GetInviteQueryVariables): Promise<GetInviteQuery> {
      return withWrapper(() =>
        client.request<GetInviteQuery>(print(GetInviteDocument), variables)
      );
    },
    GetSocialGraph(
      variables?: GetSocialGraphQueryVariables
    ): Promise<GetSocialGraphQuery> {
      return withWrapper(() =>
        client.request<GetSocialGraphQuery>(
          print(GetSocialGraphDocument),
          variables
        )
      );
    },
    GetFriendWithShareGraph(
      variables: GetFriendWithShareGraphQueryVariables
    ): Promise<GetFriendWithShareGraphQuery> {
      return withWrapper(() =>
        client.request<GetFriendWithShareGraphQuery>(
          print(GetFriendWithShareGraphDocument),
          variables
        )
      );
    },
    GetLoginPreviewTodo(
      variables?: GetLoginPreviewTodoQueryVariables
    ): Promise<GetLoginPreviewTodoQuery> {
      return withWrapper(() =>
        client.request<GetLoginPreviewTodoQuery>(
          print(GetLoginPreviewTodoDocument),
          variables
        )
      );
    },
    GetBetaOnboarding(
      variables?: GetBetaOnboardingQueryVariables
    ): Promise<GetBetaOnboardingQuery> {
      return withWrapper(() =>
        client.request<GetBetaOnboardingQuery>(
          print(GetBetaOnboardingDocument),
          variables
        )
      );
    },
    GetWaitlistEntry(
      variables: GetWaitlistEntryQueryVariables
    ): Promise<GetWaitlistEntryQuery> {
      return withWrapper(() =>
        client.request<GetWaitlistEntryQuery>(
          print(GetWaitlistEntryDocument),
          variables
        )
      );
    },
    IsUsernameAvailable(
      variables: IsUsernameAvailableQueryVariables
    ): Promise<IsUsernameAvailableQuery> {
      return withWrapper(() =>
        client.request<IsUsernameAvailableQuery>(
          print(IsUsernameAvailableDocument),
          variables
        )
      );
    },
    IsEmailAvailable(
      variables: IsEmailAvailableQueryVariables
    ): Promise<IsEmailAvailableQuery> {
      return withWrapper(() =>
        client.request<IsEmailAvailableQuery>(
          print(IsEmailAvailableDocument),
          variables
        )
      );
    },
    ApproveShareRequest(
      variables: ApproveShareRequestMutationVariables
    ): Promise<ApproveShareRequestMutation> {
      return withWrapper(() =>
        client.request<ApproveShareRequestMutation>(
          print(ApproveShareRequestDocument),
          variables
        )
      );
    },
    RejectShareRequest(
      variables: RejectShareRequestMutationVariables
    ): Promise<RejectShareRequestMutation> {
      return withWrapper(() =>
        client.request<RejectShareRequestMutation>(
          print(RejectShareRequestDocument),
          variables
        )
      );
    },
    RequestLoginShare(
      variables: RequestLoginShareMutationVariables
    ): Promise<RequestLoginShareMutation> {
      return withWrapper(() =>
        client.request<RequestLoginShareMutation>(
          print(RequestLoginShareDocument),
          variables
        )
      );
    },
    PublishLoginPreviews(
      variables: PublishLoginPreviewsMutationVariables
    ): Promise<PublishLoginPreviewsMutation> {
      return withWrapper(() =>
        client.request<PublishLoginPreviewsMutation>(
          print(PublishLoginPreviewsDocument),
          variables
        )
      );
    },
    PublishLoginPreviewsForInvite(
      variables: PublishLoginPreviewsForInviteMutationVariables
    ): Promise<PublishLoginPreviewsForInviteMutation> {
      return withWrapper(() =>
        client.request<PublishLoginPreviewsForInviteMutation>(
          print(PublishLoginPreviewsForInviteDocument),
          variables
        )
      );
    },
    ShareLogin(
      variables: ShareLoginMutationVariables
    ): Promise<ShareLoginMutation> {
      return withWrapper(() =>
        client.request<ShareLoginMutation>(print(ShareLoginDocument), variables)
      );
    },
    PreshareLogin(
      variables: PreshareLoginMutationVariables
    ): Promise<PreshareLoginMutation> {
      return withWrapper(() =>
        client.request<PreshareLoginMutation>(
          print(PreshareLoginDocument),
          variables
        )
      );
    },
    AddFriend(
      variables: AddFriendMutationVariables
    ): Promise<AddFriendMutation> {
      return withWrapper(() =>
        client.request<AddFriendMutation>(print(AddFriendDocument), variables)
      );
    },
    AcceptFriendRequest(
      variables: AcceptFriendRequestMutationVariables
    ): Promise<AcceptFriendRequestMutation> {
      return withWrapper(() =>
        client.request<AcceptFriendRequestMutation>(
          print(AcceptFriendRequestDocument),
          variables
        )
      );
    },
    RejectFriendRequest(
      variables: RejectFriendRequestMutationVariables
    ): Promise<RejectFriendRequestMutation> {
      return withWrapper(() =>
        client.request<RejectFriendRequestMutation>(
          print(RejectFriendRequestDocument),
          variables
        )
      );
    },
    Unfriend(variables: UnfriendMutationVariables): Promise<UnfriendMutation> {
      return withWrapper(() =>
        client.request<UnfriendMutation>(print(UnfriendDocument), variables)
      );
    },
    CreateInvite(
      variables: CreateInviteMutationVariables
    ): Promise<CreateInviteMutation> {
      return withWrapper(() =>
        client.request<CreateInviteMutation>(
          print(CreateInviteDocument),
          variables
        )
      );
    },
    UpdateInvite(
      variables: UpdateInviteMutationVariables
    ): Promise<UpdateInviteMutation> {
      return withWrapper(() =>
        client.request<UpdateInviteMutation>(
          print(UpdateInviteDocument),
          variables
        )
      );
    },
    DismissOnboardingCard(
      variables?: DismissOnboardingCardMutationVariables
    ): Promise<DismissOnboardingCardMutation> {
      return withWrapper(() =>
        client.request<DismissOnboardingCardMutation>(
          print(DismissOnboardingCardDocument),
          variables
        )
      );
    },
    AcceptInvite(
      variables: AcceptInviteMutationVariables
    ): Promise<AcceptInviteMutation> {
      return withWrapper(() =>
        client.request<AcceptInviteMutation>(
          print(AcceptInviteDocument),
          variables
        )
      );
    },
    AcceptBetaInvite(
      variables: AcceptBetaInviteMutationVariables
    ): Promise<AcceptBetaInviteMutation> {
      return withWrapper(() =>
        client.request<AcceptBetaInviteMutation>(
          print(AcceptBetaInviteDocument),
          variables
        )
      );
    },
    VerifyEmail(
      variables: VerifyEmailMutationVariables
    ): Promise<VerifyEmailMutation> {
      return withWrapper(() =>
        client.request<VerifyEmailMutation>(
          print(VerifyEmailDocument),
          variables
        )
      );
    },
    UnsubscribeFromWaitlist(
      variables: UnsubscribeFromWaitlistMutationVariables
    ): Promise<UnsubscribeFromWaitlistMutation> {
      return withWrapper(() =>
        client.request<UnsubscribeFromWaitlistMutation>(
          print(UnsubscribeFromWaitlistDocument),
          variables
        )
      );
    },
    JoinWaitlist(
      variables: JoinWaitlistMutationVariables
    ): Promise<JoinWaitlistMutation> {
      return withWrapper(() =>
        client.request<JoinWaitlistMutation>(
          print(JoinWaitlistDocument),
          variables
        )
      );
    },
    ConfirmWaitlist(
      variables: ConfirmWaitlistMutationVariables
    ): Promise<ConfirmWaitlistMutation> {
      return withWrapper(() =>
        client.request<ConfirmWaitlistMutation>(
          print(ConfirmWaitlistDocument),
          variables
        )
      );
    },
    FinishBetaOnboarding(
      variables?: FinishBetaOnboardingMutationVariables
    ): Promise<FinishBetaOnboardingMutation> {
      return withWrapper(() =>
        client.request<FinishBetaOnboardingMutation>(
          print(FinishBetaOnboardingDocument),
          variables
        )
      );
    },
    RecordMagicLinkUsage(
      variables: RecordMagicLinkUsageMutationVariables
    ): Promise<RecordMagicLinkUsageMutation> {
      return withWrapper(() =>
        client.request<RecordMagicLinkUsageMutation>(
          print(RecordMagicLinkUsageDocument),
          variables
        )
      );
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;

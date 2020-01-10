import {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from "graphql";
import { GraphQLContext } from "./server";
import { DeepPartial } from "utility-types";
export type Maybe<T> = T | null;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = {
  [X in Exclude<keyof T, K>]?: T[X];
} &
  { [P in K]-?: NonNullable<T[P]> };
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
  credentialsKey?: Maybe<RsaEncryptedBlobInput>;
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
  avatarUrl?: Maybe<Scalars["String"]>;
  srpPbkdf2Salt: Scalars["String"];
  masterKeyPbkdf2Salt: Scalars["String"];
  srpSalt: Scalars["String"];
  srpVerifier: Scalars["String"];
  publicKey: Scalars["String"];
  encryptedPrivateKey: AesEncryptedBlobInput;
};

export type CreateInviteInput = {
  phone?: Maybe<Scalars["String"]>;
  email?: Maybe<Scalars["String"]>;
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
  avatarUrl?: Maybe<Scalars["String"]>;
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
  inboundFriendRequestId?: Maybe<Scalars["String"]>;
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
  originalInvite?: Maybe<Invite>;
  loginsSharedWithThem: Array<MyLogin>;
  loginsSharedWithMe: Array<SharedLogin>;
  loginPreviewsVisibleToThem: Array<MyLogin>;
  loginPreviewsVisibleToMe: Array<LoginPreviewSummary>;
};

export type Invite = {
  __typename?: "Invite";
  id: Scalars["String"];
  createdAt?: Maybe<Scalars["Date"]>;
  nickname: Scalars["String"];
  email?: Maybe<Scalars["String"]>;
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
  credentialsKey?: Maybe<AesEncryptedBlob>;
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
  addFriend?: Maybe<Scalars["Boolean"]>;
  acceptFriendRequest?: Maybe<Scalars["Boolean"]>;
  rejectFriendRequest?: Maybe<Scalars["Boolean"]>;
  unfriend?: Maybe<Scalars["Boolean"]>;
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
  username?: Maybe<Scalars["String"]>;
  avatarUrl?: Maybe<Scalars["String"]>;
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
  members?: Maybe<Array<ShareRecipient>>;
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
  friend?: Maybe<Friend>;
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
  waitlistEntry?: Maybe<WaitlistEntry>;
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
  id?: Maybe<Scalars["String"]>;
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
  members?: Maybe<Array<Stranger>>;
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
  createdAt?: Maybe<Scalars["Date"]>;
};

export type UpdateInviteInput = {
  email?: Maybe<Scalars["String"]>;
  nickname?: Maybe<Scalars["String"]>;
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
  unsubscribedAt?: Maybe<Scalars["Date"]>;
};

export enum WaitlistStatus {
  Unverified = "unverified",
  Waiting = "waiting",
  Invited = "invited",
  Accepted = "accepted",
}

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> =
  | LegacyStitchingResolver<TResult, TParent, TContext, TArgs>
  | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}> = (
  obj: T,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {}
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Query: ResolverTypeWrapper<{}>;
  Date: ResolverTypeWrapper<DeepPartial<Scalars["Date"]>>;
  Me: ResolverTypeWrapper<DeepPartial<Me>>;
  String: ResolverTypeWrapper<DeepPartial<Scalars["String"]>>;
  Boolean: ResolverTypeWrapper<DeepPartial<Scalars["Boolean"]>>;
  AesEncryptedBlob: ResolverTypeWrapper<DeepPartial<AesEncryptedBlob>>;
  Friend: ResolverTypeWrapper<DeepPartial<Friend>>;
  MyLogin: ResolverTypeWrapper<
    DeepPartial<
      Omit<MyLogin, "members"> & {
        members?: Maybe<Array<ResolversTypes["ShareRecipient"]>>;
      }
    >
  >;
  RsaEncryptedBlob: ResolverTypeWrapper<DeepPartial<RsaEncryptedBlob>>;
  ShareRecipient: DeepPartial<
    ResolversTypes["Friend"] | ResolversTypes["Invite"]
  >;
  Invite: ResolverTypeWrapper<DeepPartial<Invite>>;
  Stranger: ResolverTypeWrapper<DeepPartial<Stranger>>;
  InviteLoginShare: ResolverTypeWrapper<DeepPartial<InviteLoginShare>>;
  LoginSchemaVersion: ResolverTypeWrapper<DeepPartial<LoginSchemaVersion>>;
  LoginType: ResolverTypeWrapper<DeepPartial<LoginType>>;
  SharedLogin: ResolverTypeWrapper<DeepPartial<SharedLogin>>;
  LoginPreviewSummary: ResolverTypeWrapper<DeepPartial<LoginPreviewSummary>>;
  PendingInboundFriendRequest: ResolverTypeWrapper<
    DeepPartial<PendingInboundFriendRequest>
  >;
  PendingOutboundFriendRequest: ResolverTypeWrapper<
    DeepPartial<PendingOutboundFriendRequest>
  >;
  Login: DeepPartial<ResolversTypes["MyLogin"] | ResolversTypes["SharedLogin"]>;
  MyLoginSummary: ResolverTypeWrapper<DeepPartial<MyLoginSummary>>;
  SharedLoginSummary: ResolverTypeWrapper<DeepPartial<SharedLoginSummary>>;
  LoginShare: ResolverTypeWrapper<DeepPartial<LoginShare>>;
  PotentialShare: ResolverTypeWrapper<
    DeepPartial<
      Omit<PotentialShare, "friend"> & {
        friend: ResolversTypes["ShareRecipient"];
      }
    >
  >;
  Int: ResolverTypeWrapper<DeepPartial<Scalars["Int"]>>;
  AvatarUploadInstructions: ResolverTypeWrapper<
    DeepPartial<AvatarUploadInstructions>
  >;
  FindFriendResult: ResolverTypeWrapper<DeepPartial<FindFriendResult>>;
  FindFriendType: ResolverTypeWrapper<DeepPartial<FindFriendType>>;
  LoginPreviewTodoList: ResolverTypeWrapper<DeepPartial<LoginPreviewTodoList>>;
  LoginPreviewTodo: ResolverTypeWrapper<DeepPartial<LoginPreviewTodo>>;
  LoginShareRequest: ResolverTypeWrapper<DeepPartial<LoginShareRequest>>;
  WaitlistEntry: ResolverTypeWrapper<DeepPartial<WaitlistEntry>>;
  Mutation: ResolverTypeWrapper<{}>;
  CreateUserInput: ResolverTypeWrapper<DeepPartial<CreateUserInput>>;
  AesEncryptedBlobInput: ResolverTypeWrapper<
    DeepPartial<AesEncryptedBlobInput>
  >;
  UpdatePasswordInput: ResolverTypeWrapper<DeepPartial<UpdatePasswordInput>>;
  AcceptInviteInput: ResolverTypeWrapper<DeepPartial<AcceptInviteInput>>;
  AcceptInviteAccessKeyInput: ResolverTypeWrapper<
    DeepPartial<AcceptInviteAccessKeyInput>
  >;
  RsaEncryptedBlobInput: ResolverTypeWrapper<
    DeepPartial<RsaEncryptedBlobInput>
  >;
  AcceptBetaInviteInput: ResolverTypeWrapper<
    DeepPartial<AcceptBetaInviteInput>
  >;
  CreateBetaUserInput: ResolverTypeWrapper<DeepPartial<CreateBetaUserInput>>;
  CreateLoginInput: ResolverTypeWrapper<DeepPartial<CreateLoginInput>>;
  CreateLoginFriendShareInput: ResolverTypeWrapper<
    DeepPartial<CreateLoginFriendShareInput>
  >;
  CreateLoginInvitedFriendShareInput: ResolverTypeWrapper<
    DeepPartial<CreateLoginInvitedFriendShareInput>
  >;
  UpdateLoginInput: ResolverTypeWrapper<DeepPartial<UpdateLoginInput>>;
  StartSRPHandshakeInput: ResolverTypeWrapper<
    DeepPartial<StartSrpHandshakeInput>
  >;
  SRPStartHandshakeResponse: ResolverTypeWrapper<
    DeepPartial<SrpStartHandshakeResponse>
  >;
  FinishSRPHandshakeInput: ResolverTypeWrapper<
    DeepPartial<FinishSrpHandshakeInput>
  >;
  SRPFinishHandshakeResponse: ResolverTypeWrapper<
    DeepPartial<SrpFinishHandshakeResponse>
  >;
  ShareLoginInput: ResolverTypeWrapper<DeepPartial<ShareLoginInput>>;
  PreshareLoginInput: ResolverTypeWrapper<DeepPartial<PreshareLoginInput>>;
  CreateInviteInput: ResolverTypeWrapper<DeepPartial<CreateInviteInput>>;
  UpdateInviteInput: ResolverTypeWrapper<DeepPartial<UpdateInviteInput>>;
  WaitlistStatus: ResolverTypeWrapper<DeepPartial<WaitlistStatus>>;
  LoginPreviewsInput: ResolverTypeWrapper<DeepPartial<LoginPreviewsInput>>;
  LoginPreviewInput: ResolverTypeWrapper<DeepPartial<LoginPreviewInput>>;
  LoginPreviewsForInviteInput: ResolverTypeWrapper<
    DeepPartial<LoginPreviewsForInviteInput>
  >;
  LoginPreviewForInviteInput: ResolverTypeWrapper<
    DeepPartial<LoginPreviewForInviteInput>
  >;
  ApproveShareRequestInput: ResolverTypeWrapper<
    DeepPartial<ApproveShareRequestInput>
  >;
  MagicLinkPulseState: ResolverTypeWrapper<DeepPartial<MagicLinkPulseState>>;
  LoginTransfer: ResolverTypeWrapper<DeepPartial<LoginTransfer>>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Query: {};
  Date: DeepPartial<Scalars["Date"]>;
  Me: DeepPartial<Me>;
  String: DeepPartial<Scalars["String"]>;
  Boolean: DeepPartial<Scalars["Boolean"]>;
  AesEncryptedBlob: DeepPartial<AesEncryptedBlob>;
  Friend: DeepPartial<Friend>;
  MyLogin: DeepPartial<
    Omit<MyLogin, "members"> & {
      members?: Maybe<Array<ResolversParentTypes["ShareRecipient"]>>;
    }
  >;
  RsaEncryptedBlob: DeepPartial<RsaEncryptedBlob>;
  ShareRecipient: DeepPartial<
    ResolversParentTypes["Friend"] | ResolversParentTypes["Invite"]
  >;
  Invite: DeepPartial<Invite>;
  Stranger: DeepPartial<Stranger>;
  InviteLoginShare: DeepPartial<InviteLoginShare>;
  SharedLogin: DeepPartial<SharedLogin>;
  LoginPreviewSummary: DeepPartial<LoginPreviewSummary>;
  PendingInboundFriendRequest: DeepPartial<PendingInboundFriendRequest>;
  PendingOutboundFriendRequest: DeepPartial<PendingOutboundFriendRequest>;
  Login: DeepPartial<
    ResolversParentTypes["MyLogin"] | ResolversParentTypes["SharedLogin"]
  >;
  MyLoginSummary: DeepPartial<MyLoginSummary>;
  SharedLoginSummary: DeepPartial<SharedLoginSummary>;
  LoginShare: DeepPartial<LoginShare>;
  PotentialShare: DeepPartial<
    Omit<PotentialShare, "friend"> & {
      friend: ResolversParentTypes["ShareRecipient"];
    }
  >;
  Int: DeepPartial<Scalars["Int"]>;
  AvatarUploadInstructions: DeepPartial<AvatarUploadInstructions>;
  FindFriendResult: DeepPartial<FindFriendResult>;
  LoginPreviewTodoList: DeepPartial<LoginPreviewTodoList>;
  LoginPreviewTodo: DeepPartial<LoginPreviewTodo>;
  LoginShareRequest: DeepPartial<LoginShareRequest>;
  WaitlistEntry: DeepPartial<WaitlistEntry>;
  Mutation: {};
  CreateUserInput: DeepPartial<CreateUserInput>;
  AesEncryptedBlobInput: DeepPartial<AesEncryptedBlobInput>;
  UpdatePasswordInput: DeepPartial<UpdatePasswordInput>;
  AcceptInviteInput: DeepPartial<AcceptInviteInput>;
  AcceptInviteAccessKeyInput: DeepPartial<AcceptInviteAccessKeyInput>;
  RsaEncryptedBlobInput: DeepPartial<RsaEncryptedBlobInput>;
  AcceptBetaInviteInput: DeepPartial<AcceptBetaInviteInput>;
  CreateBetaUserInput: DeepPartial<CreateBetaUserInput>;
  CreateLoginInput: DeepPartial<CreateLoginInput>;
  CreateLoginFriendShareInput: DeepPartial<CreateLoginFriendShareInput>;
  CreateLoginInvitedFriendShareInput: DeepPartial<
    CreateLoginInvitedFriendShareInput
  >;
  UpdateLoginInput: DeepPartial<UpdateLoginInput>;
  StartSRPHandshakeInput: DeepPartial<StartSrpHandshakeInput>;
  SRPStartHandshakeResponse: DeepPartial<SrpStartHandshakeResponse>;
  FinishSRPHandshakeInput: DeepPartial<FinishSrpHandshakeInput>;
  SRPFinishHandshakeResponse: DeepPartial<SrpFinishHandshakeResponse>;
  ShareLoginInput: DeepPartial<ShareLoginInput>;
  PreshareLoginInput: DeepPartial<PreshareLoginInput>;
  CreateInviteInput: DeepPartial<CreateInviteInput>;
  UpdateInviteInput: DeepPartial<UpdateInviteInput>;
  LoginPreviewsInput: DeepPartial<LoginPreviewsInput>;
  LoginPreviewInput: DeepPartial<LoginPreviewInput>;
  LoginPreviewsForInviteInput: DeepPartial<LoginPreviewsForInviteInput>;
  LoginPreviewForInviteInput: DeepPartial<LoginPreviewForInviteInput>;
  ApproveShareRequestInput: DeepPartial<ApproveShareRequestInput>;
  LoginTransfer: DeepPartial<LoginTransfer>;
}>;

export type AesEncryptedBlobResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["AesEncryptedBlob"]
> = ResolversObject<{
  ciphertext?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  iv?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  salt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  algorithm?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type AvatarUploadInstructionsResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["AvatarUploadInstructions"]
> = ResolversObject<{
  avatarUrl?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  uploadUrl?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export interface DateScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["Date"], any> {
  name: "Date";
}

export type FindFriendResultResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["FindFriendResult"]
> = ResolversObject<{
  status?: Resolver<ResolversTypes["FindFriendType"], ParentType, ContextType>;
  inboundFriendRequestId?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  user?: Resolver<ResolversTypes["Stranger"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type FriendResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["Friend"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  email?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  username?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  publicKey?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  avatarUrl?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  loginPreviewTodos?: Resolver<
    Array<ResolversTypes["MyLogin"]>,
    ParentType,
    ContextType
  >;
  originalInvite?: Resolver<
    Maybe<ResolversTypes["Invite"]>,
    ParentType,
    ContextType
  >;
  loginsSharedWithThem?: Resolver<
    Array<ResolversTypes["MyLogin"]>,
    ParentType,
    ContextType
  >;
  loginsSharedWithMe?: Resolver<
    Array<ResolversTypes["SharedLogin"]>,
    ParentType,
    ContextType
  >;
  loginPreviewsVisibleToThem?: Resolver<
    Array<ResolversTypes["MyLogin"]>,
    ParentType,
    ContextType
  >;
  loginPreviewsVisibleToMe?: Resolver<
    Array<ResolversTypes["LoginPreviewSummary"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type InviteResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["Invite"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes["Date"]>, ParentType, ContextType>;
  nickname?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  key?: Resolver<ResolversTypes["RsaEncryptedBlob"], ParentType, ContextType>;
  from?: Resolver<ResolversTypes["Stranger"], ParentType, ContextType>;
  loginShares?: Resolver<
    Array<ResolversTypes["InviteLoginShare"]>,
    ParentType,
    ContextType,
    RequireFields<InviteLoginSharesArgs, "includePreviews">
  >;
  loginPreviewTodos?: Resolver<
    Array<ResolversTypes["MyLogin"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type InviteLoginShareResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["InviteLoginShare"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  preview?: Resolver<
    ResolversTypes["AesEncryptedBlob"],
    ParentType,
    ContextType
  >;
  previewKey?: Resolver<
    ResolversTypes["AesEncryptedBlob"],
    ParentType,
    ContextType
  >;
  credentialsKey?: Resolver<
    Maybe<ResolversTypes["AesEncryptedBlob"]>,
    ParentType,
    ContextType
  >;
  schemaVersion?: Resolver<
    ResolversTypes["LoginSchemaVersion"],
    ParentType,
    ContextType
  >;
  type?: Resolver<ResolversTypes["LoginType"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type LoginResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["Login"]
> = ResolversObject<{
  __resolveType: TypeResolveFn<
    "MyLogin" | "SharedLogin",
    ParentType,
    ContextType
  >;
}>;

export type LoginPreviewSummaryResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["LoginPreviewSummary"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["Date"], ParentType, ContextType>;
  accessRequested?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  preview?: Resolver<
    ResolversTypes["AesEncryptedBlob"],
    ParentType,
    ContextType
  >;
  previewKey?: Resolver<
    ResolversTypes["RsaEncryptedBlob"],
    ParentType,
    ContextType
  >;
  schemaVersion?: Resolver<
    ResolversTypes["LoginSchemaVersion"],
    ParentType,
    ContextType
  >;
  type?: Resolver<ResolversTypes["LoginType"], ParentType, ContextType>;
  manager?: Resolver<ResolversTypes["Friend"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type LoginPreviewTodoResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["LoginPreviewTodo"]
> = ResolversObject<{
  friendId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  publicKey?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  loginIds?: Resolver<Array<ResolversTypes["String"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type LoginPreviewTodoListResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["LoginPreviewTodoList"]
> = ResolversObject<{
  todo?: Resolver<
    Array<ResolversTypes["LoginPreviewTodo"]>,
    ParentType,
    ContextType
  >;
  logins?: Resolver<Array<ResolversTypes["MyLogin"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type LoginShareResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["LoginShare"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  manager?: Resolver<ResolversTypes["Friend"], ParentType, ContextType>;
  preview?: Resolver<
    ResolversTypes["AesEncryptedBlob"],
    ParentType,
    ContextType
  >;
  previewKey?: Resolver<
    ResolversTypes["RsaEncryptedBlob"],
    ParentType,
    ContextType
  >;
  schemaVersion?: Resolver<
    ResolversTypes["LoginSchemaVersion"],
    ParentType,
    ContextType
  >;
  type?: Resolver<ResolversTypes["LoginType"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type LoginShareRequestResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["LoginShareRequest"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  preview?: Resolver<
    ResolversTypes["AesEncryptedBlob"],
    ParentType,
    ContextType
  >;
  previewKey?: Resolver<
    ResolversTypes["RsaEncryptedBlob"],
    ParentType,
    ContextType
  >;
  credentialsKey?: Resolver<
    ResolversTypes["RsaEncryptedBlob"],
    ParentType,
    ContextType
  >;
  schemaVersion?: Resolver<
    ResolversTypes["LoginSchemaVersion"],
    ParentType,
    ContextType
  >;
  type?: Resolver<ResolversTypes["LoginType"], ParentType, ContextType>;
  member?: Resolver<ResolversTypes["Friend"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type LoginTransferResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["LoginTransfer"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  credentials?: Resolver<
    ResolversTypes["AesEncryptedBlob"],
    ParentType,
    ContextType
  >;
  credentialsKey?: Resolver<
    ResolversTypes["RsaEncryptedBlob"],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type MeResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["Me"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  isInBetaOnboarding?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  createdAt?: Resolver<ResolversTypes["Date"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["Date"], ParentType, ContextType>;
  srpSalt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  username?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  avatarUrl?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  email?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  publicKey?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  encryptedPrivateKey?: Resolver<
    ResolversTypes["AesEncryptedBlob"],
    ParentType,
    ContextType
  >;
  showOnboardingCard?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  emailVerified?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  forcedPasswordChangeEnabled?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type MutationResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["Mutation"]
> = ResolversObject<{
  addFriend?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType,
    RequireFields<MutationAddFriendArgs, "userId">
  >;
  acceptFriendRequest?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType,
    RequireFields<MutationAcceptFriendRequestArgs, "id">
  >;
  rejectFriendRequest?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType,
    RequireFields<MutationRejectFriendRequestArgs, "requestId">
  >;
  unfriend?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType,
    RequireFields<MutationUnfriendArgs, "id">
  >;
  createUser?: Resolver<
    ResolversTypes["Me"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateUserArgs, "params">
  >;
  updatePassword?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdatePasswordArgs, "params">
  >;
  updateAccount?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateAccountArgs, never>
  >;
  acceptInvite?: Resolver<
    ResolversTypes["Me"],
    ParentType,
    ContextType,
    RequireFields<MutationAcceptInviteArgs, "params">
  >;
  acceptBetaInvite?: Resolver<
    ResolversTypes["Me"],
    ParentType,
    ContextType,
    RequireFields<MutationAcceptBetaInviteArgs, "params">
  >;
  createLogin?: Resolver<
    ResolversTypes["MyLogin"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateLoginArgs, "params">
  >;
  updateLogin?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateLoginArgs, "params">
  >;
  deleteLogin?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteLoginArgs, "id">
  >;
  deleteInvite?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteInviteArgs, "id">
  >;
  acceptLoginShare?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationAcceptLoginShareArgs, "loginId">
  >;
  rejectLoginShare?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationRejectLoginShareArgs, "id">
  >;
  startSRPHandshake?: Resolver<
    ResolversTypes["SRPStartHandshakeResponse"],
    ParentType,
    ContextType,
    RequireFields<MutationStartSrpHandshakeArgs, "params">
  >;
  finishSRPHandshake?: Resolver<
    ResolversTypes["SRPFinishHandshakeResponse"],
    ParentType,
    ContextType,
    RequireFields<MutationFinishSrpHandshakeArgs, "params">
  >;
  signOut?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  shareLogin?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationShareLoginArgs, "params">
  >;
  preshareLogin?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationPreshareLoginArgs, "params">
  >;
  createInvite?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateInviteArgs, "params">
  >;
  updateInvite?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateInviteArgs, "id" | "changes">
  >;
  dismissOnboardingCard?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  verifyEmail?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationVerifyEmailArgs, "id">
  >;
  joinWaitlist?: Resolver<
    ResolversTypes["WaitlistStatus"],
    ParentType,
    ContextType,
    RequireFields<MutationJoinWaitlistArgs, "email" | "firstName">
  >;
  unsubscribeFromWaitlist?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationUnsubscribeFromWaitlistArgs, "id">
  >;
  confirmWaitlist?: Resolver<
    ResolversTypes["WaitlistStatus"],
    ParentType,
    ContextType,
    RequireFields<MutationConfirmWaitlistArgs, "secret">
  >;
  publishLoginPreviews?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationPublishLoginPreviewsArgs, "params">
  >;
  publishLoginPreviewsForInvite?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationPublishLoginPreviewsForInviteArgs, "params">
  >;
  requestLoginShare?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationRequestLoginShareArgs, "id">
  >;
  approveShareRequest?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationApproveShareRequestArgs, "params">
  >;
  rejectShareRequest?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationRejectShareRequestArgs, "id" | "memberId">
  >;
  finishBetaOnboarding?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  recordMagicLinkUsage?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationRecordMagicLinkUsageArgs, "id" | "state">
  >;
}>;

export type MyLoginResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["MyLogin"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["Date"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["Date"], ParentType, ContextType>;
  credentials?: Resolver<
    ResolversTypes["AesEncryptedBlob"],
    ParentType,
    ContextType
  >;
  preview?: Resolver<
    ResolversTypes["AesEncryptedBlob"],
    ParentType,
    ContextType
  >;
  credentialsKey?: Resolver<
    ResolversTypes["RsaEncryptedBlob"],
    ParentType,
    ContextType
  >;
  previewKey?: Resolver<
    ResolversTypes["RsaEncryptedBlob"],
    ParentType,
    ContextType
  >;
  manager?: Resolver<ResolversTypes["Me"], ParentType, ContextType>;
  members?: Resolver<
    Maybe<Array<ResolversTypes["ShareRecipient"]>>,
    ParentType,
    ContextType
  >;
  sharePreviews?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  schemaVersion?: Resolver<
    ResolversTypes["LoginSchemaVersion"],
    ParentType,
    ContextType
  >;
  type?: Resolver<ResolversTypes["LoginType"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type MyLoginSummaryResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["MyLoginSummary"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["Date"], ParentType, ContextType>;
  credentials?: Resolver<
    ResolversTypes["AesEncryptedBlob"],
    ParentType,
    ContextType
  >;
  credentialsKey?: Resolver<
    ResolversTypes["RsaEncryptedBlob"],
    ParentType,
    ContextType
  >;
  schemaVersion?: Resolver<
    ResolversTypes["LoginSchemaVersion"],
    ParentType,
    ContextType
  >;
  type?: Resolver<ResolversTypes["LoginType"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type PendingInboundFriendRequestResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["PendingInboundFriendRequest"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  initiator?: Resolver<ResolversTypes["Stranger"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type PendingOutboundFriendRequestResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["PendingOutboundFriendRequest"]
> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes["Date"], ParentType, ContextType>;
  recipient?: Resolver<ResolversTypes["Stranger"], ParentType, ContextType>;
  loginPreviewTodos?: Resolver<
    Array<ResolversTypes["MyLogin"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type PotentialShareResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["PotentialShare"]
> = ResolversObject<{
  friend?: Resolver<ResolversTypes["ShareRecipient"], ParentType, ContextType>;
  numSharing?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type QueryResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["Query"]
> = ResolversObject<{
  time?: Resolver<ResolversTypes["Date"], ParentType, ContextType>;
  me?: Resolver<ResolversTypes["Me"], ParentType, ContextType>;
  friends?: Resolver<Array<ResolversTypes["Friend"]>, ParentType, ContextType>;
  friend?: Resolver<
    Maybe<ResolversTypes["Friend"]>,
    ParentType,
    ContextType,
    RequireFields<QueryFriendArgs, "id">
  >;
  invites?: Resolver<Array<ResolversTypes["Invite"]>, ParentType, ContextType>;
  pendingInboundFriendRequests?: Resolver<
    Array<ResolversTypes["PendingInboundFriendRequest"]>,
    ParentType,
    ContextType
  >;
  pendingInboundFriendRequest?: Resolver<
    ResolversTypes["PendingInboundFriendRequest"],
    ParentType,
    ContextType,
    RequireFields<QueryPendingInboundFriendRequestArgs, "id">
  >;
  pendingOutboundFriendRequests?: Resolver<
    Array<ResolversTypes["PendingOutboundFriendRequest"]>,
    ParentType,
    ContextType
  >;
  login?: Resolver<
    ResolversTypes["Login"],
    ParentType,
    ContextType,
    RequireFields<QueryLoginArgs, "id">
  >;
  myLogins?: Resolver<
    Array<ResolversTypes["MyLoginSummary"]>,
    ParentType,
    ContextType
  >;
  loginsSharedWithMe?: Resolver<
    Array<ResolversTypes["SharedLoginSummary"]>,
    ParentType,
    ContextType
  >;
  loginPreviews?: Resolver<
    Array<ResolversTypes["LoginPreviewSummary"]>,
    ParentType,
    ContextType
  >;
  pendingLoginShares?: Resolver<
    Array<ResolversTypes["LoginShare"]>,
    ParentType,
    ContextType
  >;
  potentialShares?: Resolver<
    Array<ResolversTypes["PotentialShare"]>,
    ParentType,
    ContextType,
    RequireFields<QueryPotentialSharesArgs, never>
  >;
  getAvatarUploadUrl?: Resolver<
    ResolversTypes["AvatarUploadInstructions"],
    ParentType,
    ContextType
  >;
  findFriends?: Resolver<
    Array<ResolversTypes["FindFriendResult"]>,
    ParentType,
    ContextType,
    RequireFields<QueryFindFriendsArgs, "search">
  >;
  invite?: Resolver<
    ResolversTypes["Invite"],
    ParentType,
    ContextType,
    RequireFields<QueryInviteArgs, "id">
  >;
  sessionWrapper?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  loginPreviewTodo?: Resolver<
    ResolversTypes["LoginPreviewTodoList"],
    ParentType,
    ContextType
  >;
  loginPreview?: Resolver<
    ResolversTypes["LoginPreviewSummary"],
    ParentType,
    ContextType,
    RequireFields<QueryLoginPreviewArgs, "id">
  >;
  loginShareRequests?: Resolver<
    Array<ResolversTypes["LoginShareRequest"]>,
    ParentType,
    ContextType
  >;
  waitlistEntry?: Resolver<
    Maybe<ResolversTypes["WaitlistEntry"]>,
    ParentType,
    ContextType,
    RequireFields<QueryWaitlistEntryArgs, "id">
  >;
  isUsernameAvailable?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<QueryIsUsernameAvailableArgs, "username">
  >;
  isEmailAvailable?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<QueryIsEmailAvailableArgs, "email">
  >;
}>;

export type RsaEncryptedBlobResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["RsaEncryptedBlob"]
> = ResolversObject<{
  ciphertext?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  algorithm?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type SharedLoginResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["SharedLogin"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["Date"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["Date"], ParentType, ContextType>;
  credentials?: Resolver<
    ResolversTypes["AesEncryptedBlob"],
    ParentType,
    ContextType
  >;
  preview?: Resolver<
    ResolversTypes["AesEncryptedBlob"],
    ParentType,
    ContextType
  >;
  credentialsKey?: Resolver<
    ResolversTypes["RsaEncryptedBlob"],
    ParentType,
    ContextType
  >;
  previewKey?: Resolver<
    ResolversTypes["RsaEncryptedBlob"],
    ParentType,
    ContextType
  >;
  schemaVersion?: Resolver<
    ResolversTypes["LoginSchemaVersion"],
    ParentType,
    ContextType
  >;
  type?: Resolver<ResolversTypes["LoginType"], ParentType, ContextType>;
  manager?: Resolver<ResolversTypes["Friend"], ParentType, ContextType>;
  members?: Resolver<
    Maybe<Array<ResolversTypes["Stranger"]>>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type SharedLoginSummaryResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["SharedLoginSummary"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["Date"], ParentType, ContextType>;
  credentials?: Resolver<
    ResolversTypes["AesEncryptedBlob"],
    ParentType,
    ContextType
  >;
  credentialsKey?: Resolver<
    ResolversTypes["RsaEncryptedBlob"],
    ParentType,
    ContextType
  >;
  schemaVersion?: Resolver<
    ResolversTypes["LoginSchemaVersion"],
    ParentType,
    ContextType
  >;
  type?: Resolver<ResolversTypes["LoginType"], ParentType, ContextType>;
  manager?: Resolver<ResolversTypes["Friend"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type ShareRecipientResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["ShareRecipient"]
> = ResolversObject<{
  __resolveType: TypeResolveFn<"Friend" | "Invite", ParentType, ContextType>;
}>;

export type SrpFinishHandshakeResponseResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["SRPFinishHandshakeResponse"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  serverProof?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  sessionWrapper?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  masterKeyPbkdf2Salt?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type SrpStartHandshakeResponseResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["SRPStartHandshakeResponse"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  srpSalt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  srpPbkdf2Salt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  serverPublicEphemeral?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type StrangerResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["Stranger"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  username?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  publicKey?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  avatarUrl?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes["Date"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type WaitlistEntryResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes["WaitlistEntry"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  email?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["Date"], ParentType, ContextType>;
  unsubscribedAt?: Resolver<
    Maybe<ResolversTypes["Date"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  AesEncryptedBlob?: AesEncryptedBlobResolvers<ContextType>;
  AvatarUploadInstructions?: AvatarUploadInstructionsResolvers<ContextType>;
  Date?: GraphQLScalarType;
  FindFriendResult?: FindFriendResultResolvers<ContextType>;
  Friend?: FriendResolvers<ContextType>;
  Invite?: InviteResolvers<ContextType>;
  InviteLoginShare?: InviteLoginShareResolvers<ContextType>;
  Login?: LoginResolvers<ContextType>;
  LoginPreviewSummary?: LoginPreviewSummaryResolvers<ContextType>;
  LoginPreviewTodo?: LoginPreviewTodoResolvers<ContextType>;
  LoginPreviewTodoList?: LoginPreviewTodoListResolvers<ContextType>;
  LoginShare?: LoginShareResolvers<ContextType>;
  LoginShareRequest?: LoginShareRequestResolvers<ContextType>;
  LoginTransfer?: LoginTransferResolvers<ContextType>;
  Me?: MeResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  MyLogin?: MyLoginResolvers<ContextType>;
  MyLoginSummary?: MyLoginSummaryResolvers<ContextType>;
  PendingInboundFriendRequest?: PendingInboundFriendRequestResolvers<
    ContextType
  >;
  PendingOutboundFriendRequest?: PendingOutboundFriendRequestResolvers<
    ContextType
  >;
  PotentialShare?: PotentialShareResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RsaEncryptedBlob?: RsaEncryptedBlobResolvers<ContextType>;
  SharedLogin?: SharedLoginResolvers<ContextType>;
  SharedLoginSummary?: SharedLoginSummaryResolvers<ContextType>;
  ShareRecipient?: ShareRecipientResolvers<ContextType>;
  SRPFinishHandshakeResponse?: SrpFinishHandshakeResponseResolvers<ContextType>;
  SRPStartHandshakeResponse?: SrpStartHandshakeResponseResolvers<ContextType>;
  Stranger?: StrangerResolvers<ContextType>;
  WaitlistEntry?: WaitlistEntryResolvers<ContextType>;
}>;

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = GraphQLContext> = Resolvers<ContextType>;

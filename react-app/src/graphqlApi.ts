import { GraphQLClient } from "graphql-request";
import { print } from "graphql";

import { getSdk } from "./api/graphql";
import * as gql from "./api/graphql";
import * as crypto from "crypto";
import { SRPSession } from "./srp";

import { formatISO } from "date-fns";
import { ExpandRecursively } from "./generics";
import clientEnv from "./clientEnv";

// Relative URIs do not work inside a chrome extension, so we need to qualify with backend host
const graphqlEndpointFor = (uri: string) =>
  clientEnv.absolutePath(uri).toString();

const client = new GraphQLClient(graphqlEndpointFor("/graphql"), {
  headers: { "Content-Type": "application/json" },
});

const api = getSdk(client);

export default api;

type ApiInterface = keyof ReturnType<typeof getSdk>;

const authenticatedClient = async ({
  session,
  graphqlDoc,
  variables,
}: {
  session: SRPSession;
  graphqlDoc: any;
  variables: any;
}) => {
  let uri = "/graphql";
  if (process.env.NODE_ENV === "development") {
    const operationName = graphqlDoc.definitions[0].name.value;
    // Make URLs for diff operations stand out in chrome request viewer
    uri += `?${operationName}`;
  }

  const client = new GraphQLClient(graphqlEndpointFor(uri), {
    headers: { "Content-Type": "application/json" },
  });

  const query = print(graphqlDoc);
  const body = JSON.stringify({
    query,
    variables: variables ? variables : undefined,
  });

  const digest = crypto
    .createHash("sha256")
    .update(body)
    .digest()
    .toString("base64");

  const { time } = await api.GetTime();

  const extraHeaders = {
    Digest: `SHA-256=${digest}`,
    /**
     * fetch is not allowed to set the Date header!
     * @see https://fetch.spec.whatwg.org/#forbidden-header-name
     */
    "X-Sent-At": time,
  };

  const reqSummary = [
    `(request-target): post ${uri.toLowerCase()}`,
    `x-sent-at: ${extraHeaders["X-Sent-At"]}`,
    `digest: ${extraHeaders.Digest}`,
  ].join("\n");

  const signature = crypto
    .createHmac("sha256", session.key)
    .update(reqSummary)
    .digest()
    .toString("base64");

  const auth = [
    `Signature keyId="${session.id}"`,
    'algorithm="hmac-sha256"',
    'headers="(request-target) x-sent-at digest"',
    `signature="${signature}"`,
  ].join(",");

  client.setHeaders({ ...extraHeaders, Authorization: auth });

  return client;
};

type TGraphQLClient = typeof api;
export type TApiFn = keyof TGraphQLClient;
type TQueryArgs<Name extends TApiFn> = Parameters<TGraphQLClient[Name]>;
type TQueryReturn<Name extends TApiFn> = ReturnType<TGraphQLClient[Name]>;

type GraphQLReturnType<
  Fn extends (...args: any) => PromiseLike<any>
> = ReturnType<Fn> extends PromiseLike<infer U> ? U : never;

export type ApiReturnType<FnName extends TApiFn> = ExpandRecursively<
  GraphQLReturnType<TGraphQLClient[FnName]>
>;

export const hmacApi = (session: SRPSession) => {
  return {
    async GetMe(...[variables]: TQueryArgs<"GetMe">): TQueryReturn<"GetMe"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.GetMeDocument,
          variables,
        })
      ).GetMe(variables);
    },
    async CreateNewLogin(
      variables: TQueryArgs<"CreateNewLogin">[0]
    ): TQueryReturn<"CreateNewLogin"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.CreateNewLoginDocument,
          variables,
        })
      ).CreateNewLogin(variables);
    },
    async GetLogin(
      variables: TQueryArgs<"GetLogin">[0]
    ): TQueryReturn<"GetLogin"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.GetLoginDocument,
          variables,
        })
      ).GetLogin(variables);
    },
    async AddFriend(
      ...[variables]: TQueryArgs<"AddFriend">
    ): TQueryReturn<"AddFriend"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.AddFriendDocument,
          variables,
        })
      ).AddFriend(variables);
    },
    async AcceptFriendRequest(
      ...[variables]: TQueryArgs<"AcceptFriendRequest">
    ): TQueryReturn<"AcceptFriendRequest"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.AcceptFriendRequestDocument,
          variables,
        })
      ).AcceptFriendRequest(variables);
    },
    async RejectFriendRequest(
      ...[variables]: TQueryArgs<"RejectFriendRequest">
    ): TQueryReturn<"RejectFriendRequest"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.RejectFriendRequestDocument,
          variables,
        })
      ).RejectFriendRequest(variables);
    },
    async Unfriend(
      ...[variables]: TQueryArgs<"Unfriend">
    ): TQueryReturn<"Unfriend"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.UnfriendDocument,
          variables,
        })
      ).Unfriend(variables);
    },
    async MyFriends(
      ...[variables]: TQueryArgs<"MyFriends">
    ): TQueryReturn<"MyFriends"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.MyFriendsDocument,
          variables,
        })
      ).MyFriends(variables);
    },
    async ShareLogin(
      ...[variables]: TQueryArgs<"ShareLogin">
    ): TQueryReturn<"ShareLogin"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.ShareLoginDocument,
          variables,
        })
      ).ShareLogin(variables);
    },
    async GetPendingLoginShares(
      ...[variables]: TQueryArgs<"GetPendingLoginShares">
    ): TQueryReturn<"GetPendingLoginShares"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.GetPendingLoginSharesDocument,
          variables,
        })
      ).GetPendingLoginShares(variables);
    },
    async AcceptLoginShare(
      ...[variables]: TQueryArgs<"AcceptLoginShare">
    ): TQueryReturn<"AcceptLoginShare"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.AcceptLoginShareDocument,
          variables,
        })
      ).AcceptLoginShare(variables);
    },
    async RejectLoginShare(
      ...[variables]: TQueryArgs<"RejectLoginShare">
    ): TQueryReturn<"RejectLoginShare"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.RejectLoginShareDocument,
          variables,
        })
      ).RejectLoginShare(variables);
    },
    async GetPotentialShares(
      ...[variables]: TQueryArgs<"GetPotentialShares">
    ): TQueryReturn<"GetPotentialShares"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.GetPotentialSharesDocument,
          variables,
        })
      ).GetPotentialShares(variables);
    },
    async FindFriends(
      ...[variables]: TQueryArgs<"FindFriends">
    ): TQueryReturn<"FindFriends"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.FindFriendsDocument,
          variables,
        })
      ).FindFriends(variables);
    },
    async GetPendingInboundFriendRequests(
      ...[variables]: TQueryArgs<"GetPendingInboundFriendRequests">
    ): TQueryReturn<"GetPendingInboundFriendRequests"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.GetPendingInboundFriendRequestsDocument,
          variables,
        })
      ).GetPendingInboundFriendRequests(variables);
    },
    async CreateInvite(
      ...[variables]: TQueryArgs<"CreateInvite">
    ): TQueryReturn<"CreateInvite"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.CreateInviteDocument,
          variables,
        })
      ).CreateInvite(variables);
    },
    async GetInvite(
      ...[variables]: TQueryArgs<"GetInvite">
    ): TQueryReturn<"GetInvite"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.GetInviteDocument,
          variables,
        })
      ).GetInvite(variables);
    },
    async MySessionWrapper(
      ...[variables]: TQueryArgs<"MySessionWrapper">
    ): TQueryReturn<"MySessionWrapper"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.MySessionWrapperDocument,
          variables,
        })
      ).MySessionWrapper(variables);
    },
    async DismissOnboardingCard(
      ...[variables]: TQueryArgs<"DismissOnboardingCard">
    ): TQueryReturn<"DismissOnboardingCard"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.DismissOnboardingCardDocument,
          variables,
        })
      ).DismissOnboardingCard(variables);
    },
    async VerifyEmail(
      ...[variables]: TQueryArgs<"VerifyEmail">
    ): TQueryReturn<"VerifyEmail"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.VerifyEmailDocument,
          variables,
        })
      ).VerifyEmail(variables);
    },
    async JoinWaitlist(
      ...[variables]: TQueryArgs<"JoinWaitlist">
    ): TQueryReturn<"JoinWaitlist"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.JoinWaitlistDocument,
          variables,
        })
      ).JoinWaitlist(variables);
    },
    async GetPendingInboundFriendRequest(
      ...[variables]: TQueryArgs<"GetPendingInboundFriendRequest">
    ): TQueryReturn<"GetPendingInboundFriendRequest"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.GetPendingInboundFriendRequestDocument,
          variables,
        })
      ).GetPendingInboundFriendRequest(variables);
    },
    async GetLoginPreviewTodo(
      ...[variables]: TQueryArgs<"GetLoginPreviewTodo">
    ): TQueryReturn<"GetLoginPreviewTodo"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.GetLoginPreviewTodoDocument,
          variables,
        })
      ).GetLoginPreviewTodo(variables);
    },
    async PublishLoginPreviews(
      ...[variables]: TQueryArgs<"PublishLoginPreviews">
    ): TQueryReturn<"PublishLoginPreviews"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.PublishLoginPreviewsDocument,
          variables,
        })
      ).PublishLoginPreviews(variables);
    },
    async PublishLoginPreviewsForInvite(
      ...[variables]: TQueryArgs<"PublishLoginPreviewsForInvite">
    ): TQueryReturn<"PublishLoginPreviewsForInvite"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.PublishLoginPreviewsForInviteDocument,
          variables,
        })
      ).PublishLoginPreviewsForInvite(variables);
    },
    async GetLoginsOverview(
      ...[variables]: TQueryArgs<"GetLoginsOverview">
    ): TQueryReturn<"GetLoginsOverview"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.GetLoginsOverviewDocument,
          variables,
        })
      ).GetLoginsOverview(variables);
    },
    async GetLoginPreview(
      ...[variables]: TQueryArgs<"GetLoginPreview">
    ): TQueryReturn<"GetLoginPreview"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.GetLoginPreviewDocument,
          variables,
        })
      ).GetLoginPreview(variables);
    },
    async RequestLoginShare(
      ...[variables]: TQueryArgs<"RequestLoginShare">
    ): TQueryReturn<"RequestLoginShare"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.RequestLoginShareDocument,
          variables,
        })
      ).RequestLoginShare(variables);
    },
    async GetNotifications(
      ...[variables]: TQueryArgs<"GetNotifications">
    ): TQueryReturn<"GetNotifications"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.GetNotificationsDocument,
          variables,
        })
      ).GetNotifications(variables);
    },
    async ApproveShareRequest(
      ...[variables]: TQueryArgs<"ApproveShareRequest">
    ): TQueryReturn<"ApproveShareRequest"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.ApproveShareRequestDocument,
          variables,
        })
      ).ApproveShareRequest(variables);
    },
    async RejectShareRequest(
      ...[variables]: TQueryArgs<"RejectShareRequest">
    ): TQueryReturn<"RejectShareRequest"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.RejectShareRequestDocument,
          variables,
        })
      ).RejectShareRequest(variables);
    },
    async PreshareLogin(
      ...[variables]: TQueryArgs<"PreshareLogin">
    ): TQueryReturn<"PreshareLogin"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.PreshareLoginDocument,
          variables,
        })
      ).PreshareLogin(variables);
    },
    async GetSocialGraph(
      ...[variables]: TQueryArgs<"GetSocialGraph">
    ): TQueryReturn<"GetSocialGraph"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.GetSocialGraphDocument,
          variables,
        })
      ).GetSocialGraph(variables);
    },
    async GetBetaOnboarding(
      ...[variables]: TQueryArgs<"GetBetaOnboarding">
    ): TQueryReturn<"GetBetaOnboarding"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.GetBetaOnboardingDocument,
          variables,
        })
      ).GetBetaOnboarding(variables);
    },
    async GetLoginKeys(
      ...[variables]: TQueryArgs<"GetLoginKeys">
    ): TQueryReturn<"GetLoginKeys"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.GetLoginKeysDocument,
          variables,
        })
      ).GetLoginKeys(variables);
    },
    async UpdateLogin(
      ...[variables]: TQueryArgs<"UpdateLogin">
    ): TQueryReturn<"UpdateLogin"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.UpdateLoginDocument,
          variables,
        })
      ).UpdateLogin(variables);
    },
    async FinishBetaOnboarding(
      ...[variables]: TQueryArgs<"FinishBetaOnboarding">
    ): TQueryReturn<"FinishBetaOnboarding"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.FinishBetaOnboardingDocument,
          variables,
        })
      ).FinishBetaOnboarding(variables);
    },
    async UpdateInvite(
      ...[variables]: TQueryArgs<"UpdateInvite">
    ): TQueryReturn<"UpdateInvite"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.UpdateInviteDocument,
          variables,
        })
      ).UpdateInvite(variables);
    },
    async DeleteLogin(
      ...[variables]: TQueryArgs<"DeleteLogin">
    ): TQueryReturn<"DeleteLogin"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.DeleteLoginDocument,
          variables,
        })
      ).DeleteLogin(variables);
    },
    async SignOut(): TQueryReturn<"SignOut"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.SignOutDocument,
          variables: [],
        })
      ).SignOut([]);
    },
    async UpdateAccount(
      ...[variables]: TQueryArgs<"UpdateAccount">
    ): TQueryReturn<"UpdateAccount"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.UpdateAccountDocument,
          variables,
        })
      ).UpdateAccount(variables);
    },
    async DeleteInvite(
      ...[variables]: TQueryArgs<"DeleteInvite">
    ): TQueryReturn<"DeleteInvite"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.DeleteInviteDocument,
          variables,
        })
      ).DeleteInvite(variables);
    },
    async RecordMagicLinkUsage(
      ...[variables]: TQueryArgs<"RecordMagicLinkUsage">
    ): TQueryReturn<"RecordMagicLinkUsage"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.RecordMagicLinkUsageDocument,
          variables,
        })
      ).RecordMagicLinkUsage(variables);
    },
    async UpdatePassword(
      ...[variables]: TQueryArgs<"UpdatePassword">
    ): TQueryReturn<"UpdatePassword"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.UpdatePasswordDocument,
          variables,
        })
      ).UpdatePassword(variables);
    },
    async GetFriendWithShareGraph(
      ...[variables]: TQueryArgs<"GetFriendWithShareGraph">
    ): TQueryReturn<"GetFriendWithShareGraph"> {
      return getSdk(
        await authenticatedClient({
          session,
          graphqlDoc: gql.GetFriendWithShareGraphDocument,
          variables,
        })
      ).GetFriendWithShareGraph(variables);
    },
  };
};

export type AuthenticatedApi = ReturnType<typeof hmacApi>;

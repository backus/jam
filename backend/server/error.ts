/**
 * AppError should be the instance of all errors on Jam that should
 * be considered properly handled and therefore not reported to a
 * bug tracker.
 */
export class AppError extends Error {}

export class AppReqError extends AppError {
  constructor(errorType: TReqErrorType) {
    super(errorType);
  }
}

type TReqErrorType =
  | "NotFound/Invite"
  | "NotFound/FriendRequest"
  | "NotFound/Login"
  | "NotFound/EmailVerification"
  | "Unauthorized"
  | "Unauthorized/EmailNotVerified"
  | "AuthenticationFailed"
  | "AuthenticationFailed/InvalidDigest";

export type RequestErrorFn = (errorType: TReqErrorType) => never;

export const requestError: RequestErrorFn = (message) => {
  throw new AppReqError(message);
};

export const AUTH_USER = "daniel";
export const AUTH_PASS = "xs52517";
export const AUTH_COOKIE = "blog_auth";
export const USER_COOKIE = "blog_user";

export function isAuthorizedCookie(
  authValue?: string,
  userValue?: string
) {
  return authValue === "1" && userValue === AUTH_USER;
}

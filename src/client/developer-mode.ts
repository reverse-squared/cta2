export function getLoginToken() {
  return localStorage.getItem('cta2_login');
}
export function setLoginToken(token: string) {
  return localStorage.setItem('cta2_login', token);
}
export function isDeveloperMode() {
  return !!localStorage.getItem('cta2_login');
}

export interface Env {
  bot: {
    token: string | null;
    votingChannel: string;
  };
  googleAnalyticsID: string | null;
}
const env: Env;
export default env;

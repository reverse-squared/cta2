export interface Env {
  bot: {
    token: string | null;
    homeGuild: string;
    votingChannel: string;
    archiveChannel: string;
    moderatorRoleId: string;
  };
  googleAnalyticsID: string | null;
}
const env: Env;
export default env;

declare module '../env.json' {
  interface Env {
    bot: {
      token: null | string;
      votingChannel: null | string;
    };
    googleAnalyticsID: null | string;
  }
  export default Env;
}

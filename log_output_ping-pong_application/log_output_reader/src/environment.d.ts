declare global {
  namespace NodeJS {
    interface ProcessEnv {
      //Port needs to be exposed during Docker build so basically needs to be pre-configured before the Kubernetes manifest configuration
      PORT?: number;
      MESSAGE: string;
      PING_PONG_APP_URL: string;
      PING_PONG_APP_PINGS_PATH: string;
      PING_PONG_APP_READY_PATH: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}

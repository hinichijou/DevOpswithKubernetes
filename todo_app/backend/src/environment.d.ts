declare global {
  namespace NodeJS {
    interface ProcessEnv {
      //Port needs to be exposed during Docker build so basically needs to be pre-configured before the Kubernetes manifest configuration
      PORT?: number;
      TODO_MIN_LENGTH: number;
      TODO_MAX_LENGTH: number;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}

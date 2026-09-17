declare global {
  namespace NodeJS {
    interface ProcessEnv {
      //Port needs to be exposed during Docker build so basically needs to be pre-configured before the Kubernetes manifest configuration
      PORT?: number
      URL: string
      FILE_DIR: string
      FILE_NAME: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the SubSense API, e.g. https://subsense-api.onrender.com/api */
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

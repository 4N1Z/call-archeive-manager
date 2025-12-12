/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATABASE_URL: string;
  readonly VITE_AWS_ACCESS_KEY_ID?: string;
  readonly VITE_AWS_SECRET_ACCESS_KEY?: string;
  readonly VITE_AWS_REGION?: string;
  readonly VITE_AWS_BUCKET_NAME?: string;
  readonly AWS_ACCESS_KEY_ID?: string;
  readonly AWS_SECRET_ACCESS_KEY?: string;
  readonly AWS_REGION?: string;
  readonly AWS_BUCKET_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

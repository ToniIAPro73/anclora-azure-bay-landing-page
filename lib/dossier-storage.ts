import * as os from "os";
import * as path from "path";

/**
 * Detects where to store PDFs depending on environment.
 * - Vercel/production: /tmp/dossiers
 * - Local: <home>/Documents/Dossiers_Personalizados_PlayaViva
 */
export const getLocalDossierDir = () => {
  const isVercel = Boolean(process.env.VERCEL);
  const isProduction = process.env.NODE_ENV === "production";

  if (isVercel || isProduction) {
    return "/tmp/dossiers";
  }

  const documentsDir = path.join(os.homedir(), "Documents");
  return path.join(documentsDir, "Dossiers_Personalizados_PlayaViva");
};

export type ResolvedS3Config = {
  endpoint?: string;
  bucket?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
};

export type S3Region = {
  endpoint: string;
  region: string;
  name: string;
};

export const normalizeBucketName = (value?: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim().replace(/(^\/+|\/+$)/g, "");
  if (!trimmed) return undefined;
  return trimmed
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/gi, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
};

export const splitEndpoint = (rawEndpoint?: string, bucket?: string) => {
  if (!rawEndpoint) {
    return { endpoint: undefined, bucket };
  }

  try {
    const url = new URL(rawEndpoint);
    // Path-style endpoint e.g. https://s3.example.com/my-bucket
    if (!bucket) {
      const pathBucket =
        url.pathname && url.pathname !== "/"
          ? url.pathname.replace(/^\/+/, "").split("/")[0]
          : undefined;

      if (pathBucket) {
        return {
          endpoint: `${url.protocol}//${url.host}`,
          bucket: pathBucket,
        };
      }
    }

    if (!bucket) {
      const hostParts = url.hostname.split(".");
      if (hostParts.length > 3) {
        const [maybeBucket, ...rest] = hostParts;
        return {
          endpoint: `${url.protocol}//${rest.join(".")}${
            url.port ? `:${url.port}` : ""
          }`,
          bucket: maybeBucket,
        };
      }
    }

    return {
      endpoint: rawEndpoint,
      bucket,
    };
  } catch {
    return {
      endpoint: rawEndpoint,
      bucket,
    };
  }
};

const isTruthyEnv = (value?: string | null) => {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
};

export const resolveS3Config = (): ResolvedS3Config => {
  const rawEndpoint =
    process.env.S3_Endpoint ??
    process.env.S3_ENDPOINT ??
    process.env.S3_ENDPOINT_URL ??
    process.env.AWS_S3_ENDPOINT;
  const rawBucket = normalizeBucketName(
    process.env.S3_BUCKET_NAME ?? process.env.S3_BUCKET ?? null,
  );
  const region =
    process.env.S3_Region_Code ??
    process.env.S3_REGION_CODE ??
    process.env.AWS_REGION ??
    process.env.AWS_DEFAULT_REGION;
  const accessKeyId =
    process.env.S3_Access_Key_ID ??
    process.env.S3_ACCESS_KEY_ID ??
    process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey =
    process.env.S3_Secret_Access_Key ??
    process.env.S3_SECRET_ACCESS_KEY ??
    process.env.AWS_SECRET_ACCESS_KEY;

  const { endpoint, bucket } = splitEndpoint(rawEndpoint, rawBucket);

  return {
    endpoint,
    bucket,
    region,
    accessKeyId,
    secretAccessKey,
  };
};

export const isS3Enabled = (
  config: ResolvedS3Config = resolveS3Config(),
): boolean => {
  if (!config) return false;
  return Boolean(
    config.endpoint &&
      config.bucket &&
      config.accessKeyId &&
      config.secretAccessKey,
  );
};

export const shouldUseS3Storage = (
  config: ResolvedS3Config = resolveS3Config(),
) => {
  if (!config) {
    return false;
  }

  if (isTruthyEnv(process.env.DISABLE_S3_STORAGE)) {
    return false;
  }

  if (isTruthyEnv(process.env.FORCE_S3_STORAGE)) {
    return true;
  }

  if (!isS3Enabled(config)) {
    return false;
  }

  return Boolean(process.env.VERCEL);
};

export const getS3Regions = (): S3Region[] => {
  const config = resolveS3Config();

  if (!config.endpoint) {
    return [];
  }

  return [
    {
      endpoint: config.endpoint,
      region: config.region ?? "auto",
      name: "Primary S3",
    },
  ];
};

export const getS3RegionsFallback = (): S3Region[] => {
  return [
    {
      endpoint: "s3.eu-west-4.idrivee2.com",
      region: "eu-west-4",
      name: "Frankfurt",
    },
    {
      endpoint: "s3.eu-central-2.idrivee2.com",
      region: "eu-central-2",
      name: "Paris",
    },
  ];
};

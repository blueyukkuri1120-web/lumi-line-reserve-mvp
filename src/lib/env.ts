function getTrimmedEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    return "";
  }

  return value.trim();
}

export function getRequiredEnv(name: string) {
  const value = getTrimmedEnv(name);

  if (!value) {
    throw new Error(`Environment variable ${name} is required.`);
  }

  return value;
}

export function getOptionalEnv(name: string) {
  const value = getTrimmedEnv(name);
  return value || undefined;
}

export function getAppUrl() {
  return getOptionalEnv("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000";
}

export function getAppTimeZone() {
  return getOptionalEnv("APP_TIMEZONE") ?? "Asia/Tokyo";
}

export function hasLineMessagingConfig() {
  return Boolean(getOptionalEnv("LINE_CHANNEL_SECRET") && getOptionalEnv("LINE_CHANNEL_ACCESS_TOKEN"));
}

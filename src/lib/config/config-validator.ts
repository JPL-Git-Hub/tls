export const validateServiceConfig = <T extends Record<string, string | undefined>>(
  serviceName: string,
  config: T
): T => {
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`${serviceName} configuration failed. Missing: ${missing.join(', ')}`);
  }

  return config;
};
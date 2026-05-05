/**
 * Runtime application config — loaded from /config.json at startup.
 *
 * This allows changing the backend URL after build without rebuilding.
 * For multi-country deployment: just edit config.json in the release folder.
 */

interface AppConfig {
  backendUrl: string;
}

let _config: AppConfig | null = null;

/**
 * Load config.json from the server root (runs once, result is cached).
 * Must be called before the React tree mounts.
 */
export async function loadAppConfig(): Promise<AppConfig> {
  if (_config) return _config;

  try {
    const resp = await fetch('/config.json', { cache: 'no-store' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    _config = (await resp.json()) as AppConfig;
  } catch (err) {
    // Fallback: use the build-time env variable if config.json is missing
    console.warn('[appConfig] config.json not found, falling back to VITE_APP_API_URL', err);
    _config = {
      backendUrl: import.meta.env.VITE_APP_API_URL as string ?? '',
    };
  }

  return _config;
}

/**
 * Get the cached config synchronously.
 * Throws if called before loadAppConfig() resolves.
 */
export function getAppConfig(): AppConfig {
  if (!_config) {
    throw new Error('[appConfig] Config not loaded yet. Call loadAppConfig() first.');
  }
  return _config;
}

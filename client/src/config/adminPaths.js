const normalizePath = (value, fallback) => {
  const raw = (value || fallback || '').trim()
  if (!raw) return fallback
  return raw.startsWith('/') ? raw : `/${raw}`
}

// Keep default paths non-obvious; override via client/.env for your own private routes.
export const DEFAULT_ADMIN_LOGIN_PATH = '/secure-portal-auth-9x7k-admin'
export const DEFAULT_ADMIN_DASHBOARD_PATH = '/secure-portal-control-9x7k'

export const ADMIN_LOGIN_PATH = normalizePath(
  import.meta.env.VITE_ADMIN_LOGIN_PATH,
  DEFAULT_ADMIN_LOGIN_PATH
)

export const ADMIN_DASHBOARD_PATH = normalizePath(
  import.meta.env.VITE_ADMIN_DASHBOARD_PATH,
  DEFAULT_ADMIN_DASHBOARD_PATH
)

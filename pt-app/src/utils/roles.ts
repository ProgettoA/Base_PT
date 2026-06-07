// Helper per i ruoli. Mantiene tutti i controlli in un solo posto.

export type AppRole =
  | 'client'
  | 'admin'           // legacy, gestito come superadmin
  | 'admin_pt'
  | 'admin_osteopath'
  | 'superadmin'

export type AdminScope = {
  isAnyAdmin: boolean
  isSuperadmin: boolean
  canManagePt: boolean
  canManageOsteo: boolean
}

export function adminScope(role?: string | null): AdminScope {
  const r = role ?? ''
  const isSuperadmin = r === 'superadmin' || r === 'admin'
  const canManagePt = isSuperadmin || r === 'admin_pt'
  const canManageOsteo = isSuperadmin || r === 'admin_osteopath'
  const isAnyAdmin = canManagePt || canManageOsteo
  return { isAnyAdmin, isSuperadmin, canManagePt, canManageOsteo }
}

export type Service = 'pt' | 'osteopath'

export const serviceLabel = (s: Service): string =>
  s === 'pt' ? 'Personal Trainer' : 'Osteopata'

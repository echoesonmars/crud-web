import { Prisma } from "@prisma/client"
import { SECTORS, isSector, isIncidentStatus, DISTRICTS, type Sector } from "./sectors"
import { sectorsForRole } from "./roles"
import type { SessionPayload } from "./session"

// Какие сектора доступны пользователю с учётом роли и фильтра ?sector=
export function allowedSectors(session: SessionPayload | null, requested?: string | null): Sector[] {
  const byRole = sectorsForRole(session?.role)
  const list = requested
    ? requested.split(",").filter(isSector).filter((s) => byRole.includes(s))
    : [...byRole]
  return list
}

export function seesAllSectors(session: SessionPayload | null): boolean {
  return sectorsForRole(session?.role).length === SECTORS.length
}

// Общий фильтр инцидентов по параметрам запроса
export function incidentWhere(session: SessionPayload | null, sp: URLSearchParams): Prisma.AlarmEventWhereInput {
  const and: Prisma.AlarmEventWhereInput[] = []

  const sectorParam = sp.get("sector")
  const sectors = allowedSectors(session, sectorParam && sectorParam !== "all" ? sectorParam : null)
  const facilityFilter: Prisma.FacilityWhereInput = { sector: { in: sectors } }

  const district = sp.get("district")
  if (district && (DISTRICTS as readonly string[]).includes(district)) facilityFilter.district = district

  const facilityId = sp.get("facilityId")
  if (facilityId) and.push({ facilityId })

  // События без объекта (старый импорт) видны только ролям с полным доступом и без фильтра по сектору/району
  const narrowed = (sectorParam && sectorParam !== "all") || district
  if (seesAllSectors(session) && !narrowed) {
    and.push({ OR: [{ facility: facilityFilter }, { facilityId: null }] })
  } else {
    and.push({ facility: facilityFilter })
  }

  const status = sp.get("status")
  if (status === "open") and.push({ status: { in: ["NEW", "IN_REVIEW", "FORWARDED"] } })
  else if (status && status !== "all") {
    const list = status.split(",").filter(isIncidentStatus)
    if (list.length) and.push({ status: { in: list } })
  }

  const severity = sp.get("severity")
  if (severity && severity !== "all") and.push({ severity: { in: severity.split(",") } })

  const type = sp.get("type")
  if (type && type !== "all") and.push({ type })

  const query = sp.get("query")
  if (query) {
    and.push({
      OR: [
        { cameraName: { contains: query, mode: "insensitive" } },
        { details: { contains: query, mode: "insensitive" } },
        { facility: { name: { contains: query, mode: "insensitive" } } },
        { facility: { address: { contains: query, mode: "insensitive" } } },
      ],
    })
  }

  // Период: from/to (ISO) или date (один день) или days (последние N суток)
  const ts: Prisma.DateTimeFilter = {}
  const from = sp.get("from")
  const to = sp.get("to")
  const date = sp.get("date")
  const days = Number(sp.get("days"))
  if (from && !isNaN(Date.parse(from))) ts.gte = new Date(from)
  if (to && !isNaN(Date.parse(to))) ts.lte = new Date(to)
  if (date && !isNaN(Date.parse(date))) {
    // Сутки по времени Алматы (UTC+5). date — «2026-11-20» или ISO-момент (из календаря)
    const TZ_MS = 5 * 3600_000
    const day = /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? date
      : new Date(new Date(date).getTime() + TZ_MS).toISOString().slice(0, 10)
    const start = new Date(`${day}T00:00:00+05:00`)
    ts.gte = start
    ts.lte = new Date(start.getTime() + 86400_000 - 1)
  }
  if (!ts.gte && days > 0) ts.gte = new Date(Date.now() - days * 86400_000)
  if (ts.gte || ts.lte) and.push({ timestamp: ts })

  return { AND: and }
}

import * as fs from "fs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const initialCities = [
  { name: "Астана", latitude: 51.1694, longitude: 71.4491, status: "stable", connections: 8, latency: 15, loadPercent: 45 },
  { name: "Алматы", latitude: 43.2220, longitude: 76.8512, status: "stable", connections: 12, latency: 18, loadPercent: 52 },
  { name: "Шымкент", latitude: 42.3417, longitude: 69.5901, status: "stable", connections: 16, latency: 21, loadPercent: 60 },
  { name: "Караганда", latitude: 49.8019, longitude: 73.1021, status: "stable", connections: 20, latency: 24, loadPercent: 47 },
  { name: "Актобе", latitude: 50.2839, longitude: 57.1670, status: "stable", connections: 24, latency: 27, loadPercent: 55 },
  { name: "Павлодар", latitude: 52.2833, longitude: 76.9667, status: "stable", connections: 28, latency: 30, loadPercent: 62 },
  { name: "Атырау", latitude: 47.1167, longitude: 51.8833, status: "stable", connections: 32, latency: 33, loadPercent: 49 },
  { name: "Усть-Каменогорск", latitude: 49.9483, longitude: 82.6278, status: "stable", connections: 36, latency: 36, loadPercent: 58 }
]

const SITUATIONS = [
  "Бегущий человек",
  "Вандализм",
  "Вебхук",
  "Видеосигнал ослеплён",
  "Видеосигнал потерян",
  "Вход в зону",
  "Выход из зоны",
  "Газовый баллон",
  "Длительное нахождение в зоне",
  "Драка",
  "ДТП",
  "Дым",
  "Забранный предмет",
  "Запись архива",
  "Запись архива начата",
  "Запись архива остановлена",
  "Зафиксировано движение",
  "Зафиксировано окончание движения",
  "Избыточное количество людей",
  "Курение",
  "Лежащий человек",
  "Нарушение дистанции",
  "Нарушение ношения СИЗ",
  "Нарушение ношения СИЗ на голове",
  "Нарушение ношения СИЗ на ногах",
  "Нарушение ношения СИЗ на плечах",
  "Нарушение ношения СИЗ на руках",
  "Нарушение ношения СИЗ на теле",
  "Нарушитель",
  "Недостаточное количество людей",
  "Неклассифицированное нарушение",
  "Неклассифицированное событие",
  "Нет передвижения источника",
  "Огонь",
  "Оружие",
  "Оставленный предмет",
  "Пересечение линии",
  "Переход в неположенном месте",
  "Переход на красный",
  "Подключён внешний микрофон",
  "Предмет",
  "Разговор по телефону",
  "Распознанное лицо известно",
  "Распознанное лицо неизвестно",
  "Сидящий человек",
  "Скопление транспортных средств",
  "Снимок во время движения",
  "Упавший человек",
  "Хулиганство",
  "Человек"
]

interface JSONCameraItem {
  id: string
  index: number
  uniqueChannel: number
  isEnabled: boolean
  address: string
  name: string
  deviceType?: string
  serialNo?: string
  equipmentId?: string
  organizationName?: string
}

async function main() {
  console.log("Seeding map points...")
  for (const city of initialCities) {
    await prisma.mapPoint.upsert({
      where: { name: city.name },
      update: {},
      create: city,
    })
  }

  console.log("Seeding default user...")
  await prisma.user.upsert({
    where: { email: "admin@edtech.kz" },
    update: {},
    create: {
      email: "admin@edtech.kz",
      password: "admin123", // Simple mockup credentials
      name: "Администратор"
    }
  })

  console.log("Deleting old event, screen, and camera data to refresh from JSON...")
  await prisma.alarmEvent.deleteMany()
  await prisma.screen.deleteMany()
  await prisma.camera.deleteMany()

  console.log("Reading cameras from cameras.json...")
  const jsonPath = "D:\\edtech\\qoz-vision-demo\\cameras.json"
  const rawData = fs.readFileSync(jsonPath, "utf8")
  const jsonCameras: JSONCameraItem[] = JSON.parse(rawData)

  const DEFAULT_HLS_BASE = "https://v-guard.kz/hls"
  const NVRLIKE_DEVICE = /^(DS-N316|XVR)/i

  function buildCameraHlsPath(camera: JSONCameraItem): { pathId: string; sub: number } {
    if (NVRLIKE_DEVICE.test(camera.deviceType ?? "")) {
      return { pathId: camera.equipmentId ?? "", sub: camera.uniqueChannel }
    }
    return { pathId: camera.id, sub: 1 }
  }

  function buildCameraHlsUrl(camera: JSONCameraItem): string {
    const { pathId, sub } = buildCameraHlsPath(camera)
    return `${DEFAULT_HLS_BASE}/camera_${pathId}_sub_${sub}/video1_stream.m3u8`
  }

  console.log(`Seeding ${jsonCameras.length} cameras from JSON...`)
  for (let i = 0; i < jsonCameras.length; i++) {
    const item = jsonCameras[i]
    const uniqueName = `${item.name} (${item.address} #${item.uniqueChannel})`
    const info = `${item.deviceType || "Unknown Device"} | ${item.organizationName || "Unknown Org"}`
    const streamUrl = buildCameraHlsUrl(item)

    await prisma.camera.create({
      data: {
        name: uniqueName,
        info,
        streamUrl
      }
    })
  }

  console.log("Seeding alarm events...")
  // Clean existing alarm events to prevent infinite growth
  await prisma.alarmEvent.deleteMany()

  const camerasList = await prisma.camera.findMany()
  const now = new Date()

  const alarmEventsData = []
  // Generate 150 events (approx 3 per situation)
  for (let i = 0; i < 150; i++) {
    const situation = SITUATIONS[i % SITUATIONS.length]
    const camera = camerasList[i % camerasList.length]
    
    // Distribute timestamps over the last 7 days
    const timestamp = new Date(now.getTime() - (Math.random() * 7 * 24 * 60 * 60 * 1000))
    
    alarmEventsData.push({
      type: situation,
      cameraName: camera.name,
      timestamp,
      details: `Зафиксировано событие: "${situation}" на источнике "${camera.name}" (${camera.info}).`
    })
  }

  await prisma.alarmEvent.createMany({
    data: alarmEventsData
  })

  console.log("Seeding finished successfully.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

"use client"

import React, { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { SearchInput } from "@/components/shared/search-input"
import { StreamViewer } from "@/components/shared/stream-viewer"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LayoutGrid, Plus, Monitor, Eye, Play, ChevronLeft, ChevronRight, Check } from "lucide-react"

interface Camera {
  id: string
  name: string
  info: string
  streamUrl: string
}

interface Screen {
  id: string
  name: string
  cameras: Camera[]
  createdAt: string
  updatedAt: string
}

export default function ScreensPage() {
  const [screens, setScreens] = useState<Screen[]>([])
  const [cameras, setCameras] = useState<Camera[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  // Creation dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newScreenName, setNewScreenName] = useState("")
  const [selectedCameraIds, setSelectedCameraIds] = useState<string[]>([])
  const [cameraSearchText, setCameraSearchText] = useState("")
  const [previewCamera, setPreviewCamera] = useState<Camera | null>(null)
  const [createError, setCreateError] = useState("")

  // Screen viewing state
  const [activeWatchScreen, setActiveWatchScreen] = useState<Screen | null>(null)
  
  // Carousel states for maximized camera preview inside a screen view
  const [carouselIndex, setCarouselIndex] = useState<number | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const screensRes = await fetch("/api/screens")
      const camerasRes = await fetch("/api/cameras")
      
      if (!screensRes.ok || !camerasRes.ok) throw new Error("Ошибка загрузки данных")
      
      const screensData = await screensRes.json()
      const camerasData = await camerasRes.json()
      
      setScreens(screensData)
      setCameras(camerasData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateScreen = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError("")

    if (!newScreenName) {
      setCreateError("Укажите название экрана")
      return
    }

    if (selectedCameraIds.length === 0) {
      setCreateError("Выберите как минимум одну камеру")
      return
    }

    try {
      const res = await fetch("/api/screens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newScreenName,
          cameraIds: selectedCameraIds,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Ошибка при сохранении экрана")
      }

      setNewScreenName("")
      setSelectedCameraIds([])
      setCreateDialogOpen(false)
      fetchData()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось сохранить экран"
      setCreateError(message)
    }
  }

  const toggleCameraSelection = (id: string) => {
    if (selectedCameraIds.includes(id)) {
      setSelectedCameraIds(selectedCameraIds.filter((camId) => camId !== id))
    } else {
      setSelectedCameraIds([...selectedCameraIds, id])
    }
  }

  const filteredScreens = screens.filter((scr) =>
    scr.name.toLowerCase().includes(search.toLowerCase())
  )

  const filteredCameraChecklist = cameras.filter((cam) =>
    cam.name.toLowerCase().includes(cameraSearchText.toLowerCase()) ||
    cam.info.toLowerCase().includes(cameraSearchText.toLowerCase())
  )

  // Carousel controls
  const handlePrevCamera = () => {
    if (!activeWatchScreen || carouselIndex === null) return
    const len = activeWatchScreen.cameras.length
    setCarouselIndex((carouselIndex - 1 + len) % len)
  }

  const handleNextCamera = () => {
    if (!activeWatchScreen || carouselIndex === null) return
    const len = activeWatchScreen.cameras.length
    setCarouselIndex((carouselIndex + 1) % len)
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Экраны", active: true },
      ]}
    >
      <div className="p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Мультиэкраны</h1>
            <p className="text-sm text-muted-foreground">
              Создание виртуальных мониторов и объединение нескольких видеоисточников на одной сетке
            </p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger
              render={
                <Button className="bg-primary hover:bg-primary/95 text-primary-foreground font-medium px-4 h-9 cursor-pointer flex items-center gap-1.5 shadow-md shadow-primary/10">
                  <Plus className="size-4" />
                  Создать монитор
                </Button>
              }
            />
            <DialogContent className="bg-card border border-border text-foreground rounded-2xl max-w-3xl p-6">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-foreground">Новая сетка мониторов</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateScreen} className="flex flex-col gap-4 mt-2">
                {createError && (
                  <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg">
                    {createError}
                  </div>
                )}
                
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Название мультиэкрана
                  </label>
                  <Input
                    placeholder="Например, Монитор КПП и Юг"
                    value={newScreenName}
                    onChange={(e) => setNewScreenName(e.target.value)}
                    required
                    className="bg-secondary/20 border-border text-foreground"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Выберите камеры
                    </label>
                    <span className="text-[11px] text-muted-foreground">Выбрано: {selectedCameraIds.length}</span>
                  </div>
                  <SearchInput
                    value={cameraSearchText}
                    onChange={setCameraSearchText}
                    placeholder="Быстрый фильтр камер..."
                  />
                  <div className="max-h-[350px] overflow-y-auto border border-border rounded-lg bg-secondary/10 p-2 flex flex-col gap-1">
                    {filteredCameraChecklist.map((cam) => {
                      const isChecked = selectedCameraIds.includes(cam.id)
                      return (
                        <div
                          key={cam.id}
                          onClick={() => toggleCameraSelection(cam.id)}
                          className={`flex items-center justify-between p-2 rounded-md hover:bg-secondary/40 cursor-pointer transition-colors ${
                            isChecked ? "bg-primary/5 border border-primary/20" : "border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`size-4 rounded flex items-center justify-center border transition-all ${
                              isChecked ? "bg-primary border-primary text-primary-foreground" : "border-border"
                            }`}>
                              {isChecked && <Check className="size-3 stroke-[3]" />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-foreground">{cam.name}</span>
                              <span className="text-[10px] text-muted-foreground">{cam.info}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setPreviewCamera(cam)
                            }}
                            className="p-1 hover:bg-secondary/60 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Посмотреть камеру"
                          >
                            <Eye className="size-3.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/40 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    className="border-border text-foreground cursor-pointer"
                  >
                    Отмена
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/95 text-primary-foreground cursor-pointer">
                    Создать экран
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search filter for screens list */}
        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Поиск по названию мультиэкрана..."
            className="max-w-md"
          />
        </div>

        {/* Screens Table */}
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Загрузка экранов...</div>
        ) : filteredScreens.length === 0 ? (
          <div className="p-16 border border-border bg-card rounded-2xl text-center flex flex-col items-center gap-3">
            <Monitor className="size-10 text-muted-foreground" />
            <div className="text-base font-semibold text-foreground">Экраны не найдены</div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Нет созданных мультиэкранов. Выберите «Создать монитор» для объединения камер.
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-secondary/25 border-b border-border">
                <TableRow className="hover:bg-transparent border-b border-border/80">
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Имя мультиэкрана</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Камеры</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Дата создания</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Дата изменения</TableHead>
                  <TableHead className="w-[150px] text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScreens.map((scr) => (
                  <TableRow key={scr.id} className="hover:bg-secondary/15 border-b border-border/40">
                    <TableCell className="font-semibold text-foreground text-xs">{scr.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {scr.cameras.map((c) => c.name).join(", ") || "Нет камер"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(scr.createdAt).toLocaleDateString("ru-RU")}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(scr.updatedAt).toLocaleDateString("ru-RU")}
                    </TableCell>
                    <TableCell className="text-right h-[52px]">
                      <Button
                        size="sm"
                        onClick={() => setActiveWatchScreen(scr)}
                        className="h-8 bg-primary hover:bg-primary/95 text-primary-foreground gap-1 text-xs cursor-pointer"
                      >
                        <Play className="size-3.5 fill-current" />
                        Посмотреть
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Dialog for checklist camera preview */}
        <Dialog open={previewCamera !== null} onOpenChange={(open) => !open && setPreviewCamera(null)}>
          <DialogContent className="bg-card border border-border text-foreground rounded-2xl max-w-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">
                Предпросмотр: {previewCamera?.name}
              </DialogTitle>
            </DialogHeader>
            {previewCamera && (
              <div className="mt-2">
                <StreamViewer streamUrl={previewCamera.streamUrl} cameraName={previewCamera.name} />
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog/Panel for Watching a Multi-Screen */}
        <Dialog open={activeWatchScreen !== null} onOpenChange={(open) => !open && setActiveWatchScreen(null)}>
          <DialogContent className="bg-card border border-border text-foreground rounded-2xl max-w-[95vw] w-[1200px] max-h-[90vh] p-6 overflow-y-auto">
            <DialogHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3 mb-4">
              <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <LayoutGrid className="size-5 text-primary" />
                Сетка мониторов: {activeWatchScreen?.name}
              </DialogTitle>
            </DialogHeader>
            
            {activeWatchScreen && (
              <div className="flex flex-col gap-6">
                {/* Cameras Grid */}
                <div className={`grid gap-4 ${
                  activeWatchScreen.cameras.length <= 1 ? "grid-cols-1" :
                  activeWatchScreen.cameras.length <= 2 ? "grid-cols-1 md:grid-cols-2" :
                  activeWatchScreen.cameras.length <= 4 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"
                }`}>
                  {activeWatchScreen.cameras.map((cam, idx) => (
                    <div
                      key={cam.id}
                      onClick={() => setCarouselIndex(idx)}
                      className="cursor-pointer border border-transparent hover:border-primary/40 rounded-xl overflow-hidden transition-all shadow-md group relative"
                    >
                      <StreamViewer streamUrl={cam.streamUrl} cameraName={cam.name} />
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200" />
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Нажмите на любую трансляцию в сетке, чтобы открыть ее на весь экран и листать каруселью.
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog for Maximized Camera Carousel view */}
        <Dialog open={carouselIndex !== null} onOpenChange={(open) => !open && setCarouselIndex(null)}>
          <DialogContent className="bg-card border border-border text-foreground rounded-2xl max-w-4xl p-6 flex flex-col justify-between max-h-[90vh]">
            <DialogHeader className="flex flex-row items-center justify-between pb-2">
              <DialogTitle className="text-base font-bold text-foreground">
                Детальный просмотр: {activeWatchScreen && carouselIndex !== null && activeWatchScreen.cameras[carouselIndex]?.name}
              </DialogTitle>
            </DialogHeader>

            {activeWatchScreen && carouselIndex !== null && (
              <div className="relative flex flex-col gap-4 mt-2 flex-1 justify-center">
                {/* Carousel Viewer */}
                <div className="flex items-center justify-between gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevCamera}
                    className="size-10 rounded-full border border-border bg-card/65 text-foreground hover:bg-secondary/40 cursor-pointer"
                  >
                    <ChevronLeft className="size-6" />
                  </Button>

                  <div className="flex-1 aspect-video rounded-xl overflow-hidden border border-border/80 bg-zinc-950">
                    <StreamViewer
                      streamUrl={activeWatchScreen.cameras[carouselIndex].streamUrl}
                      cameraName={activeWatchScreen.cameras[carouselIndex].name}
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextCamera}
                    className="size-10 rounded-full border border-border bg-card/65 text-foreground hover:bg-secondary/40 cursor-pointer"
                  >
                    <ChevronRight className="size-6" />
                  </Button>
                </div>

                <div className="text-center text-xs text-muted-foreground mt-2">
                  Камера {carouselIndex + 1} из {activeWatchScreen.cameras.length} — {activeWatchScreen.cameras[carouselIndex].info}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

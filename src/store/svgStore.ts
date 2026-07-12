import { create } from 'zustand'
import {
  addSvgElement,
  defaultSvgCode,
  moveSvgElementByDelta,
  parseAndNormalizeSvg,
  removeSvgElement,
  updateSvgElement,
} from '../lib/svgDocument'
import type { SvgElementSnapshot, SvgPoint, SvgTool } from '../types/svg'

type SvgStore = {
  svgCode: string
  previewSvgCode: string
  elements: SvgElementSnapshot[]
  selectedElementId: string | null
  tool: SvgTool
  parseError: string | null
  setSvgCode: (code: string) => void
  setTool: (tool: SvgTool) => void
  selectElement: (elementId: string | null) => void
  updateSelectedElement: (attributes: Record<string, string>, textContent?: string) => void
  addElementAt: (tool: Exclude<SvgTool, 'select'>, point: SvgPoint) => void
  deleteSelectedElement: () => void
  moveSelectedElementByDelta: (dx: number, dy: number) => void
  resetDocument: () => void
}

const initialDocument = parseAndNormalizeSvg(defaultSvgCode)

if (!initialDocument.ok) {
  throw new Error(initialDocument.error)
}

export const useSvgStore = create<SvgStore>((set, get) => ({
  svgCode: initialDocument.code,
  previewSvgCode: initialDocument.code,
  elements: initialDocument.elements,
  selectedElementId: initialDocument.elements[0]?.id ?? null,
  tool: 'select',
  parseError: null,
  setSvgCode: (code) => {
    const parsed = parseAndNormalizeSvg(code)
    const currentSelection = get().selectedElementId

    if (!parsed.ok) {
      set({ svgCode: code, parseError: parsed.error })
      return
    }

    const selectionStillExists = parsed.elements.some((element) => element.id === currentSelection)

    set({
      svgCode: code,
      previewSvgCode: parsed.code,
      elements: parsed.elements,
      parseError: null,
      selectedElementId: selectionStillExists ? currentSelection : parsed.elements[0]?.id ?? null,
    })
  },
  setTool: (tool) => set({ tool }),
  selectElement: (elementId) => set({ selectedElementId: elementId, tool: 'select' }),
  updateSelectedElement: (attributes, textContent) => {
    const selectedElementId = get().selectedElementId

    if (!selectedElementId) {
      return
    }

    const parsed = updateSvgElement(get().previewSvgCode, selectedElementId, attributes, textContent)

    if (!parsed.ok) {
      set({ parseError: parsed.error })
      return
    }

    set({
      svgCode: parsed.code,
      previewSvgCode: parsed.code,
      elements: parsed.elements,
      parseError: null,
      selectedElementId,
    })
  },
  addElementAt: (tool, point) => {
    const parsed = addSvgElement(get().previewSvgCode, tool, point)

    if (!parsed.ok) {
      set({ parseError: parsed.error })
      return
    }

    const createdElement = parsed.elements[parsed.elements.length - 1]

    set({
      svgCode: parsed.code,
      previewSvgCode: parsed.code,
      elements: parsed.elements,
      parseError: null,
      selectedElementId: createdElement?.id ?? null,
      tool: 'select',
    })
  },
  deleteSelectedElement: () => {
    const selectedElementId = get().selectedElementId

    if (!selectedElementId) {
      return
    }

    const parsed = removeSvgElement(get().previewSvgCode, selectedElementId)

    if (!parsed.ok) {
      set({ parseError: parsed.error })
      return
    }

    set({
      svgCode: parsed.code,
      previewSvgCode: parsed.code,
      elements: parsed.elements,
      parseError: null,
      selectedElementId: parsed.elements[0]?.id ?? null,
    })
  },
  moveSelectedElementByDelta: (dx, dy) => {
    const selectedElementId = get().selectedElementId

    if (!selectedElementId || (dx === 0 && dy === 0)) {
      return
    }

    const parsed = moveSvgElementByDelta(get().previewSvgCode, selectedElementId, dx, dy)

    if (!parsed.ok) {
      set({ parseError: parsed.error })
      return
    }

    set({
      svgCode: parsed.code,
      previewSvgCode: parsed.code,
      elements: parsed.elements,
      parseError: null,
      selectedElementId,
    })
  },
  resetDocument: () => {
    set({
      svgCode: initialDocument.code,
      previewSvgCode: initialDocument.code,
      elements: initialDocument.elements,
      selectedElementId: initialDocument.elements[0]?.id ?? null,
      tool: 'select',
      parseError: null,
    })
  },
}))

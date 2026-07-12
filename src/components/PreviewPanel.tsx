import { Circle, MousePointer2, Minus, Square, Type } from 'lucide-react'
import { useMemo, useRef } from 'react'
import ElementInspector from './ElementInspector'
import { useSvgStore } from '../store/svgStore'
import type { SvgPoint, SvgTool } from '../types/svg'
import type { PointerEvent } from 'react'

const toolButtons: Array<{ tool: SvgTool; label: string; icon: typeof MousePointer2 }> = [
  { tool: 'select', label: 'Select', icon: MousePointer2 },
  { tool: 'rect', label: 'Rectangle', icon: Square },
  { tool: 'circle', label: 'Circle', icon: Circle },
  { tool: 'ellipse', label: 'Ellipse', icon: Circle },
  { tool: 'line', label: 'Line', icon: Minus },
  { tool: 'text', label: 'Text', icon: Type },
]

const PreviewPanel = () => {
  const previewSvgCode = useSvgStore((state) => state.previewSvgCode)
  const selectedElementId = useSvgStore((state) => state.selectedElementId)
  const tool = useSvgStore((state) => state.tool)
  const setTool = useSvgStore((state) => state.setTool)
  const selectElement = useSvgStore((state) => state.selectElement)
  const addElementAt = useSvgStore((state) => state.addElementAt)
  const moveSelectedElementByDelta = useSvgStore((state) => state.moveSelectedElementByDelta)
  const dragPointRef = useRef<SvgPoint | null>(null)
  const decoratedSvg = useMemo(
    () => decorateSelectedElement(previewSvgCode, selectedElementId),
    [previewSvgCode, selectedElementId],
  )

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const svg = getNearestSvg(event.target)

    if (!svg) {
      return
    }

    const point = getSvgPoint(event, svg)

    if (tool !== 'select') {
      addElementAt(tool, point)
      return
    }

    const editableElement = getEditableElement(event.target, svg)

    selectElement(editableElement?.id || null)
    dragPointRef.current = editableElement?.id ? point : null

    if (editableElement?.id) {
      event.currentTarget.setPointerCapture(event.pointerId)
    }
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const lastPoint = dragPointRef.current
    const svg = getNearestSvg(event.target)

    if (!lastPoint || !svg) {
      return
    }

    const nextPoint = getSvgPoint(event, svg)
    moveSelectedElementByDelta(nextPoint.x - lastPoint.x, nextPoint.y - lastPoint.y)
    dragPointRef.current = nextPoint
  }

  const stopDrag = () => {
    dragPointRef.current = null
  }

  return (
    <section className="panel preview-panel" aria-label="SVG visual editor">
      <header className="panel-header">
        <div>
          <p className="panel-kicker">Preview</p>
          <h2>Visual Editor</h2>
        </div>
        <div className="toolbar" role="toolbar" aria-label="SVG tools">
          {toolButtons.map(({ tool: toolName, label, icon: Icon }) => (
            <button
              className={tool === toolName ? 'tool-button active' : 'tool-button'}
              type="button"
              key={toolName}
              onClick={() => setTool(toolName)}
              title={label}
              aria-label={label}
            >
              <Icon size={16} aria-hidden="true" />
            </button>
          ))}
        </div>
      </header>

      <div className="preview-workspace">
        <div
          className={tool === 'select' ? 'svg-canvas-stage can-select' : 'svg-canvas-stage can-create'}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          dangerouslySetInnerHTML={{ __html: decoratedSvg }}
        />
        <ElementInspector />
      </div>
    </section>
  )
}

function decorateSelectedElement(svgCode: string, selectedElementId: string | null) {
  if (!selectedElementId) {
    return svgCode
  }

  const document = new DOMParser().parseFromString(svgCode, 'image/svg+xml')
  const selectedElement = document.getElementById(selectedElementId)

  selectedElement?.setAttribute('data-selected', 'true')
  return new XMLSerializer().serializeToString(document.documentElement)
}

function getNearestSvg(target: EventTarget | null) {
  return target instanceof Element ? target.closest('svg') : null
}

function getEditableElement(target: EventTarget | null, svg: SVGSVGElement) {
  if (!(target instanceof Element) || target === svg) {
    return null
  }

  return target.closest<SVGGraphicsElement>('rect,circle,ellipse,line,path,polygon,polyline,text')
}

function getSvgPoint(event: PointerEvent<HTMLDivElement>, svg: SVGSVGElement): SvgPoint {
  const point = svg.createSVGPoint()
  const matrix = svg.getScreenCTM()

  point.x = event.clientX
  point.y = event.clientY

  if (!matrix) {
    return { x: point.x, y: point.y }
  }

  const transformedPoint = point.matrixTransform(matrix.inverse())

  return {
    x: Math.round(transformedPoint.x * 100) / 100,
    y: Math.round(transformedPoint.y * 100) / 100,
  }
}

export default PreviewPanel

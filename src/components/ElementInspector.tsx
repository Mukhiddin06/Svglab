import { Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { useSvgStore } from '../store/svgStore'
import type { SvgElementSnapshot } from '../types/svg'

const numericAttributesByTag: Record<string, string[]> = {
  rect: ['x', 'y', 'width', 'height', 'rx', 'ry'],
  circle: ['cx', 'cy', 'r'],
  ellipse: ['cx', 'cy', 'rx', 'ry'],
  line: ['x1', 'y1', 'x2', 'y2', 'stroke-width'],
  text: ['x', 'y', 'font-size'],
  path: [],
  polygon: [],
  polyline: [],
}

const paintAttributes = ['fill', 'stroke', 'opacity']

const ElementInspector = () => {
  const elements = useSvgStore((state) => state.elements)
  const selectedElementId = useSvgStore((state) => state.selectedElementId)
  const updateSelectedElement = useSvgStore((state) => state.updateSelectedElement)
  const deleteSelectedElement = useSvgStore((state) => state.deleteSelectedElement)
  const selectedElement = useMemo(
    () => elements.find((element) => element.id === selectedElementId) ?? null,
    [elements, selectedElementId],
  )

  if (!selectedElement) {
    return (
      <aside className="inspector empty-state">
        <p>Select a shape to edit its attributes.</p>
      </aside>
    )
  }

  const setAttribute = (name: string, value: string) => {
    updateSelectedElement({ [name]: value })
  }

  return (
    <aside className="inspector" aria-label="Selected SVG element inspector">
      <div className="inspector-header">
        <div>
          <p className="panel-kicker">Selected</p>
          <h3>{selectedElement.tagName}</h3>
        </div>
        <button className="icon-button danger" type="button" onClick={deleteSelectedElement} title="Delete element">
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>

      <label className="field">
        <span>ID</span>
        <input value={selectedElement.id} onChange={(event) => setAttribute('id', event.target.value)} />
      </label>

      {selectedElement.tagName === 'text' ? (
        <label className="field">
          <span>Text</span>
          <input
            value={selectedElement.textContent ?? ''}
            onChange={(event) => updateSelectedElement({}, event.target.value)}
          />
        </label>
      ) : null}

      <AttributeGrid element={selectedElement} attributes={numericAttributesByTag[selectedElement.tagName] ?? []} />

      <div className="inspector-grid">
        {paintAttributes.map((attribute) => (
          <label className="field compact" key={attribute}>
            <span>{attribute}</span>
            <input
              value={selectedElement.attributes[attribute] ?? ''}
              onChange={(event) => setAttribute(attribute, event.target.value)}
              placeholder={attribute === 'opacity' ? '0.9' : '#111827'}
            />
          </label>
        ))}
      </div>
    </aside>
  )
}

type AttributeGridProps = {
  element: SvgElementSnapshot
  attributes: string[]
}

const AttributeGrid = ({ element, attributes }: AttributeGridProps) => {
  const updateSelectedElement = useSvgStore((state) => state.updateSelectedElement)

  if (attributes.length === 0) {
    return null
  }

  return (
    <div className="inspector-grid">
      {attributes.map((attribute) => (
        <label className="field compact" key={attribute}>
          <span>{attribute}</span>
          <input
            type="number"
            value={element.attributes[attribute] ?? ''}
            onChange={(event) => updateSelectedElement({ [attribute]: event.target.value })}
          />
        </label>
      ))}
    </div>
  )
}

export default ElementInspector

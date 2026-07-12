import { Layers } from 'lucide-react'
import { useSvgStore } from '../store/svgStore'

const SvgTree = () => {
  const elements = useSvgStore((state) => state.elements)
  const selectedElementId = useSvgStore((state) => state.selectedElementId)
  const selectElement = useSvgStore((state) => state.selectElement)

  return (
    <section className="panel tree-panel" aria-label="SVG layers">
      <header className="panel-header">
        <div>
          <p className="panel-kicker">Layers</p>
          <h2>SVG Tree</h2>
        </div>
        <Layers size={18} aria-hidden="true" />
      </header>

      <div className="tree-list">
        <button className="tree-node root-node" type="button" onClick={() => selectElement(null)}>
          svg
        </button>
        {elements.map((element) => (
          <button
            className={element.id === selectedElementId ? 'tree-node active' : 'tree-node'}
            type="button"
            key={element.id}
            onClick={() => selectElement(element.id)}
          >
            <span className="tree-node-tag">{element.tagName}</span>
            <span className="tree-node-id">{element.id}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

export default SvgTree

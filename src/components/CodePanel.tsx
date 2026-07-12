import MonacoEditor from '@monaco-editor/react'
import { CheckCircle2, RotateCcw, Sparkles, TriangleAlert } from 'lucide-react'
import formatXml from 'xml-formatter'
import { useSvgStore } from '../store/svgStore'

const CodePanel = () => {
  const svgCode = useSvgStore((state) => state.svgCode)
  const parseError = useSvgStore((state) => state.parseError)
  const setSvgCode = useSvgStore((state) => state.setSvgCode)
  const resetDocument = useSvgStore((state) => state.resetDocument)

  const handleFormat = () => {
    try {
      setSvgCode(formatXml(svgCode, { indentation: '  ', collapseContent: true }))
    } catch {
      setSvgCode(svgCode)
    }
  }

  return (
    <section className="panel code-panel" aria-label="SVG code editor">
      <header className="panel-header">
        <div>
          <p className="panel-kicker">Code</p>
          <h2>SVG Markup</h2>
        </div>
        <div className="panel-actions">
          <button className="icon-button" type="button" onClick={handleFormat} title="Format SVG">
            <Sparkles size={16} aria-hidden="true" />
          </button>
          <button className="icon-button" type="button" onClick={resetDocument} title="Reset sample">
            <RotateCcw size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="editor-shell">
        <MonacoEditor
          language="xml"
          theme="vs-dark"
          value={svgCode}
          onChange={(value) => setSvgCode(value ?? '')}
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            wordWrap: 'on',
            lineNumbersMinChars: 3,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 14, bottom: 14 },
          }}
        />
      </div>

      <footer className={parseError ? 'status-line is-error' : 'status-line is-valid'}>
        {parseError ? <TriangleAlert size={15} aria-hidden="true" /> : <CheckCircle2 size={15} aria-hidden="true" />}
        <span>{parseError ?? 'Preview is synced with the latest valid SVG.'}</span>
      </footer>
    </section>
  )
}

export default CodePanel

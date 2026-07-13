import MonacoEditor from '@monaco-editor/react'
import { CheckCircle2, RotateCcw, Sparkles, TriangleAlert } from 'lucide-react'
import { memo, useCallback, useEffect, useRef } from 'react'
import formatXml from 'xml-formatter'
import { useSvgStore } from '../store/svgStore'

const commitDelayMs = 250
const editorOptions = {
  fontSize: 13,
  minimap: { enabled: false },
  wordWrap: 'on' as const,
  lineNumbersMinChars: 3,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  padding: { top: 14, bottom: 14 },
}

const CodePanel = () => {
  const svgCode = useSvgStore((state) => state.svgCode)
  const parseError = useSvgStore((state) => state.parseError)
  const setSvgCode = useSvgStore((state) => state.setSvgCode)
  const resetDocument = useSvgStore((state) => state.resetDocument)
  const draftCodeRef = useRef(svgCode)
  const editorRef = useRef<Parameters<NonNullable<React.ComponentProps<typeof MonacoEditor>['onMount']>>[0] | null>(
    null,
  )
  const commitTimeoutRef = useRef<number | null>(null)

  const clearPendingCommit = useCallback(() => {
    if (commitTimeoutRef.current === null) {
      return
    }

    window.clearTimeout(commitTimeoutRef.current)
    commitTimeoutRef.current = null
  }, [])

  const commitCode = useCallback(
    (code: string) => {
      clearPendingCommit()
      draftCodeRef.current = code
      setSvgCode(code)
    },
    [clearPendingCommit, setSvgCode],
  )

  const scheduleCommit = useCallback(
    (code: string) => {
      clearPendingCommit()

      commitTimeoutRef.current = window.setTimeout(() => {
        commitTimeoutRef.current = null
        setSvgCode(code)
      }, commitDelayMs)
    },
    [clearPendingCommit, setSvgCode],
  )

  useEffect(() => {
    clearPendingCommit()
    draftCodeRef.current = svgCode

    const editor = editorRef.current

    if (editor && editor.getValue() !== svgCode) {
      editor.setValue(svgCode)
    }
  }, [clearPendingCommit, svgCode])

  useEffect(() => clearPendingCommit, [clearPendingCommit])

  const handleFormat = useCallback(() => {
    try {
      commitCode(formatXml(draftCodeRef.current, { indentation: '  ', collapseContent: true }))
    } catch {
      commitCode(draftCodeRef.current)
    }
  }, [commitCode])

  const handleReset = useCallback(() => {
    clearPendingCommit()
    resetDocument()
  }, [clearPendingCommit, resetDocument])

  const handleEditorChange = useCallback((value?: string) => {
    const code = value ?? ''

    draftCodeRef.current = code
    scheduleCommit(code)
  }, [scheduleCommit])

  const handleEditorMount = useCallback(
    (editor: Parameters<NonNullable<React.ComponentProps<typeof MonacoEditor>['onMount']>>[0]) => {
      editorRef.current = editor
      editor.onDidBlurEditorText(() => {
        commitCode(draftCodeRef.current)
      })
    },
    [commitCode],
  )

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
          <button className="icon-button" type="button" onClick={handleReset} title="Reset sample">
            <RotateCcw size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="editor-shell">
        <MonacoEditor
          language="xml"
          theme="vs-dark"
          defaultValue={svgCode}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          options={editorOptions}
        />
      </div>

      <footer className={parseError ? 'status-line is-error' : 'status-line is-valid'}>
        {parseError ? <TriangleAlert size={15} aria-hidden="true" /> : <CheckCircle2 size={15} aria-hidden="true" />}
        <span>{parseError ?? 'Preview is synced with the latest valid SVG.'}</span>
      </footer>
    </section>
  )
}

export default memo(CodePanel)

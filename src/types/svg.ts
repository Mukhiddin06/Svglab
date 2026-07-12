export type SvgTool = 'select' | 'rect' | 'circle' | 'ellipse' | 'line' | 'text'

export type EditableSvgTag =
  | 'rect'
  | 'circle'
  | 'ellipse'
  | 'line'
  | 'path'
  | 'polygon'
  | 'polyline'
  | 'text'

export type SvgPoint = {
  x: number
  y: number
}

export type SvgElementSnapshot = {
  id: string
  tagName: EditableSvgTag
  label: string
  attributes: Record<string, string>
  textContent?: string
}

export type SvgParseResult =
  | {
      ok: true
      code: string
      elements: SvgElementSnapshot[]
    }
  | {
      ok: false
      error: string
    }

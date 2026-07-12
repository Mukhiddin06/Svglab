import type {
  EditableSvgTag,
  SvgElementSnapshot,
  SvgParseResult,
  SvgPoint,
  SvgTool,
} from '../types/svg'

const editableTags = new Set<EditableSvgTag>([
  'rect',
  'circle',
  'ellipse',
  'line',
  'path',
  'polygon',
  'polyline',
  'text',
])

const defaultViewBox = '0 0 640 420'

export const defaultSvgCode = `<svg width="640" height="420" viewBox="0 0 640 420" xmlns="http://www.w3.org/2000/svg">
  <rect id="rect-1" x="120" y="90" width="220" height="150" rx="18" fill="#4f46e5" />
  <circle id="circle-1" cx="390" cy="225" r="72" fill="#14b8a6" opacity="0.9" />
  <text id="text-1" x="150" y="310" fill="#111827" font-size="34" font-family="Inter, Arial, sans-serif">SvgLab</text>
</svg>`

const parser = new DOMParser()
const serializer = new XMLSerializer()

export function parseAndNormalizeSvg(input: string): SvgParseResult {
  const source = input.trim()

  if (!source) {
    return { ok: false, error: 'SVG code is empty.' }
  }

  const document = parser.parseFromString(source, 'image/svg+xml')
  const parserError = document.querySelector('parsererror')
  const svg = document.documentElement

  if (parserError) {
    return { ok: false, error: parserError.textContent?.trim() || 'Invalid SVG syntax.' }
  }

  if (!svg || svg.tagName.toLowerCase() !== 'svg') {
    return { ok: false, error: 'Root element must be <svg>.' }
  }

  sanitizeNode(svg)
  ensureSvgDefaults(svg)
  const elements = collectEditableElements(svg)

  return {
    ok: true,
    code: serializer.serializeToString(svg),
    elements,
  }
}

export function updateSvgElement(
  svgCode: string,
  elementId: string,
  attributes: Record<string, string>,
  textContent?: string,
): SvgParseResult {
  const parsed = parseAndNormalizeSvg(svgCode)

  if (!parsed.ok) {
    return parsed
  }

  const document = parser.parseFromString(parsed.code, 'image/svg+xml')
  const element = document.getElementById(elementId)

  if (!element) {
    return { ok: false, error: 'Selected element was not found.' }
  }

  Object.entries(attributes).forEach(([name, value]) => {
    if (value === '') {
      element.removeAttribute(name)
      return
    }

    element.setAttribute(name, value)
  })

  if (textContent !== undefined && element.tagName.toLowerCase() === 'text') {
    element.textContent = textContent
  }

  return parseAndNormalizeSvg(serializer.serializeToString(document.documentElement))
}

export function removeSvgElement(svgCode: string, elementId: string): SvgParseResult {
  const parsed = parseAndNormalizeSvg(svgCode)

  if (!parsed.ok) {
    return parsed
  }

  const document = parser.parseFromString(parsed.code, 'image/svg+xml')
  const element = document.getElementById(elementId)

  if (!element || !element.parentNode) {
    return { ok: false, error: 'Selected element was not found.' }
  }

  element.parentNode.removeChild(element)
  return parseAndNormalizeSvg(serializer.serializeToString(document.documentElement))
}

export function addSvgElement(svgCode: string, tool: Exclude<SvgTool, 'select'>, point: SvgPoint): SvgParseResult {
  const parsed = parseAndNormalizeSvg(svgCode)

  if (!parsed.ok) {
    return parsed
  }

  const document = parser.parseFromString(parsed.code, 'image/svg+xml')
  const svg = document.documentElement
  const id = getNextElementId(svg, tool)
  const element = document.createElementNS('http://www.w3.org/2000/svg', tool)
  const x = round(point.x)
  const y = round(point.y)

  element.setAttribute('id', id)

  if (tool === 'rect') {
    element.setAttribute('x', String(x - 55))
    element.setAttribute('y', String(y - 35))
    element.setAttribute('width', '110')
    element.setAttribute('height', '70')
    element.setAttribute('rx', '10')
    element.setAttribute('fill', '#f97316')
  }

  if (tool === 'circle') {
    element.setAttribute('cx', String(x))
    element.setAttribute('cy', String(y))
    element.setAttribute('r', '42')
    element.setAttribute('fill', '#0ea5e9')
  }

  if (tool === 'ellipse') {
    element.setAttribute('cx', String(x))
    element.setAttribute('cy', String(y))
    element.setAttribute('rx', '62')
    element.setAttribute('ry', '38')
    element.setAttribute('fill', '#22c55e')
  }

  if (tool === 'line') {
    element.setAttribute('x1', String(x - 50))
    element.setAttribute('y1', String(y))
    element.setAttribute('x2', String(x + 50))
    element.setAttribute('y2', String(y))
    element.setAttribute('stroke', '#111827')
    element.setAttribute('stroke-width', '6')
    element.setAttribute('stroke-linecap', 'round')
  }

  if (tool === 'text') {
    element.setAttribute('x', String(x))
    element.setAttribute('y', String(y))
    element.setAttribute('fill', '#111827')
    element.setAttribute('font-size', '32')
    element.setAttribute('font-family', 'Inter, Arial, sans-serif')
    element.textContent = 'Text'
  }

  svg.appendChild(element)
  return parseAndNormalizeSvg(serializer.serializeToString(svg))
}

export function moveSvgElementByDelta(svgCode: string, elementId: string, dx: number, dy: number): SvgParseResult {
  const parsed = parseAndNormalizeSvg(svgCode)

  if (!parsed.ok) {
    return parsed
  }

  const document = parser.parseFromString(parsed.code, 'image/svg+xml')
  const element = document.getElementById(elementId)

  if (!element) {
    return { ok: false, error: 'Selected element was not found.' }
  }

  const tagName = element.tagName.toLowerCase()

  if (tagName === 'rect' || tagName === 'text') {
    incrementAttribute(element, 'x', dx)
    incrementAttribute(element, 'y', dy)
  }

  if (tagName === 'circle' || tagName === 'ellipse') {
    incrementAttribute(element, 'cx', dx)
    incrementAttribute(element, 'cy', dy)
  }

  if (tagName === 'line') {
    incrementAttribute(element, 'x1', dx)
    incrementAttribute(element, 'y1', dy)
    incrementAttribute(element, 'x2', dx)
    incrementAttribute(element, 'y2', dy)
  }

  return parseAndNormalizeSvg(serializer.serializeToString(document.documentElement))
}

function sanitizeNode(node: Element) {
  const children = Array.from(node.children)

  children.forEach((child) => {
    const tagName = child.tagName.toLowerCase()

    if (tagName === 'script' || tagName === 'foreignobject') {
      child.remove()
      return
    }

    sanitizeNode(child)
  })

  Array.from(node.attributes).forEach((attribute) => {
    const name = attribute.name.toLowerCase()
    const value = attribute.value.trim().toLowerCase()

    if (name.startsWith('on') || value.startsWith('javascript:')) {
      node.removeAttribute(attribute.name)
    }
  })
}

function ensureSvgDefaults(svg: Element) {
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  if (!svg.getAttribute('viewBox')) {
    const width = parseFloat(svg.getAttribute('width') || '')
    const height = parseFloat(svg.getAttribute('height') || '')

    if (Number.isFinite(width) && Number.isFinite(height)) {
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    } else {
      svg.setAttribute('viewBox', defaultViewBox)
      svg.setAttribute('width', '640')
      svg.setAttribute('height', '420')
    }
  }
}

function collectEditableElements(svg: Element): SvgElementSnapshot[] {
  const ids = new Set<string>()

  return Array.from(svg.querySelectorAll(Array.from(editableTags).join(','))).map((element, index) => {
    const tagName = element.tagName.toLowerCase() as EditableSvgTag
    const existingId = element.getAttribute('id')
    const id = existingId && !ids.has(existingId) ? existingId : `${tagName}-${index + 1}`

    element.setAttribute('id', id)
    ids.add(id)

    return {
      id,
      tagName,
      label: `${tagName} #${id}`,
      attributes: getElementAttributes(element),
      textContent: tagName === 'text' ? element.textContent || '' : undefined,
    }
  })
}

function getElementAttributes(element: Element) {
  return Array.from(element.attributes).reduce<Record<string, string>>((attributes, attribute) => {
    attributes[attribute.name] = attribute.value
    return attributes
  }, {})
}

function getNextElementId(svg: Element, tagName: string) {
  let index = 1

  while (svg.querySelector(`#${CSS.escape(`${tagName}-${index}`)}`)) {
    index += 1
  }

  return `${tagName}-${index}`
}

function incrementAttribute(element: Element, attributeName: string, delta: number) {
  const currentValue = parseFloat(element.getAttribute(attributeName) || '0')
  element.setAttribute(attributeName, String(round(currentValue + delta)))
}

function round(value: number) {
  return Math.round(value * 100) / 100
}

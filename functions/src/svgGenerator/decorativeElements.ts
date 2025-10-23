/**
 * SVG Decorative Elements
 * Professional design accents for slides
 */

export interface DecorativeElementConfig {
  x: number;
  y: number;
  color: string;
  opacity?: number;
}

/**
 * Left accent bar (vertical)
 */
export function createAccentBar(config: {
  width?: number;
  color: string;
  opacity?: number;
}): string {
  const width = config.width || 15;
  const opacity = config.opacity || 1;

  return `
    <rect 
      x="0" 
      y="0" 
      width="${width}" 
      height="1080" 
      fill="${config.color}" 
      opacity="${opacity}"
    />`;
}

/**
 * Top-right corner accent (triangle)
 */
export function createCornerAccent(config: {
  size?: number;
  color: string;
  opacity?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}): string {
  const size = config.size || 200;
  const opacity = config.opacity || 0.2;
  const position = config.position || 'top-right';

  let path = '';
  switch (position) {
    case 'top-right':
      path = `M 1920 0 L 1920 ${size} L ${1920 - size} 0 Z`;
      break;
    case 'top-left':
      path = `M 0 0 L ${size} 0 L 0 ${size} Z`;
      break;
    case 'bottom-right':
      path = `M 1920 1080 L 1920 ${1080 - size} L ${1920 - size} 1080 Z`;
      break;
    case 'bottom-left':
      path = `M 0 1080 L ${size} 1080 L 0 ${1080 - size} Z`;
      break;
  }

  return `
    <path 
      d="${path}" 
      fill="${config.color}" 
      opacity="${opacity}"
    />`;
}

/**
 * Decorative circles (bottom-right cluster)
 */
export function createDecorativeCircles(config: {
  x?: number;
  y?: number;
  color: string;
  count?: number;
}): string {
  const x = config.x || 1800;
  const y = config.y || 950;
  const count = config.count || 3;

  const circles = [];
  for (let i = 0; i < count; i++) {
    const radius = 80 - i * 20;
    const offsetX = i * 30;
    const offsetY = i * 30;
    const opacity = 0.1 + i * 0.05;

    circles.push(`
      <circle 
        cx="${x + offsetX}" 
        cy="${y + offsetY}" 
        r="${radius}" 
        fill="${config.color}" 
        opacity="${opacity}"
      />`);
  }

  return circles.join('\n');
}

/**
 * Premium divider line (horizontal)
 */
export function createDividerLine(config: {
  y: number;
  x?: number;
  width?: number;
  height?: number;
  color: string;
  opacity?: number;
}): string {
  const x = config.x || 100;
  const width = config.width || 200;
  const height = config.height || 4;
  const opacity = config.opacity || 1;

  return `
    <rect 
      x="${x}" 
      y="${config.y}" 
      width="${width}" 
      height="${height}" 
      fill="${config.color}" 
      opacity="${opacity}"
      rx="2"
    />`;
}

/**
 * Geometric pattern (subtle background pattern)
 */
export function createGeometricPattern(config: {
  color: string;
  opacity?: number;
  density?: 'low' | 'medium' | 'high';
}): string {
  const opacity = config.opacity || 0.03;
  const density = config.density || 'low';

  const spacing = density === 'low' ? 200 : density === 'medium' ? 100 : 50;
  const size = spacing * 0.3;

  const elements = [];
  for (let x = 0; x < 1920; x += spacing) {
    for (let y = 0; y < 1080; y += spacing) {
      elements.push(`
        <circle 
          cx="${x}" 
          cy="${y}" 
          r="${size}" 
          fill="${config.color}" 
          opacity="${opacity}"
        />`);
    }
  }

  return elements.join('\n');
}

/**
 * Curved accent line (decorative swoosh)
 */
export function createCurvedAccent(config: {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  thickness?: number;
  opacity?: number;
}): string {
  const thickness = config.thickness || 3;
  const opacity = config.opacity || 0.3;

  // Create a smooth bezier curve
  const controlX1 = config.startX + (config.endX - config.startX) * 0.3;
  const controlY1 = config.startY - 100;
  const controlX2 = config.startX + (config.endX - config.startX) * 0.7;
  const controlY2 = config.endY + 100;

  return `
    <path 
      d="M ${config.startX} ${config.startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${config.endX} ${config.endY}" 
      stroke="${config.color}" 
      stroke-width="${thickness}" 
      fill="none" 
      opacity="${opacity}"
      stroke-linecap="round"
    />`;
}

/**
 * Glow effect filter
 */
export function createGlowFilter(id: string, color: string, intensity: number = 10): string {
  return `
    <filter id="${id}">
      <feGaussianBlur stdDeviation="${intensity}" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>`;
}

/**
 * Subtle shadow filter
 */
export function createShadowFilter(id: string): string {
  return `
    <filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
      <feOffset dx="2" dy="2" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.2"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>`;
}

/**
 * Abstract shape (for modern designs)
 */
export function createAbstractShape(config: {
  x: number;
  y: number;
  size: number;
  color: string;
  opacity?: number;
  rotation?: number;
}): string {
  const opacity = config.opacity || 0.1;
  const rotation = config.rotation || 0;
  const halfSize = config.size / 2;

  // Create an interesting organic shape using path
  const path = `
    M ${config.x} ${config.y - halfSize}
    Q ${config.x + halfSize} ${config.y - halfSize * 0.5}, ${config.x + halfSize} ${config.y}
    Q ${config.x + halfSize} ${config.y + halfSize * 0.5}, ${config.x} ${config.y + halfSize}
    Q ${config.x - halfSize} ${config.y + halfSize * 0.5}, ${config.x - halfSize} ${config.y}
    Q ${config.x - halfSize} ${config.y - halfSize * 0.5}, ${config.x} ${config.y - halfSize}
    Z
  `;

  return `
    <path 
      d="${path}" 
      fill="${config.color}" 
      opacity="${opacity}"
      transform="rotate(${rotation} ${config.x} ${config.y})"
    />`;
}

/**
 * Grid pattern (subtle background)
 */
export function createGridPattern(config: {
  color: string;
  opacity?: number;
  spacing?: number;
}): string {
  const opacity = config.opacity || 0.02;
  const spacing = config.spacing || 100;

  const lines = [];

  // Vertical lines
  for (let x = 0; x < 1920; x += spacing) {
    lines.push(`
      <line 
        x1="${x}" 
        y1="0" 
        x2="${x}" 
        y2="1080" 
        stroke="${config.color}" 
        stroke-width="1" 
        opacity="${opacity}"
      />`);
  }

  // Horizontal lines
  for (let y = 0; y < 1080; y += spacing) {
    lines.push(`
      <line 
        x1="0" 
        y1="${y}" 
        x2="1920" 
        y2="${y}" 
        stroke="${config.color}" 
        stroke-width="1" 
        opacity="${opacity}"
      />`);
  }

  return lines.join('\n');
}

/**
 * Create a sophisticated arrow shape
 */
export function createArrow(config: {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  opacity?: number;
  direction?: 'right' | 'left' | 'up' | 'down';
}): string {
  const opacity = config.opacity || 1;
  const direction = config.direction || 'right';

  let path = '';
  const w = config.width;
  const h = config.height;
  const x = config.x;
  const y = config.y;

  switch (direction) {
    case 'right':
      path = `M ${x} ${y} L ${x + w * 0.7} ${y} L ${x + w * 0.7} ${y - h/2} L ${x + w} ${y + h/2} L ${x + w * 0.7} ${y + h * 1.5} L ${x + w * 0.7} ${y + h} L ${x} ${y + h} Z`;
      break;
    case 'left':
      path = `M ${x + w} ${y} L ${x + w * 0.3} ${y} L ${x + w * 0.3} ${y - h/2} L ${x} ${y + h/2} L ${x + w * 0.3} ${y + h * 1.5} L ${x + w * 0.3} ${y + h} L ${x + w} ${y + h} Z`;
      break;
    case 'up':
      path = `M ${x} ${y + h} L ${x} ${y + h * 0.3} L ${x - w/2} ${y + h * 0.3} L ${x + w/2} ${y} L ${x + w * 1.5} ${y + h * 0.3} L ${x + w} ${y + h * 0.3} L ${x + w} ${y + h} Z`;
      break;
    case 'down':
      path = `M ${x} ${y} L ${x} ${y + h * 0.7} L ${x - w/2} ${y + h * 0.7} L ${x + w/2} ${y + h} L ${x + w * 1.5} ${y + h * 0.7} L ${x + w} ${y + h * 0.7} L ${x + w} ${y} Z`;
      break;
  }

  return `
    <path
      d="${path}"
      fill="${config.color}"
      opacity="${opacity}"
    />`;
}

/**
 * Create a callout box with pointer
 */
export function createCalloutBox(config: {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  borderColor: string;
  opacity?: number;
  pointerPosition?: 'left' | 'right' | 'top' | 'bottom';
}): string {
  const opacity = config.opacity || 1;
  const pointerSize = 20;

  // Main box
  const box = `
    <rect
      x="${config.x}"
      y="${config.y}"
      width="${config.width}"
      height="${config.height}"
      fill="${config.color}"
      stroke="${config.borderColor}"
      stroke-width="2"
      opacity="${opacity}"
      rx="8"
    />`;

  // Pointer triangle
  let pointer = '';
  const centerX = config.x + config.width / 2;
  const centerY = config.y + config.height / 2;

  switch (config.pointerPosition) {
    case 'left':
      pointer = `
        <path
          d="M ${config.x} ${centerY - pointerSize/2} L ${config.x - pointerSize} ${centerY} L ${config.x} ${centerY + pointerSize/2} Z"
          fill="${config.color}"
          stroke="${config.borderColor}"
          stroke-width="2"
          opacity="${opacity}"
        />`;
      break;
    case 'right':
      pointer = `
        <path
          d="M ${config.x + config.width} ${centerY - pointerSize/2} L ${config.x + config.width + pointerSize} ${centerY} L ${config.x + config.width} ${centerY + pointerSize/2} Z"
          fill="${config.color}"
          stroke="${config.borderColor}"
          stroke-width="2"
          opacity="${opacity}"
        />`;
      break;
    case 'top':
      pointer = `
        <path
          d="M ${centerX - pointerSize/2} ${config.y} L ${centerX} ${config.y - pointerSize} L ${centerX + pointerSize/2} ${config.y} Z"
          fill="${config.color}"
          stroke="${config.borderColor}"
          stroke-width="2"
          opacity="${opacity}"
        />`;
      break;
    case 'bottom':
      pointer = `
        <path
          d="M ${centerX - pointerSize/2} ${config.y + config.height} L ${centerX} ${config.y + config.height + pointerSize} L ${centerX + pointerSize/2} ${config.y + config.height} Z"
          fill="${config.color}"
          stroke="${config.borderColor}"
          stroke-width="2"
          opacity="${opacity}"
        />`;
      break;
  }

  return box + pointer;
}

/**
 * Create a wave pattern for backgrounds
 */
export function createWavePattern(config: {
  color: string;
  opacity?: number;
  amplitude?: number;
  frequency?: number;
  position?: 'top' | 'bottom';
}): string {
  const opacity = config.opacity || 0.05;
  const amplitude = config.amplitude || 50;
  const frequency = config.frequency || 3;
  const position = config.position || 'bottom';

  const points = [];
  const steps = 50;

  for (let i = 0; i <= steps; i++) {
    const x = (1920 / steps) * i;
    const y = amplitude * Math.sin((i / steps) * Math.PI * 2 * frequency);
    points.push(`${x},${y}`);
  }

  const baseY = position === 'top' ? 0 : 1080;
  const path = position === 'top'
    ? `M 0,0 L ${points.join(' L ')} L 1920,0 Z`
    : `M 0,1080 L ${points.map(p => {
        const [x, y] = p.split(',');
        return `${x},${1080 - parseFloat(y)}`;
      }).join(' L ')} L 1920,1080 Z`;

  return `
    <path
      d="${path}"
      fill="${config.color}"
      opacity="${opacity}"
    />`;
}


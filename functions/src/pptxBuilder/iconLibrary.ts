/**
 * Professional Icon Library for PowerPoint Slides
 * Provides simple geometric icons that work well in presentations
 * Icons are drawn using basic shapes for maximum compatibility
 */

import PptxGenJS from "pptxgenjs";

export type IconType = 
  | "checkmark" | "cross" | "arrow-right" | "arrow-left" | "arrow-up" | "arrow-down"
  | "star" | "heart" | "lightbulb" | "target" | "chart" | "settings"
  | "user" | "users" | "lock" | "unlock" | "download" | "upload"
  | "search" | "bell" | "mail" | "phone" | "calendar" | "clock"
  | "folder" | "file" | "trash" | "edit" | "copy" | "share"
  | "play" | "pause" | "stop" | "volume" | "wifi" | "battery";

/**
 * Add a professional icon to the slide
 */
export function addIcon(
  slide: any,
  x: number,
  y: number,
  size: number,
  iconType: IconType,
  color: string = "#0F172A",
  strokeWidth: number = 2
): void {
  const iconDrawers: Record<IconType, (slide: any, x: number, y: number, size: number, color: string, strokeWidth: number) => void> = {
    checkmark: drawCheckmark,
    cross: drawCross,
    "arrow-right": drawArrowRight,
    "arrow-left": drawArrowLeft,
    "arrow-up": drawArrowUp,
    "arrow-down": drawArrowDown,
    star: drawStar,
    heart: drawHeart,
    lightbulb: drawLightbulb,
    target: drawTarget,
    chart: drawChart,
    settings: drawSettings,
    user: drawUser,
    users: drawUsers,
    lock: drawLock,
    unlock: drawUnlock,
    download: drawDownload,
    upload: drawUpload,
    search: drawSearch,
    bell: drawBell,
    mail: drawMail,
    phone: drawPhone,
    calendar: drawCalendar,
    clock: drawClock,
    folder: drawFolder,
    file: drawFile,
    trash: drawTrash,
    edit: drawEdit,
    copy: drawCopy,
    share: drawShare,
    play: drawPlay,
    pause: drawPause,
    stop: drawStop,
    volume: drawVolume,
    wifi: drawWifi,
    battery: drawBattery
  };

  const drawer = iconDrawers[iconType];
  if (drawer) {
    drawer(slide, x, y, size, color, strokeWidth);
  }
}

// Icon drawing functions
function drawCheckmark(slide: any, x: number, y: number, size: number, color: string): void {
  slide.addShape("line", {
    x: x + size * 0.2,
    y: y + size * 0.5,
    w: size * 0.3,
    h: size * 0.3,
    line: { color, width: 2 }
  });
  slide.addShape("line", {
    x: x + size * 0.5,
    y: y + size * 0.2,
    w: size * 0.3,
    h: size * 0.6,
    line: { color, width: 2 }
  });
}

function drawCross(slide: any, x: number, y: number, size: number, color: string): void {
  slide.addShape("line", {
    x: x + size * 0.2,
    y: y + size * 0.2,
    w: size * 0.6,
    h: size * 0.6,
    line: { color, width: 2 }
  });
  slide.addShape("line", {
    x: x + size * 0.8,
    y: y + size * 0.2,
    w: -size * 0.6,
    h: size * 0.6,
    line: { color, width: 2 }
  });
}

function drawArrowRight(slide: any, x: number, y: number, size: number, color: string): void {
  slide.addShape("rightArrow", {
    x,
    y,
    w: size,
    h: size,
    fill: { color },
    line: { type: "none" }
  });
}

function drawArrowLeft(slide: any, x: number, y: number, size: number, color: string): void {
  slide.addShape("leftArrow", {
    x,
    y,
    w: size,
    h: size,
    fill: { color },
    line: { type: "none" }
  });
}

function drawArrowUp(slide: any, x: number, y: number, size: number, color: string): void {
  slide.addShape("upArrow", {
    x,
    y,
    w: size,
    h: size,
    fill: { color },
    line: { type: "none" }
  });
}

function drawArrowDown(slide: any, x: number, y: number, size: number, color: string): void {
  slide.addShape("downArrow", {
    x,
    y,
    w: size,
    h: size,
    fill: { color },
    line: { type: "none" }
  });
}

function drawStar(slide: any, x: number, y: number, size: number, color: string): void {
  slide.addShape("star5", {
    x,
    y,
    w: size,
    h: size,
    fill: { color },
    line: { type: "none" }
  });
}

function drawHeart(slide: any, x: number, y: number, size: number, color: string): void {
  slide.addShape("heart", {
    x,
    y,
    w: size,
    h: size,
    fill: { color },
    line: { type: "none" }
  });
}

function drawLightbulb(slide: any, x: number, y: number, size: number, color: string): void {
  // Bulb circle
  slide.addShape("ellipse", {
    x: x + size * 0.2,
    y: y + size * 0.1,
    w: size * 0.6,
    h: size * 0.5,
    fill: { color },
    line: { type: "none" }
  });
  // Base
  slide.addShape("rect", {
    x: x + size * 0.35,
    y: y + size * 0.6,
    w: size * 0.3,
    h: size * 0.3,
    fill: { color },
    line: { type: "none" }
  });
}

function drawTarget(slide: any, x: number, y: number, size: number, color: string): void {
  // Outer circle
  slide.addShape("ellipse", {
    x,
    y,
    w: size,
    h: size,
    fill: { type: "none" },
    line: { color, width: 2 }
  });
  // Middle circle
  slide.addShape("ellipse", {
    x: x + size * 0.25,
    y: y + size * 0.25,
    w: size * 0.5,
    h: size * 0.5,
    fill: { type: "none" },
    line: { color, width: 2 }
  });
  // Center dot
  slide.addShape("ellipse", {
    x: x + size * 0.4,
    y: y + size * 0.4,
    w: size * 0.2,
    h: size * 0.2,
    fill: { color },
    line: { type: "none" }
  });
}

function drawChart(slide: any, x: number, y: number, size: number, color: string): void {
  // Bar 1
  slide.addShape("rect", {
    x,
    y: y + size * 0.5,
    w: size * 0.2,
    h: size * 0.5,
    fill: { color },
    line: { type: "none" }
  });
  // Bar 2
  slide.addShape("rect", {
    x: x + size * 0.4,
    y: y + size * 0.3,
    w: size * 0.2,
    h: size * 0.7,
    fill: { color },
    line: { type: "none" }
  });
  // Bar 3
  slide.addShape("rect", {
    x: x + size * 0.8,
    y: y + size * 0.1,
    w: size * 0.2,
    h: size * 0.9,
    fill: { color },
    line: { type: "none" }
  });
}

function drawSettings(slide: any, x: number, y: number, size: number, color: string): void {
  // Center circle
  slide.addShape("ellipse", {
    x: x + size * 0.35,
    y: y + size * 0.35,
    w: size * 0.3,
    h: size * 0.3,
    fill: { color },
    line: { type: "none" }
  });
  // Gear teeth (simplified with rectangles)
  slide.addShape("rect", {
    x: x + size * 0.45,
    y: y,
    w: size * 0.1,
    h: size * 0.2,
    fill: { color },
    line: { type: "none" }
  });
}

function drawUser(slide: any, x: number, y: number, size: number, color: string): void {
  // Head
  slide.addShape("ellipse", {
    x: x + size * 0.25,
    y: y + size * 0.1,
    w: size * 0.5,
    h: size * 0.4,
    fill: { color },
    line: { type: "none" }
  });
  // Body
  slide.addShape("rect", {
    x: x + size * 0.15,
    y: y + size * 0.5,
    w: size * 0.7,
    h: size * 0.5,
    fill: { color },
    line: { type: "none" }
  });
}

function drawUsers(slide: any, x: number, y: number, size: number, color: string): void {
  // User 1
  drawUser(slide, x, y + size * 0.1, size * 0.6, color);
  // User 2
  drawUser(slide, x + size * 0.4, y + size * 0.2, size * 0.6, color);
}

function drawLock(slide: any, x: number, y: number, size: number, color: string): void {
  // Shackle
  slide.addShape("arc", {
    x: x + size * 0.2,
    y: y + size * 0.1,
    w: size * 0.6,
    h: size * 0.4,
    line: { color, width: 2 },
    fill: { type: "none" }
  });
  // Body
  slide.addShape("rect", {
    x: x + size * 0.15,
    y: y + size * 0.4,
    w: size * 0.7,
    h: size * 0.5,
    fill: { color },
    line: { type: "none" }
  });
}

function drawUnlock(slide: any, x: number, y: number, size: number, color: string): void {
  // Open shackle
  slide.addShape("line", {
    x: x + size * 0.2,
    y: y + size * 0.5,
    w: 0,
    h: -size * 0.3,
    line: { color, width: 2 }
  });
  // Body
  slide.addShape("rect", {
    x: x + size * 0.15,
    y: y + size * 0.4,
    w: size * 0.7,
    h: size * 0.5,
    fill: { color },
    line: { type: "none" }
  });
}

function drawDownload(slide: any, x: number, y: number, size: number, color: string): void {
  // Arrow down
  slide.addShape("downArrow", {
    x: x + size * 0.2,
    y: y + size * 0.1,
    w: size * 0.6,
    h: size * 0.4,
    fill: { color },
    line: { type: "none" }
  });
  // Line
  slide.addShape("rect", {
    x: x + size * 0.1,
    y: y + size * 0.65,
    w: size * 0.8,
    h: size * 0.05,
    fill: { color },
    line: { type: "none" }
  });
}

function drawUpload(slide: any, x: number, y: number, size: number, color: string): void {
  // Arrow up
  slide.addShape("upArrow", {
    x: x + size * 0.2,
    y: y + size * 0.4,
    w: size * 0.6,
    h: size * 0.4,
    fill: { color },
    line: { type: "none" }
  });
  // Line
  slide.addShape("rect", {
    x: x + size * 0.1,
    y: y + size * 0.1,
    w: size * 0.8,
    h: size * 0.05,
    fill: { color },
    line: { type: "none" }
  });
}

function drawSearch(slide: any, x: number, y: number, size: number, color: string): void {
  // Circle
  slide.addShape("ellipse", {
    x: x + size * 0.1,
    y: y + size * 0.1,
    w: size * 0.5,
    h: size * 0.5,
    fill: { type: "none" },
    line: { color, width: 2 }
  });
  // Handle
  slide.addShape("line", {
    x: x + size * 0.6,
    y: y + size * 0.6,
    w: size * 0.3,
    h: size * 0.3,
    line: { color, width: 2 }
  });
}

function drawBell(slide: any, x: number, y: number, size: number, color: string): void {
  // Bell shape
  slide.addShape("ellipse", {
    x: x + size * 0.2,
    y: y + size * 0.1,
    w: size * 0.6,
    h: size * 0.6,
    fill: { color },
    line: { type: "none" }
  });
  // Clapper
  slide.addShape("ellipse", {
    x: x + size * 0.35,
    y: y + size * 0.65,
    w: size * 0.3,
    h: size * 0.25,
    fill: { color },
    line: { type: "none" }
  });
}

function drawMail(slide: any, x: number, y: number, size: number, color: string): void {
  // Envelope
  slide.addShape("rect", {
    x,
    y: y + size * 0.2,
    w: size,
    h: size * 0.6,
    fill: { type: "none" },
    line: { color, width: 2 }
  });
  // Flap
  slide.addShape("line", {
    x,
    y: y + size * 0.2,
    w: size * 0.5,
    h: size * 0.3,
    line: { color, width: 2 }
  });
}

function drawPhone(slide: any, x: number, y: number, size: number, color: string): void {
  // Phone body
  slide.addShape("roundRect", {
    x: x + size * 0.15,
    y,
    w: size * 0.7,
    h: size,
    fill: { type: "none" },
    line: { color, width: 2 }
  });
  // Screen
  slide.addShape("rect", {
    x: x + size * 0.2,
    y: y + size * 0.1,
    w: size * 0.6,
    h: size * 0.7,
    fill: { color, transparency: 80 },
    line: { type: "none" }
  });
}

function drawCalendar(slide: any, x: number, y: number, size: number, color: string): void {
  // Calendar body
  slide.addShape("rect", {
    x,
    y: y + size * 0.15,
    w: size,
    h: size * 0.85,
    fill: { type: "none" },
    line: { color, width: 2 }
  });
  // Header
  slide.addShape("rect", {
    x,
    y: y + size * 0.15,
    w: size,
    h: size * 0.2,
    fill: { color },
    line: { type: "none" }
  });
}

function drawClock(slide: any, x: number, y: number, size: number, color: string): void {
  // Circle
  slide.addShape("ellipse", {
    x,
    y,
    w: size,
    h: size,
    fill: { type: "none" },
    line: { color, width: 2 }
  });
  // Hour hand
  slide.addShape("line", {
    x: x + size * 0.5,
    y: y + size * 0.5,
    w: 0,
    h: -size * 0.2,
    line: { color, width: 2 }
  });
  // Minute hand
  slide.addShape("line", {
    x: x + size * 0.5,
    y: y + size * 0.5,
    w: size * 0.2,
    h: 0,
    line: { color, width: 2 }
  });
}

function drawFolder(slide: any, x: number, y: number, size: number, color: string): void {
  // Folder tab
  slide.addShape("rect", {
    x,
    y,
    w: size * 0.4,
    h: size * 0.3,
    fill: { color },
    line: { type: "none" }
  });
  // Folder body
  slide.addShape("rect", {
    x,
    y: y + size * 0.25,
    w: size,
    h: size * 0.75,
    fill: { type: "none" },
    line: { color, width: 2 }
  });
}

function drawFile(slide: any, x: number, y: number, size: number, color: string): void {
  // Document
  slide.addShape("rect", {
    x: x + size * 0.15,
    y,
    w: size * 0.7,
    h: size,
    fill: { type: "none" },
    line: { color, width: 2 }
  });
  // Lines
  for (let i = 0; i < 3; i++) {
    slide.addShape("line", {
      x: x + size * 0.25,
      y: y + size * (0.3 + i * 0.2),
      w: size * 0.5,
      h: 0,
      line: { color, width: 1 }
    });
  }
}

function drawTrash(slide: any, x: number, y: number, size: number, color: string): void {
  // Handle
  slide.addShape("rect", {
    x: x + size * 0.35,
    y,
    w: size * 0.3,
    h: size * 0.15,
    fill: { color },
    line: { type: "none" }
  });
  // Can
  slide.addShape("rect", {
    x: x + size * 0.1,
    y: y + size * 0.15,
    w: size * 0.8,
    h: size * 0.85,
    fill: { type: "none" },
    line: { color, width: 2 }
  });
}

function drawEdit(slide: any, x: number, y: number, size: number, color: string): void {
  // Pencil
  slide.addShape("line", {
    x: x + size * 0.1,
    y: y + size * 0.9,
    w: size * 0.8,
    h: -size * 0.8,
    line: { color, width: 2 }
  });
  // Eraser
  slide.addShape("rect", {
    x: x + size * 0.8,
    y: y + size * 0.1,
    w: size * 0.2,
    h: size * 0.2,
    fill: { color },
    line: { type: "none" }
  });
}

function drawCopy(slide: any, x: number, y: number, size: number, color: string): void {
  // First rectangle
  slide.addShape("rect", {
    x,
    y,
    w: size * 0.7,
    h: size * 0.7,
    fill: { type: "none" },
    line: { color, width: 2 }
  });
  // Second rectangle (offset)
  slide.addShape("rect", {
    x: x + size * 0.3,
    y: y + size * 0.3,
    w: size * 0.7,
    h: size * 0.7,
    fill: { type: "none" },
    line: { color, width: 2 }
  });
}

function drawShare(slide: any, x: number, y: number, size: number, color: string): void {
  // Nodes
  slide.addShape("ellipse", {
    x: x + size * 0.35,
    y,
    w: size * 0.3,
    h: size * 0.3,
    fill: { color },
    line: { type: "none" }
  });
  slide.addShape("ellipse", {
    x,
    y: y + size * 0.6,
    w: size * 0.3,
    h: size * 0.3,
    fill: { color },
    line: { type: "none" }
  });
  slide.addShape("ellipse", {
    x: x + size * 0.7,
    y: y + size * 0.6,
    w: size * 0.3,
    h: size * 0.3,
    fill: { color },
    line: { type: "none" }
  });
}

function drawPlay(slide: any, x: number, y: number, size: number, color: string): void {
  // Triangle
  slide.addShape("triangle", {
    x,
    y,
    w: size,
    h: size,
    fill: { color },
    line: { type: "none" }
  });
}

function drawPause(slide: any, x: number, y: number, size: number, color: string): void {
  // Bar 1
  slide.addShape("rect", {
    x: x + size * 0.2,
    y,
    w: size * 0.15,
    h: size,
    fill: { color },
    line: { type: "none" }
  });
  // Bar 2
  slide.addShape("rect", {
    x: x + size * 0.65,
    y,
    w: size * 0.15,
    h: size,
    fill: { color },
    line: { type: "none" }
  });
}

function drawStop(slide: any, x: number, y: number, size: number, color: string): void {
  // Square
  slide.addShape("rect", {
    x,
    y,
    w: size,
    h: size,
    fill: { color },
    line: { type: "none" }
  });
}

function drawVolume(slide: any, x: number, y: number, size: number, color: string): void {
  // Speaker
  slide.addShape("triangle", {
    x: x + size * 0.1,
    y: y + size * 0.2,
    w: size * 0.3,
    h: size * 0.6,
    fill: { color },
    line: { type: "none" }
  });
  // Wave
  slide.addShape("arc", {
    x: x + size * 0.4,
    y: y + size * 0.1,
    w: size * 0.5,
    h: size * 0.8,
    line: { color, width: 2 },
    fill: { type: "none" }
  });
}

function drawWifi(slide: any, x: number, y: number, size: number, color: string): void {
  // Dot
  slide.addShape("ellipse", {
    x: x + size * 0.4,
    y: y + size * 0.8,
    w: size * 0.2,
    h: size * 0.2,
    fill: { color },
    line: { type: "none" }
  });
  // Arcs
  for (let i = 1; i <= 2; i++) {
    slide.addShape("arc", {
      x: x + size * (0.5 - i * 0.15),
      y: y + size * (0.8 - i * 0.15),
      w: size * (0.3 + i * 0.3),
      h: size * (0.3 + i * 0.3),
      line: { color, width: 2 },
      fill: { type: "none" }
    });
  }
}

function drawBattery(slide: any, x: number, y: number, size: number, color: string): void {
  // Battery body
  slide.addShape("rect", {
    x,
    y: y + size * 0.2,
    w: size * 0.8,
    h: size * 0.6,
    fill: { type: "none" },
    line: { color, width: 2 }
  });
  // Terminal
  slide.addShape("rect", {
    x: x + size * 0.8,
    y: y + size * 0.35,
    w: size * 0.2,
    h: size * 0.3,
    fill: { color },
    line: { type: "none" }
  });
  // Charge level
  slide.addShape("rect", {
    x: x + size * 0.05,
    y: y + size * 0.3,
    w: size * 0.6,
    h: size * 0.4,
    fill: { color },
    line: { type: "none" }
  });
}


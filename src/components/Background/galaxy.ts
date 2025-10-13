export function easeInOutCirc(x: number): number {
return x < 0.5
  ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
  : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
}

export function easeInOutQuart(x: number): number {
  return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
}

const STATIC_MODE = true;
type Config = {
  nebulaCount: number;
  starCount: number;
  globalAlpha: number;
  minStarRadius: number;
  maxStarRadius: number;
  starSpeedFactor: number;
  minStarAlpha: number;
  minStarSizeFactor: number;
  minInitialDist: number;
  isReversed: boolean;
  mainColor?: string;
  sideColors?: string[];
}

type Star = {
  angle: number;
  dist: number;
  x: number;
  y: number;
  radius: number;
  twinkle: boolean;
  _startDist?: number;
  _targetDist?: number;
};

type NebulaPatch = {
  x: number;
  y: number;
  radius: number;
  baseColor: string;
  centerAlpha: number;
  middleAlpha: number;
};

export class GalaxyGenerator {
  runForDuration(
    ms: number,
    easeFn: (t: number) => number = t => t,
    onDone?: () => void,
    onFrame?: (easeT: number) => void,
    moveDist: number = 200
  ) {
    this.onStop();
    // 動畫開始時記錄每顆星星的起點與終點
    this.#stars.forEach(star => {
      star._startDist = star.dist;
      star._targetDist = star.dist + moveDist;
    });
    const start = performance.now();
    const animateOnce = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / ms);
      const easeT = easeFn(t);
      if (onFrame) onFrame(easeT);
      // 依 easeT 內插 dist
      this.#updateStars(easeT, true);
      this.#drawNebula();
      this.#drawStars();
      if (elapsed < ms) {
        this.#animationFrameId = requestAnimationFrame(animateOnce);
      } else {
        this.#animationFrameId = null;
        if (onDone) onDone();
      }
    };
    this.#animationFrameId = requestAnimationFrame(animateOnce);
  }
  #canvas;
  #ctx;
  #width = 0;
  #height = 0;
  #dpr = 1;

  #stars: Star[] = [];
  #nebulaPatches: NebulaPatch[] = [];
  #nebulaPositions: {x: number, y: number, radius: number, centerAlpha: number, middleAlpha: number}[] = [];
  #animationFrameId: number | null = null;
  #lastDrawTime: number = 0;
  #targetFPS: number = 30;

  #MAIN_COLOR = 'rgba(60, 0, 150, 1)';
  #SIDE_COLORS = [
    'rgba(200, 50, 100, 1)',
    'rgba(0, 180, 255, 1)',
    'rgba(255, 120, 0, 1)'
  ];

  #targetMainColor = this.#MAIN_COLOR;
  #targetSideColors = [...this.#SIDE_COLORS];
  #colorTransitionDuration = 1000; // ms
  #colorTransitionStart = 0;
  #colorTransitioning = false;
  // Helper: parse rgba or hex string to array
  #parseRgba(str: string): [number, number, number, number] {
    // Hex: #RRGGBB or #RGB or #RRGGBBAA or #RGBA
    if (str.startsWith('#')) {
      let hex = str.slice(1);
      if (hex.length === 3) {
        hex = hex.split('').map(x => x + x).join('');
      }
      if (hex.length === 6) {
        const r = parseInt(hex.slice(0,2), 16);
        const g = parseInt(hex.slice(2,4), 16);
        const b = parseInt(hex.slice(4,6), 16);
        return [r, g, b, 1];
      }
      if (hex.length === 8) {
        const r = parseInt(hex.slice(0,2), 16);
        const g = parseInt(hex.slice(2,4), 16);
        const b = parseInt(hex.slice(4,6), 16);
        const a = parseInt(hex.slice(6,8), 16) / 255;
        return [r, g, b, a];
      }
    }
    // rgba/ rgb
    const match = str.match(/rgba?\(([^)]+)\)/);
    if (!match) return [0,0,0,1];
    const parts = match[1].split(',').map(Number);
    const arr = [...parts];
    if (arr.length === 3) arr.push(1);
    while (arr.length < 4) arr.push(1);
    return [arr[0], arr[1], arr[2], arr[3]];
  }

  // Helper: interpolate two rgba colors
  #lerpColor(a: [number, number, number, number], b: [number, number, number, number], t: number): [number, number, number, number] {
    return [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
      a[3] + (b[3] - a[3]) * t
    ];
  }

  // Helper: rgba array to string
  #rgbaToString(arr: [number, number, number, number]): string {
    return `rgba(${arr[0]}, ${arr[1]}, ${arr[2]}, ${arr[3]})`;
  }

  setMainColor(newColor: string): void {
    // Accept hex or rgba
    if (newColor.startsWith('#')) {
      const arr = this.#parseRgba(newColor);
      this.#targetMainColor = this.#rgbaToString(arr);
    } else {
      this.#targetMainColor = newColor;
    }
    this.#colorTransitionStart = performance.now();
    this.#colorTransitioning = true;
  }

  setSideColors(newColors: string[]): void {
    // Accept hex or rgba, and limit to original side color count
    const maxLen = this.#SIDE_COLORS.length;
    this.#targetSideColors = newColors.slice(0, maxLen).map(c =>
      c.startsWith('#') ? this.#rgbaToString(this.#parseRgba(c)) : c
    );
    this.#colorTransitionStart = performance.now();
    this.#colorTransitioning = true;
  }

  #config: Config = {
    nebulaCount: 20,
    starCount: 1200,
    globalAlpha: 0.5,
    minStarRadius: 0.5,
    maxStarRadius: 1.5,
    starSpeedFactor: 1.0,
    minStarAlpha: 0.1,
    minStarSizeFactor: 0.25,
    minInitialDist: 50,
    isReversed: false,
    mainColor: 'rgba(60, 0, 150, 1)',
    sideColors: [
      'rgba(200, 50, 100, 1)',
      'rgba(0, 180, 255, 1)',
      'rgba(255, 120, 0, 1)'
    ]
  };

  constructor(canvasElement: HTMLCanvasElement) {
    if (!canvasElement) return;
    
    this.#canvas = canvasElement;

    const context = this.#canvas.getContext('2d');
    if (!context) {
      console.error('2D context not available.');
      return;
    }
    this.#ctx = context;

    window.addEventListener('resize', this.#onResize.bind(this));
  }

  onGetConfig() {
    return this.#config;
  }

  onSetConfig(newConfig: Config, shouldRedraw = false) {
    this.#config = { ...this.#config, ...newConfig };

    // If mainColor or sideColors are set, update the colors and trigger transition
    if (newConfig.mainColor) {
      this.setMainColor(newConfig.mainColor);
    }
    if (newConfig.sideColors) {
      this.setSideColors(newConfig.sideColors);
    }

    if (this.#config.minStarRadius > this.#config.maxStarRadius) {
      this.#config.maxStarRadius = this.#config.minStarRadius;
    } else if (this.#config.maxStarRadius < this.#config.minStarRadius) {
      this.#config.minStarRadius = this.#config.maxStarRadius;
    }

    if (shouldRedraw) {
      this.onReDraw();
    }
  }

  onStart() {
    this.#setupCanvas();
    this.onReDraw();
    if (STATIC_MODE) {
      // 靜態模式下只畫一次，不啟動動畫
      this.#drawNebula();
      this.#drawStars();
    }
  }

  onStop() {
    if (this.#animationFrameId !== null) {
      cancelAnimationFrame(this.#animationFrameId);
      this.#animationFrameId = null;
    }
  }
  destroy() {
    this.onStop();
    window.removeEventListener('resize', this.#onResize.bind(this));
    if (this.#ctx && this.#canvas) {
      this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }
  }

  onReDraw() {
    this.onStop();
    // Only re-initialize nebula positions if not set or if count/size changed
    if (
      this.#nebulaPositions.length !== this.#config.nebulaCount ||
      this.#width !== (this.#canvas?.width ?? 0) / this.#dpr ||
      this.#height !== (this.#canvas?.height ?? 0) / this.#dpr
    ) {
      this.#initNebulaPositions();
    }
    this.#initNebula();
    this.#initStars();
    if (!STATIC_MODE) {
      this.#animationFrameId = requestAnimationFrame(this.#animate.bind(this));
    }
  }
  #onResize() {
    this.#setupCanvas();
    this.onReDraw();
  }

  #setupCanvas() {
    this.#dpr = window.devicePixelRatio || 1;
    this.#width = window.innerWidth;
    this.#height = window.innerHeight;

    if (this.#canvas && this.#ctx) {
      this.#canvas.style.width = this.#width + 'px';
      this.#canvas.style.height = this.#height + 'px';
      this.#canvas.width = this.#width * this.#dpr;
      this.#canvas.height = this.#height * this.#dpr;
      this.#ctx.scale(this.#dpr, this.#dpr);
    }

  }

  #initStars() {
    this.#stars = [];
    const { starCount, minStarRadius, maxStarRadius, minInitialDist } = this.#config;

    const centerX = this.#width / 2;
    const centerY = this.#height / 2;
    const maxInitialDist = Math.max(this.#width, this.#height) / 2;

    for (let i = 0; i < starCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      // Spread stars more evenly between minInitialDist and maxInitialDist
      const dist = minInitialDist + Math.random() * (maxInitialDist - minInitialDist);
      const radius = (maxStarRadius - minStarRadius) * Math.random() + minStarRadius;

      this.#stars.push({
        angle: angle,
        dist: dist,
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        radius: radius,
        twinkle: Math.random() < 0.1
      });
    }
  }

  #initNebulaPositions() {
    this.#nebulaPositions = [];
    const currentNebulaCount = this.#config.nebulaCount;
    for (let i = 0; i < currentNebulaCount; i++) {
      const x = Math.random() * this.#width;
      const y = Math.random() * this.#height;
      const radius = 200 + Math.random() * 300;
      const centerAlpha = 0.2 + Math.random() * 0.2;
      const middleAlpha = 0.05 + Math.random() * 0.1;
      this.#nebulaPositions.push({ x, y, radius, centerAlpha, middleAlpha });
    }
  }

  #initNebula() {
    this.#nebulaPatches = [];
    const allColors = [this.#MAIN_COLOR, ...this.#SIDE_COLORS];
    for (let i = 0; i < this.#nebulaPositions.length; i++) {
      const { x, y, radius, centerAlpha, middleAlpha } = this.#nebulaPositions[i];
      const baseColor = allColors[i % allColors.length];
      this.#nebulaPatches.push({ x, y, radius, baseColor, centerAlpha, middleAlpha });
    }
  }

  #drawNebula() {
    const currentGlobalAlpha = this.#config.globalAlpha;

    if (this.#ctx) {
      this.#ctx.fillStyle = '#0d001a';
      this.#ctx.fillRect(0, 0, this.#width, this.#height);

      this.#ctx.globalCompositeOperation = 'lighter';
      this.#ctx.globalAlpha = currentGlobalAlpha;
    }

    // Color transition logic
    let mainColor = this.#MAIN_COLOR;
    let sideColors = this.#SIDE_COLORS;
    if (this.#colorTransitioning) {
      const now = performance.now();
      const t = Math.min(1, (now - this.#colorTransitionStart) / this.#colorTransitionDuration);
      // Interpolate main color
      const fromMain = this.#parseRgba(this.#MAIN_COLOR);
      const toMain = this.#parseRgba(this.#targetMainColor);
      mainColor = this.#rgbaToString(this.#lerpColor(fromMain, toMain, t));
      // Interpolate side colors
      sideColors = this.#SIDE_COLORS.map((c, i) => {
        const from = this.#parseRgba(c);
        const to = this.#parseRgba(this.#targetSideColors[i] || c);
        return this.#rgbaToString(this.#lerpColor(from, to, t));
      });
      if (t >= 1) {
        this.#MAIN_COLOR = this.#targetMainColor;
        this.#SIDE_COLORS = [...this.#targetSideColors];
        this.#colorTransitioning = false;
      }
    }

    // Use transitioned colors for nebula
    const allColors = [mainColor, ...sideColors];
    this.#nebulaPatches.forEach((patch, idx) => {
      const { x, y, radius, centerAlpha, middleAlpha } = patch;
      // Assign color by patch index
      const baseColor = allColors[idx % allColors.length];
      if (this.#ctx) {
        const gradient = this.#ctx.createRadialGradient(x, y, 0, x, y, radius);
        // Parse baseColor to rgba array, but always use alpha from centerAlpha/middleAlpha
        const baseArr = this.#parseRgba(baseColor);
        // Only use RGB from baseArr, always use provided alpha
        const rgbWithAlpha = (arr: [number, number, number, number], alpha: number) =>
          `rgba(${arr[0]}, ${arr[1]}, ${arr[2]}, ${alpha})`;
        if (gradient) {
          gradient.addColorStop(0, rgbWithAlpha(baseArr, centerAlpha));
          gradient.addColorStop(0.7, rgbWithAlpha(baseArr, middleAlpha));
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }
        this.#ctx.fillStyle = gradient;
        this.#ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }
    });

    if (this.#ctx) {
      this.#ctx.globalAlpha = 1;
      this.#ctx.globalCompositeOperation = 'source-over';
    }
  }

  #updateStars(easeT: number = 1, useLerp: boolean = false) {
    const centerX = this.#width / 2;
    const centerY = this.#height / 2;
    const boundaryDist = Math.max(this.#width, this.#height) / 2 + 50;

    const { minInitialDist, isReversed } = this.#config;

    this.#stars.forEach(star => {
      if (useLerp && star._startDist !== undefined && star._targetDist !== undefined) {
        // 進度插值
        star.dist = star._startDist + (star._targetDist - star._startDist) * easeT;
      } else {
        // fallback: 原本的速度移動
        const starSpeedFactor = this.#config.starSpeedFactor;
        const speedFactor = starSpeedFactor * 0.0000001;
        const distForAccel = Math.max(1, Math.abs(star.dist));
        const acceleration = Math.pow(distForAccel, 2) * speedFactor;
        if (isReversed) {
          star.dist -= acceleration;
        } else {
          star.dist += acceleration;
        }
      }
      const currentDist = star.dist;
      star.x = centerX + Math.cos(star.angle) * currentDist;
      star.y = centerY + Math.sin(star.angle) * currentDist;

      if (!isReversed && star.dist > boundaryDist) {
        // Respawn at a random distance away from center, not just near center
        const maxInitialDist = Math.max(this.#width, this.#height) / 2;
        star.dist = minInitialDist + Math.random() * (maxInitialDist - minInitialDist);
        star.angle = Math.random() * Math.PI * 2;
      } else if (isReversed && star.dist < -minInitialDist) {
        star.dist = boundaryDist;
        star.angle = Math.random() * Math.PI * 2;
      }
    });
  }

  #drawStars() {
    const maxDrawDist = Math.max(this.#width, this.#height) / 2;

    const { minStarAlpha, minStarSizeFactor } = this.#config;
    const MIN_ALPHA = minStarAlpha;
    const MIN_SIZE_FACTOR = minStarSizeFactor;

    const MAX_ALPHA = 0.9;
    const MAX_SIZE_FACTOR = 1.0;

    this.#stars.forEach(star => {
      const effectiveDist = Math.abs(star.dist);

      // 1. 正規化距離: 0 (中心) 到 約 1.0 (邊緣)
      const normalizedDist = effectiveDist / maxDrawDist;

      // 2. 使用距離的平方來計算淡入係數
      const fadeFactor = Math.pow(normalizedDist, 2);

      // 3. 調整透明度 (Alpha)
      const alphaRange = MAX_ALPHA - MIN_ALPHA;
      const alpha = Math.min(MAX_ALPHA, MIN_ALPHA + fadeFactor * alphaRange);

      // 4. 調整尺寸
      const sizeRange = MAX_SIZE_FACTOR - MIN_SIZE_FACTOR;
      const currentRadius = star.radius * (MIN_SIZE_FACTOR + fadeFactor * sizeRange);

      if (effectiveDist < maxDrawDist + 50 && this.#ctx) {
        this.#ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        this.#ctx.beginPath();
        this.#ctx.arc(star.x, star.y, currentRadius, 0, Math.PI * 2);

        if (star.twinkle) {
          this.#ctx.shadowBlur = Math.random() * 5;
          this.#ctx.shadowColor = 'rgba(255, 255, 255, 1)';
        } else {
          this.#ctx.shadowBlur = 0;
        }

        this.#ctx.fill();
      }
    });
  }

  #animate = (now = performance.now()) => {
    if (now - this.#lastDrawTime > 1000 / this.#targetFPS) {
      this.#drawNebula();
      this.#updateStars();
      this.#drawStars();
      this.#lastDrawTime = now;
    }
    this.#animationFrameId = requestAnimationFrame(this.#animate);
  }
}

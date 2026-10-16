/**
 * Lightweight, dependency-free ISO/IEC 18004 QR Code matrix generator (Byte mode, ECC Level L).
 * Designed for generating scannable UPI QR codes on desktop without adding external npm dependencies.
 */

interface VersionSpec {
  version: number;
  totalCodewords: number;
  ecCodewordsPerBlock: number;
  numBlocks: number;
  alignmentCenters: number[];
}

const VERSION_SPECS: VersionSpec[] = [
  { version: 1, totalCodewords: 26, ecCodewordsPerBlock: 7, numBlocks: 1, alignmentCenters: [] },
  { version: 2, totalCodewords: 44, ecCodewordsPerBlock: 10, numBlocks: 1, alignmentCenters: [6, 18] },
  { version: 3, totalCodewords: 70, ecCodewordsPerBlock: 15, numBlocks: 1, alignmentCenters: [6, 22] },
  { version: 4, totalCodewords: 100, ecCodewordsPerBlock: 20, numBlocks: 1, alignmentCenters: [6, 26] },
  { version: 5, totalCodewords: 134, ecCodewordsPerBlock: 26, numBlocks: 1, alignmentCenters: [6, 30] },
  { version: 6, totalCodewords: 172, ecCodewordsPerBlock: 18, numBlocks: 2, alignmentCenters: [6, 34] },
  { version: 7, totalCodewords: 196, ecCodewordsPerBlock: 20, numBlocks: 2, alignmentCenters: [6, 22, 38] },
  { version: 8, totalCodewords: 242, ecCodewordsPerBlock: 24, numBlocks: 2, alignmentCenters: [6, 24, 42] },
  { version: 9, totalCodewords: 292, ecCodewordsPerBlock: 30, numBlocks: 2, alignmentCenters: [6, 26, 46] }
];

const VERSION_INFO_BITS: Record<number, number> = {
  7: 0x07c94,
  8: 0x085bc,
  9: 0x09a99
};

export function generateQrMatrix(text: string): boolean[][] {
  const bytes = new TextEncoder().encode(text);

  // Pick smallest version that fits bytes in Byte mode (4 bit mode + 8 bit length + data)
  let spec = VERSION_SPECS[VERSION_SPECS.length - 1];
  for (const candidate of VERSION_SPECS) {
    const dataCapacity = candidate.totalCodewords - candidate.ecCodewordsPerBlock * candidate.numBlocks;
    if (bytes.length + 2 <= dataCapacity) {
      spec = candidate;
      break;
    }
  }

  const dataCapacity = spec.totalCodewords - spec.ecCodewordsPerBlock * spec.numBlocks;
  const bitBuffer: number[] = [];

  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bitBuffer.push((val >>> i) & 1);
    }
  };

  // Byte mode indicator (0100)
  pushBits(0b0100, 4);
  // Character count (8 bits for versions 1-9)
  pushBits(bytes.length, 8);
  // Payload bytes
  for (const b of bytes) {
    pushBits(b, 8);
  }

  // Terminator (up to 4 zero bits)
  const maxBits = dataCapacity * 8;
  const termLen = Math.min(4, maxBits - bitBuffer.length);
  pushBits(0, termLen);

  // Pad to byte boundary
  while (bitBuffer.length % 8 !== 0) {
    bitBuffer.push(0);
  }

  // Convert bits to data codewords
  const dataCodewords: number[] = [];
  for (let i = 0; i < bitBuffer.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | bitBuffer[i + j];
    }
    dataCodewords.push(byte);
  }

  // Pad codewords alternating 0xEC and 0x11
  let padToggle = true;
  while (dataCodewords.length < dataCapacity) {
    dataCodewords.push(padToggle ? 0xec : 0x11);
    padToggle = !padToggle;
  }

  // Split into blocks & compute Reed-Solomon EC codewords
  const dataPerBlock = dataCapacity / spec.numBlocks;
  const dataBlocks: number[][] = [];
  const ecBlocks: number[][] = [];

  for (let b = 0; b < spec.numBlocks; b++) {
    const block = dataCodewords.slice(b * dataPerBlock, (b + 1) * dataPerBlock);
    dataBlocks.push(block);
    ecBlocks.push(computeReedSolomon(block, spec.ecCodewordsPerBlock));
  }

  // Interleave data blocks then EC blocks
  const finalCodewords: number[] = [];
  for (let i = 0; i < dataPerBlock; i++) {
    for (let b = 0; b < spec.numBlocks; b++) {
      finalCodewords.push(dataBlocks[b][i]);
    }
  }
  for (let i = 0; i < spec.ecCodewordsPerBlock; i++) {
    for (let b = 0; b < spec.numBlocks; b++) {
      finalCodewords.push(ecBlocks[b][i]);
    }
  }

  // Build matrix
  const size = 17 + spec.version * 4;
  const modules: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const setFunctionModule = (r: number, c: number, dark: boolean) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      modules[r][c] = dark;
      isFunction[r][c] = true;
    }
  };

  // Finder patterns + separators
  const drawFinder = (row: number, col: number) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const r = row + dr;
        const c = col + dc;
        if (r < 0 || r >= size || c < 0 || c >= size) continue;
        const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
        const onBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const inInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        setFunctionModule(r, c, inOuter && (onBorder || inInner));
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    setFunctionModule(6, i, i % 2 === 0);
    setFunctionModule(i, 6, i % 2 === 0);
  }

  // Alignment patterns
  const centers = spec.alignmentCenters;
  for (const r of centers) {
    for (const c of centers) {
      if (
        (r === 6 && c === 6) ||
        (r === 6 && c === size - 7) ||
        (r === size - 7 && c === 6)
      ) {
        continue;
      }
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const dark = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
          setFunctionModule(r + dr, c + dc, dark);
        }
      }
    }
  }

  // Reserve format information areas
  for (let i = 0; i <= 8; i++) {
    if (i !== 6) {
      isFunction[8][i] = true;
      isFunction[i][8] = true;
    }
  }
  for (let i = 0; i < 8; i++) {
    isFunction[8][size - 1 - i] = true;
    isFunction[size - 1 - i][8] = true;
  }
  // Always dark module
  setFunctionModule(size - 8, 8, true);

  // Version information for versions 7..9
  if (spec.version >= 7) {
    const vBits = VERSION_INFO_BITS[spec.version];
    for (let i = 0; i < 18; i++) {
      const bit = ((vBits >>> i) & 1) === 1;
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      setFunctionModule(a, b, bit);
      setFunctionModule(b, a, bit);
    }
  }

  // Place data bits in upward/downward 2-column zig-zag
  let bitIdx = 0;
  const totalBits = finalCodewords.length * 8;
  let upward = true;

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      const r = upward ? size - 1 - vert : vert;
      for (let j = 0; j < 2; j++) {
        const c = right - j;
        if (!isFunction[r][c]) {
          let dark = false;
          if (bitIdx < totalBits) {
            const cw = finalCodewords[bitIdx >>> 3];
            dark = ((cw >>> (7 - (bitIdx & 7))) & 1) === 1;
            bitIdx++;
          }
          // Apply Mask 0: (r + c) % 2 === 0
          if ((r + c) % 2 === 0) {
            dark = !dark;
          }
          modules[r][c] = dark;
        }
      }
    }
    upward = !upward;
  }

  // Format information for Level L (01) + Mask 0 (000) -> 0x77C4
  const formatBits = 0x77c4;
  for (let i = 0; i <= 5; i++) {
    setFunctionModule(8, i, ((formatBits >>> i) & 1) === 1);
  }
  setFunctionModule(8, 7, ((formatBits >>> 6) & 1) === 1);
  setFunctionModule(8, 8, ((formatBits >>> 7) & 1) === 1);
  setFunctionModule(7, 8, ((formatBits >>> 8) & 1) === 1);
  for (let i = 9; i < 15; i++) {
    setFunctionModule(14 - i, 8, ((formatBits >>> i) & 1) === 1);
  }

  for (let i = 0; i < 8; i++) {
    setFunctionModule(size - 1 - i, 8, ((formatBits >>> i) & 1) === 1);
  }
  for (let i = 8; i < 15; i++) {
    setFunctionModule(8, size - 15 + i, ((formatBits >>> i) & 1) === 1);
  }

  return modules;
}

function computeReedSolomon(data: number[], degree: number): number[] {
  const gfExp = new Uint8Array(512);
  const gfLog = new Uint8Array(256);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    gfExp[i] = x;
    gfLog[x] = i;
    x <<= 1;
    if (x & 0x100) {
      x ^= 0x11d;
    }
  }
  for (let i = 255; i < 512; i++) {
    gfExp[i] = gfExp[i - 255];
  }

  const gfMul = (a: number, b: number): number => {
    if (a === 0 || b === 0) return 0;
    return gfExp[gfLog[a] + gfLog[b]];
  };

  // Generator polynomial
  let gen = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(gen.length + 1).fill(0);
    const root = gfExp[i];
    for (let j = 0; j < gen.length; j++) {
      next[j] ^= gen[j];
      next[j + 1] ^= gfMul(gen[j], root);
    }
    gen = next;
  }

  const remainder = new Array(degree).fill(0);
  for (const byte of data) {
    const factor = byte ^ remainder[0];
    remainder.shift();
    remainder.push(0);
    if (factor !== 0) {
      for (let j = 0; j < degree; j++) {
        remainder[j] ^= gfMul(gen[j + 1], factor);
      }
    }
  }

  return remainder;
}

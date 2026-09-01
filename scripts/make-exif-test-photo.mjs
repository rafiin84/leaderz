import { writeFileSync } from 'node:fs'
// Build a JPEG carrying a real EXIF APP1 segment: IFD0 + ExifIFD + GPS IFD.
const LE = true
const buf = Buffer.alloc(4096)
let end = 0
const u16 = (o, v) => { buf.writeUInt16LE(v, o); return o + 2 }
const u32 = (o, v) => { buf.writeUInt32LE(v, o); return o + 4 }

// fixed layout (offsets relative to TIFF header start)
const IFD0 = 8, EXIFIFD = 62, GPSIFD = 152
let d = 230                                  // data area cursor
const alloc = (bytes) => { const at = d; d += bytes; return at }
const writeAscii = (s) => { const at = alloc(s.length + 1); buf.write(s, at, 'ascii'); buf[at + s.length] = 0; return at }
const writeRational = (n, den) => { const at = alloc(8); u32(at, n); u32(at + 4, den); return at }
const writeRationals = (list) => { const at = d; for (const [n, den] of list) writeRational(n, den); return at }

// --- data area values
const makeOff  = writeAscii('Apple')
const modelOff = writeAscii('iPhone 15 Pro')
const dtoOff   = writeAscii('2026:08:24 07:41:12')
const expOff   = writeRational(1, 125)          // 1/125s
const fnumOff  = writeRational(18, 10)          // f/1.8
const focalOff = writeRational(24, 1)           // 24mm
const latRefOff = writeAscii('N')
const latOff   = writeRationals([[8,1],[57,1],[3384,100]])   // 8.9594 N
const lonRefOff = writeAscii('E')
const lonOff   = writeRationals([[77,1],[18,1],[5472,100]])  // 77.3152 E
const altOff   = writeRational(1428, 10)        // 142.8 m

const entry = (o, tag, type, count, valueWriter) => {
  o = u16(o, tag); o = u16(o, type); o = u32(o, count); valueWriter(o); return o + 4
}
const asOffset = (off) => (o) => u32(o, off)
const asShort  = (v)  => (o) => { u16(o, v); u16(o + 2, 0) }
const asLong   = (v)  => (o) => u32(o, v)
const asByte   = (v)  => (o) => { buf[o] = v; buf[o+1]=0; buf[o+2]=0; buf[o+3]=0 }

// --- IFD0
let o = u16(IFD0, 4)
o = entry(o, 0x010F, 2, 6,  asOffset(makeOff))    // Make
o = entry(o, 0x0110, 2, 14, asOffset(modelOff))   // Model
o = entry(o, 0x8769, 4, 1,  asLong(EXIFIFD))      // ExifIFDPointer
o = entry(o, 0x8825, 4, 1,  asLong(GPSIFD))       // GPSInfoIFDPointer
u32(o, 0)

// --- ExifIFD
o = u16(EXIFIFD, 7)
o = entry(o, 0x9003, 2, 20, asOffset(dtoOff))     // DateTimeOriginal
o = entry(o, 0x829A, 5, 1,  asOffset(expOff))     // ExposureTime
o = entry(o, 0x829D, 5, 1,  asOffset(fnumOff))    // FNumber
o = entry(o, 0x8827, 3, 1,  asShort(64))          // ISO
o = entry(o, 0x920A, 5, 1,  asOffset(focalOff))   // FocalLength
o = entry(o, 0xA002, 4, 1,  asLong(4032))         // PixelXDimension
o = entry(o, 0xA003, 4, 1,  asLong(3024))         // PixelYDimension
u32(o, 0)

// --- GPS IFD
o = u16(GPSIFD, 6)
o = entry(o, 0x0001, 2, 2, asOffset(latRefOff))
o = entry(o, 0x0002, 5, 3, asOffset(latOff))
o = entry(o, 0x0003, 2, 2, asOffset(lonRefOff))
o = entry(o, 0x0004, 5, 3, asOffset(lonOff))
o = entry(o, 0x0005, 1, 1, asByte(0))             // above sea level
o = entry(o, 0x0006, 5, 1, asOffset(altOff))
u32(o, 0)

// TIFF header
u16(0, 0x4949); u16(2, 42); u32(4, IFD0)
const tiff = buf.subarray(0, d)

const exifPayload = Buffer.concat([Buffer.from('Exif\0\0', 'ascii'), tiff])
const app1 = Buffer.concat([
  Buffer.from([0xFF, 0xE1]),
  Buffer.from([(exifPayload.length + 2) >> 8, (exifPayload.length + 2) & 0xff]),
  exifPayload,
])

// minimal but valid 1x1 grayscale JPEG scaffolding around our APP1
const tail = Buffer.from(
  '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a' +
  'HBwcJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPDQ0NP/AABEIAAEAAQMBIgACEQEDEQH/xAAfAAAB' +
  'BQEBAQEBAQAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFB' +
  'BhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RV' +
  'VldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrC' +
  'w8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/aAAwDAQACEQMRAD8A9/ooooA/' +
  '/9k=', 'base64')

// splice APP1 in right after SOI (first 2 bytes)
const out = Buffer.concat([tail.subarray(0, 2), app1, tail.subarray(2)])
writeFileSync(process.env.OUT, out)
console.log('wrote', process.env.OUT, out.length, 'bytes')

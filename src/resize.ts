import * as fsSync from "fs";
import * as fsAsync from "fs/promises";
import path from "path";
import sharp from "sharp";

const dpi = 300; // Dots per inch
const mmToInches = (mm: number) => mm / 25.4;
const inchesToPixels = (inches: number) => Math.round(inches * dpi);

async function resize(tagFile: string, outputSize: number) {
    try {
        const image = sharp(tagFile);
        const outputSizeInches = mmToInches(outputSize);
        const outputWidthPixels = inchesToPixels(outputSizeInches);
        const outputHeightPixels = inchesToPixels(outputSizeInches);

        return await image.resize(outputWidthPixels, outputHeightPixels, { kernel: sharp.kernel.nearest })
            .toFormat('png')
            .toBuffer();
    } catch (error) {
        console.error('Error converting AprilTag to SVG:', error);
    }
}

async function convertToSVG(buf: Buffer, width: number, height: number) {
    const image = sharp(buf);
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

    const getPixelRGBA = (x: number, y: number) => {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3] / 255;
        return `rgba(${r},${g},${b},${a})`;
    };

    const generateGridSquare = (x: number, y: number) => {
        const rgba = getPixelRGBA(x, y);
        const id = `box${x}-${y}`;
        return `<rect width="1" height="1" x="${x}" y="${y}" fill="${rgba}" id="${id}"/>`;
    };

    let svgText = '<?xml version="1.0" standalone="no"?>\n';
    svgText += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n';
    svgText += `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">\n`;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            svgText += `  ${generateGridSquare(x, y)}\n`;
        }
    }

    svgText += '</svg>\n';

    return svgText;
}

async function main() {
    if (process.argv.length < 4) {
        throw new Error(`Missing parameter(s)`);
    }
    const family = process.argv[2];
    const size = parseFloat(process.argv[3]);
    const inDir = path.join(`data`, family);

    if (!fsSync.existsSync(inDir))
        throw new Error(`Input file/directory does not exist`);
    // const outputSizeInches = mmToInches(size);
    // const outputWidthPixels = inchesToPixels(outputSizeInches);
    // const outputHeightPixels = inchesToPixels(outputSizeInches);

    const inFiles = await fsAsync.readdir(inDir, { encoding: `utf-8` });

    const outDir = path.join(`dist`, family);
    if (!fsSync.existsSync(outDir))
        await fsAsync.mkdir(outDir, { recursive: true });

    new Promise(() => inFiles.forEach(async (val) => {
        const buf = await resize(path.join(inDir, val), size);
        if (!buf) return;
        await fsAsync.writeFile(path.join(outDir, val), buf);
        //const svgStr = await convertToSVG(buf, outputWidthPixels, outputHeightPixels);
        //fsSync.writeFileSync(path.join(`resized`, family, `svg`, val.replace(/\.png$/, '.svg')), svgStr, { encoding: `utf-8` });
        //console.log(`Resized tag ${val} to size ${size}mm`);
    }))
        .then()
        .catch((err) => console.error(err));

    return;
}

await main();
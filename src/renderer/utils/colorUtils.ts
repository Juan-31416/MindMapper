import { ALL_STANDARD_COLORS } from "../types/mindmap";

/**************************************
 *         FORMAT CONVERSION
 ************************************** */

export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const sanitized = hex.trim().replace(/^#/, '');

    // Expand shorthand #RGB -> #RRGGBB
    const normalized = 
    sanitized.length === 3
      ? sanitized
          .split('')
          .map((c) => c + c)
          .join('')
      : sanitized;
    
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);

    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));

    return (
        '#' +
        [clamp(r), clamp(g), clamp(b)]
          .map((v) => v.toString(16).padStart(2,'0'))
          .join('')
          .toUpperCase()
    );
};



/**************************************
 *            VALIDATION
 ************************************** */

export const isValidHex = (value: string): boolean => /^#?([a-f\d]{3}|[a-f\d]{6})$/i.test(value.trim());

export const isValidRgb = (value:string): boolean => /^rgba?\(\s*(\d{1,3}%?\s*,\s*){2}\d{1,3}%?\s*(,\s*(0|1|0?\.\d+)\s*)?\)$/i.test(value.trim());

export const isValidColorInput = (value: string): boolean => isValidHex(value) || isValidRgb(value);



/**************************************
 *             PARSING
 ************************************** */

export const parseColorInput = (value: string): string | null => {
    const trimmed =value.trim();

    // --- HEX path ---
    if (isValidHex(trimmed)) {
        const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
        const rgb = hexToRgb(withHash);
        return rgb ? rgbToHex(rgb.r, rgb.g, rgb.b) : null;
    }

    // --- RGB / RGBA path ---
    if (isValidRgb(trimmed)) {
        const match = trimmed.match(/rgba?\(\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?/i);
        if (!match) return null;

        let [r, g, b] = [Number(match[1]), Number(match[2]), Number(match[3])];

        // Handle percentage channels
        if (trimmed.includes('%')) {
            r = Math.round((r / 100) * 255);
            g = Math.round((g / 100) * 255);
            b = Math.round((b / 100) * 255);
        }

        return rgbToHex(r, g, b);
    }

    return null;  
};

export const normalizeHex = (hex: string): string => {
    const withHash =hex.trim().startsWith('#')? hex.trim() : `#${hex.trim()}`;

    return withHash.toUpperCase();
};



/**************************************
 *          PALETTE HELPERS
 ************************************** */
export const isStandardColor = (hex:string): boolean => ALL_STANDARD_COLORS.includes(normalizeHex(hex) as string);



/**************************************
 *          ACCESSIBILITY
 ************************************** */

export const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
        const sRGB = v /= 255;
        return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const getContrastTextColor = (style: {
    backgroundColor: string;
    backgroundType: string;
    backgroundOpacity: number;
}): string => {
    if (style.backgroundType === 'none' || style.backgroundOpacity < 40) {
        return '#1F2937';
    }

    const luminance = getLuminance(style.backgroundColor);

    return luminance > 0.5 ? '#1F2937' : '#FFFFFF';
};



// FUTURE
/**************************************
 *       IMAGE COLOR EXTRACTION
 ************************************** */

/**
 * Contract for future image-based color extraction.
 *
 * Implementation plan:
 *  1. User selects an image file via a native file dialog (IPC: file:openImageDialog).
 *  2. Main process reads the file and passes the buffer to the renderer via IPC.
 *  3. This function receives the File/Blob and uses `node-vibrant` (or equivalent)
 *     to extract the dominant color swatches.
 *  4. Extracted colors are returned as hex strings and offered to the user
 *     to add to their favorites or apply directly to a node.
 *
 * NOTE: `node-vibrant` must run in the main process (Node.js context) and
 * return results via IPC to keep the renderer sandboxed.
 * The renderer-side signature below is intentionally kept simple.
 *
 * @param _file - The image File object selected by the user.
 * @returns Promise resolving to an array of up to 6 dominant hex color strings.
 */

export const extractColorsFromImage = async (
    _file: File
  ): Promise<string[]> => {
    // TODO: Implement via IPC call to main process using node-vibrant.
    // Example IPC call (to be added to preload.ts and main.ts):
    //   const buffer = await file.arrayBuffer();
    //   const result = await window.electronAPI.color.extractFromImage(buffer);
    //   return result.colors; // string[]
    throw new Error('extractColorsFromImage is not yet implemented. See colorUtils.ts for the implementation plan.');
  };
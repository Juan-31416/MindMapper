import { parse } from "path";

export const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

export const getContrastTextColor = (style: any): string => {
    if (style.backgroundType === 'none' || style.backgroundOpacity < 40) {
        return '#1F2937';
    }

    const luminance = getLuminance(style.backgroundColor);

    return luminance > 0.5 ? '#1F2937' : '#FFFFFF';
};
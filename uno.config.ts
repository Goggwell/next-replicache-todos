import { defineConfig, presetAttributify, presetIcons, presetUno, presetWebFonts } from 'unocss';

export default defineConfig({
    presets: [
        presetAttributify(),
        presetIcons(),
        presetUno(),
        presetWebFonts(),
    ],
});
# ADR 002: Personalización de fondo de nodo y contraste automático (Issue #5)

**Fecha:** 2026-06-14  
**Estado:** Accepted / Implemented  
**Issue:** [#5: Node background personalization — transparency, no-background, border options]

### Contexto y enunciado del problema

Los nodos de MindMapper carecían de opciones de personalización suficientemente flexibles para los fondos y bordes: no existían capas de transparencia configurables, una opción explícita de “sin fondo” ni estilos de borde (ninguno / inferior / completo). Además, al dejar el fondo en transparente (o bajar mucho la opacidad) el texto permanecía en blanco en algunos casos, perdiendo legibilidad sobre el canvas.

Objetivo: permitir personalización de fondo y borde por nodo (persistida en SQLite), y garantizar legibilidad automática del texto (contraste) cuando el fondo se elimina o su opacidad baja por debajo de un umbral.

---

### Cambios propuestos y decisiones técnicas

1. Tipado — extensión del modelo de estilos
   - Se extiende la interfaz `NodeStyle` con tres nuevos campos:
     - `backgroundType: 'solid' | 'none'` (semántico: distingue "sin fondo" de opacidad 0).
     - `backgroundOpacity: number` (0-100). Separado del color para simplificar la UI.
     - `borderStyle: 'none' | 'bottom' | 'full'`.
     - `borderColor?: string`
     - `borderWidth?: number`
   - Valores por defecto (compatibilidad hacia atrás):
     - `backgroundType = 'solid'`
     - `backgroundOpacity = 100`
     - `borderStyle = 'full'`

2. Contraste automático (regla visual)
   - Nueva función utilitaria `getContrastTextColor(style)` determinística:
     - Si `backgroundType === 'none'` → devuelve negro (`#111111`).
     - Si `backgroundOpacity < 40` → devuelve negro (`#111111`).
     - En otro caso calcula luminancia relativa del `backgroundColor` y devuelve:
       - `#111111` si luminancia > 0.5 (fondo claro).
       - `#FFFFFF` si fondo oscuro.
   - Decisión de umbral: 40% (consensuado con el equipo).
   - Razonamiento: evitar problemas de accesibilidad y legibilidad en nodos sin fondo o semitransparentes.

3. Renderizado y persistencia
   - El renderer (SVG) no debe confiar en `node.style.textColor` para la representación final cuando se usa `auto-contrast`. En su lugar:
     - Se calcula `textColor = getContrastTextColor(node.style)` y se usa en:
       - Icono (ya corregido).
       - Texto SVG (`<text fill={textColor}>`).
       - Textarea dentro de `<foreignObject>` en modo edición (`style.color = textColor`).
   - Borde:
     - Cuando `borderStyle === 'full'` → rect con `stroke = borderColor || backgroundColor` y `strokeWidth = borderWidth || 2`.
     - Cuando `borderStyle === 'bottom'` → `line` en la parte inferior del rect.
     - `borderColor` por defecto hereda `backgroundColor` si no está definido.
     - Importante decisión: la opacidad del borde se mantiene al 100% del color base (no heredamos la opacidad del fondo) para mantener la delimitación estructural clara incluso si el fondo es transparente.

4. UX / Editor
   - El editor de nodos (`NodeEditor.tsx`) provee controles compactos estilo “Canva”:
     - Selección de color
     - Slider de opacidad (0–100) y checkbox “Sin fondo” que establece `backgroundType: 'none'`.
     - Selector de estilo de borde y ancho.
   - La UI envía cambios al store de forma reactiva y el renderer aplica la lógica de contraste en tiempo real.

5. Código utilitario y ubicación
   - Nuevo util en `src/renderer/utils/colorUtils.ts` con:
     - `hexToRgb(hex: string) => {r,g,b} | null`
     - `getRelativeLuminance(hex: string) => number`
     - `getContrastTextColor(style: NodeStyle) => string`
   - Motivo: mantener la lógica de color centralizada y reutilizable.

---

### Implementación (resumen de cambios en archivos)

- `src/renderer/types/mindmap.ts`
  - Extensión de `NodeStyle` para incluir `backgroundType`, `backgroundOpacity`, `borderStyle`, `borderColor`, `borderWidth`.
  - Actualizar `DEFAULT_NODE_STYLE` con los valores por defecto.

- `src/renderer/utils/colorUtils.ts` (nuevo)
  - Implementa `hexToRgb`, `getRelativeLuminance`, `getContrastTextColor`.

  Ejemplo (extracto):

  ```ts
  export const hexToRgb = (hex: string) => { /* ... */ };

  export const getRelativeLuminance = (hex: string) => { /* ... */ };

  export const getContrastTextColor = (style: NodeStyle) => {
    const backgroundType = style.backgroundType ?? 'solid';
    const opacity = style.backgroundOpacity ?? 100;
    const color = style.backgroundColor ?? '#FFFFFF';

    if (backgroundType === 'none' || opacity < 40) return '#111111';
    const lum = getRelativeLuminance(color);
    return lum > 0.5 ? '#111111' : '#FFFFFF';
  };
  ```

- `src/renderer/components/Canvas.tsx`
  - Uso de `getContrastTextColor(node.style)` dentro del render por cada nodo:
    - `const textColor = getContrastTextColor(node.style);`
  - Reemplazar usos directos de `node.style.textColor` por `textColor` en:
    - Icono: `color={textColor}`
    - Modo edición `<textarea>`: `style={{ color: textColor }}`
    - Texto SVG: `fill={textColor}`
  - Render del fondo:
    - `fill={node.style.backgroundColor}`
    - `fillOpacity={ node.style.backgroundType === 'none' ? 0 : (node.style.backgroundOpacity ?? 100) / 100 }`
  - Render de borde:
    - `stroke` = `node.style.borderColor || node.style.backgroundColor`
    - Si `borderStyle === 'bottom'` → renderizar `<line ... stroke={...} strokeWidth={...} />`

- `src/renderer/components/NodeEditor.tsx` (+ popovers)
  - Controles compactos para color, opacidad, “sin fondo” y estilos de borde.
  - Patch handler para aplicar cambios parciales a `node.style` y persistir en SQLite a través del store.

- `src/renderer/store/mindMapStore.ts`
  - Asegurar que el store persiste las nuevas propiedades del estilo.
  - Migration simple: al cargar nodos antiguos, rellenar con los defaults.

---

### Consecuencias

Positivas:
- Mayor flexibilidad de personalización por nodo.
- Legibilidad garantizada cuando el fondo se quita o la opacidad es baja.
- UX consistente: el editor y el renderer usan la misma lógica de contraste centralizada.

Negativas / Trade-offs:
- Lógica adicional en renderer: mínimo coste computacional por llamada a `getContrastTextColor`. Es un cálculo trivial y no representa un cuello de botella (se puede memoizar si fuese necesario).
- Persistencia de más campos (mayor esquema en SQLite).

---

### Alternativas consideradas

- Forzar al usuario a elegir manualmente `textColor` (rechazado): añade fricción y errores de legibilidad.
- Heredar opacidad del borde (rechazado): reduce visibilidad de estructura cuando fondo es transparente.
- Calcular y persistir `textColor` en el store (rechazado por ahora): preferimos mantener `textColor` como campo de override manual, pero que el renderer domine la decisión visual por defecto. Se deja posibilidad de `textColorMode: 'auto' | 'manual'` para una futura mejora.

---

### Migración y compatibilidad hacia atrás

- Al cargar mapas sin los nuevos campos:
  - `backgroundType` → `'solid'`
  - `backgroundOpacity` → `100`
  - `borderStyle` → `'full'`
  - `borderColor` → si no existe, se toma `backgroundColor` en tiempo de render
- El store aplica un patch inicial al map al abrir para normalizar el shape (no destructivo).

---

### Pruebas y QA

Casos de prueba mínimos:

1. Nodo con `backgroundType: 'none'` → El icono y el texto deben ser negros.
2. Nodo con `backgroundOpacity: 30` y `backgroundType: 'solid'` → texto e icono negros.
3. Nodo con fondo claro (`#F6F6F6`) opacidad 100 → texto negro.
4. Nodo con fondo oscuro (`#1F2937`) opacidad 100 → texto blanco.
5. `borderStyle: 'bottom'` → renderiza línea inferior correcta (2–3px).
6. `borderStyle: 'full'` → rect con stroke visible y 100% opacidad.
7. Edición in-place (foreignObject textarea): el color del texto debe coincidir con el render (sin salto visual).
8. Guardado / recarga del mapa: los estilos se mantienen y los nodos sin campos nuevos reciben defaults.

Se recomienda añadir tests visuales end-to-end (Cypress + snapshot) para confirmar comportamiento del color en diferentes combinaciones.

---

### Notas de UX

- En la UI, la opción “Sin fondo” debe sincronizarse con el slider de opacidad: marcar “Sin fondo” pone opacidad a 0 y deshabilita el slider; desmarcar restaura opacidad previa (estado temporal en el editor).
- Popovers compactos estilo “Canva” mejoran accesibilidad y evitan saturación visual en el panel lateral.
- Se deja espacio para futura opción “Forzar contraste WCAG AA” si se requiere conformidad accesible estricta.

---

### Siguientes pasos / mejoras futuras

1. Añadir `textColorMode: 'auto' | 'manual'` para permitir override persistido por el usuario.
2. Memoizar `getContrastTextColor` por combinación (color + opacity + type) si se detecta sobrecarga en mapas muy grandes.
3. Añadir checks automáticos de contraste y sugerencias en el NodeEditor (p. ej. “Contraste bajo — sugerir texto negro”).
4. Exportación: comprobar que PNG/SVG export contienen el mismo resultado visual (especialmente con `foreignObject` en editores que los ignoren).

---

### Conclusión

Se ha introducido un modelo de estilos de nodo más expresivo y seguro, resolviendo la pérdida de legibilidad al eliminar el fondo o reducir opacidad. La lógica de contraste está centralizada en un util reutilizable y el renderer usa esa decisión en todos los puntos de dibujo (icono, texto y edición), garantizando coherencia visual inmediata. La migración es compatible con mapas existentes y se han establecido pruebas y pasos futuros para robustecer la solución.

---


# Importar y exportar

> **Versión:** v0.2 (beta)

MindMapper te permite traer contenido de otros formatos de archivo y exportar tus mapas para compartirlos o archivarlos.

---

## Formatos compatibles de un vistazo

| Formato | Importar | Exportar | Notas |
|---|---|---|---|
| `.mindmap.json` | ✅ (mediante Abrir) | ✅ (mediante Guardar) | Formato nativo de MindMapper — conserva todo |
| `.json` | ✅ | ✅ | Instantánea JSON independiente |
| `.md` / `.markdown` | ✅ | — | Convierte la estructura de encabezados en un mapa |
| PDF | — | ✅ | Landscape A4, calidad vectorial |

---

## Importar un archivo

### Abrir un archivo nativo de MindMapper (`.mindmap.json`)

Usa **Archivo > Abrir…** (File > Open…) o pulsa **Ctrl + O**. Selecciona un archivo `.mindmap.json` en el diálogo. Esto restaura tu mapa exactamente — posiciones de nodos, colores, iconos, estado y estructura quedan intactos.

### Abrir un archivo JSON (`.json`)

Usa **File > Open…** y selecciona un archivo `.json`. El archivo debe contener una estructura de árbol de nodos compatible.

### Abrir un archivo Markdown (`.md` o `.markdown`)

Usa **File > Open…** y selecciona un archivo `.md` o `.markdown`. MindMapper lee la jerarquía de encabezados y la convierte en un mapa mental:

| Nivel de Markdown | Se convierte en |
|---|---|
| `# Encabezado 1` | Nodo raíz |
| `## Encabezado 2` | Hijo de primer nivel |
| `### Encabezado 3` | Hijo de segundo nivel |
| … y así sucesivamente | Hijos más profundos |

> **Nota:** Solo se importan el texto y los niveles de encabezado. El formato (negrita, cursiva), los enlaces, las imágenes y los bloques de código no se convierten.

[SCREENSHOT: Un archivo Markdown a la izquierda y el mapa mental resultante a la derecha]

---

## Exportar el mapa

### Exportar a JSON

**Archivo > Exportar > Exportar a JSON…** (File > Export > Export to JSON…)

Guarda una instantánea independiente de todo el mapa en formato `.json`. Útil para copias de seguridad, procesamiento programático o compartir datos del mapa en un formato portable.

### Exportar a PDF

**Archivo > Exportar > Exportar a PDF…** (File > Export > Export to PDF…) o pulsa **Ctrl + E**.

Guarda tu mapa como un PDF de alta calidad en formato **landscape A4** con renderizado vectorial. El PDF refleja el estado actual del lienzo — lo que es visible es lo que se exporta.

> 💡 **Consejo:** Antes de exportar a PDF, pulsa **Ctrl + 1** (Fit to Screen) para asegurarte de que todos los nodos son visibles, y cambia a la distribución que quede mejor para compartir.

[SCREENSHOT: Un PDF exportado visto en un lector de PDF, mostrando el mapa mental en orientación apaisada]

---

## Guardar vs. exportar

Son dos acciones diferentes:

| Acción | Atajo | Propósito |
|---|---|---|
| **Guardar** | **Ctrl + S** | Guarda tu copia de trabajo como `.mindmap.json` para seguir editando |
| **Exportar a JSON** | Menú Archivo | Guarda una instantánea portable para compartir o procesar |
| **Exportar a PDF** | **Ctrl + E** | Crea una imagen imprimible / compartible del mapa |

---

## Consulta también

- [Crear y gestionar mapas](crear-mapas.md)
- [Atajos de teclado](atajos-de-teclado.md)

---

*← [Volver al índice de documentación](index.md)*

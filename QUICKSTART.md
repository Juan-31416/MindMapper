# Guía rápida de MindMapper

Esta guía explica los primeros pasos sin entrar en detalles técnicos. Sirve para abrir la aplicación, crear un primer mapa mental, guardarlo y compartirlo.

## 1. Abrir MindMapper

Si solo quieres usar la aplicación:

1. Ve a la página de [Releases](https://github.com/Juan-31416/MindMapper/releases).
2. Descarga el instalador de tu sistema:
   - Windows: archivo `MindMapper Setup.exe`.
   - macOS: archivo `.dmg`.
   - Linux: archivo `.AppImage` o `.deb`.
3. Abre el instalador o ejecutable y sigue los pasos habituales de tu sistema.

Si vas a trabajar desde el código fuente, consulta [Ejecutar desde el código fuente](#ejecutar-desde-el-código-fuente).

## 2. Crear tu primer mapa

Al abrir MindMapper verás un mapa inicial de bienvenida. Puedes usarlo para practicar o crear uno nuevo.

Para crear un mapa sencillo:

1. Pulsa **New** para crear un mapa nuevo.
2. Escribe la idea principal en el nodo central.
3. Selecciona el nodo central y pulsa `Tab` para crear una idea hija.
4. Pulsa `Enter` para crear otra idea al mismo nivel.
5. Haz doble clic en cualquier nodo para cambiar su texto.

Ejemplo:

```text
Planificar vacaciones
├── Destino
├── Presupuesto
├── Transporte
└── Actividades
```

## 3. Moverse por el mapa

- Arrastra el fondo del mapa para moverte por el lienzo.
- Usa el zoom para acercarte o alejarte cuando el mapa crezca.
- Pulsa `Ctrl+1` para ajustar el mapa completo a la pantalla.
- Colapsa ramas cuando quieras ocultar detalles y centrarte en una parte.

## 4. Editar y organizar ideas

Las acciones básicas son:

| Acción | Cómo hacerlo |
| --- | --- |
| Crear una idea hija | Selecciona un nodo y pulsa `Tab` |
| Crear una idea hermana | Selecciona un nodo y pulsa `Enter` |
| Cambiar el texto | Haz doble clic sobre el nodo |
| Borrar un nodo | Selecciónalo y pulsa `Delete` o `Backspace` |
| Deshacer | Pulsa `Ctrl+Z` |
| Rehacer | Pulsa `Ctrl+Y` |

También puedes usar la barra lateral para cambiar colores, bordes, iconos y otros estilos del nodo seleccionado.

## 5. Guardar y abrir mapas

Para no perder tu trabajo:

- Pulsa `Ctrl+S` para guardar.
- Usa **Save As** o `Ctrl+Shift+S` si quieres guardar una copia con otro nombre.
- Los mapas se guardan como archivos `.mindmap.json`.
- Para abrir un mapa existente, usa **Open** o `Ctrl+O`.

Consejo: guarda tus mapas en una carpeta sincronizada, como OneDrive, Google Drive o Dropbox, si quieres tener una copia de seguridad sencilla.

## 6. Exportar o compartir

MindMapper permite exportar mapas para compartirlos fuera de la aplicación:

- Exporta a PDF cuando quieras enviar o imprimir el mapa.
- Exporta a JSON cuando quieras guardar una copia editable o compartirla con otra persona que use MindMapper.

## 7. Importar un esquema Markdown

Si ya tienes una lista de ideas en Markdown, puedes importarla como mapa mental.

Ejemplo de archivo Markdown:

```markdown
# Proyecto
## Objetivos
## Tareas
### Diseño
### Desarrollo
### Revisión
```

Al importarlo, MindMapper convierte los títulos en nodos organizados por niveles.

## 8. Ejecutar desde el código fuente

Esta sección es para personas que quieren probar o modificar el proyecto.

Requisitos:

- Node.js 18 o superior.
- npm.

Pasos:

```bash
git clone https://github.com/Juan-31416/MindMapper.git
cd MindMapper
npm install
npm run dev
```

Para comprobar que el proyecto compila:

```bash
npm run build
```

Para crear un paquete instalable para tu sistema:

```bash
npm run package
```

## 9. Problemas frecuentes

### `npm run dev` no abre la aplicación

Comprueba que las dependencias están instaladas:

```bash
npm install
```

Después vuelve a ejecutar:

```bash
npm run dev
```

### El puerto 5173 está ocupado

Cierra otras aplicaciones de desarrollo que puedan estar usando ese puerto y vuelve a intentarlo.

### No puedo borrar un nodo

El nodo principal del mapa no se puede borrar. Selecciona otro nodo y prueba de nuevo con `Delete` o `Backspace`.

## 10. Más ayuda

- Consulta [USAGE.md](./USAGE.md) para una guía completa de uso.
- Consulta [DATA_SCHEMA.md](./DATA_SCHEMA.md) si quieres entender el formato de los archivos `.mindmap.json`.
- Abre un issue en GitHub si encuentras un error o tienes una sugerencia.

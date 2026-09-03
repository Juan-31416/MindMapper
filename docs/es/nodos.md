# Trabajar con nodos

> **Versión:** v0.2 (beta)

Los nodos son los bloques de construcción de tu mapa mental. Cada nodo contiene una idea. Esta guía explica cómo añadir, editar, mover, colapsar y eliminar nodos.

---

## ¿Qué es un nodo?

Un nodo es una tarjeta rectangular que contiene una etiqueta de texto. Los nodos se conectan entre sí con líneas, formando la estructura en árbol del mapa.

- El **nodo raíz** es la idea central en la parte superior del mapa.
- Los **nodos hijos** se ramifican hacia abajo desde su nodo padre.
- Los **nodos hermanos** están al mismo nivel y comparten el mismo nodo padre.

[SCREENSHOT: Un mapa mental con etiquetas señalando el nodo raíz, un nodo hijo y un nodo hermano]

---

## Seleccionar un nodo

**Haz clic** en cualquier nodo para seleccionarlo. El nodo queda resaltado y se abre el panel **Node Editor** a la derecha de la pantalla.

---

## Añadir nodos

### Añadir un nodo hijo (sub-idea)

Un nodo hijo aparece *por debajo* del nodo seleccionado en la jerarquía.

| Método | Cómo |
|---|---|
| Teclado | Selecciona un nodo → pulsa **Tab** |
| Node Editor | Haz clic en **Add Child** en el panel |

### Añadir un nodo hermano (mismo nivel)

Un nodo hermano aparece *al lado* del nodo seleccionado, compartiendo el mismo padre.

| Método | Cómo |
|---|---|
| Teclado | Selecciona un nodo → pulsa **Enter** |
| Node Editor | Haz clic en **Add Sibling** en el panel |

> **Nota:** No puedes añadir un hermano al nodo raíz — no tiene padre.

[SCREENSHOT: El panel Node Editor con los botones Add Child, Add Sibling y Delete]

---

## Editar el texto de un nodo

1. **Haz doble clic** sobre el nodo en el lienzo.  
   *O* haz clic una vez para seleccionarlo — el campo **Node Info** en el Node Editor ya está listo para editar.
2. Escribe tu texto.
3. Pulsa **Enter** para confirmar, o **Escape** para cancelar.

---

## Eliminar un nodo

> ⚠️ **Atención:** Eliminar un nodo también elimina todos sus hijos. Usa **Ctrl + Z** para deshacer inmediatamente si fue un error.

| Método | Cómo |
|---|---|
| Teclado | Selecciona el nodo → pulsa **Suprimir** o **Retroceso** |
| Node Editor | Haz clic en **Delete** en el panel |

---

## Mover (reasignar) un nodo

Puedes arrastrar un nodo a un nuevo padre:

1. Haz clic y mantén pulsado el nodo que quieres mover.
2. Arrástralo hacia otro nodo hasta quedar a menos de **100 px** de él.
3. Suelta — el nodo arrastrado se convierte en hijo del nodo de destino.

Si sueltas sin acercarte suficientemente a otro nodo, el nodo regresa a su posición original.

[SCREENSHOT: Un nodo siendo arrastrado cerca de otro nodo para reasignarlo]

---

## Colapsar y expandir ramas

Cuando un nodo tiene hijos, aparece un pequeño botón **+** o **−** debajo de él en el lienzo.

| Botón | Acción |
|---|---|
| **−** | Colapsar — ocultar todos los hijos de este nodo |
| **+** | Expandir — volver a mostrar todos los hijos |

> 💡 **Consejo:** Colapsar ramas te ayuda a concentrarte en una parte de un mapa grande. Cuando buscas un nodo, MindMapper expande automáticamente las ramas colapsadas que contienen un resultado.

[SCREENSHOT: Un nodo con su botón de colapsar/expandir visible debajo de él]

---

## Deshacer y rehacer

Cada acción que realizas queda registrada. Puedes retroceder por toda tu sesión de trabajo.

| Acción | Atajo | Barra de herramientas |
|---|---|---|
| Deshacer | **Ctrl + Z** | Botón Deshacer |
| Rehacer | **Ctrl + Y** | Botón Rehacer |

El historial es ilimitado dentro de la sesión y se reinicia al cerrar el mapa.

---

## Consulta también

- [Estilo de nodos](estilos.md)
- [Vistas y navegación](vistas.md)
- [Atajos de teclado](atajos-de-teclado.md)

---

*← [Volver al índice de documentación](index.md)*

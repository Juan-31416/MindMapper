# Asistente de IA

> **Versión:** v0.2 (beta) · 🧪 **Experimental**

> 🧪 Esta función es **experimental** y se incluirá en v0.3. Su interfaz y comportamiento pueden cambiar significativamente en versiones futuras.

El Asistente de IA puede generar una estructura de mapa mental a partir de un texto en lenguaje natural, ahorrándote tiempo en la fase inicial de lluvia de ideas.

---

## Qué hace el Asistente de IA

Describes un tema con tus propias palabras. La IA genera un conjunto estructurado de nodos — un nodo raíz con ramas e hijos — y los inserta en tu mapa actual. A continuación, puedes editar, ampliar o cambiar el estilo de la estructura generada libremente.

---

## Proveedores de IA compatibles

MindMapper está diseñado para funcionar con múltiples proveedores de IA. Tú eliges cuál usar:

| Proveedor | Notas |
|---|---|
| **OpenAI** | Servicio externo — requiere tu propia clave de API |
| **Gemini** | Servicio externo — requiere tu propia clave de API |
| **ChatLLM** | Servicio externo — requiere tu propia clave de API |
| **LLM local** | Auto-hospedado — sin clave de API, máxima privacidad |

> 🔒 **Privacidad:** Cuando usas un proveedor externo (OpenAI, Gemini, ChatLLM), tu texto de consulta se envía a los servidores de ese proveedor. Si prefieres que ningún texto salga de tu máquina, usa un **LLM local**. Ningún dato se envía jamás sin tu acción explícita.

---

## Usar el Asistente de IA

> **Nota:** Los pasos detallados de configuración para cada proveedor se añadirán a medida que la función madure. Los pasos siguientes reflejan el comportamiento en v0.2.

1. Con un mapa abierto, activa el Asistente de IA. *(Busca el punto de entrada en la barra de herramientas o en el menú desplegable del botón New según tu versión.)*
2. Escribe una consulta describiendo el tema que quieres explorar. Ejemplos:
   - *"Planifica el lanzamiento de una aplicación web en 4 semanas"*
   - *"Haz una lluvia de ideas sobre contenidos para un blog de vida sostenible"*
   - *"Estructura los capítulos de un libro de aprendizaje automático para principiantes"*
3. El asistente genera una estructura de mapa mental y la añade a tu mapa.
4. Revisa los nodos generados. Edítalos, elimínalos o amplíalos según necesites.

[SCREENSHOT: El campo de entrada del Asistente de IA y un mapa mental generado con varias ramas]

---

## La IA es siempre opcional

MindMapper funciona completamente sin el Asistente de IA. Nunca necesitas configurar un proveedor para usar las funciones principales de la aplicación.

---

## Garantías de datos y privacidad

- Tus consultas son procesadas por el proveedor de IA que hayas seleccionado — no por MindMapper.
- MindMapper **no** registra ni almacena tus consultas.
- Ningún dato del mapa se envía silenciosamente en segundo plano.
- Toda la configuración de IA se almacena **localmente** en tu dispositivo.

---

## Consulta también

- [Crear y gestionar mapas](crear-mapas.md)
- [Configuración y preferencias](configuracion.md)
- [Atajos de teclado](atajos-de-teclado.md)

---

*← [Volver al índice de documentación](index.md)*

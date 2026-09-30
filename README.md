# Taller de Electrones · Módulo 1

Curso de electrónica explicado con escenas 3D interactivas.
**Módulo 1: La materia y la electricidad**: el átomo, los electrones de valencia, la tabla periódica, conductores, aislantes, semiconductores y bandas de energía.

Es una web estática: HTML, CSS y JavaScript, sin instalación ni servidor especial.

## Qué incluye

| Pestaña | Qué tiene |
|---|---|
| Inicio | Viaje 3D del cable al núcleo (4 escalas), objetivos del módulo y mapa del curso |
| 1 · El átomo | Modelo 3D de 10 elementos, escudo de electrones internos, iones, recorrido guiado de 8 pasos |
| 2 · Tabla periódica | Los 118 elementos en 3D: por tipo, electrones de valencia, conductividad real; ficha de cada elemento |
| 3 · Conductores y aislantes | Red de átomos con voltaje y temperatura: mar de electrones, enlaces, huecos, medidor de corriente |
| 4 · Bandas de energía | Conductor, semiconductor y aislante lado a lado; saltos por calor y por luz |
| 5 · En la vida real | Gráfico de resistividad de 15 materiales, 8 ejemplos de uso y 6 errores comunes |
| Resumen y glosario | 11 ideas clave y 28 términos con buscador |
| Autoevaluación | 14 preguntas con explicación y enlace para repasar |

## Estructura

```
index.html                 la página y todos los textos de las lecciones
css/estilos.css            estilos (colores, tipografía, diseño adaptable a celular)
js/datos.js                datos: elementos, materiales, tabla periódica, preguntas, glosario
js/motor3d.js              base 3D común (visores, animación, recorridos guiados)
js/escena-viaje.js         Inicio: del cable al núcleo
js/escena-atomo.js         Lección 1
js/escena-tabla.js         Lección 2
js/escena-materiales.js    Lección 3
js/escena-bandas.js        Lección 4
js/app.js                  navegación, gráfico, resumen, glosario y autoevaluación
```

La librería 3D (Three.js 0.128) y las tipografías se cargan desde internet (jsDelivr y Google Fonts), así que la página necesita conexión.

## Verla en tu computadora

Doble clic en `index.html`. Si el navegador bloquea algo por abrirlo como archivo local, levantá un servidor simple desde esta carpeta:

```bash
python -m http.server 8000
```

y abrí http://localhost:8000

## Publicarla en internet (gratis)

Cualquier hosting de sitios estáticos sirve. Tres opciones fáciles:

**Netlify Drop (la más rápida, sin cuenta de GitHub)**
1. Entrá a https://app.netlify.com/drop
2. Arrastrá esta carpeta completa a la página.
3. Te da una dirección pública al instante. Creando una cuenta gratis podés cambiarle el nombre y mantenerla.

**GitHub Pages**
1. Creá un repositorio nuevo en GitHub y subí todos estos archivos (con `index.html` en la raíz).
2. En el repositorio: *Settings → Pages → Build and deployment → Deploy from a branch*, elegí la rama `main` y la carpeta `/ (root)`.
3. En uno o dos minutos queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

**Vercel o Cloudflare Pages**
Importá el repositorio de GitHub o subí la carpeta. No hace falta configurar ningún comando de compilación: el directorio de salida es la raíz.

Si tenés un hosting tradicional (cPanel, FTP), subí el contenido de esta carpeta a `public_html`.

## Cómo sumar contenido

- **Textos de las lecciones** → `index.html` (bloques “Para entenderlo a fondo”).
- **Pasos del recorrido guiado** → el arreglo `pasos` al final de cada `js/escena-*.js`.
- **Preguntas, glosario, ejemplos, resumen** → `js/datos.js` (`PREGUNTAS`, `GLOSARIO`, `EJEMPLOS`, `MITOS`, `IDEAS`).
- **Próximos temas del curso** → `PROXIMOS` en `js/datos.js`.

El progreso (qué lecciones visitaste) se guarda solo en el navegador de cada persona.

> Valores de resistividad y conductividad aproximados, a 20 °C. Las escenas 3D son modelos simplificados para entender; las proporciones reales no se pueden dibujar a escala.

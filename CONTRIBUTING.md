# Guía de Contribución

¡Gracias por tu interés en contribuir al Portal Inverland! Aquí encontrarás información sobre cómo contribuir de manera efectiva.

## Cómo Contribuir

1. **Reportar un Problema**
   - Verifica si el problema ya ha sido reportado en los [issues](https://github.com/halvarez22/inverland-new-portal/issues).
   - Si no existe, crea un nuevo issue con una descripción clara y detallada del problema.

2. **Solicitar una Nueva Característica**
   - Abre un issue con la etiqueta "feature request".
   - Describe la característica que te gustaría ver implementada y por qué sería útil.

3. **Contribuir con Código**
   - Haz un fork del repositorio.
   - Crea una rama para tu característica o corrección: `git checkout -b mi-nueva-caracteristica`.
   - Realiza tus cambios y asegúrate de que los tests pasen.
   - Envía un pull request con una descripción clara de los cambios.

## Estándares de Código

- Sigue el [estándar de código](https://google.github.io/styleguide/jsguide.html) de Google para JavaScript/TypeScript.
- Escribe pruebas unitarias para nuevas funcionalidades.
- Asegúrate de que todo el código pase el linter: `npm run lint`.

## Proceso de Revisión de Código

- Todos los pull requests deben ser revisados por al menos un desarrollador senior.
- Los cambios deben pasar todas las pruebas automatizadas.
- Se requiere aprobación de al menos un revisor antes de hacer merge.

## Estructura del Proyecto

- `/components`: Componentes reutilizables de React.
- `/services`: Lógica de negocio y llamadas a API.
- `/modules`: Módulos específicos de la aplicación.
- `/types`: Definiciones de TypeScript.
- `/tests`: Pruebas unitarias y de integración.

## Configuración del Entorno de Desarrollo

1. Clona el repositorio.
2. Ejecuta `npm install` para instalar las dependencias.
3. Copia `.env.example` a `.env.local` y configura las variables de entorno.
4. Ejecuta `npm run dev` para iniciar el servidor de desarrollo.

## Preguntas

Si tienes preguntas, por favor abre un issue o contacta al equipo de desarrollo.

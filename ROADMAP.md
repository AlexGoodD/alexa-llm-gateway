# Roadmap

Este roadmap prioriza un gateway de Alexa seguro, observable y preparado para evolucionar a más proveedores de modelos de lenguaje.

## Fase 1 — Base funcional

Estado: completada parcialmente.

- [x] Crear el endpoint de webhook para Alexa.
- [x] Verificar firma y marca de tiempo de las solicitudes.
- [x] Manejar inicio, cierre, cancelar y detener la conversación.
- [x] Integrar OpenRouter mediante una interfaz de proveedor.
- [x] Limitar y normalizar las respuestas para síntesis de voz.
- [x] Añadir pruebas unitarias y una prueba funcional básica.
- [x] Documentar expresiones para `AskQuestionIntent`.
- [x] Validar que `context.System.application.applicationId` coincida con `ALEXA_SKILL_ID`.
- [x] Validar el sobre mínimo de Alexa y los slots de texto admitidos.

## Fase 2 — Calidad y seguridad

Objetivo: asegurar la integración antes de exponerla a usuarios finales.

- [ ] Añadir pruebas funcionales con solicitudes Alexa válidas y firmadas.
- [x] Cubrir errores HTTP y respuestas sin contenido de OpenRouter.
- [x] Verificar que las llamadas a OpenRouter incluyan un límite de tiempo.
- [ ] Probar el comportamiento al agotarse el límite de tiempo de OpenRouter.
- [ ] Probar los flujos de cada intent estándar y del intent de preguntas.
- [ ] Añadir validación de tamaño y contenido de las preguntas.
- [ ] Configurar límites de solicitudes por IP y por sesión.
- [ ] Revisar políticas de retención y redacción de datos en logs.
- [ ] Añadir análisis estático, typecheck y pruebas al flujo de integración continua.

## Fase 3 — Experiencia conversacional

Objetivo: mejorar la utilidad y naturalidad de las respuestas por voz.

- [ ] Diseñar un prompt de sistema versionado y configurable.
- [ ] Mantener contexto de conversación por `sessionId` con expiración.
- [ ] Usar SSML cuando aporte claridad a la respuesta.
- [ ] Gestionar preguntas ambiguas, vacías o fuera de alcance.
- [ ] Personalizar mensajes de bienvenida, ayuda y errores.
- [ ] Evaluar respuestas con un conjunto de preguntas representativas en español de México.

## Fase 4 — Proveedores y resiliencia

Objetivo: evitar dependencias rígidas y mejorar la disponibilidad.

- [ ] Permitir seleccionar el modelo y el proveedor por configuración.
- [ ] Implementar el proveedor de DeepSeek o retirar su configuración reservada.
- [ ] Añadir reintentos controlados y fallbacks entre proveedores.
- [ ] Registrar errores de proveedor con identificadores de correlación.
- [ ] Establecer presupuestos de latencia, tokens y costo por solicitud.
- [ ] Implementar caché para preguntas frecuentes cuando sea apropiado.

## Fase 5 — Operación en producción

Objetivo: desplegar y operar el servicio con confianza.

- [ ] Crear una imagen de contenedor y configuración de despliegue.
- [ ] Configurar HTTPS, secretos y variables de entorno en el entorno de producción.
- [ ] Añadir endpoints de salud y disponibilidad.
- [ ] Instrumentar logs estructurados, métricas y alertas.
- [ ] Documentar procedimientos de despliegue, reversión e incidentes.
- [ ] Crear ambientes separados para desarrollo, pruebas y producción.

## Criterios para lanzamiento

- La skill valida el identificador configurado y rechaza solicitudes no autorizadas.
- Las rutas principales están cubiertas por pruebas automatizadas.
- El servicio responde dentro del límite de tiempo de Alexa en condiciones normales y falla de forma comprensible.
- Las claves se gestionan exclusivamente mediante secretos del entorno.
- Hay monitoreo suficiente para detectar errores, latencia alta y consumo anómalo.

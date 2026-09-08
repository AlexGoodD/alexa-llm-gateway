# Alexa LLM Gateway

Gateway HTTP para conectar una skill de Alexa con un modelo de lenguaje. Recibe las solicitudes de Alexa, valida su firma, obtiene la pregunta del usuario y devuelve una respuesta breve en español de México mediante OpenRouter.

## Estado actual

El proyecto cuenta con:

- Un endpoint `POST /alexa/webhook` protegido con validación de firma y marca de tiempo de Alexa.
- Validación de `context.System.application.applicationId` contra la skill configurada.
- Validación del sobre mínimo de solicitudes de Alexa mediante VineJS.
- Manejo de inicio de sesión, finalización, y los intents estándar de cancelar y detener.
- Extracción de la primera respuesta disponible de los slots del intent.
- Un servicio de conversación desacoplado de su proveedor de LLM.
- Un proveedor para OpenRouter con tiempo máximo de respuesta de seis segundos.
- Respuestas normalizadas para voz y limitadas a 800 caracteres.
- Pruebas unitarias para la verificación de solicitudes, el controlador, la validación del payload y las respuestas del proveedor.
- Un catálogo de expresiones de ejemplo para `AskQuestionIntent` en `alexa_ask_question_intent_utterances.csv`.

## Arquitectura

```text
Alexa Skill
    |
    v
POST /alexa/webhook
    |
    +-- AlexaSignatureMiddleware
    |     valida fecha y firma de Alexa
    |
    v
AlexaWebhookController
    |
    v
ChatService
    |
    v
OpenRouterProviderService
    |
    v
OpenRouter / modelo configurado
```

La interfaz `ProviderService` permite incorporar otros proveedores sin acoplarlos al controlador ni al servicio de conversación.

## Requisitos

- Node.js 22 o superior.
- Una cuenta de OpenRouter y una clave de API.
- Una skill de Alexa configurada para enviar solicitudes HTTPS al despliegue público de este servicio.

## Configuración local

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea tu archivo de entorno a partir del ejemplo:

   ```bash
   cp .env.example .env
   ```

3. Configura, como mínimo, estas variables:

   ```dotenv
   APP_KEY=clave-segura-de-adonis
   APP_URL=https://tu-dominio-publico.example
   OPENROUTER_API_KEY=tu-clave-de-openrouter
   ```

4. Inicia el servidor en desarrollo:

   ```bash
   npm run dev
   ```

Para recibir solicitudes reales de Alexa, `APP_URL` debe apuntar a una URL pública HTTPS. No almacenes claves reales en el repositorio.

## Configuración de la skill de Alexa

1. En la consola de Alexa Developer, configura el endpoint HTTPS como:

   ```text
   https://tu-dominio-publico.example/alexa/webhook
   ```

2. Define un intent personalizado `AskQuestionIntent` con un slot de texto, por ejemplo `question`.

3. Importa o usa como referencia `alexa_ask_question_intent_utterances.csv` para las expresiones de ejemplo.

4. Compila el modelo de interacción y prueba la skill desde la consola de Alexa.

El gateway responde a `LaunchRequest`, `SessionEndedRequest`, `AMAZON.StopIntent` y `AMAZON.CancelIntent`. Para los demás intents, utiliza el primer slot con un valor no vacío como pregunta.

## Desarrollo

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Antes de ejecutar una suite específica, consulta las opciones disponibles:

```bash
node ace test --help
```

## Variables de entorno

| Variable             | Uso                                                     | Obligatoria                 |
| -------------------- | ------------------------------------------------------- | --------------------------- |
| `APP_KEY`            | Cifra datos de AdonisJS.                                | Sí                          |
| `APP_URL`            | URL pública enviada a OpenRouter como referencia.       | Sí                          |
| `OPENROUTER_API_KEY` | Autentica las solicitudes de generación.                | Sí para responder preguntas |
| `ALEXA_SKILL_ID`     | Identificador de la skill que puede usar este endpoint. | Sí                          |
| `DEEPSEEK_API_KEY`   | Clave reservada para un proveedor futuro.               | Aún no                      |

## Limitaciones actuales

- El historial de conversación no se persiste; cada pregunta se procesa de forma independiente.
- El modelo de OpenRouter está fijado en `openrouter/free`.
- No hay métricas, trazabilidad de solicitudes ni límites de uso por sesión.
- Las pruebas no cubren aún una solicitud firmada con un certificado real de Amazon ni una llamada real a OpenRouter.

Consulta [ROADMAP.md](ROADMAP.md) para las siguientes etapas.

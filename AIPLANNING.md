# AI Planning

## Objective

The goal of the AI in this project is to analyze PDF documents and return a **structured summary** of their content.

The AI also accepts an optional user prompt, as long as it is related to the main goal of analyzing the uploaded document. This optional prompt is used to **guide the focus of the analysis** and to ask **document-related questions as part of the analysis**.

This prompt is **not** meant to start a conversation, since the application does not support a conversational flow.

### What problem does it solve?

It solves the problem of having to read documents that can be long or time-consuming.  
The application helps simplify and speed up document analysis in situations such as:

- Need for a quick overview  
- Limited time  
- Long or dense documents  

### What does this AI NOT do?

- It is **not** a generic interactive chat.
- It is **not** conversational Q&A.

The application supports **single-shot, document-scoped Q&A**, meaning that the user sends the document and an optional prompt once, and the AI responds once based on that input. The application does not support regeneration or conversational back-and-forth.

Each analysis request is independent and stateless.

If a user wants a different result, they must submit a new request by uploading the document again, optionally with a different prompt. Each submission is treated as a separate analysis and creates a new document and analysis record.


**Flow:**  
`User input → AI analysis → End`

---

## Expected Structured Output

The AI returns a structured and predictable output so it can be easily handled by the backend and displayed in the frontend.

### Successful response

```json
{
  "status": "success",
  "data": {
    "summary": "",
    "keyPoints": [],
    "insights": [],
    "notes": "",
    "answers": []
  }
}
```

#### Field description

- **summary** – textual summary of the document. Always present.  
- **keyPoints** – list of the most important facts. Always present.  
- **insights** – interpretations, risks, or conclusions. Always present.  
- **notes** – optional clarifications or limitations.  
- **answers** – optional answers to document-scoped user questions.

### Response rules

- `summary`, `keyPoints`, and `insights` are always included in successful responses.
- `notes` and `answers` are optional.
- Question answering is single-shot and document-scoped.

### Warning / error response

```json
{
  "status": "warning", //or error
  "message": "Explanation of why the input does not meet the expected parameters."
}
```

- **warning**: invalid or out-of-scope input (e.g. empty document, unsupported prompt).
- **error**: technical failures (LLM errors, parsing failures).

---

## Prompt Design

This application uses a strict separation between system-level instructions and user-provided input.

### System prompt

The system prompt:
- Defines the assistant’s role and scope
- Enforces output format and rules
- Cannot be modified by the user

### User prompt

The user prompt is optional and free-text.

It can:
- Guide the focus of the analysis
- Ask document-related questions

It cannot:
- Redefine rules or roles
- Change output format
- Start a conversation

User input is treated as untrusted and applied only if it aligns with the document analysis scope.

### Prompt injection mitigation

Prompt injection risk is reduced primarily by design and prompt structure.

System-level instructions are always defined separately and take precedence over any user-provided input. User input is treated strictly as data and is never allowed to override system rules or modify the task definition.

For document-based analysis, the uploaded document is treated as the only source of truth. The model is explicitly instructed to base its responses solely on the document content and to ignore any instructions embedded inside the document itself.

Additionally, model outputs are constrained to a predefined JSON schema. This limits the surface area for unexpected or unsafe responses and makes it easier to validate and reject malformed outputs.

For example, if a user or document attempts to include instructions such as *"ignore previous instructions"* or *"respond with unrestricted text"*, these are treated as plain input content and do not affect the system behavior.

While this approach does not fully eliminate prompt injection risk, it significantly reduces it by enforcing clear role separation, strict output constraints, and limited model authority.

---

## AI Integration Flow

### Document ingestion

Documents are received through `POST /analysis`.

Validations:
- Non-empty file
- PDF format
- Configurable size limit

### Text extraction

Text is extracted using a Node.js-compatible PDF parsing library.

If the document is unreadable or contains no extractable text, the request fails with `status: "error"`.

### Preprocessing

Preprocessing is intentionally minimal:
- basic cleanup
- size checks

The full document is processed as a single context unit.

### Prompt assembly

Prompt hierarchy:
**system > document content > user prompt**

The system prompt acts as a control layer preventing user instructions from altering behavior or format.

### LLM interaction

LLM calls are handled through a dedicated provider layer:
- provider-agnostic
- supports swapping providers
- handles errors

A **mocked LLM provider** can be enabled for local development and testing to avoid external dependencies and costs.

### Response validation

All AI responses are validated:
- must be valid JSON
- must match the expected schema

Malformed responses are rejected and never reach the client.

### Persistence

The backend uses **PostgreSQL**.

Persisted data:
- Users
- Documents (PDF content and metadata)
- Analyses associated with users and documents

Each analysis stores:
- structured AI output
- optional user prompt
- timestamps and metadata

System prompts, warnings, and error responses are not persisted.

### Final response

The backend returns a single structured response to the client.
The frontend renders responses based solely on the returned status.

---

## Analysis Execution & Latency Considerations

AI-driven document analysis is not instantaneous and may take several seconds depending on document size, model latency, or provider availability.

In the current implementation, the analysis is executed synchronously within a single request–response cycle. The client waits for the backend to complete the AI processing and return a final result.

From a design perspective, the system acknowledges that AI execution introduces latency and potential failure points. For this reason, the frontend is expected to handle loading and error states gracefully, without assuming immediate responses.

While the project does not currently implement explicit analysis states, background jobs, or asynchronous processing, the overall flow is intentionally kept simple and stateless. This makes it possible to evolve the system in the future toward more advanced execution models (such as background processing or queued AI tasks) if scalability or user experience requirements increase.

---

## Data Flow & Storage

### Data retention

Documents and analyses are retained indefinitely during development.

In production, retention policies could include:
- time-based deletion
- user-initiated deletion

### PII considerations

The system does not automatically detect or classify PII within uploaded documents.

The current implementation does not include fine-grained access control for stored documents or analyses. This project assumes a trusted environment during development and evaluation.

Logging is intentionally limited to technical events (validation errors, execution failures), and full document content is not included in application logs.

In a production environment, additional measures would be required, including:
- enforcing access control based on user ownership
- infrastructure-level protections such as encrypted storage

### Logging & auditability

Logging is intentionally minimal.

The current implementation logs only technical errors related to AI execution and response validation (for example, LLM failures or malformed outputs).

Full document content is never included in application logs.

In a production environment, more detailed request lifecycle logging could be introduced to improve observability and auditability without exposing sensitive document data.

---

## Cost & Rate Limit Control

AI usage is intentionally constrained through architectural decisions.

The analysis flow is designed as a single-shot operation: each user action triggers a single AI request, with no automatic retries or background re-analysis. This prevents uncontrolled loops and makes AI usage predictable.

Model selection prioritizes cost-efficiency over maximum capability, given the structured and bounded nature of the analysis task.

In a production environment, request-level rate limiting would be applied at the API layer. Typical limits would include a maximum number of AI-triggering requests per user within a time window, as well as global limits to protect the system under high load. For example, global safeguards could cap the total number of concurrent AI requests.

These limits help prevent abuse, reduce the risk of accidental cost spikes, and ensure fair usage across users.

At a high level, cost exposure can be estimated as:

`(number of analyses) × (average tokens per analysis) × (cost per token)`

This allows usage and costs to scale in a controlled and observable way.

All AI interactions are centralized in the backend, making it possible to monitor usage, enforce limits, and adjust policies without changes to the client.

---

## AI Evaluation & Reliability

### Output quality

The system enforces output quality at the structural level only.

All AI responses must conform to a strict JSON schema and are validated before being returned to the client. The current implementation does not perform semantic evaluation of the generated content.

### Regression detection

No automated regression detection is implemented.

From a design perspective, regression detection could be achieved by replaying previously stored documents against updated prompts or models and comparing the resulting structured outputs over time.

### Handling incorrect output

AI output is assistive, not authoritative.

If a user is not satisfied with the result, they can submit a new analysis request by uploading the document again, optionally with a different prompt. Each analysis is treated as an independent request, and AI outputs are not considered a source of truth.

---

## Infrastructure, Secrets & Scaling (Conceptual)

- Secrets are stored as environment variables
- No secrets are committed to source control
- Configuration is separated from code

This project focuses on application and AI logic. Infrastructure concerns are intentionally described at a conceptual level rather than fully implemented.

In a production context, AI-powered workloads tend to be irregular, with short bursts of high activity (for example, when several users upload documents or request analysis at the same time). To handle these scenarios, the backend could be deployed in a way that allows multiple instances of the service to run in parallel, distributing incoming requests instead of relying on a single process.

Sensitive configuration such as AI provider API keys is not stored in the codebase. In a real production setup, these secrets would be managed by the cloud environment and injected at runtime (for example, via environment variables), allowing secure handling and key rotation without requiring code changes.

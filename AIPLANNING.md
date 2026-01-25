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

The application supports **single-shot, document-scoped Q&A**, meaning that the user sends the document and an optional prompt once, and the AI responds once based on that input.

If the user is not satisfied, they can regenerate the analysis or upload a different document or prompt. However, regenerating an analysis does **not** create a back-and-forth conversation. Each analysis request is independent and the flow is stateless.

**Flow:**  
`User input → AI analysis → End`

### Analysis type

For now, the application supports a single type of analysis: a **structured summary**.

However, the application is designed in a scalable way, so that other types of analysis can be added in the future without major changes to the architecture.

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
  "status": "warning",
  "message": "Explanation of why the input does not meet the expected parameters."
}
```

- **warning**: invalid or out-of-scope input (e.g. empty document, unsupported prompt).
- **error**: technical failures (LLM errors, timeouts, parsing failures).

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

Prompt injection risk is reduced by design:
- System instructions always take precedence
- User input never overrides system rules
- The document is the only source of truth
- Output must conform to a predefined JSON schema

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
- handles errors and timeouts

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

## Analysis Lifecycle & Status Management

AI-driven document analysis is not an instantaneous operation and may take several seconds depending on document size, model latency, or provider availability.

For this reason, the system is designed around a clear **analysis lifecycle**, even though the current implementation executes the flow synchronously.

### Analysis states

Each analysis can conceptually transition through the following states:

- **pending**  
  The analysis request has been created but processing has not started yet.

- **generating**  
  The document text has been extracted and the request is being processed by the LLM provider.

- **completed**  
  The AI successfully generated a valid structured response that passed backend validation.

- **failed**  
  The analysis failed due to a technical error (LLM error, timeout, parsing failure).

These states are modeled to support future asynchronous or background processing, even if the current implementation completes the analysis within a single request-response cycle.

### Frontend implications

Explicit analysis states allow the frontend to:

- display loading indicators while the AI is processing
- avoid blocking the UI during long-running requests
- show meaningful feedback in case of failure
- prevent duplicate or accidental re-submissions

This becomes especially important as document size, concurrency, or model latency increases.

### Architectural intent

Although the current version processes the analysis synchronously, the lifecycle model ensures the system can evolve toward:

- background job processing
- queue-based AI execution
- retry mechanisms for transient failures
- progress tracking and partial results

By modeling analysis status explicitly, the system avoids coupling frontend behavior to LLM response times and remains adaptable to production-scale AI workloads.

---

## Data Flow & Storage

### Data retention

Documents and analyses are retained indefinitely during development.

In production, retention policies could include:
- time-based deletion
- user-initiated deletion
- tenant-level policies

### PII considerations

The system does not automatically detect PII.

Mitigations include:
- access control by user ownership
- minimal logging of document content
- encryption at rest

### Logging & auditability

Logs include:
- request lifecycle events
- AI execution failures
- validation errors

Logs exclude full document content.

---

## Cost & Rate Limit Control

AI usage is controlled through architectural constraints:
- single-shot analysis flow
- no automatic re-analysis
- cost-efficient model selection
- per-user or per-request limits

Additional production strategies may include quotas, background processing, and throttling.

---

## AI Evaluation & Reliability

### Output quality
- strict schema enforcement
- validation before returning responses

### Regression detection
- replaying stored documents against updated prompts
- comparing structured outputs over time

### Handling incorrect output
AI output is assistive, not authoritative.
Users can regenerate analyses and incorrect results are not treated as source of truth.

---

## Infrastructure & Secrets

The application is designed for cloud environments such as AWS.

- Secrets are stored as environment variables
- No secrets are committed to source control
- Configuration is separated from code

In production, secrets would be managed by a secrets manager and rotated independently.

# Generation service

Everything that decides *what a question says* lives in this folder. Routes and
components never import a provider — they call the four service functions in
`index.ts`:

| Function | Job |
| --- | --- |
| `generateAssessment(request)` | Full pipeline: pick the agent for the exam, generate, quality-check |
| `generateSATQuestions(request)` | SAT agent only |
| `generateIELTSQuestions(request)` | IELTS agent only |
| `validateQuestions(questions, request)` | Quality control, independent of provider |

## Current state

`AI_PROVIDER` defaults to `mock`, which returns correctly shaped placeholder
questions so the upload → configure → generate → review flow can be exercised
end to end. It reads nothing from the source document, labels every question
`mock: true`, and the UI shows a banner saying the output is not AI-generated.
It is a development tool, not a demo of the product.

## Adding a real provider

1. Create `anthropic-provider.ts` implementing `AssessmentProvider` from
   `./types.ts`:

   ```ts
   export const anthropicProvider: AssessmentProvider = {
     id: "anthropic",
     label: "Claude",
     isMock: false,
     model: serverEnv.anthropicModel,
     async generateSATQuestions(request) { /* … */ },
     async generateIELTSQuestions(request) { /* … */ },
   };
   ```

2. Register it in the `PROVIDERS` map in `index.ts`.
3. Set `AI_PROVIDER=anthropic` and `ANTHROPIC_API_KEY=…` in the server
   environment. Neither takes a `VITE_` prefix — they must not reach the browser.

`validateQuestions` already runs over whatever a provider returns, so a real
model inherits the duplicate, structure and answer-validity checks for free.

## Source text

`GenerationRequest.source.text` carries the extracted document text. It is
populated at upload time by the `extractDocumentText` server function in
`src/rpc/documents.ts`: the file is downloaded with the service-role key, parsed
with `unpdf` (`src/server/pdf.server.ts`), and stored in
`documents.extracted_text`, capped at 200,000 characters. A PDF with no text
layer is marked `failed` with an explanation rather than accepted, so an empty
string never reaches a provider.

`text` is `null` only when the server had no service-role key to run extraction
with. A provider that needs the text should fail loudly rather than generate from
the file name.

## The two-agent architecture

The long-term shape is two agents: a source/research agent that finds and
prepares material, and an assessment agent that writes questions from it.
`AssessmentProvider` is the second of those. The first will land beside it as
its own interface — nothing in the app assumes generation is a single call, and
`documents.status` (`uploading` → `processing` → `ready`) already models a
preparation stage that runs before generation.

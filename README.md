# QA release gate — E2E test matrix

> Public mini-demo with fictional data. The full product is private; access on request: carrerabernal@gmail.com

## Live demo

https://carrerable.github.io/qa-release-matrix-demo/

## What it demonstrates

How a release is gated twice, in QA and in production, with an E2E matrix:

- A "Summary" tab and an "E2E Matrix" tab, as in the real format.
- Counts by status and a verdict: a ticket is approved only if every critical case passes.
- Editable status per case, filters, CSV export.
- "Generate finding report": failure, evidence, steps to reproduce, expected and actual. It never suggests a fix, and a validator rejects any report that does.

## What is fictional and what is real

Everything in the data is fictional (a made-up "Multi-invoice payment" module, 15 cases). The workflow and the rule "QA only reports" are real; the code is written from scratch.

## Run locally

```bash
npm ci && npm run dev
```

Add `?lang=es` for Spanish.

## Tests

```bash
npm test
```

## How it was built

Code written with Claude Code under my specs and code review; I designed the behavior, wrote the acceptance tests and verified the result.

## Case study

https://carrerable.github.io/en/projects/qa-release-gate/

## License

MIT

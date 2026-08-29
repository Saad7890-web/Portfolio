import type { DeepDiveStage } from './types';

/**
 * The one section that is deliberately not lens-aware. Every other part of the
 * page re-ranks; this one always tells the same story, because the argument it
 * makes — that a system is only real once it is reproducible — is the same
 * argument for every reader.
 *
 * Everything here traces to the agentvcr entry in projects.ts. Nothing on this
 * diagram is a capability the tool does not have.
 */
export const deepDive = {
  projectId: 'agentvcr',
  title: 'Making an agent run reproducible',
  lead: 'Agent runs are nondeterministic and cost money every time you execute one, which is why almost nobody tests them. agentvcr records one run behind a proxy, replays it offline for free, and tells you exactly which step stopped agreeing with the recording. Four states, one tape.',
  /** Sits above the step strip, so a row of numbered boxes says what it counts. */
  stripLabel: 'STEPS OF THE RUN',
  /** Reads the two line styles out loud — the diagram is not the only channel. */
  flowLegend:
    'Solid — a call that leaves for the provider. Dashed — a call answered from the tape.',
  footnote:
    'Validated against LangGraph and the OpenAI Agents SDK, where nondeterministic fan-out is flagged as diverged rather than silently replaying the wrong result. Header redaction keeps provider keys off disk.',
} as const;

export const deepDiveNodes = {
  agent: { label: 'AGENT', sub: 'LangGraph · Agents SDK' },
  proxy: { label: 'agentvcr', sub: 'record · match · diff' },
  provider: { label: 'PROVIDER', sub: 'OpenAI · Anthropic' },
  tape: { label: 'TAPE', sub: 'SQLite · redacted' },
} as const;

export const deepDiveStages: DeepDiveStage[] = [
  {
    id: 'record',
    label: 'Record',
    claim: 'The agent runs for real, exactly once.',
    detail:
      'Point the SDK at the proxy with a single base_url change — no wrapper, no callbacks, no SDK integration. Every LLM and tool call on its way to the provider is written to a tape as it passes, with headers redacted so keys never reach disk.',
    readout: { value: '1 line', label: 'the entire integration: one base_url' },
    steps: ['taped', 'taped', 'taped', 'taped', 'taped', 'taped'],
    legend: 'Six steps of one live run, taped in the order they happened.',
  },
  {
    id: 'replay',
    label: 'Replay',
    claim: 'The same run again, offline, for nothing.',
    detail:
      'The proxy now answers from the tape instead of the provider. Calls are matched positionally and by fingerprint — a normalised hash of model, messages and tools — so an unchanged run replays exactly, in CI, with the provider unreachable and no key in the environment.',
    readout: { value: '0 tokens', label: 'spent re-running a taped agent' },
    steps: ['replayed', 'replayed', 'replayed', 'replayed', 'replayed', 'replayed'],
    legend: 'Every step answered from the tape; the provider is never called.',
  },
  {
    id: 'divergence',
    label: 'Divergence',
    claim: 'The run changed. The proxy says where.',
    detail:
      'A fingerprint that no longer matches is a divergence, not a cache miss. Under strict the run stops there; under warn it continues and reports; under live-on-miss it falls through to the provider. A semantic differ — LCS over step fingerprints — filters the churn and names the first step that actually differs.',
    readout: { value: 'exit 1', label: 'a diverged run failing a merge gate' },
    steps: ['replayed', 'replayed', 'replayed', 'flagged', 'skipped', 'skipped'],
    legend:
      'Steps 1–3 still match. Step 4 diverged; everything after it is consequence, not signal.',
  },
  {
    id: 'fork',
    label: 'Fork',
    claim: 'Fix step 4. Keep the three you already paid for.',
    detail:
      'Edit a prompt, a tool result or a response in the diff UI and re-run from there. Steps before the edit replay from the tape; steps after it fall through to the provider live. The expensive prefix of an agent run stops being something you pay for twice to test the tail.',
    readout: { value: '1 step', label: 'edited — the prefix still replays free' },
    steps: ['replayed', 'replayed', 'replayed', 'edited', 'live', 'live'],
    legend: 'Tape up to the edit, live after it: the run continues instead of restarting.',
  },
];

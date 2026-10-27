# Provision a Volume

A four-step wizard that lets users provision a storage volume. Steps 1 and 2 already work. **You'll build steps 3 and 4.**

| Step | What it does | Status |
|---|---|---|
| 1. Cluster | Choose where the volume lives | ✅ Done |
| 2. Volume | Name, capacity, performance tier | ✅ Done |
| 3. Access | Which clients can mount it | 🔨 **Part 1** |
| 4. Review | Confirm and submit | 🔨 **Part 2** |

## Your task

### Part 1: Access step

Files: `src/wizard/steps/AccessStep.tsx` and `validateAccess` in `src/wizard/validate.ts`.
The layout is already there, but nothing in it is connected yet.

1. **Protocol:** the user picks NFS or SMB.
2. **Access rules:** the user can add a rule, remove a rule, and edit each rule's CIDR and access level (`ro` / `rw`).
3. **Tier restrictions:** archive volumes can't use SMB. Make that option unselectable and tell the user why.
4. **Validation:** **Next** stays blocked until the step is valid (see [Rules](#rules)).

### Part 2: Review step

File: `src/wizard/steps/ReviewStep.tsx`.

1. **Summary:** show everything the user chose, in a readable form.
2. **Submit:** call `createVolume`, always with `snapshots: null`.
3. **Result:** on success, show the new volume's id. On failure, show what went wrong.

Get Part 1 solid before you start Part 2. If you run out of time, tell us what you'd do next.

## Rules

| Field | Rule |
|---|---|
| Protocol | `nfs` or `smb`. **Archive tier can't use SMB.** |
| Access rules | At least one. Each has an IPv4 CIDR (e.g. `10.20.0.0/16`) and an access level `ro` or `rw`. No duplicate CIDRs. |

The server enforces the same rules. The request and error types are in `src/api/types.ts` and `src/api/errors.ts`.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm test
npm run typecheck
```

## Code map

Everything you'll touch is in `src/wizard/`:

| File | Contents |
|---|---|
| `Wizard.tsx` | Owns the state, the current step, and Back/Next. Passes `state`, `update(patch)`, and `errors` to each step. |
| `state.ts` | `WizardState`. Add any fields you need here. |
| `validate.ts` | One function per step. **Next** calls the current step's function. If it returns errors, the step shows them and stays put. |
| `lib.ts` | Helpers, including `isValidCidr`. |
| `steps/` | One component per step. Use Cluster and Volume as the pattern for validation, error display, and accessibility. |

**Back** never validates, and state is kept as you move between steps.

## Mock API

There's no real backend. `src/api/client.ts` calls `fetch('/api/...')`, and [MSW](https://mswjs.io) answers those requests from an in-memory database (`src/mocks/`). Requests show up in the DevTools Network tab. Latency is random by default. You can control the mock with URL params:

- `?latency=none|fast|normal|slow`
- `?fail=random`: some requests fail with a 503

## Ground rules

- Think out loud. We care more about your reasoning than about how much you finish.
- If something's ambiguous, ask. If it's reasonable to decide yourself, decide and tell us what you chose.

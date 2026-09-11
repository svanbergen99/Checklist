# Security Policy — Checklist

Checklist is a public repository. Every committed file and reachable Git commit must be treated as public.

## LCW repository standard — 2026-09-11

This repository is governed by the owner-approved LCW security standard.

- The human owner is the final authority.
- LCW is the independent guardian and emergency-control layer.
- Default deny applies to security-sensitive and privileged actions.
- Destructive, billing, permission, secret, authority-changing, or security-weakening actions require explicit owner approval.
- Operational agents may not grant themselves additional authority, bypass LCW, disable auditing, or modify the controls that constrain them.
- LCW enforcement credentials and control paths must remain outside operational-agent write authority.
- Security failures and unverifiable security state fail closed.
- Secrets, credentials, tokens, private keys, private datasets, personal information, internal operational data, or private exports must never be committed, logged, returned to clients, or included in model context.
- Only explicitly public material may be committed; uncertainty means the material must be treated as private and withheld.
- Production and security-sensitive changes require a reviewable pull request plus validated checks.
- Documentation is policy, not enforcement; controls must be implemented technically where applicable.

## GitHub assurance boundary

For repositories operated under GitHub Free, the required target is to use all security controls technically available to the current account. Any `100%` assurance statement is explicitly scoped to that available-control set and is not an absolute-security claim.

Provider-level protections that are unavailable under the current plan are not considered active merely because they are documented. Until stronger provider-enforced controls are available and independently tested, the human owner remains the compensating control by personally reviewing and merging security-sensitive pull requests after successful CI.

If required CI or equivalent validation is absent or failing, the repository is below the LCW standard for security-sensitive deployment and must fail closed.

## Incident rule

If secret or private material is committed, stop publication or deployment paths, rotate affected credentials where applicable, preserve evidence, assess Git history exposure, and verify the repaired state before resuming.

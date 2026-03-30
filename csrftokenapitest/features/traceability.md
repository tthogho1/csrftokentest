# Traceability Matrix — EARS → Gherkin

**Source**: `EARS.txt` (generated from `specification_sample.txt`)
**Generated**: 2026-03-26
**Coverage**: 10/10 EARS requirements → 16 Gherkin scenarios

## Requirements → Scenarios

| EARS ID | Pattern | Feature File | Scenario |
|---------|---------|--------------|----------|
| EARS-001 | Event-driven | csrf-token-management.feature | Page load triggers CSRF token acquisition |
| EARS-002 | Event-driven | csrf-token-management.feature | Auto-fetch CSRF token before non-GET request when cache is empty |
| EARS-003 | State-driven | csrf-token-management.feature | CSRF token attached to all non-GET requests via Axios interceptor |
| EARS-004 | Event-driven | csrf-token-management.feature | PerRequestCsrfFilter generates new CSRF token at start of each request |
| EARS-005 | Event-driven | form-submission-workflow.feature | User submits input form and receives confirmation data |
| EARS-006 | Event-driven | form-submission-workflow.feature | User confirms submission on confirmation screen and receives completion response |
| EARS-007 | Unwanted | csrf-security-enforcement.feature | POST request with mismatched CSRF token is rejected |
| EARS-007 | Unwanted | csrf-security-enforcement.feature | POST request with missing X-CSRF-TOKEN header is rejected |
| EARS-008 | Ubiquitous | csrf-security-enforcement.feature | Cross-origin requests from localhost:5173 with credentials are permitted |
| EARS-009 | Ubiquitous | input-validation.feature | Name field accepts input up to 50 characters |
| EARS-009 | Ubiquitous | input-validation.feature | Name field restricts input beyond 50 characters |
| EARS-010 | Ubiquitous | input-validation.feature | Birthdate field accepts valid YYYY-MM-DD format |
| EARS-010 | Ubiquitous | input-validation.feature | Birthdate field rejects non-YYYY-MM-DD formats (Scenario Outline ×5) |

## PCI DSS Compliance Tags

| PCI DSS Requirement | Covered By |
|---------------------|-----------|
| 6.5.9 (CSRF protection) | EARS-001, 004, 005, 006, 007 |
| 11.6.1 (Header tampering detection) | EARS-007 |

## Output Structure

```
features/
├── csrf-token-management.feature      (EARS-001 to EARS-004)
├── form-submission-workflow.feature   (EARS-005, EARS-006)
├── csrf-security-enforcement.feature  (EARS-007, EARS-008)
├── input-validation.feature           (EARS-009, EARS-010)
└── traceability.md                    (this file)
```

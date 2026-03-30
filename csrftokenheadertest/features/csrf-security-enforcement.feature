Feature: CSRF Security Enforcement
  # EARS: EARS-005, EARS-006, EARS-007
  # The system validates CSRF tokens on all state-changing requests,
  # rejecting mismatched or missing tokens with HTTP 403 Forbidden.

  Background:
    Given the Spring Security CSRF protection is enabled
    And a valid HTTP session exists with a stored CSRF token

  @EARS-005 @token-validation
  Scenario: Server compares X-CSRF-TOKEN header with session token on POST request
    Given the client has a valid CSRF token
    When the client sends a POST request with the "X-CSRF-TOKEN" header set to the valid token
    Then the system shall compare the header value with the HttpSession CSRF token
    And the request shall be processed successfully

  @EARS-006 @token-mismatch
  Scenario: Mismatched CSRF token returns 403 Forbidden
    Given the HttpSession contains a CSRF token "valid-token-xyz"
    When the client sends a POST request with "X-CSRF-TOKEN" header set to "invalid-token-abc"
    Then the system shall return HTTP status 403 Forbidden
    And the response body shall contain "Invalid CSRF Token"

  @EARS-006 @token-tampering
  Scenario: Tampered CSRF token is rejected with 403 Forbidden
    Given a CSRF token was previously issued to the client
    When the client sends a POST request with a tampered "X-CSRF-TOKEN" header value
    Then the system shall return HTTP status 403 Forbidden
    And the response body shall contain "Invalid CSRF Token"

  @EARS-007 @missing-token
  Scenario: POST request without X-CSRF-TOKEN header returns 403 Forbidden
    Given the client has not acquired a CSRF token
    When the client sends a POST request without the "X-CSRF-TOKEN" header
    Then the system shall return HTTP status 403 Forbidden

  @EARS-007 @missing-token
  Scenario Outline: All state-changing methods without CSRF token are rejected
    Given the client has not acquired a CSRF token
    When the client sends a "<method>" request without the "X-CSRF-TOKEN" header
    Then the system shall return HTTP status 403 Forbidden

    Examples:
      | method |
      | POST   |
      | PUT    |
      | DELETE |
      | PATCH  |

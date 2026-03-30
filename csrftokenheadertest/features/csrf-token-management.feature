Feature: CSRF Token Management
  # EARS: EARS-001, EARS-002, EARS-003, EARS-009
  # The system manages CSRF token lifecycle from generation to client-side persistence.

  Background:
    Given the Spring Security CSRF protection is enabled
    And the CSRF token repository uses "X-CSRF-TOKEN" as the header name

  @EARS-001 @token-generation
  Scenario: New session triggers CSRF token generation and storage
    Given no active HTTP session exists for the client
    When a new HTTP session is established
    Then the system shall generate a CSRF token
    And the CSRF token shall be stored in the HttpSession

  @EARS-002 @token-header
  Scenario: HTTP response includes X-CSRF-TOKEN header
    Given a valid HTTP session with a CSRF token exists
    When the system sends an HTTP response to the client
    Then the response shall include the "X-CSRF-TOKEN" header
    And the header value shall match the token stored in the HttpSession

  @EARS-003 @client-storage
  Scenario: Client stores CSRF token received in response header
    Given the client receives an HTTP response
    When the response contains the "X-CSRF-TOKEN" header
    Then the system shall store the token value in sessionStorage under the key "csrf-token"

  @EARS-003 @client-storage
  Scenario: Client does not update sessionStorage when response has no CSRF header
    Given the client receives an HTTP response
    When the response does not contain the "X-CSRF-TOKEN" header
    Then the sessionStorage "csrf-token" entry shall not be updated

  @EARS-009 @session-persistence
  Scenario: CSRF token persists in sessionStorage after page reload
    Given a CSRF token is stored in sessionStorage
    When the user reloads the page
    Then the CSRF token shall remain in sessionStorage
    And the next state-changing request shall include the token without requiring re-acquisition

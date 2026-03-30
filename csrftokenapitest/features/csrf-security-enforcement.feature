Feature: CSRF Security Enforcement
  In order to prevent cross-site request forgery attacks (PCI DSS 6.5.9, 11.6.1)
  The system enforces CSRF token validation and CORS policy on all non-GET requests

  Background:
    Given the Spring Boot backend is running on localhost:8080
    And Spring Security CSRF protection is enabled with HttpSessionCsrfTokenRepository

  @REQ-EARS-007 @CSRF @Security @PCI-DSS @Unwanted
  Scenario: POST request with mismatched CSRF token is rejected
    # EARS-007 [Unwanted behavior]
    # If the X-CSRF-TOKEN header in a POST request does not match the session-stored token,
    # the system shall reject the request and return an error response.
    Given the HTTP session contains CSRF token "session-token-abc"
    When a POST request arrives at /api/submit with X-CSRF-TOKEN header "tampered-token-xyz"
    Then Spring Security rejects the request
    And an error response is returned
    And the HTTP response status code is 403

  @REQ-EARS-007 @CSRF @Security @PCI-DSS @Unwanted
  Scenario: POST request with missing X-CSRF-TOKEN header is rejected
    # EARS-007 [Unwanted behavior] - missing header variant
    Given the HTTP session contains a valid CSRF token
    When a POST request arrives at /api/submit without the X-CSRF-TOKEN header
    Then Spring Security rejects the request
    And an error response is returned
    And the HTTP response status code is 403

  @REQ-EARS-008 @CORS @Security
  Scenario: Cross-origin requests from localhost:5173 with credentials are permitted
    # EARS-008 [Ubiquitous]
    # The system shall permit cross-origin requests originating from localhost:5173
    # with credentials (withCredentials=true).
    Given the Spring Security CORS configuration allows origin "http://localhost:5173"
    And the Axios client is configured with withCredentials set to true
    When a request originates from "http://localhost:5173" with credentials
    Then the CORS policy permits the request
    And the response includes "Access-Control-Allow-Origin: http://localhost:5173"
    And the response includes "Access-Control-Allow-Credentials: true"

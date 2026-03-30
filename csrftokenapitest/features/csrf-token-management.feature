Feature: CSRF Token Management
  In order to protect against CSRF attacks (PCI DSS 6.5.9)
  The system manages CSRF tokens per request lifecycle via PerRequestCsrfFilter and Axios interceptor

  Background:
    Given the Spring Boot backend is running on localhost:8080
    And the Vue.js frontend is running on localhost:5173
    And Spring Security CSRF protection is enabled with HttpSessionCsrfTokenRepository

  @REQ-EARS-001 @CSRF @PCI-DSS
  Scenario: Page load triggers CSRF token acquisition
    # EARS-001 [Event-driven]
    # When the page is loaded, the system shall send a GET request to /api/csrf
    # to obtain a CSRF token and store it in the HTTP session.
    Given the user navigates to the application URL
    When the page is loaded
    Then the system sends a GET request to /api/csrf
    And a new CSRF token is generated and stored in the HTTP session

  @REQ-EARS-002 @CSRF @Axios
  Scenario: Auto-fetch CSRF token before non-GET request when cache is empty
    # EARS-002 [Event-driven]
    # When a non-GET request is initiated and no CSRF token is cached on the client,
    # the system shall automatically fetch a new CSRF token from GET /api/csrf before sending the request.
    Given the Axios request interceptor is configured
    And the client has no CSRF token cached
    When a non-GET request is initiated
    Then the system automatically sends a GET request to /api/csrf
    And the newly acquired CSRF token is stored client-side
    And the original non-GET request is sent after the token is acquired

  @REQ-EARS-003 @CSRF @Axios
  Scenario: CSRF token attached to all non-GET requests via Axios interceptor
    # EARS-003 [State-driven]
    # While processing any non-GET request, the system shall attach the current
    # CSRF token as the X-CSRF-TOKEN header via the Axios request interceptor.
    Given the Axios request interceptor is configured
    And a CSRF token "test-csrf-token-abc123" is cached client-side
    When a non-GET request is being processed by the interceptor
    Then the X-CSRF-TOKEN header is set to "test-csrf-token-abc123" in the request

  @REQ-EARS-004 @CSRF @PerRequestCsrfFilter @PCI-DSS
  Scenario: PerRequestCsrfFilter generates new CSRF token at start of each request
    # EARS-004 [Event-driven]
    # When each request begins, the PerRequestCsrfFilter shall generate a new CSRF token,
    # store it in the session, and set it as a request attribute before passing control to the filter chain.
    Given the PerRequestCsrfFilter is registered in the Spring Security filter chain
    When a new HTTP request begins processing
    Then the filter calls csrfTokenRepository.generateToken() to create a new token
    And the new token is stored in the HTTP session under "_csrf"
    And the token is set as a request attribute via csrfTokenRequestAttr
    And the filter chain is invoked to continue processing

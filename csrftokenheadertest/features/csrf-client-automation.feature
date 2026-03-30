Feature: CSRF Client-Side Automation
  # EARS: EARS-004, EARS-008
  # Axios interceptors automate CSRF token injection into requests
  # and handle 403 error recovery transparently.

  Background:
    Given the Vue.js application is initialized
    And Axios request and response interceptors are configured
    And the API base URL is set to "/api" with "withCredentials: true"

  @EARS-004 @auto-injection
  Scenario: CSRF token is automatically injected into POST request header
    Given a CSRF token "test-csrf-token" is stored in sessionStorage under "csrf-token"
    When the client sends a POST request to "/api/secure/data"
    Then the Axios request interceptor shall set the "X-CSRF-TOKEN" header to "test-csrf-token"
    And the request shall be sent with the token header present

  @EARS-004 @auto-injection
  Scenario Outline: CSRF token is auto-injected for all state-changing HTTP methods
    Given a CSRF token is stored in sessionStorage
    When the client sends a "<method>" request
    Then the Axios request interceptor shall automatically include the "X-CSRF-TOKEN" header

    Examples:
      | method |
      | POST   |
      | PUT    |
      | DELETE |
      | PATCH  |

  @EARS-004 @no-injection
  Scenario: CSRF token is NOT injected for safe GET requests
    Given a CSRF token is stored in sessionStorage
    When the client sends a GET request
    Then the Axios request interceptor shall NOT add the "X-CSRF-TOKEN" header

  @EARS-008 @error-recovery
  Scenario: Client clears token and reloads page on 403 response
    Given a CSRF token is stored in sessionStorage
    When the server returns HTTP 403 Forbidden for a POST request
    Then the Axios response interceptor shall delete "csrf-token" from sessionStorage
    And the page shall be reloaded to trigger re-acquisition of a valid CSRF token

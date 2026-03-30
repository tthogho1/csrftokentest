Feature: Form Submission Workflow
  In order to register information securely
  The system processes a two-step form submission flow with CSRF protection on each POST

  Background:
    Given the Spring Boot backend is running on localhost:8080
    And the Vue.js frontend is running on localhost:5173
    And Spring Security CSRF protection is enabled
    And a valid CSRF token is present in the HTTP session

  @REQ-EARS-005 @FormSubmission @CSRF @PCI-DSS
  Scenario: User submits input form and receives confirmation data
    # EARS-005 [Event-driven]
    # When the user submits the input form, the system shall send a POST request to /api/submit
    # with the X-CSRF-TOKEN header and return the submitted name and birthdate for confirmation.
    Given the user is on the input form screen at "/"
    And the user has entered name "東郷智昭"
    And the user has entered birthdate "1980-01-01"
    When the user submits the input form
    Then a POST request is sent to /api/submit
    And the request includes the X-CSRF-TOKEN header
    And the response body contains:
      | field     | value      |
      | status    | 確認画面へ  |
      | name      | 東郷智昭   |
      | birthdate | 1980-01-01 |

  @REQ-EARS-006 @FormSubmission @CSRF @PCI-DSS
  Scenario: User confirms submission on confirmation screen and receives completion response
    # EARS-006 [Event-driven]
    # When the user confirms the submission on the confirmation screen, the system shall send
    # a POST request to /api/confirm with the X-CSRF-TOKEN header and return a registration completion response.
    Given the user is on the confirmation screen at "/confirm"
    And the confirmation screen displays the submitted name and birthdate
    When the user clicks the confirm submit button
    Then a POST request is sent to /api/confirm
    And the request includes the X-CSRF-TOKEN header
    And the response body contains:
      | field   | value  |
      | status  | 完了   |
      | message | 登録完了 |
    And the user is redirected to "/"

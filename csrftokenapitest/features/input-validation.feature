Feature: Input Validation
  In order to ensure data integrity
  The system enforces field-level validation rules on all user input

  Background:
    Given the Vue.js frontend input form is displayed at "/"

  @REQ-EARS-009 @Validation @InputForm
  Scenario: Name field accepts input up to 50 characters
    # EARS-009 [Ubiquitous]
    # The system shall restrict the name input field to a maximum of 50 characters.
    Given the name input field is visible
    When the user enters a name of exactly 50 characters
    Then the input is accepted
    And no validation error is displayed for the name field

  @REQ-EARS-009 @Validation @InputForm
  Scenario: Name field restricts input beyond 50 characters
    # EARS-009 [Ubiquitous] - boundary violation
    Given the name input field is visible
    When the user attempts to enter a name of 51 characters
    Then the name field value is truncated or capped at 50 characters
    And the excess characters are not accepted

  @REQ-EARS-010 @Validation @InputForm
  Scenario: Birthdate field accepts valid YYYY-MM-DD format
    # EARS-010 [Ubiquitous]
    # The system shall validate that the birthdate input conforms to the YYYY-MM-DD format.
    Given the birthdate input field is visible
    When the user enters "1980-01-01" as the birthdate
    Then the birthdate passes format validation
    And no validation error is displayed for the birthdate field

  @REQ-EARS-010 @Validation @InputForm
  Scenario Outline: Birthdate field rejects non-YYYY-MM-DD formats
    # EARS-010 [Ubiquitous] - invalid format variants
    Given the birthdate input field is visible
    When the user enters "<invalid_date>" as the birthdate
    Then a validation error is displayed for the birthdate field
    And the error indicates the required format is YYYY-MM-DD

    Examples:
      | invalid_date |
      | 01/01/1980   |
      | 1980.01.01   |
      | 19800101     |
      | 1980-1-1     |
      | not-a-date   |

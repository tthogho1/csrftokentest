package com.example.csrf.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request payload for /api/submit and /api/confirm.
 *
 * Validation constraints:
 *   - name: required, maximum 50 characters (EARS-009)
 *   - birthdate: required, YYYY-MM-DD format (EARS-010)
 */
public class SubmitRequest {

    @NotBlank(message = "名前は必須です")
    @Size(max = 50, message = "名前は50文字以内で入力してください")
    private String name;

    @NotBlank(message = "生年月日は必須です")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "生年月日はYYYY-MM-DD形式で入力してください")
    private String birthdate;

    public SubmitRequest() {
    }

    public SubmitRequest(String name, String birthdate) {
        this.name = name;
        this.birthdate = birthdate;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBirthdate() {
        return birthdate;
    }

    public void setBirthdate(String birthdate) {
        this.birthdate = birthdate;
    }
}

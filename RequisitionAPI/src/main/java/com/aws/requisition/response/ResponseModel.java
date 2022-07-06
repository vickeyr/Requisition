package com.aws.requisition.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 *
 * @author Mohammed Gulam Dastagir
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class ResponseModel implements Serializable {

    private Integer statusCode;
    private String authToken;
    private String message;
    private String extraVariable;
    private Object respObject;
    private Object respObject2;
    private List<?> respList;
    private List<?> respList2;

}

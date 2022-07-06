package com.aws.requisition.request;

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
public class RequestModel implements Serializable {

    private String userId;
    private String authToken;
    private String extraVariable;
    private Object reqObject;
    private List<?> reqList;
    private ImageRequest imageObj;

}

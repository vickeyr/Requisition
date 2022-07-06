package com.aws.requisition.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.Date;
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
public class Attachments implements Serializable {

    private String type;
    private String fileName;
    private String uri;
    private String base64;
    private String attachmentCategory;
    private String attachmentType;
    private Date attachmentDate;

}

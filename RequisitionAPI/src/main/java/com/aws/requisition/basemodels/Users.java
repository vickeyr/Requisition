/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.aws.requisition.basemodels;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.Date;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 *
 * @author Mohammed Gulam Dastagir
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
@Document(collection = "Users")
public class Users implements Serializable {

    @Id
    private String id;
    private String fullName;
    private String mobileNumber;
    private String emailId;
    private String deviceID;
    private String password;
    private Boolean isFirstTimeUser;
    @DBRef
    private Status statusObj;
    @DBRef
    private Roles roleObj;//admin,requisiters 
    private Boolean isVisible;
    @DBRef
    private List<Companies> companies;
    @DBRef
    private List<TransferType> transferTypeObj;
    private List<FieldType> fields;
    private Date createdDate;
    @DBRef
    private Users createdBy;

}

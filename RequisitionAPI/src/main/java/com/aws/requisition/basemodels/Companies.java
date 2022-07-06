/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.aws.requisition.basemodels;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.Date;
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
@Document(collection = "Companies")
public class Companies implements Serializable {

    @Id
    private String id;
    private String companyName;
    private String shortCode;
    private String companyAddress;
    private String vatNumber;
    private String contactPersonName;
    private String emailId;
    private String mobileNumber;
    private String imageURL; //url or path
    private String logoBase64;
    private Boolean isProjectAddedAndActive;
    private Boolean shouldBypassPurchaseDepartment;
    @DBRef
    private Status statusObj;
    @DBRef
    private Users createdBy;
    private Date createdDate;

}

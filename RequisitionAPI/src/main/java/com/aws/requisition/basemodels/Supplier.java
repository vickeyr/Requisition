/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.aws.requisition.basemodels;

import com.aws.requisition.request.Attachments;
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
@Document(collection = "Supplier")
public class Supplier implements Serializable {

    @Id
    private String id;
    private String vendorCode;
    private String supplierName;
    private String contactPersonName;
    private String emailId;
    private String mobileNumber;
    private String address;
    private String vatNumber;
    private Boolean markAsCommonSupplier;
    private List<Attachments> attachments;
    @DBRef
    private Companies companyObj;
    @DBRef
    private Projects projectObj;
    @DBRef
    private List<TransferType> transferTypeObj;
    private List<FieldType> fields;
    @DBRef
    private Status statusObj;
    @DBRef
    private Users createdBy;
    private Date createdDate;

}

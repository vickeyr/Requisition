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
@Document(collection = "PayersBankDetails")
public class PayersBankDetails implements Serializable {

    @Id
    private String id;
    private String payersBankName;
    private String payersAccountNumber;
    @DBRef
    private Status statusObj;
    private Date createdDate;
    @DBRef
    private Users createdBy;
    @DBRef
    private Users updatedBy;
}

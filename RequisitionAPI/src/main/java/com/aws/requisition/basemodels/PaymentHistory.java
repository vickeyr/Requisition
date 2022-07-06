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
@Document(collection = "PaymentHistory")
public class PaymentHistory implements Serializable {

    @Id
    private String id;
    private String requisitionId;
    private String typeOfForm;
    private Date requisitionCreatedOn;
    private String transferTypeid;
    private String transferTypeName;
    private List<FieldType> fields;
    private String createdById;
    private String createdBy;
    private String approverId;
    private String approverName;
    private String lpoNumber;
    private Float finalAmount;
    private Float paidAmount;
    private Float balanceAmount;
    private Date paymentDate;
    private String chqNumberOrTxnId;
    private String remarks;
    @DBRef
    private PayersBankDetails payersBankDetailObj;
    @DBRef
    private Users paidByObj;
}

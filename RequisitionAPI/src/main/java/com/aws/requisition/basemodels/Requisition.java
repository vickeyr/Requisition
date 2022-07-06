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
@Document(collection = "Requisition")
public class Requisition implements Serializable {

    @Id
    private String id;
    private String requisitionId;
    private Projects projectObj;
    private String typeOfForm;//requisition or reimbursment
    private Date requisitionCreatedOn;
    @DBRef
    private Currencies currencyObj;
    @DBRef
    private TransferType transferTypeObj;
    private List<FieldType> fields;
    @DBRef
    private Supplier supplierObj;
    @DBRef
    private Companies companyObj;
    @DBRef
    private Users preferedApprover;
    @DBRef
    private Departments departmentObj;
    private Date rejectedDate;
    private Date approvedDate;
    private List<Attachments> attachments;
    private Float productTotal;
    private Float discountTotal;
    private Float vatTotal;
    private Float finalAmount;
    private Boolean otherDeliveryAddress;
    private String globalNotes;
    private String pdfURL;
    private String address;
    @DBRef
    private Status statusObj;
    private Boolean doesAdditionalInfoRequired;
    private Attachments rejectedVoiceNote;
    private String rejectionRemark;
    private Boolean doesAdditionalInfoFilled;
    private List<Attachments> additionalInfo;
    private Boolean isFinalReject;
    private String requisitionPdfUrl;
    private Boolean doesPurchaseDepartmentBypassed;
    @DBRef
    private Users purchasedDeptUserObj;
    private Date lpoDate;
    private String lpoNumber;
    private String lpoPdfUrl;
    private String deliveryNoteNumber;
    private List<Attachments> deliveryAttachments;
    private List<Attachments> additionalAttachments;
    private Date settledDate;
    private Float paidAmount;
    private Float pendingAmount;
    @DBRef
    private Users createdBy;
    @DBRef
    private Users settledBy;
    private Date lastModifiedDate;
    private Boolean isUpdated;
    private Boolean isNewRecForFinance;

}

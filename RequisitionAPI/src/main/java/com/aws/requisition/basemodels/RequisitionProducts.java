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
@Document(collection = "RequisitionProducts")
public class RequisitionProducts implements Serializable {

    @Id
    private String id;
    private String description;
    @DBRef
    private UOM uomObj;
    private Float quantity;
    private Float unitPrice;
    private Float productTotal;
    private Float vatPercentage;
    private Float totalVAT;
    private Float totalAmount;//prdtTtl+vatTotal
    private Float discountPercentage;
    private Float discountAmount;
    private String discountType;
    @DBRef
    private Requisition requisitionObj;
    private String requisitionId;
    @DBRef
    private Users createdBy;
    private Date createdDate;

}

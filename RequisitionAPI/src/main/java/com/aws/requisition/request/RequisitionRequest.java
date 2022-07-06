package com.aws.requisition.request;

import com.aws.requisition.basemodels.Companies;
import com.aws.requisition.basemodels.Currencies;
import com.aws.requisition.basemodels.Departments;
import com.aws.requisition.basemodels.FieldType;
import com.aws.requisition.basemodels.Projects;
import com.aws.requisition.basemodels.RequisitionProducts;
import com.aws.requisition.basemodels.Supplier;
import com.aws.requisition.basemodels.TransferType;
import com.aws.requisition.basemodels.Users;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.Date;
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
public class RequisitionRequest implements Serializable {

    private Projects projectObj;
    private Date requisitionCreatedOn;
    private TransferType transferTypeObj;
    private Supplier supplierObj;
    private Companies companyObj;
    private Users preferedApprover;
    private List<Attachments> attachments;
    private Float productTotal;
    private Float discountTotal;
    private Float vatTotal;
    private Float finalAmount;
    private Boolean otherDeliveryAddress;
    private String address;
    private List<RequisitionProducts> requisitionProductses;
    private Departments departmentObj;
    private String typeOfForm;
    private List<FieldType> fields;
    private Currencies currencyObj;

}

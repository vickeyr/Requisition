package com.aws.requisition.request;

import com.aws.requisition.basemodels.Companies;
import com.aws.requisition.basemodels.Departments;
import com.aws.requisition.basemodels.Projects;
import com.aws.requisition.basemodels.Status;
import com.aws.requisition.basemodels.Supplier;
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
public class FDRequisitionRequest implements Serializable {

    private List<RequisitionFormType> formType;
    private List<Status> statuses;
    private Companies companyObj;
    private List<Departments> departments;
    private List<Projects> projects;
    private List<Supplier> suppliers;
    private Date fromDate;
    private Date toDate;
    private Boolean includeRaisedReq;
    private Boolean isPartialPaymentScreen;

}

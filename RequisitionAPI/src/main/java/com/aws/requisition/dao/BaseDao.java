/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.aws.requisition.dao;

import com.aws.requisition.basemodels.SystemConfig;
import com.aws.requisition.basemodels.Companies;
import com.aws.requisition.basemodels.Currencies;
import com.aws.requisition.basemodels.Departments;
import com.aws.requisition.basemodels.PayersBankDetails;
import com.aws.requisition.basemodels.PaymentHistory;
import com.aws.requisition.basemodels.Projects;
import com.aws.requisition.basemodels.Requisition;
import com.aws.requisition.basemodels.RequisitionProducts;
import com.aws.requisition.basemodels.Roles;
import com.aws.requisition.basemodels.Status;
import com.aws.requisition.basemodels.Supplier;
import com.aws.requisition.basemodels.TransferType;
import com.aws.requisition.basemodels.UOM;
import com.aws.requisition.basemodels.Users;
import com.aws.requisition.request.FDRequisitionRequest;
import com.aws.requisition.request.GetRequisitionRequest;
import com.aws.requisition.request.LoginRequest;
import java.util.List;

/**
 *
 * @author Mohammed Gulam Dastagir
 */
public interface BaseDao {

    public List<Users> getUserByCredintials(LoginRequest lrObj);

    public List<Users> getFirstTimeUserByCredintials(LoginRequest lrObj);

    public List<Users> getUserRoles(LoginRequest lrObj);

    public SystemConfig createSystemConfig(SystemConfig systemConfigObj);

    public List<SystemConfig> getAllSystemConfig();

    public Boolean checkDuplicateUOM(UOM uomObj);

    public UOM createUOM(UOM uomObj);

    public UOM getUOMById(String uomId);

    public Boolean checkUOMDependency(UOM uomObj);

    public Boolean deleteUOM(UOM uomObj);

    public List<UOM> getAllUOMs(String statusName);

    public Boolean checkDuplicateRole(Roles roleObj);

    public Roles createRole(Roles roleObj);

    public Roles getRoleById(String id);

    public Boolean checkRoleDependency(Roles roleObj);

    public Boolean deleteRole(Roles roleObj);

    public List<Roles> getAllRoles();

    public Boolean checkDuplicateStatus(Status statusObj);

    public Status createStatus(Status statusObj);

    public Status getStatusById(String id);

    public Boolean checkStatusDependency(Status departmentObj);

    public Boolean deleteStatus(Status departmentObj);

    public List<Status> getAllStatus();

    public List<Status> getAllStatusByActivity(String activityName);

    public Boolean checkDuplicateUser(Users userObj);

    public Users createUser(Users userObj);

    public Users getUserById(String id);

    public Boolean checkUserDependency(Users departmentObj);

    public Boolean deleteUsers(Users departmentObj);

    public List<Users> getAllUsers(String statusName);

    public Status getStatusByName(String statusName);

    public Boolean checkDuplicateCompany(Companies companyObj);

    public Companies createCompany(Companies companyObj);

    public Companies getCompanyById(String id);

    public List<Companies> getAllCompanies(String statusName);

    public Boolean checkDuplicateDepartment(Departments departmentObj);

    public Departments createDepartment(Departments departmentObj);

    public Departments getDepartmentById(String id);

    public List<Departments> getAllDepartmentsByCompanyId(String statusName, String companyId);

    public Boolean checkDuplicateSupplier(Supplier supplierObj);

    public Supplier createSupplier(Supplier supplierObj);

    public Supplier getSupplierById(String id);

    public List<Supplier> getAllSuppliersByProjectId(String statusName, String projectId);

    public List<Supplier> getAllCommonSuppliers(String statusName);

    public Users getUserByMobileNumber(String mobileNumber);

    public Boolean checkDuplicateTransferType(TransferType transferTypeObj);

    public TransferType createTransferType(TransferType transferTypeObj);

    public TransferType getTransferTypeById(String id);

    public TransferType getTransferTypeByName(String transferTypeName);

    public List<TransferType> getAllTransferType(String statusName, String additionalKey);

    public List<Requisition> getAllRequisitionByUserStatusAndCompany(GetRequisitionRequest grrObj);

    public List<Users> getApproversListForRequisitionUsersByCompanyId(String companyId);

    public Requisition createRequisition(Requisition requestModelObj);

    public RequisitionProducts createRequisitionProduct(RequisitionProducts requisitionProductObj);

    public Boolean checkDuplicateProject(Projects projectObj);

    public Projects createProject(Projects projectObj);

    public Projects getProjectById(String id);

    public void removeProject(Projects projectObj);

    public List<Projects> getAllProjectsByCompanyId(String statusName, String companyId);

    public long getRequisitionCountByCompany(Companies companyObj, Boolean isLPO);

    public List<Requisition> getAllActiveRequisitionByCondition(FDRequisitionRequest fdrrObj);

    public List<Requisition> getAllRequisitionByCondition(FDRequisitionRequest fdrrObj);

    public List<RequisitionProducts> getAllRequisitionProductsByRequisitionId(String requisitionId);

    public PaymentHistory createPaymentHistory(PaymentHistory paymentHistoryObj);

    public List<PaymentHistory> getAllPaymentHistoryByRequisitionId(String requisitionId);

    public Requisition getRequititionById(String requisitionId);

    public Requisition getRequititionByRequisitionNumber(String requisitionId);

    public Boolean checkDuplicatePayersBankDetails(PayersBankDetails payersBankDetailsObj);

    public PayersBankDetails createPayersBankDetails(PayersBankDetails payersBankDetailsObj);

    public PayersBankDetails getPayersBankDetailsById(String id);

    public List<PayersBankDetails> getAllPayersBankDetails(String statusName);

    public Boolean checkDuplicateCurrency(Currencies currencyObj);

    public Currencies createCurrency(Currencies currencyObj);

    public Currencies getCurrencyById(String id);

    public List<Currencies> getAllCurrencies(String statusName);

    public Currencies getPreferedCurrencyObj();

    public Integer getStatusWiseBadgeCount(Status statusObj, String userMobileNumber, String companyId);

}

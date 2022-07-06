/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.aws.requisition.service;

import com.aws.requisition.request.RequestModel;
import com.aws.requisition.response.ResponseModel;

/**
 *
 * @author Mohammed Gulam Dastagir
 */
public interface BaseService {

    public ResponseModel validateLogin(RequestModel requestModelObj);

    public ResponseModel updateUserPassword(RequestModel requestModelObj);

    public ResponseModel resetPassword(RequestModel requestModelObj);

    public ResponseModel createSystemConfig(RequestModel requestModelObj);

    public ResponseModel getSystemConfig();

    public ResponseModel createUOM(RequestModel requestModelObj);

    public ResponseModel updateUOM(RequestModel requestModelObj);

    public ResponseModel deleteUOM(RequestModel requestModelObj);

    public ResponseModel getAllUOMs(String statusName);

    public ResponseModel createPayersBankDetail(RequestModel requestModelObj);

    public ResponseModel updatePayersBankDetail(RequestModel requestModelObj);

    public ResponseModel deletePayersBankDetail(RequestModel requestModelObj);

    public ResponseModel getAllPayersBankDetails(String extraVariable);

    public ResponseModel createRole(RequestModel requestModelObj);

    public ResponseModel updateRole(RequestModel requestModelObj);

    public ResponseModel deleteRole(RequestModel requestModelObj);

    public ResponseModel getAllRoles();

    public ResponseModel createStatus(RequestModel requestModelObj);

    public ResponseModel updateStatus(RequestModel requestModelObj);

    public ResponseModel deleteStatus(RequestModel requestModelObj);

    public ResponseModel getAllStatus();

    public ResponseModel getAllStatusByActivity(RequestModel requestModelObj);

    public ResponseModel getAllStatusByActivityWithBadgeCount(RequestModel requestModelObj);

    public ResponseModel updateReadStatus(RequestModel requestModelObj);

    public ResponseModel createUser(RequestModel requestModelObj);

    public ResponseModel getUserById(RequestModel requestModelObj);

    public ResponseModel updateUser(RequestModel requestModelObj);

    public ResponseModel deleteUser(RequestModel requestModelObj);

    public ResponseModel getAllUsers(String statusName);

    public ResponseModel createCompany(RequestModel requestModelObj);

    public ResponseModel getCompanyById(RequestModel requestModelObj);

    public ResponseModel updateCompany(RequestModel requestModelObj);

    public ResponseModel deleteCompany(RequestModel requestModelObj);

    public ResponseModel getAllCompanies(String statusName);

    public ResponseModel createDepartment(RequestModel requestModelObj);

    public ResponseModel updateDepartment(RequestModel requestModelObj);

    public ResponseModel deleteDepartment(RequestModel requestModelObj);

    public ResponseModel getAllDepartmentsByCompanyId(String extraVariable);

    public ResponseModel createProject(RequestModel requestModelObj);

    public ResponseModel getProjectById(RequestModel requestModelObj);

    public ResponseModel updateProject(RequestModel requestModelObj);

    public ResponseModel deleteProject(RequestModel requestModelObj);

    public ResponseModel markProjectComplete(RequestModel requestModelObj);

    public ResponseModel getAllProjectsByCompanyId(String extraVariable);

    public ResponseModel createSupplier(RequestModel requestModelObj);

    public ResponseModel updateSupplier(RequestModel requestModelObj);

    public ResponseModel deleteSupplier(RequestModel requestModelObj);

    public ResponseModel getAllSuppliersByProjectId(String extraVariable);

    public ResponseModel getAllSuppliersByMultipleProjectId(RequestModel requestModelObj);

    public ResponseModel getAllTransferType(String extraVariable);

    public ResponseModel deleteTransferType(RequestModel requestModelObj);

    public ResponseModel updateTransferType(RequestModel requestModelObj);

    public ResponseModel createTransferType(RequestModel requestModelObj);

    public ResponseModel getAllRequisitionByUserStatusAndCompany(RequestModel requestModelObj);

    public ResponseModel getApproversListForRequisitionUsersByCompanyId(RequestModel requestModelObj);

    public ResponseModel createRequisition(RequestModel requestModelObj);

    public ResponseModel rejectRequisition(RequestModel requestModelObj);

    public ResponseModel approveRequisition(RequestModel requestModelObj);

    public ResponseModel addAdditionalInfo(RequestModel requestModelObj);

    public ResponseModel getAllActiveRequisitionByCondition(RequestModel requestModelObj);

    public ResponseModel getAllRequisitionByCondition(RequestModel requestModelObj);

    public ResponseModel addAttachmentToRequisition(RequestModel requestModelObj);

    public ResponseModel makePayment(RequestModel requestModelObj);

    public ResponseModel getAllPaymentHistoryByRequisitionId(RequestModel requestModelObj);

    public ResponseModel exportDataToExcel(RequestModel requestModelObj);

    public ResponseModel updateRequisitionStatus(RequestModel requestModelObj);

    public ResponseModel testAPI(RequestModel requestModelObj);

    public ResponseModel createCurrency(RequestModel requestModelObj);

    public ResponseModel updateCurrency(RequestModel requestModelObj);

    public ResponseModel deleteCurrency(RequestModel requestModelObj);

    public ResponseModel getAllCurrencies(String extraVariable);

    public ResponseModel getPreferedCurrency(RequestModel requestModelObj);

    public ResponseModel makePreferedCurrency(RequestModel requestModelObj);

    public ResponseModel sendNotification(String type);

    public ResponseModel testEmail(String type);

}

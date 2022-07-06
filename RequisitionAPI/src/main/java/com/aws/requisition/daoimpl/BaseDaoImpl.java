/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.aws.requisition.daoimpl;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;
import com.aws.requisition.dao.BaseDao;
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
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.regex.Pattern;

/**
 *
 * @author Mohammed Gulam Dastagir
 */
@Repository
public class BaseDaoImpl implements BaseDao {

    private static final Logger logger = LoggerFactory.getLogger(BaseDaoImpl.class);

    @Autowired
    private MongoOperations mongoOperations;

    private Query q;

    @Override
    public List<Users> getUserByCredintials(LoginRequest lrObj) {
        List<Users> userObj;
        try {
            Status statusObj = getStatusByName("Active");
//            Roles rolesObj = getRoleByName("Super Admin");
            q = new Query();
            q.addCriteria(Criteria.where("emailId").is(lrObj.getUsername()));
            q.addCriteria(Criteria.where("password").is(lrObj.getPassword()));
            if (null != statusObj) {
                q.addCriteria(Criteria.where("statusObj").is(statusObj));
            }
//            if (null != rolesObj) {
//                q.addCriteria(Criteria.where("roleObj").nin(rolesObj));
//            }
            userObj = this.mongoOperations.find(q, Users.class);
        } catch (Exception e) {
            logger.error("Error while getting user " + e.getLocalizedMessage());
            userObj = new ArrayList<>();
        }
        return userObj;
    }

    @Override
    public List<Users> getFirstTimeUserByCredintials(LoginRequest lrObj) {
        List<Users> userObj;
        try {
            Status statusObj = getStatusByName("Active");
            q = new Query();
            q.addCriteria(Criteria.where("emailId").is(lrObj.getUsername()));
            q.addCriteria(Criteria.where("isFirstTimeUser").is(true));
            if (null != statusObj) {
                q.addCriteria(Criteria.where("statusObj").is(statusObj));
            }
            userObj = this.mongoOperations.find(q, Users.class);
        } catch (Exception e) {
            logger.error("Error while getting user " + e.getLocalizedMessage());
            userObj = new ArrayList<>();
        }
        return userObj;
    }

    @Override
    public List<Users> getUserRoles(LoginRequest lrObj) {
        List<Users> userObj;
        try {
            Status statusObj = getStatusByName("Active");
            q = new Query();
            q.addCriteria(Criteria.where("emailId").is(lrObj.getUsername()));
            if (null != statusObj) {
                q.addCriteria(Criteria.where("statusObj").is(statusObj));
            }
            userObj = this.mongoOperations.find(q, Users.class);
        } catch (Exception e) {
            logger.error("Error while getting user " + e.getLocalizedMessage());
            userObj = new ArrayList<>();
        }
        return userObj;
    }

    @Override
    public Status getStatusByName(String statusName) {
        Status statusObj;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("statusName").is(statusName));
            statusObj = this.mongoOperations.findOne(q, Status.class);
            if (null != statusObj && null != statusObj.getId()) {
            } else {
                statusObj = addStatus(statusName);
            }
        } catch (Exception e) {
            logger.error("Error while getting status " + e.getLocalizedMessage());
            statusObj = addStatus(statusName);
        }
        return statusObj;
    }

    public Roles getRoleByName(String statusName) {
        Roles roleObj = null;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("roleName").is(statusName));
            roleObj = this.mongoOperations.findOne(q, Roles.class);
//            if (null != roleObj && null != roleObj.getId()) {
//            } else {
//                roleObj = addStatus(statusName);
//            }
        } catch (Exception e) {
            logger.error("Error while getting status " + e.getLocalizedMessage());
//            roleObj = addStatus(statusName);
        }
        return roleObj;
    }

    private Status addStatus(String statusName) {
        Status statusObj;
        try {
            statusObj = new Status();
            statusObj.setStatusName(statusName);
            this.mongoOperations.save(statusObj);
        } catch (Exception e) {
            statusObj = null;
        }
        return statusObj;
    }

    @Override
    public SystemConfig createSystemConfig(SystemConfig systemConfigObj) {
        try {
            this.mongoOperations.save(systemConfigObj);
            return systemConfigObj;
        } catch (Exception e) {
            logger.error("Error while creating system config " + e.getLocalizedMessage());
            return null;
        }
    }

    @Override
    public List<SystemConfig> getAllSystemConfig() {
        List<SystemConfig> systemConfigs;
        try {
            systemConfigs = this.mongoOperations.findAll(SystemConfig.class);
        } catch (Exception e) {
            logger.error("Error while getting system configs " + e.getLocalizedMessage());
            systemConfigs = new ArrayList<>();
        }
        return systemConfigs;
    }

    @Override
    public Boolean checkDuplicateUOM(UOM uom) {
        Boolean isDuplicate = false;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("uomNameLong").is(Pattern.compile(uom.getUomNameLong(), Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE)));
            q.addCriteria(Criteria.where("uomNameShort").is(Pattern.compile(uom.getUomNameShort(), Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE)));
            UOM existingUOMObj = this.mongoOperations.findOne(q, UOM.class);
            isDuplicate = null != existingUOMObj && null != existingUOMObj.getId();
        } catch (Exception e) {
            logger.error("Error while checking duplicate roles " + e.getLocalizedMessage());
            isDuplicate = false;
        }
        return isDuplicate;
    }

    @Override
    public UOM createUOM(UOM uomObj) {
        try {
            this.mongoOperations.save(uomObj);
            return uomObj;
        } catch (Exception e) {
            logger.error("Error while creating uom " + e.getLocalizedMessage());
            return null;
        }
    }

    @Override
    public UOM getUOMById(String uomId) {
        UOM uomObj;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("id").is(uomId));
            uomObj = this.mongoOperations.findOne(q, UOM.class);
            if (null != uomObj && null != uomObj.getId()) {
            } else {
                uomObj = null;
            }
        } catch (Exception e) {
            logger.error("Error while getting uom " + e.getLocalizedMessage());
            uomObj = null;
        }
        return uomObj;
    }

    @Override
    public Boolean checkUOMDependency(UOM uomObj) {
        Boolean isDependent = false;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("uomObj.id").is(uomObj.getId()));
            q.limit(1);
            long noOfRecords = this.mongoOperations.count(q, RequisitionProducts.class);
            isDependent = Integer.parseInt(noOfRecords + "") > 0;
        } catch (Exception e) {
            logger.error("Error while checking uom dependency " + e.getLocalizedMessage());
            isDependent = false;
        }
        return isDependent;
    }

    @Override
    public Boolean deleteUOM(UOM uomObj) {
        try {
            this.mongoOperations.remove(uomObj);
            return true;
        } catch (Exception e) {
            logger.error("Error while deleting role " + e.getLocalizedMessage());
            return false;
        }
    }

    @Override
    public List<UOM> getAllUOMs(String statusName) {
        List<UOM> uoms;
        try {
            Status statusObj = getStatusByName(statusName);
            q = new Query();
            q.addCriteria(Criteria.where("statusObj").is(statusObj));
            uoms = this.mongoOperations.find(q, UOM.class);
        } catch (Exception e) {
            logger.error("Error while getting roles " + e.getLocalizedMessage());
            uoms = new ArrayList<>();
        }
        return uoms;
    }

    @Override
    public Boolean checkDuplicatePayersBankDetails(PayersBankDetails payersBankDetailsObj) {
        Boolean isDuplicate = false;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("payersBankName").is(Pattern.compile(payersBankDetailsObj.getPayersBankName(), Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE)));
            q.addCriteria(Criteria.where("payersAccountNumber").is(Pattern.compile(payersBankDetailsObj.getPayersAccountNumber(), Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE)));
            PayersBankDetails existingPayersBankDetailsObj = this.mongoOperations.findOne(q, PayersBankDetails.class);
            isDuplicate = null != existingPayersBankDetailsObj && null != existingPayersBankDetailsObj.getId();
        } catch (Exception e) {
            logger.error("Error while checking duplicate roles " + e.getLocalizedMessage());
            isDuplicate = false;
        }
        return isDuplicate;
    }

    @Override
    public PayersBankDetails createPayersBankDetails(PayersBankDetails payersBankDetailsObj) {
        try {
            this.mongoOperations.save(payersBankDetailsObj);
            return payersBankDetailsObj;
        } catch (Exception e) {
            logger.error("Error while creating createPayersBankDetails " + e.getLocalizedMessage());
            return null;
        }
    }

    @Override
    public PayersBankDetails getPayersBankDetailsById(String paymentBankDetailId) {
        PayersBankDetails paymentBankDetailObj;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("id").is(paymentBankDetailId));
            paymentBankDetailObj = this.mongoOperations.findOne(q, PayersBankDetails.class);
            if (null != paymentBankDetailObj && null != paymentBankDetailObj.getId()) {
            } else {
                paymentBankDetailObj = null;
            }
        } catch (Exception e) {
            logger.error("Error while getting getPayersBankDetailsById " + e.getLocalizedMessage());
            paymentBankDetailObj = null;
        }
        return paymentBankDetailObj;
    }

    @Override
    public List<PayersBankDetails> getAllPayersBankDetails(String statusName) {
        List<PayersBankDetails> payersBankDetailses;
        try {
            Status statusObj = getStatusByName(statusName);
            q = new Query();
            q.addCriteria(Criteria.where("statusObj").is(statusObj));
            payersBankDetailses = this.mongoOperations.find(q, PayersBankDetails.class);
        } catch (Exception e) {
            logger.error("Error while getting getAllPayersBankDetails " + e.getLocalizedMessage());
            payersBankDetailses = new ArrayList<>();
        }
        return payersBankDetailses;
    }

    @Override
    public Boolean checkDuplicateRole(Roles roleObj) {
        Boolean isDuplicate = false;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("roleName").is(Pattern.compile(roleObj.getRoleName(), Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE)));
            Roles existingRoleObj = this.mongoOperations.findOne(q, Roles.class);
            isDuplicate = null != existingRoleObj && null != existingRoleObj.getId();
        } catch (Exception e) {
            logger.error("Error while checking duplicate roles " + e.getLocalizedMessage());
            isDuplicate = false;
        }
        return isDuplicate;
    }

    @Override
    public Roles createRole(Roles roleObj) {
        try {
            this.mongoOperations.save(roleObj);
            return roleObj;
        } catch (Exception e) {
            logger.error("Error while creating roles " + e.getLocalizedMessage());
            return null;
        }
    }

    @Override
    public Roles getRoleById(String roleId) {
        Roles rolesObj;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("id").is(roleId));
            rolesObj = this.mongoOperations.findOne(q, Roles.class);
            if (null != rolesObj && null != rolesObj.getId()) {
            } else {
                rolesObj = null;
            }
        } catch (Exception e) {
            logger.error("Error while getting role " + e.getLocalizedMessage());
            rolesObj = null;
        }
        return rolesObj;
    }

    @Override
    public Boolean checkRoleDependency(Roles roleObj) {
        Boolean isDependent = false;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("roleObj.id").is(roleObj.getId()));
            q.limit(1);
            long noOfRecords = this.mongoOperations.count(q, Users.class);
            isDependent = Integer.parseInt(noOfRecords + "") > 0;
        } catch (Exception e) {
            logger.error("Error while checking roles dependency " + e.getLocalizedMessage());
            isDependent = false;
        }
        return isDependent;
    }

    @Override
    public Boolean deleteRole(Roles roleObj) {
        try {
            this.mongoOperations.remove(roleObj);
            return true;
        } catch (Exception e) {
            logger.error("Error while deleting role " + e.getLocalizedMessage());
            return false;
        }
    }

    @Override
    public List<Roles> getAllRoles() {
        List<Roles> roleses;
        try {
//            Roles rolesObj = getRoleByName("Super Admin");
            q = new Query();
            q.addCriteria(Criteria.where("isVisible").is(true));
//            if (null != rolesObj) {
//                q.addCriteria(Criteria.where("roleName").nin(rolesObj));
//            }
            roleses = this.mongoOperations.find(q, Roles.class);
        } catch (Exception e) {
            logger.error("Error while getting roles " + e.getLocalizedMessage());
            roleses = new ArrayList<>();
        }
        return roleses;
    }

    @Override
    public Boolean checkDuplicateStatus(Status statusObj) {
        Boolean isDuplicate = false;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("statusName").is(Pattern.compile(statusObj.getStatusName(), Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE)));
            Status existingStatusObj = this.mongoOperations.findOne(q, Status.class);
            isDuplicate = null != existingStatusObj && null != existingStatusObj.getId();
        } catch (Exception e) {
            logger.error("Error while checking duplicate status " + e.getLocalizedMessage());
            isDuplicate = false;
        }
        return isDuplicate;
    }

    @Override
    public Status createStatus(Status statusObj) {
        try {
            this.mongoOperations.save(statusObj);
            return statusObj;
        } catch (Exception e) {
            logger.error("Error while creating status " + e.getLocalizedMessage());
            return null;
        }
    }

    @Override
    public Status getStatusById(String statusId) {
        Status statusObj;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("id").is(statusId));
            statusObj = this.mongoOperations.findOne(q, Status.class);
            if (null != statusObj && null != statusObj.getId()) {
            } else {
                statusObj = null;
            }
        } catch (Exception e) {
            logger.error("Error while getting status " + e.getLocalizedMessage());
            statusObj = null;
        }
        return statusObj;
    }

    @Override
    public Boolean checkStatusDependency(Status statusObj) {
        Boolean isDependent = false;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("statusObj.id").is(statusObj.getId()));
            q.limit(1);
            long noOfRecords = this.mongoOperations.count(q, Users.class);
            isDependent = Integer.parseInt(noOfRecords + "") > 0;
        } catch (Exception e) {
            logger.error("Error while checking status dependency " + e.getLocalizedMessage());
            isDependent = false;
        }
        return isDependent;
    }

    @Override
    public Boolean deleteStatus(Status statusObj) {
        try {
            this.mongoOperations.remove(statusObj);
            return true;
        } catch (Exception e) {
            logger.error("Error while deleting status " + e.getLocalizedMessage());
            return false;
        }
    }

    @Override
    public List<Status> getAllStatus() {
        List<Status> statuses;
        try {
            statuses = this.mongoOperations.findAll(Status.class);
        } catch (Exception e) {
            logger.error("Error while getting status " + e.getLocalizedMessage());
            statuses = new ArrayList<>();;
        }
        return statuses;
    }

    @Override
    public List<Status> getAllStatusByActivity(String activityName) {
        List<Status> statuses;
        try {
            q = new Query();
            q.addCriteria(Criteria.where(activityName).is(true));
            statuses = this.mongoOperations.find(q, Status.class);
        } catch (Exception e) {
            logger.error("Error while getting status " + e.getLocalizedMessage());
            statuses = new ArrayList<>();;
        }
        return statuses;
    }

    @Override
    public Boolean checkDuplicateUser(Users userObj) {
        Boolean isDuplicate = false;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("roleName").is(userObj.getRoleObj().getRoleName()));
            Roles roleObj = this.mongoOperations.findOne(q, Roles.class);
            q = new Query();
            q.addCriteria(Criteria.where("mobileNumber").is(userObj.getMobileNumber()));
            q.addCriteria(Criteria.where("roleObj").is(roleObj));
            Users existingUsersObj = this.mongoOperations.findOne(q, Users.class);
            isDuplicate = null != existingUsersObj && null != existingUsersObj.getId();
            if (!isDuplicate) {
                q = new Query();
                q.addCriteria(Criteria.where("emailId").is(userObj.getEmailId().toLowerCase().trim()));
//                q.addCriteria(Criteria.where("roleObj").is(roleObj));
                existingUsersObj = this.mongoOperations.findOne(q, Users.class);
                isDuplicate = null != existingUsersObj && null != existingUsersObj.getId();
            }
        } catch (Exception e) {
            logger.error("Error while checking duplicate user " + e.getLocalizedMessage());
            isDuplicate = false;
        }
        return isDuplicate;
    }

    @Override
    public Users createUser(Users userObj) {
        try {
            this.mongoOperations.save(userObj);
            userObj = getUserById(userObj.getId());
            return userObj;
        } catch (Exception e) {
            logger.error("Error while creating user " + e.getLocalizedMessage());
            return null;
        }
    }

    @Override
    public Users getUserById(String userId) {
        Users userObj;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("id").is(userId));
            userObj = this.mongoOperations.findOne(q, Users.class);
            if (null != userObj && null != userObj.getId()) {
            } else {
                userObj = null;
            }
        } catch (Exception e) {
            logger.error("Error while getting status " + e.getLocalizedMessage());
            userObj = null;
        }
        return userObj;
    }

    @Override
    public Users getUserByMobileNumber(String mobileNumber) {
        Users userObj;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("mobileNumber").is(mobileNumber));
            userObj = this.mongoOperations.findOne(q, Users.class);
            if (null != userObj && null != userObj.getId()) {
            } else {
                userObj = null;
            }
        } catch (Exception e) {
            logger.error("Error while getting user " + e.getLocalizedMessage());
            userObj = null;
        }
        return userObj;
    }

    @Override
    public Boolean checkUserDependency(Users userObj) {
        Boolean isDependent = false;
        try {
//            List<Doctors> doctorses = this.mongoOperations.findAll(Doctors.class);
//            if (doctorses.size() > 0) {
//                isDependent = true;
//            } else {
//                isDependent = false;
//            }
            isDependent = false;
        } catch (Exception e) {
            logger.error("Error while checking user dependency " + e.getLocalizedMessage());
            isDependent = false;
        }
        return isDependent;
    }

    @Override
    public Boolean deleteUsers(Users userObj) {
        try {
            this.mongoOperations.remove(userObj);
            return true;
        } catch (Exception e) {
            logger.error("Error while deleting user " + e.getLocalizedMessage());
            return false;
        }
    }

    @Override
    public List<Users> getAllUsers(String statusName) {
        List<Users> userses;
        try {
            Status statusObj = getStatusByName(statusName);
            q = new Query();
            q.addCriteria(Criteria.where("statusObj").is(statusObj));
            q.addCriteria(Criteria.where("isVisible").is(true));
            userses = this.mongoOperations.find(q, Users.class);
        } catch (Exception e) {
            logger.error("Error while getting users " + e.getLocalizedMessage());
            userses = new ArrayList<>();;
        }
        return userses;
    }

    @Override
    public Boolean checkDuplicateCompany(Companies companyObj) {
        Boolean isDuplicate = false;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("vatNumber").is(Pattern.compile(companyObj.getVatNumber(), Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE)));
            Companies existingCompanyObj = this.mongoOperations.findOne(q, Companies.class);
            isDuplicate = null != existingCompanyObj && null != existingCompanyObj.getId();
//            if (!isDuplicate) {
//                q = new Query();
//                q.addCriteria(Criteria.where("vatNumber").is(companyObj.getVatNumber()));
//                existingCompanyObj = this.mongoOperations.findOne(q, Companies.class);
//                isDuplicate = null != existingCompanyObj && null != existingCompanyObj.getId();
//                if (!isDuplicate) {
//                    q = new Query();
//                    q.addCriteria(Criteria.where("mobilesNumber").is(companyObj.getMobilesNumber()));
//                    existingCompanyObj = this.mongoOperations.findOne(q, Companies.class);
//                    isDuplicate = null != existingCompanyObj && null != existingCompanyObj.getId();
//                }
//            }
        } catch (Exception e) {
            logger.error("Error while checking duplicate company " + e.getLocalizedMessage());
            isDuplicate = false;
        }
        return isDuplicate;
    }

    @Override
    public Companies createCompany(Companies companyObj) {
        try {
            this.mongoOperations.save(companyObj);
            companyObj = getCompanyById(companyObj.getId());
            return companyObj;
        } catch (Exception e) {
            logger.error("Error while creating company " + e.getLocalizedMessage());
            return null;
        }
    }

    @Override
    public Companies getCompanyById(String userId) {
        Companies companyObj;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("id").is(userId));
            companyObj = this.mongoOperations.findOne(q, Companies.class);
            if (null != companyObj && null != companyObj.getId()) {
            } else {
                companyObj = null;
            }
        } catch (Exception e) {
            logger.error("Error while getting company " + e.getLocalizedMessage());
            companyObj = null;
        }
        return companyObj;
    }

    @Override
    public List<Companies> getAllCompanies(String statusName) {
        List<Companies> companies;
        try {
            Status statusObj = getStatusByName(statusName);
            q = new Query();
            q.addCriteria(Criteria.where("statusObj").is(statusObj));
            companies = this.mongoOperations.find(q, Companies.class);
        } catch (Exception e) {
            logger.error("Error while getting users " + e.getLocalizedMessage());
            companies = new ArrayList<>();;
        }
        return companies;
    }

    @Override
    public Boolean checkDuplicateDepartment(Departments departmentObj) {
        Boolean isDuplicate = false;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("departmentName").is(Pattern.compile(departmentObj.getDepartmentName(), Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE)));
            q.addCriteria(Criteria.where("companyObj").is(departmentObj.getCompanyObj()));
            Departments existingDepartmentObj = this.mongoOperations.findOne(q, Departments.class);
            isDuplicate = null != existingDepartmentObj && null != existingDepartmentObj.getId();
//            if (!isDuplicate) {
//                q = new Query();
//                q.addCriteria(Criteria.where("vatNumber").is(companyObj.getVatNumber()));
//                existingCompanyObj = this.mongoOperations.findOne(q, Companies.class);
//                isDuplicate = null != existingCompanyObj && null != existingCompanyObj.getId();
//                if (!isDuplicate) {
//                    q = new Query();
//                    q.addCriteria(Criteria.where("mobilesNumber").is(companyObj.getMobilesNumber()));
//                    existingCompanyObj = this.mongoOperations.findOne(q, Companies.class);
//                    isDuplicate = null != existingCompanyObj && null != existingCompanyObj.getId();
//                }
//            }
        } catch (Exception e) {
            logger.error("Error while checking duplicate department " + e.getLocalizedMessage());
            isDuplicate = false;
        }
        return isDuplicate;
    }

    @Override
    public Departments createDepartment(Departments companyObj) {
        try {
            this.mongoOperations.save(companyObj);
            companyObj = getDepartmentById(companyObj.getId());
            return companyObj;
        } catch (Exception e) {
            logger.error("Error while creating deprtment " + e.getLocalizedMessage());
            return null;
        }
    }

    @Override
    public Departments getDepartmentById(String departmentId) {
        Departments departmentObj;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("id").is(departmentId));
            departmentObj = this.mongoOperations.findOne(q, Departments.class);
            if (null != departmentObj && null != departmentObj.getId()) {
            } else {
                departmentObj = null;
            }
        } catch (Exception e) {
            logger.error("Error while getting department " + e.getLocalizedMessage());
            departmentObj = null;
        }
        return departmentObj;
    }

    @Override
    public List<Departments> getAllDepartmentsByCompanyId(String statusName, String companyId) {
        List<Departments> departmentses;
        try {
            Status statusObj = getStatusByName(statusName);
            Companies companyObj = getCompanyById(companyId);
            q = new Query();
            q.addCriteria(Criteria.where("statusObj").is(statusObj));
            q.addCriteria(Criteria.where("companyObj").is(companyObj));
            departmentses = this.mongoOperations.find(q, Departments.class);
        } catch (Exception e) {
            logger.error("Error while getting departments" + e.getLocalizedMessage());
            departmentses = new ArrayList<>();;
        }
        return departmentses;
    }

    @Override
    public Boolean checkDuplicateProject(Projects projectObj) {
        Boolean isDuplicate = false;
        try {
            q = new Query();
//            q.addCriteria(Criteria.where("projectTitle").is(Pattern.compile(projectObj.getProjectTitle(), Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE)));
//            q.addCriteria(Criteria.where("projectCode").is(Pattern.compile(projectObj.getProjectCode(), Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE)));
            q.addCriteria(Criteria.where("projectCode").is(projectObj.getProjectCode()));
            Projects existingProjectObj = this.mongoOperations.findOne(q, Projects.class);
            isDuplicate = null != existingProjectObj && null != existingProjectObj.getId();
//            if (!isDuplicate) {
//                q = new Query();
//                q.addCriteria(Criteria.where("vatNumber").is(companyObj.getVatNumber()));
//                existingCompanyObj = this.mongoOperations.findOne(q, Companies.class);
//                isDuplicate = null != existingCompanyObj && null != existingCompanyObj.getId();
//                if (!isDuplicate) {
//                    q = new Query();
//                    q.addCriteria(Criteria.where("mobilesNumber").is(companyObj.getMobilesNumber()));
//                    existingCompanyObj = this.mongoOperations.findOne(q, Companies.class);
//                    isDuplicate = null != existingCompanyObj && null != existingCompanyObj.getId();
//                }
//            }
        } catch (Exception e) {
            logger.error("Error while checking duplicate project " + e.getLocalizedMessage());
            isDuplicate = false;
        }
        return isDuplicate;
    }

    @Override
    public Projects createProject(Projects projectObj) {
        try {
            this.mongoOperations.save(projectObj);
            projectObj = getProjectById(projectObj.getId());
            return projectObj;
        } catch (Exception e) {
            logger.error("Error while creating company " + e.getLocalizedMessage());
            return null;
        }
    }

    @Override
    public Projects getProjectById(String userId) {
        Projects projectObj;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("id").is(userId));
            projectObj = this.mongoOperations.findOne(q, Projects.class);
            if (null != projectObj && null != projectObj.getId()) {
            } else {
                projectObj = null;
            }
        } catch (Exception e) {
            logger.error("Error while getting company " + e.getLocalizedMessage());
            projectObj = null;
        }
        return projectObj;
    }

    @Override
    public void removeProject(Projects projectObj) {
        try {
            this.mongoOperations.remove(projectObj);
        } catch (Exception e) {
            logger.error("Error while removing project " + e.getLocalizedMessage());
        }
    }

    @Override
    public List<Projects> getAllProjectsByCompanyId(String statusName, String companyId) {
        List<Projects> projectses;
        try {
            Status statusObj = getStatusByName(statusName);
            Companies companyObj = getCompanyById(companyId);
            q = new Query();
            q.addCriteria(Criteria.where("statusObj").is(statusObj));
            q.addCriteria(Criteria.where("companyObj").is(companyObj));
            projectses = this.mongoOperations.find(q, Projects.class);
        } catch (Exception e) {
            logger.error("Error while getting users " + e.getLocalizedMessage());
            projectses = new ArrayList<>();;
        }
        return projectses;
    }

    @Override
    public Boolean checkDuplicateSupplier(Supplier supplierObj) {
        Boolean isDuplicate = false;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("vatNumber").is(supplierObj.getVatNumber()));
            Supplier existingSupplierObj = this.mongoOperations.findOne(q, Supplier.class);
            isDuplicate = null != existingSupplierObj && null != existingSupplierObj.getId();
//            if (!isDuplicate) {
//                q = new Query();
//                q.addCriteria(Criteria.where("vatNumber").is(companyObj.getVatNumber()));
//                existingCompanyObj = this.mongoOperations.findOne(q, Companies.class);
//                isDuplicate = null != existingCompanyObj && null != existingCompanyObj.getId();
//                if (!isDuplicate) {
//                    q = new Query();
//                    q.addCriteria(Criteria.where("mobilesNumber").is(companyObj.getMobilesNumber()));
//                    existingCompanyObj = this.mongoOperations.findOne(q, Companies.class);
//                    isDuplicate = null != existingCompanyObj && null != existingCompanyObj.getId();
//                }
//            }
        } catch (Exception e) {
            logger.error("Error while checking duplicate supplier " + e.getLocalizedMessage());
            isDuplicate = false;
        }
        return isDuplicate;
    }

    @Override
    public Supplier createSupplier(Supplier supplierObj) {
        try {
            this.mongoOperations.save(supplierObj);
            supplierObj = getSupplierById(supplierObj.getId());
            return supplierObj;
        } catch (Exception e) {
            logger.error("Error while creating supplier " + e.getLocalizedMessage());
            return null;
        }
    }

    @Override
    public Supplier getSupplierById(String supplierId) {
        Supplier supplierObj;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("id").is(supplierId));
            q.addCriteria(Criteria.where("markAsCommonSupplier").is(false));
            supplierObj = this.mongoOperations.findOne(q, Supplier.class);
            if (null != supplierObj && null != supplierObj.getId()) {
            } else {
                supplierObj = null;
            }
        } catch (Exception e) {
            logger.error("Error while getting supplier " + e.getLocalizedMessage());
            supplierObj = null;
        }
        return supplierObj;
    }

    @Override
    public List<Supplier> getAllSuppliersByProjectId(String statusName, String projectId) {
        List<Supplier> suppliers;
        try {
            Status statusObj = getStatusByName(statusName);
//            Projects projectObj = getProjectById(projectId);
            Companies projectObj = getCompanyById(projectId);
            q = new Query();
            q.addCriteria(Criteria.where("statusObj").is(statusObj));
            q.addCriteria(Criteria.where("companyObj").is(projectObj));
            q.addCriteria(Criteria.where("markAsCommonSupplier").is(false));
            suppliers = this.mongoOperations.find(q, Supplier.class);
        } catch (Exception e) {
            logger.error("Error while getting Supplier " + e.getLocalizedMessage());
            suppliers = new ArrayList<>();
        }
        return suppliers;
    }

    @Override
    public List<Supplier> getAllCommonSuppliers(String statusName) {
        List<Supplier> suppliers;
        try {
            Status statusObj = getStatusByName(statusName);
            q = new Query();
            q.addCriteria(Criteria.where("statusObj").is(statusObj));
            q.addCriteria(Criteria.where("markAsCommonSupplier").is(true));
            suppliers = this.mongoOperations.find(q, Supplier.class);
        } catch (Exception e) {
            logger.error("Error while getting common Supplier " + e.getLocalizedMessage());
            suppliers = new ArrayList<>();
        }
        return suppliers;
    }

    @Override
    public Boolean checkDuplicateTransferType(TransferType supplierObj) {
        Boolean isDuplicate = false;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("transferTypeName").is(Pattern.compile(supplierObj.getTransferTypeName(), Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE)));
            TransferType existingTransferTypeObj = this.mongoOperations.findOne(q, TransferType.class);
            isDuplicate = null != existingTransferTypeObj && null != existingTransferTypeObj.getId();
//            if (!isDuplicate) {
//                q = new Query();
//                q.addCriteria(Criteria.where("vatNumber").is(companyObj.getVatNumber()));
//                existingCompanyObj = this.mongoOperations.findOne(q, Companies.class);
//                isDuplicate = null != existingCompanyObj && null != existingCompanyObj.getId();
//                if (!isDuplicate) {
//                    q = new Query();
//                    q.addCriteria(Criteria.where("mobilesNumber").is(companyObj.getMobilesNumber()));
//                    existingCompanyObj = this.mongoOperations.findOne(q, Companies.class);
//                    isDuplicate = null != existingCompanyObj && null != existingCompanyObj.getId();
//                }
//            }
        } catch (Exception e) {
            logger.error("Error while checking duplicate supplier " + e.getLocalizedMessage());
            isDuplicate = false;
        }
        return isDuplicate;
    }

    @Override
    public TransferType createTransferType(TransferType transferTypeObj) {
        try {
            this.mongoOperations.save(transferTypeObj);
            transferTypeObj = getTransferTypeById(transferTypeObj.getId());
            return transferTypeObj;
        } catch (Exception e) {
            logger.error("Error while creating supplier " + e.getLocalizedMessage());
            return null;
        }
    }

    @Override
    public TransferType getTransferTypeById(String supplierId) {
        TransferType transferTypeObj;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("id").is(supplierId));
            transferTypeObj = this.mongoOperations.findOne(q, TransferType.class);
            if (null != transferTypeObj && null != transferTypeObj.getId()) {
            } else {
                transferTypeObj = null;
            }
        } catch (Exception e) {
            logger.error("Error while getting supplier " + e.getLocalizedMessage());
            transferTypeObj = null;
        }
        return transferTypeObj;
    }

    @Override
    public TransferType getTransferTypeByName(String transferTypeName) {
        TransferType transferTypeObj;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("transferTypeName").is(transferTypeName));
            transferTypeObj = this.mongoOperations.findOne(q, TransferType.class);
            if (null != transferTypeObj && null != transferTypeObj.getId()) {
            } else {
                transferTypeObj = null;
            }
        } catch (Exception e) {
            logger.error("Error while getting supplier " + e.getLocalizedMessage());
            transferTypeObj = null;
        }
        return transferTypeObj;
    }

    @Override
    public List<TransferType> getAllTransferType(String statusName, String additionalKey) {
        List<TransferType> transferTypes;
        try {
            Status statusObj = getStatusByName(statusName);
            q = new Query();
            q.addCriteria(Criteria.where("statusObj").is(statusObj));
            if (!additionalKey.equalsIgnoreCase("all")) {
                q.addCriteria(Criteria.where(additionalKey).is(true));
            }
            transferTypes = this.mongoOperations.find(q, TransferType.class);
        } catch (Exception e) {
            logger.error("Error while getting Supplier " + e.getLocalizedMessage());
            transferTypes = new ArrayList<>();;
        }
        return transferTypes;
    }

    @Override
    public List<Requisition> getAllRequisitionByUserStatusAndCompany(GetRequisitionRequest grrObj) {
        List<Requisition> requisitions;
        try {
            Users userObj = getUserById(grrObj.getLoggedInUserId());
            Companies companyObj = getCompanyById(grrObj.getCompanyId());
            Status statusObj = getStatusById(grrObj.getRequisitionStatusId());
            q = new Query();
            if (null != userObj && null != userObj.getRoleObj() && null != userObj.getRoleObj().getRoleName() && userObj.getRoleObj().getRoleName().equalsIgnoreCase("Approver")) {
                q.addCriteria(Criteria.where("preferedApprover").is(userObj));
            } else {
                q.addCriteria(Criteria.where("createdBy").is(userObj));
            }
            q.addCriteria(Criteria.where("companyObj").is(companyObj));
            q.addCriteria(Criteria.where("statusObj").is(statusObj));
            requisitions = this.mongoOperations.find(q, Requisition.class);
        } catch (Exception e) {
            logger.error("Error while getting Supplier " + e.getLocalizedMessage());
            requisitions = new ArrayList<>();
        }
        return requisitions;
    }

    @Override
    public List<Users> getApproversListForRequisitionUsersByCompanyId(String companyId) {
        List<Users> users;
        try {
            Roles roleObj = getRoleByName("Approver");
//            Companies companyObj = getCompanyById(companyId);
            Status statusObj = getStatusByName("Active");
            q = new Query();
//            q.addCriteria(Criteria.where("companyObj").is(companyObj));
            q.addCriteria(Criteria.where("statusObj").is(statusObj));
            q.addCriteria(Criteria.where("roleObj").is(roleObj));
            List<Users> userses = this.mongoOperations.find(q, Users.class);
            users = new ArrayList<>();
            if (null != userses) {
                for (int i = 0; i < userses.size(); i++) {
                    try {
                        for (int j = 0; j < userses.get(i).getCompanies().size(); j++) {
                            if (userses.get(i).getCompanies().get(j).getId().equalsIgnoreCase(companyId)) {
                                users.add(userses.get(i));
                            }
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                        logger.error("No COmpanies found in this user named " + userses.get(i).getFullName() + " and the error is " + e.getLocalizedMessage());
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error while getting Supplier " + e.getLocalizedMessage());
            users = new ArrayList<>();
        }
        return users;
    }

    @Override
    public Requisition createRequisition(Requisition requisitionObj) {
        try {
            this.mongoOperations.save(requisitionObj);
            requisitionObj = getRequisitionById(requisitionObj.getId());
            return requisitionObj;
        } catch (Exception e) {
            logger.error("Error while creating requisition  " + e.getLocalizedMessage());
            return null;
        }
    }

    public Requisition getRequisitionById(String requisitionId) {
        Requisition requisitionObj;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("id").is(requisitionId));
            requisitionObj = this.mongoOperations.findOne(q, Requisition.class);
            if (null != requisitionObj && null != requisitionObj.getId()) {
            } else {
                requisitionObj = null;
            }
        } catch (Exception e) {
            logger.error("Error while getting requisition " + e.getLocalizedMessage());
            requisitionObj = null;
        }
        return requisitionObj;
    }

    @Override
    public RequisitionProducts createRequisitionProduct(RequisitionProducts requisitionProductObj) {
        try {
            this.mongoOperations.save(requisitionProductObj);
            requisitionProductObj = getRequisitionProductById(requisitionProductObj.getId());
            return requisitionProductObj;
        } catch (Exception e) {
            logger.error("Error while creating requisition  " + e.getLocalizedMessage());
            return null;
        }
    }

    private RequisitionProducts getRequisitionProductById(String rpId) {
        RequisitionProducts requisitionProductObj;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("id").is(rpId));
            requisitionProductObj = this.mongoOperations.findOne(q, RequisitionProducts.class);
            if (null != requisitionProductObj && null != requisitionProductObj.getId()) {
            } else {
                requisitionProductObj = null;
            }
        } catch (Exception e) {
            logger.error("Error while getting requisition " + e.getLocalizedMessage());
            requisitionProductObj = null;
        }
        return requisitionProductObj;
    }

    @Override
    public long getRequisitionCountByCompany(Companies companyObj, Boolean isLPO) {
        long count;
        try {
            Calendar cal = Calendar.getInstance();

            cal.set(Calendar.DAY_OF_YEAR, 1);
            Date yearStartDate = cal.getTime();

            cal.set(Calendar.DAY_OF_YEAR, cal.getActualMaximum(Calendar.DAY_OF_YEAR));
            Date yearEndDate = cal.getTime();
            q = new Query();
            q.addCriteria(Criteria.where("companyObj").is(companyObj));
            System.out.println("Company ---> " + companyObj.getId());
            q.addCriteria(Criteria.where("requisitionCreatedOn").gte(yearStartDate).lte(yearEndDate));
            System.out.println("Start Date ---> " + yearStartDate);
            System.out.println("End Date---> " + yearEndDate);
            if (isLPO) {
                System.out.println("Approve Status");

                List<Requisition> requisitions = this.mongoOperations.find(q, Requisition.class);
                List<Requisition> approvedRequisitions = new ArrayList<>();
                for (int i = 0; i < requisitions.size(); i++) {
                    if (requisitions.get(i).getStatusObj().getStatusName().equalsIgnoreCase("Approved")) {
                        approvedRequisitions.add(requisitions.get(i));
                    }
                }
                count = approvedRequisitions.size();
//org
//                Status statusObj = getStatusByName("Approved");
//                if (null != statusObj) {
//                    q.addCriteria(Criteria.where("statusObj").is(statusObj));
//                }
            } else {
                count = this.mongoOperations.count(q, Requisition.class);
            }
        } catch (Exception e) {
            logger.error("Error while getting Supplier " + e.getLocalizedMessage());
            count = 0;
        }
        return count;
    }

    @Override
    public List<Requisition> getAllActiveRequisitionByCondition(FDRequisitionRequest fdrrObj) {
        List<Requisition> requisitions = new ArrayList<>();
        try {
            List<Status> statuses = new ArrayList<>();
            Status statusObj = getStatusByName("Approved");
            statuses.add(statusObj);
            if (fdrrObj.getIncludeRaisedReq()) {
                Status raisedStatusObj = getStatusByName("Raised");
                statuses.add(raisedStatusObj);
            }
            if (null != fdrrObj.getFromDate() && null != fdrrObj.getToDate()) {
                fdrrObj.getFromDate().setHours(0);
                fdrrObj.getFromDate().setMinutes(0);
                fdrrObj.getFromDate().setSeconds(1);

                fdrrObj.getToDate().setHours(23);
                fdrrObj.getToDate().setMinutes(59);
                fdrrObj.getToDate().setSeconds(59);
            }
            for (int k = 0; k < statuses.size(); k++) {
                for (int i = 0; i < fdrrObj.getDepartments().size(); i++) {
                    if (null != fdrrObj.getSuppliers() && fdrrObj.getSuppliers().size() > 0) {
                        for (int j = 0; j < fdrrObj.getSuppliers().size(); j++) {
                            try {
                                q = new Query();
                                q.addCriteria(Criteria.where("statusObj").is(statuses.get(k)));
                                if (fdrrObj.getFormType().size() == 1) {
                                    q.addCriteria(Criteria.where("typeOfForm").is(fdrrObj.getFormType().get(0).getTitle()));
                                }
                                q.addCriteria(Criteria.where("companyObj").is(fdrrObj.getCompanyObj()));
                                q.addCriteria(Criteria.where("departmentObj").is(fdrrObj.getDepartments().get(i)));

                                q.addCriteria(Criteria.where("supplierObj").is(fdrrObj.getSuppliers().get(j)));

                                if (null != fdrrObj.getFromDate() && null != fdrrObj.getToDate()) {
                                    q.addCriteria(Criteria.where("requisitionCreatedOn").gt(fdrrObj.getFromDate()).lt(fdrrObj.getToDate()));
                                }
                                if (fdrrObj.getIsPartialPaymentScreen()) {
                                    q.addCriteria(Criteria.where("paidAmount").gt(0));
                                }
                                requisitions.addAll(this.mongoOperations.find(q, Requisition.class));
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    } else {
                        try {
                            q = new Query();
                            q.addCriteria(Criteria.where("statusObj").is(statuses.get(k)));
                            if (fdrrObj.getFormType().size() == 1) {
                                q.addCriteria(Criteria.where("typeOfForm").is(fdrrObj.getFormType().get(0).getTitle()));
                            }
                            q.addCriteria(Criteria.where("companyObj").is(fdrrObj.getCompanyObj()));
                            q.addCriteria(Criteria.where("departmentObj").is(fdrrObj.getDepartments().get(i)));

                            if (null != fdrrObj.getFromDate() && null != fdrrObj.getToDate()) {
                                q.addCriteria(Criteria.where("requisitionCreatedOn").gt(fdrrObj.getFromDate()).lt(fdrrObj.getToDate()));
                            }
                            if (fdrrObj.getIsPartialPaymentScreen()) {
                                q.addCriteria(Criteria.where("paidAmount").gt(0));
                            }
                            requisitions.addAll(this.mongoOperations.find(q, Requisition.class));
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error while getting Supplier " + e.getLocalizedMessage());
            requisitions = new ArrayList<>();
        }
        return requisitions;
    }

    @Override
    public List<Requisition> getAllRequisitionByCondition(FDRequisitionRequest fdrrObj) {
        List<Requisition> requisitions = new ArrayList<>();
        try {
            if (null != fdrrObj.getFromDate() && null != fdrrObj.getToDate()) {
                fdrrObj.getFromDate().setHours(0);
                fdrrObj.getFromDate().setMinutes(0);
                fdrrObj.getFromDate().setSeconds(1);

                fdrrObj.getToDate().setHours(23);
                fdrrObj.getToDate().setMinutes(59);
                fdrrObj.getToDate().setSeconds(59);
            }
            for (int k = 0; k < fdrrObj.getStatuses().size(); k++) {
                for (int i = 0; i < fdrrObj.getDepartments().size(); i++) {
                    if (null != fdrrObj.getSuppliers() && fdrrObj.getSuppliers().size() > 0) {
                        for (int j = 0; j < fdrrObj.getSuppliers().size(); j++) {
                            q = new Query();
                            q.addCriteria(Criteria.where("statusObj").is(fdrrObj.getStatuses().get(k)));
                            if (fdrrObj.getFormType().size() == 1) {
                                q.addCriteria(Criteria.where("typeOfForm").is(fdrrObj.getFormType().get(0).getTitle()));
                            }
                            q.addCriteria(Criteria.where("companyObj").is(fdrrObj.getCompanyObj()));
                            q.addCriteria(Criteria.where("departmentObj").is(fdrrObj.getDepartments().get(i)));

                            q.addCriteria(Criteria.where("supplierObj").is(fdrrObj.getSuppliers().get(j)));

                            if (null != fdrrObj.getFromDate() && null != fdrrObj.getToDate()) {
                                q.addCriteria(Criteria.where("requisitionCreatedOn").gt(fdrrObj.getFromDate()).lt(fdrrObj.getToDate()));
                            }
//                    q.addCriteria(Criteria.where("pendingAmount").gt(0));
                            requisitions.addAll(this.mongoOperations.find(q, Requisition.class));
                        }
                    } else {
                        q = new Query();
                        q.addCriteria(Criteria.where("statusObj").is(fdrrObj.getStatuses().get(k)));
                        if (fdrrObj.getFormType().size() == 1) {
                            q.addCriteria(Criteria.where("typeOfForm").is(fdrrObj.getFormType().get(0).getTitle()));
                        }
                        q.addCriteria(Criteria.where("companyObj").is(fdrrObj.getCompanyObj()));
                        q.addCriteria(Criteria.where("departmentObj").is(fdrrObj.getDepartments().get(i)));

                        if (null != fdrrObj.getFromDate() && null != fdrrObj.getToDate()) {
                            q.addCriteria(Criteria.where("requisitionCreatedOn").gt(fdrrObj.getFromDate()).lt(fdrrObj.getToDate()));
                        }
//                    q.addCriteria(Criteria.where("pendingAmount").gt(0));
                        requisitions.addAll(this.mongoOperations.find(q, Requisition.class));
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error while getting Supplier " + e.getLocalizedMessage());
            requisitions = new ArrayList<>();
        }
        return requisitions;
    }

    @Override
    public List<RequisitionProducts> getAllRequisitionProductsByRequisitionId(String requisitionId) {
        List<RequisitionProducts> requisitionProductses;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("requisitionId").is(requisitionId));
            requisitionProductses = this.mongoOperations.find(q, RequisitionProducts.class);
            if (null != requisitionProductses && requisitionProductses.size() > 0) {
            } else {
                requisitionProductses = new ArrayList<>();
            }
        } catch (Exception e) {
            logger.error("Error while getting requisition " + e.getLocalizedMessage());
            requisitionProductses = new ArrayList<>();
        }
        return requisitionProductses;
    }

    @Override
    public PaymentHistory createPaymentHistory(PaymentHistory paymentHistoryObj) {
        try {
            this.mongoOperations.save(paymentHistoryObj);
            paymentHistoryObj = getPaymentHistoryById(paymentHistoryObj.getId());
            return paymentHistoryObj;
        } catch (Exception e) {
            logger.error("Error while creating paymentHistory  " + e.getLocalizedMessage());
            return null;
        }
    }

    @Override
    public List<PaymentHistory> getAllPaymentHistoryByRequisitionId(String requisitionId) {
        List<PaymentHistory> paymentHistorys;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("requisitionId").is(requisitionId));
            paymentHistorys = this.mongoOperations.find(q, PaymentHistory.class);
        } catch (Exception e) {
            logger.error("Error while getting uom " + e.getLocalizedMessage());
            paymentHistorys = new ArrayList<>();
        }
        return paymentHistorys;
    }

    @Override
    public Requisition getRequititionById(String requisitionId) {
        Requisition requisitionObj;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("id").is(requisitionId));
            requisitionObj = this.mongoOperations.findOne(q, Requisition.class);
            if (null != requisitionObj && null != requisitionObj.getId()) {
            } else {
                requisitionObj = null;
            }
        } catch (Exception e) {
            logger.error("Error while getting uom " + e.getLocalizedMessage());
            requisitionObj = null;
        }
        return requisitionObj;
    }

    @Override
    public Requisition getRequititionByRequisitionNumber(String requisitionId) {
        Requisition requisitionObj;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("requisitionId").is(requisitionId));
            requisitionObj = this.mongoOperations.findOne(q, Requisition.class);
            if (null != requisitionObj && null != requisitionObj.getId()) {
            } else {
                requisitionObj = null;
            }
        } catch (Exception e) {
            logger.error("Error while getting requisition " + e.getLocalizedMessage());
            requisitionObj = null;
        }
        return requisitionObj;
    }

    private PaymentHistory getPaymentHistoryById(String phId) {
        PaymentHistory paymentHistoryObj;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("id").is(phId));
            paymentHistoryObj = this.mongoOperations.findOne(q, PaymentHistory.class);
            if (null != paymentHistoryObj && null != paymentHistoryObj.getId()) {
            } else {
                paymentHistoryObj = null;
            }
        } catch (Exception e) {
            logger.error("Error while getting paymentHistory " + e.getLocalizedMessage());
            paymentHistoryObj = null;
        }
        return paymentHistoryObj;
    }

    @Override
    public Boolean checkDuplicateCurrency(Currencies currencyObj) {
        Boolean isDuplicate = false;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("currencyLongName").is(Pattern.compile(currencyObj.getCurrencyLongName(), Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE)));
            q.addCriteria(Criteria.where("currencyShortName").is(Pattern.compile(currencyObj.getCurrencyShortName(), Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE)));
            Currencies existingCurrencyObj = this.mongoOperations.findOne(q, Currencies.class);
            isDuplicate = null != existingCurrencyObj && null != existingCurrencyObj.getId();
//            if (!isDuplicate) {
//                q = new Query();
//                q.addCriteria(Criteria.where("vatNumber").is(companyObj.getVatNumber()));
//                existingCompanyObj = this.mongoOperations.findOne(q, Companies.class);
//                isDuplicate = null != existingCompanyObj && null != existingCompanyObj.getId();
//                if (!isDuplicate) {
//                    q = new Query();
//                    q.addCriteria(Criteria.where("mobilesNumber").is(companyObj.getMobilesNumber()));
//                    existingCompanyObj = this.mongoOperations.findOne(q, Companies.class);
//                    isDuplicate = null != existingCompanyObj && null != existingCompanyObj.getId();
//                }
//            }
        } catch (Exception e) {
            logger.error("Error while checking duplicate currencies " + e.getLocalizedMessage());
            isDuplicate = false;
        }
        return isDuplicate;
    }

    @Override
    public Currencies createCurrency(Currencies currencyObj) {
        try {
            this.mongoOperations.save(currencyObj);
            currencyObj = getCurrencyById(currencyObj.getId());
            return currencyObj;
        } catch (Exception e) {
            logger.error("Error while creating paymentHistory  " + e.getLocalizedMessage());
            return null;
        }
    }

    @Override
    public Currencies getCurrencyById(String currencyId) {
        Currencies currencyObj;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("id").is(currencyId));
            currencyObj = this.mongoOperations.findOne(q, Currencies.class);
            if (null != currencyObj && null != currencyObj.getId()) {
            } else {
                currencyObj = null;
            }
        } catch (Exception e) {
            logger.error("Error while getting requisition " + e.getLocalizedMessage());
            currencyObj = null;
        }
        return currencyObj;
    }

    @Override
    public List<Currencies> getAllCurrencies(String statusName) {
        List<Currencies> currencies;
        try {
            Status statusObj = getStatusByName(statusName);
            q = new Query();
            q.addCriteria(Criteria.where("statusObj").is(statusObj));
            currencies = this.mongoOperations.find(q, Currencies.class);
        } catch (Exception e) {
            logger.error("Error while getting Currencies " + e.getLocalizedMessage());
            currencies = new ArrayList<>();;
        }
        return currencies;
    }

    @Override
    public Currencies getPreferedCurrencyObj() {
        Currencies currencyObj;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("isPrefered").is(true));
            List<Currencies> currencieses = this.mongoOperations.find(q, Currencies.class);
            if (null != currencieses && !currencieses.isEmpty()) {
                currencyObj = currencieses.get(0);
            } else {
                currencyObj = null;
            }
        } catch (Exception e) {
            logger.error("Error while getting Currency " + e.getLocalizedMessage());
            currencyObj = null;
        }
        return currencyObj;
    }

    @Override
    public Integer getStatusWiseBadgeCount(Status statusObj, String userMobileNmmber, String companyId) {
        Integer count = 0;
        try {
            q = new Query();
            q.addCriteria(Criteria.where("mobileNumber").is(userMobileNmmber));
            List<Users> userses = this.mongoOperations.find(q, Users.class);
            q = new Query();
            if (null != userses && userses.size() > 0) {
                if (userses.size() > 1) {
                    q.addCriteria(Criteria.where("preferedApprover").is(userses.get(0)));
                } else {
                    if (null != userses.get(0).getRoleObj() && null != userses.get(0).getRoleObj().getRoleName() && userses.get(0).getRoleObj().getRoleName().equalsIgnoreCase("Approver")) {
                        q.addCriteria(Criteria.where("preferedApprover").is(userses.get(0)));
                    } else {
                        q.addCriteria(Criteria.where("createdBy").is(userses.get(0)));
                    }
                }
            }
            q.addCriteria(Criteria.where("statusObj").is(statusObj));
            q.addCriteria(Criteria.where("companyObj.id").is(companyId));
            q.addCriteria(Criteria.where("isUpdated").is(true));
            long recordCount = this.mongoOperations.count(q, Requisition.class);
            count = Integer.parseInt(recordCount + "");
        } catch (Exception e) {
            logger.error("Error while getting Supplier " + e.getLocalizedMessage());
            count = 0;
        }

        return count;
    }

}

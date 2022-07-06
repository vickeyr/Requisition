/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.aws.requisition.controller;

import com.aws.requisition.utilities.EncryptionFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import com.aws.requisition.service.BaseService;
import com.aws.requisition.request.RequestModel;
import com.aws.requisition.response.ResponseModel;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

/**
 *
 * @author Mohammed Gulam Dastagir
 */
@RestController
@RequestMapping("/")
public class BaseController {

    @Autowired
    private BaseService baseService;

    @Autowired
    private EncryptionFile encryptionFile;

    @Autowired
    private MessageSource messageSource;

    private final Logger logger = LoggerFactory.getLogger(BaseController.class);

    @RequestMapping(value = "/validatelogin", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel validateLogin(@RequestBody RequestModel requestModelObj) {
        return baseService.validateLogin(requestModelObj);
    }

    @RequestMapping(value = "/updateuserpassword", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel updateUserPassword(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.updateUserPassword(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/resetpassword", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel resetPassword(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.resetPassword(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/createsystemconfig", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel createSystemConfig(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.createSystemConfig(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getsystemconfig", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getSystemConfig(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getSystemConfig();
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/createuom", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel createUOM(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.createUOM(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/updateuom", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel updateUOM(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.updateUOM(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/deleteuom", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel deleteUOM(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.deleteUOM(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getalluoms", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getAllUOMs(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getAllUOMs(requestModelObj.getExtraVariable());
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/createpayersbankdetails", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel createPayersBankDetail(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.createPayersBankDetail(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/updatepayersbankdetails", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel updatePayersBankDetail(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.updatePayersBankDetail(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/deletepayersbankdetails", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel deletePayersBankDetail(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.deletePayersBankDetail(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getallpayersbankdetails", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getAllPayersBankDetails(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getAllPayersBankDetails(requestModelObj.getExtraVariable());
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/createdepartment", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel createDepartment(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.createDepartment(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/updatedepartment", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel updateDepartment(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.updateDepartment(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/deletedepartment", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel deleteDepartment(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.deleteDepartment(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getalldepartmentsbycompanyid", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getAllDepartmentByCompanyId(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getAllDepartmentsByCompanyId(requestModelObj.getExtraVariable());
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/createrole", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel createRole(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.createRole(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/updaterole", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel updateRole(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.updateRole(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/deleterole", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel deleteRole(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.deleteRole(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getallroles", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getAllRole(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getAllRoles();
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/createstatus", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel createStatus(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.createStatus(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/updatestatus", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel updateStatus(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.updateStatus(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/deletestatus", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel deleteStatus(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.deleteStatus(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getallstatus", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getAllStatus(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getAllStatus();
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getallstatusbyactivity", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getAllStatusByActivity(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getAllStatusByActivity(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getallstatusbyactivitywithbadgecount", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getAllStatusByActivityWithBadgeCount(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getAllStatusByActivityWithBadgeCount(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/updateReadStatus", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel updateReadStatus(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.updateReadStatus(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/createuser", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel createUser(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.createUser(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getuserbyid", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getUserById(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getUserById(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/updateuser", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel updateUser(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.updateUser(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/deleteuser", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel deleteUser(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.deleteUser(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getallusers", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getAllUsers(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getAllUsers(requestModelObj.getExtraVariable());
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/createcompany", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel createCompany(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.createCompany(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/updatecompany", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel updateCompany(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.updateCompany(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/deletecompany", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel deleteCompany(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.deleteCompany(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getallcompanies", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getAllCompanies(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getAllCompanies(requestModelObj.getExtraVariable());
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/createproject", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel createProject(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.createProject(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getprojectbyid", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getProjectById(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getProjectById(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/updateproject", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel updateProject(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.updateProject(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/deleteproject", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel deleteProject(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.deleteProject(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/markprojectcomplate", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel markProjectComplete(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.markProjectComplete(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getallprojectsbycompanyid", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getAllProjectsByCompanyId(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getAllProjectsByCompanyId(requestModelObj.getExtraVariable());
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/createsupplier", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel createSupplier(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.createSupplier(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getcompanybyid", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getCompanyById(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getCompanyById(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/updatesupplier", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel updateSupplier(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.updateSupplier(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/deletesupplier", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel deleteSupplier(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.deleteSupplier(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getallsuppliersbyprojectid", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getAllSuppliersByProjectId(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getAllSuppliersByProjectId(requestModelObj.getExtraVariable());
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getallsuppliersbymultipleprojectid", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getAllSuppliersByMultipleProjectId(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getAllSuppliersByMultipleProjectId(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/createtransfertype", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel createTransferType(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.createTransferType(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/updatetransfertype", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel updateTransferType(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.updateTransferType(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/deletetransfertype", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel deleteTransferType(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.deleteTransferType(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getalltransfertype", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getAllTransferType(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getAllTransferType(requestModelObj.getExtraVariable());
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getallrequisitionbyuserstatusandcompany", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getAllRequisitionByUserStatusAndCompany(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getAllRequisitionByUserStatusAndCompany(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getapproverslistforrequisitionusersbycompanyid", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getApproversListForRequisitionUsersByCompanyId(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getApproversListForRequisitionUsersByCompanyId(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/createrequisition", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel createRequisition(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.createRequisition(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/rejectrequisition", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel rejectRequisition(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.rejectRequisition(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/approverequisition", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel approveRequisition(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.approveRequisition(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/addadditionalinfo", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel addAdditionalInfo(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.addAdditionalInfo(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getallactiverequisitionbycondition", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getAllActiveRequisitionByCondition(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getAllActiveRequisitionByCondition(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getallrequisitionbycondition", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getAllRequisitionByCondition(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getAllRequisitionByCondition(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/addattachmenttorequisition", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel addAttachmentToRequisition(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.addAttachmentToRequisition(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/makepayment", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel makePayment(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.makePayment(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getallpaymenthistorybyrequisitionid", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getAllPaymentHistoryByRequisitionId(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getAllPaymentHistoryByRequisitionId(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/exportdatatoexcel", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel exportDataToExcel(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.exportDataToExcel(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/updaterequisitionstatus", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel updateRequisitionStatus(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.updateRequisitionStatus(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/testapi", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel testAPI(@RequestBody RequestModel requestModelObj) {
        return baseService.testAPI(requestModelObj);
    }

    @RequestMapping(value = "/createcurrency", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel createCurrency(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.createCurrency(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/updatecurrency", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel updateCurrency(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.updateCurrency(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/deletecurrency", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel deleteCurrency(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.deleteCurrency(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getallcurrencies", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getAllCurrencies(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getAllCurrencies(requestModelObj.getExtraVariable());
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/getpreferedcurrency", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel getPreferedCurrency(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.getPreferedCurrency(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/makepreferedcurrency", method = RequestMethod.POST)
    public @ResponseBody
    ResponseModel makePreferedCurrency(@RequestHeader("authToken") String authToken, @RequestBody RequestModel requestModelObj) {
        ResponseModel rmObj = new ResponseModel();
        try {
            Boolean checkAuthentication = encryptionFile.getAuthentication(authToken, requestModelObj.getUserId());
            if (checkAuthentication) {
                return baseService.makePreferedCurrency(requestModelObj);
            } else {
                rmObj.setMessage(messageSource.getMessage("message.invalidauthentication", null, "", LocaleContextHolder.getLocale()));
                rmObj.setStatusCode(10);
            }
        } catch (Exception e) {
            logger.error("BaseController Error ---> " + e.getMessage());
            rmObj.setMessage(messageSource.getMessage("message.errorwhileauthentication", null, "", LocaleContextHolder.getLocale()));
            rmObj.setStatusCode(11);
        }
        return rmObj;
    }

    @RequestMapping(value = "/sendnotification", method = RequestMethod.GET)
    public @ResponseBody
    ResponseModel sendNotification(@RequestParam(name = "type") String type) {
        return baseService.sendNotification(type);
    }

    @RequestMapping(value = "/testemail", method = RequestMethod.GET)
    public @ResponseBody
    ResponseModel testEmail(@RequestParam(name = "type") String type) {
        return baseService.testEmail(type);
    }
}

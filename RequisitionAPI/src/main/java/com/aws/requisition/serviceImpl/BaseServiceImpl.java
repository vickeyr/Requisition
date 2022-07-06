/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.aws.requisition.serviceImpl;

import com.aws.requisition.utilities.EncryptionFile;
import com.aws.requisition.utilities.ObjectMapperUtility;
import com.google.gson.Gson;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;
import com.aws.requisition.dao.BaseDao;
import com.aws.requisition.service.BaseService;
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
import com.aws.requisition.request.Attachments;
import com.aws.requisition.request.FDRequisitionRequest;
import com.aws.requisition.request.GetRequisitionRequest;
import com.aws.requisition.request.LoginRequest;
import com.aws.requisition.request.PushNotificationRequest;
import com.aws.requisition.request.RequestModel;
import com.aws.requisition.request.RequisitionRequest;
import com.aws.requisition.response.ResponseModel;
import com.aws.requisition.utilities.EnglishNumberToWords;
import com.aws.requisition.utilities.NotificationParameter;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.AndroidConfig;
import com.google.firebase.messaging.AndroidNotification;
import com.google.firebase.messaging.ApnsConfig;
import com.google.firebase.messaging.Aps;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.google.gson.GsonBuilder;
import com.itextpdf.html2pdf.HtmlConverter;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.Date;
import java.io.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.*;
import java.text.DateFormat;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.util.Base64;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.logging.Level;
import javax.annotation.PostConstruct;
import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageTypeSpecifier;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import javax.mail.MessagingException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import javax.mail.internet.MimeMessage;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.MimeMessageHelper;

/**
 *
 * @author Mohammed Gulam Dastagir
 */
@Service
public class BaseServiceImpl implements BaseService {

    private static final Logger logger = LoggerFactory.getLogger(BaseServiceImpl.class);

    @Value("${app.firebase-configuration-file}")
    private String firebaseConfigPath;

    @Autowired
    private BaseDao baseDao;

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private ObjectMapperUtility objectMapperUtility;

    @Autowired
    private JavaMailSender javaMailSender;

    @Autowired
    private EncryptionFile encryptionFile;

    private final Gson gson = new Gson();

    private ResponseModel responseModel;

    @PostConstruct
    public void initialize() {
        try {
            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setCredentials(GoogleCredentials.fromStream(new ClassPathResource(firebaseConfigPath).getInputStream())).build();
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                logger.info("Firebase application has been initialized");
            }
        } catch (IOException e) {
            logger.error(e.getMessage());
        }
    }

    @Override
    public ResponseModel validateLogin(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            LoginRequest lrObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), LoginRequest.class);
            if (null != lrObj && null != requestModelObj.getExtraVariable()) {
                List<Users> userList = baseDao.getUserByCredintials(lrObj);
                if (null != userList && userList.size() > 0) {
                    Integer countForFirstTimeUser = 0;
                    for (int i = 0; i < userList.size(); i++) {
                        if (userList.get(i).getIsFirstTimeUser()) {
                            ++countForFirstTimeUser;
                        }
                    }
                    String[] splitStr = encryptionFile.generateEncryptedKey(userList.get(0).getMobileNumber()).split("aws");
                    if (splitStr.length >= 2) {
                        responseModel.setAuthToken(splitStr[1] + encryptionFile.encrypt(splitStr[0], encryptionFile.encGenKey, userList.get(0).getMobileNumber()));
                        responseModel.setMessage(messageSource.getMessage("message.loginsuccess", null, "", LocaleContextHolder.getLocale()));
                        if (countForFirstTimeUser > 0) {
                            responseModel.setStatusCode(150);
                        } else {
                            responseModel.setStatusCode(0);
                        }
                        Users userObj = null;
                        if (requestModelObj.getExtraVariable().toLowerCase().trim().equals("mobile")) {
                            if (userList.size() > 1) {
                                Integer foundIndex = -1;
                                for (int i = 0; i < userList.size(); i++) {
                                    if (userList.get(i).getRoleObj().getRoleName().toLowerCase().trim().equalsIgnoreCase("Approver")) {
                                        foundIndex = i;
                                    }
                                }
                                if (foundIndex >= 0) {
                                    responseModel.setRespObject(userList.get(foundIndex));
                                    userObj = userList.get(foundIndex);
                                } else {
                                    responseModel.setRespObject(userList.get(0));
                                    userObj = userList.get(0);
                                }
                            } else {
                                responseModel.setRespObject(userList.get(0));
                                userObj = userList.get(0);
                            }
                        } else {
                            responseModel.setRespObject(userList.get(0));
                            userObj = userList.get(0);
                        }

                        if (null != lrObj.getDeviceToken()) {
//                            Users userObj = objectMapperUtility.jsonToObject(gson.toJson(responseModel.getRespObject()), Users.class);
                            if (null != userObj) {
                                userObj.setDeviceID(lrObj.getDeviceToken());
                                baseDao.createUser(userObj);
                            }
                        }
                        responseModel.setExtraVariable("User");
                        List<Roles> roleList = new ArrayList<>();
                        List<Users> userRoles = baseDao.getUserRoles(lrObj);
                        for (int i = 0; i < userRoles.size(); i++) {
                            roleList.add(userRoles.get(i).getRoleObj());
                        }
                        responseModel.setRespList(roleList);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.errorcausedwhilelogin", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(101);
                    }
                } else {
                    userList = baseDao.getFirstTimeUserByCredintials(lrObj);
                    if (null != userList && userList.size() > 0) {
                        String[] splitStr = encryptionFile.generateEncryptedKey(userList.get(0).getMobileNumber()).split("aws");
                        if (splitStr.length >= 2) {
                            responseModel.setAuthToken(splitStr[1] + encryptionFile.encrypt(splitStr[0], encryptionFile.encGenKey, userList.get(0).getMobileNumber()));
                            responseModel.setMessage(messageSource.getMessage("message.loginsuccess", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setStatusCode(150);
                            Users userObj = null;
                            if (requestModelObj.getExtraVariable().toLowerCase().trim().equals("mobile")) {
                                if (userList.size() > 1) {
                                    Integer foundIndex = -1;
                                    for (int i = 0; i < userList.size(); i++) {
                                        if (userList.get(i).getRoleObj().getRoleName().toLowerCase().trim().equalsIgnoreCase("Approver")) {
                                            foundIndex = i;
                                        }
                                    }
                                    if (foundIndex >= 0) {
                                        userObj = userList.get(foundIndex);
                                        responseModel.setRespObject(userList.get(foundIndex));
                                    } else {
                                        userObj = userList.get(0);
                                        responseModel.setRespObject(userList.get(0));
                                    }
                                } else {
                                    userObj = userList.get(0);
                                    responseModel.setRespObject(userList.get(0));
                                }
                            } else {
                                userObj = userList.get(0);
                                responseModel.setRespObject(userList.get(0));
                            }
                            if (null != lrObj.getDeviceToken()) {
                                userObj.setDeviceID(lrObj.getDeviceToken());
                                baseDao.createUser(userObj);
                            }
                            responseModel.setExtraVariable("User");
                            List<Roles> roleList = new ArrayList<>();
                            List<Users> userRoles = baseDao.getUserRoles(lrObj);
                            for (int i = 0; i < userRoles.size(); i++) {
                                roleList.add(userRoles.get(i).getRoleObj());
                            }
                            responseModel.setRespList(roleList);
                        } else {
                            responseModel.setMessage(messageSource.getMessage("message.errorcausedwhilelogin", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setStatusCode(101);
                        }
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.invalidlogindetails", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(1);
                    }
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(2);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> validateLogin() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.errorcausedwhilelogin", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(202);
        }
        return responseModel;
    }

    @Override
    public ResponseModel updateUserPassword(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Users userObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Users.class);
            if (null != userObj) {
                userObj.setIsFirstTimeUser(false);
                Users newUsersObj = baseDao.createUser(userObj);
                if (null != newUsersObj) {
                    responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespObject(newUsersObj);
                    responseModel.setStatusCode(0);
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> updateUserPassword() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel resetPassword(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Users userObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Users.class);
            if (null != userObj) {
                userObj.setIsFirstTimeUser(true);
                Users newUsersObj = baseDao.createUser(userObj);
                if (null != newUsersObj) {
                    responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespObject(newUsersObj);
                    responseModel.setStatusCode(0);
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> updateUserPassword() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel createSystemConfig(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            SystemConfig systemConfigObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), SystemConfig.class);
            if (null != systemConfigObj) {
                SystemConfig newSystemConfigObj = baseDao.createSystemConfig(systemConfigObj);
                if (null != newSystemConfigObj) {
                    responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespObject(newSystemConfigObj);
                    responseModel.setStatusCode(0);
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> createSystemConfig() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getSystemConfig() {
        responseModel = new ResponseModel();
        try {
            List<SystemConfig> systemConfigs = baseDao.getAllSystemConfig();
            if (null != systemConfigs && systemConfigs.size() > 0) {
                responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                responseModel.setRespObject(systemConfigs.get(0));
                responseModel.setStatusCode(0);
            } else {
                responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                responseModel.setRespObject(new SystemConfig());
                responseModel.setStatusCode(0);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> getAllRoles() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel createUOM(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            UOM uomObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), UOM.class);
            if (null != uomObj) {
                uomObj.setStatusObj(baseDao.getStatusByName("Active"));
                if (!baseDao.checkDuplicateUOM(uomObj)) {
                    UOM newUomObj = baseDao.createUOM(uomObj);
                    if (null != newUomObj) {
                        responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(newUomObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.duplicate", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(4);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> createRole() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel updateUOM(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            UOM uomObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), UOM.class);
            if (null != uomObj) {
                UOM existingUOMObj = baseDao.getUOMById(uomObj.getId());
                if (existingUOMObj.getId().trim().toLowerCase().equals(uomObj.getId().trim().toLowerCase())) {
                    UOM newUomObj = baseDao.createUOM(uomObj);
                    if (null != newUomObj) {
                        responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(newUomObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    if (!baseDao.checkDuplicateUOM(uomObj)) {
                        UOM newUomObj = baseDao.createUOM(uomObj);
                        if (null != newUomObj) {
                            responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setRespObject(newUomObj);
                            responseModel.setStatusCode(0);
                        } else {
                            responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setStatusCode(2);
                        }
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.duplicate", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(4);
                    }
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> updateUOM() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel deleteUOM(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            UOM uomObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), UOM.class);
            if (null != uomObj) {
                if (uomObj.getStatusObj().getStatusName().equalsIgnoreCase("active")) {
                    uomObj.setStatusObj(baseDao.getStatusByName("InActive"));
                } else {
                    uomObj.setStatusObj(baseDao.getStatusByName("Active"));
                }
                UOM newUomObj = baseDao.createUOM(uomObj);
                if (null != newUomObj) {
//                    if (null != newUomObj) {
                    responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespObject(newUomObj);
                    responseModel.setStatusCode(0);
//                    } else {
//                        responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
//                        responseModel.setStatusCode(2);
//                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.dependency", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(4);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> deleteRole() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getAllUOMs(String statusName) {
        responseModel = new ResponseModel();
        try {
            List<UOM> roleses = baseDao.getAllUOMs(statusName);
            if (null != roleses) {
                responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                responseModel.setRespList(roleses);
                responseModel.setStatusCode(0);
            } else {
                responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(2);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> getAllUOMs() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel createPayersBankDetail(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            PayersBankDetails payersBankDetailsObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), PayersBankDetails.class);
            if (null != payersBankDetailsObj) {
                payersBankDetailsObj.setStatusObj(baseDao.getStatusByName("Active"));
                if (!baseDao.checkDuplicatePayersBankDetails(payersBankDetailsObj)) {
                    PayersBankDetails newPayersBankDetailsObj = baseDao.createPayersBankDetails(payersBankDetailsObj);
                    if (null != newPayersBankDetailsObj) {
                        responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(newPayersBankDetailsObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.duplicate", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(4);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> createRole() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel updatePayersBankDetail(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            PayersBankDetails payersBankDetailsObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), PayersBankDetails.class);
            if (null != payersBankDetailsObj) {
                PayersBankDetails existingPayersBankDetailsObj = baseDao.getPayersBankDetailsById(payersBankDetailsObj.getId());
                if (existingPayersBankDetailsObj.getId().trim().toLowerCase().equals(payersBankDetailsObj.getId().trim().toLowerCase())) {
                    PayersBankDetails newPayersBankDetailsObj = baseDao.createPayersBankDetails(payersBankDetailsObj);
                    if (null != newPayersBankDetailsObj) {
                        responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(newPayersBankDetailsObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    if (!baseDao.checkDuplicatePayersBankDetails(payersBankDetailsObj)) {
                        PayersBankDetails newPayersBankDetailsObj = baseDao.createPayersBankDetails(payersBankDetailsObj);
                        if (null != newPayersBankDetailsObj) {
                            responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setRespObject(newPayersBankDetailsObj);
                            responseModel.setStatusCode(0);
                        } else {
                            responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setStatusCode(2);
                        }
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.duplicate", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(4);
                    }
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> updatePayersBankDetails() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel deletePayersBankDetail(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            PayersBankDetails payersBankDetailObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), PayersBankDetails.class);
            if (null != payersBankDetailObj) {
                if (payersBankDetailObj.getStatusObj().getStatusName().equalsIgnoreCase("active")) {
                    payersBankDetailObj.setStatusObj(baseDao.getStatusByName("InActive"));
                } else {
                    payersBankDetailObj.setStatusObj(baseDao.getStatusByName("Active"));
                }
                PayersBankDetails newPayersBankDetailObj = baseDao.createPayersBankDetails(payersBankDetailObj);
                if (null != newPayersBankDetailObj) {
//                    if (null != newUomObj) {
                    responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespObject(newPayersBankDetailObj);
                    responseModel.setStatusCode(0);
//                    } else {
//                        responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
//                        responseModel.setStatusCode(2);
//                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.dependency", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(4);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> deletePayersBankDetail() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getAllPayersBankDetails(String statusName) {
        responseModel = new ResponseModel();
        try {
            List<PayersBankDetails> payersBankDetailses = baseDao.getAllPayersBankDetails(statusName);
            if (null != payersBankDetailses) {
                responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                responseModel.setRespList(payersBankDetailses);
                responseModel.setStatusCode(0);
            } else {
                responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(2);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> getAllPayersBankDetails() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel createRole(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Roles roleObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Roles.class);
            if (null != roleObj) {
                if (!baseDao.checkDuplicateRole(roleObj)) {
                    Roles newRoleObj = baseDao.createRole(roleObj);
                    if (null != newRoleObj) {
                        responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(newRoleObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.duplicate", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(4);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> createRole() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel updateRole(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Roles roleObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Roles.class);
            if (null != roleObj) {
                Roles existingRoleObj = baseDao.getRoleById(roleObj.getId());
                if (existingRoleObj.getRoleName().trim().toLowerCase().equals(roleObj.getRoleName().trim().toLowerCase())) {
                    Roles newRoleObj = baseDao.createRole(roleObj);
                    if (null != newRoleObj) {
                        responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(newRoleObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    if (!baseDao.checkDuplicateRole(roleObj)) {
                        Roles newRoleObj = baseDao.createRole(roleObj);
                        if (null != newRoleObj) {
                            responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setRespObject(newRoleObj);
                            responseModel.setStatusCode(0);
                        } else {
                            responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setStatusCode(2);
                        }
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.duplicate", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(4);
                    }
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> updateRole() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel deleteRole(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Roles roleObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Roles.class);
            if (null != roleObj) {
                if (!baseDao.checkRoleDependency(roleObj)) {
                    Boolean isDeleted = baseDao.deleteRole(roleObj);
                    if (isDeleted) {
                        responseModel.setMessage(messageSource.getMessage("message.deletedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtodelete", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.dependency", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(4);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> deleteRole() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getAllRoles() {
        responseModel = new ResponseModel();
        try {
            List<Roles> roleses = baseDao.getAllRoles();
            if (null != roleses) {
                responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                responseModel.setRespList(roleses);
                responseModel.setStatusCode(0);
            } else {
                responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(2);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> getAllRoles() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel createStatus(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Status statusObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Status.class);
            if (null != statusObj) {
                if (!baseDao.checkDuplicateStatus(statusObj)) {
                    Status newStatusObj = baseDao.createStatus(statusObj);
                    if (null != newStatusObj) {
                        responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(newStatusObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.duplicate", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(4);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> createStatus() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel updateStatus(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Status statusObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Status.class);
            if (null != statusObj) {
                Status existingStatusObj = baseDao.getStatusById(statusObj.getId());
                if (existingStatusObj.getStatusName().trim().toLowerCase().equals(statusObj.getStatusName().trim().toLowerCase())) {
                    Status newStatusObj = baseDao.createStatus(statusObj);
                    if (null != newStatusObj) {
                        responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(newStatusObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    if (!baseDao.checkDuplicateStatus(statusObj)) {
                        Status newStatusObj = baseDao.createStatus(statusObj);
                        if (null != newStatusObj) {
                            responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setRespObject(newStatusObj);
                            responseModel.setStatusCode(0);
                        } else {
                            responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setStatusCode(2);
                        }
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.duplicate", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(4);
                    }
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> updateStatus() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel deleteStatus(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Status departmentObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Status.class);
            if (null != departmentObj) {
                if (!baseDao.checkStatusDependency(departmentObj)) {
                    Boolean isDeleted = baseDao.deleteStatus(departmentObj);
                    if (isDeleted) {
                        responseModel.setMessage(messageSource.getMessage("message.deletedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtodelete", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.dependency", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(4);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> deleteStatus() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getAllStatus() {
        responseModel = new ResponseModel();
        try {
            List<Status> statuses = baseDao.getAllStatus();
            if (null != statuses) {
                responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                responseModel.setRespList(statuses);
                responseModel.setStatusCode(0);
            } else {
                responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(2);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> deleteStatus() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getAllStatusByActivity(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            if (null != requestModelObj.getExtraVariable()) {
                List<Status> statuses = baseDao.getAllStatusByActivity(requestModelObj.getExtraVariable());
                if (null != statuses) {
                    responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespList(statuses);
                    responseModel.setStatusCode(0);
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> deleteStatus() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getAllStatusByActivityWithBadgeCount(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            if (null != requestModelObj.getExtraVariable() && requestModelObj.getExtraVariable().split(",").length == 2) {
                String data[] = requestModelObj.getExtraVariable().split(",");
                List<Status> statuses = baseDao.getAllStatusByActivity(data[0]);
                if (null != statuses) {
                    List<Integer> statusBadgeCount = new ArrayList<>();
                    for (int i = 0; i < statuses.size(); i++) {
                        try {
                            statusBadgeCount.add(baseDao.getStatusWiseBadgeCount(statuses.get(i), requestModelObj.getUserId(), data[1]));
                        } catch (Exception e) {
                            logger.error("Exception while execution method BaseServiceImpl --> getAllStatusByActivityWithBadgeCount() --> getStatusWiseBadgeCount() ---> " + e.getMessage());
                            statusBadgeCount.add(0);
                        }
                    }
                    responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespList(statuses);
                    responseModel.setRespList2(statusBadgeCount);
                    responseModel.setStatusCode(0);
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> getAllStatusByActivityWithBadgeCount() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel updateReadStatus(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            if (null != requestModelObj.getExtraVariable()) {
                Requisition requisitionObj = baseDao.getRequititionById(requestModelObj.getExtraVariable());
                if (null != requisitionObj) {
                    if (requisitionObj.getIsUpdated()) {
                        requisitionObj.setIsUpdated(false);
                        Requisition newRequisitionObj = baseDao.createRequisition(requisitionObj);
                        if (null != newRequisitionObj && !newRequisitionObj.getIsUpdated()) {
                            responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setRespObject(newRequisitionObj);
                            responseModel.setStatusCode(0);
                        }
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(requisitionObj);
                        responseModel.setStatusCode(-1);
                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(3);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(2);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> updateReadStatus() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel createUser(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Users userObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Users.class);
            if (null != userObj) {
                if (!baseDao.checkDuplicateUser(userObj)) {
                    userObj.setStatusObj(baseDao.getStatusByName("Active"));
                    Users newUserObj = baseDao.createUser(userObj);
                    if (null != newUserObj) {
                        responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(newUserObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.duplicate", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(4);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> createUsers() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getUserById(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            if (null != requestModelObj.getExtraVariable()) {
                Users newUserObj = baseDao.getUserById(requestModelObj.getExtraVariable());
                if (null != newUserObj) {
                    responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespObject(newUserObj);
                    responseModel.setStatusCode(0);
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> getUserById() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel updateUser(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Users userObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Users.class);
            if (null != userObj) {
                Users existingUsersObj = baseDao.getUserById(userObj.getId());
                if (existingUsersObj.getMobileNumber().trim().toLowerCase().equals(userObj.getMobileNumber().trim().toLowerCase())) {
                    Users newUserObj = baseDao.createUser(userObj);
                    if (null != newUserObj) {
                        responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(newUserObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    if (!baseDao.checkDuplicateUser(userObj)) {
                        Users newDepartmentObj = baseDao.createUser(userObj);
                        if (null != newDepartmentObj) {
                            responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setRespObject(newDepartmentObj);
                            responseModel.setStatusCode(0);
                        } else {
                            responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setStatusCode(2);
                        }
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.duplicate", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(4);
                    }
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> updateUsers() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel deleteUser(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Users userObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Users.class);
            if (null != userObj) {
                if (userObj.getStatusObj().getStatusName().equalsIgnoreCase("active")) {
                    userObj.setStatusObj(baseDao.getStatusByName("InActive"));
                } else {
                    userObj.setStatusObj(baseDao.getStatusByName("Active"));
                }
                Users newUserObj = baseDao.createUser(userObj);
                if (null != newUserObj) {
                    responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespObject(newUserObj);
                    responseModel.setStatusCode(0);
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> deleteUsers() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getAllUsers(String statusName) {
        responseModel = new ResponseModel();
        try {
            List<Users> users = baseDao.getAllUsers(statusName);
            if (null != users) {
                responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                responseModel.setRespList(users);
                responseModel.setStatusCode(0);
            } else {
                responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(2);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> getAllUsers() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel createCompany(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Companies companyObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Companies.class);
            if (null != companyObj) {
                if (!baseDao.checkDuplicateCompany(companyObj)) {
                    if (null != requestModelObj.getExtraVariable() && (requestModelObj.getExtraVariable().length() > 0) && requestModelObj.getExtraVariable().contains("base64")) {
                        if (requestModelObj.getExtraVariable().split(";").length == 2 && requestModelObj.getExtraVariable().split(";")[1].split(",").length == 2) {
                            try {
                                List<SystemConfig> systemConfigs = baseDao.getAllSystemConfig();
                                if (systemConfigs.size() > 0) {
                                    String dir = systemConfigs.get(0).getPathPrefix() + "companyLogos/";
                                    if (!Files.exists(Paths.get(dir))) {
                                        Files.createDirectories(Paths.get(dir));
                                        try {
                                            Runtime.getRuntime().exec("chmod -R 777 " + dir);
                                        } catch (Exception e) {
                                            System.out.println("Error while applying permission ---> " + e.getMessage());
                                        }
                                    }
                                    String fileName = dir + companyObj.getCompanyName().toLowerCase().replaceAll("\\s", "-") + ".png";
                                    byte[] data = Base64.getDecoder().decode(requestModelObj.getExtraVariable().split(";")[1].split(",")[1]);

                                    File file = new File(fileName);
                                    FileOutputStream stream = new FileOutputStream(file);
                                    stream.write(data);
                                    try {
                                        Runtime.getRuntime().exec("chmod 777 " + file.getAbsolutePath());
                                    } catch (Exception e) {
                                        System.out.println("Error while applying permission ---> " + e.getMessage());
                                    }
//                                    compressImage(dir, companyObj.getCompanyName().toLowerCase().replaceAll("\\s", "-"), ".png");
                                    companyObj.setImageURL(systemConfigs.get(0).getFileUrlPrefix() + "companyLogos/" + companyObj.getCompanyName().toLowerCase().replaceAll("\\s", "-") + ".png");
                                    companyObj.setStatusObj(baseDao.getStatusByName("Active"));
                                    companyObj.setCreatedBy(baseDao.getUserByMobileNumber(requestModelObj.getUserId()));
                                    companyObj.setCreatedDate(new Date());
//                                    companyObj.setLogoBase64(requestModelObj.getExtraVariable());

                                    Companies newCompanyObj = baseDao.createCompany(companyObj);
                                    if (null != newCompanyObj) {
                                        responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                                        responseModel.setRespObject(newCompanyObj);
                                        responseModel.setStatusCode(0);
                                    } else {
                                        responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                                        responseModel.setStatusCode(2);
                                    }
                                } else {
                                    responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                                    responseModel.setStatusCode(2);
                                }
                            } catch (IOException e) {
                                e.printStackTrace();
                                logger.error("Exception while execution method BaseServiceImpl --> createCompany() --> " + e.getMessage());
                                responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
                                responseModel.setStatusCode(11);
                            }
                        } else {
                            responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setStatusCode(3);
                        }
                    } else {
//                        companyObj.setStatusObj(baseDao.getStatusByName("Active"));
//                        companyObj.setCreatedBy(baseDao.getUserByMobileNumber(requestModelObj.getUserId()));
//                        companyObj.setCreatedDate(new Date());
////                        companyObj.setLogoBase64(requestModelObj.getExtraVariable());
//
//                        Companies newCompanyObj = baseDao.createCompany(companyObj);
//                        if (null != newCompanyObj) {
//                            responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
//                            responseModel.setRespObject(newCompanyObj);
//                            responseModel.setStatusCode(0);
//                        } else {
//                            responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
//                            responseModel.setStatusCode(2);
//                        }
                        responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(3);
                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.duplicate", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(4);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> createCompany() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getCompanyById(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            if (null != requestModelObj.getExtraVariable()) {
                Companies newCompanyObj = baseDao.getCompanyById(requestModelObj.getExtraVariable());
                if (null != newCompanyObj) {
                    responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespObject(newCompanyObj);
                    responseModel.setStatusCode(0);
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> getCompanyById() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel updateCompany(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Companies companyObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Companies.class);
            if (null != companyObj) {
                Companies existingCompanyObj = baseDao.getCompanyById(companyObj.getId());
                if (existingCompanyObj.getVatNumber().trim().toLowerCase().equals(companyObj.getVatNumber().trim().toLowerCase())) {
//                    companyObj.setLogoBase64(requestModelObj.getExtraVariable());
                    if (null != requestModelObj.getExtraVariable() && (requestModelObj.getExtraVariable().length() > 0) && requestModelObj.getExtraVariable().contains("base64")) {
                        if (requestModelObj.getExtraVariable().split(";").length == 2 && requestModelObj.getExtraVariable().split(";")[1].split(",").length == 2) {
                            try {
                                List<SystemConfig> systemConfigs = baseDao.getAllSystemConfig();
                                if (systemConfigs.size() > 0) {
                                    String fileName = systemConfigs.get(0).getPathPrefix() + companyObj.getCompanyName().toLowerCase().replaceAll("\\s", "-") + ".png";
                                    byte[] data = Base64.getDecoder().decode(requestModelObj.getExtraVariable().split(";")[1].split(",")[1]);

                                    File file = new File(fileName);
                                    FileOutputStream stream = new FileOutputStream(file);
                                    stream.write(data);
                                    try {
                                        Runtime.getRuntime().exec("chmod 777 " + file.getAbsolutePath());
                                    } catch (Exception e) {
                                        System.out.println("Error while applying permission ---> " + e.getMessage());
                                    }
//                                    compressImage(systemConfigs.get(0).getPathPrefix(), companyObj.getCompanyName().toLowerCase().replaceAll("\\s", "-"), ".png");
                                    companyObj.setImageURL(systemConfigs.get(0).getFileUrlPrefix() + companyObj.getCompanyName().toLowerCase().replaceAll("\\s", "-") + ".png");
                                    Companies newCompanyrObj = baseDao.createCompany(companyObj);
                                    if (null != newCompanyrObj) {
                                        responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                                        responseModel.setRespObject(newCompanyrObj);
                                        responseModel.setStatusCode(0);
                                    } else {
                                        responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                                        responseModel.setStatusCode(2);
                                    }
                                } else {
                                    responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                                    responseModel.setStatusCode(2);
                                }
                            } catch (IOException e) {
                                e.printStackTrace();
                                logger.error("Exception while execution method BaseServiceImpl --> createCompany() --> " + e.getMessage());
                                responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
                                responseModel.setStatusCode(11);
                            }
                        } else {
                            responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setStatusCode(3);
                        }
                    } else {
                        Companies newCompanyrObj = baseDao.createCompany(companyObj);
                        if (null != newCompanyrObj) {
                            responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setRespObject(newCompanyrObj);
                            responseModel.setStatusCode(0);
                        } else {
                            responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setStatusCode(2);
                        }
                    }

                } else {
                    if (!baseDao.checkDuplicateCompany(companyObj)) {
                        if (null != requestModelObj.getExtraVariable() && (requestModelObj.getExtraVariable().length() > 0) && requestModelObj.getExtraVariable().contains("base64")) {
                            if (requestModelObj.getExtraVariable().split(";").length == 2 && requestModelObj.getExtraVariable().split(";")[1].split(",").length == 2) {
                                try {
                                    List<SystemConfig> systemConfigs = baseDao.getAllSystemConfig();
                                    if (systemConfigs.size() > 0) {
                                        String fileName = systemConfigs.get(0).getPathPrefix() + companyObj.getCompanyName().toLowerCase().replaceAll("\\s", "-") + ".png";
                                        byte[] data = Base64.getDecoder().decode(requestModelObj.getExtraVariable().split(";")[1].split(",")[1]);

                                        File file = new File(fileName);
                                        FileOutputStream stream = new FileOutputStream(file);
                                        stream.write(data);
                                        try {
                                            Runtime.getRuntime().exec("chmod 777 " + file.getAbsolutePath());
                                        } catch (Exception e) {
                                            System.out.println("Error while applying permission ---> " + e.getMessage());
                                        }
                                        companyObj.setImageURL(systemConfigs.get(0).getFileUrlPrefix() + companyObj.getCompanyName().toLowerCase().replaceAll("\\s", "-") + ".png");
                                        Companies newCompanyrObj = baseDao.createCompany(companyObj);
                                        if (null != newCompanyrObj) {
                                            responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                                            responseModel.setRespObject(newCompanyrObj);
                                            responseModel.setStatusCode(0);
                                        } else {
                                            responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                                            responseModel.setStatusCode(2);
                                        }
                                    } else {
                                        responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                                        responseModel.setStatusCode(2);
                                    }
                                } catch (IOException e) {
                                    e.printStackTrace();
                                    logger.error("Exception while execution method BaseServiceImpl --> updateCompany() --> " + e.getMessage());
                                    responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
                                    responseModel.setStatusCode(11);
                                }
                            } else {
                                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                                responseModel.setStatusCode(3);
                            }
                        } else {
                            Companies newCompanyObj = baseDao.createCompany(companyObj);
                            if (null != newCompanyObj) {
                                responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                                responseModel.setRespObject(newCompanyObj);
                                responseModel.setStatusCode(0);
                            } else {
                                responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                                responseModel.setStatusCode(2);
                            }
                        }
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.duplicate", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(4);
                    }
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> updateCompany() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel deleteCompany(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Companies companyObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Companies.class);
            if (null != companyObj) {
                if (companyObj.getStatusObj().getStatusName().equalsIgnoreCase("active")) {
                    companyObj.setStatusObj(baseDao.getStatusByName("InActive"));
                } else {
                    companyObj.setStatusObj(baseDao.getStatusByName("Active"));
                }
                Companies newCompanyObj = baseDao.createCompany(companyObj);
                if (null != newCompanyObj) {
                    responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespObject(newCompanyObj);
                    responseModel.setStatusCode(0);
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> deleteUsers() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getAllCompanies(String statusName) {
        responseModel = new ResponseModel();
        try {
            List<Companies> companies = baseDao.getAllCompanies(statusName);
            if (null != companies) {
                responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                responseModel.setRespList(companies);
                responseModel.setStatusCode(0);
            } else {
                responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(2);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> getAllCompanies() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel createDepartment(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Departments departmentObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Departments.class);
            if (null != departmentObj) {
                departmentObj.setStatusObj(baseDao.getStatusByName("Active"));
                if (!baseDao.checkDuplicateDepartment(departmentObj)) {
                    Departments newDepartmentObj = baseDao.createDepartment(departmentObj);
                    if (null != newDepartmentObj) {
                        responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(newDepartmentObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.duplicate", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(4);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> createDepartment() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel updateDepartment(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Departments departmentObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Departments.class);
            if (null != departmentObj) {
                if (null != departmentObj.getId()) {
                    Departments existingDepartmentObj = baseDao.getDepartmentById(departmentObj.getId());
                    if (null != existingDepartmentObj && existingDepartmentObj.getId().trim().toLowerCase().equals(departmentObj.getId().trim().toLowerCase())) {
                        Departments newDepartmentObj = baseDao.createDepartment(departmentObj);
                        if (null != newDepartmentObj) {
                            responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setRespObject(newDepartmentObj);
                            responseModel.setStatusCode(0);
                        } else {
                            responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setStatusCode(2);
                        }
                    } else {
                        if (!baseDao.checkDuplicateDepartment(departmentObj)) {
                            Departments newDepartmentObj = baseDao.createDepartment(departmentObj);
                            if (null != newDepartmentObj) {
                                responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                                responseModel.setRespObject(newDepartmentObj);
                                responseModel.setStatusCode(0);
                            } else {
                                responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                                responseModel.setStatusCode(2);
                            }
                        } else {
                            responseModel.setMessage(messageSource.getMessage("message.duplicate", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setStatusCode(4);
                        }
                    }
                } else {
                    if (!baseDao.checkDuplicateDepartment(departmentObj)) {
                        Departments newDepartmentObj = baseDao.createDepartment(departmentObj);
                        if (null != newDepartmentObj) {
                            responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setRespObject(newDepartmentObj);
                            responseModel.setStatusCode(0);
                        } else {
                            responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setStatusCode(2);
                        }
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.duplicate", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(4);
                    }
                }

            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> updateDepartment() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel deleteDepartment(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Departments departmentObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Departments.class);
            if (null != departmentObj) {
                if (departmentObj.getStatusObj().getStatusName().equalsIgnoreCase("active")) {
                    departmentObj.setStatusObj(baseDao.getStatusByName("InActive"));
                } else {
                    departmentObj.setStatusObj(baseDao.getStatusByName("Active"));
                }
                Departments newDepartmentObj = baseDao.createDepartment(departmentObj);
                if (null != newDepartmentObj) {
//                    if (null != newDepartmentObj) {
                    responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespObject(newDepartmentObj);
                    responseModel.setStatusCode(0);
//                    } else {
//                        responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
//                        responseModel.setStatusCode(2);
//                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.dependency", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(4);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> deleteDepartment() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getAllDepartmentsByCompanyId(String statusName) {
        responseModel = new ResponseModel();
        try {
            String[] splittedValue = statusName.split(",");
            if (splittedValue.length == 2) {
                List<Departments> departmentses = baseDao.getAllDepartmentsByCompanyId(splittedValue[0], splittedValue[1]);
                if (null != departmentses) {
                    responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespList(departmentses);
                    responseModel.setStatusCode(0);
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(2);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> getAllDepartments() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel createProject(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Projects projectObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Projects.class);
            if (null != projectObj) {
                if (!baseDao.checkDuplicateProject(projectObj)) {
                    projectObj.setStatusObj(baseDao.getStatusByName("Active"));
                    Projects newProjectObj = baseDao.createProject(projectObj);
                    if (null != newProjectObj) {
                        Companies companyObj = newProjectObj.getCompanyObj();
                        companyObj.setIsProjectAddedAndActive(true);
                        Companies newCompanuObj = baseDao.createCompany(companyObj);
                        if (null != newCompanuObj) {
                            responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setRespObject(newProjectObj);
                            responseModel.setStatusCode(0);
                        } else {
                            baseDao.removeProject(projectObj);
                            responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setStatusCode(2);
                        }
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.duplicate", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(4);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> createCompany() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getProjectById(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            if (null != requestModelObj.getExtraVariable()) {
                Projects newProjectObj = baseDao.getProjectById(requestModelObj.getExtraVariable());
                if (null != newProjectObj) {
                    responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespObject(newProjectObj);
                    responseModel.setStatusCode(0);
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> getProjectById() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel updateProject(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Projects projectObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Projects.class);
            if (null != projectObj) {
                Projects existingProjectObj = baseDao.getProjectById(projectObj.getId());
                if (existingProjectObj.getProjectCode().trim().toLowerCase().equals(existingProjectObj.getProjectCode().trim().toLowerCase())) {
                    Projects newProjectObj = baseDao.createProject(projectObj);
                    if (null != newProjectObj) {
                        responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(newProjectObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    if (!baseDao.checkDuplicateProject(projectObj)) {
                        Projects newProjectObj = baseDao.createProject(projectObj);
                        if (null != newProjectObj) {
                            responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setRespObject(newProjectObj);
                            responseModel.setStatusCode(0);
                        } else {
                            responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setStatusCode(2);
                        }
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.duplicate", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(4);
                    }
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> updateProject() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel deleteProject(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Projects projectObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Projects.class);
            if (null != projectObj) {
                if (projectObj.getStatusObj().getStatusName().equalsIgnoreCase("active")) {
                    projectObj.setStatusObj(baseDao.getStatusByName("InActive"));
                } else {
                    projectObj.setStatusObj(baseDao.getStatusByName("Active"));
                }
                Projects newProjectObj = baseDao.createProject(projectObj);
                if (null != newProjectObj) {
                    if (newProjectObj.getStatusObj().getStatusName().equalsIgnoreCase("inactive")) {
                        List<Projects> projectses = baseDao.getAllProjectsByCompanyId("Active", newProjectObj.getCompanyObj().getId());
                        if (!(null != projectses && projectses.size() > 0)) {
                            Companies companyObj = newProjectObj.getCompanyObj();
                            companyObj.setIsProjectAddedAndActive(false);
                            Companies newCompanuObj = baseDao.createCompany(companyObj);
                            if (null != newCompanuObj) {
                                responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                                responseModel.setRespObject(newProjectObj);
                                responseModel.setStatusCode(0);
                            } else {
                                if (newProjectObj.getStatusObj().getStatusName().equalsIgnoreCase("active")) {
                                    newProjectObj.setStatusObj(baseDao.getStatusByName("InActive"));
                                } else {
                                    newProjectObj.setStatusObj(baseDao.getStatusByName("Active"));
                                }
                                Projects newestProjectObj = baseDao.createProject(newProjectObj);
                                if (null != newestProjectObj) {
                                    responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                                    responseModel.setStatusCode(3);
                                } else {
                                    responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                                    responseModel.setStatusCode(2);
                                }
                            }
                        } else {
                            responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setRespObject(newProjectObj);
                            responseModel.setStatusCode(0);
                        }
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(newProjectObj);
                        responseModel.setStatusCode(0);
                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> deleteUsers() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel markProjectComplete(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Projects projectObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Projects.class);
            if (null != projectObj) {
                projectObj.setStatusObj(baseDao.getStatusByName("Completed"));
                Projects newProjectObj = baseDao.createProject(projectObj);
                if (null != newProjectObj) {
                    if (newProjectObj.getStatusObj().getStatusName().equalsIgnoreCase("completed")) {
                        List<Projects> projectses = baseDao.getAllProjectsByCompanyId("Active", newProjectObj.getCompanyObj().getId());
                        if (!(null != projectses && projectses.size() > 0)) {
                            Companies companyObj = newProjectObj.getCompanyObj();
                            companyObj.setIsProjectAddedAndActive(false);
                            Companies newCompanuObj = baseDao.createCompany(companyObj);
                            if (null != newCompanuObj) {
                                responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                                responseModel.setRespObject(newProjectObj);
                                responseModel.setStatusCode(0);
                            } else {
                                newProjectObj.setStatusObj(baseDao.getStatusByName("Active"));
                                Projects newestProjectObj = baseDao.createProject(newProjectObj);
                                if (null != newestProjectObj) {
                                    responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                                    responseModel.setStatusCode(3);
                                } else {
                                    responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                                    responseModel.setStatusCode(2);
                                }
                            }
                        } else {
                            responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setRespObject(newProjectObj);
                            responseModel.setStatusCode(0);
                        }
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(newProjectObj);
                        responseModel.setStatusCode(0);
                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> deleteUsers() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getAllProjectsByCompanyId(String statusName) {
        responseModel = new ResponseModel();
        try {
            String[] splittedValue = statusName.split(",");
            if (splittedValue.length == 2) {
                List<Projects> projectses = baseDao.getAllProjectsByCompanyId(splittedValue[0], splittedValue[1]);
                if (null != projectses) {
                    responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespList(projectses);
                    responseModel.setStatusCode(0);
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(3);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(2);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> getAllProjectsByCompanyId() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel createSupplier(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Supplier supplierObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Supplier.class);
            List<Attachments> attachedFiles = objectMapperUtility.jsonArrayToObjectList(requestModelObj.getReqList(), Attachments.class);
            if (null != supplierObj && null != attachedFiles && attachedFiles.size() > 0) {
                if (!baseDao.checkDuplicateSupplier(supplierObj)) {
                    supplierObj.setStatusObj(baseDao.getStatusByName("Active"));
                    List<SystemConfig> systemConfigs = baseDao.getAllSystemConfig();
                    if (systemConfigs.size() > 0) {
                        String name = supplierObj.getSupplierName().replaceAll("\\s", "-").toLowerCase();
                        List<Attachments> attachmentses = createSupplierAttachmentFromBase64(attachedFiles, name, systemConfigs);
                        supplierObj.setAttachments(attachmentses);
                    }
                    Supplier newSupplierObj = baseDao.createSupplier(supplierObj);
                    if (null != newSupplierObj) {
                        responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(newSupplierObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.duplicate", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(4);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> createCompany() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    private List<Attachments> createSupplierAttachmentFromBase64(List<Attachments> attachmentses, String supplierName, List<SystemConfig> systemConfigs) {
        try {
            Integer successFileCount = 0;
            //java.nio.file.Files;
            String dir = systemConfigs.get(0).getPathPrefix() + supplierName + "/";
            Integer count = 0;
            if (Files.exists(Paths.get(dir))) {
                count = Integer.parseInt(Files.list(Paths.get(dir)).count() + "");
            } else {
                Files.createDirectories(Paths.get(dir));
                try {
                    Runtime.getRuntime().exec("chmod -R 777 " + dir);
                } catch (Exception e) {
                    System.out.println("Error while applying permission ---> " + e.getMessage());
                }
                count = 0;
            }
            String[] splittedFileName = null;
            byte[] data = null;
            String fileName = null;
            for (int i = 0; i < attachmentses.size(); i++) {
                try {
                    data = Base64.getDecoder().decode(attachmentses.get(i).getBase64().split(";")[1].split(",")[1]);
                    splittedFileName = attachmentses.get(i).getFileName().split("\\.");
                    if (splittedFileName.length == 2) {
                        ++count;
                        fileName = dir + (supplierName + "-" + count) + "." + splittedFileName[1];

                        File file = new File(fileName);
                        FileOutputStream stream = new FileOutputStream(file);
                        stream.write(data);
                        try {
                            Runtime.getRuntime().exec("chmod 777 " + file.getAbsolutePath());
                        } catch (Exception e) {
                            System.out.println("Error while applying permission ---> " + e.getMessage());
                        }
                        attachmentses.get(i).setBase64(null);
                        attachmentses.get(i).setUri(systemConfigs.get(0).getFileUrlPrefix() + supplierName + "/" + (supplierName + "-" + count) + "." + splittedFileName[1]);
                        attachmentses.get(i).setFileName((supplierName + "-" + count) + "." + splittedFileName[1]);
                        attachmentses.get(i).setType(splittedFileName[1]);
//                        switch (splittedFileName[1]) {
//                            case "m4a":
//                                attachmentses.get(i).setType("Audio");
//                                break;
//                            case "pdf":
//                                attachmentses.get(i).setType("Pdf");
//                                break;
//                            default:
//                                attachmentses.get(i).setType("Image");
//                                if (!splittedFileName[1].toLowerCase().trim().contains("png")) {
//                                    compressImage(dir, (supplierName + "-" + count), splittedFileName[1]);
//                                }
//                                break;
//                        }
                        ++successFileCount;
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
                data = null;
                splittedFileName = null;
            }
            if (successFileCount == attachmentses.size()) {
                return attachmentses;
            } else {
                return null;
            }
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public ResponseModel updateSupplier(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Supplier supplierObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Supplier.class);
            List<Attachments> attachedFiles = objectMapperUtility.jsonArrayToObjectList(requestModelObj.getReqList(), Attachments.class);
            if (null != supplierObj && null != attachedFiles && attachedFiles.size() > 0) {
                List<SystemConfig> systemConfigs = baseDao.getAllSystemConfig();
                Supplier existingSupplierObj = baseDao.getSupplierById(supplierObj.getId());
                if (existingSupplierObj.getVatNumber().trim().toLowerCase().equals(supplierObj.getVatNumber().trim().toLowerCase())) {
                    if (systemConfigs.size() > 0) {
                        String name = supplierObj.getSupplierName().replaceAll("\\s", "-").toLowerCase();
                        List<Attachments> attachmentses = createSupplierAttachmentFromBase64(attachedFiles, name, systemConfigs);
                        supplierObj.setAttachments(attachmentses);
                    }
                    Supplier newSupplierObj = baseDao.createSupplier(supplierObj);
                    if (null != newSupplierObj) {
                        responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(newSupplierObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    if (!baseDao.checkDuplicateSupplier(supplierObj)) {
                        if (systemConfigs.size() > 0) {
                            String name = supplierObj.getSupplierName().replaceAll("\\s", "-").toLowerCase();
                            List<Attachments> attachmentses = createSupplierAttachmentFromBase64(attachedFiles, name, systemConfigs);
                            supplierObj.setAttachments(attachmentses);
                        }
                        Supplier newSupplierObj = baseDao.createSupplier(supplierObj);
                        if (null != newSupplierObj) {
                            responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setRespObject(newSupplierObj);
                            responseModel.setStatusCode(0);
                        } else {
                            responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setStatusCode(2);
                        }
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.duplicate", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(4);
                    }
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> updateSupplier() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel deleteSupplier(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Supplier supplierObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Supplier.class);
            if (null != supplierObj) {
                if (supplierObj.getStatusObj().getStatusName().equalsIgnoreCase("active")) {
                    supplierObj.setStatusObj(baseDao.getStatusByName("InActive"));
                } else {
                    supplierObj.setStatusObj(baseDao.getStatusByName("Active"));
                }
                Supplier newSupplierObj = baseDao.createSupplier(supplierObj);
                if (null != newSupplierObj) {
                    responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespObject(newSupplierObj);
                    responseModel.setStatusCode(0);
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> deleteUsers() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getAllSuppliersByProjectId(String statusName) {
        responseModel = new ResponseModel();
        try {
            String[] splittedValue = statusName.split(",");
            if (splittedValue.length == 2) {
                List<Supplier> suppliers = baseDao.getAllSuppliersByProjectId(splittedValue[0], splittedValue[1]);
                if (null != suppliers) {
                    List<Supplier> commonsuppliers = baseDao.getAllCommonSuppliers(splittedValue[0]);
                    if (null != commonsuppliers && commonsuppliers.size() > 0) {
                        suppliers.addAll(commonsuppliers);
                    }
                    responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespList(suppliers);
                    responseModel.setStatusCode(0);
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(2);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> getAllSuppliers() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getAllSuppliersByMultipleProjectId(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
//            List<Projects> projectses = objectMapperUtility.jsonArrayToObjectList(requestModelObj.getReqList(), Projects.class);
            List<Companies> projectses = objectMapperUtility.jsonArrayToObjectList(requestModelObj.getReqList(), Companies.class);
            if (null != projectses) {
                List<Supplier> suppliers = new ArrayList<>();
                for (int i = 0; i < projectses.size(); i++) {
                    suppliers.addAll(baseDao.getAllSuppliersByProjectId("Active", projectses.get(i).getId()));
                }
                List<Supplier> commonsuppliers = baseDao.getAllCommonSuppliers("Active");
                if (null != commonsuppliers && commonsuppliers.size() > 0) {
                    suppliers.addAll(commonsuppliers);
                }
                responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                responseModel.setRespList(suppliers);
                responseModel.setStatusCode(0);
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(2);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> getAllSuppliers() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel createTransferType(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            TransferType transferTypeObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), TransferType.class);
            if (null != transferTypeObj) {
                if (!baseDao.checkDuplicateTransferType(transferTypeObj)) {
                    transferTypeObj.setStatusObj(baseDao.getStatusByName("Active"));
                    TransferType newTransferTypeObj = baseDao.createTransferType(transferTypeObj);
                    if (null != newTransferTypeObj) {
                        responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(newTransferTypeObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.duplicate", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(4);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> createTransferType() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel updateTransferType(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            TransferType transferTypeObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), TransferType.class);
            if (null != transferTypeObj) {
                TransferType existingSupplierObj = baseDao.getTransferTypeById(transferTypeObj.getId());
                if (existingSupplierObj.getTransferTypeName().trim().toLowerCase().equals(transferTypeObj.getTransferTypeName().trim().toLowerCase())) {
                    TransferType newTransferTypeObj = baseDao.createTransferType(transferTypeObj);
                    if (null != newTransferTypeObj) {
                        responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(newTransferTypeObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    if (!baseDao.checkDuplicateTransferType(transferTypeObj)) {
                        TransferType newTransferTypeObj = baseDao.createTransferType(transferTypeObj);
                        if (null != newTransferTypeObj) {
                            responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setRespObject(newTransferTypeObj);
                            responseModel.setStatusCode(0);
                        } else {
                            responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setStatusCode(2);
                        }
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.duplicate", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(4);
                    }
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> updateSupplier() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel deleteTransferType(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            TransferType transferTypeObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), TransferType.class);
            if (null != transferTypeObj) {
                if (transferTypeObj.getStatusObj().getStatusName().equalsIgnoreCase("active")) {
                    transferTypeObj.setStatusObj(baseDao.getStatusByName("InActive"));
                } else {
                    transferTypeObj.setStatusObj(baseDao.getStatusByName("Active"));
                }
                TransferType newTransferTypeObj = baseDao.createTransferType(transferTypeObj);
                if (null != newTransferTypeObj) {
                    responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespObject(newTransferTypeObj);
                    responseModel.setStatusCode(0);
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> deleteUsers() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getAllTransferType(String statusName) {
        responseModel = new ResponseModel();
        try {
            String[] splittedValue = statusName.split(",");
            if (splittedValue.length == 2) {
                List<TransferType> transferTypes = baseDao.getAllTransferType(splittedValue[0], splittedValue[1]);
                if (null != transferTypes) {
                    responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespList(transferTypes);
                    responseModel.setStatusCode(0);
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(2);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> getAllSuppliers() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getAllRequisitionByUserStatusAndCompany(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            GetRequisitionRequest grrObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), GetRequisitionRequest.class);
            if (null != grrObj) {
                List<Requisition> requisitions = baseDao.getAllRequisitionByUserStatusAndCompany(grrObj);
                if (null != requisitions) {
                    responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespList(requisitions);
                    responseModel.setStatusCode(0);
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> getAllRequisitionByUserStatusAndCompany() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getApproversListForRequisitionUsersByCompanyId(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            List<Users> users = baseDao.getApproversListForRequisitionUsersByCompanyId(requestModelObj.getExtraVariable());
            if (null != users) {
                responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                responseModel.setRespList(users);
                responseModel.setStatusCode(0);
            } else {
                responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(2);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> getAllRequisitionByUserStatusAndCompany() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel createRequisition(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            RequisitionRequest requisitionRequestObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), RequisitionRequest.class);
            if (null != requisitionRequestObj) {
                Requisition requisitionObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Requisition.class);
                if (null != requisitionObj) {
                    List<SystemConfig> systemConfigs = baseDao.getAllSystemConfig();
                    requisitionObj.setRequisitionId(getNextRequisitionId(requisitionObj));
                    requisitionObj.setStatusObj(baseDao.getStatusByName("Raised"));
                    requisitionObj.setCreatedBy(baseDao.getUserByMobileNumber(requestModelObj.getUserId()));
                    requisitionObj.setOtherDeliveryAddress(false);
                    requisitionObj.setAddress(requisitionObj.getCompanyObj().getCompanyAddress());
                    requisitionObj.setPdfURL(systemConfigs.get(0).getFileUrlPrefix() + requisitionObj.getRequisitionId() + ".pdf");
                    List<Attachments> attachmentses = createFilesFromBase64(requisitionObj.getAttachments(), requisitionObj.getRequisitionId(), systemConfigs);
                    if (null != attachmentses) {
                        requisitionObj.setAttachments(attachmentses);
                        requisitionObj.setPendingAmount(requisitionObj.getFinalAmount());
                        requisitionObj.setPaidAmount(Float.valueOf("0.0"));
                        if (requisitionObj.getTypeOfForm().equalsIgnoreCase("reimbursment")) {
                            requisitionObj.setTransferTypeObj(baseDao.getTransferTypeByName("Cash"));
                        }
                        requisitionObj.setIsUpdated(true);
                        requisitionObj.setIsNewRecForFinance(false);
                        Requisition newRequisitionObj = baseDao.createRequisition(requisitionObj);
                        if (null != newRequisitionObj) {
                            Integer rpCount = 0;
                            List<RequisitionProducts> requisitionProductses = requisitionRequestObj.getRequisitionProductses();
                            for (int i = 0; i < requisitionProductses.size(); i++) {
                                try {
                                    requisitionProductses.get(i).setRequisitionObj(requisitionObj);
                                    requisitionProductses.get(i).setRequisitionId(requisitionObj.getRequisitionId());
                                    RequisitionProducts rpObj = baseDao.createRequisitionProduct(requisitionProductses.get(i));
                                    if (null != rpObj) {
                                        ++rpCount;
                                    }
                                } catch (Exception e) {
//                                    e.printStackTrace();
                                    System.out.println(i + "-failure error--->" + e.getMessage());
                                    logger.error("Exception while creating products --> " + e.getMessage());
                                }
                            }
                            if (rpCount.equals(requisitionProductses.size())) {
                                try {
                                    createRequisitionPdf(newRequisitionObj, requisitionProductses);
                                } catch (Exception e) {
//                                    e.printStackTrace();
                                    System.out.println("create-pdf failure error--->" + e.getMessage());
                                    logger.error("Exception while creating products --> " + e.getMessage());
                                }
                                System.out.println("25");
                                try {
                                    String title = "New Requisiton " + requisitionObj.getRequisitionId();
                                    String msg = "A new requisition has been received by " + requisitionObj.getCreatedBy().getFullName() + ", with " + requisitionProductses.size() + " item(s) worth of " + getAmount(requisitionObj, requisitionObj.getFinalAmount());
                                    if (null != requisitionObj.getPreferedApprover().getDeviceID()) {
                                        sendDynamicNotification(new PushNotificationRequest(title, msg, true, "", requisitionObj.getPreferedApprover().getDeviceID()));
                                        System.out.println("26");
                                    }
                                } catch (Exception e) {
//                                    e.printStackTrace();
                                    System.out.println("notification issue --->" + e.getMessage());
                                    logger.error("Exception while sending push notification --> createRequisition() --> " + e.getMessage());
                                }
                                try {
                                    if (null != requisitionObj.getPreferedApprover()) {
                                        if (null != requisitionObj.getPreferedApprover().getEmailId()) {
                                            if (null != requisitionObj.getPreferedApprover().getFullName()) {
                                                MimeMessage mimeMessage = javaMailSender.createMimeMessage();
                                                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
                                                mimeMessage.setContent(this.getEmailTemplate(requisitionObj.getPreferedApprover().getFullName(), getEmailMessage(requisitionObj, "Raise"), "raised", getCompanyLogoURL(requisitionObj)), "text/html");
                                                helper.setTo(requisitionObj.getCreatedBy().getEmailId());
                                                helper.setSubject(getEmailSubject(requisitionObj, "Raise"));
                                                javaMailSender.send(mimeMessage);
                                            } else {
                                                MimeMessage mimeMessage = javaMailSender.createMimeMessage();
                                                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
                                                mimeMessage.setContent(this.getEmailTemplate("Admin", getEmailMessage(requisitionObj, "Raise"), "raised", getCompanyLogoURL(requisitionObj)), "text/html");
                                                helper.setTo(requisitionObj.getCreatedBy().getEmailId());
                                                helper.setSubject(getEmailSubject(requisitionObj, "Raise"));
                                                javaMailSender.send(mimeMessage);
                                                System.out.println("39");
                                            }
                                        } else {
                                            System.out.println("Prefered Approver's Emailid is null");
                                        }
                                    } else {
                                        System.out.println("Prefered Approver's obj is null");
                                    }
                                } catch (Exception e) {
//                                    e.printStackTrace();
                                    System.out.println("mail issue --->" + e.getMessage());
                                    logger.error("Exception while sending email --> createRequisition() --> " + e.getMessage());
                                }
                                responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                                responseModel.setRespObject(newRequisitionObj);
                                responseModel.setStatusCode(0);
                            } else {
//                            roll back
                                responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                                responseModel.setStatusCode(2);
                            }
                        } else {
                            responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setStatusCode(2);
                        }
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(3);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            System.out.println("main error--->" + e.getMessage());
//            e.printStackTrace();
            logger.error("Exception while execution method BaseServiceImpl --> createRequisition() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    private List<Attachments> createFilesFromBase64(List<Attachments> attachmentses, String requisitionId, List<SystemConfig> systemConfigs) {
        System.out.println("12.1 create file");
        try {
            Integer successFileCount = 0;
            String dir = systemConfigs.get(0).getPathPrefix() + requisitionId + "/";
            Integer count = 0;
            if (Files.exists(Paths.get(dir))) {
                count = Integer.parseInt(Files.list(Paths.get(dir)).count() + "");
            } else {
                Files.createDirectories(Paths.get(dir));
                try {
                    Runtime.getRuntime().exec("chmod -R 777 " + dir);
                } catch (Exception e) {
                    System.out.println("Error while applying permission ---> " + e.getMessage());
                }
                count = 0;
            }
            String[] splittedFileName = null;
            byte[] data = null;
            String fileName = null;
            for (int i = 0; i < attachmentses.size(); i++) {
                try {
                    data = Base64.getDecoder().decode(attachmentses.get(i).getBase64());
                    splittedFileName = attachmentses.get(i).getFileName().split("\\.");
                    if (splittedFileName.length == 2) {
                        ++count;
                        fileName = dir + (requisitionId + "-" + count) + "." + splittedFileName[1];

                        File file = new File(fileName);
                        FileOutputStream stream = new FileOutputStream(file);
                        stream.write(data);

                        try {
                            Runtime.getRuntime().exec("chmod 777 " + file.getAbsolutePath());
                        } catch (Exception e) {
                            System.out.println("12.2 Error while applying permission ---> " + e.getMessage());
                        }
                        attachmentses.get(i).setBase64(null);
                        attachmentses.get(i).setUri(systemConfigs.get(0).getFileUrlPrefix() + requisitionId + "/" + (requisitionId + "-" + count) + "." + splittedFileName[1]);
                        attachmentses.get(i).setFileName((requisitionId + "-" + count) + "." + splittedFileName[1]);
                        switch (splittedFileName[1]) {
                            case "m4a":
                                attachmentses.get(i).setType("Audio");
                                break;
                            case "pdf":
                                attachmentses.get(i).setType("Pdf");
                                break;
                            default:
                                attachmentses.get(i).setType("Image");
//                                if (!splittedFileName[1].toLowerCase().trim().toLowerCase().contains("png")) {
//                                    compressImage(dir, (requisitionId + "-" + count), splittedFileName[1]);
//                                }
                                break;
                        }
                        ++successFileCount;
                    }
                } catch (IOException e) {
//                    e.printStackTrace();
                    System.out.println("12.3 Error While creating file ---> " + e.getMessage());
                }
                data = null;
                splittedFileName = null;
            }
            if (successFileCount == attachmentses.size()) {
                return attachmentses;
            } else {
                return null;
            }
        } catch (IOException e) {
//            e.printStackTrace();
            System.out.println("12.4 Error While creating file ---> " + e.getMessage());
            return null;
        }
    }

    private void createRequisitionPdf(Requisition newRequisitionObj, List<RequisitionProducts> requisitionProductses) throws IOException {
        List<SystemConfig> systemConfigs = baseDao.getAllSystemConfig();
        if (systemConfigs.size() > 0) {
            NumberFormat formatter = new DecimalFormat("#0.000");
            NumberFormat qtyFormatter = new DecimalFormat("#0.00");
            String requisitionOrReimbursmentHTMLString = "<!DOCTYPE html>\n"
                    + "<html>\n"
                    + "<head>\n"
                    + "  <meta charset=\"utf-8\">\n"
                    + "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n"
                    + "  <link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css\">\n"
                    + "  <script src=\"https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js\"></script>\n"
                    + "  <script src=\"https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js\"></script>\n"
                    + "  <script src=\"https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/js/bootstrap.bundle.min.js\"></script>\n"
                    + "  <style>\n"
                    + "    @page {\n"
                    + "      size: landscape;\n"
                    + "    }\n"
                    + "    table {\n"
                    + "      font-family: arial, sans-serif;\n"
                    + "      border-collapse: collapse;\n"
                    + "      width: 100%;\n"
                    + "    }\n"
                    + "    td,th {\n"
                    + "      border: 1px solid #dddddd;\n"
                    + "      text-align: left;\n"
                    + "      padding: 8px;\n"
                    + "      font-size: x-small !important;\n"
                    + "    }\n"
                    + "    tr:nth-child(even) {\n"
                    + "      background-color: #dddddd;\n"
                    + "    }\n"
                    + "  </style>\n"
                    + "</head>\n"
                    + "\n"
                    + "<body>\n"
                    + "  <div class=\"row\">\n"
                    + "    <div class=\"col-sm-12 col-md-12 col-lg-12\">\n"
                    + "      <table>\n"
                    + "        <tr>\n"
                    + "          <td colspan=\"6\">\n"
                    + "            <label style=\"font-size:x-small;font-weight: bold;width: 100%;\">" + newRequisitionObj.getCompanyObj().getCompanyName() + "</label>\n"
                    + "            <br />\n"
                    + "            <label style=\"font-size:x-small;font-weight: normal;width: 100%;margin-top: -10px !important;\">\n"
                    + "              " + newRequisitionObj.getCompanyObj().getCompanyAddress() + "\n"
                    + "            </label>\n"
                    + "            <br />\n"
                    + "            <label style=\"font-size:x-small;font-weight: normal;width: 100%;margin-top: -10px !important;\">\n"
                    + "              VAT no. " + newRequisitionObj.getCompanyObj().getVatNumber() + "\n"
                    + "            </label>\n"
                    + "            <br />\n"
                    + "            <label style=\"font-size:x-small;font-weight: normal;width: 100%;margin-top: -10px !important;\">\n"
                    + "              Phone: " + newRequisitionObj.getCompanyObj().getMobileNumber() + "\n"
                    + "            </label>\n"
                    + "          </td>\n"
                    + "          <td colspan=\"4\">\n"
                    + "            <center>\n"
                    + "              <img style=\"width:60px;height:60px;border: 1px solid black;\"\n"
                    + "                src=\"" + newRequisitionObj.getCompanyObj().getImageURL() + "\" alt=\"" + newRequisitionObj.getCompanyObj().getCompanyName() + "\" />\n"
                    + "            </center>\n"
                    + "          </td>\n"
                    + "        </tr>\n"
                    + "\n"
                    + "        <tr style=\"line-height: 1;\">\n"
                    + "          <td colspan=\"4\"\n"
                    + "            style=\"width:100%;border: 1px solid lightgray;margin-bottom: 2px;padding: 0px;background-color: #fff !important;\">\n"
                    + "            <label style=\"font-size:x-small;font-weight: bold;width: 100%;margin-top: 7px;\">" + newRequisitionObj.getTypeOfForm().toUpperCase() + "</label>\n"
                    + "          </td>\n"
                    + "          <td colspan=\"6\"\n"
                    + "            style=\"border: 1px solid lightgray;padding: 0px;background-color: #fff !important;align-items: flex-end;\">\n"
                    + "            <label style=\"font-size:x-small;font-weight: normal;display: flex;align-self: flex-end;margin-top: 7px;\">\n"
                    + "              Payment Type: <b>" + newRequisitionObj.getTransferTypeObj().getTransferTypeName() + "</b>\n"
                    + "            </label>\n"
                    + "          </td>\n"
                    + "        </tr>\n"
                    + "\n"
                    + "        <tr style=\"line-height: 0.8;\">\n"
                    + "          <td style=\"border: 1px solid black;padding: 0px !important;\">\n"
                    + "            <center>\n"
                    + "              <label style=\"font-size:smaller;font-weight: bold;width: 100%;\">Project</label>\n"
                    + "            </center>\n"
                    + "          </td>\n"
                    + "          <td colspan=\"3\" style=\"border: 1px solid black;padding: 0px !important;\">\n"
                    + "            <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-left: 15px;\">" + newRequisitionObj.getProjectObj().getProjectTitle() + "</label>\n"
                    + "          </td>\n"
                    + "          <td style=\"border: 1px solid black;padding: 0px !important;\">\n"
                    + "              <center>\n"
                    + "                <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-top: 5px;\">Vendor Code</label>\n"
                    + "              </center>\n"
                    + "            <div style=\"border-top: 1px solid lightgray\">\n"
                    + "              <center>\n";
            if (null != newRequisitionObj.getSupplierObj()) {
                requisitionOrReimbursmentHTMLString = requisitionOrReimbursmentHTMLString + "                <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-top: 5px;\">" + newRequisitionObj.getSupplierObj().getVendorCode() + "</label>\n";
            } else {
                requisitionOrReimbursmentHTMLString = requisitionOrReimbursmentHTMLString + "                <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-top: 5px;color: white\">aaaaaaaaaa</label>\n";
            }
            requisitionOrReimbursmentHTMLString = requisitionOrReimbursmentHTMLString + "              </center>\n"
                    + "            </div>\n"
                    + "          </td>\n"
                    + "          <td style=\"border: 1px solid black;padding: 0px !important;\">\n"
                    + "              <center>\n"
                    + "                <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-top: 5px;\">Delivery Date</label>\n"
                    + "              </center>\n"
                    + "            <div style=\"border-top: 1px solid lightgray\">\n"
                    + "              <center>\n"
                    + "                <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-top: 5px;color: white\">000</label>\n"
                    + "              </center>\n"
                    + "            </div>\n"
                    + "          </td>\n"
                    + "          <td style=\"border: 1px solid black;padding: 0px !important;\">\n"
                    + "              <center>\n"
                    + "                <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-top: 5px;\">P.O Date</label>\n"
                    + "              </center>\n"
                    + "            <div style=\"border-top: 1px solid lightgray\">\n"
                    + "              <center>\n"
                    + "                <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-top: 5px;color: white\">000</label>\n"
                    + "              </center>\n"
                    + "            </div>\n"
                    + "          </td>\n"
                    + "          <td style=\"border: 1px solid black;padding: 0px !important;\">\n"
                    + "              <center>\n"
                    + "                <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-top: 5px;\">Project Code</label>\n"
                    + "              </center>\n"
                    + "            <div style=\"border-top: 1px solid lightgray\">\n"
                    + "              <center>\n"
                    + "                <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-top: 5px;\">" + newRequisitionObj.getProjectObj().getProjectCode() + "</label>\n"
                    + "              </center>\n"
                    + "            </div>\n"
                    + "          </td>\n"
                    + "          <td colspan=\"2\" style=\"border: 1px solid black;padding: 0px !important;\">\n"
                    + "              <center>\n"
                    + "                <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-top: 5px;\">P.O Number</label>\n"
                    + "              </center>\n"
                    + "            <div style=\"border-top: 1px solid lightgray\">\n"
                    + "              <center>\n"
                    + "                <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-top: 5px;color: white\">000</label>\n"
                    + "              </center>\n"
                    + "            </div>\n"
                    + "          </td>\n"
                    + "        </tr>\n"
                    + "\n"
                    + "        <tr style=\"line-height: 0.8;\">\n"
                    + "          <td style=\"border: 1px solid black\" colspan=\"1\">\n"
                    + "            <center>\n"
                    + "              <label style=\"font-size:smaller;font-weight: bold;line-height: 0.8;\">Supplier Name & Address</label>\n"
                    + "            </center>\n"
                    + "          </td>\n"
                    + "          <td style=\"border: 1px solid black;height:10px\" colspan=\"3\">\n"
                    + "            <center>\n";
            if (null != newRequisitionObj.getSupplierObj()) {
                requisitionOrReimbursmentHTMLString = requisitionOrReimbursmentHTMLString + "              <label style=\"font-size:smaller;font-weight: bold;\">" + newRequisitionObj.getSupplierObj().getSupplierName() + "," + newRequisitionObj.getSupplierObj().getAddress() + ", VAT no: " + newRequisitionObj.getSupplierObj().getVatNumber() + ".</label>\n";
            } else {
                requisitionOrReimbursmentHTMLString = requisitionOrReimbursmentHTMLString + "              <label style=\"font-size:smaller;font-weight: bold;\">, VAT no: .</label>\n";
            }
            requisitionOrReimbursmentHTMLString = requisitionOrReimbursmentHTMLString + "            </center>\n"
                    + "          </td>"
                    + "          <td style=\"border: 1px solid black\" colspan=\"1\">\n"
                    + "            <center>\n"
                    + "              <label style=\"font-size:smaller;font-weight: bold;width: 100%;\">Delivery Address</label>\n"
                    + "            </center>\n"
                    + "          </td>\n"
                    + "          <td style=\"border: 1px solid black\" colspan=\"5\">\n"
                    + "            <center>\n"
                    + "              <label style=\"font-size:smaller;font-weight: bold;\">" + newRequisitionObj.getAddress() + "</label>\n"
                    + "            </center>\n"
                    + "          </td>\n"
                    + "        </tr>\n"
                    + "\n"
                    + "        <tr style=\"line-height: 0.8;\">\n"
                    + "          <th style=\"width: 5%;\">S.no</th>\n"
                    + "          <th style=\"width: 33%;\">Description</th>\n"
                    + "          <th style=\"width: 10%;\">Unit</th>\n"
                    + "          <th style=\"width: 6%;\">Quantity</th>\n"
                    + "          <th style=\"width: 12%;\">Unit Price</th>\n"
                    + "          <th style=\"width: 7%;\">Amount</th>\n"
                    + "          <th style=\"width: 7%;\">Net Amount</th>\n"
                    + "          <th style=\"width: 7%;\">Discount</th>\n"
                    + "          <th style=\"width: 7%;\">VAT</th>\n"
                    + "          <th style=\"width: 7%;\">Total</th>\n"
                    + "        </tr>\n"
                    + "\n"
                    + getProductList(requisitionProductses, formatter, qtyFormatter)
                    + "\n"
                    + "        <tr style=\"line-height: 0.8;\">\n"
                    + "          <td colspan=\"5\"></td>\n"
                    + "          <td style=\"width: 12%;font-weight: bold;\">Total Value</td>\n"
                    + "          <td style=\"width: 7%;font-weight: bold;\">" + formatter.format(newRequisitionObj.getProductTotal()) + "</td>\n"
                    + "          <td style=\"width: 7%;font-weight: bold;\">" + formatter.format(newRequisitionObj.getDiscountTotal()) + "</td>\n"
                    + "          <td style=\"width: 7%;font-weight: bold;\">" + formatter.format(newRequisitionObj.getVatTotal()) + "</td>\n"
                    + "          <td style=\"width: 7%;font-weight: bold;\">" + formatter.format(newRequisitionObj.getFinalAmount()) + "</td>\n"
                    + "        </tr>\n"
                    + "\n"
                    + "        <tr style=\"line-height: 0.2;\">\n"
                    + "          <td colspan=\"4\"></td>\n"
                    + "          <td colspan=\"6\" style=\"text-align: right;\">\n"
                    + "            <label style=\"font-size:smaller;font-style: italic;font-weight: 600;\">" + getNumberInWords(newRequisitionObj) + "</label>\n"
                    + "          </td>\n"
                    + "        </tr>\n"
                    + "\n"
                    + "        <tr style=\"line-height: 0.2;\">\n"
                    + "          <td colspan=\"10\">\n"
                    + "            <label style=\"font-size:smaller;font-style: italic;font-weight: 600;\">Notes: " + (newRequisitionObj.getGlobalNotes() + "") + "</label>\n"
                    + "          </td>\n"
                    + "        </tr>\n"
                    + "\n"
                    + "        <tr style=\"background-color: #fff !important;line-height: 1;\">\n"
                    + "          <td colspan=\"3\">\n"
                    + "            <label style=\"font-size: x-small;\">Material Requsition No: <label\n"
                    + "                style=\"font-weight: bold;\">" + newRequisitionObj.getRequisitionId() + "</label></label>\n"
                    + "            <br />\n"
                    + "            <label style=\"font-size:smaller;font-weight: normal;\">Requested / Produced By: <label style=\"font-weight: bold;\">" + newRequisitionObj.getCreatedBy().getFullName() + " / </label></label>\n"
                    + "          </td>\n"
                    + "          <td colspan=\"3\">\n"
                    + "            <label style=\"font-size: x-small;\">Approved By: <label style=\"font-weight: bold;\"></label></label>\n"
                    + "            <br />\n"
                    + "            <label style=\"font-size:smaller;font-weight: normal;\">Date: <label style=\"font-weight: bold;\"></label></label>\n"
                    + "          </td>\n"
                    + "          <td colspan=\"4\">\n"
                    + "            <label style=\"font-size:smaller;font-weight: 600;\">\n"
                    + "              1. This purchase order is void if mutilated or altered\n"
                    + "            </label>\n"
                    + "            <br />\n"
                    + "            <label style=\"font-size:smaller;font-weight: 600;\">\n"
                    + "              2. Return one copy with the invoice\n"
                    + "            </label>\n"
                    + "          </td>\n"
                    + "        </tr>\n"
                    + "      </table>\n"
                    + "\n"
                    + "      <div class=\"row\" style=\"height: 10px;padding: 0%!important;\">\n"
                    + "         <div class=\"col-sm-6 col-md-6 col-lg-6\"\n"
                    + "          style=\"padding-top: 0px !important;display: flex;flex-direction: row;\">\n"
                    + "            <label style=\"font-size: x-small;\">Note: this is an automatically generated document advice, and is valid without a signature.</label>\n"
                    //                    + "          <label style=\"font-size: x-small;margin-top: -10px;\">E & OE</label>\n"
                    + "        </div>\n"
                    //                    + "        <div class=\"col-sm-6 col-md-6 col-lg-6\"\n"
                    //                    + "          style=\"padding-top: 0px !important;padding-bottom: 0px !important;margin-top: -8px !important;font-style: italic;font-weight: bold;\">\n"
                    //                    + "          <center>\n"
                    //                    + "            <label style=\"font-size: x-small;\">Note: this is an automatically generated document advice, and is valid\n"
                    //                    + "              without a signature</label>\n"
                    //                    + "          </center>\n"
                    //                    + "        </div>\n"
                    + "        <div class=\"col-sm-6 col-md-6 col-lg-6\"\n"
                    + "          style=\"padding-top: 0px !important;padding-bottom: 0px !important;margin-top: -8px !important;text-align: right;\">\n"
                    + "          <label style=\"font-size: x-small;text-align: right;\">E & OE, FORM #08 ISSUE A</label>\n"
                    + "        </div>\n"
                    + "      </div>\n"
                    + "    </div>\n"
                    + "  </div>\n"
                    + "</body>\n"
                    + "</html>";
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            HtmlConverter.convertToPdf(requisitionOrReimbursmentHTMLString, buffer);
            byte[] pdfAsBytes = buffer.toByteArray();

            File file = new File(systemConfigs.get(0).getPathPrefix() + "/" + newRequisitionObj.getRequisitionId() + ".pdf");
            FileOutputStream fos = new FileOutputStream(systemConfigs.get(0).getPathPrefix() + "/" + newRequisitionObj.getRequisitionId() + ".pdf");
            fos.write(pdfAsBytes);
            try {
                Runtime.getRuntime().exec("chmod 777 " + file.getAbsolutePath());
            } catch (Exception e) {
                System.out.println("Error while applying permission ---> " + e.getMessage());
            }
        }
    }

    private void createRequisitionLPOPdf(Requisition newRequisitionObj, List<RequisitionProducts> requisitionProductses) throws IOException {
        List<SystemConfig> systemConfigs = baseDao.getAllSystemConfig();
        if (systemConfigs.size() > 0) {
            NumberFormat formatter = new DecimalFormat("#0.000");
            NumberFormat qtyFormatter = new DecimalFormat("#0.00");
            SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
            String requisitionOrReimbursmentHTMLString = "<!DOCTYPE html>\n"
                    + "<html>\n"
                    + "<head>\n"
                    + "  <meta charset=\"utf-8\">\n"
                    + "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n"
                    + "  <link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css\">\n"
                    + "  <script src=\"https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js\"></script>\n"
                    + "  <script src=\"https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js\"></script>\n"
                    + "  <script src=\"https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/js/bootstrap.bundle.min.js\"></script>\n"
                    + "  <style>\n"
                    + "    @page {\n"
                    + "      size: landscape;\n"
                    + "    }\n"
                    + "    table {\n"
                    + "      font-family: arial, sans-serif;\n"
                    + "      border-collapse: collapse;\n"
                    + "      width: 100%;\n"
                    + "    }\n"
                    + "    td,th {\n"
                    + "      border: 1px solid #dddddd;\n"
                    + "      text-align: left;\n"
                    + "      padding: 8px;\n"
                    + "      font-size: x-small !important;\n"
                    + "    }\n"
                    + "    tr:nth-child(even) {\n"
                    + "      background-color: #dddddd;\n"
                    + "    }\n"
                    + "  </style>\n"
                    + "</head>\n"
                    + "\n"
                    + "<body>\n"
                    + "  <div class=\"row\">\n"
                    + "    <div class=\"col-sm-12 col-md-12 col-lg-12\">\n"
                    + "      <table>\n"
                    + "        <tr>\n"
                    + "          <td colspan=\"6\">\n"
                    + "            <label style=\"font-size:x-small;font-weight: bold;width: 100%;\">" + newRequisitionObj.getCompanyObj().getCompanyName() + "</label>\n"
                    + "            <br />\n"
                    + "            <label style=\"font-size:x-small;font-weight: normal;width: 100%;margin-top: -10px !important;\">\n"
                    + "              " + newRequisitionObj.getCompanyObj().getCompanyAddress() + "\n"
                    + "            </label>\n"
                    + "            <br />\n"
                    + "            <label style=\"font-size:x-small;font-weight: normal;width: 100%;margin-top: -10px !important;\">\n"
                    + "              VAT no. " + newRequisitionObj.getCompanyObj().getVatNumber() + "\n"
                    + "            </label>\n"
                    + "            <br />\n"
                    + "            <label style=\"font-size:x-small;font-weight: normal;width: 100%;margin-top: -10px !important;\">\n"
                    + "              Phone: " + newRequisitionObj.getCompanyObj().getMobileNumber() + "\n"
                    + "            </label>\n"
                    + "          </td>\n"
                    + "          <td colspan=\"4\">\n"
                    + "            <center>\n"
                    + "              <img style=\"width:60px;height:60px;border: 1px solid black;\"\n"
                    + "                src=\"" + newRequisitionObj.getCompanyObj().getImageURL() + "\" alt=\"" + newRequisitionObj.getCompanyObj().getCompanyName() + "\" />\n"
                    + "            </center>\n"
                    + "          </td>\n"
                    + "        </tr>\n"
                    + "\n"
                    + "        <tr style=\"line-height: 1;\">\n"
                    + "          <td colspan=\"4\"\n"
                    + "            style=\"width:100%;border: 1px solid black;margin-bottom: 2px;padding: 0px;background-color: #fff !important;\">\n"
                    + "            <label style=\"font-size:x-small;font-weight: bold;width: 100%;margin-top: 7px;\">LOCAL PURCHASE ORDER (L.P.O)</label>\n"
                    + "          </td>\n"
                    + "          <td colspan=\"6\"\n"
                    + "            style=\"border: 1px solid black;padding: 0px;background-color: #fff !important;align-items: flex-end;\">\n"
                    + "            <label style=\"font-size:x-small;font-weight: normal;display: flex;align-self: flex-end;\">\n"
                    + "              Payment Type: <b>" + newRequisitionObj.getTransferTypeObj().getTransferTypeName() + "</b>\n"
                    + "            </label>\n"
                    + "          </td>\n"
                    + "        </tr>\n"
                    + "\n"
                    + "        <tr style=\"line-height: 0.8;\">\n"
                    + "          <td style=\"border: 1px solid black;padding: 0px !important;\">\n"
                    + "            <center>\n"
                    + "              <label style=\"font-size:smaller;font-weight: bold;width: 100%;\">Project</label>\n"
                    + "            </center>\n"
                    + "          </td>\n"
                    + "          <td colspan=\"3\" style=\"border: 1px solid black;padding: 0px !important;\">\n"
                    + "            <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-left: 15px;\">" + newRequisitionObj.getProjectObj().getProjectTitle() + "</label>\n"
                    + "          </td>\n"
                    + "          <td style=\"border: 1px solid black;padding: 0px !important;\">\n"
                    + "              <center>\n"
                    + "                <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-top: 5px;\">Vendor Code</label>\n"
                    + "              </center>\n"
                    + "            <div style=\"border-top: 1px solid lightgray\">\n"
                    + "              <center>\n";
            if (null != newRequisitionObj.getSupplierObj()) {
                requisitionOrReimbursmentHTMLString = requisitionOrReimbursmentHTMLString + "                <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-top: 5px;\">" + newRequisitionObj.getSupplierObj().getVendorCode() + "</label>\n";
            } else {
                requisitionOrReimbursmentHTMLString = requisitionOrReimbursmentHTMLString + "                <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-top: 5px;color: white\">aaaaaaaaaa</label>\n";
            }
            requisitionOrReimbursmentHTMLString = requisitionOrReimbursmentHTMLString + "              </center>\n"
                    + "            </div>\n"
                    + "          </td>\n"
                    + "          <td style=\"border: 1px solid black;padding: 0px !important;\">\n"
                    + "              <center>\n"
                    + "                <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-top: 5px;\">Delivery Date</label>\n"
                    + "              </center>\n"
                    + "            <div style=\"border-top: 1px solid lightgray\">\n"
                    + "              <center>\n"
                    + "                <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-top: 5px;color: white\">000</label>\n"
                    + "              </center>\n"
                    + "            </div>\n"
                    + "          </td>\n"
                    + "          <td style=\"border: 1px solid black;padding: 0px !important;\">\n"
                    + "              <center>\n"
                    + "                <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-top: 5px;\">P.O Date</label>\n"
                    + "              </center>\n"
                    + "            <div style=\"border-top: 1px solid lightgray\">\n"
                    + "              <center>\n"
                    + "                <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-top: 5px;color: white\">000</label>\n"
                    + "              </center>\n"
                    + "            </div>\n"
                    + "          </td>\n"
                    + "          <td style=\"border: 1px solid black;padding: 0px !important;\">\n"
                    + "              <center>\n"
                    + "                <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-top: 5px;\">Project Code</label>\n"
                    + "              </center>\n"
                    + "            <div style=\"border-top: 1px solid lightgray\">\n"
                    + "              <center>\n"
                    + "                <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-top: 5px;\">" + newRequisitionObj.getProjectObj().getProjectCode() + "</label>\n"
                    + "              </center>\n"
                    + "            </div>\n"
                    + "          </td>\n"
                    + "          <td colspan=\"2\" style=\"border: 1px solid black;padding: 0px !important;\">\n"
                    + "              <center>\n"
                    + "                <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-top: 5px;\">P.O Number</label>\n"
                    + "              </center>\n"
                    + "            <div style=\"border-top: 1px solid lightgray\">\n"
                    + "              <center>\n"
                    + "                <label style=\"font-size:smaller;font-weight: bold;width: 100%;margin-top: 5px;\">" + newRequisitionObj.getLpoNumber() + "</label>\n"
                    + "              </center>\n"
                    + "            </div>\n"
                    + "          </td>\n"
                    + "        </tr>\n"
                    + "\n"
                    + "        <tr style=\"line-height: 1;\">\n"
                    + "          <td style=\"border: 1px solid black\" colspan=\"1\">\n"
                    + "            <center>\n"
                    + "              <label style=\"font-size:smaller;font-weight: bold;width: 100%;\">Supplier Name & Address</label>\n"
                    + "            </center>\n"
                    + "          </td>\n"
                    + "          <td style=\"border: 1px solid black;height:10px\" colspan=\"3\">\n"
                    + "            <center>\n";
            if (null != newRequisitionObj.getSupplierObj()) {
                requisitionOrReimbursmentHTMLString = requisitionOrReimbursmentHTMLString + "              <label style=\"font-size:smaller;font-weight: bold;width: 100%;\">" + newRequisitionObj.getSupplierObj().getSupplierName() + "," + newRequisitionObj.getSupplierObj().getAddress() + ", VAT no: " + newRequisitionObj.getSupplierObj().getVatNumber() + ".</label>\n";
            } else {
                requisitionOrReimbursmentHTMLString = requisitionOrReimbursmentHTMLString + "              <label style=\"font-size:smaller;font-weight: bold;width: 100%;\"> , VAT no: .</label>\n";
            }
            requisitionOrReimbursmentHTMLString = requisitionOrReimbursmentHTMLString
                    + "            </center>\n"
                    + "          </td>\n"
                    + "          <td style=\"border: 1px solid black\" colspan=\"1\">\n"
                    + "            <center>\n"
                    + "              <label style=\"font-size:smaller;font-weight: bold;width: 100%;\">Delivery Address</label>\n"
                    + "            </center>\n"
                    + "          </td>\n"
                    + "          <td style=\"border: 1px solid black\" colspan=\"5\">\n"
                    + "            <center>\n"
                    + "              <label style=\"font-size:smaller;font-weight: bold;width: 100%;\">" + newRequisitionObj.getAddress() + "</label>\n"
                    + "            </center>\n"
                    + "          </td>\n"
                    + "        </tr>\n"
                    + "\n"
                    + "        <tr style=\"line-height: 0.8;\">\n"
                    + "          <th style=\"width: 5%;\">S.no</th>\n"
                    + "          <th style=\"width: 33%;\">Description</th>\n"
                    + "          <th style=\"width: 10%;\">Unit</th>\n"
                    + "          <th style=\"width: 6%;\">Quantity</th>\n"
                    + "          <th style=\"width: 12%;\">Unit Price</th>\n"
                    + "          <th style=\"width: 7%;\">Amount</th>\n"
                    + "          <th style=\"width: 7%;\">Amount</th>\n"
                    + "          <th style=\"width: 7%;\">Discount</th>\n"
                    + "          <th style=\"width: 7%;\">VAT</th>\n"
                    + "          <th style=\"width: 7%;\">Total</th>\n"
                    + "        </tr>\n"
                    + "\n"
                    + getProductList(requisitionProductses, formatter, qtyFormatter)
                    + "\n"
                    + "        <tr style=\"line-height: 0.8;\">\n"
                    + "          <td colspan=\"5\"></td>\n"
                    + "          <td style=\"width: 12%;font-weight: bold;\">Total Value</td>\n"
                    + "          <td style=\"width: 7%;font-weight: bold;\">" + formatter.format(newRequisitionObj.getProductTotal()) + "</td>\n"
                    + "          <td style=\"width: 7%;font-weight: bold;\">" + formatter.format(newRequisitionObj.getDiscountTotal()) + "</td>\n"
                    + "          <td style=\"width: 7%;font-weight: bold;\">" + formatter.format(newRequisitionObj.getVatTotal()) + "</td>\n"
                    + "          <td style=\"width: 7%;font-weight: bold;\">" + formatter.format(newRequisitionObj.getFinalAmount()) + "</td>\n"
                    + "        </tr>\n"
                    + "\n"
                    + "        <tr style=\"line-height: 0.2;\">\n"
                    + "          <td colspan=\"4\"></td>\n"
                    + "          <td colspan=\"6\" style=\"text-align: right;\">\n"
                    + "            <label style=\"font-size:smaller;font-style: italic;font-weight: 600;\">" + getNumberInWords(newRequisitionObj) + "</label>\n"
                    + "          </td>\n"
                    + "        </tr>\n"
                    + "\n"
                    + "        <tr style=\"line-height: 0.2;\">\n"
                    + "          <td colspan=\"10\">\n"
                    + "            <label style=\"font-size:smaller;font-style: italic;font-weight: 600;\">Notes: " + newRequisitionObj.getGlobalNotes() + "</label>\n"
                    + "          </td>\n"
                    + "        </tr>\n"
                    + "\n"
                    + "        <tr style=\"background-color: #fff !important;line-height: 1;\">\n"
                    + "          <td colspan=\"3\">\n"
                    + "            <label style=\"font-size: x-small;\">Material Requsition No: <label\n"
                    + "                style=\"font-weight: bold;\">REQ-SF0001/22</label></label>\n"
                    + "            <br />\n"
                    + "            <label style=\"font-size:smaller;font-weight: normal;\">Requested / Produced By: <label style=\"font-weight: bold;\">" + newRequisitionObj.getCreatedBy().getFullName() + " / Auto-Generated</label></label>\n"
                    + "          </td>\n"
                    + "          <td colspan=\"3\">\n"
                    + "            <label style=\"font-size: x-small;\">Approved By: <label style=\"font-weight: bold;\">" + newRequisitionObj.getPreferedApprover().getFullName() + "</label></label>\n"
                    + "            <br />\n"
                    + "            <label style=\"font-size:smaller;font-weight: normal;\">Date: <label style=\"font-weight: bold;\">" + sdf.format(newRequisitionObj.getApprovedDate()) + "</label></label>\n"
                    + "          </td>\n"
                    + "          <td colspan=\"4\">\n"
                    + "            <label style=\"font-size:smaller;font-weight: 600;\">\n"
                    + "              1. This purchase order is void if mutilated or altered\n"
                    + "            </label>\n"
                    + "            <br />\n"
                    + "            <label style=\"font-size:smaller;font-weight: 600;\">\n"
                    + "              2. Return one copy with the invoice\n"
                    + "            </label>\n"
                    + "          </td>\n"
                    + "        </tr>\n"
                    + "      </table>\n"
                    + "\n"
                    + "      <div class=\"row\" style=\"height: 10px;padding: 0%!important;\">\n"
                    + "         <div class=\"col-sm-6 col-md-6 col-lg-6\"\n"
                    + "          style=\"padding-top: 0px !important;display: flex;flex-direction: row;\">\n"
                    + "            <label style=\"font-size: x-small;\">Note: this is an automatically generated document advice, and is valid without a signature.</label>\n"
                    //                    + "          <label style=\"font-size: x-small;margin-top: -10px;\">E & OE</label>\n"
                    + "        </div>\n"
                    //                    + "        <div class=\"col-sm-6 col-md-6 col-lg-6\"\n"
                    //                    + "          style=\"padding-top: 0px !important;padding-bottom: 0px !important;margin-top: -8px !important;font-style: italic;font-weight: bold;\">\n"
                    //                    + "          <center>\n"
                    //                    + "            <label style=\"font-size: x-small;\">Note: this is an automatically generated document advice, and is valid\n"
                    //                    + "              without a signature</label>\n"
                    //                    + "          </center>\n"
                    //                    + "        </div>\n"
                    + "        <div class=\"col-sm-6 col-md-6 col-lg-6\"\n"
                    + "          style=\"padding-top: 0px !important;padding-bottom: 0px !important;margin-top: -8px !important;text-align: right;\">\n"
                    + "          <label style=\"font-size: x-small;text-align: right;\">E & OE, FORM #08 ISSUE A</label>\n"
                    + "        </div>\n"
                    + "      </div>\n"
                    + "    </div>\n"
                    + "  </div>\n"
                    + "</body>\n"
                    + "</html>";

            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            HtmlConverter.convertToPdf(requisitionOrReimbursmentHTMLString, buffer);
            byte[] pdfAsBytes = buffer.toByteArray();

            File file = new File(systemConfigs.get(0).getPathPrefix() + "/" + newRequisitionObj.getLpoNumber() + ".pdf");
            FileOutputStream fos = new FileOutputStream(systemConfigs.get(0).getPathPrefix() + "/" + newRequisitionObj.getLpoNumber() + ".pdf");
            fos.write(pdfAsBytes);
            try {
                Runtime.getRuntime().exec("chmod 777 " + file.getAbsolutePath());
            } catch (Exception e) {
                System.out.println("Error while applying permission ---> " + e.getMessage());
            }
        }
    }

    private String getNumberInWords(Requisition requisitionObj) {
        String returnValue = "";
        if (null != requisitionObj.getCurrencyObj()) {
            returnValue = returnValue + requisitionObj.getCurrencyObj().getCurrencyLongName() + " ";
        }
        String[] splittedValue = (requisitionObj.getFinalAmount() + "").split("\\.");
        returnValue += EnglishNumberToWords.convert(Long.valueOf(splittedValue[0]));
        Integer decimalValue = Integer.parseInt(splittedValue[1]);
        if (decimalValue > 0) {
            switch (requisitionObj.getCurrencyObj().getNoOfdecimals()) {
                case 1:
                    returnValue += " and " + requisitionObj.getCurrencyObj().getDecimalName() + " " + (decimalValue + "").substring(0, 1) + " only/-";
                    break;
                default:
                    returnValue += " and " + requisitionObj.getCurrencyObj().getDecimalName() + " " + getDynamicDigitsValue(decimalValue, requisitionObj.getCurrencyObj().getNoOfdecimals()) + " only/-";
                    break;
            }
        }
//        if (Integer.parseInt(splittedValue[1]) > 0) {
//            switch (splittedValue[1].length()) {
//                case 1:
//                    returnValue += " and fills " + (splittedValue[1] + "00") + "/1000 only/-";
//                    break;
//                case 2:
//                    returnValue += " and fills " + (splittedValue[1] + "0") + "/1000 only/-";
//                    break;
//                case 3:
//                    returnValue += " and fills " + splittedValue[1] + "/1000 only/-";
//                    break;
//                default:
//                    returnValue += " and fills " + splittedValue[1] + "/1000 only/-";
//                    break;
//            }
//        }
        return returnValue;
    }

    private Integer getDynamicDigitsValue(Integer decimalValue, Integer digits) {
        BigDecimal Output = new BigDecimal(0 + "." + decimalValue).setScale(digits, RoundingMode.HALF_EVEN);
        String dynamicValue[] = Output.setScale(digits).toPlainString().split("\\.");
        switch (dynamicValue.length) {
            case 2:
                return Integer.valueOf(dynamicValue[1]);
            default:
                return Integer.valueOf(dynamicValue[0]);
        }
    }

    public byte[] generatePdfFromHtml(String html, String name) throws IOException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        HtmlConverter.convertToPdf(html, buffer);
        byte[] pdfAsBytes = buffer.toByteArray();
//        try (FileOutputStream fos = new FileOutputStream(name)) {
//            fos.write(pdfAsBytes);
//        }
        return pdfAsBytes;
    }

    public String getNextRequisitionId(Requisition requisitionObj) {
        long requisitionsCount = baseDao.getRequisitionCountByCompany(requisitionObj.getCompanyObj(), false);
        DateFormat df = new SimpleDateFormat("yy"); // Just the year, with 2 digits
        String formattedDate = df.format(Calendar.getInstance().getTime());
        return "REQ-" + requisitionObj.getCompanyObj().getShortCode().toUpperCase() + getNumberInThousand((requisitionsCount + 1)) + "-" + formattedDate;
    }

    public String getNextLPONumber(Requisition requisitionObj) {
        long requisitionsCount = baseDao.getRequisitionCountByCompany(requisitionObj.getCompanyObj(), true);
        System.out.println("Requisition Count ----> " + requisitionsCount);
        DateFormat df = new SimpleDateFormat("yy"); // Just the year, with 2 digits
        String formattedDate = df.format(Calendar.getInstance().getTime());
        return "LPO-" + requisitionObj.getCompanyObj().getShortCode().toUpperCase() + getNumberInThousandForLPO((requisitionsCount + 1)) + "-" + formattedDate;
    }

    private String getNumberInThousand(long number) {
        String returnValue = "";
        switch ((number + "").length()) {
            case 1:
                returnValue = "000" + number;
                break;
            case 2:
                returnValue = "00" + number;
                break;
            case 3:
                returnValue = "0" + number;
                break;
            default:
                returnValue = number + "";
                break;
        }
        return returnValue;
    }

    private String getNumberInThousandForLPO(long number) {
        String returnValue = "";
        switch ((number + "").length()) {
            case 1:
                returnValue = "100" + number;
                break;
            case 2:
                returnValue = "10" + number;
                break;
            case 3:
                returnValue = "1" + number;
                break;
            default:
                returnValue = number + "";
                break;
        }
        return returnValue;
    }

    private String getProductList(List<RequisitionProducts> requisitionProductses, NumberFormat formatter, NumberFormat qtyFormatter) {
        String prdtList = "";
        for (int i = 0; i < requisitionProductses.size(); i++) {
            prdtList = prdtList + "        <tr style=\"background-color: #fff !important;line-height: 0.8;\">\n"
                    + "          <td style=\"width: 5%;\">" + (i + 1) + "</td>\n"
                    + "          <td style=\"width: 33%;\">" + requisitionProductses.get(i).getDescription() + "</td>\n"
                    + "          <td style=\"width: 10%;\">" + requisitionProductses.get(i).getUomObj().getUomNameLong() + "(" + requisitionProductses.get(i).getUomObj().getUomNameShort() + ")" + "</td>\n"
                    + "          <td style=\"width: 6%;\">" + qtyFormatter.format(requisitionProductses.get(i).getQuantity()) + "</td>\n"
                    + "          <td style=\"width: 12%;\">" + formatter.format(requisitionProductses.get(i).getUnitPrice()) + "</td>\n"
                    + "          <td style=\"width: 7%;\">" + formatter.format(requisitionProductses.get(i).getProductTotal() + requisitionProductses.get(i).getDiscountAmount()) + "</td>\n"
                    + "          <td style=\"width: 7%;\">" + formatter.format(requisitionProductses.get(i).getProductTotal()) + "</td>\n"
                    + "          <td style=\"width: 7%;\">" + formatter.format(requisitionProductses.get(i).getDiscountAmount()) + "</td>\n"
                    + "          <td style=\"width: 7%;\">" + formatter.format(requisitionProductses.get(i).getTotalVAT()) + "</td>\n"
                    + "          <td style=\"width: 7%;\">" + formatter.format(requisitionProductses.get(i).getTotalAmount()) + "</td>\n"
                    + "        </tr>\n";
        }
        return prdtList;
    }

    @Override
    public ResponseModel rejectRequisition(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Requisition requisitionObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Requisition.class);
            if (null != requisitionObj && null != requestModelObj.getExtraVariable()) {
                requisitionObj.setStatusObj(baseDao.getStatusByName("Rejected"));
                requisitionObj.setRejectedDate(new Date());
                if (requestModelObj.getExtraVariable().equalsIgnoreCase("yes")) {
//                    requisitionObj.setDoesAdditionalInfoRequired(false);
                    requisitionObj.setIsFinalReject(true);
                    requisitionObj.setIsUpdated(true);
                    requisitionObj.setIsNewRecForFinance(false);
                    Requisition newRequisitionObj = baseDao.createRequisition(requisitionObj);
                    if (null != newRequisitionObj) {
                        try {
                            String title = "Requisiton " + requisitionObj.getRequisitionId() + " was Rejected";
                            String msg = "A requisition with requisitionId " + requisitionObj.getRequisitionId() + " has been rejected by " + requisitionObj.getPreferedApprover().getFullName();

                            if (null != requisitionObj.getRejectionRemark() && requisitionObj.getRejectionRemark().length() > 0) {
                                msg = msg + " with remarks: " + requisitionObj.getRejectionRemark();
                                if (null != requisitionObj.getRejectedVoiceNote() && requisitionObj.getRejectedVoiceNote().getUri().length() > 0) {
                                    msg = msg + " and a voice note";
                                }
                            } else {
                                if (null != requisitionObj.getRejectedVoiceNote() && requisitionObj.getRejectedVoiceNote().getUri().length() > 0) {
                                    msg = msg + " voice note";
                                }
                            }

                            if (null != requisitionObj.getCreatedBy().getDeviceID()) {
                                sendDynamicNotification(new PushNotificationRequest(title, msg, false, "", requisitionObj.getCreatedBy().getDeviceID()));
                            }
                        } catch (Exception e) {
                            logger.error("Exception while sending push notification --> rejectRequisition() --> " + e.getMessage());
                        }
                        sendEmailNotificationForReject(requisitionObj);
                        responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(requisitionObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    if (null != requisitionObj.getRejectedVoiceNote()) {
                        List<SystemConfig> systemConfigs = baseDao.getAllSystemConfig();
                        List<Attachments> rejectedVoiceNotes = new ArrayList<>();
                        rejectedVoiceNotes.add(requisitionObj.getRejectedVoiceNote());
                        List<Attachments> attachmentses = createFilesFromBase64(rejectedVoiceNotes, requisitionObj.getRequisitionId(), systemConfigs);
                        if (null != attachmentses) {
                            requisitionObj.setRejectedVoiceNote(attachmentses.get(0));
                            requisitionObj.setIsUpdated(true);
                            requisitionObj.setIsNewRecForFinance(false);
                            Requisition newRequisitionObj = baseDao.createRequisition(requisitionObj);
                            if (null != newRequisitionObj) {
                                try {
                                    String title = "Requisiton " + requisitionObj.getRequisitionId() + " was Rejected";
                                    String msg = "A requisition with requisitionId " + requisitionObj.getRequisitionId() + " has been rejected by " + requisitionObj.getPreferedApprover().getFullName();
                                    if (null != requisitionObj.getRejectionRemark() && requisitionObj.getRejectionRemark().length() > 0) {
                                        msg = msg + " with remarks: " + requisitionObj.getRejectionRemark();
                                        if (null != requisitionObj.getRejectedVoiceNote() && requisitionObj.getRejectedVoiceNote().getUri().length() > 0) {
                                            msg = msg + " and a voice note";
                                        }
                                    } else {
                                        if (null != requisitionObj.getRejectedVoiceNote() && requisitionObj.getRejectedVoiceNote().getUri().length() > 0) {
                                            msg = msg + " voice note";
                                        }
                                    }
                                    if (null != requisitionObj.getCreatedBy().getDeviceID()) {
                                        sendDynamicNotification(new PushNotificationRequest(title, msg, false, "", requisitionObj.getCreatedBy().getDeviceID()));
                                    }
                                } catch (Exception e) {
                                    logger.error("Exception while sending push notification --> rejectRequisition() --> " + e.getMessage());
                                }
                                sendEmailNotificationForReject(requisitionObj);
                                responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                                responseModel.setRespObject(newRequisitionObj);
                                responseModel.setStatusCode(0);
                            } else {
                                responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                                responseModel.setStatusCode(2);
                            }
                        } else {
                            responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setStatusCode(2);
                        }
                    } else {
                        if (null != requisitionObj.getRejectionRemark()) {
                            requisitionObj.setIsUpdated(true);
                            requisitionObj.setIsNewRecForFinance(false);
                            Requisition newRequisitionObj = baseDao.createRequisition(requisitionObj);
                            if (null != newRequisitionObj) {
                                try {
                                    String title = "Requisiton " + requisitionObj.getRequisitionId() + " was Rejected";
                                    String msg = "A requisition with requisitionId " + requisitionObj.getRequisitionId() + " has been rejected by " + requisitionObj.getPreferedApprover().getFullName();
                                    if (null != requisitionObj.getRejectionRemark() && requisitionObj.getRejectionRemark().length() > 0) {
                                        msg = msg + " with remarks: " + requisitionObj.getRejectionRemark();
                                        if (null != requisitionObj.getRejectedVoiceNote() && requisitionObj.getRejectedVoiceNote().getUri().length() > 0) {
                                            msg = msg + " and a voice note";
                                        }
                                    } else {
                                        if (null != requisitionObj.getRejectedVoiceNote() && requisitionObj.getRejectedVoiceNote().getUri().length() > 0) {
                                            msg = msg + " voice note";
                                        }
                                    }
                                    if (null != requisitionObj.getCreatedBy().getDeviceID()) {
                                        sendDynamicNotification(new PushNotificationRequest(title, msg, false, "", requisitionObj.getCreatedBy().getDeviceID()));
                                    }
                                } catch (Exception e) {
                                    logger.error("Exception while sending push notification --> rejectRequisition() --> " + e.getMessage());
                                }
                                sendEmailNotificationForReject(requisitionObj);
                                responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                                responseModel.setRespObject(newRequisitionObj);
                                responseModel.setStatusCode(0);
                            } else {
                                responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                                responseModel.setStatusCode(2);
                            }
                        } else {
                            responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setStatusCode(3);
                        }
                    }
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> rejectRequisition() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    private void sendEmailNotificationForReject(Requisition requisitionObj) {
        try {
            if (null != requisitionObj.getCreatedBy()) {
                if (null != requisitionObj.getCreatedBy().getEmailId()) {
                    if (null != requisitionObj.getCreatedBy().getFullName()) {
                        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
                        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
                        mimeMessage.setContent(this.getEmailTemplate(requisitionObj.getCreatedBy().getFullName(), getEmailMessage(requisitionObj, "Reject"), "rejected", getCompanyLogoURL(requisitionObj)), "text/html");
                        helper.setTo(requisitionObj.getCreatedBy().getEmailId());
                        helper.setSubject(getEmailSubject(requisitionObj, "Reject"));
                        javaMailSender.send(mimeMessage);
                    } else {
                        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
                        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
                        mimeMessage.setContent(this.getEmailTemplate("User", getEmailMessage(requisitionObj, "Reject"), "rejected", getCompanyLogoURL(requisitionObj)), "text/html");
                        helper.setTo(requisitionObj.getCreatedBy().getEmailId());
                        helper.setSubject(getEmailSubject(requisitionObj, "Reject"));
                        javaMailSender.send(mimeMessage);
                    }
                } else {
                    System.out.println("Created By's Emailid is null");
                }
            } else {
                System.out.println("Created By's obj is null");
            }
        } catch (Exception e) {
            e.printStackTrace();
            logger.error("Exception while sending email --> rejectRequisition() --> " + e.getMessage());
        }
    }

    @Override
    public ResponseModel approveRequisition(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Requisition requisitionObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Requisition.class);
            if (null != requisitionObj) {
                requisitionObj.setStatusObj(baseDao.getStatusByName("Approved"));
                requisitionObj.setApprovedDate(new Date());
                if (requisitionObj.getCompanyObj().getShouldBypassPurchaseDepartment()) {
                    List<SystemConfig> systemConfigs = baseDao.getAllSystemConfig();
                    requisitionObj.setLpoNumber(getNextLPONumber(requisitionObj));
                    requisitionObj.setLpoPdfUrl(systemConfigs.get(0).getFileUrlPrefix() + "/" + requisitionObj.getLpoNumber() + ".pdf");
                    requisitionObj.setLpoDate(new Date());
                    createRequisitionLPOPdf(requisitionObj, baseDao.getAllRequisitionProductsByRequisitionId(requisitionObj.getRequisitionId()));
                }
                requisitionObj.setIsUpdated(true);
                requisitionObj.setIsNewRecForFinance(true);
                Requisition newRequisitionObj = baseDao.createRequisition(requisitionObj);
                if (null != newRequisitionObj) {
                    try {
                        String title = "Requisiton " + requisitionObj.getRequisitionId() + " was Approved";
                        String msg = "A requisition with requisitionId " + requisitionObj.getRequisitionId() + " has been approved by " + requisitionObj.getPreferedApprover().getFullName();
                        if (null != requisitionObj.getCreatedBy().getDeviceID()) {
                            sendDynamicNotification(new PushNotificationRequest(title, msg, false, "", requisitionObj.getCreatedBy().getDeviceID()));
                        }
                    } catch (Exception e) {
                        logger.error("Exception while sending push notification --> approveRequisition() --> " + e.getMessage());
                    }
                    try {
                        if (null != requisitionObj.getCreatedBy()) {
                            if (null != requisitionObj.getCreatedBy().getEmailId()) {
                                if (null != requisitionObj.getCreatedBy().getFullName()) {
                                    MimeMessage mimeMessage = javaMailSender.createMimeMessage();
                                    MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
                                    mimeMessage.setContent(this.getEmailTemplate(requisitionObj.getCreatedBy().getFullName(), getEmailMessage(requisitionObj, "Approve"), "approved", getCompanyLogoURL(requisitionObj)), "text/html");
                                    helper.setTo(requisitionObj.getCreatedBy().getEmailId());
                                    helper.setSubject(getEmailSubject(requisitionObj, "Approve"));
                                    javaMailSender.send(mimeMessage);
                                } else {
                                    MimeMessage mimeMessage = javaMailSender.createMimeMessage();
                                    MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
                                    mimeMessage.setContent(this.getEmailTemplate("--", getEmailMessage(requisitionObj, "Approve"), "approved", getCompanyLogoURL(requisitionObj)), "text/html");
                                    helper.setTo(requisitionObj.getCreatedBy().getEmailId());
                                    helper.setSubject(getEmailSubject(requisitionObj, "Approve"));
                                    javaMailSender.send(mimeMessage);
                                }
                            } else {
                                System.out.println("Createdby's Emailid is null");
                            }
                        } else {
                            System.out.println("Createdby obj is null");
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                        logger.error("Exception while sending email --> approveRequisition() --> " + e.getMessage());
                    }
                    responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespObject(requisitionObj);
                    responseModel.setStatusCode(0);
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> rejectRequisition() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel addAdditionalInfo(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Requisition requisitionObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Requisition.class);
            if (null != requisitionObj) {
                List<SystemConfig> systemConfigs = baseDao.getAllSystemConfig();
                requisitionObj.setDoesAdditionalInfoFilled(true);
                List<Attachments> attachmentses = createFilesFromBase64(requisitionObj.getAdditionalInfo(), requisitionObj.getRequisitionId(), systemConfigs);
                if (null != attachmentses) {
                    requisitionObj.setAdditionalInfo(attachmentses);
                    requisitionObj.setIsUpdated(true);
                    requisitionObj.setIsNewRecForFinance(false);
                    Requisition newRequisitionObj = baseDao.createRequisition(requisitionObj);
                    if (null != newRequisitionObj) {
                        try {
                            String title = "Additional info has been added towards requisiton " + requisitionObj.getRequisitionId();
                            String msg = "Additional info has been added towards requisiton " + requisitionObj.getRequisitionId() + " by " + requisitionObj.getCreatedBy().getFullName();
                            if (null != requisitionObj.getPreferedApprover().getDeviceID()) {
                                sendDynamicNotification(new PushNotificationRequest(title, msg, true, "", requisitionObj.getPreferedApprover().getDeviceID()));
                            }
                        } catch (Exception e) {
                            logger.error("Exception while sending push notification --> createRequisition() --> " + e.getMessage());
                        }
                        responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(requisitionObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(3);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> rejectRequisition() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getAllActiveRequisitionByCondition(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            FDRequisitionRequest fdrrObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), FDRequisitionRequest.class);
            if (null != fdrrObj) {
                List<Requisition> requisitions = baseDao.getAllActiveRequisitionByCondition(fdrrObj);
                if (null != requisitions) {
                    responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespList(requisitions);
                    responseModel.setStatusCode(0);
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> getAllActiveRequisitionByCondition() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getAllRequisitionByCondition(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            FDRequisitionRequest fdrrObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), FDRequisitionRequest.class);
            if (null != fdrrObj) {
                List<Requisition> requisitions = baseDao.getAllRequisitionByCondition(fdrrObj);
                if (null != requisitions) {
                    responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespList(requisitions);
                    responseModel.setStatusCode(0);
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> getAllActiveRequisitionByCondition() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel addAttachmentToRequisition(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Attachments attachmentObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Attachments.class);
            if (null != attachmentObj) {
                Requisition requisitionObj = baseDao.getRequititionById(requestModelObj.getExtraVariable());
                if (null != requisitionObj) {
                    List<SystemConfig> systemConfigs = baseDao.getAllSystemConfig();

                    attachmentObj.setBase64(attachmentObj.getBase64().split(";")[1].split(",")[1]);
                    List<Attachments> newAttachments = new ArrayList<>();
                    newAttachments.add(attachmentObj);
                    List<Attachments> newAttachmentses = createFilesFromBase64(newAttachments, requisitionObj.getRequisitionId(), systemConfigs);

                    if (newAttachmentses.size() == newAttachments.size()) {
                        List<Attachments> attachmentses = requisitionObj.getAdditionalAttachments();
                        if (!(null != attachmentses)) {
                            attachmentses = new ArrayList<>();
                        }
                        attachmentses.add(attachmentObj);

                        requisitionObj.setAdditionalAttachments(attachmentses);
                        requisitionObj.setIsUpdated(true);
                        requisitionObj.setIsNewRecForFinance(false);
                        Requisition newRequisitionObj = baseDao.createRequisition(requisitionObj);
                        if (null != newRequisitionObj) {
                            responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setRespObject(requisitionObj);
                            responseModel.setStatusCode(0);
                        } else {
                            responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setStatusCode(2);
                        }
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(3);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> getAllActiveRequisitionByCondition() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel makePayment(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            PaymentHistory paymentHistoryObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), PaymentHistory.class);
            if (null != paymentHistoryObj) {
                PaymentHistory newPaymentHistoryObj = baseDao.createPaymentHistory(paymentHistoryObj);
                if (null != newPaymentHistoryObj) {
                    Requisition requisitionObj = baseDao.getRequititionByRequisitionNumber(newPaymentHistoryObj.getRequisitionId());
                    requisitionObj.setPendingAmount(newPaymentHistoryObj.getBalanceAmount());
                    requisitionObj.setPaidAmount(requisitionObj.getPaidAmount() + newPaymentHistoryObj.getPaidAmount());
                    requisitionObj.setIsUpdated(true);
                    requisitionObj.setIsNewRecForFinance(false);
                    Requisition newRequisitionObj = baseDao.createRequisition(requisitionObj);
                    if (null != newRequisitionObj) {
                        try {
                            String title = "Payment has been made towards requisiton " + newRequisitionObj.getRequisitionId();
                            String msg = getAmount(newRequisitionObj, newPaymentHistoryObj.getPaidAmount()) + "Payment has been made towards requisiton " + newRequisitionObj.getRequisitionId() + " by " + newPaymentHistoryObj.getPaidByObj().getFullName();
                            if (null != newRequisitionObj.getPreferedApprover().getDeviceID()) {
                                sendDynamicNotification(new PushNotificationRequest(title, msg, true, "", newRequisitionObj.getPreferedApprover().getDeviceID()));
                            }
                            if (null != requisitionObj.getCreatedBy().getDeviceID()) {
                                sendDynamicNotification(new PushNotificationRequest(title, msg, false, "", requisitionObj.getCreatedBy().getDeviceID()));
                            }
                        } catch (Exception e) {
                            logger.error("Exception while sending push notification --> createRequisition() --> " + e.getMessage());
                        }
                        responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(newPaymentHistoryObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> makePayment() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getAllPaymentHistoryByRequisitionId(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            if (null != requestModelObj.getExtraVariable()) {
                List<PaymentHistory> paymentHistorys = baseDao.getAllPaymentHistoryByRequisitionId(requestModelObj.getExtraVariable());
                if (null != paymentHistorys) {
                    responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespList(paymentHistorys);
                    responseModel.setStatusCode(0);
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> getAllPaymentHistoryByRequisitionId() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel exportDataToExcel(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            List<Requisition> requisitions = objectMapperUtility.jsonArrayToObjectList(requestModelObj.getReqList(), Requisition.class);
            if (null != requisitions) {
                try {
                    XSSFWorkbook workbook = new XSSFWorkbook();
                    XSSFSheet sheet = workbook.createSheet("Requisition");
                    Row row = sheet.createRow(0);

                    CellStyle style = workbook.createCellStyle();
                    XSSFFont font = workbook.createFont();
                    font.setBold(true);
                    font.setFontHeight(16);
                    style.setFont(font);

                    createCell(row, 0, "P.O Date", style, sheet);
                    createCell(row, 1, "LPO No", style, sheet);
                    createCell(row, 2, "MR NO", style, sheet);
                    createCell(row, 3, "Supplier", style, sheet);
                    createCell(row, 4, "Project", style, sheet);
                    createCell(row, 5, "P. Code", style, sheet);
                    createCell(row, 6, "Description", style, sheet);
                    createCell(row, 7, "UOM", style, sheet);
                    createCell(row, 8, "Qty", style, sheet);
                    createCell(row, 9, "UOM Rate", style, sheet);
                    createCell(row, 10, "Taxable Amount", style, sheet);
                    createCell(row, 11, "VAT 10%", style, sheet);
                    createCell(row, 12, "Non-Taxable Amount", style, sheet);
                    createCell(row, 13, "Total", style, sheet);
                    createCell(row, 14, "Attachments", style, sheet);

                    style = workbook.createCellStyle();
                    font = workbook.createFont();
                    font.setFontHeight(14);
                    style.setFont(font);

                    int rowCount = 1;
                    SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");
                    List<RequisitionProducts> requisitionProductses;
                    for (Requisition requisitionObj : requisitions) {
                        row = sheet.createRow(rowCount++);
                        requisitionProductses = baseDao.getAllRequisitionProductsByRequisitionId(requisitionObj.getRequisitionId());
                        if (null != requisitionProductses && requisitionProductses.size() > 0) {
                            try {
                                createCell(row, 0, sdf.format(requisitionObj.getLpoDate()) + "", style, sheet);
                            } catch (Exception e) {
                                createCell(row, 0, "---", style, sheet);
                            }
                            try {
                                createCell(row, 1, requisitionObj.getLpoNumber(), style, sheet);
                            } catch (Exception e) {
                                createCell(row, 1, "---", style, sheet);
                            }
                            try {
                                createCell(row, 2, requisitionObj.getRequisitionId(), style, sheet);
                            } catch (Exception e) {
                                createCell(row, 2, "---", style, sheet);
                            }
                            try {
                                if (null != requisitionObj.getSupplierObj()) {
                                    createCell(row, 3, requisitionObj.getSupplierObj().getSupplierName(), style, sheet);
                                } else {
                                    createCell(row, 3, "----", style, sheet);
                                }
                            } catch (Exception e) {
                                createCell(row, 3, "---", style, sheet);
                            }
                            try {
                                createCell(row, 4, requisitionObj.getProjectObj().getProjectTitle(), style, sheet);
                            } catch (Exception e) {
                                createCell(row, 4, "---", style, sheet);
                            }
                            try {
                                createCell(row, 5, requisitionObj.getProjectObj().getProjectCode(), style, sheet);
                            } catch (Exception e) {
                                createCell(row, 5, "---", style, sheet);
                            }
                            try {
                                createCell(row, 6, getDetails("description", requisitionProductses), style, sheet);
                            } catch (Exception e) {
                                createCell(row, 6, "---", style, sheet);
                            }
                            try {
                                createCell(row, 7, getDetails("uom", requisitionProductses), style, sheet);
                            } catch (Exception e) {
                                createCell(row, 7, "---", style, sheet);
                            }
                            try {
                                createCell(row, 8, getDetails("qty", requisitionProductses), style, sheet);
                            } catch (Exception e) {
                                createCell(row, 8, "---", style, sheet);
                            }
                            try {
                                createCell(row, 9, getDetails("uomRates", requisitionProductses), style, sheet);
                            } catch (Exception e) {
                                createCell(row, 9, "---", style, sheet);
                            }
                            try {
                                createCell(row, 10, getDetails("taxAmount", requisitionProductses), style, sheet);
                            } catch (Exception e) {
                                createCell(row, 10, "---", style, sheet);
                            }
                            try {
                                createCell(row, 11, requisitionObj.getVatTotal() + "", style, sheet);
                            } catch (Exception e) {
                                createCell(row, 11, "---", style, sheet);
                            }
                            try {
                                createCell(row, 12, getDetails("nonTaxAmount", requisitionProductses), style, sheet);
                            } catch (Exception e) {
                                createCell(row, 12, "---", style, sheet);
                            }
                            try {
                                createCell(row, 13, requisitionObj.getFinalAmount() + "", style, sheet);
                            } catch (Exception e) {
                                createCell(row, 13, "---", style, sheet);
                            }
                            try {
                                createCell(row, 14, getAttachmentUrls(requisitionObj), style, sheet);
                            } catch (Exception e) {
                                createCell(row, 14, "---", style, sheet);
                            }
                        }
                    }

                    List<SystemConfig> systemConfigs = baseDao.getAllSystemConfig();
                    if (systemConfigs.size() > 0) {
                        String fileName = (new Date().getTime()) + "-requesitionreport.xlsx";
                        FileOutputStream outputStream = new FileOutputStream(systemConfigs.get(0).getPathPrefix() + fileName);
                        workbook.write(outputStream);
                        workbook.close();
                        outputStream.close();
                        try {
                            Runtime.getRuntime().exec("chmod -R 777 " + (systemConfigs.get(0).getPathPrefix() + fileName));
                        } catch (Exception e) {
                            System.out.println("Error while applying permission ---> " + e.getMessage());
                        }
                        responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setExtraVariable(systemConfigs.get(0).getFileUrlPrefix() + fileName);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> exportDataToExcel() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    private void createCell(Row row, int columnCount, Object value, CellStyle style, XSSFSheet sheet) {
        sheet.autoSizeColumn(columnCount);
        Cell cell = row.createCell(columnCount);
        if (value instanceof Integer) {
            cell.setCellValue((Integer) value);
        } else if (value instanceof Boolean) {
            cell.setCellValue((Boolean) value);
        } else {
            cell.setCellValue((String) value);
        }
        cell.setCellStyle(style);
    }

    private String getDetails(String type, List<RequisitionProducts> requisitionProductses) {
        String returnValue = "";
        switch (type) {
            case "description":
                for (int i = 0; i < requisitionProductses.size(); i++) {
                    if ((i + 1) == requisitionProductses.size()) {
                        returnValue += requisitionProductses.get(i).getDescription();
                    } else {
                        returnValue += requisitionProductses.get(i).getDescription() + ",";
                    }
                }
                break;
            case "uom":
                for (int i = 0; i < requisitionProductses.size(); i++) {
                    if ((i + 1) == requisitionProductses.size()) {
                        returnValue += requisitionProductses.get(i).getUomObj().getUomNameShort();
                    } else {
                        returnValue += requisitionProductses.get(i).getUomObj().getUomNameShort() + ",";
                    }
                }
                break;
            case "qty":
                for (int i = 0; i < requisitionProductses.size(); i++) {
                    if ((i + 1) == requisitionProductses.size()) {
                        returnValue += (requisitionProductses.get(i).getQuantity() + "");
                    } else {
                        returnValue += (requisitionProductses.get(i).getQuantity() + "") + ",";
                    }
                }
                break;
            case "uomRates":
                for (int i = 0; i < requisitionProductses.size(); i++) {
                    if ((i + 1) == requisitionProductses.size()) {
                        returnValue += (requisitionProductses.get(i).getUnitPrice() + "");
                    } else {
                        returnValue += (requisitionProductses.get(i).getUnitPrice() + "") + ",";
                    }
                }
                break;
            case "taxAmount":
                for (int i = 0; i < requisitionProductses.size(); i++) {
                    if (requisitionProductses.get(i).getVatPercentage() > 0) {
                        returnValue += (requisitionProductses.get(i).getTotalAmount() + "") + ",";
                    }
                }
                break;
            case "nonTaxAmount":
                for (int i = 0; i < requisitionProductses.size(); i++) {
                    if (requisitionProductses.get(i).getVatPercentage() <= 0) {
                        returnValue += (requisitionProductses.get(i).getTotalAmount() + "") + ",";
                    }
                }
                break;
            default:
                returnValue = "";
        }
        if (returnValue.length() > 0 && returnValue.contains(",")) {
            returnValue = returnValue.substring(0, returnValue.length() - 1);
        }
        return returnValue;
    }

    private String getAttachmentUrls(Requisition requisitionObj) {
        String returnValue = "";
        List<Attachments> attachments = new ArrayList<>();
        for (int i = 0; i < requisitionObj.getAttachments().size(); i++) {
            requisitionObj.getAttachments().get(i).setAttachmentCategory("Attachments");
            attachments.add(requisitionObj.getAttachments().get(i));
        }
        if (null != requisitionObj.getRejectedVoiceNote()) {
            requisitionObj.getRejectedVoiceNote().setAttachmentCategory("Rejected Voice Note");
            attachments.add(requisitionObj.getRejectedVoiceNote());
        }
        for (int i = 0; i < requisitionObj.getAdditionalInfo().size(); i++) {
            requisitionObj.getAdditionalInfo().get(i).setAttachmentCategory("Additional Info");
            attachments.add(requisitionObj.getAdditionalInfo().get(i));
        }
        for (int i = 0; i < requisitionObj.getAdditionalAttachments().size(); i++) {
            requisitionObj.getAdditionalAttachments().get(i).setAttachmentCategory("Finance Attachments");
            attachments.add(requisitionObj.getAdditionalAttachments().get(i));
        }
        for (int i = 0; i < requisitionObj.getDeliveryAttachments().size(); i++) {
            requisitionObj.getDeliveryAttachments().get(i).setAttachmentCategory("Finance Attachments 2");
            attachments.add(requisitionObj.getDeliveryAttachments().get(i));
        }
        for (int i = 0; i < attachments.size(); i++) {
            if (i == (attachments.size() - 1)) {
                returnValue += attachments.get(i).getUri();
            } else {
                returnValue += attachments.get(i).getUri() + ",";
            }
        }
        return returnValue;
    }

    @Override
    public ResponseModel updateRequisitionStatus(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Requisition requisitionObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Requisition.class);
            if (null != requisitionObj) {
                if (requisitionObj.getPendingAmount() > 0.0) {
                    responseModel.setMessage(messageSource.getMessage("message.amountispendigntobepaid", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(4);
                } else {
                    requisitionObj.setStatusObj(baseDao.getStatusByName("Settled"));
                    requisitionObj.setSettledDate(new Date());
                    requisitionObj.setIsUpdated(true);
                    requisitionObj.setIsNewRecForFinance(false);
                    Requisition newRequisitionObj = baseDao.createRequisition(requisitionObj);
                    if (null != newRequisitionObj) {
                        try {
                            String title = "Requisiton " + requisitionObj.getRequisitionId() + " settled";
                            String msg = "Requisiton " + requisitionObj.getRequisitionId() + " has been settled by " + requisitionObj.getSettledBy().getFullName();
                            if (null != requisitionObj.getPreferedApprover().getDeviceID()) {
                                sendDynamicNotification(new PushNotificationRequest(title, msg, true, "", requisitionObj.getPreferedApprover().getDeviceID()));
                            }
                            if (null != requisitionObj.getCreatedBy().getDeviceID()) {
                                sendDynamicNotification(new PushNotificationRequest(title, msg, false, "", requisitionObj.getCreatedBy().getDeviceID()));
                            }
                        } catch (Exception e) {
                            logger.error("Exception while sending push notification --> createRequisition() --> " + e.getMessage());
                        }
                        try {
                            if (null != requisitionObj.getCreatedBy()) {
                                if (null != requisitionObj.getCreatedBy().getEmailId()) {
                                    if (null != requisitionObj.getCreatedBy().getFullName()) {
                                        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
                                        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
                                        mimeMessage.setContent(this.getEmailTemplate(requisitionObj.getCreatedBy().getFullName(), getEmailMessage(requisitionObj, "Settle"), "settled", getCompanyLogoURL(requisitionObj)), "text/html");
                                        helper.setTo(requisitionObj.getCreatedBy().getEmailId());
                                        helper.setSubject(getEmailSubject(requisitionObj, "Reject"));
                                        javaMailSender.send(mimeMessage);
                                    } else {
                                        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
                                        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
                                        mimeMessage.setContent(this.getEmailTemplate("User", getEmailMessage(requisitionObj, "Settle"), "settled", getCompanyLogoURL(requisitionObj)), "text/html");
                                        helper.setTo(requisitionObj.getCreatedBy().getEmailId());
                                        helper.setSubject(getEmailSubject(requisitionObj, "Settle"));
                                        javaMailSender.send(mimeMessage);
                                    }
                                } else {
                                    System.out.println("Created By's Emailid is null");
                                }
                            } else {
                                System.out.println("Created By's obj is null");
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                            logger.error("Exception while sending email --> updateRequisitionStatus()--Settle --> " + e.getMessage());
                        }

                        responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(requisitionObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> updateRequisitionStatus() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel testAPI(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
//            List<Currencies> currencieses = baseDao.getAllCurrencies("Active");
//            Status statusObj = baseDao.getStatusByName("InActive");
//            for (int i = 0; i < currencieses.size(); i++) {
//                currencieses.get(i).setIsPrefered(false);
//                currencieses.get(i).setStatusObj(statusObj);
//                baseDao.createCurrency(currencieses.get(i));
//            }
            List<Currencies> currencies = objectMapperUtility.jsonArrayToObjectList(requestModelObj.getReqList(), Currencies.class);
            if (null != currencies) {
                Integer count = 0;
                Currencies currencyObj;
                Status statusObj = baseDao.getStatusByName("InActive");
                for (int i = 0; i < currencies.size(); i++) {
                    currencies.get(i).setIsPrefered(false);
                    currencies.get(i).setStatusObj(statusObj);
                    currencyObj = baseDao.createCurrency(currencies.get(i));
                    if (null != currencyObj) {
                        ++count;
                    }
                }

                if (count == currencies.size()) {
                    responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(0);
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()) + " --- " + count);
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> testAPI() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel createCurrency(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Currencies currencyObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Currencies.class);
            if (null != currencyObj) {
                if (!baseDao.checkDuplicateCurrency(currencyObj)) {
                    currencyObj.setStatusObj(baseDao.getStatusByName("Active"));
                    Currencies newCurrencyObj = baseDao.createCurrency(currencyObj);
                    if (null != newCurrencyObj) {
                        responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(newCurrencyObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.duplicate", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(4);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> createCurrency() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel updateCurrency(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Currencies currenciesObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Currencies.class);
            if (null != currenciesObj) {
                Currencies existingCurrencyObj = baseDao.getCurrencyById(currenciesObj.getId());
                if (existingCurrencyObj.getId().trim().toLowerCase().equals(currenciesObj.getId().trim().toLowerCase())) {
                    Currencies newCurrencyObj = baseDao.createCurrency(currenciesObj);
                    if (null != newCurrencyObj) {
                        responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(newCurrencyObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    if (!baseDao.checkDuplicateCurrency(currenciesObj)) {
                        Currencies newCurrencyObj = baseDao.createCurrency(currenciesObj);
                        if (null != newCurrencyObj) {
                            responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setRespObject(newCurrencyObj);
                            responseModel.setStatusCode(0);
                        } else {
                            responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
                            responseModel.setStatusCode(2);
                        }
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.duplicate", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(4);
                    }
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> updateRole() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel deleteCurrency(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Currencies currencyObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Currencies.class);
            if (null != currencyObj) {
                if (currencyObj.getStatusObj().getStatusName().equalsIgnoreCase("active")) {
                    currencyObj.setStatusObj(baseDao.getStatusByName("InActive"));
                } else {
                    currencyObj.setStatusObj(baseDao.getStatusByName("Active"));
                }
                Currencies newCurrencyObj = baseDao.createCurrency(currencyObj);
                if (null != newCurrencyObj) {
//                    if (null != newUomObj) {
                    responseModel.setMessage(messageSource.getMessage("message.updatedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespObject(newCurrencyObj);
                    responseModel.setStatusCode(0);
//                    } else {
//                        responseModel.setMessage(messageSource.getMessage("message.failedtoupdate", null, "", LocaleContextHolder.getLocale()));
//                        responseModel.setStatusCode(2);
//                    }
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.dependency", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(4);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> deleteCurrency() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getAllCurrencies(String statusName) {
        responseModel = new ResponseModel();
        try {
            List<Currencies> currencies = baseDao.getAllCurrencies(statusName);
            if (null != currencies) {
                responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                responseModel.setRespList(currencies);
                responseModel.setStatusCode(0);
            } else {
                responseModel.setMessage(messageSource.getMessage("message.failedtoget", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(2);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> getAllCurrencies() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel getPreferedCurrency(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            if (null != requestModelObj.getExtraVariable()) {
                Currencies newCurrencyObj = baseDao.getPreferedCurrencyObj();
                if (null != newCurrencyObj) {
                    responseModel.setMessage(messageSource.getMessage("message.getallsuccess", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setRespObject(newCurrencyObj);
                    responseModel.setStatusCode(0);
                } else {
                    responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                    responseModel.setStatusCode(2);
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> getPreferedCurrency() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel makePreferedCurrency(RequestModel requestModelObj) {
        responseModel = new ResponseModel();
        try {
            Currencies currencyObj = objectMapperUtility.jsonToObject(gson.toJson(requestModelObj.getReqObject()), Currencies.class);
            if (null != currencyObj) {
                Currencies existingPreferedCurrencyObj = baseDao.getPreferedCurrencyObj();
                if (null != existingPreferedCurrencyObj) {
                    existingPreferedCurrencyObj.setIsPrefered(false);
                    currencyObj.setIsPrefered(true);
                    Currencies one = baseDao.createCurrency(existingPreferedCurrencyObj);
                    Currencies two = baseDao.createCurrency(currencyObj);
                    if (null != one && null != two) {
                        responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(currencyObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                } else {
                    currencyObj.setIsPrefered(true);
                    Currencies newCurrencyObj = baseDao.createCurrency(currencyObj);
                    if (null != newCurrencyObj) {
                        responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setRespObject(newCurrencyObj);
                        responseModel.setStatusCode(0);
                    } else {
                        responseModel.setMessage(messageSource.getMessage("message.failedtoadded", null, "", LocaleContextHolder.getLocale()));
                        responseModel.setStatusCode(2);
                    }
                }
            } else {
                responseModel.setMessage(messageSource.getMessage("message.inputerror", null, "", LocaleContextHolder.getLocale()));
                responseModel.setStatusCode(3);
            }
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> makePreferedCurrency() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    @Override
    public ResponseModel sendNotification(String type) {
        responseModel = new ResponseModel();
        try {
            Message message = null;
            if (checkDeviceToken(type)) {
                message = getPreconfiguredMessageWithData(getSamplePayloadData(new PushNotificationRequest("Hi", "Hello", true, "", type)), new PushNotificationRequest("Hi", "Hello", true, "", type), checkDeviceToken(type));
            } else {
                message = getPreconfiguredMessageWithData(getSamplePayloadData(new PushNotificationRequest("Hi", "Hello", false, "requisitions", type)), new PushNotificationRequest("Hi", "Hello", false, "requisitions", type), checkDeviceToken(type));
            }
//            Message message = getPreconfiguredMessageWithoutData(new PushNotificationRequest("Hi", "Hello", "requisitions", ""));
            Gson gson = new GsonBuilder().setPrettyPrinting().create();
            String jsonOutput = gson.toJson(message);
            String response = sendAndGetResponse(message);
            responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
            responseModel.setExtraVariable(response);
            responseModel.setStatusCode(0);
        } catch (Exception e) {
            logger.error("Exception while execution method BaseServiceImpl --> sendNotification() --> " + e.getMessage());
            responseModel.setMessage(messageSource.getMessage("message.exceptionwhileexecutionmethod", null, "", LocaleContextHolder.getLocale()));
            responseModel.setExtraVariable(e.getMessage());
            responseModel.setStatusCode(11);
        }
        return responseModel;
    }

    private String getEmailSubject(Requisition requisitionObj, String status) {
        Boolean cond = true;
        String message = "";
        try {
            if (null != requisitionObj) {
                if (null != requisitionObj.getRequisitionId()) {
                    message = "Requisition #" + requisitionObj.getRequisitionId();
                } else {
                    message = "Requisition #--.";
                }
            } else {
                message = "Requisition #--.";
            }
        } catch (Exception e) {
            e.printStackTrace();
            message = "Requisition #--.";
        }
        return message;
    }

    private String getEmailMessage(Requisition requisitionObj, String status) {
        Boolean cond = true;
        String message = "";
        SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");
        if (null != requisitionObj) {
            switch (status) {
                case "Raise":
                    if (cond) {
                        try {
                            if (null != requisitionObj.getRequisitionId()) {
                                if (null != requisitionObj.getCreatedBy()) {
                                    if (null != requisitionObj.getCreatedBy().getFullName()) {
                                        message = "The Requisition #" + requisitionObj.getRequisitionId() + " has been raised by " + requisitionObj.getCreatedBy().getFullName() + ", Kindy Review.";
                                    } else {
                                        message = "The Requisition #" + requisitionObj.getRequisitionId() + " has been raised by --, Kindy Review.";
                                    }
                                } else {
                                    message = "The Requisition #" + requisitionObj.getRequisitionId() + " has been raised by --, Kindy Review.";
                                }
                            } else {
                                message = "The Requisition #-- has been raised by --, Kindy Review.";
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                            message = "The Requisition #-- has been raised by --, Kindy Review.";
                        }
                    }
                    break;
                case "Approve":
                    if (cond) {
                        try {
                            if (null != requisitionObj.getRequisitionId()) {
                                if (null != requisitionObj.getRequisitionCreatedOn()) {
                                    String formattedDate = sdf.format(requisitionObj.getRequisitionCreatedOn());
                                    if (null != formattedDate) {
                                        message = "The Requisition #" + requisitionObj.getRequisitionId() + " raised on " + formattedDate + " has been Approved.";
                                    } else {
                                        message = "The Requisition #" + requisitionObj.getRequisitionId() + " raised on -- has been Approved.";
                                    }
                                } else {
                                    message = "The Requisition #" + requisitionObj.getRequisitionId() + " raised on -- has been Approved.";
                                }
                            } else {
                                message = "The Requisition #-- raised on -- has been Approved.";
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                            message = "The Requisition #-- raised on -- has been Approved.";
                        }
                    }
                    break;
                case "Reject":
                    if (cond) {
                        try {
                            if (null != requisitionObj.getRequisitionId()) {
                                if (null != requisitionObj.getRequisitionCreatedOn()) {
                                    String formattedDate = sdf.format(requisitionObj.getRequisitionCreatedOn());
                                    if (null != formattedDate) {
                                        message = "The Requisition #" + requisitionObj.getRequisitionId() + " raised on " + formattedDate + " has been Rejected.";
                                    } else {
                                        message = "The Requisition #" + requisitionObj.getRequisitionId() + " raised on -- has been Rejected.";
                                    }
                                } else {
                                    message = "The Requisition #" + requisitionObj.getRequisitionId() + " raised on -- has been Rejected.";
                                }
                            } else {
                                message = "The Requisition #-- raised on -- has been Rejected.";
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                            message = "The Requisition #-- raised on -- has been Rejected.";
                        }
                    }
                    break;
                case "Settle":
                    if (cond) {
                        try {
                            if (null != requisitionObj.getRequisitionId()) {
                                if (null != requisitionObj.getSettledDate()) {
                                    String formattedDate = sdf.format(requisitionObj.getSettledDate());
                                    if (null != formattedDate) {
                                        message = "The Requisition #" + requisitionObj.getRequisitionId() + " has been settled by " + formattedDate + ".";
                                    } else {
                                        message = "The Requisition #" + requisitionObj.getRequisitionId() + " has been settled by --.";
                                    }
                                } else {
                                    message = "The Requisition #" + requisitionObj.getRequisitionId() + " has been settled by --.";
                                }
                            } else {
                                message = "The Requisition #-- has been settled by --.";
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                            message = "The Requisition #-- has been settled by --.";
                        }
                    }
                    break;
                default:
                    message = "";
            }
        } else {

        }
        return message;
    }

    private Boolean checkDeviceToken(String token) {
        if (null != token) {
            return token.length() > 0;
        } else {
            return false;
        }
    }

    private Boolean sendDynamicNotification(PushNotificationRequest pnrObj) {
        System.out.println("sending notification");
        Boolean returnValue = false;
        try {
            Message message = getPreconfiguredMessageWithData(getSamplePayloadData(pnrObj), pnrObj, null != pnrObj.getToken());
//            Message message = getPreconfiguredMessageWithoutData(new PushNotificationRequest("Hi", "Hello", "requisitions", ""));
//            Gson pnGson = new GsonBuilder().setPrettyPrinting().create();
//            String jsonOutput = pnGson.toJson(message);
            String response = sendAndGetResponse(message);
            System.out.println("Response ---> " + response);
            returnValue = true;
        } catch (InterruptedException | ExecutionException ex) {
            System.out.println("Error while sending notification ----> " + ex.getMessage());
//            java.util.logging.Logger.getLogger(BaseServiceImpl.class.getName()).log(Level.SEVERE, null, ex);
            returnValue = false;
        }
        return returnValue;
    }

    private Boolean compressImage(String filePath, String actualFileName, String extension) {
        InputStream is = null;
        OutputStream os = null;
        ImageWriter writer = null;
        ImageOutputStream ios = null;
        try {
            File imageFile = new File(filePath + actualFileName + extension);
            File compressedImageFile = new File(filePath + actualFileName + "-1" + extension);
            File renamedImageFile = new File(filePath + actualFileName + extension);

            is = new FileInputStream(imageFile);
            os = new FileOutputStream(compressedImageFile);

            // create a BufferedImage as the result of decoding the supplied InputStream
            BufferedImage image = ImageIO.read(is);

            // get all image writers for JPG format
            Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");

            if (!writers.hasNext()) {
                throw new IllegalStateException("No writers found");
            }

            writer = (ImageWriter) writers.next();
            ios = ImageIO.createImageOutputStream(os);
            writer.setOutput(ios);

            ImageWriteParam param = writer.getDefaultWriteParam();

            // compress to a given quality
            param.setCompressionMode(ImageWriteParam.MODE_COPY_FROM_METADATA);
            param.setCompressionQuality(0.5f);

            param.setProgressiveMode(javax.imageio.ImageWriteParam.MODE_COPY_FROM_METADATA);

            // Deine destination type - used the ColorModel and SampleModel of the Input Image
            param.setDestinationType(new ImageTypeSpecifier(image.getColorModel(), image.getSampleModel()));

            // appends a complete image stream containing a single image and
            //associated stream and image metadata and thumbnails to the output
            writer.write(null, new IIOImage(image, null, null), param);

            if (imageFile.delete()) {
                compressedImageFile.renameTo(renamedImageFile);
            }
            return true;
        } catch (Exception e) {
            return false;
        } finally {
            try {
                is.close();
            } catch (Exception ex) {
                java.util.logging.Logger.getLogger(BaseServiceImpl.class.getName()).log(Level.SEVERE, null, ex);
            }
            try {
                os.close();
            } catch (Exception ex) {
                java.util.logging.Logger.getLogger(BaseServiceImpl.class.getName()).log(Level.SEVERE, null, ex);
            }
            try {
                ios.close();
            } catch (Exception ex) {
                java.util.logging.Logger.getLogger(BaseServiceImpl.class.getName()).log(Level.SEVERE, null, ex);
            }
            try {
                writer.dispose();
            } catch (Exception ex) {
                java.util.logging.Logger.getLogger(BaseServiceImpl.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
    }

    private String sendAndGetResponse(Message message) throws InterruptedException, ExecutionException {
        return FirebaseMessaging.getInstance().sendAsync(message).get();
    }

    private Message getPreconfiguredMessageWithData(Map<String, String> data, PushNotificationRequest request, Boolean sendToDeviceId) {
        if (sendToDeviceId) {
            return getPreconfiguredMessageBuilder(request).putAllData(data).setToken(request.getToken()).build();
        } else {
            return getPreconfiguredMessageBuilder(request).putAllData(data).setTopic(request.getTopic()).build();
        }
    }

    private Message.Builder getPreconfiguredMessageBuilder(PushNotificationRequest request) {
        AndroidConfig androidConfig = getAndroidConfig(request.getTopic());
        ApnsConfig apnsConfig = getApnsConfig(request.getTopic());
        return Message.builder()
                .setApnsConfig(apnsConfig).setAndroidConfig(androidConfig).setNotification(
                new Notification(request.getTitle(), request.getMessage()));
    }

    private AndroidConfig getAndroidConfig(String topic) {
        return AndroidConfig.builder()
                .setTtl(Duration.ofMinutes(2).toMillis()).setCollapseKey(topic)
                .setPriority(AndroidConfig.Priority.HIGH)
                .setNotification(AndroidNotification.builder().setSound(NotificationParameter.SOUND.getValue())
                        .setColor(NotificationParameter.COLOR.getValue()).setTag(topic).build()).build();
    }

    private ApnsConfig getApnsConfig(String topic) {
        return ApnsConfig.builder()
                .setAps(Aps.builder().setCategory(topic).setThreadId(topic).build()).build();
    }

    private Message getPreconfiguredMessageWithoutData(PushNotificationRequest request) {
        return getPreconfiguredMessageBuilder(request).setTopic(request.getTopic()).build();
    }

    private Map<String, String> getSamplePayloadData(PushNotificationRequest pnrObj) {
        Map<String, String> pushData = new HashMap<>();
        pushData.put("title", pnrObj.getTitle());
        pushData.put("message", pnrObj.getMessage());
        pushData.put("isForApprover", pnrObj.getIsForApprover() + "");
        return pushData;
    }

    private String getAmount(Requisition requisitionObj, Float amount) {
        String finalAmount = "";
        try {
            BigDecimal Output = new BigDecimal(amount).setScale(requisitionObj.getCurrencyObj().getNoOfdecimals(), RoundingMode.HALF_EVEN);
            finalAmount = Output.setScale(requisitionObj.getCurrencyObj().getNoOfdecimals()).toPlainString();
            finalAmount = finalAmount + requisitionObj.getCurrencyObj().getCurrencyShortName();
        } catch (Exception e) {
            e.printStackTrace();
            finalAmount = "";
        }
        return finalAmount;
    }

    @Override
    public ResponseModel testEmail(String type) {
        responseModel = new ResponseModel();
        try {
//            if (type.equals("attachment")) {
//                MimeMessage mimeMessage = javaMailSender.createMimeMessage();
//                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
//                mimeMessage.setContent(this.getEmailTemplate("Dastagir", "The Requisition 14238 raised on 28-2-2022 has been Approved.", "approved", "http://15.184.94.83/requisition/constImg/spartan.png"), "text/html");
//                helper.setTo("mgd33359@gmail.com");
//                helper.setSubject("Requisition");
//                javaMailSender.send(mimeMessage);
//            } else {
//                String title = "New Requisiton #9848(test-email)";
//                String msg = "A new requisition has been received by David, with 5 items worth of 500BHD";
//                SimpleMailMessage mailMsg = new SimpleMailMessage();
//                mailMsg.setTo("mgd33359@gmail.com");
//                mailMsg.setSubject(title);
//                mailMsg.setText(msg);
//                javaMailSender.send(mailMsg);
//            }
//            responseModel.setMessage(messageSource.getMessage("message.addedsuccessfully", null, "", LocaleContextHolder.getLocale()));
//            responseModel.setStatusCode(0);
            Requisition requisitionObj = new Requisition();
            requisitionObj.setCompanyObj(baseDao.getCompanyById("6273aa5994e70b412aefb3c4"));
            String lpoNUmber = getNextLPONumber(requisitionObj);
            responseModel.setMessage("LPO Number ---> " + lpoNUmber);
            responseModel.setStatusCode(0);
        } catch (Exception e) {
            e.printStackTrace();
            logger.error("Exception while sending email --> testEmail() --> " + e.getMessage());
            responseModel.setMessage("Exception while sending email --> testEmail() --> " + e.getMessage());
            responseModel.setStatusCode(1);
        }
        return responseModel;
    }

    private String getCompanyLogoURL(Requisition requisitionObj) {
        String companyLogoURL = "";
        try {
            if (null != requisitionObj.getCompanyObj()) {
                if (null != requisitionObj.getCompanyObj().getImageURL() && requisitionObj.getCompanyObj().getImageURL().length() > 0) {
                    companyLogoURL = requisitionObj.getCompanyObj().getImageURL();
                } else {
                    companyLogoURL = "http://15.184.94.83/requisition/constImg/TNEmailLogo.png";
                }
            } else {
                companyLogoURL = "http://15.184.94.83/requisition/constImg/TNEmailLogo.png";
            }
        } catch (Exception e) {
            e.printStackTrace();
            companyLogoURL = "http://15.184.94.83/requisition/constImg/TNEmailLogo.png";
        }
        return companyLogoURL;
    }

    private String getEmailTemplate(String personName, String message, String fileName, String companyLogoURL) {
        String newHtmlTemplate = "<!DOCTYPE html>\n"
                + "<html>\n"
                + "<head>\n"
                + "  <meta charset=\"utf-8\">\n"
                + "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n"
                + "  <link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css\">\n"
                + "  <script src=\"https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js\"></script>\n"
                + "  <script src=\"https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js\"></script>\n"
                + "  <script src=\"https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/js/bootstrap.bundle.min.js\"></script>\n"
                + "  <style>\n"
                + "    @import url('https://fonts.googleapis.com/css2?family=Poppins');\n"
                + "    label { font-family: \"poppins\"; }\n"
                + "  </style>\n"
                + "</head>\n"
                + "<body>\n"
                + "  <div style=\"padding: 20px;height: 140px\">\n"
                + "    <img style=\"width:128px;height:128px;\" src=\"" + companyLogoURL + "\" />\n"
                + "  </div>\n"
                + "  <div style=\"height: 340px;background-color: #EFFCEF;\">\n"
                + "    <div style=\"height: 120px;width: 100%;margin-top: 20px;\">\n"
                + "      <div style=\"width: 50%;margin-left: 30%;\">\n"
                + "      <label style=\"font-family: poppins;font-weight: bold;text-align: left;margin-top: 25px;font-size: x-large;\">Dear " + personName + "</label>\n"
                + "        <br />\n"
                + "      <label style=\"font-family: poppins;font-weight: normal;font-size: large;\">" + message + "</label>\n"
                + "        <br />\n"
                + "      <label style=\"font-family: poppins;font-weight: normal;font-size: large;\">Thank you</label>\n"
                + "      </div>\n"
                + "    </div>\n"
                + "    <div style=\"height: 200px;\">\n"
                + "      <center>\n"
                + "        <img style=\"width: 192px;height: 192px;\" src=\"http://15.184.94.83/requisition/constImg/" + fileName + ".png\" />\n"
                + "      </center>\n"
                + "    </div>\n"
                + "  </div>\n"
                + "</body>\n"
                + "</html>";

        String htmlTemplate = "<!DOCTYPE html>\n"
                + "<html>\n"
                + "<head>\n"
                + "  <meta charset=\"utf-8\">\n"
                + "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n"
                + "  <link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css\">\n"
                + "  <script src=\"https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js\"></script>\n"
                + "  <script src=\"https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js\"></script>\n"
                + "  <script src=\"https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/js/bootstrap.bundle.min.js\"></script>\n"
                + "  <style>\n"
                + "    @import url('https://fonts.googleapis.com/css2?family=Poppins:display=swap');\n"
                + "    label { font-family: \"poppins\"; }\n"
                + "  </style>\n"
                + "</head>\n"
                + "<body>\n"
                + "  <div style=\"padding: 20px;height: 120px\">\n"
                + "    <img style=\"width:200px;height:80px;\" src=\"" + companyLogoURL + "\" />\n"
                + "  </div>\n"
                + "  <div style=\"height: 720px;background-color: #EFFCEF;\">\n"
                + "    <div style=\"height: 520px;widht: 100%\">\n"
                + "      <center>\n"
                + "        <img style=\"width: 512px;height: 512px;margin-top: 16px;\" src=\"http://15.184.94.83/requisition/constImg/" + fileName + ".png\" />\n"
                + "      </center>\n"
                + "    </div>\n"
                + "    <div style=\"height: 150px;width: 100%;margin-top: 50px;\">\n"
                + "      <div style=\"width: 50%;margin-left: 30%;\">\n"
                + "        <label style=\"font-weight: bold;text-align: left;\">Dear " + personName + ",</label>\n"
                + "        <br />\n"
                + "        <label>" + message + "</label>\n"
                + "        <br />\n"
                + "        <label>Thank you</label>\n"
                + "      </div>\n"
                + "    </div>\n"
                + "  </div>\n"
                + "</body>\n"
                + "</html>";
        return newHtmlTemplate;
    }

}

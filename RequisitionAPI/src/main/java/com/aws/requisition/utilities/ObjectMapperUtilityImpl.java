package com.aws.requisition.utilities;

import com.aws.requisition.request.ImageRequest;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import java.util.List;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.google.gson.GsonBuilder;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.InvalidAlgorithmParameterException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.logging.Level;
import javax.management.openmbean.InvalidKeyException;
import org.apache.commons.lang3.RandomStringUtils;
import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.apache.tomcat.util.codec.binary.Base64;

/**
 *
 * @author Mohammed Gulam Dastagir
 */
@Service
public class ObjectMapperUtilityImpl implements ObjectMapperUtility {

    private Gson gson = null;
    private ObjectMapper mapper;

    @Override
    public <T> String imageUpload(ImageRequest imageRequest, String filePath, String fileUrl) {
        String fileName;
        if (null != imageRequest.getFileType()) {
            switch (imageRequest.getFileType()) {
                case "image/png":
                    fileName = RandomStringUtils.randomNumeric(20) + ".png";
                    break;
                case "image/jpg":
                    fileName = RandomStringUtils.randomNumeric(20) + ".jpg";
                    break;
                case "image/jpeg":
                    fileName = RandomStringUtils.randomNumeric(20) + ".jpeg";
                    break;
                default:
                    fileName = RandomStringUtils.randomNumeric(20) + ".jpg";
                    break;
            }

        } else {
            fileName = RandomStringUtils.randomNumeric(20) + ".png";
        }
        File catfile = new File(filePath + fileName);
        try {
            catfile.createNewFile();
            try (FileOutputStream imageOutFile = new FileOutputStream(catfile)) {
                byte[] imageByteArray = org.apache.commons.codec.binary.Base64.decodeBase64(imageRequest.getValue());
                imageOutFile.write(imageByteArray);
                imageOutFile.close();
            } catch (FileNotFoundException ex) {
                java.util.logging.Logger.getLogger(ObjectMapperUtilityImpl.class.getName()).log(Level.SEVERE, null, ex);
            } catch (IOException ex) {
                java.util.logging.Logger.getLogger(ObjectMapperUtilityImpl.class.getName()).log(Level.SEVERE, null, ex);
            }
        } catch (IOException ex) {
            java.util.logging.Logger.getLogger(ObjectMapperUtilityImpl.class.getName()).log(Level.SEVERE, null, ex);
        }
        return fileUrl + fileName;
    }

//    @Override
//    public <T> String imageUpload(ImageRequest imageRequest, String filePath, String fileUrl) {
//        String imageUrl;
//        String imageicon = imageRequest.getValue();
//        String actualfileName = imageRequest.getFilename();
//        String imageext = "";
//        imageext = actualfileName.substring(actualfileName.lastIndexOf("."), actualfileName.length());
//        String filename = RandomStringUtils.randomNumeric(8);
//        System.out.println("File Path::: " + filePath);
//        System.out.println("File Patcmp.getFileUrl()h::: " + fileUrl);
//        String fileWithpath = filePath + filename + imageext;
//        System.out.println("File with Url:::: " + fileWithpath);
//        // String  filepath = "C:\\Users\\BizMobia23\\Desktop\\atticket\\" + filename + imageext;
//        File catfile = new File(fileWithpath);
//        try {
//            catfile.setReadable(true, false);
//            catfile.setWritable(true, false);
//            catfile.setExecutable(true, false);
//            if (catfile.exists()) {
//                catfile.delete();
//                System.out.println("DEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE");
//                catfile.createNewFile();
//            } else {
//                catfile.createNewFile();
//            }
//
//            try (FileOutputStream imageOutFile = new FileOutputStream(catfile)) {
//                byte[] imageByteArray = org.apache.commons.codec.binary.Base64.decodeBase64(imageicon);
//                //   byte[] imageByteArray = Base64.getDecoder().decode(imageRequest.getValue());
//                imageOutFile.write(imageByteArray);
//                imageOutFile.close();
//                imageUrl = fileUrl + filename + imageext;
//                // imageUrl = "C:\\Users\\BizMobia23\\Desktop\\atticket\\" + filename + imageext;
//                System.out.println("Image URL::: " + imageUrl);
//            } catch (FileNotFoundException ex) {
//                ex.printStackTrace();
//                imageUrl = null;
//
//            } catch (IOException ex) {
//                ex.printStackTrace();
//                imageUrl = null;
//            }
//            catfile.setReadable(true, false);
//            catfile.setWritable(true, false);
//            catfile.setExecutable(true, false);
//        } catch (IOException ex) {
//            ex.printStackTrace();
//            imageUrl = null;
//        }
//        return imageUrl;
//    }
    @Override
    public <T> String objectToJson(T obj) {
        String jsonString = "";
        try {
            mapper = new ObjectMapper();
            jsonString = mapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return jsonString;
    }

    @Override
    public <T> T jsonToObject(String jsonString, Class<T> clazz) {
        T obj = null;
        try {
            mapper = new ObjectMapper();
            obj = mapper.readValue(jsonString, clazz);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return obj;
    }

    @Override
    public <T> List<T> jsonArrayToObjectList(List<?> resplist, Class<T> reqclass) {
        List<T> objlist = null;
        try {
            mapper = new ObjectMapper();
            gson = new GsonBuilder().disableHtmlEscaping().create();
            objlist = mapper.readValue(gson.toJson(resplist),
                    TypeFactory.defaultInstance().constructCollectionType(List.class, reqclass));
        } catch (IOException e) {
            e.printStackTrace();
        }
        return objlist;
    }

    @Override
    public String decrypt(String generatedKey, String initVector, String encrypted, int len) {
        int frm = 16 - len;
        String encryptedAuthToken = encrypted.substring(frm, encrypted.length());
        try {
            IvParameterSpec iv = new IvParameterSpec(initVector.getBytes("UTF-8"));
            SecretKeySpec skeySpec = new SecretKeySpec(generatedKey.getBytes("UTF-8"), "AES");
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
            try {
                cipher.init(Cipher.DECRYPT_MODE, skeySpec, iv);
            } catch (java.security.InvalidKeyException ex) {
                java.util.logging.Logger.getLogger(ObjectMapperUtilityImpl.class.getName()).log(Level.SEVERE, null, ex);
            }
            byte[] original = cipher.doFinal(Base64.decodeBase64(encryptedAuthToken));
            return new String(original);
        } catch (UnsupportedEncodingException | InvalidAlgorithmParameterException | InvalidKeyException | NoSuchAlgorithmException | BadPaddingException | IllegalBlockSizeException | NoSuchPaddingException e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public String reGenerateEncryptedKey(String mobileNumber, String autho_token) {
        int till = 16 - mobileNumber.length();
        String requiredNumber = autho_token.substring(0, till);
        try {
            int remains = requiredNumber.length();
            int val = 0;
            String abc = "";
            String abc2 = "";
            if (remains % 2 == 0) {
                val = remains / 2;
                abc = requiredNumber.substring(0, val);
                abc2 = requiredNumber.substring(val, till);
            } else {
                val = remains / 2;
                abc = requiredNumber.substring(0, val);
                abc2 = requiredNumber.substring(val, till);
            }
            String pwdno = abc + mobileNumber + abc2;
            String ss = getHashingvaluemd5_512(pwdno);
            StringBuilder gendynamikey = new StringBuilder();
            for (int i = 0; i < pwdno.length(); i++) {
                try {
                    int p = Integer.parseInt(pwdno.charAt(i) + "") + i;
                    gendynamikey.append(ss.charAt(p) + "");
                } catch (NumberFormatException e) {
                    e.printStackTrace();
                }
            }
            return gendynamikey.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public String getHashingvaluemd5_512(String mob) {
        StringBuilder hexString = new StringBuilder();
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-512");
            md.update(mob.getBytes());

            byte byteData[] = md.digest();

            //convert the byte to hex format method 1
            StringBuffer sb = new StringBuffer();
            for (int i = 0; i < byteData.length; i++) {
                sb.append(Integer.toString((byteData[i] & 0xff) + 0x100, 16).substring(1));
            }
            //convert the byte to hex format method 2
            //def9fd27656380d5e401ea0d2a0bb89c
            for (int i = 0; i < byteData.length; i++) {
                String hex = Integer.toHexString(0xff & byteData[i]);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return hexString.toString();
    }

    @Override
    public String encrypt(String key, String initVector, String value) {
        try {
            IvParameterSpec iv = new IvParameterSpec(initVector.getBytes("UTF-8"));
            SecretKeySpec skeySpec = new SecretKeySpec(key.getBytes("UTF-8"), "AES");
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
            cipher.init(Cipher.ENCRYPT_MODE, skeySpec, iv);
            byte[] encrypted = cipher.doFinal(value.getBytes());
            gson = new GsonBuilder().disableHtmlEscaping().create();
            String s2 = gson.toJson(Base64.encodeBase64String(encrypted).toString());
            return s2 = s2.replace("\"", "");
        } catch (UnsupportedEncodingException | InvalidAlgorithmParameterException | java.security.InvalidKeyException | NoSuchAlgorithmException | BadPaddingException | IllegalBlockSizeException | NoSuchPaddingException e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public String generateEncryptedKey(String mobileNumber) {
        try {
            int len = mobileNumber.length();
            int remains = 16 - len;
            int val = 0;
            String abc = "";
            String abc2 = "";
            if (remains % 2 == 0) {
                val = remains / 2;
                abc = RandomStringUtils.randomNumeric(val);
                abc2 = RandomStringUtils.randomNumeric(val);
            } else {
                val = remains / 2;
                abc = RandomStringUtils.randomNumeric(val);
                abc2 = RandomStringUtils.randomNumeric(val + 1);
            }
            String pwdno = abc + mobileNumber + abc2;
            String ss = getHashingvaluemd5_512(pwdno);
            StringBuilder gendynamikey = new StringBuilder();
            for (int i = 0; i < pwdno.length(); i++) {
                try {
                    int p = Integer.parseInt(pwdno.charAt(i) + "") + i;
                    gendynamikey.append(ss.charAt(p) + "");
                } catch (NumberFormatException e) {
                    e.printStackTrace();
                }
            }
            return gendynamikey.toString() + "bizm" + abc + abc2;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}

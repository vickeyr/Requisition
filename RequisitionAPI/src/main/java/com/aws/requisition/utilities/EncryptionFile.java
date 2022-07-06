package com.aws.requisition.utilities;

/**
 *
 * @author Mohammed Gulam Dastagir
 */
public interface EncryptionFile {

    //this is for authotoken 
    public static final String encGenKey = "bizmobiabizmobia";
//    this key for Encrypt and decrypt java object Bar12345Bar12345
    public static final String initVector = "bizmobiabizmobia";
    public static final String symKey = "Biz@123Bizm@bia1";

    public boolean validatePassword(String originalPassword, String storedPassword);

    public String generateStorngPasswordHash(String password);

    public String encrypt(String key, String initVector, String value);

    public String decrypt(String generatedKey, String initVector, String encrypted, int frm);

    public String decryptObject(String key, String initVector, String encrypted);

    public String getHashingvaluemd5_512(String mob);

    public String getencdsckey(String mob);

    public String generateEncryptedKey(String mobileNumber);

    public String reGenerateEncryptedKey(String mobileNumber, String autho_token);

    public boolean isUserAcess(String userId, String encGenKey, String autho_token);

    public Double decriptWalletBalance(String mobileNumber, String encGenKey, String encriptedBalance);

    public String encriptWalletBalance(String mobileNumber, String encGenKey, Double actualBalance);

    public Boolean getAuthentication(String autho_token, String userId);
}

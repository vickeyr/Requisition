package com.aws.requisition.utilities;

import com.aws.requisition.request.ImageRequest;
import java.util.List;

/**
 *
 * @author Mohammed Gulam Dastagir
 */
public interface ObjectMapperUtility {

    public static final String encGenKey = "awsaws";

    public <T> String imageUpload(ImageRequest imageRequest, String filePath, String fileUrl);

    public <T> String objectToJson(T obj);

    public <T> T jsonToObject(String jsonString, Class<T> clazz);

    public <T> List<T> jsonArrayToObjectList(List<?> resplist, Class<T> reqclass);

    public String decrypt(String generatedKey, String initVector, String encrypted, int frm);

    public String reGenerateEncryptedKey(String mobileNumber, String autho_token);

    public String encrypt(String key, String initVector, String value);

    public String generateEncryptedKey(String mobileNumber);

}

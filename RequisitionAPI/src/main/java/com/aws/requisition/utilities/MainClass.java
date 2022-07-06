/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.aws.requisition.utilities;

import com.aws.requisition.serviceImpl.BaseServiceImpl;
import com.itextpdf.html2pdf.HtmlConverter;
import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.concurrent.ExecutionException;
import java.util.logging.Level;
import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageTypeSpecifier;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;

/**
 *
 * @author Basith
 */
public class MainClass {
    
    public static void main(String[] args) throws IOException, InterruptedException, ExecutionException {
        //        String htmlCode = "";
        //        try (FileOutputStream fos = new FileOutputStream("C:\\Users\\mohammedgulam.dastagir\\Desktop\\sample.pdf")) {
        //            fos.write(generatePdfFromHtml(htmlCode, "sample"));
        //        }

        //        String fileName = "skjhksjfjsf.png";
        //        String[] splittedFileName = fileName.split("\\.");
        //        System.out.println("splittedFileName[0] ---> " + splittedFileName[0]);
        //        System.out.println("splittedFileName[1] ---> " + splittedFileName[1]);
        //        String dir = "C:\\Apache24\\htdocs\\REQ-SF002-22\\";
        //        if (Files.exists(Paths.get(dir))) {
        //            System.out.println("Count --- > " + Files.list(Paths.get(dir)).count());
        //        } else {
        //            Files.createDirectories(Paths.get(dir));
        //        }
        //        List<Object> abc = new ArrayList<>();
        //        Notification notification = new Notification("Hello", "Hi");
        //
        //        Message message = Message
        //                .builder()
        //                .setTopic("Test")
        //                //                .setToken(token)
        //                .setNotification(notification)
        //                //                .putAllData(note.getData())
        //                .build();
        //        String resp = FirebaseMessaging.getInstance().sendAsync(message).get();
        //        System.out.println("Resp ---> " + resp);
        //        File folder = new File("D:\\personal\\expenses\\5. 1st Jan 2022 to 31 Jan 2022\\jan bills\\");
        //        File[] listOfFiles = folder.listFiles();
        //
        //        File imageFile;
        //        File compressedImageFile;
        //        InputStream is;
        //        OutputStream os;
        //        float quality = 0.4f;
        //        BufferedImage image;
        //        Iterator<ImageWriter> writers;
        //        ImageWriter writer;
        //        ImageOutputStream ios;
        //        ImageWriteParam param;
        //        for (File file : listOfFiles) {
        //            if (file.isFile()) {
        //                imageFile = new File("D:\\personal\\expenses\\5. 1st Jan 2022 to 31 Jan 2022\\jan bills\\" + file.getName());
        //                compressedImageFile = new File("D:\\personal\\expenses\\5. 1st Jan 2022 to 31 Jan 2022\\jan bills compressed\\" + file.getName());
        //
        //                is = new FileInputStream(imageFile);
        //                os = new FileOutputStream(compressedImageFile);
        //
        //                // create a BufferedImage as the result of decoding the supplied InputStream
        //                image = ImageIO.read(is);
        //
        //                // get all image writers for JPG format
        //                writers = ImageIO.getImageWritersByFormatName("jpg");
        //
        //                if (!writers.hasNext()) {
        //                    throw new IllegalStateException("No writers found");
        //                }
        //
        //                writer = (ImageWriter) writers.next();
        //                ios = ImageIO.createImageOutputStream(os);
        //                writer.setOutput(ios);
        //
        //                param = writer.getDefaultWriteParam();
        //
        //                // compress to a given quality
        //                param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        //                param.setCompressionQuality(quality);
        //
        //                // appends a complete image stream containing a single image and
        //                //associated stream and image metadata and thumbnails to the output
        //                writer.write(null, new IIOImage(image, null, null), param);
        //
        //                // close all streams
        //                is.close();
        //                os.close();
        //                ios.close();
        //                writer.dispose();
        //                System.out.println(file.getName() + "--Done");
        //            }
        //        }
        //        sendNotification();
        SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy HH:mm");
        Date data = new Date();
        data.setDate(14);
        data.setMonth(3);
        data.setHours(22);
        data.setMinutes(20);
        System.out.println("Actual Date ---> " + sdf.format(data));
        data.setHours(-72);
        System.out.println("Prior Date ---> " + sdf.format(data));
//        compressImage("C:\\Apache24\\htdocs\\companyLogos\\", "testing", ".png");
    }
    
    private static void compressImage(String filePath, String actualFileName, String extension) {
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
            Iterator<ImageWriter> writers = ImageIO.getImageWritersByMIMEType("image/png");
            
            if (!writers.hasNext()) {
                throw new IllegalStateException("No writers found");
            }
            
            writer = (ImageWriter) writers.next();
            ios = ImageIO.createImageOutputStream(os);
            writer.setOutput(ios);
            
            ImageWriteParam param = writer.getDefaultWriteParam();

            // compress to a given quality
            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
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
        } catch (Exception e) {
            e.printStackTrace();
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
    
    public static void compressImage2(String filePath, String actualFileName, String extension) throws IOException {
        Iterator writers;
        BufferedImage bufferedImage;
        ImageOutputStream imageOutputStream;
        ImageWriter imageWriter;
        ImageWriteParam pngparams;

// Read an image from the disk (First Argument)
//bufferedImage = ImageIO.read(new File(args[0]));
        bufferedImage = ImageIO.read(new File(filePath + actualFileName + extension));
// Get all the PNG writers
        writers = ImageIO.getImageWritersByFormatName("png");

// Fetch the first writer in the list
        imageWriter = (ImageWriter) writers.next();

// Just to confirm that the writer in use is CLibPNGImageWriter
        System.out.println("\n Writer used : " + imageWriter.getClass().getName() + "\n");

// Specify the parameters according to those the output file will be written
// Get Default parameters
        pngparams = imageWriter.getDefaultWriteParam();

// Define compression mode
//        pngparams.setCompressionMode(javax.imageio.ImageWriteParam.MODE_EXPLICIT);
// Define compression quality
//        pngparams.setCompressionQuality(0.5F);
// Define progressive mode
        pngparams.setProgressiveMode(javax.imageio.ImageWriteParam.MODE_COPY_FROM_METADATA);

// Deine destination type - used the ColorModel and SampleModel of the Input Image
        pngparams.setDestinationType(
                new ImageTypeSpecifier(bufferedImage.getColorModel(), bufferedImage.getSampleModel()));

// Set the output stream to Second Argument
//imageOutputStream = ImageIO.createImageOutputStream( new FileOutputStream(args[1]) );
        imageOutputStream = ImageIO.createImageOutputStream(new FileOutputStream(filePath + actualFileName + "-1" + extension));
        imageWriter.setOutput(imageOutputStream);

// Write the changed Image
        imageWriter.write(null, new IIOImage(bufferedImage, null, null), pngparams);

// Close the streams
        imageOutputStream.close();
        imageWriter.dispose();
    }
    
    private static void sendNotification() {
        try {
            
            URL url = new URL("https://fcm.googleapis.com/fcm/notification");
//            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            HttpURLConnection conn = null;
            conn = (HttpURLConnection) url.openConnection();
            
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("project_id", "1011394486154");
//            conn.setRequestProperty("Authorization", "key=AIzaSyBevBbAVxWNDsm6rw9ope2Gqw7q_Tr76Y0");
            conn.setRequestProperty("Authorization", "key=AAAA63vPH4o:APA91bFDqzAPy6gpEIBsYJcD75YNKStvh-gxwze4xr-FGCqsIgWJJJqSqvTKgGIFUpzRT6tnawdtwhBV25M5330x7Ntc-oVCHIZQn3wwCOexoYMadYBnQ62zxJkrQ5mvDuJkzGGtq-pF");
            conn.setDoOutput(true);
            String strResponseText = "";
            
            String message = "Pending Discount - 10";
            String s = "{ \n"
                    + "\"to\":\"\",\n"
                    + //"\"android\":{\n" +
                    "\"priority\": \"high\",\n"
                    + "\"notification\":{\n"
                    + "\"title\":\"Remote Notification title\",\n"
                    + "\"body\":\"** Remote message from server, Remote message from server,Remote message from server\",\n"
                    + "\"android_channel_id\": \"rn-push-notification-channel-id\",\n"
                    + "\"android_priority\": \"max\",\n"
                    + "\"notification_priority\": 2,\n"
                    + "\"visibility\": 1,\n"
                    + "\"priority\": \"high\"\n"
                    + "}\n"
                    + "}";
            System.out.println(s);
            conn.setConnectTimeout(2000);
            PrintWriter printwriter = new PrintWriter(conn.getOutputStream());
            printwriter.println(s);
            printwriter.close();
            BufferedReader bufferedreader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String s1;
            while ((s1 = bufferedreader.readLine()) != null) {
                strResponseText = (new StringBuilder()).append(strResponseText).append(s1).toString();
            }
            bufferedreader.close();
            
            int responseCode = conn.getResponseCode();
            System.out.println("\nSending 'POST' request to URL : " + url);
            System.out.println("Response Code : " + responseCode);
            System.out.println("Response strResponseText : " + strResponseText);
            
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    public static byte[] generatePdfFromHtml(String html, String name) throws IOException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        HtmlConverter.convertToPdf(html, buffer);
        byte[] pdfAsBytes = buffer.toByteArray();
        try (FileOutputStream fos = new FileOutputStream(name)) {
            fos.write(pdfAsBytes);
        }
        return pdfAsBytes;
    }
    
}

package com.aws.requisition;

import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
//import org.springframework.boot.context.embedded.ConfigurableEmbeddedServletContainer;
//import org.springframework.boot.context.embedded.EmbeddedServletContainerCustomizer;
//import org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;
import org.springframework.web.servlet.i18n.SessionLocaleResolver;


@Configuration
@EnableScheduling
@SpringBootApplication
@EnableMongoAuditing
public class RequisitionApplication implements WebMvcConfigurer {

    @Value("${app.firebase-configuration-file}")
    private static String firebaseConfigPath;

    public static void main(String[] args) {
//        try {
//            Init.initAdminSdk();
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
        SpringApplication.run(RequisitionApplication.class, args);
    }

//    @Bean
//    EmbeddedServletContainerCustomizer containerCustomizer() throws Exception {
//        return (ConfigurableEmbeddedServletContainer container) -> {
//            if (container instanceof TomcatEmbeddedServletContainerFactory) {
//                TomcatEmbeddedServletContainerFactory tomcat = (TomcatEmbeddedServletContainerFactory) container;
//                tomcat.addConnectorCustomizers(
//                        (connector) -> {
//                            connector.setMaxPostSize(10000000); // 10 MB
//                        }
//                );
//            }
//        };
//    }
    @Bean(name = "localeResolver")
    public LocaleResolver localeResolver() {
        SessionLocaleResolver slr = new SessionLocaleResolver();
        slr.setDefaultLocale(Locale.US);
        return slr;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        LocaleChangeInterceptor localeChangeInterceptor = new LocaleChangeInterceptor();
        localeChangeInterceptor.setParamName("language");
        registry.addInterceptor(localeChangeInterceptor);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurerAdapter() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        //                        .allowedOrigins("http://clinicadmin.telfic.com", "http://clinicadmin.telfic.com/", "http://clinicadmin.telfic.com/#/")
                        .allowedMethods("POST", "GET", "PUT", "OPTIONS", "DELETE")
                        //                .allowedHeaders("X-Auth-Token", "Content-Type")
                        .exposedHeaders("custom-header1", "custom-header2")
                        .allowCredentials(false)
                        .maxAge(4800);
            }
        };
    }
}

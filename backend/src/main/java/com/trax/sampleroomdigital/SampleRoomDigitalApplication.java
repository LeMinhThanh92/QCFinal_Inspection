package com.trax.sampleroomdigital;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.security.Security;

@SpringBootApplication
public class SampleRoomDigitalApplication {

    public static void main(String[] args) {
        // ─── Re-enable TLS 1.0 for legacy SQL Server ────────────────────
        // Java 17 disables TLSv1 and TLSv1.1 by default.
        // SQL Server 192.168.1.245 only supports TLS 1.0, so we must re-enable it.
        String disabledAlgorithms = Security.getProperty("jdk.tls.disabledAlgorithms");
        if (disabledAlgorithms != null) {
            // Remove TLSv1 and TLSv1.1 from the disabled list
            disabledAlgorithms = disabledAlgorithms
                    .replace("TLSv1,", "")
                    .replace("TLSv1.1,", "")
                    .replace(", TLSv1", "")
                    .replace(", TLSv1.1", "")
                    .replace("TLSv1", "")
                    .replace("TLSv1.1", "");
            Security.setProperty("jdk.tls.disabledAlgorithms", disabledAlgorithms);
            System.out.println("[TLS] Re-enabled TLSv1/TLSv1.1 for legacy SQL Server");
            System.out.println("[TLS] jdk.tls.disabledAlgorithms = " + disabledAlgorithms);
        }

        SpringApplication.run(SampleRoomDigitalApplication.class, args);
    }
}

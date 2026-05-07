package com.trax.sampleroomdigital.service;

import com.jcraft.jsch.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Service responsible for SFTP file uploads to Pivot88/TRANS4M server.
 * <p>
 * C# equivalent: UpSFTPImage(string nm, string url, int type)
 * <p>
 * Key differences from legacy C# app:
 * - Uses a single SFTP session for batch uploads (instead of opening/closing per file)
 * - Streams images directly from Image Server LAN to SFTP (no local temp files)
 * - Credentials loaded from DB (GetLoadData 651 → Tables[1])
 */
@Service
public class SftpService {

    private static final Logger log = LoggerFactory.getLogger(SftpService.class);

    private final JdbcTemplate jdbcTemplate;

    @Value("${sftp.pivot88.connect-timeout:30000}")
    private int connectTimeout;

    @Value("${sftp.pivot88.remote-path-json:/incoming/}")
    private String remotePathJson;

    @Value("${sftp.pivot88.remote-path-images:/incoming/images/}")
    private String remotePathImages;

    @Value("${image.server.base-path:ImageQCFINAL/}")
    private String imageBasePath;

    // Cached SFTP credentials (loaded from DB)
    private String sftpHost;
    private int sftpPort;
    private String sftpUser;
    private String sftpPassword;
    private boolean credentialsLoaded = false;

    public SftpService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // ═══════════════════════════════════════════════════════════════
    // Credential Loading
    // ═══════════════════════════════════════════════════════════════

    /**
     * Loads SFTP credentials from DB.
     * <p>
     * C# equivalent: loadserver() → dsServer.Tables[1]
     * <pre>
     *   Pv88Ip   = r["EmployeeName"]   (SFTP host)
     *   Pv88User = r["EmployeeCode"]   (SFTP username)
     *   Pv88Pw   = r["Password"]       (SFTP password)
     *   Pv88Port = r["Section"]        (SFTP port)
     * </pre>
     * <p>
     * The stored procedure GetLoadData 651 returns multiple result sets.
     * Tables[0] = Image server IP, Tables[1] = SFTP credentials, Tables[2] = ERP mapping.
     * Since JdbcTemplate.queryForList only returns the first result set,
     * we use a dedicated query to get the SFTP credentials from the second result set.
     */
    public void loadSftpCredentials() {
        if (credentialsLoaded) {
            return;
        }

        try {
            // GetLoadData 651 returns multiple result sets.
            // Tables[1] contains SFTP credentials with columns:
            //   EmployeeName (=host), EmployeeCode (=user), Password (=pw), Section (=port)
            //
            // Since JdbcTemplate can't easily handle multiple result sets,
            // we use the CallableStatementCallback to extract the second result set.
            jdbcTemplate.execute((java.sql.Connection conn) -> {
                try (java.sql.CallableStatement cs = conn.prepareCall("{call GetLoadData(651, '', '')}")) {
                    boolean hasResults = cs.execute();

                    // Skip Tables[0] (Image server IP)
                    if (hasResults) {
                        try (java.sql.ResultSet rs = cs.getResultSet()) {
                            // Just consume Tables[0], we don't need it here
                        }
                    }

                    // Move to Tables[1] (SFTP credentials)
                    boolean moreResults = cs.getMoreResults();
                    if (moreResults) {
                        try (java.sql.ResultSet rs = cs.getResultSet()) {
                            if (rs.next()) {
                                sftpHost = rs.getString("EmployeeName");
                                sftpUser = rs.getString("EmployeeCode");
                                sftpPassword = rs.getString("Password");
                                sftpPort = rs.getInt("Section");
                                credentialsLoaded = true;
                                log.info("SFTP credentials loaded: host={}, port={}, user={}", sftpHost, sftpPort, sftpUser);
                            }
                        }
                    }
                }
                return null;
            });

            if (!credentialsLoaded) {
                throw new RuntimeException("SFTP credentials not found in GetLoadData 651 → Tables[1]");
            }

        } catch (Exception e) {
            log.error("Failed to load SFTP credentials from DB", e);
            throw new RuntimeException("Cannot load SFTP credentials: " + e.getMessage(), e);
        }
    }

    /**
     * Returns the Image Server base URL loaded from GetLoadData 651 → Tables[0].
     * Example: "http://192.168.1.248/"
     */
    public String getImageServerUrl() {
        try {
            String sql = "exec GetLoadData 651, '', ''";
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
            if (!rows.isEmpty()) {
                Object val = rows.get(0).get("IPSERVER");
                if (val != null) {
                    String url = val.toString().trim();
                    if (!url.endsWith("/")) {
                        url += "/";
                    }
                    return url;
                }
            }
        } catch (Exception e) {
            log.error("Failed to get image server URL", e);
        }
        return "";
    }

    // ═══════════════════════════════════════════════════════════════
    // SFTP Upload Operations
    // ═══════════════════════════════════════════════════════════════

    /**
     * Opens a new SFTP session (JSch ChannelSftp).
     * The caller is responsible for closing the session via {@link SftpSession#close()}.
     * <p>
     * C# equivalent: new SftpClient(Pv88Ip, Pv88Port, Pv88User, Pv88Pw) → client.Connect()
     */
    public SftpSession openSession() {
        loadSftpCredentials();

        try {
            JSch jsch = new JSch();
            Session session = jsch.getSession(sftpUser, sftpHost, sftpPort);
            session.setPassword(sftpPassword);

            // Skip host key checking (same behavior as legacy C# SftpClient)
            java.util.Properties config = new java.util.Properties();
            config.put("StrictHostKeyChecking", "no");
            session.setConfig(config);
            session.setTimeout(connectTimeout);
            session.connect(connectTimeout);

            Channel channel = session.openChannel("sftp");
            channel.connect(connectTimeout);
            ChannelSftp channelSftp = (ChannelSftp) channel;

            log.info("SFTP session opened: {}@{}:{}", sftpUser, sftpHost, sftpPort);
            return new SftpSession(session, channelSftp);

        } catch (JSchException e) {
            log.error("Failed to open SFTP session to {}:{}", sftpHost, sftpPort, e);
            throw new RuntimeException("SFTP connection failed: " + e.getMessage(), e);
        }
    }

    /**
     * Uploads an image stream to /incoming/images/ on the SFTP server.
     * <p>
     * C# equivalent: UpSFTPImage(nm, url, 1) → /incoming/images/
     *
     * @param channelSftp  Active SFTP channel
     * @param inputStream  Image data stream
     * @param remoteFileName File name on SFTP server (format: [Unikey].[name].[ext])
     */
    public void uploadImage(ChannelSftp channelSftp, InputStream inputStream, String remoteFileName) {
        String remotePath = remotePathImages + remoteFileName;
        uploadFile(channelSftp, inputStream, remotePath);
    }

    /**
     * Uploads a JSON stream to /incoming/ on the SFTP server.
     * <p>
     * C# equivalent: UpSFTPImage(nm, url, 0) → /incoming/
     *
     * @param channelSftp  Active SFTP channel
     * @param inputStream  JSON data stream
     * @param remoteFileName File name on SFTP server
     */
    public void uploadJson(ChannelSftp channelSftp, InputStream inputStream, String remoteFileName) {
        String remotePath = remotePathJson + remoteFileName;
        uploadFile(channelSftp, inputStream, remotePath);
    }

    /**
     * Low-level SFTP file upload.
     * <p>
     * C# equivalent: client.UploadFile(fileStream, remotePath)
     * C# also set: client.BufferSize = 10 * 1024 to bypass payload size errors.
     * JSch handles buffering internally.
     */
    private void uploadFile(ChannelSftp channelSftp, InputStream inputStream, String remotePath) {
        try {
            channelSftp.put(inputStream, remotePath);
            log.info("SFTP upload OK: {}", remotePath);
        } catch (SftpException e) {
            log.error("SFTP upload FAILED: {}", remotePath, e);
            throw new RuntimeException("SFTP upload failed for " + remotePath + ": " + e.getMessage(), e);
        } finally {
            try {
                inputStream.close();
            } catch (Exception ignored) {}
        }
    }

    /**
     * Downloads an image from the image server (LAN) and returns it as a byte array.
     * <p>
     * C# equivalent: WebClient.DownloadFile(URI, filePath)
     * Optimization: We stream directly to byte[] without saving to disk.
     *
     * @param imageServerUrl Base URL of image server (e.g., "http://192.168.1.248/")
     * @param originalFileName Original filename as stored in DB
     * @return byte array of the downloaded image
     */
    public byte[] downloadImageFromServer(String imageServerUrl, String originalFileName) {
        String fullUrl = imageServerUrl + imageBasePath + originalFileName;
        try {
            URL url = new URL(fullUrl);
            try (InputStream is = url.openStream();
                 ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                byte[] buffer = new byte[10 * 1024]; // 10KB buffer (matches C# BufferSize)
                int bytesRead;
                while ((bytesRead = is.read(buffer)) != -1) {
                    baos.write(buffer, 0, bytesRead);
                }
                log.debug("Downloaded image: {} ({} bytes)", fullUrl, baos.size());
                return baos.toByteArray();
            }
        } catch (Exception e) {
            log.warn("Failed to download image from {}: {}", fullUrl, e.getMessage());
            return null; // Non-fatal: skip this image, continue with others
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // SFTP Session wrapper (AutoCloseable for try-with-resources)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Wraps a JSch Session + ChannelSftp for easy lifecycle management.
     * Use with try-with-resources to ensure proper cleanup.
     */
    public static class SftpSession implements AutoCloseable {
        private final Session session;
        private final ChannelSftp channelSftp;

        public SftpSession(Session session, ChannelSftp channelSftp) {
            this.session = session;
            this.channelSftp = channelSftp;
        }

        public ChannelSftp getChannel() {
            return channelSftp;
        }

        @Override
        public void close() {
            try {
                if (channelSftp != null && channelSftp.isConnected()) {
                    channelSftp.disconnect();
                }
            } catch (Exception ignored) {}
            try {
                if (session != null && session.isConnected()) {
                    session.disconnect();
                }
            } catch (Exception ignored) {}
            log.info("SFTP session closed");
        }

        private static final Logger log = LoggerFactory.getLogger(SftpSession.class);
    }

    // ═══════════════════════════════════════════════════════════════
    // Image Name Formatting
    // ═══════════════════════════════════════════════════════════════

    /**
     * Formats the SFTP remote filename for an image.
     * <p>
     * C# equivalent in DownloadImageandUpload():
     * <pre>
     *   string oldnm = filename;  // e.g., "20260504_154931.jpg"
     *   string nmNew = oldnm.Substring(0, oldnm.IndexOf("."));        // "20260504_154931"
     *   string duoiNew = oldnm.Substring(oldnm.IndexOf(".") + 1);     // "jpg"
     *   string newnm = id + "." + nmNew + "." + duoiNew.ToLower();     // "a1a_aql_trans4m_59126.20260504_154931.jpg"
     * </pre>
     *
     * @param unikey The unique key (e.g., "a1a_aql_trans4m_59126")
     * @param originalFileName The original filename (e.g., "20260504_154931.jpg")
     * @return Formatted name: [Unikey].[name].[ext] (e.g., "a1a_aql_trans4m_59126.20260504_154931.jpg")
     */
    public static String formatSftpImageName(String unikey, String originalFileName) {
        if (originalFileName == null || originalFileName.isEmpty()) {
            return "";
        }

        int dotIndex = originalFileName.indexOf('.');
        if (dotIndex < 0) {
            // No extension, just prepend unikey
            return unikey + "." + originalFileName;
        }

        String namePart = originalFileName.substring(0, dotIndex);       // "20260504_154931"
        String extPart = originalFileName.substring(dotIndex + 1).toLowerCase(); // "jpg"

        // Format: [Unikey].[name].[ext]
        return unikey + "." + namePart + "." + extPart;
    }
}

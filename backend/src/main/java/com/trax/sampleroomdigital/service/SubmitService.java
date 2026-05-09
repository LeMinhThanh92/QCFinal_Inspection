package com.trax.sampleroomdigital.service;

import com.jcraft.jsch.ChannelSftp;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Orchestrates the full "Submit to Pivot88" workflow.
 * <p>
 * C# equivalent: Btnsubmit2_Click → CreateJSonFileAQLoutbound_Trans4m_CTQ
 * <p>
 * Flow:
 * 1. Validate & pre-check (update SysCreateDate, updatestatus, check_labtest)
 * 2. Collect all image tasks (overview pictures + defect pictures)
 * 3. Upload ALL images to SFTP /incoming/images/ (images MUST go first!)
 * 4. Generate JSON & upload to SFTP /incoming/ (JSON goes LAST as the trigger)
 * 5. Save submit log to DB (InlineFGsWHPOSFTP)
 */
@Service
public class SubmitService {

    private static final Logger log = LoggerFactory.getLogger(SubmitService.class);

    private final JdbcTemplate jdbcTemplate;
    private final SftpService sftpService;
    private final InspectionService inspectionService;

    public SubmitService(JdbcTemplate jdbcTemplate, SftpService sftpService, InspectionService inspectionService) {
        this.jdbcTemplate = jdbcTemplate;
        this.sftpService = sftpService;
        this.inspectionService = inspectionService;
    }

    /**
     * Main submit method — called by Controller.
     * <p>
     * C# equivalent: Btnsubmit2_Click + CreateJSonFileAQLoutbound_Trans4m_CTQ
     *
     * @param poNumber    PO Number
     * @param planRef     Plan Reference (JobNo)
     * @param recNo       Record Number
     * @param inspectorId Inspector Employee Code
     * @return Result map with success/failure details
     */
    public Map<String, Object> submitToPivot(String poNumber, String planRef, String recNo, String inspectorId) {
        Map<String, Object> result = new LinkedHashMap<>();

        // ═══════════════════════════════════════════════════════════
        // STEP 0: Basic validation
        // C# line 492: if (recno != "")
        // ═══════════════════════════════════════════════════════════
        if (recNo == null || recNo.trim().isEmpty()) {
            result.put("success", false);
            result.put("message", "Error.... Pls choose PO");
            return result;
        }

        try {
            // ═══════════════════════════════════════════════════════
            // STEP 1: Validate & Pre-check
            // C# lines 494-510: Update SysCreateDate → updatestatus → check_labtest
            // ═══════════════════════════════════════════════════════
            log.info("Submit START: PO={}, PlanRef={}, RecNo={}, Inspector={}", poNumber, planRef, recNo, inspectorId);
            validateAndPreCheck(recNo, poNumber);

            // ═══════════════════════════════════════════════════════
            // STEP 2: Collect image tasks
            // ═══════════════════════════════════════════════════════
            String imageServerUrl = sftpService.getImageServerUrl();
            if (imageServerUrl.isEmpty()) {
                result.put("success", false);
                result.put("message", "Image server URL not found (GetLoadData 651)");
                return result;
            }
            log.info("Image server URL: {}", imageServerUrl);

            List<ImageUploadTask> imageTasks = collectImageTasks(recNo, poNumber, planRef);
            log.info("Collected {} image tasks for upload", imageTasks.size());

            // ═══════════════════════════════════════════════════════
            // STEP 3 + 4: Open SFTP session, upload images THEN JSON
            // Using single session for entire batch (optimized vs C#)
            // ═══════════════════════════════════════════════════════
            int imagesUploaded = 0;
            int imagesFailed = 0;
            String jsonFileName;

            try (SftpService.SftpSession sftpSession = sftpService.openSession()) {
                ChannelSftp channel = sftpSession.getChannel();

                // ─── Upload ALL images FIRST ───
                // C# equivalent: DownloadImageandUpload(url, nmDao, r["Unikey"])
                // → DownloadImage(uri, newnm) → UpSFTPImage(newnm, folderPath, 1)
                for (ImageUploadTask task : imageTasks) {
                    try {
                        byte[] imageData = sftpService.downloadImageFromServer(imageServerUrl, task.originalFileName);
                        if (imageData != null && imageData.length > 0) {
                            sftpService.uploadImage(channel, new ByteArrayInputStream(imageData), task.remoteFileName);
                            imagesUploaded++;
                            log.debug("Image uploaded: {} → {}", task.originalFileName, task.remoteFileName);
                        } else {
                            imagesFailed++;
                            log.warn("Skipped image (download returned null): {}", task.originalFileName);
                        }
                    } catch (Exception e) {
                        imagesFailed++;
                        log.warn("Failed to upload image: {} → {}", task.originalFileName, task.remoteFileName, e);
                        // Non-fatal: continue with other images (same as C# catch block in DownloadImageandUpload)
                    }
                }
                log.info("Images uploaded: {}/{} (failed: {})", imagesUploaded, imageTasks.size(), imagesFailed);

                // ─── Upload JSON LAST (the "seal" command) ───
                // C# equivalent:
                //   jj = serialized JSON string
                //   nm = "JsonTest_AQLOutbound_" + poNumber + "_" + timestamp + ".json"
                //   UpSFTPImage(nm, dirPath, 0)  → /incoming/
                jsonFileName = uploadJsonToSftp(channel, poNumber, planRef, recNo);
                log.info("JSON uploaded: {}", jsonFileName);
            }

            // ═══════════════════════════════════════════════════════
            // STEP 5: Save submit log to DB
            // C# line 889: INSERT INTO InlineFGsWHPOSFTP(...)
            // ═══════════════════════════════════════════════════════
            saveSubmitLog(poNumber, jsonFileName, inspectorId, planRef);
            log.info("Submit log saved to InlineFGsWHPOSFTP");

            // ═══════════════════════════════════════════════════════
            // STEP 6: Return success
            // ═══════════════════════════════════════════════════════
            result.put("success", true);
            result.put("message", "Submitted COMPLETE...");
            result.put("fileName", jsonFileName);
            result.put("imagesUploaded", imagesUploaded);
            result.put("imagesFailed", imagesFailed);
            result.put("totalImages", imageTasks.size());

            log.info("Submit COMPLETE: PO={}, JSON={}, Images={}/{}", poNumber, jsonFileName, imagesUploaded, imageTasks.size());

        } catch (RuntimeException e) {
            // Handle known errors (PO FAILED, SFTP connection failed, etc.)
            log.error("Submit FAILED: PO={}, Error={}", poNumber, e.getMessage(), e);
            result.put("success", false);
            result.put("message", e.getMessage());
        } catch (Exception e) {
            // Handle unexpected errors
            log.error("Submit UNEXPECTED ERROR: PO={}", poNumber, e);
            result.put("success", false);
            result.put("message", "Submitted FAIL...Please check Carton number...");
        }

        return result;
    }

    // ═══════════════════════════════════════════════════════════════
    // Private Methods
    // ═══════════════════════════════════════════════════════════════

    /**
     * STEP 1: Validate & pre-check before submit.
     * <p>
     * C# equivalent (Btnsubmit2_Click lines 494-510):
     * <pre>
     *   CSDL.Doc("update QCFinalReport set SysCreateDate=getdate() where RecNo=" + recno);
     *   CSDL.Ghi("DtradeProduction.dbo.QCFinal 'updatestatus','" + poNumber + "'...");
     *   DataTable t = CSDL.Doc("DtradeProduction.dbo.QCFinal 'check_labtest','" + poNumber + "'...");
     *   if (t.Rows[0]["result"].ToString().Equals("Failed")) → show "PO FAILED..."
     * </pre>
     */
    private void validateAndPreCheck(String recNo, String poNumber) {
        // 1. Update SysCreateDate on QCFinalReport
        jdbcTemplate.update("UPDATE QCFinalReport SET SysCreateDate = getdate() WHERE RecNo = ?", recNo);

        // 2. Trigger updatestatus stored procedure
        try {
            String updateSql = "EXEC DtradeProduction.dbo.QCFinal 'updatestatus', ?, '', '', '', '', ''";
            jdbcTemplate.execute(updateSql, (java.sql.PreparedStatement ps) -> {
                ps.setString(1, poNumber);
                return ps.execute();
            });
        } catch (Exception e) {
            log.warn("updatestatus call warning: {}", e.getMessage());
            // Non-critical, continue
        }

        // 3. Check labtest result
        try {
            String checkSql = "EXEC DtradeProduction.dbo.QCFinal 'check_labtest', ?, '', '', '', '', ''";
            List<Map<String, Object>> labResult = jdbcTemplate.queryForList(checkSql, poNumber);

            if (!labResult.isEmpty()) {
                Object resultObj = labResult.get(0).get("result");
                if (resultObj != null && "Failed".equalsIgnoreCase(resultObj.toString().trim())) {
                    throw new RuntimeException("CheckLabtest fail");
                }
            }
        } catch (RuntimeException e) {
            throw e; // Re-throw PO FAILED
        } catch (Exception e) {
            log.warn("check_labtest call warning: {}", e.getMessage());
            // Non-critical, continue
        }
    }

    /**
     * STEP 2: Collect all image upload tasks.
     * <p>
     * Scans the same data sources as C# CreateJSonFileAQLoutbound_Trans4m_CTQ:
     * <p>
     * A. Overview pictures: getpic → RecNo → field "Image" (comma-separated paths)
     * B. Defect pictures: PivotGetData_New_Trans4m_CTQ → field "Image1" (per DefectCode)
     * <p>
     * Each image is extracted as an original filename. The SFTP remote name follows format:
     * [Unikey].[originalName].[extension]
     * <p>
     * C# equivalent: DownloadImageandUpload(url, nmDao, r["Unikey"])
     * where: newnm = id + "." + nmNew + "." + duoiNew.ToLower()
     */
    private List<ImageUploadTask> collectImageTasks(String recNo, String poNumber, String planRef) {
        List<ImageUploadTask> tasks = new ArrayList<>();
        // Use a Set to avoid uploading duplicate images
        Set<String> addedRemoteNames = new HashSet<>();

        // Fetch dtTotal (same query used by generateTrans4mJson)
        List<Map<String, Object>> dtTotal;
        try {
            dtTotal = jdbcTemplate.queryForList("EXEC Hr.dbo.PivotGetData_New_Trans4m_CTQ ?, ?", poNumber, planRef);
        } catch (Exception e) {
            log.error("Failed to load PivotGetData_New_Trans4m_CTQ", e);
            return tasks;
        }

        // Group by Unikey (same as C# code groups by Unikey)
        Map<String, List<Map<String, Object>>> groupedByUnikey = new LinkedHashMap<>();
        for (Map<String, Object> row : dtTotal) {
            String unikey = row.get("Unikey") != null ? row.get("Unikey").toString() : "";
            groupedByUnikey.computeIfAbsent(unikey, k -> new ArrayList<>()).add(row);
        }

        for (Map.Entry<String, List<Map<String, Object>>> entry : groupedByUnikey.entrySet()) {
            String unikey = entry.getKey();
            if (unikey.isEmpty()) continue;

            // ─────────────────────────────────────────────
            // A. Overview pictures (getpic → "Image" field)
            // C# lines 555-576: dtPic = CSDL.Doc("...QCFinal 'getpic','" + recno + "'...")
            //   strD = dtPic.Rows[0]["Image"].Split(',')
            //   foreach str1 → nmDao → DownloadImageandUpload(url, nmDao, r["Unikey"])
            // ─────────────────────────────────────────────
            try {
                List<Map<String, Object>> dtPic = jdbcTemplate.queryForList(
                        "EXEC DtradeProduction.dbo.QCFinal 'getpic', ?, '', '', '', '', ''", recNo);

                if (!dtPic.isEmpty() && dtPic.get(0).get("Image") != null) {
                    String imageStr = dtPic.get(0).get("Image").toString();
                    String[] imgs = imageStr.split(",");
                    for (String img : imgs) {
                        String trimImg = img.trim();
                        if (!trimImg.isEmpty()) {
                            // Extract filename from path
                            // C# uses DaoChuoi (string reverse) to extract filename.
                            // The DB stores paths like: "path/to/filename.jpg"
                            // We just need the last segment after the last '/'
                            String originalFileName = extractFileName(trimImg);
                            if (!originalFileName.isEmpty()) {
                                String remoteFileName = SftpService.formatSftpImageName(unikey, originalFileName);
                                if (!remoteFileName.isEmpty() && addedRemoteNames.add(remoteFileName)) {
                                    tasks.add(new ImageUploadTask(originalFileName, remoteFileName));
                                }
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to load overview pictures for RecNo={}: {}", recNo, e.getMessage());
            }

            // ─────────────────────────────────────────────
            // B. Defect pictures (Image1 per DefectCode)
            // C# lines 577-610: foreach DataRow r3 in dt3.Rows
            //   if r4["Image1"] != "" → strD = r4["Image1"].Split(',')
            //   foreach str1 → nmDao → DownloadImageandUpload(url, nmDao, r3["Unikey"])
            // ─────────────────────────────────────────────
            Set<String> processedDefectCodes = new HashSet<>();
            for (Map<String, Object> row : entry.getValue()) {
                String defectCode = row.get("DefectCode") != null ? row.get("DefectCode").toString() : "";
                if (defectCode.isEmpty() || !processedDefectCodes.add(defectCode)) {
                    continue; // Skip empty or already-processed defect codes
                }

                String image1Str = row.get("Image1") != null ? row.get("Image1").toString() : "";
                if (!image1Str.isEmpty()) {
                    String[] defImgs = image1Str.split(",");
                    for (String defImg : defImgs) {
                        String trimDefImg = defImg.trim();
                        if (!trimDefImg.isEmpty()) {
                            String originalFileName = extractFileName(trimDefImg);
                            if (!originalFileName.isEmpty()) {
                                String remoteFileName = SftpService.formatSftpImageName(unikey, originalFileName);
                                if (!remoteFileName.isEmpty() && addedRemoteNames.add(remoteFileName)) {
                                    tasks.add(new ImageUploadTask(originalFileName, remoteFileName));
                                }
                            }
                        }
                    }
                }
            }
        }

        return tasks;
    }

    /**
     * Extracts the filename from a path string.
     * <p>
     * C# uses DaoChuoi (string reverse) to parse the filename from DB paths.
     * The DB stores image references in various formats like:
     *   "path/to/filename.jpg" or just "filename.jpg"
     * <p>
     * This method simply takes the last segment after the last '/' character,
     * which achieves the same result as the C# DaoChuoi logic.
     */
    private String extractFileName(String path) {
        if (path == null || path.isEmpty()) return "";
        String trimmed = path.trim();
        int lastSlash = trimmed.lastIndexOf('/');
        if (lastSlash >= 0 && lastSlash < trimmed.length() - 1) {
            return trimmed.substring(lastSlash + 1);
        }
        // Also handle backslash (Windows paths)
        int lastBackSlash = trimmed.lastIndexOf('\\');
        if (lastBackSlash >= 0 && lastBackSlash < trimmed.length() - 1) {
            return trimmed.substring(lastBackSlash + 1);
        }
        return trimmed; // Already just a filename
    }

    /**
     * STEP 4: Generate JSON and upload to SFTP.
     * <p>
     * C# equivalent:
     * <pre>
     *   // Serialize JSON
     *   jj = "{\"inspections\":[" + serialized objects + "]}";
     *   nm = "JsonTest_AQLOutbound_" + poNumber + "_" + timestamp + ".json";
     *   // Write to file then upload
     *   UpSFTPImage(nm, dirPath + "/", 0);  → /incoming/
     * </pre>
     * <p>
     * Optimization: We don't write to disk. Convert String → InputStream → SFTP directly.
     */
    private String uploadJsonToSftp(ChannelSftp channel, String poNumber, String planRef, String recNo) {
        // 1. Generate JSON payload (method already exists in InspectionService)
        String jsonPayload = inspectionService.generateTrans4mJson(poNumber, planRef, recNo);

        // Check for generation errors
        if (jsonPayload.contains("\"error\":")) {
            throw new RuntimeException("JSON generation failed: " + jsonPayload);
        }

        // 2. Build filename: JsonTest_AQLOutbound_[PO]_[Timestamp].json
        // C# line 848: nm = "JsonTest_AQLOutbound_" + edsearchpo.Text + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".json"
        String timestamp = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        String jsonFileName = "JsonTest_AQLOutbound_" + poNumber + "_" + timestamp + ".json";

        // 3. Upload JSON as stream (no file on disk)
        byte[] jsonBytes = jsonPayload.getBytes(StandardCharsets.UTF_8);
        sftpService.uploadJson(channel, new ByteArrayInputStream(jsonBytes), jsonFileName);

        return jsonFileName;
    }

    /**
     * STEP 5: Save submit log to DB.
     * <p>
     * C# line 889:
     * <pre>
     *   CSDL.Doc("insert into InlineFGsWHPOSFTP(PONo,FileName,CreatedBy,SysCreateDate,PlanRef)
     *            values ('" + edsearchpo.Text + "','" + nm + "','" + inspectorid + "',getdate(),'" + planref + "')");
     * </pre>
     */
    private void saveSubmitLog(String poNumber, String fileName, String inspectorId, String planRef) {
        String sql = "INSERT INTO InlineFGsWHPOSFTP(PONo, FileName, CreatedBy, SysCreateDate, PlanRef) " +
                     "VALUES (?, ?, ?, getdate(), ?)";
        jdbcTemplate.update(sql, poNumber, fileName, inspectorId, planRef);
    }

    // ═══════════════════════════════════════════════════════════════
    // Inner class: Image Upload Task
    // ═══════════════════════════════════════════════════════════════

    /**
     * Represents a single image to be uploaded to SFTP.
     * <p>
     * C# equivalent: DownloadImageandUpload(url, nmDao, r["Unikey"])
     * where:
     *   sourceHttpUrl = url + "ImageQCFINAL/" + oldnm
     *   remoteFileName = id + "." + nmNew + "." + duoiNew.ToLower()  → [Unikey].[name].[ext]
     */
    static class ImageUploadTask {
        /** Original filename as stored in DB (e.g., "20260504_154931.jpg") */
        final String originalFileName;
        /** SFTP remote filename in format [Unikey].[name].[ext] (e.g., "a1a_aql_trans4m_59126.20260504_154931.jpg") */
        final String remoteFileName;

        ImageUploadTask(String originalFileName, String remoteFileName) {
            this.originalFileName = originalFileName;
            this.remoteFileName = remoteFileName;
        }
    }
}

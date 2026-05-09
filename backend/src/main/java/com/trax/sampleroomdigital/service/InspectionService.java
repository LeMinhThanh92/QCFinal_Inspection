package com.trax.sampleroomdigital.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class InspectionService {

    private final JdbcTemplate jdbcTemplate;

    public InspectionService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Executes the ADynamicApp stored procedure to search for PO details.
     * Equivalent to C# code: CSDL.Doc("exec [Hr].[dbo].[ADynamicApp] 72,'" + edsearchpo.Text.Trim() + "','" + factory + "','','','',''")
     * 
     * @param poNumber The PO number entered by the user
     * @param factory The factory assigned to the user
     * @return List of map containing PO details
     */
    public List<Map<String, Object>> searchPo(String poNumber, String factory) {
        String sql = "exec [Hr].[dbo].[ADynamicApp] 72, ?, ?, '', '', '', ''";
        return jdbcTemplate.queryForList(sql, poNumber, factory);
    }

    /**
     * Loads defect types using QCFinal stored procedure.
     */
    public List<Map<String, Object>> loadDefectTypes() {
        String sql = "exec DtradeProduction.dbo.QCFinal 'load_DefectType','','','','','',''";
        return jdbcTemplate.queryForList(sql);
    }

    /**
     * Loads defect codes for a specific defect type using QCFinal stored procedure.
     */
    public List<Map<String, Object>> loadDefectCodes(String defectType) {
        String sql = "exec DtradeProduction.dbo.QCFinal 'load_DefectCode',?,'','','','',''";
        return jdbcTemplate.queryForList(sql, defectType);
    }

    /**
     * Loads images for a PO and groups by Description, taking the longest Image1.
     * Also fetches the base image server URL and formats the paths correctly.
     */
    public List<Map<String, Object>> loadImages(String poNumber, String planRef) {
        // 1. Fetch base server URL
        String serverUrl = "";
        try {
            String urlSql = "exec GetLoadData 651, '', ''";
            List<Map<String, Object>> urlResult = jdbcTemplate.queryForList(urlSql);
            if (!urlResult.isEmpty()) {
                Object ipVal = urlResult.get(0).get("IPSERVER");
                if (ipVal != null) {
                    serverUrl = ipVal.toString().trim();
                    if (!serverUrl.endsWith("/")) {
                        serverUrl += "/";
                    }
                }
            }
        } catch (Exception e) {
            // Ignore if GetLoadData 651 fails or returns multiple result sets that jdbc template can't handle perfectly
            e.printStackTrace();
        }

        // 2. Fetch images
        String sql = "exec DtradeProduction.dbo.QCFinal 'load_image_pic', ?, ?, '', '', '', ''";
        List<Map<String, Object>> rawResult = jdbcTemplate.queryForList(sql, poNumber, planRef);

        Map<String, Map<String, Object>> longestImages = new HashMap<>();
        for (Map<String, Object> row : rawResult) {
            String description = (String) row.get("Description");
            if (description == null) continue;

            String image1 = (String) row.get("Image1");
            int currentLen = image1 == null ? 0 : image1.length();

            if (!longestImages.containsKey(description)) {
                longestImages.put(description, new HashMap<>(row));
            } else {
                String existingImage1 = (String) longestImages.get(description).get("Image1");
                int existingLen = existingImage1 == null ? 0 : existingImage1.length();
                if (currentLen > existingLen) {
                    longestImages.put(description, new HashMap<>(row));
                }
            }
        }

        // 3. Format the image strings to real HTTP URLs
        String finalServerUrl = serverUrl;
        longestImages.values().forEach(row -> {
            String image1 = (String) row.get("Image1");
            if (image1 != null && !image1.isEmpty() && !finalServerUrl.isEmpty()) {
                String[] paths = image1.split(",");
                StringBuilder formattedUrls = new StringBuilder();
                for (int i = 0; i < paths.length; i++) {
                    String path = paths[i].trim();
                    if (!path.isEmpty()) {
                        int lastSlash = path.lastIndexOf('/');
                        String fileName = lastSlash >= 0 ? path.substring(lastSlash + 1) : path;
                        String httpUrl = finalServerUrl + "ImageQCFINAL/" + fileName;
                        formattedUrls.append(httpUrl);
                        if (i < paths.length - 1) {
                            formattedUrls.append(",");
                        }
                    }
                }
                row.put("Image1", formattedUrls.toString());
            }
        });

        return new ArrayList<>(longestImages.values());
    }

    /**
     * Loads recorded defects for a given PO RecNo.
     */
    public List<Map<String, Object>> loadRecordedDefects(String recNo) {
        if (recNo == null || recNo.trim().isEmpty()) {
            return new ArrayList<>();
        }
        String sql = "select * from QCFinalDefImg where RecNo = ? and Remark is null";
        try {
            return jdbcTemplate.queryForList(sql, recNo);
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    /**
     * Retrieves the PlanID via checkpobook.
     */
    public String getPlanId(String poNumber, String factory, String inspectorId, String planRef) {
        try {
            String sql = "SET NOCOUNT ON; exec DtradeProduction.dbo.QCFinal 'checkpobook', ?, ?, ?, ?, '', ''";
            List<Map<String, Object>> result = jdbcTemplate.queryForList(
                sql, 
                poNumber, 
                factory != null ? factory : "", 
                inspectorId != null ? inspectorId : "", 
                planRef != null ? planRef : ""
            );
            if (!result.isEmpty()) {
                Object obj = result.get(0).values().iterator().next();
                if (obj != null) {
                    return obj.toString().trim();
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "";
    }

    /**
     * Retrieves the sample size via checksamplesize.
     */
    public String getSampleSize(String aqlLv, String qtyTotal) {
        try {
            String sql = "exec DtradeProduction.dbo.QCFinal 'checksamplesize', ?, ?, '', '', '', ''";
            List<Map<String, Object>> result = jdbcTemplate.queryForList(
                sql, 
                aqlLv != null ? aqlLv : "", 
                qtyTotal != null ? qtyTotal : ""
            );
            if (!result.isEmpty()) {
                Object obj = result.get(0).values().iterator().next();
                if (obj != null) {
                    return obj.toString().trim();
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "N/A";
    }

    /**
     * Retrieves the Inspector ID (EmployeeCode) via loadUserPV.
     */
    public String getInspectorId(String userId) {
        try {
            String sql = "exec DtradeProduction.dbo.QCFinal 'loadUserPV', ?, '', '', '', '', ''";
            List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, userId);
            if (!result.isEmpty()) {
                // Return EmployeeCode from result
                if (result.get(0).containsKey("EmployeeCode") && result.get(0).get("EmployeeCode") != null) {
                    return result.get(0).get("EmployeeCode").toString().trim();
                } else {
                    Object obj = result.get(0).values().iterator().next();
                    if (obj != null) return obj.toString().trim();
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return ""; // Return empty to signal User Pivot not configured
    }

    /**
     * Retrieves the RecNo via checkrecno.
     */
    public String getRecNo(String planId, String inspectorId) {
        try {
            String sql = "exec DtradeProduction.dbo.QCFinal 'checkrecno', ?, ?, '', '', '', ''";
            List<Map<String, Object>> result = jdbcTemplate.queryForList(
                sql, 
                planId != null ? planId : "", 
                inspectorId != null ? inspectorId : ""
            );
            if (!result.isEmpty()) {
                Object obj = result.get(0).values().iterator().next();
                if (obj != null) {
                    return obj.toString().trim();
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "";
    }

    /**
     * Updates status and checks Pass/Fail result for a given PO.
     */
    public String checkPassFail(String poNumber, String factory, String inspectorId, String planRef) {
        if (poNumber == null || poNumber.trim().isEmpty()) {
            return "UNKNOWN";
        }
        
        try {
            // First, trigger update status
            String updateSql = "exec DtradeProduction.dbo.QCFinal 'updatestatus', ?, '', '', '', '', ''";
            jdbcTemplate.execute(updateSql, (java.sql.PreparedStatement ps) -> {
                ps.setString(1, poNumber);
                return ps.execute();
            });

            // Try to find PlanID using checkpobook
            String planIdSql = "SET NOCOUNT ON; exec DtradeProduction.dbo.QCFinal 'checkpobook', ?, ?, ?, ?, '', ''";
            List<Map<String, Object>> planIdResult = jdbcTemplate.queryForList(
                planIdSql, 
                poNumber, 
                factory != null ? factory : "", 
                inspectorId != null ? inspectorId : "", 
                planRef != null ? planRef : ""
            );

            if (!planIdResult.isEmpty()) {
                Object planIdObj = planIdResult.get(0).values().iterator().next();
                if (planIdObj != null) {
                    String planId = planIdObj.toString().trim();
                    
                    // Then query the result
                    String querySql = "select Status from DtradeProduction.dbo.InlineFGsWHPlanBook where PlanID = ?";
                    List<Map<String, Object>> result = jdbcTemplate.queryForList(querySql, planId);
                    
                    if (!result.isEmpty() && result.get(0).get("Status") != null) {
                        String status = result.get(0).get("Status").toString().trim();
                        return status.equalsIgnoreCase("F") ? "fail" : "pass";
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "UNKNOWN";
    }

    /**
     * Updates the carton numbers in the QCFinalReport.
     */
    public boolean updateCartonNum(String recNo, String cartonNum) {
        try {
            if (recNo == null || recNo.trim().isEmpty()) {
                return false;
            }
            String sql = "update DtradeProduction.dbo.QCFinalReport set CartonNum = ? where RecNo = ?";
            int rowsAffected = jdbcTemplate.update(sql, cartonNum, recNo);
            return rowsAffected > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Loads the carton numbers via load_ctn_1.
     */
    public String loadCtn1(String poNumber, String planRef) {
        try {
            String sql = "exec DtradeProduction.dbo.QCFinal 'load_ctn_1', ?, ?, '', '', '', ''";
            List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, poNumber, planRef);
            if (!result.isEmpty()) {
                Object obj = result.get(0).values().iterator().next();
                if (obj != null) {
                    return obj.toString().trim();
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "";
    }

    /**
     * Loads operations/zones for a given PO number.
     */
    public List<Map<String, Object>> loadOperations(String poNumber) {
        try {
            String sql = "exec QCFinal 'loadoperation', ?, '', '', '', '', ''";
            return jdbcTemplate.queryForList(sql, poNumber);
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    /**
     * Adds a defect record: INSERT into QCFinalDefImg and UPDATE Accepted/Rejected in QCFinalReport.
     * Returns a map with updated accepted and rejected values.
     */
    public Map<String, Object> addDefect(String recNo, String poNumber, String defCode, String defDescription,
                                          int major, String operation) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 1. INSERT QCFinalDefImg FIRST
            String insertSql = "insert into QCFinalDefImg (RecNo, PONO, DefCode, DefDescription, Critical, Major, Minor, DefectiveUnit, SysCreateDate, Operation) " +
                    "values (?, ?, ?, ?, 0, ?, 0, 0, getdate(), ?)";
            jdbcTemplate.update(insertSql, recNo, poNumber, defCode, defDescription, major, operation != null ? operation : "");

            // 2. Sum ALL active defects for this RecNo
            String sumSql = "select ISNULL(SUM(Critical + Major + Minor), 0) as totalDefectQty from QCFinalDefImg where RecNo = ? and Remark is null";
            List<Map<String, Object>> sumResult = jdbcTemplate.queryForList(sumSql, recNo);
            int totalDefectQty = 0;
            if (!sumResult.isEmpty() && sumResult.get(0).get("totalDefectQty") != null) {
                totalDefectQty = Integer.parseInt(sumResult.get(0).get("totalDefectQty").toString().trim());
            }

            // 3. Get InsQTY from QCFinalReport
            String selectSql = "select InsQTY from DtradeProduction.dbo.QCFinalReport where RecNo = ?";
            List<Map<String, Object>> current = jdbcTemplate.queryForList(selectSql, recNo);
            int insQty = 0;
            if (!current.isEmpty()) {
                Object insObj = current.get(0).get("InsQTY");
                insQty = insObj != null ? Integer.parseInt(insObj.toString().trim()) : 0;
            }

            // 4. Recalculate: Rejected = total remaining defects, Accepted = InsQTY - Rejected
            int newRejected = totalDefectQty;
            int newAccepted = insQty - totalDefectQty;

            // 5. UPDATE QCFinalReport
            String updateSql = "update DtradeProduction.dbo.QCFinalReport set Accpected = ?, Rejected = ? where RecNo = ?";
            jdbcTemplate.update(updateSql, newAccepted, newRejected, recNo);



            // 5. Trigger updatestatus
            try {
                String statusSql = "exec DtradeProduction.dbo.QCFinal 'updatestatus', ?, '', '', '', '', ''";
                jdbcTemplate.execute(statusSql, (java.sql.PreparedStatement ps) -> {
                    ps.setString(1, poNumber);
                    return ps.execute();
                });
            } catch (Exception e) {
                // Non-critical, continue
                e.printStackTrace();
            }

            result.put("success", true);
            result.put("accepted", newAccepted);
            result.put("rejected", newRejected);
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    /**
     * Soft-deletes a defect (Remark='*') and recalculates Accepted/Rejected from scratch.
     * 
     * C# equivalent: Lvdef_ItemClick
     *   1. Remark='*' on the defect row
     *   2. SUM remaining defect quantities
     *   3. Rejected = totalRemainingDefectQty, Accepted = InsQTY - Rejected
     *   4. UPDATE QCFinalReport
     *
     * We recalculate from scratch instead of incremental +/- to avoid drift
     * when saveAll resets Accepted=InsQTY without zeroing Rejected.
     */
    public Map<String, Object> deleteDefect(String recNo, String defDescription) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 1. Soft delete: mark Remark='*'
            String deleteSql = "update QCFinalDefImg set Remark = '*' where RecNo = ? and DefDescription = ? and Remark is null";
            jdbcTemplate.update(deleteSql, recNo, defDescription);

            // 2. Sum ALL remaining active defects for this RecNo
            String sumSql = "select ISNULL(SUM(Critical + Major + Minor), 0) as totalDefectQty from QCFinalDefImg where RecNo = ? and Remark is null";
            List<Map<String, Object>> sumResult = jdbcTemplate.queryForList(sumSql, recNo);
            int totalDefectQty = 0;
            if (!sumResult.isEmpty() && sumResult.get(0).get("totalDefectQty") != null) {
                totalDefectQty = Integer.parseInt(sumResult.get(0).get("totalDefectQty").toString().trim());
            }

            // 3. Get InsQTY from QCFinalReport
            String selectSql = "select InsQTY from DtradeProduction.dbo.QCFinalReport where RecNo = ?";
            List<Map<String, Object>> current = jdbcTemplate.queryForList(selectSql, recNo);
            int insQty = 0;
            if (!current.isEmpty()) {
                Object insObj = current.get(0).get("InsQTY");
                insQty = insObj != null ? Integer.parseInt(insObj.toString().trim()) : 0;
            }

            // 4. Recalculate: Rejected = total remaining defects, Accepted = InsQTY - Rejected
            int newRejected = totalDefectQty;
            int newAccepted = insQty - totalDefectQty;

            // 5. UPDATE QCFinalReport
            String updateSql = "update DtradeProduction.dbo.QCFinalReport set Accpected = ?, Rejected = ? where RecNo = ?";
            jdbcTemplate.update(updateSql, newAccepted, newRejected, recNo);

            result.put("success", true);
            result.put("accepted", newAccepted);
            result.put("rejected", newRejected);
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    /**
     * Returns the image server URL and PHP upload endpoint from GetLoadData 651.
     */
    public Map<String, Object> getImageServerUrl() {
        Map<String, Object> result = new HashMap<>();
        try {
            String getUrlSql = "exec GetLoadData 651, '', ''";
            List<Map<String, Object>> urlRows = jdbcTemplate.queryForList(getUrlSql);
            String phpUrl = "";
            if (!urlRows.isEmpty()) {
                Object ipVal = urlRows.get(0).get("IPSERVER");
                if (ipVal != null) {
                    phpUrl = ipVal.toString().trim();
                }
            }
            if (phpUrl.isEmpty()) {
                result.put("success", false);
                result.put("error", "Image Server URL not found (GetLoadData 651)");
                return result;
            }
            if (!phpUrl.endsWith("/")) {
                phpUrl += "/";
            }
            result.put("success", true);
            result.put("imageServerUrl", phpUrl);
            result.put("uploadUrl", phpUrl + "QCFINAL_new.php");
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    /**
     * Saves uploaded image filenames to QCFinalImage table (DB only, no file upload).
     * Called by frontend AFTER it has already uploaded the file directly to the PHP server.
     */
    public Map<String, Object> saveImageRecord(String recNo, String description, String types, List<String> fileNames) {
        Map<String, Object> result = new HashMap<>();
        try {
            if (fileNames == null || fileNames.isEmpty()) {
                result.put("success", false);
                result.put("error", "No file names provided");
                return result;
            }

            // 1. Read existing Image1 string from DB
            String selectSql = "select top 1 Image1 from QCFinalImage where RecNo = ? and Description = ?";
            List<Map<String, Object>> existing = jdbcTemplate.queryForList(selectSql, recNo, description);
            
            String existingImage1 = "";
            if (!existing.isEmpty() && existing.get(0).get("Image1") != null) {
                existingImage1 = existing.get(0).get("Image1").toString().trim();
            }

            // 2. Append new files
            String newFilesStr = String.join(",", fileNames);
            String finalImage1Str = existingImage1.isEmpty() ? newFilesStr : existingImage1 + "," + newFilesStr;

            // 3. UPSERT logic
            if (existing.isEmpty()) {
                String insertSql = "insert into QCFinalImage (RecNo, Types, Description, Image1) values (?, ?, ?, ?)";
                jdbcTemplate.update(insertSql, recNo, types, description, finalImage1Str);
            } else {
                String updateSql = "update QCFinalImage set Image1 = ? where RecNo = ? and Description = ?";
                jdbcTemplate.update(updateSql, finalImage1Str, recNo, description);
            }

            result.put("success", true);
            result.put("fileNames", fileNames);
            result.put("finalImage1Str", finalImage1Str);
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    /**
     * Deletes an image filename from the QCFinalImage table.
     */
    public Map<String, Object> deleteImage(String recNo, String description, String fileName) {
        Map<String, Object> result = new HashMap<>();
        try {
            // Read existing Image1 string from DB
            String selectSql = "select top 1 Image1 from QCFinalImage where RecNo = ? and Description = ?";
            List<Map<String, Object>> existing = jdbcTemplate.queryForList(selectSql, recNo, description);
            
            if (existing.isEmpty() || existing.get(0).get("Image1") == null) {
                result.put("success", false);
                result.put("error", "Record not found");
                return result;
            }

            String existingImage1 = existing.get(0).get("Image1").toString().trim();
            String[] paths = existingImage1.split(",");
            List<String> updatedPaths = new ArrayList<>();
            
            boolean found = false;
            for (String path : paths) {
                String pathTrim = path.trim();
                if (pathTrim.isEmpty()) continue;
                
                int lastSlash = pathTrim.lastIndexOf('/');
                String currentFileName = lastSlash >= 0 ? pathTrim.substring(lastSlash + 1) : pathTrim;
                
                if (currentFileName.equals(fileName)) {
                    found = true;
                } else {
                    updatedPaths.add(pathTrim);
                }
            }

            if (!found) {
                result.put("success", false);
                result.put("error", "Image not found in database");
                return result;
            }

            String finalImage1Str = String.join(",", updatedPaths);
            
            // Note: Even if finalImage1Str is empty, we keep the row and just set Image1 to empty.
            String updateSql = "update QCFinalImage set Image1 = ? where RecNo = ? and Description = ?";
            jdbcTemplate.update(updateSql, finalImage1Str, recNo, description);

            result.put("success", true);
            result.put("finalImage1Str", finalImage1Str);
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    /**
     * Clears all images for a specific RecNo (equivalent to Btnclearimage_Click)
     */
    public Map<String, Object> clearImages(String recNo) {
        Map<String, Object> result = new HashMap<>();
        try {
            String deleteSql = "delete QCFinalImage where RecNo = ?";
            int rowsAffected = jdbcTemplate.update(deleteSql, recNo);
            result.put("success", true);
            result.put("rowsAffected", rowsAffected);
            result.put("message", "All images cleared successfully");
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    private int safeParseInt(Object obj) {
        if (obj == null) return 0;
        try {
            String str = obj.toString().trim();
            if (str.isEmpty()) return 0;
            // Handle float values like "4.0" if they sneak in here
            if (str.contains(".")) {
                return (int) Double.parseDouble(str);
            }
            return Integer.parseInt(str);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private double safeParseDouble(Object obj) {
        if (obj == null) return 0.0;
        try {
            String str = obj.toString().trim();
            if (str.isEmpty()) return 0.0;
            return Double.parseDouble(str);
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    /**
     * Save All — replicate C# Btnsaveall_Click exactly.
     * Flow: Validation → checkpobook → INSERT/UPDATE → checklist → checkpassfail
     *
     * @param poNumber      PO Number (ponumber)
     * @param factory       Factory code (factory)
     * @param inspectorId   Inspector ID (inspectorid)
     * @param planRef       Plan Reference (planref)
     * @param aqlLevel      AQL Level string (aqllv)
     * @param sampleSize    Sample size (samplesize)
     * @param totalQty      Total quantity (txttotalqty)
     * @param insQty        Inspected quantity (edinspecqty)
     * @param cartonNum     Carton numbers pipe-separated (txtctnnumber)
     * @param listcheck1Str Conform checklist indexes pipe-separated
     * @param listcheck2Str Non-conform/SupplierSignature indexes pipe-separated
     * @param listcheck3Str NA/ProductionStatus indexes pipe-separated
     */
    public Map<String, Object> saveAll(
            String poNumber, String factory, String inspectorId, String planRef,
            String aqlLevel, String sampleSize, String totalQty, String insQty,
            String cartonNum, String listcheck1Str, String listcheck2Str, String listcheck3Str) {

        Map<String, Object> result = new java.util.LinkedHashMap<>();

        // ═══════════════════════════════════════════
        // STEP 1: Validation (same as C#)
        // ═══════════════════════════════════════════
        if (inspectorId == null || inspectorId.trim().isEmpty()) {
            result.put("success", false);
            result.put("message", "Pls login user...");
            return result;
        }
        if (aqlLevel == null || aqlLevel.trim().isEmpty()) {
            result.put("success", false);
            result.put("message", "Pls choose AQL Level...");
            return result;
        }
        if (poNumber == null || poNumber.trim().isEmpty()) {
            result.put("success", false);
            result.put("message", "PO Number is empty");
            return result;
        }

        boolean isNew = false;
        String planId = "";
        String recNo = "";

        try {
            // ═══════════════════════════════════════════
            // STEP 1.5: Verify and calculate SampleSize
            // ═══════════════════════════════════════════
            if (sampleSize == null || sampleSize.trim().isEmpty() || sampleSize.trim().equals("0") || sampleSize.trim().equals("null")) {
                String checkSampleSql = "exec DtradeProduction.dbo.QCFinal 'checksamplesize', ?, ?, '', '', '', ''";
                List<Map<String, Object>> sampleResult = jdbcTemplate.queryForList(checkSampleSql, aqlLevel, totalQty != null ? totalQty : "0");
                if (!sampleResult.isEmpty() && sampleResult.get(0).values().iterator().hasNext()) {
                    Object val = sampleResult.get(0).values().iterator().next();
                    if (val != null) {
                        sampleSize = val.toString();
                    }
                }
            }

            if (insQty == null || insQty.trim().isEmpty() || insQty.trim().equals("0") || insQty.trim().equals("null")) {
                insQty = sampleSize;
            }

            // ═══════════════════════════════════════════
            // STEP 2: checkpobook → get planId
            // C# line 3389: planid = CSDL.Doc("DtradeProduction.dbo.QCFinal 'checkpobook'...")
            // ═══════════════════════════════════════════
            planId = getPlanId(poNumber, factory, inspectorId, planRef);

            if (planId == null || planId.isEmpty()) {
                // ═══════════════════════════════════════════
                // STEP 3a: planId is EMPTY → CREATE NEW
                // ═══════════════════════════════════════════
                isNew = true;

                // Calculate carton count from cartonNum string (C#: txtctnnumber.Text.Split('|').Length)
                int cartonCount = 0;
                if (cartonNum != null && !cartonNum.trim().isEmpty()) {
                    cartonCount = cartonNum.split("\\|").length;
                }

                // SQL #2: INSERT InlineFGsWHPlanBook
                String insertPlanBook = "INSERT INTO DtradeProduction.dbo.InlineFGsWHPlanBook " +
                        "(Factory, PONo, ShipNo, AQLPlan, AQLSample, AQLCTN, Status, CreatedBy, SysCreateDate, PlanDate, JobNo) " +
                        "VALUES (?, ?, '1', ?, ?, ?, 'Book', ?, getdate(), getdate(), ?)";
                jdbcTemplate.update(insertPlanBook,
                        factory != null ? factory : "",
                        poNumber,
                        aqlLevel,
                        sampleSize != null ? sampleSize : "",
                        cartonCount,
                        inspectorId,
                        planRef != null ? planRef : "");

                // SQL #1 again: checkpobook → get newly created planId
                planId = getPlanId(poNumber, factory, inspectorId, planRef);

                if (planId != null && !planId.isEmpty()) {
                    // SQL #3: INSERT InlineFGsWHInspector
                    String insertInspector = "INSERT INTO DtradeProduction.dbo.InlineFGsWHInspector " +
                            "(PlanID, Inspector, InsQty) VALUES (?, ?, ?)";
                    jdbcTemplate.update(insertInspector, planId, inspectorId,
                            totalQty != null ? totalQty : "");

                    // SQL #4: INSERT QCFinalReport
                    String insertReport = "INSERT INTO DtradeProduction.dbo.QCFinalReport " +
                            "(PlanID, InsDate, Inspector, CartonNum, InsQTY, Accpected, Rejected, SysCreateDate) " +
                            "VALUES (?, getdate(), ?, ?, ?, ?, '0', getdate())";
                    jdbcTemplate.update(insertReport, planId, inspectorId,
                            cartonNum != null ? cartonNum : "",
                            insQty != null ? insQty : "0",
                            insQty != null ? insQty : "0");

                    // SQL #5: checkrecno → get recNo
                    recNo = getRecNo(planId, inspectorId);
                }
            } else {
                // ═══════════════════════════════════════════
                // STEP 3b: planId EXISTS → UPDATE
                // ═══════════════════════════════════════════

                // SQL #5: checkrecno → get recNo
                recNo = getRecNo(planId, inspectorId);

                // SQL #6: UPDATE InlineFGsWHPlanBook timestamp
                String updatePlanBook = "UPDATE DtradeProduction.dbo.InlineFGsWHPlanBook " +
                        "SET SysCreateDate = getdate() WHERE PlanID = ?";
                jdbcTemplate.update(updatePlanBook, planId);

                // SQL #7: UPDATE QCFinalReport (keeping C# logic: Accepted = InsQTY)
                String updateReport = "UPDATE DtradeProduction.dbo.QCFinalReport " +
                        "SET InsDate = getdate(), InsQTY = ?, Accpected = ? WHERE RecNo = ?";
                jdbcTemplate.update(updateReport,
                        insQty != null ? insQty : "0",
                        insQty != null ? insQty : "0",
                        recNo);
            }

            // ═══════════════════════════════════════════
            // STEP 4: Re-fetch planId (C# line 3432 — 3rd call to checkpobook)
            // ═══════════════════════════════════════════
            planId = getPlanId(poNumber, factory, inspectorId, planRef);

            // ═══════════════════════════════════════════
            // STEP 5: Classify checklist indexes
            // C# lines 3429-3458
            // listcheck1 indexes: [0..26]
            //   t1 < 9      → listgenadd (t1+1)
            //   t1 > 8 && t1 < 11 → listcheckcartonadd (t1-7) — NOT saved to DB
            //   t1 > 9      → listcheckadd (t1-9)
            // ═══════════════════════════════════════════
            List<Integer> listgenadd = new ArrayList<>();
            List<Integer> listcheckadd = new ArrayList<>();
            // listcheckcartonadd not saved to DB (commented out in C#)

            if (listcheck1Str != null && !listcheck1Str.trim().isEmpty()) {
                String[] parts = listcheck1Str.split("\\|");
                for (String part : parts) {
                    int t1 = safeParseInt(part);
                    if (t1 < 9) {
                        listgenadd.add(t1 + 1);
                    }
                    if (t1 > 9) {
                        listcheckadd.add(t1 - 9);
                    }
                }
            }

            // Build pipe-separated strings
            String generalListStr = listgenadd.stream().map(String::valueOf).collect(java.util.stream.Collectors.joining("|"));
            String checkListStr = listcheckadd.stream().map(String::valueOf).collect(java.util.stream.Collectors.joining("|"));

            // ═══════════════════════════════════════════
            // STEP 6: Save checklist to DB (SQL #8)
            // Only if recNo has value
            // ═══════════════════════════════════════════
            String status = "UNKNOWN";
            if (recNo != null && !recNo.isEmpty()) {
                String updateChecklist = "UPDATE DtradeProduction.dbo.QCFinalReport " +
                        "SET GeneralList = ?, CheckList = ?, Measurment = ?, SupplierSignature = ?, ProductionStatus = ? " +
                        "WHERE RecNo = ?";
                jdbcTemplate.update(updateChecklist,
                        generalListStr,
                        checkListStr,
                        listcheck1Str != null ? listcheck1Str : "",
                        listcheck2Str != null ? listcheck2Str : "",
                        listcheck3Str != null ? listcheck3Str : "",
                        recNo);

                // ═══════════════════════════════════════════
                // STEP 7: checkpassfail() (SQL #9 + #10)
                // ═══════════════════════════════════════════
                status = checkPassFail(poNumber, factory, inspectorId, planRef);
            }

            result.put("success", true);
            result.put("planId", planId);
            result.put("recNo", recNo);
            result.put("isNew", isNew);
            result.put("status", status);
            result.put("message", "Saved successfully");

        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "Error: " + e.getMessage());
        }

        return result;
    }

    /**
     * Formats a date object to ISO string with 'T' separator (yyyy-MM-ddTHH:mm:ss).
     * Handles java.sql.Timestamp, java.util.Date, and plain strings.
     */
    private String formatDateT(Object dateObj) {
        if (dateObj == null) return "";
        String str = dateObj.toString().trim();
        if (str.isEmpty()) return "";
        // If already contains T, just truncate to 19 chars
        if (str.contains("T")) {
            return str.length() > 19 ? str.substring(0, 19) : str;
        }
        // Replace space with T for "yyyy-MM-dd HH:mm:ss" or "yyyy-MM-dd HH:mm:ss.xxx" format
        if (str.length() >= 19) {
            return str.substring(0, 19).replace(" ", "T");
        }
        // Short dates like "yyyy-MM-dd"
        return str.replace(" ", "T");
    }

    /**
     * Generates TRANS4M Pivot88 JSON payload.
     */
    public String generateTrans4mJson(String poNumber, String planRef, String recNo) {
        try {
            // 1. Fetch data
            List<Map<String, Object>> dtTotal = jdbcTemplate.queryForList("EXEC Hr.dbo.PivotGetData_New_Trans4m_CTQ ?, ?", poNumber, planRef);
            List<Map<String, Object>> dtPic = jdbcTemplate.queryForList("exec DtradeProduction.dbo.QCFinal 'getpic', ?, '', '', '', '', ''", recNo);
            List<Map<String, Object>> dtCarton = jdbcTemplate.queryForList("exec DtradeProduction.dbo.QCFinal 'load_CartonBarcode', ?, ?, '', '', '', ''", poNumber, planRef);
            List<Map<String, Object>> dtChecklist = jdbcTemplate.queryForList("exec [Hr].[dbo].[ADynamicApp] 71, ?, '', '', '', '', ''", poNumber);

            // Group dtTotal by Unikey to mimic distinct rows
            Map<String, List<Map<String, Object>>> groupedByUnikey = new java.util.LinkedHashMap<>();
            // Fetch image server URL once
            String phpUrl = "";
            try {
                String getUrlSql = "exec GetLoadData 651, '', ''";
                List<Map<String, Object>> urlRows = jdbcTemplate.queryForList(getUrlSql);
                if (!urlRows.isEmpty() && urlRows.get(0).values().iterator().hasNext()) {
                    phpUrl = urlRows.get(0).values().iterator().next().toString();
                    if (!phpUrl.endsWith("/")) {
                        phpUrl += "/";
                    }
                }
            } catch (Exception e) {
                // ignore
            }

            for (Map<String, Object> row : dtTotal) {
                row.put("imageServerUrl", phpUrl); // Append the image server url
                String unikey = row.get("Unikey") != null ? row.get("Unikey").toString() : "";
                groupedByUnikey.computeIfAbsent(unikey, k -> new ArrayList<>()).add(row);
            }

            List<Map<String, Object>> inspections = new ArrayList<>();

            for (Map.Entry<String, List<Map<String, Object>>> entry : groupedByUnikey.entrySet()) {
                String unikey = entry.getKey();
                List<Map<String, Object>> dt1 = entry.getValue();
                if (dt1.isEmpty()) continue;
                Map<String, Object> r = dt1.get(0); // The distinct master row for this unikey

                // -- PICTURES --
                List<Map<String, Object>> lspicturesall = new ArrayList<>();
                int picNum = 1;
                if (!dtPic.isEmpty() && dtPic.get(0).get("Image") != null) {
                    String imgStr = dtPic.get(0).get("Image").toString();
                    String[] imgs = imgStr.split(",");
                    for (String img : imgs) {
                        String trimImg = img.trim();
                        if (!trimImg.isEmpty()) {
                            int lastSlash = trimImg.lastIndexOf('/');
                            String fileName = lastSlash >= 0 ? trimImg.substring(lastSlash + 1) : trimImg;
                            String title = fileName.contains(".") ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName;
                            
                            Map<String, Object> p = new java.util.LinkedHashMap<>();
                            p.put("title", title);
                            p.put("full_filename", fileName);
                            p.put("number", picNum++);
                            p.put("comment", "");
                            lspicturesall.add(p);
                        }
                    }
                }

                // -- DEFECTS --
                // Group by DefectCode
                Map<String, Map<String, Object>> defectsMap = new java.util.LinkedHashMap<>();
                for (Map<String, Object> r3 : dt1) {
                    String defCode = r3.get("DefectCode") != null ? r3.get("DefectCode").toString() : "";
                    if (!defCode.isEmpty() && !defectsMap.containsKey(defCode)) {
                        List<Map<String, Object>> defPics = new ArrayList<>();
                        String defImage = r3.get("Image1") != null ? r3.get("Image1").toString() : "";
                        if (!defImage.isEmpty()) {
                            String[] dImgs = defImage.split(",");
                            for (String di : dImgs) {
                                String tdi = di.trim();
                                if (!tdi.isEmpty()) {
                                    int ls = tdi.lastIndexOf('/');
                                    String fn = ls >= 0 ? tdi.substring(ls + 1) : tdi;
                                    String title = fn.contains(".") ? fn.substring(0, fn.lastIndexOf('.')) : fn;
                                    Map<String, Object> p = new java.util.LinkedHashMap<>();
                                    p.put("title", title);
                                    p.put("full_filename", fn);
                                    p.put("number", picNum++); // keep incrementing?
                                    p.put("comment", "");
                                    defPics.add(p);
                                }
                            }
                        }

                        Map<String, Object> def = new java.util.LinkedHashMap<>();
                        def.put("label", r3.get("DefectName") != null ? r3.get("DefectName") : "");
                        def.put("subsection", r3.get("DefectSection") != null ? r3.get("DefectSection") : "");
                        def.put("code", defCode);
                        def.put("critical_level", safeParseInt(r3.get("Critical")));
                        def.put("major_level", safeParseInt(r3.get("Major")));
                        def.put("minor_level", safeParseInt(r3.get("Minor")));
                        def.put("comments", "blanks");
                        def.put("pictures", defPics);
                        defectsMap.put(defCode, def);
                    }
                }
                List<Map<String, Object>> lsdefects = new ArrayList<>(defectsMap.values());
                
                // If there are no defects, add a default blank defect object
                if (lsdefects.isEmpty()) {
                    Map<String, Object> dummyDefProd = new java.util.LinkedHashMap<>();
                    dummyDefProd.put("label", ""); dummyDefProd.put("subsection", ""); dummyDefProd.put("code", "");
                    dummyDefProd.put("critical_level", 0); dummyDefProd.put("major_level", 0); dummyDefProd.put("minor_level", 0);
                    dummyDefProd.put("comments", "blanks"); dummyDefProd.put("pictures", new ArrayList<>());
                    lsdefects.add(dummyDefProd);
                }

                // Dummy empty defect for carton
                List<Map<String, Object>> lsdefects_carton = new ArrayList<>();
                Map<String, Object> dummyDefCarton = new java.util.LinkedHashMap<>();
                dummyDefCarton.put("label", ""); dummyDefCarton.put("subsection", ""); dummyDefCarton.put("code", "");
                dummyDefCarton.put("critical_level", 0); dummyDefCarton.put("major_level", 0); dummyDefCarton.put("minor_level", 0);
                dummyDefCarton.put("comments", "blanks"); dummyDefCarton.put("pictures", new ArrayList<>());
                lsdefects_carton.add(dummyDefCarton);

                // -- CARTON BARCODES --
                List<Map<String, Object>> lsCartonBarcode = new ArrayList<>();
                for (Map<String, Object> row : dtCarton) {
                    if (!row.values().isEmpty()) {
                        Object val = row.values().iterator().next();
                        Map<String, Object> b = new java.util.LinkedHashMap<>();
                        b.put("value", val != null ? val.toString() : "");
                        lsCartonBarcode.add(b);
                    }
                }

                // Parse AcRej (e.g. "2/3")
                String acRejStr = r.get("AcRej") != null ? r.get("AcRej").toString() : "0/0";
                int max_minor = 0, max_major = 0, max_critical = 0;
                try {
                    String[] acParts = acRejStr.split("/");
                    if (acParts.length >= 2) {
                        max_minor = safeParseInt(acParts[0]);
                        max_major = safeParseInt(acParts[1]);
                        max_critical = max_minor; // C# logic: Substring(0,1)
                    } else if (acParts.length == 1) {
                        max_minor = max_critical = safeParseInt(acParts[0]);
                    }
                } catch (Exception ignored) {}

                // -- SECTIONS --
                List<Map<String, Object>> lssections = new ArrayList<>();
                // Sec 1 - key order must match C# exactly
                Map<String, Object> sec1 = new java.util.LinkedHashMap<>();
                sec1.put("type", "aqlDefects");
                sec1.put("title", "packing_packaging_labelling");
                sec1.put("section_result_id", safeParseInt(r.get("InsResult")));
                sec1.put("defective_parts", safeParseInt(r.get("AQLDefectiveUnit")));
                sec1.put("qty_inspected", safeParseInt(r.get("InsQty")));
                sec1.put("sampled_inspected", safeParseInt(r.get("SampleInsQTY")));
                sec1.put("inspection_level", r.get("InsLevel"));
                sec1.put("inspection_method", r.get("InsMethod"));
                sec1.put("aql_minor", safeParseDouble(r.get("MinorAQL")));
                sec1.put("aql_major", safeParseDouble(r.get("MajorAQL")));
                sec1.put("aql_critical", safeParseDouble(r.get("CriticalAQL")));
                sec1.put("barcodes", lsCartonBarcode);
                sec1.put("qty_type", "carton");
                sec1.put("max_minor_defects", max_minor);
                sec1.put("max_major_defects", max_major);
                sec1.put("max_critical_defects", max_critical);
                sec1.put("defects", lsdefects_carton);
                lssections.add(sec1);

                // Sec 2
                Map<String, Object> sec2 = new java.util.LinkedHashMap<>();
                sec2.put("type", "aqlDefects");
                sec2.put("title", "product");
                sec2.put("section_result_id", safeParseInt(r.get("InsResult")));
                sec2.put("qty_inspected", safeParseInt(r.get("InsQty")));
                sec2.put("sampled_inspected", safeParseInt(r.get("SampleInsQTY")));
                sec2.put("defective_parts", safeParseInt(r.get("AQLDefectiveUnit")));
                sec2.put("inspection_level", r.get("InsLevel"));
                sec2.put("inspection_method", r.get("InsMethod"));
                sec2.put("aql_minor", safeParseDouble(r.get("MinorAQL")));
                sec2.put("aql_major", safeParseDouble(r.get("MajorAQL")));
                sec2.put("aql_critical", safeParseDouble(r.get("CriticalAQL")));
                sec2.put("max_minor_defects", max_minor);
                sec2.put("max_major_defects", max_major);
                sec2.put("max_critical_defects", max_critical);
                sec2.put("defects", lsdefects);
                lssections.add(sec2);

                // Sec 3
                Map<String, Object> sec3 = new java.util.LinkedHashMap<>();
                sec3.put("type", "pictures");
                sec3.put("title", "photos");
                sec3.put("pictures", lspicturesall);
                lssections.add(sec3);

                // -- ASSIGNMENT ITEMS --
                // C# loops through ALL rows in dt1 (each row = different QtySize/SKU)
                List<Map<String, Object>> lsassignment_items = new ArrayList<>();
                for (Map<String, Object> r5 : dt1) {
                    Map<String, Object> assignmentItem = new java.util.LinkedHashMap<>();
                    assignmentItem.put("sampled_inspected", sec1.get("sampled_inspected"));
                    assignmentItem.put("inspection_result_id", sec1.get("section_result_id"));
                    assignmentItem.put("inspection_status_id", safeParseInt(r5.get("ApprovalStatus")));
                    assignmentItem.put("qty_inspected", safeParseInt(r5.get("QtySize")));
                    
                    String completedDate = formatDateT(r5.get("CompletedDate"));
                    assignmentItem.put("inspection_completed_date", completedDate);
                    
                    assignmentItem.put("total_inspection_minutes", safeParseInt(r5.get("InsDuration")));
                    assignmentItem.put("sampling_size", sec1.get("sampled_inspected"));
                    assignmentItem.put("qty_to_inspect", assignmentItem.get("qty_inspected"));
                    assignmentItem.put("aql_minor", sec1.get("aql_minor"));
                    assignmentItem.put("aql_major", sec1.get("aql_major"));
                    assignmentItem.put("aql_critical", sec1.get("aql_critical"));
                    assignmentItem.put("supplier_booking_msg", "");
                    assignmentItem.put("conclusion_remarks", "");

                    Map<String, Object> assignment = new java.util.LinkedHashMap<>();
                    Map<String, Object> reportType = new java.util.LinkedHashMap<>(); reportType.put("name", r5.get("ReportTypeName"));
                    Map<String, Object> inspector = new java.util.LinkedHashMap<>(); inspector.put("username", r5.get("Inspector"));
                    
                    assignment.put("report_type", reportType);
                    assignment.put("inspector", inspector);
                    assignment.put("date_inspection", formatDateT(r5.get("InsDate")));
                    assignment.put("inspection_level", r5.get("InsLevel"));
                    assignment.put("inspection_method", r5.get("InsMethod"));
                    assignmentItem.put("assignment", assignment);

                    Map<String, Object> poLine = new java.util.LinkedHashMap<>();
                    poLine.put("qty", assignmentItem.get("qty_inspected"));
                    poLine.put("etd", formatDateT(r5.get("ShipDate")));
                    poLine.put("eta", null); poLine.put("color", null); poLine.put("size", null);
                    poLine.put("style", r5.get("Style"));
                    
                    Map<String, Object> poObj = new java.util.LinkedHashMap<>();
                    Map<String, Object> exporter = new java.util.LinkedHashMap<>(); exporter.put("erp_business_id", r5.get("ERPID"));
                    Map<String, Object> importer = new java.util.LinkedHashMap<>(); importer.put("erp_business_id", "Adidas001");
                    Map<String, Object> project = new java.util.LinkedHashMap<>(); project.put("project_code", "APPTRANS4M");
                    poObj.put("exporter", exporter);
                    poObj.put("po_number", r5.get("PONo"));
                    poObj.put("customer_po", r5.get("Label"));
                    poObj.put("importer", importer);
                    poObj.put("project", project);
                    poLine.put("po", poObj);

                    Map<String, Object> sku = new java.util.LinkedHashMap<>();
                    sku.put("sku_number", r5.get("SKU"));
                    sku.put("item_name", r5.get("BuyerItem"));
                    sku.put("item_description", "");
                    poLine.put("sku", sku);
                    
                    assignmentItem.put("po_line", poLine);
                    lsassignment_items.add(assignmentItem);
                }

                // -- PASS/FAILS (CHECKLIST) --
                List<Map<String, Object>> lspassFails = new ArrayList<>();
                Map<String, Object> pf1 = new java.util.LinkedHashMap<>();
                pf1.put("title", "inspected_carton_numbers");
                pf1.put("type", "list");
                pf1.put("subsection", "actual_inspection");
                List<Map<String, Object>> lsValue = new ArrayList<>();
                String cartonNumStr = r.get("CartonNum") != null ? r.get("CartonNum").toString() : "";
                if (!cartonNumStr.isEmpty()) {
                    String[] cnums = cartonNumStr.split("\\|");
                    for (String cnum : cnums) {
                        int val = safeParseInt(cnum);
                        Map<String, Object> lv = new java.util.LinkedHashMap<>(); 
                        lv.put("value", val);
                        lsValue.add(lv);
                    }
                }
                pf1.put("listValues", lsValue);
                lspassFails.add(pf1);

                for (Map<String, Object> dr : dtChecklist) {
                    Map<String, Object> pf2 = new java.util.LinkedHashMap<>();
                    pf2.put("title", dr.get("title"));
                    String ss = dr.get("ss_") != null ? dr.get("ss_").toString() : "0";
                    boolean isNa = !ss.equals("0");
                    pf2.put("value", isNa ? "N/A" : "Yes");
                    pf2.put("type", dr.get("type") != null ? dr.get("type").toString().replace(" ", "") : "");
                    pf2.put("subsection", dr.get("subsection"));
                    pf2.put("checkListSubsection", dr.get("checklist_subsection"));
                    pf2.put("status", isNa ? "na" : "pass");
                    pf2.put("comment", "");
                    lspassFails.add(pf2);
                }

                // -- ROOT --
                Map<String, Object> sJson = new java.util.LinkedHashMap<>();
                sJson.put("unique_key", unikey);
                sJson.put("status", "Submitted");
                sJson.put("date_started", formatDateT(r.get("PlanDate")));
                
                sJson.put("defective_parts", sec1.get("defective_parts"));
                sJson.put("sections", lssections);
                sJson.put("assignment_items", lsassignment_items);
                sJson.put("passFails", lspassFails);

                inspections.add(sJson);
            }

            Map<String, Object> finalPayload = new java.util.LinkedHashMap<>();
            finalPayload.put("inspections", inspections);

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(finalPayload);
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\": \"Failed to generate JSON: " + e.getMessage() + "\"}";
        }
    }

    /**
     * Marks a PO as "(Fail)" in InlineFGsWHPlanBook table.
     * <p>
     * C# equivalent: Btnclearpo_Click (line 1574):
     * <pre>
     *   UPDATE DtradeProduction.dbo.InlineFGsWHPlanBook
     *   SET PONo = '[poNumber](Fail)'
     *   WHERE PlanID = [planId] AND JobNo = '[planRef]' AND PONo = '[poNumber]'
     * </pre>
     * <p>
     * This effectively "soft-deletes" the inspection plan by appending "(Fail)" to the PO number,
     * making it no longer match during lookups.
     *
     * @param poNumber The PO number
     * @param planId   The Plan ID
     * @param planRef  The Plan Reference (JobNo)
     * @return Map with success/message
     */
    public Map<String, Object> clearPo(String poNumber, String planId, String planRef) {
        Map<String, Object> result = new HashMap<>();
        try {
            if (planId == null || planId.trim().isEmpty()) {
                result.put("success", true);
                result.put("message", "PO chưa có dữ liệu trên hệ thống, đã xóa bộ đệm cục bộ.");
                result.put("rowsAffected", 0);
                return result;
            }

            String sql = "UPDATE DtradeProduction.dbo.InlineFGsWHPlanBook " +
                         "SET PONo = ? " +
                         "WHERE PlanID = ? AND JobNo = ? AND PONo = ?";
            String failPo = poNumber + "(Fail)";
            int rows = jdbcTemplate.update(sql, failPo, Integer.parseInt(planId), planRef != null ? planRef : "", poNumber);

            if (rows > 0) {
                result.put("success", true);
                result.put("message", "Đã clear PO: " + poNumber + " → " + failPo);
                result.put("rowsAffected", rows);
            } else {
                result.put("success", true);
                result.put("message", "Không tìm thấy record trên hệ thống, đã xóa bộ đệm cục bộ.");
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Lỗi: " + e.getMessage());
        }
        return result;
    }

    /**
     * Loads Moisture data for a given RecNo.
     */
    public List<Map<String, Object>> loadMoisture(String recNo) {
        if (recNo == null || recNo.trim().isEmpty()) return new ArrayList<>();
        String sql = "SELECT CTNNo, FabricComposition, G_Top, G_Mid, G_Bot, C_In, C_Out, Mate_Standard, Carton_Standard " +
                     "FROM DtradeProduction.dbo.QcfinalMoisture_NEW WHERE RecNo = ?";
        return jdbcTemplate.queryForList(sql, recNo);
    }

    /**
     * Saves Moisture data. If data exists for the RecNo, deletes and inserts to match the UI perfectly.
     */
    public void saveMoisture(String recNo, List<Map<String, String>> rows) {
        if (recNo == null || recNo.trim().isEmpty() || rows == null || rows.isEmpty()) return;

        // Check if any records exist for this RecNo
        String checkSql = "SELECT COUNT(*) FROM DtradeProduction.dbo.QcfinalMoisture_NEW WHERE RecNo = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, recNo);

        if (count != null && count > 0) {
            String deleteSql = "DELETE FROM DtradeProduction.dbo.QcfinalMoisture_NEW WHERE RecNo = ?";
            jdbcTemplate.update(deleteSql, recNo);
        }

        String insertSql = "INSERT INTO DtradeProduction.dbo.QcfinalMoisture_NEW " +
                "(RecNo, CTNNo, FabricComposition, G_Top, G_Mid, G_Bot, C_In, C_Out, Mate_Standard, Carton_Standard, SysCreatedDate) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE())";

        List<Object[]> batchArgs = new ArrayList<>();
        for (Map<String, String> row : rows) {
            batchArgs.add(new Object[] {
                recNo,
                row.getOrDefault("ctnNo", ""),
                row.getOrDefault("fabricComposition", ""),
                row.getOrDefault("gTop", ""),
                row.getOrDefault("gMid", ""),
                row.getOrDefault("gBot", ""),
                row.getOrDefault("cIn", ""),
                row.getOrDefault("cOut", ""),
                row.getOrDefault("mateStandard", ""),
                row.getOrDefault("cartonStandard", "")
            });
        }
        jdbcTemplate.batchUpdate(insertSql, batchArgs);
    }

    /**
     * Loads PO Inspection Today (checkposubmit)
     */
    public List<Map<String, Object>> getPoToday(String factory) {
        String sql = "exec DtradeProduction.dbo.QCFinal 'checkposubmit', ?, '', '', '', '', ''";
        return jdbcTemplate.queryForList(sql, factory != null ? factory : "");
    }
    public List<Map<String, Object>> getMoistureReport(String factory, String fromDate, String toDate) {
        String sql = "exec DtradeProduction.dbo.QCFinal 'moistute_all', ?, ?, ?, '', '', ''";
        try {
            return jdbcTemplate.queryForList(sql, factory, fromDate, toDate);
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public List<Map<String, Object>> getInspectionReport(String factory, String fromDate, String toDate) {
        String sql = "exec DtradeProduction.dbo.QCFinal 'report_excel', ?, ?, ?, '', '', ''";
        try {
            return jdbcTemplate.queryForList(sql, factory, fromDate, toDate);
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public List<Map<String, Object>> getCtqReport(String factory, String fromDate, String toDate) {
        String sql = "exec DtradeProduction.dbo.QCFinal 'reportCTQ', ?, ?, ?, '', '', ''";
        try {
            return jdbcTemplate.queryForList(sql, factory, fromDate, toDate);
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}

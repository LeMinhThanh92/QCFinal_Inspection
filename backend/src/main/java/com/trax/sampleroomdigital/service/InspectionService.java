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
            if (!urlResult.isEmpty() && urlResult.get(0).values().iterator().hasNext()) {
                serverUrl = urlResult.get(0).values().iterator().next().toString();
                if (!serverUrl.endsWith("/")) {
                    serverUrl += "/";
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
            String sql = "exec DtradeProduction.dbo.QCFinal 'checkpobook', ?, ?, ?, ?, '', ''";
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
        return userId; // Fallback to userId
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
            String planIdSql = "exec DtradeProduction.dbo.QCFinal 'checkpobook', ?, ?, ?, ?, '', ''";
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
}

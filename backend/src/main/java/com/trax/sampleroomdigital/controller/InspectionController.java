package com.trax.sampleroomdigital.controller;

import com.trax.sampleroomdigital.dto.ApiResponse;
import com.trax.sampleroomdigital.service.InspectionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inspection")
public class InspectionController {

    private final InspectionService inspectionService;

    public InspectionController(InspectionService inspectionService) {
        this.inspectionService = inspectionService;
    }

    @GetMapping("/search-po")
    public ApiResponse<List<Map<String, Object>>> searchPo(
            @RequestParam("poNumber") String poNumber,
            @RequestParam("factory") String factory
    ) {
        List<Map<String, Object>> result = inspectionService.searchPo(poNumber, factory);
        return ApiResponse.success(result);
    }

    @GetMapping("/defect-types")
    public ApiResponse<List<Map<String, Object>>> getDefectTypes() {
        List<Map<String, Object>> result = inspectionService.loadDefectTypes();
        return ApiResponse.success(result);
    }

    @GetMapping("/defect-codes")
    public ApiResponse<List<Map<String, Object>>> getDefectCodes(@RequestParam("type") String type) {
        List<Map<String, Object>> result = inspectionService.loadDefectCodes(type);
        return ApiResponse.success(result);
    }

    @GetMapping("/load-images")
    public ApiResponse<List<Map<String, Object>>> loadImages(
            @RequestParam("poNumber") String poNumber,
            @RequestParam("planRef") String planRef
    ) {
        List<Map<String, Object>> result = inspectionService.loadImages(poNumber, planRef);
        return ApiResponse.success(result);
    }

    @GetMapping("/load-recorded-defects")
    public ApiResponse<List<Map<String, Object>>> loadRecordedDefects(@RequestParam("recNo") String recNo) {
        List<Map<String, Object>> result = inspectionService.loadRecordedDefects(recNo);
        return ApiResponse.success(result);
    }

    @GetMapping("/check-pass-fail")
    public ApiResponse<String> checkPassFail(
            @RequestParam("poNumber") String poNumber,
            @RequestParam(value = "factory", defaultValue = "") String factory,
            @RequestParam(value = "inspectorId", defaultValue = "") String inspectorId,
            @RequestParam(value = "planRef", defaultValue = "") String planRef
    ) {
        String result = inspectionService.checkPassFail(poNumber, factory, inspectorId, planRef);
        return ApiResponse.success(result);
    }

    @GetMapping("/get-plan-id")
    public ApiResponse<String> getPlanId(
            @RequestParam("poNumber") String poNumber,
            @RequestParam(value = "factory", defaultValue = "") String factory,
            @RequestParam(value = "inspectorId", defaultValue = "") String inspectorId,
            @RequestParam(value = "planRef", defaultValue = "") String planRef
    ) {
        String planId = inspectionService.getPlanId(poNumber, factory, inspectorId, planRef);
        return ApiResponse.success(planId);
    }

    @GetMapping("/get-inspector-id")
    public ApiResponse<String> getInspectorId(@RequestParam("userId") String userId) {
        String inspectorId = inspectionService.getInspectorId(userId);
        return ApiResponse.success(inspectorId);
    }

    @GetMapping("/get-rec-no")
    public ApiResponse<String> getRecNo(
            @RequestParam("planId") String planId,
            @RequestParam("inspectorId") String inspectorId
    ) {
        String recNo = inspectionService.getRecNo(planId, inspectorId);
        return ApiResponse.success(recNo);
    }

    @PostMapping("/update-carton-num")
    public ApiResponse<Boolean> updateCartonNum(
            @RequestParam("recNo") String recNo,
            @RequestParam("cartonNum") String cartonNum
    ) {
        boolean result = inspectionService.updateCartonNum(recNo, cartonNum);
        return ApiResponse.success(result);
    }

    @GetMapping("/load-ctn")
    public ApiResponse<String> loadCtn(
            @RequestParam("poNumber") String poNumber,
            @RequestParam(value = "planRef", defaultValue = "") String planRef
    ) {
        String cartonNum = inspectionService.loadCtn1(poNumber, planRef);
        return ApiResponse.success(cartonNum);
    }

    @GetMapping("/load-operations")
    public ApiResponse<List<Map<String, Object>>> loadOperations(@RequestParam("poNumber") String poNumber) {
        List<Map<String, Object>> result = inspectionService.loadOperations(poNumber);
        return ApiResponse.success(result);
    }

    @PostMapping("/add-defect")
    public ApiResponse<Map<String, Object>> addDefect(
            @RequestParam("recNo") String recNo,
            @RequestParam("poNumber") String poNumber,
            @RequestParam("defCode") String defCode,
            @RequestParam("defDescription") String defDescription,
            @RequestParam(value = "major", defaultValue = "1") int major,
            @RequestParam(value = "operation", defaultValue = "") String operation
    ) {
        Map<String, Object> result = inspectionService.addDefect(recNo, poNumber, defCode, defDescription, major, operation);
        return ApiResponse.success(result);
    }

    @PostMapping("/delete-defect")
    public ApiResponse<Map<String, Object>> deleteDefect(
            @RequestParam("recNo") String recNo,
            @RequestParam("defDescription") String defDescription
    ) {
        Map<String, Object> result = inspectionService.deleteDefect(recNo, defDescription);
        return ApiResponse.success(result);
    }

    @GetMapping("/get-image-server-url")
    public ApiResponse<Map<String, Object>> getImageServerUrl() {
        Map<String, Object> result = inspectionService.getImageServerUrl();
        return ApiResponse.success(result);
    }

    @PostMapping("/save-image-record")
    public ApiResponse<Map<String, Object>> saveImageRecord(
            @RequestParam("recNo") String recNo,
            @RequestParam("description") String description,
            @RequestParam("types") String types,
            @RequestParam("fileNames") List<String> fileNames
    ) {
        Map<String, Object> result = inspectionService.saveImageRecord(recNo, description, types, fileNames);
        return ApiResponse.success(result);
    }

    @PostMapping("/delete-image")
    public ApiResponse<Map<String, Object>> deleteImage(
            @RequestParam("recNo") String recNo,
            @RequestParam("description") String description,
            @RequestParam("fileName") String fileName
    ) {
        Map<String, Object> result = inspectionService.deleteImage(recNo, description, fileName);
        return ApiResponse.success(result);
    }

    @PostMapping("/clear-images")
    public ApiResponse<Map<String, Object>> clearImages(
            @RequestParam("recNo") String recNo
    ) {
        Map<String, Object> result = inspectionService.clearImages(recNo);
        return ApiResponse.success(result);
    }

    @PostMapping("/save-all")
    public ApiResponse<Map<String, Object>> saveAll(@org.springframework.web.bind.annotation.RequestBody Map<String, String> body) {
        Map<String, Object> result = inspectionService.saveAll(
            body.getOrDefault("poNumber", ""),
            body.getOrDefault("factory", ""),
            body.getOrDefault("inspectorId", ""),
            body.getOrDefault("planRef", ""),
            body.getOrDefault("aqlLevel", ""),
            body.getOrDefault("sampleSize", ""),
            body.getOrDefault("totalQty", ""),
            body.getOrDefault("insQty", ""),
            body.getOrDefault("cartonNum", ""),
            body.getOrDefault("checklistConform", ""),
            body.getOrDefault("checklistNonConform", ""),
            body.getOrDefault("checklistNA", "")
        );
        return ApiResponse.success(result);
    }

    @GetMapping("/export-trans4m-json")
    public org.springframework.http.ResponseEntity<byte[]> exportTrans4mJson(
            @RequestParam("poNumber") String poNumber,
            @RequestParam("planRef") String planRef,
            @RequestParam("recNo") String recNo
    ) {
        String jsonPayload = inspectionService.generateTrans4mJson(poNumber, planRef, recNo);
        
        if (jsonPayload.contains("\"error\":")) {
            return org.springframework.http.ResponseEntity.internalServerError().body(jsonPayload.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }

        String fileName = "JsonTest_AQLOutbound_" + poNumber + "_" + new java.text.SimpleDateFormat("yyyyMMddHHmmss").format(new java.util.Date()) + ".json";

        return org.springframework.http.ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8")
                .body(jsonPayload.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }
}

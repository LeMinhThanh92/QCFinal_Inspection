package com.trax.sampleroomdigital.controller;

import com.trax.sampleroomdigital.dto.ApiResponse;
import com.trax.sampleroomdigital.service.InspectionService;
import org.springframework.web.bind.annotation.GetMapping;
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
}

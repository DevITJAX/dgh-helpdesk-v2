package ma.gov.dgh.helpdesk.controller;

import ma.gov.dgh.helpdesk.service.DatabaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Database management operations
 */
@RestController
@RequestMapping("/api/database")
@CrossOrigin(origins = "http://localhost:4200")
@PreAuthorize("hasRole('ADMIN')")
public class DatabaseController {
    
    private final DatabaseService databaseService;
    
    @Autowired
    public DatabaseController(DatabaseService databaseService) {
        this.databaseService = databaseService;
    }
    
    /**
     * Get database statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<DatabaseService.DatabaseStatistics> getDatabaseStatistics() {
        DatabaseService.DatabaseStatistics statistics = databaseService.getDatabaseStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    /**
     * Validate database schema
     */
    @GetMapping("/validate")
    public ResponseEntity<DatabaseService.DatabaseValidationResult> validateDatabase() {
        DatabaseService.DatabaseValidationResult result = databaseService.validateDatabaseSchema();
        return ResponseEntity.ok(result);
    }
    
    /**
     * Clean up old data
     */
    @PostMapping("/cleanup")
    public ResponseEntity<DatabaseService.CleanupResult> cleanupOldData(
            @RequestParam(defaultValue = "90") int daysToKeep) {
        DatabaseService.CleanupResult result = databaseService.cleanupOldData(daysToKeep);
        return ResponseEntity.ok(result);
    }
    
    /**
     * Backup database
     */
    @PostMapping("/backup")
    public ResponseEntity<DatabaseService.BackupResult> backupDatabase(
            @RequestParam String backupPath) {
        DatabaseService.BackupResult result = databaseService.backupDatabase(backupPath);
        return ResponseEntity.ok(result);
    }
}

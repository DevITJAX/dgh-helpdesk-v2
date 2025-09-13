package ma.gov.dgh.helpdesk.repository;

import ma.gov.dgh.helpdesk.entity.CommentType;
import ma.gov.dgh.helpdesk.entity.Ticket;
import ma.gov.dgh.helpdesk.entity.TicketComment;
import ma.gov.dgh.helpdesk.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for TicketComment entity operations
 */
@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {
    
    /**
     * Find comments by ticket
     */
    List<TicketComment> findByTicket(Ticket ticket);
    
    /**
     * Find comments by ticket ordered by creation date
     */
    List<TicketComment> findByTicketOrderByCreatedAtAsc(Ticket ticket);
    
    /**
     * Find comments by ticket ID
     */
    List<TicketComment> findByTicketId(Long ticketId);
    
    /**
     * Find comments by ticket ID ordered by creation date
     */
    List<TicketComment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
    
    /**
     * Find comments by user
     */
    List<TicketComment> findByUser(User user);
    
    /**
     * Find comments by user ID
     */
    List<TicketComment> findByUserId(Long userId);
    
    /**
     * Find internal comments by ticket
     */
    List<TicketComment> findByTicketAndIsInternalTrue(Ticket ticket);
    
    /**
     * Find public comments by ticket
     */
    List<TicketComment> findByTicketAndIsInternalFalse(Ticket ticket);
    
    /**
     * Find comments by comment type
     */
    List<TicketComment> findByCommentType(CommentType commentType);
    
    /**
     * Find comments by ticket and comment type
     */
    List<TicketComment> findByTicketAndCommentType(Ticket ticket, CommentType commentType);
    
    /**
     * Find comments created in a date range
     */
    List<TicketComment> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find comments with attachments
     */
    List<TicketComment> findByAttachmentPathIsNotNull();
    
    /**
     * Find comments by ticket with attachments
     */
    List<TicketComment> findByTicketAndAttachmentPathIsNotNull(Ticket ticket);
    
    /**
     * Count comments by ticket
     */
    long countByTicket(Ticket ticket);
    
    /**
     * Count comments by ticket ID
     */
    long countByTicketId(Long ticketId);
    
    /**
     * Count comments by user
     */
    long countByUser(User user);
    
    /**
     * Count internal comments by ticket
     */
    long countByTicketAndIsInternalTrue(Ticket ticket);
    
    /**
     * Count public comments by ticket
     */
    long countByTicketAndIsInternalFalse(Ticket ticket);
    
    /**
     * Find comments with pagination
     */
    Page<TicketComment> findByTicketOrderByCreatedAtAsc(Ticket ticket, Pageable pageable);
    
    /**
     * Find comments by ticket ID with pagination
     */
    Page<TicketComment> findByTicketIdOrderByCreatedAtAsc(Long ticketId, Pageable pageable);
    
    /**
     * Find latest comment by ticket
     */
    @Query("SELECT tc FROM TicketComment tc WHERE tc.ticket = :ticket ORDER BY tc.createdAt DESC LIMIT 1")
    TicketComment findLatestCommentByTicket(@Param("ticket") Ticket ticket);
    
    /**
     * Find latest comment by ticket ID
     */
    @Query("SELECT tc FROM TicketComment tc WHERE tc.ticket.id = :ticketId ORDER BY tc.createdAt DESC LIMIT 1")
    TicketComment findLatestCommentByTicketId(@Param("ticketId") Long ticketId);
    
    /**
     * Find comments by user in date range
     */
    List<TicketComment> findByUserAndCreatedAtBetween(User user, LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find system comments by ticket
     */
    List<TicketComment> findByTicketAndCommentTypeOrderByCreatedAtAsc(Ticket ticket, CommentType commentType);
    
    /**
     * Find recent comments across all tickets
     */
    @Query("SELECT tc FROM TicketComment tc ORDER BY tc.createdAt DESC")
    List<TicketComment> findRecentComments(Pageable pageable);
    
    /**
     * Get comment statistics by user
     */
    @Query("SELECT tc.user, COUNT(tc) FROM TicketComment tc GROUP BY tc.user ORDER BY COUNT(tc) DESC")
    List<Object[]> getCommentStatsByUser();
    
    /**
     * Get comment statistics by date
     */
    @Query("SELECT tc.createdAt, COUNT(tc) FROM TicketComment tc WHERE tc.createdAt BETWEEN :startDate AND :endDate GROUP BY tc.createdAt ORDER BY tc.createdAt")
    List<Object[]> getCommentStatsByDate(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    /**
     * Delete comments by ticket
     */
    void deleteByTicket(Ticket ticket);
    
    /**
     * Delete comments by ticket ID
     */
    void deleteByTicketId(Long ticketId);
}

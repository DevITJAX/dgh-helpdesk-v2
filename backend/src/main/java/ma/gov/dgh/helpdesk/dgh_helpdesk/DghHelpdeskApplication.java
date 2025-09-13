package ma.gov.dgh.helpdesk.dgh_helpdesk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for DGH HelpDesk System
 *
 * This application provides:
 * - IT helpdesk ticket management
 * - Automated network equipment discovery
 * - LDAP authentication integration
 * - Equipment inventory management
 */
@SpringBootApplication
@ComponentScan(basePackages = "ma.gov.dgh.helpdesk")
@EntityScan(basePackages = "ma.gov.dgh.helpdesk.entity")
@EnableJpaRepositories(basePackages = "ma.gov.dgh.helpdesk.repository")
@EnableAsync
@EnableScheduling
public class DghHelpdeskApplication {

	public static void main(String[] args) {
		SpringApplication.run(DghHelpdeskApplication.class, args);
	}

}

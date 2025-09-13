package ma.gov.dgh.helpdesk.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Configuration for async processing and scheduling
 */
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {
    
    /**
     * Task executor for async operations
     */
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("DGH-Async-");
        executor.initialize();
        return executor;
    }
    
    /**
     * Task executor specifically for network discovery
     */
    @Bean(name = "networkDiscoveryExecutor")
    public Executor networkDiscoveryExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(3);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("DGH-Discovery-");
        executor.initialize();
        return executor;
    }
}

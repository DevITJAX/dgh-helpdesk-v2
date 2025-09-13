# --- Build stage ---
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
# Copy only pom first for dependency cache
COPY pom.xml ./
RUN mvn -q -DskipTests dependency:go-offline
# Copy sources
COPY src ./src
# Build jar
RUN mvn -q -DskipTests package

# --- Runtime stage ---
FROM eclipse-temurin:17-jre-alpine
# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring
WORKDIR /app
# Copy fat jar
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseContainerSupport"
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]

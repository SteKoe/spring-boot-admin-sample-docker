FROM openjdk:17
LABEL org.opencontainers.image.authors="codecentric <spring-boot-admin@codecentric.de>"

COPY target/app.jar /usr/share/codecentric/app.jar
RUN mkdir -p /usr/share/codecentric/conf
EXPOSE 8080

ENTRYPOINT ["java", "-Dspring.config.additional-location=/usr/share/codecentric/conf/", "-jar", "/usr/share/codecentric/app.jar"]

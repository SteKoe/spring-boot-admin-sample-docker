FROM openjdk:@@JAVA_VERSION@@
LABEL org.opencontainers.image.authors="codecentric <spring-boot-admin@codecentric.de>"

RUN groupadd -r -g 2000 sba && useradd -m -d /home/sba/ -s /bin/bash -u 2000 -r -g sba sba

COPY target/app.jar /usr/share/codecentric/app.jar
RUN mkdir -p /usr/share/codecentric/conf

RUN chown -R sba:sba /usr/share/codecentric

USER sba

EXPOSE 8080
ENTRYPOINT ["java", "-Dspring.config.additional-location=/usr/share/codecentric/conf/", "-jar", "/usr/share/codecentric/app.jar"]

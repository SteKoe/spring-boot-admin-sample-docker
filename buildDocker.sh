#!/bin/bash
getVersion() {
    local version
    version=$(awk -F '[<>]' '/<spring-boot-admin.version>/{print $3; exit}' "./pom.xml")
    echo "$version"
}

buildAndPushDockerImage() {
      local version
      version=$(getVersion)

      docker buildx build \
          --push \
          --platform=linux/amd64,linux/arm64 \
          --tag "codecentric/spring-boot-admin:$version" \
          .
}

mvn clean package && buildAndPushDockerImage

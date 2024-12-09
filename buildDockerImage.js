#!/bin/env node
import {Command} from 'commander';
import configs from './spring-boot-admin.config.json' with {type: 'json'};
import {execSync} from 'child_process';

function buildDockerImageForVersion(version) {
    let config = configs.find(c => c.sbaVersion === version);

    if (!config) {
        throw new Error(`No configuration found for version: ${version}`);
    }

    console.log(`Building docker image for version: ${version}`);
    
    process.env.SPRING_BOOT_VERSION = config.springBootVersion;
    process.env.SPRING_BOOT_ADMIN_VERSION = config.sbaVersion;
    process.env.SPRING_CLOUD_VERSION = config.springCloudVersion;
    process.env.JAVA_VERSION = config.javaVersion;

    try {
        execSync(`
            sed -e "s/@@SPRING_BOOT_VERSION@@/\${SPRING_BOOT_VERSION}/g" \\
                -e "s/@@JAVA_VERSION@@/\${JAVA_VERSION}/g" \\
                -e "s/@@SPRING_BOOT_ADMIN_VERSION@@/\${SPRING_BOOT_ADMIN_VERSION}/g" \\
                -e "s/@@SPRING_CLOUD_VERSION@@/\${SPRING_CLOUD_VERSION}/g" \\
                pom.template.xml > pom.xml
        `)
        
        execSync(`
            sed -e "s/@@JAVA_VERSION@@/\${JAVA_VERSION}/g" \\
                template.Dockerfile > Dockerfile
        `)
        
        execSync('mvn clean package -DskipTests');

        execSync(`
            docker buildx build \\
              --push \\
              --platform=linux/amd64,linux/arm64 \\
              --tag "codecentric/spring-boot-admin:${config.sbaVersion}" \\
              .
        `)
    } catch (e) {
        console.error(`Failed to build docker image for version: ${version}`);
        console.error(e.output.toString());
        process.exit(1);
    }
}

function main() {
    const program = new Command();

    program
        .requiredOption('-v, --version <version>', 'The SBA version to build a docker image for')

    program.showHelpAfterError();
    program.showSuggestionAfterError();
    program.parse();

    const options = program.opts();

    buildDockerImageForVersion(options.version);
}

main()
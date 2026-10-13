FROM eclipse-temurin:21

WORKDIR /tmp

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

ARG JACKSON_VERSION=2.18.3

RUN mkdir -p /opt/codearena/lib \
    && curl -fsSL \
       "https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-annotations/${JACKSON_VERSION}/jackson-annotations-${JACKSON_VERSION}.jar" \
       -o /opt/codearena/lib/jackson-annotations.jar \
    && curl -fsSL \
       "https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-core/${JACKSON_VERSION}/jackson-core-${JACKSON_VERSION}.jar" \
       -o /opt/codearena/lib/jackson-core.jar \
    && curl -fsSL \
       "https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-databind/${JACKSON_VERSION}/jackson-databind-${JACKSON_VERSION}.jar" \
       -o /opt/codearena/lib/jackson-databind.jar

ENV CLASSPATH="/opt/codearena/lib/*"

WORKDIR /tmp/codearena
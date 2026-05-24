# Toolbox 全棧單一容器（Zeabur / 雲端部署）
# - 對外只暴露 PORT（Zeabur 注入，通常 8080）
# - Nginx 提供前端，/api/* 轉發至容器內 Spring Boot

FROM node:22-bookworm-slim AS frontend-build
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates fonts-wqy-microhei python3-fonttools \
  && rm -rf /var/lib/apt/lists/*

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ .
RUN node scripts/setup-pdf-font.mjs
RUN npm run build

FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /app

COPY backend/.mvn/ .mvn/
COPY backend/mvnw backend/pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY backend/src ./src
RUN ./mvnw package -DskipTests -B

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends nginx gettext curl \
  && rm -rf /var/lib/apt/lists/* \
  && rm -f /etc/nginx/sites-enabled/default

COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY --from=backend-build /app/target/*.jar /app/backend.jar

COPY docker/zeabur/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker/zeabur/start.sh /start.sh
RUN chmod +x /start.sh

ENV SPRING_PROFILES_ACTIVE=zeabur
ENV PORT=8080
ENV HOST=0.0.0.0
ENV BACKEND_INTERNAL_PORT=8081

EXPOSE 8080

HEALTHCHECK --interval=20s --timeout=5s --retries=10 --start-period=90s \
  CMD curl -fsS "http://127.0.0.1:${PORT:-8080}/" >/dev/null || exit 1

CMD ["/start.sh"]

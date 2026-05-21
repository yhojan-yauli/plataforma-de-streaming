# 🎬 Plataforma de Streaming

Proyecto para el curso de Integrador  

Sistema web tipo **Netflix** que permite a los usuarios visualizar contenido multimedia, gestionar suscripciones y acceder a recomendaciones personalizadas. Incluye un panel administrativo para la gestión de contenido y usuarios.

---

## 🚀 Tecnologías utilizadas

### 🔹 Frontend
- React + Vite  
- Tailwind CSS  
- Axios  
- Autenticación con JWT  

### 🔹 Backend
- Spring Boot  
- Spring Security  
- JWT + OAuth2 (Google)  
- JPA / Hibernate  

### 🔹 Base de datos
- MySQL  

---

## 📁 Estructura del proyecto

plataforma-de-streaming/
│
├── Backend-Streaming/     # API REST (Spring Boot)
├── Frontend-Streaming/    # Frontend (React + Vite)
└── README.md

---

## ⚙️ Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- Java 17 o superior  
- Node.js (v18 o superior)  
- MySQL  
- Git  

---

## ▶️ Instalación y ejecución

### 1️⃣ Clonar el repositorio

git clone https://github.com/yhojan-yauli/plataforma-de-streaming.git  
cd plataforma-de-streaming  

---

## 🧠 Backend (Spring Boot)

### 🔧 Configuración

1. Crear la base de datos en MySQL:

CREATE DATABASE streaming_db;

2. Configurar credenciales en:

Backend-Streaming/src/main/resources/application.properties

Ejemplo:

spring.datasource.url=jdbc:mysql://localhost:3306/streaming_db  
spring.datasource.username=TU_USUARIO  
spring.datasource.password=TU_PASSWORD  

spring.jpa.hibernate.ddl-auto=update  
spring.jpa.show-sql=true  

---

### ▶️ Ejecutar backend

cd Backend-Streaming  
./gradlew bootRun  

El backend se ejecutará en:  
http://localhost:8080  

---

## 🎨 Frontend (React + Vite)

### ▶️ Instalación

cd Frontend-Streaming  
npm install  

---

### ▶️ Ejecutar frontend

npm run dev  

El frontend se ejecutará en:  
http://localhost:5173  

---

## 🔐 Autenticación

El sistema incluye:

- Login con usuario y contraseña (JWT)  
- Login con Google (OAuth2)  
- Manejo de roles:
  - Usuario  
  - Administrador  

---

## 📌 Funcionalidades principales

- Visualización de contenido multimedia  
- Sistema de valoraciones y comentarios  
- Recomendaciones personalizadas  
- Gestión de suscripciones  
- Panel administrativo  

---

## ⚠️ Notas importantes

- Ejecutar primero el backend antes del frontend  
- Verificar que los puertos 8080 y 5173 estén libres  
- Configurar correctamente la base de datos  

---

## 👨‍💻 Autor

**Yhojan Yauli** 
**FransRooswvelt**
**levi**
**** 
Proyecto académico – Ingeniería de Software  


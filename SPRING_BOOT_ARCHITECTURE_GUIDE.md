# PrepWise.AI — Spring Boot Architecture & Interview Guide

This guide is designed to give you **100% confidence** when explaining this project in software engineering interviews (Full-Stack, Backend, or Java/Spring Boot roles).

---

## 1. High-Level System Architecture

```
                                  +---------------------------------------+
                                  |     Vapi.ai Voice Orchestrator       |
                                  | (WebRTC Audio Stream, STT, TTS, VAD)  |
                                  +-------------------+-------------------+
                                                      ^
                                                      | WebRTC Stream
                                                      v
+-----------------------------------------------------+---------------------------------------------------+
|                                            Next.js 16 (App Router)                                     |
|                                       (React 19, TypeScript, Tailwind CSS)                              |
|                                             Runs on localhost:3000                                      |
+-----------------------------------------------------+---------------------------------------------------+
                                                      |
                                                      | HTTP / JSON REST APIs
                                                      v
+---------------------------------------------------------------------------------------------------------+
|                                    Spring Boot 3.4 REST API Service                                     |
|                                             Runs on localhost:8080                                      |
|                                                                                                         |
|  [Controllers]                                                                                          |
|    • AiController          -> POST /api/generate, POST /api/evaluate                                    |
|    • InterviewController   -> GET, POST, DELETE /api/interviews                                         |
|    • HealthController      -> GET /api/health                                                           |
|                                                                                                         |
|  [Service Layer]                                                                                        |
|    • QuestionService       -> Formulates prompt, requests LLM or generates dynamic fallback questions   |
|    • EvaluationService     -> Computes completion metrics, prompts Gemini, executes scoring rubric      |
|    • GeminiService         -> Asynchronous/HTTP REST integration with Google Gemini 1.5 Flash           |
|    • InterviewService      -> Manages interview entity lifecycle and DTO mappings                       |
|                                                                                                         |
|  [Persistence & Config]                                                                                 |
|    • Spring Data JPA + H2 In-Memory DB (with H2 Web Console at /h2-console)                             |
|    • CorsConfig            -> Explicit cross-origin policy allowing Next.js on port 3000                |
|    • GlobalExceptionHandler -> Centralized @RestControllerAdvice returning unified ApiError DTOs       |
+---------------------------------------------------------------------------------------------------------+
                                                      |
                                                      | HTTPS REST Calls
                                                      v
                                  +---------------------------------------+
                                  |       Google Gemini REST API          |
                                  |         (gemini-1.5-flash)            |
                                  +---------------------------------------+
```

---

## 2. Key Architecture Decisions & Design Patterns

### 1. Separation of Voice Orchestration vs. Business Intelligence
* **Why did you not stream audio directly into Spring Boot?**
  > *"WebRTC audio streaming, Voice Activity Detection (VAD), and ultra-low-latency Speech-to-Text require specialized edge infrastructure. Offloading audio streaming to Vapi prevents our Spring Boot application server from becoming a CPU/network bottleneck with audio transcoding. Spring Boot instead acts as the application core: managing business logic, session lifecycle, persistence, and post-interview AI evaluation."*

### 2. Layered (N-Tier) Architecture
* **Controller Layer**: Handles HTTP requests, input deserialization, and HTTP status codes (`HttpStatus.OK`, `HttpStatus.CREATED`, `HttpStatus.NOT_FOUND`).
* **Service Layer**: Contains 100% of the business logic (`EvaluationService`, `QuestionService`, `GeminiService`, `InterviewService`). Services are decoupled from HTTP request objects.
* **Data Access Layer**: `InterviewRepository` extending `JpaRepository<InterviewEntity, String>` providing out-of-the-box CRUD and derived queries (`findAllByOrderByCreatedAtDesc`).
* **DTO Pattern (Data Transfer Objects)**: We never expose JPA Entities directly to the client. We use `InterviewDto`, `GenerateQuestionsRequest`, `EvaluateResponse`, ensuring database schema changes don't break frontend API contracts.

### 3. Graceful Degradation / Resilience Pattern
* **Rule-Based Evaluation Fallback**: If the Gemini API key is missing, network fails, or the AI service throttles, `EvaluationService` falls back to `runRuleBasedEvaluation()`. The candidate still gets an accurate score based on their completion rate, answer length, and participation.
* **Frontend Dual-Targeting**: Next.js attempts to reach the Spring Boot backend (`http://localhost:8080/api/evaluate`); if unreachable, it gracefully handles evaluation internally so the user experience never breaks.

---

## 3. Spring Boot Annotations Explained

When the interviewer asks: *"What Spring annotations did you use and why?"* — walk through these:

| Annotation | Where it's used | What it does |
| :--- | :--- | :--- |
| `@SpringBootApplication` | `PrepwiseBackendApplication` | Meta-annotation combining `@Configuration`, `@EnableAutoConfiguration`, and `@ComponentScan`. Boots up Spring context and autowires all beans. |
| `@RestController` | Controllers | Combines `@Controller` and `@ResponseBody`. Tells Spring every method returns domain objects serialized directly into JSON. |
| `@RequestMapping` | Controllers | Maps web requests to handler classes/methods (e.g., `@RequestMapping("/api/interviews")`). |
| `@Service` | Services | Marks classes as Spring service beans in the business layer, eligible for dependency injection. |
| `@Repository` | Repositories | Marks Spring Data JPA interface as a data repository bean and enables Spring exception translation. |
| `@RequestBody` | Controller methods | Instructs Spring’s `HttpMessageConverter` (Jackson) to deserialize the incoming HTTP JSON payload into Java DTOs. |
| `@PathVariable` | Controller methods | Binds URI path template variables (`/api/interviews/{id}`) to method arguments. |
| `@RestControllerAdvice` | `GlobalExceptionHandler` | Enables centralized, cross-cutting exception handling across all controllers using Aspect-Oriented Programming (AOP). |
| `@ExceptionHandler` | `GlobalExceptionHandler` | Declares which exception classes (`IllegalArgumentException`, `Exception`) a method catches. |
| `@Configuration` | `CorsConfig` | Marks the class as a source of bean definitions and Spring MVC customization (`WebMvcConfigurer`). |
| `@Entity` & `@Table` | `InterviewEntity` | Specifies that the Java class maps to a relational database table managed by Hibernate ORM. |
| `@Value` | `GeminiService` | Injects environment variable values or application properties (`${gemini.api.key:}`). |

---

## 4. Top 10 Technical Interview Questions & Winning Answers

### Q1: "Walk me through the architecture of your mock interview platform."
> **Answer**:
> *"PrepWise is a decoupled full-stack platform. 
> On the frontend, we use Next.js 16 with React 19 and Tailwind CSS. The frontend connects directly to Vapi.ai via WebRTC for real-time, low-latency audio dialogue with our AI interviewer.
> On the backend, we built a Spring Boot 3 REST service in Java. The backend handles the interview lifecycle: generating role-specific questions, managing session records with Spring Data JPA and H2, and orchestrating post-interview evaluations by sending dialogue transcripts to Google Gemini 1.5 Flash via a secure HTTP REST client.
> We implemented clean separation of concerns, the Controller-Service-Repository pattern, DTOs, and global exception handling."*

---

### Q2: "How does the backend integrate with Google Gemini?"
> **Answer**:
> *"Instead of relying on heavy external SDK wrappers, we implemented `GeminiService` using Java's native `HttpClient` and Jackson's `ObjectMapper`. 
> We construct structured JSON requests containing the prompt, system instructions, and temperature, then dispatch them over HTTPS to the Gemini `generateContent` endpoint.
> When the response arrives, Jackson parses the JSON tree, extracts the AI response text, cleans any markdown code fences, and deserializes the score and feedback into our `EvaluateResponse` DTO. If the external call fails or the key is absent, we seamlessly degrade to an algorithmic rule-based evaluation engine."*

---

### Q3: "Why did you use DTOs instead of exposing your JPA Entities directly?"
> **Answer**:
> *"Using DTOs provides loose coupling between our persistence layer and API contracts. 
> Exposing Entities directly can leak sensitive database columns, create circular reference issues during Jackson JSON serialization with bidirectional relationships, and cause unintended database updates. DTOs allow us to version and format API responses specifically for the UI without altering database schemas."*

---

### Q4: "How do you handle Cross-Origin Resource Sharing (CORS)?"
> **Answer**:
> *"Since Next.js runs on port `3000` and Spring Boot runs on port `8080`, browsers enforce same-origin policy. 
> We implemented a `@Configuration` class implementing `WebMvcConfigurer` where we override `addCorsMappings`. We configure allowed origins (`http://localhost:3000`), allowed HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`), allowed headers, and set `allowCredentials(true)` for security."*

---

### Q5: "How is error handling managed across the Spring Boot backend?"
> **Answer**:
> *"We implemented a centralized `GlobalExceptionHandler` annotated with `@RestControllerAdvice`. 
> Rather than using try-catch blocks in every controller, any uncaught exception bubbles up to this advice class. It catches specific exceptions like `IllegalArgumentException` and returns a standardized error payload with HTTP status codes, timestamp, and human-readable messages."*

---

### Q6: "What database did you use and how can it scale to production?"
> **Answer**:
> *"In development, we use an in-memory **H2 relational database** managed through Spring Data JPA and Hibernate. This allows zero-dependency, out-of-the-box local testing with an embedded web console at `/h2-console`.
> Because we wrote standard JPA entities and repository interfaces, migrating to production **PostgreSQL** or **MySQL** requires only updating the JDBC URL, driver, and credentials in `application.properties` — zero code changes to our Java repository or service layer."*

---

### Q7: "How does Dependency Injection (DI) work in your Spring Boot application?"
> **Answer**:
> *"We use **constructor-based dependency injection**, which is the recommended industry standard over field injection (`@Autowired`). 
> For example, `AiController` declares `QuestionService` and `EvaluationService` as `final` constructor parameters. Spring's IoC container automatically resolves and injects these singleton beans at startup. Constructor injection guarantees immutability and makes unit testing effortless with Mockito."*

---

### Q8: "How does the evaluation scoring rubric work?"
> **Answer**:
> *"The candidate's score is evaluated against three core metrics: **Technical Depth**, **Communication Delivery**, and **Overall Readiness**.
> When the interview completes, the transcript is passed to `EvaluationService`. If Gemini is enabled, we pass strict system prompting with few-shot instructions to penalize early exits or single-word answers, while rewarding structured, architectural explanations.
> If running without external AI keys, our fallback engine calculates the candidate answer ratio, average response length, and question coverage to compute realistic scores and actionable study recommendations."*

---

### Q9: "How do you handle configuration and secrets across environments?"
> **Answer**:
> *"We leverage Spring Boot's externalized configuration and environment variable binding. In `application.properties`, we use syntax like:
> `gemini.api.key=${GEMINI_API_KEY:}`
> This allows the application to read the environment variable at runtime in production (Docker, Kubernetes, AWS, or Heroku), while providing default fallback values for local development."*

---

### Q10: "If you had more time, what improvements would you add?"
> **Answer**:
> *"1. **Spring Security & JWT**: Add stateless authentication with JSON Web Tokens and Spring Security filters.
> 2. **WebSocket Audio Streaming**: Introduce STOMP/WebSockets directly in Spring for real-time live telemetry and latency monitoring.
> 3. **Redis Caching**: Cache generated interview question sets by role and level using Spring Cache (`@Cacheable`) to minimize external LLM token costs.
> 4. **Docker Containerization**: Write a multi-stage Dockerfile and `docker-compose.yml` to spin up Next.js, Spring Boot, and PostgreSQL with a single command."*

---

## 5. How to Run & Verify the Full Stack

### Step 1: Start Spring Boot Backend
Open a terminal in the project root:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
* Backend runs at: `http://localhost:8080`
* Health check: `http://localhost:8080/api/health`
* H2 Database Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:prepwise`, User: `sa`, Password: *blank*)

### Step 2: Start Next.js Frontend
Open a second terminal in the project root:
```powershell
npm run dev
```
* Frontend runs at: `http://localhost:3000`

### Step 3: Test Endpoints Directly via PowerShell
```powershell
# 1. Health Check
Invoke-RestMethod -Uri "http://localhost:8080/api/health"

# 2. Generate Interview Questions
Invoke-RestMethod -Uri "http://localhost:8080/api/generate" -Method Post -ContentType "application/json" -Body '{"role":"Java Engineer","level":"Senior","techStack":"Spring Boot, Kafka","questionsCount":3}'

# 3. List Stored Interviews
Invoke-RestMethod -Uri "http://localhost:8080/api/interviews"
```

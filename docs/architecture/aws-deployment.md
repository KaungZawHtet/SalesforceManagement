# AWS Deployment Architecture

This document shows the proposed AWS deployment for the Salesforce Account Manager.

The first implementation phase is intentionally limited to the diagrams below. Terraform, CI/CD, and application deployment changes will be added only after this architecture is approved.

## AWS Infrastructure

```mermaid
flowchart TB
    User["User Browser"]

    subgraph AWS["AWS Account"]
        subgraph VPC["VPC"]
            subgraph Public["Public Subnets"]
                ALB["Application Load Balancer<br/>Internet-facing<br/>Port 80"]
                NAT["NAT Gateway"]
            end

            subgraph Private["Private Subnets<br/>Across 2 Availability Zones"]
                subgraph ECS["Amazon ECS Cluster<br/>AWS Fargate"]
                    FE["Frontend Service<br/>Next.js Container<br/>Port 3001"]
                    BE["Backend Service<br/>NestJS Container<br/>Port 3000"]
                end
            end

            SG["Security Groups<br/>ALB to ECS only"]
        end

        ECRFE["Amazon ECR<br/>Frontend Repository"]
        ECRBE["Amazon ECR<br/>Backend Repository"]
        Secrets["AWS Secrets Manager<br/>Salesforce Client ID<br/>Salesforce Client Secret"]
        LogsFE["CloudWatch Logs<br/>Frontend"]
        LogsBE["CloudWatch Logs<br/>Backend"]
        IAM["IAM Roles<br/>Task Execution Role<br/>Task Role<br/>GitHub OIDC Role"]
        State["S3 Terraform State<br/>Versioning + Encryption<br/>Native State Locking"]
    end

    Salesforce["Salesforce REST API"]
    Terraform["Terraform"]
    GitHub["GitHub Actions"]

    User -->|"HTTP to ALB DNS name"| ALB
    ALB -->|"Default route /"| FE
    ALB -->|"/api/* route"| BE
    FE -->|"Same-origin /api requests"| ALB
    BE -->|"HTTPS OAuth and REST API"| Salesforce

    BE -.->|"Read secrets at startup"| Secrets
    BE -.->|"Outbound HTTPS"| NAT
    FE -.->|"Outbound access"| NAT

    ECRFE -->|"Pull immutable image tag"| FE
    ECRBE -->|"Pull immutable image tag"| BE
    FE --> LogsFE
    BE --> LogsBE

    IAM -.-> FE
    IAM -.-> BE
    IAM -.-> ECRFE
    IAM -.-> ECRBE
    IAM -.-> Secrets

    Terraform -->|"Provision"| VPC
    Terraform -->|"Provision"| ALB
    Terraform -->|"Provision"| ECS
    Terraform -->|"Provision"| ECRFE
    Terraform -->|"Provision"| ECRBE
    Terraform -->|"Provision"| Secrets
    Terraform -->|"Provision"| IAM
    Terraform -->|"Provision"| LogsFE
    Terraform -->|"Provision"| LogsBE
    Terraform -->|"Remote backend"| State

    GitHub -->|"OIDC authentication"| IAM
    GitHub -->|"Build, scan, and push"| ECRFE
    GitHub -->|"Build, scan, and push"| ECRBE
    GitHub -->|"Update task definitions"| ECS
    GitHub -->|"Smoke tests"| ALB
```

## Request Flow

```mermaid
sequenceDiagram
    participant Browser
    participant ALB as AWS ALB
    participant Frontend as Next.js ECS Task
    participant Backend as NestJS ECS Task
    participant Secrets as Secrets Manager
    participant Salesforce as Salesforce API

    Browser->>ALB: GET /
    ALB->>Frontend: Forward default route
    Frontend-->>Browser: Next.js application

    Browser->>ALB: GET /api/accounts
    ALB->>Backend: Forward /api/* route
    Backend->>Secrets: Load Salesforce credentials
    Secrets-->>Backend: Client ID and client secret
    Backend->>Salesforce: OAuth client credentials request
    Salesforce-->>Backend: Access token
    Backend->>Salesforce: Query Account records
    Salesforce-->>Backend: Account data
    Backend-->>ALB: JSON response
    ALB-->>Browser: Account data

    Browser->>ALB: POST /api/accounts
    ALB->>Backend: Forward request
    Backend->>Salesforce: Create Account record
    Salesforce-->>Backend: Created record
    Backend-->>Browser: JSON response
```

## CI/CD Flow

```mermaid
flowchart LR
    PR["Pull Request"] --> Checks["GitHub Actions Checks"]

    Checks --> BackendTests["Backend tests<br/>Build and lint"]
    Checks --> FrontendTests["Frontend tests<br/>Build and lint"]
    Checks --> DockerBuild["Build Docker images"]
    Checks --> Scan["Container vulnerability scan"]
    Checks --> TerraformValidate["Terraform format<br/>Validate and plan"]

    Main["Merge to main"] --> OIDC["GitHub OIDC<br/>Assume AWS deploy role"]
    OIDC --> Build["Build images<br/>Commit SHA tags"]
    Build --> PushFE["Push frontend image to ECR"]
    Build --> PushBE["Push backend image to ECR"]
    PushFE --> Deploy["Update ECS task definitions"]
    PushBE --> Deploy
    Deploy --> Stable["Wait for ECS service stability"]
    Stable --> Smoke["Run ALB smoke tests"]
    Smoke --> Complete["Deployment complete"]
    Deploy -.->|"Failed deployment"| Rollback["ECS deployment circuit breaker<br/>Automatic rollback"]
```

## Terraform Resource Relationships

```mermaid
flowchart TD
    Bootstrap["Terraform Bootstrap"] --> S3["Encrypted S3 State Bucket"]
    S3 --> Dev["Dev/Demo Terraform Environment"]

    Dev --> Network["VPC and Network Module"]
    Dev --> ECR["ECR Module"]
    Dev --> Secrets["Secrets Manager References"]
    Dev --> IAM["IAM Module"]
    Dev --> ECS["ECS/Fargate Module"]
    Dev --> ALB["ALB Module"]
    Dev --> Logs["CloudWatch Module"]

    Network --> Subnets["Public and private subnets"]
    Network --> Routes["Internet Gateway<br/>NAT Gateway<br/>Route tables"]
    ECR --> Images["Frontend and backend repositories"]
    IAM --> Roles["Execution role<br/>Task role<br/>GitHub OIDC role"]
    ECS --> Services["Frontend service<br/>Backend service"]
    ALB --> Listener["Default frontend route<br/>/api/* backend route"]

    Services --> Listener
    Services --> Images
    Services --> Roles
    Services --> Logs
    Services --> Secrets
    Services --> Network
```

## Key Security Boundaries

- Only the Application Load Balancer is publicly reachable.
- Frontend and backend ECS tasks run in private subnets without public IP addresses.
- The backend task accepts traffic only from the ALB security group.
- Salesforce credentials are stored in Secrets Manager and are never included in frontend code or Docker images.
- The backend is the only component that communicates with Salesforce.
- GitHub Actions uses OIDC instead of long-lived AWS access keys.
- ECS deployments use immutable image tags based on the Git commit SHA.

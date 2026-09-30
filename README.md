# Church Attendance Management System

Production-oriented full-stack church attendance platform for approximately 200–500 members.

## Stack

- React + Vite + TypeScript + Tailwind CSS
- Amazon Cognito for authentication
- Amazon API Gateway REST API + Cognito authorizer
- AWS Lambda (Node.js 22)
- Amazon RDS PostgreSQL in private subnets
- AWS Secrets Manager
- CloudWatch Logs
- S3 + CloudFront for the SPA
- Terraform
- GitHub Actions with AWS OIDC
- Vitest + React Testing Library

## Architecture

```text
                         HTTPS
                           |
                     +-----v------+
                     | CloudFront |
                     +-----+------+
                           |
                         S3
                    React static app
                           |
                           | HTTPS / JWT
                           v
                 +--------------------+
                 | API Gateway REST   |
                 | Cognito Authorizer |
                 +---------+----------+
                           |
                    Lambda functions
                    (private VPC)
                           |
                  +--------+--------+
                  | Secrets Manager |
                  +--------+--------+
                           |
                    +------v------+
                    | RDS Postgres|
                    | private only|
                    +-------------+

CloudWatch <- Lambda logs
IAM        <- least-privilege execution/deployment roles
GitHub     -> OIDC -> AWS deployment role
```

## Repository layout

```text
church-attendance/
  frontend/
  backend/
    functions/
    services/
    database/
    utils/
  terraform/
  .github/workflows/
```

## Prerequisites

- Node.js 22+
- npm 10+
- AWS CLI
- Terraform >= 1.7
- An AWS account
- A Route53/domain setup is optional; CloudFront's generated domain works without one.

## Local development

### 1. Install

```bash
npm install
```

### 2. Database

For local development, run PostgreSQL 15+ locally or with Docker.

Example:

```bash
docker run --name church-postgres \
  -e POSTGRES_PASSWORD=localdev \
  -e POSTGRES_DB=church_attendance \
  -p 5432:5432 -d postgres:16
```

Set `backend/.env` from `backend/.env.example`:

```env
NODE_ENV=development
AWS_REGION=ca-central-1
DB_HOST=localhost
DB_PORT=5432
DB_NAME=church_attendance
DB_USER=postgres
DB_PASSWORD=localdev
COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=
CORS_ORIGIN=http://localhost:5173
```

The local password is only for local development. Production Lambda uses Secrets Manager.

Run migrations:

```bash
npm run db:migrate --workspace backend
npm run db:seed --workspace backend
```

### 3. Frontend

Copy `frontend/.env.example` to `.env.local`.

For a deployed API:

```env
VITE_API_URL=https://YOUR_API_ID.execute-api.ca-central-1.amazonaws.com/production
VITE_COGNITO_USER_POOL_ID=ca-central-1_xxxxx
VITE_COGNITO_CLIENT_ID=xxxxx
VITE_COGNITO_REGION=ca-central-1
VITE_CHURCH_NAME=The Church of Pentecost Canada
```

Run:

```bash
npm run dev --workspace frontend
```

### 4. Backend local tests

```bash
npm test --workspace backend
```

## Authentication

Production authentication is AWS Cognito Hosted UI / Cognito user pool authentication.

Create users in Cognito and assign an application role through the `custom:role` attribute:

- `admin`
- `attendance_staff`

The API Gateway Cognito authorizer validates the JWT before Lambda execution. Lambda additionally reads the verified claims and performs role checks.

For a production deployment, create an initial administrator manually in Cognito, then create the corresponding `users` row using the user's Cognito subject (`sub`).

## Database migrations

Migration files are in:

```text
backend/database/migrations/
```

Run:

```bash
npm run db:migrate --workspace backend
```

Seed development data:

```bash
npm run db:seed --workspace backend
```

The seed uses clearly fictional names and emails.

## API

Base path:

```text
GET    /members
GET    /members/{id}
POST   /members
PUT    /members/{id}
PATCH  /members/{id}/deactivate

GET    /attendance
POST   /attendance
PUT    /attendance/{id}

GET    /members/{id}/attendance

GET    /dashboard/statistics
GET    /reports/attendance
```

API Gateway adds the Cognito authorizer. Lambda validates inputs with Zod and uses parameterized PostgreSQL queries.

### Roles

| Capability | Admin | Attendance Staff |
|---|---:|---:|
| Dashboard | Yes | Yes |
| View members | Yes | Yes |
| Search members | Yes | Yes |
| Add/edit/deactivate members | Yes | No |
| Record/edit attendance | Yes | Yes |
| Attendance history | Yes | Yes |
| Reports | Yes | No |
| Settings/admin management | Yes | No |

## Security

- No database password is stored in application source.
- Production DB credentials are generated/stored in Secrets Manager.
- RDS is not publicly accessible.
- Lambda is placed in private subnets.
- Security groups allow PostgreSQL only from the Lambda security group.
- API Gateway requires a Cognito JWT.
- Lambda performs role authorization.
- SQL is parameterized.
- CORS is restricted by Terraform variable.
- CloudWatch logs are enabled.
- GitHub Actions uses OIDC, not long-lived AWS keys.
- Secrets are not printed to logs.
- Inactive members cannot receive new attendance records.

## Terraform deployment

The Terraform stack creates:

- VPC with two private and two public subnets
- NAT gateways
- RDS PostgreSQL
- Secrets Manager secret
- Lambda execution role
- Lambda functions
- API Gateway REST API + Cognito authorizer
- Cognito user pool/client
- S3 bucket
- CloudFront distribution
- CloudWatch log groups
- GitHub OIDC role

Initialize:

```bash
cd terraform
terraform init
```

Create a development workspace:

```bash
terraform workspace new development
terraform workspace select development
```

Plan:

```bash
terraform plan \
  -var="project_name=church-attendance" \
  -var="environment=development" \
  -var="db_name=church_attendance" \
  -var="db_username=churchapp" \
  -var="cors_origin=http://localhost:5173"
```

Apply after review:

```bash
terraform apply \
  -var="project_name=church-attendance" \
  -var="environment=development" \
  -var="db_name=church_attendance" \
  -var="db_username=churchapp" \
  -var="cors_origin=https://YOUR-CLOUDFRONT-DOMAIN"
```

> Important: the Terraform stack provisions infrastructure and Lambda packages. Database migrations should be run as a controlled deployment step after RDS is reachable. This repository provisions a private `migrate` Lambda that is not exposed through API Gateway; invoke it only from an authorized deployment/operator workflow after reviewing the migration code.

Outputs include API URL, S3 bucket, CloudFront domain, Cognito IDs, RDS endpoint, and GitHub deployment role ARN.

## GitHub Actions

Required GitHub repository variables/secrets:

- `AWS_DEPLOY_ROLE_ARN` (repository variable is preferred)
- `TF_STATE_BUCKET`
- `TF_STATE_DYNAMODB_TABLE` if using a remote-locking setup

The included workflow uses OIDC:

```text
GitHub Actions
      |
      | OIDC token
      v
AWS IAM role
      |
      +--> Terraform
      +--> S3
      +--> Lambda
```

No AWS access keys should be stored in GitHub.

Production Terraform apply is manual by design.

## Deployment order

1. Frontend scaffold and routing
2. PostgreSQL migrations
3. Lambda functions/services
4. API Gateway
5. React API integration
6. Cognito authentication/authorization
7. Dashboard
8. Members
9. Attendance
10. Reports
11. Tests
12. Terraform
13. GitHub Actions
14. Production hardening

Each layer is independently runnable/testable.

## Production checklist

- [ ] Use a dedicated AWS account/environment.
- [ ] Enable RDS deletion protection for production.
- [ ] Enable RDS backups and Multi-AZ where budget permits.
- [ ] Set CloudFront custom domain + TLS certificate if desired.
- [ ] Restrict CORS to the real frontend domain.
- [ ] Create a real Cognito admin user.
- [ ] Run migrations before opening the application.
- [ ] Review IAM permissions.
- [ ] Enable AWS Budgets/alerts.
- [ ] Review CloudWatch retention.
- [ ] Add AWS WAF to CloudFront/API Gateway for higher-risk deployments.
- [ ] Rotate secrets according to organizational policy.
- [ ] Back up and test restore procedures.

## CSV reports

Reports are generated client-side from the API's JSON report rows. This avoids a server-side file-generation dependency and works well for 200–500 members.

## Scaling note

For 200–500 members, this architecture is intentionally simple. RDS PostgreSQL is more than sufficient. If Lambda concurrency grows, introduce RDS Proxy rather than immediately adding more infrastructure. The schema has indexes and a unique attendance constraint for the core access patterns.

## License

Use and modify for your church/project. Review dependencies and organizational policies before production use.


### Production database migration

After Terraform creates RDS and the migration Lambda:

```bash
aws lambda invoke \
  --function-name church-attendance-production-migrate \
  --payload '{}' \
  response.json
cat response.json
```

Do not expose the migration Lambda through API Gateway. In a production organization, restrict who can invoke it with a dedicated IAM deployment role and/or CI approval gate.

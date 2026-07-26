<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Zero Trust Security Engine

## Architecture Flow & Risk Engine

This diagram represents the complete flow of the Zero Trust Security Engine risk evaluation system:

- Incoming requests pass through middleware for request context extraction.
- Authentication failures and request activity are tracked using Redis.
- RiskGuard intercepts protected routes before controller execution.
- RiskService evaluates request risk based on multiple factors.
- Risk scores determine whether the request is allowed, logged, or blocked.
- Redis caching improves performance for repeated evaluations.

```mermaid
graph TD
    A["HTTP Request"] -->|IP extracted| B["RequestContextMiddleware"]
    B -->|Adds context to request| C["Request Object<br/>contains: ip, userAgent, time"]
    
    D["Auth Service"] -->|On Login Failure| E["RiskTrackerService"]
    E -->|Track failed attempts| F["Redis Store<br/>fail:email<br/>expires 5 mins"]
    
    D -->|On Login Success| G["Update User IP<br/>UserService"]
    G -->|Stores lastIp| H["User Database"]
    
    I["Route Handler<br/>@UseGuards"] -->|Before controller logic| J["RiskGuard.canActivate"]
    J -->|Calls| K["RiskService.evaluateRisk"]
    
    L["User Request Data"] -->|Contains| M["userId<br/>currentIp<br/>requestCount<br/>failedAttempts"]
    M -->|Passed to| K
    
    K -->|Calculates score| N["Risk Calculation<br/>IP Change: 30 pts<br/>High Rate: 25 pts<br/>Geo Anomaly: 35 pts"]
    
    N -->|Determines level| O["Risk Levels<br/>LOW: <30<br/>MEDIUM: 30-70<br/>HIGH: >70"]
    
    O -->|Returns action| P["Decision<br/>ALLOW<br/>LOG<br/>BLOCK"]
    
    P -->|BLOCK| Q["Blacklist JWT & Throw ForbiddenException"]
    P -->|LOG| R["Console Warning"]
    P -->|ALLOW| S["Continue to Handler"]
    
    E -->|Track requests| T["Redis Store<br/>req_count:userId<br/>expires 60 secs"]
    
    K -->|Caches result| U["Redis Store<br/>risk:userId<br/>expires 5 mins"]
```

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

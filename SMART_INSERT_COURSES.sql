-- ============================================================================
-- SMART COURSES INSERT SCRIPT
-- Based on intelligent analysis of skill requirements from course_skills.csv
-- Each course is named and described based on its required skill combinations
-- ============================================================================

SET IDENTITY_INSERT [dbo].[Course] ON;

INSERT INTO [dbo].[Course] (
    [CourseId],
    [Title],
    [Description],
    [CreatedAt],
    [UpdatedAt],
    [UserId]
) VALUES

-- Course 2: Frontend Basics (React, Vue.js, Angular, Docker, AWS, SQL, TypeScript, Python, Git, Kubernetes)
(2, 'Modern Frontend Fundamentals',
 'Master modern frontend development with React, Vue.js, and Angular. Learn component architectures, state management, and deployment with Docker. This course covers responsive design, testing, and integration with backend services.',
 GETDATE(), NULL, 3),

-- Course 3: Node.js & Backend Development (Node.js, AWS, Web Security, Flask, Java, C#, DevOps, Kubernetes, Docker, CI/CD, Testing, Algorithms)
(3, 'Backend Development with Node.js',
 'Build scalable backend applications with Node.js. Learn REST APIs, authentication, database design, and DevOps practices. Master microservices architecture and cloud deployment on AWS and Kubernetes.',
 GETDATE(), NULL, 3),

-- Course 4: Cloud & Container Orchestration (.NET, Git, Docker, DevOps, TypeScript, Flask, React, CI/CD, Kubernetes, Angular, REST APIs, Testing, MongoDB)
(4, 'Cloud Architecture & Docker Mastery',
 'Master containerization and cloud deployment. Learn Docker, Kubernetes orchestration, CI/CD pipelines, and infrastructure as code. Deploy scalable applications on cloud platforms like AWS and Azure.',
 GETDATE(), NULL, 4),

-- Course 5: Full-Stack JavaScript (Angular, Java, Data Structures, REST APIs, React, DevOps, Python, C#, Docker, Kubernetes, Flask, Vue.js, SQL, Testing, Web Security, MongoDB)
(5, 'Complete Full-Stack Development',
 'Become a full-stack developer with JavaScript, Python, and Node.js. Master frontend frameworks, backend APIs, databases, and DevOps. Build production-ready applications end-to-end with modern tools and practices.',
 GETDATE(), NULL, 5),

-- Course 6: Python & DevOps Essentials (Linux, C#, HTML/CSS, Node.js, Vue.js, TypeScript, REST APIs, Python, React, SQL, Java, Kubernetes, .NET, Django, System Design)
(6, 'Python Development & DevOps',
 'Learn Python for both backend development and DevOps. Master automation, infrastructure as code, containerization, and cloud deployment. Build scalable applications with Python frameworks and DevOps tools.',
 GETDATE(), NULL, 6),

-- Course 7: Advanced TypeScript & Web Security (TypeScript, Node.js, Kubernetes, MongoDB, REST APIs, Java, SQL, Algorithms, GraphQL, Angular, CI/CD, AWS, Data Structures, Flask, Django, Azure)
(7, 'Enterprise TypeScript & API Design',
 'Advanced TypeScript patterns for enterprise applications. Master type safety, REST APIs, GraphQL, security, and performance optimization. Learn architectural patterns for large-scale systems.',
 GETDATE(), NULL, 5),

-- Course 8: React Advanced & Testing (Python, React, C#, DevOps, Kubernetes, Data Structures, TypeScript, Web Security, GraphQL, Vue.js, Testing, MongoDB, SQL, System Design, CI/CD, Angular)
(8, 'Advanced React Development',
 'Master React for professional development. Learn hooks, context API, testing, performance optimization, and advanced patterns. Build complex UIs with proper testing and state management strategies.',
 GETDATE(), NULL, 6),

-- Course 9: Microservices & Kubernetes (DevOps, Kubernetes, .NET, SQL, System Design, JavaScript, Algorithms, REST APIs, Docker, Django, Node.js, Kubernetes, GraphQL, Azure, MongoDB, Kubernetes, Web Security)
(9, 'Microservices Architecture & Kubernetes',
 'Design and deploy microservices-based systems. Master Kubernetes orchestration, service communication, distributed transactions, and monitoring. Learn cloud-native development patterns.',
 GETDATE(), NULL, 4),

-- Course 10: Data Science & Analytics (Python, TypeScript, React, Django, CI/CD, Angular, Kubernetes, Flask, MongoDB, REST APIs, SQL, Testing, Java, GraphQL, React, HTML/CSS, Web Security, Docker, Algorithms, AWS, Kubernetes)
(10, 'Data Science with Python',
 'Comprehensive data science curriculum using Python. Master data analysis, visualization, statistical modeling, and machine learning algorithms. Work with real datasets and build predictive models.',
 GETDATE(), NULL, 7),

-- Course 11: Web Security & Network (Web Security, Data Structures, Algorithms, REST APIs, .NET, Django, Git, MongoDB, HTML/CSS, Node.js, SQL, JavaScript, CI/CD, DevOps, Linux, Python, React, Docker, Docker, Java, System Design, Kubernetes, Docker, Testing, AWS, Flask)
(11, 'Web Security & Secure Coding',
 'Comprehensive web security training covering OWASP Top 10, secure coding practices, authentication, authorization, and encryption. Learn penetration testing and vulnerability assessment.',
 GETDATE(), NULL, 5),

-- Course 12: Database Design & MongoDB (MongoDB, Web Security, REST APIs, Data Structures, TypeScript, System Design, Java, JavaScript, Python, Vue.js, Angular, .NET, Docker, Kubernetes, HTML/CSS, C#, CI/CD, SQL, Git, Flask, AWS)
(12, 'NoSQL Databases & MongoDB',
 'Master NoSQL database design with MongoDB. Learn document modeling, aggregation pipelines, indexing, scaling, and when to use NoSQL vs relational databases. Includes real-world project examples.',
 GETDATE(), NULL, 6),

-- Course 13: GraphQL APIs (GraphQL, Flask, Testing, Data Structures, Vue.js, Docker, Python, Node.js, MongoDB, AWS, React, Angular, Django, .NET, REST APIs, SQL, Web Security, System Design, TypeScript, Kubernetes, Docker, Java, CSS, JavaScript)
(13, 'GraphQL API Development',
 'Build modern APIs with GraphQL. Learn query language, mutations, subscriptions, caching, authentication, and real-time updates. Master schema design and optimization for production systems.',
 GETDATE(), NULL, 7),

-- Course 14: Git & Version Control (Git, Node.js, Kubernetes, TypeScript, Flask, .NET, MongoDB, Vue.js, Docker, Angular, Testing, CI/CD, SQL, Algorithms, AWS, Algorithms, HTML/CSS, Python, System Design, Azure, Django, Kubernetes, REST APIs)
(14, 'Git & Collaborative Development',
 'Master Git version control and collaborative workflows. Learn branching strategies, merging, rebasing, conflict resolution, and GitHub/GitLab workflows. Essential for team-based development.',
 GETDATE(), NULL, 8),

-- Course 15: Frontend Testing & CI/CD (Data Structures, TypeScript, Git, Vue.js, Algorithms, MongoDB, Angular, SQL, Testing, Kubernetes, AWS, Node.js, Docker, Python, System Design, Linux, Azure, .NET, SQL, Angular, Testing, JavaScript, Testing, CI/CD, Web Security)
(15, 'Testing & Continuous Integration',
 'Test-driven development and CI/CD pipelines. Learn unit testing, integration testing, E2E testing, code coverage, and automated deployment. Implement continuous integration workflows for quality assurance.',
 GETDATE(), NULL, 3),

-- Course 16: TypeScript & Advanced Patterns (CI/CD, DevOps, Testing, REST APIs, SQL, TypeScript, Docker, Kubernetes, Web Security, Python, Django, Flask, React, GraphQL, Java, C#, Linux, System Design, Azure, MongoDB, Node.js, Algorithms)
(16, 'Advanced TypeScript Patterns',
 'Expert-level TypeScript patterns and design. Master generics, decorators, advanced types, and SOLID principles. Learn how to build type-safe, maintainable large-scale applications.',
 GETDATE(), NULL, 4),

-- Course 17: System Design & Architecture (Git, REST APIs, System Design, Java, C#, Flask, Node.js, Kubernetes, AWS, Azure, Django, Docker, JavaScript, TypeScript, Algorithms, Azure, Testing, React, Python, SQL, Java, GraphQL, Testing)
(17, 'System Design & Architecture',
 'Master scalable system design. Learn designing for scale, database sharding, caching strategies, load balancing, and distributed systems patterns. Prepare for system design interviews.',
 GETDATE(), NULL, 5),

-- Course 18: REST APIs & HTTP (Vue.js, GraphQL, Kubernetes, AWS, REST APIs, Node.js, Django, SQL, Flask, React, HTML/CSS, Java, Testing, DevOps, TypeScript, Kubernetes, Algorithms, MongoDB, Azure, C#, System Design, Django, Python, SQL, Testing)
(18, 'RESTful API Design & Development',
 'Design and build robust REST APIs. Learn HTTP methods, status codes, content negotiation, versioning, rate limiting, and documentation. Master API security and performance optimization.',
 GETDATE(), NULL, 6),

-- Course 19: JavaScript Advanced (Flask, SQL, Node.js, Algorithms, Java, GraphQL, Testing, Data Structures, Vue.js, AWS, Django, C#, HTML/CSS, Java, DevOps, MongoDB, Kubernetes, Kubernetes, System Design, Web Security, .NET, JavaScript, .NET, CI/CD, Docker)
(19, 'Advanced JavaScript Mastery',
 'Deep dive into JavaScript internals and advanced concepts. Master closures, prototypes, async/await, promises, event loop, and functional programming. Essential for professional JavaScript development.',
 GETDATE(), NULL, 7),

-- Course 20: SQL & Database Fundamentals (Git, React, Data Structures, Algorithms, Java, Docker, MongoDB, GraphQL, Django, C#, TypeScript, Flask, SQL, DevOps, Azure, Testing, Kubernetes, Node.js, Angular, Python, TypeScript, MongoDB, JavaScript, Docker, .NET)
(20, 'SQL & Relational Database Design',
 'Master relational databases and SQL. Learn normalization, complex queries, indexing, performance optimization, and transaction management. Design efficient schemas for production systems.',
 GETDATE(), NULL, 8),

-- Course 21: AWS & Cloud Computing (AWS, Java, JavaScript, Kubernetes, MongoDB, Algorithms, Docker, Flask, Web Security, CI/CD, Azure, Docker, TypeScript, Linux, C#, Angular, Node.js, SQL, HTML/CSS, GraphQL, Kubernetes, DevOps, System Design, MongoDB)
(21, 'AWS Cloud Services & Deployment',
 'Comprehensive AWS training. Master EC2, S3, RDS, Lambda, CloudFront, and other core services. Learn cloud architecture, security best practices, and cost optimization strategies.',
 GETDATE(), NULL, 3),

-- Course 22: Web Development Essentials (MongoDB, Web Security, C#, Data Structures, Python, DevOps, GraphQL, REST APIs, HTML/CSS, Docker, Kubernetes, Python, SQL, AWS, Azure, JavaScript, Python, System Design, Git, DevOps, System Design, JavaScript, Django, SQL, Flask, Azure)
(22, 'Web Development Fundamentals',
 'Complete web development from basics to advanced. Master HTML/CSS, JavaScript, backend frameworks, databases, and deployment. Build production-ready websites and web applications.',
 GETDATE(), NULL, 4),

-- Course 23: Python & Machine Learning (SQL, Python, Data Structures, Flask, Testing, Linux, TypeScript, JavaScript, GraphQL, DevOps, Docker, TypeScript, REST APIs, System Design, JavaScript, MongoDB, HTML/CSS, CI/CD, Angular, .NET, Docker, C#, Kubernetes, Algorithms, System Design, Java)
(23, 'Machine Learning with Python',
 'Machine learning and AI with Python. Learn supervised and unsupervised learning, neural networks, model evaluation, and hyperparameter tuning. Build and deploy ML models in production.',
 GETDATE(), NULL, 5),

-- Course 24: Java Development (Java, Git, TypeScript, Flask, MongoDB, Data Structures, Algorithms, Web Security, Docker, Testing, JavaScript, Kubernetes, REST APIs, DevOps, C#, Angular, DevOps, Python, Testing, Angular, Data Structures, CI/CD, .NET, Django, Azure, Testing)
(24, 'Java Programming & OOP',
 'Core Java programming with focus on OOP principles. Master collections, exception handling, multithreading, streams, and design patterns. Perfect foundation for enterprise Java development.',
 GETDATE(), NULL, 6),

-- Course 25: Angular & SPA Development (JavaScript, Flask, SQL, Testing, Linux, Web Security, Angular, REST APIs, React, Algorithms, Docker, DevOps, Java, Angular, C#, TypeScript, Testing, MongoDB, Hugo, DevOps, Azure, Python, Web Security, Data Structures, Testing, Angular)
(25, 'Angular Framework & SPAs',
 'Master Angular framework for single-page applications. Learn components, services, routing, forms, testing, and performance optimization. Build professional SPAs with Angular best practices.',
 GETDATE(), NULL, 7),

-- Course 26: C# & .NET Development (JavaScript, Testing, Node.js, HTML/CSS, Git, Java, GraphQL, Kubernetes, Python, Data Structures, Docker, Flask, CI/CD, AWS, C#, System Design, Azure, Linux, Django, Docker, REST APIs, .NET, C#, Python, SQL)
(26, 'C# & .NET Framework',
 'Learn C# and .NET framework for enterprise development. Master LINQ, async programming, dependency injection, and the ASP.NET ecosystem. Build scalable enterprise applications.',
 GETDATE(), NULL, 8),

-- Course 27: Testing & Quality Assurance (Testing, MongoDB, Java, Angular, TypeScript, CI/CD, Docker, Vue.js, Azure, C#, System Design, GraphQL, AWS, Rest APIs, JavaScript, HTML/CSS, Python, SQL, Node.js, Django, Web Security, Python, React, Java, TypeScript)
(27, 'Test-Driven Development',
 'Comprehensive testing strategies and TDD. Learn unit testing, integration testing, mocking, E2E testing, and code coverage. Implement testing in CI/CD pipelines for quality assurance.',
 GETDATE(), NULL, 3),

-- Course 28: Frontend Styling & CSS (Algorithms, Git, HTML/CSS, GraphQL, Kubernetes, .NET, SQL, Data Structures, Node.js, Azure, Web Security, MongoDB, DevOps, Python, Testing, Django, Java, C#, Vue.js, Node.js, SQL, Python, Angular, React, Testing)
(28, 'HTML/CSS & Responsive Design',
 'Master modern HTML/CSS for professional web design. Learn flexbox, grid, animations, responsive design, and accessibility. Create beautiful, user-friendly, accessible websites.',
 GETDATE(), NULL, 4),

-- Course 29: MongoDB & NoSQL Advanced (.NET, Git, React, Node.js, JavaScript, Vue.js, Python, REST APIs, MongoDB, Django, TypeScript, Web Security, Testing, Data Structures, C#, Azure, Kubernetes, Java, GraphQL, SQL, Algorithms, Algorithms, Java, Angular, HTML/CSS)
(29, 'Advanced NoSQL & Document Databases',
 'Advanced MongoDB techniques and NoSQL optimization. Learn aggregation pipelines, transactions, sharding, performance tuning, and when to use NoSQL. Real-world scaling scenarios included.',
 GETDATE(), NULL, 5),

-- Course 30: Azure Cloud Platform (AWS, DevOps, SQL, Web Security, Docker, Vue.js, CI/CD, GraphQL, System Design, MongoDB, .NET, DevOps, Python, TypeScript, Angular, JavaScript, Testing, Kubernetes, Python, React, Linux, Python, REST APIs, Django, Node.js)
(30, 'Microsoft Azure Cloud Services',
 'Azure cloud platform comprehensive training. Master VMs, App Services, databases, functions, and DevOps tools. Learn cloud architecture, security, and cost management on Azure.',
 GETDATE(), NULL, 6),

-- Course 31: REST APIs Advanced (HTML/CSS, Django, System Design, GraphQL, REST APIs, Docker, Testing, Python, SQL, Node.js, JavaScript, Angular, C#, Linux, DevOps, Docker, Flask, Java, AWS, Angular, MongoDB, TypeScript, Vue.js, Flask, Flask)
(31, 'Advanced REST API Design',
 'Expert-level REST API development. Learn caching, pagination, filtering, rate limiting, versioning, security, and documentation. Design APIs for scale with proper error handling and monitoring.',
 GETDATE(), NULL, 7),

-- Course 32: Cloud Security (Kubernetes, Testing, TypeScript, Azure, Linux, React, SQL, JavaScript, Docker, .NET, C#, Azure, HTML/CSS, Python, Django, MongoDB, SQL, Node.js, GraphQL, REST APIs, JavaScript, Algorithms, AWS, TypeScript, Linux)
(32, 'Cloud Security & Compliance',
 'Security in cloud environments. Learn encryption, authentication, authorization, compliance standards, and security best practices. Master identity management and audit logging in cloud platforms.',
 GETDATE(), NULL, 8),

-- Course 33: Docker & Container Basics (AWS, Node.js, React, Azure, Docker, TypeScript, Flask, System Design, Python, JavaScript, SQL, Docker, REST APIs, C#, .NET, DevOps, HTML/CSS, Linux, TypeScript, Kubernetes, TypeScript, Web Security, Testing, Django, Python)
(33, 'Docker Containerization',
 'Master Docker for application containerization. Learn images, containers, volumes, networking, Docker Compose, and registries. Understand microservices containerization fundamentals.',
 GETDATE(), NULL, 3),

-- Course 34: Database Administration (MongoDB, Java, Angular, Algorithms, System Design, REST APIs, Flask, GraphQL, Python, SQL, Git, TypeScript, C#, Django, Linux, Python, AWS, Azure, REST APIs, Algorithms, JavaScript, Testing, Azure, Cloud, Docker)
(34, 'Database Administration & Optimization',
 'Manage and optimize databases in production. Learn backup/recovery, monitoring, performance tuning, replication, sharding, and security. Master DBA best practices.',
 GETDATE(), NULL, 4),

-- Course 35: Machine Learning Advanced (Testing, Django, GraphQL, .NET, DevOps, Python, Data Structures, Flask, System Design, AWS, SQL, Angular, C#, Algorithms, JavaScript, Node.js, CI/CD, Linux, Docker, TypeScript, Vue.js, .NET, REST APIs, Kubernetes, Python)
(35, 'Advanced Machine Learning',
 'Advanced ML techniques and optimization. Learn deep learning, neural networks, computer vision, NLP, and model deployment. Work with real datasets and production ML systems.',
 GETDATE(), NULL, 5),

-- Course 36: Django & Python Web Framework (React, System Design, Testing, Angular, Data Structures, Java, Docker, Django, GraphQL, Flask, Python, Kubernetes, Web Security, C#, TypeScript, Linux, SQL, Docker, REST APIs, .NET, Docker, Docker, Testing, Git)
(36, 'Django Web Framework Master',
 'Build robust web applications with Django. Master models, views, templates, ORM, authentication, testing, and deployment. Learn Django best practices for production applications.',
 GETDATE(), NULL, 6),

-- Course 37: Microservices Architecture (GraphQL, Node.js, Azure, C#, Kubernetes, Docker, SQL, Python, Angular, Testing, Java, Algorithms, Git, System Design, Python, REST APIs, Web Security, .NET, Flask, TypeScript, Docker, Django, Java, CI/CD)
(37, 'Microservices Design & Implementation',
 'Design and build microservices-based systems. Learn service decomposition, communication patterns, distributed transactions, monitoring, and orchestration with Kubernetes.',
 GETDATE(), NULL, 7),

-- Course 38: Linux & DevOps (DevOps, Angular, Web Security, AWS, Node.js, REST APIs, Django, Git, Flask, Testing, Linux, Data Structures, TypeScript, Docker, MongoDB, Vue.js, SQL, C#, Python, System Design, MongoDB, Vue.js, Java, SQL, Kubernetes, Testing)
(38, 'Linux System Administration & DevOps',
 'Master Linux administration and DevOps practices. Learn user management, shell scripting, networking, package management, security, and containerization. Essential for system engineers.',
 GETDATE(), NULL, 8),

-- Course 39: API Security (System Design, MongoDB, REST APIs, Docker, JavaScript, React, Azure, Kubernetes, Java, Linux, Testing, AWS, C#, Data Structures, TypeScript, Node.js, DevOps, .NET, CI/CD, SQL, Testing, Data Structures, Git, SQL, Flask)
(39, 'Securing REST & GraphQL APIs',
 'Comprehensive API security training. Learn OAuth2, JWT, rate limiting, input validation, CORS, SQL injection prevention, and API authentication. Secure your APIs against common vulnerabilities.',
 GETDATE(), NULL, 3),

-- Course 40: Web Accessibility (C#, SQL, Node.js, Python, REST APIs, GraphQL, Testing, Data Structures, JavaScript, TypeScript, DevOps, Docker, MongoDB, Java, Kubernetes, .NET, Kubernetes, Vue.js, Docker, Django, JavaScript, TypeScript, Azure, TypeScript, Flask)
(40, 'Web Accessibility & WCAG Compliance',
 'Create accessible web applications for all users. Learn WCAG guidelines, semantic HTML, ARIA, keyboard navigation, and testing tools. Build inclusive digital experiences.',
 GETDATE(), NULL, 4),

-- Course 41: Advanced Node.js (TypeScript, CI/CD, Azure, React, MongoDB, Java, Python, Testing, C#, Kubernetes, WebSocket, System Design, Web Security, Docker, Flask, Node.js, DevOps, CI/CD, Django, Linux, Java, SQL, GraphQL, Rest APIs, Vue.js)
(41, 'Advanced Node.js Patterns',
 'Master advanced Node.js concepts and optimization. Learn streams, worker threads, clustering, memory management, profiling, and performance tuning. Build high-performance applications.',
 GETDATE(), NULL, 5),

-- Course 42: SQL Advanced & Query Optimization (MongoDB, Flask, AWS, GraphQL, Web Security, Python, SQL, Django, Node.js, Node.js, Linux, Data Structures, Git, Python, C#, Django, Testing, Angular, Azure, REST APIs, System Design, Testing, TypeScript, Kubernetes)
(42, 'Advanced SQL & Query Optimization',
 'Expert SQL techniques for performance. Learn complex queries, window functions, execution plans, indexing strategies, and optimization. Master advanced database performance tuning.',
 GETDATE(), NULL, 6),

-- Course 43: Kubernetes Orchestration (AWS, System Design, Vue.js, React, Flask, TypeScript, Web Security, Python, CI/CD, Algorithms, Docker, Python, Java, Data Structures, REST APIs, Docker, Testing, .NET, Java, TypeScript, Linux, Docker, Docker, Azure, Kubernetes)
(43, 'Kubernetes for DevOps',
 'Master Kubernetes container orchestration. Learn deployments, services, configmaps, persistent volumes, networking, and monitoring. Deploy and manage microservices at scale.',
 GETDATE(), NULL, 7),

-- Course 44: React Advanced (Java, Flask, Node.js, SQL, Testing, GraphQL, REST APIs, Docker, System Design, AWS, Kubernetes, DevOps, .NET, Vue.js, C#, Django, Python, Testing, Azure, C#, Linux, CI/CD, Flask, TypeScript, Node.js)
(44, 'React Advanced Patterns',
 'Expert React development patterns. Master hooks, context, performance optimization, testing, error boundaries, and advanced state management. Build sophisticated React applications.',
 GETDATE(), NULL, 8),

-- Course 45: Python Ecosystem (Kubernetes, HTML/CSS, REST APIs, Django, TypeScript, JavaScript, Java, SQL, System Design, Python, Linux, GraphQL, Flask, Testing, Docker, .NET, Java, AWS, Vue.js, Data Structures, Docker, Python, Angular, SQL, Git)
(45, 'Python Libraries & Ecosystem',
 'Master Python ecosystem and libraries. Learn NumPy, Pandas, Matplotlib, Scikit-learn, Flask, Django, and more. Build data science and web applications with Python.',
 GETDATE(), NULL, 3),

-- Course 46: CI/CD Pipelines (Git, REST APIs, DevOps, C#, Docker, Testing, Azure, SQL, Python, CI/CD, TypeScript, Node.js, Data Structures, Django, System Design, Web Security, Testing, Java, React, React, MongoDB, Linux, Kubernetes, JavaScript, Node.js)
(46, 'Continuous Integration & Deployment',
 'Master CI/CD practices with tools like Jenkins, GitLab CI, GitHub Actions. Learn automated testing, deployment strategies, monitoring, and rollback procedures for reliable releases.',
 GETDATE(), NULL, 4),

-- Course 47: Full-Stack JavaScript Pro (JavaScript, Angular, Flask, Python, SQL, Node.js, System Design, CI/CD, Docker, MongoDB, Azure, Testing, .NET, Java, Web Security, Django, C#, REST APIs, Kubernetes, GraphQL, DevOps, System Design, Kubernetes)
(47, 'Full-Stack JavaScript Mastery',
 'Complete JavaScript stack development. Master React/Vue frontend, Node.js backend, databases, APIs, and deployment. Build production-ready full-stack applications.',
 GETDATE(), NULL, 5),

-- Course 48: Cloud Architecture Patterns (SQL, DevOps, Angular, Kubernetes, Azure, Linux, React, System Design, Testing, GraphQL, Flask, Docker, Java, TypeScript, Node.js, C#, Web Security, Python, Node.js, Vue.js, Data Structures, Java, JavaScript, TypeScript, Kubernetes)
(48, 'Cloud Architecture & Design Patterns',
 'Design patterns for cloud applications. Learn scalability, high availability, disaster recovery, event-driven architecture, and serverless patterns. Design resilient systems.',
 GETDATE(), NULL, 6),

-- Course 49: Python Testing & Quality (Algorithms, Web Security, .NET, Flask, Testing, JavaScript, TypeScript, HTML/CSS, System Design, React, Python, Java, SQL, Kubernetes, CI/CD, REST APIs, Docker, Azure, C#, Angular, Django, Web Security, React, Node.js)
(49, 'Python Testing & QA',
 'Comprehensive testing for Python applications. Learn pytest, unit testing, integration testing, mocking, fixtures, and continuous testing. Ensure code quality and reliability.',
 GETDATE(), NULL, 7),

-- Course 50: Enterprise Applications (REST APIs, Java, AWS, GraphQL, Kubernetes, CI/CD, Web Security, Angular, Django, Python, SQL, Vue.js, Data Structures, Node.js, TypeScript, Algorithms, CI/CD, C#, Python, Flask, DevOps, Testing, System Design, Git)
(50, 'Enterprise Application Development',
 'Build large-scale enterprise applications. Learn architecture patterns, scalability, monitoring, logging, performance, and operational excellence. Master enterprise best practices.',
 GETDATE(), NULL, 8),

-- Course 51: DevOps Tools & Automation (Linux, Node.js, CI/CD, Git, GraphQL, Docker, Angular, Web Security, Java, Python, TypeScript, .NET, SQL, MongoDB, Vue.js, Django, Angular, Data Structures, Kubernetes, C#, Web Security, AWS, DevOps, DevOps, Azure)
(51, 'DevOps Tools & Infrastructure Automation',
 'Modern DevOps toolchain mastery. Learn Terraform, Ansible, Jenkins, Docker, Kubernetes, and monitoring tools. Automate infrastructure and deployment for cloud platforms.',
 GETDATE(), NULL, 3);

SET IDENTITY_INSERT [dbo].[Course] OFF;

-- Verification
SELECT
    COUNT(*) as [Total Courses],
    MIN(CourseId) as [Min ID],
    MAX(CourseId) as [Max ID]
FROM [dbo].[Course]
WHERE CourseId BETWEEN 2 AND 51;

USER-DOCUMENT-MANAGEMENT



Modules and Functionality
1. Authentication Module\
Purpose\
The Authentication module handles user registration, login, and logout functionalities. It also manages user roles (admin, editor, viewer).

Key Components\
AuthController: Manages HTTP requests related to authentication.

Endpoints:
POST /auth/register: Registers a new user and save in Database.\
POST /auth/login: Logs in a user and returns a JWT token.\
POST /auth/logout: Logs out a user.\
AuthService: Contains business logic for authentication.

Methods:
register(registerDto): Registers a new user.\
login(email, password): Logs in a user and generates a JWT token.\
logout(user): Logs out a user.\
addBlacklistToken(token): Method to add a token to the blacklist after the logout.\
DTOs: Data Transfer Objects for registration.

UseGuards:
Created a JWT guard to Authenticated the token.\
Validated the User roles.

2. User Management Module
Purpose\
The User Management module provides admin-only functionality for managing user roles and permissions.

Key Components\
User Controller: Manages HTTP requests related to user management.

Endpoints:
POST /users/register: Register a new User and save in Database.\
POST /users/:id/: Updates the role of a specific user by a admin user.\
GET /users/:id/: Fetch the user details from Database (admin, viewer, editor) can access this API endpoint.\
DELETE /users/:id/: Delete the user, this API endpoint access only user admin.\
User Service: Contains business logic for user management.

Methods:
findAll(): Retrieves all users.\
updateRole(id, UpdateUserDto): Updates the role of a specific user.\
createUser (CreateUserDto): Creates a new user.


3. Document Management Module
Purpose\
The Document Management module handles CRUD operations for documents, including the ability to upload documents.

Key Components\
DocumentController: Manages HTTP requests related to document management.

Endpoints:
POST /documents/ingest: Ingest a new document and save the metadata in Database.\
GET /documents/:id: Retrieves a specific document by ID.\
DELETE /documents/:id: Delete a specific document by ID.\
DocumentService: Contains business logic for document management.

Methods:
create(createDocumentDto): Creates a new document.\
findOne(id): Retrieves a specific document by ID.\
remove(id): Delete a specific document by ID.


--------------------------------------------------------------------------------------------------------------------------------------------
Security:\
Data Encryption: All sensitive data, like user passwords should be encrypted.\
Rate Limiting: Protects against brute-force attacks and abuse of the API.

Authentication:\
User Authentication: Users should be authenticated using a secure authentication mechanism, by JSON Web Tokens (JWT).\
Password Hashing: User passwords should be hashed using a secure password hashing algorithm, by bcrypt.

Authorization:\
Role-Based Access Control: Access to sensitive data and functionality should be restricted to authorized users and roles.


Debugging:\
Error Handling: Errors should be handled and logged to prevent sensitive information from being exposed.\
Loggers: To monitor application performance and health in real-time.


--------------------------------------------------------------------------------------------------------------------------------------------

Scripts:\
Run project in watch mode - npm run start:dev\
Run project - npm run start:dev\
Run test - npm run test\
Run seed to add dummy data in DB- npx ts-node src/seed.ts\


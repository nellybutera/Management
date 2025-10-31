# Credit Jambo Backend API

This is the NestJS backend for the Credit Jambo application, designed to manage user authentication, savings, and credit requests.

## Quick Start

### Prerequisites
* Node.js (LTS version recommended)
* PostgreSQL Database (Neon is used by default)

### Setup Steps
1.  **Configure Environment:**
    * Copy the example environment file:
        ```bash
        cp .env.example .env
        ```
    * Update the `.env` file with your **PostgreSQL Direct Connection URL** (`DATABASE_URL`) and a secure `JWT_SECRET`.

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Database Setup (Prisma):**
    * Generate the Prisma client based on your schema:
        ```bash
        npx prisma generate
        ```
    * Run migrations to create the tables (`User`, `Credit`, etc.) in your connected database:
        ```bash
        npx prisma migrate dev --name init
        ```
    * **Seed Script:** Run the seed script to populate the database with initial data (e.g., an Admin user):
        ```bash
        npm run seed
        ```

4.  **Start Development Server:**
    The API will run on the port specified in your `.env` (or default to 4000).
    ```bash
    npm run start:dev
    ```
    You should see the message: ` Server running on http://localhost:4000`


## Tests Included

   - I used **Jest** and **NestJS Testing Utilities** for this purpose.

   - To run all test suites:

      ```bash
      npm run test
      ```
   - To run tests in watch mode during development
      ```bash
      npm run test:watch
      ```
   - Specific Tests Executed

      The unit tests were configured to cover critical paths, including success, validation, and expected exceptions:

      - AuthService.register: Successfully registers a new user and Throws ConflictException if the user email already exists (P2002 error).

      - AuthService.login: Successfully logs in and returns an access token and Throws UnauthorizedException for invalid email (user not found).

         Throws UnauthorizedException for invalid password (password mismatch).
      
      -  CreditService.requestCredit: Successfully creates a credit request with PENDING status. 
      
         Throws BadRequestException for amount less than or equal to zero.
      
      - CreditService.approveCredit: Successfully approves a PENDING credit and increments the user's balance. 
      
         Returns the credit object if it is already APPROVED (idempotency check).

         Throws NotFoundException if the credit ID does not exist.
         
      - CreditService.listPending: Returns an array containing only credits with PENDING status.

### Mocking Strategy

   - All service tests use Jest Mocks for PrismaService to prevent the tests from making actual network calls to the database. 

   - This guarantees that tests are fast and reliable. For AuthService, the JwtService and external libraries like bcrypt are also mocked.
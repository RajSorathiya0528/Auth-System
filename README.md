# Auth-System

A simple authentication system built with Node.js, Express, MongoDB, and JWT.

## Features

- User registration with email verification
- User login with JWT authentication
- Get current user info
- Password reset via email
- User logout

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
BASE_URL=http://localhost:3000
MONGO_URL=your_mongodb_connection_string
MAILTRAP_HOST=your_mailtrap_host
MAILTRAP_PORT=your_mailtrap_port
MAILTRAP_USER=your_mailtrap_user
MAILTRAP_PASSWORD=your_mailtrap_password
JWTSECURITY_WORD=your_jwt_secret
```

## Installation

```sh
npm install
```

## Running the Project

```sh
npm run dev
```

## API Routes

All routes are prefixed with `/api/v1/users`.

### 1. Register User

- **POST** `/api/v1/users/register`
- **Body:** `{ "name": "string", "email": "string", "password": "string" }`
- **Description:** Registers a new user and sends a verification email.

---

### 2. Verify User Email

- **GET** `/api/v1/users/varify/:token`
- **Description:** Verifies the user's email using the token sent via email.

---

### 3. Login User

- **POST** `/api/v1/users/login`
- **Body:** `{ "email": "string", "password": "string" }`
- **Description:** Logs in the user and sets a JWT token in cookies.

---

### 4. Get Current User

- **GET** `/api/v1/users/getme`
- **Headers:** `Cookie: token=your_jwt_token`
- **Description:** Returns the currently logged-in user's details. Requires authentication.

---

### 5. Logout User

- **GET** `/api/v1/users/logout`
- **Headers:** `Cookie: token=your_jwt_token`
- **Description:** Logs out the user by clearing the JWT cookie. Requires authentication.

---

### 6. Forgot Password

- **POST** `/api/v1/users/forgot-password`
- **Body:** `{ "email": "string" }`
- **Description:** Sends a password reset link to the user's email.

---

### 7. Reset Password

- **POST** `/api/v1/users/reset-password/:token`
- **Body:** `{ "password": "string", "conformPassword": "string" }`
- **Description:** Resets the user's password using the token sent via email.

---

## Folder Structure

```
Controller/
    User.controller.js
Middelwar/
    auth.middelwar.js
Model/
    User.model.js
Route/
    User.Route.js
utils/
    db.js
index.js
.env
package.json
```

## License

ISC

---

**Author:** Raj Sorathiya

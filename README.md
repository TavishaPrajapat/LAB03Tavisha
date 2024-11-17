# Transaction Tracker - Project Documentation

This guide will walk you through the steps to set up, secure, and enhance the "Transaction Tracker" web application, which allows users to manage their financial transactions through add and delete functionalities.

## Instructions

### Part 1: Improving Our Login Functionality

#### 1. Enhancing `Layout.hbs`
- **Modify `Layout.hbs`** to include conditional statements that:
  - Display **Login/Register** links when the user is anonymous.
  - Show a **logout** link and the current user's email when authenticated.
- **Pass the User object** back to the view in all routes that render a page.

#### 2. Modifying Routes for User Context
- **In `Routes/transactions.js`**:
  - Update each method that renders a view to include the `user` object (all `GET` handlers, except `delete`).

- **In `Routes/expenses.js`**:
  - Ensure every method rendering a view includes the `user` object.

- **In `Routes/index.js`**:
  - Pass the `user` object in all view-rendering methods.
  - Add a `GET` handler for logout:
    - Call `logout()` on the request object.
    - Redirect the user to the login page.

#### 3. Verifying Navbar Changes
- Test the changes by navigating through the app to ensure that:
  - Navbar displays `Login/Register` when logged out.
  - Navbar displays the current user's email and `Logout` when logged in.

### Part 2: Adding Authorization to Protect Sections of the Website

#### 1. Checking Authorization
- While logged out, navigate to `/transactions` and `/expenses` to verify that:
  - All CRUD operations are still accessible (to be restricted next).

#### 2. Securing Views
- **Approaches for view protection**:
  - Create separate views for authenticated and anonymous users.
  - Use `if-else` statements to hide/show buttons for CRUD operations.

- **In `Views/transactions/index.hbs`**:
  - Use `if-else` statements to conditionally render the **Add** button and **Actions** column.

- **In `Views/expenses/index.hbs`**:
  - Use `if-else` statements to hide the **Add** button when the user is not authenticated.

#### 3. Implementing Middleware for Route Protection
- **In `Routes/transactions.js`**:
  - Create a middleware function `isLoggedIn()` to check if the user is authenticated:
    - Use `isAuthenticated()` from the request object.
    - Call `next()` if authenticated, otherwise redirect to the login page.
  - Inject this middleware into relevant route handlers (e.g., `GET /transactions/add`).
  - Test to confirm that unauthorized access is restricted.

- **Reusability**:
  - Create an `Extensions` folder and an `authentication.js` file.
  - Move the `isLoggedIn()` function to `authentication.js` and export it.
  - Import and apply this function in both `transactions.js` and `expenses.js`.

#### 4. Applying Middleware for Expenses
- Inject the `isLoggedIn()` middleware in relevant `GET` and `POST` route handlers for `'/expenses/add'`.

### Part 3: Implementing Google OAuth Authentication

#### 1. Setting Up Google OAuth
- Navigate to [Google Cloud Console](https://console.cloud.google.com/) and create a new project (or select an existing one).
- Go to **APIs & Services** > **Credentials** and click on **Create Credentials** > **OAuth 2.0 Client IDs**.
- Configure the OAuth consent screen:
  - **Application name**: Transaction Tracker
  - Fill out required fields and save.
- Create the **OAuth 2.0 Client ID**:
  - **Authorized redirect URIs**: Add `http://localhost:3000/google/callback`
- Copy the `Client ID` and `Client Secret` and add them to your `.env` file:
  ```plaintext
  GOOGLE_CLIENT_ID=your_google_client_id
  GOOGLE_CLIENT_SECRET=your_google_client_secret
  GOOGLE_CALLBACK_URL=http://localhost:3000/google/callback

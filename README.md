# Backend-System

## Overview

This documentation provides step-by-step instructions on setting up the "backend-system" server, a simple backend system designed for use in Unity games. The server is built using Node.js and utilizes various npm packages to handle functionality such as HTTP requests, password encryption, and database management.

### System Requirements

-   Node.js installed on your machine. You can download it from [https://nodejs.org/](https://nodejs.org/).
-   Git installed on your machine. You can download it from [https://git-scm.com/](https://git-scm.com/).

## Installation

1.  **Clone the Repository:**
    
    
    `git clone https://github.com/gmanandmarbles/Backend-System.git
    cd Backend-System` 
    
2.  **Install Dependencies:**
    
    
    `npm install` 
    

## Configuration

Before running the server, you may need to configure certain parameters based on your requirements. Open the `server.js` file and locate the configuration section.

### Configuration Section in `server.js`

Adjust the value of `PORT` according to your preferences.

## Running the Server

Once the installation and configuration are complete, you can start the server using the following command:


`npm start` 

The server will now be running, and you can access it by navigating to [http://localhost:3000](http://localhost:3000/) (or the specified port) in your web browser.

## Testing

To run the provided tests, use the following command:

`npm test` 

This will execute the `test.js` script and output the results.

## API Endpoints Documentation

### 1. Guest User Registration

#### Endpoint

-   **URL:** `/api/guest`
-   **Method:** `POST`

#### Request

-   **Body:**
    -   No specific request body required.

#### Example Response


`{
  "message": "Guest user registration successful",
  "newGuestUser": {
    "username": "AB12",
    "password": "<hashed-password>",
    "guest": true,
    "id": "1234"
  }
}` 

### 2. User Registration

#### Endpoint

-   **URL:** `/api/users`
-   **Method:** `POST`

#### Request

-   **Body:**
    -   `username` (string): User's chosen username.
    -   `password` (string): User's chosen password.

#### Example Response


`{
  "message": "User registration successful",
  "newUser": {
    "username": "JohnDoe",
    "password": "<hashed-password>",
    "id": "5678"
  }
}` 

### 3. User Login

#### Endpoint

-   **URL:** `/api/login`
-   **Method:** `POST`

#### Request

-   **Body:**
    -   `username` (string): User's username.
    -   `password` (string): User's password.

#### Example Response


`{
  "userId": "5678"
}` 

### 4. Error Report Submission

#### Endpoint

-   **URL:** `/api/error-report`
-   **Method:** `POST`

#### Request

-   **Body:**
    -   `errorMessage` (string): Description of the error.
    -   `stackTrace` (string): Stack trace or additional error details.

#### Example Response


`{
  "filename": "/path/to/error/reports/2023-12-01/errorId.json"
}` 

## PlayerPrefs API Endpoints Documentation

### 1. User Data Retrieval

#### Endpoint

-   **URL:** `/api/storage/user/:userID/:filename`
-   **Method:** `GET`

#### Request Parameters

-   `userID` (string): Unique identifier for the user.
-   `filename` (string): Name of the file to retrieve.

#### Example Response


`{
  "key1": "value1",
  "key2": "value2",
  "key3": "value3"
}` 

### 2. User Data Save

#### Endpoint

-   **URL:** `/api/storage/user/:userID/:filename`
-   **Method:** `POST`

#### Request Parameters

-   `userID` (string): Unique identifier for the user.
-   `filename` (string): Name of the file to save.

#### Request Body

-   JSON data to be saved.

#### Example Response


`{
  "message": "Data saved successfully"
}` 

## Initialization

The PlayerPrefs module is initialized when the server starts. It creates a directory structure for each user based on their unique ID.

### Middleware

-   **Middleware Function:** `app.param('userID', ...)`
-   **Functionality:** Creates a user directory if it doesn't exist.

## Directory Structure

-   **Base Directory:** `./userData`
-   **User Directories:** `./userData/:userID`
-   **User Data Files:** `./userData/:userID/:filename`

## Error Handling

-   In case of file not found (GET request), the server responds with a 404 status and an error message.
-   In case of an error during file saving (POST request), the server responds with a 500 status and an internal server error message.
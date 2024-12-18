### Authentication
| **Endpoint**                | **HTTP Method** | **Request Body**                                                    | **Response**                                                   | **Description**                                                                 |
|-----------------------------|-----------------|--------------------------------------------------------------------|---------------------------------------------------------------|---------------------------------------------------------------------------------|
| `/api/guest`                | POST            | None (automatically generates random username and password)       | `{ "message": "Guest user registration successful", "newGuestUser": { ... } }` | Registers a new guest user with a random username and default password (`1234`). |
| `/api/users`                | POST            | `{ "username": "desired-username", "password": "desired-password" }` | `{ "message": "User registration successful", "newUser": { ... } }`  | Registers a new user with a provided username and password, hashing the password before saving. |
| `/api/login`                | POST            | `{ "username": "user", "password": "password" }`                   | `{ "userId": "user-id" }` or `{ "error": "Invalid password" }` | Authenticates the user with the provided username and password.    |
| `/api/users/id`            | GET             | `username` (query parameter)                                       | `{ "userId": "user-id" }` or `{ "error": "User not found" }` | Retrieves the user ID by username. Returns 404 if the user is not found.        |

### Error Reports
| **Endpoint**                | **HTTP Method** | **Request Body**                                                    | **Response**                                                   | **Description**                                                                 |
|-----------------------------|-----------------|--------------------------------------------------------------------|---------------------------------------------------------------|---------------------------------------------------------------------------------|
| `/api/error-report`         | POST            | `{ "errorMessage": "Error message", "stackTrace": "Stack trace", "otherData": "Other relevant data" }` | `{ "filename": "errorId.json" }`                                | Accepts error data, saves it both locally and to Firestore, and returns the filename of the error report. |

### Error Searching
| **Endpoint**                | **HTTP Method** | **Request Params**                                              | **Request Body**         | **Response**                                                       | **Description**                                                             |
|-----------------------------|-----------------|-----------------------------------------------------------------|--------------------------|--------------------------------------------------------------------|-----------------------------------------------------------------------------|
| `/browse`                   | GET             | N/A                                                             | N/A                      | A HTML page listing error reports categorized by date, with clickable links to view reports. | Serves an HTML page listing error reports, with collapsible file categories by date. |
| `/json/:date/:filename`     | GET             | `date` (String), `filename` (String)                            | N/A                      | JSON file content of the error report, formatted as human-readable JSON. | Fetches a specific error report in JSON format by date and filename. Returns 404 if file not found. |


### Player Prefs / Player Storage
| **Endpoint**                | **HTTP Method** | **Request Params**                                               | **Request Body**             | **Response**                                                         | **Description**                                                           |
|-----------------------------|-----------------|------------------------------------------------------------------|------------------------------|----------------------------------------------------------------------|---------------------------------------------------------------------------|
| `/api/storage/user/:userID/:filename` | GET             | `userID` (String), `filename` (String)                           | N/A                          | If the file exists, returns the stored JSON data. If not, returns 404 with an error message. | Retrieves a JSON file for a specific user from both Firestore and local storage (fallback). |
| `/api/storage/user/:userID/:filename` | POST            | `userID` (String), `filename` (String)                           | JSON data (Object)           | `{ message: 'Data saved successfully' }`                              | Saves JSON data both in Firestore and to a local file for a specific user. |

### Game Manager
| **Endpoint**                | **HTTP Method** | **Request Params**                                               | **Request Body**             | **Response**                                                         | **Description**                                                           |
|-----------------------------|-----------------|------------------------------------------------------------------|------------------------------|----------------------------------------------------------------------|---------------------------------------------------------------------------|
| `/api/gamemanager/game/:id` | GET             | `id` (String)                                                    | N/A                          | Returns game data (websocket port, seed, players, createdAt) if the game exists. 404 if not found. | Retrieves information about a specific game by its ID. |
| `/api/gamemanager/creategame` | POST            | N/A                                                             | N/A                          | `{ gameID, websocketPort, seed, createdAt }`                         | Creates a new game with a random game ID, websocket port, and seed, and stores it in Firestore and locally. |
| `/api/gamemanager/join/:id` | POST            | `id` (String)                                                    | `{ username: String }`        | `{ message, players, seed, createdAt }`                             | Adds a player to a game by the specified game ID.                          |


### Websocket Server
| **Endpoint**                  | **Method** | **Description**                                                                 |
|-------------------------------|------------|---------------------------------------------------------------------------------|
| `/api/create-websocket`        | POST       | Creates a WebSocket server on the specified port.                               |
| **Request Body**               |            | Expects a `port` field in the request body to specify the WebSocket server's port. |
| **Success Response**           |            | Returns a message indicating the WebSocket server was created on the specified port. |
| **Error Response**             |            | If no `port` is provided, returns a `400` error with a message "Port is required." |
|                               |            | If an internal error occurs, returns a `500` error with a generic error message. |

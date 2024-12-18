
# Master API Controller Script for Unity

This script allows you to interact with various API endpoints in Unity using `UnityWebRequest`. It handles authentication, error reporting, game management, and more.

### Prerequisites
1. Unity 2017.1 or later (supports `UnityWebRequest`).
2. Install UnityWebRequest package (already included in Unity by default).
3. Ensure the API server URL is correctly set.

### Master API Controller Script

```csharp
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;
using System.Text;
using System.Collections.Generic;

public class APIController : MonoBehaviour
{
    // Base URL for your API
    private const string BASE_URL = "http://yourapi.com";  // Change to your actual API URL

    // For showing responses in Unity UI (optional)
    public Text responseText;

    // Authentication Methods
    public void RegisterGuest()
    {
        StartCoroutine(SendRequest("/api/guest", "POST"));
    }

    public void RegisterUser(string username, string password)
    {
        var data = new Dictionary<string, string>
        {
            { "username", username },
            { "password", password }
        };
        StartCoroutine(SendRequest("/api/users", "POST", data));
    }

    public void Login(string username, string password)
    {
        var data = new Dictionary<string, string>
        {
            { "username", username },
            { "password", password }
        };
        StartCoroutine(SendRequest("/api/login", "POST", data));
    }

    public void GetUserId(string username)
    {
        StartCoroutine(SendRequest("/api/users/id?username=" + username, "GET"));
    }

    // Error Report Methods
    public void ReportError(string errorMessage, string stackTrace, string otherData)
    {
        var data = new Dictionary<string, string>
        {
            { "errorMessage", errorMessage },
            { "stackTrace", stackTrace },
            { "otherData", otherData }
        };
        StartCoroutine(SendRequest("/api/error-report", "POST", data));
    }

    // Error Searching Methods
    public void BrowseErrorReports()
    {
        StartCoroutine(SendRequest("/browse", "GET"));
    }

    public void GetErrorReport(string date, string filename)
    {
        StartCoroutine(SendRequest("/json/" + date + "/" + filename, "GET"));
    }

    // Player Storage Methods
    public void GetUserStorage(string userId, string filename)
    {
        StartCoroutine(SendRequest("/api/storage/user/" + userId + "/" + filename, "GET"));
    }

    public void SaveUserStorage(string userId, string filename, string jsonData)
    {
        var data = new Dictionary<string, string>
        {
            { "data", jsonData }
        };
        StartCoroutine(SendRequest("/api/storage/user/" + userId + "/" + filename, "POST", data));
    }

    // Game Manager Methods
    public void GetGameInfo(string gameId)
    {
        StartCoroutine(SendRequest("/api/gamemanager/game/" + gameId, "GET"));
    }

    public void CreateGame()
    {
        StartCoroutine(SendRequest("/api/gamemanager/creategame", "POST"));
    }

    public void JoinGame(string gameId, string username)
    {
        var data = new Dictionary<string, string>
        {
            { "username", username }
        };
        StartCoroutine(SendRequest("/api/gamemanager/join/" + gameId, "POST", data));
    }

    // WebSocket Methods
    public void CreateWebSocketServer(int port)
    {
        var data = new Dictionary<string, string>
        {
            { "port", port.ToString() }
        };
        StartCoroutine(SendRequest("/api/create-websocket", "POST", data));
    }

    // Generic Method to Send Requests
    private IEnumerator SendRequest(string endpoint, string method, Dictionary<string, string> data = null)
    {
        string url = BASE_URL + endpoint;
        UnityWebRequest request = null;

        if (method == "POST")
        {
            // Convert the dictionary to form data
            WWWForm form = new WWWForm();
            if (data != null)
            {
                foreach (var item in data)
                {
                    form.AddField(item.Key, item.Value);
                }
            }
            request = UnityWebRequest.Post(url, form);
        }
        else if (method == "GET")
        {
            request = UnityWebRequest.Get(url);
        }

        // Wait for the request to finish
        yield return request.SendWebRequest();

        // Check for errors
        if (request.isNetworkError || request.isHttpError)
        {
            Debug.LogError("Error: " + request.error);
            if (responseText != null) responseText.text = "Error: " + request.error;
        }
        else
        {
            Debug.Log("Response: " + request.downloadHandler.text);
            if (responseText != null) responseText.text = "Response: " + request.downloadHandler.text;
        }
    }
}
```

### Usage in Unity:

1.  **Attach the Script**: Attach the `APIController` script to any GameObject in your Unity scene.
    
2.  **UI Setup (Optional)**:
    
    -   Add a `Text` UI element (to display the API response) and assign it to the `responseText` field in the Inspector (optional but useful for debugging).
3.  **Calling API Methods**:
    
    -   Call the API methods such as `RegisterGuest()`, `RegisterUser()`, `Login()`, etc., by invoking them via Unity UI buttons or other scripts.
    -   Example of invoking `RegisterUser` via UI button:
    
 ```
    
    // Example of calling RegisterUser from a UI button
    public class UIController : MonoBehaviour
    {
        public APIController apiController;
    
        public void OnRegisterUserButtonClicked(string username, string password)
        {
            apiController.RegisterUser(username, password);
        }
    
        public void OnLoginButtonClicked(string username, string password)
        {
            apiController.Login(username, password);
        }
    }
   ```
    

### Additional Considerations:

-   **Error Handling**: The script will log errors to the Unity console. Modify it to display them in the UI if needed.
    
-   **Data Formatting**: For POST requests with JSON data, you can serialize the data using `JsonUtility.ToJson()`. Here's an example:
    
```
    
    `// Serialize data to JSON
    var data = new { username = "example", password = "1234" };
    string jsonData = JsonUtility.ToJson(data);```
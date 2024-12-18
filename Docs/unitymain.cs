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

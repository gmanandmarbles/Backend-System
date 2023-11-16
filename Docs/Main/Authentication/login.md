# The login script.

```
using UnityEngine;
using UnityEngine.Networking;
using System.Collections;

public class userLogin : MonoBehaviour
{
    private string baseURL = "http://localhost:3000/api/login";
    public string username;
    public string password;

    [System.Serializable]
    private class LoginData
    {
        public string username;
        public string password;
    }

    [System.Serializable]
    private class LoginResponse
    {
        public string userId;
        // Add other fields if there are more data in the response
    }

    void Start()
    {
        StartCoroutine(LoginUser());
    }

    IEnumerator LoginUser()
    {
        LoginData loginData = new LoginData
        {
            username = username,
            password = password
        };

        string jsonData = JsonUtility.ToJson(loginData);

        using (UnityWebRequest www = new UnityWebRequest(baseURL, "POST"))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonData);
            www.uploadHandler = (UploadHandler)new UploadHandlerRaw(bodyRaw);
            www.downloadHandler = (DownloadHandler)new DownloadHandlerBuffer();
            www.SetRequestHeader("Content-Type", "application/json");

            yield return www.SendWebRequest();

            if (www.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("Login Successful");
                Debug.Log("Response: " + www.downloadHandler.text);

                // Parse the response JSON
                LoginResponse response = JsonUtility.FromJson<LoginResponse>(www.downloadHandler.text);

                // Save the userID to PlayerPrefs
                PlayerPrefs.SetString("userID", response.userId);
                PlayerPrefs.Save();

                Debug.Log("UserID: " + response.userId);
            }
            else
            {
                Debug.LogError("Login Failed");
                Debug.LogError("Error: " + www.error);
            }
        }
    }
}

```
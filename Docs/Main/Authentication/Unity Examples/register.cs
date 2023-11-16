using UnityEngine;
using UnityEngine.Networking;
using System.Collections;

public class register : MonoBehaviour
{
    private string baseURL = "http://localhost:3000/api/users";

    [System.Serializable]
    public class UserData
    {
        public string username;
        public string password;
    }

    [System.Serializable]
    private class RegistrationResponse
    {
        public string userId;
        // Add other fields if there are more data in the response
    }

    public string editorUsername = "yourUsername";
    public string editorPassword = "yourPassword";

    void Start()
    {
        StartCoroutine(RegisterUser());
    }

    IEnumerator RegisterUser()
    {
        UserData userData = new UserData
        {
            username = editorUsername,
            password = editorPassword
        };

        string jsonData = JsonUtility.ToJson(userData);

        using (UnityWebRequest www = UnityWebRequest.Post(baseURL, "POST"))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonData);
            www.uploadHandler = (UploadHandler)new UploadHandlerRaw(bodyRaw);
            www.downloadHandler = (DownloadHandler)new DownloadHandlerBuffer();
            www.SetRequestHeader("Content-Type", "application/json");

            yield return www.SendWebRequest();

            if (www.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("User Registration Successful");
                Debug.Log("Response: " + www.downloadHandler.text);

                // Parse the response JSON
                RegistrationResponse response = JsonUtility.FromJson<RegistrationResponse>(www.downloadHandler.text);

                // Save the userID to PlayerPrefs
                PlayerPrefs.SetString("userID", response.userId);
                PlayerPrefs.Save();

                Debug.Log("UserID: " + response.userId);
            }
            else
            {
                Debug.LogError("User Registration Failed");
                Debug.LogError("Error: " + www.error);
            }
        }
    }
}

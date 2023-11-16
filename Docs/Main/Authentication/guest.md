# Guest login.

Creates a guest account, with a random username. The default password is 1234.

```
using UnityEngine;
using UnityEngine.Networking;
using System.Collections;

public class guestLogin : MonoBehaviour
{
    private string baseURL = "http://localhost:3000/api/guest";

    [System.Serializable]
    private class GuestResponse
    {
        public string guestId;
        // Add other fields if there are more data in the response
    }

    void Start()
    {
        StartCoroutine(RegisterGuest());
    }

    IEnumerator RegisterGuest()
    {
        WWWForm form = new WWWForm();

        using (UnityWebRequest www = UnityWebRequest.Post(baseURL, form))
        {
            yield return www.SendWebRequest();

            if (www.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("Guest Registration Successful");
                Debug.Log("Response: " + www.downloadHandler.text);

                // Parse the response JSON
                GuestResponse response = JsonUtility.FromJson<GuestResponse>(www.downloadHandler.text);

                // Save the guestID to PlayerPrefs
                PlayerPrefs.SetString("guestID", response.guestId);
                PlayerPrefs.Save();

                Debug.Log("GuestID: " + response.guestId);
            }
            else
            {
                Debug.LogError("Guest Registration Failed");
                Debug.LogError("Error: " + www.error);
            }
        }
    }
}

```
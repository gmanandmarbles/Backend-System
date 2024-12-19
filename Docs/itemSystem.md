# Item System API Documentation

This API allows you to manage items in a system, including fetching a list of items, retrieving specific item details, and adding new items. It supports data storage in Firestore and a local JSON file.

### Base URL
```
http://localhost:3000/api
```

---

## 1. `GET /api/items` - Fetch All Items

### Description:
Fetches a list of all items stored in the Firestore database.

### Response:
- **Success (200)**: A list of items in JSON format.

```
[
  {
    "name": "Sword of Valor",
    "rarity": "Legendary",
    "imageUrl": "https://example.com/images/sword_of_valor.png",
    "description": "A legendary sword forged by ancient masters.",
    "stats": {
      "attack": 100,
      "defense": 50
    },
    "createdAt": "2024-12-18T10:00:00Z",
    "itemId": "generated-item-id"
  },
  ...
]
```

- **Error (500)**: If there is an issue retrieving items from Firestore.

---

## 2. `GET /api/items/:id` - Fetch Single Item by ID

### Description:
Fetches the details of a specific item using its unique `itemId`.

### Parameters:
- `id` (Path Parameter): The unique ID of the item you want to retrieve.

### Response:
- **Success (200)**: The details of the item in JSON format.

```
{
  "name": "Sword of Valor",
  "rarity": "Legendary",
  "imageUrl": "https://example.com/images/sword_of_valor.png",
  "description": "A legendary sword forged by ancient masters.",
  "stats": {
    "attack": 100,
    "defense": 50
  },
  "createdAt": "2024-12-18T10:00:00Z",
  "itemId": "generated-item-id"
}
```

- **Error (404)**: If the item with the specified `itemId` is not found.
- **Error (500)**: If there is an issue fetching item details from Firestore.

---

## 3. `POST /api/items` - Add New Item

### Description:
Adds a new item to the system. The item is stored in both Firestore and a local `items.json` file.

### Request Body (JSON):
```
{
  "name": "Sword of Valor",
  "rarity": "Legendary",
  "imageUrl": "https://example.com/images/sword_of_valor.png",
  "description": "A legendary sword forged by ancient masters.",
  "stats": {
    "attack": 100,
    "defense": 50
  }
}
```

### Response:
- **Success (201)**: The newly created item is returned in the response.

```
{
  "message": "Item successfully added to the system",
  "item": {
    "name": "Sword of Valor",
    "rarity": "Legendary",
    "imageUrl": "https://example.com/images/sword_of_valor.png",
    "description": "A legendary sword forged by ancient masters.",
    "stats": {
      "attack": 100,
      "defense": 50
    },
    "createdAt": "2024-12-18T10:00:00Z",
    "itemId": "generated-item-id"
  }
}
```

- **Error (400)**: If any required fields (`name`, `rarity`, `imageUrl`, `description`, `stats`) are missing.
- **Error (500)**: If there is an issue adding the item to Firestore or the local file system.

---

## Error Codes:
- **400 Bad Request**: Missing or invalid data in the request.
- **404 Not Found**: The item does not exist.
- **500 Internal Server Error**: A server-side issue occurred while handling the request.

---

## How to Test the Endpoints:

- Use tools like **Postman** or **cURL** to send requests to the endpoints.

### Example using cURL:

1. **Fetching all items**:
```
curl http://localhost:3000/api/items
```

2. **Fetching a specific item** (replace `generated-item-id` with an actual ID):
```
curl http://localhost:3000/api/items/generated-item-id
```

3. **Adding a new item**:
```
curl -X POST http://localhost:3000/api/items \
     -H "Content-Type: application/json" \
     -d '{
           "name": "Sword of Valor",
           "rarity": "Legendary",
           "imageUrl": "https://example.com/images/sword_of_valor.png",
           "description": "A legendary sword forged by ancient masters.",
           "stats": { "attack": 100, "defense": 50 }
         }'
```

---

## Conclusion:
This API provides a simple way to manage items in your system. Items can be added, listed, and viewed by ID, with data stored both in Firestore and a local JSON file.

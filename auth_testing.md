# Auth Testing Playbook (Emergent Google Auth)

## Step 1: Create Test User & Session
```bash
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Backend API
```bash
curl -X GET "$BACKEND_URL/api/auth/me" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Step 3: Browser (Playwright)
```python
await page.context.add_cookies([{
    "name": "session_token",
    "value": "YOUR_SESSION_TOKEN",
    "domain": "nakit-akisi-7.preview.emergentagent.com",
    "path": "/",
    "httpOnly": True,
    "secure": True,
    "sameSite": "None"
}])
await page.goto("https://nakit-akisi-7.preview.emergentagent.com/")
```

## Checklist
- users collection has `user_id` custom field
- Sessions `user_id` matches users `user_id`
- Queries use `{"_id": 0}` projection
- `/api/auth/me` returns user, not 401

import requests

BASE_URL = "http://localhost:3000"
SIGNUP_URL = f"{BASE_URL}/api/auth/signup"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
ADMIN_URL = f"{BASE_URL}/api/auth/makeadmin"

admin_user = {"username": "admin",
              "password": "admin",
              "firstName": "Admin",
              "lastName": "User",
              "email": "admin@gmail.com",
              "phone": "1234567890"}

res = requests.post(SIGNUP_URL, json=admin_user)
assert res.ok, 'New user created, but login + makeadmin failed. Please call those two endpoints to make the user into an administrator'

res = requests.post(LOGIN_URL, json={
                    "username": admin_user["username"], "password": admin_user["password"]})
assert res.ok, 'New user created, but login + makeadmin failed. Please call those two endpoints to make the user into an administrator'

accessToken = res.json()['accessToken']
auth = {'Authorization': f'Bearer {accessToken}'}
res = requests.put(ADMIN_URL, headers=auth, json={'password': 'admin'})
assert res.ok, 'New user created, but login + makeadmin failed. Please call those two endpoints to make the user into an administrator'

print(f'\nSuccesssfully created an ADMIN user:\n\tusername: {admin_user["username"]}\n\tpassword: {admin_user["password"]}\n')

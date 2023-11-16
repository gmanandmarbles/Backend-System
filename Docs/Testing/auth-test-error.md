# Authentication test.

This script is intended to be run on the same machine as the main server code is running on. 

You can change the URL on line 5 of the script, in the BaseURL variable.

The script tests in the following order.

1. Tests guest registration (non-username based, for one-off sessions).

2. Tests user registration (username based, for accounts).

3. Tests login with proper login.

4. Tests login for non-existent user.

5. Tests login with wrong password.

(6). The script also sends over the errors to the error endpoint, indirectly testing it. The error endpoint must be setup for this to work. Otherwise just comment out the stuff inside the handleTestError function.


const payload = {
    email: 'admin@remesas.com',
    password: 'Admin123$'
};

fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
})
.then(res => res.json())
.then(data => {
    if (data.data?.tokens?.accessToken) {
        console.log('Login successful! Fetching /users/me/profile...');
        return fetch('http://localhost:4000/api/v1/users/me/profile', {
            headers: {
                'Authorization': `Bearer ${data.data.tokens.accessToken}`
            }
        });
    }
    throw new Error('No token found: ' + JSON.stringify(data));
})
.then(res => res.json())
.then(meData => {
    console.log('/users/me/profile response:', JSON.stringify(meData, null, 2));
})
.catch(console.error);

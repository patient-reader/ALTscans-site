// Function to get a cookie by name
function getCookie(name) {
    const cookie = document.cookie.split(';').find(row => row.trim().startsWith(`${name}=`));
    return cookie ? cookie.split('=')[1] : null;
}

// Function to redirect to profile page if user is logged in
function redirectToProfileIfLoggedIn() {
    const token = getCookie('token');
    const userId = getCookie('userId');
    if (token && userId) {
        window.location.href = '/routes/profile.html';
    }
}

// Function to get URL parameter by name
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Function to handle login form submission
async function handleLoginFormSubmit(e) {
    e.preventDefault();

    const loginForm = document.querySelector('.loginForm');
    const usernameField = document.querySelector('.login-usernameField');
    const username = loginForm['login-usernameField'].value;
    const email = loginForm['login-emailField'].value;
    const pwd = loginForm['login-passwordField'].value;

    const loginData = usernameField.style.display === 'block' 
        ? { username: escapeHtml(username), password: escapeHtml(pwd) } 
        : { email: escapeHtml(email), password: escapeHtml(pwd) };
    const loginUrl = `${base_url}/api/auth/login`;

    try {
        const response = await axios.post(loginUrl, loginData, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${frontoken}`
            },
        });

        setCookie('token', response.data.token);
        setCookie('userId', response.data.userInfo.id);
        console.log(`Cookie Created for user ${response.data.userInfo.name}: ${response.data.userInfo.id}`);

        setTimeout(() => {
            window.location.href = '/routes/profile.html';
        }, 5000);
    } catch (error) {
        console.error('Error logging in:', error);
        showAlert(error, 'login');
    }
}

// Function to handle signup form submission
async function handleSignupFormSubmit(e) {
    e.preventDefault();

    const signupForm = document.querySelector('.signupForm');
    const username = signupForm['signup-usernameField'].value;
    const email = signupForm['signup-emailField'].value;
    const pwd = signupForm['signup-pwdField'].value;
    const confirmPwd = signupForm['signup-confirmPwdField'].value;

    if (pwd !== confirmPwd) {
        showAlert('Passwords do not match', 'signup', 'Passwords do not match');
        return;
    }

    try {
        const response = await axios.post(`${base_url}/api/user/createUser`, {
            username: escapeHtml(username),
            email: escapeHtml(email),
            password: escapeHtml(pwd),
            type: 'emailAndPasswordAuth'
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
        });

        console.log(response);
        showAlert(response, 'signup');
    } catch (error) {
        console.error('Error signing up:', error);
        showAlert(error.message, 'signup', error.message);
    }
}

// Function to handle social authentication
async function handleSocialAuth(provider) {
    try {
        switch (provider) {
            case 'google':
                window.location.href = `${base_url}/api/auth/google`;
                break;

            case 'anonymous':
                const user = await axios.post(`${base_url}/api/user/anonymous`);
                const anonUserInfoContent = `
                    <p>Anonymous User: ${user.data.username}</p>
                    <p>Password: ${user.data.password}</p>
                `;
                document.getElementById('anonUserInfoContent').innerHTML = anonUserInfoContent;
                showDialog('anonUserInfo');
                console.log(user);
                break;

            case 'discord':
                window.location.href = `${discordUrl}`;
                break;

            default:
                throw new Error('Invalid provider');
        }
    } catch (error) {
        console.error(error);
    }
}

// Function to exchange authorization code for access token
async function registerForDiscord(code) {
  try {
    console.log(code)
    const response = await axios.post(`${base_url}/api/auth/discord`, {
        code: code,
        type: 'discord'
    })
    
    console.log(`Discord response.data: ${JSON.stringify(response.data)}`);
    
    setCookie('token', response.data.token);
    setCookie('userId', response.data.id);
    
    setCookie('userEmail', response.data.email);
    
    redirectToProfileIfLoggedIn();
    
  }catch(error){
    console.error('Error exchanging code for token:', error);
  }
}

// Function to show alert messages
function showAlert(response, form, err) {
    const alert = form === 'signup' ? document.querySelector('.alert-container') : document.querySelector('.alert-container-login');
    const message = form === 'signup' ? 'Your account has been created. You can now log in.' : 'An error occurred while logging in.';

    alert.innerHTML = response.status === 200 ? message : err || message;
    alert.style.display = 'block';
    alert.style.color = response.status === 200 ? 'green' : 'red';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    redirectToProfileIfLoggedIn();

    const code = getUrlParameter('code');
    if (code) {
        registerForDiscord(code);
    }

    const loginForm = document.querySelector('.loginForm');
    loginForm.addEventListener('submit', handleLoginFormSubmit);

    const signupForm = document.querySelector('.signupForm');
    signupForm.addEventListener('submit', handleSignupFormSubmit);

    document.getElementById('verifyForm').addEventListener('submit', (e) => {
        e.preventDefault();
        closeDialog();
    });

    document.getElementById('dialogOverlay').addEventListener('click', closeDialog);

    const nonAnonymousLoginButton = document.getElementById('nonAnonymousLogin');
    const anonymousLoginButton = document.getElementById('anonymousLogin');
    const usernameField = document.getElementById('login-usernameField');
    const emailField = document.getElementById('login-emailField');

    usernameField.style.display = 'none';

    nonAnonymousLoginButton.addEventListener('click', () => {
        usernameField.style.display = 'none';
        emailField.style.display = 'block';
        emailField.setAttribute('required', 'required');
        usernameField.removeAttribute('required');
    });

    anonymousLoginButton.addEventListener('click', () => {
        emailField.style.display = 'none';
        usernameField.style.display = 'block';
        usernameField.setAttribute('required', 'required');
        emailField.removeAttribute('required');
    });
});
